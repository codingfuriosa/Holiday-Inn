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
   setup. CC_EMAIL (a comma-separated list) rides along on the same
   submission, so its addresses should not need a separate activation of
   their own -- but since FormSubmit doesn't document this explicitly, keep
   an eye on those CC inboxes after the first real submission to make sure
   it actually arrived there too.

   IMPORTANT LIMITATION: FormSubmit does not offer any way to change the
   visible "From" sender name/address that recipients see -- it will always
   show as sent by FormSubmit's own service, not as "Holiday Inn Kolkata
   Airport". This is a deliberate anti-abuse restriction shared by every
   free form-to-email relay (allowing arbitrary senders to spoof any brand's
   name would make the service a phishing tool), not something fixable via
   configuration. The most FormSubmit allows is the subject line and email
   body content, which already read "Holiday Inn Kolkata Airport" clearly.
   Actually sending FROM a Holiday Inn identity would require routing mail
   through an account/domain the hotel itself controls (Gmail, Google
   Workspace, or a transactional email provider) instead of FormSubmit.

   Nothing else needs to change here once the site is live — the "Next page"
   redirect (back to thank-you.html) is worked out automatically from
   whatever domain the page is actually running on.
   ========================================================================== */
window.SITE_CONFIG = {
  TO_EMAIL: "ai@thejaingroup.com",
  CC_EMAIL: "pritesh.zavery@ihg.com,sales4@holidayinnkolairport.com,reservations@holidayinnkolairport.com"
};
