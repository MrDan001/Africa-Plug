# Africa Plug dual media library

Africa Plug supports two independent public-image sources:

1. **GitHub repository images** — commit assets beneath `public/Image/`; use their site paths such as `/Image/Store/cover.jpg`. These are served by the deployed Next.js site and do not call Vercel Blob.
2. **Vercel Blob** — keep the existing `BLOB_READ_WRITE_TOKEN`, upload routes and Blob URLs. Blob uploads remain available when the store's Vercel usage allowance is active.

## Folder map

- `public/Image/Store/` — homepage Store banner and product artwork.
- `public/Image/Hero/Home/` — homepage hero assets.
- `public/Image/Hero/Work-with-FK/` — Work With FK hero imagery.
- `public/Image/Hero/Tap-in/` — T.A.P IN hero imagery.
- `public/Image/Tap-in/` — opportunity/listing images.
- `public/Image/Work-with-FK/` — Work With FK supporting imagery.
- `public/Image/Blog/` — blog cover and editorial images.
- `public/Image/General/` — shared brand and other site imagery.

## Admin use

For CMS image fields, either upload a file to Blob (when available) or paste a repository path beginning with `/Image/`. The Media Library can register an existing repository image path as a reusable asset. Registering a GitHub path writes only a CMS media record; it does not upload a file or call Blob.

## Important

- Never delete existing Blob files as part of this dual-source setup.
- Keep existing Blob URLs intact; both `https://...` Blob URLs and local `/Image/...` paths are valid image sources.
- Add new GitHub image files by committing them to the matching folder. Vercel deploys them with the application.
- The private Store download-file flow remains separate; do not place paid/private files in `public/Image/`.
