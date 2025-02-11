let ninjaStill, ninjaRun, ninjaJump, currentNinja;
let scrolls = [];
let collected = 0;
let scrollImages = [];
let ninjaX, ninjaY, ninjaSpeed, isJumping, direction, facingRight;
let greenHillBg;
let canines = [];

const ninjaWidth = 48;
const ninjaHeight = 48;
const ninjaRunWidth = 48;
const ninjaRunHeight = 48;
const scrollSize = 20;
const jumpHeight = 220;
const groundY = 320;
const spawnY = 300;
const leftBoundary = 0;
const rightBoundary = 800;

let winScreen = false;
let loseScreen = false;
let restartButton;

let hasWon = false; // Track if the player has won
let totalScrolls = 3; // Total scrolls that can appear in the game

let canineSpeedIncrease = 0; // Track increase in the stupid canine's speed after winning

function preload() {
  bg = loadImage('background.png');
  ninjaStill = loadImage('idle.gif');
  ninjaRun = loadImage('run.gif');
  ninjaJump = loadImage('jump.gif');
  scrollImages.push(loadImage('scroll.gif'));
  ringFont = loadFont('TinyUnicode.ttf');
  winFont = loadFont('TinyUnicode.ttf');
  canineImage = loadImage('canine.gif');
}

function setup() {
  createCanvas(800, 400);
  // Ninja
  ninjaX = 100;
  ninjaY = spawnY;
  ninjaSpeed = 5;
  isJumping = false;
  direction = 0;
  facingRight = true;
  currentNinja = ninjaStill;

  for (let i = 0; i < totalScrolls; i++) {
    let scrollX = random(200, width - 50);
    let scrollY = random(spawnY - jumpHeight, spawnY - 20);
    scrolls.push(new Scroll(scrollX, scrollY));
  }

  restartButton = createButton('Next');
  restartButton.position(width / 2 - 70, height / 2 + 60);
  restartButton.size(140, 40);
  restartButton.mousePressed(restartGame);
  restartButton.hide();
  restartButton.style('font-family', 'TinyUnicode');
  restartButton.style('font-size', '20px');
  restartButton.style('color', '#FFF');
  restartButton.style('background-color', '#000');
}

function draw() {
  if (winScreen) {
    // Show the win screen
    background(0);
    fill(255);
    textSize(50);
    textFont(winFont);
    textAlign(CENTER, CENTER);

    // Bouncing YOU WIN! text (Oscillation)
    let oscillation = sin(frameCount * 0.1) * 20;
    text("YOU WIN!", width / 2, height / 2 + oscillation);

    restartButton.show();
    return;
  }

  if (loseScreen) {
    // Show the lose screen
    background(0);
    fill(255);
    textSize(50);
    textFont(winFont);
    textAlign(CENTER, CENTER);

    // Bouncing YOU LOSE! text (Oscillation)
    let oscillation = sin(frameCount * 0.1) * 20;
    text("YOU LOSE!", width / 2, height / 2 + oscillation);

    restartButton.show();
    return; 
  }

  image(bg, 0, 0, width, height); // The Background

  // Display "SCROLLS" count at the top-left corner
  fill(255, 255, 255);
  stroke(0);
  strokeWeight(3);
  textSize(45);
  textFont(ringFont);
  textAlign(LEFT, TOP);
  text(`SCROLLS: ${collected}`, 25, 10);

  // Display Instructions at the top-right corenr
  fill(255, 255, 255);
  stroke(0);
  strokeWeight(3);
  textSize(30);
  textFont(ringFont);
  textAlign(LEFT, TOP);
  text("Left Arrow Key: Move Left\nRight Arrow key: Move Right\nUp Arrow Key: Jump", 560, 10);
  

  if (isJumping) {
    currentNinja = ninjaJump;
  } else if (direction !== 0) {
    currentNinja = ninjaRun;
  } else {
    currentNinja = ninjaStill;
  }

  if (direction !== 0) {
    ninjaX += direction * ninjaSpeed;
    ninjaX = constrain(ninjaX, leftBoundary, rightBoundary - ninjaWidth);
  }

  push();
  translate(ninjaX + ninjaWidth / 2, ninjaY + ninjaHeight / 2);
  if (!facingRight) {
    scale(-1, 1);
  }
  if (currentNinja == ninjaRun) {
    image(currentNinja, -ninjaRunWidth / 2, -ninjaRunHeight / 2, ninjaRunWidth, ninjaRunHeight);
  } else {
    image(currentNinja, -ninjaWidth / 2, -ninjaHeight / 2, ninjaWidth, ninjaHeight);
  }
  pop();

  // Display scrolls and check for the stupid collisions
  for (let scroll of scrolls) {
    scroll.display();
  }

  for (let i = scrolls.length - 1; i >= 0; i--) {
    if (scrolls[i].checkCollision(ninjaX + ninjaWidth / 2, ninjaY + ninjaHeight / 2)) {
      scrolls.splice(i, 1);
      collected++;
    }
  }

  // Display that damn canine and check for collisions
  for (let canine of canines) {
    canine.update();
    canine.display();
    if (dist(ninjaX + ninjaWidth / 2, ninjaY + ninjaHeight / 2, canine.x + ninjaWidth / 2, canine.y + ninjaHeight / 2) < ninjaWidth / 2) {
      loseScreen = true; // Trigger lose screen if ninja hits the stupid canine
    }
  }

  // Trigger win screen if all scrolls are collected
  if (scrolls.length == 0 && !winScreen && !loseScreen) {
    winScreen = true;
    hasWon = true;
  }

  // Handle jump mechanics
  if (isJumping) {
    ninjaY -= ninjaSpeed * 2;
    if (ninjaY <= spawnY - jumpHeight) {
      isJumping = false;
    }
  } else if (ninjaY < spawnY) {
    ninjaY += ninjaSpeed * 2;
    if (ninjaY > spawnY) ninjaY = spawnY;
  }
}

