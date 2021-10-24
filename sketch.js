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
let tSize = 84;

let xspacing = 35; // Distance between each horizontal location
let w; // Width of entire wave
let theta = 0.0; // Start angle at 0
let amplitude = 20.0; // Height of wave
let period = 500.0; // How many pixels before the wave repeats
let dx; // Value for incrementing x
let yvalues; // Using an array to store height values for the wave
let introXOffset;
let outroXOffset;
const outroIndent = 300;
const introIndent = 525;

let sentence = "place candles to call the ghosts";
let outro = "happy hauntings"
let sentenceArray = [];
let outroArray = [];
let introTextAlpha = 255;

function textSetup() {
  yOffset = windowHeight - 200;
  w = windowWidth - 20;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(floor(w / xspacing));
  introArray = sentence.split("");
  outroArray = outro.split("");
  outroXOffset = windowWidth / 2 - outroIndent;
  introXOffset = windowWidth / 2 - introIndent;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  calculateCoords();
  vid.pause();

  serial = new p5.SerialPort();

  serial.list();
  serial.open("/dev/tty.usbmodem143201");
  serial.on("connected", serverConnected);
  serial.on("list", gotList);
  serial.on("data", gotData);
  serial.on("error", gotError);
  serial.on("open", gotOpen);
  serial.on("close", gotClose);

  textSetup();
  handleNumVisibleGhosts();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateCoords();
  textSetup();
}

function preload() {
  // vid = createVideo("Busts-2.m4v");
  vid = createVideo("singing-busts.mp4");
  vid.loop();
  vid.hide();

  thunder = createAudio("thunder.mp3");

  myFont = loadFont('AmaticSC-Bold.ttf');
}

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
    case 32: //spacebar
      thunder.play();
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

function handleNumVisibleGhosts() {
  let numVisible = ghostShowState.filter(Boolean).length;
  handleVolume(numVisible);

  introTextAlpha = (1 - (numVisible / 5)) * 255;
  if (numVisible > 4) {
    lightningTransparency = 100;
    thunder.play();
  }
}

function showText() {
  textFont(myFont);
  calcWave();
  let numVisible = ghostShowState.filter(Boolean).length;
  if (numVisible < 5) { //render instructions
    renderWave(introArray, introTextAlpha, introXOffset);
  } else if (numVisible == 5) { //render outdro
    renderWave(outroArray, 255, outroXOffset);
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

function renderWave(arr, a, xoffset) {
  let c = color(59,	201, 220, a);
  fill(c);
  textSize(tSize);

    // A simple way to draw the wave with an ellipse at each location
  for (let x = 0; x < arr.length; x++) {
    // ellipse(x * xspacing, height / 2 + yvalues[x], 16, 16);
        text(arr[x], xoffset + x * xspacing, yOffset + yvalues[x]);
  }
}


function handleVolume(n) {
  let newVol = n / 5;
  volume = Math.max(newVol, 0.1);
  vid.volume(volume);
}

function draw() {
  background(color(0, 0, 0));
  vidHeight = windowWidth * (9 / 16);
  image(vid, 0, 0, windowWidth, vidHeight);

  handleGhosts();
  handleCovers();
  handleLightning();
  showText();
}

function handleGhosts() {
  // for each of the ghosts:
  // handle show state
  for (i = 0; i < numGhosts; i++) {
    handleShowState(i);
  }
}

function handleShowState(num) {
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

function handleCovers() {
  for (let i = 0; i < numGhosts; i++) {
    coverColor = color(0, 0, 0, showAlpha[i]);
    fill(coverColor);
    noStroke();
    let c = coords[i];
    rect(c.x, c.y, c.w, c.h);
  }
}

function handleLightning() {
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
