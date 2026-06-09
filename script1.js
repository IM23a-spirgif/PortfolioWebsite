//Basics
const welcomeScreen = document.getElementById('welcome-screen');
const enterButton = document.getElementById('enter-button');
const snowContainer = document.getElementById('snow-container');
const gameContainer = document.getElementById('game-container');
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('content-overlay');
const sectionTitle = document.getElementById('section-title');
const sectionContent = document.getElementById('section-content');
const projectSection = document.getElementById('projects');
const projectDivs = projectSection.getElementsByClassName('project');
let projects = [];
let detailsScrollPosition = 0;
const detailsScrollStep = 30;
let detailsMaxScroll = 0;
let gameState = "outside";
const interiorBackground = new Image();
interiorBackground.src = "img/house-interior.png";
let lastInputTime = performance.now();
let isPaused = false;
const MAP_WIDTH = 3000;
const npcDialog = document.getElementById("npc-dialog");
const dialogText = document.getElementById("npc-dialog-text");
const dialogOption1 = document.getElementById("dialog-option-1");
const dialogOption2 = document.getElementById("dialog-option-2");
const dialogOption3 = document.getElementById("dialog-option-3");
const menuBackground = new Image();
menuBackground.src = "img/menu-background-projects-1.png";
let menuVisible = false;
const message = {
    x: 0,
    y: 0,
    text: "Press Enter to open the menu!",
    visible: false,
};
const houseMessage = {
    text: "Press Enter to enter the house!",
    visible: false,
    x: 0,
    y: 0
};
const npcMessage = {
    text: "Press E to talk",
    visible: false,
    x: 0,
    y: 0
};
const controlsImage = new Image(200, 200);
controlsImage.src = 'img/controls.png';
const backgrounds = [
    'img/project-background-1.png',
    'img/project-background-2.png',
    'img/project-background-3.png'
];
let scrollPosition = 0;
const backgroundImages = backgrounds.map(src => {
    const img = new Image();
    img.src = src;
    return img;
});
let selectedBackgrounds = [];

function resetInactivityTimer() {
    lastInputTime = performance.now();
}

window.addEventListener("keydown", resetInactivityTimer);
window.addEventListener("mousedown", resetInactivityTimer);
window.addEventListener("touchstart", resetInactivityTimer);
let character = {x: 50, y: -800, width: 50, height: 50, dx: 0, dy: 0, speed: 3, facingRight: false};
let gravity = 0.9;
let isJumping = false;
let floorHeight = canvas.height - 50;
let snowflakes = [];
let snowOnGround = [];
const keyState = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    d: false,
    a: false,
    w: false
};
const spriteSheets = {
    idle: new Image(),
    walk: new Image(),
    jump: new Image(),
    fall: new Image(),
    land: new Image(),
};
spriteSheets.idle.src = './Spritesheets/Idle.png';
spriteSheets.walk.src = './Spritesheets/Walk.png';
spriteSheets.jump.src = './Spritesheets/Jump.png';
spriteSheets.fall.src = './Spritesheets/Fall.png';
spriteSheets.land.src = './Spritesheets/Land.png';
let currentFrame = 0;
let frameTimer = 0;
let characterState = "idle";
const frameWidth = 64;
const frameHeight = 64;
const framesPerState = {
    idle: 2,
    walk: 6,
    jump: 2,
    fall: 1,
    land: 2,
};

function updateCharacterState() {
    let newState;
    if (isJumping) {
        newState = "jump";
    } else if (keyState.ArrowUp && character.dy > 0) {
        newState = "fall";
    } else if (keyState.ArrowLeft || keyState.ArrowRight) {
        newState = "walk";
    } else if (keyState.w && character.dy > 0) {
        newState = "fall";
    } else if (keyState.a || keyState.d) {
        newState = "walk";
    } else {
        newState = "idle";
    }
    if (newState !== characterState) {
        characterState = newState;
        currentFrame = 0;
    }
}

let camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
};

//Trees
const treeImage = new Image();
treeImage.src = "./img/image-tree-1.png";
const treeCount = 10;
const treeWidth = 200;
const treeHeight = 300;
const trees = Array.from({length: treeCount}, () => ({
    x: Math.random() * MAP_WIDTH,
    y: floorHeight - treeHeight,
    width: treeWidth,
    height: treeHeight,
}));

function initializeProjectBackgrounds() {
    selectedBackgrounds = projects.map(() => {
        return backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    });
}

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
        keyState.ArrowRight = true;
        character.facingRight = false;
        character.dx = character.speed;
    }
    if (e.key === "ArrowLeft") {
        keyState.ArrowLeft = true;
        character.facingRight = true;
        character.dx = -character.speed;
    }
    if (e.key === "ArrowUp" && !isJumping) {
        character.dy = -15;
        isJumping = true;
    }
    if (e.key === "d") {
        keyState.d = true;
        character.facingRight = false;
        character.dx = character.speed;
    }
    if (e.key === "a") {
        keyState.a = true;
        character.facingRight = true;
        character.dx = -character.speed;
    }
    if (e.key === "w" && !isJumping) {
        character.dy = -15;
        isJumping = true;
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowRight") {
        keyState.ArrowRight = false;
        if (!keyState.ArrowLeft) {
            character.dx = 0;
        }
    }
    if (e.key === "ArrowLeft") {
        keyState.ArrowLeft = false;
        if (!keyState.ArrowRight) {
            character.dx = 0;
        }
    }
    if (e.key === "d") {
        keyState.d = false;
        if (!keyState.a) {
            character.dx = 0;
        }
    }
    if (e.key === "a") {
        keyState.a = false;
        if (!keyState.d) {
            character.dx = 0;
        }
    }
});

const closeButton = {
    width: 30,
    height: 30,
    color: "rgba(15, 23, 42, 0.9)",
};

const uiTheme = {
    font: "'Trebuchet MS', Verdana, sans-serif",
    text: "#102033",
    mutedText: "#496071",
    panel: "rgba(248, 252, 255, 0.92)",
    panelDark: "rgba(12, 22, 36, 0.9)",
    accent: "#2f7dd3",
    accentWarm: "#f0b84f",
    border: "rgba(255, 255, 255, 0.7)",
    shadow: "rgba(9, 24, 43, 0.22)"
};

function viewportWidth() {
    return camera.width || window.innerWidth;
}

function viewportHeight() {
    return camera.height || window.innerHeight;
}

function getInteriorLayout() {
    const width = viewportWidth();
    const height = viewportHeight();
    const paddingX = Math.min(100, width * 0.06);
    const paddingY = Math.min(28, height * 0.04);
    const originalWidth = interiorBackground.width || 1920;
    const originalHeight = interiorBackground.height || 1080;
    const scale = Math.min(
        (width - paddingX * 2) / originalWidth,
        (height - paddingY * 2) / originalHeight
    );
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;

    return {
        x: (width - scaledWidth) / 2,
        y: (height - scaledHeight) / 2,
        width: scaledWidth,
        height: scaledHeight,
        floorY: (height - scaledHeight) / 2 + scaledHeight - 58
    };
}

