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

// Game map where 1 represents walls, 2 represents doors, and 0 represents walkable spaces
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 3, 6, 3, 4, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 4, 0, 0, 3, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 3, 0, 0, 4, 0, 0, 0, 0, 2, 0, 0, 0, 1],
    [1, 0, 4, 0, 0, 5, 0, 0, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 3, 0, 0, 4, 0, 0, 0, 0, 3, 0, 0, 0, 1],
    [1, 5, 4, 0, 0, 3, 0, 0, 0, 0, 6, 0, 0, 0, 1],
    [1, 0, 0, 4, 3, 4, 0, 0, 0, 0, 3, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 6, 5, 3, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
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
wallTexture.src = 'doom_wall.png';

// Load building wall texture
const buildingWallTexture = new Image();
buildingWallTexture.src = 'doom_wall4.png';

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

// Only start the game loop after the wall texture is loaded
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
doomWall2Texture.src = 'doom_wall2.png';
const doomWall3Texture = new Image();
doomWall3Texture.src = 'doom_wall3.png';
const doomDoorTexture = new Image();
doomDoorTexture.src = 'doom_door.png';
const magicWallTexture = new Image();
magicWallTexture.src = 'magic_wall.png';

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
        if ([1,2,3,4,5,6].includes(map[mapY][mapX])) {
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

// Draw the 3D view using ray casting
function draw3DView() {
    const rayAngle = playerAngle - FOV / 2;
    const angleStep = FOV / NUM_RAYS;
    // Draw ceiling with solid dark color
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    // Draw floor with simple distance-based shading
    const floorHeight = canvas.height / 2;
    const horizonY = floorHeight;
    for (let y = 0; y < floorHeight; y++) {
        const perspectiveFactor = y / floorHeight;
        const distanceFactor = 1 - perspectiveFactor;
        const shadowIntensity = Math.min(1, distanceFactor * 2);
        const shadowFactor = 1 - (shadowIntensity * WALL_SHADOW_FACTOR);
        const floorColor = applyShadow(FLOOR_COLOR, shadowFactor);
        ctx.fillStyle = floorColor;
        ctx.fillRect(0, horizonY + y, canvas.width, 1);
    }
    // Cast rays and draw walls
    for (let i = 0; i < NUM_RAYS; i++) {
        const currentAngle = rayAngle + i * angleStep;
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
            } else {
                ctx.fillStyle = FLOOR_COLOR;
            }
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
    
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
    // Player's radius (smaller than a cell)
    const playerRadius = 0.2;
    // Check the four corners of the player's hitbox
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
        if ([1,2,3,4,5,6].includes(map[mapY][mapX])) {
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

    // Handle movement speed
    if (movementState.forward) {
        movementPhysics.speed = Math.min(movementPhysics.speed + movementPhysics.acceleration, movementPhysics.maxSpeed);
    } else if (movementState.backward) {
        movementPhysics.speed = Math.max(movementPhysics.speed - movementPhysics.acceleration, -movementPhysics.maxSpeed);
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
        const newX = playerX + Math.cos(playerAngle) * movementPhysics.speed;
        const newY = playerY + Math.sin(playerAngle) * movementPhysics.speed;

        // Only update position if there's no collision
        if (!checkCollision(newX, newY)) {
            playerX = newX;
            playerY = newY;
        } else {
            // Stop movement on collision
            movementPhysics.speed = 0;
        }
    }
}

// Fireball state
let fireball = null;

// Listen for Ctrl key to shoot fireball
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !fireball) {
        // Fireball starts at gun muzzle (bottom center)
        const barHeight = 80;
        const gunHeight = 60;
        const startY = canvas.height - barHeight - gunHeight + 10 - 18; // gun muzzle Y
        fireball = {
            x: canvas.width / 2,
            y: startY,
            startY: startY,
            endY: canvas.height / 2, // horizon
            startRadius: 40,
            endRadius: 8,
            progress: 0 // 0=start, 1=end
        };
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
    // Outer glow
    ctx.beginPath();
    ctx.arc(fireball.x, y, r * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 180, 0, 0.3)';
    ctx.fill();
    // Main fireball
    ctx.beginPath();
    ctx.arc(fireball.x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = 'orange';
    ctx.fill();
    // Core
    ctx.beginPath();
    ctx.arc(fireball.x, y, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'yellow';
    ctx.fill();
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
                if (map[ny] && map[ny][nx] === 5) {
                    const key = nx + ',' + ny;
                    if (!doorsAnimating[key]) {
                        doorsAnimating[key] = {
                            phase: 'opening',
                            startTime: performance.now(),
                            progress: 0
                        };
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
                map[y][x] = 5; // block for closing anim
                state.phase = 'closing';
                state.startTime = now;
                state.progress = 0;
            }
        } else if (state.phase === 'closing') {
            state.progress = Math.min(1, (now - state.startTime) / 500);
            if (state.progress >= 1) {
                delete doorsAnimating[key];
            }
        }
    }
}

// Load and crop shootgun.png into 4 transparent images
const shootgunSrc = 'shootgun.png';
const shootgunImages = [];
const shootgunImg = new Image();
shootgunImg.src = shootgunSrc;
shootgunImg.onload = () => {
    const frameWidth = shootgunImg.width / 4;
    const frameHeight = shootgunImg.height;
    for (let i = 0; i < 4; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = frameWidth;
        canvas.height = frameHeight;
        const ctx2 = canvas.getContext('2d');
        ctx2.drawImage(shootgunImg, i * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
        // Remove cyan background (0,255,255)
        const imgData = ctx2.getImageData(0, 0, frameWidth, frameHeight);
        for (let p = 0; p < imgData.data.length; p += 4) {
            if (imgData.data[p] === 0 && imgData.data[p+1] === 255 && imgData.data[p+2] === 255) {
                imgData.data[p+3] = 0;
            }
        }
        ctx2.putImageData(imgData, 0, 0);
        shootgunImages.push(canvas);
        console.log('Loaded gun frame', i, canvas.width, canvas.height);
    }
};

// Replace drawGun to use the first shootgun image
function drawGun() {
    const barHeight = 38;
    const gunImg = shootgunImages[0];
    if (gunImg) {
        const gunWidth = gunImg.width;
        const gunHeight = gunImg.height;
        const gunX = canvas.width / 2 - gunWidth / 2;
        const gunY = canvas.height - barHeight - gunHeight - 60;
        ctx.drawImage(gunImg, gunX, gunY);
    }
}

// Game loop
function gameLoop() {
    updatePlayer();
    updateFireball();
    updateDoomGuyFaceAnim();
    updateDoorsAnimating();
    draw();
    requestAnimationFrame(gameLoop);
}

// Draw the bottom status bar (DOOM-style)
function drawStatusBar() {
    const barHeight = 120;
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
    ctx.fillText('45', 55, textYOffset - 10);
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