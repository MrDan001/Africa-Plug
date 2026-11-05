# The Africa Plug Website — Working Requirements

**Status:** Current working document  
**Added:** 16 October 2026  
**Repository:** `MrDan001/Africa-Plug`  
**How to use this document:** Work through the numbered requirements in order, from 1 to 21. These review notes are to be used alongside the original brief dated 30 September. Anything not changed or clarified here continues to follow that original brief.

This document defines the current requested direction. It is a requirements baseline, **not a statement that every feature is already implemented**. Track actual implementation and verification separately in [the project roadmap](../roadmap.md). Do not invent live listings, products, testimonials, or other real-world content to fill gaps.

---

## 1. Overall visual direction

The current website feels too dark and too pink. Move the overall site towards light mode.

### Main palette

Use primarily:
- Warm stone
- Off-white
- White
- Soft grey
- Charcoal / near-black typography

TAP pink should be an accent only. Stone, off-white and white should do most of the visual work. Grey may be used for borders, secondary sections and subtle contrast. Dark charcoal or navy may still appear occasionally but should not dominate.

### Pink

Significantly reduce the amount of pink. Keep TAP pink as a signal colour for:
- Important CTA buttons
- Active states
- The active hero button
- Hover states
- Small highlights
- Key numbers
- Connection lines/details
- Occasional highlighted words

Avoid large pink backgrounds. Do not replace pink with another dominant colour such as green. No yellow in the new colour treatment.

**Desired feel:** light, commercial, modern, intelligent, editorial and gender-neutral.

## 2. Hero carousel

The current static hero must be a three-slide carousel, following the original brief. The carousel is the main routing point for the website.

