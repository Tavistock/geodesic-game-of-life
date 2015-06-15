var Immutable = require('immutable');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);
var DAT = require('dat-gui');

var gol = require('./GameOfLife');

var scene, camera, renderer, controls, container;
var mesh;
var board, neighborsCache;

var rule = gol.rule;

var randomProperty = function (obj) {
      var keys = Object.keys(obj)
          return obj[keys[ keys.length * Math.random() << 0]];
};

/// Parameter
var GameControls = function () {
  this.rules = {
    0: rule.DEATH,
    1: rule.DEATH,
    2: rule.DEATH,
    3: rule.DEATH,
    4: rule.BIRTH,
    5: rule.STASIS,
    6: rule.STASIS,
    7: rule.DEATH,
    8: rule.DEATH,
    9: rule.DEATH,
    10: rule.DEATH,
    11: rule.DEATH,
    12: rule.DEATH
  };

  this.randomRules = function () {
    for (var x in this.rules) {
      this.rules[x] = randomProperty(rule);
    }
  }

  this.colors = {
    alive: randomColor(),
    dead: randomColor(),
    background: randomColor(),
  }

  this.randomColors = function () {
    this.colors.alive = randomColor();
    this.colors.dead = randomColor();
    this.colors.background = randomColor();
    renderer.setClearColor(this.colors.background);
    paint(mesh, board);
  }

  this.speed = 1000;
  this.subdivisions = 2;
  this.neighborsCutoff = 1;

  this.start = start;
  this.stop = stop;
  this.step = step;

  this.randomise = function () {
    this.randomColors();
    this.randomRules();
    this.randomBoard();
  }

  this.randomBoard = random;
  this.blankBoard = blank;

  this.log = function () {console.log(this);}
}

// GUI

var params = new GameControls();
var gui = new DAT.GUI();

//gui.add(params, 'log');
gui.add(params, 'speed', 50, 1000).step(50);

var ruleFolder = gui.addFolder('Rules');
for (var x in params.rules) {
  ruleFolder.add(params.rules, x, rule).listen();
}
ruleFolder.add(params, 'randomRules');

var boardFolder = gui.addFolder('Board');
boardFolder.add(params, 'blankBoard');
boardFolder.add(params, 'randomBoard');

var colorFolder = gui.addFolder('Colors');
colorFolder.addColor(params.colors, 'alive')
.onChange((value) => paint(mesh, board))
.listen();
colorFolder.addColor(params.colors, 'dead')
.onChange((value) => paint(mesh, board))
.listen();
colorFolder.addColor(params.colors, 'background')
.onChange((value) => renderer.setClearColor(value))
.listen();
colorFolder.add(params, 'randomColors');

var miscFolder = gui.addFolder('Misc');
miscFolder.add(params, 'subdivisions')
.onFinishChange((value) => {
  params.subdivisions = value;
  initGol();
});
miscFolder.add(params, 'neighborsCutoff');

gui.add(params, 'start');
gui.add(params, 'step');
gui.add(params, 'stop');

gui.add(params, 'randomise');

// Beginning the loop

init();
animate();

initGol();

// loading


function onReady(callback) {
  var intervalID = window.setInterval(checkReady, 1000);
  function checkReady() {
    if (neighborsCache.count() > 0) {
      window.clearInterval(intervalID);
      callback.call(this);
    }
  }
}

function show(id, value) {
  document.getElementById(id).style.display = value ? 'block' : 'none';
}

onReady(function () {
  show('game-of-life', true);
  show('loading', false);
});

// Painting the board

function randomColor() {
    return Math.random() * 0xffffff;
}

function paint(mesh, cells) {
  var geo = mesh.geometry;
  geo.faces.forEach((f) => {
    if (cells.get(gol.Coord3({a:f.a, b:f.b, c:f.c})) > 0) {
      f.color.set(params.colors.alive);
    } else {
      f.color.set(params.colors.dead);
    }
  });
  mesh.geometry.colorsNeedUpdate = true;
}