function currentFloorHeight() {
    return gameState === "inside" ? getInteriorLayout().floorY : floorHeight;
}

function roundedRectPath(x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
}

function fillRoundedRect(x, y, width, height, radius, fillStyle) {
    roundedRectPath(x, y, width, height, radius);
    ctx.fillStyle = fillStyle;
    ctx.fill();
}

function strokeRoundedRect(x, y, width, height, radius, strokeStyle, lineWidth = 1) {
    roundedRectPath(x, y, width, height, radius);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
}

function drawPanel(x, y, width, height, radius = 24, fillStyle = uiTheme.panel) {
    ctx.save();
    ctx.shadowColor = uiTheme.shadow;
    ctx.shadowBlur = 30;
    ctx.shadowOffsetY = 16;
    fillRoundedRect(x, y, width, height, radius, fillStyle);
    ctx.shadowColor = "transparent";
    strokeRoundedRect(x, y, width, height, radius, uiTheme.border, 1.5);
    ctx.restore();
}

function drawButton(x, y, width, height, label, options = {}) {
    const fill = options.fill || uiTheme.panelDark;
    const textColor = options.textColor || "#ffffff";
    const radius = options.radius || 16;
    ctx.save();
    ctx.shadowColor = "rgba(9, 24, 43, 0.18)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 8;
    fillRoundedRect(x, y, width, height, radius, fill);
    ctx.shadowColor = "transparent";
    strokeRoundedRect(x, y, width, height, radius, options.border || "rgba(255,255,255,0.18)", 1);
    ctx.fillStyle = textColor;
    ctx.font = `${options.size || 16}px ${uiTheme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + width / 2, y + height / 2);
    ctx.restore();
}

function drawPrompt(text, x, y) {
    ctx.save();
    ctx.font = `700 18px ${uiTheme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const paddingX = 18;
    const width = ctx.measureText(text).width + paddingX * 2;
    const height = 42;
    drawPanel(x - width / 2, y - height / 2, width, height, 18, "rgba(8, 19, 34, 0.82)");
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, x, y);
    ctx.restore();
}

//Sections
const sections = [
    {x: 200, title: "Section 1", content: "This is the first section of the website."},
    {x: 600, title: "Section 2", content: "Here you learn more about me!"},
    {x: 1000, title: "Section 3", content: "Thanks for visiting my interactive site!"},
    {x: 2000, title: "Section 4", content: "Potato!"},
];

function drawCharacter(deltaTime) {
    frameTimer += deltaTime;
    const frameDurationForState = 1000 / framesPerState[characterState];
    if (frameTimer >= frameDurationForState) {
        frameTimer = 0;
        currentFrame = (currentFrame + 1) % framesPerState[characterState];
    }

    // Draw the character
    const spriteSheet = spriteSheets[characterState];
    const frameX = currentFrame * frameWidth;
    const scaledWidth = frameWidth * 1.5;
    const scaledHeight = frameHeight * 1.5;

    if (character.facingRight) {
        ctx.drawImage(
            spriteSheet,
            frameX, 0, frameWidth, frameHeight,
            character.x - camera.x, character.y, scaledWidth, scaledHeight
        );
    } else {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            spriteSheet,
            frameX, 0, frameWidth, frameHeight,
            -(character.x - camera.x + scaledWidth), character.y, scaledWidth, scaledHeight
        );
        ctx.restore();
    }
}

function drawCharacterBig() {
    frameTimer++;
    if (frameTimer >= frameDuration) {
        frameTimer = 0;
        currentFrame = (currentFrame + 1) % framesPerState[characterState];
    }
    const spriteSheet = spriteSheets[characterState];
    const frameX = currentFrame * frameWidth;
    const scaledWidth = frameWidth * 3;
    const scaledHeight = frameHeight * 3;
    const drawY = currentFloorHeight() - scaledHeight;
    if (character.facingRight) {
        ctx.drawImage(
            spriteSheet,
            frameX, 0, frameWidth, frameHeight,
            character.x - camera.x, drawY, scaledWidth, scaledHeight
        );
    } else {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(
            spriteSheet,
            frameX, 0, frameWidth, frameHeight,
            -(character.x - camera.x + scaledWidth), drawY, scaledWidth, scaledHeight
        );
        ctx.restore();
    }
}

function handlePhysics(deltaTime) {
    const activeFloorHeight = currentFloorHeight();
    character.dy += gravity * (deltaTime / frameDuration);
    character.y += character.dy * (deltaTime / frameDuration);
    if (character.y + character.height > activeFloorHeight) {
        character.y = activeFloorHeight - character.height;
        character.dy = 0;
        isJumping = false;
    }
    if (keyState.ArrowRight) character.dx = character.speed * (deltaTime / frameDuration);
    if (keyState.ArrowLeft) character.dx = -character.speed * (deltaTime / frameDuration);
    if (keyState.d) character.dx = character.speed * (deltaTime / frameDuration);
    if (keyState.a) character.dx = -character.speed * (deltaTime / frameDuration);
}


//Basic Movement
function moveCharacter() {
    character.x += character.dx;
}

function updateCamera() {
    camera.x = character.x - camera.width / 2;
    if (camera.x < 0) camera.x = 0;
    if (camera.x + camera.width > MAP_WIDTH) {
        camera.x = MAP_WIDTH - camera.width;
    }
}

function handleInteractions() {
    sections.forEach((section) => {
        if (character.x > section.x - 50 && character.x < section.x + 50) {
            sectionTitle.textContent = section.title;
            sectionContent.textContent = section.content;
            overlay.classList.add('visible');
        }
    });
}

function drawSections() {
    drawDistantHills();
    trees.forEach((tree) => {
        ctx.save();
        ctx.globalAlpha = 0.18;
        fillRoundedRect(tree.x - camera.x + tree.width * 0.2, floorHeight - 18, tree.width * 0.6, 18, 50, "#17324a");
        ctx.restore();
        ctx.drawImage(
            treeImage,
            tree.x - camera.x,
            tree.y,
            tree.width,
            tree.height
        );
    });
}

