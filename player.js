import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';

export class Player {
  constructor({ camera, controls, game }) {
    this.camera = camera;
    this.controls = controls;
    this.game = game;

    const geo = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8);
    const mat = new THREE.MeshStandardMaterial({ color: 0x2196f3 });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, 1, 0);

    this.velocity = new THREE.Vector3();
    this.speed = 8;
    this.jumpSpeed = 6;
    this.onGround = true;

    this.move = { forward: 0, backward: 0, left: 0, right: 0 };

    this._initControls();
  }

  _initControls() {
    const onKey = (e) => {
      const down = e.type === 'keydown';
      switch (e.code) {
        case 'KeyW': this.move.forward = down ? 1 : 0; break;
        case 'KeyS': this.move.backward = down ? 1 : 0; break;
        case 'KeyA': this.move.left = down ? 1 : 0; break;
        case 'KeyD': this.move.right = down ? 1 : 0; break;
        case 'Space':
          if (down && this.onGround) {
            this.velocity.y = this.jumpSpeed;
            this.onGround = false;
          }
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
  }

  update(dt, worldObjects) {
    // apply gravity
    this.velocity.y -= 9.8 * dt;

    // movement relative to camera orientation (y ignored)
    const dir = new THREE.Vector3();
    const front = new THREE.Vector3();
    this.camera.getWorldDirection(front);
    front.y = 0; front.normalize();

    const right = new THREE.Vector3().crossVectors(front, new THREE.Vector3(0, 1, 0)).normalize();

    dir.addScaledVector(front, this.move.forward - this.move.backward);
    dir.addScaledVector(right, this.move.right - this.move.left);
    if (dir.lengthSq() > 0) dir.normalize();

    // apply horizontal velocity
    const desired = dir.multiplyScalar(this.speed);
    this.velocity.x = desired.x;
    this.velocity.z = desired.z;

    // integrate
    const nextPos = this.mesh.position.clone().addScaledVector(this.velocity, dt);

    // simple ground collision
    if (nextPos.y <= 1) {
      nextPos.y = 1;
      this.velocity.y = 0;
      this.onGround = true;
    }

    // simple obstacle collision using bounding spheres
    const bboxRadius = 0.6;
    for (const obj of worldObjects) {
      const dist = nextPos.distanceTo(obj.position);
      const minDist = bboxRadius + Math.max(obj.scale.x, obj.scale.z);
      if (dist < minDist) {
        // simple slide: push out along vector
        const push = nextPos.clone().sub(obj.position).setY(0).normalize().multiplyScalar(minDist - dist);
        if (!isNaN(push.x)) nextPos.add(push);
      }
    }

    // clamp world bounds
    nextPos.x = THREE.MathUtils.clamp(nextPos.x, -95, 95);
    nextPos.z = THREE.MathUtils.clamp(nextPos.z, -95, 95);

    // set position and update camera/controls holder
    this.mesh.position.copy(nextPos);
    this.controls.getObject().position.copy(this.mesh.position).add(new THREE.Vector3(0, 1.6, 0));
  }
}