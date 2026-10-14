# The Africa Plug Website: CMS Scope and Launch Requirements

**Reference document:** Admin/CMS specification and launch dependencies  
**Added:** 14 October 2026  
**Purpose:** Keep the detailed requirements available for future planning. This document records the target scope; it does not mean every feature described here is already implemented.

> **Repository boundary:** This document belongs to `MrDan001/Africa-Plug` only. Do not copy it into or mix it with `MrDan001/the-africa-plug`.

---

## Part 1 — Everything the Admin/CMS Must Contain

The admin should become the control room for The Africa Plug. Keep the CMS specification separate from the infrastructure and services the whole website needs.

## 1. Dashboard

The first screen after login should show:

- Total applications
- New applications awaiting review
- Approved applications
- Deposits paid
- Meetings booked
- Live TAP IN opportunities
- New TAP IN enquiries
- Blog articles
- Store sales
- Newsletter subscribers
- Partner enquiries
- Ask TAP questions
- Recent activity
- Basic funnel/traffic numbers

Quick actions:

**Add Opportunity · Add Article · Add Product · Review Applications · Edit Homepage**

## 2. Homepage Management

### Hero

Admin can edit:

- Slide 1, Slide 2 and Slide 3
- Hero image and mobile image
- Statement
- Supporting line
- Location caption
- Active CTA
- Slide order
- Enable/disable slide

The exact three locked statements remain the site's approved structure; admin controls the content around them.

### Homepage sections

Admin should be able to edit:

- FK video
- Video poster
- Video captions/subtitles
- Work With FK content
- Selected Work
- Testimonials
- TAP IN preview
- Featured product
- The Africa Plug + Partner With TAP content
- Blog preview
- Contact card
- Ask TAP card
- Stay Plugged In
- Social links
- Closing/sign-off content

### Module switches

Every optional module needs an ON/OFF control:

- Testimonials
- Selected Work
- Product of the Month
- Community/WhatsApp waitlist
- Stay Finder
- Future products
- Other future modules

This is important because functionality may be built before it launches.

## 3. TAP IN Management

### Opportunity list

Admin can:

- View all opportunities
- Search and filter
- Create and edit
- Duplicate
- Preview
- Archive
- Close
- Restore

### Opportunity fields

Each listing needs:

- Title
- Country/region
- Sector
- Opportunity type
- Description
- Who this is for
- Custom enquiry questions
- Images
- Share image
- Slug/URL
- SEO title
- SEO description
- Status

### Status

Admin-only statuses:

**Draft · Live · Closed · Archived**

Visitors never see the status label.

### Custom questions

FK must be able to add, remove and edit questions without a developer. For example, Question 1, Question 2 and Question 3 should automatically appear on that listing's Expression of Interest form.

## 4. TAP IN Enquiries

Admin should have access to all expressions of interest, with the listing attached automatically. Each submission should include:

- Applicant name
- Company
- Email
- Phone/WhatsApp
- Country/project location
- Role
- What they can provide/need
- Custom answers
- Submission date
- Source/UTM information
- Submission status

An admin can open an enquiry and see the complete submission.

## 5. Blog Management

### Article manager

- All articles
- Drafts
- Published
- Search
- Tags
- Categories
- Featured article
- Scheduled publishing, if supported

### Article editor

FK can edit:

- Title
- Body
- Hero image
- Share image
- Author
- Tags
- Excerpt
- SEO title
- SEO description
- Canonical URL
- Slug

### Blog settings

- Featured/selected articles
- Tags
- Search
- RSS
- Sharing information

## 6. Store Management

### Product manager

- Add product
- Edit product
- Remove/archive product
- Price
- Product image
- Description
- Category
- Digital file
- SEO
- Share image
- Featured product

### Store settings

- Featured product
- Product of the Month
- Discount code
- Affiliate link
- Affiliate disclosure
- Product availability

## 7. Work With FK Management

This will probably be one of the most important admin areas.

### Applications

Admin sees:

- New applications
- Applications under review
- Approved
- Declined
- Closed

### Application details

- Applicant
- Company
- Role
- Country/market
- Project/mandate
- Requirements
- Timeframe
- Budget
- Submission date
- Source/UTM

### Actions

Admin can **Approve** or **Decline**. That action triggers the appropriate email workflow.

## 8. Work With FK Commercial Settings

These must not be hard-coded. Admin must control:

