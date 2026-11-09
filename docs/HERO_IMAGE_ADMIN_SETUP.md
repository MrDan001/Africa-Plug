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

The hero manager does not require Supabase Storage. Supabase remains the database behind T.A.P IN and the CMS.

Redeploy after configuring the variables. Use the service-role key only on the server. Keep it out of Git, browser code, screenshots, and messages.

### 4. Open the admin

Visit `https://africa-plug.vercel.app/admin`, enter the admin password, and choose an image for Hero 1, Hero 2, or Hero 3. Supported formats: JPG, PNG, WebP and AVIF; maximum 10 MB per image.

The files are uploaded to the connected public Vercel Blob store. Replacing a slide image changes only that slide's image; the headline and button destinations remain as they are.

### 3. Local development setup

The production deployment can upload successfully while `localhost` fails if your local process does not have the Blob token. From the linked project root, pull the Development environment variables into the ignored local file:

```bash
vercel link --project africa-plug
vercel env pull .env.local --environment=development
```

Restart `npm run dev` after pulling the variables. Confirm that `BLOB_READ_WRITE_TOKEN` is present in `.env.local` without printing or sharing its value. Do not commit `.env.local`.

If the API is reachable but the token is missing, the upload endpoint returns a configuration error. If the browser cannot reach the API or receives a non-JSON server response, the admin page now displays the HTTP status and diagnostic response instead of hiding it behind a generic storage message.

## Security notes

- Uploads require the HttpOnly admin session cookie.
- The storage service-role key stays on the server.
- SVG uploads are rejected.
- The bucket is public-read so visitors can see hero images, but no anonymous upload permission should be enabled.
- The admin page changes imagery only; editing slide text and destinations is intentionally out of scope for this page.
