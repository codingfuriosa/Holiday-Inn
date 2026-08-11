# -*- coding: utf-8 -*-

# (image id, alt text) grouped by category, matching the live site's own
# section groupings (Hotel / Rooms / Amenities / Dining / Groups & Meetings).
_CATEGORIES = [
    ("hotel", "Hotel", [
        ("holiday-inn-kolkata-5002664314-4x3", "Rooftop swimming pool"),
        ("holiday-inn-kolkata-6541706527-4x3", "Durbaar Hall - for regal gatherings"),
        ("holiday-inn-kolkata-6541707615-4x3", "Front desk"),
        ("holiday-inn-kolkata-6536103795-4x3", "Guest room"),
        ("holiday-inn-kolkata-6541708017-4x3", "Urban Bar"),
        ("holiday-inn-kolkata-6671957539-4x3", "Suite"),
        ("holiday-inn-kolkata-5002663766-4x3", "Cafe"),
        ("holiday-inn-kolkata-5061780023-4x3", "Executive Suite"),
        ("holiday-inn-kolkata-5002665747-4x3", "Swimming pool"),
        ("holiday-inn-kolkata-10364318346-4x3", "Ravioli with sage butter sauce"),
    ]),
    ("rooms", "Rooms", [
        ("holiday-inn-kolkata-5002705769-4x3", "King Bed Guest Room"),
        ("holiday-inn-kolkata-6671957539-4x3", "Suite"),
        ("holiday-inn-kolkata-6536103446-4x3", "Double Bed Guest Room"),
        ("holiday-inn-kolkata-10055876192-4x3", "Double Bed Guest Room"),
        ("holiday-inn-kolkata-5061780023-4x3", "Executive Suite"),
        ("holiday-inn-kolkata-5002704158-4x3", "Ergonomic work desk feature"),
        ("holiday-inn-kolkata-6523754246-4x3", "Double Bed Guest Room"),
        ("holiday-inn-kolkata-6536103798-4x3", "Guest Room"),
        ("holiday-inn-kolkata-6536102518-4x3", "Guest Room"),
        ("holiday-inn-kolkata-5002706767-4x3", "Junior Suite"),
        ("holiday-inn-kolkata-5060126391-4x3", "Junior Suite"),
        ("holiday-inn-kolkata-5002707251-4x3", "Junior Suite"),
        ("holiday-inn-kolkata-6536102506-4x3", "Guest bathroom"),
        ("holiday-inn-kolkata-5060135037-4x3", "King Bed Guest Room"),
        ("holiday-inn-kolkata-6536101071-4x3", "King Bed Guest Room"),
    ]),
    ("amenities", "Amenities", [
        ("holiday-inn-kolkata-5002664314-4x3", "Swimming pool"),
        ("holiday-inn-kolkata-6523748761-4x3", "Fitness center / gym"),
        ("holiday-inn-kolkata-5002665747-4x3", "Swimming pool"),
    ]),
    ("dining", "Dining", [
        ("holiday-inn-kolkata-5002663722-4x3", "Cafe"),
        ("holiday-inn-kolkata-10364318732-4x3", "Blueberry pancakes"),
        ("holiday-inn-kolkata-5992009282-4x3", "Restaurant"),
        ("holiday-inn-kolkata-10364318346-4x3", "Ravioli with sage butter sauce"),
        ("holiday-inn-kolkata-5002663766-4x3", "Cafe"),
        ("holiday-inn-kolkata-6541708017-4x3", "Urban Bar"),
    ]),
    ("events", "Groups &amp; Meetings", [
        ("holiday-inn-kolkata-6541706330-4x3", "ONYX"),
        ("holiday-inn-kolkata-6541859020-4x3", "Onyx - for all your special events and conferences"),
        ("holiday-inn-kolkata-6541876653-4x3", "Conference room"),
        ("holiday-inn-kolkata-10118259478-4x3", "Where voices meet and visions align - Senate"),
        ("holiday-inn-kolkata-10460742918-4x3", "Meeting room"),
    ]),
]

def _tabs():
    out = []
    for key, label, _items in _CATEGORIES:
        out.append('<a href="#cat-{key}">{label}</a>'.format(key=key, label=label))
    return "\n        ".join(out)

def _section(key, label, items):
    tiles = []
    for img_id, alt in items:
        tiles.append("""          <div class="gallery-item" data-category="{cat}">
            <figure>
              <img src="assets/images/{img_id}.jpg" alt="{alt}" loading="lazy">
              <figcaption>{alt}</figcaption>
            </figure>
          </div>""".format(cat=key, img_id=img_id, alt=alt))
    return """
  <section class="photo-section" id="cat-{key}">
    <div class="container">
      <h2>{label}</h2>
      <div class="gallery-grid">
{tiles}
      </div>
    </div>
  </section>
""".format(key=key, label=label, tiles="\n".join(tiles))

BODY = """
  <section class="section" style="padding-bottom:0;">
    <div class="container">
      <div class="gallery-tabs">
        {tabs}
      </div>
    </div>
  </section>
{sections}
""".format(
    tabs=_tabs(),
    sections="".join(_section(key, label, items) for key, label, items in _CATEGORIES),
)
