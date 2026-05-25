// EUG Weather System

//  3. WEATHER SYSTEM — full toolbar integration
// ══════════════════════════════════════════════════════

let _activeWeather = 'clear';
let _weatherParticles = [];
let _weatherInterval = null;
let _fogEntity = null;

const WEATHER_CONFIGS = {
  clear:       { sky:[.38,.52,.72], ambient:[.22,.25,.30], sunInt:0.9, fogAlpha:0 },
  cloudy:      { sky:[.35,.38,.42], ambient:[.25,.28,.32], sunInt:0.4, fogAlpha:0 },
  rain_light:  { sky:[.18,.22,.28], ambient:[.18,.22,.28], sunInt:0.15, fogAlpha:.04 },
  rain_heavy:  { sky:[.10,.12,.16], ambient:[.12,.15,.18], sunInt:0.05, fogAlpha:.08 },
  storm:       { sky:[.05,.07,.12], ambient:[.08,.10,.14], sunInt:0.02, fogAlpha:.14 },
  fog:         { sky:[.55,.58,.60], ambient:[.30,.32,.33], sunInt:0.5,  fogAlpha:.22 },
  snow:        { sky:[.60,.65,.70], ambient:[.35,.38,.40], sunInt:0.6,  fogAlpha:.06 },
  sunset:      { sky:[.72,.38,.18], ambient:[.28,.22,.18], sunInt:0.6,  fogAlpha:0 },
};

function setWeather(type) {
  _activeWeather = type;
  const cfg = WEATHER_CONFIGS[type] || WEATHER_CONFIGS.clear;

  // Sky + ambient
  if(camEnt && camEnt.camera) {
    camEnt.camera.clearColor = new pc.Color(...cfg.sky);
  }
  app.scene.ambientLight = new pc.Color(...cfg.ambient);
  if(sun && sun.light) sun.light.intensity = cfg.sunInt;

  // Stop old weather particles
  _clearWeatherParticles();
  if(_weatherInterval) { clearInterval(_weatherInterval); _weatherInterval = null; }

  // Fog overlay
  if(_fogEntity) { try{ _fogEntity.destroy(); }catch(e){} _fogEntity = null; }
  if(cfg.fogAlpha > 0) {
    const fm = new pc.StandardMaterial();
    fm.diffuse.set(.5,.55,.6); fm.opacity = cfg.fogAlpha;
    fm.blendType = pc.BLEND_NORMAL; fm.depthWrite = false;
    fm.cull = pc.CULLFACE_NONE; fm.update();
    _fogEntity = new pc.Entity('WeatherFog');
    _fogEntity.addComponent('render',{type:'plane',material:fm,castShadows:false,receiveShadows:false});
    _fogEntity.setLocalPosition(edCam.target.x, 8, edCam.target.z);
    _fogEntity.setLocalScale(400,1,400);
    _fogEntity.setLocalEulerAngles(0,0,0);
    app.root.addChild(_fogEntity);
  }

  // Start particle loop
  if(type === 'rain_light' || type === 'rain_heavy' || type === 'storm') {
    _startRainParticles(type);
  } else if(type === 'snow') {
    _startSnowParticles();
  }

  // Update UI buttons
  document.querySelectorAll('.weather-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.weather === type);
  });

  showToast('🌡 Weather: '+type.replace(/_/g,' '));
}

function _clearWeatherParticles() {
  _weatherParticles.forEach(p => { try{ p.entity.destroy(); }catch(e){} });
  _weatherParticles.length = 0;
}

