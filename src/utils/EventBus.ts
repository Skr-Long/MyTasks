type EventCallback = (...args: any[]) => void

export class EventBus {
  private static listeners: Map<string, Set<EventCallback>> = new Map()

  static on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  static off(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(callback)
    }
  }

  static emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(...args))
    }
  }

  static once(event: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      callback(...args)
      this.off(event, onceCallback)
    }
    this.on(event, onceCallback)
  }
}

export const GameEvents = {
  TOWER_PLACED: 'tower:placed',
  TOWER_UPGRADED: 'tower:upgraded',
  ENEMY_SPAWNED: 'enemy:spawned',
  ENEMY_KILLED: 'enemy:killed',
  ENEMY_REACHED_END: 'enemy:reachedEnd',
  GOLD_CHANGED: 'gold:changed',
  WAVE_STARTED: 'wave:started',
  WAVE_ENDED: 'wave:ended',
  GAME_OVER: 'game:over',
  GAME_VICTORY: 'game:victory',
} as const
