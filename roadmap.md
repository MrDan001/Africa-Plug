# The Africa Plug Website: Full Roadmap

Commercial headquarters of FK's Africa Commercial Deal Consultancy.
Goal: convert visitors into enquiries, applications and sales.

Last updated: 14 Oct 2026

---

## 1. Where we are now

| Item | Status |
|---|---|
| Project scope document | Done (11 Oct 2026) |
| Visual reference for header and hero | Captured, see section 2A |
| Stack decision | Done: Next.js (React + TypeScript) + Tailwind CSS |
| Framework installed | Done (`africa-plug` on the Desktop) |
| Core packages installed | Done: Supabase, Stripe, Resend, Zod |
| Folder structure and placeholder files | Done |
| Placeholder and 404 pages verified | Done |
| `next.config.ts` cleaned (Cache Components off) | Done |
| Stage 1 files | Next |

Notes:
- The `npm audit` warning (5 high severity) is expected at this point. Do not run `npm audit fix --force`.
- We work in PowerShell on Windows. All terminal commands must be PowerShell, not bash.

---

## 2. Audiences and conversion paths

Priority order, which also decides what gets the most visual weight:

1. **Commercial clients** (companies, investors, founders, institutions): Work With FK
2. **Opportunity responders**: TAP IN
3. **Partners** (brands, sponsors, events, guests): Partner With TAP
4. **TAP social audience, mostly on phones**: Store, Blog, Ask The Africa Plug, email sign-up

Design direction: dark, architectural, editorial. Navy and charcoal base, TAP pink used only as a signal colour. Photography-led. Mobile-first.

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
1. **Globe mark:** a globe with an outline map of Africa, drawn in thin white lines with a pink accent.
2. **Wordmark**, stacked on two lines:
   - Small "THE", white, uppercase, wide letter-spacing, sitting above the word "AFRICA"
   - **"AFRICA"** in white, bold, uppercase
   - **"PLUG"** in pink, bold, uppercase, on the same line as "AFRICA" or directly alongside it as in the reference

**Logo colours**

| Part | Colour |
|---|---|
| Globe lines | White |
| Globe accent | Pink (same pink as the wordmark) |
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
- A compact version of the globe mark alone, for the favicon and small sizes
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

### Stage 1: Foundation and design shell

**Deliverables**
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

### Stage 2: Homepage sections

Sections below the hero, in order:
1. FK video (40 to 60 seconds, inline, captions)
2. Work With FK with proof: process, Selected Work cards, testimonials
3. TAP IN preview: 2 to 3 latest live listings
4. Featured product (initially the Africa Starter Guide)
5. The Africa Plug, with the Partner With TAP invitation
6. Blog preview, with LinkedIn, YouTube and Instagram links
7. Closing zone: Contact, Ask The Africa Plug and Stay Plugged In cards, sign-off, footer

**Review point:** the full homepage scrolls end to end with placeholder content, jump links work.

**Needs from client:** FK video, hero photography and mobile crops, copy, testimonials, Selected Work cards.

### Stage 3: TAP IN, Blog and Store

**Deliverables**
- TAP IN listing page and one page per listing, with share image and Express Interest form (listing name attached automatically)
- Blog page and one page per article, with clickable tags, SEO title, description and share image
- Store page and one page per product, on-site checkout, digital file delivery
- Database tables and storage buckets in Supabase

**Review point:** a sample listing, article and product each open on their own URL and preview correctly when shared; a test checkout delivers the file.

**Needs from client:** first listings (excavator hire, honey), first articles, Africa Starter Guide file and price.

### Stage 4: Forms and Work With FK funnel

**Deliverables**
- Forms: Partner With TAP, Ask The Africa Plug, Contact, email sign-up, Expression of Interest, all with Turnstile and clear success and error messages
- Email routing: connect@ (relationships), ask@ (questions), fk@ (qualified commercial work, never displayed)
- Work With FK funnel: qualification form, review, approval email, deposit payment, scheduler access, balance payment, confirmation email

**Hard gate:** the payment flow goes live only after the terms pass legal review.

**Review point:** every form reaches the right inbox; a test application runs through the full funnel in Stripe test mode.

**Needs from client:** final deposit amount and meeting fee, refund rule for cancellations more than 24 hours ahead, no-show balance rule, legal review of all terms.

### Stage 5: Admin dashboard

**Deliverables**
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

### Stage 6: SEO, QA and launch

**Deliverables**
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
| Search icon: keep only if it searches Blog and TAP IN (the reference shows it) | Stage 1 header | Open |
| First hero button label: "Explore Africa" (reference) or "TAP IN" (scope) | Stage 1 hero | Open |
| Hero pause control: the reference has arrows and bars but no pause button, the scope requires one | Stage 1 hero | Open (default: add one) |
| Work With FK button beside the hamburger on mobile: the scope requires it, the reference does not show it | Stage 1 header | Open (default: add it) |
| Payment provider: Stripe or Paystack | Stage 3 and 4 | Open |
| Hosting and domain | Stage 6 | Open (the reference build is already on Vercel) |

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

Variables (listed in `.env.example`, real values only in `.env.local`, never committed):

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

## 10. Immediate next steps

1. Approve the Stage 1 file list and say "go".
2. Send the brand guidelines when available, or approve placeholder colours.
3. Decide on the search icon.
4. Start collecting the Stage 2 content: video, hero photography, copy.