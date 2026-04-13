(function () {
  var KEY = 'ma_cookie_consent';
  var ACCEPTED = 'accepted';
  var DECLINED = 'declined';

  function getConsent() { try { return localStorage.getItem(KEY); } catch(e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(KEY, v); } catch(e) {} }

  function injectStyles() {
    var s = document.createElement('style');
    s.textContent = [
      '.cc-bar{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#111827;border-top:1px solid rgba(184,155,94,0.2);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;font-family:Inter,sans-serif;font-size:0.82rem;color:rgba(255,255,255,0.72);transform:translateY(100%);transition:transform 0.35s cubic-bezier(0.4,0,0.2,1);}',
      '.cc-bar.visible{transform:translateY(0);}',
      '.cc-bar p{margin:0;line-height:1.5;flex:1;min-width:220px;}',
      '.cc-bar p a{color:#b89b5e;text-decoration:underline;}',
      '.cc-bar p a:hover{opacity:0.8;}',
      '.cc-actions{display:flex;gap:10px;flex-shrink:0;}',
      '.cc-btn{border:none;border-radius:5px;padding:9px 20px;font-family:Inter,sans-serif;font-size:0.82rem;font-weight:700;cursor:pointer;transition:opacity 0.18s;}',
      '.cc-btn:hover{opacity:0.85;}',
      '.cc-accept{background:#b89b5e;color:#fff;}',
      '.cc-decline{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.12)!important;}',
    ].join('');
    document.head.appendChild(s);
  }

  function createBar() {
    var bar = document.createElement('div');
    bar.className = 'cc-bar';
    bar.id = 'cc-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML = [
      '<p>We use cookies to improve your experience and analyse site usage. By clicking Accept, you agree to our <a href="/privacy/">Privacy Policy</a>.</p>',
      '<div class="cc-actions">',
      '  <button class="cc-btn cc-decline" id="cc-decline">Decline</button>',
      '  <button class="cc-btn cc-accept" id="cc-accept">Accept</button>',
      '</div>'
    ].join('');
    document.body.appendChild(bar);

    document.getElementById('cc-accept').addEventListener('click', function () {
      setConsent(ACCEPTED);
      hideBar();
    });
    document.getElementById('cc-decline').addEventListener('click', function () {
      setConsent(DECLINED);
      hideBar();
    });

    // Animate in after paint
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.classList.add('visible');
      });
    });
  }

  function hideBar() {
    var bar = document.getElementById('cc-bar');
    if (!bar) return;
    bar.classList.remove('visible');
    setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 400);
  }

  function init() {
    var consent = getConsent();
    if (consent === ACCEPTED || consent === DECLINED) return; // already decided
    injectStyles();
    createBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
