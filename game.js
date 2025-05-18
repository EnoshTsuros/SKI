// Add with other image declarations at the top of the file
const npcImg = new Image();
npcImg.src = 'niro_standing.png';

const npcDeadImg = new Image();
npcDeadImg.src = 'niro_dead.png';

const npcInjuredImg = new Image();
npcInjuredImg.src = 'niro_injured.png';

const npcFallingImg = new Image();
npcFallingImg.src = 'niro_falling.png';

let fireVisible = false;

// Generate a random map with walls (1) and paths (0)
function generateMap(width, height) {
    const map = [];
    // Create the map with random walls
    for (let y = 0; y < height; y++) {
        const row = [];
        for (let x = 0; x < width; x++) {
            // Keep the outer frame as walls
            if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
                row.push(1);
            } else {
                // 30% chance of wall, 70% chance of path
                row.push(Math.random() < 0.3 ? 1 : 0);
            }
        }
        map.push(row);
    }
    return map;
}

// Find a valid starting position (empty cell)
function findValidStartPosition(map) {
    const validPositions = [];
    for (let y = 1; y < map.length - 1; y++) {
        for (let x = 1; x < map[y].length - 1; x++) {
            if (map[y][x] === 0) {
                validPositions.push({ x, y });
            }
        }
    }
    return validPositions[Math.floor(Math.random() * validPositions.length)];
}

// New map structure: each cell is { wall: 0-6, depth: 0-6, open: true|false }
const map = [
    [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    [7, 7, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7],
    [7, 7, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 7, 7, 7, 7, 7, 7, 3, 1, 1, 3, 7],
    [7, 7, 0, 1, 1, 0, 8, 8, 0, 1, 1, 0, 8, 0, 0, 7, 7, 7, 4, 0, 0, 2, 7],
    [7, 7, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 7, 7, 0, 7, 7, 7, 3, 0, 0, 3, 7],
    [7, 7, 0, 0, 0, 0, 7, 7, 0, 0, 0, 0, 7, 7, 0, 7, 7, 7, 4, 0, 0, 2, 7],
    [7, 7, 7, 7, 5, 7, 7, 7, 7, 7, 5, 7, 7, 7, 0, 7, 7, 7, 3, 0, 0, 3, 7],
    [7, 4, 4, 4, 0, 4, 4, 3, 3, 3, 0, 3, 3, 7, 0, 7, 7, 7, 4, 0, 0, 2, 7],   
    [7, 4, 0, 0, 0, 0, 4, 3, 0, 0, 0, 0, 0, 5, 0, 7, 7, 7, 3, 0, 7, 7, 7],
    [7, 4, 0, 0, 0, 0, 4, 3, 0, 0, 0, 0, 3, 7, 0, 7, 7, 7, 7, 5, 7, 7, 7],
    [7, 4, 0, 0, 0, 0, 4, 3, 0, 0, 0, 0, 3, 7, 0, 7, 7, 7, 0, 0, 0, 0, 3],
    [7, 4, 4, 4, 0, 4, 4, 3, 3, 3, 0, 3, 3, 7, 8, 7, 7, 7, 0, 7, 2, 0, 2],
    [7, 4, 0, 0, 0, 4, 4, 3, 6, 7, 0, 7, 7, 7, 0, 7, 7, 7, 0, 7, 3, 0, 3],
    [7, 4, 0, 0, 0, 4, 4, 3, 6, 7, 0, 7, 0, 0, 0, 7, 7, 7, 0, 7, 2, 0, 2],
    [7, 4, 0, 2, 0, 4, 4, 3, 6, 7, 0, 7, 0, 0, 7, 7, 7, 7, 5, 7, 3, 0, 3],
    [7, 4, 0, 2, 0, 4, 4, 3, 6, 7, 0, 7, 0, 0, 7, 7, 7, 3, 0, 3, 2, 0, 2],
    [7, 4, 0, 0, 0, 4, 4, 3, 6, 7, 0, 7, 7, 6, 7, 7, 7, 3, 0, 3, 3, 2, 3],
    [7, 4, 4, 8, 4, 3, 6, 7, 7, 7, 6, 6, 6, 7, 7, 7, 7, 3, 0, 3, 7, 7, 7],
    [7, 4, 4, 0, 4, 4, 4, 3, 6, 7, 7, 7, 6, 6, 6, 7, 7, 3, 0, 3, 7, 7, 7],
    [7, 4, 4, 0, 4, 4, 4, 3, 6, 7, 7, 7, 6, 6, 6, 7, 7, 7, 0, 7, 7, 7, 7],
    [7, 4, 0, 0, 4, 4, 4, 3, 6, 7, 0, 0, 0, 0, 6, 7, 0, 0, 8, 0, 0, 0, 7],
    [7, 4, 0, 0, 0, 4, 0, 3, 6, 7, 0, 7, 6, 5, 6, 7, 0, 0, 0, 0, 0, 0, 7],
    [7, 4, 0, 0, 0, 4, 0, 3, 6, 7, 0, 7, 6, 0, 6, 7, 0, 0, 0, 0, 0, 0, 7],
    [7, 4, 0, 2, 0, 5, 0, 3, 6, 7, 8, 7, 6, 0, 6, 7, 0, 0, 7, 0, 0, 0, 7],
    [7, 4, 0, 0, 0, 4, 0, 3, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 7],
    [7, 4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 7],
    [7, 4, 4, 4, 4, 4, 4, 3, 6, 7, 7, 7, 6, 0, 0, 8, 0, 0, 7, 0, 0, 7, 7],
    [7, 4, 4, 4, 4, 4, 4, 3, 6, 7, 7, 7, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7],
    
];

// Canvas setup
const canvas = document.getElementById('gameCanvas');
canvas.width = 1600;  // Increased canvas width
canvas.height = 1000; // Increased canvas height
const ctx = canvas.getContext('2d');

// Cell size for drawing
const CELL_SIZE = Math.min(canvas.width / map[0].length, canvas.height / map.length);

// Find a valid starting position for the player
const startPosition = findValidStartPosition(map);
let playerX = startPosition.x + 0.5; // Start at the center of the cell
let playerY = startPosition.y + 0.5; // Start at the center of the cell
let playerAngle = 0; // Player's viewing angle in radians

// Colors
const WALL_COLOR = '#4a4a4a'; // Base wall color (dark gray)
const DOOR_COLOR = '#FFD700'; // Gold door color
const FLOOR_COLOR = '#8B4513'; // Base floor color (brown)
const WALL_SHADOW_FACTOR = 0.75; // Slightly increased shadow factor
const MAX_SHADOW_DISTANCE = 10; // Increased shadow distance
const PLAYER_COLOR = '#f00';
const WALL_GRID_COLOR = '#3a3a3a'; // Darker color for wall grid

// Ray casting settings
const FOV = Math.PI / 3; // Field of view (60 degrees)
const NUM_RAYS = canvas.width;
const MAX_DEPTH = 12; // Increased view distance
const MIN_DISTANCE = 0.1; // Minimum distance to render
const RAY_STEP = 0.01; // Smaller step size for more precise ray casting

// Movement state
const movementState = {
    forward: false,
    backward: false,
    left: false,
    right: false
};

// Movement physics
const movementPhysics = {
    speed: 0,
    maxSpeed: 0.02,
    acceleration: 0.002,
    deceleration: 0.002,
    rotationSpeed: 0.02
};

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

let doomGuyFaceState = 'normal'; // 'normal', 'blink', 'smile'
let doomGuyNextBlink = performance.now() + 2000 + Math.random() * 2000;
let doomGuyNextSmile = performance.now() + 8000 + Math.random() * 8000;
let doomGuyFaceTimeout = 0;

// Only start the game loop after the wall texture is loadedo
let textureLoaded = false;
wallTexture.onload = () => {
    textureLoaded = true;
    gameLoop();
};

// Show loading message if texture not loaded
function drawLoading() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 48px monospace';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
}

// Load additional wall textures
const doomWall2Texture = new Image();
doomWall2Texture.src = 'satanic_walld2.png';
const doomWall3Texture = new Image();
doomWall3Texture.src = 'satanoc_d1.png';
const doomDoorTexture = new Image();
doomDoorTexture.src = 'doom_door.png';
const magicWallTexture = new Image();
magicWallTexture.src = 'static_wall3.png';

// Door animation state
const doorsAnimating = {};

// Cast a single ray and return the distance and wall information
function castRay(angle) {
    const rayDirX = Math.cos(angle);
    const rayDirY = Math.sin(angle);

    let mapX = Math.floor(playerX);
    let mapY = Math.floor(playerY);

    // Length of ray from one x or y-side to next x or y-side
    const deltaDistX = Math.abs(1 / rayDirX);
    const deltaDistY = Math.abs(1 / rayDirY);

    // Calculate step and initial sideDist
    let stepX, stepY;
    let sideDistX, sideDistY;

    if (rayDirX < 0) {
        stepX = -1;
        sideDistX = (playerX - mapX) * deltaDistX;
    } else {
        stepX = 1;
        sideDistX = (mapX + 1.0 - playerX) * deltaDistX;
    }
    if (rayDirY < 0) {
        stepY = -1;
        sideDistY = (playerY - mapY) * deltaDistY;
    } else {
        stepY = 1;
        sideDistY = (mapY + 1.0 - playerY) * deltaDistY;
    }

    let hit = false;
    let side; // 0 for vertical, 1 for horizontal
    let perpWallDist;
    let wallType = 0;

    while (!hit) {
        // Jump to next map square, either in x-direction or y-direction
        if (sideDistX < sideDistY) {
            sideDistX += deltaDistX;
            mapX += stepX;
            side = 0; // vertical wall
        } else {
            sideDistY += deltaDistY;
            mapY += stepY;
            side = 1; // horizontal wall
        }
        // Check if ray has hit any wall type
        if (map[mapY][mapX] !== 0) {
            hit = true;
            wallType = map[mapY][mapX];
        }
    }

    // Calculate distance to the point of impact
    if (side === 0) {
        perpWallDist = (mapX - playerX + (1 - stepX) / 2) / rayDirX;
    } else {
        perpWallDist = (mapY - playerY + (1 - stepY) / 2) / rayDirY;
    }

    // Calculate the exact position of the wall hit
    let wallX;
    if (side === 0) {
        wallX = playerY + perpWallDist * rayDirY;
    } else {
        wallX = playerX + perpWallDist * rayDirX;
    }
    wallX -= Math.floor(wallX);

    return {
        distance: perpWallDist,
        wallSide: side,
        hitWall: true,
        wallX: wallX,
        rayDirX,
        rayDirY,
        wallType
    };
}

