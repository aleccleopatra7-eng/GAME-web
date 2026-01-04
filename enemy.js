import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';

export class Enemy {
  constructor({ position = new THREE.Vector3(), game }) {
    this.game = game;
    const geo = new THREE.BoxGeometry(1.2, 1.8, 1.2);
    const mat = new THREE.MeshStandardMaterial({ color: 0xd32f2f });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.castShadow = true;

    this.speed = 2 + Math.random() * 1.5;
    this._timeSinceHit = 0;
    this._hitCooldown = 1.2; // seconds between damage ticks
  }

  update(dt, player) {
    // simple AI: move toward player on xz plane
    const p = player.mesh.position.clone();
    const dir = p.sub(this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist > 0.6) {
      dir.normalize();
      this.mesh.position.addScaledVector(dir, this.speed * dt);
    }

    // bobbing motion
    this.mesh.position.y = 1 + Math.sin(performance.now() / 300 + this.mesh.position.x) * 0.08;

    this._timeSinceHit += dt;
  }

  canDamage() {
    return this._timeSinceHit >= this._hitCooldown;
  }

  markDamage() {
    this._timeSinceHit = 0;
    // small recoil from damage moment to avoid repeated overlap
    this.mesh.position.add(new THREE.Vector3((Math.random() - 0.5) * 0.3, 0, (Math.random() - 0.5) * 0.3));
    // reduce player health
    this.game.changeHealth(-7);
  }
}