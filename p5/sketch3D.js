// let debug = 'sans-serif';
let font;
let fontMenu;
let muteWht;
let muteBlk;
let menuWht;
let astralTitle;
let astralBodies;
let bodiesRotation = 0;
let bodiesRotationSpeed = 0.002;
let fullScrn = false;
let fullOpen;
let desktop;
let firstLoad = true;
let switched = false;
let fpsLow = false;
let frames = [];

function preload() {
    // if (displayWidth >= 800) {
    //     desktop = true;
    //     font = loadFont('./assets/hindLight.otf');
    // } else {
    //     desktop = false;
    // }
    font = loadFont('./assets/hindLight.otf');
    muteWht = 'url(./design/mute1.svg)';
    muteBlk = 'url(./design/muteblk1.svg)';
    menuWht = 'url(./design/menu-thin.svg)';
    fullOpen = 'url(./design/fullOpen.svg)';
    fullClose = 'url(./design/fullClose.svg)';
    fontMenu = "'Hind', 'sans-serif'";
    astralTitle = './design/astralTitle1.svg';
    astralBodies = './design/astralBodies1.png';
}

let base;
let planets = [];
let dust = [];
let sun;
let center;
let grow;

let mapSwayX;
let mapswayY;
let swayX;
let swayY;
let dustInterval;
let colourInterval;
let timerInterval;
let timer = 5000;
let idleTimer = 0;

let createPlanet = false;
let showMenu = false;
let showGravity = false;
let showInfluence = false;

let sunRadius = 4;
let sunMass = 120;
let initialPlanets = 0;
let planetInfluence = 1;
// let planetInfluence = 2;
// let planetGravityStrength = 0.65;
let planetGravityStrength = 0.33;
// let planetGravityStrength = 1;
let mergePlanets = true;
let planetResolution = 16;

let orbitSpeed = {
    initialMag: 1.25,
    // c: 2.65
}
let slow = false, medium = true, fast = false;
let rotation = true;

let sounds;
let midi;
let midiDevice = true;
let resetCounter = 0;
let midiAccess;

let cam;
let camPosition;
let cc;
let fov;

let angleX = 0;	// initialize angle variable
let angleY = 0;
let scalar;  // set the radius of camera  movement circle
let startX = 0;	// set the x-coordinate for the circle center
let startY = 0;	// set the y-coordinate for the circle center

let debugMode = false;
let leftSide;
let topSide;

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

function FindCenter() {
    if (desktop) {
        center = createVector(0, 0, 0);
        leftSide = -width / 2;
        topSide = -height / 2;
    } else {
        center = createVector(windowWidth / 2, windowHeight / 2);
        leftSide = 0;
        topSide = 0;
    }
}

function ColourMode(type, colour) {
    let colourType;
    if (desktop && type == 'emissive') {
        colourType = emissiveMaterial(colour)
    } else {
        colourType = fill(colour);
    }
    return colourType;
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) {
        showGravity = true;
    } else if (keyCode === RIGHT_ARROW) {
        showGravity = false;
    }

    if (keyCode === UP_ARROW) {
        showInfluence = true;
    } else if (keyCode === DOWN_ARROW) {
        showInfluence = false;
    }

    if (keyCode === 81) {
        planets.splice(0, planets.length);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);

    if (desktop) {
        cam.Resize();
        perspective(PI / 3, width / height);
    }
    FindCenter();

    if (firstLoad == false) {
        menu.muteB.remove();
        menu.menuB.remove();
        menu.fullB.remove()
        menu.MenuButtons();

        // sun = new Sun(center.x, center.y, sunMass);

        // Checks to see if menu needs resizing
        if (openMenu) {
            menu.container.remove();
            menu.bgFull.remove();
            menu.bgHalf.remove();
            menu.Container();
            if (midiOptions) {
                menu.OpenMidiPage();
            }
        }
        sun = new Sun(center.x, center.y, sunMass);
    }
}

