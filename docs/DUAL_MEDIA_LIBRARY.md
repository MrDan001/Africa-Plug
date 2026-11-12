# Africa Plug media storage

Africa Plug uses Supabase Storage as the primary storage provider for admin-managed media.

## Supabase buckets

- `africa-plug-media` — public website images and reusable CMS media, including homepage hero crops, store covers, blog imagery and public PDFs.
- `store-downloads` — private paid downloads. Keep this bucket private and continue serving files through the protected download flow.

The Admin Media Library and Homepage Manager upload through short-lived Supabase signed upload URLs. The Supabase service-role credential stays server-side; the browser receives only the public project URL, anon key and a path-scoped signed upload token.

## Existing assets and compatibility

- Existing Vercel Blob URLs remain valid and are not deleted as part of the migration.
- The homepage retains legacy Blob read support until previously uploaded hero assets have been copied into Supabase and verified.
- T.A.P IN public opportunity submissions still use their existing image-upload path until that separate public-form migration is completed.
- GitHub repository images under `public/Image/` remain supported and can be registered in the Media Library by their site path.

## Folder map

- `public/Image/Store/` — homepage Store banner and product artwork.
- `public/Image/Hero/Home/` — committed homepage hero assets.
- `public/Image/Hero/Work-with-FK/` — Work With FK hero imagery.
- `public/Image/Hero/Tap-in/` — T.A.P IN hero imagery.
- `public/Image/Tap-in/` — opportunity/listing images.
- `public/Image/Work-with-FK/` — Work With FK supporting imagery.
- `public/Image/Blog/` — blog cover and editorial images.
- `public/Image/General/` — shared brand and other site imagery.

## Important

- Never place confidential or paid-download files in the public media bucket.
- Never delete legacy Blob objects until they have been copied and verified.
- Keep the `store-downloads` bucket private.
