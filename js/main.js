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
    document.querySelectorAll("[data-scroll-target]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
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

  /* ---------------- Booking widget (date defaults + validation) ---------------- */
  function initBookingWidget() {
    document.querySelectorAll(".booking-widget").forEach(function (widget) {
      var arrival = widget.querySelector('[name="arrival"]');
      var departure = widget.querySelector('[name="departure"]');
      if (arrival && departure) {
        var today = new Date();
        var tomorrow = new Date(today.getTime() + 86400000);
        var dayAfter = new Date(today.getTime() + 2 * 86400000);
        arrival.min = fmtDate(today);
        arrival.value = arrival.value || fmtDate(tomorrow);
        departure.min = fmtDate(tomorrow);
        departure.value = departure.value || fmtDate(dayAfter);

        arrival.addEventListener("change", function () {
          var a = new Date(arrival.value);
          var minDep = new Date(a.getTime() + 86400000);
          departure.min = fmtDate(minDep);
          if (new Date(departure.value) <= a) departure.value = fmtDate(minDep);
        });
      }

      var cta = widget.querySelector(".bw-cta button, .bw-cta .btn");
      if (cta) {
        cta.addEventListener("click", function (e) {
          e.preventDefault();
          var rg = widget.querySelector(".rg-widget");
          var summary = rg ? (rg.dataset.summary || rg.querySelector(".rg-button").textContent) : "";
          openBookingModal({
            arrival: arrival ? arrival.value : "",
            departure: departure ? departure.value : "",
            roomsGuests: summary,
            offer: ""
          });
        });
      }
    });

    // "Book Now" / "Enquire Now" buttons on offer, room and event cards open
    // the contact-details form directly - no need to go through the widget.
    document.querySelectorAll("[data-offer-book]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openBookingModal({ offer: btn.getAttribute("data-offer-book") || "" });
      });
    });
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
    // arrival/departure dates; a "Book Now"/"Enquire Now" from an offer,
    // room or event card never does (it only carries an offer name). That
    // distinction is what decides which fields actually get emailed below.
    var isBooking = !!(details.arrival || details.departure);

    var bits = [];
    if (details.arrival) bits.push("Arrival: " + details.arrival);
    if (details.departure) bits.push("Departure: " + details.departure);
    if (details.roomsGuests) bits.push(details.roomsGuests);
    if (details.offer) bits.push("Enquiry: " + details.offer);
    summaryEl.textContent = bits.length ? bits.join(" | ") : "General enquiry";

    // Disabled fields are left out of the submitted FormData entirely, so
    // FormSubmit's emailed table only ever shows rows relevant to this
    // particular enquiry -- a widget booking never shows a blank
    // "Interested In" row, and an offer/room/event enquiry never shows
    // "Not specified" Arrival/Departure/Rooms & Guests rows.
    if (isBooking) {
      setHidden("enquiry_type", "Booking Request");
      setHidden("arrival", details.arrival || "");
      setHidden("departure", details.departure || "");
      setHidden("rooms_guests", details.roomsGuests || "");
      disableField("interested_in");
      setSubject("New Booking Request - Holiday Inn Kolkata Airport");
    } else {
      setHidden("enquiry_type", "General Enquiry");
      setHidden("interested_in", details.offer || "General enquiry (via website)");
      disableField("arrival");
      disableField("departure");
      disableField("rooms_guests");
      setSubject("New Enquiry - Holiday Inn Kolkata Airport" + (details.offer ? " (" + details.offer + ")" : ""));
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