function restartGame() {
  // Reset game state
  scrolls = [];
  collected = 0;
  winScreen = false;
  loseScreen = false;
  restartButton.hide();
  ninjaX = 100;
  ninjaY = spawnY;

  // Regenerate scrolls
  for (let i = 0; i < totalScrolls; i++) {
    let scrollX = random(200, width - 50);
    let scrollY = random(spawnY - jumpHeight, spawnY - 20);
    scrolls.push(new Scroll(scrollX, scrollY));
  }

  // Add an extra scroll if the player won
  if (hasWon) {
    totalScrolls++;
    let scrollX = random(200, width - 50);
    let scrollY = random(spawnY - jumpHeight, spawnY - 20);
    scrolls.push(new Scroll(scrollX, scrollY));

    // Increase the speed of the stupid canine after winning
    canineSpeedIncrease += 0.5;
    hasWon = false;
  }

  // Reset canines
  canines = [];
  canines.push(new Canine(700, spawnY)); // Add new canine after restart
}

function keyPressed() {
  if (keyCode == LEFT_ARROW) {
    direction = -1;
    facingRight = false;
  } else if (keyCode == RIGHT_ARROW) {
    direction = 1;
    facingRight = true;
  } else if (keyCode == UP_ARROW && ninjaY == spawnY) {
    isJumping = true;
  }
}

function keyReleased() {
  if (keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW) {
    direction = 0;
  }
}

class Scroll {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = scrollSize;
  }

  display() {
    image(scrollImages[0], this.x, this.y, this.size, this.size);
  }

  checkCollision(px, py) {
    let collectionRange = this.size;
    return dist(px, py, this.x + this.size / 2, this.y + this.size / 2) < collectionRange;
  }
}

class Canine {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = ninjaSpeed - 3 + canineSpeedIncrease; // Increase canine speed based on wins
    this.image = canineImage;
    this.facingRight = true;
  }

  update() {
    // Canine follows ninja's movement
    this.x += this.speed;
    if (this.x < leftBoundary || this.x > rightBoundary - ninjaWidth) {
      this.speed *= -1; // Reverse direction when hitting boundaries
      this.facingRight = !this.facingRight;
    }
  }

  display() {
    let canineWidth = ninjaWidth * 0.8;
    let canineHeight = canineWidth * 0.8;
    let canineY = this.y + 10;

    if (this.facingRight) {
      image(this.image, this.x, canineY, canineWidth, canineHeight);
    } else {
      push();
      scale(-1, 1); // WHY IS THE CANINE NOT FLIPPING (nvm I fixed it)
      image(this.image, -this.x - canineWidth, canineY, canineWidth, canineHeight);
      pop();
    }
  }
}
