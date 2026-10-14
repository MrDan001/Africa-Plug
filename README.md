This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Africa Playbook and Store

The homepage Africa Playbook feature links directly to the Store and presents a designed collection of book-cover artwork. The Store presents ten demo guide/workbook covers on visual shelf boards. Each title has its own detail page with a longer description, included topics, demo price and purchase-enquiry action.

**Commerce status:** titles, content and prices are placeholders. The current Pay action opens an email enquiry and does not charge a customer. Connect and test secure checkout and digital-file delivery before selling real products.


## Homepage intro video

A temporary Africa-themed YouTube sample is embedded in the intro-video slot immediately below the hero carousel. It is only a visual placeholder and should be replaced with the approved FK introduction video before launch. Keep large video files out of the Git repository and deployment bundle; for a real uploaded video, use a media host such as Vercel Blob or an unlisted YouTube upload.


## Current build status

The latest repository roadmap now includes an actionable, stage-by-stage working checklist. The homepage and Store are front-end prototypes; the Store's sample Pay actions are email enquiries, not real checkout. The temporary intro video is embedded below the homepage carousel and its latest commit reports a completed Vercel deployment, but the live presentation still needs visual/device verification.

See [roadmap.md](./roadmap.md) for remaining launch blockers across product data, CMS/admin, payments and digital delivery, forms/email, legal/compliance, SEO and QA.


## SEO and legal implementation note

The current sitemap contains the core static page routes; dynamic book-detail URLs have not yet been added. Privacy, Terms, Cookies and Refunds pages contain substantive policy drafts, but business details and legal review still need to be completed before launch. A source review is not a substitute for running the build and testing the live deployment.


## Repository audit status (14 October 2026)

A source audit has compared the App Router pages, core components, API handlers, configuration and planning documents against the intended scope. Major visual pages are present, but this is still a front-end prototype with demo book data and preview blog/opportunity content. Secure checkout, digital delivery, the CMS/admin, newsletter handling, Work With FK approval/scheduling, and verified email-routing workflows are not complete. Some homepage/footer/search anchors and carousel accessibility controls also need fixing.

See [roadmap.md](./roadmap.md) for the itemised done/partial/remaining checklist and audit findings. The earlier video-code commit received a successful Vercel status; the documentation-only audit commit was still deploying when recorded. Local build/lint and interactive browser/email-delivery QA were not run in this environment.


## Storefront rebuild

The Store page has been rebuilt with a warm, photo-led bookstore banner, ten designed book covers across two wooden shelf levels, individual book detail links, and a cart control in the Store header. The cart saves selections in browser local storage and supports quantity updates/removal. Its order action composes an email enquiry; it does not process payment. Secure checkout and digital delivery remain future launch requirements.

The shared desktop navigation now remains visible above 800px; the hamburger is reserved for widths at or below 800px. Verify the deployed result on desktop, mobile, and 801–1000px widths.
