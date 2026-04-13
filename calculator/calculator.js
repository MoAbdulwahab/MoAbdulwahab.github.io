/* ══════════════════════════════════════════════════════
   DUBAI PROPERTY INVESTMENT CALCULATOR
   All three strategies: Flip · Ready · Hold
   DLD = 4% shown explicitly in every breakdown
══════════════════════════════════════════════════════ */

/* ── Formatters ───────────────────────────────────── */
function fmt(n) {
  return 'AED ' + Math.round(Math.abs(n)).toLocaleString();
}
function fmtSigned(n) {
  return (n < 0 ? '– ' : '') + fmt(n);
}
function fmtPct(n) { return n.toFixed(1) + '%'; }
function fmtX(n)   { return n.toFixed(2) + 'x'; }

/* ── Navigation ───────────────────────────────────── */
function showCalc(strategy) {
  document.getElementById('strategy-selector').style.display = 'none';
  document.querySelectorAll('.calc-section').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById('calc-' + strategy).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToSelector() {
  document.querySelectorAll('.calc-section').forEach(function(s) {
    s.classList.remove('active');
  });
  document.getElementById('strategy-selector').style.display = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── Lead Gate ────────────────────────────────────── */
var _pendingResults  = null;
var _leadCaptured    = false;
var _currentStrategy = '';

function showResults(strategy, html) {
  _currentStrategy = strategy;
  if (_leadCaptured) {
    applyResults(strategy, html);
  } else {
    _pendingResults = { strategy: strategy, html: html };
    document.getElementById('lead-modal').classList.add('open');
  }
}

function applyResults(strategy, html) {
  var el = document.getElementById(strategy + '-results');
  el.innerHTML = html;
  el.style.display = 'block';
  document.getElementById(strategy + '-locked').style.display = 'none';
  setTimeout(function() {
    var panel = document.getElementById(strategy + '-results-panel');
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 120);
}

function submitLead() {
  var name  = (document.getElementById('lead-name').value || '').trim();
  var email = (document.getElementById('lead-email').value || '').trim();
  var phone = (document.getElementById('lead-phone').value || '').trim();
  var errEl = document.getElementById('lead-error');

  if (!name || !email || !phone) {
    errEl.classList.add('show');
    return;
  }
  errEl.classList.remove('show');
  _leadCaptured = true;
  document.getElementById('lead-modal').classList.remove('open');

  if (_pendingResults) {
    applyResults(_pendingResults.strategy, _pendingResults.html);
    _pendingResults = null;
  }

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: '78092144-5fbb-45d4-9d01-5056b58d5eb1',
      subject: 'New Calculator Lead — ' + _currentStrategy,
      from_name: 'MA Investment Calculator',
      name: name, email: email, phone: phone,
      strategy: _currentStrategy
    })
  }).catch(function() {});
}

/* ── HTML Block Helpers ───────────────────────────── */
function resultsHeader(label, sub) {
  return '<div class="results-header">' +
    '<div class="strategy-label">' + label + '</div>' +
    '<h3>' + sub + '</h3></div>';
}

function kpiCard(label, value, cls) {
  return '<div class="kpi-card' + (cls ? ' ' + cls : '') + '">' +
    '<div class="kpi-label">' + label + '</div>' +
    '<div class="kpi-value' + (cls === 'accent-card' ? ' positive' : '') + '">' + value + '</div>' +
    '</div>';
}

function breakdown(title, rows, accentBorder) {
  var style = accentBorder
    ? ' style="border-left:3px solid ' + accentBorder + ';padding-left:15px;"'
    : '';
  var titleStyle = accentBorder
    ? ' style="color:' + accentBorder + ';"'
    : '';
  var html = '<div class="result-breakdown"' + style + '>';
  html += '<h4' + titleStyle + '>' + title + '</h4>';
  rows.forEach(function(r) {
    html += '<div class="breakdown-row">' +
      '<span class="br-label">' + r[0] + '</span>' +
      '<span class="br-value' + (r[2] ? ' ' + r[2] : '') + '">' + r[1] + '</span>' +
      '</div>';
  });
  return html + '</div>';
}

