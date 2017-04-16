/**
 *  This technique tracks a beatThreshold level.
 *  
 *  When the current volume exceeds the beatThreshold, we have a beat, and
 *  "debounce" to ensure each beat only triggers once.
 *  
 *  When a beat is detected, we do two things to "debounce":
 *   - Increase the threshold, so that we don't get another
 *     beat right away, by adding a beatCutoff to the beatThreshold.
 *     The beatCutoff decays back to beatThreshold level at beatDecayRate.
 *   - Wait a certain amount of time before detecting another beat. This is
 *     accomplished by tracking framesSinceLastBeat > beatHoldFrames.
 *
 *  Each run through the Draw loop, the detectBeat() function decides
 *  whether we have a beat or not based on these Beat Detect Variables
 *  and the current amplitude level. 
 *  
 *  Thank you to Felix Turner's "Simple Beat Detection"
 *  http://www.airtightinteractive.com/2013/10/making-audio-reactive-visuals/
 */

var soundFile;
var amplitude;

var backgroundColor;

// rectangle parameters
var rectRotate = true;
var rectMin = 15;
var rectOffset = 20;
var numRects = 10;

// :: Beat Detect Variables
// how many draw loop frames before the beatCutoff starts to decay
// so that another beat can be triggered.
// frameRate() is usually around 60 frames per second,
// so 20 fps = 3 beats per second, meaning if the song is over 180 BPM,
// we wont respond to every beat.
var beatHoldFrames = 30;

// what amplitude level can trigger a beat?
var beatThreshold = 0.11; 

// When we have a beat, beatCutoff will be reset to 1.1*beatThreshold, and then decay
// Level must be greater than beatThreshold and beatCutoff before the next beat can trigger.
var beatCutoff = 0;
var beatDecayRate = 0.98; // how fast does beat cutoff decay?
var framesSinceLastBeat = 0; // once this equals beatHoldFrames, beatCutoff starts to decay.
var img;
var xspacing = 16;    // Distance between each horizontal location
var w;                // Width of entire wave
var theta = 0.0;      // Start angle at 0
var period = 500.0;   // How many pixels before the wave repeats
var dx;               // Value for incrementing x
var yvalues;  // Using an array to store height values for the wave
var amp_boost; // Using the level times 500 so the amplitude chnages can be visulized
var message = "DANCE",
  font,
  bounds, // holds x, y, w, h of the text's bounding box
  fontsize = 80,
  x, y; // x and y coordinates of the text
function preload() {
  soundFile = loadSound('../../music/Mack.mp3');
  img = loadImage("longhorn.png");
  font = loadFont('Champagne.ttf');
}
function setup() {
  c = createCanvas(windowWidth, windowHeight);
  noStroke();
  rectMode(CENTER);
  backgroundColor = color( random(0,255), random(0,255), random(0,255) );
  amplitude = new p5.Amplitude();
  soundFile.play();
  amplitude.setInput(soundFile);
  amplitude.smooth(0.9);
  w = width+16;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(floor(w/xspacing));
}

//Draws all the functions
function draw() {
  background(backgroundColor);
  calcWave();
  renderWave();
  var level = amplitude.getLevel();
  amp_boost = level*650;
  detectBeat(level);
  dance();
  pop();
}

//Finds the beat
function detectBeat(level) {
  if (level  > beatCutoff && level > beatThreshold){
    onBeat();
    beatCutoff = level *1.2;
    framesSinceLastBeat = 0;
  } else{
    if (framesSinceLastBeat <= beatHoldFrames){
      framesSinceLastBeat ++;
    }
    else{
      beatCutoff *= beatDecayRate;
      beatCutoff = Math.max(beatCutoff, beatThreshold);
    }
  }
}

//Changes backgorund based on beat
function onBeat() {
  backgroundColor = color( random(0,255), random(0,255), random(0,255) );
  rectRotate = !rectRotate;
}

//Makes the size of the canvas the size of the screen
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

// Calculates the wave based on amplitude of song
function calcWave() {
  theta += 0.02; //Increments velocity

  // Calculates x and y values of sin wave
  var x = theta;
  for (var i = 0; i < yvalues.length; i++) {
    yvalues[i] = sin(x)*amp_boost;
    x+=dx;
  }
}

//Renders wave based on amplitude and generates mulitple longhorns
function renderWave() {
  noStroke();
  fill(255);
  //Draws a longhorn for screen length
  for (var x = 0; x < yvalues.length; x++) {
    image(img,x*xspacing, height/2+yvalues[x], 16, 16);
  }
}

//Makes the title dance
function dance(){
  textFont(font);
  textSize(fontsize);
  bounds = font.textBounds(message, 0, 0, fontsize);
  x = width / 2 - bounds.w / 2;
  fill(0);
  text(message, x, 80);
}