// EUG Editor + Gizmo

//  GIZMO SYSTEM — Canvas 2D overlay, mobile-reliable
// ══════════════════════════════════════════════════════
let gizmoMode='move';
let gizmoEntity=null;
let gizmoDragging=null;
let gizmoRafId=null;
let gizmoHandles=[];  // [{axis,cx,cy,r}] for hit testing

const GCOL={x:'#e05555',y:'#3ecf7e',z:'#5b8dee'};
const GLEN=72;   // arrow length px
const GHEAD=12;
const GHIT=26;   // hit radius

function setGizmoMode(mode){
  gizmoMode=mode;
  ['move','rotate','scale'].forEach(m=>{
    const b=document.getElementById('gizmo-btn-'+m);
    if(b) b.classList.toggle('active',m===mode);
  });
}

function worldToScreen(wx,wy,wz){
  if(!camEnt||!camEnt.camera) return null;
  const vpEl=document.getElementById('viewport');
  if(!vpEl) return null;
  const r=vpEl.getBoundingClientRect();
  const gc=document.getElementById('gizmo-canvas');
  const cw=gc?gc.width:r.width;
  const ch=gc?gc.height:r.height;
  try{
    const s=camEnt.camera.worldToScreen(new pc.Vec3(wx,wy,wz));
    if(!s) return null;
    // worldToScreen gives coords in PlayCanvas canvas pixels
    // map to gizmo-canvas size
    const appCanvas=document.getElementById('application');
    const sx=s.x*(cw/(appCanvas.width||cw));
    const sy=s.y*(ch/(appCanvas.height||ch));
    if(sx<-200||sx>cw+200||sy<-200||sy>ch+200) return null;
    return {x:sx,y:sy};
  }catch(e){return null;}
}

function gizmoAttach(ent){
  gizmoEntity=ent;
  const tb=document.getElementById('gizmo-toolbar');
  if(tb) tb.style.display='flex';
  // size the canvas
  _gizmoResizeCanvas();
  // enable pointer events on canvas
  const gc=document.getElementById('gizmo-canvas');
  if(gc) gc.style.pointerEvents='all';
  if(gizmoRafId) cancelAnimationFrame(gizmoRafId);
  function loop(){
    try { _gizmoDraw(); } catch(e) { /* gizmo error ignored */ }
    gizmoRafId=requestAnimationFrame(loop);
  }
  gizmoRafId=requestAnimationFrame(loop);
}

function gizmoDetach(){
  gizmoEntity=null;
  gizmoDragging=null;
  gizmoHandles=[];
  if(gizmoRafId){cancelAnimationFrame(gizmoRafId);gizmoRafId=null;}
  const gc=document.getElementById('gizmo-canvas');
  if(gc){
    const ctx=gc.getContext('2d');
    ctx.clearRect(0,0,gc.width,gc.height);
    gc.style.pointerEvents='none';
  }
  const tb=document.getElementById('gizmo-toolbar');
  if(tb) tb.style.display='none';
}

function _gizmoResizeCanvas(){
  const vpEl=document.getElementById('viewport');
  const gc=document.getElementById('gizmo-canvas');
  if(!gc||!vpEl) return;
  const r=vpEl.getBoundingClientRect();
  if(gc.width!==Math.round(r.width)||gc.height!==Math.round(r.height)){
    gc.width=Math.round(r.width);
    gc.height=Math.round(r.height);
  }
}

