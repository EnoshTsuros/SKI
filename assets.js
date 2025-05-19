
// Add with other image declarations at the top of the file
const npcImg = new Image();
npcImg.src = 'niro_standing.png';

const npcDeadImg = new Image();
npcDeadImg.src = 'niro_dead.png';

const npcInjuredImg = new Image();
npcInjuredImg.src = 'niro_injured.png';

const npcFallingImg = new Image();
npcFallingImg.src = 'niro_falling.png';

const lampImg = new Image();
lampImg.src = 'lamp.png';
// Load wall texture
const wallTexture = new Image();
wallTexture.src = 'satanic-wall1.png';

// Load building wall texture
const buildingWallTexture = new Image();
buildingWallTexture.src = 'satanic_wall2.png';

// Load new wall textures
const wall1Texture = new Image();
wall1Texture.src = 'satanic_walld3.png';

const door2Texture = new Image();
door2Texture.src = 'door_2.png';

// Load DOOM Guy face images for animation
const doomGuyFaceNormal = new Image();
doomGuyFaceNormal.src = './doom_guy1.png';

const doomGuyFaceBlink = new Image();
doomGuyFaceBlink.src = './doom_guy_blinks.png';

const doomGuyFaceSmile = new Image();
doomGuyFaceSmile.src = './doom_guy_smile.png';

const lampCount = 20; // Number of lamps to spawn
const lamps = [];

// Load additional wall textures
const doomWall2Texture = new Image();
doomWall2Texture.src = 'satanic_walld2.png';

const doomWall3Texture = new Image();
doomWall3Texture.src = 'satanoc_d1.png';

const doomDoorTexture = new Image();
doomDoorTexture.src = 'doom_door.png';

const magicWallTexture = new Image();
magicWallTexture.src = 'static_wall3.png';

const handgunSrc = 'handgun.png';
const handgunImages = [];
const handgunImg = new Image();
handgunImg.src = handgunSrc;

const shotgunSrc = 'shootgun.png';
const shotgunImages = [];
const shotgunImg = new Image();
shotgunImg.src = shotgunSrc;

const shotgunPickups = [];
const maxShotgunPickups = 15; // Changed to 7 pickups
const shotgunPickupImg = new Image();
shotgunPickupImg.src = 'drop_shootgun.png';

const lizergunPickups = [];
const maxLizergunPickups = 15;
const lizergunPickupImg = new Image();
lizergunPickupImg.src = 'lizergun.png';

const lizergunSrc = 'liser_fps.png';
const lizergunImages = [];
const lizergunImg = new Image();
lizergunImg.src = lizergunSrc;

// --- Load NPC hurt sound ---
const npcHurtSound = new Audio('niro_hurt.wav');
npcHurtSound.volume = 1.0; // Set as desired

// --- Load shotgun fire sound ---
const shotgunSound = new Audio('shotgun.wav');
shotgunSound.volume = 1.0; // Set as desired

// --- Load liser fire sound ---
const liserSound = new Audio('liser.wav');
liserSound.volume = 1.0; // Set as desired

// --- Load pistol fire sound ---
const pistolSound = new Audio('pistol.wav');
pistolSound.volume = 1.0; // Set as desired

// --- Load door open sound ---
const doorOpenSound = new Audio('dooropen.wav');
doorOpenSound.volume = 1.0; // Set as desired

// --- Load door close sound ---
const doorCloseSound = new Audio('doorclose.wav');
doorCloseSound.volume = 1.0; // Set as desired

// --- Load weapon pickup sound ---
const weaponPickupSound = new Audio('wpick.wav');
weaponPickupSound.volume = 1.0; // Set as desired

const bgMusic = new Audio('doom_gate.mp3');
bgMusic.loop = true;
bgMusic.volume = 1.0; // Set volume as desired
let musicStarted = false;