var Immutable = require('immutable');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var gol = require('./GameOfLife');

var scene, camera, renderer, controls, container;
var mesh;
var board, neighborsCache;

var rule = gol.rule;

/// Parameter
var rules = {
  0: rule.DEATH,
  1: rule.STASIS,
  2: rule.BIRTH,
  3: rule.DEATH,
  4: rule.DEATH,
  5: rule.DEATH,
  6: rule.DEATH,
  7: rule.DEATH,
  8: rule.DEATH,
  9: rule.DEATH,
  10: rule.DEATH,
  11: rule.DEATH,
  12: rule.DEATH
};
var speed = 500;
var subdivisions = 2;
var neighborsCutoff = 1;

// Beginning the loop

init();
animate();

initGol();
run();

// Painting the board

var clearColor = Math.random() * 0xffffff;
var highlightColor = Math.random() * 0xffffff;
var deadColor = Math.random() * 0xffffff;
var aliveColor = deadColor * 0.90;

function paint(mesh, cells) {
  var geo = mesh.geometry;
  geo.faces.forEach((f) => {
    if (cells.get(gol.Coord3({a:f.a, b:f.b, c:f.c})) > 0) {
      f.color.setHex(aliveColor);
    } else {
      f.color.setHex(deadColor);
    }
  });
  mesh.geometry.colorsNeedUpdate = true;
}

// Game controls

var req;

function run() {
  step();
  req = setTimeout(run, speed);
}

function stop() {
  clearTimeout(req);
}

function random() {
  cells = gol.randomBoard(gol.cells(mesh.geometry.faces));
}

function initGol(){
  var faces = mesh.geometry.faces;
  if (board === undefined) {
    board = gol.randomBoard(gol.cells(faces));
  }
  if (neighborsCache === undefined) {
    neighborsCache = Immutable.Map();
  }
  var neighborId = Immutable.List([faces.length, neighborsCutoff])
  var neighbors = neighborsCache.get(neighborId)
  if (neighbors === undefined) {
    neighbors = gol.neighbors(gol.cells(faces), neighborsCutoff);
    neighborsCache = neighborsCache.set(neighborId, neighbors);
  }
  paint(mesh, board);
}

function step() {
  var neighborId = Immutable.List([mesh.geometry.faces.length,
                                  neighborsCutoff])
  var neighbors = neighborsCache.get(neighborId)
  board = gol.step(board, neighbors, rules);
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
  camera.position.set(0,0,300);
  camera.lookAt(scene.position);
  scene.add(camera);
  //RENDERER
  renderer = new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  container = document.getElementById('game-of-life');
  container.appendChild(renderer.domElement);
  renderer.setClearColor(clearColor);
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
  // CUSTOM
  mesh = createMesh(subdivisions);
  scene.add(mesh);
}

function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

function update(){
  if (true) {
  }
  //controls.update();
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

window.step = step;
window.scene = scene;
window.mesh = mesh;
window.paint = paint;

window.initGol = initGol;
window.stop = stop;
window.run = run;
window.random = random;

window.THREE = THREE;
window.Immutable = Immutable;
