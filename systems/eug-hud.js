// EUG HUD + Weapons + Bombs

//  PLAYER STATE — GTA-style
// ══════════════════════════════════════════════════════
window.player = window.player || {
  health:      100,
  armor:       0,
  money:       0,
  ammo:        30,
  weapon:      'pistol',   // pistol|rifle|shotgun|grenade|bomb|fists
  wantedLevel: 0,          // 0-5 stars
  score:       0,
  kills:       0,
  missionActive: false,
  missionTimer:  0,        // seconds remaining (0 = no timer)
  missionTimerDir: -1,     // -1=countdown, +1=countup
  inVehicle:   false,
  vehicleSpeed: 0,
  dead:        false,
};

// Weapons available + ammo counts
window._weapons = {
  fists:   { icon:'👊', ammo: Infinity, label:'Fists' },
  pistol:  { icon:'🔫', ammo: 30,       label:'Pistol' },
  rifle:   { icon:'⚡', ammo: 90,       label:'Rifle' },
  shotgun: { icon:'💥', ammo: 20,       label:'Shotgun' },
  grenade: { icon:'💣', ammo: 3,        label:'Grenade' },
  bomb:    { icon:'💥', ammo: 1,        label:'Bomb' },
  sniper:  { icon:'🎯', ammo: 10,       label:'Sniper' },
};
window._currentWeapon = 'pistol';

// Active timers/bombs
window._bombs = [];
window._missionTimerEl = null;
window._wantedEscapeTimer = 0;

// ══════════════════════════════════════════════════════
//  GTA HUD — builds bottom-left panel in play mode
// ══════════════════════════════════════════════════════
function buildGameHUD() {
  const existing = document.getElementById('gta-hud');
  if(existing) existing.remove();

  const hud = document.createElement('div');
  hud.id = 'gta-hud';
  hud.style.cssText = [
    'position:fixed','bottom:0','left:0','right:0',
    'pointer-events:none','z-index:490',
    'font-family:"Arial",sans-serif',
  ].join(';');

  hud.innerHTML = `
    <!-- Bottom-left: health + armor + money + weapon -->
    <div id="gta-stats" style="position:absolute;bottom:12px;left:10px;pointer-events:none">
      <!-- Health bar -->
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
        <span style="font-size:11px;color:#f66;font-weight:700">❤</span>
        <div style="width:90px;height:7px;background:rgba(0,0,0,.5);border-radius:4px;overflow:hidden">
          <div id="gta-hp-bar" style="height:100%;background:#e03030;border-radius:4px;transition:width .3s"></div>
        </div>
        <span id="gta-hp-val" style="font-size:10px;color:#f88;font-weight:700;min-width:28px">100</span>
      </div>
      <!-- Armor bar -->
      <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px" id="gta-armor-row">
        <span style="font-size:11px;color:#88f;font-weight:700">🛡</span>
        <div style="width:90px;height:7px;background:rgba(0,0,0,.5);border-radius:4px;overflow:hidden">
          <div id="gta-armor-bar" style="height:100%;background:#5555ff;border-radius:4px;transition:width .3s"></div>
        </div>
        <span id="gta-armor-val" style="font-size:10px;color:#aaf;font-weight:700;min-width:28px">0</span>
      </div>
      <!-- Weapon + ammo -->
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span id="gta-weap-icon" style="font-size:16px">🔫</span>
        <span id="gta-ammo-val" style="font-size:11px;color:#ff0;font-weight:800">30</span>
        <span style="font-size:9px;color:#888">ammo</span>
      </div>
    </div>

    <!-- Top-right: wanted stars -->
    <div id="gta-wanted" style="position:absolute;top:50px;right:10px;display:flex;gap:3px;pointer-events:none">
      ${[1,2,3,4,5].map(i=>`<div class="gta-star" data-s="${i}" style="font-size:18px;opacity:0.2;transition:all .2s">⭐</div>`).join('')}
    </div>

    <!-- Top-right below wanted: money -->
    <div id="gta-money" style="position:absolute;top:100px;right:10px;font-size:13px;color:#3ecf7e;font-weight:800;text-shadow:0 1px 4px rgba(0,0,0,.8);pointer-events:none">$0</div>

    <!-- Top-right: score/kills -->
    <div id="gta-score" style="position:absolute;top:120px;right:10px;font-size:10px;color:#aaa;pointer-events:none">
      SCORE: <span id="gta-score-val" style="color:#fff;font-weight:700">0</span>
      KILLS: <span id="gta-kills-val" style="color:#e05555;font-weight:700">0</span>
    </div>

    <!-- Center-top: mission timer (hidden by default) -->
    <div id="gta-timer" style="position:absolute;top:50px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,.75);border:2px solid #f5a623;border-radius:10px;
      padding:5px 18px;font-size:16px;font-weight:900;color:#f5a623;
      display:none;pointer-events:none;letter-spacing:1px">00:00</div>

    <!-- Center: objective text (hidden by default) -->
    <div id="gta-objective" style="position:absolute;top:90px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,.7);border-radius:8px;padding:5px 16px;
      font-size:11px;font-weight:600;color:#fff;
      display:none;pointer-events:none;max-width:70vw;text-align:center">
    </div>

    <!-- In-vehicle speedometer (hidden by default) -->
    <div id="gta-speedo" style="position:absolute;bottom:12px;right:10px;
      display:none;pointer-events:none;text-align:right">
      <div id="gta-speedo-val" style="font-size:22px;font-weight:900;color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.8)">0</div>
      <div style="font-size:9px;color:#888;letter-spacing:1px">KM/H</div>
    </div>
  `;

  document.body.appendChild(hud);
}