function _gizmoDraw(){
  const gc=document.getElementById('gizmo-canvas');
  if(!gc||!gizmoEntity) return;
  _gizmoResizeCanvas();
  const ctx=gc.getContext('2d');
  ctx.clearRect(0,0,gc.width,gc.height);
  gizmoHandles=[];

  const pos=gizmoEntity.getLocalPosition();
  const entH=Math.max(gizmoEntity.getLocalScale().y*0.5,0.5);
  const sc=worldToScreen(pos.x,pos.y+entH,pos.z);
  if(!sc) return;

  const cx=sc.x, cy=sc.y;

  // ── MOVE / SCALE ─────────────────────────────────────
  if(gizmoMode==='move'||gizmoMode==='scale'){
    const offsets={x:[3,0,0],y:[0,3,0],z:[0,0,3]};
    ['x','y','z'].forEach(ax=>{
      const o=offsets[ax];
      const ep=worldToScreen(pos.x+o[0],pos.y+entH+o[1],pos.z+o[2]);
      if(!ep) return;
      const rdx=ep.x-cx,rdy=ep.y-cy,rlen=Math.sqrt(rdx*rdx+rdy*rdy)||1;
      const ndx=rdx/rlen,ndy=rdy/rlen;
      const ex=cx+ndx*GLEN,ey=cy+ndy*GLEN;
      const col=GCOL[ax];
      const isActive=gizmoDragging&&gizmoDragging.axis===ax;

      // Shaft shadow
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex,ey);
      ctx.strokeStyle='rgba(0,0,0,.45)'; ctx.lineWidth=(isActive?4:2.5)+3;
      ctx.lineCap='round'; ctx.stroke();
      // Shaft
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex,ey);
      ctx.strokeStyle=col; ctx.lineWidth=isActive?4:2.5;
      ctx.shadowColor=col; ctx.shadowBlur=isActive?14:5;
      ctx.lineCap='round'; ctx.stroke(); ctx.shadowBlur=0;

      if(gizmoMode==='move'){
        const nx=-ndy,ny=ndx;
        const tip={x:ex+ndx*GHEAD,y:ey+ndy*GHEAD};
        ctx.beginPath();
        ctx.moveTo(tip.x,tip.y);
        ctx.lineTo(ex+nx*8,ey+ny*8);
        ctx.lineTo(ex-nx*8,ey-ny*8);
        ctx.closePath();
        ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=10;
        ctx.fill(); ctx.shadowBlur=0;
        gizmoHandles.push({axis:ax,cx:ex,cy:ey,r:GHIT,type:'move'});
        ctx.beginPath(); ctx.arc(ex,ey,GHIT,0,Math.PI*2);
        ctx.fillStyle=isActive?col+'44':col+'18'; ctx.fill();
      } else {
        const hs=9;
        ctx.shadowColor=col; ctx.shadowBlur=isActive?12:5;
        ctx.fillStyle=isActive?col:col+'cc';
        ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.rect(ex-hs,ey-hs,hs*2,hs*2);
        ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
        gizmoHandles.push({axis:ax,cx:ex,cy:ey,r:GHIT,type:'scale'});
        ctx.beginPath(); ctx.arc(ex,ey,GHIT,0,Math.PI*2);
        ctx.fillStyle=isActive?col+'44':col+'18'; ctx.fill();
      }
    });
    // Center white dot
    ctx.beginPath(); ctx.arc(cx,cy,6,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,.95)'; ctx.shadowColor='#fff'; ctx.shadowBlur=10;
    ctx.fill(); ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.lineWidth=1; ctx.stroke();

  // ── ROTATE — Blender-style 3 full ellipse rings ───────
  } else if(gizmoMode==='rotate'){
    // Outer trackball ring (white)
    ctx.beginPath(); ctx.arc(cx,cy,GLEN*1.08,0,Math.PI*2);
    ctx.strokeStyle='rgba(220,220,220,.3)'; ctx.lineWidth=1.5;
    ctx.setLineDash([5,5]); ctx.stroke(); ctx.setLineDash([]);

    // 3 rings: Y=horizontal(blue), X=vertical-tilted(red), Z=diagonal(green)
    const rings=[
      {ax:'y', rx:GLEN*0.90, ry:GLEN*0.25, rot:0},
      {ax:'x', rx:GLEN*0.68, ry:GLEN*0.90, rot:-0.28},
      {ax:'z', rx:GLEN*0.82, ry:GLEN*0.55, rot:0.52},
    ];

    rings.forEach(ring=>{
      const col=GCOL[ring.ax];
      const isActive=gizmoDragging&&gizmoDragging.axis===ring.ax;
      const lw=isActive?5:2.5;

      ctx.save(); ctx.translate(cx,cy); ctx.rotate(ring.rot);

      // Glow/shadow pass
      ctx.beginPath(); ctx.ellipse(0,0,ring.rx,ring.ry,0,0,Math.PI*2);
      ctx.strokeStyle='rgba(0,0,0,.4)'; ctx.lineWidth=lw+4; ctx.stroke();

      // Main ring
      ctx.beginPath(); ctx.ellipse(0,0,ring.rx,ring.ry,0,0,Math.PI*2);
      ctx.strokeStyle=col; ctx.lineWidth=lw;
      ctx.shadowColor=col; ctx.shadowBlur=isActive?20:7;
      ctx.stroke(); ctx.shadowBlur=0;

      ctx.restore();

      // Hit detection — 14 points around ellipse
      for(let i=0;i<14;i++){
        const a=(i/14)*Math.PI*2;
        const ex2=cx + (Math.cos(a)*ring.rx)*Math.cos(ring.rot) - (Math.sin(a)*ring.ry)*Math.sin(ring.rot);
        const ey2=cy + (Math.cos(a)*ring.rx)*Math.sin(ring.rot) + (Math.sin(a)*ring.ry)*Math.cos(ring.rot);
        gizmoHandles.push({axis:ring.ax,cx:ex2,cy:ey2,r:20,type:'rotate'});
      }
    });

    // Axis label dots on rings
    const dots=[
      {ax:'y',x:cx+GLEN*0.90, y:cy,             col:GCOL.y},
      {ax:'x',x:cx-GLEN*0.40, y:cy-GLEN*0.82,   col:GCOL.x},
      {ax:'z',x:cx+GLEN*0.72, y:cy+GLEN*0.42,   col:GCOL.z},
    ];
    dots.forEach(({ax,x,y,col})=>{
      const isActive=gizmoDragging&&gizmoDragging.axis===ax;
      ctx.beginPath(); ctx.arc(x,y,isActive?10:7,0,Math.PI*2);
      ctx.fillStyle=isActive?col:col+'cc';
      ctx.shadowColor=col; ctx.shadowBlur=isActive?14:6;
      ctx.fill(); ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=1; ctx.stroke();
      ctx.font=`bold ${isActive?11:8}px system-ui`;
      ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(ax.toUpperCase(),x,y);
    });

    // Center orange origin dot (Blender style)
    ctx.beginPath(); ctx.arc(cx,cy,7,0,Math.PI*2);
    ctx.fillStyle='#f5a623'; ctx.shadowColor='#f5a623'; ctx.shadowBlur=14;
    ctx.fill(); ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(255,255,255,.7)'; ctx.lineWidth=1.5; ctx.stroke();
  }
}

