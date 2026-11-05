# TAP IN Opportunity Manager Setup

This setup note belongs to `MrDan001/Africa-Plug`. The implementation lives at `/admin/tap-in` and uses Supabase for persistent opportunity records.

## One-time database setup

1. Open the Supabase project connected to Africa Plug.
2. Open **SQL Editor**.
3. Paste and run `docs/supabase/migrations/202610160001_tap_in_opportunities.sql`.
4. Confirm that the `public.tap_in_opportunities` table exists.

The migration creates persistent records, constrained status values, 2–4 enquiry questions per listing, indexes, and an update timestamp trigger. Row-level security is enabled. The website accesses records server-side with the service-role key; do not expose that key in browser code or public environment variables.

## Vercel environment

The server environment must contain:
- `SUPABASE_URL` — `https://<project-ref>.supabase.co`
- `SUPABASE_ANON_KEY` — the project legacy anon JWT used to invoke the JWT-protected Edge Function
- `CMS_BRIDGE_SECRET` — a random server-to-server secret of at least 32 characters; its SHA-256 digest must match `cms_private_config.bridge_secret_sha256` in the connected Supabase project
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `BLOB_READ_WRITE_TOKEN` — supplied by the connected public Vercel Blob store for the hero image manager
- `SUPABASE_SERVICE_ROLE_JWT` — preferred legacy `service_role` JWT for Vercel Store file/order operations; it must contain the `service_role` claim and match the project ref in `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — server-side fallback credential for Store file/order operations; never use an anon or publishable key here

The CMS bridge uses `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `CMS_BRIDGE_SECRET` in Vercel. The protected Store download/order routes use a matching server-side service-role credential in Vercel; they validate a legacy JWT's `role` and project `ref` before use. The deployed Supabase Edge Function uses its server-side `SUPABASE_SERVICE_ROLE_KEY` in Supabase Function Secrets. The hero-image manager uses Vercel Blob, not Supabase Storage. Keep all secret values out of GitHub and public/client environment variables.

## Usage

1. Sign in to the site admin using the configured admin password.
2. Open `/admin/tap-in`.
3. Add a listing with a title, country/region, sector, opportunity type, description, “Who this is for”, and 2–4 custom enquiry questions.
4. Save as **Draft** while reviewing. Use **Publish** only after details are genuine and approved for public sharing.
5. Edit listings as needed. **Close** stops accepting interest and keeps the unique URL accessible. **Archive** removes the listing from the live index but retains the record and URL.
6. Use the admin search and status filter to find records.

Drafts are not publicly listed or accessible from a public detail URL. Only Live listings appear on the TAP IN index. Closed and archived detail URLs remain available without a public status label, and the page directs visitors to current opportunities instead. Posting dates and principal-identifying fields are not exposed.

## Current boundary

This slice implements listing persistence and management, statuses, and public listing/detail routes. The full listing-specific Expression of Interest form and durable enquiry capture are addressed separately in working-brief Section 5. Until that workflow is connected, live listing pages have a basic contact fallback rather than a listing-bound EOI form. Do not publish listings until the business is comfortable with this temporary limitation.

If the database migration has not been applied, the public TAP IN page shows no listings instead of demo content, and the admin interface reports a configuration/setup error. Applying a GitHub commit alone does not create the Supabase table.
