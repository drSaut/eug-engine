// EUG Player System

//  PLAY MODE — PLAYER (proven minimal system)
// ══════════════════════════════════════════════════════
let _plyEnt = null;
let _px = 0, _pz = 0, _pang = 0;
let _jx = 0, _jy = 0;
let _cang = 0;
let _eugIdleClip = null, _eugWalkClip = null, _eugCurClip = null;
const P_SPEED = 5, C_PITCH = 0.5;
let C_DIST = 6;  // mutable — auto-set after player spawn
let _camDist = C_DIST; // current zoom distance (changed by pinch)
let _camX=0, _camY=5, _camZ=-6;

// ── Camera user settings (adjustable via CAM panel in play mode) ──
window._camSettings = {
  distance: 6,    // distance behind player (metres)
  tilt:     0.3,  // vertical pitch angle (radians, 0=horizontal, 1.2=top-down)
  fov:      75,   // field of view (degrees)
  lookHeight: 1.0 // look-at height above pivot (metres)
};

// ── Camera collision — prevent camera going through walls ──────────
function _camCollide(fromX, fromY, fromZ, toX, toY, toZ) {
  // Simple AABB sweep: move camera toward player if wall is between them
  const dx = toX - fromX, dy = toY - fromY, dz = toZ - fromZ;
  const len = Math.sqrt(dx*dx + dy*dy + dz*dz);
  if(len < 0.01) return {x:fromX, y:fromY, z:fromZ};

  const nx = dx/len, ny = dy/len, nz = dz/len;
  const STEPS = 8;
  const stepLen = len / STEPS;
  let bestT = 1.0; // 0=camera pos, 1=player pos

  // Walk from camera toward player, find first unblocked position
  for(let s = 1; s <= STEPS; s++) {
    const t  = s / STEPS;
    const cx = fromX + dx * t;
    const cz = fromZ + dz * t;

    let blocked = false;
    for(let i = 0; i < placedBuildings.length; i++) {
      const b = placedBuildings[i];
      if(!b.entity) continue;
      try {
        const bp = b.entity.getPosition();
        const bs = b.entity.getLocalScale();
        const hw = bs.x * 0.5 + 0.3;
        const hd = bs.z * 0.5 + 0.3;
        if(cx > bp.x-hw && cx < bp.x+hw && cz > bp.z-hd && cz < bp.z+hd) {
          blocked = true; break;
        }
      } catch(e) {}
    }
    if(!blocked) { bestT = t; break; }
  }

  return {
    x: fromX + dx * bestT,
    y: fromY + dy * bestT,
    z: fromZ + dz * bestT
  };
}

function _spawnPlayerCapsule() {
  // ── Step 1: destroy ALL previous temp capsules ────────
  // Find and destroy every EUG_Player / _Fallback in scene
  try {
    const toKill = [];
    function findTempPlayers(node) {
      const nm = node.name || '';
      if(nm === 'EUG_Player' || nm.startsWith('_Fallback')) toKill.push(node);
      (node.children||[]).forEach(findTempPlayers);
    }
    // Search only direct children of app.root to be safe
    (app.root.children||[]).forEach(c => {
      const nm = c.name || '';
      if(nm === 'EUG_Player' || nm.startsWith('_Fallback')) toKill.push(c);
    });
    toKill.forEach(e => { try{ e.destroy(); }catch(ex){} });
  } catch(e) {}
  _plyEnt = null;

  // ── Step 2: find Player in scene (GLB / Auto Player) ──
  let sceneEnt = _playerSceneEnt;
  if(!sceneEnt || !sceneEnt.enabled) {
    function findNamed(node, name) {
      if((node.name||'').toLowerCase() === name) return node;
      for(const c of (node.children||[])) { const f=findNamed(c,name); if(f) return f; }
      return null;
    }
    sceneEnt = findNamed(app.root, 'player');
  }
  if(!sceneEnt) {
    const all = [...glbModels, ...remoteModels];
    if(all[0] && all[0].entity) sceneEnt = all[0].entity;
  }

  if(sceneEnt) {
    // Walk UP to find direct app.root child (pivot)
    let pivot = sceneEnt;
    try {
      let cur = sceneEnt;
      while(cur && cur.parent && cur.parent !== app.root) cur = cur.parent;
      if(cur && cur.parent === app.root) pivot = cur;
    } catch(e) {}

    _plyEnt = pivot;
    try {
      const wp = pivot.getPosition();
      _px = wp.x; _pz = wp.z;
    } catch(e) {
      _px = edCam.target.x; _pz = edCam.target.z;
    }
    _pang = 0;
    _camX = _px; _camY = 8; _camZ = _pz + C_DIST;

    if(!_eugIdleClip && !_eugWalkClip) {
      const clips = typeof getEntityAnimClips==='function' ? getEntityAnimClips(sceneEnt) : [];
      _eugIdleClip = clips.find(c=>/idle|stand|bind|t.?pose/i.test(c)) || clips[0] || null;
      _eugWalkClip = clips.find(c=>/walk|run|move/i.test(c)) || clips[0] || null;
    }
    if(_eugIdleClip) _playAnimDeep(_plyEnt, _eugIdleClip);
    showToast('▶ Playing as: ' + pivot.name);
    return;
  }

  // ── Step 3: no scene entity — spawn ONE fresh capsule ─
  _px = edCam.target.x; _pz = edCam.target.z; _pang = 0;
  _spawnCapsuleFallback();
  showToast('⚠ No Player — tap ⚡ Auto Player on your GLB');
}

