import { describe, it, expect, beforeEach } from 'vitest';
import { DebugDisplayManager } from '../DebugDisplayManager';

describe('DebugDisplayManager', () => {
  let manager: DebugDisplayManager;

  beforeEach(() => {
    manager = new DebugDisplayManager();
  });

  describe('initial state', () => {
    it('should have all debug displays disabled by default', () => {
      const state = manager.getState();

      expect(state.showBlockHP).toBe(false);
      expect(state.showEnemyHP).toBe(false);
      expect(state.showBulletDamage).toBe(false);
    });
  });

  describe('toggleBlockHP', () => {
    it('should toggle block HP display from false to true', () => {
      expect(manager.getState().showBlockHP).toBe(false);

      manager.toggleBlockHP();

      expect(manager.getState().showBlockHP).toBe(true);
    });

    it('should toggle block HP display from true to false', () => {
      manager.toggleBlockHP(); // Turn on
      expect(manager.getState().showBlockHP).toBe(true);

      manager.toggleBlockHP(); // Turn off

      expect(manager.getState().showBlockHP).toBe(false);
    });

    it('should not affect other debug displays when toggling block HP', () => {
      manager.toggleEnemyHP(); // Turn on enemy HP
      manager.toggleBulletDamage(); // Turn on bullet damage

      manager.toggleBlockHP();

      expect(manager.getState().showEnemyHP).toBe(true);
      expect(manager.getState().showBulletDamage).toBe(true);
    });
  });

  describe('toggleEnemyHP', () => {
    it('should toggle enemy HP display from false to true', () => {
      expect(manager.getState().showEnemyHP).toBe(false);

      manager.toggleEnemyHP();

      expect(manager.getState().showEnemyHP).toBe(true);
    });

    it('should toggle enemy HP display from true to false', () => {
      manager.toggleEnemyHP(); // Turn on
      expect(manager.getState().showEnemyHP).toBe(true);

      manager.toggleEnemyHP(); // Turn off

      expect(manager.getState().showEnemyHP).toBe(false);
    });

    it('should not affect other debug displays when toggling enemy HP', () => {
      manager.toggleBlockHP(); // Turn on block HP
      manager.toggleBulletDamage(); // Turn on bullet damage

      manager.toggleEnemyHP();

      expect(manager.getState().showBlockHP).toBe(true);
      expect(manager.getState().showBulletDamage).toBe(true);
    });
  });

  describe('toggleBulletDamage', () => {
    it('should toggle bullet damage display from false to true', () => {
      expect(manager.getState().showBulletDamage).toBe(false);

      manager.toggleBulletDamage();

      expect(manager.getState().showBulletDamage).toBe(true);
    });

    it('should toggle bullet damage display from true to false', () => {
      manager.toggleBulletDamage(); // Turn on
      expect(manager.getState().showBulletDamage).toBe(true);

      manager.toggleBulletDamage(); // Turn off

      expect(manager.getState().showBulletDamage).toBe(false);
    });

    it('should not affect other debug displays when toggling bullet damage', () => {
      manager.toggleBlockHP(); // Turn on block HP
      manager.toggleEnemyHP(); // Turn on enemy HP

      manager.toggleBulletDamage();

      expect(manager.getState().showBlockHP).toBe(true);
      expect(manager.getState().showEnemyHP).toBe(true);
    });
  });

  describe('setBlockHP', () => {
    it('should set block HP display to true', () => {
      manager.setBlockHP(true);

      expect(manager.getState().showBlockHP).toBe(true);
    });

    it('should set block HP display to false', () => {
      manager.setBlockHP(true);
      manager.setBlockHP(false);

      expect(manager.getState().showBlockHP).toBe(false);
    });
  });

  describe('setEnemyHP', () => {
    it('should set enemy HP display to true', () => {
      manager.setEnemyHP(true);

      expect(manager.getState().showEnemyHP).toBe(true);
    });

    it('should set enemy HP display to false', () => {
      manager.setEnemyHP(true);
      manager.setEnemyHP(false);

      expect(manager.getState().showEnemyHP).toBe(false);
    });
  });

  describe('setBulletDamage', () => {
    it('should set bullet damage display to true', () => {
      manager.setBulletDamage(true);

      expect(manager.getState().showBulletDamage).toBe(true);
    });

    it('should set bullet damage display to false', () => {
      manager.setBulletDamage(true);
      manager.setBulletDamage(false);

      expect(manager.getState().showBulletDamage).toBe(false);
    });
  });

  describe('getState immutability', () => {
    it('should return a new state object each time (immutability)', () => {
      const state1 = manager.getState();
      const state2 = manager.getState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });

    it('should not allow external mutation of state', () => {
      const state = manager.getState();
      state.showBlockHP = true;

      expect(manager.getState().showBlockHP).toBe(false);
    });
  });

  describe('onStateChange callback', () => {
    it('should call callback when block HP is toggled', () => {
      let callbackCalled = false;
      let receivedShowBlockHP = false;

      manager.onStateChange((state) => {
        callbackCalled = true;
        receivedShowBlockHP = state.showBlockHP;
      });

      manager.toggleBlockHP();

      expect(callbackCalled).toBe(true);
      expect(receivedShowBlockHP).toBe(true);
    });

    it('should call callback when enemy HP is toggled', () => {
      let callbackCalled = false;

      manager.onStateChange(() => {
        callbackCalled = true;
      });

      manager.toggleEnemyHP();

      expect(callbackCalled).toBe(true);
    });

    it('should call callback when bullet damage is toggled', () => {
      let callbackCalled = false;

      manager.onStateChange(() => {
        callbackCalled = true;
      });

      manager.toggleBulletDamage();

      expect(callbackCalled).toBe(true);
    });

    it('should call callback when using setBlockHP', () => {
      let callbackCalled = false;

      manager.onStateChange(() => {
        callbackCalled = true;
      });

      manager.setBlockHP(true);

      expect(callbackCalled).toBe(true);
    });

    it('should call callback when using setEnemyHP', () => {
      let callbackCalled = false;

      manager.onStateChange(() => {
        callbackCalled = true;
      });

      manager.setEnemyHP(true);

      expect(callbackCalled).toBe(true);
    });

    it('should call callback when using setBulletDamage', () => {
      let callbackCalled = false;

      manager.onStateChange(() => {
        callbackCalled = true;
      });

      manager.setBulletDamage(true);

      expect(callbackCalled).toBe(true);
    });
  });

  describe('resetAll', () => {
    it('should reset all debug displays to false', () => {
      manager.toggleBlockHP();
      manager.toggleEnemyHP();
      manager.toggleBulletDamage();

      manager.resetAll();

      const state = manager.getState();
      expect(state.showBlockHP).toBe(false);
      expect(state.showEnemyHP).toBe(false);
      expect(state.showBulletDamage).toBe(false);
    });

    it('should call onStateChange callback when resetting', () => {
      let callbackCalled = false;

      manager.toggleBlockHP();
      manager.onStateChange(() => {
        callbackCalled = true;
      });

      manager.resetAll();

      expect(callbackCalled).toBe(true);
    });
  });
});
