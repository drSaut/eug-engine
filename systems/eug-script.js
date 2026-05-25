// EUG Script System

// ── Per-object script editor ──────────────────────────
const entityScripts = {};
let scriptEditorOpen = false;

function openScriptForSelected(){
  if(!selectedEntity){showToast('Select an object first');return;}
  openScriptEditor(selectedEntity);
}

function openScriptEditor(ent){
  scriptEditorOpen = true;
  const guid = ent.getGuid();
  const existing = entityScripts[guid] || `// ─── Script: ${ent.name} ───────────────────────
// Runs every frame in PLAY mode.
// API available:
//   entity          → this PlayCanvas entity
//   dt              → delta time (seconds, ~0.016)
//   app             → PlayCanvas app
//   _px, _pz        → player world X/Z position
//   _pang           → player facing angle (radians)
//   _shootBullet()  → fire a bullet
//   _bulletCfg      → bullet settings object
//   showToast(msg)  → show message
//   placedBuildings → array of all buildings
//   pc              → PlayCanvas library

// ── EXAMPLES ─────────────────────────────────────────

// Spin this object:
// entity.rotate(0, 45 * dt, 0);

// Move toward player:
// const pos = entity.getPosition();
// const dx = _px - pos.x, dz = _pz - pos.z;
// const dist = Math.hypot(dx, dz);
// if(dist > 2) entity.translate(dx/dist*2*dt, 0, dz/dist*2*dt);

// Shoot when player is near:
// const pos2 = entity.getPosition();
// if(Math.hypot(_px-pos2.x, _pz-pos2.z) < 5) _shootBullet();

// Change bullet color on proximity:
// const d = Math.hypot(_px-entity.getPosition().x, _pz-entity.getPosition().z);
// _bulletCfg.colorR = d < 5 ? 0.0 : 1.0;
// _bulletCfg.colorG = d < 5 ? 1.0 : 0.08;

function onUpdate(entity, dt) {
  // Your code here

}`;

  const overlay = document.createElement('div');
  overlay.id = 'script-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:#06060f;z-index:900;display:flex;flex-direction:column;';

  overlay.innerHTML = `
    <div style="display:flex;align-items:center;padding:10px 14px;background:#0a0a16;border-bottom:1px solid #1e1e2e;gap:8px">
      <span style="font-size:13px;font-weight:800;color:#5b8dee;flex:1">📝 Script — ${ent.name}</span>
      <div style="font-size:9px;color:#404060;margin-right:4px">runs every frame in PLAY</div>
      <div id="script-run" style="padding:7px 14px;background:#3ecf7e;color:#000;border-radius:7px;font-size:11px;font-weight:800;cursor:pointer;touch-action:manipulation">▶ Save & Run</div>
      <div id="script-clear" style="padding:7px 12px;background:#2a1a1a;color:#e05555;border-radius:7px;font-size:11px;cursor:pointer;touch-action:manipulation">🗑 Clear</div>
      <div id="script-close" style="padding:7px 12px;background:#1a1a2e;color:#888;border-radius:7px;font-size:11px;cursor:pointer;touch-action:manipulation">✕</div>
    </div>
    <textarea id="script-code" spellcheck="false"
      style="flex:1;background:#080812;color:#b0d4ff;font-family:'Courier New',monospace;font-size:12px;line-height:1.6;
      padding:14px;border:none;resize:none;outline:none;tab-size:2;white-space:pre;">${existing.replace(/</g,'&lt;')}</textarea>
    <div id="script-err" style="background:#1a0808;color:#ff6060;font-size:11px;font-family:monospace;padding:6px 14px;min-height:24px;border-top:1px solid #2a1010;display:none"></div>
    <div style="display:flex;gap:6px;padding:8px 14px;background:#0a0a16;border-top:1px solid #1e1e2e;overflow-x:auto">
      ${[
        ['Spin','entity.rotate(0, 45 * dt, 0);'],
        ['Move→Player','const p=entity.getPosition();const dx=_px-p.x,dz=_pz-p.z;const d=Math.hypot(dx,dz);if(d>1)entity.translate(dx/d*3*dt,0,dz/d*3*dt);'],
        ['Shoot Near','if(Math.hypot(_px-entity.getPosition().x,_pz-entity.getPosition().z)<6)_shootBullet();'],
        ['Bob Up/Down','entity.setLocalPosition(entity.getLocalPosition().x, Math.sin(Date.now()/500)*0.5+1, entity.getLocalPosition().z);'],
        ['Pulse Scale','const s=1+Math.sin(Date.now()/300)*0.2; entity.setLocalScale(s,s,s);'],
      ].map(([l,c])=>`<div class="snip-btn" data-c="${c.replace(/"/g,'&quot;')}" style="padding:5px 10px;background:#1a1a2e;color:#5b8dee;border-radius:6px;font-size:9px;font-weight:700;cursor:pointer;touch-action:manipulation;white-space:nowrap;border:1px solid #2a2a3e">${l}</div>`).join('')}
    </div>`;

  document.body.appendChild(overlay);

  const ta = overlay.querySelector('#script-code');
  // Fix textarea HTML entities
  ta.value = existing;

  // Snippet buttons
  overlay.querySelectorAll('.snip-btn').forEach(b => {
    b.addEventListener('click', () => {
      const c = b.dataset.c;
      const start = ta.selectionStart;
      ta.value = ta.value.slice(0,start) + '\n  ' + c + '\n' + ta.value.slice(start);
    });
    b.addEventListener('touchend', e=>{ e.preventDefault(); b.click(); });
  });

  // Tab key support
  ta.addEventListener('keydown', e => {
    if(e.key==='Tab'){ e.preventDefault(); const s=ta.selectionStart; ta.value=ta.value.slice(0,s)+'  '+ta.value.slice(ta.selectionEnd); ta.selectionStart=ta.selectionEnd=s+2; }
  });

  const runBtn  = overlay.querySelector('#script-run');
  const errEl   = overlay.querySelector('#script-err');

  function saveAndRun() {
    const code = ta.value;
    entityScripts[guid] = code;
    // Invalidate compiled fn so it recompiles next frame
    delete _scriptFns[guid];
    delete _scriptErrors[guid];
    errEl.style.display = 'none';
    try {
      // Test compile
      new Function('entity','dt','app','player','_px','_pz','_pang',
        '_shootBullet','_bulletCfg','placedBuildings','showToast','pc', code);
      showToast('✅ Script saved — running in PLAY mode');
      overlay.remove(); scriptEditorOpen=false;
    } catch(e) {
      errEl.style.display = 'block';
      errEl.textContent = '❌ ' + e.message;
    }
  }

  runBtn.addEventListener('click',    saveAndRun);
  runBtn.addEventListener('touchend', e=>{ e.preventDefault(); saveAndRun(); });
  overlay.querySelector('#script-clear').addEventListener('click', ()=>{
    ta.value='function onUpdate(entity, dt) {\n  \n}';
    entityScripts[guid]=''; delete _scriptFns[guid];
  });
  overlay.querySelector('#script-close').addEventListener('click',    ()=>{ overlay.remove(); scriptEditorOpen=false; });
  overlay.querySelector('#script-close').addEventListener('touchend', e=>{ e.preventDefault(); overlay.remove(); scriptEditorOpen=false; });
}
function closeScriptEditor(){ const o=document.getElementById('script-overlay'); if(o) o.remove(); scriptEditorOpen=false; }
function saveScript(guid){
  // Legacy — now handled by openScriptEditor inline
  const code = document.getElementById('script-code')?.value; if(!code) return;
  entityScripts[guid] = code;
  delete _scriptFns[guid];
  showToast('✅ Script saved');
  closeScriptEditor();
}


console.log('[EUG] eug-script.js loaded');
