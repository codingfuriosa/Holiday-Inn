/* ==========================================================================
   Booking-enquiry email configuration
   --------------------------------------------------------------------------
   Enquiries are sent using FormSubmit (https://formsubmit.co) — a free
   email-relay service that needs NO account, dashboard or API key. It only
   works once the site is hosted at a real https:// address (it can't
   redirect back to a local file:// page), which matches how this site will
   be deployed.

   ONE-TIME ACTIVATION: the very first time someone submits the form after
   the site goes live, FormSubmit sends an activation email to TO_EMAIL
   below, asking to confirm you own that inbox. Click the link in that email
   once — every submission after that (including that very first one, once
   confirmed) delivers straight to the inbox automatically, with no further
   setup.

   Nothing else needs to change here once the site is live — the "Next page"
   redirect (back to thank-you.html) is worked out automatically from
   whatever domain the page is actually running on.
   ========================================================================== */
window.SITE_CONFIG = {
  TO_EMAIL: "ai@thejaingroup.com"
};
