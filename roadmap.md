# The Africa Plug Website: Full Roadmap

Commercial headquarters of FK's Africa Commercial Deal Consultancy.
Goal: convert visitors into enquiries, applications and sales.

Last updated: 14 Oct 2026

---

## 1. Current implementation status

**Last reviewed:** 14 October 2026  
**Repository checked:** [`MrDan001/Africa-Plug`](https://github.com/MrDan001/Africa-Plug), branch `main`  
**Latest reviewed commit:** [`cbd65d9`](https://github.com/MrDan001/Africa-Plug/commit/cbd65d9ef081e3b4830ba89a9f5c4cbbc1c25fad) — adds planning documentation only. The enquiry-form work is in earlier commits on the same branch.

This section records what is present in the repository today. The stage descriptions below remain the target scope; a route or component existing does not mean the connected business workflow is complete or production-tested.

| Area | Current state | What the code review confirms |
|---|---|---|
| Project planning | **Documented** | `docs/PROJECT_SCOPE.md`, `roadmap.md`, and `docs/CMS_AND_LAUNCH_REQUIREMENTS.md` exist. They describe the target; they do not make the listed features implemented. |
| Framework and styling | **Present** | Next.js 16, React 19, TypeScript and Tailwind CSS 4 are in `package.json`. Site layout, shared styling, header, mobile menu and footer are present. |
| Homepage and visual shell | **Built as a front-end** | The homepage has a three-slide hero carousel and static sections for the FK introduction, Work With FK, TAP IN, a featured resource, partners, Blog and closing/contact area. The content, slides and image URLs are currently hard-coded. The FK introduction is a poster/link, not the final integrated 40–60 second video package. |
| Logo | **Needs brand verification** | `public/images/logo.svg` and `logo-mark.svg` exist. Header/footer code uses the mark plus an HTML/CSS wordmark; verify against the approved full supplied lockup before calling this exact-logo work complete. |
| Public routes | **Front-end skeletons present; Store demo added** | Homepage, TAP IN, Blog, Store, About/Partner, Contact, Work With FK/application and legal route paths exist. The homepage now includes an Africa Playbook feature linking to Store. Store has a responsive 10-book demo shelf with placeholder titles, descriptions, prices and enquiry-style Pay buttons. These are demo catalogue entries, not confirmed products; checkout, product records and secure digital delivery are not connected. TAP IN and Blog data workflows remain incomplete. |
| Initial enquiry forms | **Implemented in code; delivery unverified** | Contact, Partner With TAP and Work With FK pages render the reusable enquiry form. Shared Zod validation, a honeypot, Resend email sending and optional Cloudflare Turnstile support are implemented. API route files also exist for Ask and TAP IN interest. The handler currently routes submissions to `EMAIL_CONNECT` (default `connect@theafricaplug.com`), not separate `ask@` and private `fk@` routing. |
| Newsletter | **Not implemented** | `/api/forms/subscribe` returns HTTP 501, “Not implemented”. |
| Payments and commercial funnel | **Not implemented** | Stripe is installed and a helper exists, but checkout, Stripe webhook, Work With FK approval and scheduling routes return HTTP 501. The current application form is only an initial enquiry; it takes no payment. |
| Database / CMS | **Not implemented as a connected content system** | Supabase packages and client/server helpers exist. The current pages are not backed by a finished content schema or a working content-management workflow; no migration/schema files are present in the current repository tree. |
| Admin dashboard | **Not implemented** | `/admin` currently renders `Placeholder`, and its layout only renders children. The current branch does not show the promised secure CMS/admin workflow. |
| SEO and legal | **Partial scaffold only** | `robots.ts` exists, but `sitemap.ts` returns an empty array. The Privacy, Terms, Cookies and Deposit & Refund Terms routes are placeholders, not final legal documents. |
| Configuration | **Example file present; live values unknown** | `.env.example` documents Resend sender/delivery and optional Turnstile variables. Repository inspection cannot confirm whether Vercel environment variables or Resend domain verification are correctly configured. Never put real secrets in Git. |
| Build and production verification | **Not verified in this review** | No build, lint, end-to-end form delivery, or live production test was run as part of this GitHub-only inspection. Do not treat the latest commit as proof that the deployed site is healthy or that emails reach the inbox. |

### Stage-by-stage status

| Stage | Status today | Main remaining gap |
|---|---|---|
| 1. Foundation and design shell | **Built, review pending** | Confirm exact logo, final visual/reference decisions, keyboard/mobile behavior and brand guidelines. |
| 2. Homepage sections | **Presentational build exists** | Replace placeholders with approved copy, final video/captions, hero assets, real proof points and verified social links. |
| 3. TAP IN, Blog and Store | **Front-end demo in progress** | Homepage Playbook feature and responsive 10-book demo shelf are present. Replace demo content with approved real products, connect persistent product records, implement secure checkout and digital delivery, and complete TAP IN workflows. |
| 4. Forms and Work With FK funnel | **Initial enquiries partly implemented** | Verify live email delivery, implement distinct routing, newsletter, full application review/approval, verified payments and scheduling. |
| 5. Admin dashboard | **Not started in this branch** | Build secure login and CMS workflows against persistent content/data. |
| 6. SEO, QA and launch | **Partial scaffold** | Populate sitemap, finish legal/cookie/analytics setup, run build and device checks, verify the exact production deployment and domain. |

**Important documentation mismatch to resolve:** `docs/CMS_AND_LAUNCH_REQUIREMENTS.md` includes a paragraph saying that the existing `/admin` has admin authentication and Vercel Blob video publishing. That description does not match the current `main` files reviewed here: the current admin page is a placeholder. Keep the requirements in that document as target scope, but do not use that paragraph as proof that admin/video-publishing functionality exists in this repository.

**Runtime caveat:** This is a repository-source review, not a live-site or delivery test. Deployment status, Vercel settings, production environment variables, sender-domain verification, inbox delivery and a successful build remain to be verified.

---
---

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

### Stage 1: Foundation and design shell — BUILT, REVIEW PENDING

**Current status:** The shared styling, site layout, header/mobile navigation, footer, hero carousel and legal route files exist. This is not fully signed off: the supplied logo lockup needs comparison with the approved asset, design decisions remain open, and the legal routes currently contain placeholders. The current homepage hero content/CTAs are hard-coded and differ from some of the reference wording in section 2A.

**Planned deliverables / review target**
- `src/app/globals.css`: colour tokens (navy, charcoal, pink signal), base styles
- `src/app/layout.tsx`: fonts, en_GB metadata
- `src/components/layout/Header.tsx` and `MobileMenu.tsx` (built to the header reference in section 2A)
- `src/components/layout/Footer.tsx`
- `src/components/home/Hero.tsx`: 3 slides, all three buttons on every slide, active slide's button solid pink, 6 to 7 second auto-advance, visible pause control. Built to the hero reference in section 2A.
- `src/app/(site)/layout.tsx` and `page.tsx`
- Shared legal page template and the four legal pages using it

**Navigation (desktop):** TAP logo | TAP IN · WORK WITH FK · STORE · BLOG · CONTACT · ABOUT. Logo returns to top of homepage; no Home item. Mobile: hamburger with the Work With FK button kept visible beside it.

**Review point:** the shell loads on desktop and phone, the menu works, the carousel advances and pauses.

**Needs from client:** brand guidelines (placeholder colours used until then).

### Stage 2: Homepage sections — PRESENTATIONAL BUILD EXISTS

**Current status:** Major homepage sections are present as static front-end content. Real client-approved copy, the final FK video and captions, verified proof points, testimonials, and final photography/crops are still required. The current FK introduction area is a poster/link, not the finished video experience.

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

### Stage 3: TAP IN, Blog and Store — FRONT-END SKELETON ONLY

**Current status:** The listing, Blog and Store landing routes exist, but currently show explanatory/static content. The individual TAP IN, article and product detail route files are placeholders. Supabase packages/helpers exist, but the site is not yet connected to a completed data model or working CMS; checkout and digital delivery are not implemented.

**Planned deliverables**
- TAP IN listing page and one page per listing, with share image and Express Interest form (listing name attached automatically)
- Blog page and one page per article, with clickable tags, SEO title, description and share image
- Store page and one page per product, on-site checkout, digital file delivery
- Database tables and storage buckets in Supabase

**Review point:** a sample listing, article and product each open on their own URL and preview correctly when shared; a test checkout delivers the file.

**Needs from client:** first listings (excavator hire, honey), first articles, Africa Starter Guide file and price.

### Stage 4: Forms and Work With FK funnel — PARTIAL

**Current status:** Contact, Partner With TAP and initial Work With FK enquiry forms use shared validation and a Resend handler. The code includes a honeypot and optional Turnstile checks. Live inbox delivery has not been verified, and the handler currently routes all these enquiry types through `EMAIL_CONNECT` (default `connect@theafricaplug.com`) rather than separate `ask@` / private `fk@` destinations. The newsletter endpoint, Stripe checkout/webhook, approval endpoint and scheduling endpoint currently return 501 and are not implemented. No payment is collected by the current Work With FK form.

**Planned deliverables**
- Forms: Partner With TAP, Ask The Africa Plug, Contact, email sign-up, Expression of Interest, all with Turnstile and clear success and error messages
- Email routing: connect@ (relationships), ask@ (questions), fk@ (qualified commercial work, never displayed)
- Work With FK funnel: qualification form, review, approval email, deposit payment, scheduler access, balance payment, confirmation email

**Hard gate:** the payment flow goes live only after the terms pass legal review.

**Review point:** every form reaches the right inbox; a test application runs through the full funnel in Stripe test mode.

**Needs from client:** final deposit amount and meeting fee, refund rule for cancellations more than 24 hours ahead, no-show balance rule, legal review of all terms.

### Stage 5: Admin dashboard — NOT IMPLEMENTED

**Current status:** The current `/admin` page is a placeholder and the admin layout does not implement authentication or CMS functions. The CMS items below are planned requirements, not existing working features.

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

**Current status:** A robots route exists, but the sitemap currently returns no URLs. The legal route files are placeholders, and a production deployment, environment configuration, inbox delivery, build/lint, accessibility, mobile and performance checks have not been verified in this review.

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
8. **Complete launch QA.** Fill in the real legal pages and cookie consent, generate a useful sitemap, set metadata/structured data/analytics, verify all links and forms on phone and desktop, run build/lint and accessibility/performance checks, then confirm the production domain and post-deploy behaviour.

**Current recommendation:** Start with steps 1–3. That validates the repository/deployment boundary and turns the forms already in the code into a proven working contact channel before more features are added.