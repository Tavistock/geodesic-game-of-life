var Immutable = require('immutable');

var rule = {BIRTH: 'BIRTH',
            DEATH: 'DEATH',
            STASIS: 'STASIS'};

var Coord3 = Immutable.Record({a:0, b:0, c:0});

function cells(faces) {
  return Immutable.List(
    faces.map((face) => {
      return new Coord3({a: face.a, b: face.b, c: face.c});
    }));
}

function blankBoard(cells) {
  return Immutable.OrderedMap(cells.map(x => [x, 0]));
}

function randomBoard(cells) {
  return Immutable.OrderedMap(cells.map(x => [x, Math.floor(2*Math.random())]));
}

function neighbors(cells, cutoff) {
  return cells
  .map(cell => neighborCells(cell, cells, cutoff))
  .reduce((left, right) => left.concat(right))
  .reduce((left, right) => left.mergeWith((x, y) => x.concat(y), right));

}

function neighborCells(cell, allCells, cutoff){
  // 1 shared is for inderect neighbors
  // 2 shared is for direct neighbors
  return allCells
  .skipWhile(x => x !== (cell))
  .map(neighborCell => {
    var commonCoords = neighborCell
    .valueSeq()
    .filter(value => cell.contains(value))
    .count();
    if (commonCoords >= cutoff &&
        commonCoords < 3) {
      return Immutable.Map([[cell, Immutable.List([neighborCell])],
                            [neighborCell, Immutable.List([cell])]])
    } else {
      return false;
    }})
  .filterNot(x => x === false)
}

function step(state, neighbors, rules) {
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
  switch (rules[aliveNeighbors]) {
      case rule.DEATH:
        return 0;
      case rule.BIRTH:
        return 1;
      case rule.STASIS:
        return status;
  }
}

module.exports = {
  Coord3: Coord3,
  rule: rule,
  step: step,
  cells: cells,
  blankBoard: blankBoard,
  randomBoard: randomBoard,
  neighbors: neighbors
}
