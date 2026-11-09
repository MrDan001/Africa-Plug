import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { revalidateTag } from "next/cache";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const IMAGE_PATH = /^homepage\/hero-slide-([123])-(desktop|mobile)\.(jpg|png|webp|avif)$/i;

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Vercel Blob is not connected to this deployment. Check the BLOB_READ_WRITE_TOKEN environment variable and redeploy." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: HandleUploadBody;
  try {
    body = await request.json() as HandleUploadBody;
  } catch {
    return Response.json({ error: "The upload request was not valid JSON. Please refresh the admin page and try again." }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        if (!await isAdminAuthenticated()) {
          throw new Error("Your admin session has expired. Sign in again before uploading.");
        }

        const match = IMAGE_PATH.exec(pathname);
        if (!match) throw new Error("The requested image destination is not allowed.");

        let payload: { slot?: number; variant?: string };
        try {
          payload = JSON.parse(clientPayload ?? "{}") as { slot?: number; variant?: string };
        } catch {
          throw new Error("The upload metadata was invalid. Refresh the page and try again.");
        }

        const slot = Number(match[1]);
        const variant = match[2].toLowerCase();
        if (payload.slot !== slot || payload.variant !== variant) {
          throw new Error("The selected hero slot did not match the upload destination.");
        }

        return {
          allowedContentTypes: ACCEPTED_IMAGE_TYPES,
          maximumSizeInBytes: MAX_IMAGE_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ slot, variant }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Blob verifies the callback signature before this handler runs.
        // The homepage reads the newest matching image directly from this Blob store.
        revalidateTag("africa-plug-homepage-hero-blob-list", "max");
        console.info("Homepage hero image upload completed:", blob.pathname, tokenPayload ? "metadata attached" : "");
      },
    });

    return Response.json(result, {
      headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Blob upload error";
    console.error("Homepage hero client-upload handshake failed:", message);
    const unauthorized = /admin session|sign in|unauthorized|authentication/i.test(message);
    return Response.json(
      { error: message },
      { status: unauthorized ? 401 : 502, headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" } },
    );
  }
}
