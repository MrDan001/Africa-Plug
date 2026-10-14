# The Africa Plug Website: Full Roadmap

Commercial headquarters of FK's Africa Commercial Deal Consultancy.
Goal: convert visitors into enquiries, applications and sales.

Last updated: 14 Oct 2026

---

## 1. Current implementation status

**Last reviewed:** 14 October 2026  
**Repository checked:** [`MrDan001/Africa-Plug`](https://github.com/MrDan001/Africa-Plug), branch `main`  
**Storefront update:** the Store now uses a warm, photo-led bookstore hero and two levels of wooden shelves, with ten designed covers shared with individual book details and a browser-persisted cart. The Store header has a condensed desktop menu and cart control. The cart can prepare an email order enquiry but is not payment checkout; secure payment and digital delivery remain launch dependencies.

This section records what is present in the repository today. The stage descriptions below remain the target scope; a route or component existing does not mean the connected business workflow is complete or production-tested.

| Area | Current state | What the code review confirms |
|---|---|---|
| Project planning | **Documented** | `docs/PROJECT_SCOPE.md`, `roadmap.md`, and `docs/CMS_AND_LAUNCH_REQUIREMENTS.md` exist. They describe the target; they do not make the listed features implemented. |
| Framework and styling | **Present** | Next.js 16, React 19, TypeScript and Tailwind CSS 4 are in `package.json`. Site layout, shared styling, header, mobile menu and footer are present. |
| Homepage and visual shell | **Presentational prototype** | The three-slide carousel and major homepage sections are present. The intro-video slot embeds a temporary external YouTube sample. Homepage content and proof points are hard-coded; there is no verified live-opportunity feed, CMS-driven content, official FK video/captions, or separate homepage featured-product block. The sample video’s visual behaviour still needs browser/device review. |
| Logo | **Needs brand verification** | `public/images/logo.svg` and `logo-mark.svg` exist. Header/footer code uses the mark plus an HTML/CSS wordmark; verify against the approved full supplied lockup before calling this exact-logo work complete. |
| Public routes | **Mixed prototype / demo / placeholders** | Homepage, About, Contact, Work With FK and legal routes render front-end content. Store has ten hard-coded demo books, individual details, a photo-led bookshelf layout and a browser-local cart with quantity changes/removal. Demo titles/prices are not connected to a database, and the cart's email order enquiry does not take payment. Blog cards are preview records; article detail pages explicitly say the story is being prepared. TAP IN detail route is a placeholder and TAP IN landing content is a static focus-area list, not a live feed. |
| Initial enquiry forms | **Implemented in code; delivery unverified** | Contact, Partner With TAP and Work With FK pages render the reusable enquiry form. Shared Zod validation, a honeypot, Resend email sending and optional Cloudflare Turnstile support are implemented. API route files also exist for Ask and TAP IN interest. The handler currently routes submissions to `EMAIL_CONNECT` (default `connect@theafricaplug.com`), not separate `ask@` and private `fk@` routing. |
| Newsletter | **Not implemented** | `/api/forms/subscribe` returns HTTP 501, “Not implemented”. |
| Payments and commercial funnel | **Not implemented** | Stripe is installed and a helper exists, but checkout, Stripe webhook, Work With FK approval and scheduling routes return HTTP 501. The current application form is only an initial enquiry; it takes no payment. |
| Database / CMS | **Not implemented as a connected content system** | Supabase packages and client/server helpers exist. The current pages are not backed by a finished content schema or a working content-management workflow; no migration/schema files are present in the current repository tree. |
| Admin dashboard | **Not implemented** | `/admin` currently renders `Placeholder`, and its layout only renders children. The current branch does not show the promised secure CMS/admin workflow. |
| SEO and legal | **Partly implemented; launch work remains** | Root metadata, robots rules and a sitemap of core static pages exist. Sitemap coverage omits dynamic book pages and other relevant detail/flow routes; `JsonLd.tsx` returns `null` and is not a structured-data implementation. Policy pages contain substantive drafts but need confirmed business/controller details and legal review. No cookie-consent banner was found in the active implementation. |
| Configuration | **Example file present; live values unknown** | `.env.example` documents Resend sender/delivery and optional Turnstile variables. Repository inspection cannot confirm whether Vercel environment variables or Resend domain verification are correctly configured. Never put real secrets in Git. |
| Build and production verification | **Not verified in this review** | No build, lint, end-to-end form delivery, or live production test was run as part of this GitHub-only inspection. Do not treat the latest commit as proof that the deployed site is healthy or that emails reach the inbox. |

### Stage-by-stage status

| Stage | Status today | Main remaining gap |
|---|---|---|
| 1. Foundation and design shell | **Built, review pending** | Confirm exact logo, final visual/reference decisions, keyboard/mobile behavior and brand guidelines. |
| 2. Homepage sections | **Presentational build exists** | Replace the temporary Africa-themed video sample with the approved FK video and captions; finalize copy, hero assets, real proof points and verified social links. Keep large video files in media storage rather than the Git/deployment bundle. |
| 3. TAP IN, Blog and Store | **Front-end demo in progress** | Homepage Playbook feature now links directly to the shelf and no longer shows a duplicate “COMING SOON” book block. Ten demo covers are displayed on visual shelf boards, each with a dedicated detail route. Replace demo content with approved real products, connect persistent product records, implement secure checkout and digital delivery, and complete TAP IN workflows. |
| 4. Forms and Work With FK funnel | **Initial enquiries partly implemented** | Verify live email delivery, implement distinct routing, newsletter, full application review/approval, verified payments and scheduling. |
| 5. Admin dashboard | **Not started in this branch** | Build secure login and CMS workflows against persistent content/data. |
| 6. SEO, QA and launch | **Partial scaffold** | Review the existing core-page sitemap and add dynamic product URLs as appropriate; finalize policy drafts and cookie/analytics setup, run build and device checks, and verify the exact production deployment and domain. |

## 1A. Working delivery checklist

**Current position (14 October 2026):** The project is a functioning front-end prototype with a homepage, a Store demo and some enquiry-form code. We are between the end of the initial visual build and the early content/store integration stage. The site is **not launch-ready yet**: secure checkout, a connected CMS/admin, final product content, legal pages and end-to-end production QA remain open.

**Legend:** [x] present in repository / implemented in code · [~] partial, demo-only or not yet verified in production · [ ] not done

### Stage 1 — Foundation and design shell
- [x] Next.js application, shared site layout, navigation and footer exist.
- [x] Black, white and TAP-pink visual system is in place.
- [~] Compare the logo lockup on desktop/mobile against the approved original brand file.
- [x] The shared header is fixed in the final CSS rules.
- [x] Desktop links now stay visible above 800px; hamburger navigation is reserved for narrower screens.
- [ ] Add a visible, keyboard-accessible carousel pause/resume control and previous/next navigation.
- [ ] Complete keyboard, accessibility, responsive-layout and cross-browser review.
- [ ] Run and record a clean production build and lint check.

### Stage 2 — Homepage sections
- [x] Three-slide homepage carousel is in place.
- [x] Intro-video slot below the carousel now embeds a temporary Africa-themed YouTube sample. The video-code commit received a successful Vercel status; the later documentation-only audit commit was still deploying when checked.
- [ ] Open the deployed site on a phone and desktop to confirm the video is visible, plays, and does not overflow; deployment status alone does not confirm the visual result.
- [ ] Replace the sample with the approved 40–60 second FK introduction, plus poster and captions.
- [~] Homepage sections are mostly presentational and use hard-coded copy, imagery and sample proof points.
- [ ] Fix homepage CTAs that point to themselves or to the generic contact anchor, plus the broken footer/search anchors.
- [ ] Replace generic social links with official profiles.
- [ ] Finalize approved copy, real testimonials/case studies, image assets and verified social links.

### Stage 3 — TAP IN, Blog and Store
- [x] Homepage Africa Playbook links to the Store; duplicate “COMING SOON” feature has been removed.
- [x] Ten demo book covers and compact shelf-board presentation are in place.
- [x] Each demo book has a separate detail route with a longer description, included topics and displayed demo price.
- [~] The storefront now has a browser-local cart. The order action still opens an email enquiry and does not take payment.
- [ ] Confirm actual books, covers, descriptions, prices, product files and selling terms.
- [ ] Connect Store products to persistent data/CMS records.
- [ ] Implement secure checkout, payment confirmation, receipts and protected digital delivery.
- [ ] Implement the TAP IN slug/detail page, which currently renders `Placeholder`.
- [ ] Replace sample TAP IN listings with approved opportunities and finish listing-specific enquiries.
- [ ] Connect Blog articles, tags, publishing and article-detail content to persistent data.

### Stage 4 — Forms and Work With FK funnel
- [~] Initial enquiry forms and shared validation are present in code; successful inbox delivery has not been confirmed in this review.
- [ ] Test contact and partnership forms end-to-end, including spam protection and failure messages.
- [ ] Route general, Ask TAP, partner and private Work With FK enquiries to their intended destinations.
- [ ] Implement newsletter signup and confirm that subscribers are stored and handled appropriately.
- [ ] Build the application review and approve/decline workflow.
- [ ] Connect verified deposit/balance payments, scheduling unlocks and transactional emails.
- [ ] Test that only a verified payment—not a clicked button—unlocks the next step.

### Stage 5 — Admin dashboard and CMS
- [ ] Build the secure admin login and protected routes; current /admin is a placeholder in the inspected branch.
- [ ] Set up and document persistent database tables/migrations for products, articles, opportunities, enquiries, applications and settings.
- [ ] Build product, media, blog and opportunity management in the admin.
- [ ] Test admin permissions, uploads, edits, archiving and auditability before relying on the CMS.

### Stage 6 — SEO, compliance, QA and launch
- [~] `robots.ts` exists and `sitemap.ts` lists core static routes; individual book-detail URLs are not listed. Privacy, Terms, Cookies and Refunds pages contain substantive drafts but still need business-detail confirmation and legal review.
- [ ] Finish and review original Privacy, Terms, Cookies and Refunds/Deposit terms before payments go live.
- [ ] Implement and test the appropriate cookie-consent flow.
- [ ] Complete metadata, sitemap, structured data, social-sharing images and analytics events.
- [ ] Verify environment variables, sender-domain configuration, email delivery, database and media storage.
- [ ] Test all major pages, links, forms, video, checkout and digital delivery on mobile and desktop.
- [ ] Add an automated test suite for form validation, content routes and critical payment/webhook flows.
- [ ] Check the new bookshelf layout and cart on phone, desktop and 801–1000px widths after deployment.
- [ ] Review performance, image/video loading, keyboard access and error states.
- [ ] Confirm the production domain and verify the final live release after the checks above pass.

### Recommended next actions (in order)
1. **Verify the homepage video and core mobile layout**. The video-code commit received a successful deployment status, but the later documentation-only commit was still deploying at the last check and a real browser/device review is still needed.
2. **Finish a focused QA pass of the existing homepage and Store demo** before layering on more visual changes.
3. **Agree the real product catalogue and selling details**, then connect Store to persistent product data and implement checkout/delivery.
4. **Build the CMS/admin and required business workflows** so products, articles and opportunities can be maintained without editing code.
5. **Complete legal, SEO, email, accessibility and launch checks** before treating the site as production-ready.

**Audit scope and verification limits (14 October 2026):** I enumerated the repository tree (134 tracked entries) and reviewed the active app routes, shared navigation/components, main homepage and Store code, API handlers, data/helper modules, environment example, and project/CMS/roadmap documentation. This was a source review, not a browser-driven QA session. The earlier video-code commit received a successful Vercel deployment status. The documentation-only audit commit was still pending in Vercel at the time of this note. I did not run `npm run build` or `npm run lint` locally because this environment could not clone the repository. Treat interactive behaviour, email delivery and mobile layout as unverified until tested. `docs/CMS_AND_LAUNCH_REQUIREMENTS.md` has been corrected to remove outdated claims that `/admin` already has authentication or video publishing.

**Runtime caveat:** This is a repository-source review, not a live-site or delivery test. Deployment status, Vercel settings, production environment variables, sender-domain verification, inbox delivery and a successful build remain to be verified.

---
---

## 1B. Repository audit findings — 14 October 2026

This section records implementation facts found in source. “Present” means source code exists; it does not mean the journey has passed live/browser testing.

### Confirmed blockers and functional defects

| Priority | Finding | Evidence / impact | Required action |
|---|---|---|---|
| Launch blocker | No secure Store checkout or delivery | `/api/checkout` returns HTTP 501; `/api/webhooks/stripe` returns HTTP 501; Pay links open email only. | Build and test verified payment, order records, receipts, refunds and protected digital delivery before taking payment. |
| Launch blocker | Admin/CMS not implemented | `/admin` returns `Placeholder`; admin layout does not authenticate users; no persistent schema/migrations or connected content workflow exists in the tree. | Agree data model and build secure protected admin and CMS before promising self-service management. |
| Launch blocker | Work With FK paid funnel not implemented | Approval and scheduling endpoints return HTTP 501; deposit/balance payment is not collected or verified. | Implement the reviewed workflow only after fees, payment provider, refund/cancellation/no-show rules and terms are agreed. |
| High | TAP IN detail route is a placeholder | `src/app/(site)/tap-in/[slug]/page.tsx` returns `Placeholder`; landing page is a static list of focus areas, explicitly not verified live listings. | Build data-driven opportunity details, verified/live state, individual enquiry forms and share metadata. |
| High | Home calls-to-action contain dead/self-targets | “START YOUR APPLICATION” and homepage listing rows route to `#contact`; several closing cards all link back to `#contact`. “VIEW LATEST LISTINGS” points back to the same `#tap-in` section. | Point each CTA to its intended real form, page or listing, then exercise every CTA on desktop and mobile. |
| High | Footer/search contain anchors that do not exist | Homepage IDs currently include `about`, `work-with-fk`, `process`, `tap-in`, `partner` and `contact`; footer/search destinations such as `/#discover`, `/#understand` and `/#access` have no matching target. | Replace stale links with existing sections/pages or add the intended target sections. |
| High | Desktop navigation falls back to hamburger too early | The previous navigation media query hid `.desktop-nav` at widths up to 1000px. Some mobile browsers in desktop-site mode still have an effective viewport below that breakpoint. The shared header itself is fixed by a later CSS rule. | Revised to keep desktop links visible above 800px and reserve the hamburger for narrower screens; verify across 801–1000px widths after deployment. |
| High | Carousel accessibility controls are missing | `Hero.tsx` auto-advances but renders no visible pause, next/previous or progress controls; a `paused` state exists without a UI control. | Add usable keyboard-accessible controls, pause/resume and reduced-motion behaviour; retest. |
| High | Homepage proof points are not verified | Hard-coded sample listings and a testimonial-style client quote appear as presentational content. | Obtain approval/evidence or mark as demo content before public launch. |
| Medium | All enquiries share one destination | `submit-lead.ts` sends all lead types to `EMAIL_CONNECT`; separate Ask and private Work With FK routing are not implemented. | Configure/test intended email routing, delivery failure handling and notification destinations. |
| Medium | Newsletter is unimplemented | `/api/forms/subscribe` returns HTTP 501 and there is no working subscriber store/provider integration. | Choose provider and implement confirmed opt-in, storage, unsubscribe and delivery behaviour. |
| Medium | Blog content is preview-only | Starter records are explicitly `previewOnly: true`; article pages display a preparation notice, not the full article. | Approve and publish complete articles, authors, metadata and share images; otherwise keep clearly labelled as preview. |
| Medium | Search is a hard-coded index, not content search | `SiteSearch.tsx` searches a static list of page/book destinations. It does not query article records or live TAP IN opportunities and includes destinations beyond the scoped Blog/TAP IN search. | Decide expected scope and implement/search-test actual published content. |
| Medium | Sitemap coverage is incomplete | The current sitemap lists core static routes only; book/blog detail URLs and `/work-with-fk/apply` are missing. | Generate sitemap entries from published content and include relevant public flows. |
| Medium | Structured data component is a stub | `src/components/seo/JsonLd.tsx` returns `null`. | Implement appropriate structured data and validate it if required by launch scope. |
| Medium | Cookie banner/consent controls are missing | Policy text says the banner has not been verified; no consent UI was found in the active component tree. | Select a consent approach, implement it before enabling optional technologies where required, and test preferences. |
| Tech debt | Orphaned placeholder components/helpers remain | Several `src/components/home/*` components and `JsonLd.tsx` return `null`; email/Stripe/Supabase helper modules export nothing. Bookstore/store CSS module files are not imported by their active components. | Either wire up each needed module or remove unused stubs and styles after confirming there are no intended consumers. |
| Tech debt | No automated test suite/configuration is present | `package.json` defines dev/build/start/lint but no test script or test dependency appears in the manifest; no tests directory is in the tree. | Add suitable unit/integration tests for validation, checkout/webhooks, content routes and key interactions. |
| Verification gap | Source/deploy status is not end-to-end QA | GitHub's Vercel status reports deployment completed, but no local build/lint or interactive browser/device test was run during this audit. | Record the results of build, lint, form delivery, accessibility and mobile/desktop QA before checking launch criteria complete. |

### File groups reviewed

- Repository inventory: 134 tracked tree entries; App Router pages and API routes enumerated.
- Page/route source: homepage, shared site/admin layouts, About, Blog/list/detail, Contact, Store/list/detail, TAP IN/list/detail, Work With FK/application and legal routes.
- Active components: Hero, HomeSections, BookstoreFeature, BookShelf/books data, FeaturedStories, Header, Footer, MobileMenu, SiteSearch, ContentPage, EnquiryForm and LegalPages; empty placeholder components and helper modules were also checked.
- Business logic/configuration: API handlers in the current tree, form schema/Resend handler, package manifest, environment example, Next/TypeScript/ESLint configuration, sitemap and robots.
- Planning documents: roadmap, project scope and CMS/launch requirements were compared with the implementation.

The audit did not include a local npm install/build/lint or real browser and email-delivery tests because this environment could not clone the repository. It therefore does not certify live visual behaviour or third-party account configuration.

## 2. Audiences and conversion paths

Priority order, which also decides what gets the most visual weight:

1. **Commercial clients** (companies, investors, founders, institutions): Work With FK
2. **Opportunity responders**: TAP IN
3. **Partners** (brands, sponsors, events, guests): Partner With TAP
4. **TAP social audience, mostly on phones**: Store, Blog, Ask The Africa Plug, email sign-up

Design direction for the current build: black/near-black, white type and TAP pink, with an editorial, photography-led, mobile-first feel. Note: this is more black-and-pink than the older navy/charcoal wording in `docs/PROJECT_SCOPE.md`; confirm the final palette against the approved brand guidelines.

---

## 2A. Visual reference: header and hero (replicate closely)

Source: screenshot of the current build at `the-africa-plug-five.vercel.app`, captured 14 Oct 2026 at a narrow (phone-like) width.

**Rule for any developer:** build the header and hero to match this reference closely. Do not reinterpret it. Items marked **Differs from scope** are listed in the decisions tracker (section 6) and need a decision before Stage 1 is final.

### Header

- Slim full-width bar in near-black navy, sitting over the top of the hero image.
- **Left:** the TAP logo lockup, specified in full in the Logo section below. It links to the top of the homepage.
- **Right:** a search icon (magnifier) followed by a hamburger menu icon, both thin white line icons.
- Desktop navigation order is set in section 5, Stage 1.
- **Differs from scope:** the scope says the Work With FK button stays visible beside the hamburger on mobile. The reference does not show it.
- **Differs from scope:** the reference shows a search icon. The scope keeps it only if it searches Blog and TAP IN.

### Logo (critical: must match exactly)

**Rule:** the logo is a brand asset, not a design element. Use the supplied logo file exactly as provided. Never retype the wordmark in a font, redraw the globe, or recolour any part of it. The description below only tells a developer what the logo should look like, so they can check their work against it.

**Lockup, left to right**
1. **Globe mark** (three parts):
   - A circle drawn in thin white lines, with curved latitude and longitude lines to form a globe
   - A **solid pink silhouette of Africa** in the centre of the globe
   - A **pink power plug**, with its cord, entering the globe from the left and crossing the circle outline, pointing toward Africa. This is the "plug" in the brand name.
2. **Wordmark**, to the right of the globe:
   - Small **"THE"**, white, bold, uppercase, sitting above the start of the word "AFRICA"
   - **"AFRICA"** in white, extra-bold, uppercase
   - **"PLUG"** in pink, extra-bold, uppercase, on the same line directly after "AFRICA"
   - The wordmark is a heavy, tightly spaced sans-serif, and the globe is about as tall as the two lines of text together

**Logo colours**

| Part | Colour |
|---|---|
| Globe circle and grid lines | White |
| Africa silhouette (solid fill) | Pink |
| Power plug and cord | Pink |
| "THE" and "AFRICA" | White |
| "PLUG" | Pink, roughly `#F5005E` (estimate only) |

The pink in the logo, the pink "MOVING." in the headline and the solid pink buttons are all the same signal colour. Define it once in `src/app/globals.css` and reuse it, so the logo never drifts from the rest of the site.

**Usage rules**
- On dark backgrounds (header, hero, footer) use the white-and-pink version shown in the reference.
- Keep clear space around the logo roughly equal to the height of the letter "A".
- Do not stretch, rotate, add shadows or place it on a busy part of the photograph. The hero gradient exists to keep the header area dark enough.
- The logo links to the top of the homepage on every page.
- Alt text: "The Africa Plug".

**Files needed from the client (the screenshot is not enough)**
- Logo as **SVG** (preferred), with a PNG fallback
- A compact version of the globe mark alone (globe, Africa and plug, without the wordmark), for the favicon and small sizes
- The logo on a transparent background, so it sits on both the header and the hero photograph
- The exact pink as a hex value, which overrides the estimate above

---

### Hero (slide 1 of 3)

- **Background:** full-bleed photograph with a dark gradient, heaviest on the left, so the text stays readable. Subject: a dim interior, a person seated facing a TV, warm lamp light on the right. Separate mobile crops are required.
- **Eyebrow:** "THE AFRICA PLUG". Small, uppercase, wide letter-spacing, white.
- **Headline:** two lines, uppercase, very large, heavy-weight sans, tight tracking and tight line height.
  - Line 1, white: `KNOW WHAT'S`
  - Line 2, pink: `MOVING.`
- **Subhead** (white, semi-bold): `Business. Investment. Culture. Travel. Lifestyle. Opportunity.`
- **Body** (white, slightly reduced opacity, regular weight): `Follow the ideas, companies, conversations and opportunities shaping what happens next across the continent.`
- **Buttons**, in one row (wrapping on very narrow screens), square corners, a right-pointing arrow after each label:
  1. `Explore Africa →` solid pink, white text (active slide's button)
  2. `Work With FK →` transparent, 1px white outline
  3. `Ask The Africa Plug →` transparent, 1px white outline
- **Slide caption**, bottom left: `Across Africa` in bold, with `People. Capital. Opportunity.` in small text beneath.
- **Slide controls**, bottom right: a previous arrow, three thin progress bars (the active one brighter), a next arrow.
- **Differs from scope:** the first button reads "Explore Africa". The scope names it "TAP IN".
- **Differs from scope:** the reference has arrows and progress bars but no visible pause control. The scope requires one for accessibility.
- **Not yet captured:** slides 2 and 3 (headline, caption and which button is solid pink on each).

### Colour and type (approximate, taken from the screenshot)

| Token | Reference value |
|---|---|
| Background | Near-black navy |
| Signal colour | Hot pink, roughly `#F5005E` (estimate only) |
| Text | White |
| Typeface | One geometric/grotesque sans family throughout, heavy weight for the headline |

These are estimates. Replace them with the real values when the brand guidelines arrive. They all live in `src/app/globals.css`.

---

## 3. Technology stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Own URLs per listing, article and product; SEO built in; one codebase for site, admin and API |
| Styling | Tailwind CSS | Fast mobile-first layouts; design tokens in one file |
| Database and file storage | Supabase (Postgres + Storage) | Listings, posts, products, applications, uploads |
| Payments | Stripe (Paystack as alternative) | Store checkout, Work With FK deposit and balance |
| Email | Resend | Transactional email and routing to connect@, ask@, fk@ |
| Spam protection | Cloudflare Turnstile | Forms |
| Validation | Zod | Shared form and API validation |
| Hosting | Vercel (recommended) | Native Next.js hosting |

---

## 4. Target architecture

```
africa-plug/
├── public/
│   ├── images/mobile/        separate mobile crops
│   ├── video/
│   └── downloads/
└── src/
    ├── app/
    │   ├── (site)/           homepage, tap-in, blog, store, contact,
    │   │                     about, work-with-fk, legal pages
    │   ├── (admin)/admin/    uploads, store, media, blog, login
    │   ├── api/              forms, work-with-fk, checkout, webhooks
    │   ├── not-found.tsx
    │   ├── sitemap.ts
    │   └── robots.ts
    ├── components/           layout, home, forms, ui, seo
    ├── lib/                  supabase, email, payments, validation
    ├── types/
    └── content/
```

---

## 5. Build stages

Working rule: each stage is walked through first, and we start only after your go-ahead. Each stage ends with something you can open and review. Only new or changed files are delivered, as complete files, each labelled with its full path.

### Stage 1: Foundation and design shell — PRESENT, NOT SIGNED OFF

**Current status:** The shared styling, site layout, header/mobile navigation, footer, hero carousel and legal pages exist. The final header override uses `position: fixed`; desktop navigation previously switched to the hamburger at 1000px, so the current code moves that responsive breakpoint to 800px. The supplied logo lockup still needs comparison with the approved asset. The hero has three hard-coded slides and auto-advances, but no visible pause control, arrows or progress indicators are rendered even though the target brief requires a pause control. Slide caption fields and a navigation helper are defined but not used. Homepage hero copy/CTAs also differ from parts of the visual reference. Legal drafts need business-detail confirmation and review.

**Planned deliverables / review target**
- `src/app/globals.css`: colour tokens (navy, charcoal, pink signal), base styles
- `src/app/layout.tsx`: fonts, en_GB metadata
- `src/components/layout/Header.tsx` and `MobileMenu.tsx` (built to the header reference in section 2A)
- `src/components/layout/Footer.tsx`
- `src/components/home/Hero.tsx`: 3 hard-coded slides, all three buttons on every slide, the active slide’s button is solid pink, and auto-advance is 6.5 seconds. **Pause control, arrows and progress indicators are not rendered**; caption fields are currently unused. Add and test the accessibility controls before sign-off.
- `src/app/(site)/layout.tsx` and `page.tsx`
- Shared legal page template and the four legal pages using it

**Navigation (desktop):** TAP logo | TAP IN · WORK WITH FK · STORE · BLOG · CONTACT · ABOUT. Logo returns to top of homepage; no Home item. Mobile: hamburger with the Work With FK button kept visible beside it.

**Review point:** the shell loads on desktop and phone, the menu works, the carousel advances and pauses.

**Needs from client:** brand guidelines (placeholder colours used until then).

### Stage 2: Homepage sections — PRESENTATIONAL PROTOTYPE

**Current status:** Major homepage sections are present as hard-coded front-end content. The FK introduction area below the carousel now contains a temporary YouTube iframe sample, not the official FK introduction video. Its live visual playback has not been independently checked. Captions/subtitles, a poster workflow, CMS-managed media, approved copy and verified proof points/testimonials are still outstanding. The testimonial-style quote and homepage opportunity cards must be verified/approved or clearly labelled as examples before public launch.

**Planned sections below the hero, in order:**
1. FK video (40 to 60 seconds, inline, captions)
2. Work With FK with proof: process, Selected Work cards, testimonials
3. TAP IN preview: 2 to 3 latest live listings
4. Featured product (initially the Africa Starter Guide)
5. The Africa Plug, with the Partner With TAP invitation
6. Blog preview, with LinkedIn, YouTube and Instagram links
7. Closing zone: Contact, Ask The Africa Plug and Stay Plugged In cards, sign-off, footer

**Review point:** the full homepage scrolls end to end with placeholder content, jump links work.

**Needs from client:** FK video, hero photography and mobile crops, copy, testimonials, Selected Work cards.

### Stage 3: TAP IN, Blog and Store — PARTIAL FRONT-END / HARD-CODED DEMO

**Current status:** Store has ten hard-coded demo titles, photo-led cover designs, a rebuilt two-level wooden bookshelf layout, individual book-detail routes, and a browser-local cart with quantity updates/removal and an email order-enquiry action. Prices and descriptions remain illustrative; the cart does not take payment and digital delivery is not implemented. `src/app/(site)/tap-in/[slug]/page.tsx` is still `Placeholder`; TAP IN landing cards are static focus areas, not live opportunities. Blog entries in `src/lib/blog-posts.ts` are marked preview-only and article pages show an “article is being prepared” message rather than full stories. The Supabase client/server helper files contain only `export {}`; no database schema/migrations or connected content API exist.

**Planned deliverables**
- TAP IN listing page and one page per listing, with share image and Express Interest form (listing name attached automatically)
- Blog page and one page per article, with clickable tags, SEO title, description and share image
- Store page and one page per product, on-site checkout, digital file delivery
- Database tables and storage buckets in Supabase

**Review point:** a sample listing, article and product each open on their own URL and preview correctly when shared; a test checkout delivers the file.

**Needs from client:** first listings (excavator hire, honey), first articles, Africa Starter Guide file and price.

### Stage 4: Forms and Work With FK funnel — INITIAL ENQUIRIES ONLY

**Current status:** The contact, Ask, partner, TAP IN interest and Work With FK API routes call a shared Zod-validated Resend handler with a honeypot and optional Turnstile verification. All lead types currently send to the single `EMAIL_CONNECT` destination, not the separate routing described in the scope. Actual inbox delivery is unverified. Newsletter subscribe, checkout, Stripe webhook, approval and scheduling endpoints return HTTP 501. The Stripe, Supabase and generic email helper modules are empty `export {}` files. No payment is collected by the current Work With FK form.

**Planned deliverables**
- Forms: Partner With TAP, Ask The Africa Plug, Contact, email sign-up, Expression of Interest, all with Turnstile and clear success and error messages
- Email routing: connect@ (relationships), ask@ (questions), fk@ (qualified commercial work, never displayed)
- Work With FK funnel: qualification form, review, approval email, deposit payment, scheduler access, balance payment, confirmation email

**Hard gate:** the payment flow goes live only after the terms pass legal review.

**Review point:** every form reaches the right inbox; a test application runs through the full funnel in Stripe test mode.

**Needs from client:** final deposit amount and meeting fee, refund rule for cancellations more than 24 hours ahead, no-show balance rule, legal review of all terms.

### Stage 5: Admin dashboard — NOT IMPLEMENTED

**Current status:** `/admin` renders `Placeholder`; its layout only renders children and adds no authentication or access control. The CMS requirements below are target specifications, not working functionality in this branch.

**Planned deliverables**
- Secure login
- Uploads: digital product file and documents
- Store: add products, edit prices and descriptions, choose homepage featured product
- Media: upload and organise images and video
- Blog: write, edit, publish; create tags; set SEO title, description and share image
- Handover walkthrough

**Control rules**
- Publishing an article adds it to the Blog page, its own URL and the homepage preview.
- Changing a price updates the product page and checkout.
- Changing the featured product updates the homepage block immediately.
- Page layouts and text stay developer-controlled.

**Review point:** the client publishes an article and changes a price without help.

### Stage 6: SEO, QA and launch — PARTIAL SCAFFOLD; NOT LAUNCH-READY

**Current status:** `robots.ts` and a core static sitemap are present, but the sitemap omits dynamic book/article detail routes and the Work With FK application route. `JsonLd.tsx` returns `null`. Cookie policy copy explicitly says a preference banner has not been verified; no actual consent banner is present in the active component tree. Legal pages contain substantive drafts but need confirmed business details and legal review. The video-code commit previously reported a completed Vercel deployment; the latest storefront/cart commit was still deploying when this roadmap was last checked. Local build/lint and browser-based accessibility/mobile/performance checks were not run in this audit.

**Planned deliverables**
- Metadata, 1200x630 share image, en_GB locale, structured data, sitemap, robots.txt
- Search Console and Bing setup, analytics basics
- UK cookie banner; Privacy, Terms, Cookies, Deposit & Refund pages final
- Accessibility checks: alt text, colour contrast, keyboard navigation, carousel pause, video captions
- Performance checks: lazy-loaded media, optimised images and video, reduced-motion support, no scroll-jacking, no autoplay sound
- Test of every link and button on desktop and mobile
- Domain, DNS, email sending domain verification, production environment variables
- Go-live and post-launch check

---

## 6. Decisions and content tracker

### Decisions needed

| Decision | Blocks | Status |
|---|---|---|
| Final deposit amount and meeting fee | Stage 4 | Open |
| Refund rule for cancellations more than 24 hours ahead | Stage 4 | Open |
| Whether the balance is kept on a no-show | Stage 4 | Open |
| Legal review of all terms | Stage 4 go-live | Open |
| Search icon: keep only if it searches Blog and TAP IN (the reference shows it) | Stage 1 header | Open (current icon is an anchor to the TAP IN section, not a working search) |
| Hero wording and CTA set: align current hard-coded slides with approved reference/scope | Stage 1 hero | Open (current code uses Work With FK, TAP IN and Ask The Africa Plug CTAs; final slide copy needs approval) |
| Hero pause control: the reference has arrows and bars but no pause button, the scope requires one | Stage 1 hero | Open (default: add one) |
| Work With FK button beside the hamburger on mobile: the scope requires it, the reference does not show it | Stage 1 header | Open (default: add it) |
| Payment provider: Stripe or Paystack | Stage 3 and 4 | Open (Stripe package/helper exists, but payment routes are unimplemented) |
| Hosting and domain | Stage 6 | Open — verify that the production deployment is connected to this exact `MrDan001/Africa-Plug` repository; do not infer this from a similarly named Vercel project |

### Content needed

| Content | Needed by | Status |
|---|---|---|
| Logo files: SVG (preferred) plus PNG, globe mark alone for favicon, exact pink hex | Stage 1 | Open |
| Brand guidelines (colours, typography) | Stage 1 | Open (placeholders used) |
| FK video, hero photography, mobile crops | Stage 2 | Open |
| All copy | Stage 2 | Open |
| Testimonials and Selected Work cards | Stage 2 | Open |
| TAP IN listings (excavator hire, honey) | Stage 3 | Open |
| Articles | Stage 3 | Open |
| Africa Starter Guide file and price | Stage 3 | Open |
| Legal texts | Stage 4 | Open |

The developer can start layout, responsive behaviour, CMS structure, forms, routing and the visual shell before any content arrives.

---

## 7. Accounts and environment variables

Accounts to create before the stage that needs them:

| Account | Needed for | Stage |
|---|---|---|
| Supabase | Database, file storage, admin auth | 3 |
| Stripe (or Paystack) | Checkout, deposits | 3 and 4 |
| Resend | Email | 4 |
| Cloudflare | Turnstile spam protection | 4 |
| Vercel | Hosting | 6 |
| Google Search Console and Bing Webmaster | Indexing | 6 |

The current `.env.example` lists `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_CONNECT`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and `TURNSTILE_SECRET_KEY`. The Supabase and Stripe variables below are planned requirements and are not currently listed in that example file. Real values belong in local/deployment secret settings, never in a commit:

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
EMAIL_CONNECT=connect@
EMAIL_ASK=ask@
EMAIL_FK=fk@
```

---

## 8. Risks and how we handle them

| Risk | Handling |
|---|---|
| Payment flow launched before legal terms are final | Flow stays behind a feature flag until legal sign-off |
| Content arrives late | Build with placeholders; CMS structure and shell do not depend on content |
| Heavy photography and video slow the site on phones | Optimised images, separate mobile crops, lazy loading, no autoplay sound |
| Spam on forms | Turnstile plus server-side validation with Zod |
| Secrets leaked to the browser | Service keys used only in server code; only `NEXT_PUBLIC_` values reach the client |
| Admin area exposed | Auth required on every admin route and every admin API call |
| Config drift (Next.js 16 options) | Keep `next.config.ts` minimal; Cache Components stays off |

---

## 9. Definition of done (launch checklist)

- [ ] All six stages reviewed and approved by the client
- [ ] Every link and button tested on desktop and mobile
- [ ] Forms deliver to connect@, ask@ and fk@ correctly
- [ ] Test purchase and test deposit both work end to end
- [ ] Legal pages final; terms legally reviewed
- [ ] Cookie banner live (UK)
- [ ] Share previews correct on LinkedIn and WhatsApp for a listing, article and product
- [ ] Lighthouse: accessibility and performance acceptable on mobile
- [ ] Sitemap submitted to Search Console and Bing
- [ ] Client has published an article and changed a price from the dashboard
- [ ] Backups and access credentials handed over

---

## 10. Immediate next steps — in execution order

1. **Confirm the exact deployment.** Verify that the intended Vercel production project is connected to `MrDan001/Africa-Plug`, branch `main`, and confirm the commit deployed. Do not confuse it with the separately named `MrDan001/the-africa-plug` repository or a similarly named Vercel project.
2. **Prove the current enquiry forms work end to end.** Set the Resend key and sender/from details in the correct deployment environment, verify the `theafricaplug.com` sending domain with Resend, and submit test enquiries from Contact, Partner With TAP and Work With FK. Confirm the messages arrive, replies work, and errors are clear. Repository source alone cannot prove delivery.
3. **Set the email-routing rules.** At present, the shared handler sends to `EMAIL_CONNECT` (default `connect@theafricaplug.com`). Decide and implement the intended routing to `connect@`, `ask@`, and the private `fk@` address before calling Stage 4 complete. Keep `fk@` hidden from the public UI.
4. **Finish the public enquiry paths.** Put the Ask The Africa Plug form and TAP IN expression-of-interest form on the correct public pages, attach the chosen listing automatically when relevant, and implement the newsletter signup endpoint (currently HTTP 501). Only enable Turnstile once the site key and secret key are configured together.
5. **Build the real content layer.** Define the Supabase schema and storage model, then connect TAP IN listings, Blog articles, Store products, slugs, detail pages, search/tags and featured content to real records. Replace the current placeholder detail pages.
6. **Build and secure the admin/CMS.** Implement protected login and content editing for opportunities, enquiries, articles, products, media, homepage modules, settings and feature flags. Treat the admin specification as planned scope until these features exist and are tested in this repository.
7. **Implement the commercial funnel only after decisions/legal review.** Finalise fees, deposit, refund, cancellation, no-show and rescheduling rules; obtain legal review; then implement verified Stripe payments/webhooks, approval messages and scheduling unlocks. The current checkout, webhook, approval and scheduling endpoints are stubs.
8. **Complete launch QA.** Finalize and review the existing legal policy drafts, implement and verify cookie consent, review the existing sitemap and add dynamic product URLs where needed, set metadata/structured data/analytics, verify all links and forms on phone and desktop, run build/lint and accessibility/performance checks, then confirm the production domain and post-deploy behaviour.

**Current recommendation after source audit:** The Store visual rebuild and browser-local demo cart are now in code. First verify the new layout, cart and desktop-menu breakpoint on real devices; then fix remaining homepage/footer/search CTA defects and add the missing carousel controls. Next agree the real product data and connect Store/TAP IN/Blog to a persistent backend. Build secure admin/CMS and the payment/digital-delivery workflows only after the required business decisions and legal review. Do not treat the current form or demo Pay buttons as confirmed commercial workflows.