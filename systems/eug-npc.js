// EUG NPC AI System

//  E — NPC AI SYSTEM
// ════════════════════════════════════════// ══════════════
// npcsAI declared at top
const NPC_STATES = {IDLE:'idle', WALK:'walk', RUN:'run', FLEE:'flee'};

function spawnSmartNPC(x, z) {
    const skinColors=[[.85,.65,.5],[.7,.5,.38],[.5,.35,.25],[.9,.75,.62]];
  const skin = skinColors[Math.floor(Math.random()*skinColors.length)];
  const mat=new pc.StandardMaterial();
  mat.diffuse.set(...skin); mat.update();

  const shirtMat = new pc.StandardMaterial();
  shirtMat.diffuse.set(Math.random(), Math.random()*.5+.2, Math.random()*.8+.2); shirtMat.update();

  const root = new pc.Entity('NPC_'+npcsAI.length);

  // Body
  const body = new pc.Entity(); body.addComponent('render',{type:'capsule',material:shirtMat,castShadows:true});
  body.setLocalPosition(0,.9,0); body.setLocalScale(.38,1.7,.38); root.addChild(body);
  // Head
  const head = new pc.Entity(); head.addComponent('render',{type:'sphere',material:mat,castShadows:true});
  head.setLocalPosition(0,1.85,0); head.setLocalScale(.32,.32,.32); root.addChild(head);

  root.setLocalPosition(x, 0, z);
  app.root.addChild(root);

  const npc = {
    entity: root,
    x, z,
    tx: x + (Math.random()-.5)*20,
    tz: z + (Math.random()-.5)*20,
    state: NPC_STATES.WALK,
    speed: 1.2 + Math.random()*.8,
    idleTimer: 0,
    stateTimer: 0,
    angle: Math.random()*Math.PI*2,
  };
  npcsAI.push(npc);
  return npc;
}

function npcWalk(dt) {
  if(!playActive) return;
  npcsAI.forEach(npc => {
    if(!npc.entity || !npc.entity.enabled) return;
    npc.stateTimer += dt;

    const dx = carX - npc.x, dz = carZ - npc.z;
    const distToPlayer = Math.hypot(dx, dz);

    // State machine
    if(distToPlayer < 6 && player.wantedLevel > 0) {
      npc.state = NPC_STATES.FLEE;
    } else if(distToPlayer < 4) {
      npc.state = NPC_STATES.RUN;
    } else if(npc.stateTimer > 5) {
      npc.stateTimer = 0;
      npc.state = Math.random() < .3 ? NPC_STATES.IDLE : NPC_STATES.WALK;
      npc.tx = npc.x + (Math.random()-.5)*30;
      npc.tz = npc.z + (Math.random()-.5)*30;
    }

    let moveSpeed = 0;
    if(npc.state === NPC_STATES.WALK)  moveSpeed = npc.speed;
    if(npc.state === NPC_STATES.RUN)   moveSpeed = npc.speed * 2.5;
    if(npc.state === NPC_STATES.FLEE) {
      // Run away from player
      npc.tx = npc.x - dx/distToPlayer*20;
      npc.tz = npc.z - dz/distToPlayer*20;
      moveSpeed = npc.speed * 3;
    }

    if(moveSpeed > 0) {
      const tdx = npc.tx - npc.x, tdz = npc.tz - npc.z;
      const dist = Math.hypot(tdx, tdz);
      if(dist > 1) {
        npc.x += (tdx/dist) * moveSpeed * dt;
        npc.z += (tdz/dist) * moveSpeed * dt;
        npc.angle = Math.atan2(tdx, tdz);
        npc.entity.setLocalPosition(npc.x, 0, npc.z);
        npc.entity.setLocalEulerAngles(0, npc.angle*180/Math.PI, 0);
        // Walk bob
        const bob = Math.sin(Date.now()*.008 * moveSpeed) * 0.04;
        npc.entity.setLocalPosition(npc.x, bob, npc.z);
      } else {
        npc.tx = npc.x + (Math.random()-.5)*25;
        npc.tz = npc.z + (Math.random()-.5)*25;
      }
    }
  });
}

function spawnNPCGroup(count) {
  const cx = edCam.target.x, cz = edCam.target.z;
  for(let i=0;i<(count||5);i++)
    spawnSmartNPC(cx+(Math.random()-.5)*20, cz+(Math.random()-.5)*20);
  showToast('🧍 '+count+' NPCs spawned');
}

// ══════════════════════════════════════════════════════

console.log('[EUG] eug-npc.js loaded');