function drawSky() {
    const width = viewportWidth();
    const height = viewportHeight();
    const isDark = document.body.classList.contains('dark-mode');
    const sky = ctx.createLinearGradient(0, 0, 0, height);
    if (isDark) {
        sky.addColorStop(0, "#111827");
        sky.addColorStop(0.55, "#20324d");
        sky.addColorStop(1, "#40546b");
    } else {
        sky.addColorStop(0, "#8fc9f2");
        sky.addColorStop(0.55, "#c5e8fb");
        sky.addColorStop(1, "#eef8ff");
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = isDark ? 0.2 : 0.38;
    const sunGradient = ctx.createRadialGradient(width * 0.78, height * 0.16, 8, width * 0.78, height * 0.16, 180);
    sunGradient.addColorStop(0, isDark ? "#dbeafe" : "#fff9cf");
    sunGradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sunGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
}

function drawDistantHills() {
    const parallaxX = camera.x * 0.18;
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = document.body.classList.contains('dark-mode') ? "#23364f" : "#7db1cf";
    ctx.beginPath();
    ctx.moveTo(-parallaxX - 100, floorHeight);
    ctx.quadraticCurveTo(260 - parallaxX, floorHeight - 170, 650 - parallaxX, floorHeight - 70);
    ctx.quadraticCurveTo(1040 - parallaxX, floorHeight - 230, 1460 - parallaxX, floorHeight - 90);
    ctx.quadraticCurveTo(1960 - parallaxX, floorHeight - 220, 2460 - parallaxX, floorHeight - 75);
    ctx.quadraticCurveTo(2850 - parallaxX, floorHeight - 170, MAP_WIDTH + 200 - parallaxX, floorHeight - 110);
    ctx.lineTo(MAP_WIDTH + 200, floorHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

//Spawn Snowflakes
function createSnowflakes() {
    const numberOfSnowflakes = 0.01;
    for (let i = 0; i < numberOfSnowflakes; i++) {
        snowflakes.push({
            x: Math.random() * MAP_WIDTH,
            y: -10,
            radius: Math.random() * 3 + 1,
            speed: Math.random() + 0.5,
        });
    }
}

function drawSnowflakes() {
    ctx.save();
    ctx.beginPath();
    snowflakes = snowflakes.filter((snowflake) => {
        const isVisible =
            snowflake.x >= camera.x - 50 &&
            snowflake.x <= camera.x + canvas.width + 50;
        if (isVisible) {
            ctx.moveTo(snowflake.x - camera.x, snowflake.y);
            ctx.arc(
                snowflake.x - camera.x,
                snowflake.y,
                snowflake.radius,
                0,
                Math.PI * 2
            );
        }
        snowflake.y += snowflake.speed;
        if (snowflake.y + snowflake.radius >= floorHeight) {
            if (snowOnGround.length < 1000) {
                snowOnGround.push({
                    x: snowflake.x,
                    y: floorHeight - snowflake.radius,
                    radius: snowflake.radius,
                });
            }
            return false;
        }

        return true;
    });
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.fillStyle = "white";
    ctx.beginPath();
    snowOnGround.forEach((snowflake) => {
        const isVisible =
            snowflake.x >= camera.x - 50 &&
            snowflake.x <= camera.x + canvas.width + 50;
        if (isVisible) {
            ctx.moveTo(snowflake.x - camera.x, snowflake.y);
            ctx.arc(
                snowflake.x - camera.x,
                snowflake.y,
                snowflake.radius,
                0,
                Math.PI * 2
            );
        }
    });
    ctx.fill();
    ctx.restore();
}

function drawFloor() {
    const height = viewportHeight();
    const ground = ctx.createLinearGradient(0, floorHeight, 0, height);
    if (document.body.classList.contains('dark-mode')) {
        ground.addColorStop(0, "#d9e8f7");
        ground.addColorStop(1, "#7c92aa");
    } else {
        ground.addColorStop(0, "#f8fcff");
        ground.addColorStop(1, "#c8e3f7");
    }
    ctx.fillStyle = ground;
    ctx.fillRect(0 - camera.x, floorHeight, MAP_WIDTH, height - floorHeight);
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0 - camera.x, floorHeight, MAP_WIDTH, 8);
    ctx.restore();
}


let lastFrameTime = performance.now(); // Tracks the time of the last frame
const targetFrameRate = 60; // Target frame rate
const frameDuration = 1000 / targetFrameRate; // Duration of one frame in milliseconds
let deltaTime = 0; // Time elapsed since the last frame

function update(currentTime) {
    deltaTime = currentTime - lastFrameTime;
    if (deltaTime >= frameDuration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (gameState === "outside") {
            drawSky();
            createSnowflakes(deltaTime);
            drawSections();
            drawHouse();
            drawSnowflakes(deltaTime);
            handlePhysics(deltaTime);
            moveCharacter(deltaTime);
            handleInteractions();
            handleQuestionBlockCollision();
            handleHouseInteraction();
            drawFloor();
            drawQuestionBlock();
            drawParticles(deltaTime);
            updateCamera();
            drawQuestBoard();
            handleQuestBoardInteraction();
            drawCharacter(deltaTime);
            drawMenu();
            updateCharacterState();
            drawHouseMessage();
            handleScroll();
            isPaused = false;
        } else if (gameState === "inside") {
            handlePhysics(deltaTime);
            drawInterior();
            drawNPC();
            handleNPCProximity();
            drawCharacterBig(deltaTime);
            drawNPCMessage();
            moveCharacter(deltaTime);
            updateCharacterState();
            isPaused = true;
        } else if (gameState === "Menu") {
            drawMenu();
        }
        if ((gameState === "outside" || gameState === "inside") && (currentTime - lastInputTime >= 5000)) {
            const characterCenterX = (character.x - camera.x) + (64 * 1.5) / 2;
            const controlsX = characterCenterX - controlsImage.width / 2;
            const controlsY = character.y - controlsImage.height - 10;
            ctx.drawImage(controlsImage, controlsX, controlsY);
        }
        lastFrameTime = currentTime - (deltaTime % frameDuration);
    }
    requestAnimationFrame(update);
}

function drawInterior() {
    const width = viewportWidth();
    const height = viewportHeight();
    const room = getInteriorLayout();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const roomGlow = ctx.createLinearGradient(0, 0, width, height);
    roomGlow.addColorStop(0, "#17243a");
    roomGlow.addColorStop(0.55, "#253653");
    roomGlow.addColorStop(1, "#111827");
    ctx.fillStyle = roomGlow;
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    ctx.drawImage(interiorBackground, room.x, room.y, room.width, room.height);
    ctx.restore();
    const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.1,
        width / 2,
        height / 2,
        width * 0.75
    );
    vignette.addColorStop(0, "rgba(255,255,255,0)");
    vignette.addColorStop(1, "rgba(3,8,18,0.38)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
}

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") character.dx = character.speed;
    if (e.key === "ArrowLeft") character.dx = -character.speed;
    if (e.key === "ArrowUp" && !isJumping) {
        character.dy = -15;
        isJumping = true;
    }
    if (e.key === "d") character.dx = character.speed;
    if (e.key === "a") character.dx = -character.speed;
    if (e.key === "w" && !isJumping) {
        character.dy = -15;
        isJumping = true;
    }
});

window.addEventListener("keyup", () => {
    character.dx = 0;
});

