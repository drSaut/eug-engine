// EUG Build Tools

// ── ROAD PAINTER ─────────────────────────────────────
prog(30,'ROAD PAINTER...');
function buildRoad(x1,z1,x2,z2,width){
  const mat=new pc.StandardMaterial();
  mat.diffuse.set(.16,.16,.18); mat.specular.set(.05,.05,.05); mat.shininess=10; mat.update();
  const e=new pc.Entity('Road');
  e.addComponent('render',{type:'plane',material:mat,castShadows:false,receiveShadows:true});
  const dx=x2-x1,dz=z2-z1,len=Math.sqrt(dx*dx+dz*dz);
  if(len<1) return null;
  e.setLocalPosition((x1+x2)/2,.01,(z1+z2)/2);
  e.setLocalScale(len,1,width);
  e.setLocalEulerAngles(0,Math.atan2(dx,dz)*180/Math.PI,0);
  app.root.addChild(e);
  // Centre line
  const lm=new pc.StandardMaterial(); lm.emissive.set(.8,.7,.2); lm.emissiveIntensity=.8; lm.update();
  const l=new pc.Entity(); l.addComponent('render',{type:'plane',material:lm,castShadows:false});
  l.setLocalPosition((x1+x2)/2,.015,(z1+z2)/2); l.setLocalScale(len,1,.12);
  l.setLocalEulerAngles(0,Math.atan2(dx,dz)*180/Math.PI,0); app.root.addChild(l);
  const road={entity:e,x1,z1,x2,z2,width};
  pushUndo();
  roads.push(road);
  refreshOutliner(); updateObjCount();
  return road;
}

function roadHandleTap(cx,cy){
  const pt=screenToWorld(cx,cy); if(!pt) return;
  if(!roadStart){
    roadStart=pt;
    if(roadMarker) roadMarker.destroy();
    roadMarker=spawnMarker(pt.x,pt.z,markerMat);
    showToast('🟠 Start set — tap end point');
  } else {
    const w=parseInt(document.getElementById('road-width').value)||8;
    buildRoad(roadStart.x,roadStart.z,pt.x,pt.z,w);
    if(roadMarker){roadMarker.destroy();roadMarker=null;}
    roadStart=null;
    showToast('🛣 Road painted!');
  }
}

function roadHandleErase(cx,cy){
  const pt=screenToWorld(cx,cy); if(!pt) return;
  for(let i=roads.length-1;i>=0;i--){
    const r=roads[i];
    const mx=(r.x1+r.x2)/2,mz=(r.z1+r.z2)/2;
    if(Math.hypot(pt.x-mx,pt.z-mz)<8){
      r.entity.destroy(); roads.splice(i,1);
      showToast('🗑 Road erased'); refreshOutliner(); updateObjCount(); return;
    }
  }
}

function stopRoadPaint(){roadStart=null;if(roadMarker){roadMarker.destroy();roadMarker=null;}showToast('⏹ Road paint stopped');}
function setRoadMode(m){roadMode=m;document.getElementById('road-draw-btn').classList.toggle('on',m==='draw');}
function setRoadType(t){
  activeRoadType=t;
  document.querySelectorAll('#panel-roads .tp-color').forEach(b=>b.classList.toggle('on',b.textContent.toLowerCase().includes(t.replace('_',' '))));
  showToast('Road type: '+t);
}

// ── BUILDING EDITOR ───────────────────────────────────
prog(35,'BUILDINGS...');
function spawnBuilding(x1,z1,x2,z2,height,colorIdx){
  const ci=(colorIdx||Math.floor(Math.random()*pastelPalette.length))%pastelPalette.length;
  const c=pastelPalette[ci];
  const mat=new pc.StandardMaterial(); mat.diffuse.set(c[0],c[1],c[2]); mat.specular.set(.05,.05,.05); mat.shininess=10; mat.update();
  const w=Math.abs(x2-x1), d=Math.abs(z2-z1);
  if(w<1||d<1) return null;
  const cx=(x1+x2)/2, cz=(z1+z2)/2;
  const root=new pc.Entity('Building');
  // Main body
  const body=new pc.Entity(); body.addComponent('render',{type:'box',material:mat,castShadows:true,receiveShadows:true});
  body.setLocalPosition(0,height/2,0); body.setLocalScale(w,height,d); root.addChild(body);
  // Darker base
  const bm=new pc.StandardMaterial(); bm.diffuse.set(c[0]*.7,c[1]*.7,c[2]*.7); bm.update();
  const base=new pc.Entity(); base.addComponent('render',{type:'box',material:bm,castShadows:false,receiveShadows:true});
  base.setLocalPosition(0,.5,0); base.setLocalScale(w+.1,1,d+.1); root.addChild(base);
  // Rooftop edge
  const rm=new pc.StandardMaterial(); rm.diffuse.set(c[0]*.85,c[1]*.85,c[2]*.85); rm.update();
  const roof=new pc.Entity(); roof.addComponent('render',{type:'box',material:rm,castShadows:false});
  roof.setLocalPosition(0,height+.2,0); roof.setLocalScale(w+.2,0.4,d+.2); root.addChild(roof);
  root.setLocalPosition(cx,0,cz);
  app.root.addChild(root);
  const bld={entity:root,x1,z1,x2,z2,w,d,cx,cz,height,colorIdx:ci};
  pushUndo();
  placedBuildings.push(bld);
  refreshOutliner(); updateObjCount();
  return bld;
}

function buildingHandleTap(cx,cy){
  const pt=screenToWorld(cx,cy); if(!pt) return;
  if(!buildStart){
    buildStart=pt;
    if(buildMarker) buildMarker.destroy();
    buildMarker=spawnMarker(pt.x,pt.z,markerGreenMat);
    showToast('🟢 Corner set — tap opposite corner');
  } else {
    const floors=parseInt(document.getElementById('bld-floors').value)||4;
    const h=floors*3;
    spawnBuilding(buildStart.x,buildStart.z,pt.x,pt.z,h);
    if(buildMarker){buildMarker.destroy();buildMarker=null;}
    buildStart=null;
    showToast('🏢 Building placed!');
  }
}

const TEMPLATES={
  house:{w:10,d:12,h:6,ci:0},shop:{w:16,d:12,h:5,ci:2},
  tower:{w:12,d:12,h:48,ci:5},warehouse:{w:28,d:20,h:8,ci:8},
  garage:{w:14,d:10,h:4,ci:9},police:{w:20,d:16,h:9,ci:6},
};
function placeTemplate(type){
  const t=TEMPLATES[type]; if(!t) return;
  const cx=edCam.target.x,cz=edCam.target.z;
  spawnBuilding(cx-t.w/2,cz-t.d/2,cx+t.w/2,cz+t.d/2,t.h,t.ci);
  edCam.target.set(cx,t.h/2,cz); edCam.radius=t.w*1.5; updateEdCam();
  showToast('🏢 '+type+' placed');
}
function setBldMode(m){document.getElementById('bld-draw-btn').classList.toggle('on',m==='draw');}

// ── VEHICLES ──────────────────────────────────────────
prog(40,'VEHICLES...');
const vehicleDefs={
  sedan:{label:'Sedan',c:[.08,.22,.65]},police:{label:'Police',c:[.1,.1,.14]},
  taxi:{label:'Taxi',c:[.9,.8,.1]},bus:{label:'Bus',c:[.9,.5,.1]},
  sports:{label:'Sports',c:[.9,.1,.1]},
};

