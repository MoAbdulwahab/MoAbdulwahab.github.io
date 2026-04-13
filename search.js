(function () {
  var INDEX = [
    { title: "Off-Plan vs Ready Property in Dubai: Which Has Better ROI in 2026?", url: "/blog/off-plan-vs-ready-property-dubai.html", type: "Blog", desc: "Side-by-side comparison of off-plan and ready property returns — capital appreciation, yields, payment plan advantages." },
    { title: "How to Get a Golden Visa Through Dubai Property Investment", url: "/blog/golden-visa-dubai-property-investment.html", type: "Blog", desc: "Qualifying thresholds, eligible property types, and the step-by-step UAE Golden Visa process." },
    { title: "Best Areas for Rental Yield in Dubai 2026", url: "/blog/best-areas-rental-yield-dubai-2026.html", type: "Blog", desc: "Data-backed breakdown of the highest-yielding areas — JVC to Dubai Marina, net yields and occupancy rates." },
    { title: "Dubai Townhouses & Villas: Why Demand Is Outpacing Supply", url: "/blog/dubai-townhouses-villas-demand-supply.html", type: "Blog", desc: "Severe supply shortage in the villa and townhouse segment. Off-plan launches sell out in hours." },
    { title: "Dubai Creek Harbour: The Complete Investment Guide 2026", url: "/blog/dubai-creek-harbour-investment-guide-2026.html", type: "Blog", desc: "Blue Line metro arriving, Creek Tower rising — prices, yields, off-plan ROI, and why this is Dubai's most-watched community." },
    { title: "Dubai Property Market Forecast 2026", url: "/blog/dubai-property-market-forecast-2026.html", type: "Blog", desc: "Where prices are heading, which segments outperform, and where smart money is moving across villas and apartments." },
    { title: "Dubailand: Villa & Townhouse Investment Guide 2026", url: "/blog/dubailand-villa-townhouse-investment-guide-2026.html", type: "Blog", desc: "Villanova, DAMAC Hills, Arabian Ranches III, Serena, Rukan — every major community compared with real price data." },
    { title: "Dubai 2040 Urban Master Plan: What It Means for Property Investors", url: "/blog/dubai-2040-urban-master-plan-property-investment.html", type: "Blog", desc: "Five urban centres, Metro Blue Line impact, population growth targets, and areas to watch through 2040." },
    { title: "Downtown Dubai: Investment Guide", url: "/areas/downtown-dubai.html", type: "Area", desc: "Burj Khalifa district — prices, rental yields, and investment outlook for Dubai's iconic centre." },
    { title: "Dubai Marina: Investment Guide", url: "/areas/dubai-marina.html", type: "Area", desc: "Waterfront living, strong rental demand, and capital growth in Dubai Marina." },
    { title: "Jumeirah Village Circle (JVC): Investment Guide", url: "/areas/jumeirah-village-circle.html", type: "Area", desc: "Dubai's top-yielding affordable community — buy-to-let numbers and off-plan picks." },
    { title: "Services", url: "/services/", type: "Page", desc: "Off-plan advisory, portfolio strategy, deal sourcing, and investor support." },
    { title: "Investment Calculator", url: "/calculator/", type: "Page", desc: "Model Off-Plan Flip, Ready Property, or Off-Plan Hold strategies — full financial breakdown with lead capture." },
    { title: "Blog & Insights", url: "/blog/", type: "Page", desc: "Data-driven analysis and practical guides for Dubai real estate investors." },
    { title: "Investor Playbook", url: "/playbook/", type: "Page", desc: "Step-by-step guide to buying off-plan property in Dubai from reservation to handover." },
    { title: "About Mohamed Abdulwahab", url: "/about/", type: "Page", desc: "Licensed Dubai property broker specialising in off-plan investments for international buyers." },
    { title: "Privacy Policy", url: "/privacy/", type: "Page", desc: "How we collect, use, and protect your personal data." },
    { title: "Terms & Conditions", url: "/terms/", type: "Page", desc: "Terms of use for this website and the Investment Analyser tool." }
  ];

  function injectSearchButton() {
    var navInner = document.querySelector('.nav-inner');
    var navLinks = document.querySelector('#nav-links');
    var toggle = document.querySelector('.nav-toggle');
    if (!navInner) return;

    var svgIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/></svg>';

    // Desktop: search icon inside nav-links, before the CTA
    if (navLinks) {
      var li = document.createElement('li');
      li.className = 'nav-search-li';
      var btn = document.createElement('button');
      btn.className = 'search-btn search-btn-desktop';
      btn.id = 'search-open-btn';
      btn.setAttribute('aria-label', 'Search');
      btn.innerHTML = svgIcon;
      btn.addEventListener('click', openSearch);
      li.appendChild(btn);
      // Insert before the last li (Request Access CTA)
      var lastLi = navLinks.lastElementChild;
      navLinks.insertBefore(li, lastLi);
    }

    // Mobile: always-visible search icon in nav-inner (next to toggle)
    var mobileBtn = document.createElement('button');
    mobileBtn.className = 'search-btn search-btn-mobile';
    mobileBtn.setAttribute('aria-label', 'Search');
    mobileBtn.innerHTML = svgIcon;
    mobileBtn.addEventListener('click', openSearch);
    if (toggle) {
      navInner.insertBefore(mobileBtn, toggle);
    } else {
      navInner.appendChild(mobileBtn);
    }
  }

  function injectOverlay() {
    var overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'search-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Site search');
    overlay.innerHTML = [
      '<div class="search-overlay-inner">',
      '  <div class="search-input-wrap">',
      '    <span class="search-input-icon">',
      '      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35"/></svg>',
      '    </span>',
      '    <input id="search-input" type="text" placeholder="Search articles, areas, tools..." autocomplete="off" spellcheck="false" />',
      '    <button class="search-close-btn" id="search-close-btn" aria-label="Close search">',
      '      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
      '    </button>',
      '  </div>',
      '  <p class="search-hint">↑↓ navigate &nbsp;·&nbsp; Enter to open &nbsp;·&nbsp; Esc to close</p>',
      '  <div class="search-results" id="search-results"></div>',
      '</div>'
    ].join('');
    document.body.appendChild(overlay);

    document.getElementById('search-close-btn').addEventListener('click', closeSearch);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });
    document.getElementById('search-input').addEventListener('input', onInput);
    document.getElementById('search-input').addEventListener('keydown', onKeydown);
  }

  var activeIndex = -1;

  function openSearch() {
    var overlay = document.getElementById('search-overlay');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(function () {
      document.getElementById('search-input').focus();
    }, 50);
    renderResults('');
    activeIndex = -1;
  }

  function closeSearch() {
    var overlay = document.getElementById('search-overlay');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('search-input').value = '';
    document.getElementById('search-results').innerHTML = '';
    activeIndex = -1;
  }

  function onInput(e) {
    activeIndex = -1;
    renderResults(e.target.value.trim());
  }

  function onKeydown(e) {
    var results = document.querySelectorAll('.search-result-item');
    if (e.key === 'Escape') { closeSearch(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, results.length - 1);
      updateActive(results);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      updateActive(results);
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      results[activeIndex].click();
    }
  }

  function updateActive(results) {
    results.forEach(function (el, i) {
      el.classList.toggle('active', i === activeIndex);
    });
    if (results[activeIndex]) {
      results[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function renderResults(query) {
    var container = document.getElementById('search-results');
    var filtered = query.length === 0 ? INDEX : INDEX.filter(function (item) {
      var q = query.toLowerCase();
      return item.title.toLowerCase().indexOf(q) !== -1 ||
             item.desc.toLowerCase().indexOf(q) !== -1 ||
             item.type.toLowerCase().indexOf(q) !== -1;
    });

    if (query.length > 0 && filtered.length === 0) {
      container.innerHTML = '<p class="search-no-results">No results for "' + escapeHtml(query) + '"</p>';
      return;
    }

    container.innerHTML = filtered.map(function (item, i) {
      var badgeClass = item.type === 'Blog' ? 'blog' : item.type === 'Area' ? 'area' : 'page';
      return [
        '<a class="search-result-item" href="' + item.url + '" tabindex="-1">',
        '  <span class="search-result-badge ' + badgeClass + '">' + item.type + '</span>',
        '  <span class="search-result-text">',
        '    <span class="search-result-title">' + escapeHtml(item.title) + '</span>',
        '    <span class="search-result-desc">' + escapeHtml(item.desc) + '</span>',
        '  </span>',
        '  <svg class="search-result-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6"/></svg>',
        '</a>'
      ].join('');
    }).join('');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Keyboard shortcut: / or Cmd+K / Ctrl+K
  document.addEventListener('keydown', function (e) {
    var overlay = document.getElementById('search-overlay');
    if (!overlay) return;
    if (overlay.classList.contains('open')) return;
    var tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if ((e.key === '/' ) || ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
      e.preventDefault();
      openSearch();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      injectSearchButton();
      injectOverlay();
    });
  } else {
    injectSearchButton();
    injectOverlay();
  }
})();