function initSnow() {
    for (let i = 0; i < 30; i++) {
        let snowflake = document.createElement("div");
        snowflake.classList.add("snowflake");
        snowflake.style.left = Math.random() * 100 + "vw";
        snowflake.style.animationDuration = Math.random() * 3 + 4 + "s";
        snowflake.style.animationDelay = Math.random() * 5 + "s";
        snowContainer.appendChild(snowflake);
    }
}

enterButton.addEventListener("click", () => {
    welcomeScreen.classList.add("hidden");
    setTimeout(() => {
        gameContainer.style.display = "block";
        resizeCanvas();
        preloadProjectImages();
        initializeProjectBackgrounds();
        initSnow();
        update();
    }, 500);
});

window.addEventListener("resize", () => {
    if (gameContainer.style.display === "block") {
        resizeCanvas();
    }
});

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    camera.width = window.innerWidth;
    camera.height = window.innerHeight;
    floorHeight = window.innerHeight - 50;  // Update floor height

    // Update outdoor objects based on new floor height
    trees.forEach(tree => tree.y = floorHeight - tree.height);
    questionBlock.y = floorHeight - 200;
    questionBlock.originalY = floorHeight - 200;
    house.y = floorHeight - 390;
    questBoard.y = floorHeight - 200;

    // Update house interior elements only when inside
    if (gameState === "inside") {
        const room = getInteriorLayout();
        NPC.y = room.floorY - NPC.height * 1.5;
        character.y = Math.min(character.y, room.floorY - character.height);
    }
}


const questionBlock = {
    x: 300,
    y: floorHeight - 200,
    width: 50,
    height: 50,
    originalY: floorHeight - 200,
    activated: false,
    bounceOffset: 0,
    inactiveTexture: 'info-box-1-inactive.png',
    activeTexture: 'info-box-1-active.png',
    texture: null,
};

const questBoard = {
    x: 2500,
    y: floorHeight - 200,
    width: 200,
    height: 200,
    texture: null
}

const NPC = {
    x: 100,
    y: canvas.height - 280,
    width: 100,
    height: 200,
    texture: null
}

const house = {
    x: 1800,
    y: floorHeight - 390,
    width: 440,
    height: 400,
    texture: null,
};

const NPCImage = new Image();
NPCImage.src = 'img/me.png';
NPC.texture = NPCImage
const houseImage = new Image();
houseImage.src = 'img/House.png';
house.texture = houseImage;
const inactiveImage = new Image();
inactiveImage.src = 'img/info-box-1-inactive.png';
const activeImage = new Image();
activeImage.src = 'img/info-box-1-active.png';
questionBlock.texture = inactiveImage;
const questBoardImage = new Image();
questBoardImage.src = 'img/quest-board-1.png'
questBoard.texture = questBoardImage
let particles = [];

function drawNPC() {
    const scale = 1.5;
    const drawWidth = NPC.width * scale;
    const drawHeight = NPC.height * scale;
    ctx.drawImage(
        NPC.texture,
        NPC.x,
        NPC.y,
        drawWidth,
        drawHeight
    );
}

function handleNPCProximity() {
    if (gameState !== "inside") {
        npcMessage.visible = false;
        return;
    }
    const npcScale = 1.5;
    const npcDrawWidth = NPC.width * npcScale;
    const npcDrawHeight = NPC.height * npcScale;
    const talkRadius = 60;
    const nearNPC =
        character.x + character.width > NPC.x - talkRadius &&
        character.x < NPC.x + npcDrawWidth + talkRadius &&
        character.y + character.height > NPC.y - talkRadius &&
        character.y < NPC.y + npcDrawHeight + talkRadius;
    if (nearNPC) {
        npcMessage.visible = true;
        npcMessage.x = NPC.x + npcDrawWidth / 2;
        npcMessage.y = NPC.y - 20;
    } else {
        npcMessage.visible = false;
    }
}

function drawNPCMessage() {
    if (!npcMessage.visible) return;
    drawPrompt(npcMessage.text, npcMessage.x, npcMessage.y - 20);
}

window.addEventListener("keydown", (e) => {
    if (e.key === "e" || e.key === "E") {
        if (gameState === "inside" && npcMessage.visible) {
            console.log("open dialogue");
            positionNPCDialog();
            npcDialog.classList.remove("hidden");
            npcMessage.visible = false;
            npcMessage.text = "Press ESC to stop talking";
        }
    }
});

dialogOption1.addEventListener("click", () => {
    dialogText.textContent = "I am Frederik Spirgi, a 17-year-old learning web-developer living in switzerland. I started programming at the age of 10 (via scratch), then later with python via a 'raspberry pi', where I coded some simple games. Additionally, due to my father being an informatician, I got to know more about computers from a very young age. At the age of 16 I started the IMS (Basically a highschool where you learn Computer Science) at the KSH in Zurich, where I'm currently in the fourth semester.";
});

dialogOption3.addEventListener("click", () => {
    dialogText.textContent = "Initially, I wanted to create a normal portfolio website, which almost everyone has. However, I noticed that every website I visited to gather ideas just didn't really feel engaging. Since my friend had made a 2d platformer a while back, I took that as inspiration to make this website more 'interactive'.";
});

dialogOption2.addEventListener("click", () => {
    dialogText.textContent = "This Website uses, besides HTML and CSS for the text like this, a BUNCH of Javascript (1000+ lines). The entire game is drawn in a canvas element, whilst the text appears in boxes like this one or is drawn onto the canvas directly. All textures are drawn by me, except the penguin, which is made by duckhive on itch.io (check him out :)";
});

document.addEventListener("click", (event) => {
    if (!npcDialog.classList.contains("hidden")) {
        const isClickInside = event.target.closest("#npc-dialog-content");
        if (!isClickInside) {
            npcDialog.classList.add("hidden");
        }
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !npcDialog.classList.contains("hidden")) {
        npcDialog.classList.add("hidden");
        npcMessage.text = "Press E to talk"
    }
});

function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x,
            y,
            dx: (Math.random() - 0.5) * 4,
            dy: Math.random() * -4 - 2,
            radius: Math.random() * 2 + 1,
            life: 60,
        });
    }
}

function drawParticles() {
    particles = particles.filter((particle) => particle.life > 0);
    particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x - camera.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = "gold";
        ctx.fill();
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dy += gravity * 0.2;
        particle.life--;
    });
}

function drawQuestionBlock() {
    const texture = questionBlock.activated ? activeImage : inactiveImage;
    ctx.drawImage(
        texture,
        questionBlock.x - camera.x,
        questionBlock.y + questionBlock.bounceOffset,
        questionBlock.width,
        questionBlock.height
    );
}

function drawQuestBoard() {
    const texture = questBoard.texture;
    ctx.drawImage(
        texture,
        questBoard.x - camera.x,
        questBoard.y,
        questBoard.width,
        questBoard.height
    );
}

