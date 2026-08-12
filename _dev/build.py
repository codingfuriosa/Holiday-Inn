# -*- coding: utf-8 -*-
"""Generates the static Holiday Inn Kolkata Airport clone from shared partials."""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
SITE_ROOT = os.path.dirname(ROOT)

# Live domain, used to build absolute URLs for canonical tags, Open Graph,
# Twitter Cards, JSON-LD structured data, robots.txt and sitemap.xml.
BASE_URL = "https://holidayinnkolairport.com"
DEFAULT_OG_IMAGE = "holiday-inn-kolkata-6541707615-2x1.jpg"

NAV_ITEMS = [
    ("offers.html", "Offers"),
    ("rooms.html", "Rooms"),
    ("amenities.html", "Amenities"),
    ("dining.html", "Dining"),
    ("local-area.html", "Local Area"),
    ("events.html", "Groups &amp; Events"),
    ("photos.html", "Photos"),
]

# Small inline SVGs so social icons are always perfectly centered/aligned,
# regardless of the source artwork's own crop/padding.
SOCIAL_SVGS = {
    "facebook": '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg>',
    "x-twitter": '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M18.24 2.5h3.02l-6.6 7.54 7.77 11.46h-6.08l-4.76-6.96-5.45 6.96H2.9l7.05-8.07L2.5 2.5h6.24l4.3 6.38 5.2-6.38Zm-1.06 17.1h1.67L7.13 4.31H5.34l11.84 15.29Z"/></svg>',
    "instagram": '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.24 2.22.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.36 1.05.41 2.22.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.8-.41 2.22-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.17-1.05.36-2.22.41-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.24-2.22-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.17-.42-.36-1.05-.41-2.22-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85c.05-1.17.24-1.8.41-2.22.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.05-.36 2.22-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56-.79.31-1.46.72-2.13 1.39C1.24 2.7.83 3.37.52 4.15c-.3.76-.5 1.63-.56 2.91C-.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.31.79.72 1.46 1.39 2.13.67.67 1.34 1.08 2.13 1.39.76.3 1.63.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56.79-.31 1.46-.72 2.13-1.39.67-.67 1.08-1.34 1.39-2.13.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.6 5.6 0 0 0-1.39-2.13A5.6 5.6 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-10.85a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z"/></svg>',
}

def build_nav(current):
    links = []
    for href, label in NAV_ITEMS:
        current_attr = ' aria-current="page"' if href == current else ""
        links.append('      <a href="{0}" data-page="{0}"{1}>{2}</a>'.format(href, current_attr, label))
    return "\n".join(links)

def header(current):
    return """
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="site-header">
    <div class="container header-inner">
      <div class="logo-group">
        <a href="index.html" class="logo-link" aria-label="Holiday Inn Kolkata Airport - Home">
          <img src="assets/icons/hi_logo.svg" alt="Holiday Inn by IHG">
        </a>
        <a href="tel:+913366996699" class="call-link" aria-label="Call Holiday Inn Kolkata Airport">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"/></svg>
        </a>
      </div>
      <nav class="main-nav" aria-label="Primary">
{nav}
      </nav>
      <div class="header-cta">
        <button type="button" class="best-rate-link" data-scroll-target="#booking-widget">Best Rates Guaranteed</button>
        <button type="button" class="btn btn-primary" data-scroll-target="#booking-widget">Book Now</button>
      </div>
      <button class="nav-toggle" aria-label="Toggle navigation menu" aria-expanded="false"><span></span></button>
    </div>
  </header>
  <div class="nav-scrim"></div>
  <div class="mobile-book-bar">
    <div class="mbb-label">Best Rates Guaranteed</div>
    <button type="button" class="btn btn-primary btn-block" data-scroll-target="#booking-widget">Book Now</button>
  </div>
""".format(nav=build_nav(current))

