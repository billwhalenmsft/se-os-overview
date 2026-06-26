/*
 * MCAPS OS — Microsoft-internal SOFT gate (GitHub Pages edition).
 *
 * WHY THIS IS A SOFT GATE: GitHub Pages is static hosting with NO server-side
 * auth — the Azure Static Web Apps `/.auth/*` endpoints our SWA gate relies on
 * do not exist here. This is therefore a DISPLAY / honor gate, not a security
 * boundary. It blocks the page from PAINTING until the visitor confirms a
 * Microsoft identity (an @microsoft.com address) and remembers that per browser.
 * A determined external user can still read the raw HTML over the wire.
 *
 * THE DURABLE FIX (hard gate): MSAL.js (browser, PKCE) against a SINGLE-TENANT
 * (microsoft.com) Entra app registration, so only corp identities can sign in;
 * or move the content behind Azure Static Web Apps Standard with corp-tenant
 * auth. Tracked in backlog: mcapsos-identity-msal-corp-tenant.
 *
 * Load this synchronously as the FIRST element in <head> so it blocks paint
 * before any content renders. It auto-themes from the page's --cp-* variables
 * and the html[data-theme] attribute.
 */
(function () {
  "use strict";
  var ALLOW = /@microsoft\.com\s*$/i;
  var KEY = "mcapsos.gate.v1";
  var root = document.documentElement;

  // Block paint immediately — content stays invisible until the gate passes.
  root.style.visibility = "hidden";

  function reveal() {
    var ov = document.getElementById("mcapsos-gate");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    root.style.visibility = "visible";
  }

  function remembered() {
    try {
      var s = JSON.parse(localStorage.getItem(KEY) || "null");
      return s && s.ok && ALLOW.test(s.email || "");
    } catch (e) { return false; }
  }

  if (remembered()) { reveal(); return; }

  function whenReady(fn) {
    if (document.body) { fn(); }
    else { document.addEventListener("DOMContentLoaded", fn); }
  }

  whenReady(function () {
    var ov = document.createElement("div");
    ov.id = "mcapsos-gate";
    // The overlay sets its OWN visibility:visible so it shows while the page
    // body behind it stays visibility:hidden (and therefore unpainted).
    ov.style.cssText =
      "visibility:visible;position:fixed;inset:0;z-index:2147483647;box-sizing:border-box;" +
      "display:flex;align-items:center;justify-content:center;padding:24px;" +
      "background:var(--cp-bg,#f7f4ef);color:var(--cp-text,#242424);" +
      "font-family:'Segoe UI',Aptos,Calibri,-apple-system,BlinkMacSystemFont,sans-serif";

    ov.innerHTML =
      "<div style=\"max-width:440px;width:100%;background:var(--cp-surface,#fff);" +
      "border:1px solid var(--cp-border,#dedede);border-radius:16px;padding:30px 28px;" +
      "box-shadow:0 18px 48px rgba(0,0,0,.18);text-align:center\">" +
        "<svg width=\"30\" height=\"30\" viewBox=\"0 0 23 23\" aria-hidden=\"true\" style=\"margin-bottom:14px\">" +
          "<rect x=\"1\" y=\"1\" width=\"10\" height=\"10\" fill=\"#F25022\"/>" +
          "<rect x=\"12\" y=\"1\" width=\"10\" height=\"10\" fill=\"#7FBA00\"/>" +
          "<rect x=\"1\" y=\"12\" width=\"10\" height=\"10\" fill=\"#00A4EF\"/>" +
          "<rect x=\"12\" y=\"12\" width=\"10\" height=\"10\" fill=\"#FFB900\"/></svg>" +
        "<div style=\"font-size:.68rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;" +
          "color:var(--cp-accent,#b11f4b);margin-bottom:6px\">Microsoft internal preview</div>" +
        "<h1 style=\"font-size:1.35rem;margin:0 0 8px;font-weight:850;letter-spacing:-.01em\">MCAPS&nbsp;OS</h1>" +
        "<p style=\"color:var(--cp-text-muted,#5c5c5c);margin:0 0 20px;line-height:1.5;font-size:.92rem\">" +
          "This is an internal preview for Microsoft field teams. Confirm your Microsoft identity to continue.</p>" +
        "<form id=\"mcapsos-gate-form\" novalidate>" +
          "<input id=\"mcapsos-gate-email\" type=\"email\" autocomplete=\"email\" " +
            "placeholder=\"you@microsoft.com\" aria-label=\"Microsoft email\" " +
            "style=\"width:100%;box-sizing:border-box;padding:11px 13px;font-size:.95rem;font-family:inherit;" +
            "border:1px solid var(--cp-border-strong,#919191);border-radius:9px;" +
            "background:var(--cp-bg-elevated,#fcfbf8);color:var(--cp-text,#242424);outline:none\"/>" +
          "<div id=\"mcapsos-gate-err\" role=\"alert\" style=\"min-height:18px;color:var(--cp-danger,#dc2626);" +
            "font-size:.8rem;margin:8px 0 4px;text-align:left\"></div>" +
          "<button type=\"submit\" style=\"width:100%;padding:11px 18px;font-size:.95rem;font-weight:700;" +
            "font-family:inherit;border:0;border-radius:9px;cursor:pointer;" +
            "background:var(--cp-accent,#b11f4b);color:var(--cp-accent-fg,#fff)\">Continue</button>" +
        "</form>" +
        "<p style=\"color:var(--cp-text-soft,#6f6f6f);font-size:.72rem;margin:16px 0 0;line-height:1.5\">" +
          "Honor-based internal gate \u00b7 this is a public preview URL \u2014 please don\u2019t share it externally. " +
          "Not a Microsoft employee? This content isn\u2019t available to you.</p>" +
      "</div>";

    document.body.appendChild(ov);

    var form = document.getElementById("mcapsos-gate-form");
    var input = document.getElementById("mcapsos-gate-email");
    var err = document.getElementById("mcapsos-gate-err");
    input.focus();

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (input.value || "").trim();
      if (!ALLOW.test(email)) {
        err.textContent = "Use your @microsoft.com address — this preview is limited to Microsoft employees.";
        input.style.borderColor = "var(--cp-danger,#dc2626)";
        return;
      }
      try { localStorage.setItem(KEY, JSON.stringify({ ok: true, email: email, at: Date.now() })); } catch (e2) {}
      reveal();
    });
  });
})();