function drawHouse() {
    ctx.drawImage(
        house.texture,
        house.x - camera.x,
        house.y,
        house.width,
        house.height
    );
}

function handleQuestionBlockCollision() {
    const bottomCollision =
        character.x + character.width > questionBlock.x &&
        character.x < questionBlock.x + questionBlock.width &&
        character.y <= questionBlock.y + questionBlock.bounceOffset + questionBlock.height &&
        character.y + character.height + character.dy >= questionBlock.y + questionBlock.bounceOffset;
    if (bottomCollision && !questionBlock.activated) {
        questionBlock.activated = true;
        createParticles(
            questionBlock.x + questionBlock.width / 2,
            questionBlock.y + questionBlock.height / 2
        );
        if (questionBlock.bounceOffset === 0) {
            questionBlock.bounceOffset = -10;
            setTimeout(() => (questionBlock.bounceOffset = 0), 150);
        }
        character.dy = 0;
    }
    if (bottomCollision) {
        character.y = questionBlock.y + questionBlock.bounceOffset - character.height;
        character.dy = 0;
    }
    const topCollision =
        character.x + character.width > questionBlock.x &&
        character.x < questionBlock.x + questionBlock.width &&
        character.y + character.height <= questionBlock.y + questionBlock.bounceOffset &&
        character.y + character.height + character.dy >= questionBlock.y + questionBlock.bounceOffset &&
        character.dy >= 0;
    if (topCollision) {
        character.y = questionBlock.y + questionBlock.bounceOffset + questionBlock.height;
        character.dy = 0;
    }
    const sideCollision =
        character.x + character.width > questionBlock.x &&
        character.x < questionBlock.x + questionBlock.width &&
        character.y + character.height > questionBlock.y + questionBlock.bounceOffset &&
        character.y < questionBlock.y + questionBlock.height + questionBlock.bounceOffset;

    if (sideCollision) {
        if (character.dx > 0) {
            character.x = questionBlock.x - character.width;
        } else if (character.dx < 0) {
            character.x = questionBlock.x + questionBlock.width;
        }
        character.dx = 0;
        if (character.y + character.height > questionBlock.y + questionBlock.bounceOffset + questionBlock.height) {
            character.y = questionBlock.y + questionBlock.bounceOffset + questionBlock.height;
        }
    }
    if (questionBlock.activated) {
        const blockInfo = document.getElementById('block-info');
        blockInfo.style.left = `${questionBlock.x - camera.x + questionBlock.width / 2 - 125}px`;
        blockInfo.style.top = `${questionBlock.y - 350}px`;
        blockInfo.classList.remove('hidden');
    }
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (
        menuVisible &&
        mouseX >= closeButton.x &&
        mouseX <= closeButton.x + closeButton.width &&
        mouseY >= closeButton.y &&
        mouseY <= closeButton.y + closeButton.height
    ) {
        gameState = "outside"
        menuVisible = false;
    }
});

window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && message.visible) {
        menuVisible = !menuVisible;
        if (menuVisible) {
            message.visible = false;
        }
    }
});

function handleQuestBoardInteraction() {
    const nearQuestBoard =
        character.x + character.width > questBoard.x - 50 &&
        character.x < questBoard.x + questBoard.width + 50 &&
        character.y + character.height > questBoard.y - 50 &&
        character.y < questBoard.y + questBoard.height + 50;
    if (nearQuestBoard && !menuVisible) {
        message.visible = true;
    } else if (!nearQuestBoard) {
        message.visible = false;
    }
}

for (let i = 0; i < projectDivs.length; i++) {
    const projectDiv = projectDivs[i];
    const title = projectDiv.querySelector('h3').textContent;
    const description = projectDiv.querySelector('p').textContent;
    const imageElement = projectDiv.querySelector('img');
    const imageSrc = imageElement ? imageElement.src : '';
    projects.push({name: title, description: description, image: imageSrc});
    console.log(imageElement)
}
let currentPage = 0;
let projectsPerPage = window.innerWidth < 768 ? 1 : 2;
let projectPadding = window.innerWidth < 768 ? 15 : 30;
let projectFontSize = window.innerWidth < 768 ? 14 : 18;

window.addEventListener("resize", () => {
    const isMobile = window.innerWidth < 768;
    projectsPerPage = isMobile ? 1 : 2; // Update projects per page
    projectPadding = isMobile ? 15 : 30; // Update padding
    projectFontSize = isMobile ? 14 : 18; // Update font size
    currentPage = 0; // Reset to the first page
    drawMenu(); // Redraw the menu
});

window.addEventListener("resize", () => {
    if (gameState === "inside" && !npcDialog.classList.contains("hidden")) {
        positionNPCDialog();
    }
});

function getProjectsForCurrentPage() {
    const startIndex = currentPage * projectsPerPage;
    return projects.slice(startIndex, startIndex + projectsPerPage);
}

const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');

function handlePageNavigation(direction) {
    const maxPage = Math.ceil(projects.length / projectsPerPage) - 1;
    currentPage = Math.max(0, Math.min(currentPage + direction, maxPage));
}


prevButton.addEventListener("click", () => handlePageNavigation(-1));
nextButton.addEventListener("click", () => handlePageNavigation(1));
let listenersAttached = false;
let detailsBackListenerAttached = false;

function preloadProjectImages() {
    projects.forEach(project => {
        if (project.image) {
            const img = new Image();
            img.src = project.image;
            img.onload = () => {
                project.loadedImage = img;  // Store the loaded image
                console.log('Image loaded for project:', project.name);
            };
        }
    });
}

let selectedProject = null;

function wrapText(text, maxWidth) {
    const lines = [];
    let line = "";
    const words = text.split(" ");
    for (let n = 0; n < words.length; n++) {
        const testLine = line + (line === "" ? "" : " ") + words[n];
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > maxWidth && line !== "") {
            lines.push(line);
            line = words[n];
        } else {
            line = testLine;
        }
    }
    lines.push(line);
    return lines;
}

function toggleHouse() {
    if (gameState === "outside") {
        const width = viewportWidth();
        const height = viewportHeight();
        const room = getInteriorLayout();
        console.log("Entering House")
        gameState = "inside";
        snowContainer.classList.add('paused');
        removeSnowflakes();
        ctx.save();
        ctx.filter = "blur(3px)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, width, height);
        camera.x = 0;
        camera.y = 0;
        character.x = Math.max(room.x + 250, 170);
        character.y = room.floorY - character.height;
        NPC.x = Math.max(room.x + 70, 90);
        NPC.y = room.floorY - NPC.height * 1.5;
        ctx.drawImage(interiorBackground, room.x, room.y, room.width, room.height);
        console.log("Interior Loaded")
        const gameStateChangeEvent = new Event("gameStateChange");
        window.dispatchEvent(gameStateChangeEvent);
    } else if (gameState === "inside") {
        console.log("Leaving House")
        gameState = "outside";
        snowContainer.classList.remove('paused');
        npcDialog.classList.add("hidden");
        npcMessage.visible = false;
        npcMessage.text = "Press E to talk";
        initSnow();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        character.x = 1975
        const gameStateChangeEvent = new Event("gameStateChange");
        window.dispatchEvent(gameStateChangeEvent);
    }
}

