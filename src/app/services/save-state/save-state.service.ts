import { Injectable } from '@angular/core';
import { SimpleFit } from '@models/simpleFit.modal';
import { LogService } from '@services/log/log.service';
import { ModelDataService } from '@services/model-data/model-data.service';

@Injectable({
  providedIn: 'root'
})
export class SaveStateService {

  private readonly KEY_LIST = "buildabettel-key-list";
  private readonly STATE_KEY_PREFIX = "buildabettel-state-";

  constructor(
    private modalData: ModelDataService,
    private logger: LogService
  ) { }

  saveState(storage: Storage = sessionStorage) {
    this.logger.debug('SaveStateService: saveState()');

    // Get current key list
    let keyList: string[] = JSON.parse(storage.getItem(this.KEY_LIST) ?? "[]");

    // Build current fit object & key
    const currentFit: SimpleFit = this.modalData.getCurrentFitObject();
    const currentFitKey = this.STATE_KEY_PREFIX + this.getRandomUUID();

    // Check if current fit is empty
    if (Object.keys(currentFit).length === 0) {
      this.logger.debug('SaveStateService: saveState() - current fit is empty');
      return;
    }

    // Check if current fit matches previous fit
    const previousFitKey = keyList[keyList.length - 1];
    const previousFit: string = storage.getItem(previousFitKey) ?? "{}";
    if (JSON.stringify(currentFit) === previousFit) {
      this.logger.debug('SaveStateService: saveState() - current fit matches previous fit');
      return;
    }

    // Save fit to storage
    storage.setItem(currentFitKey, JSON.stringify(currentFit));

    // Save updated key list
    keyList.push(currentFitKey);
    storage.setItem(this.KEY_LIST, JSON.stringify(keyList));
  }

  loadState() {
    this.logger.debug('SaveStateService: loadState()');

    console.log("Do something with this.modalData.setCurrentFitObject(OBJ)");
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