function spawnVehicle(type,vx,vz,ang){
  const def=vehicleDefs[type]||vehicleDefs.sedan;
  const c=def.c;
  const root=new pc.Entity(type);
  const bm=new pc.StandardMaterial(); bm.diffuse.set(c[0],c[1],c[2]); bm.specular.set(.15,.15,.15); bm.shininess=25; bm.update();
  const body=new pc.Entity(); body.addComponent('render',{type:'box',material:bm,castShadows:true,receiveShadows:true});
  body.setLocalPosition(0,.38,0); body.setLocalScale(1.8,.75,4.0); root.addChild(body);
  const rm=new pc.StandardMaterial(); rm.diffuse.set(c[0]*.7,c[1]*.7,c[2]*.7); rm.update();
  const roof=new pc.Entity(); roof.addComponent('render',{type:'box',material:rm,castShadows:true});
  roof.setLocalPosition(0,.88,-.1); roof.setLocalScale(1.5,.55,2.1); root.addChild(roof);
  const wm=new pc.StandardMaterial(); wm.diffuse.set(.08,.08,.08); wm.update();
  [[.92,.22,1.25],[-.92,.22,1.25],[.92,.22,-1.25],[-.92,.22,-1.25]].forEach(([wx,wy,wz])=>{
    const w=new pc.Entity(); w.addComponent('render',{type:'cylinder',material:wm,castShadows:true});
    w.setLocalPosition(wx,wy,wz); w.setLocalScale(.52,.28,.52); w.setLocalEulerAngles(0,0,90); root.addChild(w);
  });
  root.setLocalPosition(vx||0,.1,vz||0);
  if(ang) root.setLocalEulerAngles(0,ang*180/Math.PI,0);
  app.root.addChild(root);
  const veh={entity:root,type,x:vx||0,z:vz||0,angle:ang||0};
  pushUndo();
  placedVehicles.push(veh);
  refreshOutliner(); updateObjCount();
  return veh;
}

function vehicleHandleTap(cx,cy){
  const pt=screenToWorld(cx,cy); if(!pt) return;
  spawnVehicle(activeVehicle,pt.x,pt.z,0);
  edCam.target.set(pt.x,.5,pt.z); edCam.radius=10; updateEdCam();
  showToast('🚗 '+activeVehicle+' placed');
}
function setActiveVehicle(t){
  activeVehicle=t;
  document.querySelectorAll('#panel-vehicles .tp-btn').forEach(b=>b.classList.toggle('on',b.textContent.includes(vehicleDefs[t]?.label||t)));
}

// ── PROPS ─────────────────────────────────────────────
prog(45,'PROPS...');
function spawnProp(type,x,z){
  const root=new pc.Entity('Prop_'+type);
  if(type==='tree'){
    const tm=new pc.StandardMaterial(); tm.diffuse.set(.2,.5,.15); tm.update();
    const tr=new pc.Entity(); tr.addComponent('render',{type:'sphere',material:tm,castShadows:true});
    tr.setLocalPosition(0,3,0); tr.setLocalScale(2.5,3,2.5); root.addChild(tr);
    const bm=new pc.StandardMaterial(); bm.diffuse.set(.4,.25,.1); bm.update();
    const tr2=new pc.Entity(); tr2.addComponent('render',{type:'cylinder',material:bm,castShadows:true});
    tr2.setLocalPosition(0,1,0); tr2.setLocalScale(.35,2,.35); root.addChild(tr2);
  } else if(type==='lamp'){
    const sm=new pc.StandardMaterial(); sm.diffuse.set(.6,.6,.65); sm.update();
    const pole=new pc.Entity(); pole.addComponent('render',{type:'cylinder',material:sm});
    pole.setLocalPosition(0,3,0); pole.setLocalScale(.15,6,.15); root.addChild(pole);
    const head=new pc.Entity(); head.addComponent('render',{type:'box',material:sm});
    head.setLocalPosition(.6,5.8,0); head.setLocalScale(1.2,.2,.3); root.addChild(head);
    const lm=new pc.StandardMaterial(); lm.emissive.set(1,.95,.7); lm.emissiveIntensity=1; lm.update();
    const bulb=new pc.Entity(); bulb.addComponent('render',{type:'sphere',material:lm});
    bulb.setLocalPosition(.6,5.6,0); bulb.setLocalScale(.3,.3,.3); root.addChild(bulb);
    const light=new pc.Entity(); light.addComponent('light',{type:pc.LIGHTTYPE_POINT,color:new pc.Color(1,.92,.7),intensity:.6,range:18,castShadows:false});
    light.setLocalPosition(.6,5.5,0); root.addChild(light);
  } else if(type==='bench'){
    const wm=new pc.StandardMaterial(); wm.diffuse.set(.5,.35,.2); wm.update();
    const seat=new pc.Entity(); seat.addComponent('render',{type:'box',material:wm});
    seat.setLocalPosition(0,.5,0); seat.setLocalScale(1.8,.1,0.5); root.addChild(seat);
    [[.7,0],[-.7,0]].forEach(([lx,lz])=>{
      const leg=new pc.Entity(); leg.addComponent('render',{type:'box',material:wm});
      leg.setLocalPosition(lx,.25,lz); leg.setLocalScale(.1,.5,.4); root.addChild(leg);
    });
  } else if(type==='barrel'){
    const bm=new pc.StandardMaterial(); bm.diffuse.set(.5,.25,.1); bm.update();
    const b=new pc.Entity(); b.addComponent('render',{type:'cylinder',material:bm,castShadows:true});
    b.setLocalPosition(0,.55,0); b.setLocalScale(.7,1.1,.7); root.addChild(b);
  } else if(type==='cone'){
    const cm=new pc.StandardMaterial(); cm.diffuse.set(.95,.35,.05); cm.update();
    const c=new pc.Entity(); c.addComponent('render',{type:'cone',material:cm,castShadows:true});
    c.setLocalPosition(0,.5,0); c.setLocalScale(.4,1,.4); root.addChild(c);
  } else if(type==='rock'){
    const rm=new pc.StandardMaterial(); rm.diffuse.set(.45,.42,.40); rm.update();
    const r=new pc.Entity(); r.addComponent('render',{type:'sphere',material:rm,castShadows:true});
    r.setLocalPosition(0,.4,0); r.setLocalScale(.8+Math.random()*.5,.6+Math.random()*.3,(.8+Math.random()*.4)); root.addChild(r);
  } else {
    const dm=new pc.StandardMaterial(); dm.diffuse.set(.5,.6,.5); dm.update();
    const d=new pc.Entity(); d.addComponent('render',{type:'box',material:dm,castShadows:true});
    d.setLocalPosition(0,.5,0); d.setLocalScale(.8,1,.8); root.addChild(d);
  }
  root.setLocalPosition(x,0,z);
  app.root.addChild(root);
  const prop={entity:root,type,x,z};
  placedProps.push(prop);
  refreshOutliner(); updateObjCount();
  return prop;
}

function propHandleTap(cx,cy){
  const pt=screenToWorld(cx,cy); if(!pt) return;
  spawnProp(activeProp,pt.x,pt.z);
  showToast('🌳 '+activeProp+' placed');
}
function setActiveProp(t){
  activeProp=t;
  document.querySelectorAll('#panel-props .tp-color').forEach(b=>b.classList.toggle('on',b.textContent.toLowerCase().includes(t)));
}

