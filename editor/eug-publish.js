// EUG Publish System

//  PUBLISH SYSTEM  — Standalone game export
//  • Splash designer (title, subtitle, bg color)
//  • GitHub Pages GLB URLs
//  • Progress bar loader in exported game
//  • Ammo.js CDN download on open
//  • Full player walk + collision
// ══════════════════════════════════════════════════════

// ── Persistent publish config ─────────────────────────
window._publishCfg = window._publishCfg || {
  title:    'MY GAME',
  subtitle: 'Tap PLAY to start',
  bgColor:  '#09090f',
  titleColor: '#ffffff',
  accentColor: '#3ecf7e',
  glbUrls:  {},   // name → GitHub Pages URL
};

// ── Open Publish Panel ────────────────────────────────
function openPublishPanel() {
  const existing = document.getElementById('publish-panel');
  if(existing){ existing.remove(); return; }

  const cfg = window._publishCfg;

  // Build GLB URL rows from current glbModels
  const allModels = [...glbModels, ...remoteModels];

  const panel = document.createElement('div');
  panel.id = 'publish-panel';
  panel.style.cssText = [
    'position:fixed','inset:0','z-index:1500',
    'background:rgba(0,0,0,.92)',
    'display:flex','align-items:center','justify-content:center',
    'padding:16px',
  ].join(';');

  panel.innerHTML = `
    <div style="background:#0e0e1a;border:1.5px solid #3ecf7e55;border-radius:16px;
      width:100%;max-width:440px;max-height:90vh;overflow-y:auto;
      box-shadow:0 0 40px rgba(62,207,126,.15);">

      <!-- Header -->
      <div style="display:flex;align-items:center;padding:16px 18px 0;">
        <div style="font-size:16px;font-weight:900;color:#3ecf7e;flex:1;letter-spacing:1px">🚀 PUBLISH GAME</div>
        <div id="pub-close" style="padding:5px 12px;background:#1a1a2e;color:#888;border-radius:8px;font-size:11px;cursor:pointer;touch-action:manipulation">✕</div>
      </div>
      <div style="font-size:10px;color:#404060;padding:4px 18px 14px;letter-spacing:.3px">Export standalone HTML game — plays on any device</div>

      <!-- SPLASH DESIGNER -->
      <div style="padding:0 18px">
        <div style="font-size:10px;font-weight:800;color:#3ecf7e;letter-spacing:1px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid #1a1a2e">🎨 SPLASH SCREEN</div>

        <div style="display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:10px">

          <div>
            <div style="font-size:9px;color:#5b8dee;margin-bottom:3px;letter-spacing:.5px">GAME TITLE</div>
            <input id="pub-title" type="text" maxlength="40" value="${cfg.title}"
              style="width:100%;background:#0a0a14;border:1px solid #2a2a3e;border-radius:8px;
              color:#fff;font-size:18px;font-weight:900;padding:8px 12px;outline:none;letter-spacing:1px;">
          </div>

          <div>
            <div style="font-size:9px;color:#5b8dee;margin-bottom:3px;letter-spacing:.5px">SUBTITLE</div>
            <input id="pub-sub" type="text" maxlength="60" value="${cfg.subtitle}"
              style="width:100%;background:#0a0a14;border:1px solid #2a2a3e;border-radius:8px;
              color:#aaa;font-size:12px;padding:7px 12px;outline:none;">
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
            <div>
              <div style="font-size:9px;color:#5b8dee;margin-bottom:3px;letter-spacing:.5px">BG COLOR</div>
              <input id="pub-bg" type="color" value="${cfg.bgColor}"
                style="width:100%;height:36px;border:none;background:none;cursor:pointer;border-radius:6px;">
            </div>
            <div>
              <div style="font-size:9px;color:#5b8dee;margin-bottom:3px;letter-spacing:.5px">TITLE COLOR</div>
              <input id="pub-tc" type="color" value="${cfg.titleColor}"
                style="width:100%;height:36px;border:none;background:none;cursor:pointer;border-radius:6px;">
            </div>
            <div>
              <div style="font-size:9px;color:#5b8dee;margin-bottom:3px;letter-spacing:.5px">ACCENT</div>
              <input id="pub-ac" type="color" value="${cfg.accentColor}"
                style="width:100%;height:36px;border:none;background:none;cursor:pointer;border-radius:6px;">
            </div>
          </div>
        </div>

        <!-- Splash preview -->
        <div id="pub-preview" style="border:1px solid #2a2a3e;border-radius:10px;overflow:hidden;margin-bottom:14px;height:120px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          background:${cfg.bgColor};position:relative;">
          <div id="pvw-title" style="font-size:22px;font-weight:900;color:${cfg.titleColor};letter-spacing:3px;margin-bottom:4px">${cfg.title}</div>
          <div id="pvw-sub" style="font-size:11px;color:${cfg.accentColor};letter-spacing:1px;margin-bottom:12px">${cfg.subtitle}</div>
          <div style="width:140px;height:4px;background:#1a1a2e;border-radius:3px;overflow:hidden">
            <div style="width:65%;height:100%;background:${cfg.accentColor};border-radius:3px;"></div>
          </div>
          <div style="font-size:9px;color:${cfg.accentColor};margin-top:6px;letter-spacing:1px">Loading assets...</div>
        </div>

        <!-- GLB URLS -->
        <div style="font-size:10px;font-weight:800;color:#3ecf7e;letter-spacing:1px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid #1a1a2e">📦 GLB ASSET URLS (GitHub Pages)</div>

        <div id="pub-url-rows" style="margin-bottom:10px">
          ${allModels.length === 0
            ? `<div style="color:#404060;font-size:10px;text-align:center;padding:12px">No GLB models in scene.<br>Import GLB first from the library.</div>`
            : allModels.map((m,i) => {
                // Auto-fill: use stored URL from _publishCfg, or model.url (remoteModels), or empty
                const storedUrl = cfg.glbUrls[m.name] || m.url || '';
                const isLocal   = m.source === 'local' || (!m.url && !cfg.glbUrls[m.name]);
                return `
              <div style="margin-bottom:8px">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
                  <span style="font-size:9px;color:#f5a623;letter-spacing:.3px">📦 ${m.name}</span>
                  ${storedUrl ? '<span style="font-size:8px;color:#3ecf7e;background:rgba(62,207,126,.1);padding:1px 6px;border-radius:4px">✓ URL set</span>' : (isLocal ? '<span style="font-size:8px;color:#f5a623;background:rgba(245,166,35,.1);padding:1px 6px;border-radius:4px">⚠ local file — needs URL</span>' : '')}
                </div>
                <input id="pub-url-${i}" type="url"
                  placeholder="https://cdn.jsdelivr.net/gh/user/repo@main/file.glb"
                  value="${storedUrl}"
                  style="width:100%;background:#0a0a14;border:1px solid ${storedUrl?'#3ecf7e44':'#2a2a3e'};border-radius:7px;
                  color:#fff;font-size:10px;padding:7px 10px;outline:none;font-family:monospace;">
              </div>`;
              }).join('')
          }
        </div>

        <!-- Scene info -->
        <div style="background:#0a0a14;border:1px solid #1a1a2e;border-radius:8px;padding:10px;margin-bottom:8px;font-size:9px;color:#5b8dee;line-height:1.8">
          🏢 Buildings: <b style="color:#fff">${placedBuildings.length}</b> &nbsp;
          🛣 Roads: <b style="color:#fff">${roads.length}</b> &nbsp;
          📦 GLB Models: <b style="color:#fff">${allModels.length}</b>
        </div>
        <div style="background:#0a0a14;border:1px solid #1a1a2e;border-radius:8px;padding:10px;margin-bottom:14px;font-size:9px;color:#404060;line-height:1.8">
          <b style="color:#5b8dee">jsDelivr format (recommended):</b><br>
          <span style="font-family:monospace;color:#7070a0">https://cdn.jsdelivr.net/gh/<b style="color:#fff">user</b>/<b style="color:#fff">repo</b>@main/<b style="color:#fff">file.glb</b></span><br>
          <span style="color:#3ecf7e">✓</span> Models loaded via Remote Library auto-fill above
        </div>
      </div>

      <!-- PUBLISH BUTTON -->
      <div style="padding:0 18px 18px">
        <div id="pub-go" style="width:100%;padding:16px;background:#3ecf7e;color:#000;border-radius:10px;
          font-size:14px;font-weight:900;text-align:center;cursor:pointer;touch-action:manipulation;
          letter-spacing:2px;box-shadow:0 0 20px rgba(62,207,126,.3);">
          🚀 BUILD & DOWNLOAD
        </div>
        <div style="font-size:9px;color:#303050;text-align:center;margin-top:8px;line-height:1.6">
          Generates a standalone .html file • Opens on any device<br>
          GLB files loaded from your GitHub Pages URLs at runtime
        </div>
      </div>
    </div>`;

  document.body.appendChild(panel);

  // ── Live preview update ───────────────────────────────
  function updatePreview() {
    const t  = panel.querySelector('#pub-title').value || 'MY GAME';
    const s  = panel.querySelector('#pub-sub').value   || '';
    const bg = panel.querySelector('#pub-bg').value;
    const tc = panel.querySelector('#pub-tc').value;
    const ac = panel.querySelector('#pub-ac').value;
    panel.querySelector('#pub-preview').style.background = bg;
    panel.querySelector('#pvw-title').style.color  = tc;
    panel.querySelector('#pvw-title').textContent  = t;
    panel.querySelector('#pvw-sub').style.color    = ac;
    panel.querySelector('#pvw-sub').textContent    = s;
  }
  ['#pub-title','#pub-sub','#pub-bg','#pub-tc','#pub-ac'].forEach(sel => {
    const el = panel.querySelector(sel);
    if(el) {
      el.addEventListener('input',  updatePreview);
      el.addEventListener('change', updatePreview);
    }
  });

  // ── Close ─────────────────────────────────────────────
  const closePanel = () => panel.remove();
  panel.querySelector('#pub-close').addEventListener('click',    closePanel);
  panel.querySelector('#pub-close').addEventListener('touchend', e=>{ e.preventDefault(); closePanel(); });
  panel.addEventListener('click', e=>{ if(e.target===panel) closePanel(); });

  // ── Build & Download ──────────────────────────────────
  const goBtn = panel.querySelector('#pub-go');
  function doBuild() {
    // Save config
    cfg.title       = panel.querySelector('#pub-title').value || 'MY GAME';
    cfg.subtitle    = panel.querySelector('#pub-sub').value   || '';
    cfg.bgColor     = panel.querySelector('#pub-bg').value;
    cfg.titleColor  = panel.querySelector('#pub-tc').value;
    cfg.accentColor = panel.querySelector('#pub-ac').value;

    // Save GLB URLs
    const models2 = [...glbModels, ...remoteModels];
    models2.forEach((m, i) => {
      const inp = panel.querySelector('#pub-url-'+i);
      if(inp) cfg.glbUrls[m.name] = inp.value.trim();
    });

    goBtn.textContent = '⏳ Building...';
    goBtn.style.background = '#1a3a2e';
    goBtn.style.color = '#3ecf7e';

    setTimeout(() => {
      try {
        const html = _buildPublishedGame(cfg);
        const blob = new Blob([html], {type:'text/html'});
        const a    = document.createElement('a');
        a.href     = URL.createObjectURL(blob);
        a.download = (cfg.title.toLowerCase().replace(/\s+/g,'_') || 'my_game') + '.html';
        a.click();
        showToast('✅ Game published!\n📥 Check your Downloads');
        goBtn.textContent = '✅ DOWNLOADED!';
        goBtn.style.background = '#3ecf7e';
        goBtn.style.color = '#000';
        setTimeout(closePanel, 2000);
      } catch(e) {
        showToast('❌ Build failed: '+e.message);
        goBtn.textContent = '🚀 BUILD & DOWNLOAD';
        goBtn.style.background = '#3ecf7e';
        goBtn.style.color = '#000';
      }
    }, 60);
  }
  goBtn.addEventListener('click',    doBuild);
  goBtn.addEventListener('touchend', e=>{ e.preventDefault(); doBuild(); });
}