function positionNPCDialog() {
    const rect = canvas.getBoundingClientRect();
    const dialogWidth = npcDialog.offsetWidth;
    const dialogX = rect.left + (viewportWidth() / 2) - (dialogWidth / 2);
    const dialogY = rect.top + 20;
    npcDialog.style.left = `${dialogX}px`;
    npcDialog.style.top = `${dialogY}px`;
}


function removeSnowflakes() {
    while (snowContainer.firstChild) {
        snowContainer.removeChild(snowContainer.firstChild);
    }
}

function handleHouseInteraction() {
    const nearHouse =
        character.x + character.width > house.x - 50 &&
        character.x < house.x + house.width + 50 &&
        character.y + character.height > house.y - 50 &&
        character.y < house.y + house.height + 50;
    if (nearHouse) {
        houseMessage.visible = true;
        houseMessage.x = (house.x + house.width / 2) - camera.x;
        houseMessage.y = house.y - 40;
    } else {
        houseMessage.visible = false;
    }
}

window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (gameState === "outside") {
            const nearHouse =
                character.x + character.width > house.x - 50 &&
                character.x < house.x + house.width + 50 &&
                character.y + character.height > house.y - 50 &&
                character.y < house.y + house.height + 50;
            if (nearHouse) {
                console.log("Near House");
                houseMessage.visible = true;
                toggleHouse();
            } else {
                houseMessage.visible = false;
            }
        } else if (gameState === "inside") {
            houseMessage.visible = false;
            toggleHouse();
        }
    }
});

function drawHouseMessage() {
    if (!houseMessage.visible) return;
    drawPrompt(houseMessage.text, houseMessage.x, houseMessage.y - 20);
}

