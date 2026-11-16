# The Africa Plug

The Africa Plug is a Next.js web platform for connecting people, businesses and opportunities across African markets. The site combines editorial content, T.A.P IN opportunities, commercial enquiries, a Store, and an admin workspace backed by Supabase. T.A.P IN opportunity listings display country only; regional labels are not used.

## Platform

- Next.js, React and TypeScript
- Supabase for managed content and T.A.P IN data
- Vercel for production hosting
- Admin workspace for managing site content and operational records
- Responsive desktop and mobile presentation
- T.A.P IN opportunity listings and enquiry flows
- Store catalogue and product detail pages
- Journal/editorial content
- Contact, partnership and commercial application forms
- Privacy, cookies, terms and refunds pages

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Production

Production is deployed through Vercel from the `main` branch. Environment variables are managed in the deployment environment and should never be committed to the repository.

## Content management

Public content is designed to be managed through the admin workspace and connected data sources rather than by editing page components. T.A.P IN listings should only be published when they have been reviewed and approved for public disclosure.

## Store

Store products are sourced through the public CMS layer. Product availability, pricing, provider links and digital delivery readiness determine which actions are shown to visitors. No product, price, testimonial or business claim should be invented simply to fill a page.

## Media

The homepage introduction video is configured through site settings. When no approved video is configured, the site displays a branded introduction panel rather than an external sample video.

## Repository structure

- `src/app` — routes and API handlers
- `src/components` — reusable UI and feature components
- `src/lib` — CMS, data, validation and business logic
- `docs` — internal implementation and operational documentation


## Search metadata

The homepage title and description are managed in Admin → Site Settings. Core public pages define their own SEO titles, descriptions and canonical paths. Store product detail pages derive their title and description from product SEO fields, normalize the brand suffix to appear once, publish a canonical product URL, and use descriptive product-image alt text. Keep product SEO fields accurate when editing products in the CMS.

## Delivery standard

Before any client-facing launch, verify the live deployment on desktop and mobile, confirm production environment variables and connected services, review public content for accuracy, test forms and enquiry flows, and confirm that all published products and opportunities are approved for public use.


## T.A.P IN opportunity locations

T.A.P IN opportunity records retain their optional African Region and required Country fields. The region remains available as listing context; clean opportunity links use the listing slug without appending a region. All country dropdowns across public forms, T.A.P IN filters and admin opportunity management use the shared `AFRICAN_COUNTRIES` list. The same list is enforced by the relevant server-side validation.
