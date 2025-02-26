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
    color: "rgba(255, 255, 255, 0.5)",
};

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

function handlePhysics(deltaTime) {
    character.dy += gravity * (deltaTime / frameDuration);
    character.y += character.dy * (deltaTime / frameDuration);
    if (character.y + character.height > floorHeight) {
        character.y = floorHeight - character.height;
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
    trees.forEach((tree) => {
        ctx.drawImage(
            treeImage,
            tree.x - camera.x,
            tree.y,
            tree.width,
            tree.height
        );
    });
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
    if (document.body.classList.contains('dark-mode')) {
        ctx.fillStyle = "#b8cee6";
    } else {
        ctx.fillStyle = "#cce5ff";
    }
    ctx.fillRect(0 - camera.x, floorHeight, MAP_WIDTH, canvas.height - floorHeight);
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const originalWidth = interiorBackground.width;
    const originalHeight = interiorBackground.height;
    const widthScale = canvas.width / originalWidth;
    const heightScale = canvas.height / originalHeight;
    const scale = Math.max(widthScale, heightScale);
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;
    const interiorX = (canvas.width - scaledWidth) / 2;
    const interiorY = (canvas.height - scaledHeight) / 2;

    ctx.drawImage(interiorBackground, interiorX, interiorY, scaledWidth, scaledHeight);
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
        // Center interior background dynamically
        const widthScale = canvas.width / interiorBackground.width;
        const heightScale = canvas.height / interiorBackground.height;
        const scale = Math.max(widthScale, heightScale);

        interiorBackground.scaledWidth = interiorBackground.width * scale;
        interiorBackground.scaledHeight = interiorBackground.height * scale;
        interiorBackground.x = (canvas.width - interiorBackground.scaledWidth) / 2;
        interiorBackground.y = (canvas.height - interiorBackground.scaledHeight) / 2;

        // NPC should always stand at the bottom of the screen
        NPC.y = canvas.height - NPC.height - 50; // 50px padding from bottom
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
    const talkRadius = 60;
    const nearNPC =
        character.x + character.width > NPC.x - talkRadius &&
        character.x < NPC.x + NPC.width + talkRadius &&
        character.y + character.height > NPC.y - talkRadius &&
        character.y < NPC.y + NPC.height + talkRadius;
    if (nearNPC) {
        npcMessage.visible = true;
        npcMessage.x = NPC.x + NPC.width / 2;
        npcMessage.y = NPC.y - 20;
    } else {
        npcMessage.visible = false;
    }
}

function drawNPCMessage() {
    if (!npcMessage.visible) return;

    const padding = 10; // Padding around the text
    ctx.save();

    // Set text styles
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    const textWidth = ctx.measureText(npcMessage.text).width;
    const textHeight = 24;
    const bgX = npcMessage.x - textWidth / 2 - padding;
    const bgY = npcMessage.y - textHeight - padding;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textHeight + padding * 2;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(bgX, bgY, bgWidth, bgHeight);
    ctx.fillStyle = "black";
    ctx.fillText(npcMessage.text, npcMessage.x, npcMessage.y - textHeight / 2);
    ctx.restore();
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
        console.log("Entering House")
        gameState = "inside";
        snowContainer.classList.add('paused');
        removeSnowflakes();
        ctx.save();
        ctx.filter = "blur(3px)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const interiorX = 100;
        const interiorY = 50;
        const interiorWidth = canvas.width - 200;
        const interiorHeight = canvas.height;
        camera.x = 0;
        camera.y = 0;
        character.x = 250;
        ctx.drawImage(interiorBackground, interiorX, interiorY, interiorWidth, interiorHeight);
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
    const dialogX = rect.left + (canvas.width / 2) - (dialogWidth / 2);
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
    ctx.save();
    ctx.fillStyle = "#fff";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(houseMessage.text, houseMessage.x, houseMessage.y - 20);
    ctx.restore();
}

function drawMenu() {
    if (menuVisible && !selectedProject) {
        gameState = "Menu";
        ctx.save();
        ctx.filter = "blur(3px)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const isMobile = canvas.width <= 768; // Define mobile breakpoint
        const horizontalMargin = isMobile ? 30 : 100; // Smaller margins on mobile
        const menuX = horizontalMargin;
        const menuY = 50;
        const menuWidth = canvas.width - horizontalMargin * 2;
        const menuHeight = canvas.height - 100;

        ctx.drawImage(menuBackground, menuX, menuY, menuWidth, menuHeight);

        closeButton.x = menuX + menuWidth - closeButton.width - 10;
        closeButton.y = menuY + 10;
        ctx.fillStyle = closeButton.color;
        ctx.fillRect(closeButton.x, closeButton.y, closeButton.width, closeButton.height);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("X", closeButton.x + closeButton.width / 2, closeButton.y + closeButton.height / 2);

        const columns = projectsPerPage === 1 ? 1 : 2;
        const projectWidth = (menuWidth - (columns + 1) * projectPadding) / columns;
        const projectHeight = menuHeight * 0.9;
        const projectsToDisplay = getProjectsForCurrentPage();

        for (let i = 0; i < projectsToDisplay.length; i++) {
            const project = projectsToDisplay[i];
            const row = Math.floor(i / columns);
            const col = i % columns;
            const projectBoxX = menuX + col * (projectWidth + projectPadding) + projectPadding;
            const projectBoxY = menuY + row * (projectHeight + projectPadding) - scrollPosition;

            const randomBackground = selectedBackgrounds[projects.indexOf(project)];
            ctx.drawImage(randomBackground, projectBoxX, projectBoxY, projectWidth, projectHeight);

            ctx.fillStyle = "black";
            ctx.font = `${projectFontSize}px Arial`;
            ctx.textAlign = "left";

            const textX = projectBoxX + projectPadding * 2;
            const textY = projectBoxY + projectPadding * 2.65;

            const lines = wrapText(project.name, projectWidth - projectPadding * 4, 24);
            let lineHeight = projectFontSize + 2;
            lines.forEach((line, index) => {
                ctx.fillText(line, textX, textY + index * lineHeight);
            });

            const descriptionLines = wrapText(project.description, projectWidth - projectPadding * 4, 20);
            let descriptionY = textY + lines.length * lineHeight + 10;
            descriptionLines.forEach((line, index) => {
                ctx.fillText(line, textX, descriptionY + index * 20);
            });

            if (project.loadedImage) {
                const fixedImageWidth = projectWidth * 0.8; // Adjust image width
                const fixedImageHeight = projectHeight * 0.4;
                const totalTextHeight = descriptionY + descriptionLines.length * projectFontSize;
                const imageX = projectBoxX + (projectWidth - fixedImageWidth) / 2;
                const imageY = totalTextHeight + projectPadding;

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(project.loadedImage, imageX, imageY, fixedImageWidth, fixedImageHeight);
                const buttonWidth = projectWidth * 0.6;
                const buttonHeight = 50; // Adjust button height
                const buttonX = projectBoxX + (projectWidth - buttonWidth) / 2;
                const buttonY = imageY + fixedImageHeight + projectPadding;
                ctx.fillStyle = "black";
                ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
                ctx.fillStyle = "white";
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("See More", buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);

                // Add padding to the hitbox for better touch accuracy
                project.seeMoreButton = {
                    x: buttonX - 10, // Extend hitbox horizontally
                    y: buttonY - 10, // Extend hitbox vertically
                    width: buttonWidth + 20,
                    height: buttonHeight + 20,
                    projectIndex: i,
                };
            }
        }

        const buttonWidth = 100;
        const buttonHeight = 50;
        const buttonPadding = 20;
        const prevButtonX = menuX + buttonPadding;
        const nextButtonX = menuX + menuWidth - buttonWidth - buttonPadding;

        ctx.fillStyle = "lightgray";
        ctx.fillRect(prevButtonX, menuY + menuHeight - buttonHeight - 20, buttonWidth, buttonHeight);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Previous", prevButtonX + buttonWidth / 2, menuY + menuHeight - buttonHeight / 2 - 20);

        ctx.fillStyle = "lightgray";
        ctx.fillRect(nextButtonX, menuY + menuHeight - buttonHeight - 20, buttonWidth, buttonHeight);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Next", nextButtonX + buttonWidth / 2, menuY + menuHeight - buttonHeight / 2 - 20);

        // Add padding to the hitboxes for "Previous" and "Next"
        this.prevButton = {
            x: prevButtonX - 10,
            y: menuY + menuHeight - buttonHeight - 30,
            width: buttonWidth + 20,
            height: buttonHeight + 20
        };
        this.nextButton = {
            x: nextButtonX - 10,
            y: menuY + menuHeight - buttonHeight - 30,
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
        ctx.save();
        ctx.filter = "blur(3px)";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const isMobile = canvas.width <= 768; // Define mobile breakpoint
        const horizontalMargin = isMobile ? 30 : 100; // Smaller margins on mobile
        const menuX = horizontalMargin;
        const menuY = 50;
        const menuWidth = canvas.width - horizontalMargin * 2; // Adjust width based on margin
        const menuHeight = canvas.height - 100;
        ctx.drawImage(menuBackground, menuX, menuY, menuWidth, menuHeight);
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(selectedProject.name, canvas.width / 2, menuY + 50);

        ctx.font = "16px Arial";
        ctx.textAlign = "left";

        const detailsTextX = menuX + 20;
        const detailsTextY = menuY + 100;
        const detailsTextWidth = menuWidth - 40;

        const longDescriptionLines = wrapText(selectedProject.longDescription, detailsTextWidth, 20);
        const totalTextHeight = longDescriptionLines.length * 24;

        // Draw the long description
        longDescriptionLines.forEach((line, index) => {
            const lineY = detailsTextY + index * 24 - detailsScrollPosition;
            if (lineY > menuY + 80 && lineY < menuY + menuHeight - 60) {
                ctx.fillText(line, detailsTextX, lineY);
            }
        });

        // Draw the link element
        if (selectedProject.link) {
            const linkText = selectedProject.link.text;
            const linkUrl = selectedProject.link.url;
            const linkX = detailsTextX;
            const linkY = detailsTextY + totalTextHeight + 40 - detailsScrollPosition;
            const linkPadding = 10;
            const linkWidth = ctx.measureText(linkText).width + linkPadding * 2;

            ctx.fillStyle = "blue";
            ctx.font = "18px Arial";
            ctx.textAlign = "left";
            ctx.fillText(linkText, linkX + linkPadding, linkY);

            ctx.fillStyle = "rgba(0, 0, 255, 0.1)";
            ctx.fillRect(linkX, linkY - 20, linkWidth, 30);

            selectedProject.linkPosition = {
                x: linkX,
                y: linkY - 20,
                width: linkWidth,
                height: 30,
                url: linkUrl
            };

            // Move the image below the link
            if (selectedProject.loadedImage) {
                const maxImageWidth = menuWidth - 40;
                const maxImageHeight = menuHeight - detailsTextY - totalTextHeight - 60;
                let imageWidth = selectedProject.loadedImage.width;
                let imageHeight = selectedProject.loadedImage.height;

                const widthScale = maxImageWidth / imageWidth;
                const heightScale = maxImageHeight / imageHeight;
                const scale = Math.min(widthScale, heightScale, 1);

                imageWidth *= scale;
                imageHeight *= scale;

                const imageX = menuX + (menuWidth - imageWidth) / 2;
                const imageY = linkY + 40; // Position the image below the link element

                if (imageY + imageHeight > menuY + 80 && imageY < menuY + menuHeight - 60) {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(
                        selectedProject.loadedImage,
                        imageX,
                        Math.max(imageY, menuY + 80),
                        imageWidth,
                        Math.min(imageHeight, menuY + menuHeight - 60 - imageY)
                    );
                }
            }
        }

        // Draw the back button
        const backButtonWidth = 100;
        const backButtonHeight = 60;
        const backButtonX = canvas.width / 2 - backButtonWidth / 2;
        const backButtonY = menuY + menuHeight - backButtonHeight - 20;

        ctx.fillStyle = "lightgray";
        ctx.fillRect(backButtonX, backButtonY, backButtonWidth, backButtonHeight);
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Back", backButtonX + backButtonWidth / 2, backButtonY + backButtonHeight / 2);

        canvas.addEventListener("click", function handleBackClick(e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            if (
                mouseX >= backButtonX &&
                mouseX <= backButtonX + backButtonWidth &&
                mouseY >= backButtonY &&
                mouseY <= backButtonY + backButtonHeight
            ) {
                canvas.removeEventListener("click", handleBackClick);
                closeDetailsMenu();
            }
        }, {once: true});

        detailsMaxScroll = Math.max(
            totalTextHeight + 40 + (selectedProject.loadedImage ? selectedProject.loadedImage.height : 0) - menuHeight + 160,
            0
        );
    }
    if (message.visible && !menuVisible && !selectedProject) {
        const textX = questBoard.x - camera.x + questBoard.width / 2;
        const textY = questBoard.y - 20;
        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText(message.text, textX, textY);
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