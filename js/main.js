/* ==========================================================================
   Holiday Inn Kolkata Airport (clone) — site behaviour
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    initMobileNav();
    initRoomsGuests();
    initBookingWidget();
    initBestRateScroll();
    initBookingModal();
    initLightbox();
    setActiveNav();
  }

  /* ---------------- Mobile nav ---------------- */
  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    var scrim = document.querySelector(".nav-scrim");
    if (!toggle || !nav) return;
    function close() {
      nav.classList.remove("open");
      scrim && scrim.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("open");
      scrim && scrim.classList.toggle("open", isOpen);
      toggle.classList.toggle("open", isOpen); // morphs the hamburger icon into an X
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    scrim && scrim.addEventListener("click", close);
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  /* ---------------- Highlight current nav link ---------------- */
  function setActiveNav() {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".main-nav a[data-page]").forEach(function (a) {
      if (a.getAttribute("data-page") === path) a.setAttribute("aria-current", "page");
    });
  }

  /* ---------------- "Best Rates Guaranteed" / header "Book Now" ----------
     Every page's header CTA points at #booking-widget. Only the home page
     actually has that widget - on every other page we jump to the home
     page's widget instead, since there's now exactly one booking widget
     on the whole site (per your request). */
  function initBestRateScroll() {
    // Arriving at index.html#booking-widget (from a Rooms-page "Book Now", or
    // any other page's header CTA) - the browser's own hash jump lines the
    // widget's top edge up with the viewport top, which is exactly where the
    // sticky header sits. Re-scroll past the header once the layout settles.
    if (location.hash === "#booking-widget" && document.querySelector("#booking-widget")) {
      setTimeout(goToBookingWidget, 60);
    }

    document.querySelectorAll("[data-scroll-target]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        // The header / mobile-bar "Book Now" is the *general* entry point, so
        // it must not inherit a room intent left over from a Rooms-page click.
        setBookIntent("");
        var intentEl = document.querySelector(".bw-intent");
        if (intentEl) intentEl.hidden = true;
        var selector = el.getAttribute("data-scroll-target");
        var target = document.querySelector(selector);
        if (target) {
          // The site header is sticky (position: sticky; top: 0), so a plain
          // scrollIntoView({block:"start"}) lines the target's top edge up
          // with the viewport's top edge -- which is exactly where the fixed
          // header sits, covering the target and leaving whatever comes
          // after it (e.g. the Overview section) visible instead. Compute
          // the header's live height and scroll to a position that clears it.
          var header = document.querySelector(".site-header");
          var headerHeight = header ? header.getBoundingClientRect().height : 0;
          var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({ top: targetTop - headerHeight - 16, behavior: "smooth" });
        } else {
          window.location.href = "index.html" + selector;
        }
      });
    });
  }

  /* ---------------- Rooms & Guests dropdown ---------------- */
  function initRoomsGuests() {
    document.querySelectorAll(".rg-widget").forEach(function (widget) {
      var button = widget.querySelector(".rg-button");
      var panel = widget.querySelector(".rg-panel");
      var doneBtn = widget.querySelector(".rg-done");
      var counts = { rooms: 1, adults: 2, children: 0 };
      var limits = { rooms: [1, 8], adults: [1, 8], children: [0, 8] };

      function render() {
        button.textContent =
          counts.rooms + (counts.rooms === 1 ? " Room, " : " Rooms, ") +
          counts.adults + (counts.adults === 1 ? " Adult" : " Adults") +
          (counts.children > 0 ? ", " + counts.children + (counts.children === 1 ? " Child" : " Children") : "");
        widget.querySelectorAll("[data-rg-count]").forEach(function (el) {
          el.textContent = counts[el.getAttribute("data-rg-count")];
        });
        widget.querySelectorAll("[data-rg-decr]").forEach(function (btn) {
          var key = btn.getAttribute("data-rg-decr");
          btn.disabled = counts[key] <= limits[key][0];
        });
        widget.querySelectorAll("[data-rg-incr]").forEach(function (btn) {
          var key = btn.getAttribute("data-rg-incr");
          btn.disabled = counts[key] >= limits[key][1];
        });
        widget.dataset.summary = button.textContent;
        // The Google Sheet keeps Rooms and Guests in two separate columns, so
        // expose them separately here rather than making the sheet code
        // re-parse the combined "1 Room, 2 Adults" summary string.
        widget.dataset.rooms = String(counts.rooms);
        widget.dataset.guests =
          counts.adults + (counts.adults === 1 ? " Adult" : " Adults") +
          (counts.children > 0 ? ", " + counts.children + (counts.children === 1 ? " Child" : " Children") : "");
      }

      button.addEventListener("click", function (e) {
        e.stopPropagation();
        panel.classList.toggle("open");
      });
      widget.querySelectorAll("[data-rg-incr]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.getAttribute("data-rg-incr");
          if (counts[key] < limits[key][1]) counts[key]++;
          render();
        });
      });
      widget.querySelectorAll("[data-rg-decr]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var key = btn.getAttribute("data-rg-decr");
          if (counts[key] > limits[key][0]) counts[key]--;
          render();
        });
      });
      doneBtn && doneBtn.addEventListener("click", function () { panel.classList.remove("open"); });
      document.addEventListener("click", function (e) {
        if (!widget.contains(e.target)) panel.classList.remove("open");
      });
      render();
    });
  }

  /* ---------------- "Book Now" intent ----------------------------------
     Which button started the journey decides the Enquiry Type that ends up
     in the email and the Google Sheet:

       Rooms page "Book Now"      -> routed THROUGH the booking widget on the
                                     home page (dates first), then submitted
                                     as "Enquiry for Standard Room" / "Suite"
       Header / mobile "Book Now" -> booking widget with no intent attached,
                                     submitted as "General Enquiry"
       Groups & Events            -> straight to contact details,
                                     "Groups & Events"
       Offer cards                -> straight to contact details, carrying the
                                     offer name in "Interested In"

     A room intent has to survive a page navigation (rooms.html ->
     index.html#booking-widget), so it rides in sessionStorage rather than in
     a variable. It is deliberately cleared the moment it is consumed, or as
     soon as any other Book Now entry point is used, so a stale room intent
     can never leak into an unrelated later enquiry. */
  var INTENT_KEY = "hi_book_intent";

  function setBookIntent(value) {
    try {
      if (value) sessionStorage.setItem(INTENT_KEY, value);
      else sessionStorage.removeItem(INTENT_KEY);
    } catch (e) { /* private mode - intent simply won't persist */ }
  }

  function getBookIntent() {
    try { return sessionStorage.getItem(INTENT_KEY) || ""; } catch (e) { return ""; }
  }

  /* ---------------- Booking widget (date defaults + validation) ---------------- */
  function initBookingWidget() {
    document.querySelectorAll(".booking-widget").forEach(function (widget) {
      var arrival = widget.querySelector('[name="arrival"]');
      var departure = widget.querySelector('[name="departure"]');

      // Show what the visitor came here to book, if they arrived via a room
      // card, so the widget doesn't look like a generic detour.
      var intentEl = widget.querySelector(".bw-intent");
      var intent = getBookIntent();
      if (intentEl && intent) {
        intentEl.textContent = "Enquiring about: " + intent;
        intentEl.hidden = false;
      }

      if (arrival && departure) initDatePicker(widget, arrival, departure);

      var cta = widget.querySelector(".bw-cta button, .bw-cta .btn");
      if (cta) {
        cta.addEventListener("click", function (e) {
          e.preventDefault();
          var rg = widget.querySelector(".rg-widget");
          var roomIntent = getBookIntent();
          openBookingModal({
            arrival: arrival ? arrival.value : "",
            departure: departure ? departure.value : "",
            rooms: rg ? (rg.dataset.rooms || "") : "",
            guests: rg ? (rg.dataset.guests || "") : "",
            // No room intent means the visitor came in through the header /
            // mobile "Book Now", i.e. a plain general enquiry.
            enquiryType: roomIntent ? "Enquiry for " + roomIntent : "General Enquiry"
          });
          setBookIntent(""); // consumed - never carry it into a later enquiry
          if (intentEl) intentEl.hidden = true;
        });
      }
    });

    // Rooms page "Book Now": go to the booking widget FIRST (dates, rooms and
    // guests), remembering which room was clicked. The contact-details form
    // only opens afterwards, from the widget's own Book Now.
    document.querySelectorAll("[data-book-intent]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setBookIntent(btn.getAttribute("data-book-intent") || "");
        goToBookingWidget();
      });
    });

    // Groups & Events "Enquire Now": straight to contact details, and the
    // enquiry type is exactly the label on the button's attribute.
    document.querySelectorAll("[data-enquiry-direct]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setBookIntent("");
        openBookingModal({ enquiryType: btn.getAttribute("data-enquiry-direct") || "Enquiry" });
      });
    });

    // Offer cards: straight to contact details, carrying the offer name.
    document.querySelectorAll("[data-offer-book]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        setBookIntent("");
        openBookingModal({ offer: btn.getAttribute("data-offer-book") || "" });
      });
    });
  }

  /* Scroll to the home page's booking widget, or navigate there first if we
     aren't on the home page. Mirrors the header CTA's own scroll maths so the
     sticky header doesn't end up covering the widget. */
  function goToBookingWidget() {
    var target = document.querySelector("#booking-widget");
    if (!target) {
      window.location.href = "index.html#booking-widget";
      return;
    }
    var header = document.querySelector(".site-header");
    var headerHeight = header ? header.getBoundingClientRect().height : 0;
    var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: targetTop - headerHeight - 16, behavior: "smooth" });
  }

  function fmtDate(d) {
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  /* ---------------- Booking modal (inquiry form) ----------------
     The form sends to FormSubmit.co's AJAX endpoint (see js/config.js) in
     the background via fetch(). We deliberately do NOT let the browser do
     a native <form> POST to formsubmit.co - that top-level-navigates the
     tab to formsubmit.co before it redirects back, which is exactly what
     showed the raw "https://formsubmit.co/ai@thejaingroup.com" address.
     Instead: preventDefault always, fetch() in the background, then send
     the user to thank-you.html ourselves on success (same tab throughout).
     On failure, fall back to a same-tab mailto: link (no popup window) so
     the enquiry still has a path to the inbox. */
  var modalEl, formEl, summaryEl, errorEl, statusEl, submitBtn, ajaxUrl;
  var lastDetails = {};

  function initBookingModal() {
    modalEl = document.getElementById("booking-modal");
    if (!modalEl) return;
    formEl = modalEl.querySelector("form");
    summaryEl = modalEl.querySelector(".form-summary");
    errorEl = modalEl.querySelector(".form-error");
    statusEl = modalEl.querySelector(".form-status");
    submitBtn = modalEl.querySelector('button[type="submit"]');

    // Wire the destination email now that we know where this page is
    // actually hosted. The AJAX endpoint never navigates the browser away.
    var toEmail = (window.SITE_CONFIG && window.SITE_CONFIG.TO_EMAIL) || "ai@thejaingroup.com";
    ajaxUrl = "https://formsubmit.co/ajax/" + toEmail;
    var nextField = formEl.querySelector('[name="_next"]');
    if (nextField) {
      try {
        nextField.value = new URL("thank-you.html", window.location.href).href;
      } catch (e) {
        nextField.value = "thank-you.html";
      }
    }

    // Every enquiry also CCs additional inboxes (e.g. an IHG-side contact,
    // sales, reservations), configured as a comma-separated list in
    // js/config.js. Left blank/disabled entirely if not set, rather than
    // sending an empty _cc field.
    var ccEmail = window.SITE_CONFIG && window.SITE_CONFIG.CC_EMAIL;
    var ccField = formEl.querySelector('[data-field="_cc"]');
    if (ccField) {
      if (ccEmail) {
        ccField.value = ccEmail;
      } else {
        ccField.disabled = true;
      }
    }

    // Digits-only, max-10 phone field - strip anything else as the user types.
    var phoneField = formEl.querySelector('[data-field="phone"]');
    if (phoneField) {
      phoneField.addEventListener("input", function () {
        phoneField.value = phoneField.value.replace(/[^0-9]/g, "").slice(0, 10);
      });
    }

    modalEl.querySelector(".modal-close").addEventListener("click", closeBookingModal);
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) closeBookingModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modalEl.classList.contains("open")) closeBookingModal();
    });

    formEl.addEventListener("submit", handleSubmit);
  }

  function openBookingModal(details) {
    if (!modalEl) return;
    details = details || {};
    formEl.reset();
    formEl.querySelector('[data-field="agree"]').checked = true;
    errorEl.classList.remove("show");
    errorEl.textContent = "";
    statusEl.textContent = "";
    clearFieldErrors();

    // A submission from the booking widget itself always carries real
    // arrival/departure dates; a "Book Now"/"Enquire Now" from an offer or
    // event card never does. That distinction is what decides which fields
    // actually get emailed below.
    var isBooking = !!(details.arrival || details.departure);
    var enquiryType = details.enquiryType ||
      (details.offer ? "Offer Enquiry" : "General Enquiry");

    var bits = [];
    if (details.arrival) bits.push("Arrival: " + details.arrival);
    if (details.departure) bits.push("Departure: " + details.departure);
    if (details.rooms) bits.push(details.rooms + (details.rooms === "1" ? " Room" : " Rooms"));
    if (details.guests) bits.push(details.guests);
    if (details.offer) bits.push("Enquiry: " + details.offer);
    summaryEl.textContent = bits.length ? bits.join(" | ") : enquiryType;

    // Kept for the Sheet row, which logs every enquiry in one shared shape
    // regardless of which entry point produced it.
    lastDetails = {
      enquiryType: enquiryType,
      arrival: isBooking ? (details.arrival || "") : "",
      departure: isBooking ? (details.departure || "") : "",
      rooms: isBooking ? (details.rooms || "") : "",
      guests: isBooking ? (details.guests || "") : ""
    };

    // Disabled fields are left out of the submitted FormData entirely, so
    // FormSubmit's emailed table only ever shows rows relevant to this
    // particular enquiry -- a widget booking never shows a blank
    // "Interested In" row, and an offer/room/event enquiry never shows
    // "Not specified" Arrival/Departure/Rooms & Guests rows.
    setHidden("enquiry_type", enquiryType);
    if (isBooking) {
      setHidden("arrival", details.arrival || "");
      setHidden("departure", details.departure || "");
      setHidden("rooms", details.rooms || "");
      setHidden("guests", details.guests || "");
      disableField("interested_in");
      setSubject("New " + enquiryType + " - Holiday Inn Kolkata Airport");
    } else {
      if (details.offer) setHidden("interested_in", details.offer);
      else disableField("interested_in");
      disableField("arrival");
      disableField("departure");
      disableField("rooms");
      disableField("guests");
      setSubject("New Enquiry - Holiday Inn Kolkata Airport (" + (details.offer || enquiryType) + ")");
    }
    setHidden("page", location.href);

    modalEl.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(function () {
      var nameField = formEl.querySelector('[data-field="name"]');
      nameField && nameField.focus();
    }, 50);
  }

  function setHidden(field, value) {
    var el = formEl.querySelector('[data-field="' + field + '"]');
    if (!el) return;
    el.disabled = false;
    el.value = value;
  }

  function disableField(field) {
    var el = formEl.querySelector('[data-field="' + field + '"]');
    if (el) el.disabled = true;
  }

  function setSubject(text) {
    var el = formEl.querySelector('[name="_subject"]');
    if (el) el.value = text;
  }

  function closeBookingModal() {
    modalEl.classList.remove("open");
    document.body.style.overflow = "";
  }

  /* ---- Validation ---- */
  var NAME_RE = /^[A-Za-zÀ-ɏ]+(?:[.'\- ][A-Za-zÀ-ɏ]+)*$/;
  var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  var PHONE_RE = /^[0-9]{10}$/;

  function clearFieldErrors() {
    formEl.querySelectorAll(".field-error").forEach(function (el) { el.textContent = ""; });
    formEl.querySelectorAll("input").forEach(function (el) { el.classList.remove("invalid"); });
  }

  function setFieldError(name, message) {
    var msgEl = formEl.querySelector('.field-error[data-for="' + name + '"]');
    if (msgEl) msgEl.textContent = message;
    var input = formEl.querySelector('[data-field="' + name + '"]');
    if (input) input.classList.add("invalid");
  }

  function validate() {
    clearFieldErrors();
    var name = formEl.querySelector('[data-field="name"]').value.trim();
    var phone = formEl.querySelector('[data-field="phone"]').value.trim();
    var email = formEl.querySelector('[data-field="email"]').value.trim();
    var agree = formEl.querySelector('[data-field="agree"]').checked;
    var ok = true;

    if (name.length < 2 || name.length > 60 || !NAME_RE.test(name)) {
      setFieldError("name", "Please enter a real full name (letters only, no numbers or symbols).");
      ok = false;
    }

    if (!PHONE_RE.test(phone)) {
      setFieldError("phone", "Enter a valid 10-digit phone number (numbers only, no spaces, symbols or letters).");
      ok = false;
    }

    if (!EMAIL_RE.test(email)) {
      setFieldError("email", "Enter a valid email address, e.g. name@example.com.");
      ok = false;
    }

    if (!agree) {
      errorEl.textContent = "Please confirm you agree to be contacted about this enquiry.";
      errorEl.classList.add("show");
      ok = false;
    } else {
      errorEl.classList.remove("show");
    }

    if (!ok && agree) {
      errorEl.textContent = "Please fix the highlighted fields below.";
      errorEl.classList.add("show");
    }
    return ok;
  }

  function handleSubmit(e) {
    e.preventDefault(); // always - the form never top-level-navigates itself
    if (!validate()) {
      return;
    }

    var name = formEl.querySelector('[data-field="name"]').value.trim();
    var phone = formEl.querySelector('[data-field="phone"]').value.trim();
    var email = formEl.querySelector('[data-field="email"]').value.trim();
    try {
      sessionStorage.setItem("hi_enquiry_name", name);
    } catch (err) { /* ignore */ }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    statusEl.textContent = "";
    errorEl.classList.remove("show");

    var formData = new FormData(formEl);

    // Log the row to Google Sheets in parallel with the email. Deliberately
    // NOT chained after the email: the Sheet is the record of the enquiry, so
    // it should still get written even if the email relay is having a bad day,
    // and a Sheet failure must never block the guest's journey either.
    logToSheet({
      enquiryType: lastDetails.enquiryType || "General Enquiry",
      arrival: lastDetails.arrival || "",
      departure: lastDetails.departure || "",
      rooms: lastDetails.rooms || "",
      guests: lastDetails.guests || "",
      page: pageLabel(),
      name: name,
      phone: phone,
      email: email
    });

    fetch(ajaxUrl, {
      method: "POST",
      body: formData,
      headers: { "Accept": "application/json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed with status " + res.status);
        return res.json();
      })
      .then(function () {
        // Success - we navigate to the Thank You page ourselves (same tab).
        // We never rely on FormSubmit's own redirect, since that's what
        // showed the raw formsubmit.co URL in the address bar before.
        window.location.href = "thank-you.html";
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Book Now";
        errorEl.textContent = "We couldn't send that automatically, so we've opened an email to " +
          ((window.SITE_CONFIG && window.SITE_CONFIG.TO_EMAIL) || "ai@thejaingroup.com") +
          " with your details filled in - please hit send there.";
        errorEl.classList.add("show");
        // Same-tab mailto fallback (no popup window) so the enquiry still
        // reaches an inbox even if the background request failed. Reuses
        // whichever subject openBookingModal already set for this specific
        // enquiry (booking vs. offer/room/event), instead of a generic one.
        var toEmail = (window.SITE_CONFIG && window.SITE_CONFIG.TO_EMAIL) || "ai@thejaingroup.com";
        var ccEmail = window.SITE_CONFIG && window.SITE_CONFIG.CC_EMAIL;
        var subjectField = formEl.querySelector('[name="_subject"]');
        var subject = encodeURIComponent((subjectField && subjectField.value) || "New Enquiry - Holiday Inn Kolkata Airport");
        var body = encodeURIComponent(
          "Name: " + name + "\nPhone: " + phone + "\nEmail: " + email
        );
        var mailtoUrl = "mailto:" + toEmail + "?subject=" + subject + "&body=" + body;
        if (ccEmail) mailtoUrl += "&cc=" + encodeURIComponent(ccEmail);
        window.location.href = mailtoUrl;
      });
  }

  /* ---------------- Google Sheets logging ------------------------------
     Posts one row per enquiry to the Apps Script Web App configured as
     SHEET_ENDPOINT in js/config.js (see _dev/google-apps-script/).

     The body is sent as a plain string, with no custom Content-Type header,
     on purpose: that keeps it a CORS "simple request", so the browser never
     fires a preflight OPTIONS call -- which matters because Apps Script Web
     Apps answer redirects, not OPTIONS, and a preflight would fail outright.
     If the cross-origin read is still refused for any reason, we retry the
     same POST in no-cors mode, where the row is written but the response is
     opaque to us. Either way the caller never waits on this. */
  function logToSheet(row) {
    var endpoint = window.SITE_CONFIG && window.SITE_CONFIG.SHEET_ENDPOINT;
    if (!endpoint) return; // not wired up yet - email still sends as normal
    var body = JSON.stringify(row);
    fetch(endpoint, { method: "POST", body: body })
      .catch(function () {
        return fetch(endpoint, { method: "POST", mode: "no-cors", body: body });
      })
      .catch(function () { /* logged best-effort; the email is the backstop */ });
  }

  /* Which page the enquiry was submitted from, as a readable label ("Rooms")
     rather than a raw URL, since it becomes a Sheet column people read. */
  function pageLabel() {
    var file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var names = {
      "index.html": "Home",
      "": "Home",
      "rooms.html": "Rooms",
      "offers.html": "Offers",
      "amenities.html": "Amenities",
      "dining.html": "Dining",
      "local-area.html": "Local Area",
      "events.html": "Groups & Events",
      "photos.html": "Photos"
    };
    return names[file] || file;
  }

  /* ---------------- Date picker ----------------------------------------
     A calendar drawn by us, replacing <input type="date">.

     The native control's popup is rendered by the browser/OS outside the page
     entirely, so no amount of CSS can restyle it -- it simply looks like
     whatever the visitor's device looks like, which sat badly against the rest
     of the widget. This draws the calendar in the page instead.

     It's a RANGE picker rather than two independent single-date pickers,
     because that's how a stay actually works: pick arrival, and it moves you
     straight to picking departure, highlighting the nights in between and
     showing the count. Departure can never land on or before arrival, so the
     invalid combination the old two-field version had to correct after the
     fact simply can't be expressed here.

     The visible fields are buttons; the real values live in hidden inputs in
     plain YYYY-MM-DD, so everything downstream (the modal, the email, the
     Sheet row) is unchanged. */
  var MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
  var DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  function initDatePicker(widget, arrivalInput, departureInput) {
    var dp = widget.querySelector(".dp");
    if (!dp) return;

    var titlesEl = dp.querySelector(".dp-titles");
    var monthsEl = dp.querySelector(".dp-months");
    var summaryEl = dp.querySelector(".dp-summary");
    var prevBtn = dp.querySelector(".dp-prev");
    var nextBtn = dp.querySelector(".dp-next");
    var doneBtn = dp.querySelector(".dp-done");
    var clearBtn = dp.querySelector(".dp-clear");
    var openers = widget.querySelectorAll("[data-date-open]");

    var today = startOfDay(new Date());
    var arrival = addDays(today, 1);
    var departure = addDays(today, 2);
    var picking = "arrival";
    var hovered = null;
    var view = new Date(arrival.getFullYear(), arrival.getMonth(), 1);
    var open = false;

    /* One month on narrow screens, two side by side once there's room -- the
       two-month view is what makes a multi-night stay across a month boundary
       selectable without paging back and forth. */
    function monthCount() { return window.innerWidth >= 700 ? 2 : 1; }

    function render() {
      var count = monthCount();
      titlesEl.innerHTML = "";
      monthsEl.innerHTML = "";

      for (var m = 0; m < count; m++) {
        var month = new Date(view.getFullYear(), view.getMonth() + m, 1);
        var title = document.createElement("div");
        title.className = "dp-title";
        title.textContent = MONTHS[month.getMonth()] + " " + month.getFullYear();
        titlesEl.appendChild(title);
        monthsEl.appendChild(buildMonth(month));
      }

      // Never let the visitor page back into months that are entirely past.
      prevBtn.disabled = view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth();
      renderSummary();
      position();
    }

    /* Anchor the calendar under the field that opened it.
       This has to be computed rather than left to CSS: a plain
       "top: 100%" is relative to the whole widget, which is a single row on
       desktop (fine) but a stacked column on mobile -- where 100% of the
       widget means below the Rooms & Guests field AND the Book Now button,
       leaving the calendar floating far below the field being edited.
       Measuring from the opener's own box gets it right in both layouts. */
    function position() {
      var opener = widget.querySelector('[data-date-open="' + picking + '"]');
      if (!opener) return;
      var wr = widget.getBoundingClientRect();
      var br = opener.getBoundingClientRect();
      dp.style.top = (br.bottom - wr.top + 10) + "px";

      // Narrow screens: span the card rather than trying to sit beside a field.
      if (window.innerWidth < 700) {
        dp.style.left = "0px";
        dp.style.right = "0px";
        return;
      }

      // Wider: line up with the field's left edge, but never let the calendar
      // hang out past the edge of the card.
      dp.style.right = "auto";
      var left = br.left - wr.left;
      var maxLeft = wr.width - dp.offsetWidth;
      dp.style.left = Math.max(0, Math.min(left, maxLeft)) + "px";
    }

    function buildMonth(month) {
      var wrap = document.createElement("div");
      wrap.className = "dp-month";

      var head = document.createElement("div");
      head.className = "dp-dow";
      DAYS.forEach(function (d) {
        var cell = document.createElement("span");
        cell.textContent = d;
        head.appendChild(cell);
      });
      wrap.appendChild(head);

      var grid = document.createElement("div");
      grid.className = "dp-grid";

      var first = new Date(month.getFullYear(), month.getMonth(), 1);
      var daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();

      for (var blank = 0; blank < first.getDay(); blank++) {
        var filler = document.createElement("span");
        filler.className = "dp-cell";
        grid.appendChild(filler);
      }

      for (var d = 1; d <= daysInMonth; d++) {
        grid.appendChild(buildDay(new Date(month.getFullYear(), month.getMonth(), d)));
      }

      wrap.appendChild(grid);
      return wrap;
    }

    /* Each day is a button inside a cell. The cell carries the range shading
       (square-edged, so consecutive days form one continuous band) and the
       button carries the round selected pill on top of it -- which is what
       makes the two meet cleanly instead of leaving a notch at each end. */
    function buildDay(date) {
      var cell = document.createElement("span");
      cell.className = "dp-cell";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dp-day";
      btn.textContent = date.getDate();
      btn.setAttribute("aria-label", longDate(date));
      cell.appendChild(btn);

      // What's selectable depends on which end we're picking: arrival can be
      // today onwards; while picking a departure, everything before the chosen
      // arrival is out.
      //
      // The floor is the arrival day itself, NOT the day after it. Using
      // arrival+1 disabled the arrival cell, which then took the early return
      // below and never got its selected styling - so the date you had just
      // picked rendered as unavailable. Clicking the arrival day is meaningful
      // anyway: choose() reads it as "actually, start here instead".
      var min = picking === "departure" && arrival ? arrival : today;
      if (date < min) {
        btn.disabled = true;
        btn.classList.add("dp-disabled");
        return cell;
      }

      if (same(date, today)) btn.classList.add("dp-today");

      var isStart = arrival && same(date, arrival);
      var isEnd = departure && same(date, departure);
      if (isStart) btn.classList.add("dp-selected");
      if (isEnd) btn.classList.add("dp-selected");

      // Shade the nights between the two ends -- including a live preview of
      // the range while the visitor is still hovering a departure date.
      var rangeEnd = departure || (picking === "departure" ? hovered : null);
      var hasRange = arrival && rangeEnd && rangeEnd > arrival;
      if (hasRange && date > arrival && date < rangeEnd) cell.classList.add("dp-in-range");
      if (hasRange && isStart) cell.classList.add("dp-range-start");
      if (hasRange && rangeEnd && same(date, rangeEnd)) cell.classList.add("dp-range-end");

      btn.addEventListener("click", function () { choose(date); });
      btn.addEventListener("mouseenter", function () {
        if (picking === "departure" && !departure) { hovered = date; render(); }
      });
      return cell;
    }

    function choose(date) {
      if (picking === "arrival") {
        arrival = date;
        // A stay is at least one night, so an arrival on/after the current
        // departure invalidates it -- drop it and let them pick again.
        if (!departure || departure <= date) departure = null;
        picking = "departure";
        hovered = null;
      } else {
        // Clicking on or before arrival reads as "actually, start here".
        if (date <= arrival) {
          arrival = date;
          departure = null;
        } else {
          departure = date;
        }
      }
      commit();
      render();
      updateOpenState();
      if (arrival && departure) setTimeout(close, 180); // let the fill-in be seen
    }

    function renderSummary() {
      if (arrival && departure) {
        var nights = Math.round((departure - arrival) / 86400000);
        summaryEl.textContent = shortDate(arrival) + " → " + shortDate(departure) +
          "  ·  " + nights + (nights === 1 ? " night" : " nights");
      } else if (arrival) {
        summaryEl.textContent = shortDate(arrival) + " → select your departure date";
      } else {
        summaryEl.textContent = "Select your arrival date";
      }
    }

    /* Push the chosen dates into the hidden inputs and the field labels. */
    function commit() {
      arrivalInput.value = arrival ? fmtDate(arrival) : "";
      departureInput.value = departure ? fmtDate(departure) : "";
      setFieldText("arrival", arrival);
      setFieldText("departure", departure);
    }

    function setFieldText(which, date) {
      var btn = widget.querySelector('[data-date-open="' + which + '"]');
      if (!btn) return;
      var textEl = btn.querySelector(".bw-date-text");
      if (date) {
        textEl.textContent = shortDate(date);
        textEl.classList.remove("dp-placeholder");
      } else {
        textEl.textContent = which === "arrival" ? "Add date" : "Add date";
        textEl.classList.add("dp-placeholder");
      }
    }

    function updateOpenState() {
      openers.forEach(function (btn) {
        var which = btn.getAttribute("data-date-open");
        btn.classList.toggle("active", open && picking === which);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    function openPicker(which) {
      picking = which;
      // Departure can't be picked before an arrival exists.
      if (which === "departure" && !arrival) picking = "arrival";
      hovered = null;
      var anchor = picking === "departure" && departure ? departure : (arrival || today);
      view = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      open = true;
      dp.hidden = false;
      render();
      updateOpenState();
    }

    function close() {
      open = false;
      dp.hidden = true;
      hovered = null;
      updateOpenState();
    }

    openers.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var which = btn.getAttribute("data-date-open");
        if (open && picking === which) close();
        else openPicker(which);
      });
    });

    prevBtn.addEventListener("click", function () {
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      render();
    });
    nextBtn.addEventListener("click", function () {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      render();
    });
    doneBtn.addEventListener("click", close);
    clearBtn.addEventListener("click", function () {
      arrival = null;
      departure = null;
      picking = "arrival";
      hovered = null;
      commit();
      render();
      updateOpenState();
    });

    dp.addEventListener("click", function (e) { e.stopPropagation(); });
    document.addEventListener("click", function () { if (open) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) close();
    });
    // Crossing the one/two-month breakpoint has to redraw the grid, and any
    // resize or scroll moves the field the calendar is anchored to.
    window.addEventListener("resize", function () { if (open) render(); });
    window.addEventListener("scroll", function () { if (open) position(); }, { passive: true });

    commit();
    render();
  }

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function same(a, b) { return a && b && a.getTime() === b.getTime(); }
  function shortDate(d) {
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  }
  function longDate(d) {
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  /* ---------------- Lightbox (works across every photo on the page) ---------------- */
  function initLightbox() {
    var lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    var imgEl = lightbox.querySelector("img");
    var captionEl = lightbox.querySelector(".lightbox-caption");
    var closeBtn = lightbox.querySelector(".lightbox-close");
    var prevBtn = lightbox.querySelector(".lightbox-nav.lightbox-prev, .lightbox-prev");
    var nextBtn = lightbox.querySelector(".lightbox-nav.lightbox-next, .lightbox-next");
    var all = Array.prototype.slice.call(document.querySelectorAll(".gallery-grid img"));
    var idx = 0;

    function show(i) {
      if (!all.length) return;
      idx = (i + all.length) % all.length;
      var el = all[idx];
      imgEl.src = el.getAttribute("src");
      captionEl.textContent = el.getAttribute("alt") || "";
    }

    document.querySelectorAll(".gallery-grid figure").forEach(function (fig) {
      fig.addEventListener("click", function () {
        var img = fig.querySelector("img");
        idx = all.indexOf(img);
        if (idx < 0) idx = 0;
        show(idx);
        lightbox.classList.add("open");
      });
    });

    closeBtn.addEventListener("click", function () { lightbox.classList.remove("open"); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) lightbox.classList.remove("open"); });
    prevBtn.addEventListener("click", function () { show(idx - 1); });
    nextBtn.addEventListener("click", function () { show(idx + 1); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") lightbox.classList.remove("open");
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  window.openBookingModal = openBookingModal;
})();
