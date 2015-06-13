var Immutable = require('immutable');
var THREE = require('three');
var OrbitControls = require('three-orbit-controls')(THREE);

var scene, camera, renderer, controls, container;
var mesh;
var cells, neighborsCache, rules;

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
  mesh = createMesh(1);
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
  var baseGeo = new THREE.IcosahedronGeometry(100,subdivisions);
  return new THREE.Mesh(baseGeo, baseMat);
}

// Coloring

function paintRandom(mesh) {
  var geo = mesh.geometry;
  mesh.geometry.faces.forEach((f) => {
    f.color.setRGB(Math.random(), Math.random(), Math.random());
  });
  mesh.geometry.colorsNeedUpdate = true;
}

function paint(mesh, cells) {
  var geo = mesh.geometry;
  geo.faces.forEach((f) => {
    if (cells.get(Coord3({a:f.a, b:f.b, c:f.c})) > 0) {
      f.color.setHex(aliveColor);
    } else {
      f.color.setHex(deadColor);
    }
  });
  mesh.geometry.colorsNeedUpdate = true;
}

// Game of life

function step(){
  if (cells === undefined) {
    cells = blankCells(createCells(mesh.geometry.faces));
  }
  if (neighborsCache === undefined) {
    neighborsCache = Immutable.Map();
  }
  var faces = mesh.geometry.faces;
  var neighbors = neighborsCache.get(faces.length)
  if (neighbors === undefined) {
    neighbors = createNeighbors(createCells(faces));
    neighborsCache = neighborsCache.set(faces.length, neighbors);
  }

  var rules = [1,2,0];

  cells = stepCells(cells, neighbors, rules);
  return cells;
}

var Coord3 = Immutable.Record({a:0, b:0, c:0});

function createCells(faces) {
  return Immutable.List(
    faces.map((face) => {
      return new Coord3({a: face.a, b: face.b, c: face.c});
    }));
}

function blankCells(cells) {
  return Immutable.OrderedMap(cells.map(x => [x, 0]));
}

function randomCells(cells) {
  return Immutable.OrderedMap(cells.map(x => [x, Math.floor(2*Math.random())]));
}

function createNeighbors(cells) {
  return Immutable.OrderedMap(
    cells.map(cell => [cell, neighborCells(cell, cells, 2)]));
}

function neighborCells(cell, allCells,  cutoff){
  // cutoff is the number of shared cords
  // 1 shared is for inderect neighbors
  // 2 shared is for direct neighbors
  return allCells.map(neighborCell => {
    var commonCoords = neighborCell
    .valueSeq()
    .filter(value => cell.contains(value))
    .count();
    if (commonCoords >= cutoff &&
        commonCoords < 3) {
      return neighborCell;
    } else {
      return false;
    }})
  .filterNot(x => x === false)
}

function stepCells(state, neighbors, rules) {
/*takes the current state of the board, a neighbors map and the rules (as
 * [loneliness, stasis, birth]) and returns the next state
**/
  return state.mapEntries(([cell, status]) => {
    return [cell, stepCell(cell, status, state, neighbors, rules)];
  });
}

function stepCell(cell, status, state, neighbors, rules){
  var aliveNeighbors = neighbors.get(cell)
  .map(neighbor => state.get(neighbor))
  .reduce((x,y) => x + y);
  return applyRules(status, aliveNeighbors, rules);
}

function applyRules(status, aliveNeighbors, rules) {
  if (status > 0) { //alive
    if (aliveNeighbors < rules[0]) {
      return 0;
    } else if (aliveNeighbors < rules[1]) {
      return 1;
    } else {
      return 0;
    }
  } else { //dead
    if (aliveNeighbors == rules[2]){
      return 1;
    } else {
      return 0;
    }
  }
}

window.neighborsCache = neighborsCache;
window.cells = cells;
window.step = step;
window.stepCells = stepCells;
window.scene = scene;
window.mesh = mesh;
window.paint = paint;
window.paintRandom = paintRandom;
window.createNeighbors = createNeighbors;
window.createCells = createCells;
window.blankCells = blankCells;
window.randomCells = randomCells;
window.THREE = THREE;
window.Immutable = Immutable;
