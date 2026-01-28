/**
 * EventBus - Centralized event system for game events
 * Replaces callback chains with a pub/sub pattern for better decoupling
 */

export type GameEvent =
  | { type: 'WALL_DESTROYED'; x: number; y: number; color: number }
  | { type: 'ENEMY_DIED'; x: number; y: number }
  | { type: 'ELITE_DIED'; x: number; y: number }
  | { type: 'CHEST_COLLECTED'; upgradeCount: number }
  | { type: 'EXP_GAINED'; amount: number }
  | { type: 'LEVEL_UP' }
  | { type: 'UPGRADE_SELECTED'; upgradeType: string }
  | { type: 'FLOOR_TRANSITION_START'; floor: number }
  | { type: 'FLOOR_TRANSITION_END'; floor: number }
  | { type: 'PLAYER_DAMAGED'; damage: number; newHp: number }
  | { type: 'OXYGEN_WARNING'; ratio: number }
  | { type: 'OXYGEN_DEPLETED' }
  | { type: 'GEM_COLLECTED'; exp: number };

type EventCallback<T extends GameEvent = GameEvent> = (event: T) => void;

export class EventBus {
  private listeners: Map<GameEvent['type'], Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event type
   */
  on<T extends GameEvent['type']>(
    type: T,
    callback: EventCallback<Extract<GameEvent, { type: T }>>
  ): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback as EventCallback);
  }

  /**
   * Unsubscribe from an event type
   */
  off<T extends GameEvent['type']>(
    type: T,
    callback: EventCallback<Extract<GameEvent, { type: T }>>
  ): void {
    const callbacks = this.listeners.get(type);
    if (callbacks) {
      callbacks.delete(callback as EventCallback);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: GameEvent): void {
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      });
    }
  }

  /**
   * Clear all listeners (useful for cleanup)
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Remove all listeners for a specific event type
   */
  clearType(type: GameEvent['type']): void {
    this.listeners.delete(type);
  }
}