function drawMenu() {
    const width = viewportWidth();
    const height = viewportHeight();
    if (menuVisible && !selectedProject) {
        gameState = "Menu";
        ctx.fillStyle = "rgba(8, 17, 31, 0.58)";
        ctx.fillRect(0, 0, width, height);

        const isMobile = width <= 768;
        const horizontalMargin = isMobile ? 18 : 90;
        const menuX = horizontalMargin;
        const menuY = isMobile ? 24 : 42;
        const menuWidth = width - horizontalMargin * 2;
        const menuHeight = height - menuY * 2;

        drawPanel(menuX, menuY, menuWidth, menuHeight, 30, "rgba(240, 248, 255, 0.9)");
        ctx.save();
        ctx.fillStyle = uiTheme.text;
        ctx.font = `700 ${isMobile ? 22 : 30}px ${uiTheme.font}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("Projects", menuX + 28, menuY + 24);
        ctx.font = `${isMobile ? 13 : 15}px ${uiTheme.font}`;
        ctx.fillStyle = uiTheme.mutedText;
        ctx.fillText("Choose a project to inspect the build, stack, and result.", menuX + 30, menuY + (isMobile ? 56 : 64));
        ctx.restore();

        closeButton.width = 42;
        closeButton.height = 42;
        closeButton.x = menuX + menuWidth - closeButton.width - 18;
        closeButton.y = menuY + 18;
        drawButton(closeButton.x, closeButton.y, closeButton.width, closeButton.height, "X", {
            fill: "rgba(15, 23, 42, 0.9)",
            radius: 14,
            size: 18
        });

        const columns = projectsPerPage === 1 ? 1 : 2;
        const topOffset = isMobile ? 96 : 116;
        const navSpace = 78;
        const cardGap = isMobile ? 16 : 26;
        const projectWidth = (menuWidth - 56 - (columns - 1) * cardGap) / columns;
        const projectHeight = menuHeight - topOffset - navSpace;
        const projectsToDisplay = getProjectsForCurrentPage();

        for (let i = 0; i < projectsToDisplay.length; i++) {
            const project = projectsToDisplay[i];
            const row = Math.floor(i / columns);
            const col = i % columns;
            const projectBoxX = menuX + 28 + col * (projectWidth + cardGap);
            const projectBoxY = menuY + topOffset + row * (projectHeight + cardGap) - scrollPosition;

            drawPanel(projectBoxX, projectBoxY, projectWidth, projectHeight, 24, "rgba(255, 255, 255, 0.82)");
            const accent = ctx.createLinearGradient(projectBoxX, projectBoxY, projectBoxX + projectWidth, projectBoxY);
            accent.addColorStop(0, "rgba(47, 125, 211, 0.9)");
            accent.addColorStop(1, "rgba(240, 184, 79, 0.9)");
            fillRoundedRect(projectBoxX + 18, projectBoxY + 18, projectWidth - 36, 6, 10, accent);

            ctx.fillStyle = uiTheme.text;
            ctx.font = `700 ${projectFontSize + 8}px ${uiTheme.font}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "alphabetic";

            const textX = projectBoxX + 24;
            const textY = projectBoxY + 58;

            const lines = wrapText(project.name, projectWidth - 48);
            let lineHeight = projectFontSize + 12;
            lines.forEach((line, index) => {
                ctx.fillText(line, textX, textY + index * lineHeight);
            });

            ctx.fillStyle = uiTheme.mutedText;
            ctx.font = `${projectFontSize}px ${uiTheme.font}`;
            const descriptionLines = wrapText(project.description, projectWidth - 48).slice(0, isMobile ? 3 : 4);
            let descriptionY = textY + lines.length * lineHeight + 16;
            descriptionLines.forEach((line, index) => {
                ctx.fillText(line, textX, descriptionY + index * (projectFontSize + 7));
            });

            if (project.loadedImage) {
                const fixedImageWidth = projectWidth - 48;
                const fixedImageHeight = Math.max(120, projectHeight * 0.34);
                const imageX = projectBoxX + 24;
                const imageY = projectBoxY + projectHeight - fixedImageHeight - 88;
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.save();
                roundedRectPath(imageX, imageY, fixedImageWidth, fixedImageHeight, 18);
                ctx.clip();
                ctx.drawImage(project.loadedImage, imageX, imageY, fixedImageWidth, fixedImageHeight);
                ctx.restore();
                strokeRoundedRect(imageX, imageY, fixedImageWidth, fixedImageHeight, 18, "rgba(15, 23, 42, 0.12)", 1);

                const buttonWidth = Math.min(projectWidth - 48, 220);
                const buttonHeight = 48;
                const buttonX = projectBoxX + (projectWidth - buttonWidth) / 2;
                const buttonY = projectBoxY + projectHeight - 64;
                drawButton(buttonX, buttonY, buttonWidth, buttonHeight, "See More", {
                    fill: "#102033",
                    radius: 16,
                    size: 16
                });

                project.seeMoreButton = {
                    x: buttonX - 10,
                    y: buttonY - 10,
                    width: buttonWidth + 20,
                    height: buttonHeight + 20,
                    projectIndex: i,
                };
            }
        }

        const buttonWidth = isMobile ? 104 : 128;
        const buttonHeight = 46;
        const buttonPadding = 28;
        const prevButtonX = menuX + buttonPadding;
        const nextButtonX = menuX + menuWidth - buttonWidth - buttonPadding;
        const navY = menuY + menuHeight - buttonHeight - 20;

        drawButton(prevButtonX, navY, buttonWidth, buttonHeight, "Previous", {
            fill: currentPage === 0 ? "rgba(73, 96, 113, 0.45)" : "#102033",
            radius: 15,
            size: 15
        });
        const maxPage = Math.ceil(projects.length / projectsPerPage) - 1;
        drawButton(nextButtonX, navY, buttonWidth, buttonHeight, "Next", {
            fill: currentPage === maxPage ? "rgba(73, 96, 113, 0.45)" : "#102033",
            radius: 15,
            size: 15
        });
        ctx.save();
        ctx.fillStyle = uiTheme.mutedText;
        ctx.font = `14px ${uiTheme.font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${currentPage + 1} / ${maxPage + 1}`, menuX + menuWidth / 2, navY + buttonHeight / 2);
        ctx.restore();

        this.prevButton = {
            x: prevButtonX - 10,
            y: navY - 10,
            width: buttonWidth + 20,
            height: buttonHeight + 20
        };
        this.nextButton = {
            x: nextButtonX - 10,
            y: navY - 10,
            width: buttonWidth + 20,
            height: buttonHeight + 20
        };

        if (!listenersAttached) {
            canvas.addEventListener("click", (e) => {
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                if (
                    mouseX >= this.prevButton.x &&
                    mouseX <= this.prevButton.x + this.prevButton.width &&
                    mouseY >= this.prevButton.y &&
                    mouseY <= this.prevButton.y + this.prevButton.height
                ) {
                    handlePageNavigation(-1);
                    drawMenu();
                }

                if (
                    mouseX >= this.nextButton.x &&
                    mouseX <= this.nextButton.x + this.nextButton.width &&
                    mouseY >= this.nextButton.y &&
                    mouseY <= this.nextButton.y + this.nextButton.height
                ) {
                    handlePageNavigation(1);
                    drawMenu();
                }

                const projectsToDisplay = getProjectsForCurrentPage();
                for (let project of projectsToDisplay) {
                    if (project.seeMoreButton) {
                        const btn = project.seeMoreButton;
                        if (
                            mouseX >= btn.x &&
                            mouseX <= btn.x + btn.width &&
                            mouseY >= btn.y &&
                            mouseY <= btn.y + btn.height
                        ) {
                            openDetailsMenu(project);
                            break;
                        }
                    }
                }
            });
            listenersAttached = true;
        }
    } else if (selectedProject) {
        ctx.fillStyle = "rgba(8, 17, 31, 0.62)";
        ctx.fillRect(0, 0, width, height);
        const isMobile = width <= 768;
        const horizontalMargin = isMobile ? 18 : 120;
        const menuX = horizontalMargin;
        const menuY = isMobile ? 24 : 42;
        const menuWidth = width - horizontalMargin * 2;
        const menuHeight = height - menuY * 2;
        drawPanel(menuX, menuY, menuWidth, menuHeight, 30, "rgba(250, 253, 255, 0.94)");

        ctx.fillStyle = uiTheme.text;
        ctx.font = `700 ${isMobile ? 24 : 34}px ${uiTheme.font}`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(selectedProject.name, menuX + 32, menuY + 28);

        ctx.font = `${isMobile ? 15 : 17}px ${uiTheme.font}`;
        ctx.textAlign = "left";

        const detailsTextX = menuX + 34;
        const detailsTextY = menuY + (isMobile ? 88 : 104);
        const detailsTextWidth = menuWidth - 68;

        const longDescriptionLines = wrapText(selectedProject.longDescription, detailsTextWidth);
        const totalTextHeight = longDescriptionLines.length * 26;

        ctx.save();
        ctx.beginPath();
        ctx.rect(menuX + 24, detailsTextY - 24, menuWidth - 48, menuHeight - 150);
        ctx.clip();
        ctx.fillStyle = uiTheme.mutedText;
        ctx.font = `${isMobile ? 15 : 17}px ${uiTheme.font}`;
        ctx.textBaseline = "alphabetic";
        longDescriptionLines.forEach((line, index) => {
            const lineY = detailsTextY + index * 26 - detailsScrollPosition;
            if (lineY > menuY + 78 && lineY < menuY + menuHeight - 82) {
                ctx.fillText(line, detailsTextX, lineY);
            }
        });

        if (selectedProject.link) {
            const linkText = selectedProject.link.text;
            const linkUrl = selectedProject.link.url;
            const linkX = detailsTextX;
            const linkY = detailsTextY + totalTextHeight + 32 - detailsScrollPosition;
            const linkPadding = 14;
            ctx.font = `700 16px ${uiTheme.font}`;
            const linkWidth = ctx.measureText(linkText).width + linkPadding * 2;

            if (linkY > menuY + 88 && linkY < menuY + menuHeight - 82) {
                drawButton(linkX, linkY - 26, linkWidth, 42, linkText, {
                    fill: uiTheme.accent,
                    radius: 15,
                    size: 16
                });
            }

            selectedProject.linkPosition = {
                x: linkX,
                y: linkY - 26,
                width: linkWidth,
                height: 42,
                url: linkUrl
            };

            if (selectedProject.loadedImage) {
                const maxImageWidth = menuWidth - 68;
                const maxImageHeight = menuHeight * 0.38;
                let imageWidth = selectedProject.loadedImage.width;
                let imageHeight = selectedProject.loadedImage.height;

                const widthScale = maxImageWidth / imageWidth;
                const heightScale = maxImageHeight / imageHeight;
                const scale = Math.min(widthScale, heightScale, 1);

                imageWidth *= scale;
                imageHeight *= scale;

                const imageX = menuX + (menuWidth - imageWidth) / 2;
                const imageY = linkY + 44;

                if (imageY + imageHeight > menuY + 88 && imageY < menuY + menuHeight - 82) {
                    const visibleImageY = Math.max(imageY, menuY + 88);
                    const visibleImageHeight = Math.min(imageHeight, menuY + menuHeight - 90 - visibleImageY);
                    if (visibleImageHeight > 0) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.save();
                        roundedRectPath(imageX, visibleImageY, imageWidth, visibleImageHeight, 20);
                        ctx.clip();
                        ctx.drawImage(
                            selectedProject.loadedImage,
                            imageX,
                            visibleImageY,
                            imageWidth,
                            visibleImageHeight
                        );
                        ctx.restore();
                    }
                }
            }
        }
        ctx.restore();

        const backButtonWidth = 120;
        const backButtonHeight = 48;
        const backButtonX = width / 2 - backButtonWidth / 2;
        const backButtonY = menuY + menuHeight - backButtonHeight - 22;
        drawButton(backButtonX, backButtonY, backButtonWidth, backButtonHeight, "Back", {
            fill: "#102033",
            radius: 16,
            size: 16
        });
        selectedProject.backButton = {
            x: backButtonX,
            y: backButtonY,
            width: backButtonWidth,
            height: backButtonHeight
        };

        if (!detailsBackListenerAttached) {
            canvas.addEventListener("click", (e) => {
                if (!selectedProject || !selectedProject.backButton) return;
                const rect = canvas.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const btn = selectedProject.backButton;
                if (
                    mouseX >= btn.x &&
                    mouseX <= btn.x + btn.width &&
                    mouseY >= btn.y &&
                    mouseY <= btn.y + btn.height
                ) {
                    closeDetailsMenu();
                }
            });
            detailsBackListenerAttached = true;
        }

        detailsMaxScroll = Math.max(
            totalTextHeight + 40 + (selectedProject.loadedImage ? selectedProject.loadedImage.height : 0) - menuHeight + 160,
            0
        );
    }
    if (message.visible && !menuVisible && !selectedProject) {
        const textX = questBoard.x - camera.x + questBoard.width / 2;
        const textY = questBoard.y - 20;
        drawPrompt(message.text, textX, textY);
    }
}

