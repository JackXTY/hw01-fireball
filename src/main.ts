import {vec3, vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import FlatShaderProgram from './rendering/gl/FlatShaderProgram';
import ShaderProgram, {Shader}  from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.

function resetToDefault(){
  console.log("Reset!");
  controls.color_0 = [255, 255, 0, 255];
  controls.color_1 = [230, 77, 0, 255];
  controls['noise frequency'] = 3.0;
  controls.shiftScale = 0.5;
  controls.shiftFreq = 6.0;
  controls.shiftSpeed = 0.1;
  controls.shiftSmoothness = 0.6;
  controls.detailFreq = 15.0;
  controls.detailScale = 0.1;
}

const controls = {
  tesselations: 5,
  'Load Scene': loadScene, // A function pointer, essentially
  color_0: [255, 255, 0, 255],
  color_1: [230, 77, 0, 255],
  'noise frequency' : 3.0,
  shiftScale : 0.5,
  shiftFreq : 6.0,
  shiftSpeed : 0.1,
  shiftSmoothness : 0.6,
  detailFreq : 15.0,
  detailScale : 0.1,
  'Reset Button' : resetToDefault
};

let icosphere: Icosphere;
let square: Square;
// let cube: Cube;
let prevTesselations: number = 5;
let time: number = 0;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 2.5, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  // cube = new Cube(vec3.fromValues(0, 1.2, 0), vec3.fromValues(0.75, 0.75, 0.75));
  // cube.create();
}

function main() {
  window.addEventListener('keypress', function (e) {
    // console.log(e.key);
    switch(e.key) {
      // Use this if you wish
    }
  }, false);

  window.addEventListener('keyup', function (e) {
    switch(e.key) {
      // Use this if you wish
    }
  }, false);

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.addColor(controls, 'color_0');
  gui.addColor(controls, 'color_1');
  gui.add(controls, 'noise frequency', 0, 10);
  gui.add(controls, 'shiftScale', 0, 2);
  gui.add(controls, 'shiftFreq', 0, 20);
  gui.add(controls, 'shiftSpeed', 0, 2);
  gui.add(controls, 'shiftSmoothness', 0, 2);
  gui.add(controls, 'detailFreq', 0, 20);
  gui.add(controls, 'detailScale', 0, 2);
  gui.add(controls, 'Load Scene');
  gui.add(controls, 'Reset Button');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, -10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);

  const flat = new FlatShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);
  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  function processKeyPresses() {
    // Use this if you wish
  }

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    processKeyPresses();

    // gl.enable(gl.BLEND);
    // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);
    
    renderer.renderFlat(camera, flat, [
      square,
    ], time);
    
    // gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    
    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, -1, 0), 1, prevTesselations);
      icosphere.create();
    }
     
    lambert.setGeometryColor0(vec4.fromValues(controls.color_0[0] / 255, controls.color_0[1] / 255, controls.color_0[2] / 255, controls.color_0[3] / 255));
    lambert.setGeometryColor1(vec4.fromValues(controls.color_1[0] / 255, controls.color_1[1] / 255, controls.color_1[2] / 255, controls.color_1[3] / 255));
    lambert.setNoiseFreq(controls['noise frequency']);
    lambert.setShiftAndDetail(controls);

    renderer.render(camera, lambert, [
      icosphere,
      // square,
      // cube
    ], time);
    
    stats.end();

    time++;

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