function updateHUD() {
  const p = window.player;
  if(!p) return;

  // Health bar
  const hpBar = document.getElementById('gta-hp-bar');
  const hpVal = document.getElementById('gta-hp-val');
  if(hpBar){ hpBar.style.width = Math.max(0,Math.min(100,p.health))+'%'; }
  if(hpVal){ hpVal.textContent = Math.round(p.health); }

  // Armor bar
  const arBar = document.getElementById('gta-armor-bar');
  const arVal = document.getElementById('gta-armor-val');
  const arRow = document.getElementById('gta-armor-row');
  if(arBar){ arBar.style.width = Math.max(0,Math.min(100,p.armor))+'%'; }
  if(arVal){ arVal.textContent = Math.round(p.armor); }
  if(arRow){ arRow.style.display = p.armor > 0 ? 'flex' : 'none'; }

  // Weapon + ammo
  const weapIcon = document.getElementById('gta-weap-icon');
  const ammoVal  = document.getElementById('gta-ammo-val');
  const wDef = window._weapons[window._currentWeapon];
  if(weapIcon && wDef) weapIcon.textContent = wDef.icon;
  if(ammoVal && wDef)  ammoVal.textContent  = wDef.ammo === Infinity ? '∞' : wDef.ammo;

  // Wanted stars
  document.querySelectorAll('.gta-star').forEach(el => {
    const s = parseInt(el.dataset.s);
    el.style.opacity = s <= p.wantedLevel ? '1' : '0.15';
    el.style.filter  = s <= p.wantedLevel ? 'drop-shadow(0 0 4px gold)' : 'none';
  });

  // Money
  const monEl = document.getElementById('gta-money');
  if(monEl) monEl.textContent = '$' + (p.money||0).toLocaleString();

  // Score + kills
  const scEl = document.getElementById('gta-score-val');
  const klEl = document.getElementById('gta-kills-val');
  if(scEl) scEl.textContent = p.score||0;
  if(klEl) klEl.textContent = p.kills||0;

  // Speedometer
  const spEl = document.getElementById('gta-speedo');
  const spVal= document.getElementById('gta-speedo-val');
  if(spEl)  spEl.style.display = p.inVehicle ? 'block' : 'none';
  if(spVal) spVal.textContent  = Math.round((p.vehicleSpeed||0)*3.6);

  // Death flash
  if(p.health <= 0 && !p.dead) {
    p.dead = true;
    _playerDie();
  }
}