function ctaBox() {
  return '<div class="cta-box"><p>These projections are illustrative. Book a strategy call to stress-test your deal with live Dubai market data.</p>' +
    '<a href="/about/#contact">Book a Strategy Call →</a></div>';
}

function pdfBtn() {
  return '<button class="pdf-btn" onclick="window.print()">' +
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">' +
    '<path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>' +
    'Save as PDF / Print</button>';
}

/* ════════════════════════════════════════════════════
   STRATEGY 1 — OFF-PLAN FLIP
   Buy off-plan, sell via assignment at/near handover.
   DLD paid at purchase; shown in entry costs.
════════════════════════════════════════════════════ */
function calcFlip() {
  var P         = parseFloat(document.getElementById('flip-price').value);
  var dpPct     = parseFloat(document.getElementById('flip-dp').value) / 100;
  var constrPct = parseFloat(document.getElementById('flip-constr').value) / 100;
  var years     = parseInt(document.getElementById('flip-years').value);
  var apprPct   = parseFloat(document.getElementById('flip-appr').value) / 100;
  var dldPct    = parseFloat(document.getElementById('flip-dld').value) / 100;

  var dp           = dpPct * P;
  var constrPaid   = constrPct * P;
  var dld          = dldPct * P;
  var remainingBal = Math.max(0, 1 - dpPct - constrPct) * P;
  var totalCashIn  = dp + constrPaid + dld;

  var fvHandover       = P * Math.pow(1 + apprPct, years);
  var appreciationGain = fvHandover - P;
  var assignProceeds   = fvHandover - remainingBal;
  var netProfit        = assignProceeds - totalCashIn;
  var roi              = (netProfit / totalCashIn) * 100;
  var annROI           = (Math.pow(1 + Math.abs(roi / 100), 1 / years) - 1) * 100 * (roi < 0 ? -1 : 1);
  var multiple         = (totalCashIn + netProfit) / totalCashIn;

  var html = resultsHeader('Off-Plan Flip', 'Investment Analysis');

  html += '<div class="kpi-grid">';
  html += kpiCard('Net Profit', fmt(netProfit), netProfit >= 0 ? 'accent-card' : '');
  html += kpiCard('Annualised Return', fmtPct(annROI), '');
  html += kpiCard('ROI on Cash', fmtPct(roi), '');
  html += kpiCard('Equity Multiple', fmtX(multiple), '');
  html += '</div>';

  html += breakdown('Entry Costs — What You Pay', [
    ['Down Payment (' + (dpPct * 100).toFixed(0) + '%)', fmt(dp)],
    ['Construction Payments (' + (constrPct * 100).toFixed(0) + '%)', fmt(constrPaid)],
    ['DLD Fee (' + (dldPct * 100).toFixed(0) + '% of purchase price)', fmt(dld), 'amber'],
    ['Remaining Developer Balance (not paid)', fmtSigned(remainingBal)],
    ['Total Cash Deployed', fmt(totalCashIn), 'amber']
  ]);

  html += breakdown('Exit Analysis — Property at Handover', [
    ['Purchase Price (Day 1)', fmt(P)],
    ['Annual Appreciation', fmtPct(apprPct * 100) + ' × ' + years + ' yrs'],
    ['Property Value at Handover', fmt(fvHandover), 'green'],
    ['Less: Developer Balance (taken on by buyer)', '– ' + fmt(remainingBal)],
    ['Your Net Assignment Proceeds', fmt(assignProceeds), 'green'],
    ['Appreciation Gain', fmt(appreciationGain), 'green']
  ]);

  html += breakdown('Return Summary', [
    ['Total Cash Deployed', fmt(totalCashIn)],
    ['DLD (4%)', fmt(dld), 'amber'],
    ['Net Proceeds from Assignment', fmt(assignProceeds)],
    ['Net Profit', fmt(netProfit), netProfit >= 0 ? 'green' : ''],
    ['Total ROI on Cash', fmtPct(roi)],
    ['Annualised Return', fmtPct(annROI), 'amber'],
    ['Equity Multiple', fmtX(multiple)]
  ]);

  html += ctaBox();
  html += pdfBtn();
  showResults('flip', html);
}

