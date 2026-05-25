// ══════════════════════════════════════════════════════
// EUG Core — Scene, Camera, Grid, Sky, Helpers
// ══════════════════════════════════════════════════════
// Requires: PlayCanvas loaded before this file

// ── Global state ──────────────────────────────────────
let currentMode='edit', currentTool='select', rightOpen=false, leftOpen=false, bottomOpen=false;
let selectedEntity=null;
let totalTime=0, fpsF=0, fpsT=0;

// Scene arrays — ONE declaration each
const roads=[], placedBuildings=[], placedVehicles=[], placedProps=[];
const districtZones=[], placedBillboards=[], waterBodies=[], glbModels=[];
let undoStack=[], redoStack=[];

// Drive state
let carX=0, carZ=0, carAng=0, carSpd=0, steer=0, gas=0, brake=0, playActive=false;
const MAXSPD=22, ACC=11, BRKF=26, COAST=6, STEER_RATE=2.2;
let camFollowAngle=0;

// Terrain
let terrainEntity=null, terrainEnabled=false, terrainVerts=null;
const TERRAIN_SEGS=40;
let terrainMode='raise';

// Active tool state
let activeProp='tree', activeRoadType='asphalt', activeVehicle='sedan', activeDistrict='residential', activeBrand='indomie';
let roadMode='draw', roadStart=null, roadMarker=null;
let buildStart=null, buildMarker=null, buildMode='draw';
let districtStart=null, districtMarker=null;
let timeOfDay=14, timeSpeed=0;

// Traffic
const trafficCars=[];
let trafficEnabled=false;

// Day/Night
const SKY_COLORS=[
  {h:0,r:.02,g:.02,b:.06},{h:5,r:.15,g:.10,b:.22},{h:6,r:.55,g:.28,b:.12},
  {h:8,r:.52,g:.70,b:.92},{h:12,r:.38,g:.52,b:.72},{h:16,r:.42,g:.58,b:.82},
  {h:18,r:.65,g:.38,b:.18},{h:20,r:.25,g:.15,b:.08},{h:22,r:.04,g:.04,b:.10},{h:24,r:.02,g:.02,b:.06},
];

// Blueprint
const blueprints={};
let _bpNearState = {};   // tracks onPlayerNear/Far state per node
const _scriptFns = {};   // compiled script functions per entity guid
const _scriptErrors = {}; // last error timestamp per guid
let _bpAnims={};

// Custom buttons
let customButtons=[];

// Cinematic
let recording=false, recFrames=[], playingRec=false, recPlayIdx=0;