// ══════════════════════════════════════════════════════
//  BUILD PUBLISHED GAME HTML
// ══════════════════════════════════════════════════════
function _buildPublishedGame(cfg) {
  const S  = '<'+'script';
  const ES = '<'+'/script>';

  // ── Serialize scene ───────────────────────────────────
  const sceneData = {
    roads:     roads.map(r=>({x1:r.x1,z1:r.z1,x2:r.x2,z2:r.z2,width:r.width})),
    buildings: placedBuildings.map(b=>({
      x1:b.x1,z1:b.z1,x2:b.x2,z2:b.z2,
      height:b.height,colorIdx:b.colorIdx||0
    })),
    props: placedProps.filter(p=>!p.type.startsWith('glb_')).map(p=>({
      type:p.type, x:p.x||0, z:p.z||0
    })),
    vehicles: placedVehicles.map(v=>({type:v.type||'sedan',x:v.x||0,z:v.z||0})),
    spawn: {
      x: roads.length ? (roads[0].x1+roads[0].x2)/2 : 0,
      z: roads.length ? (roads[0].z1+roads[0].z2)/2 : 0
    },
    glbUrls: cfg.glbUrls,     // name → github pages URL
    playerGLB: (() => {       // which model is the player
      if(_playerSceneEnt) {
        const all = [...glbModels,...remoteModels];
        const m = all.find(m=>m.entity===_playerSceneEnt||m.entity===_playerSceneEnt.parent);
        return m ? m.name : (all[0]?all[0].name:null);
      }
      return glbModels[0]?.name || remoteModels[0]?.name || null;
    })(),
  };
  const sceneJSON = JSON.stringify(sceneData);

  // ── Pastel palette ────────────────────────────────────
  const palette = JSON.stringify([
    [.98,.80,.80],[.80,.90,.98],[.82,.97,.82],[.98,.94,.78],
    [.88,.80,.98],[.98,.87,.76],[.78,.94,.94],[.90,.98,.80],
    [.72,.72,.74],[.85,.78,.65],[.94,.80,.90],[.80,.94,.90]
  ]);

  // ── CSS ───────────────────────────────────────────────
  const css = `
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{width:100%;height:100%;overflow:hidden;background:${cfg.bgColor};font-family:system-ui,sans-serif}
#splash{position:fixed;inset:0;z-index:999;background:${cfg.bgColor};
  display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;}
#spl-title{font-size:42px;font-weight:900;letter-spacing:4px;color:${cfg.titleColor};
  text-align:center;margin-bottom:6px;
  text-shadow:0 0 30px ${cfg.accentColor}88,0 0 60px ${cfg.accentColor}44;}
#spl-sub{font-size:13px;color:${cfg.accentColor};letter-spacing:2px;text-align:center;margin-bottom:40px;}
#spl-bar-wrap{width:260px;height:5px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden;margin-bottom:10px;}
#spl-bar{height:100%;width:0%;background:${cfg.accentColor};border-radius:4px;transition:width .25s ease;
  box-shadow:0 0 8px ${cfg.accentColor};}
#spl-msg{font-size:10px;color:${cfg.accentColor};letter-spacing:1px;margin-bottom:8px;min-height:14px;text-align:center;}
#spl-err{display:none;font-size:10px;color:#e05555;letter-spacing:.5px;text-align:center;margin-bottom:8px;
  background:rgba(224,85,85,.1);border:1px solid #e0555544;border-radius:6px;padding:6px 12px;max-width:260px;}
#spl-play{display:none;margin-top:10px;padding:14px 40px;background:transparent;
  border:2px solid ${cfg.accentColor};border-radius:6px;color:${cfg.accentColor};
  font-size:13px;font-weight:800;letter-spacing:4px;cursor:pointer;touch-action:manipulation;
  box-shadow:0 0 20px ${cfg.accentColor}33;
  animation:pulse 1.6s ease-in-out infinite;}
@keyframes pulse{0%,100%{box-shadow:0 0 16px ${cfg.accentColor}33}50%{box-shadow:0 0 28px ${cfg.accentColor}77}}
#spl-play:active{background:${cfg.accentColor}22;}
canvas{width:100%!important;height:100%!important;display:block;touch-action:none}
#ui{position:fixed;inset:0;pointer-events:none;z-index:100;}
#jbase{position:absolute;bottom:50px;left:20px;width:120px;height:120px;border-radius:50%;
  background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.15);pointer-events:all;touch-action:none;}
#jknob{position:absolute;width:48px;height:48px;border-radius:50%;top:50%;left:50%;
  transform:translate(-50%,-50%);background:rgba(91,141,238,.5);border:2px solid rgba(91,141,238,.8);
  pointer-events:none;}
#jlbl{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);
  font-size:9px;color:rgba(255,255,255,.3);white-space:nowrap;letter-spacing:1px;}
#rbase{position:absolute;bottom:50px;right:20px;width:110px;height:110px;border-radius:50%;
  background:rgba(255,255,255,.04);border:2px solid rgba(255,255,255,.12);pointer-events:all;touch-action:none;}
#rknob{position:absolute;width:44px;height:44px;border-radius:50%;top:50%;left:50%;
  transform:translate(-50%,-50%);background:rgba(62,207,126,.45);border:2px solid rgba(62,207,126,.7);
  pointer-events:none;}
#rlbl{position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);
  font-size:9px;color:rgba(255,255,255,.3);white-space:nowrap;letter-spacing:1px;}
#spdhud{position:absolute;top:14px;left:14px;background:rgba(0,0,0,.7);
  border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;
  color:#fff;font-size:22px;font-weight:700;text-align:center;pointer-events:none;}
#spdhud span{font-size:9px;opacity:.5;display:block;}
`;

  // ── Game script (minified inline) ──────────────────────
  // This is the full game runtime — all in one <script>
  const gameScript = `
const SCENE=${sceneJSON};
const PAL=${palette};
const AMMO_CDN='https://cdn.jsdelivr.net/npm/ammo.js@0.0.10/ammo.js';
const AMMO_FB='https://kripken.github.io/ammo.js/builds/ammo.js';
const PC_CDN='https://cdn.jsdelivr.net/npm/playcanvas@2.2.2/build/playcanvas.min.js';

// ── Step counter ──────────────────────────────────────
let _totalSteps=0,_doneSteps=0;
function _countSteps(){
  _totalSteps=2; // PlayCanvas + Ammo
  if(SCENE.glbUrls){
    Object.values(SCENE.glbUrls).forEach(u=>{ if(u&&u.trim()) _totalSteps++; });
  }
}
function _step(msg){
  _doneSteps++;
  const pct=Math.round(Math.min(_doneSteps/_totalSteps,1)*90);
  setBar(pct,msg);
}

// ── UI helpers ────────────────────────────────────────
function setBar(pct,msg){
  const b=document.getElementById('spl-bar');
  const m=document.getElementById('spl-msg');
  if(b) b.style.width=Math.min(pct,100)+'%';
  if(m) m.textContent=msg||'';
}
function showErr(msg){
  const e=document.getElementById('spl-err');
  if(e){ e.textContent='⚠ '+msg; e.style.display='block'; }
}
function showPlayBtn(){
  setBar(100,'Ready!');
  setTimeout(()=>{
    const p=document.getElementById('spl-play');
    if(p) p.style.display='block';
  },400);
}

// ── Sequential loader ─────────────────────────────────
_countSteps();
setBar(0,'Initializing...');

// Step 1: Load PlayCanvas
(function loadPC(){
  setBar(2,'Downloading engine...');
  const s=document.createElement('script');
  s.src=PC_CDN;
  s.onload=()=>{ _step('Engine ready'); loadAmmo(); };
  s.onerror=()=>{ showErr('PlayCanvas failed to load'); showPlayBtn(); };
  document.head.appendChild(s);
})();

let _app=null, _ammo=null;
const _glbAssets={};  // name → pc.Asset

function loadAmmo(){
  setBar(20,'Downloading physics (Ammo.js)...');
  function tryLoad(url,fallback){
    const s=document.createElement('script');
    s.src=url;
    s.onload=()=>{
      if(typeof Ammo==='function'){
        Ammo().then(lib=>{ Ammo=lib; _ammo=lib; _step('Physics ready'); loadGLBs(); }).catch(()=>{ _step('Physics ready'); loadGLBs(); });
      } else { _step('Physics ready'); loadGLBs(); }
    };
    s.onerror=()=>{
      if(fallback){ tryLoad(fallback,null); }
      else { showErr('Ammo.js failed — physics disabled'); _step('Physics skipped'); loadGLBs(); }
    };
    document.head.appendChild(s);
  }
  tryLoad(AMMO_CDN,AMMO_FB);
}

const _glbBuffers={};

function loadGLBs(){
  const urls=SCENE.glbUrls||{};
  const entries=Object.entries(urls).filter(([k,v])=>v&&v.trim());
  if(entries.length===0){ startGame(); return; }

  let idx=0;
  function nextGLB(){
    if(idx>=entries.length){ startGame(); return; }
    const [name,url]=entries[idx++];
    setBar(40+Math.round((idx/entries.length)*40),'Downloading '+name+'...');
    fetch(url)
      .then(r=>{ if(!r.ok) throw new Error(r.status+' '+r.statusText); return r.arrayBuffer(); })
      .then(buf=>{
        _glbBuffers[name]=buf;
        _step('Loaded '+name);
        nextGLB();
      })
      .catch(err=>{
        showErr(name+': '+err.message);
        _step(name+' failed (skipped)');
        nextGLB();
      });
  }
  nextGLB();
}

// ── Start game ────────────────────────────────────────
function startGame(){
  setBar(95,'Building world...');
  // Create canvas
  const canvas=document.createElement('canvas');
  canvas.id='gc';
  document.body.appendChild(canvas);

  _app=new pc.Application(canvas,{
    mouse:new pc.Mouse(canvas),
    touch:new pc.TouchDevice(canvas),
    keyboard:new pc.Keyboard(window),
  });
  _app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
  _app.setCanvasResolution(pc.RESOLUTION_AUTO);
  window.addEventListener('resize',()=>_app.resizeCanvas());
  _app.start();

  // Scene setup
  _app.scene.ambientLight=new pc.Color(.22,.25,.30);
  const sun=new pc.Entity('Sun');
  sun.addComponent('light',{type:pc.LIGHTTYPE_DIRECTIONAL,color:new pc.Color(1,.97,.88),intensity:.9,castShadows:true,shadowResolution:1024,shadowDistance:200});
  sun.setEulerAngles(45,-30,0);
  _app.root.addChild(sun);
  const fill=new pc.Entity('Fill');
  fill.addComponent('light',{type:pc.LIGHTTYPE_DIRECTIONAL,color:new pc.Color(.25,.30,.40),intensity:.35,castShadows:false});
  fill.setEulerAngles(30,200,0);
  _app.root.addChild(fill);

  const gndM=new pc.StandardMaterial();gndM.diffuse.set(.13,.15,.13);gndM.update();
  const gnd=new pc.Entity('Ground');
  gnd.addComponent('render',{type:'plane',material:gndM,castShadows:false,receiveShadows:true});
  gnd.setLocalScale(500,1,500);
  _app.root.addChild(gnd);

  const camEnt=new pc.Entity('Cam');
  camEnt.addComponent('camera',{clearColor:new pc.Color(.38,.52,.72),fov:75,farClip:600,nearClip:.1});
  _app.root.addChild(camEnt);

  // Build roads
  const roadM=new pc.StandardMaterial();roadM.diffuse.set(.16,.16,.18);roadM.update();
  (SCENE.roads||[]).forEach(r=>{
    const dx=r.x2-r.x1,dz=r.z2-r.z1,len=Math.sqrt(dx*dx+dz*dz);
    if(len<1) return;
    const e=new pc.Entity('Road');
    e.addComponent('render',{type:'plane',material:roadM,castShadows:false});
    e.setLocalPosition((r.x1+r.x2)/2,.02,(r.z1+r.z2)/2);
    e.setLocalScale(len,1,r.width);
    e.setLocalEulerAngles(0,Math.atan2(dx,dz)*180/Math.PI,0);
    _app.root.addChild(e);
  });

  // Build buildings
  const _bldgs=[];
  (SCENE.buildings||[]).forEach(b=>{
    const c=PAL[(b.colorIdx||0)%PAL.length];
    const bm=new pc.StandardMaterial();bm.diffuse.set(c[0],c[1],c[2]);bm.update();
    const w=Math.abs(b.x2-b.x1),d=Math.abs(b.z2-b.z1);
    const e=new pc.Entity('Bld');
    e.addComponent('render',{type:'box',material:bm,castShadows:true,receiveShadows:true});
    e.setLocalPosition((b.x1+b.x2)/2,b.height/2,(b.z1+b.z2)/2);
    e.setLocalScale(w,b.height,d);
    _app.root.addChild(e);
    _bldgs.push({entity:e,cx:(b.x1+b.x2)/2,cz:(b.z1+b.z2)/2,hw:w/2,hd:d/2});
  });

  // ── Collision ──────────────────────────────────────
  const PRAD=0.6;
  function collidesAt(px,pz){
    for(let i=0;i<_bldgs.length;i++){
      const b=_bldgs[i];
      if(px>b.cx-b.hw-PRAD&&px<b.cx+b.hw+PRAD&&pz>b.cz-b.hd-PRAD&&pz<b.cz+b.hd+PRAD) return true;
    }
    return false;
  }

  // ── Player state ──────────────────────────────────
  let _px=SCENE.spawn?.x||0, _pz=SCENE.spawn?.z||0, _pang=0;
  let _lookYaw=0, _lookPitch=0.3;
  let _camX=_px,_camY=8,_camZ=_pz+6;
  let _jx=0,_jy=0,_lx=0,_ly=0;
  let _plyEnt=null;
  const C_DIST=6, P_SPD=5, ROT_SENS=10;

  // Spawn player entity
  function spawnPlayer(){
    const playerName=SCENE.playerGLB;
    const buf=playerName&&_glbBuffers[playerName];
    if(buf){
      const blob=new Blob([buf],{type:'model/gltf-binary'});
      const url2=URL.createObjectURL(blob);
      const asset=new pc.Asset(playerName+'_p','container',{url:url2});
      asset.preload=true;
      _app.assets.add(asset);
      asset.once('load',()=>{
        try{
          const inst=asset.resource.instantiateRenderEntity();
          if(!inst){ spawnCapsule(); return; }

          // ── Pivot wrapper so setPosition moves the root ──
          const pivot=new pc.Entity('Player');
          pivot.setLocalPosition(_px,0,_pz);
          _app.root.addChild(pivot);
          pivot.addChild(inst);
          inst.setLocalPosition(0,0,0);
          inst.setLocalEulerAngles(0,0,0);

          // Auto scale to ~1.8m
          setTimeout(()=>{
            let minY=1e9,maxY=-1e9;
            function meas(n){if(n.render&&n.render.meshInstances)n.render.meshInstances.forEach(mi=>{try{const bb=mi.aabb;minY=Math.min(minY,bb.getMin().y);maxY=Math.max(maxY,bb.getMax().y);}catch(er){}});(n.children||[]).forEach(meas);}
            meas(inst);
            const ht=maxY-minY;
            const sf=ht>0?1.8/ht:0.01;
            inst.setLocalScale(sf,sf,sf);
            inst.setLocalPosition(0,-(minY*sf),0);
          },150);

          // ── Wire animations ──────────────────────────────
          const anims=asset.resource.animations||[];
          if(anims.length>0){
            try{
              if(!inst.anim) inst.addComponent('anim',{activate:true,speed:1});
              anims.forEach(a=>{
                try{ inst.anim.assignAnimation(a.name,a.resource); }catch(e){}
              });
              // Find walk/idle clips
              _walkClip = anims.find(a=>/walk|run|move/i.test(a.name))?.name || anims[0].name;
              _idleClip = anims.find(a=>/idle|stand|bind|tpose|t.?pose/i.test(a.name))?.name || anims[0].name;
              try{ inst.anim.play(_idleClip); }catch(e){}
              _animInst = inst;
            }catch(e){}
          }

          _plyEnt=pivot;
          showMsg('');
        }catch(e){ spawnCapsule(); }
      });
      asset.once('error',()=>spawnCapsule());
      _app.assets.load(asset);
    } else {
      spawnCapsule();
    }
  }

  let _animInst=null, _walkClip=null, _idleClip=null, _isWalking=false;

  function _playAnim(clip){
    if(!_animInst||!clip) return;
    try{ _animInst.anim&&_animInst.anim.play(clip); }catch(e){}
    try{ _animInst.animation&&_animInst.animation.play(clip,0.2); }catch(e){}
  }
  function showMsg(m){ const el=document.getElementById('spl-msg'); if(el) el.textContent=m; }
  function spawnCapsule(){
    const pm=new pc.StandardMaterial();pm.diffuse.set(.3,.5,.9);pm.update();
    const hm=new pc.StandardMaterial();hm.diffuse.set(.9,.7,.5);hm.update();
    const r=new pc.Entity('Player');
    const b=new pc.Entity();b.addComponent('render',{type:'capsule',material:pm});b.setLocalPosition(0,1,0);b.setLocalScale(.5,2,.5);r.addChild(b);
    const h=new pc.Entity();h.addComponent('render',{type:'sphere',material:hm});h.setLocalPosition(0,2.2,0);h.setLocalScale(.4,.4,.4);r.addChild(h);
    r.setLocalPosition(_px,0,_pz);_app.root.addChild(r);_plyEnt=r;
  }

  // ── Camera update ─────────────────────────────────
  function updateCam(){
    const behind=_pang+Math.PI+_lookYaw;
    const tx=_px+Math.sin(behind)*Math.cos(_lookPitch)*C_DIST;
    const ty=Math.sin(_lookPitch)*C_DIST+1.0;
    const tz=_pz+Math.cos(behind)*Math.cos(_lookPitch)*C_DIST;
    _camX+=( tx-_camX)*.1; _camY+=(ty-_camY)*.1; _camZ+=(tz-_camZ)*.1;
    camEnt.setLocalPosition(_camX,_camY,_camZ);
    camEnt.lookAt(new pc.Vec3(_px,1.0,_pz));
  }

  // ── Update loop ──────────────────────────────────
  _app.on('update',dt=>{
    if(!_plyEnt) return;
    dt=Math.min(dt,.05);
    const len=Math.hypot(_jx,_jy);
    if(len>0.05){
      const tAng=Math.atan2(_jx,_jy)+_lookYaw;
      let diff=tAng-_pang;
      while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;
      _pang+=diff*Math.min(ROT_SENS*dt,1);
      const mx=Math.sin(_pang)*P_SPD*len*dt;
      const mz=Math.cos(_pang)*P_SPD*len*dt;
      const nx=_px+mx,nz=_pz+mz;
      if(!collidesAt(nx,nz)){_px=nx;_pz=nz;}
      else if(!collidesAt(nx,_pz)){_px=nx;}
      else if(!collidesAt(_px,nz)){_pz=nz;}
      // Move pivot (wrapper root) — works regardless of GLB scale
      _plyEnt.setLocalPosition(_px,0,_pz);
      _plyEnt.setEulerAngles(0,_pang*180/Math.PI,0);
      // Switch to walk animation
      if(!_isWalking){ _isWalking=true; _playAnim(_walkClip); }
    } else {
      // Switch to idle animation
      if(_isWalking){ _isWalking=false; _playAnim(_idleClip); }
    }
    if(Math.hypot(_lx,_ly)>0.05){
      _lookYaw+=_lx*1.0*dt;
      _lookPitch-=_ly*0.75*dt;
      _lookPitch=Math.max(-.2,Math.min(.9,_lookPitch));
    }
    updateCam();
  });

  // ── Joystick builder ─────────────────────────────
  function buildJoystick(baseId,knobId,setXY){
    const base=document.getElementById(baseId);
    const knob=document.getElementById(knobId);
    if(!base||!knob) return;
    const LIM=36;let tid=null,cx=0,cy=0;
    function move(px,py){
      let dx=px-cx,dy=py-cy,d=Math.hypot(dx,dy);
      if(d>LIM){dx=dx/d*LIM;dy=dy/d*LIM;}
      knob.style.transform='translate(calc(-50% + '+dx+'px),calc(-50% + '+dy+'px))';
      setXY(dx/LIM,-dy/LIM);
    }
    function end(){tid=null;knob.style.transform='translate(-50%,-50%)';setXY(0,0);}
    base.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];tid=t.identifier;const r=base.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;move(t.clientX,t.clientY);},{passive:false});
    base.addEventListener('touchmove',e=>{e.preventDefault();for(let i=0;i<e.changedTouches.length;i++){if(e.changedTouches[i].identifier===tid){move(e.changedTouches[i].clientX,e.changedTouches[i].clientY);break;}}},{passive:false});
    base.addEventListener('touchend',e=>{for(let i=0;i<e.changedTouches.length;i++){if(e.changedTouches[i].identifier===tid){end();break;}}},{passive:false});
    base.addEventListener('touchcancel',end,{passive:true});
  }

  buildJoystick('jbase','jknob',(x,y)=>{_jx=x;_jy=y;});
  buildJoystick('rbase','rknob',(x,y)=>{_lx=x;_ly=y;});

  spawnPlayer();
  setBar(100,'');

  showPlayBtn();
}

// ── PLAY button ───────────────────────────────────────
document.getElementById('spl-play').addEventListener('click', ()=>{
  document.getElementById('splash').style.transition='opacity .4s';
  document.getElementById('splash').style.opacity='0';
  document.getElementById('ui').style.display='block';
  setTimeout(()=>{ document.getElementById('splash').style.display='none'; if(_app)_app.resizeCanvas(); },420);
});
`;

  // ── Assemble HTML ─────────────────────────────────────
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>${cfg.title}</title>
<style>${css}</style>
</head>
<body>

<!-- SPLASH -->
<div id="splash">
  <div id="spl-title">${cfg.title}</div>
  <div id="spl-sub">${cfg.subtitle}</div>
  <div id="spl-bar-wrap"><div id="spl-bar"></div></div>
  <div id="spl-msg">Initializing...</div>
  <div id="spl-err"></div>
  <div id="spl-play">▶ PLAY</div>
</div>

<!-- HUD (hidden until PLAY) -->
<div id="ui" style="display:none">
  <div id="jbase"><div id="jknob"></div><div id="jlbl">MOVE</div></div>
  <div id="rbase"><div id="rknob"></div><div id="rlbl">LOOK</div></div>
  <div id="spdhud">0<span>SPD</span></div>
</div>

${S} defer>
${gameScript}
${ES}
</body>
</html>`;
}


console.log('[EUG] eug-publish.js loaded');
