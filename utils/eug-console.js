// ══════════════════════════════════════════════════════
// EUG Console — Dev Logger + showToast
// ══════════════════════════════════════════════════════

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.style.opacity='1';
  clearTimeout(window._toastTimer);
  window._toastTimer=setTimeout(()=>t.style.opacity='0',2200);
}

  // ── Intercept native console ───────────────────────
  const _origError = console.error.bind(console);
  const _origWarn  = console.warn.bind(console);
  const _origLog   = console.log.bind(console);

  console.error = function(...args) {
    _origError(...args);
    devLog('error', args.map(stringify).join(' '));
  };
  console.warn = function(...args) {
    _origWarn(...args);
    devLog('warn', args.map(stringify).join(' '));
  };
  // Only intercept logs that start with [EUG] or [BP]
  console.log = function(...args) {
    _origLog(...args);
    const msg = args.map(stringify).join(' ');
    if (msg.startsWith('[EUG]') || msg.startsWith('[BP]') || msg.startsWith('[GLB]')) {
      devLog('info', msg);
    }
  };

  // Also catch unhandled errors
  window.addEventListener('error', e => {
    devLog('error', `Uncaught ${e.message} — ${e.filename?.split('/').pop()||''}:${e.lineno}`);
  });
  window.addEventListener('unhandledrejection', e => {
    devLog('error', 'Unhandled Promise: ' + stringify(e.reason));
  });

  function stringify(v) {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'string') return v;
    if (v instanceof Error) return v.message;
    try { return JSON.stringify(v); } catch(e) { return String(v); }
  }

  // ── Core log function ──────────────────────────────
  function devLog(type, message) {
    const now = new Date();
    const ts  = now.getHours().toString().padStart(2,'0') + ':' +
                now.getMinutes().toString().padStart(2,'0') + ':' +
                now.getSeconds().toString().padStart(2,'0');
    const entry = { type, message, ts, id: LOG.length };
    LOG.push(entry);
    if (type === 'error') counts.error++;
    else if (type === 'warn') counts.warn++;
    else counts.info++;

    // Update badge
    _updateBadge();

    // Auto-open on error
    if (type === 'error' && !isOpen) _flashBadge();

    // If open, append row
    if (isOpen) _appendRow(entry);
  }

  // Public API — other parts of engine can call devLog
  window.devLog = devLog;

  // ── Build UI (lazy — only when first opened) ───────
  let _consoleEl = null;

  function _buildUI() {
    if (_consoleEl) return;

    // Floating button — bottom left, above statusbar
    const btn = document.createElement('div');
    btn.id = 'dev-console-btn';
    btn.style.cssText = `
      position:fixed;bottom:32px;left:8px;z-index:900;
      background:#12121e;border:1.5px solid #2a2a3e;border-radius:9px;
      padding:5px 9px;display:flex;align-items:center;gap:5px;
      cursor:pointer;touch-action:manipulation;user-select:none;
      font-size:11px;font-family:system-ui;color:#8080b0;
      box-shadow:0 2px 12px rgba(0,0,0,.5);transition:border-color .2s;
    `;
    btn.innerHTML = `
      <span style="font-size:13px">🖥</span>
      <span id="dcb-label">Console</span>
      <span id="dcb-err"  style="display:none;background:#e05555;color:#fff;border-radius:4px;padding:1px 5px;font-size:9px;font-weight:800">0</span>
      <span id="dcb-warn" style="display:none;background:#f5a623;color:#000;border-radius:4px;padding:1px 5px;font-size:9px;font-weight:800">0</span>
    `;
    btn.addEventListener('click',    toggleConsole);
    btn.addEventListener('touchend', e=>{ e.preventDefault(); toggleConsole(); });
    document.body.appendChild(btn);

    // Console panel
    const panel = document.createElement('div');
    panel.id = 'dev-console-panel';
    panel.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;height:52vh;
      background:#0d0d16;border-top:2px solid #2a2a3e;
      z-index:901;display:none;flex-direction:column;
      font-family:'Courier New',monospace;
    `;
    document.body.appendChild(panel);
    _consoleEl = panel;

    // Header
    const hdr = document.createElement('div');
    hdr.style.cssText = 'display:flex;align-items:center;padding:6px 10px;background:#10101c;border-bottom:1px solid #2a2a3e;gap:6px;flex-shrink:0;';
    panel.appendChild(hdr);

    // Title
    const ttl = document.createElement('span');
    ttl.style.cssText = 'font-size:12px;font-weight:700;color:#5b8dee;margin-right:4px;font-family:system-ui;';
    ttl.textContent = '🖥 Output';
    hdr.appendChild(ttl);

    // Filter buttons
    const filters = [
      { id:'all',   label:'All',      bg:'#2a2a4e', active:'#5b8dee' },
      { id:'error', label:'🔴 Error', bg:'#2a1010', active:'#e05555' },
      { id:'warn',  label:'🟡 Warn',  bg:'#2a200a', active:'#f5a623' },
      { id:'info',  label:'🔵 Info',  bg:'#0a1a2a', active:'#5ce0e8' },
    ];
    filters.forEach(f => {
      const b = document.createElement('div');
      b.id = 'dcf-' + f.id;
      b.dataset.ftype = f.id;
      b.style.cssText = `padding:4px 9px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;touch-action:manipulation;font-family:system-ui;color:#fff;background:${filterType===f.id?f.active:f.bg};`;
      b.textContent = f.label;
      b.addEventListener('click',    () => setFilter(f.id));
      b.addEventListener('touchend', e => { e.preventDefault(); setFilter(f.id); });
      hdr.appendChild(b);
    });

    // Spacer
    const sp = document.createElement('div'); sp.style.flex='1'; hdr.appendChild(sp);

    // Count badges in header
    const hErrBadge = document.createElement('span');
    hErrBadge.id = 'dc-err-count';
    hErrBadge.style.cssText = 'font-size:10px;color:#e05555;font-family:system-ui;font-weight:700;';
    hdr.appendChild(hErrBadge);

    const hWarnBadge = document.createElement('span');
    hWarnBadge.id = 'dc-warn-count';
    hWarnBadge.style.cssText = 'font-size:10px;color:#f5a623;font-family:system-ui;font-weight:700;margin-left:6px;';
    hdr.appendChild(hWarnBadge);

    // Clear button
    const clr = document.createElement('div');
    clr.style.cssText = 'padding:4px 9px;background:#1a1a2e;color:#6060a0;border-radius:6px;font-size:10px;cursor:pointer;touch-action:manipulation;font-family:system-ui;margin-left:4px;';
    clr.textContent = '🗑 Clear';
    clr.addEventListener('click',    clearConsole);
    clr.addEventListener('touchend', e=>{ e.preventDefault(); clearConsole(); });
    hdr.appendChild(clr);

    // Close
    const cls = document.createElement('div');
    cls.style.cssText = 'padding:4px 9px;background:#1a1a2e;color:#8080b0;border-radius:6px;font-size:10px;cursor:pointer;touch-action:manipulation;font-family:system-ui;';
    cls.textContent = '✕';
    cls.addEventListener('click',    toggleConsole);
    cls.addEventListener('touchend', e=>{ e.preventDefault(); toggleConsole(); });
    hdr.appendChild(cls);

    // Log area
    const logArea = document.createElement('div');
    logArea.id = 'dc-log-area';
    logArea.style.cssText = 'flex:1;overflow-y:auto;padding:4px 0;-webkit-overflow-scrolling:touch;';
    panel.appendChild(logArea);

    // Status line
    const statusLine = document.createElement('div');
    statusLine.id = 'dc-status-line';
    statusLine.style.cssText = 'padding:3px 10px;background:#0a0a14;border-top:1px solid #1a1a2e;font-size:9px;color:#4040a0;font-family:system-ui;flex-shrink:0;';
    statusLine.textContent = 'EUG Engine — ready';
    panel.appendChild(statusLine);
  }

  // ── Append a single row ────────────────────────────
  const TYPE_STYLES = {
    error: { bg:'rgba(224,85,85,.08)',  border:'#e05555', icon:'🔴', color:'#ff8080' },
    warn:  { bg:'rgba(245,166,35,.07)', border:'#f5a623', icon:'🟡', color:'#ffc060' },
    info:  { bg:'rgba(92,224,232,.05)', border:'#5ce0e8', icon:'🔵', color:'#90d0e0' },
  };

  function _appendRow(entry) {
    const logArea = document.getElementById('dc-log-area');
    if (!logArea) return;
    if (filterType !== 'all' && filterType !== entry.type) return;

    const s = TYPE_STYLES[entry.type] || TYPE_STYLES.info;
    const row = document.createElement('div');
    row.className = 'dc-row dc-' + entry.type;
    row.style.cssText = `
      display:flex;align-items:flex-start;gap:6px;padding:5px 10px;
      border-left:2px solid ${s.border};margin:1px 4px;border-radius:0 4px 4px 0;
      background:${s.bg};cursor:pointer;
    `;
    row.innerHTML = `
      <span style="font-size:10px;flex-shrink:0;margin-top:1px">${s.icon}</span>
      <span style="font-size:9px;color:#404060;flex-shrink:0;margin-top:2px">${entry.ts}</span>
      <span style="font-size:11px;color:${s.color};flex:1;word-break:break-word;line-height:1.5">${_escHtml(entry.message)}</span>
    `;
    // Tap to copy
    row.addEventListener('click', () => {
      navigator.clipboard?.writeText(entry.message).catch(()=>{});
      row.style.background = s.bg.replace(')', ', .3)').replace('rgba','rgba');
      setTimeout(() => row.style.background = s.bg, 300);
    });
    logArea.appendChild(row);
    logArea.scrollTop = logArea.scrollHeight;

    // Update counts in header
    _updateHeaderCounts();
  }

  function _escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── Render all rows ────────────────────────────────
  function _renderAll() {
    const logArea = document.getElementById('dc-log-area');
    if (!logArea) return;
    logArea.innerHTML = '';
    const filtered = filterType === 'all' ? LOG : LOG.filter(e => e.type === filterType);
    if (!filtered.length) {
      logArea.innerHTML = `<div style="color:#3030a0;text-align:center;padding:30px;font-size:11px;font-family:system-ui;">No ${filterType === 'all' ? '' : filterType + ' '}messages</div>`;
      return;
    }
    filtered.forEach(e => _appendRow(e));
  }

  function setFilter(type) {
    filterType = type;
    // Update filter button styles
    const filters = [
      { id:'all',   active:'#5b8dee', bg:'#2a2a4e' },
      { id:'error', active:'#e05555', bg:'#2a1010' },
      { id:'warn',  active:'#f5a623', bg:'#2a200a' },
      { id:'info',  active:'#5ce0e8', bg:'#0a1a2a' },
    ];
    filters.forEach(f => {
      const b = document.getElementById('dcf-' + f.id);
      if (b) b.style.background = (type === f.id) ? f.active : f.bg;
    });
    _renderAll();
  }

  function clearConsole() {
    LOG.length = 0;
    counts = {error:0, warn:0, info:0};
    _updateBadge();
    _updateHeaderCounts();
    const logArea = document.getElementById('dc-log-area');
    if (logArea) logArea.innerHTML = '<div style="color:#3030a0;text-align:center;padding:30px;font-size:11px;font-family:system-ui;">Cleared</div>';
    const sl = document.getElementById('dc-status-line');
    if (sl) sl.textContent = 'EUG Engine — log cleared';
  }

  // ── Update badge on floating button ───────────────
  function _updateBadge() {
    const eEl = document.getElementById('dcb-err');
    const wEl = document.getElementById('dcb-warn');
    if (!eEl || !wEl) return;
    if (counts.error > 0) {
      eEl.textContent = counts.error;
      eEl.style.display = 'inline';
    } else { eEl.style.display = 'none'; }
    if (counts.warn > 0) {
      wEl.textContent = counts.warn;
      wEl.style.display = 'inline';
    } else { wEl.style.display = 'none'; }
    // Border glow on errors
    const btn = document.getElementById('dev-console-btn');
    if (btn) btn.style.borderColor = counts.error > 0 ? '#e05555' : counts.warn > 0 ? '#f5a623' : '#2a2a3e';
  }

  function _updateHeaderCounts() {
    const e = document.getElementById('dc-err-count');
    const w = document.getElementById('dc-warn-count');
    if (e) e.textContent = counts.error ? `${counts.error} errors` : '';
    if (w) w.textContent = counts.warn  ? `${counts.warn} warnings` : '';
  }

  function _flashBadge() {
    const btn = document.getElementById('dev-console-btn');
    if (!btn) return;
    let n = 0;
    const iv = setInterval(() => {
      btn.style.borderColor = (n++ % 2) ? '#e05555' : '#2a2a3e';
      if (n > 5) clearInterval(iv);
    }, 200);
  }

  // ── Toggle open/close ──────────────────────────────
  function toggleConsole() {
    _buildUI();
    isOpen = !isOpen;
    const panel = document.getElementById('dev-console-panel');
    if (!panel) return;
    if (isOpen) {
      panel.style.display = 'flex';
      _renderAll();
      // Log engine info on first open
      if (LOG.filter(e=>e.message.startsWith('EUG Engine')).length === 0) {
        devLog('info', 'EUG Engine v1.0 — PlayCanvas 2.2.2 — ready');
      }
    } else {
      panel.style.display = 'none';
    }
    const lbl = document.getElementById('dcb-label');
    if (lbl) lbl.textContent = isOpen ? 'Hide' : 'Console';
  }

  // ── Init after DOM ready ───────────────────────────
  function init() {
    _buildUI();
    // Log startup
    devLog('info', 'EUG Engine v1.0 started — ' + new Date().toLocaleTimeString());

    // Patch showToast to also log warnings/errors
    const _origToast = window.showToast;
    if (typeof _origToast === 'function') {
      window.showToast = function(msg) {
        _origToast(msg);
        if (typeof msg === 'string') {
          if (msg.startsWith('❌')) devLog('error', msg.replace('❌','').trim());
          else if (msg.startsWith('⚠')) devLog('warn',  msg.replace('⚠','').trim());
          else devLog('info', msg);
        }
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 500);
  }

})();

// ═══════════════════════════════════════════════════════
//  PATCH v2 — 4 NEW FEATURES

console.log('[EUG] eug-console.js loaded');
