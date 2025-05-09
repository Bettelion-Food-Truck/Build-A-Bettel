import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { AssetDataService } from '@services/asset-data/asset-data.service';

import { Outfit } from '@models/outfit.model';

@Injectable({
  providedIn: 'root'
})
export class ModelDataService {

  private activePart: WritableSignal<number> = signal(0);
  private selectedItems: WritableSignal<number[]> = signal([]);

  constructor(private assetData: AssetDataService) { }

  getActivePart(): Signal<number> {

    return this.activePart.asReadonly();
  }

  setActivePart(partIndex: number) {

    this.activePart.set(partIndex);
  }

  getSelectedItems(): Signal<number[]> {

    return this.selectedItems.asReadonly();
  }

  getSelectedItem(partIndex: number): number {

    if (partIndex < 0 || partIndex >= this.selectedItems().length) {
      return -1;
    }

    return this.selectedItems()[partIndex];
  }

  setSelectedItem(partIndex: number, itemIndex: number) {

    this.selectedItems.update(selectedItems => {

      selectedItems[partIndex] = itemIndex;

      return selectedItems;
    });
  }

  reset() {

    this.selectedItems.update(selectedItems => {

      let parts = this.assetData.getParts()();

      selectedItems = [];

      for (let i = 0; i < parts.length; i++) {

        if (parts[i].noneAllowed) {
          selectedItems[i] = -1;
        } else {
          selectedItems[i] = 0;
        }
      }

      return selectedItems;
    });
  }

  selectOutfit(outfit: Outfit) {

    this.selectedItems.update(selectedItems => {

      let parts = this.assetData.getParts()();

      for (let i = 0; i < parts.length; i++) {

        let items = parts[i].items;

        // Reset part
        if (parts[i].noneAllowed) {
          selectedItems[i] = -1;
        } else {
          selectedItems[i] = 0;
        }

        // Attempt to load outfit
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {

          if (items[itemIndex].outfits && items[itemIndex].outfits.indexOf(outfit.uid) >= 0) {

            selectedItems[i] = itemIndex;
            break;
          }
        }
      }

      return selectedItems;
    });
  }
}