/* ════════════════════════════════════════════════════
   STRATEGY 2 — READY PROPERTY
   Full cash purchase. 4% DLD + 2% agent at entry.
   Rental income from day one. Exit after hold period.
════════════════════════════════════════════════════ */
function calcReady() {
  var P         = parseFloat(document.getElementById('ready-price').value);
  var rent      = parseFloat(document.getElementById('ready-rent').value);
  var size      = parseFloat(document.getElementById('ready-size').value);
  var rate      = parseFloat(document.getElementById('ready-rate').value);
  var expenses  = parseFloat(document.getElementById('ready-expenses').value);
  var apprPct   = parseFloat(document.getElementById('ready-appr').value) / 100;
  var holdYears = parseInt(document.getElementById('ready-hold').value);

  var dld          = 0.04 * P;
  var agentEntry   = 0.02 * P;
  var totalIn      = P + dld + agentEntry;

  var serviceCharge    = size * rate;
  var netAnnualIncome  = rent - serviceCharge - expenses;
  var grossYield       = (rent / P) * 100;
  var netYield         = (netAnnualIncome / totalIn) * 100;

  var exitValue    = P * Math.pow(1 + apprPct, holdYears);
  var exitAgentFee = 0.02 * exitValue;
  var netExitValue = exitValue - exitAgentFee;
  var capitalGain  = netExitValue - P;

  var totalNetRent = netAnnualIncome * holdYears;
  var netProfit    = totalNetRent + netExitValue - totalIn;
  var totalROI     = (netProfit / totalIn) * 100;
  var annROI       = (Math.pow(1 + Math.abs(totalROI / 100), 1 / holdYears) - 1) * 100 * (totalROI < 0 ? -1 : 1);
  var scCoverage   = (rent / serviceCharge).toFixed(1) + 'x';

  var html = resultsHeader('Ready Property', 'Rental Yield Analysis');

  html += '<div class="kpi-grid">';
  html += kpiCard('Gross Yield', fmtPct(grossYield), 'accent-card');
  html += kpiCard('Net Yield', fmtPct(netYield), '');
  html += kpiCard('Net Profit (' + holdYears + ' yrs)', fmt(netProfit), '');
  html += kpiCard('Annualised ROI', fmtPct(annROI), '');
  html += '</div>';

  html += breakdown('Acquisition Costs (Full Cash)', [
    ['Purchase Price', fmt(P)],
    ['DLD Fee (4%)', fmt(dld), 'amber'],
    ['Agency Fee (2%)', fmt(agentEntry)],
    ['Total Cash Invested', fmt(totalIn), 'amber']
  ]);

  html += breakdown('Annual Income & Expenses', [
    ['Gross Annual Rent', fmt(rent), 'green'],
    ['Service Charge (' + rate + ' AED/sqft × ' + size.toLocaleString() + ' sqft)', '– ' + fmt(serviceCharge)],
    ['Other Annual Expenses', '– ' + fmt(expenses)],
    ['Net Annual Income', fmt(netAnnualIncome), netAnnualIncome >= 0 ? 'green' : ''],
    ['Rent ÷ Service Charge Coverage', scCoverage]
  ]);

  html += breakdown('Exit After ' + holdYears + ' Year' + (holdYears !== 1 ? 's' : ''), [
    ['Property Value at Exit', fmt(exitValue)],
    ['DLD (4%) — paid at entry, not exit', fmt(dld), 'amber'],
    ['Exit Agency Fee (2%)', '– ' + fmt(exitAgentFee)],
    ['Net Sale Proceeds', fmt(netExitValue), 'green'],
    ['Capital Gain (net of exit agent)', fmt(capitalGain), 'green']
  ]);

  html += breakdown('Full ' + holdYears + '-Year Summary', [
    ['Total Cash Invested (incl. 4% DLD)', fmt(totalIn)],
    ['Total Net Rental Income', fmt(totalNetRent), 'green'],
    ['Net Sale Proceeds', fmt(netExitValue), 'green'],
    ['Net Profit', fmt(netProfit), netProfit >= 0 ? 'green' : ''],
    ['Total ROI', fmtPct(totalROI)],
    ['Annualised ROI', fmtPct(annROI), 'amber']
  ]);

  html += ctaBox();
  html += pdfBtn();
  showResults('ready', html);
}