function _startRainParticles(type) {
  const heavy = type === 'rain_heavy' || type === 'storm';
  const count = heavy ? 80 : 30;
  const range = 60;
  const mat = new pc.StandardMaterial();
  mat.diffuse.set(.55,.65,.9); mat.opacity = heavy ? .7 : .45;
  mat.blendType = pc.BLEND_NORMAL; mat.depthWrite = false; mat.update();

  for(let i = 0; i < count; i++) {
    const e = new pc.Entity('Rain'+i);
    e.addComponent('render',{type:'capsule',material:mat,castShadows:false});
    e.setLocalScale(.015,.35,.015);
    const rx = (Math.random()-.5)*range;
    const rz = (Math.random()-.5)*range;
    const ry = 5 + Math.random()*15;
    e.setLocalPosition(edCam.target.x+rx, ry, edCam.target.z+rz);
    e.setLocalEulerAngles(12,0,0);
    app.root.addChild(e);
    _weatherParticles.push({ entity:e, vy: -(18+Math.random()*10), rx, rz, ry });
  }

  _weatherInterval = setInterval(() => {
    const cx = edCam.target.x, cz = edCam.target.z;
    const dt = 0.033;
    _weatherParticles.forEach(p => {
      if(!p.entity || !p.entity.enabled) return;
      p.ry += p.vy * dt;
      p.entity.setLocalPosition(cx+p.rx, p.ry, cz+p.rz);
      if(p.ry < 0) {
        // splat + reset
        p.ry = 10 + Math.random()*12;
        p.rx = (Math.random()-.5)*range;
        p.rz = (Math.random()-.5)*range;
        // lightning flash on storm
        if(type === 'storm' && Math.random() < .005) {
          const orig = app.scene.ambientLight.clone();
          app.scene.ambientLight = new pc.Color(1,1,1);
          setTimeout(()=>{ app.scene.ambientLight = orig; }, 60 + Math.random()*80);
        }
      }
    });
    // Move fog with camera
    if(_fogEntity) _fogEntity.setLocalPosition(cx, 8, cz);
  }, 33);
}

function _startSnowParticles() {
  const count = 50;
  const range = 50;
  const mat = new pc.StandardMaterial();
  mat.diffuse.set(.9,.92,1); mat.opacity = .65;
  mat.blendType = pc.BLEND_NORMAL; mat.depthWrite = false; mat.update();

  for(let i = 0; i < count; i++) {
    const e = new pc.Entity('Snow'+i);
    e.addComponent('render',{type:'sphere',material:mat,castShadows:false});
    const s = 0.04 + Math.random()*.06;
    e.setLocalScale(s,s,s);
    const rx = (Math.random()-.5)*range;
    const rz = (Math.random()-.5)*range;
    const ry = 3 + Math.random()*14;
    e.setLocalPosition(edCam.target.x+rx, ry, edCam.target.z+rz);
    app.root.addChild(e);
    _weatherParticles.push({ entity:e, vy:-(0.5+Math.random()*.8), vx:(Math.random()-.5)*.3, rx, rz, ry, phase:Math.random()*Math.PI*2 });
  }

  _weatherInterval = setInterval(() => {
    const cx = edCam.target.x, cz = edCam.target.z;
    const dt = 0.033;
    _weatherParticles.forEach(p => {
      if(!p.entity || !p.entity.enabled) return;
      p.phase += dt*0.8;
      p.ry += p.vy * dt;
      p.rx += p.vx * dt + Math.sin(p.phase)*.008;
      p.entity.setLocalPosition(cx+p.rx, p.ry, cz+p.rz);
      if(p.ry < 0) {
        p.ry = 10 + Math.random()*10;
        p.rx = (Math.random()-.5)*range;
        p.rz = (Math.random()-.5)*range;
      }
    });
    if(_fogEntity) _fogEntity.setLocalPosition(cx, 8, cz);
  }, 33);
}