def booking_widget():
    return """
  <div class="booking-widget-wrap">
    <div class="container">
      <div class="booking-widget" id="booking-widget">
        <div class="bw-field">
          <label for="arrival">Arrival</label>
          <input type="date" id="arrival" name="arrival">
        </div>
        <div class="bw-field">
          <label for="departure">Departure</label>
          <input type="date" id="departure" name="departure">
        </div>
        <div class="bw-field rg-widget">
          <label>Rooms &amp; Guests</label>
          <button type="button" class="rg-button">1 Room, 2 Adults</button>
          <div class="rg-panel">
            <div class="rg-row">
              <div><div class="rg-row-label">Rooms</div></div>
              <div class="rg-stepper">
                <button type="button" data-rg-decr="rooms" aria-label="Decrease rooms">&minus;</button>
                <span data-rg-count="rooms">1</span>
                <button type="button" data-rg-incr="rooms" aria-label="Increase rooms">+</button>
              </div>
            </div>
            <div class="rg-row">
              <div><div class="rg-row-label">Adults</div><div class="rg-row-sub">Age 13+</div></div>
              <div class="rg-stepper">
                <button type="button" data-rg-decr="adults" aria-label="Decrease adults">&minus;</button>
                <span data-rg-count="adults">2</span>
                <button type="button" data-rg-incr="adults" aria-label="Increase adults">+</button>
              </div>
            </div>
            <div class="rg-row">
              <div><div class="rg-row-label">Children</div><div class="rg-row-sub">Age 0-12</div></div>
              <div class="rg-stepper">
                <button type="button" data-rg-decr="children" aria-label="Decrease children">&minus;</button>
                <span data-rg-count="children">0</span>
                <button type="button" data-rg-incr="children" aria-label="Increase children">+</button>
              </div>
            </div>
            <button type="button" class="btn btn-outline btn-block rg-done">Done</button>
          </div>
        </div>
        <div class="bw-cta"><button type="button" class="btn btn-primary">Book Now</button></div>
      </div>
    </div>
  </div>
"""

# The form posts directly to FormSubmit.co (https://formsubmit.co) -- a
# no-account-needed email relay. js/main.js fills in the action URL and the
# _next redirect at runtime from js/config.js, and validates every field
# before letting the native submit go through (see main.js handleSubmit).
#
# Every field below carries two attributes on purpose:
#   - name="..."   is what actually shows up as the row label in the emailed
#                   table (FormSubmit renders whatever you put here verbatim),
#                   so these are written as clean, human-readable labels.
#   - data-field="..." is a stable hook main.js uses to find/fill/enable each
#                   field, completely decoupled from the label text above.
# main.js also disables (rather than blanks out) whichever of Arrival /
# Departure / Rooms & Guests / Interested In don't apply to a given
# enquiry -- a disabled field is left out of the submitted data entirely, so
# a plain "Book Now" from the booking widget emails a different, shorter
# table than an "Enquire Now" from an offer/room/event card, instead of both
# showing every row with "Not specified" filled in for whichever half
# doesn't apply.
MODAL = """
  <div class="modal-overlay" id="booking-modal">
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button type="button" class="modal-close" aria-label="Close">&times;</button>
      <h2 id="modal-title">Complete Your Enquiry</h2>
      <p class="modal-sub">Tell us a little about your stay and our reservations team will confirm availability and the best rate for you.</p>
      <div class="form-summary"></div>
      <form novalidate method="POST" id="enquiry-form">
        <input type="hidden" name="_subject" value="New Enquiry - Holiday Inn Kolkata Airport">
        <input type="hidden" name="_template" value="table">
        <input type="hidden" name="_captcha" value="false">
        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">
        <input type="hidden" name="_next" value="">
        <input type="hidden" name="_cc" value="" data-field="_cc">
        <input type="hidden" name="Enquiry Type" data-field="enquiry_type">
        <input type="hidden" name="Arrival Date" data-field="arrival">
        <input type="hidden" name="Departure Date" data-field="departure">
        <input type="hidden" name="Rooms &amp; Guests" data-field="rooms_guests">
        <input type="hidden" name="Interested In" data-field="interested_in">
        <input type="hidden" name="Submitted From Page" data-field="page">
        <p class="form-error"></p>
        <div class="form-group">
          <label for="f-name">Full Name *</label>
          <input type="text" id="f-name" name="Full Name" data-field="name" autocomplete="name" placeholder="e.g. Priya Sharma" required>
          <p class="field-error" data-for="name"></p>
        </div>
        <div class="form-group">
          <label for="f-phone">Phone Number *</label>
          <input type="tel" id="f-phone" name="Phone Number" data-field="phone" autocomplete="tel" inputmode="numeric" maxlength="10" placeholder="e.g. 9876543210" required>
          <p class="field-error" data-for="phone"></p>
        </div>
        <div class="form-group">
          <label for="f-email">Email Address *</label>
          <input type="email" id="f-email" name="Email Address" data-field="email" autocomplete="email" placeholder="e.g. you@example.com" required>
          <p class="field-error" data-for="email"></p>
        </div>
        <div class="agreement">
          <input type="checkbox" id="f-agree" data-field="agree" checked required>
          <label for="f-agree">I agree to be contacted by Holiday Inn Kolkata Airport by phone, SMS or email about this enquiry. *</label>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Book Now</button>
        <p class="form-status"></p>
      </form>
    </div>
  </div>
"""