// ── PlayCanvas init ───────────────────────────────────
prog(10,'STARTING ENGINE...');
const canvas=document.getElementById('application');
const app=new pc.Application(canvas,{
  mouse:new pc.Mouse(canvas),
  touch:new pc.TouchDevice(canvas),
  keyboard:new pc.Keyboard(window),
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
window.addEventListener('resize',()=>app.resizeCanvas());
app.start();
setTimeout(()=>{app.resizeCanvas();updateEdCam&&updateEdCam();},300);

prog(15,'BUILDING WORLD...');

// ── Sky & Scene ───────────────────────────────────────
app.scene.ambientLight=new pc.Color(.22,.25,.30);

// ── Sun ──────────────────────────────────────────────
const sun=new pc.Entity('Sun');
sun.addComponent('light',{
  type:pc.LIGHTTYPE_DIRECTIONAL,
  color:new pc.Color(1,.97,.88),
  intensity:.9,castShadows:true,
  shadowResolution:1024,shadowDistance:200,
  shadowBias:.05,normalOffsetBias:.05,
});
sun.setEulerAngles(45,-30,0);
app.root.addChild(sun);

// ── Fill light ───────────────────────────────────────
const fill=new pc.Entity('Fill');
fill.addComponent('light',{type:pc.LIGHTTYPE_DIRECTIONAL,color:new pc.Color(.25,.30,.40),intensity:.35,castShadows:false});
fill.setEulerAngles(30,200,0);
app.root.addChild(fill);

// ── Camera ───────────────────────────────────────────
const camEnt=new pc.Entity('Camera');
camEnt.addComponent('camera',{clearColor:new pc.Color(.38,.52,.72),fov:75,farClip:600,nearClip:.1});
app.root.addChild(camEnt);

// ── Editor camera state ───────────────────────────────
const edCam={target:new pc.Vec3(0,0,0),radius:28,theta:-.5,phi:.85};

function updateEdCam(){
  if(playActive) return;  // player camera controlled by updatePlayerMovement
  const sp=Math.sin(edCam.phi),cp=Math.cos(edCam.phi);
  const x=edCam.target.x+edCam.radius*sp*Math.sin(edCam.theta);
  const y=edCam.target.y+edCam.radius*cp;
  const z=edCam.target.z+edCam.radius*sp*Math.cos(edCam.theta);
  camEnt.setLocalPosition(x,y,z);
  camEnt.lookAt(edCam.target);
}
updateEdCam();

// ── Ground ────────────────────────────────────────────
prog(20,'BUILDING GROUND...');
const gndMat=new pc.StandardMaterial();
gndMat.diffuse.set(.13,.15,.13);
gndMat.specular.set(.01,.01,.01);
gndMat.shininess=2;
gndMat.update();
const gnd=new pc.Entity('Ground');
gnd.addComponent('render',{type:'plane',material:gndMat,castShadows:false,receiveShadows:true});
gnd.setLocalScale(500,1,500);
gnd.setLocalPosition(0,-0.01,0);  // slightly below Y=0 to avoid z-fight with user planes
app.root.addChild(gnd);

// ── Infinite Editor Grid — canvas 2D overlay ──────────
prog(25,'BUILDING GRID...');
(function buildGridOverlay(){
  const canvas = document.createElement('canvas');
  canvas.id = 'grid-canvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;';
  document.getElementById('viewport').appendChild(canvas);

  function drawGrid(){
    const vp = document.getElementById('viewport');
    if(!vp || !camEnt) return;
    const W = vp.clientWidth, H = vp.clientHeight;
    if(!W || !H) return;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,W,H);

    // Project a world point to screen
    function w2s(wx, wz){
      const sp = new pc.Vec3();
      camEnt.camera.worldToScreen(new pc.Vec3(wx,0,wz), sp);
      return {x: sp.x, y: sp.y, valid: sp.z > 0};
    }

    // Find visible world bounds by unprojecting screen corners
    function s2w(sx, sy){
      const near = new pc.Vec3(), far = new pc.Vec3();
      camEnt.camera.screenToWorld(sx, sy, 0.1, near);
      camEnt.camera.screenToWorld(sx, sy, 100,  far);
      const dir = far.clone().sub(near).normalize();
      if(Math.abs(dir.y) < 0.001) return null;
      const t = -near.y / dir.y;
      if(t < 0 || t > 2000) return null;
      return {x: near.x + dir.x*t, z: near.z + dir.z*t};
    }

    const corners = [
      s2w(0,0), s2w(W,0), s2w(0,H), s2w(W,H),
      s2w(W/2,0), s2w(W/2,H)
    ].filter(Boolean);
    if(!corners.length) return;

    const xs = corners.map(c=>c.x), zs = corners.map(c=>c.z);
    const minX=Math.min(...xs)-10, maxX=Math.max(...xs)+10;
    const minZ=Math.min(...zs)-10, maxZ=Math.max(...zs)+10;

    // Choose grid spacing based on zoom level
    const leftW = s2w(0, H/2), rightW = s2w(W, H/2);
    const worldWidth = leftW && rightW ? Math.abs(rightW.x - leftW.x) : 100;
    let spacing = 1;
    if(worldWidth > 500) spacing = 50;
    else if(worldWidth > 100) spacing = 10;
    else if(worldWidth > 40) spacing = 5;
    else if(worldWidth > 10) spacing = 2;

    function drawLines(step, color, width){
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      const startX = Math.floor(minX/step)*step;
      const startZ = Math.floor(minZ/step)*step;
      for(let x=startX; x<=maxX; x+=step){
        const a=w2s(x,minZ), b=w2s(x,maxZ);
        if(a.valid||b.valid){ ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
      }
      for(let z=startZ; z<=maxZ; z+=step){
        const a=w2s(minX,z), b=w2s(maxX,z);
        if(a.valid||b.valid){ ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); }
      }
      ctx.stroke();
    }

    // Fine grid
    drawLines(spacing,     'rgba(255,255,255,0.06)', 0.5);
    // Major grid (5x)
    drawLines(spacing*5,   'rgba(255,255,255,0.12)', 0.8);
    // Super major (25x)
    drawLines(spacing*25,  'rgba(255,255,255,0.20)', 1.0);

    // X axis — red
    const ax1=w2s(minX,0), ax2=w2s(maxX,0);
    if(ax1.valid||ax2.valid){
      ctx.strokeStyle='rgba(200,60,60,0.7)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(ax1.x,ax1.y); ctx.lineTo(ax2.x,ax2.y); ctx.stroke();
    }
    // Z axis — blue
    const az1=w2s(0,minZ), az2=w2s(0,maxZ);
    if(az1.valid||az2.valid){
      ctx.strokeStyle='rgba(60,80,200,0.7)'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(az1.x,az1.y); ctx.lineTo(az2.x,az2.y); ctx.stroke();
    }

    // Origin dot
    const o=w2s(0,0);
    if(o.valid){
      ctx.fillStyle='rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.arc(o.x,o.y,3,0,Math.PI*2); ctx.fill();
    }
  }

  // Redraw grid every frame in edit mode
  app.on('update', ()=>{ if(!playActive) drawGrid(); });
  // Also resize when viewport changes
  window.addEventListener('resize', drawGrid);
})();

// ── Pastel palette ────────────────────────────────────
const pastelPalette=[
  [.98,.80,.80],[.80,.90,.98],[.82,.97,.82],[.98,.94,.78],
  [.88,.80,.98],[.98,.87,.76],[.78,.94,.94],[.90,.98,.80],
  [.72,.72,.74],[.85,.78,.65],[.94,.80,.90],[.80,.94,.90],
];

// ── Marker materials ──────────────────────────────────
const markerMat=new pc.StandardMaterial(); markerMat.emissive.set(1,.7,.1); markerMat.emissiveIntensity=1; markerMat.update();
const markerGreenMat=new pc.StandardMaterial(); markerGreenMat.emissive.set(.2,.9,.3); markerGreenMat.emissiveIntensity=1; markerGreenMat.update();

function spawnMarker(x,z,mat){
  const e=new pc.Entity('Marker');
  e.addComponent('render',{type:'sphere',material:mat||markerMat,castShadows:false});
  e.setLocalPosition(x,1.2,z); e.setLocalScale(.6,.6,.6);
  app.root.addChild(e); return e;
}

// ── screenToWorld ─────────────────────────────────────
function screenToWorld(cx,cy){
  const vp=document.getElementById('viewport');
  if(!vp) return null;
  const r=vp.getBoundingClientRect();
  const nx=(cx-r.left)/r.width*2-1, ny=1-(cy-r.top)/r.height*2;
  const from=new pc.Vec3(), to=new pc.Vec3();
  camEnt.camera.screenToWorld(cx-r.left,cy-r.top,1,to);
  const pos=camEnt.getPosition().clone();
  const dir=to.clone().sub(pos).normalize();
  if(Math.abs(dir.y)<.001) return null;
  const t=-pos.y/dir.y;
  if(t<0) return null;
  return new pc.Vec3(pos.x+dir.x*t,0,pos.z+dir.z*t);
}

// ── pickEntityAt ─────────────────────────────────────
function pickEntityAt(cx,cy){
  if(!app.renderMeshInstances) return null;
  // Simple: find closest placedBuilding, placedVehicle, placedProp
  const pt=screenToWorld(cx,cy); if(!pt) return null;
  let best=null, bestD=8;
  const check=(arr)=>{arr.forEach(item=>{
    const e=item.entity;
    if(!e) return;
    const p=e.getPosition();
    const d=Math.hypot(p.x-pt.x,p.z-pt.z);
    if(d<bestD){bestD=d;best=item;}
  });};
  check(placedBuildings); check(placedVehicles); check(placedProps);
  return best?.entity||null;
}

console.log('[EUG] eug-core.js loaded');