**Hero imagery reference supplied with these notes:** [Google Drive folder](https://drive.google.com/drive/folders/1aMTzESXnbHW-lFGvYRLm41EuYsrl6De2?usp=sharing). Please verify the link if it does not open; the URL in the pasted notes appeared to contain a line-break/space in the folder ID.

### Fixed on every slide

At the top:

**THE AFRICA PLUG: YOUR CONNECTION TO AFRICA**

Directly underneath:

**Investment • Business • Entertainment**

Above the buttons:

**Where do you want to plug in?**

### Slide 1 — Work With FK

**Statement:**  
I'M BUILDING BUSINESS IN AFRICA.

**Supporting line:** Keep it short and make clear that this route is for businesses entering an African market, expanding into another African market, or already operating in Africa and dealing with a commercial challenge or opportunity. It must not become a paragraph.

**Image direction:** Real business/commercial activity, for example FK in a meeting, people around a table, a real commercial discussion, negotiation, a project or site environment, or FK visibly working. It should feel like business being done, not generic corporate stock photography.

**Active button:** WORK WITH FK →

This is the pink/active button on Slide 1.

### Slide 2 — TAP IN

**Statement:**  
I'M LOOKING FOR AN OPPORTUNITY.

**Supporting line:** Keep it short and make clear that TAP IN contains active business and investment opportunities that relevant people or organisations may be able to participate in.

**Image direction:** Real commercial opportunity or industry at scale, such as equipment, infrastructure, agriculture, logistics, construction, energy, industrial projects or commercial assets.

**Active button:** TAP IN →

This is the pink/active button on Slide 2.

### Slide 3 — Ask The Africa Plug

**Statement:**  
I HAVE A QUESTION.

**Supporting line:** Keep it short and make clear that Ask The Africa Plug is for somebody trying to understand something about Africa, a market, place, issue or opportunity.

**Image direction:** The wider TAP world: people, place, culture, business, travel, on-the-ground Africa and the wider TAP experience.

**Active button:** ASK THE AFRICA PLUG →

This is the pink/active button on Slide 3.

### Buttons

All three buttons must remain visible on every slide and in this order:

1. WORK WITH FK →
2. TAP IN →
3. ASK THE AFRICA PLUG →

The button connected to the current slide is highlighted in TAP pink. The other two remain neutral/outlined. When the carousel moves, the active button changes with it. Visitors must not have to wait for a particular slide before accessing one of the three routes.

### Hero image and text treatment

- No text baked into photographs.
- All hero copy remains live website text.
- Supporting lines remain live text.
- Location captions remain live text.
- Each slide has a desktop image.
- Each slide has a separate mobile crop.
- Images can be replaced later without rebuilding the carousel.
- Keep a small, subtle location treatment, for example **Lagos, Nigeria**, styled like a location/map caption.

The imagery should follow the direction for each slide above. Image assets are to be managed/uploaded through the admin experience; do not bake wording into the images.

### Carousel behaviour

- Auto-advance approximately every 6–7 seconds.
- Pause on hover on desktop.
- Visible pause/play control.
- Manual previous/next controls.
- Keyboard accessibility.
- Reduced-motion support.
- No autoplay sound.

### Mobile

- Use a dedicated mobile crop; do not simply shrink the desktop image.
- Buttons may stack vertically.
- The active route remains pink.
- Text must stay readable.
- Important parts of each photograph must not be hidden by the copy.

## 3. TAP IN — opportunity management

TAP IN must be a proper opportunity-listing system, not a static page.

I need to manage changing TAP IN content, including:
- Add listing
- Edit listing
- Publish listing
- Close listing
- Archive listing

Each listing needs:
- Title
- Country and/or region
- Sector
- Opportunity type
- Description
- Who this is for
- 2–4 custom enquiry questions
- Status

Allowed back-end statuses:

**Draft / Live / Closed / Archived**

These status values are for the back end and must not be displayed publicly.

### No public posting dates

Do not show public posting dates on TAP IN opportunities. An opportunity that remains active should not look stale merely because it has been on the website for a few months.

### Principal confidentiality

Do not name the principal behind an opportunity unless I specifically decide to include them. “Who This Is For” should help visitors decide whether they are relevant without revealing the party behind the listing.

### Individual URLs and closed opportunities

Every opportunity needs its own URL. That URL must continue to work after the opportunity closes because it may already have been shared through LinkedIn, WhatsApp or elsewhere.

When an opportunity closes:
- Keep its URL working.
- Remove the Express Interest form.
- Do not show a prominent public “Closed” label.
- Route the visitor towards current opportunities instead.

## 4. TAP IN filters

Build filtering functionality for:
- Region
- Country
- Sector
- Opportunity type

Filters do not need to appear publicly while there are only a few listings. Once there are enough listings for filtering to be useful, they should appear. Ideally, the threshold should be configurable rather than permanently hard-coded.

On mobile, filters may sit inside a filter drawer.

## 5. TAP IN — Expression of Interest

The Expression of Interest form must automatically record which listing the person is responding to.

Confirmation message:

> Thanks, The Africa Plug has received your expression of interest in [listing].

### Consistent claims about live opportunities

The homepage currently presents TAP IN as containing live/vetted opportunities while the TAP IN page says current cards are not live or verified. These claims must match.

Only genuinely live opportunities may be presented as live opportunities. Do not create fictional opportunities simply to populate the design.

## 6. Work With FK

Keep the original agreed Work With FK journey. It must not become a standard enquiry/contact form.

The journey remains:

**Application → Review → Approval → Deposit → Private Scheduler → Balance Payment → Meeting**

The original rules must remain in place, including:
- Approval before payment
- Deposit credited towards the meeting fee
- Handling of declined applications
- Invoice option

Using `fk@theafricaplug.com` behind the scenes for qualified applications is acceptable. Do not display this address publicly on the website.

## 7. Editing and changing content

I understand that the general fixed website page copy and images will not all be editable by me. That is acceptable. Areas that change regularly need to be manageable without rebuilding the site.

### Blog management

I need to manage:
- Articles
- Article images
- Categories/tags
- SEO title
- SEO description
- Share image

### TAP IN management

I need to manage opportunity listings and their statuses as described in Sections 3–5.

### Store management

I need to manage:
- Products
- Product images
- Prices
- Product descriptions
- Digital files where applicable

### Work With FK settings

The commercial settings already discussed should remain easy to update, including:
- Relevant fees
- Meeting duration
- Availability
- Booking/cancellation wording

## 8. STORE, not BOOKSTORE

The current page says BOOKSTORE. Change the wording to:

**STORE** or **THE STORE**

This is not intended to be a bookstore. The Store will eventually contain:
- Ebooks
- Playbooks
- Reports
- Stay Finder
- Other TAP products

Remove bookshelf language from the homepage.

## 9. Store content

The current demo catalogue and placeholder prices must not remain at launch. It is preferable to launch with one genuine, finished product initially: the **Africa Starter Guide**, rather than populating the Store with fictional products.

Keep the Store structured so additional products can be added easily later.

Before launch, remove:
- Demo product names
- Demo prices
- Placeholder products
- Demo checkout wording
- Messaging that checkout/delivery is not connected

Do not represent payments or delivery as operational until they genuinely work and have been tested.

## 10. Homepage placeholder/demo content

Remove remaining content that exists only to demonstrate the template, including:
- Africa Playbook/bookshelf demo section
- Demo books/products
- Placeholder stories
- Placeholder testimonial
- Other obvious demo/template content

Real TAP material will replace these. **The Selected Work section should remain** and will eventually contain genuine NDA-safe commercial examples.

## 11. Blog

The Blog structure is fine. The current demo/explainer articles are not the final TAP editorial content and will be replaced with the actual launch articles.

Keep:
- Written articles
- Tags/categories
- Individual article URLs
- SEO title/description
- Share image
- Searchability
- RSS feed

The Blog is for TAP written editorial, not a video library.

## 12. Navigation

Check navigation across the entire website, not only the homepage.

The main navigation should be:

**TAP IN | WORK WITH FK | STORE | BLOG | CONTACT | ABOUT**

### Home

Remove Home from the navigation. The TAP logo should take the visitor back to the top of the homepage.

### Consistency

Navigation must be consistent across:
- Homepage
- TAP IN
- TAP IN listing pages
- Store
- Product pages
- Blog
- Article pages
- Work With FK
- Contact
- About

The Store must not have a different or reduced navigation compared with the rest of the site.

## 13. Footer and retired wording

Remove these old template categories:
- Discover
- Understand
- Access
- Media

Also remove:
- Welcome/Home
- X/Twitter
- Repeated old pillar wording

The retired line below must no longer be used anywhere on the website or in metadata:

**Business • Investment • Culture • Travel • Lifestyle • Opportunity**

Where the positioning line is needed, use:

**Investment • Business • Entertainment**

## 14. Forms and routing

Keep the form structure and routing already agreed.

### Contact

The Contact area should visibly show:

**connect@theafricaplug.com**

It should also show the agreed WhatsApp and LinkedIn links. On mobile, WhatsApp must be clickable.

### Ask The Africa Plug

Acknowledgement message:

> Thanks, we review every question and may select yours for research, content or follow up.

### Partner With TAP

Keep the partnership dropdown with these options:
- Sponsorship
- Brand partnership
- Interview / guest
- Event
- Hosting / moderation
- Tourism
- Institutional
- Content collaboration
- Put Us On
- Other

### Form-submission retention

Confirm how website form submissions will be retained so that the business is not completely dependent on an email successfully arriving.

## 15. Email routing

Use this routing:

| Form / enquiry type | Destination |
| --- | --- |
| General / Partnerships / TAP IN | `connect@theafricaplug.com` |
| Ask The Africa Plug | `ask@theafricaplug.com` |
| Qualified Work With FK applications | `fk@theafricaplug.com` |

The `fk@` address must remain behind the scenes only.

## 16. Funnel tracking

Keep the funnel tracking from the original brief rather than implementing only basic page analytics. Capture traffic source and UTM information wherever available.

### Work With FK
- Work With FK click
- Application started
- Application submitted
- Deposit paid
- Meeting booked

### TAP IN
- Listing viewed
- Express Interest submitted

### Store
- Product viewed
- Product purchased

### Other
- Partner enquiry
- Ask TAP submission
- Newsletter signup

## 17. Product of the Month

Product of the Month was included as a future Store feature. It does not need to be visible at launch and may remain switched off.

When activated, it should support:
- One partner/external product
- TAP write-up
- Discount code where applicable
- External link
- Affiliate disclosure

Required disclosure:

> TAP may earn a commission.

If this cannot fit into the current build, list it as **Phase 2** rather than dropping it.

## 18. Community / WhatsApp waitlist

The community/WhatsApp waitlist does not need to be visible at launch and may remain switched off. If it cannot be included in this build, list it as **Phase 2**.

## 19. Store checkout and delivery — decisions required

Confirm the recommended setup for:
- On-site checkout
- Card payment
- Digital product delivery
- Purchase receipt/invoice
- Protected download link
- Customers being able to access their purchases again

Also confirm how VAT/sales tax on international digital products will be handled. Clarify whether the recommended provider handles:
- Tax calculation
- Tax collection
- Tax reporting

Or whether TAP is responsible for these.

## 20. Stay Plugged In

Confirm the recommended email platform for Stay Plugged In. I need to be able to manage the audience and send newsletters myself without requiring development work each time.

## 21. Current confirmations and questions

Please confirm:

1. Which CMS/system will manage the Blog and TAP IN?
2. Which form tool is recommended for Work With FK?
3. Which scheduling tool is recommended?
4. Which payment tool is recommended?
5. Which of these can begin free or low-cost?
6. How will the company pay-by-invoice option work?
7. Which checkout/protected file-delivery setup is recommended for the Store?
8. How will VAT/sales tax on international digital products be handled?
9. Which email platform is recommended for Stay Plugged In?
10. How will website form submissions be retained?
11. What additional cost, if any, applies specifically to anything above that was not already included in the 30 September brief?
12. What is the updated timeline across the six project stages?

Final handover, post-launch support and revision limits are **not in scope for these current review notes**. They can be revisited closer to launch.

---

## Working sequence and implementation discipline

- Use this document together with the original 30 September brief; requirements not changed here remain governed by that brief.
- Work through Sections **1 to 21 in order**, recording implementation and test status in `roadmap.md`.
- Do not mark a requirement complete merely because a page or component exists. Verify the actual workflow and production behaviour before calling it complete.
- Do not invent opportunities, products, prices, testimonials, client work or other factual content to fill layouts.
- Keep TAP pink as an accent and use the light, warm-stone/off-white visual direction specified in Section 1.
- Keep disabled launch features disabled; record Product of the Month and the community/WhatsApp waitlist as Phase 2 if they are not included in this build.