def footer():
    return """
  <footer class="site-footer">
    <div class="container footer-top">
      <div class="footer-brand">
        <img src="assets/icons/hi_logo.svg" alt="Holiday Inn by IHG">
        <p>Holiday Inn Kolkata Airport &mdash; Biswa Bangla Sarani, Rajarhat, Near City Centre 2, Kolkata, 700136, India.</p>
        <div class="footer-social">
          <a href="https://www.facebook.com/holidayinnkolairport/" target="_blank" rel="noopener" aria-label="Facebook">{fb}</a>
          <a href="https://x.com/holidayinnkol" target="_blank" rel="noopener" aria-label="X (Twitter)">{x}</a>
          <a href="https://www.instagram.com/holidayinnkolkataairport/" target="_blank" rel="noopener" aria-label="Instagram">{ig}</a>
        </div>
        <div class="footer-badges">
          <a href="https://www.ihg.com/content/us/en/support/mobile" target="_blank" rel="noopener"><img src="assets/icons/app-store-badge.png" alt="Download on the App Store"></a>
          <a href="https://www.ihg.com/content/us/en/support/mobile" target="_blank" rel="noopener"><img src="assets/icons/google-play-badge.png" alt="Get it on Google Play"></a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <ul>
          <li><a href="index.html">Overview</a></li>
          <li><a href="offers.html">Offers</a></li>
          <li><a href="rooms.html">Rooms</a></li>
          <li><a href="amenities.html">Amenities</a></li>
          <li><a href="dining.html">Dining</a></li>
          <li><a href="local-area.html">Local Area</a></li>
          <li><a href="events.html">Groups &amp; Events</a></li>
          <li><a href="photos.html">Photos</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <address>
          Biswa Bangla Sarani, Rajarhat<br>Near City Centre 2<br>Kolkata, 700136, India<br><br>
          Reservations: <a href="tel:+913366996699">+91-33-6699-6699</a><br>
          <a href="mailto:reservations@holidayinnkolairport.com">reservations@holidayinnkolairport.com</a>
        </address>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <ul>
          <li><a href="https://www.ihg.com/content/us/en/about/brands" target="_blank" rel="noopener">About IHG</a></li>
          <li><a href="https://careers.ihg.com/en/" target="_blank" rel="noopener">IHG Careers</a></li>
          <li><a href="https://development.ihg.com/" target="_blank" rel="noopener">Hotel Development</a></li>
          <li><a href="https://www.ihg.com/content/us/en/customer-care/tc" target="_blank" rel="noopener">Terms of Use</a></li>
          <li><a href="https://www.ihg.com/content/us/en/customer-care/privacy-and-cookie-center" target="_blank" rel="noopener">Privacy Policy</a></li>
          <li><a href="https://www.ihg.com/holidayinn/content/us/en/support/site-map" target="_blank" rel="noopener">Site Map</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>&copy; 2026 IHG. Holiday Inn Kolkata Airport is independently owned and operated. Site built for Jain Group.</span>
      <ul>
        <li><a href="https://www.ihg.com/content/us/en/customer-care/tc" target="_blank" rel="noopener">Terms of Use</a></li>
        <li><a href="https://www.ihg.com/content/us/en/customer-care/privacy-and-cookie-center" target="_blank" rel="noopener">Privacy Policy</a></li>
        <li><a href="mailto:ai@thejaingroup.com">Send Feedback</a></li>
      </ul>
    </div>
  </footer>
""".format(fb=SOCIAL_SVGS["facebook"], x=SOCIAL_SVGS["x-twitter"], ig=SOCIAL_SVGS["instagram"])

