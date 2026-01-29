/**
 * State interface for debug display settings
 * Controls visibility of various debug overlays
 */
export interface DebugDisplayState {
  showBlockHP: boolean;
  showEnemyHP: boolean;
  showBulletDamage: boolean;
}

type StateChangeCallback = (state: DebugDisplayState) => void;

/**
 * DebugDisplayManager - Centralized state manager for debug displays
 * Controls visibility of Block HP, Enemy HP, and Bullet Damage overlays
 */
export class DebugDisplayManager {
  private state: DebugDisplayState;
  private callback: StateChangeCallback | null = null;

  constructor() {
    this.state = {
      showBlockHP: false,
      showEnemyHP: false,
      showBulletDamage: false,
    };
  }

  /**
   * Get a copy of the current state (immutable)
   */
  getState(): DebugDisplayState {
    return { ...this.state };
  }

  /**
   * Toggle block HP display visibility
   */
  toggleBlockHP(): void {
    this.state = {
      ...this.state,
      showBlockHP: !this.state.showBlockHP,
    };
    this.notifyChange();
  }

  /**
   * Toggle enemy HP display visibility
   */
  toggleEnemyHP(): void {
    this.state = {
      ...this.state,
      showEnemyHP: !this.state.showEnemyHP,
    };
    this.notifyChange();
  }

  /**
   * Toggle bullet damage display visibility
   */
  toggleBulletDamage(): void {
    this.state = {
      ...this.state,
      showBulletDamage: !this.state.showBulletDamage,
    };
    this.notifyChange();
  }

  /**
   * Set block HP display visibility
   */
  setBlockHP(visible: boolean): void {
    this.state = {
      ...this.state,
      showBlockHP: visible,
    };
    this.notifyChange();
  }

  /**
   * Set enemy HP display visibility
   */
  setEnemyHP(visible: boolean): void {
    this.state = {
      ...this.state,
      showEnemyHP: visible,
    };
    this.notifyChange();
  }

  /**
   * Set bullet damage display visibility
   */
  setBulletDamage(visible: boolean): void {
    this.state = {
      ...this.state,
      showBulletDamage: visible,
    };
    this.notifyChange();
  }

  /**
   * Reset all debug displays to false
   */
  resetAll(): void {
    this.state = {
      showBlockHP: false,
      showEnemyHP: false,
      showBulletDamage: false,
    };
    this.notifyChange();
  }

  /**
   * Register a callback to be notified when state changes
   */
  onStateChange(callback: StateChangeCallback): void {
    this.callback = callback;
  }

  /**
   * Notify the registered callback of state changes
   */
  private notifyChange(): void {
    if (this.callback) {
      this.callback(this.getState());
    }
  }
}
