var Immutable = require('immutable');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var scene, camera, renderer, controls, container;
var board;
var cells, neightborCache;

var clearColor = Math.random() * 0xffffff;
var highlightColor = Math.random() * 0xffffff;
var deadColor = Math.random() * 0xffffff;
var aliveColor = Math.random() * 0xffffff;

// Beginning the loop
init();
animate();

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
  board = createBoard(1);
  scene.add(board);
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

function createBoard(subdivisions) {
  var baseMat = new THREE.MeshBasicMaterial({color: 0xffffff,
                                            vertexColors: THREE.FaceColors});
  var baseGeo = new THREE.IcosahedronGeometry(100,subdivisions);
  return new THREE.Mesh(baseGeo, baseMat);
}

function randomColor(mesh) {
  var geo = mesh.geometry;
  mesh.geometry.faces.forEach((f) => {
    f.color.setRGB(Math.random(), Math.random(), Math.random());
  });
  mesh.geometry.colorsNeedUpdate = true;
}

function paint() {
  var geo = this.state.geometry.clone();
  geo.faces.forEach((f) => {
    // TODO do lookup fo face then paint
    f.color.setHex(deadColor);
  });
}

// Game of life

var Coord3 = Immutable.Record({a:0, b:0, c:0});

function facesToCells(faces) {
  return Immutable.List(
    faces.map((face) => {
      return new Coord3({a: face.a, b: face.b, c: face.c});
    }));
}

function cellsToNeighbor(cells) {
  return Immutable.Map(
    cells
    .map(cell => [cell, neighborCells(cell, cells, 2)]));
}

function neighborCells(cell, allCells,  cutoff){
  // cutoff is the number of shared cords
  // 1 shared is for inderect neighbors
  // 2 shared is for direct neighbors
  // 3 shared is for only self
  return allCells.map(neighborCell => {
    var commonCoords = neighborCell
    .valueSeq()
    .filter(value => cell.contains(value))
    .count();
    if (commonCoords >= cuttoff) {
      return neighborCell;
    } else {
      return false;
    }})
  .filterNot(x => x === false)
}

window.scene = scene;
window.controls = controls;
window.board = board;
window.randomColor = randomColor;
window.facesToCells = facesToCells;
window.cellsToNeighbor = cellsToNeighbor;
window.THREE = THREE;