// ── Player death ──────────────────────────────────────
function _playerDie() {
  const overlay = document.createElement('div');
  overlay.id = 'death-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(180,0,0,.6);z-index:800;display:flex;align-items:center;justify-content:center;flex-direction:column;pointer-events:all';
  overlay.innerHTML = `
    <div style="font-size:36px;font-weight:900;color:#fff;text-shadow:0 0 20px red;margin-bottom:16px">WASTED</div>
    <div style="font-size:12px;color:#ffaaaa;margin-bottom:20px">Score: ${window.player.score||0}</div>
    <div id="death-respawn" style="padding:10px 28px;background:#e03030;color:#fff;border-radius:10px;font-size:13px;font-weight:800;cursor:pointer;touch-action:manipulation">RESPAWN</div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#death-respawn').addEventListener('click', _playerRespawn);
  overlay.querySelector('#death-respawn').addEventListener('touchend', e=>{ e.preventDefault(); _playerRespawn(); });
  showToast('💀 WASTED');
  executeBlueprintAllEvent('onPlayerDead', {});
}

function _playerRespawn() {
  const p = window.player;
  p.health = 100; p.armor = 0; p.dead = false;
  p.wantedLevel = 0;
  document.getElementById('death-overlay')?.remove();
  updateHUD();
  showToast('🏥 Respawned');
}

// ── Mission timer tick (called from game loop) ────────
let _missionTimerActive = false;
function _tickMissionTimer(dt) {
  const p = window.player;
  if(!_missionTimerActive || p.missionTimer <= 0) return;
  p.missionTimer += p.missionTimerDir * dt;
  const t = Math.max(0, p.missionTimer);
  const mins = Math.floor(t/60), secs = Math.floor(t%60);
  const el = document.getElementById('gta-timer');
  if(el) el.textContent = String(mins).padStart(2,'0')+':'+String(secs).padStart(2,'0');
  // Countdown expired
  if(p.missionTimerDir < 0 && t <= 0) {
    _missionTimerActive = false;
    executeBlueprintAllEvent('onTimerExpired', {});
    showToast('⏱ Time\'s up!');
  }
}

// ── Wanted level decay ───────────────────────────────
function _tickWanted(dt) {
  const p = window.player;
  if(p.wantedLevel <= 0) return;
  _wantedEscapeTimer = (_wantedEscapeTimer||0) + dt;
  if(_wantedEscapeTimer > 12) { // 12s without triggering → lose 1 star
    _wantedEscapeTimer = 0;
    p.wantedLevel = Math.max(0, p.wantedLevel - 1);
    updateHUD();
    if(p.wantedLevel === 0) showToast('✅ Lost the cops');
  }
}

// fire bp event on ALL blueprints (not just one entity)
function executeBlueprintAllEvent(event, data) {
  Object.keys(blueprints).forEach(name => executeBlueprintEvent(name, event, data));
}

// ══════════════════════════════════════════════════════
//  WEAPON WHEEL
// ══════════════════════════════════════════════════════
function openWeaponWheel() {
  const existing = document.getElementById('weapon-wheel');
  if(existing){ existing.remove(); return; }

  const panel = document.createElement('div');
  panel.id = 'weapon-wheel';
  panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:700;display:flex;align-items:center;justify-content:center;pointer-events:all;touch-action:manipulation;';

  const weaps = Object.entries(window._weapons);
  const radius = 100;

  panel.innerHTML = `
    <div style="position:relative;width:240px;height:240px">
      ${weaps.map(([key,w], i) => {
        const angle = (i / weaps.length) * Math.PI * 2 - Math.PI/2;
        const x = Math.cos(angle)*radius + 100;
        const y = Math.sin(angle)*radius + 100;
        const isCur = key === window._currentWeapon;
        return `<div class="ww-item" data-w="${key}" style="
          position:absolute;left:${x-30}px;top:${y-30}px;
          width:60px;height:60px;border-radius:50%;
          background:${isCur?'rgba(62,207,126,.4)':'rgba(0,0,0,.7)'};
          border:2px solid ${isCur?'#3ecf7e':'rgba(255,255,255,.3)'};
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          cursor:pointer;touch-action:manipulation;
          box-shadow:${isCur?'0 0 12px #3ecf7e':''};
        ">
          <span style="font-size:20px">${w.icon}</span>
          <span style="font-size:7px;color:#aaa;font-weight:700">${w.ammo===Infinity?'∞':w.ammo}</span>
        </div>`;
      }).join('')}
      <div style="position:absolute;left:90px;top:90px;width:60px;height:60px;border-radius:50%;
        background:rgba(0,0,0,.8);border:2px solid #444;display:flex;align-items:center;
        justify-content:center;font-size:10px;color:#888;text-align:center;line-height:1.3">
        ${(window._weapons[window._currentWeapon]||{}).label||''}
      </div>
    </div>`;

  document.body.appendChild(panel);

  panel.querySelectorAll('.ww-item').forEach(b => {
    b.addEventListener('click', ()=>{ _selectWeapon(b.dataset.w); panel.remove(); });
    b.addEventListener('touchend', e=>{ e.preventDefault(); _selectWeapon(b.dataset.w); panel.remove(); });
  });
  panel.addEventListener('click', e=>{ if(e.target===panel) panel.remove(); });
}

function _selectWeapon(key) {
  if(!window._weapons[key]) return;
  window._currentWeapon = key;
  window.player.weapon = key;
  // Update bullet config based on weapon
  const cfg = window._bulletCfg;
  switch(key) {
    case 'pistol':  cfg.speed=22; cfg.damage=15; cfg.colorR=1; cfg.colorG=0.08; cfg.colorB=0.08; cfg.bounce=0.35; cfg.maxBounces=1; cfg.firerate=300; break;
    case 'rifle':   cfg.speed=50; cfg.damage=30; cfg.colorR=1; cfg.colorG=0.8;  cfg.colorB=0;    cfg.bounce=0.1;  cfg.maxBounces=0; cfg.firerate=100; break;
    case 'shotgun': cfg.speed=18; cfg.damage=50; cfg.colorR=1; cfg.colorG=0.4;  cfg.colorB=0;    cfg.bounce=0;    cfg.maxBounces=0; cfg.firerate=600; break;
    case 'sniper':  cfg.speed=80; cfg.damage=90; cfg.colorR=0.4;cfg.colorG=0.8; cfg.colorB=1;    cfg.bounce=0;    cfg.maxBounces=0; cfg.firerate=1200;break;
    case 'grenade': cfg.speed=12; cfg.damage=60; cfg.colorR=0.3;cfg.colorG=0.8; cfg.colorB=0.2;  cfg.bounce=0.7;  cfg.maxBounces=5; cfg.firerate=800; cfg.arc=5; break;
    case 'fists':   return; // no bullet
  }
  _bulletMat = null;
  updateHUD();
  showToast(window._weapons[key].icon+' '+window._weapons[key].label);
}

// Shotgun: fires 5 spread bullets
function _shootWeapon() {
  const key = window._currentWeapon;
  const wDef = window._weapons[key];
  if(!wDef || wDef.ammo === 0) { showToast('🔫 No ammo!'); return; }
  if(key === 'fists') { _meleeAttack(); return; }
  if(wDef.ammo !== Infinity) {
    wDef.ammo--;
    updateHUD();
  }
  if(key === 'shotgun') {
    // Spread shot — 5 pellets
    for(let i = 0; i < 5; i++) {
      const spread = (Math.random()-0.5)*0.4;
      const origYaw = _lookYaw;
      _lookYaw += spread;
      _shootBullet();
      _lookYaw = origYaw;
    }
  } else {
    _shootBullet();
  }
  // Gain wanted level for shooting in public
  if(window.player.wantedLevel < 1) { window.player.wantedLevel=1; updateHUD(); }
  _wantedEscapeTimer = 0;
  executeBlueprintAllEvent('onShoot', { weapon: key });
}

// Melee punch
function _meleeAttack() {
  showToast('👊 PUNCH!');
  // Check if any NPC is close enough
  executeBlueprintAllEvent('onMelee', {});
}

// ══════════════════════════════════════════════════════
//  BOMB SYSTEM
// ══════════════════════════════════════════════════════
function _plantBomb(type, delay) {
  // type: 'timer' | 'remote'
  const bomb = {
    type: type||'timer',
    delay: delay||10,
    timer: delay||10,
    x: _px, z: _pz,
    entity: null,
    armed: true,
    id: Date.now(),
  };

  // Visual
  const mat = new pc.StandardMaterial(); mat.diffuse.set(0.1,0.1,0.1); mat.emissive.set(1,0.3,0); mat.emissiveIntensity=1; mat.update();
  const ent = new pc.Entity('Bomb');
  ent.addComponent('render',{type:'sphere',material:mat,castShadows:false});
  ent.setLocalScale(0.3,0.3,0.3);
  ent.setLocalPosition(_px, 0.15, _pz);
  app.root.addChild(ent);

  // Blink light
  const light = new pc.Entity();
  light.addComponent('light',{type:'point',color:new pc.Color(1,0.2,0),intensity:4,range:3,castShadows:false});
  ent.addChild(light);

  bomb.entity = ent;
  window._bombs.push(bomb);
  showToast(type==='remote'?'💣 Remote bomb planted — use DETONATE':'💣 Bomb planted — '+delay+'s fuse!');
  executeBlueprintAllEvent('onBombPlanted', { type, x:_px, z:_pz });
  return bomb;
}

function _detonateRemoteBombs() {
  window._bombs.filter(b=>b.type==='remote'&&b.armed).forEach(b=>_explodeBomb(b));
}

function _explodeBomb(bomb) {
  bomb.armed = false;
  const x = bomb.x, z = bomb.z;
  try{ bomb.entity?.destroy(); }catch(e){}

  // Explosion flash
  const flash = new pc.Entity();
  flash.addComponent('light',{type:'point',color:new pc.Color(1,0.5,0),intensity:20,range:12,castShadows:false});
  flash.setLocalPosition(x,0.5,z);
  app.root.addChild(flash);
  setTimeout(()=>{ try{flash.destroy();}catch(e){}},300);

  // Damage player if near
  const dist = Math.hypot(_px-x, _pz-z);
  if(dist < 8) {
    const dmg = Math.round(80 * (1 - dist/8));
    window.player.health = Math.max(0, window.player.health - dmg);
    updateHUD();
    if(dmg > 0) showToast('💥 BOOM! -'+dmg+' HP');
    window.player.wantedLevel = Math.min(5, window.player.wantedLevel+2);
  } else {
    showToast('💥 BOOM!');
  }

  window._bombs.splice(window._bombs.indexOf(bomb), 1);
  executeBlueprintAllEvent('onExplosion', { x, z, dist });
}

function _tickBombs(dt) {
  for(let i = window._bombs.length-1; i>=0; i--) {
    const b = window._bombs[i];
    if(!b.armed || b.type !== 'timer') continue;
    b.timer -= dt;
    // Blink faster as time runs out
    if(b.entity) {
      const blink = b.timer < 3 ? Math.sin(Date.now()/100)*0.5+0.5 : Math.sin(Date.now()/400)*0.5+0.5;
      try{ b.entity.render.meshInstances[0].material.emissiveIntensity = blink * 2; b.entity.render.meshInstances[0].material.update(); }catch(e){}
    }
    if(b.timer <= 0) _explodeBomb(b);
  }
}

// Minimap
// dup minimapCtx
function startMinimap() {
  const mmCvs = document.getElementById('minimap-canvas') || document.getElementById('mm-canvas');
  if(!mmCvs) return;
  minimapCtx = mmCvs.getContext('2d');
}

function drawMinimap() {
  if(!minimapCtx || !playActive) return;
  const ctx = minimapCtx, W=100, H=100, scale=0.8;
  ctx.clearRect(0,0,W,H);

  // Background
  ctx.fillStyle = 'rgba(0,0,0,.75)';
  ctx.beginPath(); ctx.arc(W/2,H/2,49,0,Math.PI*2); ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.arc(W/2,H/2,49,0,Math.PI*2); ctx.clip();

  const tx=W/2-carX*scale, tz=H/2-carZ*scale;

  // Roads
  ctx.strokeStyle='#3a3a3a'; ctx.lineWidth=4;
  roads.forEach(r=>{
    ctx.beginPath();
    ctx.moveTo(r.x1*scale+tx, r.z1*scale+tz);
    ctx.lineTo(r.x2*scale+tx, r.z2*scale+tz);
    ctx.stroke();
  });

  // Buildings
  ctx.fillStyle='#2a2a3e';
  placedBuildings.forEach(b=>{
    if(!b.entity) return;
        ctx.fillRect(p.x*scale+tx-3, p.z*scale+tz-3, 6,6);
  });

  // NPCs
  ctx.fillStyle='#3ecf7e';
  npcsAI.forEach(n=>{
    ctx.beginPath();
    ctx.arc(n.x*scale+tx, n.z*scale+tz, 2, 0, Math.PI*2);
    ctx.fill();
  });

  // Player car — arrow
  ctx.save();
  ctx.translate(W/2, H/2);
  ctx.rotate(carAng);
  ctx.fillStyle = carDrift ? '#ff8c42' : '#1af';
  ctx.shadowColor = carDrift ? '#ff8c42' : '#1af';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(0,-7); ctx.lineTo(5,5); ctx.lineTo(0,2); ctx.lineTo(-5,5);
  ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.restore();

  // Drift indicator
  const driftEl = document.getElementById('drift-indicator');
  if(driftEl) driftEl.style.opacity = carDrift ? '1' : '0';
}

// ══════════════════════════════════════════════════════

console.log('[EUG] eug-hud.js loaded');