// Primitives (from asset panel)
function spawnPrimitive(type){
  const cx=edCam.target.x,cz=edCam.target.z;
  const mat=new pc.StandardMaterial(); mat.diffuse.set(.7,.72,.75); mat.specular.set(.15,.15,.15); mat.shininess=20; mat.update();
  const e=new pc.Entity('Prim_'+type);
  e.addComponent('render',{type,material:mat,castShadows:true,receiveShadows:true});
  e.setLocalPosition(cx,1,cz);
  app.root.addChild(e);
  const prop={entity:e,type:'prim_'+type,x:cx,z:cz};
  pushUndo();
  placedProps.push(prop);
  edCam.target.set(cx,1,cz); edCam.radius=6; updateEdCam();
  selectEntity(e);
  if(!rightOpen) toggleRight();
  setRightTab('props');
  showToast('✅ '+type+' placed');
  refreshOutliner(); updateObjCount();
}

// ── DISTRICT ZONES ────────────────────────────────────
prog(48,'ZONES...');
const districtDefs={
  residential:{color:'#4caf50',label:'Residential',r:.28,g:.38,b:.22},
  commercial:{color:'#2196f3',label:'Commercial',r:.22,g:.28,b:.40},
  industrial:{color:'#ff9800',label:'Industrial',r:.38,g:.32,b:.22},
  park:{color:'#8bc34a',label:'Park',r:.20,g:.42,b:.18},
  military:{color:'#9e9e9e',label:'Military',r:.32,g:.32,b:.30},
};

function setActiveDistrict(type){
  activeDistrict=type;
  document.querySelectorAll('#panel-triggers .tp-color').forEach(b=>b.classList.toggle('on',b.dataset.district===type));
  showToast(districtDefs[type].label+' — tap 2 corners');
}

function districtHandleTap(cx,cy){
  const pt=screenToWorld(cx,cy); if(!pt) return;
  if(!districtStart){
    districtStart=pt;
    if(districtMarker) districtMarker.destroy();
    districtMarker=spawnMarker(pt.x,pt.z,markerGreenMat);
    showToast('🟢 Corner 1 set');
  } else {
    const def=districtDefs[activeDistrict];
    const x1=Math.min(districtStart.x,pt.x),z1=Math.min(districtStart.z,pt.z);
    const x2=Math.max(districtStart.x,pt.x),z2=Math.max(districtStart.z,pt.z);
    const w=x2-x1,d=z2-z1,dcx=(x1+x2)/2,dcz=(z1+z2)/2;
    const mat=new pc.StandardMaterial(); mat.diffuse.set(def.r,def.g,def.b); mat.opacity=.5; mat.blendType=pc.BLEND_NORMAL; mat.update();
    const e=new pc.Entity('Zone_'+activeDistrict);
    e.addComponent('render',{type:'plane',material:mat,castShadows:false});
    e.setLocalPosition(dcx,.02,dcz); e.setLocalScale(w,1,d); app.root.addChild(e);
    districtZones.push({entity:e,type:activeDistrict,color:def.color,cx:dcx,cz:dcz,w,d,x1,z1,x2,z2});
    if(districtMarker){districtMarker.destroy();districtMarker=null;}
    districtStart=null;
    showToast('🏙 '+def.label+' zone placed');
    refreshOutliner(); updateObjCount();
  }
}

// ── TRAFFIC AI ────────────────────────────────────────
prog(50,'TRAFFIC...');
function spawnTrafficCar(roadIdx){
  if(!roads.length) return;
  const r=roads[roadIdx%roads.length];
  const colors=[[.8,.1,.1],[.1,.5,.8],[.1,.7,.2],[.9,.7,.1],[.6,.1,.8],[.8,.5,.1]];
  const c=colors[Math.floor(Math.random()*colors.length)];
  const root=new pc.Entity('Traffic');
  const bm=new pc.StandardMaterial(); bm.diffuse.set(c[0],c[1],c[2]); bm.update();
  const body=new pc.Entity(); body.addComponent('render',{type:'box',material:bm,castShadows:true});
  body.setLocalPosition(0,.38,0); body.setLocalScale(1.7,.75,3.8); root.addChild(body);
  const rm=new pc.StandardMaterial(); rm.diffuse.set(c[0]*.6,c[1]*.6,c[2]*.6); rm.update();
  const roof=new pc.Entity(); roof.addComponent('render',{type:'box',material:rm});
  roof.setLocalPosition(0,.9,-.1); roof.setLocalScale(1.45,.55,2.0); root.addChild(roof);
  app.root.addChild(root);
  const car={entity:root,roadIdx,t:Math.random(),spd:.04+Math.random()*.06,forward:true,x:r.x1,z:r.z1};
  trafficCars.push(car);
  updateTrafficPos(car);
}

function updateTrafficPos(car){
  const r=roads[car.roadIdx%roads.length];
  if(!r) return;
  const t=car.forward?car.t:1-car.t;
  car.x=r.x1+(r.x2-r.x1)*t;
  car.z=r.z1+(r.z2-r.z1)*t;
  const ang=Math.atan2(r.x2-r.x1,r.z2-r.z1)*(car.forward?1:-1);
  car.entity.setLocalPosition(car.x,.1,car.z);
  car.entity.setLocalEulerAngles(0,ang*180/Math.PI,0);
}

function startTraffic(){
  if(!roads.length){showToast('⚠ Draw roads first!');return;}
  trafficEnabled=true;
  trafficCars.forEach(c=>c.entity.destroy()); trafficCars.length=0;
  const count=Math.min(roads.length*2,12);
  for(let i=0;i<count;i++) spawnTrafficCar(i);
  showToast('🚗 '+trafficCars.length+' traffic cars');
}
function stopTraffic(){
  trafficEnabled=false;
  trafficCars.forEach(c=>c.entity.destroy()); trafficCars.length=0;
  showToast('Traffic stopped');
}

// ── TERRAIN ───────────────────────────────────────────
prog(52,'TERRAIN...');
function sampleTerrainY(x,z){
  if(!terrainEnabled||!terrainVerts) return 0;
  return 0; // simplified
}
function enableTerrain(){
  if(terrainEnabled){showToast('Terrain already enabled');return;}
  const segs=TERRAIN_SEGS;
  const vcount=(segs+1)*(segs+1);
  terrainVerts=new Float32Array(vcount);
  // Flat terrain initially
  showToast('⛰ Terrain enabled — tap to sculpt');
  terrainEnabled=true;
  document.getElementById('btn-enable-terrain').textContent='Terrain ON ✅';
}
function resetTerrain(){terrainEnabled=false;terrainVerts=null;document.getElementById('btn-enable-terrain').textContent='⛰ Enable Terrain';showToast('↺ Terrain reset');}
function setTerrainMode(m){
  terrainMode=m;
  document.querySelectorAll('#panel-terrain .tp-color').forEach(b=>b.classList.toggle('on',b.textContent.toLowerCase().includes(m)));
}

// ═══════════════════════════════════════════════════════
//  GLB IMPORT SYSTEM — clean rewrite
//  Uses FileReader + pc.Asset constructor (not loadFromUrl)
//  Persistent storage prevents asset GC
// ═══════════════════════════════════════════════════════

// Persistent stores — never gets garbage collected
window._glbBuffers    = {};   // name → ArrayBuffer
window._glbAssetStore = [];   // strong refs to pc.Asset objects

// ── Entry point called by file input ─────────────────
function importGLB(input) {
  const files = Array.from(input.files || []);
  if (!files.length) return;
  // Reset input so same file can be re-selected
  input.value = '';
  let i = 0;
  function next() {
    if (i >= files.length) {
      showToast('✅ ' + files.length + ' file(s) imported');
      refreshGLBLibrary();
      return;
    }
    _loadGLBFile(files[i++], next);
  }
  next();
}