LIGHTBOX = """
  <div class="lightbox" id="lightbox">
    <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
    <button type="button" class="lightbox-nav lightbox-prev" aria-label="Previous image">&#8249;</button>
    <img src="" alt="">
    <button type="button" class="lightbox-nav lightbox-next" aria-label="Next image">&#8250;</button>
  </div>
"""

FONT_LINKS = """<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">"""

# Google Tag Manager - installed site-wide (every page, including Thank You)
# per your snippet. Head script goes as high in <head> as possible; the
# noscript fallback goes right after the opening <body> tag.
GTM_ID = "GTM-P3Q3MG9C"
GTM_HEAD = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}})(window,document,'script','dataLayer','{gtm_id}');</script>
<!-- End Google Tag Manager -->""".format(gtm_id=GTM_ID)

GTM_BODY = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id={gtm_id}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->""".format(gtm_id=GTM_ID)

# Hotel structured data (schema.org JSON-LD) - helps Google show rich hotel
# results (star rating box, amenities, price range) instead of a plain blue
# link. Placed on the homepage only, which is standard practice.
HOTEL_SCHEMA = """<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "Hotel",
  "name": "Holiday Inn Kolkata Airport",
  "description": "A business hotel 4.7 km from Netaji Subhash Chandra Bose International Airport, with 137 rooms, a rooftop pool, fitness center and two on-site restaurants.",
  "url": "{base_url}/",
  "telephone": "+91-33-6699-6699",
  "priceRange": "$$",
  "image": "{base_url}/assets/images/holiday-inn-kolkata-6541707615-2x1.jpg",
  "address": {{
    "@type": "PostalAddress",
    "streetAddress": "Biswa Bangla Sarani, Rajarhat, Near City Centre 2",
    "addressLocality": "Kolkata",
    "postalCode": "700136",
    "addressCountry": "IN"
  }},
  "geo": {{
    "@type": "GeoCoordinates",
    "latitude": 22.6198,
    "longitude": 88.4497
  }},
  "checkinTime": "15:00",
  "checkoutTime": "12:00",
  "numberOfRooms": 137,
  "amenityFeature": [
    {{"@type": "LocationFeatureSpecification", "name": "Free Wi-Fi", "value": true}},
    {{"@type": "LocationFeatureSpecification", "name": "Outdoor Pool", "value": true}},
    {{"@type": "LocationFeatureSpecification", "name": "Fitness Center", "value": true}},
    {{"@type": "LocationFeatureSpecification", "name": "On-site Parking", "value": true}},
    {{"@type": "LocationFeatureSpecification", "name": "Airport Shuttle", "value": true}}
  ],
  "sameAs": [
    "https://www.facebook.com/holidayinnkolairport/",
    "https://www.instagram.com/holidayinnkolkataairport/",
    "https://x.com/holidayinnkol"
  ]
}}
</script>""".format(base_url=BASE_URL)

def page(title, description, current, hero_html, body_html, extra_head="", include_lightbox=False, include_widget=False, og_image=None, noindex=False, after_widget_html=""):
    lightbox_html = LIGHTBOX if include_lightbox else ""
    widget_html = booking_widget() if include_widget else ""
    canonical_path = "/" if current == "index.html" else "/" + current
    canonical_url = BASE_URL + canonical_path
    og_image_url = BASE_URL + "/assets/images/" + (og_image or DEFAULT_OG_IMAGE)
    robots_tag = '<meta name="robots" content="noindex, nofollow">' if noindex else '<meta name="robots" content="index, follow">'
    seo_head = """<link rel="canonical" href="{canonical}">
{robots}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Holiday Inn Kolkata Airport">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{og_image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="{og_image}">""".format(
        canonical=canonical_url, robots=robots_tag, title=title, description=description, og_image=og_image_url,
    )
    return """<!DOCTYPE html>
<html lang="en">
<head>
{gtm_head}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="icon" href="assets/icons/favicon.png" type="image/png">
{seo_head}
{fonts}
<link rel="stylesheet" href="css/styles.css">
{extra_head}
</head>
<body>
{gtm_body}
{header}
<main id="main">
{hero}
{widget}
{after_widget}
{body}
</main>
{footer}
{modal}
{lightbox}
<script src="js/config.js"></script>
<script src="js/main.js"></script>
</body>
</html>
""".format(
        gtm_head=GTM_HEAD,
        gtm_body=GTM_BODY,
        title=title,
        description=description,
        seo_head=seo_head,
        fonts=FONT_LINKS,
        extra_head=extra_head,
        header=header(current),
        hero=hero_html,
        widget=widget_html,
        after_widget=after_widget_html,
        body=body_html,
        footer=footer(),
        modal=MODAL,
        lightbox=lightbox_html,
    )

