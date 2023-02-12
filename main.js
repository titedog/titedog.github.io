//git push -u origin main
import * as THREE from 'three';

import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
import { DotScreenShader } from 'three/addons/shaders/DotScreenShader.js';

let renderer, scene, camera, stats;
const objects = [];

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let composer

init();
animate();

function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width ||canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    // set render target sizes here
  }
}

function init() {

  camera = new THREE.PerspectiveCamera( 60, WIDTH / HEIGHT, 1, 200 );
  camera.position.z = 150;

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x111111 );
  scene.fog = new THREE.Fog( 0x111111, 150, 200 );

  const geometryBox = box(50, 50, 50);

  const lineSegments = new THREE.LineSegments( geometryBox, new THREE.LineDashedMaterial( { color: 0xffaa00, dashSize: 5, gapSize: 2 } ) );
  lineSegments.computeLineDistances();

  objects.push( lineSegments );
  scene.add( lineSegments );

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( WIDTH, HEIGHT );

  const container = document.getElementById( 'container' );
  container.appendChild( renderer.domElement );

  composer = new EffectComposer( renderer );
	composer.addPass( new RenderPass( scene, camera ) );

  const effect1 = new ShaderPass( DotScreenShader );
  effect1.uniforms[ 'scale' ].value = 4;
  composer.addPass( effect1 );

  const effect2 = new ShaderPass( RGBShiftShader );
  effect2.uniforms[ 'amount' ].value = 0.0015;
  composer.addPass( effect2 );

  //

  window.addEventListener( 'resize', onWindowResize );

}

function box( width, height, depth ) {

  width = width * 0.5,
  height = height * 0.5,
  depth = depth * 0.5;

  const geometry = new THREE.BufferGeometry();
  const position = [];

  position.push(
    - width, - height, - depth,
    - width, height, - depth,

    - width, height, - depth,
    width, height, - depth,

    width, height, - depth,
    width, - height, - depth,

    width, - height, - depth,
    - width, - height, - depth,

    - width, - height, depth,
    - width, height, depth,

    - width, height, depth,
    width, height, depth,

    width, height, depth,
    width, - height, depth,

    width, - height, depth,
    - width, - height, depth,

    - width, - height, - depth,
    - width, - height, depth,

    - width, height, - depth,
    - width, height, depth,

    width, height, - depth,
    width, height, depth,

    width, - height, - depth,
    width, - height, depth
    );

  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( position, 3 ) );

  return geometry;

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

  resizeCanvasToDisplaySize();
  requestAnimationFrame( animate );

  render();
  stats.update();

}

function render() {

  const time = Date.now() * 0.001;

  scene.traverse( function ( object ) {

    if ( object.isLine ) {

      object.rotation.x = 0.25 * time;
      object.rotation.y = 0.25 * time;

    }

  } );

  composer.render();

}