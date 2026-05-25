// EUG City Generator

// ── PROCEDURAL CITY ───────────────────────────────────
prog(68,'PROC CITY...');
function generateCity(size) {
  size = size || 'medium';

  // ── Size presets ──────────────────────────────────────
  // SMALL : 3×3  grid, low-rise suburb feel
  // MEDIUM: 5×5  grid, mixed downtown (original)
  // BIG   : 7×7  grid, dense city with skyscrapers
  // MEGA  : 10×10 grid, sprawling metropolis
  const PRESETS = {
    small:  { grid:3,  block:20, gap:7,  minB:1, maxB:2, minH:3,  maxH:5,  roadW:6,  label:'🏘 Small  (suburb)' },
    medium: { grid:5,  block:30, gap:8,  minB:2, maxB:4, minH:4,  maxH:18, roadW:7,  label:'🏙 Medium (downtown)' },
    big:    { grid:7,  block:34, gap:9,  minB:3, maxB:5, minH:6,  maxH:36, roadW:8,  label:'🌆 Big    (city)' },
    mega:   { grid:10, block:38, gap:10, minB:3, maxB:6, minH:4,  maxH:60, roadW:9,  label:'🌃 Mega   (metropolis)' },
  };
  const P = PRESETS[size] || PRESETS.medium;

  // Update button highlight
  ['small','medium','big','mega'].forEach(s => {
    const btn = document.getElementById('city-sz-'+s);
    if(btn) btn.classList.toggle('on', s === size);
  });
  const info = document.getElementById('city-sz-info');
  if(info) info.textContent = P.grid+'×'+P.grid+' grid · '+P.label.split('(')[1]?.replace(')','').trim();

  // ── Preserve GLB models ───────────────────────────────
  const _savedGLB     = [...glbModels];
  const _savedRemote  = [...remoteModels];
  const _savedPlayerEnt   = _playerSceneEnt;
  const _savedPlayerIdx   = _playerGLBIndex;
  const _savedIdleClip    = _eugIdleClip;
  const _savedWalkClip    = _eugWalkClip;
  const _savedGLBBuffers  = window._glbBuffers ? {...window._glbBuffers} : {};
  const _savedGLBAssets   = window._glbAssetStore ? [...window._glbAssetStore] : [];

  // Clear scene (not GLB)
  [...roads,...placedBuildings,...placedVehicles,...placedProps,...districtZones,...placedBillboards].forEach(item=>{
    if(item.entity) try{item.entity.destroy();}catch(e){}
  });
  roads.length=0; placedBuildings.length=0; placedVehicles.length=0; placedProps.length=0;
  districtZones.length=0; placedBillboards.length=0;
  trafficCars.forEach(c=>{ try{c.entity.destroy();}catch(e){} }); trafficCars.length=0; trafficEnabled=false;

  // Restore GLB models
  glbModels.length=0; _savedGLB.forEach(m=>glbModels.push(m));
  remoteModels.length=0; _savedRemote.forEach(m=>remoteModels.push(m));
  window._glbBuffers=_savedGLBBuffers; window._glbAssetStore=_savedGLBAssets;
  _playerSceneEnt=_savedPlayerEnt; _playerGLBIndex=_savedPlayerIdx;
  _eugIdleClip=_savedIdleClip; _eugWalkClip=_savedWalkClip;

  // ── Generate under one parent ─────────────────────────
  const cityRoot = new pc.Entity('GeneratedCity');
  app.root.addChild(cityRoot);
  const _origAddChild = app.root.addChild.bind(app.root);
  app.root.addChild = (e) => { cityRoot.addChild(e); };

  const { grid:GRID, block:BLOCK, gap:GAP, minB, maxB, minH, maxH, roadW } = P;
  const totalSpan = GRID * (BLOCK + GAP);

  // ── Building type picker (varies by position in grid) ──
  // Centre blocks = tall commercial, edges = shorter residential
  function getBuildingStyle(gx, gz) {
    const cx = GRID / 2, cz = GRID / 2;
    const dist = Math.max(Math.abs(gx - cx), Math.abs(gz - cz));
    const isCentre   = dist < GRID * 0.25;
    const isMidring  = dist < GRID * 0.5;

    if(isCentre) {
      // Downtown: tall thin towers
      const w = 5 + Math.random() * 8;
      const d = 5 + Math.random() * 8;
      const h = minH + Math.floor(Math.random() * (maxH - minH) * 0.8 + maxH * 0.2);
      return { w, d, h };
    } else if(isMidring) {
      // Mid-ring: medium offices
      const w = 8 + Math.random() * 12;
      const d = 8 + Math.random() * 12;
      const h = minH + Math.floor(Math.random() * (maxH - minH) * 0.55);
      return { w, d, h };
    } else {
      // Outskirts: short wide warehouses / houses
      const w = 10 + Math.random() * 14;
      const d = 10 + Math.random() * 14;
      const h = minH + Math.floor(Math.random() * (maxH - minH) * 0.25);
      return { w, d, h };
    }
  }

  for(let gx=0; gx<GRID; gx++) {
    for(let gz=0; gz<GRID; gz++) {
      const bx = gx*(BLOCK+GAP) - totalSpan/2;
      const bz = gz*(BLOCK+GAP) - totalSpan/2;
      const nB = minB + Math.floor(Math.random()*(maxB - minB + 1));

      for(let b=0; b<nB; b++) {
        const style = getBuildingStyle(gx, gz);
        const { w, d } = style;
        let h = style.h;
        // Snap height to multiples of 3 for clean look
        h = Math.max(3, Math.round(h / 3) * 3);

        // Random position within block with padding
        const pad = 2;
        const bpx = bx + pad + Math.random() * Math.max(1, BLOCK - w - pad*2);
        const bpz = bz + pad + Math.random() * Math.max(1, BLOCK - d - pad*2);
        spawnBuilding(bpx, bpz, bpx+w, bpz+d, h);
      }

      // Roads along grid gaps
      if(gx < GRID-1) buildRoad(bx+BLOCK, bz, bx+BLOCK+GAP, bz+BLOCK, roadW);
      if(gz < GRID-1) buildRoad(bx, bz+BLOCK, bx+BLOCK, bz+BLOCK+GAP, roadW);
    }
  }

  // Restore addChild
  app.root.addChild = _origAddChild;
  placedBuildings.forEach(b => { if(b.entity && b.entity.parent !== cityRoot) cityRoot.addChild(b.entity); });
  roads.forEach(r => { if(r.entity && r.entity.parent !== cityRoot) cityRoot.addChild(r.entity); });

  refreshOutliner(); updateObjCount();
  if(typeof refreshGLBLibrary === 'function') refreshGLBLibrary();
  showToast(P.label + '\n🏢 '+placedBuildings.length+' buildings  🛣 '+roads.length+' roads');
}

// ══════════════════════════════════════════════════════

console.log('[EUG] eug-city.js loaded');