function openWeatherPanel() {
  const panel = document.createElement('div');
  panel.id = 'weather-panel';
  panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:900;display:flex;flex-direction:column;padding:16px;overflow-y:auto';

  const weathers = [
    { id:'clear',      icon:'☀️',  label:'Clear',       desc:'Sunny daytime' },
    { id:'cloudy',     icon:'☁️',  label:'Cloudy',      desc:'Overcast sky' },
    { id:'fog',        icon:'🌫️', label:'Fog',         desc:'Dense fog' },
    { id:'rain_light', icon:'🌦️', label:'Light Rain',  desc:'Gentle drizzle' },
    { id:'rain_heavy', icon:'🌧️', label:'Heavy Rain',  desc:'Downpour' },
    { id:'storm',      icon:'⛈️', label:'Storm',       desc:'Thunder + lightning' },
    { id:'snow',       icon:'❄️',  label:'Snow',        desc:'Snowfall' },
    { id:'sunset',     icon:'🌅',  label:'Sunset',      desc:'Orange horizon' },
  ];

  panel.innerHTML = `
    <div style="display:flex;align-items:center;margin-bottom:14px">
      <span style="font-size:15px;font-weight:800;color:var(--accent);flex:1">🌦 Weather System</span>
      <div onclick="this.closest('#weather-panel').remove()" ontouchend="this.closest('#weather-panel').remove();event.preventDefault()"
        style="padding:8px 14px;background:var(--bg3);color:var(--text);border-radius:8px;font-size:13px;cursor:pointer;touch-action:manipulation">✕</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${weathers.map(w=>`
        <div class="weather-btn tp-color ${_activeWeather===w.id?'on':''}" data-weather="${w.id}"
          onclick="setWeather('${w.id}');document.querySelectorAll('.weather-btn').forEach(b=>b.classList.toggle('on',b.dataset.weather==='${w.id}'))"
          ontouchend="setWeather('${w.id}');document.querySelectorAll('.weather-btn').forEach(b=>b.classList.toggle('on',b.dataset.weather==='${w.id}'));event.preventDefault()"
          style="padding:14px 8px;border-radius:10px">
          <div style="font-size:28px;margin-bottom:4px">${w.icon}</div>
          <div style="font-size:12px;font-weight:700">${w.label}</div>
          <div style="font-size:10px;color:var(--text2);margin-top:2px">${w.desc}</div>
        </div>`).join('')}
    </div>
    <div style="background:var(--bg3);border-radius:10px;padding:12px;margin-bottom:10px">
      <div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:8px">⚡ AUTO CYCLE</div>
      <div style="display:flex;gap:8px">
        <div onclick="startWeatherCycle()" ontouchend="startWeatherCycle();event.preventDefault()"
          style="flex:1;padding:9px;background:var(--green);color:#fff;border-radius:8px;font-size:12px;font-weight:700;text-align:center;cursor:pointer;touch-action:manipulation">▶ Start Cycle</div>
        <div onclick="stopWeatherCycle()" ontouchend="stopWeatherCycle();event.preventDefault()"
          style="flex:1;padding:9px;background:var(--bg4);color:var(--text);border-radius:8px;font-size:12px;font-weight:700;text-align:center;cursor:pointer;touch-action:manipulation">⏹ Stop Cycle</div>
      </div>
    </div>`;
  document.body.appendChild(panel);
}

let _weatherCycleInterval = null;
function startWeatherCycle() {
  const cycle = ['clear','cloudy','rain_light','rain_heavy','storm','fog','clear','snow','sunset'];
  let i = 0;
  setWeather(cycle[i]);
  if(_weatherCycleInterval) clearInterval(_weatherCycleInterval);
  _weatherCycleInterval = setInterval(() => { i=(i+1)%cycle.length; setWeather(cycle[i]); }, 12000);
  showToast('⛅ Weather cycling...');
}
function stopWeatherCycle() {
  if(_weatherCycleInterval) { clearInterval(_weatherCycleInterval); _weatherCycleInterval = null; }
  showToast('⏹ Weather cycle stopped');
}

