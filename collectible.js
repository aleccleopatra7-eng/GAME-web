import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';

export class Collectible {
  constructor({ position = new THREE.Vector3(), game }) {
    this.game = game;
    const geo = new THREE.SphereGeometry(0.35, 10, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffd54f, emissive: 0xff8f00, emissiveIntensity: 0.3 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.collected = false;
    this._spin = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this._spin += dt * 2;
    this.mesh.position.y = 0.5 + Math.sin(this._spin) * 0.15;
    this.mesh.rotation.y = this._spin;
  }

  collect() {
    this.collected = true;
    // small effect: heal player a bit
    this.game.changeHealth(5);
  }
}