- Deposit amount
- Full meeting fee
- Meeting length
- Calendar availability
- Payment instructions
- Invoice option
- Refund wording
- Cancellation wording
- No-show wording
- Rescheduling rules
- Meeting type

This is one of the strongest requirements in the brief.

## 9. Payments

Admin should be able to see:

- Deposit payments
- Balance payments
- Payment status
- Failed payments
- Pending payments
- Invoice payments
- Refunds
- Order/payment reference
- Applicant/customer
- Amount
- Date

## 10. Scheduling

Admin needs:

- Calendar availability
- Working hours
- Available meeting lengths
- Blackout dates
- Booking status
- Upcoming meetings
- Rescheduled meetings
- Cancelled meetings

## 11. Enquiries Management

A central inbox-style area should handle:

- Contact: General
- Contact: Partnerships
- Contact: Press
- Contact: Events
- Partner With TAP
- Ask The Africa Plug
- TAP IN

Each enquiry should show:

- Name
- Organisation
- Email
- Phone, when relevant
- Source/page/listing
- Submission date
- Message
- Status

## 12. Newsletter / Subscribers

Admin can see:

- Subscriber count
- Sign-ups
- Source
- Signup date
- Email platform status

The actual marketing automation can remain inside the email provider, while TAP admin retains useful records/status.

## 13. Testimonials

Admin can:

- Add
- Edit
- Remove
- Reorder
- Turn on/off

Fields:

- Quote
- Name, if approved
- Job description
- Sector
- Region
- Approved status

The brief specifically says approved job descriptions only, so that should be respected in the CMS.

## 14. Selected Work

Admin can manage:

- Sector
- Region
- Mandate
- FK's role
- Description
- Image
- Order
- Visibility

**Do not display client names.**

## 15. Contact / Site Settings

Admin controls:

- connect@
- ask@
- Social links
- WhatsApp
- LinkedIn
- Contact details
- Footer text
- Footer links
- Site-wide settings

**Important:** fk@ must remain hidden from the public UI.

## 16. SEO Management

Admin should be able to edit:

- Site title
- Meta description
- Article SEO
- Opportunity SEO
- Product SEO
- Canonical URL
- Open Graph title
- Open Graph description
- Share image
- Favicon, where appropriate
- Robots settings, if exposed
- Sitemap-related settings, where appropriate

## 17. Media Library

Admin should have:

- Images
- Hero images
- Mobile crops
- Blog images
- Opportunity images
- Product images
- Video
- Poster images
- Downloadable digital files

Ideally, the library also supports:

- File preview
- File replacement
- File deletion
- Alt text
- Image dimensions
- File size

## 18. Analytics

Admin doesn't necessarily need to reproduce the full analytics platform, but should have a useful overview of:

- Work With FK clicks
- Applications started
- Applications submitted
- Deposits paid
- Meetings booked
- TAP IN views
- Expressions of interest
- Product views
- Purchases
- Partner enquiries
- Ask TAP submissions
- Newsletter signups
- UTM/source information

## 19. Admin Users & Security

At minimum:

- Admin login
- Secure session
- Logout
- Password management
- Protected admin routes

Later, potentially:

- Multiple admins
- Roles/permissions
- Audit log
- Last login
- Admin activity

## 20. Settings / Feature Flags

One central area where FK can switch modules:

| Module | State |
| --- | --- |
| Testimonials | ON/OFF |
| Selected Work | ON/OFF |
| Product of Month | ON/OFF |
| Community Waitlist | ON/OFF |
| Stay Finder | ON/OFF |
| Future Products | ON/OFF |
| Search | ON/OFF |
| Newsletter | ON/OFF |

This mechanism lets the team build features now and launch them later.

---

## Part 2 — What the Whole Website Cannot Realistically Launch Without

### A. A real CMS needs a content/data backend

The repo does not yet have the full CMS specified above. The existing `/admin` is currently focused on homepage-video publishing.

A persistent content/data system is needed for:

- Pages
- Hero slides
- Opportunities
- Articles
- Products
- Applications
- Enquiries
- Testimonials
- Selected Work
- Settings
- Feature flags
- Other site content and records

### B. The Work With FK funnel needs a payment system

A real payment provider is needed to support:

**Approval → Deposit → Scheduler unlock → Balance**

Ideally, it should also support a company invoice route. Without this, the most important commercial funnel cannot operate.

### C. Scheduling must be unlocked securely after payment verification

