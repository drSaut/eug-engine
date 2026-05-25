// ══════════════════════════════════════════════════════
// EUG Minimap — Canvas 2D Overhead View
// ══════════════════════════════════════════════════════

// ── MINIMAP ───────────────────────────────────────────
prog(64,'MINIMAP...');
function drawMinimap(){
  if(!playActive) return;
  const S=120,cx=60,cy=60,R=57;
  const mc=document.getElementById('mm-canvas');
  if(!mc) return;
  const ctx=mc.getContext('2d');
  ctx.clearRect(0,0,S,S);
  ctx.fillStyle='rgba(8,10,16,.88)';
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
  const scale=60/200;
  const cosA=Math.cos(-carAng),sinA=Math.sin(-carAng);
  const toM=(wx,wz)=>{const dx=wx-carX,dz=wz-carZ,rx=dx*cosA-dz*sinA,rz=dx*sinA+dz*cosA;return[cx+rx*scale,cy+rz*scale];};
  districtZones.forEach(z=>{const[mx,mz]=toM(z.cx,z.cz);ctx.fillStyle=z.color+'33';ctx.fillRect(mx-z.w*scale/2,mz-z.d*scale/2,z.w*scale,z.d*scale);});
  roads.forEach(r=>{const[x1,y1]=toM(r.x1,r.z1),[x2,y2]=toM(r.x2,r.z2);ctx.strokeStyle='rgba(60,65,80,.9)';ctx.lineWidth=Math.max(r.width*scale,2);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();});
  placedBuildings.forEach(b=>{const[mx,mz]=toM(b.cx,b.cz);ctx.fillStyle='rgba(120,100,160,.7)';ctx.fillRect(mx-b.w*scale/2,mz-b.d*scale/2,b.w*scale,b.d*scale);});
  trafficCars.forEach(tc=>{const[mx,mz]=toM(tc.x,tc.z);ctx.fillStyle='rgba(100,180,255,.9)';ctx.beginPath();ctx.arc(mx,mz,2.5,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='#fff'; ctx.shadowColor='rgba(255,255,255,.6)'; ctx.shadowBlur=4;
  ctx.save(); ctx.translate(cx,cy);
  ctx.beginPath(); ctx.moveTo(0,-9); ctx.lineTo(5,6); ctx.lineTo(0,3); ctx.lineTo(-5,6); ctx.closePath();
  ctx.fill(); ctx.restore(); ctx.shadowBlur=0; ctx.restore();
  ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle='rgba(255,80,80,.9)'; ctx.font='bold 9px system-ui'; ctx.textAlign='center';
  ctx.fillText('N',cx,cy-R+10);
}

// ── SAVE / LOAD ───────────────────────────────────────

console.log('[EUG] eug-minimap.js loaded');
