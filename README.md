# Holiday Inn Kolkata Airport — Website (Jain Group build)

A static clone of the Holiday Inn Kolkata Airport hotel microsite
(https://www.ihg.com/holidayinn/hotels/us/en/kolkata/ccuap/hoteldetail), rebuilt
from scratch as plain HTML/CSS/JS with all photos and icons downloaded locally
(no hotlinking to ihg.com).

## How to open it

Double-click `index.html` to preview locally — it's a fully static site, no
build step needed to browse it. **The booking-enquiry form only works once
the site is hosted at a real https:// address** (see below) — that's a
requirement of the email service it uses, not something that can work from a
local file. Everything else (photos, layout, nav, gallery) works locally too.

## Pages included

- `index.html` — Overview / Home (the only page with the booking widget — see below)
- `offers.html` — Offers
- `rooms.html` — Rooms
- `amenities.html` — Amenities (also includes general hotel policy details:
  check-in/out, accepted cards, accessibility, etc. — the real site doesn't
  have a separate "Policies" page, this info lives on the Amenities page there too)
- `dining.html` — Dining
- `local-area.html` — Local Area
- `events.html` — Groups & Events
- `photos.html` — Photos, organized into the same 5 sections as the real site
  (Hotel / Rooms / Amenities / Dining / Groups & Meetings), with quick-jump
  links at the top and a click-to-zoom lightbox
- `thank-you.html` — Shown after a booking enquiry is submitted

The IHG logo in the header links to `index.html` only, from every page.

## Hosting on GitHub Pages (or any static host)

Yes — email will still work. This is a plain static site (no server, no
database), and the booking form sends mail via FormSubmit purely from the
visitor's browser (a background request straight to formsubmit.co), so it
doesn't matter what's hosting the HTML/CSS/JS files. GitHub Pages serves
everything over `https://`, which is all FormSubmit needs. The only setup
step is still the one-time confirmation email described below — that's
tied to your **ai@thejaingroup.com** inbox, not to where the site lives, so
it's a one-time thing regardless of which host you pick.

## SEO & sitemap

Added the standard technical SEO foundation:

- **`robots.txt`** and **`sitemap.xml`** at the site root, listing all 8
  real pages (Thank You is deliberately excluded and marked `noindex` —
  it's a transactional page reached only after a form submit, not something
  search engines should send people to directly).
- **Canonical tag** on every page (prevents duplicate-content issues, e.g.
  between `/` and `/index.html`).
- **Open Graph + Twitter Card tags** on every page, so links shared on
  Facebook/WhatsApp/X/etc. show a proper title, description and image
  instead of a bare link.
- **Hotel structured data** (schema.org JSON-LD) on the homepage — this is
  what lets Google potentially show a richer result (amenities, price
  range, star rating box) instead of a plain blue link. It includes the
  address, phone, coordinates, amenities and your social profiles.
- Once the site is live, submit `sitemap.xml` in Google Search Console
  and Bing Webmaster Tools — that's the one step I can't do for you, since
  it needs your own account.

## Google Tag Manager

Your GTM container (`GTM-P3Q3MG9C`) is installed on **every page, including
the Thank You page** — the loader script is the first thing in `<head>`,
and the `<noscript>` fallback sits right after the opening `<body>` tag, on
all 9 pages. Nothing else to configure on the code side; manage tags/
triggers as usual from the GTM dashboard.

## Booking widget & enquiry form

There is now exactly **one** booking widget on the whole site, on the Home
page, right under the hero (Arrival / Departure / Rooms & Guests). On every
other page, the header's "Best Rates Guaranteed" and "Book Now" jump you to
the Home page and scroll straight to it.

- Clicking **Book Now** inside that widget opens the contact-details popup
  (Name, Phone, Email + a consent checkbox, checked by default).
- Clicking **Book Now** on an individual offer/room card, or **Enquire Now**
  on the Groups & Events page, opens that same popup **directly** — it
  doesn't send you back to the widget first, since you've already told it
  what you're interested in.
- Every field is validated as you'd expect: the name field rejects numbers/
  symbols, the phone field only accepts exactly 10 digits (no letters,
  spaces or symbols — anything else is stripped out as you type), and the
  email field requires a real `name@domain.tld` shape. Nothing gibberish
  gets through.
- On submit, the enquiry is sent to **ai@thejaingroup.com** in the
  background, then you're taken to the Thank You page — same tab
  throughout, no popup window, and the address bar never leaves your own
  site. If the background send fails for any reason, a pre-filled email to
  ai@thejaingroup.com opens instead, again in the same tab.

### Required setup: one email confirmation click (that's it)

The form uses [FormSubmit](https://formsubmit.co) to deliver mail —
deliberately chosen because it needs **no account, dashboard, or API key**,
unlike most alternatives. Since you said this site will be hosted on a real
domain, this is the simplest option: nothing to configure in the code at all.

The only thing that has to happen once the site is live: the very first time
someone submits the enquiry form, FormSubmit sends an activation email to
**ai@thejaingroup.com** asking to confirm you own that inbox. Click the
confirmation link in that one email, and every submission after that
(including that very first one) delivers automatically, with no further
setup. I could not click that confirmation link for you, since it has to
come from your own inbox.

If you'd rather not wait for real traffic to trigger that first email, just
open the site live and submit the form yourself once with test details.

## Enquiries are now also recorded in a Google Sheet

Every enquiry/booking still emails `ai@thejaingroup.com` (CC
`pritesh.zavery@ihg.com`) exactly as before — and now *also* appends a row to
a Google Sheet, with these columns:

| Timestamp | Arrival | Departure | Enquiry Type | Rooms | Guests | Form Page | Full Name | Number | Email | Location |
|---|---|---|---|---|---|---|---|---|---|---|

`Location` is deliberately left blank for the team to fill in by hand — it's
tinted cream in the sheet so it reads as a manual column. Everything else is
filled automatically. `Timestamp` is taken server-side, not from the
visitor's device clock.

The sheet arrives pre-formatted: brand-green frozen header row, a filter on
every column, sensible column widths, real date cells (so Arrival/Departure
sort and filter properly), phone numbers stored as text so a leading `0`
survives, alternating row shading, and colour-coded Enquiry Types.

**This needs one setup pass in your own Google account** — a static site has
nowhere safe to keep a Google credential, so the sheet exposes a small Apps
Script "Web App" URL that the site posts to instead. Full step-by-step
instructions and the script itself are in
[`_dev/google-apps-script/README.md`](_dev/google-apps-script/README.md).
Until that URL is pasted into `js/config.js`, sheet logging is simply skipped
and the email keeps working exactly as it does today — the form never breaks
because this isn't wired up yet.

The sheet is shared with the four teammates automatically as part of that
setup (`TEAM_EMAILS` in the script) — their addresses still need filling in.

## "Book Now" now routes differently depending on where it was clicked

| Where the guest clicks | What happens | Enquiry Type recorded |
|---|---|---|
| **Rooms** page → Standard Rooms → Book Now | Goes to the **booking widget** on the Home page first (dates, rooms, guests), *then* the contact-details form | `Enquiry for Standard Room` |
| **Rooms** page → Suite → Book Now | Same — widget first, then contact details | `Enquiry for Suite` |
| Header / mobile bar → **Book Now** | Scrolls to the booking widget, then contact details | `General Enquiry` |
| **Groups & Events** → Enquire Now | Straight to contact details (no dates asked) | `Groups & Events` |
| An offer card → Book Now | Straight to contact details | `Offer Enquiry` (offer name in *Interested In*) |

The room you clicked is shown as a small "Enquiring about: Standard Room"
line inside the widget, so the detour via the date picker doesn't feel like
it lost your place. That intent is cleared the moment it's used, and also
cleared if you then click the general header "Book Now" instead — so a room
enquiry can never leak into an unrelated later submission.

Arrival, Departure, Rooms and Guests are blank in the sheet for the two
flows that never go through the widget (Groups & Events, offer cards), rather
than being filled with "Not specified" padding.

## Booking widget date fields — mobile fix and restyle

The Arrival and Departure fields were pushing out through the side of the
white card on phones, and were awkward to tap. Both had the same root cause:
a bare `<input type="date">` isn't a normal text box — every mobile engine
gives it an intrinsic minimum width sized to the widest possible date string
plus its own picker button, and iOS Safari treats that as a hard floor that
`width: 100%` can't pull below. As a flex child it then refused to shrink and
overflowed the card.

Fixed by removing both the flex floor (`min-width: 0`) and the platform's
intrinsic sizing (`appearance: none`), so the fields now obey their container
at every width — verified contained with no page overflow at 320px, 375px and
desktop.

Since stripping the native appearance also strips the platform's calendar
button, the fields are now drawn properly instead: a brand-green calendar
icon on the right, matching borders, a green hover and focus ring, and the
same height as the Rooms & Guests control beside them. Tapping **anywhere**
on the field opens the native date picker — previously only the narrow date
text itself was reliably tappable, which is what made them feel unresponsive.

## What I changed in the newest round of feedback

- **Footer copyright line updated** on all 9 pages to "© 2026 IHG. All
  rights reserved. Most hotels are independently owned and operated." —
  replacing the previous "Holiday Inn Kolkata Airport is independently
  owned and operated. Site built for Jain Group." line.
- **Overview is now one short paragraph instead of two.** After shrinking
  the font size twice (16px → 14.7px → 13.6px) still felt like a lot of
  text on a phone, the real fix was just less copy: merged both paragraphs
  into a single tighter one that keeps the key facts (137 rooms, 4.7 km
  from CCU Airport, New Town/Salt Lake Sector V access, rooftop pool,
  24-hour fitness center, two restaurants, travel desk) without the extra
  wording padding it out. Checked on both mobile and desktop — the
  two-column layout still balances fine against the pool photo.
- **Removed the little icon in front of the tagline, and fixed its mobile
  centering.** The icon sat to the left of the tagline text in a row, which
  meant that once the text wrapped onto a second line on narrow phones, the
  wrapped block was centered relative to the space *after* the icon, not
  the actual screen — so it visually looked shifted off-center. With the
  icon gone, the tagline is now genuinely centered at every width (checked
  320px through desktop).
- **Enquiry emails now also CC a second inbox** — `pritesh.zavery@ihg.com`,
  alongside the primary `ai@thejaingroup.com` — configurable in
  `js/config.js` (`CC_EMAIL`). We looked at moving off FormSubmit entirely
  onto Gmail so the email would visibly show as sent "from Holiday Inn,"
  but that needs a real mailbox the hotel controls (Gmail/Workspace
  account or similar) plus a small backend to hold its credentials, which
  isn't in place yet — happy to revisit later if you set one up. FormSubmit
  itself has no way to change the visible sender name (a deliberate
  anti-spoofing restriction on every free form-to-email relay, not
  something fixable via configuration) — the subject line and email body
  already say "Holiday Inn Kolkata Airport" clearly, which is the most it
  can offer.
- **Tagline + rating now share one centered section with a divider,**
  between the booking widget and Overview. The tagline briefly lived inside
  the Overview container itself, left-aligned to match that section's text
  column — too small and easy to miss. It's back out on its own again:
  "Just 10 Minutes from Kolkata Airport" centered and bigger, a short gold
  divider line underneath, then the guest rating (stars, "4.3/5", "Guest
  Rating") centered below that, all inside one dedicated section rather
  than tucked into someone else's container.
- **The enquiry email now looks genuinely different for a Booking vs. an
  Enquiry, instead of the same messy table every time.** Previously every
  submission emailed the same five rows regardless of type, so a real
  booking (with real dates) showed a "General enquiry" row that didn't
  apply, and an offer/room/event enquiry (no dates picked) showed three
  "Not specified" rows that didn't apply either — plus the row labels
  themselves were raw field names like `Rooms_and_Guests` and
  `Offer_or_Room`. Now: a booking-widget submission emails Enquiry Type,
  Arrival Date, Departure Date, Rooms & Guests, Submitted From Page, Full
  Name, Phone Number, Email Address; an offer/room/event "Enquire Now"
  emails Enquiry Type, Interested In, Submitted From Page, Full Name, Phone
  Number, Email Address — no irrelevant rows either way, clean human-
  readable labels throughout, and the email subject line itself now says
  "New Booking Request" or "New Enquiry (Offer Name)" instead of always
  reading "New booking enquiry."
- **Favicon swapped to the real Holiday Inn "H" mark.** The previous fix
  used the navy IHG corporate square (since the URL lives under
  ihg.com/holidayinn/...) — turns out that was the wrong one. It's now the
  brand's own green rounded-square icon with the white "H" mark, pulled
  from Holiday Inn's own cached site icon (verified identical across three
  independent icon-lookup services, so it's the genuine asset, not a
  recreation).
- **"Book Now" no longer lands on the Overview section.** Root cause: the
  navbar is sticky (pinned to the top of the screen), so scrolling the
  booking widget's top edge to the very top of the screen meant the sticky
  header was then sitting on top of it, hiding most of the widget and
  leaving the Overview section as the first fully-visible thing below the
  header. Every "Book Now" / "Best Rates Guaranteed" button (header, mobile
  bottom bar) now scrolls to a position that clears the header's actual
  height first, on both desktop and mobile.

## What I changed in an earlier round (sticky nav, hamburger X, GTM)

- **Navbar is now actually sticky.** Root cause: `position: sticky` was set
  on the inner header row, but its direct parent was exactly the same
  height as it, leaving it nowhere to "float" — so it just scrolled away
  like normal content. Moved the sticky positioning to the outer header
  element instead; verified it stays pinned to the top through a full page
  scroll, on both desktop and mobile.
- **Hamburger now turns into an X when opened**, and back into the hamburger
  when closed. Also fixed a real bug this surfaced: the icon was briefly
  unclickable while the menu was open (the slide-in panel was stacking on
  top of it) — fixed the stacking order so the button (and its X) stays on
  top and clickable at all times.
- **The "blue highlight on tap" is gone.** That was the browser's default
  tap-highlight box flashing on every tap on mobile; turned it off site-wide
  and replaced the default focus outline with a subtler brand-green one
  (still visible for keyboard users, just not a jarring blue flash on tap).
- **Found and fixed the real cause of the "no margin" complaint:** the
  header row and the hero's text block were each accidentally cancelling
  out their own left/right padding with a shorthand CSS rule meant only to
  set spacing above/below. Logo, hamburger, hero heading and hero text all
  now sit with proper breathing room from the screen edges at every width —
  confirmed by measuring their exact position in pixels, not just eyeballing it.
- **Home page booking widget on mobile, no longer stretched out:** the
  Arrival / Departure / Rooms & Guests fields were each rendering ~200px
  tall on phones (a CSS rule meant to size their *width* in the desktop
  layout was accidentally sizing their *height* once they stacked into a
  column) — each field is back to its natural ~75px height with a normal
  gap between them.
- **Long, unbreakable text (emails, an oddly-formatted phone number) no
  longer forces any card to overflow** — added a site-wide safety net so
  this class of bug can't resurface in a card I haven't specifically tested.
- **Hero sections trimmed down** to shorter, punchier copy on Home, Rooms,
  Dining and Groups & Events, so there's less text competing with the photo
  behind it — especially on phones, where the hero is already shorter.
- **Google Tag Manager installed** (`GTM-P3Q3MG9C`) on all 9 pages, head
  script and body `<noscript>` fallback both in place — see the section
  above.

## What I changed in the round before that

- **Header strip removed:** the phone number / "My stays" / "Join for free" /
  "Sign in" line above the main nav is gone completely — nothing replaces it.
- **Booking email fixed for real this time:** the form no longer does a
  native browser submit to FormSubmit (that's what showed the raw
  `https://formsubmit.co/ai@thejaingroup.com` address when you tested it).
  It now sends the enquiry in the background and only ever navigates you to
  `thank-you.html`, so the address bar always stays on your own site. If
  that background send ever fails, it opens a same-tab pre-filled email to
  **ai@thejaingroup.com** as a fallback — no popup window.
- **"Reservations" reverted:** removed "Front Desk Reservations" everywhere
  (footer, Home, Amenities, Local Area) and put back the original plain
  "Reservations" label, per your note that the merge wasn't wanted after all.
- **Phone field:** now hard-limited to exactly 10 digits — letters and
  symbols can't even be typed in, and anything pasted in gets stripped down
  to digits automatically.
- **Hamburger menu / header responsiveness, actually fixed:** the previous
  breakpoint (860px) was too narrow for how much the header holds (logo + 7
  links + two buttons), so the nav would wrap onto a messy second line
  before the hamburger ever kicked in. The switch to the hamburger menu now
  happens earlier, at 1180px, so that wrap never happens — verified with
  screenshots at every width from 320px to 2560px, no wrapping at any point.
- **Mobile header redesign, as requested:** below 1180px width, the top bar
  shows only the logo and the hamburger icon — nothing else. "Best Rates
  Guaranteed" and "Book Now" now live in a new bar fixed to the bottom of
  the screen instead, always visible without scrolling back up.
- **Amenities-card "cropping", root cause found and fixed:** the General
  Hotel Details table had a genuine bug — the email address
  (reservations@holidayinnkolairport.com) was long enough to get clipped
  instead of wrapping inside its cell on narrower screens. Fixed by letting
  table cells wrap long text instead of forcing it into a fixed-width
  column.
- **Local Area map/details and Groups & Events, unresponsive layout fixed:**
  same underlying issue as above — the address-card grid could be forced
  wider than its column by long, unbreakable text (the events-page email
  address in particular). Grid columns and card text now always shrink to
  fit and wrap instead of overflowing.
- **Hero section responsiveness:** reduced the hero's minimum height and
  padding on small phone screens so the heading and intro text don't feel
  oversized or cramped edge-to-edge.

## What I changed in the round before this

- **Email:** switched from EmailJS (needed an account + API keys) to
  FormSubmit (needs nothing but the one-time confirmation click above), and
  fixed the Thank You redirect to stay in the same browser tab throughout.
- **Header:** removed the dark "utility bar" band entirely. The phone number
  and My stays / Join for free / Sign in links now sit in a slim plain line
  above the main white nav bar instead of their own dark strip.
- **Footer:** removed the "Best Price Guarantee" wordmark block; fixed the
  Facebook/X/Instagram icons so they're precisely centered in their circles
  (they're inline icons now, not slightly-off-center downloaded images);
  merged the separate "Reservations" (toll-free) and "Front Desk" lines into
  a single **"Front Desk Reservations"** line everywhere that pairing
  appeared (footer, Home, Local Area, Amenities).
- **Booking flow:** the widget now lives only on the Home page; every other
  page's "Book Now" takes you there first, exactly as you described. Offer/
  room "Book Now" and the Events page's "Enquire Now" still skip straight to
  the contact form.
- **Form:** shrank the oversized agreement checkbox, added real per-field
  validation (see above) with inline error messages instead of one generic
  error.
- **Fonts:** added Playfair Display (headings) and Poppins (body text) from
  Google Fonts, replacing the plain system-font look.
- **Amenities page:** the 9 feature icons now sit in a 5-then-4 "brick"
  layout instead of an uneven wrap; the plain-text amenity sections below
  (Fitness Center, Pool, Parking, etc.) are now individual white cards with
  borders/shadow instead of bare floating text.
- **Photos page:** rebuilt as distinct sections per category (Hotel, Rooms,
  Amenities, Dining, Groups & Meetings) with a heading over each and
  quick-jump pills at the top — matching how the real IHG gallery is
  actually laid out, rather than one flat grid with a JS filter.
- **Responsiveness:** re-verified with no horizontal overflow at any width
  from 320px to 2560px. One clarification on the "zoomed out and it broke"
  note — browser zoom (Ctrl +/-) just magnifies everything uniformly by
  design and isn't what responsive breakpoints react to; resizing the
  browser window (or viewing on an actual phone) is the real test, and
  that's what I verified against.

## What I removed or changed from the real IHG site (from the previous round, still true)

- **Removed:** the "Chat with us" live-chat widget/link.
- **Removed:** the cookie-consent banner (you said cookies aren't required).
- **Removed:** the "Feedback" link that opened IHG's third-party feedback
  tool. In its place, the footer has a **"Send Feedback"** link that opens a
  pre-addressed email to **ai@thejaingroup.com**.
- **Removed:** AdChoices / "Do Not Sell My Info" links (these only make sense
  alongside a cookie/ad-tracking setup, which isn't present here).
- **Kept as external links (open ihg.com in a new tab):** "My stays", "Join
  for free", "Sign in", and the Company/Legal footer links (About IHG,
  Careers, Terms of Use, Privacy Policy, Site Map, App Store/Play Store
  badges) — you confirmed the full IHG-account system is out of scope.
- **Note on the phone number on the Dining page** for Urban Kitchen and Bar:
  the source data I extracted for that one number was inconsistently
  formatted, so I left it exactly as scraped ("91-033-907396354") rather than
  guess at the correct grouping — worth double-checking against the hotel's
  real records before publishing.
- No separate "Guest Reviews" page — the live site's main navigation doesn't
  have one either.

## Folder structure

```
index.html, offers.html, rooms.html, ...   the pages
css/styles.css                              all styling (responsive)
js/main.js                                  nav, booking widget, modal, validation, gallery, lightbox
js/config.js                                the one place to change the destination email address
assets/images/                              all hotel photos (downloaded, not hotlinked)
assets/icons/                               logo, amenity icons, app badges
_dev/                                       the Python scripts used to generate the HTML
                                             pages (not needed to run the site — keep only
                                             if you want to regenerate pages later)
```