def hero(eyebrow, h1, lead, image, small=False):
    cls = "hero hero-small" if small else "hero"
    return """
  <section class="{cls}" style="background-image:url('assets/images/{image}');">
    <div class="container hero-content">
      <div class="hero-eyebrow">{eyebrow}</div>
      <h1>{h1}</h1>
      <p class="lead">{lead}</p>
    </div>
  </section>
""".format(cls=cls, image=image, eyebrow=eyebrow, h1=h1, lead=lead)

def tagline_rating_section(tagline, score):
    """A standalone, centered section sat between the booking widget and the
    Overview section: the tagline up top with its own divider underneath,
    then the guest rating below that -- its own dedicated section rather
    than crammed onto the hero photo, into the hero text stack, or inside
    another section's container, where it kept colliding with other
    content on narrow screens."""
    fill_pct = round((score / 5.0) * 100, 1)
    return """
  <section class="tagline-rating-section">
    <div class="container tagline-rating-inner">
      <p class="tagline-centered">{tagline}</p>
      <div class="tagline-divider"></div>
      <div class="rating-row">
        <span class="stars" style="--fill:{fill}%"><span class="stars-fg">&#9733;&#9733;&#9733;&#9733;&#9733;</span></span>
        <span class="rating-score">{score}<span class="rating-max">/5</span></span>
        <span class="rating-label">Guest Rating</span>
      </div>
    </div>
  </section>
""".format(tagline=tagline, fill=fill_pct, score=score)

def write(path, content):
    with open(os.path.join(SITE_ROOT, path), "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", path)

# ============================================================================
# Import per-page body content
# ============================================================================
from pages import home, offers, rooms, amenities, dining, local_area, events, photos, thank_you

write("index.html", page(
    "Holiday Inn Kolkata Airport - Business Hotel Near CCU Airport",
    "Holiday Inn Kolkata Airport - a business hotel 4.7 km from Netaji Subhash Chandra Bose International Airport, with 137 rooms, rooftop pool, fitness center and two on-site restaurants.",
    "index.html",
    hero(
        "Holiday Inn Kolkata Airport",
        "Holiday Inn Kolkata Airport",
        "A business hotel just 4.7 km from CCU Airport, with easy access to New Town and Salt Lake Sector V.",
        "holiday-inn-kolkata-6541707615-2x1.jpg",
    ),
    home.BODY,
    include_widget=True,
    after_widget_html=tagline_rating_section("Just 10 Minutes from Kolkata Airport", 4.3),
    extra_head=HOTEL_SCHEMA,
    og_image="holiday-inn-kolkata-6541707615-2x1.jpg",
))

write("offers.html", page(
    "Hotel Offers &amp; Packages | Holiday Inn Kolkata Airport",
    "Save on your hotel stay with exclusive Holiday Inn Kolkata Airport deals and packages.",
    "offers.html",
    hero("Holiday Inn Kolkata Airport", "Offers", "Save on your hotel stay with these exclusive Holiday Inn Kolkata Airport deals.", "holiday-inn-kolkata-6541707615-4x3.jpg", small=True),
    offers.BODY,
))

write("rooms.html", page(
    "Rooms | Holiday Inn Kolkata Airport",
    "Explore Standard Rooms and Suites at Holiday Inn Kolkata Airport - spacious, air-conditioned accommodation across 6 floors.",
    "rooms.html",
    hero("Holiday Inn Kolkata Airport", "Rooms", "Business-style comfort across 6 floors. Smoking rooms available on the 6th floor only.", "holiday-inn-kolkata-5002705769-4x3.jpg", small=True),
    rooms.BODY,
))

