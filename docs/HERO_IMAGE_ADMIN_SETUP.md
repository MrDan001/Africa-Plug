# Homepage hero image manager setup

The homepage hero manager is available at `/admin/homepage`. It replaces three desktop and three mobile hero images without editing source code.

## Supabase Storage configuration

The Homepage Manager now uploads hero images to the public Supabase Storage bucket `africa-plug-media`.

Required server-side environment variables:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_JWT` or `SUPABASE_SERVICE_ROLE_KEY`

The server validates the service-role credential against the configured Supabase project, creates a short-lived signed upload URL, and finalizes the CMS media record after the upload is confirmed. The service-role credential is never sent to the browser.

## Upload rules

- Accepted formats: JPG, PNG, WebP and AVIF.
- Maximum size: 10 MB per hero image.
- Six separate crops: three slides, each with desktop and mobile variants.
- New uploads are stored under `cms-media/` within `africa-plug-media` and are recorded in the Media Library.
- The homepage settings record stores the public Supabase URL for each uploaded crop.

## Legacy compatibility

Previously uploaded hero images remain in their existing Vercel Blob stores and continue to be read by the homepage. They will not be copied, moved or deleted. All new hero uploads go directly to Supabase Storage. Keep the legacy Blob token, stores, package and read implementation so those existing images remain discoverable.

## Troubleshooting

If uploads fail, confirm that the Supabase URL, anon key and matching service-role credential are configured for the deployment. Confirm that `africa-plug-media` is public and allows JPG, PNG, WebP and AVIF files up to 20 MB. Admin upload endpoints require an authenticated admin session.