function handleScroll(event) {
    if (selectedProject) {
        detailsScrollPosition += event.deltaY > 0 ? detailsScrollStep : -detailsScrollStep;
        detailsScrollPosition = Math.max(0, Math.min(detailsScrollPosition, detailsMaxScroll));
        drawMenu();
    }
}

function openDetailsMenu(project) {
    console.log("Project Object:", project);
    const longDescriptionElement = document.querySelector(`.long-description[data-project-name="${project.name}"]`);
    if (longDescriptionElement) {
        project.longDescription = longDescriptionElement.innerHTML;
        console.log("Long Description:", project.longDescription);
    } else {
        console.log("Long description element not found for project:", project.name);
        project.longDescription = "";
    }
    const linkElement = document.querySelector(`.link[data-project-name="${project.name}"]`);
    if (linkElement) {
        project.link = {
            text: linkElement.textContent,
            url: linkElement.href
        };
    }
    menuVisible = false;
    selectedProject = project;
    drawMenu();
}

canvas.addEventListener('click', function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    if (menuVisible) {
        const projectsToDisplay = getProjectsForCurrentPage();
        for (let project of projectsToDisplay) {
            if (project.seeMoreButton) {
                const btn = project.seeMoreButton;
                if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
                    mouseY >= btn.y && mouseY <= btn.y + btn.height) {
                    openDetailsMenu(project);
                    break;
                }
            }
        }
    }
});

function closeDetailsMenu() {
    selectedProject = null;
    menuVisible = true;
    drawMenu();
}

function handleLinkClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    if (selectedProject && selectedProject.linkPosition) {
        const linkPos = selectedProject.linkPosition;
        if (
            mouseX >= linkPos.x && mouseX <= linkPos.x + linkPos.width &&
            mouseY >= linkPos.y && mouseY <= linkPos.y + linkPos.height
        ) {
            window.open(linkPos.url, "_blank");
            e.stopPropagation();
        }
    }
}

canvas.removeEventListener("click", handleLinkClick);
canvas.addEventListener("click", handleLinkClick);
const moveLeftButton = document.getElementById("move-left-button");
const jumpButton = document.getElementById("jump-button");
const interactButton = document.getElementById("interact-button");
const moveRightButton = document.getElementById("move-right-button");
const interactCharacterButton = document.getElementById("interact-character-button");

let dialogVisible = false;

// Move Left Button Logic
moveLeftButton.addEventListener("mousedown", () => {
    keyState.ArrowLeft = true;
    character.dx = -character.speed;
    character.facingRight = true;
});

moveLeftButton.addEventListener("mouseup", () => {
    keyState.ArrowLeft = false;
    character.dx = 0;
});

moveLeftButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keyState.ArrowLeft = true;
    character.dx = -character.speed;
    character.facingRight = true;
});

moveLeftButton.addEventListener("touchend", (e) => {
    e.preventDefault();
    keyState.ArrowLeft = false;
    character.dx = 0;
});

// Move Right Button Logic
moveRightButton.addEventListener("mousedown", () => {
    keyState.ArrowRight = true;
    character.dx = character.speed;
    character.facingRight = false;
});

moveRightButton.addEventListener("mouseup", () => {
    keyState.ArrowRight = false;
    character.dx = 0;
});

moveRightButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keyState.ArrowRight = true;
    character.dx = character.speed;
    character.facingRight = false;
});

moveRightButton.addEventListener("touchend", (e) => {
    e.preventDefault();
    keyState.ArrowRight = false;
    character.dx = 0;
});

// Jump Button Logic
jumpButton.addEventListener("mousedown", () => {
    if (!isJumping) {
        character.dy = -15;
        isJumping = true;
    }
});

jumpButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!isJumping) {
        character.dy = -15;
        isJumping = true;
    }
});

// Interact Button Logic
interactButton.addEventListener("mousedown", () => {
    const interactionKeyEvent = new KeyboardEvent("keydown", {key: "Enter"}); // Simulate "Enter" key
    window.dispatchEvent(interactionKeyEvent);
});

interactButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const interactionKeyEvent = new KeyboardEvent("keydown", {key: "Enter"}); // Simulate "Enter" key
    window.dispatchEvent(interactionKeyEvent);
});


interactCharacterButton.addEventListener("mousedown", () => {
    const interactionKeyEvent = new KeyboardEvent("keydown", {key: "e"}); // Simulate "e" key
    window.dispatchEvent(interactionKeyEvent);
});

interactCharacterButton.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const interactionKeyEvent = new KeyboardEvent("keydown", {key: "e"}); // Simulate "e" key
    window.dispatchEvent(interactionKeyEvent);
});

// Function to toggle the visibility of the "Interact with Character" button
function updateMobileControls() {
    if (gameState === "inside") {
        interactCharacterButton.classList.remove("hidden"); // Show the button inside the house
    } else {
        interactCharacterButton.classList.add("hidden"); // Hide the button outside the house
        npcDialog.classList.add("hidden"); // Automatically close the dialogue menu when leaving
        dialogVisible = false; // Reset the dialogue visibility state
    }
}

// Listen for game state changes to update controls
window.addEventListener("gameStateChange", () => {
    updateMobileControls();
});

updateMobileControls();