write("amenities.html", page(
    "Amenities | Holiday Inn Kolkata Airport",
    "Holiday Inn Kolkata Airport offers free Wi-Fi, a rooftop pool, fitness center and two on-site restaurants. Kids stay and eat free.",
    "amenities.html",
    hero("Holiday Inn Kolkata Airport", "Amenities", "Everything you need for a comfortable business or leisure stay, from a rooftop pool to a 24-hour fitness center.", "holiday-inn-kolkata-5002664314-4x3.jpg", small=True),
    amenities.BODY,
))

write("dining.html", page(
    "Dining | Holiday Inn Kolkata Airport",
    "Enjoy global cuisine at Social Kitchen, cocktails and grills at Urban Kitchen & Bar, and eggless desserts at Royal Bengal Sweet Company.",
    "dining.html",
    hero("Holiday Inn Kolkata Airport", "Dining", "Global cuisine, cocktails and Bengali sweets, all on site.", "holiday-inn-kolkata-5002663722-4x3.jpg", small=True),
    dining.BODY,
))

write("local-area.html", page(
    "Local Area | Holiday Inn Kolkata Airport",
    "Holiday Inn Kolkata Airport is close to Netaji Subhash Chandra International Airport, Rajarhat IT hub, New Town, Eco Park and Mother's Wax Museum.",
    "local-area.html",
    hero("Holiday Inn Kolkata Airport", "Local Area", "Close to the airport, the Rajarhat IT hub and New Town, and near major attractions in north-east Kolkata.", "holiday-inn-kolkata-10464017915-16x5.jpg", small=True),
    local_area.BODY,
))

write("events.html", page(
    "Meeting Rooms &amp; Events | Holiday Inn Kolkata Airport",
    "Over 17,000 sq ft of conference and banqueting facilities at Holiday Inn Kolkata Airport, hosting from 15 to 600 participants.",
    "events.html",
    hero("Holiday Inn Kolkata Airport", "Groups &amp; Events", "Over 17,000 sq ft of flexible meeting and banquet space for 15 to 600 guests.", "holiday-inn-kolkata-6541707581-4x3.jpg", small=True),
    events.BODY,
))

write("photos.html", page(
    "Photos | Holiday Inn Kolkata Airport",
    "Browse photos of Holiday Inn Kolkata Airport's rooms, dining venues, amenities and event spaces.",
    "photos.html",
    hero("Holiday Inn Kolkata Airport", "Photos", "Take a closer look at our rooms, dining venues, amenities and event spaces.", "holiday-inn-kolkata-6671957539-4x3.jpg", small=True),
    photos.BODY,
    include_lightbox=True,
))

# Thank you page uses a different (minimal) layout
write("thank-you.html", thank_you.render(header(""), footer(), gtm_head=GTM_HEAD, gtm_body=GTM_BODY))

# ============================================================================
# robots.txt + sitemap.xml
# ============================================================================
SITEMAP_PAGES = [
    ("", "1.0"),  # homepage - served at "/"
    ("offers.html", "0.8"),
    ("rooms.html", "0.8"),
    ("amenities.html", "0.7"),
    ("dining.html", "0.6"),
    ("local-area.html", "0.6"),
    ("events.html", "0.6"),
    ("photos.html", "0.5"),
    # thank-you.html deliberately excluded - it's a transactional page
    # reached only after a form submit, marked noindex, and shouldn't be
    # something search engines send visitors to directly.
]

write("robots.txt", """User-agent: *
Allow: /
Disallow: /thank-you.html

Sitemap: {base_url}/sitemap.xml
""".format(base_url=BASE_URL))

sitemap_entries = "\n".join(
    """  <url>
    <loc>{base_url}/{path}</loc>
    <priority>{priority}</priority>
  </url>""".format(base_url=BASE_URL, path=path, priority=priority)
    for path, priority in SITEMAP_PAGES
)
write("sitemap.xml", """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{entries}
</urlset>
""".format(entries=sitemap_entries))

print("\nBuild complete.")
