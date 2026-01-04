import * as THREE from '../node_modules/three/build/three.module.js';
import { PointerLockControls } from '../node_modules/three/examples/jsm/controls/PointerLockControls.js';
import { Game } from './game.js';

let game;

document.getElementById('startBtn').addEventListener('click', async () => {
  document.getElementById('startBtn').style.display = 'none';
  await start();
});

async function start() {
  const container = document.body;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 2, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // lighting
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
  hemi.position.set(0, 50, 0);
  scene.add(hemi);

  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(-5, 10, -5);
  dir.castShadow = true;
  scene.add(dir);

  // pointer lock controls
  const controls = new PointerLockControls(camera, renderer.domElement);
  controls.getObject().position.set(0, 1.6, 0);
  scene.add(controls.getObject());

  controls.addEventListener('lock', () => {
    document.getElementById('overlay').style.display = 'none';
  });
  controls.addEventListener('unlock', () => {
    document.getElementById('overlay').style.display = '';
    document.getElementById('startBtn').style.display = '';
  });

  renderer.domElement.addEventListener('click', () => {
    if (!controls.isLocked) controls.lock();
  });

  game = new Game({ scene, camera, renderer, controls });
  game.init();

  window.addEventListener('resize', onWindowResize);
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  let last = performance.now();
  function animate(time) {
    requestAnimationFrame(animate);
    const dt = (time - last) / 1000;
    last = time;
    game.update(dt);
    renderer.render(scene, camera);
  }
  animate(last);
}