function _spawnCapsuleFallback() {
  const pm = new pc.StandardMaterial(); pm.diffuse.set(.3,.5,.9); pm.update();
  const hm = new pc.StandardMaterial(); hm.diffuse.set(.9,.7,.5); hm.update();
  const root = new pc.Entity('EUG_Player');
  const body = new pc.Entity(); body.addComponent('render',{type:'capsule',material:pm});
  body.setLocalPosition(0,1,0); body.setLocalScale(.5,2,.5); root.addChild(body);
  const head = new pc.Entity(); head.addComponent('render',{type:'sphere',material:hm});
  head.setLocalPosition(0,2.2,0); head.setLocalScale(.4,.4,.4); root.addChild(head);
  root.setLocalPosition(_px,0,_pz);
  app.root.addChild(root);
  _plyEnt = root;
}

function _spawnGLBPlayer(name, buf) {
  const blob = new Blob([buf], {type:'model/gltf-binary'});
  const url  = URL.createObjectURL(blob);
  const asset = new pc.Asset(name+'_player', 'container', {url});
  asset.preload = true;
  app.assets.add(asset);

  asset.once('load', () => {
    try {
      const inst = asset.resource.instantiateRenderEntity();
      if(!inst){ _spawnCapsuleFallback(); return; }

      // ── Always use a pivot wrapper ──────────────────────
      // This means _plyEnt.setPosition() always works in world space
      const pivot = new pc.Entity('Player');
      pivot.setLocalPosition(_px, 0, _pz);
      app.root.addChild(pivot);

      inst.name = 'EUG_Player_mesh';
      inst.setLocalPosition(0, 0, 0);
      inst.setLocalEulerAngles(0, 0, 0);
      pivot.addChild(inst);

      // Auto-scale to ~1.8m — applied to inst, pivot stays at (px,0,pz)
      setTimeout(()=>{
        let minY=1e9, maxY=-1e9;
        function measure(n){ if(n.render&&n.render.meshInstances) n.render.meshInstances.forEach(mi=>{ try{ const b=mi.aabb; minY=Math.min(minY,b.getMin().y); maxY=Math.max(maxY,b.getMax().y); }catch(e){}}); (n.children||[]).forEach(measure); }
        measure(inst);
        const h = maxY - minY;
        const sf = h > 0 ? 1.8/h : 0.01;
        inst.setLocalScale(sf, sf, sf);
        // Offset inst Y so feet are at pivot origin (ground level)
        inst.setLocalPosition(0, -(minY * sf), 0);

        // Auto camera distance
        C_DIST   = Math.max(4, Math.min(20, 1.8 * 4));
        _camDist = C_DIST;
        _camX = _px; _camY = C_DIST * 0.5; _camZ = _pz + C_DIST;
      }, 150);

      // Wire animations to inst
      const anims = asset.resource.animations || [];
      if(anims.length > 0) {
        try {
          if(!inst.anim) inst.addComponent('anim',{activate:true,speed:1});
          anims.forEach(a=>{ try{ inst.anim.assignAnimation(a.name, a.resource); }catch(e){} });
          _eugIdleClip = anims.find(a=>/idle|stand|bind|t.?pose/i.test(a.name))?.name || anims[0].name;
          _eugWalkClip = anims.find(a=>/walk|run|move/i.test(a.name))?.name || anims[0].name;
          try{ inst.anim.play(_eugIdleClip); }catch(e){}
        } catch(e){}
      }

      // _plyEnt = PIVOT — so setPosition(_px,0,_pz) moves the whole thing correctly
      _plyEnt = pivot;
      showToast('🧍 Player ready — '+(anims.length)+' anims');
    } catch(e) {
      devLog('error','GLB player spawn failed: '+e.message);
      _spawnCapsuleFallback();
    }
  });

  asset.once('error', ()=>{ _spawnCapsuleFallback(); });
  app.assets.load(asset);
}

