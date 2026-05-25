// EUG Bullet System

//  BULLET SYSTEM
// ══════════════════════════════════════════════════════

const _bullets = [];

// ── Live bullet config — all values editable from panel ──
window._bulletCfg = {
  speed:      22,    // m/s projectile speed
  life:       5.0,   // seconds before auto-delete
  radius:     0.12,  // sphere size (metres)
  gravity:   -14,    // downward acceleration
  bounce:     0.55,  // energy kept per bounce (0=no bounce, 1=perfect)
  maxBounces: 3,     // max wall/floor bounces before delete
  arc:        2.0,   // initial upward velocity (0=flat)
  damage:     10,    // damage value (for future use)
  firerate:   180,   // ms between shots (lower=faster)
  trail:      true,  // leave spark on bounce
  glow:       true,  // point light on bullet
  // Color (r,g,b 0-1)
  colorR: 1.0, colorG: 0.08, colorB: 0.08,
  // Shape: 'sphere' | 'box' | 'cone'
  shape: 'sphere',
};

// Bullet material — rebuilt when color changes
let _bulletMat = null;
function _getBulletMat(force) {
  const cfg = window._bulletCfg;
  if(!_bulletMat || force) {
    _bulletMat = new pc.StandardMaterial();
    _bulletMat.diffuse.set(cfg.colorR, cfg.colorG, cfg.colorB);
    _bulletMat.emissive.set(cfg.colorR*0.8, cfg.colorG*0.8, cfg.colorB*0.8);
    _bulletMat.emissiveIntensity = 1;
    _bulletMat.update();
  }
  return _bulletMat;
}

function _shootBullet() {
  if(!playActive || !_plyEnt) return;
  const cfg = window._bulletCfg;
  const yaw = _pang + _lookYaw;

  const ent = new pc.Entity('Bullet');
  ent.addComponent('render', { type: cfg.shape === 'box' ? 'box' : cfg.shape === 'cone' ? 'cone' : 'sphere', material: _getBulletMat(), castShadows: false });
  const s = cfg.radius * 2;
  ent.setLocalScale(s, s, s);
  ent.setLocalPosition(_px + Math.sin(yaw)*0.5, 1.2, _pz + Math.cos(yaw)*0.5);
  app.root.addChild(ent);

  if(cfg.glow) {
    const glow = new pc.Entity();
    glow.addComponent('light', { type:'point', color:new pc.Color(cfg.colorR, cfg.colorG, cfg.colorB), intensity:3, range:2.5, castShadows:false });
    ent.addChild(glow);
  }

  _bullets.push({
    entity: ent,
    vx: Math.sin(yaw) * cfg.speed,
    vy: cfg.arc,
    vz: Math.cos(yaw) * cfg.speed,
    age: 0, bounces: 0, dead: false,
  });
}

function _updateBullets(dt) {
  if(!playActive) return;
  const cfg = window._bulletCfg;

  for(let i = _bullets.length-1; i >= 0; i--) {
    const b = _bullets[i];
    if(b.dead) { _bullets.splice(i,1); continue; }

    b.age += dt;
    if(b.age > cfg.life) { _killBullet(b,i); continue; }

    b.vy += cfg.gravity * dt;

    let nx = b.entity.getPosition().x + b.vx * dt;
    let ny = b.entity.getPosition().y + b.vy * dt;
    let nz = b.entity.getPosition().z + b.vz * dt;

    // Floor bounce
    if(ny <= cfg.radius) {
      ny = cfg.radius;
      if(cfg.bounce > 0.01 && b.bounces < cfg.maxBounces) {
        b.vy = Math.abs(b.vy) * cfg.bounce;
        b.vx *= 0.85; b.vz *= 0.85;
        b.bounces++;
        if(cfg.trail) _bulletSpark(nx, ny, nz, cfg);
      } else {
        b.vy = 0; b.vx *= 0.5; b.vz *= 0.5;
        if(Math.abs(b.vx)<0.2 && Math.abs(b.vz)<0.2) { _killBullet(b,i); continue; }
      }
    }

    // Wall collision
    for(let j = 0; j < placedBuildings.length; j++) {
      const bld = placedBuildings[j];
      if(!bld.entity) continue;
      try {
        const bx = bld.cx !== undefined ? bld.cx : bld.entity.getPosition().x;
        const bz2= bld.cz !== undefined ? bld.cz : bld.entity.getPosition().z;
        const hw = (bld.w||2)*0.5 + cfg.radius;
        const hd = (bld.d||2)*0.5 + cfg.radius;
        if(nx>bx-hw&&nx<bx+hw&&nz>bz2-hd&&nz<bz2+hd&&ny<(bld.height||10)) {
          if(cfg.bounce > 0.01 && b.bounces < cfg.maxBounces) {
            const ox = hw - Math.abs(b.entity.getPosition().x - bx);
            const oz = hd - Math.abs(b.entity.getPosition().z - bz2);
            if(ox < oz) { b.vx = -b.vx*cfg.bounce; nx=b.entity.getPosition().x; }
            else        { b.vz = -b.vz*cfg.bounce; nz=b.entity.getPosition().z; }
            b.bounces++;
            if(cfg.trail) _bulletSpark(nx, ny, nz, cfg);
            // Fire onBulletHit blueprint event on the building entity
            if(bld.entity && bld.entity.name) executeBlueprintEvent(bld.entity.name, 'onBulletHit', {damage:cfg.damage, x:nx, y:ny, z:nz});
          } else { _killBullet(b,i);
            // Fire onBulletHit even on death hit
            if(bld.entity && bld.entity.name) executeBlueprintEvent(bld.entity.name, 'onBulletHit', {damage:cfg.damage, x:nx, y:ny, z:nz});
          }
          break;
        }
      } catch(e) {}
    }
    if(b.dead) continue;

    b.entity.setLocalPosition(nx, ny, nz);

    // Fade out last second
    if(b.age > cfg.life - 1.0) {
      const alpha = Math.max(0, 1-(b.age-(cfg.life-1.0)));
      try{ b.entity.render.meshInstances[0].material.opacity=alpha; }catch(e){}
    }
  }
}

function _killBullet(b, idx) {
  try{ b.entity.destroy(); }catch(e){}
  b.dead = true;
  if(idx !== undefined) _bullets.splice(idx, 1);
}

function _bulletSpark(x, y, z, cfg) {
  try {
    const spark = new pc.Entity();
    spark.addComponent('light', { type:'point', color:new pc.Color(cfg.colorR,cfg.colorG*0.5+0.3,cfg.colorB*0.1), intensity:6, range:1.5, castShadows:false });
    spark.setLocalPosition(x,y,z);
    app.root.addChild(spark);
    setTimeout(()=>{ try{spark.destroy();}catch(e){}}, 80);
  } catch(e) {}
}

app.on('update', dt => { _updateBullets(Math.min(dt,0.05)); });


console.log('[EUG] eug-bullet.js loaded');