// ── GLB URL — big popup panel ─────────────────────────
function openGLBUrlPanel() {
  if(document.getElementById('glb-url-panel')) return;

  const overlay = document.createElement('div');
  overlay.id = 'glb-url-panel';
  overlay.style.cssText = [
    'position:fixed','inset:0','z-index:2000',
    'background:rgba(0,0,0,.85)',
    'display:flex','align-items:flex-end','justify-content:center',
    'padding:0',
  ].join(';');

  overlay.innerHTML = `
    <div id="glb-url-sheet" style="
      width:100%;max-width:560px;
      background:#0e0e1a;
      border-top:2px solid #5b8dee44;
      border-radius:20px 20px 0 0;
      padding:20px 20px 36px;
      box-shadow:0 -8px 40px rgba(0,0,0,.8);
      display:flex;flex-direction:column;gap:14px;">

      <!-- Handle bar -->
      <div style="width:40px;height:4px;background:#2a2a3e;border-radius:4px;margin:0 auto 4px;"></div>

      <!-- Title -->
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="font-size:18px;font-weight:900;color:#5b8dee;flex:1;letter-spacing:.5px">🔗 Load GLB from URL</div>
        <div id="glb-url-close" style="padding:6px 14px;background:#1a1a2e;color:#888;
          border-radius:8px;font-size:13px;cursor:pointer;touch-action:manipulation;">✕</div>
      </div>

      <!-- Name input -->
      <div>
        <div style="font-size:11px;font-weight:700;color:#7070a0;letter-spacing:.5px;margin-bottom:6px;">MODEL NAME</div>
        <input id="glb-url-name" type="text"
          placeholder="e.g.  Player,  Car,  Building"
          autocomplete="off" autocorrect="off" spellcheck="false"
          style="width:100%;background:#060610;border:1.5px solid #2a2a3e;
          border-radius:10px;color:#fff;font-size:16px;font-weight:600;
          padding:12px 14px;outline:none;box-sizing:border-box;
          transition:border-color .2s;">
      </div>

      <!-- URL input -->
      <div>
        <div style="font-size:11px;font-weight:700;color:#7070a0;letter-spacing:.5px;margin-bottom:6px;">GLB URL</div>
        <textarea id="glb-url-input" rows="3"
          placeholder="https://cdn.jsdelivr.net/gh/user/repo@main/file.glb"
          autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"
          style="width:100%;background:#060610;border:1.5px solid #2a2a3e;
          border-radius:10px;color:#5be0ff;font-size:13px;font-family:monospace;
          padding:12px 14px;outline:none;box-sizing:border-box;resize:none;
          line-height:1.5;transition:border-color .2s;"></textarea>
      </div>

      <!-- URL preview / validation -->
      <div id="glb-url-preview" style="
        background:#060610;border:1px solid #1a1a2e;border-radius:8px;
        padding:10px 12px;font-size:10px;font-family:monospace;
        color:#404060;line-height:1.6;min-height:38px;word-break:break-all;">
        URL preview will appear here...
      </div>

      <!-- Format hint -->
      <div style="background:#0a0a18;border-radius:8px;padding:10px 12px;font-size:10px;color:#404060;line-height:1.8;">
        <span style="color:#5b8dee;font-weight:700;">jsDelivr (recommended):</span><br>
        <span style="color:#5be0ff;font-family:monospace;">cdn.jsdelivr.net/gh/<b style="color:#fff">user/repo</b>@main/<b style="color:#fff">file.glb</b></span><br>
        <span style="color:#5b8dee;font-weight:700;">GitHub raw:</span><br>
        <span style="color:#5be0ff;font-family:monospace;">raw.githubusercontent.com/<b style="color:#fff">user/repo/main/file.glb</b></span>
      </div>

      <!-- Apply button -->
      <div id="glb-url-apply" style="
        width:100%;padding:16px;
        background:#5b8dee;color:#fff;
        border-radius:12px;
        font-size:16px;font-weight:900;
        text-align:center;letter-spacing:1px;
        cursor:pointer;touch-action:manipulation;
        box-shadow:0 0 20px rgba(91,141,238,.3);">
        ⬇ LOAD MODEL
      </div>

      <!-- Status -->
      <div id="glb-url-status" style="
        display:none;text-align:center;font-size:12px;font-weight:700;
        color:#5b8dee;letter-spacing:.5px;padding:4px 0;">
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const nameEl    = overlay.querySelector('#glb-url-name');
  const urlEl     = overlay.querySelector('#glb-url-input');
  const previewEl = overlay.querySelector('#glb-url-preview');
  const applyBtn  = overlay.querySelector('#glb-url-apply');
  const statusEl  = overlay.querySelector('#glb-url-status');
  const closeBtn  = overlay.querySelector('#glb-url-close');

  // Focus name input on open
  setTimeout(() => nameEl.focus(), 120);

  // ── Live URL preview + validation ────────────────────
  function updatePreview() {
    const raw = urlEl.value.trim();
    if(!raw) {
      previewEl.style.color = '#404060';
      previewEl.textContent = 'URL preview will appear here...';
      applyBtn.style.background = '#5b8dee';
      applyBtn.style.opacity = '1';
      return;
    }
    // Validate
    const isHttp  = raw.startsWith('http://') || raw.startsWith('https://');
    const isGLB   = /\.(glb|gltf)(\?.*)?$/i.test(raw);
    const isDeliv = raw.includes('cdn.jsdelivr.net') || raw.includes('raw.githubusercontent.com') || raw.includes('github.io');

    let color = '#e05555', msg = '⚠ ';
    if(!isHttp)  msg += 'Must start with https://';
    else if(!isGLB) msg += 'URL should end with .glb or .gltf';
    else { color = '#3ecf7e'; msg = '✓ Looks good!'; }

    if(isHttp && isGLB && !isDeliv) {
      color = '#f5a623'; msg = '⚠ Works but jsDelivr/GitHub is recommended';
    }

    previewEl.style.color  = color;
    previewEl.innerHTML    = `<span style="color:${color};font-weight:700">${msg}</span><br><span style="color:#5be0ff">${raw}</span>`;
    applyBtn.style.background  = (isHttp && isGLB) ? '#3ecf7e' : '#5b8dee';
    applyBtn.style.color       = (isHttp && isGLB) ? '#000'    : '#fff';
  }

  urlEl.addEventListener('input',  updatePreview);
  urlEl.addEventListener('paste',  () => setTimeout(updatePreview, 30));

  // Focus styling
  nameEl.addEventListener('focus', ()=>{ nameEl.style.borderColor='#5b8dee'; });
  nameEl.addEventListener('blur',  ()=>{ nameEl.style.borderColor='#2a2a3e'; });
  urlEl.addEventListener('focus',  ()=>{ urlEl.style.borderColor='#5b8dee'; });
  urlEl.addEventListener('blur',   ()=>{ urlEl.style.borderColor='#2a2a3e'; });

  // ── Close ─────────────────────────────────────────────
  function closePanel() { overlay.remove(); }
  closeBtn.addEventListener('click',    closePanel);
  closeBtn.addEventListener('touchend', e=>{ e.preventDefault(); closePanel(); });
  overlay.addEventListener('click', e=>{ if(e.target===overlay) closePanel(); });

  // ── Apply / Load ──────────────────────────────────────
  function doLoad() {
    const url  = urlEl.value.trim();
    let   name = nameEl.value.trim();

    if(!url)  { urlEl.focus(); showToast('⚠ Paste a URL first'); return; }
    if(!url.startsWith('http')) { showToast('⚠ URL must start with https://'); return; }
    if(!name) {
      // Auto-derive name from filename
      name = url.split('/').pop().split('?')[0].replace(/\.(glb|gltf)$/i,'') || 'Model';
      nameEl.value = name;
    }

    // Loading state
    applyBtn.textContent    = '⏳ Downloading...';
    applyBtn.style.background = '#1a3a1a';
    applyBtn.style.color      = '#3ecf7e';
    applyBtn.style.pointerEvents = 'none';
    statusEl.style.display   = 'block';
    statusEl.textContent     = 'Connecting to ' + (url.includes('jsdelivr') ? 'jsDelivr CDN' : 'server') + '...';

    fetch(url)
      .then(r => {
        if(!r.ok) throw new Error('HTTP ' + r.status + ' — ' + r.statusText);
        const total = parseInt(r.headers.get('content-length') || '0');
        statusEl.textContent = total ? 'Downloading... ('+Math.round(total/1024)+'KB)' : 'Downloading...';
        return r.arrayBuffer();
      })
      .then(buf => {
        window._glbBuffers[name] = buf;
        if(window._publishCfg) window._publishCfg.glbUrls[name] = url;

        statusEl.textContent = 'Processing model...';

        _glbLoadBuffer(name, buf, buf.byteLength, () => {
          const entry = glbModels[glbModels.length - 1];
          if(entry) { entry.source = 'remote'; entry.url = url; }
          refreshGLBLibrary();

          // Success state
          applyBtn.textContent      = '✅ Loaded!';
          applyBtn.style.background = '#3ecf7e';
          applyBtn.style.color      = '#000';
          statusEl.textContent      = '✓ ' + name + ' added to library';
          statusEl.style.color      = '#3ecf7e';
          showToast('✅ ' + name + ' loaded!\n🚀 URL saved for PUBLISH');

          setTimeout(closePanel, 1200);
        });
      })
      .catch(err => {
        applyBtn.textContent      = '⬇ LOAD MODEL';
        applyBtn.style.background = '#e05555';
        applyBtn.style.color      = '#fff';
        applyBtn.style.pointerEvents = 'all';
        statusEl.textContent      = '❌ ' + err.message;
        statusEl.style.color      = '#e05555';
        showToast('❌ ' + err.message);
      });
  }

  applyBtn.addEventListener('click',    doLoad);
  applyBtn.addEventListener('touchend', e=>{ e.preventDefault(); doLoad(); });
}

// ── Load one GLB file from local disk ─────────────────
function _loadGLBFile(file, onDone) {
  const name = file.name.replace(/\.(glb|gltf)$/i, '');
  _glbShowBar(name);

  const reader = new FileReader();

  reader.onload = function(ev) {
    const buf = ev.target.result;
    // Store permanently
    window._glbBuffers[name] = buf;
    _glbLoadBuffer(name, buf, file.size, onDone);
  };

  reader.onerror = function() {
    _glbHideBar();
    showToast('❌ Cannot read: ' + name);
    if (onDone) onDone();
  };

  reader.readAsArrayBuffer(file);
}

// ── Core: load ArrayBuffer into PlayCanvas ────────────
function _glbLoadBuffer(name, buf, fileSize, onDone) {
  const blob = new Blob([buf], { type: 'model/gltf-binary' });
  const url  = URL.createObjectURL(blob);

  // Create asset FIRST and add to registry — this is the key
  const asset = new pc.Asset(name + '_' + Date.now(), 'container', { url: url });
  asset.preload = true;

  // Store strong JS reference so GC never collects it
  window._glbAssetStore.push(asset);

  // Register with PlayCanvas BEFORE loading
  app.assets.add(asset);

  // Patch unload to prevent PlayCanvas from ever unloading this asset
  const _origUnload = asset.unload.bind(asset);
  asset.unload = function() {
    console.warn('[GLB] Blocked unload attempt for:', name);
    // Don't call _origUnload - keep asset alive
  };

  // One-time load handler
  asset.once('load', function() {
    _glbHideBar();
    // Double-patch after load in case unload was re-bound
    asset.unload = function() { /* blocked */ };
    _glbFinish(name, asset, fileSize, onDone);
  });

  asset.once('error', function(err) {
    _glbHideBar();
    console.error('GLB container load failed:', err);
    // Remove failed asset from store
    const idx = window._glbAssetStore.indexOf(asset);
    if (idx >= 0) window._glbAssetStore.splice(idx, 1);
    showToast('❌ Load failed: ' + name);
    if (onDone) onDone();
  });

  // Now load it
  app.assets.load(asset);
}

// ── Place loaded asset into scene ─────────────────────
function _glbFinish(name, asset, fileSize, onDone) {
  if (!asset.resource) {
    showToast('❌ No resource: ' + name);
    if (onDone) onDone();
    return;
  }

  // Create scene entity
  const root = new pc.Entity(name);
  const cx = edCam ? edCam.target.x : 0;
  const cz = edCam ? edCam.target.z : 0;
  root.setLocalPosition(cx, 0, cz);
  app.root.addChild(root);

  // Instantiate render hierarchy from container
  let inst = null;
  let _autoSF = 0.01;
  let _autoFound = false;
  let _autoMinY = 0, _autoMaxY = 1.7;
  try {
    const res = asset.resource;

    // Use instantiateRenderEntity but also manually attach renders
    if (res.instantiateRenderEntity) {
      inst = res.instantiateRenderEntity();
    }

    if (inst) {
      inst.name = name + '_mesh';
      // Parent mesh under root — NOT directly to app.root
      inst.setLocalPosition(0, 0, 0);

      // Force-enable all render components and fix materials
      function enableAll(node) {
        node.enabled = true;
        if (node.render) {
          node.render.enabled = true;
          const mis = node.render.meshInstances;
          if (mis && mis.length) {
            mis.forEach(mi => {
              if (mi.material) {
                mi.material.opacity = 1;
                mi.material.blendType = pc.BLEND_NONE;
                mi.material.depthWrite = true;
                mi.material.cull = pc.CULLFACE_BACK;
                mi.material.update();
              } else {
                const mat = new pc.StandardMaterial();
                mat.diffuse.set(0.8, 0.6, 0.4);
                mat.update();
                mi.material = mat;
              }
            });
            devLog('info', '🔍 render node: ' + node.name + ' meshes:' + mis.length);
          }
        }
        (node.children||[]).forEach(enableAll);
      }
      enableAll(inst);

      // Measure bounding box to find correct scale
      let minY=1e9, maxY=-1e9, minX=1e9, maxX=-1e9, minZ=1e9, maxZ=-1e9;
      let found = false;
      function measureBounds(node) {
        if (node.render && node.render.meshInstances) {
          node.render.meshInstances.forEach(mi => {
            try {
              const aabb = mi.aabb;
              if (!aabb) return;
              const mn = aabb.getMin(), mx = aabb.getMax();
              minX=Math.min(minX,mn.x); maxX=Math.max(maxX,mx.x);
              minY=Math.min(minY,mn.y); maxY=Math.max(maxY,mx.y);
              minZ=Math.min(minZ,mn.z); maxZ=Math.max(maxZ,mx.z);
              found = true;
            } catch(e){}
          });
        }
        (node.children||[]).forEach(measureBounds);
      }
      measureBounds(inst);

      let sf = 0.01;
      if (found) {
        const height = maxY - minY;
        const width  = maxX - minX;
        const depth  = maxZ - minZ;
        const longest = Math.max(height, width, depth);
        devLog('info', '📐 bounds H:'+height.toFixed(2)+' W:'+width.toFixed(2)+' D:'+depth.toFixed(2));
        if (longest > 0) {
          sf = 1.7 / longest;
          _autoSF = sf; _autoFound = found; _autoMinY = minY; _autoMaxY = maxY;
          devLog('info', '📐 auto scale: ' + sf.toFixed(4) + ' (longest='+longest.toFixed(4)+')');
        }
      } else {
        devLog('warn', 'Could not measure bounds — using 0.01');
      }

      inst.setLocalScale(sf, sf, sf);
      // Real-world auto scale:
      // - sf > 1.0 is fine for tiny models (e.g. a 0.02m model needs sf=90 to be 1.8m)
      // - Only cap if sf is absurdly large (> 500) meaning bounds detection failed
      if (sf > 500) {
        sf = 0.01;
        inst.setLocalScale(sf, sf, sf);
        inst.setLocalPosition(0, 0, 0);
        devLog('warn', 'Auto-scale capped (bounds too small) — using 0.01');
      } else if (found) {
        inst.setLocalPosition(0, -(minY * sf), 0);
        devLog('info', '📐 final scale: '+sf.toFixed(4)+' height: '+((maxY-minY)*sf).toFixed(2)+'m');
      }

      // Parent mesh under root wrapper
      root.addChild(inst);

      if (res.renders && res.renders.length) {
        devLog('info', '🔍 renders array: ' + res.renders.length + ' items');
      }
    } else {
      devLog('error', 'instantiateRenderEntity returned null');
    }
  } catch(e) {
    devLog('error', 'instantiate error: ' + e.message);
  }

  // Scale — always 0.01 for safety (Meshy exports in cm)
  // (already applied to inst above)

  // Collect animations from asset resource
  const clips = [];
  try {
    (asset.resource.animations || []).forEach(a => {
      if (a && a.name) clips.push(a.name);
    });
  } catch(e) {}

  // ── Attach animation component to inst so clips can actually play ──
  if (inst && clips.length > 0) {
    try {
      // PlayCanvas 1.62+ GSM-based anim
      if (!inst.anim) {
        inst.addComponent('anim', { activate: true, speed: 1 });
      }
      // Build a simple state graph: one state per clip
      const states = clips.map(c => ({ name: c, speed: 1 }));
      const transitions = [];
      // Assign animation assets to states
      (asset.resource.animations || []).forEach(animAsset => {
        if (!animAsset || !animAsset.name) return;
        try {
          inst.anim.assignAnimation(animAsset.name, animAsset.resource);
        } catch(e) {
          devLog('warn', 'assignAnimation failed: ' + e.message);
        }
      });
      devLog('info', '🎭 anim component set up: ' + clips.length + ' clips on ' + inst.name);
    } catch(animSetupErr) {
      devLog('warn', 'Anim setup error: ' + animSetupErr.message);
      // Fallback: try legacy animation component
      try {
        if (!inst.animation) inst.addComponent('animation', { activate: true, loop: true, speed: 1 });
        const animAssets = asset.resource.animations || [];
        if (animAssets.length > 0 && inst.animation) {
          inst.animation.assets = animAssets.map(a => a.id || a);
          inst.animation.play(clips[0], 0);
        }
      } catch(e2) {
        devLog('warn', 'Legacy anim fallback failed: ' + e2.message);
      }
    }
  }

  // Always use root as the main entity — inst is parented under it
  const mainEnt = root;
  const realHeight = (_autoFound && _autoSF > 0) ? ((_autoMaxY - _autoMinY) * _autoSF).toFixed(2) + 'm' : '?';

  // Store in glbModels
  const entry = {
    entity:   mainEnt,
    name:     name,
    asset:    asset,
    scale:    inst ? inst.getLocalScale().x : 0.01,
    realHeight: realHeight,
    fileSize: Math.round((fileSize||0) / 1024) + 'KB',
    x: cx, z: cz,
    clips: clips,
    source: 'local'
  };
  glbModels.push(entry);
  placedProps.push({ entity: mainEnt, type: 'glb_' + name, x: cx, z: cz });

  // Refresh UI
  refreshGLBLibrary();
  if (typeof refreshOutliner === 'function') refreshOutliner();
  if (typeof updateObjCount  === 'function') updateObjCount();
  if (typeof selectEntity === 'function') {
    selectEntity(mainEnt);
    if (!rightOpen) toggleRight();
    setRightTab('props');
  }

  // Keep camera at current position - don't move it
  // User can tap 📷 Cam button if needed

  // Mark ALL currently loaded assets as preload to prevent ANY unloading
  try {
    app.assets.list().forEach(a => { a.preload = true; });
  } catch(e) {}

  showToast('✅ ' + name + ' (' + Math.round((fileSize||0)/1024) + 'KB)');
  if (clips.length) setTimeout(() => showToast('🎭 ' + clips.length + ' animation(s)'), 400);
  if (onDone) onDone();
}

// ── Library UI ─────────────────────────────────────────
function refreshGLBLibrary() {
  const lib = document.getElementById('glb-library');
  if (!lib) return;

  const all = [
    ...glbModels.map((m, i)   => ({...m, _idx: i,   _src: 'local'})),
    ...remoteModels.map((m, i) => ({...m, _idx: i,   _src: 'remote'})),
  ];

  if (!all.length) {
    lib.innerHTML = '<div style="color:var(--text2);font-size:11px;text-align:center;padding:20px;line-height:1.8">No models imported.<br>Tap Import GLB File above.</div>';
    return;
  }

  lib.innerHTML = '';
  all.forEach((m, i) => {
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg3);border-radius:10px;padding:10px;margin-bottom:8px;border:1px solid var(--border);';

    // Info row
    const info = document.createElement('div');
    info.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:8px;';
    info.innerHTML = `
      <span style="font-size:22px">📦</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${m.name}</div>
        <div style="font-size:9px;color:var(--text2)">${m.fileSize||''} · ${m.realHeight||'?'} · ${m._src}</div>
      </div>
      <div style="width:8px;height:8px;border-radius:50%;flex-shrink:0;background:${m._src==='local'?'#3ecf7e':'#5b8dee'}"></div>
    `;
    card.appendChild(info);

    // Buttons row — Place · Scale · Cam · Del
    const btns = document.createElement('div');
    btns.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:4px;';

    function mkBtn(label, bg, color, fn) {
      const b = document.createElement('div');
      b.style.cssText = `padding:9px 4px;background:${bg};color:${color};border-radius:7px;font-size:10px;font-weight:700;text-align:center;cursor:pointer;touch-action:manipulation;user-select:none;`;
      b.textContent = label;
      b.addEventListener('click', fn);
      b.addEventListener('touchend', e => { e.preventDefault(); fn(); });
      return b;
    }

    btns.appendChild(mkBtn('📍 Place',      'var(--accent)', '#fff',    () => _glbPlace(i)));
    btns.appendChild(mkBtn('🔧 Scale',      '#1a3a1a',       '#3ecf7e', () => _glbFixScale(i)));
    btns.appendChild(mkBtn('📷 Cam',        '#1a1a3a',       '#5b8dee', () => _glbResetCam(i)));
    btns.appendChild(mkBtn('⚡ Auto Player','#2a1a00',       '#f5a623', () => _autoSetupPlayer(i)));
    btns.appendChild(mkBtn('🗑 Del',        '#2a1010',       '#e05555', () => _glbRemove(i)));

    card.appendChild(btns);
    lib.appendChild(card);
  });
}

// ── Library actions ────────────────────────────────────
function _glbPlace(i) {
  const all = [...glbModels, ...remoteModels];
  const m = all[i];
  if (!m) return;

  if (m.source === 'remote' || m._src === 'remote') {
    loadRemoteGLB(m.name, m.url, m.targetSize||2, m.category||'props');
    return;
  }

  // Re-place from stored buffer
  const buf = window._glbBuffers[m.name];
  if (!buf) { showToast('⚠ Re-import file to place again'); return; }
  _glbShowBar(m.name);
  _glbLoadBuffer(m.name + '_copy', buf, 0, null);
}

function _glbFixScale(i) {
  const all = [...glbModels, ...remoteModels];
  const m = all[i];
  if (!m || !m.entity) { showToast('⚠ No entity found'); return; }

  // Close if already open for this model
  const existing = document.getElementById('glb-scale-panel');
  if(existing){ existing.remove(); return; }

  // Measure current height of the entity
  function measureHeight(ent) {
    let minY=1e9, maxY=-1e9, found=false;
    function walk(n){
      if(n.render&&n.render.meshInstances) n.render.meshInstances.forEach(mi=>{
        try{ const bb=mi.aabb;
          minY=Math.min(minY,bb.getMin().y); maxY=Math.max(maxY,bb.getMax().y); found=true;
        }catch(e){}
      });
      (n.children||[]).forEach(walk);
    }
    walk(ent);
    return found ? {h: maxY-minY, minY, maxY} : null;
  }

  const bounds = measureHeight(m.entity);
  const curScale = m.entity.getLocalScale().x;
  const curH = bounds ? (bounds.h * curScale).toFixed(2) : '?';

  const panel = document.createElement('div');
  panel.id = 'glb-scale-panel';
  panel.style.cssText = [
    'position:fixed','bottom:80px','left:50%','transform:translateX(-50%)',
    'z-index:1200','width:calc(100vw - 24px)','max-width:360px',
    'background:#0e0e1a','border:1.5px solid #3ecf7e44',
    'border-radius:14px','padding:16px',
    'box-shadow:0 8px 32px rgba(0,0,0,.85)',
    'pointer-events:all',
  ].join(';');

  const HEIGHT_PRESETS = [0.5, 1.0, 1.5, 1.8, 2.0, 3.0, 5.0, 10.0];
  const SCALE_PRESETS  = [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10, 100];

  panel.innerHTML = `
    <div style="display:flex;align-items:center;margin-bottom:12px">
      <span style="font-size:13px;font-weight:900;color:#3ecf7e;flex:1">🔧 Scale: ${m.name}</span>
      <span style="font-size:10px;color:#404060;margin-right:8px">now: ${curH}m</span>
      <div id="gsp-close" style="padding:4px 10px;background:#1a1a2e;color:#888;border-radius:6px;font-size:11px;cursor:pointer;touch-action:manipulation">✕</div>
    </div>

    <!-- Set by height -->
    <div style="font-size:9px;color:#3ecf7e;font-weight:700;letter-spacing:.5px;margin-bottom:6px">SET HEIGHT (meters)</div>
    <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
      <input id="gsp-h" type="number" min="0.01" step="0.01" value="1.8"
        style="flex:1;background:#060610;border:1.5px solid #3ecf7e44;border-radius:8px;
        color:#fff;font-size:18px;font-weight:700;padding:8px 12px;text-align:center;outline:none;">
      <div id="gsp-apply-h" style="padding:10px 16px;background:#3ecf7e;color:#000;border-radius:8px;
        font-size:12px;font-weight:900;cursor:pointer;touch-action:manipulation;white-space:nowrap">Apply</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">
      ${HEIGHT_PRESETS.map(h=>`<div class="gsp-h-preset" data-h="${h}"
        style="padding:6px 10px;background:#1a1a2e;border:1px solid #2a2a3e;border-radius:7px;
        font-size:11px;font-weight:700;color:#3ecf7e;cursor:pointer;touch-action:manipulation">${h}m</div>`).join('')}
    </div>

    <!-- Set by scale factor -->
    <div style="font-size:9px;color:#5b8dee;font-weight:700;letter-spacing:.5px;margin-bottom:6px">SET SCALE FACTOR</div>
    <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center">
      <input id="gsp-s" type="number" min="0.0001" step="0.001" value="${curScale.toFixed(4)}"
        style="flex:1;background:#060610;border:1.5px solid #5b8dee44;border-radius:8px;
        color:#5be0ff;font-size:16px;font-weight:700;padding:8px 12px;text-align:center;outline:none;font-family:monospace;">
      <div id="gsp-apply-s" style="padding:10px 16px;background:#5b8dee;color:#fff;border-radius:8px;
        font-size:12px;font-weight:900;cursor:pointer;touch-action:manipulation;white-space:nowrap">Apply</div>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:5px">
      ${SCALE_PRESETS.map(s=>`<div class="gsp-s-preset" data-s="${s}"
        style="padding:6px 10px;background:#1a1a2e;border:1px solid #2a2a3e;border-radius:7px;
        font-size:10px;font-weight:700;color:#5b8dee;cursor:pointer;touch-action:manipulation;font-family:monospace">${s}×</div>`).join('')}
    </div>
  `;

  document.body.appendChild(panel);

  // ── Apply height ───────────────────────────────────────
  function applyHeight(targetH) {
    targetH = parseFloat(targetH);
    if(!targetH || targetH <= 0) return;
    const b2 = measureHeight(m.entity);
    const rawH = b2 ? b2.h : 1.8;
    if(rawH <= 0) { showToast('⚠ Could not measure model height'); return; }
    // Work out scale needed
    const curS = m.entity.getLocalScale().x;
    const realH = rawH * curS;
    const newS  = (targetH / realH) * curS;
    applyScaleFactor(newS);
  }

  function applyScaleFactor(sf) {
    sf = parseFloat(sf);
    if(!sf || sf <= 0) return;
    m.entity.setLocalScale(sf, sf, sf);
    // Re-seat on ground
    const b3 = measureHeight(m.entity);
    if(b3 && b3.minY !== 1e9) {
      const worldMinY = b3.minY * sf;
      const pos = m.entity.getLocalPosition();
      m.entity.setLocalPosition(pos.x, -worldMinY, pos.z);
    }
    m.scale = sf;
    // Update input display
    const hInp = panel.querySelector('#gsp-h');
    const sInp = panel.querySelector('#gsp-s');
    if(sInp) sInp.value = sf.toFixed(4);
    const b4 = measureHeight(m.entity);
    if(hInp && b4) hInp.value = (b4.h * sf).toFixed(2);
    // Update info label
    const cur2 = b4 ? (b4.h * sf).toFixed(2) : '?';
    panel.querySelector('span[style*="404060"]').textContent = 'now: ' + cur2 + 'm';
    // Focus camera
    edCam.target.set(m.entity.getLocalPosition().x, 0, m.entity.getLocalPosition().z);
    edCam.radius = Math.max(sf * 4, 2);
    updateEdCam();
    showToast('✅ Scale applied: ×' + sf.toFixed(4));
  }

  // Button handlers
  const applyH = panel.querySelector('#gsp-apply-h');
  applyH.addEventListener('click',    () => applyHeight(panel.querySelector('#gsp-h').value));
  applyH.addEventListener('touchend', e=>{ e.preventDefault(); applyHeight(panel.querySelector('#gsp-h').value); });
  panel.querySelector('#gsp-h').addEventListener('keydown', e=>{ if(e.key==='Enter') applyHeight(panel.querySelector('#gsp-h').value); });

  const applyS = panel.querySelector('#gsp-apply-s');
  applyS.addEventListener('click',    () => applyScaleFactor(panel.querySelector('#gsp-s').value));
  applyS.addEventListener('touchend', e=>{ e.preventDefault(); applyScaleFactor(panel.querySelector('#gsp-s').value); });
  panel.querySelector('#gsp-s').addEventListener('keydown', e=>{ if(e.key==='Enter') applyScaleFactor(panel.querySelector('#gsp-s').value); });

  // Height presets
  panel.querySelectorAll('.gsp-h-preset').forEach(b => {
    b.addEventListener('click',    () => { panel.querySelector('#gsp-h').value=b.dataset.h; applyHeight(b.dataset.h); });
    b.addEventListener('touchend', e=>{ e.preventDefault(); panel.querySelector('#gsp-h').value=b.dataset.h; applyHeight(b.dataset.h); });
  });

  // Scale presets
  panel.querySelectorAll('.gsp-s-preset').forEach(b => {
    b.addEventListener('click',    () => { panel.querySelector('#gsp-s').value=b.dataset.s; applyScaleFactor(b.dataset.s); });
    b.addEventListener('touchend', e=>{ e.preventDefault(); panel.querySelector('#gsp-s').value=b.dataset.s; applyScaleFactor(b.dataset.s); });
  });

  // Close
  const closeBtn = panel.querySelector('#gsp-close');
  closeBtn.addEventListener('click',    () => panel.remove());
  closeBtn.addEventListener('touchend', e=>{ e.preventDefault(); panel.remove(); });
}

function _glbResetCam(i) {
  const all = [...glbModels, ...remoteModels];
  const m = all[i];
  const pos = (m && m.entity) ? m.entity.getLocalPosition() : {x:0,z:0};
  edCam.target.set(pos.x, 0, pos.z);
  edCam.radius = 5;
  edCam.phi    = 1.0;
  edCam.theta  = -0.5;
  updateEdCam();
  showToast('📷 Camera reset');
}

function _glbRescaleDialog(i) {
  const all = [...glbModels, ...remoteModels];
  const m = all[i];
  if (!m || !m.entity) return;

  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:1200;display:flex;align-items:center;justify-content:center;padding:20px;';
  d.innerHTML = `
    <div style="background:#13131c;border-radius:14px;padding:20px;width:100%;max-width:320px;">
      <div style="font-size:13px;font-weight:700;color:#5b8dee;margin-bottom:14px;">🔲 Set Scale</div>
      <input id="rescale-val" type="number" value="${m.scale||0.01}" step="0.001"
        style="width:100%;background:#0a0a14;border:1px solid #3a3a5e;border-radius:8px;color:#fff;font-size:18px;padding:12px;box-sizing:border-box;text-align:center;margin-bottom:12px;">
      <div style="display:flex;gap:8px;">
        <div id="rescale-ok" style="flex:1;padding:12px;background:#5b8dee;color:#fff;border-radius:8px;font-weight:700;text-align:center;cursor:pointer;touch-action:manipulation;">Apply</div>
        <div id="rescale-cancel" style="flex:1;padding:12px;background:#2a2a3e;color:#aaa;border-radius:8px;text-align:center;cursor:pointer;touch-action:manipulation;">Cancel</div>
      </div>
    </div>`;
  document.body.appendChild(d);

  const apply = () => {
    const v = parseFloat(document.getElementById('rescale-val').value);
    if (!isNaN(v) && v > 0) {
      m.entity.setLocalScale(v, v, v);
      m.scale = v;
      refreshGLBLibrary();
    }
    d.remove();
  };
  d.querySelector('#rescale-ok').addEventListener('click', apply);
  d.querySelector('#rescale-ok').addEventListener('touchend', e => { e.preventDefault(); apply(); });
  d.querySelector('#rescale-cancel').addEventListener('click', () => d.remove());
  d.querySelector('#rescale-cancel').addEventListener('touchend', e => { e.preventDefault(); d.remove(); });
}

function _glbRemove(i) {
  const all = [...glbModels, ...remoteModels];
  const m = all[i];
  if (!m) return;

  const modelName = m.name || '';

  // Destroy the main registered entity
  try { if (m.entity) m.entity.destroy(); } catch(e) {}

  // Also destroy ALL spawned instances of this model in placedProps
  const prefix = 'glb_' + modelName;
  for(let pi = placedProps.length - 1; pi >= 0; pi--) {
    const p = placedProps[pi];
    if(p.type && (p.type === prefix || p.type.startsWith(prefix))) {
      try { if(p.entity) p.entity.destroy(); } catch(e) {}
      placedProps.splice(pi, 1);
    }
  }

  // Remove from asset store
  const ai = window._glbAssetStore.indexOf(m.asset);
  if (ai >= 0) window._glbAssetStore.splice(ai, 1);
  // Remove buffer
  if(window._glbBuffers && window._glbBuffers[modelName]) {
    delete window._glbBuffers[modelName];
  }

  if (i < glbModels.length) glbModels.splice(i, 1);
  else remoteModels.splice(i - glbModels.length, 1);

  refreshGLBLibrary();
  if (typeof refreshOutliner === 'function') refreshOutliner();
  if (typeof updateObjCount  === 'function') updateObjCount();
  showToast('🗑 GLB removed from scene');
}

// Compat aliases
function rePlaceGLB(i)       { _glbPlace(i); }
function removeGLBModel(i)   { _glbRemove(i); }
function rescaleGLBDialog(i) { _glbRescaleDialog(i); }
function quickFixScale()     { if (glbModels.length) _glbFixScale(glbModels.length - 1); }
function resetCameraToModel(){ if (glbModels.length) _glbResetCam(glbModels.length - 1); }

// ── Loading bar ────────────────────────────────────────
function _glbShowBar(name) {
  let el = document.getElementById('glb-loading');
  if (!el) {
    el = document.createElement('div');
    el.id = 'glb-loading';
    el.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#13131c;border:1px solid var(--accent);border-radius:12px;padding:14px 24px;z-index:800;min-width:240px;text-align:center;';
    document.body.appendChild(el);
  }
  el.innerHTML = `
    <div style="font-size:12px;color:#fff;margin-bottom:8px">⏳ Loading <b>${name.slice(0,30)}</b>…</div>
    <div style="height:4px;background:#1a1a2e;border-radius:2px;overflow:hidden;">
      <div style="height:100%;background:var(--accent);width:100%;animation:glb-pulse 1s infinite alternate;"></div>
    </div>`;
  if (!document.getElementById('glb-pulse-style')) {
    const s = document.createElement('style');
    s.id = 'glb-pulse-style';
    s.textContent = '@keyframes glb-pulse{from{opacity:.4}to{opacity:1}}';
    document.head.appendChild(s);
  }
}
function _glbHideBar() {
  const el = document.getElementById('glb-loading');
  if (el) el.remove();
}
// Legacy aliases
function showLoadingBar(n) { _glbShowBar(n); }
function hideLoadingBar()  { _glbHideBar(); }

// Patch file input for multi-file
setTimeout(() => {
  const fi = document.getElementById('glb-file');
  if (fi) { fi.multiple = true; fi.accept = '.glb,.gltf'; }
}, 500);



console.log('[EUG] eug-build.js loaded');