// ── Hit test ───────────────────────────────────────────
function _gizmoHitTest(cx,cy){
  // Returns handle or null
  let best=null, bestD=Infinity;
  gizmoHandles.forEach(h=>{
    const d=Math.hypot(cx-h.cx,cy-h.cy);
    if(d<=h.r&&d<bestD){bestD=d;best=h;}
  });
  return best;
}

// ── Canvas touch/mouse events ─────────────────────────
(function(){
  // Wait for DOM then bind
  function bindGizmoCanvas(){
    const gc=document.getElementById('gizmo-canvas');
    if(!gc){setTimeout(bindGizmoCanvas,200);return;}

    function onStart(clientX,clientY){
      if(!gizmoEntity) return false;
      const r=gc.getBoundingClientRect();
      const lx=(clientX-r.left)*(gc.width/r.width);
      const ly=(clientY-r.top)*(gc.height/r.height);
      const hit=_gizmoHitTest(lx,ly);
      if(!hit) return false;
      const pos=gizmoEntity.getLocalPosition().clone();
      const rot=gizmoEntity.getLocalEulerAngles().clone();
      const sc=gizmoEntity.getLocalScale().clone();
      gizmoDragging={axis:hit.axis,type:hit.type,startX:clientX,startY:clientY,startPos:pos,startRot:rot,startScale:sc};
      return true;
    }

    function onMove(clientX,clientY){
      if(!gizmoDragging||!gizmoEntity) return;
      const {axis,type,startX,startY,startPos,startRot,startScale}=gizmoDragging;
      const dx=clientX-startX, dy=clientY-startY;

      if(type==='move'){
        const sens=edCam.radius*0.013;
        let {x,y,z}=startPos;
        if(axis==='x'){
          // project camera right onto X
          const cr=new pc.Vec3();
          camEnt.getLocalTransform().getX(cr);
          x=startPos.x+(dx*cr.x-dy*cr.y)*sens;
        } else if(axis==='y'){
          y=startPos.y+(-dy)*sens*0.6;
        } else {
          const cr=new pc.Vec3();
          camEnt.getLocalTransform().getX(cr);
          z=startPos.z+(dx*cr.z-dy*cr.z*.1)*sens;
        }
        gizmoEntity.setLocalPosition(x,y,z);
        _gizmoSyncPos();
      } else if(type==='rotate'){
        const sens=1.2;
        let {x:rx,y:ry,z:rz}=startRot;
        if(axis==='y') ry=startRot.y+dx*sens;
        else if(axis==='x') rx=startRot.x+dy*sens;
        else rz=startRot.z+dx*sens;
        gizmoEntity.setLocalEulerAngles(rx,ry,rz);
      } else if(type==='scale'){
        const d=(dx-dy)*0.01;
        const sc2=Math.max(0.05,1+d);
        let {x:sx,y:sy,z:sz}=startScale;
        if(axis==='x') sx=Math.max(0.05,startScale.x*sc2);
        else if(axis==='y') sy=Math.max(0.05,startScale.y*sc2);
        else sz=Math.max(0.05,startScale.z*sc2);
        gizmoEntity.setLocalScale(sx,sy,sz);
      }
      if(rightOpen) showTransformPanel(gizmoEntity);
    }

    function onEnd(){ gizmoDragging=null; }

    // Touch
    gc.addEventListener('touchstart',e=>{
      if(playActive) return;
      const t=e.touches[0];
      const hit=onStart(t.clientX,t.clientY);
      if(hit){ e.stopPropagation(); e.preventDefault(); }
    },{passive:false});
    gc.addEventListener('touchmove',e=>{
      if(!gizmoDragging) return;
      e.stopPropagation(); e.preventDefault();
      onMove(e.touches[0].clientX,e.touches[0].clientY);
    },{passive:false});
    gc.addEventListener('touchend',e=>{
      if(!gizmoDragging) return;
      e.stopPropagation(); e.preventDefault();
      onEnd();
    },{passive:false});
    // Mouse
    gc.addEventListener('mousedown',e=>{
      if(onStart(e.clientX,e.clientY)){e.stopPropagation();e.preventDefault();}
    });
    window.addEventListener('mousemove',e=>{if(gizmoDragging) onMove(e.clientX,e.clientY);});
    window.addEventListener('mouseup',()=>{ if(gizmoDragging) onEnd(); });
  }
  bindGizmoCanvas();
})();

function _gizmoSyncPos(){
  if(!gizmoEntity) return;
  const p=gizmoEntity.getLocalPosition();
  [placedBuildings,placedVehicles,placedProps,placedBillboards].forEach(arr=>{
    arr.forEach(item=>{if(item.entity===gizmoEntity){item.x=p.x;item.z=p.z;}});
  });
}


console.log('[EUG] eug-editor.js loaded');
