export class InputManager {
  constructor(domElement) {
    this.domElement = domElement || document.body;
    this.keys = new Map();
    this.keysJustPressed = new Set();
    this.mouse = {
      x: 0,
      y: 0,
      dx: 0,
      dy: 0,
      leftDown: false,
      rightDown: false,
      leftJustPressed: false,
      isLocked: false
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onPointerLockChange = this.onPointerLockChange.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);

    // Prevent context menu on right click for aiming
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  requestPointerLock() {
    if (!this.mouse.isLocked && document.pointerLockElement !== this.domElement) {
      try {
        this.domElement.requestPointerLock();
      } catch (e) {
        // pointer lock might be rejected if not user initiated
      }
    }
  }

  exitPointerLock() {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
  }

  onPointerLockChange() {
    this.mouse.isLocked = document.pointerLockElement === this.domElement;
  }

  onKeyDown(e) {
    const code = e.code;
    if (!this.keys.get(code)) {
      this.keysJustPressed.add(code);
    }
    this.keys.set(code, true);

    // Common shortcuts that shouldn't scroll browser
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    this.keys.set(e.code, false);
  }

  onMouseMove(e) {
    if (this.mouse.isLocked) {
      this.mouse.dx += e.movementX;
      this.mouse.dy += e.movementY;
    } else {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.mouse.leftDown = true;
      this.mouse.leftJustPressed = true;
    } else if (e.button === 2) {
      this.mouse.rightDown = true;
    }
  }

  onMouseUp(e) {
    if (e.button === 0) {
      this.mouse.leftDown = false;
    } else if (e.button === 2) {
      this.mouse.rightDown = false;
    }
  }

  isDown(code) {
    return !!this.keys.get(code);
  }

  wasJustPressed(code) {
    return this.keysJustPressed.has(code);
  }

  consumeJustPressed(code) {
    const has = this.keysJustPressed.has(code);
    this.keysJustPressed.delete(code);
    return has;
  }

  getMovementVector() {
    let forward = 0;
    let right = 0;

    if (this.isDown('KeyW') || this.isDown('ArrowUp')) forward += 1;
    if (this.isDown('KeyS') || this.isDown('ArrowDown')) forward -= 1;
    if (this.isDown('KeyD') || this.isDown('ArrowRight')) right += 1;
    if (this.isDown('KeyA') || this.isDown('ArrowLeft')) right -= 1;

    return { forward, right };
  }

  endFrame() {
    this.keysJustPressed.clear();
    this.mouse.dx = 0;
    this.mouse.dy = 0;
    this.mouse.leftJustPressed = false;
  }
}