// Add WEATHER button to topbar
(function() {
  const topbar = document.getElementById('topbar');
  if(!topbar) return;
  const btn = document.createElement('div');
  btn.className = 'tb-btn';
  btn.id = 'weather-tb-btn';
  btn.innerHTML = '<i>🌦</i>WEATHER';
  btn.addEventListener('click', openWeatherPanel);
  btn.addEventListener('touchend', e=>{ e.preventDefault(); openWeatherPanel(); });
  // Insert before the WORLD button
  const worldBtn = topbar.querySelector('[onclick*="toggleWorldMenu"]');
  if(worldBtn) topbar.insertBefore(btn, worldBtn);
  else topbar.appendChild(btn);
})();

// ══════════════════════════════════════════════════════
//  4. SNAP & GRID BUILD MODE
// ══════════════════════════════════════════════════════

let _snapEnabled = false;
let _snapSize    = 2; // world units

function snapVal(v) {
  if(!_snapEnabled) return v;
  return Math.round(v / _snapSize) * _snapSize;
}

// Patch screenToWorld to return snapped values when snap ON
const _origScreenToWorld = window.screenToWorld;
window.screenToWorld = function(cx, cy) {
  const pt = _origScreenToWorld(cx, cy);
  if(!pt || !_snapEnabled) return pt;
  return new pc.Vec3(snapVal(pt.x), pt.y, snapVal(pt.z));
};

function toggleSnap() {
  _snapEnabled = !_snapEnabled;
  const btn = document.getElementById('snap-tb-btn');
  if(btn) {
    btn.style.color    = _snapEnabled ? 'var(--green)' : 'var(--text2)';
    btn.style.background = _snapEnabled ? 'rgba(62,207,126,.12)' : '';
  }
  document.querySelectorAll('.snap-size-btn').forEach(b => b.classList.toggle('on', +b.dataset.size===_snapSize));
  showToast(_snapEnabled ? '📐 Snap ON ('+_snapSize+'u)' : '📐 Snap OFF');
}

function setSnapSize(s) {
  _snapSize = s;
  document.querySelectorAll('.snap-size-btn').forEach(b => b.classList.toggle('on', +b.dataset.size===s));
  if(_snapEnabled) showToast('📐 Snap size: '+s+' units');
}