function _destroyPlayerCapsule() {
  // Destroy temp capsules only (EUG_Player, _Fallback) — never GLB scene entities
  if(_plyEnt) {
    const nm = _plyEnt.name || '';
    if(nm === 'EUG_Player' || nm.startsWith('_Fallback')) {
      try{ _plyEnt.destroy(); }catch(e){}
    }
  }
  _plyEnt = null;
  _eugCurClip = null;
  // Also sweep for any orphan capsules left over
  try {
    (app.root.children||[]).slice().forEach(c => {
      const nm = c.name || '';
      if(nm === 'EUG_Player' || nm.startsWith('_Fallback')) {
        try{ c.destroy(); }catch(e){}
      }
    });
  } catch(e) {}
}

function _updateCam() {
  if(!camEnt) return;
  try {
    const cs   = window._camSettings;
    const dist = _camDist || cs.distance || C_DIST;
    const tilt = _lookPitch; // free-touch controlled, clamped
    const behind = _pang + Math.PI + _lookYaw - (_cang || 0);

    // Target camera position (ideal, ignoring walls)
    const idealX = _px + Math.sin(behind) * Math.cos(tilt) * dist;
    const idealY = Math.max(0.3, Math.sin(tilt) * dist + (cs.lookHeight || 1.0));
    const idealZ = _pz + Math.cos(behind) * Math.cos(tilt) * dist;

    // Player position (look-from target)
    const playerLookY = cs.lookHeight || 1.0;

    // Camera collision — push camera toward player if wall blocks
    const safe = _camCollide(idealX, idealY, idealZ, _px, playerLookY, _pz);

    // Smooth lerp to safe position
    _camX += (safe.x - _camX) * 0.12;
    _camY += (safe.y - _camY) * 0.12;
    _camZ += (safe.z - _camZ) * 0.12;

    // Never below ground
    if(_camY < 0.3) _camY = 0.3;

    camEnt.setLocalPosition(_camX, _camY, _camZ);
    camEnt.lookAt(new pc.Vec3(_px, playerLookY, _pz));

    // Apply FOV
    if(camEnt.camera && cs.fov) camEnt.camera.fov = cs.fov;
  } catch(e) {}
}

// Camera look angles (controlled by right joystick)
let _lookYaw   = 0;   // horizontal orbit around player
let _lookPitch = 0.3; // vertical tilt (radians, clamped like a neck)
let _lx = 0, _ly = 0; // right joystick axes
let _targetPang = 0;  // smooth target angle

// ── Left joystick rotation sensitivity ───────────────
// Adjustable via in-play panel. Default = 12 (original value)
window._rotSens = 12; // higher = snappier, lower = smoother/slower