// Game controls

var req;
var running;

function run() {
  req = setTimeout( () => {
  requestAnimationFrame(run);
  step();
  }, params.speed);
}

function start () {
  if (!running) {
    running = true;
    run();
  }
}

function stop() {
  clearTimeout(req);
  running = false;
}

function random() {
  board = gol.randomBoard(gol.cells(mesh.geometry.faces));
  paint(mesh, board);
}

function blank() {
  board = gol.blankBoard(gol.cells(mesh.geometry.faces));
  paint(mesh, board);
}

function initGol(){
  stop();
  if (mesh !== undefined) {
    scene.remove(scene.getObjectByName(mesh.name));
  }
  mesh = createMesh(params.subdivisions);
  mesh.name = "mesh"
  scene.add(mesh);

  var faces = mesh.geometry.faces;
  if (neighborsCache === undefined) {
    neighborsCache = Immutable.Map();
  }
  var neighborId = Immutable.List([faces.length, params.neighborsCutoff])
  var neighbors = neighborsCache.get(neighborId)
  if (neighbors === undefined) {
    neighbors = gol.neighbors(gol.cells(faces), params.neighborsCutoff);
    neighborsCache = neighborsCache.set(neighborId, neighbors);
  }
  board = gol.randomBoard(gol.cells(faces));
  paint(mesh, board);
  start();
}

function step() {
  var neighborId = Immutable.List([mesh.geometry.faces.length,
                                  params.neighborsCutoff])
  var neighbors = neighborsCache.get(neighborId)
  board = gol.step(board, neighbors, params.rules);
  paint(mesh, board);
}

// THREE.js

function init() {
  scene = new THREE.Scene();
  var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 75,
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
    NEAR = 1,
    FAR = 1000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  camera.position.set(0,0,180);
  camera.lookAt(scene.position);
  scene.add(camera);
  //RENDERER
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById('game-of-life');
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  container.appendChild(renderer.domElement);
  renderer.setClearColor(params.colors.background);
  // CONTROLS
  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 110;
  controls.maxDistance = 500;
  controls.noKeys = true;
  controls.noPan = true;
  // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(10,50,100);
  scene.add(light);
}

addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function update(){
  controls.update();
  // TODO mesh manip
}

function render() {
  renderer.render(scene, camera);
}

function createMesh(subdivisions) {
  var baseMat = new THREE.MeshBasicMaterial({color: 0xffffff,
                                            vertexColors: THREE.FaceColors});
  var baseGeo = new THREE.IcosahedronGeometry(100, subdivisions);
  return new THREE.Mesh(baseGeo, baseMat);
}

// interaction
var mouse = new THREE.Vector2();

function mouseLocation(event){
  // calculate mouse position in normalized device coordinates
  // (-1, +1)
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function mouseUp (event) {
  var down = mouse.clone();
  mouseLocation(event);
  var xTravel = Math.abs(down.x - mouse.x);
  var yTravel = Math.abs(down.y - mouse.y);
  var travel = ((xTravel + yTravel) * 100);
  if (travel< 5) {
    handlePick(event);
  }
}

function handlePick(event){
  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children);
  if (0 < intersects.length) {
    var inverter  = (val) => {
      if (val == 1) {
        return 0;
      } else {
        return 1;
      }
    };
    var f = intersects[0].face
    board = board.update(gol.Coord3({a:f.a, b:f.b, c:f.c}), inverter);
    paint(mesh, board);
  }
}

addEventListener('mousedown', mouseLocation);
addEventListener('mouseup', mouseUp);

window.renderer = renderer;
window.scene = scene;
window.mesh = mesh;
window.board = board;

window.stop = stop;
window.run = run;
window.random = random;

window.THREE = THREE;
window.DAT = DAT;
window.Immutable = Immutable;
