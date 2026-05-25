// ══════════════════════════════════════════════════════
// EUG Save — Scene Serialization
// ══════════════════════════════════════════════════════

// ── SAVE / LOAD ───────────────────────────────────────
prog(66,'SAVE/LOAD...');
function saveScene(){
  const data={
    roads:roads.map(r=>({x1:r.x1,z1:r.z1,x2:r.x2,z2:r.z2,width:r.width})),
    buildings:placedBuildings.map(b=>({x1:b.x1,z1:b.z1,x2:b.x2,z2:b.z2,height:b.height,colorIdx:b.colorIdx})),
    vehicles:placedVehicles.map(v=>({type:v.type,x:v.x,z:v.z,angle:v.angle||0})),
    props:placedProps.map(p=>({type:p.type,x:p.x,z:p.z})),
    districts:districtZones.map(z=>({type:z.type,cx:z.cx,cz:z.cz,w:z.w,d:z.d})),
    billboards:placedBillboards.map(b=>({brand:b.brand,x:b.x,z:b.z})),
  };
  localStorage.setItem('gta_scene',JSON.stringify(data));
  showToast('💾 Scene saved!');
}

function loadScene(){
  const raw=localStorage.getItem('gta_scene'); if(!raw){showToast('No save found');return;}
  newScene(true);
  const data=JSON.parse(raw);
  data.roads?.forEach(r=>buildRoad(r.x1,r.z1,r.x2,r.z2,r.width||8));
  data.buildings?.forEach(b=>spawnBuilding(b.x1,b.z1,b.x2,b.z2,b.height||10,b.colorIdx));
  data.vehicles?.forEach(v=>spawnVehicle(v.type,v.x,v.z,v.angle||0));
  data.props?.forEach(p=>{p.type.startsWith('prim_')?spawnPrimitive(p.type.replace('prim_','')):spawnProp(p.type,p.x,p.z);});
  data.districts?.forEach(z=>{activeDistrict=z.type;districtStart={x:z.cx-z.w/2,z:z.cz-z.d/2};districtHandleTap_direct(z.cx+z.w/2,z.cz+z.d/2);});
  data.billboards?.forEach(b=>spawnBillboard(b.brand,b.x,b.z));
  showToast('📂 Scene loaded!');
}

function districtHandleTap_direct(x2,z2){
  // helper for load
  const def=districtDefs[activeDistrict];
  const x1=Math.min(districtStart.x,x2),z1=Math.min(districtStart.z,z2);
  const xm=Math.max(districtStart.x,x2),zm=Math.max(districtStart.z,z2);
  const w=xm-x1,d=zm-z1,dcx=(x1+xm)/2,dcz=(z1+zm)/2;
  const mat=new pc.StandardMaterial(); mat.diffuse.set(def.r,def.g,def.b); mat.opacity=.5; mat.blendType=pc.BLEND_NORMAL; mat.update();
  const e=new pc.Entity('Zone_'+activeDistrict);
  e.addComponent('render',{type:'plane',material:mat,castShadows:false});
  e.setLocalPosition(dcx,.02,dcz); e.setLocalScale(w,1,d); app.root.addChild(e);
  districtZones.push({entity:e,type:activeDistrict,color:def.color,cx:dcx,cz:dcz,w,d,x1,z1,x2:xm,z2:zm});
  districtStart=null;
}

function newScene(silent){
  // ── Step 1: destroy all tracked entities ──────────────
  [...roads,...placedBuildings,...placedVehicles,...placedProps,
   ...districtZones,...placedBillboards,...glbModels].forEach(item=>{
    if(item.entity) try{ item.entity.destroy(); }catch(e){}
  });
  roads.length=0; placedBuildings.length=0; placedVehicles.length=0; placedProps.length=0;
  districtZones.length=0; placedBillboards.length=0; glbModels.length=0;
  remoteModels.length=0;
  window._glbBuffers = {}; window._glbAssetStore = [];

  // ── Step 2: nuke ALL orphaned app.root children ────────
  // Permanent system entities — never destroy these
  const KEEP = new Set(['Sun','Fill','Camera','Ground']);
  // Collect first (can't modify children while iterating)
  const toDestroy = [];
  for(let i = 0; i < app.root.children.length; i++){
    const c = app.root.children[i];
    if(!KEEP.has(c.name)) toDestroy.push(c);
  }
  toDestroy.forEach(c=>{ try{ c.destroy(); }catch(e){} });

  // ── Step 3: reset state ───────────────────────────────
  selectedEntity = null;
  _playerSceneEnt = null; _playerGLBIndex = -1;
  _eugIdleClip = null; _eugWalkClip = null; _eugCurClip = null;
  if(typeof gizmoDetach === 'function') gizmoDetach();
  trafficCars.forEach(c=>{ try{c.entity.destroy();}catch(e){} });
  trafficCars.length=0; trafficEnabled=false;
  if(window._publishCfg) window._publishCfg.glbUrls = {};

  // ── Step 4: refresh UI ───────────────────────────────
  refreshOutliner(); updateObjCount();
  if(typeof refreshGLBLibrary === 'function') refreshGLBLibrary();
  document.getElementById('props-body').innerHTML =
    '<div class="props-empty">Select an object<br>to edit properties</div>';
  if(!silent) showToast('🗒 Scene cleared');
}

