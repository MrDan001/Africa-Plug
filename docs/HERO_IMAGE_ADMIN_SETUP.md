# Homepage hero image manager setup

The homepage hero manager is available at `/admin/homepage`. It replaces three desktop and three mobile hero images without editing source code.

## Vercel Blob configuration

The production project uses the public Vercel Blob store `africa-plug-hero-media`.

Required environment variable:

- `BLOB_READ_WRITE_TOKEN` — a Vercel Blob read/write token, stored as a **Sensitive** server-only environment variable for Production, Preview and Development.

Do not expose this token in a `NEXT_PUBLIC_*` variable or client bundle. The admin page uses Vercel Blob's signed client-upload flow: the browser requests a short-lived upload token from `POST /api/admin/hero-images`, the server checks the signed-in admin session and constrains the path, MIME types and 10 MB size limit, then the browser sends the image bytes directly to Blob.

This direct-upload flow is intentional. Vercel-hosted server-side uploads are limited by the Functions request-body ceiling (4.5 MB); sending the image through a normal multipart POST to a Route Handler can fail before application code runs. The direct client-upload flow avoids that limit while keeping the read/write token on the server.

## Upload rules

- Accepted formats: JPG, PNG, WebP and AVIF.
- Maximum size: 10 MB per image.
- Six separate crops: three slides, each with desktop and mobile variants.
- Each upload receives a random suffix so a new image does not collide with a cached previous version.
- The homepage reads the latest image for each slide/variant from the connected Blob store.
- Only an authenticated admin can request an upload token. Blob validates the signed completion callback.

## Environment variable warning

In Vercel → Project → Settings → Environment Variables, confirm `BLOB_READ_WRITE_TOKEN` is marked **Sensitive** and is scoped to Production, Preview and Development. If its value is changed or the variable is newly connected, create a fresh deployment so running functions receive the updated value.

The active Blob store must remain **Public** because homepage carousel photos are public assets. Do not change it to Private.

## Troubleshooting

If the admin reports that the token is missing, reconnect the public Blob store to the `africa-plug` project and redeploy. If the admin reports an expired session, sign in again. If the upload handshake returns an HTTP error, the admin notice now shows the actual response rather than masking it with a generic storage message.

For local development, link the correct Vercel project and pull Development variables into the ignored local file:

```bash
vercel link --yes --project africa-plug
vercel env pull .env.local --environment=development --yes
```

Restart the development server after pulling variables. Never commit `.env.local`.