function openSensPanel() {
  const existing = document.getElementById('sens-panel');
  if(existing){ existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'sens-panel';
  panel.style.cssText = [
    'position:fixed','top:60px','left:8px','z-index:700',
    'background:#13131c','border:1px solid #5b8dee55','border-radius:12px',
    'padding:12px 14px','width:210px','box-shadow:0 6px 24px rgba(0,0,0,.8)',
    'pointer-events:all',
  ].join(';');

  const PRESETS = [1, 2, 4, 6, 8, 10, 12, 16, 20];
  panel.innerHTML = `
    <div style="display:flex;align-items:center;margin-bottom:10px">
      <span style="font-size:12px;font-weight:800;color:#5b8dee;flex:1">🕹 Turn Sensitivity</span>
      <div id="sens-close" style="padding:4px 10px;background:#1a1a2e;color:#888;border-radius:6px;font-size:11px;cursor:pointer;touch-action:manipulation">✕</div>
    </div>
    <div style="font-size:9px;color:#5b8dee;margin-bottom:6px;letter-spacing:.5px">CURRENT: <span id="sens-cur-val" style="color:#fff;font-weight:700">${window._rotSens}</span></div>
    <input id="sens-slider" type="range" min="1" max="24" step="0.5" value="${window._rotSens}"
      style="width:100%;accent-color:#5b8dee;height:22px;margin-bottom:8px;cursor:pointer;">
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
      <input id="sens-num" type="number" min="0.5" max="30" step="0.5" value="${window._rotSens}"
        style="flex:1;background:#0a0a14;border:1px solid #5b8dee44;border-radius:7px;color:#fff;font-size:14px;font-weight:700;padding:6px 8px;text-align:center;outline:none;">
      <div id="sens-apply" style="padding:7px 12px;background:#5b8dee;color:#fff;border-radius:7px;font-size:11px;font-weight:800;cursor:pointer;touch-action:manipulation">Set</div>
    </div>
    <div style="font-size:9px;color:#404060;margin-bottom:5px;letter-spacing:.4px">PRESETS</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:4px">
      ${PRESETS.map(v=>`<div class="sens-preset" data-v="${v}"
        style="padding:5px 9px;background:${Math.abs(window._rotSens-v)<0.1?'rgba(91,141,238,.3)':'#1a1a2e'};
        border:1px solid ${Math.abs(window._rotSens-v)<0.1?'#5b8dee':'#2a2a3e'};
        border-radius:6px;font-size:10px;font-weight:700;color:${Math.abs(window._rotSens-v)<0.1?'#5b8dee':'#888'};
        cursor:pointer;touch-action:manipulation">${v}</div>`).join('')}
    </div>
    <div style="font-size:9px;color:#404060;margin-top:6px;line-height:1.5">Tip: lower = smoother turns<br>higher = snappier / faster</div>`;

  document.body.appendChild(panel);

  const curLabel = panel.querySelector('#sens-cur-val');
  const slider   = panel.querySelector('#sens-slider');
  const numInput = panel.querySelector('#sens-num');

  function applySens(v) {
    v = Math.max(0.5, Math.min(30, parseFloat(v) || 12));
    window._rotSens = v;
    slider.value    = v;
    numInput.value  = v;
    curLabel.textContent = v;
    panel.querySelectorAll('.sens-preset').forEach(b => {
      const on = Math.abs(parseFloat(b.dataset.v) - v) < 0.1;
      b.style.background   = on ? 'rgba(91,141,238,.3)' : '#1a1a2e';
      b.style.borderColor  = on ? '#5b8dee' : '#2a2a3e';
      b.style.color        = on ? '#5b8dee' : '#888';
    });
  }

  slider.addEventListener('input', () => applySens(slider.value));
  panel.querySelector('#sens-apply').addEventListener('click', () => applySens(numInput.value));
  panel.querySelector('#sens-apply').addEventListener('touchend', e=>{e.preventDefault();applySens(numInput.value);});
  numInput.addEventListener('keydown', e=>{ if(e.key==='Enter') applySens(numInput.value); });
  panel.querySelectorAll('.sens-preset').forEach(b => {
    b.addEventListener('click', () => applySens(parseFloat(b.dataset.v)));
    b.addEventListener('touchend', e=>{ e.preventDefault(); applySens(parseFloat(b.dataset.v)); });
  });
  panel.querySelector('#sens-close').addEventListener('click', ()=>panel.remove());
  panel.querySelector('#sens-close').addEventListener('touchend', e=>{e.preventDefault();panel.remove();});
}

// ── AABB Collision helper ─────────────────────────────
function _playerCollidesAt(px, pz) {
  const R = 0.5; // player radius
  // Check buildings — use stored w/d (root entity scale is always 1)
  for(let i = 0; i < placedBuildings.length; i++) {
    const b = placedBuildings[i];
    if(!b.entity) continue;
    try {
      const bx = b.cx !== undefined ? b.cx : b.entity.getPosition().x;
      const bz = b.cz !== undefined ? b.cz : b.entity.getPosition().z;
      const hw = (b.w !== undefined ? b.w : b.entity.getLocalScale().x) * 0.5 + R;
      const hd = (b.d !== undefined ? b.d : b.entity.getLocalScale().z) * 0.5 + R;
      if(px > bx-hw && px < bx+hw && pz > bz-hd && pz < bz+hd) return true;
    } catch(e) {}
  }
  // Check props — skip player entity and GLB types
  for(let i = 0; i < placedProps.length; i++) {
    const p = placedProps[i];
    if(!p.entity) continue;
    try {
      let isPlayer = false;
      let cur = _plyEnt;
      while(cur) { if(cur===p.entity){isPlayer=true;break;} cur=cur.parent; }
      if(isPlayer) continue;
    } catch(e) {}
    if(p.type && (p.type.startsWith('glb_') || p.type.startsWith('remote_'))) continue;
    try {
      const pp = p.entity.getPosition();
      const ps = p.entity.getLocalScale();
      const hw = (ps.x * 0.5) + R;
      const hd = (ps.z * 0.5) + R;
      if(px > pp.x-hw && px < pp.x+hw && pz > pp.z-hd && pz < pp.z+hd) return true;
    } catch(e) {}
  }
  return false;
}

app.on('update', dt => {
  if(!playActive || !_plyEnt) return;
  dt = Math.min(dt, .05);

  try {
    const len = Math.hypot(_jx, _jy);
    if(len > 0.05 && !window._playerFrozen) {
      // Target angle from joystick + camera yaw
      _targetPang = Math.atan2(_jx, _jy) + _lookYaw;
      let diff = _targetPang - _pang;
      while(diff >  Math.PI) diff -= Math.PI * 2;
      while(diff < -Math.PI) diff += Math.PI * 2;
      _pang += diff * Math.min((window._rotSens || 12) * dt, 1);

      const spd = window._playerSpeed || P_SPEED;
      const moveX = Math.sin(_pang) * spd * len * dt;
      const moveZ = Math.cos(_pang) * spd * len * dt;

      const newX = _px + moveX;
      const newZ = _pz + moveZ;

      // ── Collision — but never block if player starts inside object ──
      const startBlocked = _playerCollidesAt(_px, _pz);
      if(startBlocked) {
        // Player is inside something — force move them out, don't block
        _px = newX; _pz = newZ;
      } else if(!_playerCollidesAt(newX, newZ)) {
        _px = newX; _pz = newZ;
      } else if(!_playerCollidesAt(newX, _pz)) {
        _px = newX;
      } else if(!_playerCollidesAt(_px, newZ)) {
        _pz = newZ;
      }

      _plyEnt.setPosition(_px, 0, _pz);
      _plyEnt.setEulerAngles(0, _pang * 180 / Math.PI, 0);
      if(_eugWalkClip && _eugCurClip !== _eugWalkClip) {
        _eugCurClip = _eugWalkClip;
        _playAnimDeep(_plyEnt, _eugWalkClip);
      }
    } else {
      // Sync _px/_pz from entity actual position (in case moved externally)
      try {
        const wp = _plyEnt.getPosition();
        if(Math.abs(wp.x - _px) > 0.5 || Math.abs(wp.z - _pz) > 0.5) {
          _px = wp.x; _pz = wp.z;
        }
      } catch(e) {}
      if(_eugIdleClip && _eugCurClip !== _eugIdleClip) {
        _eugCurClip = _eugIdleClip;
        _playAnimDeep(_plyEnt, _eugIdleClip);
      }
    }

    _updateCam();

    // Right joystick → camera look
    if(Math.hypot(_lx,_ly) > 0.05) {
      _lookYaw   += _lx * 2.0 * dt;
      _lookPitch -= _ly * 1.2 * dt;
      _lookPitch  = Math.max(0.05, Math.min(1.2, _lookPitch));
    }
  } catch(e) {
    devLog('error', '[PLAY] update error: ' + e.message);
  }

  const d = document.getElementById('_dbg_txt');
  if(d) {
    const col = _playerCollidesAt(_px, _pz) ? ' 🚫COL' : '';
    const spd = (window._playerSpeed||5).toFixed(1);
    const rot = (window._rotSens||12).toFixed(1);
    d.textContent = `pos=${_px.toFixed(1)},${_pz.toFixed(1)}${col}`;
  }
});

// ══════════════════════════════════════════════════════

console.log('[EUG] eug-player.js loaded');
