var React = require('react');
var THREE = require('three');
var ReactTHREE = require('react-three');

var Scene = ReactTHREE.Scene;
var PerspectiveCamera = ReactTHREE.PerspectiveCamera;

var ResizeableScene = React.createClass({
  getInitialState: function () {
    return {width: 0,
            height: 0}
  },

  resizeScene: function (e) {
    this.setState({
    width: window.innerWidth,
    height: window.innerHeight
    });
  },

  componentDidMount: function () {
    this.resizeScene(null);
    window.addEventListener('resize', this.resizeScene);
  },

  componenWillUnmount: function () {
    window.removeEventListener('resize', this.resizeScene);
  },

  render: function () {
    var aspectratio = this.state.width / this.state.height;
    var cameraprops = {fov:75, aspect:aspectratio, near:1, far:1000,
      position:new THREE.Vector3(0,0,300), lookat:new THREE.Vector3(0,0,0)};
    return <Scene name='scene' width={this.state.width}
    height={this.state.height} camera="maincamera">
      <PerspectiveCamera name="maincamera" {...cameraprops} />
      {this.props.children}
    </Scene>;
  }
});

module.exports = ResizeableScene;
