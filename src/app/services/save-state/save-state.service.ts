import { Injectable } from '@angular/core';
import { SimpleFit } from '@models/simpleFit.modal';
import { LogService } from '@services/log/log.service';
import { ModelDataService } from '@services/model-data/model-data.service';

@Injectable({
  providedIn: 'root'
})
export class SaveStateService {

  private readonly PAST_KEY_LIST = "buildabettel-past-key-list";
  private readonly ACTIVE_KEY = "buildabettel-active-key";
  private readonly FUTURE_KEY_LIST = "buildabettel-future-key-list";

  private readonly STATE_KEY_PREFIX = "buildabettel-state-";

  constructor(
    private modalData: ModelDataService,
    private logger: LogService
  ) { }

  saveState(storage: Storage = sessionStorage) {
    this.logger.debug('SaveStateService: saveState()');

    // Build current fit object & key
    const currentFit: SimpleFit = this.modalData.getCurrentFitObject();
    const currentFitKey = this.STATE_KEY_PREFIX + this.getRandomUUID();

    // Check if current fit is empty
    if (Object.keys(currentFit).length === 0) {
      this.logger.debug('SaveStateService: saveState() - current fit is empty');
      return;
    }

    // Get current key list
    let pastKeys: string[] = JSON.parse(storage.getItem(this.PAST_KEY_LIST) ?? "[]");
    let activeKey: string = storage.getItem(this.ACTIVE_KEY) ?? "";
    let futureKeys: string[] = JSON.parse(storage.getItem(this.FUTURE_KEY_LIST) ?? "[]");

    // Check if current fit matches previous fit
    if (activeKey.length > 0) {
      const previousFit: string = storage.getItem(activeKey) ?? "{}";

      if (JSON.stringify(currentFit) === previousFit) {
        this.logger.debug('SaveStateService: saveState() - current fit matches previous fit');
        return;
      }
    }

    // Update keys
    if (activeKey.length > 0) {

      pastKeys.push(activeKey);
    }

    activeKey = currentFitKey;

    // Save current fit to storage
    storage.setItem(activeKey, JSON.stringify(currentFit));

    if (futureKeys.length > 0) {
      // Remove future keys

      let key = futureKeys.pop();

      while (key !== undefined) {
        storage.removeItem(key);
        key = futureKeys.pop();
      }
    }

    // Save updated key list
    storage.setItem(this.PAST_KEY_LIST, JSON.stringify(pastKeys));
    storage.setItem(this.ACTIVE_KEY, activeKey);
    storage.setItem(this.FUTURE_KEY_LIST, JSON.stringify(futureKeys));
  }

  undo(storage: Storage = sessionStorage) {
    this.logger.debug('SaveStateService: undo()');

    // Get current key list
    let pastKeys: string[] = JSON.parse(storage.getItem(this.PAST_KEY_LIST) ?? "[]");
    let activeKey: string = storage.getItem(this.ACTIVE_KEY) ?? "";
    let futureKeys: string[] = JSON.parse(storage.getItem(this.FUTURE_KEY_LIST) ?? "[]");

    if (pastKeys.length === 0) {
      this.logger.debug('SaveStateService: undo() - no previous fit to undo');
      return;
    }

    // Update keys
    futureKeys.unshift(activeKey);// Stick it on the front
    activeKey = pastKeys.pop() ?? "";

    // Save updated key list
    storage.setItem(this.PAST_KEY_LIST, JSON.stringify(pastKeys));
    storage.setItem(this.ACTIVE_KEY, activeKey);
    storage.setItem(this.FUTURE_KEY_LIST, JSON.stringify(futureKeys));

    if (activeKey.length > 0) {
      const activeFit: string = storage.getItem(activeKey) ?? "{}";

      this.modalData.setCurrentFitObject(JSON.parse(activeFit));
    }
  }

  redo(storage: Storage = sessionStorage) {
    this.logger.debug('SaveStateService: redo()');

    // Get current key list
    let pastKeys: string[] = JSON.parse(storage.getItem(this.PAST_KEY_LIST) ?? "[]");
    let activeKey: string = storage.getItem(this.ACTIVE_KEY) ?? "";
    let futureKeys: string[] = JSON.parse(storage.getItem(this.FUTURE_KEY_LIST) ?? "[]");

    if (futureKeys.length === 0) {
      this.logger.debug('SaveStateService: redo() - no future fit to redo');
      return;
    }

    // Update keys
    pastKeys.push(activeKey);
    activeKey = futureKeys.shift() ?? "";

    // Save updated key list
    storage.setItem(this.PAST_KEY_LIST, JSON.stringify(pastKeys));
    storage.setItem(this.ACTIVE_KEY, activeKey);
    storage.setItem(this.FUTURE_KEY_LIST, JSON.stringify(futureKeys));

    if (activeKey.length > 0) {
      const activeFit: string = storage.getItem(activeKey) ?? "{}";

      this.modalData.setCurrentFitObject(JSON.parse(activeFit));
    }
  }

  loadLastActiveState(storage: Storage = sessionStorage) {
    this.logger.debug('SaveStateService: loadState()');

    // Get current key list
    let activeKey: string = storage.getItem(this.ACTIVE_KEY) ?? "";

    if (activeKey.length > 0) {
      const activeFit: string = storage.getItem(activeKey) ?? "{}";

      this.modalData.setCurrentFitObject(JSON.parse(activeFit));
    }
  }

  private getRandomUUID(): string {

    let uuid: string = "";

    if (crypto && crypto.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    return uuid;
  }
}