// --- Pre-render static perspective checkerboard floor ---
const checkerboardCanvas = document.createElement('canvas');
checkerboardCanvas.width = canvas.width;
checkerboardCanvas.height = canvas.height;
const cbCtx = checkerboardCanvas.getContext('2d');
(function renderStaticCheckerboard() {
    const floorYStart = Math.floor(canvas.height / 2);
    const cameraY = 0;
    const cameraZ = 3;
    const floorY = -1;
    const ceilingY = 1;
    const squareSize = 0.2; // Keep the small squares for pixelation
    
    // Floor colors - dark browns with more contrast
    const floorColors = [
        '#1a1a0f', // Darker brown
        '#1a1a0f', // Darker brown
        '#130f0a', // Darker brown
        '#151a0f', // Darker brown
        '#3c2318', // Darker brown
        '#2d1c15'  // Darker brown
    ];
    
    // Ceiling colors - dark purples with more contrast
    const ceilingColors = [
        '#1a1228', // Dark purple
        '#231a3d', // Medium dark purple
        '#140f1f', // Dark purple
        '#1d1636', // Medium dark purple
        '#18102d', // Dark purple
        '#2a1f4a'  // Medium dark purple
    ];
    
    // --- Floor ---
    for (let y = floorYStart + 1; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Normalized device coordinates
            const uvx = (x - canvas.width / 2) / canvas.height;
            const uvy = -((y - canvas.height / 2) / canvas.height);
            // Ray direction from camera through pixel
            const rd = [uvx, uvy, -1];
            // Normalize ray direction
            const len = Math.sqrt(rd[0]*rd[0] + rd[1]*rd[1] + rd[2]*rd[2]);
            rd[0] /= len; rd[1] /= len; rd[2] /= len;
            // Ray origin
            const ro = [0, cameraY, cameraZ];
            // Ray-plane intersection
            const t = (floorY - ro[1]) / rd[1];
            if (t > 0) {
                // Intersection point
                const hitX = ro[0] + t * rd[0];
                const hitZ = ro[2] + t * rd[2];
                // Checkerboard pattern with smaller squares
                const checkX = Math.floor(hitX / squareSize);
                const checkZ = Math.floor(hitZ / squareSize);
                const isBlack = (checkX + checkZ) % 2 === 0;
                
                // Calculate distance-based darkening factor
                const distance = Math.sqrt(hitX * hitX + hitZ * hitZ);
                const distanceDarkening = Math.min(1, distance / 8); // Reduced darkening
                
                // Calculate center-based darkening factor
                const distFromCenter = Math.abs(y - floorYStart) / (canvas.height / 2);
                const centerDarkening = Math.pow(distFromCenter, 0.6); // Reduced darkening
                
                // Combine both darkening factors
                const totalDarkening = Math.min(1, distanceDarkening + centerDarkening * 0.6); // Reduced darkening
                
                // Select color based on position
                const colorIndex = Math.abs(checkX + checkZ) % floorColors.length;
                const baseColor = isBlack ? floorColors[colorIndex] : floorColors[(colorIndex + 3) % floorColors.length];
                
                // Convert hex to RGB for darkening
                const r = parseInt(baseColor.slice(1, 3), 16);
                const g = parseInt(baseColor.slice(3, 5), 16);
                const b = parseInt(baseColor.slice(5, 7), 16);
                
                // Apply darkening
                const darkenedR = Math.floor(r * (1 - totalDarkening * 0.7)); // Reduced darkening
                const darkenedG = Math.floor(g * (1 - totalDarkening * 0.7));
                const darkenedB = Math.floor(b * (1 - totalDarkening * 0.7));
                
                cbCtx.fillStyle = `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
                cbCtx.fillRect(x, y, 1, 1);
            }
        }
    }

    // --- Ceiling ---
    for (let y = 0; y <= floorYStart; y++) {
        for (let x = 0; x < canvas.width; x++) {
            // Normalized device coordinates
            const uvx = (x - canvas.width / 2) / canvas.height;
            const uvy = -((y - canvas.height / 2) / canvas.height);
            // Ray direction from camera through pixel
            const rd = [uvx, uvy, -1];
            // Normalize ray direction
            const len = Math.sqrt(rd[0]*rd[0] + rd[1]*rd[1] + rd[2]*rd[2]);
            rd[0] /= len; rd[1] /= len; rd[2] /= len;
            // Ray origin
            const ro = [0, cameraY, cameraZ];
            // Ray-plane intersection
            const t = (ceilingY - ro[1]) / rd[1];
            if (t > 0) {
                // Intersection point
                const hitX = ro[0] + t * rd[0];
                const hitZ = ro[2] + t * rd[2];
                // Checkerboard pattern with smaller squares
                const checkX = Math.floor(hitX / squareSize);
                const checkZ = Math.floor(hitZ / squareSize);
                const isBlack = (checkX + checkZ) % 2 === 0;
                
                // Calculate distance-based darkening factor
                const distance = Math.sqrt(hitX * hitX + hitZ * hitZ);
                const distanceDarkening = Math.min(1, distance / 8); // Reduced darkening
                
                // Calculate center-based darkening factor
                const distFromCenter = Math.abs(y - floorYStart) / (canvas.height / 2);
                const centerDarkening = Math.pow(distFromCenter, 0.6); // Reduced darkening
                
                // Combine both darkening factors
                const totalDarkening = Math.min(1, distanceDarkening + centerDarkening * 0.6); // Reduced darkening
                
                // Select color based on position
                const colorIndex = Math.abs(checkX + checkZ) % ceilingColors.length;
                const baseColor = isBlack ? ceilingColors[colorIndex] : ceilingColors[(colorIndex + 3) % ceilingColors.length];
                
                // Convert hex to RGB for darkening
                const r = parseInt(baseColor.slice(1, 3), 16);
                const g = parseInt(baseColor.slice(3, 5), 16);
                const b = parseInt(baseColor.slice(5, 7), 16);
                
                // Apply darkening
                const darkenedR = Math.floor(r * (1 - totalDarkening * 0.7)); // Reduced darkening
                const darkenedG = Math.floor(g * (1 - totalDarkening * 0.7));
                const darkenedB = Math.floor(b * (1 - totalDarkening * 0.7));
                
                cbCtx.fillStyle = `rgb(${darkenedR}, ${darkenedG}, ${darkenedB})`;
                cbCtx.fillRect(x, y, 1, 1);
            }
        }
    }
})();

// Add these variables at the top with other game state variables
let bobOffset = 0;
let bobDirection = 1;
const BOB_SPEED = 0.02; // Keep the same speed
const BOB_AMOUNT = 0.05; // Increased from 0.02 to 0.05 for wider swings
const BOB_VERTICAL = 0.01; // Keep the same vertical movement

// In the draw3DView function, add the bobbing effect
function draw3DView() {
    // Calculate bobbing effect with smooth left-to-right motion
    bobOffset += BOB_SPEED;
    if (bobOffset > Math.PI * 2) {
        bobOffset = 0;
    }

    // Draw ceiling with solid color (without bobbing)
    ctx.fillStyle = '#ccefff';
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    
    // Draw static checkerboard floor (without bobbing)
    ctx.drawImage(checkerboardCanvas, 0, 0);
    
    // Draw horizon line (front wall) (without bobbing)
    ctx.strokeStyle = '#222';
    ctx.beginPath();
    ctx.moveTo(0, Math.floor(canvas.height / 2));
    ctx.lineTo(canvas.width, Math.floor(canvas.height / 2));
    ctx.stroke();

    // Apply bobbing to walls and sprites
    ctx.save();
    const horizontalBob = Math.sin(bobOffset) * BOB_AMOUNT * canvas.width;
    const verticalBob = Math.abs(Math.sin(bobOffset)) * BOB_VERTICAL * canvas.height;
    ctx.translate(horizontalBob, verticalBob);

    // Cast rays and draw walls (with bobbing)
    for (let i = 0; i < NUM_RAYS; i++) {
        const currentAngle = playerAngle - FOV / 2 + i * (FOV / NUM_RAYS);
        const { distance, wallSide, hitWall, wallX, rayDirX, rayDirY, wallType } = castRay(currentAngle);
        if (hitWall && distance < MAX_DEPTH) {
            const wallHeight = (canvas.height / distance) * 0.5;
            if (wallHeight >= 1) {
                const shadowIntensity = Math.min(1, distance / MAX_SHADOW_DISTANCE);
                const shadowFactor = 1 - (shadowIntensity * WALL_SHADOW_FACTOR);
                const yTop = (canvas.height - wallHeight) / 2;
                let texture;
                let collapse = 1;
                let isAnimatingDoor = false;
                if (wallType === 5) {
                    const wx = Math.floor(playerX + Math.cos(currentAngle) * distance);
                    const wy = Math.floor(playerY + Math.sin(currentAngle) * distance);
                    const key = wx + ',' + wy;
                    if (doorsAnimating[key]) {
                        isAnimatingDoor = true;
                        const state = doorsAnimating[key];
                        if (state.phase === 'opening') {
                            collapse = 1 - state.progress;
                        } else if (state.phase === 'closing') {
                            collapse = state.progress;
                        } else if (state.phase === 'open') {
                            continue; // Door is open, skip drawing
                        }
                    }
                }
                if (wallType === 2) {
                    texture = buildingWallTexture;
                } else if (wallType === 3) {
                    texture = doomWall2Texture;
                } else if (wallType === 4) {
                    texture = doomWall3Texture;
                } else if (wallType === 5) {
                    texture = doomDoorTexture;
                } else if (wallType === 6) {
                    texture = magicWallTexture;
                } else if (wallType === 7) {
                    texture = wall1Texture;
                } else if (wallType === 8) {
                    texture = door2Texture;
                } else {
                    texture = wallTexture;
                }
                if (texture.complete && texture.naturalWidth > 0) {
                    const texWidth = texture.width;
                    const texHeight = texture.height;
                    let texX = wallX;
                    if (wallSide === 0) {
                        if (rayDirX > 0) texX = 1 - texX;
                    } else {
                        if (rayDirY < 0) texX = 1 - texX;
                    }
                    texX *= texWidth;
                    // Apply collapse (shrink horizontally)
                    if (isAnimatingDoor) {
                        const center = i + 0.5;
                        const half = (collapse * 0.5);
                        const left = Math.floor(center - half);
                        const right = Math.ceil(center + half);
                        for (let x = left; x < right; x++) {
                            ctx.drawImage(
                                texture,
                                Math.floor(texX), 0, 1, texHeight,
                                x, yTop, 1, wallHeight
                            );
                            ctx.save();
                            ctx.globalAlpha = 1 - shadowFactor;
                            ctx.fillStyle = '#000';
                            ctx.fillRect(x, yTop, 1, wallHeight);
                            ctx.restore();
                        }
                    } else {
                        ctx.drawImage(
                            texture,
                            Math.floor(texX), 0, 1, texHeight,
                            i, yTop, 1, wallHeight
                        );
                        ctx.save();
                        ctx.globalAlpha = 1 - shadowFactor;
                        ctx.fillStyle = '#000';
                        ctx.fillRect(i, yTop, 1, wallHeight);
                        ctx.restore();
                    }
                }
            }
        }
    }

    // Collect all sprites (NPCs, pickups) and sort them by distance
    const allSprites = [];
    
    // Add NPCs
    npcs.forEach(npc => {
        const dx = npc.x + 0.5 - playerX;
        const dy = npc.y + 0.5 - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        allSprites.push({
            type: 'npc',
            data: npc,
            dist: dist,
            dx: dx,
            dy: dy
        });
    });

    // Add bullet pickups
    bulletPickups.forEach(b => {
        const dx = b.x + 0.5 - playerX;
        const dy = b.y + 0.5 - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        allSprites.push({
            type: 'bullet',
            data: b,
            dist: dist,
            dx: dx,
            dy: dy
        });
    });

    // Add shotgun pickups
    shotgunPickups.forEach(s => {
        const dx = s.x + 0.5 - playerX;
        const dy = s.y + 0.5 - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        allSprites.push({
            type: 'shotgun',
            data: s,
            dist: dist,
            dx: dx,
            dy: dy
        });
    });

    // Add lizergun pickups
    lizergunPickups.forEach(l => {
        const dx = l.x + 0.5 - playerX;
        const dy = l.y + 0.5 - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        allSprites.push({
            type: 'lizergun',
            data: l,
            dist: dist,
            dx: dx,
            dy: dy
        });
    });

    // Sort all sprites by distance (farthest first)
    allSprites.sort((a, b) => b.dist - a.dist);

    // Draw all sprites in order
    allSprites.forEach(sprite => {
        if (sprite.dist < 0.6) return; // hide when stepping over
        
        const angleToSprite = Math.atan2(sprite.dy, sprite.dx);
        let relAngle = angleToSprite - playerAngle;
        while (relAngle < -Math.PI) relAngle += Math.PI * 2;
        while (relAngle > Math.PI) relAngle -= Math.PI * 2;
        
        if (Math.abs(relAngle) < FOV / 2 && sprite.dist > 0.2) {
            const screenX = Math.tan(relAngle) / Math.tan(FOV / 2) * (canvas.width / 2) + (canvas.width / 2);
            const ray = castRay(angleToSprite);
            if (ray.distance + 0.2 < sprite.dist) return; // occluded by wall

            const spriteScale = sprite.type === 'shotgun' ? 0.35 : 
                              sprite.type === 'bullet' ? 0.25 : 
                              sprite.type === 'lizergun' ? 0.28 : 0.7;
            const spriteHeight = Math.abs(canvas.height / sprite.dist * spriteScale);
            const spriteWidth = spriteHeight;
            const floorLine = (canvas.height / 2) + (canvas.height / (2 * sprite.dist));
            let spriteY = floorLine - spriteHeight;

            // Adjust Y position for dead NPCs
            if (sprite.type === 'npc' && sprite.data.state === 'dead') {
                spriteY += spriteHeight * 0.3; // Reduced from 0.5 to 0.3 to position it higher
            }

            if (sprite.type === 'npc') {
                const imgToDraw = getNPCSprite(sprite.data);
                if (imgToDraw && ((imgToDraw instanceof HTMLImageElement && imgToDraw.complete && imgToDraw.naturalWidth > 0) || imgToDraw instanceof HTMLCanvasElement)) {
                    ctx.save();
                    
                    // Add falling and fade out effect for dead NPCs
                    if (sprite.data.state === 'dead') {
                        const timeSinceDeath = Date.now() - sprite.data.deathTime;
                        
                        if (timeSinceDeath < 1000) {
                            // Just show the falling sprite for 1000ms
                            ctx.drawImage(
                                imgToDraw,
                                screenX - spriteWidth / 2,
                                spriteY,
                                spriteWidth,
                                spriteHeight
                            );
                        } else {
                            // Death sprite with fade out (after 1000ms)
                            const fadeStartTime = 1000;
                            const fadeDuration = 2000;
                            if (timeSinceDeath > fadeStartTime) {
                                const fadeProgress = Math.min(1, (timeSinceDeath - fadeStartTime) / fadeDuration);
                                ctx.globalAlpha = 1 - fadeProgress;
                            }
                            
                            // Draw the death sprite
                            if (sprite.data.isWalkingLeft) {
                                ctx.translate(screenX + spriteWidth / 2, spriteY);
                                ctx.scale(-1, 1);
                                ctx.drawImage(
                                    imgToDraw,
                                    0,
                                    0,
                                    spriteWidth,
                                    spriteHeight
                                );
                            } else {
                                ctx.drawImage(
                                    imgToDraw,
                                    screenX - spriteWidth / 2,
                                    spriteY,
                                    spriteWidth,
                                    spriteHeight
                                );
                            }
                        }
                    } else {
                        // Normal drawing for non-dead NPCs
                        if (sprite.data.isWalkingLeft) {
                            ctx.translate(screenX + spriteWidth / 2, spriteY);
                            ctx.scale(-1, 1);
                            ctx.drawImage(
                                imgToDraw,
                                0,
                                0,
                                spriteWidth,
                                spriteHeight
                            );
                        } else {
                            ctx.drawImage(
                                imgToDraw,
                                screenX - spriteWidth / 2,
                                spriteY,
                                spriteWidth,
                                spriteHeight
                            );
                        }
                    }
                    ctx.restore();
                }
            } else if (sprite.type === 'bullet' && bulletPickupImg.complete && bulletPickupImg.naturalWidth > 0) {
                ctx.drawImage(
                    bulletPickupImg,
                    screenX - spriteWidth / 2,
                    spriteY,
                    spriteWidth,
                    spriteHeight
                );
            } else if (sprite.type === 'shotgun' && shotgunPickupImg.complete && shotgunPickupImg.naturalWidth > 0) {
                ctx.drawImage(
                    shotgunPickupImg,
                    screenX - spriteWidth / 2,
                    spriteY,
                    spriteWidth,
                    spriteHeight
                );
            } else if (sprite.type === 'lizergun' && lizergunPickupImg.complete && lizergunPickupImg.naturalWidth > 0) {
                ctx.drawImage(
                    lizergunPickupImg,
                    screenX - spriteWidth / 2,
                    spriteY,
                    spriteWidth,
                    spriteHeight
                );
            }
        }
    });

    ctx.restore(); // Restore the canvas state after applying bobbing
}

// Helper function to apply shadow to a color
function applyShadow(baseColor, shadowFactor) {
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    
    // Apply shadow factor
    const shadowedR = Math.floor(r * shadowFactor);
    const shadowedG = Math.floor(g * shadowFactor);
    const shadowedB = Math.floor(b * shadowFactor);
    
    // Convert back to hex
    return `rgb(${shadowedR}, ${shadowedG}, ${shadowedB})`;
}

// Draw the map (top-down view)
function drawMap() {
    // Draw the map in the top-left corner
    const mapSize = 150;
    const cellSize = mapSize / Math.max(map.length, map[0].length);
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            if (map[y][x] === 1) {
                ctx.fillStyle = WALL_COLOR;
            } else if (map[y][x] === 2) {
                ctx.fillStyle = DOOR_COLOR;
            } else if (map[y][x] === 3) {
                ctx.fillStyle = '#6e6e6e'; // Color for doom_wall2
            } else if (map[y][x] === 4) {
                ctx.fillStyle = '#3e3e7e'; // Color for doom_wall3
            } else if (map[y][x] === 5) {
                ctx.fillStyle = '#bbaa44'; // Color for doom_door
            } else if (map[y][x] === 6) {
                ctx.fillStyle = '#44bbaa'; // Color for magic_wall
            } else if (map[y][x] === 7) {
                ctx.fillStyle = '#8B4513'; // Color for wall_1 (brown)
            } else if (map[y][x] === 8) {
                ctx.fillStyle = '#CD853F'; // Color for door_2 (light brown)
            } else {
                ctx.fillStyle = FLOOR_COLOR;
            }
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            
            // Add a border to make walls more visible
            if (map[y][x] !== 0) {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }
    // Draw bullet pickups as images if loaded, else yellow circle
    bulletPickups.forEach(b => {
        if (bulletPickupImg.complete && bulletPickupImg.naturalWidth > 0) {
            ctx.drawImage(
                bulletPickupImg,
                b.x * cellSize + cellSize * 0.1,
                b.y * cellSize + cellSize * 0.1,
                cellSize * 0.8,
                cellSize * 0.8
            );
        } else {
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(b.x * cellSize + cellSize / 2, b.y * cellSize + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    // Draw shotgun pickups as images if loaded, else red circle
    shotgunPickups.forEach(s => {
        if (shotgunPickupImg.complete && shotgunPickupImg.naturalWidth > 0) {
            ctx.drawImage(
                shotgunPickupImg,
                s.x * cellSize + cellSize * 0.05, // Reduced margin to make it larger
                s.y * cellSize + cellSize * 0.05,
                cellSize * 0.9, // Increased from 0.8 to 0.9
                cellSize * 0.9
            );
        } else {
            ctx.fillStyle = '#f00';
            ctx.beginPath();
            ctx.arc(s.x * cellSize + cellSize / 2, s.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2); // Increased from /4 to /3
            ctx.fill();
        }
    });
    // Draw lizergun pickups as images if loaded, else blue circle
    lizergunPickups.forEach(l => {
        if (lizergunPickupImg.complete && lizergunPickupImg.naturalWidth > 0) {
            ctx.drawImage(
                lizergunPickupImg,
                l.x * cellSize + cellSize * 0.05,
                l.y * cellSize + cellSize * 0.05,
                cellSize * 0.9,
                cellSize * 0.9
            );
        } else {
            ctx.fillStyle = '#00f';
            ctx.beginPath();
            ctx.arc(l.x * cellSize + cellSize / 2, l.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    // Draw player on minimap
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(
        playerX * cellSize + cellSize / 2,
        playerY * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
    );
    ctx.fill();
    // Draw player direction
    ctx.strokeStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.moveTo(playerX * cellSize + cellSize / 2, playerY * cellSize + cellSize / 2);
    ctx.lineTo(
        (playerX + Math.cos(playerAngle) * 2) * cellSize + cellSize / 2,
        (playerY + Math.sin(playerAngle) * 2) * cellSize + cellSize / 2
    );
    ctx.stroke();

    // Draw NPCs as niro_standing.png if loaded, else red square
    npcs.forEach(npc => {
        const imgToDraw = getNPCSprite(npc);
        if (imgToDraw && ((imgToDraw instanceof HTMLImageElement && imgToDraw.complete && imgToDraw.naturalWidth > 0) || imgToDraw instanceof HTMLCanvasElement)) {
            ctx.drawImage(
                imgToDraw,
                npc.x * cellSize + cellSize * 0.1,
                npc.y * cellSize + cellSize * 0.1,
                cellSize * 0.8,
                cellSize * 0.8
            );
        } else {
            ctx.fillStyle = '#c00';
            ctx.fillRect(
                npc.x * cellSize + cellSize * 0.1,
                npc.y * cellSize + cellSize * 0.1,
                cellSize * 0.8,
                cellSize * 0.8
            );
        }
    });
}

// Check if a position is valid (within bounds and not a wall)
function isValidPosition(x, y) {
    return (
        x >= 0 &&
        x < map[0].length &&
        y >= 0 &&
        y < map.length &&
        map[y][x] === 0
    );
}

// Check for collision with walls
function checkCollision(x, y) {
    const playerRadius = 0.2;
    const corners = [
        { x: x - playerRadius, y: y - playerRadius },
        { x: x + playerRadius, y: y - playerRadius },
        { x: x - playerRadius, y: y + playerRadius },
        { x: x + playerRadius, y: y + playerRadius }
    ];
    for (const corner of corners) {
        const mapX = Math.floor(corner.x);
        const mapY = Math.floor(corner.y);
        if (mapX < 0 || mapX >= map[0].length || mapY < 0 || mapY >= map.length) {
            return true; // Out of bounds
        }
        if (map[mapY][mapX] !== 0) {
            return true; // Any wall type collision
        }
    }
    return false;
}

// Handle key down events
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movementState.forward = true;
            break;
        case 'ArrowDown':
            movementState.backward = true;
            break;
        case 'ArrowLeft':
            movementState.left = true;
            break;
        case 'ArrowRight':
            movementState.right = true;
            break;
    }
});

// Handle key up events
document.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            movementState.forward = false;
            break;
        case 'ArrowDown':
            movementState.backward = false;
            break;
        case 'ArrowLeft':
            movementState.left = false;
            break;
        case 'ArrowRight':
            movementState.right = false;
            break;
    }
});

// Update player position and rotation
function updatePlayer() {
    // Handle rotation
    if (movementState.left) {
        playerAngle -= movementPhysics.rotationSpeed;
    } else if (movementState.right) {
        playerAngle += movementPhysics.rotationSpeed;
    }

    // Check if player is close to a wall (within 0.3 units)
    let nearWall = false;
    const checkRadius = 0.3;
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = playerX + dx * checkRadius;
            const ny = playerY + dy * checkRadius;
            const mapX = Math.floor(nx);
            const mapY = Math.floor(ny);
            if (mapY >= 0 && mapY < map.length && mapX >= 0 && mapX < map[0].length) {
                if (map[mapY][mapX] !== 0) {
                    nearWall = true;
                }
            }
        }
    }

    // Handle movement speed
    let speedModifier = 1;
    if (nearWall) speedModifier = 0.4; // Move slower near walls

    if (movementState.forward) {
        movementPhysics.speed = Math.min(movementPhysics.speed + movementPhysics.acceleration, movementPhysics.maxSpeed * speedModifier);
    } else if (movementState.backward) {
        movementPhysics.speed = Math.max(movementPhysics.speed - movementPhysics.acceleration, -movementPhysics.maxSpeed * speedModifier);
    } else {
        // Decelerate when no movement keys are pressed
        if (movementPhysics.speed > 0) {
            movementPhysics.speed = Math.max(0, movementPhysics.speed - movementPhysics.deceleration);
        } else if (movementPhysics.speed < 0) {
            movementPhysics.speed = Math.min(0, movementPhysics.speed + movementPhysics.deceleration);
        }
    }

    // Calculate new position
    if (movementPhysics.speed !== 0) {
        const moveX = Math.cos(playerAngle) * movementPhysics.speed;
        const moveY = Math.sin(playerAngle) * movementPhysics.speed;
        
        // Try moving in X and Y separately
        const newX = playerX + moveX;
        const newY = playerY + moveY;
        
        if (!checkCollision(newX, playerY)) {
            playerX = newX;
        }
        if (!checkCollision(playerX, newY)) {
            playerY = newY;
        }
    }
}

// Modify the player state to include collected weapons
const player = {
    health: 100,
    arms: 1,
    ammo: 100,
    weapons: ['handgun'], // Array of weapons the player has
    currentWeapon: 'handgun', // Currently selected weapon
    collectedWeapons: new Set(['handgun']) // Track which weapons have been collected
};

// Fireball state
let fireball = null;

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

// Listen for Ctrl key to shoot fireball
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !fireball && player.ammo > 0) {
        // Play weapon sound based on current weapon
        try {
            if (player.currentWeapon === 'shotgun') {
                shotgunSound.currentTime = 0;
                shotgunSound.play();
            } else if (player.currentWeapon === 'lizergun') {
                liserSound.currentTime = 0;
                liserSound.play();
            } else if (player.currentWeapon === 'handgun') {
                pistolSound.currentTime = 0;
                pistolSound.play();
            }
        } catch (e) {
            // Ignore play errors
        }
        // Fireball starts at gun muzzle (bottom center)
        const barHeight = 80;
        const gunHeight = 60;
        const startY = canvas.height - barHeight - gunHeight + 10 - 60; // higher by 42px
        fireball = {
            x: canvas.width / 2,
            y: startY,
            startY: startY,
            endY: canvas.height / 2, // horizon
            startRadius: 18,   // was 40
            endRadius: 5,      // was 8
            progress: 0
        };

        // --- NPC hit detection using raycast ---
        // Cast a ray in the player's view direction
        let closestNPC = null;
        let closestDist = Infinity;
        npcs.forEach(npc => {
            // Project NPC position to player space
            const dx = (npc.x + 0.5) - playerX;
            const dy = (npc.y + 0.5) - playerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const angleToNPC = Math.atan2(dy, dx);
            let relAngle = angleToNPC - playerAngle;
            while (relAngle < -Math.PI) relAngle += Math.PI * 2;
            while (relAngle > Math.PI) relAngle -= Math.PI * 2;
            // Consider only NPCs within a small angle threshold (center ray)
            if (Math.abs(relAngle) < (Math.PI / 180) * 10) { // ~10 degrees
                // Check if this NPC is the closest
                if (dist < closestDist) {
                    closestDist = dist;
                    closestNPC = npc;
                }
            }
        });
        // Check if NPC is occluded by a wall
        if (closestNPC) {
            const dx = (closestNPC.x + 0.5) - playerX;
            const dy = (closestNPC.y + 0.5) - playerY;
            const angleToNPC = Math.atan2(dy, dx);
            const ray = castRay(angleToNPC);
            // Only hit if the ray distance is greater than or equal to the NPC distance (no wall in between)
            if (ray.distance >= closestDist - 0.2) { // 0.2 margin for hitbox
                // Skip if NPC is already dead
                if (closestNPC.state === 'dead') {
                    return;
                }
                
                // Calculate damage based on weapon type
                let damage = 0;
                if (player.currentWeapon === 'handgun') {
                    damage = 16.67; // 100/6 = ~16.67 damage per shot to kill in 6 hits
                } else if (player.currentWeapon === 'shotgun') {
                    damage = 33.33; // 100/3 = ~33.33 damage per shot to kill in 3 hits
                } else if (player.currentWeapon === 'lizergun') {
                    damage = 50; // 100/2 = 50 damage per shot to kill in 2 hits
                }

                closestNPC.health -= damage;
                closestNPC.state = 'injured';
                closestNPC.injuredUntil = Date.now() + 1000;
                // Play hurt sound
                try {
                    npcHurtSound.currentTime = 0;
                    npcHurtSound.play();
                } catch (e) {
                    // Ignore play errors
                }
                if (closestNPC.health <= 0) {
                    // Play death sound when NPC is killed
                    console.log('NPC killed, attempting to play death sound');
                    try {
                        niroDeathSound.currentTime = 0;
                        niroDeathSound.muted = false;
                        const playPromise = niroDeathSound.play();
                        if (playPromise !== undefined) {
                            playPromise.then(() => {
                                console.log('Death sound played successfully');
                            }).catch(error => {
                                console.error('Error playing death sound:', error);
                            });
                        }
                    } catch (e) {
                        console.error('Exception playing death sound:', e);
                    }
                    
                    // Set death state and timer only if not already dead
                    if (closestNPC.state !== 'dead') {
                        closestNPC.state = 'dead';
                        closestNPC.deathTime = Date.now();
                    }
                }
            } else {
                console.log('NPC is behind a wall, not hit');
            }
        } else {
            console.log('No NPC hit');
        }

        if (!fireVisible) {
            fireVisible = true;
            setTimeout(() => { fireVisible = false; }, 200);
        }
    }
});

// Animate fireball
function updateFireball() {
    if (fireball) {
        fireball.progress += 0.04; // speed
        if (fireball.progress >= 1) {
            fireball = null;
        }
    }
}

// Draw fireball
function drawFireball() {
    if (!fireball) return;
    // Interpolate position and size
    const t = fireball.progress;
    const y = fireball.startY + (fireball.endY - fireball.startY) * t;
    const r = fireball.startRadius + (fireball.endRadius - fireball.startRadius) * t;
    ctx.save();
    ctx.globalAlpha = 1 - t * 0.7;
    
    // Change fireball color based on current weapon
    if (player.currentWeapon === 'lizergun') {
        // Blue fireball for lizergun
        ctx.beginPath();
        ctx.arc(fireball.x, y, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 40, 255, 0.3)';
        ctx.fill();
        // Main fireball
        ctx.beginPath();
        ctx.arc(fireball.x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'blue';
        ctx.fill();
        // Core
        ctx.beginPath();
        ctx.arc(fireball.x, y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 100, 255, 1)';
        ctx.fill();
    } else {
        // Original red fireball for other weapons
        ctx.beginPath();
        ctx.arc(fireball.x, y, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 40, 0, 0.3)';
        ctx.fill();
        // Main fireball
        ctx.beginPath();
        ctx.arc(fireball.x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        // Core
        ctx.beginPath();
        ctx.arc(fireball.x, y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 100, 100, 1)';
        ctx.fill();
    }
    ctx.restore();
}

// Update DOOM Guy face animation
function updateDoomGuyFaceAnim() {
    const now = performance.now();
    if (doomGuyFaceState === 'normal') {
        if (now > doomGuyNextSmile) {
            doomGuyFaceState = 'smile';
            doomGuyFaceTimeout = now + 300; // smile for 300ms
            doomGuyNextSmile = now + 8000 + Math.random() * 8000;
        } else if (now > doomGuyNextBlink) {
            doomGuyFaceState = 'blink';
            doomGuyFaceTimeout = now + 120; // blink for 120ms
            doomGuyNextBlink = now + 2000 + Math.random() * 2000;
        }
    } else if (doomGuyFaceState === 'blink' || doomGuyFaceState === 'smile') {
        if (now > doomGuyFaceTimeout) {
            doomGuyFaceState = 'normal';
        }
    }
}

// Listen for 'e' key to start door animation
window.addEventListener('keydown', (e) => {
    if (e.key === 'e') {
        const px = Math.floor(playerX);
        const py = Math.floor(playerY);
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = px + dx;
                const ny = py + dy;
                if (map[ny] && (map[ny][nx] === 5 || map[ny][nx] === 8)) {
                    const key = nx + ',' + ny;
                    if (!doorsAnimating[key]) {
                        doorsAnimating[key] = {
                            phase: 'opening',
                            startTime: performance.now(),
                            progress: 0,
                            doorType: map[ny][nx] // Store the original door type
                        };
                        // Play door open sound
                        try {
                            doorOpenSound.currentTime = 0;
                            doorOpenSound.play();
                        } catch (e) {
                            // Ignore play errors
                        }
                    }
                }
            }
        }
    }
});

function updateDoorsAnimating() {
    const now = performance.now();
    for (const key in doorsAnimating) {
        const [x, y] = key.split(',').map(Number);
        const state = doorsAnimating[key];
        if (state.phase === 'opening') {
            state.progress = Math.min(1, (now - state.startTime) / 500);
            if (state.progress >= 1) {
                map[y][x] = 0;
                state.phase = 'open';
                state.startTime = now;
            }
        } else if (state.phase === 'open') {
            if (now - state.startTime > 8000) {
                map[y][x] = state.doorType; // Restore the original door type
                state.phase = 'closing';
                state.startTime = now;
                state.progress = 0;
            }
        } else if (state.phase === 'closing') {
            state.progress = Math.min(1, (now - state.startTime) / 500);
            if (state.progress >= 1) {
                // Play door close sound
                try {
                    doorCloseSound.currentTime = 0;
                    doorCloseSound.play();
                } catch (e) {
                    // Ignore play errors
                }
                delete doorsAnimating[key];
            }
        }
    }
}

// Load and crop handgun.png into 4 transparent images
const handgunSrc = 'handgun.png';
const handgunImages = [];
const handgunImg = new Image();
handgunImg.src = handgunSrc;
handgunImg.onload = () => {
    const frameWidth = handgunImg.width / 4;
    const frameHeight = handgunImg.height;
    for (let i = 0; i < 4; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx2 = canvas.getContext('2d');
        ctx2.drawImage(handgunImg, i * frameWidth - 10, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        // Remove cyan background (0,255,255)
        const imgData = ctx2.getImageData(0, 0, frameWidth, frameHeight);
        for (let p = 0; p < imgData.data.length; p += 4) {
            if (imgData.data[p] === 0 && imgData.data[p+1] === 255 && imgData.data[p+2] === 255) {
                imgData.data[p+3] = 0;
            }
        }
        ctx2.putImageData(imgData, 0, 0);
        handgunImages.push(canvas);
    }
};

// Load and crop shootgun.png into 4 transparent images
const shotgunSrc = 'shootgun.png';
const shotgunImages = [];
const shotgunImg = new Image();
shotgunImg.src = shotgunSrc;
shotgunImg.onload = () => {
    console.log('Shotgun image loaded successfully:', {
        width: shotgunImg.width,
        height: shotgunImg.height
    });
    const frameWidth = shotgunImg.width / 4;
    const frameHeight = shotgunImg.height;
    for (let i = 0; i < 4; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx2 = canvas.getContext('2d');
        ctx2.drawImage(shotgunImg, i * frameWidth - 10, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        // Remove cyan background (0,255,255)
        const imgData = ctx2.getImageData(0, 0, frameWidth, frameHeight);
        for (let p = 0; p < imgData.data.length; p += 4) {
            if (imgData.data[p] === 0 && imgData.data[p+1] === 255 && imgData.data[p+2] === 255) {
                imgData.data[p+3] = 0;
            }
        }
        ctx2.putImageData(imgData, 0, 0);
        shotgunImages.push(canvas);
        console.log(`Shotgun frame ${i} created:`, {
            width: frameWidth,
            height: frameHeight
        });
    }
};
shotgunImg.onerror = () => {
    console.error('Failed to load shotgun image');
};

let gunFrameIndex = 0;

// Add weapon switching
window.addEventListener('keydown', (e) => {
    if (e.key === '1' && player.weapons.includes('handgun')) {
        player.currentWeapon = 'handgun';
        gunFrameIndex = 0;
        console.log('Switched to handgun');
    } else if (e.key === '2' && player.weapons.includes('shotgun')) {
        player.currentWeapon = 'shotgun';
        gunFrameIndex = 0;
        console.log('Switched to shotgun');
    } else if (e.key === '3' && player.weapons.includes('lizergun')) {
        player.currentWeapon = 'lizergun';
        gunFrameIndex = 0;
        console.log('Switched to lizergun');
    }
});

// Modify the drawGun function to only show new weapons
function drawGun() {
    const barHeight = 24;
    let gunImg;
    let scale, gunX, gunY;
    
    if (player.currentWeapon === 'shotgun' && player.collectedWeapons.has('shotgun')) {
        if (shotgunImages[gunFrameIndex]) {
            gunImg = shotgunImages[gunFrameIndex];
            scale = 1.2;
            const gunWidth = gunImg.width * scale;
            const gunHeight = gunImg.height * scale;
            gunX = canvas.width / 2 - gunWidth / 2;
            gunY = canvas.height - gunHeight - 80;
            
            ctx.save();
            ctx.drawImage(
                gunImg,
                0, 0, gunImg.width, gunImg.height,
                gunX, gunY, gunWidth, gunHeight
            );
            ctx.restore();
        }
    } else if (player.currentWeapon === 'handgun' && player.collectedWeapons.has('handgun')) {
        if (handgunImages[gunFrameIndex]) {
            gunImg = handgunImages[gunFrameIndex];
            scale = 0.35;
            const gunWidth = gunImg.width * scale;
            const gunHeight = gunImg.height * scale;
            gunX = canvas.width / 2 - gunWidth / 2 + 50;
            gunY = canvas.height - barHeight - gunHeight - 5;
            
            ctx.save();
            ctx.drawImage(
                gunImg,
                0, 0, gunImg.width, gunImg.height,
                gunX, gunY, gunWidth, gunHeight
            );
            ctx.restore();
        }
    } else if (player.currentWeapon === 'lizergun' && player.collectedWeapons.has('lizergun')) {
        if (lizergunImages[gunFrameIndex]) {
            gunImg = lizergunImages[gunFrameIndex];
            scale = 0.4;
            const gunWidth = gunImg.width * scale;
            const gunHeight = gunImg.height * scale;
            let gunX = canvas.width / 2 - gunWidth / 2;
            
            if (gunFrameIndex > 0 && gunFrameIndex < 4) {
                gunX += 40;
            }
            
            gunY = canvas.height - gunHeight - 2;
            
            ctx.save();
            ctx.drawImage(
                gunImg,
                0, 0, gunImg.width, gunImg.height,
                gunX, gunY, gunWidth, gunHeight
            );
            ctx.restore();
        }
    }
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateFireball();
    updateDoomGuyFaceAnim();
    updateDoorsAnimating();
    updateNPCs();
    collectBulletPickups();
    collectShotgunPickups();
    collectLizergunPickups(); // Add this line
    draw();
    requestAnimationFrame(gameLoop);
}

// Draw the bottom status bar (DOOM-style)
function drawStatusBar() {
    const barHeight = 110;
    const barY = canvas.height - barHeight;
    // Draw metallic gray background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, barY, canvas.width, barHeight);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, barY, canvas.width, barHeight);
    // Top and bottom metallic lines
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, barY + 2);
    ctx.lineTo(canvas.width, barY + 2);
    ctx.moveTo(0, barY + barHeight - 2);
    ctx.lineTo(canvas.width, barY + barHeight - 2);
    ctx.stroke();

    // Centering helpers
    const boxHeight = 60;
    const boxY = barY + (barHeight - boxHeight) / 2;
    const textYOffset = boxY + boxHeight / 2 + 12; // for main numbers
    const labelYOffset = boxY + boxHeight - 6; // for labels

    // Digital font style
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    // AMMO (left)
    ctx.fillStyle = '#222';
    ctx.fillRect(20, boxY, 70, boxHeight);
    ctx.fillStyle = '#f00';
    ctx.fillText(player.ammo.toString(), 55, textYOffset - 10);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('AMMO', 55, labelYOffset);

    // HEALTH (left-center)
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#222';
    ctx.fillRect(120, boxY, 90, boxHeight);
    ctx.fillStyle = '#f00';
    ctx.fillText('100%', 165, textYOffset - 10);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('HEALTH', 165, labelYOffset);

    // ARMS (weapon slots, center)
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#222';
    ctx.fillRect(230, boxY, 180, boxHeight);
    ctx.fillStyle = '#fff';
    for (let i = 1; i <= 6; i++) {
        ctx.fillText(i, 250 + (i - 1) * 28, boxY + 28);
    }
    ctx.font = 'bold 16px monospace';
    ctx.fillText('ARMS', 320, labelYOffset);

    // Face (center, in a square frame)
    const faceBoxSize = 96;
    const faceBoxX = canvas.width / 2 - faceBoxSize / 2;
    const faceBoxY = barY + (barHeight - faceBoxSize) / 2;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.strokeRect(faceBoxX, faceBoxY, faceBoxSize, faceBoxSize);
    ctx.fillStyle = '#444';
    ctx.fillRect(faceBoxX + 2, faceBoxY + 2, faceBoxSize - 4, faceBoxSize - 4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(faceBoxX + 2, faceBoxY + 2, faceBoxSize - 4, faceBoxSize - 4);
    ctx.clip();
    // Draw animated DOOM Guy face
    let faceImg = doomGuyFaceNormal;
    if (doomGuyFaceState === 'blink') faceImg = doomGuyFaceBlink;
    else if (doomGuyFaceState === 'smile') faceImg = doomGuyFaceSmile;
    if (faceImg.complete && faceImg.naturalWidth > 0) {
        ctx.drawImage(faceImg, faceBoxX + 2, faceBoxY + 2, faceBoxSize - 4, faceBoxSize - 4);
    }
    ctx.restore();

    // ARMOR (right-center)
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#222';
    ctx.fillRect(canvas.width - 210, boxY, 90, boxHeight);
    ctx.fillStyle = '#f00';
    ctx.fillText('300', canvas.width - 165, textYOffset - 10);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('ARMOR', canvas.width - 165, labelYOffset);

    // Ammo types (right, yellow)
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#222';
    ctx.fillRect(canvas.width - 100, boxY, 80, boxHeight);
    ctx.fillStyle = '#ff0';
    ctx.textAlign = 'right';
    ctx.fillText('BULL', canvas.width - 60, boxY + 22);
    ctx.fillText('SHEL', canvas.width - 60, boxY + 38);
    ctx.fillText('ROKT', canvas.width - 60, boxY + 54);
    ctx.fillText('CELL', canvas.width - 60, boxY + 70);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('45', canvas.width - 95, boxY + 22);
    ctx.fillText('7', canvas.width - 95, boxY + 38);
    ctx.fillText('50', canvas.width - 95, boxY + 54);
    ctx.fillText('300', canvas.width - 95, boxY + 70);
}

// Main draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw3DView();
    drawMap();
    drawGun();
    drawFireball();
    drawStatusBar();
}

let gunIsAnimating = false;
let gunAnimTimeout = null;

// Update drawStatusBar to use player.ammo
function drawStatusBar() {
    const barHeight = 110;
    const barY = canvas.height - barHeight;
    // Draw metallic gray background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, barY, canvas.width, barHeight);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, barY, canvas.width, barHeight);
    // Top and bottom metallic lines
    ctx.strokeStyle = '#bbb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, barY + 2);
    ctx.lineTo(canvas.width, barY + 2);
    ctx.moveTo(0, barY + barHeight - 2);
    ctx.lineTo(canvas.width, barY + barHeight - 2);
    ctx.stroke();

    // Centering helpers
    const boxHeight = 60;
    const boxY = barY + (barHeight - boxHeight) / 2;
    const textYOffset = boxY + boxHeight / 2 + 12; // for main numbers
    const labelYOffset = boxY + boxHeight - 6; // for labels

    // Digital font style
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    // AMMO (left)
    ctx.fillStyle = '#222';
    ctx.fillRect(20, boxY, 70, boxHeight);
    ctx.fillStyle = '#f00';
    ctx.fillText(player.ammo.toString(), 55, textYOffset - 10);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('AMMO', 55, labelYOffset);

    // HEALTH (left-center)
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#222';
    ctx.fillRect(120, boxY, 90, boxHeight);
    ctx.fillStyle = '#f00';
    ctx.fillText('100%', 165, textYOffset - 10);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('HEALTH', 165, labelYOffset);

    // ARMS (weapon slots, center)
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#222';
    ctx.fillRect(230, boxY, 180, boxHeight);
    ctx.fillStyle = '#fff';
    for (let i = 1; i <= 6; i++) {
        ctx.fillText(i, 250 + (i - 1) * 28, boxY + 28);
    }
    ctx.font = 'bold 16px monospace';
    ctx.fillText('ARMS', 320, labelYOffset);

    // Face (center, in a square frame)
    const faceBoxSize = 96;
    const faceBoxX = canvas.width / 2 - faceBoxSize / 2;
    const faceBoxY = barY + (barHeight - faceBoxSize) / 2;
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.strokeRect(faceBoxX, faceBoxY, faceBoxSize, faceBoxSize);
    ctx.fillStyle = '#444';
    ctx.fillRect(faceBoxX + 2, faceBoxY + 2, faceBoxSize - 4, faceBoxSize - 4);
    ctx.save();
    ctx.beginPath();
    ctx.rect(faceBoxX + 2, faceBoxY + 2, faceBoxSize - 4, faceBoxSize - 4);
    ctx.clip();
    // Draw animated DOOM Guy face
    let faceImg = doomGuyFaceNormal;
    if (doomGuyFaceState === 'blink') faceImg = doomGuyFaceBlink;
    else if (doomGuyFaceState === 'smile') faceImg = doomGuyFaceSmile;
    if (faceImg.complete && faceImg.naturalWidth > 0) {
        ctx.drawImage(faceImg, faceBoxX + 2, faceBoxY + 2, faceBoxSize - 4, faceBoxSize - 4);
    }
    ctx.restore();

    // ARMOR (right-center)
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#222';
    ctx.fillRect(canvas.width - 210, boxY, 90, boxHeight);
    ctx.fillStyle = '#f00';
    ctx.fillText('300', canvas.width - 165, textYOffset - 10);
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('ARMOR', canvas.width - 165, labelYOffset);

    // Ammo types (right, yellow)
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#222';
    ctx.fillRect(canvas.width - 100, boxY, 80, boxHeight);
    ctx.fillStyle = '#ff0';
    ctx.textAlign = 'right';
    ctx.fillText('BULL', canvas.width - 60, boxY + 22);
    ctx.fillText('SHEL', canvas.width - 60, boxY + 38);
    ctx.fillText('ROKT', canvas.width - 60, boxY + 54);
    ctx.fillText('CELL', canvas.width - 60, boxY + 70);
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText('45', canvas.width - 95, boxY + 22);
    ctx.fillText('7', canvas.width - 95, boxY + 38);
    ctx.fillText('50', canvas.width - 95, boxY + 54);
    ctx.fillText('300', canvas.width - 95, boxY + 70);
}

// Update fireGunAnimation to decrease ammo and prevent firing at 0
function fireGunAnimation() {
    if (gunIsAnimating || player.ammo <= 0) return; // Prevent overlapping animations or firing with no ammo
    player.ammo = Math.max(0, player.ammo - 1);
    gunIsAnimating = true;
    gunFrameIndex = 1;
    if (gunAnimTimeout) clearTimeout(gunAnimTimeout);
    gunAnimTimeout = setTimeout(() => {
        gunFrameIndex = 2;
        gunAnimTimeout = setTimeout(() => {
            gunFrameIndex = 3;
            gunAnimTimeout = setTimeout(() => {
                gunFrameIndex = 0;
                gunIsAnimating = false;
            }, 150);
        }, 50);
    }, 50);
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        fireGunAnimation();
        if (!fireVisible) {
            fireVisible = true;
            setTimeout(() => { fireVisible = false; }, 200);
        }
    }
});

// --- Bullet Pickup State ---
const bulletPickups = [];
const maxBulletPickups = 15;
const bulletPickupImg = new Image();
bulletPickupImg.src = 'shootgun_bullets.png';

// Helper to get all empty cells
function getEmptyCells() {
    const empty = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (map[y][x] === 0 && !bulletPickups.some(b => b.x === x && b.y === y)) {
                empty.push({x, y});
            }
        }
    }
    return empty;
}

// Spawn a bullet pickup at a random empty cell
function spawnBulletPickup() {
    if (bulletPickups.length >= maxBulletPickups) return;
    const emptyCells = getEmptyCells();
    if (emptyCells.length === 0) return;
    const idx = Math.floor(Math.random() * emptyCells.length);
    const pos = emptyCells[idx];
    bulletPickups.push({ x: pos.x, y: pos.y });
}

// Start bullet pickup spawning interval
setInterval(() => {
    spawnBulletPickup();
}, 1000);

function collectBulletPickups() {
    for (let i = bulletPickups.length - 1; i >= 0; i--) {
        const b = bulletPickups[i];
        const dx = (b.x + 0.5) - playerX;
        const dy = (b.y + 0.5) - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.6) { // same threshold as hiding sprite
            bulletPickups.splice(i, 1); // Remove the pickup
            player.ammo += 5;           // Add 5 ammo
            // Play weapon pickup sound (for bullets too)
            try {
                weaponPickupSound.currentTime = 0;
                weaponPickupSound.play();
            } catch (e) {}
        }
    }
}

const npcs = [];
const maxNPCs = 15;

// Restore the getEmptyCellsForNPC function
function getEmptyCellsForNPC() {
    const empty = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (
                map[y][x] === 0 &&
                !npcs.some(n => n.x === x && n.y === y) &&
                !bulletPickups.some(b => b.x === x && b.y === y)
            ) {
                empty.push({x, y});
            }
        }
    }
    return empty;
}

// Add sprite sheet loading and splitting
const npcWalkingSpriteSheet = new Image();
npcWalkingSpriteSheet.src = 'niro_walking_sprite_sheet.png';
const npcWalkingImages = {
    right: [],    // top row, all 4 frames
    left: [],     // bottom row, first 3 frames
    back: null    // bottom row, last frame
};

npcWalkingSpriteSheet.onload = () => {
    const frameWidth = npcWalkingSpriteSheet.width / 4;

    // Manually set the y and height for each row
    const topRowY = 0;
    const topRowHeight = 456;
    const bottomRowY = 26; // This is a bit lower than half the image
    const bottomRowHeight = 456;

    // Top row - walking right
    for (let i = 0; i < 4; i++) {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameWidth;
        frameCanvas.height = topRowHeight;
        const frameCtx = frameCanvas.getContext('2d');
        frameCtx.drawImage(
            npcWalkingSpriteSheet,
            i * frameWidth, topRowY,         // Source x, y
            frameWidth, topRowHeight,        // Source width, height
            0, 0,                            // Dest x, y
            frameWidth, topRowHeight         // Dest width, height
        );
        npcWalkingImages.right.push(frameCanvas);
    }

    // Bottom row - walking left (first 3 frames)
    for (let i = 0; i < 3; i++) {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameWidth;
        frameCanvas.height = bottomRowHeight;
        const frameCtx = frameCanvas.getContext('2d');
        frameCtx.drawImage(
            npcWalkingSpriteSheet,
            i * frameWidth, bottomRowY,      // Source x, y
            frameWidth, bottomRowHeight,     // Source width, height
            0, 0,                            // Dest x, y
            frameWidth, bottomRowHeight      // Dest width, height
        );
        npcWalkingImages.left.push(frameCanvas);
    }

    // Back walking frame (last frame, bottom row)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = frameWidth;
    backCanvas.height = bottomRowHeight;
    const backCtx = backCanvas.getContext('2d');
    backCtx.drawImage(
        npcWalkingSpriteSheet,
        3 * frameWidth, bottomRowY,         // Source x, y
        frameWidth, bottomRowHeight,        // Source width, height
        0, 0,                               // Dest x, y
        frameWidth, bottomRowHeight         // Dest width, height
    );
    npcWalkingImages.back = backCanvas;
};

function spawnNPC() {
    if (npcs.length >= maxNPCs) return;
    const emptyCells = getEmptyCellsForNPC();
    if (emptyCells.length === 0) return;
    const idx = Math.floor(Math.random() * emptyCells.length);
    const pos = emptyCells[idx];
    npcs.push({ 
        x: pos.x, 
        y: pos.y, 
        health: 100, 
        width: 1, 
        height: 1, 
        state: 'standing', 
        injuredUntil: 0,
        moveDirection: Math.random() * Math.PI * 2,
        moveTimer: 0,
        moveSpeed: 0.002,
        walkFrame: 0,              // Current frame in the walking animation
        walkAnimTimer: 0,          // Timer for walking animation
        lastX: pos.x,             // Previous X position to determine movement direction
        lastY: pos.y,              // Previous Y position to determine movement direction
        lastDirectionChange: Date.now()
    });
}

// Update the initial NPC spawn to include animation properties
npcs.push({ 
    x: Math.floor(playerX), 
    y: Math.floor(playerY) + 1, 
    health: 100, 
    width: 1, 
    height: 1, 
    state: 'standing', 
    injuredUntil: 0,
    moveDirection: Math.random() * Math.PI * 2,
    moveTimer: 0,
    moveSpeed: 0.002,
    walkFrame: 0,
    walkAnimTimer: 0,
    lastX: Math.floor(playerX),
    lastY: Math.floor(playerY) + 1,
    lastDirectionChange: Date.now()
});

// Helper function to get the appropriate sprite for NPC movement
function getNPCSprite(npc) {
    // Handle death state
    if (npc.state === 'dead') {
        const timeSinceDeath = Date.now() - npc.deathTime;
        if (timeSinceDeath < 1000) {
            // Show falling sprite for first 1000ms
            return npcFallingImg;
        }
        // After 1000ms, show death sprite
        return npcDeadImg;
    }
    
    // Handle injured state
    if (npc.state === 'injured' && Date.now() < npc.injuredUntil) {
        if (!npcInjuredWalkingImages.right.length) {
            npc.isWalkingLeft = false;
            return npcInjuredImg;
        }
        const dx = npc.x - npc.lastX;
        const dy = npc.y - npc.lastY;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
            npc.isWalkingLeft = false;
            return npcInjuredImg;
        }
        if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) {
                npc.isWalkingLeft = false;
                return npcInjuredWalkingImages.right[npc.walkFrame % 4] || npcInjuredImg;
            } else {
                npc.isWalkingLeft = true;
                return npcInjuredWalkingImages.left[npc.walkFrame % 3] || npcInjuredImg;
            }
        } else {
            npc.isWalkingLeft = false;
            if (dy < 0) {
                return npcInjuredWalkingImages.back || npcInjuredImg;
            } else {
                return npcInjuredWalkingImages.right[npc.walkFrame % 4] || npcInjuredImg;
            }
        }
    }

    // If sprite sheet hasn't loaded yet, use standing sprite
    if (!npcWalkingImages.right.length) {
        npc.isWalkingLeft = false;
        return npcImg;
    }

    const dx = npc.x - npc.lastX;
    const dy = npc.y - npc.lastY;
    if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
        npc.isWalkingLeft = false;
        return npcImg;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
            npc.isWalkingLeft = false;
            return npcWalkingImages.right[npc.walkFrame % 4] || npcImg;
        } else {
            npc.isWalkingLeft = true;
            return npcWalkingImages.left[npc.walkFrame % 3] || npcImg;
        }
    } else {
        npc.isWalkingLeft = false;
        if (dy < 0) {
            return npcWalkingImages.back || npcImg;
        } else {
            return npcWalkingImages.right[npc.walkFrame % 4] || npcImg;
        }
    }
}

// Update the NPC movement function to handle animation
function updateNPCs() {
    npcs.forEach(npc => {
        npc.lastX = npc.x;
        npc.lastY = npc.y;

        // Change direction every 5000 ms
        const now = Date.now();
        if (now - npc.lastDirectionChange > 5000) {
            npc.moveDirection = Math.random() * Math.PI * 2;
            npc.lastDirectionChange = now;
        }

        // Calculate potential new position
        const newX = npc.x + Math.cos(npc.moveDirection) * npc.moveSpeed;
        const newY = npc.y + Math.sin(npc.moveDirection) * npc.moveSpeed;

        // Check for collisions with walls
        const cellX = Math.floor(newX);
        const cellY = Math.floor(newY);
        if (map[cellY] && map[cellY][cellX] === 0) {
            // Check for collisions with other NPCs
            const hasNPCCollision = npcs.some(otherNpc => {
                if (otherNpc === npc) return false;
                const dx = Math.abs(newX - otherNpc.x);
                const dy = Math.abs(newY - otherNpc.y);
                return dx < 0.8 && dy < 0.8;
            });

            // Check for collision with player
            const playerDx = Math.abs(newX - playerX);
            const playerDy = Math.abs(newY - playerY);
            const hasPlayerCollision = playerDx < 0.8 && playerDy < 0.8;

            if (!hasNPCCollision && !hasPlayerCollision) {
                npc.x = newX;
                npc.y = newY;
                
                // Update walking animation
                npc.walkAnimTimer++;
                if (npc.walkAnimTimer > 10) {
                    npc.walkFrame = (npc.walkFrame + 1) % 4;
                    npc.walkAnimTimer = 0;
                }
            } else {
                // If blocked, pick a new direction immediately, but don't reset the timer
                npc.moveDirection = Math.random() * Math.PI * 2;
            }
        } else {
            // If blocked by wall, pick a new direction immediately, but don't reset the timer
            npc.moveDirection = Math.random() * Math.PI * 2;
        }
    });
}

// Restore the NPC spawning interval
setInterval(() => {
    spawnNPC();
}, 1000);

// Add error handling for sprite sheet loading
npcWalkingSpriteSheet.onerror = () => {
    console.error('Failed to load NPC walking sprite sheet');
};

const npcInjuredWalkingSpriteSheet = new Image();
npcInjuredWalkingSpriteSheet.src = 'niros_injured.png';
const npcInjuredWalkingImages = {
    right: [],
    left: [],
    back: null
};

npcInjuredWalkingSpriteSheet.onload = () => {
    const frameWidth = npcInjuredWalkingSpriteSheet.width / 4;
    // Use the same crop values as for the normal walking sheet
    const topRowY = 0;
    const topRowHeight = 456;
    const bottomRowY = 26;
    const bottomRowHeight = 456;

    // Top row - walking right
    for (let i = 0; i < 4; i++) {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameWidth;
        frameCanvas.height = topRowHeight;
        const frameCtx = frameCanvas.getContext('2d');
        frameCtx.drawImage(
            npcInjuredWalkingSpriteSheet,
            i * frameWidth, topRowY,
            frameWidth, topRowHeight,
            0, 0,
            frameWidth, topRowHeight
        );
        npcInjuredWalkingImages.right.push(frameCanvas);
    }

    // Bottom row - walking left (first 3 frames)
    for (let i = 0; i < 3; i++) {
        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameWidth;
        frameCanvas.height = bottomRowHeight;
        const frameCtx = frameCanvas.getContext('2d');
        frameCtx.drawImage(
            npcInjuredWalkingSpriteSheet,
            i * frameWidth, bottomRowY,
            frameWidth, bottomRowHeight,
            0, 0,
            frameWidth, bottomRowHeight
        );
        npcInjuredWalkingImages.left.push(frameCanvas);
    }

    // Back walking frame (last frame, bottom row)
    const backCanvas = document.createElement('canvas');
    backCanvas.width = frameWidth;
    backCanvas.height = bottomRowHeight;
    const backCtx = backCanvas.getContext('2d');
    backCtx.drawImage(
        npcInjuredWalkingSpriteSheet,
        3 * frameWidth, bottomRowY,
        frameWidth, bottomRowHeight,
        0, 0,
        frameWidth, bottomRowHeight
    );
    npcInjuredWalkingImages.back = backCanvas;
};

function checkNPCCollision(x, y) {
    const npcRadius = 0.2;
    const corners = [
        { x: x - npcRadius, y: y - npcRadius },
        { x: x + npcRadius, y: y - npcRadius },
        { x: x - npcRadius, y: y + npcRadius },
        { x: x + npcRadius, y: y + npcRadius }
    ];
    for (const corner of corners) {
        const mapX = Math.floor(corner.x);
        const mapY = Math.floor(corner.y);
        if (
            mapX < 0 || mapX >= map[0].length ||
            mapY < 0 || mapY >= map.length ||
            map[mapY][mapX] !== 0
        ) {
            return true; // Collides with wall or out of bounds
        }
    }
    return false;
}

// --- Shotgun Pickup State ---
const shotgunPickups = [];
const maxShotgunPickups = 7; // Changed to 7 pickups
const shotgunPickupImg = new Image();
shotgunPickupImg.src = 'drop_shootgun.png';

// Helper to get all empty cells not occupied by pickups
function getEmptyCellsForShotgun() {
    const empty = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (
                map[y][x] === 0 &&
                !bulletPickups.some(b => b.x === x && b.y === y) &&
                !shotgunPickups.some(s => s.x === x && s.y === y)
            ) {
                empty.push({x, y});
            }
        }
    }
    return empty;
}

// Spawn a shotgun pickup at a random empty cell
function spawnShotgunPickup() {
    if (shotgunPickups.length >= maxShotgunPickups) return;
    const emptyCells = getEmptyCellsForShotgun();
    if (emptyCells.length === 0) return;
    const idx = Math.floor(Math.random() * emptyCells.length);
    const pos = emptyCells[idx];
    shotgunPickups.push({ x: pos.x, y: pos.y });
    console.log('Shotgun spawned. Current count:', shotgunPickups.length);
}

// Initial spawn of shotguns
for (let i = 0; i < maxShotgunPickups; i++) {
    spawnShotgunPickup();
}

// Modify the collectShotgunPickups function
function collectShotgunPickups() {
    for (let i = shotgunPickups.length - 1; i >= 0; i--) {
        const s = shotgunPickups[i];
        const dx = (s.x + 0.5) - playerX;
        const dy = (s.y + 0.5) - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.6) {
            shotgunPickups.splice(i, 1);
            // Add ammo regardless of whether the weapon is new or not
            player.ammo += 10;
            
            // Add shotgun to player's weapons if not already owned
            if (!player.collectedWeapons.has('shotgun')) {
                player.weapons.push('shotgun');
                player.collectedWeapons.add('shotgun');
                // Only switch to shotgun if it's a new weapon
                player.currentWeapon = 'shotgun';
                gunFrameIndex = 0;
                console.log('New weapon acquired: shotgun and automatically equipped');
            }
            // Play weapon pickup sound
            try {
                weaponPickupSound.currentTime = 0;
                weaponPickupSound.play();
            } catch (e) {}
            // Spawn a new shotgun immediately to maintain the count
            spawnShotgunPickup();
        }
    }
}

// --- Lizergun Pickup State ---
const lizergunPickups = [];
const maxLizergunPickups = 7;
const lizergunPickupImg = new Image();
lizergunPickupImg.src = 'lizergun.png';

// Helper to get all empty cells not occupied by pickups
function getEmptyCellsForLizergun() {
    const empty = [];
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[0].length; x++) {
            if (
                map[y][x] === 0 &&
                !bulletPickups.some(b => b.x === x && b.y === y) &&
                !shotgunPickups.some(s => s.x === x && s.y === y) &&
                !lizergunPickups.some(l => l.x === x && l.y === y)
            ) {
                empty.push({x, y});
            }
        }
    }
    return empty;
}

// Spawn a lizergun pickup at a random empty cell
function spawnLizergunPickup() {
    if (lizergunPickups.length >= maxLizergunPickups) return;
    const emptyCells = getEmptyCellsForLizergun();
    if (emptyCells.length === 0) return;
    const idx = Math.floor(Math.random() * emptyCells.length);
    const pos = emptyCells[idx];
    lizergunPickups.push({ x: pos.x, y: pos.y });
    console.log('Lizergun spawned. Current count:', lizergunPickups.length);
}

// Initial spawn of lizerguns
for (let i = 0; i < maxLizergunPickups; i++) {
    spawnLizergunPickup();
}

// Modify the collectLizergunPickups function
function collectLizergunPickups() {
    for (let i = lizergunPickups.length - 1; i >= 0; i--) {
        const l = lizergunPickups[i];
        const dx = (l.x + 0.5) - playerX;
        const dy = (l.y + 0.5) - playerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 0.6) {
            lizergunPickups.splice(i, 1);
            // Add ammo regardless of whether the weapon is new or not
            player.ammo += 10;
            
            // Add lizergun to player's weapons if not already owned
            if (!player.collectedWeapons.has('lizergun')) {
                player.weapons.push('lizergun');
                player.collectedWeapons.add('lizergun');
                // Only switch to lizergun if it's a new weapon
                player.currentWeapon = 'lizergun';
                gunFrameIndex = 0;
                console.log('New weapon acquired: lizergun and automatically equipped');
            }
            // Play weapon pickup sound
            try {
                weaponPickupSound.currentTime = 0;
                weaponPickupSound.play();
            } catch (e) {}
            // Spawn a new lizergun immediately to maintain the count
            spawnLizergunPickup();
        }
    }
}

// Load and crop lizergun.png into 4 transparent images
const lizergunSrc = 'liser_fps.png';
const lizergunImages = [];
const lizergunImg = new Image();
lizergunImg.src = lizergunSrc;
lizergunImg.onload = () => {
    console.log('Lizergun image loaded successfully:', {
        width: lizergunImg.width,
        height: lizergunImg.height
    });
    const frameWidth = Math.floor(lizergunImg.width / 4);
    const frameHeight = lizergunImg.height;
    lizergunImages.length = 0;
    const cropOffset = 15; // Increased number of pixels to shift crop to the right
    for (let i = 0; i < 4; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx2 = canvas.getContext('2d');
        // For the last frame, make sure we don't overflow the image
        let sx = i * frameWidth + cropOffset;
        let sw = (i === 3) ? (lizergunImg.width - sx) : frameWidth;
        // Prevent sw from being negative or zero
        if (sw < 1) sw = 1;
        ctx2.drawImage(
            lizergunImg,
            sx, 0,  // Source x, y
            sw, frameHeight,  // Source width, height
            0, 0,  // Destination x, y
            frameWidth, frameHeight  // Destination width, height
        );
        // Remove cyan background (0,255,255)
        const imgData = ctx2.getImageData(0, 0, frameWidth, frameHeight);
        for (let p = 0; p < imgData.data.length; p += 4) {
            if (imgData.data[p] === 0 && imgData.data[p+1] === 255 && imgData.data[p+2] === 255) {
                imgData.data[p+3] = 0;
            }
        }
        ctx2.putImageData(imgData, 0, 0);
        lizergunImages.push(canvas);
        console.log(`Lizergun frame ${i} created:`, {
            width: frameWidth,
            height: frameHeight,
            sourceX: sx,
            sourceWidth: sw
        });
    }
};

// --- Play background music in a loop when user starts moving ---
const bgMusic = new Audio('level1.mp3');
bgMusic.loop = true;
bgMusic.volume = 1.0; // Set volume as desired
let musicStarted = false;

function startMusicOnMove(event) {
    if (!musicStarted && (
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === 'w' || event.key === 'a' || event.key === 's' || event.key === 'd'
    )) {
        bgMusic.play();
        musicStarted = true;
        window.removeEventListener('keydown', startMusicOnMove);
    }
}
window.addEventListener('keydown', startMusicOnMove);

// Add to the sound loading section at the top of the file
const niroDeathSound = new Audio('niro_death.wav');
niroDeathSound.volume = 1.0; // Increase volume to maximum
niroDeathSound.muted = false; // Ensure it's not muted

// Add load event listener to verify sound loading
niroDeathSound.addEventListener('canplaythrough', () => {
    console.log('Death sound loaded successfully');
    // Test play the sound when it loads
    niroDeathSound.play().then(() => {
        console.log('Test play successful');
    }).catch(error => {
        console.error('Test play failed:', error);
    });
});

niroDeathSound.addEventListener('error', (e) => {
    console.error('Error loading death sound:', e);
});

// ... existing code ...

// In the updateNPCs function, modify the health check section
// ... rest of the file remains unchanged ...
