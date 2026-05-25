// EUG Blueprint Engine v3

//  EUG BLUEPRINT ENGINE v3 — Unreal-style, GTA features
//  Zero recursion. Iterative queue. Mobile-first.
// ═══════════════════════════════════════════════════════

// ── Category colors ───────────────────────────────────
const BP_CAT_COLORS = {
  Events:   '#3ecf7e',  // green
  Actions:  '#5b8dee',  // blue
  Flow:     '#f5a623',  // orange
  Math:     '#c084fc',  // purple
  Value:    '#5ce0e8',  // cyan
  Get:      '#e8a04f',  // amber
  Set:      '#e05555',  // red
  GTA:      '#ff3c3c',  // bright red — GTA-specific
  HUD:      '#ff9f43',  // yellow-orange
  Physics:  '#a29bfe',  // lavender
  Logic:    '#fd79a8',  // pink
};

// ── Complete node library ────────────────────────────
const BP_NODE_DEFS = {

  // ═══ EVENTS ═══════════════════════════════════════
  onStart:       { label:'▶ On Start',        cat:'Events', ins:[],             outs:['exec'],
                   desc:'Fires once when game starts' },
  onUpdate:      { label:'🔄 On Update',      cat:'Events', ins:[],             outs:['exec','dt'],
                   desc:'Fires every frame. dt = delta time in seconds' },
  onTap:         { label:'👆 On Tap',          cat:'Events', ins:[],             outs:['exec'],
                   desc:'Player taps/clicks this object' },
  onPlayerNear:  { label:'🧍 On Player Near',  cat:'Events', ins:[],             outs:['exec'],
                   value:5, desc:'Fires when player within range (meters)' },
  onPlayerFar:   { label:'🚶 On Player Far',   cat:'Events', ins:[],             outs:['exec'],
                   value:10, desc:'Fires when player leaves range' },
  onOverlapBegin:{ label:'🔲 Overlap Begin',   cat:'Events', ins:[],             outs:['exec'],
                   desc:'Another actor enters this trigger volume' },
  onOverlapEnd:  { label:'🔳 Overlap End',     cat:'Events', ins:[],             outs:['exec'],
                   desc:'Actor leaves this trigger volume' },
  onHit:         { label:'💥 On Hit',          cat:'Events', ins:[],             outs:['exec'],
                   desc:'This object is hit/shot' },
  onDamage:      { label:'❤ On Damage',       cat:'Events', ins:[],             outs:['exec','amount'],
                   desc:'Object receives damage' },
  onTimer:       { label:'⏲ On Timer',        cat:'Events', ins:[],             outs:['exec'],
                   value:2, desc:'Fires every N seconds (looping)' },
  onKeyPress:    { label:'⌨ On Key Press',    cat:'Events', ins:[],             outs:['exec'],
                   value:'E', desc:'Player presses key (E = interact)' },

  // ═══ FLOW CONTROL ══════════════════════════════════
  branch:        { label:'⑂ Branch',          cat:'Flow',   ins:['exec','cond'],outs:['true','false'],
                   desc:'If/else — routes by condition' },
  sequence:      { label:'▤ Sequence',        cat:'Flow',   ins:['exec'],       outs:['0','1','2'],
                   desc:'Runs all outputs in order' },
  forLoop:       { label:'🔁 For Loop',        cat:'Flow',   ins:['exec'],       outs:['body','done'],
                   value:3, desc:'Repeats body N times' },
  doOnce:        { label:'1️⃣ Do Once',         cat:'Flow',   ins:['exec','reset'],outs:['exec'],
                   desc:'Only fires once until reset' },
  delay:         { label:'⏳ Delay',           cat:'Flow',   ins:['exec'],       outs:['exec'],
                   value:1, desc:'Wait N seconds then continue' },
  gate:          { label:'🚪 Gate',            cat:'Flow',   ins:['exec','open','close'],outs:['exec'],
                   desc:'Blocks execution when closed' },
  flipFlop:      { label:'↔ Flip Flop',       cat:'Flow',   ins:['exec'],       outs:['A','B'],
                   desc:'Alternates between A and B' },
  switchInt:     { label:'🔀 Switch (Int)',    cat:'Flow',   ins:['exec','val'], outs:['0','1','2','3'],
                   desc:'Route by integer value 0-3' },

  // ═══ TRANSFORM ACTIONS ════════════════════════════
  playAnim:      { label:'▶ Play Animation',   cat:'Actions', ins:['exec'],      outs:['exec'],
                   value:'', desc:'Play GLB animation clip by name (leave blank for first clip)' },
  stopAnim:      { label:'⏹ Stop Animation',   cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Stop current animation' },
  rotate:        { label:'🔄 Rotate Once',    cat:'Actions', ins:['exec'],      outs:['exec'],
                   values:{x:0,y:90,z:0}, desc:'Rotate by X/Y/Z degrees (once)' },
  spin:          { label:'💫 Spin (Loop)',    cat:'Actions', ins:['exec'],      outs:['exec'],
                   values:{x:0,y:45,z:0}, desc:'Continuous spin at °/sec per axis' },
  stopSpin:      { label:'🛑 Stop Spin',      cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Stop continuous spin animation' },
  moveTo:        { label:'➡ Move To',         cat:'Actions', ins:['exec'],      outs:['exec'],
                   values:{x:0,y:0,z:0}, desc:'Teleport to world position X/Y/Z' },
  moveBy:        { label:'↗ Move By',         cat:'Actions', ins:['exec'],      outs:['exec'],
                   values:{x:0,y:0,z:1}, desc:'Move by offset (local space)' },
  scaleTo:       { label:'⤡ Scale To',        cat:'Actions', ins:['exec','v'],  outs:['exec'],
                   value:1, desc:'Set uniform scale' },
  lookAt:        { label:'👁 Look At Player',  cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Object faces the player' },
  setVisible:    { label:'👀 Set Visible',     cat:'Actions', ins:['exec','v'],  outs:['exec'],
                   value:1, desc:'Show (1) or hide (0) object' },

  // ═══ GTA GAMEPLAY ══════════════════════════════════
  spawnPickup:   { label:'📦 Spawn Pickup',   cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:'health', desc:'Spawn collectible: health/ammo/money/weapon' },
  collectItem:   { label:'⭐ Collect Item',   cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:'money', desc:'Give player: money/health/ammo/weapon' },
  addMoney:      { label:'💰 Add Money',      cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:100, desc:'Add $ to player wallet' },
  addHealth:     { label:'❤ Add Health',     cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:25, desc:'Heal player by amount' },
  dealDamage:    { label:'💢 Deal Damage',    cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:10, desc:'Damage player' },
  addAmmo:       { label:'🔫 Add Ammo',       cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:30, desc:'Give player ammo' },
  giveWeapon:    { label:'🔫 Give Weapon',    cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:'pistol', desc:'Give player weapon: pistol/rifle/shotgun' },
  fireWeapon:    { label:'🎯 Fire Weapon',    cat:'GTA',    ins:['exec'],       outs:['exec'],
                   desc:'NPC fires at player direction' },
  setWanted:     { label:'⭐ Set Wanted',      cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:2, desc:'Set police wanted level (0-5)' },
  spawnCar:      { label:'🚗 Spawn Car',      cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:'sedan', desc:'Spawn vehicle near object' },
  explode:       { label:'💥 Explode',        cat:'GTA',    ins:['exec'],       outs:['exec'],
                   desc:'Explosion effect + damage nearby' },
  startMission:  { label:'📋 Start Mission',  cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:'', desc:'Trigger a named mission' },
  completeMission:{label:'✅ Complete Mission',cat:'GTA',   ins:['exec'],       outs:['exec'],
                   desc:'Mark current mission complete' },
  showObjective: { label:'🎯 Show Objective', cat:'GTA',    ins:['exec'],       outs:['exec'],
                   value:'Reach the marker', desc:'Show mission text on HUD' },

  // ═══ DOOR / BUILDING ═══════════════════════════════
  openDoor:      { label:'🚪 Open Door',      cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Animate door open (rotates Y)' },
  closeDoor:     { label:'🚪 Close Door',     cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Animate door close' },
  toggleDoor:    { label:'🔄 Toggle Door',    cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Open if closed, close if open' },
  enterBuilding: { label:'🏠 Enter Building', cat:'Actions', ins:['exec'],      outs:['exec'],
                   value:'Interior_01', desc:'Teleport player inside named interior' },
  exitBuilding:  { label:'🏃 Exit Building',  cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Teleport player back outside' },
  lockDoor:      { label:'🔒 Lock Door',      cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Prevent door from opening' },

  // ═══ TRIGGER / ZONE ════════════════════════════════
  showPrompt:    { label:'💬 Show Prompt',    cat:'HUD',    ins:['exec'],       outs:['exec'],
                   value:'Press E', desc:'Show interaction prompt to player' },
  hidePrompt:    { label:'🔕 Hide Prompt',    cat:'HUD',    ins:['exec'],       outs:['exec'],
                   desc:'Remove interaction prompt' },
  showHUDText:   { label:'📝 HUD Text',       cat:'HUD',    ins:['exec'],       outs:['exec'],
                   value:'Hello!', desc:'Show text on screen (3 seconds)' },
  showHUDIcon:   { label:'🖼 HUD Icon',       cat:'HUD',    ins:['exec'],       outs:['exec'],
                   value:'⭐', desc:'Flash icon on HUD' },
  addHUDButton:  { label:'🔘 Add HUD Button', cat:'HUD',    ins:['exec'],       outs:['exec','pressed'],
                   value:'Action', desc:'Add touchscreen button. Pressed fires exec' },
  removeHUDButton:{label:'✖ Remove Button',  cat:'HUD',    ins:['exec'],       outs:['exec'],
                   value:'Action', desc:'Remove named HUD button' },
  showMinimap:   { label:'🗺 Marker',         cat:'HUD',    ins:['exec'],       outs:['exec'],
                   desc:'Place blip on minimap at this object' },
  hideMinimap:   { label:'🗺 Remove Marker',  cat:'HUD',    ins:['exec'],       outs:['exec'],
                   desc:'Remove minimap marker' },
  fadeScreen:    { label:'⬛ Fade Screen',    cat:'HUD',    ins:['exec'],       outs:['exec'],
                   value:1, desc:'Fade in(1) or out(0) screen' },

  // ═══ PHYSICS ═══════════════════════════════════════
  addImpulse:    { label:'💨 Add Impulse',    cat:'Physics', ins:['exec'],      outs:['exec'],
                   values:{x:0,y:500,z:0}, desc:'Apply instant force' },
  enablePhysics: { label:'⚙ Enable Physics', cat:'Physics', ins:['exec','v'],  outs:['exec'],
                   value:1, desc:'Enable(1) or disable(0) physics' },
  setGravity:    { label:'⬇ Set Gravity',    cat:'Physics', ins:['exec'],      outs:['exec'],
                   value:-9.8, desc:'Override gravity for this object' },
  ragdoll:       { label:'🪆 Ragdoll',        cat:'Physics', ins:['exec'],      outs:['exec'],
                   desc:'Make NPC ragdoll on death' },

  // ═══ GET VALUES ════════════════════════════════════
  number:        { label:'🔢 Number',         cat:'Value',  ins:[],             outs:['value'],
                   value:0, desc:'Constant number value' },
  string:        { label:'📝 String',         cat:'Value',  ins:[],             outs:['value'],
                   value:'text', desc:'Constant text value' },
  getPos:        { label:'📍 Get Position',   cat:'Get',    ins:[],             outs:['x','y','z'],
                   desc:'World position of this object' },
  getPlayerPos:  { label:'👤 Player Pos',     cat:'Get',    ins:[],             outs:['x','y','z'],
                   desc:'Current player world position' },
  getDist:       { label:'📏 Distance',       cat:'Get',    ins:[],             outs:['value'],
                   desc:'Distance from this object to player' },
  getTime:       { label:'⏱ Time',           cat:'Get',    ins:[],             outs:['value'],
                   desc:'Total game time in seconds' },
  getHealth:     { label:'❤ Player HP',      cat:'Get',    ins:[],             outs:['value'],
                   desc:'Current player health 0-100' },
  getMoney:      { label:'💰 Player Money',   cat:'Get',    ins:[],             outs:['value'],
                   desc:'Current player money' },
  getSpeed:      { label:'💨 Car Speed',      cat:'Get',    ins:[],             outs:['value'],
                   desc:'Car speed in km/h' },
  getVar:        { label:'📦 Get Variable',   cat:'Get',    ins:[],             outs:['value'],
                   value:'myVar', desc:'Read a stored variable by name' },
  getRandom:     { label:'🎲 Random',         cat:'Get',    ins:[],             outs:['value'],
                   values:{min:0,max:100}, desc:'Random number between min and max' },
  getBool:       { label:'✓ Boolean',         cat:'Get',    ins:[],             outs:['value'],
                   value:1, desc:'True(1) or False(0)' },

  // ═══ SET / COMPARE ════════════════════════════════
  setVar:        { label:'📦 Set Variable',   cat:'Set',    ins:['exec'],       outs:['exec'],
                   values:{name:'myVar',val:0}, desc:'Store value in named variable' },
  setPos:        { label:'📌 Set Position',   cat:'Set',    ins:['exec'],       outs:['exec'],
                   values:{x:0,y:0,z:0}, desc:'Teleport object to position' },
  compare:       { label:'⚖ Compare',        cat:'Logic',  ins:['a','b'],      outs:['==','!=','>','<'],
                   desc:'Compare two numbers — routes to matching output' },
  mathAdd:       { label:'➕ Add',            cat:'Math',   ins:['a','b'],      outs:['result'] },
  mathSub:       { label:'➖ Subtract',       cat:'Math',   ins:['a','b'],      outs:['result'] },
  mathMul:       { label:'✖ Multiply',       cat:'Math',   ins:['a','b'],      outs:['result'] },
  mathDiv:       { label:'➗ Divide',         cat:'Math',   ins:['a','b'],      outs:['result'] },
  mathClamp:     { label:'📐 Clamp',          cat:'Math',   ins:['val','min','max'],outs:['result'] },
  mathLerp:      { label:'〰 Lerp',           cat:'Math',   ins:['a','b','t'],  outs:['result'] },
  mathSin:       { label:'sin',               cat:'Math',   ins:['in'],         outs:['out'] },
  mathAbs:       { label:'|x| Abs',           cat:'Math',   ins:['in'],         outs:['out'] },
  mathNot:       { label:'NOT',               cat:'Logic',  ins:['in'],         outs:['out'] },
  mathAnd:       { label:'AND',               cat:'Logic',  ins:['a','b'],      outs:['out'] },
  mathOr:        { label:'OR',                cat:'Logic',  ins:['a','b'],      outs:['out'] },
  printLog:      { label:'🖨 Print Log',      cat:'Logic',  ins:['exec'],       outs:['exec'],
                   value:'debug', desc:'Print message (dev only)' },

  // ═══ PLAYER OVERRIDE ═══════════════════════════════
  setPlayerSpeed:{ label:'🏃 Set Speed',      cat:'Player', ins:['exec','v'],  outs:['exec'],
                   value:5, desc:'Override player movement speed (m/s)' },
  setRotSens:    { label:'🔄 Rot Sensitivity',cat:'Player', ins:['exec','v'],  outs:['exec'],
                   value:12, desc:'Override rotation sensitivity' },
  freezePlayer:  { label:'🧊 Freeze Player',  cat:'Player', ins:['exec','v'],  outs:['exec'],
                   value:1, desc:'Freeze(1) or unfreeze(0) player movement' },
  teleportPlayer:{ label:'🚀 Teleport Player',cat:'Player', ins:['exec'],      outs:['exec'],
                   values:{x:0,z:0}, desc:'Move player to world X/Z position' },

  // ═══ BULLET OVERRIDE ══════════════════════════════
  shootBullet:   { label:'🔴 Shoot Bullet',   cat:'Bullet', ins:['exec'],      outs:['exec'],
                   desc:'Fire a bullet from player position' },
  setBulletSpeed:{ label:'💨 Bullet Speed',   cat:'Bullet', ins:['exec','v'],  outs:['exec'],
                   value:22, desc:'Override bullet speed (m/s)' },
  setBulletDamage:{label:'💢 Bullet Damage',  cat:'Bullet', ins:['exec','v'],  outs:['exec'],
                   value:10, desc:'Override bullet damage value' },
  setBulletBounce:{label:'🏀 Bullet Bounce',  cat:'Bullet', ins:['exec','v'],  outs:['exec'],
                   value:0.55, desc:'Set bounciness (0=no bounce, 1=perfect)' },
  setBulletGravity:{label:'⬇ Bullet Gravity', cat:'Bullet', ins:['exec','v'],  outs:['exec'],
                   value:14, desc:'Set bullet gravity pull' },
  setBulletColor:{ label:'🎨 Bullet Color',   cat:'Bullet', ins:['exec'],      outs:['exec'],
                   values:{r:1,g:0.08,b:0.08}, desc:'Set bullet RGB color (0-1)' },
  onBulletHit:   { label:'💥 On Bullet Hit',  cat:'Events', ins:[],            outs:['exec'],
                   desc:'Fires when a bullet hits this object' },

  // ═══ ENTITY CONTROL ══════════════════════════════
  destroySelf:   { label:'💀 Destroy Self',   cat:'Entity', ins:['exec'],      outs:[],
                   desc:'Remove this entity from the scene' },
  setColor:      { label:'🎨 Set Color',      cat:'Entity', ins:['exec'],      outs:['exec'],
                   values:{r:1,g:0,b:0}, desc:'Change object color (RGB 0-1)' },
  setScale:      { label:'⤡ Set Scale',       cat:'Entity', ins:['exec','v'],  outs:['exec'],
                   value:1, desc:'Set uniform scale' },
  setPosition:   { label:'📌 Set Position',   cat:'Entity', ins:['exec'],      outs:['exec'],
                   values:{x:0,y:0,z:0}, desc:'Teleport object to world position' },
  spawnProp:     { label:'📦 Spawn Prop',     cat:'Entity', ins:['exec'],      outs:['exec'],
                   value:'sphere', desc:'Spawn sphere/box/cone near this object. values.life=seconds' },

  // ═══ CAMERA OVERRIDE ══════════════════════════════
  setCamDistance:{ label:'📷 Cam Distance',   cat:'Camera', ins:['exec','v'],  outs:['exec'],
                   value:6, desc:'Override camera distance from player' },
  setCamFOV:     { label:'🎥 Cam FOV',        cat:'Camera', ins:['exec','v'],  outs:['exec'],
                   value:75, desc:'Override camera field of view' },
  shakeCamera:   { label:'📳 Shake Camera',   cat:'Camera', ins:['exec'],      outs:['exec'],
                   value:0.3, desc:'Camera shake intensity. Duration: ~0.3s' },

  // ═══ GET — new values ═════════════════════════════
  getPlayerX:    { label:'👤 Player X',       cat:'Get',    ins:[],            outs:['value'],
                   desc:'Player world X position' },
  getPlayerZ:    { label:'👤 Player Z',       cat:'Get',    ins:[],            outs:['value'],
                   desc:'Player world Z position' },
  getBulletSpeed:{ label:'🔴 Bullet Speed',   cat:'Get',    ins:[],            outs:['value'],
                   desc:'Current bullet speed setting' },
  getBulletDmg:  { label:'💢 Bullet Damage',  cat:'Get',    ins:[],            outs:['value'],
                   desc:'Current bullet damage setting' },

  // ═══ VEHICLE ══════════════════════════════════════
  enterVehicle:  { label:'🚗 Enter Vehicle',  cat:'Vehicle', ins:['exec'],     outs:['exec'],
                   value:'', desc:'Player enters nearest vehicle or named vehicle' },
  exitVehicle:   { label:'🚶 Exit Vehicle',   cat:'Vehicle', ins:['exec'],     outs:['exec'],
                   desc:'Player exits current vehicle' },
  setVehicleSpeed:{label:'🏎 Vehicle Speed',  cat:'Vehicle', ins:['exec','v'], outs:['exec'],
                   value:30, desc:'Override vehicle max speed' },
  explodeVehicle:{ label:'💥 Explode Vehicle',cat:'Vehicle', ins:['exec'],     outs:['exec'],
                   desc:'Explode the nearest vehicle' },
  lockVehicle:   { label:'🔒 Lock Vehicle',   cat:'Vehicle', ins:['exec','v'], outs:['exec'],
                   value:1, desc:'Lock(1) or unlock(0) nearest vehicle' },
  onEnterVehicle:{ label:'🚗 On Enter Vehicle',cat:'Events', ins:[],           outs:['exec'],
                   desc:'Fires when player enters any vehicle' },
  onExitVehicle: { label:'🚶 On Exit Vehicle', cat:'Events', ins:[],           outs:['exec'],
                   desc:'Fires when player exits a vehicle' },

  // ═══ COMBAT / INTERACTION ═════════════════════════
  selectWeapon:  { label:'🔫 Select Weapon',  cat:'Combat', ins:['exec'],      outs:['exec'],
                   value:'pistol', desc:'Switch to weapon: pistol/rifle/shotgun/sniper/grenade/bomb/fists' },
  addWeapon:     { label:'🎁 Give Weapon',    cat:'Combat', ins:['exec'],      outs:['exec'],
                   value:'rifle', desc:'Add weapon to player inventory with ammo' },
  setAmmo:       { label:'🔢 Set Ammo',       cat:'Combat', ins:['exec','v'],  outs:['exec'],
                   value:30, desc:'Set ammo count for current weapon' },
  shootFromHere: { label:'💥 Shoot From Here',cat:'Combat', ins:['exec'],      outs:['exec'],
                   desc:'Fire bullet from this object toward player' },
  meleeAttack:   { label:'👊 Melee Attack',   cat:'Combat', ins:['exec'],      outs:['exec'],
                   desc:'Player punches / melee in current direction' },
  onShoot:       { label:'🔫 On Shoot',       cat:'Events', ins:[],            outs:['exec'],
                   desc:'Fires whenever player shoots' },
  onMelee:       { label:'👊 On Melee',       cat:'Events', ins:[],            outs:['exec'],
                   desc:'Fires when player punches' },
  onPlayerDead:  { label:'💀 On Player Dead', cat:'Events', ins:[],            outs:['exec'],
                   desc:'Fires when player health reaches 0' },
  onHealthLow:   { label:'❤ On Health Low',  cat:'Events', ins:[],            outs:['exec'],
                   value:30, desc:'Fires when health drops below threshold' },

  // ═══ MISSION / OBJECTIVE ══════════════════════════
  startTimer:    { label:'⏱ Start Timer',    cat:'Mission', ins:['exec'],      outs:['exec'],
                   value:60, desc:'Start countdown timer (seconds). Negative = countup' },
  stopTimer:     { label:'⏹ Stop Timer',     cat:'Mission', ins:['exec'],      outs:['exec'],
                   desc:'Stop the mission timer' },
  addTime:       { label:'➕ Add Time',       cat:'Mission', ins:['exec','v'],  outs:['exec'],
                   value:10, desc:'Add seconds to current timer' },
  setObjective:  { label:'🎯 Set Objective',  cat:'Mission', ins:['exec'],      outs:['exec'],
                   value:'Reach the waypoint', desc:'Show objective text on screen' },
  clearObjective:{ label:'✖ Clear Objective', cat:'Mission', ins:['exec'],      outs:['exec'],
                   desc:'Hide objective text' },
  addScore:      { label:'🏆 Add Score',      cat:'Mission', ins:['exec','v'],  outs:['exec'],
                   value:100, desc:'Add to player score counter' },
  addKill:       { label:'💀 Add Kill',       cat:'Mission', ins:['exec'],      outs:['exec'],
                   desc:'Increment kill counter by 1' },
  onTimerExpired:{ label:'⏱ On Timer End',   cat:'Events',  ins:[],            outs:['exec'],
                   desc:'Fires when countdown timer reaches zero' },
  missionFail:   { label:'❌ Mission Fail',   cat:'Mission', ins:['exec'],      outs:['exec'],
                   value:'Mission Failed', desc:'Trigger mission fail screen' },
  missionWin:    { label:'✅ Mission Win',    cat:'Mission', ins:['exec'],      outs:['exec'],
                   value:'Mission Complete!', desc:'Trigger win screen + bonus money' },
  setCheckpoint: { label:'📍 Set Checkpoint', cat:'Mission', ins:['exec'],      outs:['exec'],
                   values:{x:0,z:0}, desc:'Place checkpoint marker at X/Z' },
  onCheckpoint:  { label:'📍 On Checkpoint',  cat:'Events',  ins:[],            outs:['exec'],
                   desc:'Fires when player reaches checkpoint' },
  respawnPlayer: { label:'🏥 Respawn Player', cat:'Mission', ins:['exec'],      outs:['exec'],
                   desc:'Respawn player at full health' },

  // ═══ BOMB / EXPLOSIVE ═════════════════════════════
  plantBomb:     { label:'💣 Plant Bomb',     cat:'Bomb',   ins:['exec'],       outs:['exec'],
                   value:'timer', desc:'Plant bomb at player position. value: timer|remote' },
  plantBombTimer:{ label:'⏱ Timed Bomb',     cat:'Bomb',   ins:['exec'],       outs:['exec'],
                   value:10, desc:'Plant timer bomb with N second fuse' },
  detonateBombs: { label:'💥 Detonate',       cat:'Bomb',   ins:['exec'],       outs:['exec'],
                   desc:'Detonate all remote bombs' },
  showDetonator: { label:'📱 Show Detonator', cat:'Bomb',   ins:['exec'],       outs:['exec'],
                   desc:'Show/hide the remote detonator button' },
  onBombPlanted: { label:'💣 On Bomb Planted',cat:'Events', ins:[],             outs:['exec'],
                   desc:'Fires when a bomb is planted' },
  onExplosion:   { label:'💥 On Explosion',   cat:'Events', ins:[],             outs:['exec'],
                   desc:'Fires on any explosion' },

  // ═══ DOOR / INTERACTION ═══════════════════════════
  openDoor:      { label:'🚪 Open Door',      cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Animate door open (rotate Y 90°)' },
  closeDoor:     { label:'🚪 Close Door',     cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Animate door close' },
  toggleDoor:    { label:'🔄 Toggle Door',    cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Open if closed, close if open' },
  lockDoor:      { label:'🔒 Lock Door',      cat:'Actions', ins:['exec'],      outs:['exec'],
                   desc:'Prevent door from opening' },
  showInteract:  { label:'💬 Show [E] Prompt',cat:'Actions', ins:['exec'],      outs:['exec'],
                   value:'Press to interact', desc:'Show interaction prompt when player is near' },
  onInteract:    { label:'🖐 On Interact',    cat:'Events',  ins:[],            outs:['exec'],
                   desc:'Fires when player taps interact / enter near this object' },
};

// ── Pin colors ─────────────────────────────────────
const BP_PIN_EXEC  = '#3ecf7e';
const BP_PIN_FLOAT = '#5b8dee';
const BP_PIN_BOOL  = '#f5a623';
const BP_PIN_STR   = '#ff7eb3';
const EXEC_PINS = new Set(['exec','0','1','2','3','A','B','true','false','body','done','pressed']);

function bpPinColor(pin) {
  if (EXEC_PINS.has(pin)) return BP_PIN_EXEC;
  if (pin==='cond') return BP_PIN_BOOL;
  if (pin==='text'||pin==='v') return BP_PIN_STR;
  return BP_PIN_FLOAT;
}

// ── Editor state (single object, no closures) ──────
const BP = {
  name:null, zoom:1, panX:40, panY:40,
  sel: new Set(),
  drag:null, wire:null, boxSel:null, isPanning:false,
  undoStack:[], clipboard:[],
  panMode: false,   // when true — drag pans canvas, no node interaction
  _panStartX:0, _panStartY:0, _panStartPX:0, _panStartPY:0,
  _pendingDrag: null,  // drag not yet activated until finger moves 8px
};
const BP_NW  = 185;  // node width world units
const BP_PIN_R = 7;  // pin radius world units
let _bpRenderBusy = false;
let bpOverlayEnt  = null;
// runtime state for HUD buttons added by blueprint
let _bpHUDButtons = {};
// door state per entity
let _bpDoorState = {};
// doOnce fired state
let _bpDoOnceFired = {};
// gate state
let _bpGateOpen = {};
// flipflop state
let _bpFlipFlop = {};

// ── World ↔ screen ─────────────────────────────────
function bpW2S(wx,wy){return{x:wx*BP.zoom+BP.panX, y:wy*BP.zoom+BP.panY};}
function bpS2W(sx,sy){return{x:(sx-BP.panX)/BP.zoom, y:(sy-BP.panY)/BP.zoom};}

// ── Node height ────────────────────────────────────
function bpNodeH(node){
  const def=BP_NODE_DEFS[node.type]||{ins:[],outs:[]};
  const pinRows=Math.max(def.ins.length,def.outs.length)||0;
  const hasVal=node.value!==undefined;
  const valRows=(node.values&&typeof node.values==='object')?Object.keys(node.values).length:0;
  if(valRows>0) return 28+valRows*18+pinRows*18+(hasVal?18:4)+4;
  return 28+pinRows*22+(hasVal?20:4);
}

// ── Hit testing ────────────────────────────────────
function bpHitPin(cx,cy,name){
  const bp=blueprints[name];if(!bp)return null;
  const hitR=BP_PIN_R*3.5;
  for(const node of bp.nodes){
    const def=BP_NODE_DEFS[node.type]||{ins:[],outs:[]};
    const NH=bpNodeH(node);
    def.ins.forEach((pin,i)=>{
      const {x,y}=bpW2S(node.x, node.y+28+i*22);
      if(Math.hypot(cx-x,cy-y)<hitR*BP.zoom)
        bpHitPin._r={nodeId:node.id,pin,isOut:false,wx:node.x,wy:node.y+28+i*22};
    });
    def.outs.forEach((pin,i)=>{
      const {x,y}=bpW2S(node.x+BP_NW, node.y+28+i*22);
      if(Math.hypot(cx-x,cy-y)<hitR*BP.zoom)
        bpHitPin._r={nodeId:node.id,pin,isOut:true,wx:node.x+BP_NW,wy:node.y+28+i*22};
    });
  }
  const r=bpHitPin._r;bpHitPin._r=null;return r;
}
bpHitPin._r=null;

function bpHitNode(cx,cy,name){
  const bp=blueprints[name];if(!bp)return null;
  for(let i=bp.nodes.length-1;i>=0;i--){
    const n=bp.nodes[i];
    const{x:sx,y:sy}=bpW2S(n.x,n.y);
    const sw=BP_NW*BP.zoom,sh=bpNodeH(n)*BP.zoom;
    if(cx>=sx&&cx<=sx+sw&&cy>=sy&&cy<=sy+sh)return n;
  }
  return null;
}

// ── Render ─────────────────────────────────────────
function bpRender(name){
  if(_bpRenderBusy)return;
  _bpRenderBusy=true;
  try{_bpRenderInner(name);}finally{_bpRenderBusy=false;}
}
function _bpRenderInner(name){
  const canvas=document.getElementById('bp-canvas');if(!canvas)return;
  const W=canvas.width=canvas.offsetWidth||window.innerWidth;
  const H=canvas.height=canvas.offsetHeight||(window.innerHeight-100);
  const ctx=canvas.getContext('2d');
  const bp=blueprints[name]||{nodes:[],connections:[]};
  // BG
  ctx.fillStyle='#0b0b16';ctx.fillRect(0,0,W,H);
  // Dot grid
  const gs=24*BP.zoom;
  const ox=BP.panX%gs,oy=BP.panY%gs;
  for(let x=ox;x<W;x+=gs)for(let y=oy;y<H;y+=gs){
    ctx.fillStyle='rgba(255,255,255,.06)';
    ctx.fillRect(x,y,1.5,1.5);
  }
  // Large grid
  const gs2=120*BP.zoom,ox2=BP.panX%gs2,oy2=BP.panY%gs2;
  ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;
  for(let x=ox2;x<W;x+=gs2){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=oy2;y<H;y+=gs2){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  // Wires
  bp.connections.forEach(conn=>_bpDrawWire(ctx,conn,bp));
  // Live wire
  if(BP.wire){
    const fn=bp.nodes.find(n=>n.id===BP.wire.fromId);
    if(fn){
      const def=BP_NODE_DEFS[fn.type]||{outs:[]};
      const fi=def.outs.indexOf(BP.wire.fromPin);
      if(fi>=0){
        const p1=bpW2S(fn.x+BP_NW,fn.y+28+fi*22);
        const col=bpPinColor(BP.wire.fromPin);
        ctx.strokeStyle=col;ctx.lineWidth=2;
        ctx.setLineDash([6,4]);ctx.shadowColor=col;ctx.shadowBlur=8;
        ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(BP.wire.mx,BP.wire.my);
        ctx.stroke();ctx.setLineDash([]);ctx.shadowBlur=0;
      }
    }
  }
  // Nodes
  bp.nodes.forEach(n=>_bpDrawNode(ctx,n));
  // Box select
  if(BP.boxSel){
    const{x0,y0,x1,y1}=BP.boxSel;
    const bx=Math.min(x0,x1),by=Math.min(y0,y1),bw=Math.abs(x1-x0),bh=Math.abs(y1-y0);
    ctx.fillStyle='rgba(91,141,238,.08)';ctx.fillRect(bx,by,bw,bh);
    ctx.strokeStyle='rgba(91,141,238,.7)';ctx.lineWidth=1.5;
    ctx.setLineDash([4,3]);ctx.strokeRect(bx,by,bw,bh);ctx.setLineDash([]);
  }
  // Zoom %
  ctx.fillStyle='rgba(255,255,255,.2)';ctx.font='10px system-ui';ctx.textAlign='right';ctx.textBaseline='alphabetic';
  ctx.fillText(Math.round(BP.zoom*100)+'%',W-8,H-8);
}
function _bpDrawWire(ctx,conn,bp){
  const fn=bp.nodes.find(n=>n.id===conn.from);
  const tn=bp.nodes.find(n=>n.id===conn.to);
  if(!fn||!tn)return;
  const fDef=BP_NODE_DEFS[fn.type]||{outs:[]};
  const tDef=BP_NODE_DEFS[tn.type]||{ins:[]};
  const fi=fDef.outs.indexOf(conn.fromPin);
  const ti=tDef.ins.indexOf(conn.toPin);
  if(fi<0||ti<0)return;
  const p1=bpW2S(fn.x+BP_NW,fn.y+28+fi*22);
  const p2=bpW2S(tn.x,tn.y+28+ti*22);
  const col=bpPinColor(conn.fromPin);
  const cx2=Math.max(60*BP.zoom,Math.abs(p2.x-p1.x)*0.5);
  ctx.strokeStyle=col;ctx.lineWidth=2*BP.zoom;
  ctx.shadowColor=col;ctx.shadowBlur=5;
  ctx.beginPath();ctx.moveTo(p1.x,p1.y);
  ctx.bezierCurveTo(p1.x+cx2,p1.y,p2.x-cx2,p2.y,p2.x,p2.y);
  ctx.stroke();ctx.shadowBlur=0;
  // Arrow at midpoint
  const mx=(p1.x+p2.x)/2,my=(p1.y+p2.y)/2;
  const ang=Math.atan2(p2.y-p1.y,p2.x-p1.x);
  ctx.fillStyle=col;
  ctx.beginPath();
  ctx.moveTo(mx+Math.cos(ang)*6,my+Math.sin(ang)*6);
  ctx.lineTo(mx+Math.cos(ang+2.4)*5,my+Math.sin(ang+2.4)*5);
  ctx.lineTo(mx+Math.cos(ang-2.4)*5,my+Math.sin(ang-2.4)*5);
  ctx.closePath();ctx.fill();
}
function _bpDrawNode(ctx,node){
  const def=BP_NODE_DEFS[node.type]||{label:node.type,ins:[],outs:[],cat:'Other'};
  const NH=bpNodeH(node);
  const{x:sx,y:sy}=bpW2S(node.x,node.y);
  const sw=BP_NW*BP.zoom,sh=NH*BP.zoom;
  const isSel=BP.sel.has(node.id);
  const r=6*BP.zoom,hh=24*BP.zoom;
  // Body
  ctx.shadowColor=isSel?'#5b8dee':'rgba(0,0,0,.6)';
  ctx.shadowBlur=isSel?20:8;
  ctx.fillStyle=isSel?'#1e203a':'#161626';
  _bpRR(ctx,sx,sy,sw,sh,r);ctx.fill();ctx.shadowBlur=0;
  ctx.strokeStyle=isSel?'#5b8dee':'#2a2a40';
  ctx.lineWidth=isSel?2:1;
  _bpRR(ctx,sx,sy,sw,sh,r);ctx.stroke();
  // Header
  const hcol=BP_CAT_COLORS[def.cat]||'#5b8dee';
  ctx.fillStyle=hcol+'cc';
  _bpRRT(ctx,sx,sy,sw,hh,r);ctx.fill();
  // Title
  const fs=Math.max(8,Math.min(11,10*BP.zoom));
  ctx.fillStyle='#fff';ctx.font=`bold ${fs}px system-ui`;
  ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText(def.label.slice(0,Math.floor(sw/(fs*0.62))),sx+7*BP.zoom,sy+hh/2);
  // Single value
  if(node.value!==undefined&&(!node.values)){
    const vy=sy+hh+2*BP.zoom;
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(sx+4*BP.zoom,vy,sw-8*BP.zoom,14*BP.zoom);
    ctx.fillStyle='rgba(255,255,255,.7)';ctx.font=`${Math.max(7,9*BP.zoom)}px monospace`;
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(String(node.value).slice(0,20),sx+sw/2,vy+7*BP.zoom);
  }
  // Values object (x/y/z) shown inline
  if(node.values&&typeof node.values==='object'){
    const axCol={x:'#e05555',y:'#3ecf7e',z:'#5b8dee',name:'#c084fc',val:'#f5a623',min:'#5ce0e8',max:'#ff9f43'};
    const keys=Object.keys(node.values);
    const rowH=18*BP.zoom;
    const vy0=sy+hh+2*BP.zoom;
    keys.forEach((k,i)=>{
      const vy=vy0+i*rowH;
      const col=axCol[k]||'#aaa';
      ctx.fillStyle=col;ctx.font=`bold ${Math.max(7,8*BP.zoom)}px system-ui`;
      ctx.textAlign='left';ctx.textBaseline='middle';
      ctx.fillText(k.toUpperCase(),sx+8*BP.zoom,vy+rowH/2);
      ctx.fillStyle='rgba(255,255,255,.8)';ctx.font=`${Math.max(7,8*BP.zoom)}px monospace`;
      ctx.textAlign='right';
      ctx.fillText(String(node.values[k]??0),sx+sw-8*BP.zoom,vy+rowH/2);
      if(i<keys.length-1){
        ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(sx+4*BP.zoom,vy+rowH);ctx.lineTo(sx+sw-4*BP.zoom,vy+rowH);ctx.stroke();
      }
    });
  }
  // Pins
  const pR=BP_PIN_R*BP.zoom;
  const pFont=Math.max(7,8*BP.zoom);
  const valOffset=(node.values?Object.keys(node.values).length:0)*18;
  ctx.textBaseline='middle';
  def.ins.forEach((pin,i)=>{
    const{x:px,y:py}=bpW2S(node.x,node.y+28+i*22);
    const col=bpPinColor(pin);
    ctx.fillStyle=col;ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1;
    ctx.shadowColor=col;ctx.shadowBlur=5;
    EXEC_PINS.has(pin)?_bpArrow(ctx,px,py,pR):(ctx.beginPath(),ctx.arc(px,py,pR,0,Math.PI*2));
    ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    if(BP.zoom>0.45){
      ctx.fillStyle='rgba(210,210,240,.8)';ctx.font=`${pFont}px system-ui`;ctx.textAlign='left';
      ctx.fillText(pin,px+pR+3*BP.zoom,py);
    }
  });
  def.outs.forEach((pin,i)=>{
    const{x:px,y:py}=bpW2S(node.x+BP_NW,node.y+28+i*22);
    const col=bpPinColor(pin);
    ctx.fillStyle=col;ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1;
    ctx.shadowColor=col;ctx.shadowBlur=5;
    EXEC_PINS.has(pin)?_bpArrow(ctx,px,py,pR):(ctx.beginPath(),ctx.arc(px,py,pR,0,Math.PI*2));
    ctx.fill();ctx.stroke();ctx.shadowBlur=0;
    if(BP.zoom>0.45){
      ctx.fillStyle='rgba(210,210,240,.8)';ctx.font=`${pFont}px system-ui`;ctx.textAlign='right';
      ctx.fillText(pin,px-pR-3*BP.zoom,py);
    }
  });
}
function _bpRR(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}
function _bpRRT(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}
function _bpArrow(ctx,cx,cy,r){
  ctx.beginPath();ctx.moveTo(cx-r,cy-r);ctx.lineTo(cx+r,cy);ctx.lineTo(cx-r,cy+r);ctx.closePath();
}

// ── Open/Close ─────────────────────────────────────
function openBlueprintEditor(ent){
  bpOverlayEnt=ent||selectedEntity;
  if(!bpOverlayEnt){showToast('Select an object first');return;}
  const name=bpOverlayEnt.name;
  if(!blueprints[name])blueprints[name]={nodes:[],connections:[]};
  BP.name=name;BP.zoom=1;BP.panX=40;BP.panY=40;
  BP.sel.clear();BP.drag=null;BP.wire=null;BP.boxSel=null;

  const existing=document.getElementById('bp-overlay');if(existing)existing.remove();
  const ov=document.createElement('div');
  ov.id='bp-overlay';
  ov.style.cssText='position:fixed;inset:0;background:#0b0b16;z-index:950;display:flex;flex-direction:column;';
  document.body.appendChild(ov);

  // Header
  const hdr=document.createElement('div');
  hdr.style.cssText='display:flex;align-items:center;padding:8px 10px;background:#10101c;border-bottom:1px solid #2a2a3e;gap:5px;flex-shrink:0;flex-wrap:wrap;';
  ov.appendChild(hdr);

  const ttl=document.createElement('span');
  ttl.style.cssText='font-size:12px;font-weight:800;color:#5b8dee;margin-right:auto;min-width:60px;';
  ttl.textContent='📐 '+name;hdr.appendChild(ttl);

  function mkB(label,bg,fn){
    const b=document.createElement('div');
    b.style.cssText=`padding:8px 11px;background:${bg};color:#fff;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation;user-select:none;white-space:nowrap;`;
    b.textContent=label;
    b.addEventListener('click',fn);
    b.addEventListener('touchend',e=>{e.preventDefault();fn();});
    hdr.appendChild(b);return b;
  }
  mkB('▶ Run','#3ecf7e',()=>bpRun(name));
  mkB('+ Node','#5b8dee',()=>bpShowPicker(name));
  mkB('🗑 Del','#e05555',()=>bpDeleteSelected(name));
  mkB('F Frame','#2a2a4e',()=>bpFrameAll(name));
  mkB('↩ Undo','#2a2a4e',()=>bpUndo(name));
  // Pan mode toggle — when ON, drag pans canvas instead of moving nodes
  const panBtn = mkB('✋ Pan','#2a2a4e',()=>{
    BP.panMode = !BP.panMode;
    panBtn.style.background = BP.panMode ? '#5b8dee' : '#2a2a4e';
    panBtn.textContent = BP.panMode ? '✋ PAN ON' : '✋ Pan';
    const cv = document.getElementById('bp-canvas');
    if(cv) cv.style.cursor = BP.panMode ? 'grab' : 'default';
  });
  mkB('🗑 Wires','#443344',()=>{bpSaveUndo(name);blueprints[name].connections=[];bpRender(name);showToast('Wires cleared');});
  mkB('✕','#222',()=>closeBlueprintEditor());

  // Canvas
  const canvas=document.createElement('canvas');
  canvas.id='bp-canvas';
  canvas.style.cssText='display:block;flex:1;min-height:0;touch-action:none;cursor:default;';
  ov.appendChild(canvas);

  // Status bar
  const sb=document.createElement('div');
  sb.id='bp-status';
  sb.style.cssText='padding:4px 12px;background:#10101c;border-top:1px solid #2a2a3e;font-size:9px;color:#5050a0;flex-shrink:0;';
  sb.textContent='Tap=select • Drag=move • Tap ● output pin → tap ● input to wire • Pinch=zoom • Del=delete • Ctrl+A=all';
  ov.appendChild(sb);

  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    const rc=canvas.getBoundingClientRect();
    canvas.width=Math.round(rc.width)||window.innerWidth;
    canvas.height=Math.round(rc.height)||(window.innerHeight-100);
    bpRender(name);
    _bpBindEvents(canvas,name);
  }));
}
function closeBlueprintEditor(){
  const o=document.getElementById('bp-overlay');if(o)o.remove();
  BP.name=null;bpOverlayEnt=null;
  // Clean up HUD buttons added by blueprints
  Object.keys(_bpHUDButtons).forEach(k=>{ try{_bpHUDButtons[k].remove();}catch(e){} });
  _bpHUDButtons={};
}

// ── Undo ───────────────────────────────────────────
function bpSaveUndo(name){
  if(!blueprints[name])return;
  BP.undoStack.push(JSON.stringify(blueprints[name]));
  if(BP.undoStack.length>20)BP.undoStack.shift();
}
function bpUndo(name){
  if(!BP.undoStack.length){showToast('Nothing to undo');return;}
  blueprints[name]=JSON.parse(BP.undoStack.pop());
  bpRender(name);showToast('↩ Undone');
}

// ── Frame all nodes ────────────────────────────────
function bpFrameAll(name){
  const bp=blueprints[name];if(!bp||!bp.nodes.length)return;
  const canvas=document.getElementById('bp-canvas');if(!canvas)return;
  const W=canvas.width,H=canvas.height;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  bp.nodes.forEach(n=>{
    minX=Math.min(minX,n.x);minY=Math.min(minY,n.y);
    maxX=Math.max(maxX,n.x+BP_NW);maxY=Math.max(maxY,n.y+bpNodeH(n));
  });
  const pad=60;
  const scaleX=(W-pad*2)/Math.max(maxX-minX,1);
  const scaleY=(H-pad*2)/Math.max(maxY-minY,1);
  BP.zoom=Math.max(0.2,Math.min(1.5,Math.min(scaleX,scaleY)));
  BP.panX=pad-(minX*BP.zoom);BP.panY=pad-(minY*BP.zoom);
  bpRender(name);
}

// ── Event binding ─────────────────────────────────
function _bpBindEvents(canvas,name){
  let pinchDist0=0,pinchZoom0=1,pinchPan0=null;
  let tapT=0,tapX=0,tapY=0;
  function xy(clientX,clientY){const r=canvas.getBoundingClientRect();return{x:clientX-r.left,y:clientY-r.top};}

  function onDown(cx,cy){
    tapT=Date.now();tapX=cx;tapY=cy;

    // PAN MODE — just pan the canvas
    if(BP.panMode){
      BP._panStartX=cx; BP._panStartY=cy;
      BP._panStartPX=BP.panX; BP._panStartPY=BP.panY;
      const cv=document.getElementById('bp-canvas');
      if(cv) cv.style.cursor='grabbing';
      return;
    }

    // Completing a wire?
    if(BP.wire){
      const ih=bpHitPin(cx,cy,name);
      if(ih&&!ih.isOut&&ih.nodeId!==BP.wire.fromId){
        bpSaveUndo(name);
        blueprints[name].connections=blueprints[name].connections.filter(c=>!(c.to===ih.nodeId&&c.toPin===ih.pin));
        blueprints[name].connections.push({from:BP.wire.fromId,fromPin:BP.wire.fromPin,to:ih.nodeId,toPin:ih.pin});
        showToast('🔗 Connected!');
      }
      BP.wire=null;bpRender(name);return;
    }
    // Start wire from output?
    const ph=bpHitPin(cx,cy,name);
    if(ph&&ph.isOut){BP.wire={fromId:ph.nodeId,fromPin:ph.pin,mx:cx,my:cy};bpRender(name);return;}
    // Drag node?
    const nh=bpHitNode(cx,cy,name);
    if(nh){
      if(!BP.sel.has(nh.id)){BP.sel.clear();BP.sel.add(nh.id);}
      const w=bpS2W(cx,cy);
      // Store drag info but don't activate until finger moves (allows tap detection)
      BP._pendingDrag={nodeIds:[...BP.sel],offsets:{},startX:cx,startY:cy};
      BP.sel.forEach(id=>{const n=blueprints[name].nodes.find(n=>n.id===id);if(n)BP._pendingDrag.offsets[id]={dx:w.x-n.x,dy:w.y-n.y};});
      bpRender(name);return;
    }
    // Box select on empty
    BP.sel.clear();
    BP.boxSel={x0:cx,y0:cy,x1:cx,y1:cy};
    bpRender(name);
  }
  function onMove(cx,cy){
    // PAN MODE
    if(BP.panMode){
      BP.panX = BP._panStartPX + (cx - BP._panStartX);
      BP.panY = BP._panStartPY + (cy - BP._panStartY);
      bpRender(name); return;
    }
    // Activate pending drag once finger moves enough
    if(BP._pendingDrag && !BP.drag){
      const moved=Math.hypot(cx-BP._pendingDrag.startX, cy-BP._pendingDrag.startY);
      if(moved > 8){
        BP.drag = BP._pendingDrag;
        BP._pendingDrag = null;
      }
    }
    if(BP.wire){BP.wire.mx=cx;BP.wire.my=cy;bpRender(name);return;}
    if(BP.drag){
      const w=bpS2W(cx,cy);
      BP.drag.nodeIds.forEach(id=>{
        const n=blueprints[name].nodes.find(n=>n.id===id);
        const o=BP.drag.offsets[id];
        if(n&&o){n.x=w.x-o.dx;n.y=w.y-o.dy;}
      });
      bpRender(name);return;
    }
    if(BP.boxSel){
      BP.boxSel.x1=cx;BP.boxSel.y1=cy;
      const{x0,y0,x1,y1}=BP.boxSel;
      const bx1=Math.min(x0,x1),by1=Math.min(y0,y1),bx2=Math.max(x0,x1),by2=Math.max(y0,y1);
      BP.sel.clear();
      blueprints[name].nodes.forEach(n=>{
        const{x:sx,y:sy}=bpW2S(n.x,n.y);
        const sw=BP_NW*BP.zoom,sh=bpNodeH(n)*BP.zoom;
        if(sx<bx2&&sx+sw>bx1&&sy<by2&&sy+sh>by1)BP.sel.add(n.id);
      });
      bpRender(name);return;
    }
  }
  function onUp(cx,cy){
    // PAN MODE — restore cursor
    if(BP.panMode){
      const cv=document.getElementById('bp-canvas');
      if(cv) cv.style.cursor='grab';
      return;
    }
    const wasDrag=!!BP.drag;
    const wasBox=!!BP.boxSel;
    const hadPending=!!BP._pendingDrag; // finger went down on node but didn't move = tap
    BP.drag=null;BP.boxSel=null;BP._pendingDrag=null;

    if(BP.wire){
      const ih=bpHitPin(cx,cy,name);
      if(ih&&!ih.isOut&&ih.nodeId!==BP.wire.fromId){
        bpSaveUndo(name);
        blueprints[name].connections=blueprints[name].connections.filter(c=>!(c.to===ih.nodeId&&c.toPin===ih.pin));
        blueprints[name].connections.push({from:BP.wire.fromId,fromPin:BP.wire.fromPin,to:ih.nodeId,toPin:ih.pin});
        showToast('🔗 Connected!');
      }
      BP.wire=null;bpRender(name);return;
    }

    const moved=Math.hypot(cx-tapX,cy-tapY);
    const elapsed=Date.now()-tapT;
    // Tap = no real drag, finger didn't move much, within 600ms
    if(!wasDrag&&!wasBox&&moved<15&&elapsed<600){
      const nh=bpHitNode(cx,cy,name);
      if(nh){
        BP.sel.clear();BP.sel.add(nh.id);
        const nhIdx = blueprints[name]?.nodes.indexOf(nh);
        bpShowNodeMenu(nh, name, nhIdx);
      } else if(hadPending){
        // Tapped a node area (pendingDrag) but bpHitNode didn't fire - open menu anyway
        const nh2=bpHitNode(tapX,tapY,name);
        if(nh2){ BP.sel.clear();BP.sel.add(nh2.id); const nh2Idx=blueprints[name]?.nodes.indexOf(nh2); bpShowNodeMenu(nh2,name,nh2Idx); }
        else BP.sel.clear();
      } else {
        BP.sel.clear();
      }
    }
    bpRender(name);
  }

  canvas.addEventListener('touchstart',e=>{
    e.preventDefault();
    if(e.touches.length===2){
      const t1=e.touches[0],t2=e.touches[1];
      pinchDist0=Math.hypot(t1.clientX-t2.clientX,t1.clientY-t2.clientY);
      pinchZoom0=BP.zoom;
      pinchPan0={x:BP.panX,y:BP.panY,mx:(t1.clientX+t2.clientX)/2,my:(t1.clientY+t2.clientY)/2};
      BP.drag=null;BP.boxSel=null;BP.wire=null;return;
    }
    const{x,y}=xy(e.touches[0].clientX,e.touches[0].clientY);onDown(x,y);
  },{passive:false});
  canvas.addEventListener('touchmove',e=>{
    e.preventDefault();
    if(e.touches.length===2&&pinchPan0){
      const t1=e.touches[0],t2=e.touches[1];
      const dist=Math.hypot(t1.clientX-t2.clientX,t1.clientY-t2.clientY);
      const nz=Math.max(0.15,Math.min(3,pinchZoom0*dist/pinchDist0));
      const rc=canvas.getBoundingClientRect();
      const mcx=(t1.clientX+t2.clientX)/2-rc.left;
      const mcy=(t1.clientY+t2.clientY)/2-rc.top;
      BP.panX=mcx-(mcx-pinchPan0.x)*nz/pinchZoom0;
      BP.panY=mcy-(mcy-pinchPan0.y)*nz/pinchZoom0;
      BP.zoom=nz;bpRender(name);return;
    }
    const{x,y}=xy(e.touches[0].clientX,e.touches[0].clientY);onMove(x,y);
  },{passive:false});
  canvas.addEventListener('touchend',e=>{
    e.preventDefault();pinchPan0=null;
    if(e.changedTouches.length){const{x,y}=xy(e.changedTouches[0].clientX,e.changedTouches[0].clientY);onUp(x,y);}
  },{passive:false});
  let md=false;
  canvas.addEventListener('mousedown',e=>{md=true;const{x,y}=xy(e.clientX,e.clientY);onDown(x,y);});
  canvas.addEventListener('mousemove',e=>{if(md||BP.wire||BP.drag||BP.boxSel){const{x,y}=xy(e.clientX,e.clientY);onMove(x,y);}});
  canvas.addEventListener('mouseup',e=>{md=false;const{x,y}=xy(e.clientX,e.clientY);onUp(x,y);});
  canvas.addEventListener('wheel',e=>{
    e.preventDefault();
    const{x,y}=xy(e.clientX,e.clientY);
    const f=e.deltaY>0?0.88:1.12;
    const nz=Math.max(0.15,Math.min(3,BP.zoom*f));
    BP.panX=x-(x-BP.panX)*nz/BP.zoom;BP.panY=y-(y-BP.panY)*nz/BP.zoom;BP.zoom=nz;bpRender(name);
  },{passive:false});

  const kh=e=>{
    if(!document.getElementById('bp-overlay')){window.removeEventListener('keydown',kh);return;}
    if(e.key==='Delete'||e.key==='Backspace')bpDeleteSelected(name);
    if((e.ctrlKey||e.metaKey)&&e.key==='a'){blueprints[name].nodes.forEach(n=>BP.sel.add(n.id));bpRender(name);}
    if((e.ctrlKey||e.metaKey)&&e.key==='z')bpUndo(name);
    if((e.ctrlKey||e.metaKey)&&e.key==='d')bpDuplicate(name);
    if(e.key==='f'||e.key==='F')bpFrameAll(name);
    if(e.key==='Escape'){BP.wire=null;BP.sel.clear();bpRender(name);}
  };
  window.addEventListener('keydown',kh);
}

// ── Node operations ────────────────────────────────
function bpAddNode(type,name){
  const def=BP_NODE_DEFS[type];if(!def)return;
  const bp=blueprints[name];if(!bp)return;
  bpSaveUndo(name);
  const id='n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  const canvas=document.getElementById('bp-canvas');
  const W=canvas?canvas.width:400,H=canvas?canvas.height:300;
  const cx=(W/2-BP.panX)/BP.zoom;const cy=(H/2-BP.panY)/BP.zoom;
  const node={id,type,x:cx+bp.nodes.length*10-40,y:cy+bp.nodes.length*8-30};
  if(def.value!==undefined)node.value=def.value;
  if(def.values)node.values={...def.values};
  bp.nodes.push(node);
  BP.sel.clear();BP.sel.add(id);
  bpRender(name);
  showToast('+ '+def.label);
}
function bpDeleteSelected(name){
  const bp=blueprints[name];if(!bp||!BP.sel.size){showToast('Nothing selected');return;}
  bpSaveUndo(name);
  bp.nodes=bp.nodes.filter(n=>!BP.sel.has(n.id));
  bp.connections=bp.connections.filter(c=>!BP.sel.has(c.from)&&!BP.sel.has(c.to));
  BP.sel.clear();bpRender(name);showToast('🗑 Deleted');
}
function bpDuplicate(name){
  const bp=blueprints[name];if(!bp||!BP.sel.size)return;
  bpSaveUndo(name);
  const newSel=new Set();
  [...BP.sel].forEach(id=>{
    const n=bp.nodes.find(n=>n.id===id);if(!n)return;
    const nid='n'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    const clone={...JSON.parse(JSON.stringify(n)),id:nid,x:n.x+20,y:n.y+20};
    bp.nodes.push(clone);newSel.add(nid);
  });
  BP.sel=newSel;bpRender(name);showToast('Ctrl+D duplicated');
}

// ── Node picker ────────────────────────────────────
function bpShowPicker(name){
  const ex=document.getElementById('bp-picker');if(ex)ex.remove();
  const pk=document.createElement('div');
  pk.id='bp-picker';
  pk.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.97);z-index:1001;display:flex;flex-direction:column;';
  document.body.appendChild(pk);

  // Header with search
  const top=document.createElement('div');
  top.style.cssText='display:flex;align-items:center;padding:10px 12px;gap:8px;background:#10101c;border-bottom:1px solid #2a2a3e;flex-shrink:0;';
  const si=document.createElement('input');
  si.placeholder='🔍 Search nodes...';si.type='text';
  si.style.cssText='flex:1;background:#1a1a2e;border:1px solid #3a3a5e;border-radius:8px;color:#fff;font-size:14px;padding:10px 12px;outline:none;';
  const cl=document.createElement('div');
  cl.style.cssText='padding:10px 16px;background:#2a2a3e;color:#fff;border-radius:7px;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation;';
  cl.textContent='✕';
  cl.addEventListener('click',()=>pk.remove());
  cl.addEventListener('touchend',e=>{e.preventDefault();pk.remove();});
  top.appendChild(si);top.appendChild(cl);pk.appendChild(top);

  // Confirm banner (shows selected node before adding)
  const confirm=document.createElement('div');
  confirm.id='bp-picker-confirm';
  confirm.style.cssText='display:none;background:#1a2a1a;border-bottom:2px solid #3ecf7e;padding:10px 14px;flex-shrink:0;align-items:center;gap:10px;';
  confirm.innerHTML=`
    <div style="flex:1">
      <div id="bpc-label" style="font-size:14px;font-weight:700;color:#3ecf7e;"></div>
      <div id="bpc-desc" style="font-size:11px;color:#5080a0;margin-top:2px;"></div>
    </div>
    <div id="bpc-add" style="padding:12px 22px;background:#3ecf7e;color:#000;border-radius:9px;font-size:14px;font-weight:800;cursor:pointer;touch-action:manipulation;white-space:nowrap;">
      ✓ ADD
    </div>
    <div id="bpc-cancel" style="padding:12px 16px;background:#2a2a3e;color:#aaa;border-radius:9px;font-size:13px;cursor:pointer;touch-action:manipulation;">
      ✕
    </div>`;
  pk.appendChild(confirm);

  let selectedType=null;
  let _addFired = false; // guard against double-fire

  function selectNode(type,def){
    selectedType=type;
    _addFired = false;
    confirm.style.display='flex';
    document.getElementById('bpc-label').textContent=def.label;
    document.getElementById('bpc-desc').textContent=def.desc||'Tap ADD to place';
  }

  function doAdd(){
    if(!selectedType || _addFired) return;
    _addFired = true;
    bpAddNode(selectedType,name);
    pk.remove();
  }

  // Bind ADD/cancel buttons once only
  setTimeout(()=>{
    const addBtn = document.getElementById('bpc-add');
    const cancelBtn = document.getElementById('bpc-cancel');
    if(addBtn){
      addBtn.addEventListener('click', doAdd);
      addBtn.addEventListener('touchend', e=>{ e.preventDefault(); doAdd(); });
    }
    if(cancelBtn){
      cancelBtn.addEventListener('click', ()=>{ selectedType=null; confirm.style.display='none'; });
      cancelBtn.addEventListener('touchend', e=>{ e.preventDefault(); selectedType=null; confirm.style.display='none'; });
    }
  }, 50);

  // Category tabs
  const tabs=document.createElement('div');
  tabs.style.cssText='display:flex;gap:6px;padding:8px 12px;background:#0d0d18;border-bottom:1px solid #2a2a3e;overflow-x:auto;flex-shrink:0;-webkit-overflow-scrolling:touch;white-space:nowrap;';
  const allCats=['All',...new Set(Object.values(BP_NODE_DEFS).map(d=>d.cat))];
  let activeTab='All';

  allCats.forEach(cat=>{
    const tb=document.createElement('div');
    const col=BP_CAT_COLORS[cat]||'#5b8dee';
    tb.style.cssText=`padding:7px 14px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation;white-space:nowrap;display:inline-block;background:${cat==='All'?col+'33':col+'22'};color:${col};border:1.5px solid ${cat==='All'?col:col+'44'};`;
    tb.textContent=cat;
    tb.addEventListener('click',()=>{ activeTab=cat; renderNodes(si.value.toLowerCase().trim()); tabs.querySelectorAll('div').forEach(t=>t.style.borderColor=t===tb?col:col+'44'); tb.style.background=col+'33'; });
    tb.addEventListener('touchend',e=>{e.preventDefault(); activeTab=cat; renderNodes(si.value.toLowerCase().trim()); tabs.querySelectorAll('div').forEach(t=>t.style.borderColor=t===tb?BP_CAT_COLORS[activeTab]||'#5b8dee':(BP_CAT_COLORS[activeTab]||'#5b8dee')+'44'); tb.style.background=(BP_CAT_COLORS[cat]||'#5b8dee')+'33'; });
    tabs.appendChild(tb);
  });
  pk.appendChild(tabs);

  // Scroll area
  const scroll=document.createElement('div');
  scroll.style.cssText='flex:1;overflow-y:auto;padding:8px;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;';
  pk.appendChild(scroll);

  // Hint
  const hint=document.createElement('div');
  hint.style.cssText='padding:6px 12px;background:#0a0a14;font-size:10px;color:#3a3a6a;text-align:center;flex-shrink:0;border-top:1px solid #1a1a2e;';
  hint.textContent='Tap a node to preview → Tap ADD to place it';
  pk.appendChild(hint);

  function renderNodes(filter){
    scroll.innerHTML='';
    selectedType=null;
    confirm.style.display='none';

    const filtered=Object.entries(BP_NODE_DEFS).filter(([type,def])=>{
      if(activeTab!=='All'&&def.cat!==activeTab) return false;
      if(filter&&!def.label.toLowerCase().includes(filter)&&!type.toLowerCase().includes(filter)&&!(def.desc||'').toLowerCase().includes(filter)) return false;
      return true;
    });

    if(!filtered.length){
      scroll.innerHTML='<div style="color:#5050a0;text-align:center;padding:40px;font-size:13px;">No nodes found</div>';
      return;
    }

    // Single column — TALL buttons, easy to tap, hard to misfire
    filtered.forEach(([type,def])=>{
      const col=BP_CAT_COLORS[def.cat]||'#5b8dee';
      const btn=document.createElement('div');
      btn.style.cssText=`
        display:flex;align-items:center;gap:12px;
        padding:14px 14px;margin-bottom:6px;
        background:#141426;border:1.5px solid #2a2a3e;
        border-radius:10px;cursor:pointer;touch-action:manipulation;
        user-select:none;transition:background .1s;
      `;

      // Color bar on left
      const bar=document.createElement('div');
      bar.style.cssText=`width:4px;height:36px;border-radius:2px;background:${col};flex-shrink:0;`;

      // Text
      const txt=document.createElement('div');
      txt.style.cssText='flex:1;min-width:0;';
      txt.innerHTML=`
        <div style="font-size:14px;font-weight:700;color:#e0e0f8;">${def.label}</div>
        <div style="font-size:11px;color:#5050a0;margin-top:2px;">${def.desc||def.cat}</div>
      `;

      // Arrow
      const arr=document.createElement('div');
      arr.style.cssText=`font-size:18px;color:${col};flex-shrink:0;`;
      arr.textContent='›';

      btn.appendChild(bar); btn.appendChild(txt); btn.appendChild(arr);

      // Tap = preview/select only, ADD button confirms
      const onTap=()=>{
        scroll.querySelectorAll('.bp-pick-btn').forEach(b=>{b.style.background='#141426';b.style.borderColor='#2a2a3e';});
        btn.style.background=col+'22';
        btn.style.borderColor=col;
        selectNode(type,def);
      };

      btn.className='bp-pick-btn';
      btn.addEventListener('click', onTap);
      btn.addEventListener('touchend', e=>{ e.preventDefault(); onTap(); });
      scroll.appendChild(btn);
    });
  }

  renderNodes('');
  si.addEventListener('input',()=>renderNodes(si.value.toLowerCase().trim()));
  si.addEventListener('touchend',e=>e.stopPropagation());
}

// ── Node context menu ─────────────────────────────
function bpShowNodeMenu(node, name, nodeIdx){
  const def = BP_NODE_DEFS[node.type] || {label: node.type};
  const ex = document.getElementById('bp-node-menu'); if(ex) ex.remove();

  const menu = document.createElement('div');
  menu.id = 'bp-node-menu';
  menu.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:1100;display:flex;align-items:flex-end;';
  document.body.appendChild(menu);

  // Stop ALL events from passing through to canvas behind
  menu.addEventListener('touchstart', e => e.stopPropagation(), true);
  menu.addEventListener('touchmove',  e => e.stopPropagation(), true);
  menu.addEventListener('touchend',   e => e.stopPropagation(), true);

  const sh = document.createElement('div');
  sh.style.cssText = 'width:100%;background:#13131c;border-top:2px solid #5b8dee;border-radius:14px 14px 0 0;padding:16px;max-height:85vh;overflow-y:auto;-webkit-overflow-scrolling:touch;';
  menu.appendChild(sh);

  const close = () => menu.remove();
  menu.addEventListener('click',  e => { if(e.target===menu) close(); });
  menu.addEventListener('touchend', e => { if(e.target===menu){ e.preventDefault(); close(); }});

  // ── Title ──
  const tr = document.createElement('div');
  tr.style.cssText = 'display:flex;align-items:center;margin-bottom:10px;';
  const tn = document.createElement('span');
  tn.style.cssText = 'font-size:14px;font-weight:800;color:#5b8dee;flex:1;';
  tn.textContent = def.label;
  const tc = document.createElement('div');
  tc.style.cssText = 'padding:7px 14px;background:#2a2a3e;color:#fff;border-radius:6px;font-size:13px;cursor:pointer;touch-action:manipulation;';
  tc.textContent = '✕';
  tc.addEventListener('click', close);
  tc.addEventListener('touchend', e => { e.preventDefault(); close(); });
  tr.appendChild(tn); tr.appendChild(tc); sh.appendChild(tr);

  // ── Description ──
  if(def.desc){
    const dv = document.createElement('div');
    dv.style.cssText = 'font-size:10px;color:#5050a0;margin-bottom:12px;line-height:1.5;background:#0d0d1a;padding:8px 10px;border-radius:6px;';
    dv.textContent = def.desc;
    sh.appendChild(dv);
  }

  // ── Working copy of values ──
  // Use node directly (it's the actual object from bpHitNode)
  const workNode = node;
  const localValue  = { v: workNode.value };
  const localValues = workNode.values ? JSON.parse(JSON.stringify(workNode.values)) : null;

  // ── Single value ──
  if(workNode.value !== undefined){
    const vr = document.createElement('div');
    vr.style.cssText = 'margin-bottom:10px;';
    const vl = document.createElement('div');
    vl.style.cssText = 'font-size:10px;color:#7070a0;margin-bottom:6px;font-weight:700;letter-spacing:.5px;';
    vl.textContent = 'VALUE';
    const vi = document.createElement('input');
    vi.type = 'text';
    vi.value = String(workNode.value);
    vi.dataset.key = 'single';
    vi.style.cssText = 'width:100%;background:#0a0a14;border:2px solid #3a3a5e;border-radius:8px;color:#fff;font-size:18px;padding:12px;box-sizing:border-box;text-align:center;outline:none;';
    vi.addEventListener('input', () => { localValue.v = isNaN(vi.value) ? vi.value : +vi.value; });
    vi.addEventListener('change', () => { localValue.v = isNaN(vi.value) ? vi.value : +vi.value; });
    vi.addEventListener('blur',   () => { localValue.v = isNaN(vi.value) ? vi.value : +vi.value; });
    vi.addEventListener('touchend', e => e.stopPropagation());
    vr.appendChild(vl); vr.appendChild(vi); sh.appendChild(vr);

    // Quick +/- buttons for numbers
    if(!isNaN(workNode.value)){
      const qr = document.createElement('div');
      qr.style.cssText = 'display:flex;gap:5px;margin-bottom:12px;';
      [-10,-1,1,10].forEach(d => {
        const b = document.createElement('div');
        b.style.cssText = 'flex:1;padding:10px 0;background:#2a2a3e;border-radius:7px;font-size:13px;color:#d0d0e8;cursor:pointer;touch-action:manipulation;text-align:center;font-weight:700;';
        b.textContent = d > 0 ? '+'+d : d;
        const fn = () => { localValue.v = (parseFloat(vi.value)||0) + d; vi.value = localValue.v; };
        b.addEventListener('click', fn);
        b.addEventListener('touchend', e => { e.preventDefault(); fn(); });
        qr.appendChild(b);
      });
      sh.appendChild(qr);
    }
  }

  // ── X/Y/Z values ──
  const inputRefs = {};
  if(localValues){
    const axCol = {x:'#e05555', y:'#3ecf7e', z:'#5b8dee', name:'#c084fc', val:'#f5a623', min:'#5ce0e8', max:'#ff9f43'};
    const hdLabels = {rotate:'ROTATION (degrees)', spin:'SPIN SPEED (°/sec)', move:'DISTANCE',
                      moveTo:'TARGET POSITION', moveBy:'OFFSET', addImpulse:'FORCE',
                      setPos:'POSITION', getRandom:'RANGE', setVar:'VARIABLE', playAnim:'CLIP NAME'};
    const hd = document.createElement('div');
    hd.style.cssText = 'font-size:10px;color:#7070a0;margin-bottom:10px;font-weight:700;letter-spacing:.5px;';
    hd.textContent = hdLabels[workNode.type] || 'VALUES';
    sh.appendChild(hd);

    Object.keys(localValues).forEach(k => {
      const col = axCol[k] || '#aaa';
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';

      const lbl = document.createElement('div');
      lbl.style.cssText = `width:28px;height:28px;border-radius:6px;background:${col};display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;flex-shrink:0;`;
      lbl.textContent = k.toUpperCase();

      const inp = document.createElement('input');
      inp.type = 'number';
      inp.value = localValues[k] ?? 0;
      inp.dataset.key = k;
      inp.style.cssText = 'flex:1;background:#0a0a14;border:2px solid #3a3a5e;border-radius:8px;color:#fff;font-size:18px;padding:10px;text-align:center;outline:none;';
      const updateVal = () => { localValues[k] = parseFloat(inp.value) || 0; };
      inp.addEventListener('input', updateVal);
      inp.addEventListener('change', updateVal);
      inp.addEventListener('blur', updateVal);
      inp.addEventListener('touchend', e => e.stopPropagation());
      inputRefs[k] = inp;

      // -90 / +90 quick buttons
      const qm = document.createElement('div');
      qm.style.cssText = 'padding:10px;background:#2a2a3e;border-radius:7px;font-size:12px;color:#d0d0e8;cursor:pointer;touch-action:manipulation;font-weight:700;min-width:40px;text-align:center;';
      qm.textContent = '-90';
      const qp = document.createElement('div');
      qp.style.cssText = qm.style.cssText;
      qp.textContent = '+90';

      [['-90', -90, qm], ['+90', 90, qp]].forEach(([_, d, btn]) => {
        const fn = () => {
          localValues[k] = (parseFloat(inp.value)||0) + d;
          inp.value = localValues[k];
        };
        btn.addEventListener('click', fn);
        btn.addEventListener('touchend', e => { e.preventDefault(); fn(); });
      });

      row.appendChild(lbl); row.appendChild(inp);
      row.appendChild(qm); row.appendChild(qp);
      sh.appendChild(row);
    });
  }

  // ── SAVE button — prominent green, saves to blueprint ──
  const hasEditable = workNode.value !== undefined || localValues;
  if(hasEditable){
    const saveBtn = document.createElement('div');
    saveBtn.style.cssText = 'width:100%;padding:18px;background:#3ecf7e;color:#000;border-radius:10px;font-size:16px;font-weight:800;text-align:center;cursor:pointer;touch-action:manipulation;margin-bottom:10px;letter-spacing:.5px;box-shadow:0 4px 16px rgba(62,207,126,.4);';
    saveBtn.textContent = '💾  SAVE VALUES';

    const doSave = (e) => {
      if(e) { e.preventDefault(); e.stopPropagation(); }

      devLog('info', '💾 doSave called for node: ' + workNode.id + ' type: ' + workNode.type);

      // Blur all inputs
      sh.querySelectorAll('input').forEach(inp => inp.blur());

      // Read from inputs directly
      if(localValues){
        Object.keys(localValues).forEach(k => {
          const inp = sh.querySelector(`input[data-key="${k}"]`);
          devLog('info', `  key=${k} inp=${inp ? inp.value : 'NOT FOUND'}`);
          if(inp) localValues[k] = parseFloat(inp.value) || 0;
        });
      }
      if(workNode.value !== undefined){
        const vi = sh.querySelector('input[data-key="single"]');
        devLog('info', `  single inp=${vi ? vi.value : 'NOT FOUND'}`);
        if(vi) localValue.v = isNaN(vi.value) ? vi.value : +vi.value;
      }

      // Save directly to workNode — it IS the live node object from bpHitNode
      // bpHitNode returns bp.nodes[i] directly, so workNode = node = the real object
      // Even if blueprints[name] array was replaced by undo, workNode still holds the values
      // We just need to PUT it back into the current blueprint
      const bp = blueprints[name];
      if(!bp){ showToast('❌ Blueprint not found'); return; }

      // Apply values to workNode first
      if(workNode.value !== undefined) workNode.value = localValue.v;
      if(localValues) workNode.values = {...localValues};

      // Make sure workNode is in the blueprint (it might have been removed by undo)
      const inBp = bp.nodes.some(n => n.id === workNode.id);
      if(!inBp){
        // Re-insert at original index or end
        if(nodeIdx >= 0 && nodeIdx <= bp.nodes.length) bp.nodes.splice(nodeIdx, 0, workNode);
        else bp.nodes.push(workNode);
      }

      bpSaveUndo(name);
      devLog('info', '  saved: ' + JSON.stringify(workNode.values ?? workNode.value));

      bpRender(name);

      const savedVals = localValues
        ? Object.entries(localValues).map(([k,v])=>`${k.toUpperCase()}:${v}`).join(' ')
        : String(localValue.v);
      showToast('💾 Saved! ' + savedVals);

      setTimeout(() => { menu.remove(); }, 600);
    };

    let _saveFired = false;
    saveBtn.addEventListener('touchend', (e) => {
      e.preventDefault(); e.stopPropagation();
      if(_saveFired) return;
      _saveFired = true;
      doSave(e);
      setTimeout(() => { _saveFired = false; }, 800);
    });
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if(_saveFired) return;
      _saveFired = true;
      doSave(e);
      setTimeout(() => { _saveFired = false; }, 800);
    });
    sh.appendChild(saveBtn);
  }

  // ── Action buttons ──
  const ab = document.createElement('div');
  ab.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px;';

  function mkAB(label, bg, bd, col, fn, fullWidth){
    const b = document.createElement('div');
    b.style.cssText = `padding:14px;background:${bg};border:1.5px solid ${bd};border-radius:10px;font-size:12px;font-weight:800;color:${col};text-align:center;cursor:pointer;touch-action:manipulation;${fullWidth?'grid-column:1/-1;':''}`;
    b.textContent = label;
    b.addEventListener('click', fn);
    b.addEventListener('touchend', e => { e.preventDefault(); fn(); });
    ab.appendChild(b);
  }

  // DELETE — full width, red
  mkAB('🗑  DELETE THIS NODE', 'rgba(224,85,85,.2)', '#e05555', '#e05555', () => {
    bpSaveUndo(name);
    blueprints[name].nodes = blueprints[name].nodes.filter(n => n.id !== workNode.id);
    blueprints[name].connections = blueprints[name].connections.filter(c => c.from !== workNode.id && c.to !== workNode.id);
    BP.sel.delete(workNode.id);
    bpRender(name); close(); showToast('🗑 Deleted');
  }, true);

  // Test Run — does NOT close menu
  mkAB('▶ Test Run', 'rgba(62,207,126,.15)', '#3ecf7e', '#3ecf7e', () => {
    // Save first so test run uses current values
    const n = blueprints[name].nodes.find(n => n.id === workNode.id);
    if(n){
      if(workNode.value !== undefined) n.value = localValue.v;
      if(localValues) Object.assign(n.values, localValues);
    }
    bpExecNode(name, workNode.id);
    showToast('▶ Test: ' + def.label);
  });

  mkAB('✂ Disconnect', 'rgba(91,141,238,.15)', '#5b8dee', '#5b8dee', () => {
    bpSaveUndo(name);
    blueprints[name].connections = blueprints[name].connections.filter(c => c.from !== workNode.id && c.to !== workNode.id);
    bpRender(name); close(); showToast('Wires removed');
  });

  mkAB('📋 Duplicate', 'rgba(92,224,232,.15)', '#5ce0e8', '#5ce0e8', () => {
    BP.sel.clear(); BP.sel.add(workNode.id); bpDuplicate(name); close();
  });

  sh.appendChild(ab);
}

// ═══════════════════════════════════════════════════
//  EXECUTION ENGINE — iterative queue, zero recursion
// ═══════════════════════════════════════════════════
function bpRun(name){
  const bp=blueprints[name];if(!bp)return;
  // Reset per-run state
  _bpDoOnceFired[name]={};
  _bpGateOpen[name]={};
  _bpFlipFlop[name]={};

  showToast('▶ Running — switching to Play...');
  closeBlueprintEditor();

  setTimeout(()=>{
    setMode('play');

    // Auto-focus camera on the entity with this blueprint
    setTimeout(()=>{
      const ent = app.root.findByName(name) ||
                  app.root.findByName(name + '_mesh') ||
                  (glbModels.find(m=>m.name===name||m.name===name.replace('_mesh',''))?.entity);
      if(ent && typeof edCam !== 'undefined') {
        const pos = ent.getPosition();
        const sc  = ent.getLocalScale();
        const size = Math.max(sc.x, sc.y, sc.z, 1) * 3;
        edCam.target.set(pos.x, pos.y, pos.z);
        edCam.radius = Math.max(size, 4);
        edCam.phi    = 1.0;
        updateEdCam();
        showToast('🎥 Camera focused on ' + name.replace('_mesh',''));
      }
      // Fire onStart nodes
      bp.nodes.filter(n=>n.type==='onStart').forEach(n=>bpExecFrom(name,n.id,{}));
    }, 200);
  }, 300);
}
function bpExecNode(name,nodeId){bpExecFrom(name,nodeId,{});}

function bpExecFrom(name,startId,ctx){
  const bp=blueprints[name];if(!bp)return;
  const queue=[{id:startId,ctx:{...ctx}}];
  let safety=0;
  while(queue.length&&safety++<1000){
    const{id,ctx:c}=queue.shift();
    const node=bp.nodes.find(n=>n.id===id);if(!node)continue;
    const next=_bpExec(name,node,c);
    if(next)next.forEach(({id:nid,ctx:nc})=>queue.push({id:nid,ctx:nc}));
  }
}

function _bpExec(name,node,ctx){
  const bp=blueprints[name];if(!bp)return[];
  const ent=app.root.findByName(name);

  // follow exec output pin → returns array of {id,ctx}
  const follow=(pin)=>bp.connections
    .filter(c=>c.from===node.id&&c.fromPin===(pin||'exec'))
    .map(c=>({id:c.to,ctx:{...ctx}}));

  // evaluate data input pin
  const getPin=(pin)=>_bpEval(name,node.id,pin,ctx);

  switch(node.type){
    // ── Events (handled by event system, exec just passes through)
    case 'onStart': case 'onUpdate': case 'onTap':
    case 'onPlayerNear': case 'onPlayerFar':
    case 'onOverlapBegin': case 'onOverlapEnd':
    case 'onHit': case 'onDamage': case 'onTimer':
    case 'onKeyPress':
      return follow('exec');

    // ── Flow ──────────────────────────────────────
    case 'branch':{
      const cond=getPin('cond');
      return follow(cond?'true':'false');
    }
    case 'sequence':
      return [...follow('0'),...follow('1'),...follow('2')];
    case 'forLoop':{
      const count=Math.min(+(node.value)||3,100);
      const res=[];
      for(let i=0;i<count;i++)
        follow('body').forEach(({id,ctx:c})=>res.push({id,ctx:{...c,index:i}}));
      res.push(...follow('done'));
      return res;
    }
    case 'doOnce':{
      const key=name+'_'+node.id;
      if(_bpDoOnceFired[key])return[];
      _bpDoOnceFired[key]=true;
      return follow('exec');
    }
    case 'delay':{
      const ms=(+(node.value)||1)*1000;
      const next=follow('exec');
      setTimeout(()=>next.forEach(({id,ctx:c})=>bpExecFrom(name,id,c)),ms);
      return[];
    }
    case 'gate':{
      const key=name+'_'+node.id;
      if(!_bpGateOpen[key])return[];
      return follow('exec');
    }
    case 'flipFlop':{
      const key=name+'_'+node.id;
      _bpFlipFlop[key]=!_bpFlipFlop[key];
      return follow(_bpFlipFlop[key]?'A':'B');
    }
    case 'switchInt':{
      const v=Math.floor(getPin('val')||0);
      return follow(String(Math.max(0,Math.min(3,v))));
    }

    // ── Transform ─────────────────────────────────
    case 'rotate':
      if(ent)ent.rotate(node.values?.x||0,node.values?.y||90,node.values?.z||0);
      return follow('exec');
    case 'playAnim': {
      // Get clip name — use value or auto-detect first clip from glbModels
      let clipName = node.value || '';
      if (!clipName) {
        const m = glbModels.find(m => m.entity === entity ||
          m.entity === entity?.parent ||
          m.name === name || m.name === name.replace('_mesh',''));
        if (m && m.clips && m.clips.length) clipName = m.clips[0];
      }
      if (clipName) {
        playAnimOnEntity(entity, clipName, 1);
        devLog('info', '▶ Playing anim: ' + clipName + ' on ' + name);
      } else {
        devLog('warn', 'playAnim: no clip found for ' + name);
      }
      return nexts;
    }
    case 'stopAnim': {
      try {
        function stopAnimDeep(node) {
          if (node.anim) { try { node.anim.speed = 0; } catch(e){} }
          if (node.children) node.children.forEach(stopAnimDeep);
        }
        if (entity) stopAnimDeep(entity);
      } catch(e) {}
      return nexts;
    }
    case 'spin':
      if(!_bpAnims)window._bpAnims={};
      if(ent)_bpAnims[name]={ent,speedX:node.values?.x||0,speedY:node.values?.y||45,speedZ:node.values?.z||0};
      return follow('exec');
    case 'stopSpin':
      if(_bpAnims)delete _bpAnims[name];
      return follow('exec');
    case 'moveTo':
      if(ent)ent.setLocalPosition(node.values?.x||0,node.values?.y||0,node.values?.z||0);
      return follow('exec');
    case 'moveBy':
      if(ent)ent.translateLocal(node.values?.x||0,node.values?.y||0,node.values?.z||1);
      return follow('exec');
    case 'scaleTo':{
      const v=getPin('v')||+(node.value)||1;
      if(ent)ent.setLocalScale(v,v,v);
      return follow('exec');
    }
    case 'lookAt':
      if(ent&&typeof carX!=='undefined'){
        const p=ent.getLocalPosition();
        const ang=Math.atan2(carX-p.x,carZ-p.z)*180/Math.PI;
        ent.setLocalEulerAngles(0,ang,0);
      }
      return follow('exec');
    case 'setVisible':{
      const v=getPin('v')!==undefined?getPin('v'):+(node.value??1);
      if(ent)ent.enabled=!!v;
      return follow('exec');
    }

    // ── Door actions ───────────────────────────────
    case 'openDoor':{
      _bpDoorState[name]=true;
      if(ent){
        const r=ent.getLocalEulerAngles();
        ent.setLocalEulerAngles(r.x,r.y+90,r.z);
        showToast('🚪 Door opened');
      }
      return follow('exec');
    }
    case 'closeDoor':{
      _bpDoorState[name]=false;
      if(ent){
        const r=ent.getLocalEulerAngles();
        ent.setLocalEulerAngles(r.x,r.y-90,r.z);
        showToast('🚪 Door closed');
      }
      return follow('exec');
    }
    case 'toggleDoor':
      return _bpExec(name,{...node,type:_bpDoorState[name]?'closeDoor':'openDoor'},ctx);
    case 'lockDoor':
      _bpDoorState[name+'_locked']=true;
      showToast('🔒 Locked');return follow('exec');
    case 'enterBuilding':{
      const interior=node.value||'Interior_01';
      const target=app.root.findByName(interior);
      if(target&&typeof carX!=='undefined'){
        const p=target.getLocalPosition();carX=p.x;carZ=p.z;
        if(typeof carEnt!=='undefined'&&carEnt)carEnt.setLocalPosition(p.x,p.y,p.z);
        showToast('🏠 Entered '+interior);
      } else showToast('🏠 Enter: '+interior);
      return follow('exec');
    }
    case 'exitBuilding':
      showToast('🚪 Exited building');return follow('exec');

    // ── GTA Gameplay ───────────────────────────────
    case 'addMoney':
      if(typeof player!=='undefined'){player.money=(player.money||0)+(+(node.value)||100);updateHUD&&updateHUD();}
      showToast('💰 +$'+(node.value||100));return follow('exec');
    case 'addHealth':{
      const amt=+(node.value)||25;
      if(typeof player!=='undefined'){player.health=Math.min(100,(player.health||100)+amt);updateHUD&&updateHUD();}
      showToast('❤ +'+amt+' HP');return follow('exec');
    }
    case 'dealDamage':{
      const dmg=+(node.value)||10;
      if(typeof player!=='undefined'){player.health=Math.max(0,(player.health||100)-dmg);updateHUD&&updateHUD();}
      showToast('💢 -'+dmg+' HP');return follow('exec');
    }
    case 'addAmmo':
      if(typeof player!=='undefined')player.ammo=(player.ammo||0)+(+(node.value)||30);
      showToast('🔫 +'+node.value+' ammo');return follow('exec');
    case 'giveWeapon':
      if(typeof player!=='undefined')player.weapon=node.value||'pistol';
      showToast('🔫 Got '+node.value);return follow('exec');
    case 'fireWeapon':
      showToast('💥 FIRE!');return follow('exec');
    case 'setWanted':
      if(typeof player!=='undefined'){player.wantedLevel=Math.max(0,Math.min(5,+(node.value)||2));updateHUD&&updateHUD();}
      showToast('⭐ Wanted: '+node.value);return follow('exec');
    case 'spawnCar':
      if(ent){const p=ent.getLocalPosition();spawnVehicle&&spawnVehicle(node.value||'sedan',p.x+3,p.z);}
      showToast('🚗 Spawned '+node.value);return follow('exec');
    case 'explode':
      if(ent){const p=ent.getLocalPosition();showToast('💥 BOOM at '+Math.round(p.x)+','+Math.round(p.z));}
      if(typeof player!=='undefined'&&ent){
        const ep=ent.getLocalPosition();
        if(typeof carX!=='undefined'&&Math.hypot(carX-ep.x,carZ-ep.z)<8){
          player.health=Math.max(0,(player.health||100)-50);updateHUD&&updateHUD();
        }
      }
      return follow('exec');
    case 'collectItem':{
      const type=node.value||'money';
      if(typeof player!=='undefined'){
        if(type==='money')player.money=(player.money||0)+100;
        if(type==='health')player.health=Math.min(100,(player.health||100)+25);
        if(type==='ammo')player.ammo=(player.ammo||0)+30;
        if(type==='weapon')player.weapon='pistol';
        updateHUD&&updateHUD();
      }
      if(ent)ent.enabled=false;
      showToast('⭐ Picked up '+type);return follow('exec');
    }
    case 'startMission':
      showToast('📋 Mission: '+node.value);return follow('exec');
    case 'completeMission':
      showToast('✅ Mission complete!');
      if(typeof player!=='undefined'){player.money=(player.money||0)+500;updateHUD&&updateHUD();}
      return follow('exec');
    case 'showObjective':
      showToast('🎯 '+node.value);return follow('exec');

    // ── HUD ────────────────────────────────────────
    case 'showPrompt':{
      let el=document.getElementById('bp-prompt');
      if(!el){el=document.createElement('div');el.id='bp-prompt';
        el.style.cssText='position:fixed;bottom:180px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);border:2px solid #5b8dee;border-radius:10px;padding:10px 20px;font-size:14px;font-weight:700;color:#fff;z-index:200;pointer-events:none;text-align:center;';
        document.body.appendChild(el);}
      el.textContent=node.value||'Press E';el.style.display='block';
      return follow('exec');
    }
    case 'hidePrompt':{
      const el=document.getElementById('bp-prompt');if(el)el.style.display='none';
      return follow('exec');
    }
    case 'showHUDText':{
      let el=document.getElementById('bp-hud-text');
      if(!el){el=document.createElement('div');el.id='bp-hud-text';
        el.style.cssText='position:fixed;top:120px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.8);border-radius:8px;padding:8px 18px;font-size:13px;font-weight:600;color:#fff;z-index:200;pointer-events:none;max-width:80vw;text-align:center;';
        document.body.appendChild(el);}
      el.textContent=node.value||'';el.style.display='block';
      clearTimeout(el._t);el._t=setTimeout(()=>el.style.display='none',3000);
      return follow('exec');
    }
    case 'showHUDIcon':{
      showToast(node.value||'⭐');return follow('exec');
    }
    case 'addHUDButton':{
      const lbl=node.value||'Action';
      const key=name+'_'+lbl;
      if(!_bpHUDButtons[key]){
        const btn=document.createElement('div');
        btn.style.cssText='position:fixed;bottom:220px;right:18px;width:70px;height:70px;border-radius:50%;background:rgba(91,141,238,.85);border:2px solid #5b8dee;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:#fff;z-index:300;cursor:pointer;touch-action:manipulation;text-align:center;user-select:none;';
        btn.textContent=lbl;
        btn.addEventListener('click',()=>bpExecFrom(name,node.id,{_btnPressed:true}));
        btn.addEventListener('touchend',e=>{e.preventDefault();bpExecFrom(name,node.id,{_btnPressed:true});});
        document.body.appendChild(btn);
        _bpHUDButtons[key]=btn;
      }
      return follow('exec');
    }
    case 'removeHUDButton':{
      const key=name+'_'+(node.value||'Action');
      if(_bpHUDButtons[key]){_bpHUDButtons[key].remove();delete _bpHUDButtons[key];}
      return follow('exec');
    }
    case 'showMinimap':
      showToast('🗺 Marker placed');return follow('exec');
    case 'hideMinimap':
      showToast('🗺 Marker removed');return follow('exec');
    case 'fadeScreen':{
      const vp=document.getElementById('viewport');
      if(vp)vp.style.transition='filter .5s',vp.style.filter=(+(node.value||1))?'brightness(0)':'brightness(1)';
      return follow('exec');
    }

    // ── Physics ────────────────────────────────────
    case 'addImpulse':
      if(ent&&ent.rigidbody)ent.rigidbody.applyImpulse(new pc.Vec3(node.values?.x||0,node.values?.y||500,node.values?.z||0));
      else if(ent){const p=ent.getLocalPosition();ent.setLocalPosition(p.x+(node.values?.x||0)*.01,p.y+(node.values?.y||0)*.01,p.z+(node.values?.z||0)*.01);}
      return follow('exec');
    case 'enablePhysics':
      if(ent&&ent.rigidbody)ent.rigidbody.enabled=!!(getPin('v')!==undefined?getPin('v'):+(node.value??1));
      return follow('exec');
    case 'ragdoll':
      showToast('🪆 Ragdoll!');return follow('exec');

    // ── Set ────────────────────────────────────────
    case 'setVar':
      if(!ctx._vars)ctx._vars={};
      ctx._vars[node.values?.name||'myVar']=+(node.values?.val||0);
      return follow('exec');
    case 'setPos':
      if(ent)ent.setLocalPosition(node.values?.x||0,node.values?.y||0,node.values?.z||0);
      return follow('exec');

    // ── Logic ──────────────────────────────────────
    case 'compare':{
      const a=getPin('a'),b=getPin('b');
      if(a===b)return follow('==');
      if(a!==b)return follow('!=');
      if(a>b)return follow('>');
      if(a<b)return follow('<');
      return[];
    }
    case 'printLog':
      console.log('[BP]',node.value,ctx);showToast('🖨 '+node.value);return follow('exec');

    // ── VEHICLE ──────────────────────────────────────────
    case 'enterVehicle':{
      showToast('🚗 Entering vehicle...');
      window.player.inVehicle = true;
      updateHUD();
      executeBlueprintAllEvent('onEnterVehicle', {});
      return follow('exec');
    }
    case 'exitVehicle':{
      window.player.inVehicle = false;
      window.player.vehicleSpeed = 0;
      updateHUD();
      executeBlueprintAllEvent('onExitVehicle', {});
      showToast('🚶 Exited vehicle');
      return follow('exec');
    }
    case 'setVehicleSpeed':{
      window.player.vehicleSpeed = +(getPin('v')||node.value||30);
      updateHUD();
      return follow('exec');
    }
    case 'lockVehicle':
      showToast(+(getPin('v')!==undefined?getPin('v'):+(node.value??1)) ? '🔒 Vehicle locked' : '🔓 Vehicle unlocked');
      return follow('exec');
    case 'explodeVehicle':{
      showToast('💥 Vehicle exploded!');
      window.player.health = Math.max(0, window.player.health-50);
      window.player.wantedLevel = Math.min(5, window.player.wantedLevel+3);
      updateHUD();
      executeBlueprintAllEvent('onExplosion', {x:_px,z:_pz,dist:0});
      return follow('exec');
    }

    // ── COMBAT ───────────────────────────────────────────
    case 'selectWeapon':
      _selectWeapon(node.value||'pistol');
      return follow('exec');
    case 'addWeapon':{
      const wk = node.value||'pistol';
      if(window._weapons[wk]) {
        const def = {pistol:30,rifle:90,shotgun:20,sniper:10,grenade:3,bomb:1,fists:0};
        window._weapons[wk].ammo = (window._weapons[wk].ammo||0) + (def[wk]||30);
        showToast('🎁 Got '+window._weapons[wk].label);
        updateHUD();
      }
      return follow('exec');
    }
    case 'setAmmo':{
      const wk2 = window._currentWeapon;
      if(window._weapons[wk2]) { window._weapons[wk2].ammo = +(getPin('v')||node.value||30); updateHUD(); }
      return follow('exec');
    }
    case 'shootFromHere':{
      // Shoot bullet from this entity toward player
      if(ent) {
        const ep2 = ent.getPosition();
        const ya = Math.atan2(_px-ep2.x, _pz-ep2.z);
        const origPang=_pang, origYaw=_lookYaw;
        _px=ep2.x; _pz=ep2.z; _pang=ya; _lookYaw=0;
        _shootBullet();
        _px=origPang; _pang=origPang; _lookYaw=origYaw;
        // restore properly
        try{ const wp=_plyEnt.getPosition(); _px=wp.x; _pz=wp.z; }catch(e){}
      }
      return follow('exec');
    }
    case 'meleeAttack':
      _meleeAttack();
      return follow('exec');

    // ── MISSION ──────────────────────────────────────────
    case 'startTimer':{
      const secs = Math.abs(+(node.value||60));
      const dir  = +(node.value||60) < 0 ? 1 : -1; // negative value = countup
      window.player.missionTimer    = secs;
      window.player.missionTimerDir = dir;
      _missionTimerActive = true;
      const el = document.getElementById('gta-timer');
      if(el) el.style.display='block';
      return follow('exec');
    }
    case 'stopTimer':
      _missionTimerActive = false;
      { const el=document.getElementById('gta-timer'); if(el) el.style.display='none'; }
      return follow('exec');
    case 'addTime':
      window.player.missionTimer = Math.max(0, window.player.missionTimer + +(getPin('v')||node.value||10));
      return follow('exec');
    case 'setObjective':{
      const ob = document.getElementById('gta-objective');
      if(ob){ ob.textContent=node.value||''; ob.style.display=node.value?'block':'none'; }
      return follow('exec');
    }
    case 'clearObjective':{
      const ob=document.getElementById('gta-objective');
      if(ob) ob.style.display='none';
      return follow('exec');
    }
    case 'addScore':
      window.player.score = (window.player.score||0) + +(getPin('v')||node.value||100);
      updateHUD();
      return follow('exec');
    case 'addKill':
      window.player.kills = (window.player.kills||0) + 1;
      window.player.score = (window.player.score||0) + 50;
      updateHUD();
      return follow('exec');
    case 'missionFail':{
      showToast('❌ '+(node.value||'Mission Failed'));
      _missionTimerActive=false;
      const el=document.getElementById('gta-objective');
      if(el){ el.textContent='❌ '+(node.value||'Mission Failed'); el.style.display='block'; el.style.borderColor='#e05555'; }
      executeBlueprintAllEvent('onMissionFail',{});
      return follow('exec');
    }
    case 'missionWin':{
      const bonus = 500;
      window.player.money = (window.player.money||0) + bonus;
      window.player.score = (window.player.score||0) + 1000;
      showToast('✅ '+(node.value||'Mission Complete!')+'\n💰 +$'+bonus);
      _missionTimerActive=false;
      updateHUD();
      const el=document.getElementById('gta-objective');
      if(el){ el.textContent='✅ '+(node.value||'Mission Complete!'); el.style.display='block'; el.style.borderColor='#3ecf7e'; }
      executeBlueprintAllEvent('onMissionComplete',{});
      return follow('exec');
    }
    case 'setCheckpoint':{
      // Visual checkpoint ring
      const cx2=+(node.values?.x||0), cz2=+(node.values?.z||0);
      let cpEnt = app.root.findByName('BP_Checkpoint');
      if(cpEnt) cpEnt.destroy();
      cpEnt = new pc.Entity('BP_Checkpoint');
      const cpMat = new pc.StandardMaterial(); cpMat.diffuse.set(1,0.8,0); cpMat.emissive.set(0.5,0.4,0); cpMat.emissiveIntensity=1; cpMat.update();
      cpEnt.addComponent('render',{type:'cylinder',material:cpMat,castShadows:false});
      cpEnt.setLocalScale(3,0.08,3);
      cpEnt.setLocalPosition(cx2,0.05,cz2);
      app.root.addChild(cpEnt);
      window._checkpointPos = {x:cx2,z:cz2};
      return follow('exec');
    }
    case 'respawnPlayer':
      _playerRespawn();
      return follow('exec');

    // ── BOMB ─────────────────────────────────────────────
    case 'plantBomb':
      _plantBomb(node.value||'timer', 10);
      return follow('exec');
    case 'plantBombTimer':
      _plantBomb('timer', +(node.value)||10);
      return follow('exec');
    case 'detonateBombs':
      _detonateRemoteBombs();
      return follow('exec');
    case 'showDetonator':{
      const db=document.getElementById('play-bomb-btn');
      if(db) db.style.display='block';
      return follow('exec');
    }

    // ── INTERACTION ──────────────────────────────────────
    case 'showInteract':{
      let el=document.getElementById('bp-prompt');
      if(!el){ el=document.createElement('div'); el.id='bp-prompt';
        el.style.cssText='position:fixed;bottom:185px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.85);border:2px solid #5b8dee;border-radius:10px;padding:10px 20px;font-size:14px;font-weight:700;color:#fff;z-index:200;pointer-events:none;text-align:center;';
        document.body.appendChild(el);}
      el.textContent=node.value||'Tap to interact'; el.style.display='block';
      return follow('exec');
    }
    // ── PLAYER OVERRIDES ─────────────────────────────────
    case 'setPlayerSpeed':{
      const v = +(getPin('v')||node.value||5);
      window._playerSpeed = Math.max(0.1, Math.min(50, v));
      return follow('exec');
    }
    case 'setRotSens':{
      const v = +(getPin('v')||node.value||12);
      window._rotSens = Math.max(0.5, Math.min(30, v));
      return follow('exec');
    }
    case 'freezePlayer':{
      window._playerFrozen = !!(+(getPin('v')!==undefined?getPin('v'):+(node.value??1)));
      return follow('exec');
    }
    case 'teleportPlayer':{
      const tx=+(node.values?.x||getPin('x')||0);
      const tz=+(node.values?.z||getPin('z')||0);
      _px=tx; _pz=tz;
      if(_plyEnt) _plyEnt.setPosition(_px,0,_pz);
      return follow('exec');
    }

    // ── BULLET OVERRIDE ──────────────────────────────────
    case 'shootBullet':{
      _shootBullet();
      return follow('exec');
    }
    case 'setBulletSpeed':{
      if(window._bulletCfg) window._bulletCfg.speed=+(getPin('v')||node.value||22);
      return follow('exec');
    }
    case 'setBulletDamage':{
      if(window._bulletCfg) window._bulletCfg.damage=+(getPin('v')||node.value||10);
      return follow('exec');
    }
    case 'setBulletBounce':{
      if(window._bulletCfg) window._bulletCfg.bounce=+(getPin('v')||node.value||0.55);
      return follow('exec');
    }
    case 'setBulletColor':{
      if(window._bulletCfg){
        window._bulletCfg.colorR=+(node.values?.r||1);
        window._bulletCfg.colorG=+(node.values?.g||0.08);
        window._bulletCfg.colorB=+(node.values?.b||0.08);
        _bulletMat=null;
      }
      return follow('exec');
    }
    case 'setBulletGravity':{
      if(window._bulletCfg) window._bulletCfg.gravity=-(+(getPin('v')||node.value||14));
      return follow('exec');
    }

    // ── ENTITY CONTROL ───────────────────────────────────
    case 'destroySelf':{
      if(ent){ setTimeout(()=>{ try{ent.destroy();}catch(e){} },0); }
      return [];
    }
    case 'setColor':{
      if(ent){
        const mat=new pc.StandardMaterial();
        mat.diffuse.set(+(node.values?.r||1),+(node.values?.g||0),+(node.values?.b||0));
        mat.update();
        function applyMat(n){ if(n.render&&n.render.meshInstances) n.render.meshInstances.forEach(mi=>mi.material=mat); (n.children||[]).forEach(applyMat); }
        applyMat(ent);
      }
      return follow('exec');
    }
    case 'setScale':{
      const v=+(getPin('v')||node.value||1);
      if(ent) ent.setLocalScale(v,v,v);
      return follow('exec');
    }
    case 'setPosition':{
      if(ent) ent.setLocalPosition(+(node.values?.x||0),+(node.values?.y||0),+(node.values?.z||0));
      return follow('exec');
    }
    case 'spawnProp':{
      // Spawn a primitive at entity's position
      const type = node.value || 'sphere';
      const mat2 = new pc.StandardMaterial(); mat2.diffuse.set(.8,.3,.1); mat2.update();
      const sp = new pc.Entity('Spawned_'+type);
      sp.addComponent('render',{type,material:mat2});
      const ep = ent ? ent.getPosition() : new pc.Vec3(0,0,0);
      sp.setLocalPosition(ep.x+(Math.random()*2-1),1,ep.z+(Math.random()*2-1));
      sp.setLocalScale(.5,.5,.5);
      app.root.addChild(sp);
      setTimeout(()=>{ try{sp.destroy();}catch(e){} }, (+(node.values?.life||5))*1000);
      return follow('exec');
    }
    case 'setCamDistance':{
      if(window._camSettings) window._camSettings.distance=+(getPin('v')||node.value||6);
      C_DIST = window._camSettings.distance;
      return follow('exec');
    }
    case 'setCamFOV':{
      if(window._camSettings) window._camSettings.fov=+(getPin('v')||node.value||75);
      return follow('exec');
    }
    case 'shakeCamera':{
      // Quick camera shake via _cang jitter
      const intensity=+(node.value||0.3);
      let t=0;
      const shake=setInterval(()=>{ _cang=(Math.random()-0.5)*intensity; t+=50; if(t>300){clearInterval(shake);_cang=0;} },50);
      return follow('exec');
    }

    // ── VALUE NODES (data) ───────────────────────────────
    case 'number': case 'string': case 'getBool':
    case 'getPos': case 'getPlayerPos': case 'getPlayerX': case 'getPlayerZ':
    case 'getDist': case 'getTime': case 'getHealth': case 'getMoney':
    case 'getSpeed': case 'getVar': case 'getRandom':
    case 'getBulletSpeed': case 'getBulletDmg':
    case 'mathAdd': case 'mathSub': case 'mathMul': case 'mathDiv':
    case 'mathClamp': case 'mathLerp': case 'mathSin': case 'mathAbs':
    case 'mathNot': case 'mathAnd': case 'mathOr':
      return follow('exec');

    default:
      return follow('exec');
  }
}

// ── Data pin evaluator ─────────────────────────────
function _bpEval(name,nodeId,pin,ctx){
  const bp=blueprints[name];if(!bp)return 0;
  const conn=bp.connections.find(c=>c.to===nodeId&&c.toPin===pin);
  if(conn){
    const src=bp.nodes.find(n=>n.id===conn.from);if(!src)return 0;
    const e=(p)=>_bpEval(name,src.id,p,ctx);
    switch(src.type){
      case 'number': case 'getBool': return+(src.value)||0;
      case 'string': return src.value||'';
      case 'getTime': return totalTime||0;
      case 'getHealth': return window.player?.health||100;
      case 'getMoney': return window.player?.money||0;
      case 'getSpeed': return Math.hypot(
        typeof _px!=='undefined'?((_px-(src._lastPx||_px))/0.016):0,
        typeof _pz!=='undefined'?((_pz-(src._lastPz||_pz))/0.016):0);
      case 'getPlayerPos': return {x:_px||0, y:0, z:_pz||0};
      case 'getPlayerX': return _px||0;
      case 'getPlayerZ': return _pz||0;
      case 'getDist':{
        const ent=app.root.findByName(name);
        if(!ent)return 0;
        const p=ent.getPosition();
        return Math.hypot(p.x-(_px||0), p.z-(_pz||0));
      }
      case 'getBulletSpeed': return window._bulletCfg?.speed||22;
      case 'getBulletDmg': return window._bulletCfg?.damage||10;
      case 'getVar': return ctx._vars?.[src.value||'myVar']||0;
      case 'getRandom': return (src.values?.min||0)+Math.random()*((src.values?.max||100)-(src.values?.min||0));
      case 'mathAdd': return e('a')+e('b');
      case 'mathSub': return e('a')-e('b');
      case 'mathMul': return e('a')*e('b');
      case 'mathDiv':{ const d=e('b');return d!==0?e('a')/d:0; }
      case 'mathClamp': return Math.min(Math.max(e('val'),e('min')),e('max'));
      case 'mathLerp':{ const t=e('t');return e('a')*(1-t)+e('b')*t; }
      case 'mathSin': return Math.sin(e('in'));
      case 'mathAbs': return Math.abs(e('in'));
      case 'mathNot': return e('in')?0:1;
      case 'mathAnd': return(e('a')&&e('b'))?1:0;
      case 'mathOr':  return(e('a')||e('b'))?1:0;
      default: return+(src.value)||0;
    }
  }
  return(ctx&&ctx[pin]!==undefined)?ctx[pin]:0;
}

// ── Game event hooks ───────────────────────────────
// Called from app.on('update') etc. to trigger blueprint events
function executeBlueprintEvent(entName,event,data){
  const bp=blueprints[entName];if(!bp)return;
  bp.nodes.filter(n=>n.type===event).forEach(n=>{
    setTimeout(()=>bpExecFrom(entName,n.id,data||{}),0);
  });
}
// Alias for compatibility
function followExec(entName,nodeId,pin,ctx2){
  setTimeout(()=>bpExecFrom(entName,nodeId,ctx2||{}),0);
}
function executeBPNode(entName,node,ctx2){
  if(node)_bpExec(entName,node,ctx2||{});
}

console.log('[EUG] eug-blueprint.js loaded');
