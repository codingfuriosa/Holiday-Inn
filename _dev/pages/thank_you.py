# -*- coding: utf-8 -*-

def render(header_html, footer_html, gtm_head="", gtm_body="", css_v="", js_v=""):
    return """<!DOCTYPE html>
<html lang="en">
<head>
{gtm_head}
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Thank You | Holiday Inn Kolkata Airport</title>
<meta name="description" content="Thank you for your enquiry at Holiday Inn Kolkata Airport.">
<meta name="robots" content="noindex, nofollow">
<link rel="icon" href="assets/icons/favicon.png" type="image/png">
<link rel="stylesheet" href="css/styles.css?v={css_v}">
</head>
<body>
{gtm_body}
{header}
<main id="main">
  <section class="ty-wrap">
    <div class="ty-box">
      <div class="ty-icon">&#10003;</div>
      <h1 id="ty-heading">Thank you!</h1>
      <p id="ty-message">Your enquiry has been received. Our reservations team will get back to you shortly to
      confirm availability and the best rate for your stay at Holiday Inn Kolkata Airport.</p>
      <p><a href="index.html" class="btn btn-primary">Return to Home</a></p>
    </div>
  </section>
</main>
{footer}
<script>
  (function() {{
    try {{
      var name = sessionStorage.getItem("hi_enquiry_name");
      if (name) {{
        document.getElementById("ty-heading").textContent = "Thank you, " + name + "!";
        sessionStorage.removeItem("hi_enquiry_name");
      }}
    }} catch (e) {{ /* ignore */ }}
  }})();
</script>
<!-- This page renders the full site header, which includes the hamburger menu
     and the mobile Book Now bar - both of which are wired up by main.js. It
     was previously omitted here, so the mobile menu simply could not be opened
     on the Thank You page. -->
<script src="js/config.js?v={js_v}"></script>
<script src="js/main.js?v={js_v}"></script>
</body>
</html>
""".format(header=header_html, footer=footer_html, gtm_head=gtm_head, gtm_body=gtm_body,
           css_v=css_v, js_v=js_v)
