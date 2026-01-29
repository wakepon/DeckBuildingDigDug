import { AUTO_AIM_TOGGLE_KEY } from './constants';

export class InputManager {
  private keys: Set<string> = new Set();
  private previousKeys: Set<string> = new Set();
  private _mouseX: number = 0;
  private _mouseY: number = 0;
  private _isMouseDown: boolean = false;
  private canvas: HTMLCanvasElement | null = null;
  private _lastMoveDirection: { x: number; y: number } = { x: 0, y: 0 };

  constructor() {
    this.setupKeyboardListeners();
    this.setupMouseListeners();
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  private setupMouseListeners(): void {
    window.addEventListener('mousemove', (e) => {
      if (this.canvas) {
        const rect = this.canvas.getBoundingClientRect();
        this._mouseX = e.clientX - rect.left;
        this._mouseY = e.clientY - rect.top;
      }
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this._isMouseDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this._isMouseDown = false;
      }
    });
  }

  isKeyDown(code: string): boolean {
    return this.keys.has(code);
  }

  // Returns true only on the first frame a key is pressed
  wasKeyJustPressed(code: string): boolean {
    return this.keys.has(code) && !this.previousKeys.has(code);
  }

  // Check if debug key combination (Shift + 1) is pressed
  isDebugKeyPressed(): boolean {
    const shiftPressed = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const digit1Pressed = this.keys.has('Digit1');
    return shiftPressed && digit1Pressed;
  }

  // Returns true only on the first frame debug key combination is pressed
  wasDebugKeyJustPressed(): boolean {
    const isPressed = this.isDebugKeyPressed();
    const wasPressed =
      (this.previousKeys.has('ShiftLeft') || this.previousKeys.has('ShiftRight')) &&
      this.previousKeys.has('Digit1');
    return isPressed && !wasPressed;
  }

  // Call at the end of each frame to update previous keys state
  updatePreviousKeys(): void {
    this.previousKeys = new Set(this.keys);
  }

  get moveDirection(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    // WASD
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) y -= 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) y += 1;
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) x -= 1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) x += 1;

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  get mouseX(): number {
    return this._mouseX;
  }

  get mouseY(): number {
    return this._mouseY;
  }

  get isMouseDown(): boolean {
    return this._isMouseDown;
  }

  // Auto-aim toggle methods
  isAutoAimTogglePressed(): boolean {
    return this.keys.has(AUTO_AIM_TOGGLE_KEY);
  }

  wasAutoAimToggleJustPressed(): boolean {
    return this.keys.has(AUTO_AIM_TOGGLE_KEY) && !this.previousKeys.has(AUTO_AIM_TOGGLE_KEY);
  }

  // Last movement direction (for auto-aim when player is stationary)
  get lastMoveDirection(): { x: number; y: number } {
    return { ...this._lastMoveDirection };
  }

  updateLastMoveDirection(): void {
    const currentDir = this.moveDirection;
    // Only update if there is actual movement
    if (currentDir.x !== 0 || currentDir.y !== 0) {
      this._lastMoveDirection = { ...currentDir };
    }
  }

  /**
   * Calculate normalized direction from player to mouse cursor
   * @param playerX - Player X position in world coordinates
   * @param playerY - Player Y position in world coordinates
   * @param cameraX - Camera X offset (world coordinate of screen origin)
   * @param cameraY - Camera Y offset (world coordinate of screen origin)
   * @returns Normalized direction vector {x, y}, or {x: 0, y: 0} if mouse is at player position
   */
  getMouseDirection(
    playerX: number,
    playerY: number,
    cameraX: number,
    cameraY: number
  ): { x: number; y: number } {
    // Convert mouse screen coordinates to world coordinates
    // Mouse world position = mouse screen position - camera offset
    // (camera offset is negative when player moves right/down, so subtracting adds)
    const mouseWorldX = this._mouseX - cameraX;
    const mouseWorldY = this._mouseY - cameraY;

    // Calculate vector from player to mouse
    const dx = mouseWorldX - playerX;
    const dy = mouseWorldY - playerY;

    // Calculate length
    const length = Math.sqrt(dx * dx + dy * dy);

    // Return zero vector if distance is too small (avoid division by zero)
    if (length < 0.0001) {
      return { x: 0, y: 0 };
    }

    // Return normalized direction
    return {
      x: dx / length,
      y: dy / length,
    };
  }
}
