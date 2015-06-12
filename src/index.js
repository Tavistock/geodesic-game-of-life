var React = require('react');
var ReactTHREE = require('react-three');
var THREE = require('three');
var ResizeableScene = require('./ResizeableScene');

var PointLight = ReactTHREE.PointLight;
var Mesh = ReactTHREE.Mesh;

var createBoardGeometry = (subdivisions) => {
  return new THREE.IcosahedronGeometry(100, subdivisions);
};

var highlightColor = Math.random() * 0xffffff;
var deadColor = Math.random() * 0xffffff;
var aliveColor = Math.random() * 0xffffff;


var GameOfLife = React.createClass({
  getInitialState: function() {
    return {geometry: null}
  },

  randomColor: function () {
    var geo = this.state.geometry.clone();
    geo.faces.forEach((f) => {
      f.color.setRGB(Math.random(), Math.random(), Math.random());
    });
    this.setState({geometry: geo});
  },

  paint: function () {
    var geo = this.state.geometry.clone();
    geo.faces.forEach((f) => {
      // TODO do lookup fo face then paint
      f.color.setHex(deadColor);
    });
  },

  componentWillMount: function () {
    this.setState({
      geometry: createBoardGeometry(this.props.subdivisions)
    });
  },

  render: function () {
  return <ResizeableScene>
      <PointLight x={10} y={50} z={100} />
      <Mesh name='board' geometry={this.state.geometry}
      onMousedown={function (e) {console.log(e)}}
      material={new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors})}/>
    </ResizeableScene>;
  }
});

React.render(<GameOfLife subdivisions={1}/>,
             document.getElementById('game-of-life'));

window.React = React;
window.ReactTHREE = ReactTHREE;
window.THREE = THREE;
