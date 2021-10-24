//---------------
//Serial
let lastData;

function serverConnected() {
  print("Connected to Server");
}

function gotList(thelist) {
  print("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

function gotData() {
  let serialData = serial.read();
  lastData = serialData;
  ghostShowState[serialData] = !ghostShowState[serialData];
  handleNumVisibleGhosts();

}

//---------------
//-----------Ghost Rendering

let vid, thunder;
let vidHeight;
let bl_frame, br_frame, tl_frame, tr_frame;

let frame_size = 0;

const alphaChange = 3;
let coords = [];
let lightningTransparency = 0;

//Ghost variables
const numGhosts = 5;
let volume = 1;
// whether the ghost should be shown or not
let ghostShowState = [false, false, false, false, false];
// alphas on the ghost covers
// 100 = obscured, 0 = transparent
let showAlpha = [100, 100, 100, 100, 100];

// ---------Setup for text
let myFont;
let tSize = 200;

let xspacing = 85; // Distance between each horizontal location
let w; // Width of entire wave
let theta = 0.0; // Start angle at 0
let amplitude = 20.0; // Height of wave
let period = 500.0; // How many pixels before the wave repeats
let dx; // Value for incrementing x
let yvalues; // Using an array to store height values for the wave
let introXOffset;
let outroXOffset;
let outroIndent = 300;
let introIndent = 800;

let sentence = "candles summon our spooky serenade";
let outro = "happy hauntings!"
let sentenceArray = [];
let outroArray = [];
let introTextAlpha = 255;


// ----------Setup and callbacks
function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateCoords();
  calcFrameSize();

  vid.pause();

  serial = new p5.SerialPort();

  serial.list();
  serial.open("/dev/tty.usbmodem141201");
  serial.on("connected", serverConnected);
  serial.on("list", gotList);
  serial.on("data", gotData);
  serial.on("error", gotError);
  serial.on("open", gotOpen);
  serial.on("close", gotClose);

  textSetup();
  textFont(myFont);

  handleNumVisibleGhosts();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateCoords();
  textSetup();
  calcFrameSize();
}

function calcFrameSize() {
  frame_size = windowWidth / 9;
}

function calculateCoords() {
  coords = [];
  let widthSteps = windowWidth / numGhosts;
  let heightStep = (windowWidth * (9 / 16)) / 4;
  let coverHeight = heightStep * 2;
  for (let i = 0; i < numGhosts; i++) {
    let x = widthSteps * i;
    let y = heightStep;
    let width = widthSteps;
    let height = coverHeight;

    coords.push({
      x: x,
      y: y,
      w: width,
      h: height,
    });
  }
}

function textSetup() {
  tSize = windowWidth / 15;
  xspacing = tSize * .4;
  outroIndent =  windowWidth * .32;
  introIndent = windowWidth/2 - (tSize * .7);
  yOffset = windowHeight - 200;
  w = windowWidth - 20;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(floor(w / xspacing));
  introArray = sentence.split("");
  outroArray = outro.split("");
  outroXOffset = windowWidth / 2 - outroIndent;
  introXOffset = windowWidth / 2 - introIndent;
}


function preload() {
  // vid = createVideo("Busts-2.m4v");
  vid = createVideo("singing-busts.mp4");
  vid.loop();
  vid.hide();

  thunder = createAudio("thunder.mp3");

  br_frame = loadImage("br-corner.png");
  tr_frame = loadImage("tr-corner.png");
  bl_frame = loadImage("bl-corner.png");
  tl_frame = loadImage("tl-corner.png");

  myFont = loadFont('AmaticSC-Bold.ttf');
}

//Key presses mainly used for testing/control/reset.
function keyPressed() {
  let i;

  switch (keyCode) {
    case ENTER:
      console.log("alpha: " + showAlpha);
      console.log("state: " + ghostShowState);
      console.log("volume: " + volume);
      break;
    case 49: //1
      i = 0;
      break;
    case 50: //2
      i = 1;
      break;
    case 51: //3
      i = 2;
      break;
    case 52: //4
      i = 3;
      break;
    case 53: //5
      i = 4;
      break;
    case UP_ARROW:
      vid.loop();
      break;
    case DOWN_ARROW:
      vid.pause();
      break;
    case LEFT_ARROW:
      vid.volume(0.2);
      break;
    case RIGHT_ARROW:
      vid.volume(1);
      break;
    default:
      console.log("unregistered key");
  }

  if (i >= 0) {
    ghostShowState[i] = !ghostShowState[i];
  }

  handleNumVisibleGhosts();
}

// Use for things that only change ONCE after num visible ghosts changes
function handleNumVisibleGhosts() {
  setVolume(numVisibleGhosts());

  introTextAlpha = (1 - (numVisibleGhosts() / 5)) * 255;
  if (numVisibleGhosts() > 4) {
    lightningTransparency = 100;
    thunder.play();
  }
}

function calcWave() {
  // Increment theta (try different values for
  // 'angular velocity' here)
  theta += 0.02;

  // For every x value, calculate a y value with sine function
  let x = theta;
  for (let i = 0; i < yvalues.length; i++) {
    yvalues[i] = cos(x) * amplitude;
    x += dx;
  }
}

function renderWave(arr, a, xoffset, spread) {
  let c = color(59,	201, 220, a);
  fill(c);

    // A simple way to draw the wave with an ellipse at each location
  for (let x = 0; x < arr.length; x++) {
    // ellipse(x * xspacing, height / 2 + yvalues[x], 16, 16);
        text(arr[x], xoffset + x * spread, yOffset + yvalues[x]);
  }
}

function setVolume(n) {
  let newVol = n / 5;
  volume = Math.max(newVol, 0.1);
  vid.volume(volume);
}

function numVisibleGhosts() {
  return ghostShowState.filter(Boolean).length;
}

function draw() {
  background(color(0, 0, 0));
  vidHeight = windowWidth * (9 / 16);
  image(vid, 0, 0, windowWidth, vidHeight);

  // Calculations and setup
  for (i = 0; i < numGhosts; i++) {
    handleCoverAlpha(i);
  }
  calcWave();

  // Start render
  renderCovers();

  // Render states
  if (numVisibleGhosts() < 5) {
    textSize(tSize);
    renderWave(introArray, introTextAlpha, introXOffset, xspacing);
  } else {
    renderFrame();
    lightning();
    textSize(tSize * 1.5);
    renderWave(outroArray, 255, outroXOffset, xspacing*1.5);
  }

}

function renderFrame() {
  image(br_frame, windowWidth - frame_size, windowHeight - frame_size, frame_size, frame_size);
  image(bl_frame, 0, windowHeight - frame_size, frame_size, frame_size);
  image(tl_frame, 0, 0, frame_size, frame_size);
  image(tr_frame, windowWidth - frame_size, 0, frame_size, frame_size);
}

// Fades covers from state to state
function handleCoverAlpha(num) {
  currentAlpha = showAlpha[num];

  if (ghostShowState[num]) {
    if (currentAlpha > 0) {
      currentAlpha -= alphaChange; //slowly fade out
    }
  } else {
    if (currentAlpha < 255) {
      currentAlpha += alphaChange; //slowly fade in
    }
  }

  showAlpha[num] = Math.min(255, Math.max(0, currentAlpha)); //clamp to 0-255
}

function renderCovers() {
  for (let i = 0; i < numGhosts; i++) {
    coverColor = color(0, 0, 0, showAlpha[i]);
    fill(coverColor);
    noStroke();
    let c = coords[i];
    rect(c.x, c.y, c.w, c.h);
  }
}

function lightning() {
  if (lightningTransparency > 0) {
    c = color(255, 255, 255, lightningTransparency);
    fill(c);
    noStroke();
    rect(0, 0, windowWidth, windowHeight);
    lightningTransparency -= 3;
    if (random() > .95) {
      lightningTransparency += 20;
    }
  }
}