function SwitchMode() {
    planets.splice(0, planets.length);
    clearInterval(timerInterval);
    clearInterval(dustInterval);
    clearInterval(colourInterval);
    switched = true;
    remove();
    desktop = !desktop;
    new p5();
}
function CanvasSelect() {
    if (desktop) {
        // font = loadFont('./assets/hindLight.otf')
        // setAttributes('antialias', true);
        // setAttributes({ alpha: false });
        // setAttributes({ premultipliedAlpha: false });
        // setAttributes('premultipliedAlpha', false);
        // setAttributes('depth', false);
        setAttributes("alpha", true);
        setAttributes({ version: 2 });
        base = createCanvas(windowWidth, windowHeight, WEBGL);
        cam = new Cameras();
        cam.init();
        perspective(PI / 3, width / height);
    } else {
        font = "'Hind', 'sans-serif'";
        base = createCanvas(windowWidth, windowHeight, P2D);
    }
    base.id('myCanvas');
    base.style('position: fixed');
    base.style('-webkit-transform: translateZ(0)');
    if (displayWidth < 800) {
        pixelDensity(1);
    }
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

function setup() {
    if (switched == false) {
        if (displayWidth >= 1024) {
            desktop = true;
        } else {
            desktop = false;
        }
    }
    CanvasSelect();
    FindCenter();
    // const canvas = document.getElementById("myCanvas");
    // let gl = canvas.getContext("webgl");
    // let tt = gl.getParameter(gl.VERSION);
    if (firstLoad) {
        StartScreen(true);
    } else {
        sounds = new Sounds();
        sounds.Init();
        // Tone.context.resume();
        midi = new MidiOut();
        midi.setup();

        // RecordScreen();

        // sunMass = height / sunRadius;
        sun = new Sun(center.x, center.y, sunMass);

        cc = new Colours();

        for (let i = 0; i < initialPlanets; i++) {
            planets[i] = new Planets(random(-width / 2 + 100, width / 2 - 100), random(-height / 2 + 100, height / 2 - 100), 1, center);
            planets[i].attachSounds(new Sounds(planets[i]));
        }

        menu = new Menu();
        if (openMenu) {
            menu.Container();
        }
        menu.MenuButtons();
        menu.FpsCounter();

        textSize(18);
        textFont(font);

        timerInterval = setInterval(timeIt, 1000);
        dustInterval = setInterval(addDust, 5000);
        colourInterval = setInterval(cc.colourChange(), 5000);
    }
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

function mouseMoved() {
    idleTimer = 0;
}

function speedControl() {
    if (orbitVal === 'I') {
        orbitSpeed = {
            initialMag: 2,
            c: 0.8,
            sunGravity: 0.33
        }
    }
    if (orbitVal === 'II') {
        orbitSpeed = {
            initialMag: 1.3,
            c: 1.85,
            sunGravity: 1
        }
    }
    if (orbitVal === 'III') {
        orbitSpeed = {
            initialMag: 1.82,
            c: 2.65 * 1.5,
            sunGravity: 1 * 2
        }
    }
    return false;
}

function rotateCam() {
    if (rotation && desktop) {
        let rot = map(planets.length, 0, 20, 0, 0.001);
        let rSpeed = constrain(rot, 0, 0.001);

        cam.angleY = rSpeed;
    }
}

function timeIt() {
    if (desktop) {
        cam.counter++;
        if (cam.counter > 10) {
            rotateCam();
        }
    }
    resetCounter++;
    cc.counter++;
    idleTimer++;

    // Check the last five frames and show warning if low
    if (desktop) {
        let warningOn = 24;
        let warningOff = 30;
        let f = floor(frameRate());
        append(frames, f);
        if (frames.length > 5) {
            frames.splice(0, 1);
        }
        let average = 200;
        if (frames.length > 4) {
            let sum = 0;
            for (let i = 1; i < frames.length; i++) {
                sum += frames[i];
            }
            average = sum / frames.length;
        }
        if (average <= warningOn && fpsLow == false) {
            menu.fpsWarning();
            fpsLow = true;
        }
        // Remove warning if average framerate increases
        if (average >= warningOff && fpsLow == true) {
            menu.warning.remove();
            fpsLow = false;
        }
    }
}

function mousePressed() {
    // FindCenter();
    if (firstLoad == false) {
        Tone.context.resume();
        if (desktop) {
            angleY = 0;
            cam.angleY = 0;
            sun.angleY = 0;
            cam.easycam.setState(cam.state1, 0);
            cam.counter = 0;
            cam.zSpeed = 0;
        }
        resetCounter = 0;
    }
}

function addDust() {
    let dustSize;
    let boundary = {
        w: [],
        h: []
    }
    if (desktop) {
        dustSize = 0.05;
        boundary.w = [width / 2, -width / 2];
        boundary.h = [height / 2, -height / 2];
    } else {
        dustSize = 0.1;
        boundary.w = [-width, width];
        boundary.h = [-height, height];
    }
    a = new Dust(random(boundary.w), random(-height, height), dustSize, center);
    dust.push(a);
    b = new Dust(random(-width, width), random(boundary.h), dustSize, center);
    dust.push(b);
}

function calculateMass(value) {
    return sqrt(value) * 10;
}

function mouseReleased() {
    if (createPlanet) {
        if (desktop) {
            let newPlanet = new Planets(mouseX - width / 2, mouseY - height / 2, grow, center);
            newPlanet.attachSounds(new Sounds(newPlanet));
            planets.push(newPlanet);
        } else {
            let newPlanet = new Planets(mouseX, mouseY, grow, center);
            newPlanet.attachSounds(new Sounds(newPlanet));
            planets.push(newPlanet);
        }

    }
    if (desktop) {
        cam.counter = 0;
    }
}

function StartScreen(static) {
    push();
    if (static) {
        let container = createDiv('');
        // container.style('background-color', 'red');
        container.style('width', '100%');
        container.style('position', 'absolute');
        container.style('text-align', 'center');
        container.style('top', '50%');
        container.style('left', '50%');
        container.style('-ms-transform: translate(-50%, -50%)');
        container.style('transform: translate(-50%, -50%)');

        let logo = createImg(astralTitle, 'Astral logo');
        logo.parent(container)
        logo.style('max-width', '40vh');
        logo.style('height', 'auto');
        logo.style('margin', 'auto');
        logo.style('display: block');
        logo.style('margin-bottom', '3vh');
        // logo.style('background-color', 'blue');

        let startButton = createButton('START');
        startButton.parent(container);
        startButton.style('margin-top', '10px');
        startButton.style('display', 'inline')
        startButton.style('padding', '8px');
        startButton.style('padding-bottom', '6px');
        startButton.style('width', '10vw');
        startButton.style('background-color', 'black');
        startButton.style('border', '1px solid white');
        startButton.style('color', 'white');
        startButton.style('font-family', fontMenu);
        startButton.style('cursor', 'pointer');
        startButton.style('letter-spacing', '3px');
        // startButton.style('text-align', 'center');
        // startButton.style('border-radius', '4px');
        startButton.mouseReleased(() => {
            container.remove();
            firstLoad = false
            setup();
        });
    }
    background(0);
    if (desktop) {
        lightFalloff(0.5, 0, 0);
        // ambientLight(15);
        // pointLight(color(255), center.x, center.y, -350);
        pointLight(color(255), mouseX - width / 2, mouseY - height / 2, -300);

        let diameter = width / 8;
        if (diameter <= 130) {
            diameter = 130;
        }
        let bodiesCount = 10;
        // let bodiesCount = 50;
        let angle = Math.PI * 2 / bodiesCount;

        noStroke();
        ambientMaterial(255);
        bodiesRotation += bodiesRotationSpeed;
        translate(0, -2, 0);
        rotate(bodiesRotation);
        translate(diameter / -2, diameter * 1.5, 0);
        for (var i = 0; i < bodiesCount; i++) {

            x = center.x + cos(angle * i) * diameter;
            y = center.y - sin(angle * i) * diameter;
            translate(x, y, 0);
            // sphere(20);
            // sphere(50);
            sphere(30);
        }
    } else {
        let diameter = width / 5;
        if (diameter <= 240) {
            diameter = 240;
        }
        let bodiesCount = 10;
        // let bodiesCount = 50;
        let angle = Math.PI * 2 / bodiesCount;

        noStroke();
        fill(255);
        bodiesRotation += bodiesRotationSpeed;
        translate(width / 2, height / 2);
        rotate(bodiesRotation);
        translate(-width / 2, -height / 2);
        for (var i = 0; i < bodiesCount; i++) {

            x = center.x + cos(angle * i) * diameter;
            y = center.y - sin(angle * i) * diameter;
            ellipse(x, y, 30);
        }
    }
    pop();
}

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

function draw() {
    if (firstLoad) {
        StartScreen(false);
    } else {
        if (openMenu) {
            menu.Active();
        }
        if (menu.counterM < 10) {
            menu.Cooldown();
        }
        menu.Update();
        cc.colourChange();
        background(cc.bg);

        sounds.grid();
        speedControl();

        if (desktop) {
            // swayX = map(mouseX - width / 2, 0, width, 3, - 3);
            // swayY = map(mouseY - height / 2, 0, height, 3, - 3);
            // swayX = lerp(0, swayX, 0.5);
            // swayY = lerp(0, swayY, 0.5);

            // Lighting settings
            spotLight(cc.R, cc.G, cc.B, 0, 0, 550, 0, 0, -1, PI / 3, 300)
            spotLight(cc.R, cc.G, cc.B, 0, 0, -550, 0, 0, 1, PI / 3, 300)
            ambientLight(cc.bg);
            pointLight(cc.R, cc.G, cc.B, 0, 0, 0);
            pointLight(cc.R, cc.G, cc.B, 0, 0, 150);
            pointLight(cc.R, cc.G, cc.B, 0, 0, -150);
        }
        
        push();
        if (createPlanet && mouseIsPressed) {
            if (grow <= 2) {
                // emissiveMaterial(255, 255, 0, 150);
                ColourMode('emissive', [255, 255, 0]);
            } else
                if (grow <= 3) {
                    // emissiveMaterial(0, 255, 255, 150);
                    ColourMode('emissive', [0, 255, 255]);
                } else
                    if (grow <= 4) {
                        // emissiveMaterial(255, 0, 255, 150);
                        ColourMode('emissive', [255, 0, 255]);
                    } else
                        if (grow <= 5) {
                            // emissiveMaterial(0, 255, 0, 150);
                            ColourMode('emissive', [0, 255, 0]);
                        } else
                            if (grow <= 6) {
                                // emissiveMaterial(255, 255, 255, 150);
                                ColourMode('emissive', [255, 255, 255]);
                            } else
                                if (grow <= 7) {
                                    // emissiveMaterial(255, 0, 0, 150);
                                    ColourMode('emissive', [255, 0, 0]);
                                } else
                                    if (grow <= 8) {
                                        // emissiveMaterial(0, 0, 255, 150);
                                        ColourMode('emissive', [0, 0, 255]);
                                    } else
                                        if (grow <= 9) {
                                            // emissiveMaterial(50, 190, 150, 200);
                                            ColourMode('emissive', [50, 190, 150]);
                                        }
            if (desktop) {
                push();
                // translate(0, 0, 1);
                noStroke();
                ellipse(mouseX - width / 2, mouseY - height / 2, calculateMass(grow));
                // emissiveMaterial(cc.bg);
                // ellipse(mouseX - width / 2, mouseY - height / 2, calculateMass(grow / 1.85));
                pop();
            } else {
                push();
                noStroke();
                ellipse(mouseX, mouseY, calculateMass(grow));
                // fill(cc.bg);
                // ellipse(mouseX, mouseY, calculateMass(grow / 2.5));
                pop();
            }
            // grow += 0.037; //growth speed
            grow += 0.045; //growth speed
        }
        else {
            grow = 1; //size the circle resets to
        }

        if (grow >= 9) { //for when it reaches a certain size
            grow = 9;
        }
        pop();


        for (let i = planets.length - 1; i >= 0; i--) {
            if (planets[i].intersects(sun)) {
                planets.splice(i, 1);
            }
        }

        for (let i = planets.length - 1; i >= 0; i--) {
            let overlapping = false;
            for (let other of planets) {
                if (planets[i] !== other && planets[i].intersects(other)) {
                    overlapping = true;
                    planets[i].proximity(other);
                }
            }
            if (overlapping && mergePlanets) {
                planets.splice(i, 1);
            }
        }

        for (let i = dust.length - 1; i >= 0; i--) {
            dust[i].update();
            dust[i].show();
            sun.attract(dust[i]);
            if (dust[i].touches(sun)) {
                dust.splice(i, 1);
            }
        }

        //// this makes mass effected the same for gravity (falling at the same speed). Remeber to replace '(gravity)' with '(weight)' below.
        // let weight = p5.Vector.mult(gravity, planets.mass);

        for (let i = planets.length - 1; i >= 0; i--) {

            for (let other of planets) { //this for loop shows the gravity line between planets
                if (planets[i] !== other && planets[i].proximity(other)) {
                    // planets[i].proximity(other);
                }
            }

            sun.attract(planets[i]);

            // planets[i].applyForce(gravity);
            planets[i].update();
            planets[i].showGravity(i);
            planets[i].show();
            planets[i].edges();
            planets[i].sounds.calculateNote();
            planets[i].sounds.calculateVelocity();
            planets[i].sounds.trigger();
            planets[i].sounds.visualFeedback();
            // planets[i].sounds.calculateLength();
        }
        sun.stars();
        sun.BHshow();
        if (desktop) {
            cam.update();
            if (debugMode) {
                cam.debugHUD(); // Display camera position info for debug
            }
        }

        midi.listOuts();

        if (menu.midiMode && midiDevice && midiAccess) {
            midi.midiListen();
        }
        sounds.ModeSelect();

        if (debugMode && desktop == false) {
            Debug2D();
        }
        // print('Audio Context: ' + Tone.context.state);
        // print(menu.menuB.style.opacity);
        // print('desktop is ' + desktop, webglVersion);
        // print(sounds.defineScale, sounds.notesTest[3]);
        // print(keyVal);
        // base.onload = () => {
        // sun.BHshow();
        //   }
    }
}

function Debug2D() {
    push();
    let cw = width;
    let ch = height;
    let ww = windowWidth;
    let wh = windowHeight;
    let dw = displayWidth;
    let dh = displayHeight;
    let dd = displayDensity();
    let pd = pixelDensity();
    let m = meter.getValue();
    fill(255);
    textSize(14);
    text('canvas size: ' + cw + 'x' + ch, leftSide + 25, topSide + 25);
    text('window size: ' + ww + 'x' + wh, leftSide + 25, topSide + 50);
    text('display size: ' + dw + 'x' + dh, leftSide + 25, topSide + 75);
    text("display's density: " + dd, leftSide + 25, topSide + 100);
    text("active pixel density: " + pd, leftSide + 25, topSide + 125);
    text("max voices: " + MAX_POLYPHONY, leftSide + 25, topSide + 150);
    text("blackhole radius: " + round(sun.radius), leftSide + 25, topSide + 175);
    text("audio meter: " + round(m), leftSide + 25, topSide + 200);
    text("framerate: " + round(frameRate()), leftSide + 25, topSide + 225);
    pop();


    // fill(255, 0, 0);
    push();
    // emissiveMaterial(255, 0, 0)
    noFill();
    strokeWeight(1);
    stroke(255, 0, 0);
    if (desktop) {
        rect(-width / 2, -height / 2, width, height);
    } else {
        rect(0, 0, width, height);
    }
    // ellipse(width / 2 - (width / 2 * i), height / 2, 100);
    pop();
}


function RecordScreen() {
let btn = createButton('Button');
let chunks =[];
function record() {
    chunks.length = 0;
    let stream = document.querySelector('canvas').captureStream(30),
      recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
      if (e.data.size) {
        chunks.push(e.data);
      }
    };
    recorder.onstop = exportVideo;
    btn.onclick = e => {
      recorder.stop();
      btn.textContent = 'start recording';
      btn.onclick = record;
    };
    recorder.start();
    btn.textContent = 'stop recording';
  }
  
  function exportVideo(e) {
    let blob = new Blob(chunks);
    let vid = document.createElement('video');
    vid.id = 'recorded'
    vid.controls = true;
    vid.src = URL.createObjectURL(blob);
    document.body.appendChild(vid);
    vid.play();
  }
  btn.onclick = record;
}