The system needs reliable payment confirmation. It must not treat “the person clicked Pay” as proof of payment.

The required logic is:

**Payment confirmed → unlock scheduler**

### D. Funnel automation needs transactional email

An email system is needed for:

- Application received
- Approval
- Decline
- Deposit request
- Payment confirmation
- Booking confirmation
- Enquiry confirmation
- Store delivery
- Other required notifications

### E. Newsletter needs an email marketing platform

The brief requires a signup system, so an email provider/account must sit behind it.

### F. Digital products need file storage and delivery

The Africa Starter Guide needs secure delivery after purchase:

**Payment confirmed → file access/delivery**

Delivery should include appropriate protection against uncontrolled public distribution.

### G. VAT/tax requires a defined tax and commercial setup

This needs a final business decision about:

- Where TAP is selling from
- Customer locations
- VAT treatment for digital goods
- Tax calculation
- Tax records
- Invoicing/receipts

A payment or commerce provider may handle some of this, but the actual setup still has to be chosen and configured correctly.

### H. Legal/payment launch needs final commercial decisions

The brief leaves some decisions open. These must be finalized rather than guessed in production:

- Deposit amount
- Meeting fee
- Meeting length
- More-than-24-hour cancellation
- Rescheduling policy
- No-show treatment
- Balance treatment
- Refund conditions

### I. Final visual implementation needs TAP brand guidelines

The exact colours, typography and brand rules are still to come separately. The visual shell can be built now, but the final brand-accurate implementation needs those guidelines.

### J. Homepage video experience needs the final video/content package

The repo already has infrastructure for homepage video, but the final brief requires:

- 40–60 second video
- Captions
- Poster
- Final approved copy

### K. TAP IN needs real opportunity content

The excavator and honey details are to follow. The system can be built before they arrive, but real listings need:

- Descriptions
- Geography
- Sector
- Opportunity type
- Who it's for
- Custom questions
- Images

### L. Blog launch needs actual content

The system can be built, but launch still needs:

- Articles
- Tags
- Images
- Author information
- SEO metadata
- Share images

### M. Store launch needs the actual product file and details

The Africa Starter Guide needs its:

- Cover
- Product description
- Price
- Downloadable file
- Delivery rules

### N. Legal launch needs the legal texts

The brief says these will be provided during the content phase:

- Privacy
- Terms
- Cookies
- Deposit & Refund Terms

These should not be invented as final legal copy.

### O. Final SEO setup needs webmaster services access

Launch setup requires the appropriate configuration and verification for:

- Google Search Console
- Bing Webmaster Tools

### P. Analytics needs an analytics platform/property

The event architecture can be defined now, but the actual tracking destination has to exist to complete the exact analytics requirement.

### Q. Contact and social links need final details

The UI can be built, but production contact/social links still need confirmation, including WhatsApp and LinkedIn.

---

## Part 3 — Absolute Must-Have Launch Stack

At minimum, the final TAP site needs:

| Area | Requirement |
| --- | --- |
| Website | Next.js / Vercel |
| Content | CMS/database |
| Admin | Secure admin/CMS |
| Forms | Form processing + spam protection |
| Email | Transactional email |
| Newsletter | Email marketing platform |
| Payments | Card payments + invoice route |
| Scheduling | Private scheduler unlocked after payment |
| Store delivery | Digital-file storage/delivery |
| Analytics | Funnel/event tracking |
| SEO | Metadata + sitemap + structured data |
| Legal | Privacy/terms/cookies/deposit terms |
| Cookie consent | UK-compliant consent mechanism |
| Search | Blog + TAP IN only |
| Sharing | Open Graph + RSS/share workflow |
| Monitoring/testing | Desktop + mobile QA |

---

## Important Observation About the Repo

The existing project is not yet at the complete CMS stage. The inspected setup is a Next.js app with the homepage, styling, a basic `/admin` area, admin authentication, and Vercel Blob video publishing. The current admin's main purpose is replacing/publishing the homepage video, rather than managing the complete TAP business system.

The next major conceptual step is not simply “build more pages.” It is:

> **Turn the current prototype into a real TAP platform with a CMS and connected business workflows.**

That is the point where the project becomes the website described in the 13-step brief rather than only a redesigned front end.

---

**Reference status:** Keep this document as planning documentation. Do not treat every listed capability as implemented, and do not change scope or production behavior solely by adding this file.