function openSnapPanel() {
  const existing = document.getElementById('snap-panel');
  if(existing) { existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'snap-panel';
  panel.style.cssText = 'position:fixed;top:50px;right:10px;z-index:800;background:#13131c;border:1px solid var(--border);border-radius:12px;padding:14px;width:200px;box-shadow:0 6px 24px rgba(0,0,0,.7)';
  panel.innerHTML = `
    <div style="font-size:11px;font-weight:800;color:var(--accent);margin-bottom:10px;letter-spacing:.5px">📐 SNAP & GRID</div>

    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:12px;color:var(--text)">Grid Snap</span>
      <div id="snap-toggle-inner" onclick="toggleSnap()" ontouchend="toggleSnap();event.preventDefault()"
        style="padding:5px 12px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation;
        background:${_snapEnabled?'var(--green)':'var(--bg3)'};color:${_snapEnabled?'#000':'var(--text2)'}">
        ${_snapEnabled?'ON':'OFF'}
      </div>
    </div>

    <div style="font-size:10px;color:var(--text2);margin-bottom:6px;letter-spacing:.5px">SNAP SIZE</div>
    <div style="font-size:9px;color:var(--text2);margin-bottom:4px;letter-spacing:.3px">Fine</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;margin-bottom:6px">
      ${[0.001,0.005,0.01,0.05,0.1,0.25,0.5,1].map(s=>`
        <div class="snap-size-btn tp-color ${_snapSize===s&&_snapEnabled?'on':''}" data-size="${s}"
          onclick="setSnapSize(${s});document.getElementById('snap-toggle-inner').textContent='ON';document.getElementById('snap-toggle-inner').style.background='var(--green)';document.getElementById('snap-toggle-inner').style.color='#000';if(!_snapEnabled)toggleSnap();"
          ontouchend="setSnapSize(${s});event.preventDefault()"
          style="padding:6px 2px;font-size:9px">${s}</div>`).join('')}
    </div>
    <div style="font-size:9px;color:var(--text2);margin-bottom:4px;letter-spacing:.3px">Coarse</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;margin-bottom:8px">
      ${[2,4,5,8,10,16,20,50].map(s=>`
        <div class="snap-size-btn tp-color ${_snapSize===s&&_snapEnabled?'on':''}" data-size="${s}"
          onclick="setSnapSize(${s});document.getElementById('snap-toggle-inner').textContent='ON';document.getElementById('snap-toggle-inner').style.background='var(--green)';document.getElementById('snap-toggle-inner').style.color='#000';if(!_snapEnabled)toggleSnap();"
          ontouchend="setSnapSize(${s});event.preventDefault()"
          style="padding:6px 2px;font-size:10px">${s}u</div>`).join('')}
    </div>
    <div style="font-size:9px;color:var(--text2);margin-bottom:4px;letter-spacing:.3px">Custom value</div>
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:10px">
      <input id="snap-custom-val" type="number" min="0.001" step="0.001" value="${_snapSize}"
        style="flex:1;background:#0a0a14;border:1px solid var(--border);border-radius:7px;color:var(--text);font-size:13px;font-weight:700;padding:6px 8px;outline:none;text-align:center;">
      <div id="snap-custom-apply" style="padding:7px 12px;background:var(--accent);color:#fff;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation;white-space:nowrap">Set</div>
    </div>

    <div style="font-size:10px;color:var(--text2);margin-bottom:6px;letter-spacing:.5px">ALIGN SELECTED</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
      <div onclick="snapAlignSelected('floor')" ontouchend="snapAlignSelected('floor');event.preventDefault()"
        style="padding:7px 4px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;font-size:10px;font-weight:600;text-align:center;cursor:pointer;touch-action:manipulation">
        ⬇ To Floor</div>
      <div onclick="snapAlignSelected('grid')" ontouchend="snapAlignSelected('grid');event.preventDefault()"
        style="padding:7px 4px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;font-size:10px;font-weight:600;text-align:center;cursor:pointer;touch-action:manipulation">
        📐 To Grid</div>
      <div onclick="snapAlignSelected('rotY90')" ontouchend="snapAlignSelected('rotY90');event.preventDefault()"
        style="padding:7px 4px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;font-size:10px;font-weight:600;text-align:center;cursor:pointer;touch-action:manipulation">
        ↻ Rot 90°</div>
      <div onclick="snapAlignSelected('center')" ontouchend="snapAlignSelected('center');event.preventDefault()"
        style="padding:7px 4px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;font-size:10px;font-weight:600;text-align:center;cursor:pointer;touch-action:manipulation">
        ⊕ To Origin</div>
    </div>

    <div id="snap-close" style="margin-top:10px;padding:8px;background:var(--bg3);border-radius:7px;font-size:11px;text-align:center;cursor:pointer;touch-action:manipulation;color:var(--text2)">Close ✕</div>`;

  document.body.appendChild(panel);

  panel.querySelector('#snap-close').addEventListener('click', ()=>panel.remove());
  panel.querySelector('#snap-close').addEventListener('touchend', e=>{e.preventDefault();panel.remove();});

  // Custom snap value
  const applyCustomSnap = () => {
    const v = parseFloat(panel.querySelector('#snap-custom-val').value);
    if(!isNaN(v) && v > 0) {
      setSnapSize(v);
      const tog = document.getElementById('snap-toggle-inner');
      if(tog){ tog.textContent='ON'; tog.style.background='var(--green)'; tog.style.color='#000'; }
      if(!_snapEnabled) toggleSnap();
      showToast('📐 Custom snap: '+v);
    }
  };
  panel.querySelector('#snap-custom-apply').addEventListener('click', applyCustomSnap);
  panel.querySelector('#snap-custom-apply').addEventListener('touchend', e=>{ e.preventDefault(); applyCustomSnap(); });
  panel.querySelector('#snap-custom-val').addEventListener('keydown', e=>{ if(e.key==='Enter') applyCustomSnap(); });
  // Close when clicking outside
  setTimeout(()=>{
    const closeOnOut = e=>{ if(!panel.contains(e.target)&&e.target.id!=='snap-tb-btn'){ panel.remove(); document.removeEventListener('mousedown',closeOnOut); document.removeEventListener('touchend',closeOnOut); }};
    document.addEventListener('mousedown', closeOnOut);
    document.addEventListener('touchend', closeOnOut);
  },100);
}

function snapAlignSelected(mode) {
  if(!selectedEntity) { showToast('Select an object first'); return; }
  const p = selectedEntity.getLocalPosition();
  if(mode === 'floor') {
    selectedEntity.setLocalPosition(p.x, 0, p.z);
    showToast('⬇ Snapped to floor');
  } else if(mode === 'grid') {
    selectedEntity.setLocalPosition(snapVal(p.x), p.y, snapVal(p.z));
    showToast('📐 Snapped to grid ('+_snapSize+'u)');
  } else if(mode === 'rotY90') {
    const r = selectedEntity.getLocalEulerAngles();
    const newY = Math.round(r.y/90)*90 + 90;
    selectedEntity.setLocalEulerAngles(r.x, newY, r.z);
    showToast('↻ Rotated to '+newY+'°');
  } else if(mode === 'center') {
    selectedEntity.setLocalPosition(0, p.y, 0);
    showToast('⊕ Moved to origin');
  }
  if(typeof showTransformPanel==='function') showTransformPanel(selectedEntity);
  if(typeof showSelectionOutline==='function') showSelectionOutline(selectedEntity);
}

// Add SNAP button to topbar
(function() {
  const topbar = document.getElementById('topbar');
  if(!topbar) return;
  const btn = document.createElement('div');
  btn.className = 'tb-btn';
  btn.id = 'snap-tb-btn';
  btn.style.cssText += 'border-left:1px solid var(--border)';
  btn.innerHTML = '<i>📐</i>SNAP';
  btn.addEventListener('click', openSnapPanel);
  btn.addEventListener('touchend', e=>{ e.preventDefault(); openSnapPanel(); });
  const weatherBtn = document.getElementById('weather-tb-btn');
  if(weatherBtn) topbar.insertBefore(btn, weatherBtn);
  else topbar.appendChild(btn);
})();

// Draw snap grid indicator overlay when snap is ON
(function() {
  app.on('update', () => {
    if(!_snapEnabled || playActive) return;
    const snapGridCanvas = document.getElementById('snap-grid-canvas');
    if(!snapGridCanvas) return;
    const vp = document.getElementById('viewport');
    const W = vp.clientWidth, H = vp.clientHeight;
    if(snapGridCanvas.width!==W||snapGridCanvas.height!==H){ snapGridCanvas.width=W; snapGridCanvas.height=H; }
    const ctx = snapGridCanvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    // Draw snap points as small dots
    function w2s(wx,wz){
      try {
        const s = camEnt.camera.worldToScreen(new pc.Vec3(wx,0,wz));
        if(!s||s.z<=0) return null;
        const ac=document.getElementById('application');
        return {x:s.x*(W/(ac.width||W)),y:s.y*(H/(ac.height||H))};
      } catch(e){ return null; }
    }

    const leftW  = (() =>{ const near=new pc.Vec3(),far=new pc.Vec3(); camEnt.camera.screenToWorld(0,H/2,.1,near); camEnt.camera.screenToWorld(0,H/2,100,far); const d=far.clone().sub(near).normalize(); if(Math.abs(d.y)<.001)return null; const t=-near.y/d.y; if(t<0)return null; return {x:near.x+d.x*t,z:near.z+d.z*t}; })();
    const rightW = (() =>{ const near=new pc.Vec3(),far=new pc.Vec3(); camEnt.camera.screenToWorld(W,H/2,.1,near); camEnt.camera.screenToWorld(W,H/2,100,far); const d=far.clone().sub(near).normalize(); if(Math.abs(d.y)<.001)return null; const t=-near.y/d.y; if(t<0)return null; return {x:near.x+d.x*t,z:near.z+d.z*t}; })();
    if(!leftW||!rightW) return;

    const worldWidth = Math.abs(rightW.x-leftW.x);
    if(worldWidth > _snapSize*40) return; // too zoomed out, skip dots

    const minX=Math.min(leftW.x,rightW.x)-_snapSize;
    const maxX=Math.max(leftW.x,rightW.x)+_snapSize;

    const topW  = (() =>{ const near=new pc.Vec3(),far=new pc.Vec3(); camEnt.camera.screenToWorld(W/2,0,.1,near); camEnt.camera.screenToWorld(W/2,0,100,far); const d=far.clone().sub(near).normalize(); if(Math.abs(d.y)<.001)return null; const t=-near.y/d.y; if(t<0)return null; return {x:near.x+d.x*t,z:near.z+d.z*t}; })();
    const botW  = (() =>{ const near=new pc.Vec3(),far=new pc.Vec3(); camEnt.camera.screenToWorld(W/2,H,.1,near); camEnt.camera.screenToWorld(W/2,H,100,far); const d=far.clone().sub(near).normalize(); if(Math.abs(d.y)<.001)return null; const t=-near.y/d.y; if(t<0)return null; return {x:near.x+d.x*t,z:near.z+d.z*t}; })();
    if(!topW||!botW) return;
    const minZ=Math.min(topW.z,botW.z)-_snapSize;
    const maxZ=Math.max(topW.z,botW.z)+_snapSize;

    ctx.fillStyle = 'rgba(62,207,126,0.55)';
    for(let x=Math.ceil(minX/_snapSize)*_snapSize; x<=maxX; x+=_snapSize) {
      for(let z=Math.ceil(minZ/_snapSize)*_snapSize; z<=maxZ; z+=_snapSize) {
        const s = w2s(x,z);
        if(!s) continue;
        ctx.beginPath(); ctx.arc(s.x,s.y,2.2,0,Math.PI*2); ctx.fill();
      }
    }
  });

  // Create snap grid canvas
  const existing2 = document.getElementById('snap-grid-canvas');
  if(!existing2) {
    const sgc = document.createElement('canvas');
    sgc.id = 'snap-grid-canvas';
    sgc.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:5;';
    const vp = document.getElementById('viewport');
    if(vp) vp.appendChild(sgc);
  }
})();

// Add NPC spawning in play mode when clicking viewport with npc tool
// (in edit mode it works via setTool, above)

// Patch npcWalk to also update in edit mode (handled by _npcTickInterval above)
// but reset count when clearing
const _origNewScene = window.newScene;
window.newScene = function(silent) {
  _origNewScene(silent);
  npcsAI.forEach(n => { try{ n.entity.destroy(); }catch(e){} });
  npcsAI.length = 0;
  _npcRefreshCount();
};

// Final WORLD menu additions
WORLD_ITEMS.push(
  {icon:'🌦', label:'Weather Panel',  fn:'openWeatherPanel()'},
  {icon:'📐', label:'Snap Panel',     fn:'openSnapPanel()'},
  {icon:'🧍', label:'Spawn 5 NPCs',   fn:'npcSpawnAtCamera(5)'},
  {icon:'🗑', label:'Clear NPCs',     fn:'npcClearAll()'},
  {icon:'💾', label:'Save Scene',     fn:'saveScene()'},
);
if(typeof buildWorldMenu==='function') buildWorldMenu();


console.log('[EUG] eug-weather.js loaded');
