# Africa Plug — Hero Image Admin Setup

The `/admin` page lets the site owner sign in and replace the three homepage carousel images without editing code.

## One-time configuration

### 1. Confirm the Vercel Blob store

The deployed hero image manager uses the connected **public Vercel Blob store** named `africa-plug-hero-media`. The project must have a valid `BLOB_READ_WRITE_TOKEN` scoped to that public store. Do not use a private Blob token for public hero assets.

### 2. Add server-only environment variables

Add these to Vercel Project Settings → Environment Variables for Production (and Preview if needed):

- `ADMIN_PASSWORD`: a strong, unique password for the single admin.
- `ADMIN_SESSION_SECRET`: a long random secret (at least 32 random characters) used to sign the admin session.
- `BLOB_READ_WRITE_TOKEN`: provided by the connected public Blob store. Do not expose it in client code.

The hero manager does not require Supabase Storage. Supabase remains the database behind TAP IN and the CMS.

Redeploy after configuring the variables. Use the service-role key only on the server. Keep it out of Git, browser code, screenshots, and messages.

### 3. Open the admin

Visit `https://africa-plug.vercel.app/admin`, enter the admin password, and choose an image for Hero 1, Hero 2, or Hero 3. Supported formats: JPG, PNG, WebP and AVIF; maximum 10 MB per image.

The files are stored at fixed private-write/public-read paths inside the bucket. Replacing a slide image changes only that slide's image; the headline and button destinations remain as they are.

## Security notes

- Uploads require the HttpOnly admin session cookie.
- The storage service-role key stays on the server.
- SVG uploads are rejected.
- The bucket is public-read so visitors can see hero images, but no anonymous upload permission should be enabled.
- The admin page changes imagery only; editing slide text and destinations is intentionally out of scope for this page.