/* ════════════════════════════════════════════════════
   STRATEGY 3 — OFF-PLAN HOLD (POST-HANDOVER)
   Phase 1: Off-plan construction (4% DLD at purchase)
   Phase 2: Rent post-handover, pay instalment plan
   Summary: Full investment picture
════════════════════════════════════════════════════ */
function calcHold() {
  var P         = parseFloat(document.getElementById('hold-price').value);
  var dpPct     = parseFloat(document.getElementById('hold-dp').value) / 100;
  var constrPct = parseFloat(document.getElementById('hold-constr').value) / 100;
  var postPct   = parseFloat(document.getElementById('hold-post').value) / 100;
  var cperiod   = parseInt(document.getElementById('hold-cperiod').value);
  var pperiod   = parseInt(document.getElementById('hold-pperiod').value);
  var rent      = parseFloat(document.getElementById('hold-rent').value);
  var size      = parseFloat(document.getElementById('hold-size').value);
  var rate      = parseFloat(document.getElementById('hold-rate').value);
  var apprPct   = parseFloat(document.getElementById('hold-appr').value) / 100;

  /* ── Phase 1: Off-Plan ── */
  var dp           = dpPct * P;
  var constrPaid   = constrPct * P;
  var postBalance  = postPct * P;
  var dld          = 0.04 * P;
  var phase1Cash   = dp + constrPaid + dld;

  var fvHandover  = P * Math.pow(1 + apprPct, cperiod);
  var offPlanGain = fvHandover - P;

  /* ── Phase 2: Post-Handover Rental ── */
  var annualInstalment    = postBalance / pperiod;
  var serviceCharge       = size * rate;
  var netAnnualRent       = rent - serviceCharge;
  var annualCashFlow      = netAnnualRent - annualInstalment;
  var totalGrossRent      = rent * pperiod;
  var totalServiceCharge  = serviceCharge * pperiod;
  var totalNetRent        = netAnnualRent * pperiod;
  var tenantCovPct        = (rent / annualInstalment) * 100;
  var grossYield          = (rent / fvHandover) * 100;
  var netYield            = (netAnnualRent / fvHandover) * 100;

  /* ── Full Summary ── */
  var totalCashPaid     = phase1Cash + postBalance;
  var netCashFromPocket = totalCashPaid - totalGrossRent;
  var netProfit         = offPlanGain - dld + totalNetRent;
  var totalYears        = cperiod + pperiod;
  var roi               = (netProfit / Math.abs(netCashFromPocket)) * 100;
  var annROI            = (Math.pow(1 + Math.abs(roi / 100), 1 / totalYears) - 1) * 100 * (roi < 0 ? -1 : 1);

  var html = resultsHeader('Off-Plan Hold', 'Full ' + totalYears + '-Year Investment Analysis');

  /* Phase 1 block */
  html += breakdown(
    'Phase 1 — Off-Plan Construction (' + cperiod + ' year' + (cperiod > 1 ? 's' : '') + ')',
    [
      ['Purchase Price', fmt(P)],
      ['Down Payment (' + (dpPct * 100).toFixed(0) + '%)', fmt(dp)],
      ['Construction Payments (' + (constrPct * 100).toFixed(0) + '%)', fmt(constrPaid)],
      ['DLD Fee (4% of purchase price)', fmt(dld), 'amber'],
      ['Phase 1 Total Cash Out', fmt(phase1Cash), 'amber'],
      ['Annual Appreciation During Construction', fmtPct(apprPct * 100) + ' p.a.'],
      ['Property Value at Handover', fmt(fvHandover), 'green'],
      ['Off-Plan Capital Gain', fmt(offPlanGain), 'green']
    ],
    'var(--color-accent)'
  );

  /* Phase 2 block */
  html += breakdown(
    'Phase 2 — Post-Handover Rental (' + pperiod + ' year' + (pperiod > 1 ? 's' : '') + ')',
    [
      ['Post-Handover Balance (' + (postPct * 100).toFixed(0) + '%)', fmt(postBalance)],
      ['Annual Instalment to Developer', fmt(annualInstalment) + ' / yr'],
      ['Annual Gross Rent', fmt(rent) + ' / yr', 'green'],
      ['Annual Service Charge', '– ' + fmt(serviceCharge) + ' / yr'],
      ['Annual Net Rent', fmt(netAnnualRent) + ' / yr', netAnnualRent >= 0 ? 'green' : ''],
      ['Annual Net Cash Flow (rent – instalment)', (annualCashFlow >= 0 ? '+' : '– ') + fmt(Math.abs(annualCashFlow)) + ' / yr', annualCashFlow >= 0 ? 'green' : 'amber'],
      ['Tenant Coverage Ratio', fmtPct(tenantCovPct), tenantCovPct >= 100 ? 'green' : 'amber'],
      ['Gross Yield (on handover value)', fmtPct(grossYield)],
      ['Net Yield (on handover value)', fmtPct(netYield)],
      ['Total Gross Rent Received', fmt(totalGrossRent), 'green'],
      ['Total Net Rent (after service charge)', fmt(totalNetRent), 'green']
    ],
    '#22c55e'
  );

  /* KPI summary grid */
  html += '<div class="kpi-grid">';
  html += kpiCard('Net Cash From Pocket', fmt(netCashFromPocket), '');
  html += kpiCard('Final Property Value', fmt(fvHandover), '');
  html += kpiCard('Net Profit', fmt(netProfit), netProfit >= 0 ? 'accent-card' : '');
  html += kpiCard('Annualised ROI (' + totalYears + ' yrs)', fmtPct(annROI), '');
  html += '</div>';

  html += breakdown('Full ' + totalYears + '-Year Investment Summary', [
    ['Purchase Price', fmt(P)],
    ['DLD Fee (4%)', fmt(dld), 'amber'],
    ['Down Payment + Construction Payments', fmt(dp + constrPaid)],
    ['Post-Handover Instalments Paid', fmt(postBalance)],
    ['Total Cash Paid to Developer + DLD', fmt(totalCashPaid), 'amber'],
    ['Less: Total Gross Rent Received', '– ' + fmt(totalGrossRent), 'green'],
    ['Net Cash From Your Pocket', fmt(netCashFromPocket), 'amber'],
    ['Property Value at Handover', fmt(fvHandover), 'green'],
    ['Off-Plan Capital Gain', fmt(offPlanGain), 'green'],
    ['Total Net Rental Income', fmt(totalNetRent), 'green'],
    ['Net Profit', fmt(netProfit), netProfit >= 0 ? 'green' : ''],
    ['Total ROI', fmtPct(roi)],
    ['Annualised ROI', fmtPct(annROI), 'amber']
  ]);

  html += ctaBox();
  html += pdfBtn();
  showResults('hold', html);
}