function confirmReset(){
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:1200;display:flex;align-items:center;justify-content:center;padding:24px;';
  d.innerHTML = `
    <div style="background:#13131c;border:1.5px solid #e05555;border-radius:14px;padding:24px;width:100%;max-width:320px;text-align:center;">
      <div style="font-size:32px;margin-bottom:12px;">🗑</div>
      <div style="font-size:16px;font-weight:800;color:#fff;margin-bottom:8px;">Reset Scene?</div>
      <div style="font-size:12px;color:#8080a0;margin-bottom:24px;line-height:1.6;">This will delete ALL objects,<br>roads, buildings and GLB models.<br>This cannot be undone.</div>
      <div style="display:flex;gap:10px;">
        <div id="reset-cancel" style="flex:1;padding:14px;background:#2a2a3e;color:#aaa;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation;text-align:center;">Cancel</div>
        <div id="reset-confirm" style="flex:1;padding:14px;background:#e05555;color:#fff;border-radius:9px;font-size:13px;font-weight:800;cursor:pointer;touch-action:manipulation;text-align:center;">Delete All</div>
      </div>
    </div>`;
  document.body.appendChild(d);

  const cancel  = () => d.remove();
  const confirm = () => { d.remove(); newScene(); showToast('🗑 Scene reset'); };

  d.querySelector('#reset-cancel').addEventListener('click', cancel);
  d.querySelector('#reset-cancel').addEventListener('touchend', e=>{ e.preventDefault(); cancel(); });
  d.querySelector('#reset-confirm').addEventListener('click', confirm);
  d.querySelector('#reset-confirm').addEventListener('touchend', e=>{ e.preventDefault(); confirm(); });
}
// ── Scene Undo/Redo ───────────────────────────────────
// Max 20 undo steps. Each step = full scene snapshot (JSON)
const UNDO_MAX = 20;

function _sceneSnapshot() {
  return JSON.stringify({
    roads:      roads.map(r=>({x1:r.x1,z1:r.z1,x2:r.x2,z2:r.z2,width:r.width})),
    buildings:  placedBuildings.map(b=>({x1:b.x1,z1:b.z1,x2:b.x2,z2:b.z2,height:b.height,colorIdx:b.colorIdx})),
    vehicles:   placedVehicles.map(v=>({type:v.type,x:v.x,z:v.z,angle:v.angle||0})),
    props:      placedProps.map(p=>({type:p.type,x:p.x,z:p.z})),
    districts:  districtZones.map(z=>({type:z.type,cx:z.cx,cz:z.cz,w:z.w,d:z.d})),
    billboards: placedBillboards.map(b=>({brand:b.brand,x:b.x,z:b.z})),
    blueprints: JSON.parse(JSON.stringify(blueprints)),
  });
}

function _sceneRestore(json) {
  const data = JSON.parse(json);
  newScene(true);
  data.roads?.forEach(r=>buildRoad(r.x1,r.z1,r.x2,r.z2,r.width||8));
  data.buildings?.forEach(b=>spawnBuilding(b.x1,b.z1,b.x2,b.z2,b.height||10,b.colorIdx));
  data.vehicles?.forEach(v=>spawnVehicle(v.type,v.x,v.z,v.angle||0));
  data.props?.forEach(p=>{
    if(p.type.startsWith('prim_')) spawnPrimitive(p.type.replace('prim_',''));
    else if(!p.type.startsWith('glb_')) spawnProp(p.type,p.x,p.z);
  });
  data.districts?.forEach(z=>{activeDistrict=z.type;districtStart={x:z.cx-z.w/2,z:z.cz-z.d/2};districtHandleTap_direct(z.cx+z.w/2,z.cz+z.d/2);});
  data.billboards?.forEach(b=>spawnBillboard(b.brand,b.x,b.z));
  if(data.blueprints) Object.assign(blueprints, data.blueprints);
}

// Call this BEFORE any destructive scene action
function pushUndo() {
  undoStack.push(_sceneSnapshot());
  if(undoStack.length > UNDO_MAX) undoStack.shift();
  redoStack.length = 0; // clear redo on new action
  _updateUndoRedoBtns();
}

function undo() {
  if(!undoStack.length){ showToast('Nothing to undo'); return; }
  redoStack.push(_sceneSnapshot());
  _sceneRestore(undoStack.pop());
  selectedEntity = null;
  if(typeof gizmoDetach === 'function') gizmoDetach();
  showToast('↩ Undone');
  _updateUndoRedoBtns();
}

function redo() {
  if(!redoStack.length){ showToast('Nothing to redo'); return; }
  undoStack.push(_sceneSnapshot());
  _sceneRestore(redoStack.pop());
  selectedEntity = null;
  if(typeof gizmoDetach === 'function') gizmoDetach();
  showToast('↪ Redone');
  _updateUndoRedoBtns();
}

function _updateUndoRedoBtns() {
  const uBtn = document.querySelector('[onclick="undo()"]') || document.querySelector('[ontouchend*="undo()"]');
  const rBtn = document.querySelector('[onclick="redo()"]') || document.querySelector('[ontouchend*="redo()"]');
  if(uBtn) uBtn.style.opacity = undoStack.length ? '1' : '0.35';
  if(rBtn) rBtn.style.opacity = redoStack.length ? '1' : '0.35';
}

// ── PROCEDURAL CITY ───────────────────────────────────

console.log('[EUG] eug-save.js loaded');
