# Africa Plug — Hero Image Admin Setup

The `/admin` page lets the site owner sign in and replace the three homepage carousel images without editing code.

## One-time configuration

### 1. Create the image bucket

In Supabase, open **Storage** and create a bucket named `africa-plug-media`. Set it to **Public** so the homepage can display the saved hero images. Do not add a public upload policy. Uploads are made by the server using the service-role key.

### 2. Add server-only environment variables

Add these to Vercel Project Settings → Environment Variables for Production (and Preview if needed):

- `ADMIN_PASSWORD`: a strong, unique password for the single admin.
- `ADMIN_SESSION_SECRET`: a long random secret (at least 32 random characters) used to sign the admin session.
- `SUPABASE_URL`: the Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: the project's service-role key. **Never use a `NEXT_PUBLIC_` prefix or expose this key in client code.**
- `SUPABASE_STORAGE_BUCKET`: `africa-plug-media` (optional because this is the default).

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
