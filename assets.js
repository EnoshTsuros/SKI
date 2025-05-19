// ================= NPC Sprites =================
const npcImg = new Image();
npcImg.src = 'niro_standing.png';

const npcDeadImg = new Image();
npcDeadImg.src = 'niro_dead.png';

const npcInjuredImg = new Image();
npcInjuredImg.src = 'niro_injured.png';

const npcFallingImg = new Image();
npcFallingImg.src = 'niro_falling.png';

// ================= Lamp =================
const lampImg = new Image();
lampImg.src = 'lamp.png';
const lampCount = 20; // Number of lamps to spawn
const lamps = [];

// ================= Wall Textures =================
const wallTexture = new Image();
wallTexture.src = 'satanic-wall1.png';

const buildingWallTexture = new Image();
buildingWallTexture.src = 'satanic_wall2.png';

const wall1Texture = new Image();
wall1Texture.src = 'satanic_walld3.png';

const door2Texture = new Image();
door2Texture.src = 'door_2.png';

const doomWall2Texture = new Image();
doomWall2Texture.src = 'satanic_walld2.png';

const doomWall3Texture = new Image();
doomWall3Texture.src = 'satanoc_d1.png';

const doomDoorTexture = new Image();
doomDoorTexture.src = 'doom_door.png';

const magicWallTexture = new Image();
magicWallTexture.src = 'static_wall3.png';

// ================= UI/DOOM Guy Face =================
const doomGuyFaceNormal = new Image();
doomGuyFaceNormal.src = './doom_guy1.png';

const doomGuyFaceBlink = new Image();
doomGuyFaceBlink.src = './doom_guy_blinks.png';

const doomGuyFaceSmile = new Image();
doomGuyFaceSmile.src = './doom_guy_smile.png';

// ================= Weapon Sprites =================
const handgunSrc = 'handgun.png';
const handgunImages = [];
const handgunImg = new Image();
handgunImg.src = handgunSrc;

const shotgunSrc = 'shootgun.png';
const shotgunImages = [];
const shotgunImg = new Image();
shotgunImg.src = shotgunSrc;

const lizergunSrc = 'liser_fps.png';
const lizergunImages = [];
const lizergunImg = new Image();
lizergunImg.src = lizergunSrc;

// ================= Pickup Sprites =================
const shotgunPickups = [];
const maxShotgunPickups = 15;
const shotgunPickupImg = new Image();
shotgunPickupImg.src = 'drop_shootgun.png';

const lizergunPickups = [];
const maxLizergunPickups = 15;
const lizergunPickupImg = new Image();
lizergunPickupImg.src = 'lizergun.png';

// ================= Sounds =================
const npcHurtSound = new Audio('niro_hurt.wav');
npcHurtSound.volume = 1.0;

const shotgunSound = new Audio('shotgun.wav');
shotgunSound.volume = 1.0;

const liserSound = new Audio('liser.wav');
liserSound.volume = 1.0;

const pistolSound = new Audio('pistol.wav');
pistolSound.volume = 1.0;

const doorOpenSound = new Audio('dooropen.wav');
doorOpenSound.volume = 1.0;

const doorCloseSound = new Audio('doorclose.wav');
doorCloseSound.volume = 1.0;

const weaponPickupSound = new Audio('wpick.wav');
weaponPickupSound.volume = 1.0;

// ================= Music =================
const bgMusic = new Audio('doom_gate.mp3');
bgMusic.loop = true;
bgMusic.volume = 1.0;
let musicStarted = false;