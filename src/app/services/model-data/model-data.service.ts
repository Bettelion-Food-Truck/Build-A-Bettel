import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { AssetDataService } from '@services/asset-data/asset-data.service';

import { Outfit } from '@models/outfit.model';
import { Position, DEFAULT_POSITION } from '@models/position.model';
import { Part } from '@models/part.model';

@Injectable({
  providedIn: 'root'
})
export class ModelDataService {

  private activePart: WritableSignal<number> = signal(0);
  private selectedItems: WritableSignal<number[]> = signal([]);
  private selectedPositions: WritableSignal<Position[]> = signal([]);

  private imageDataString: WritableSignal<string> = signal("");

  constructor(private assetData: AssetDataService) { }

  getImageEncoded(): Signal<string> {

    return this.imageDataString.asReadonly();
  }

  setImageEncoded(imageDataString: string) {

    this.imageDataString.set(imageDataString);
  }

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

    if (this.selectedItems()[partIndex] === itemIndex) {
      // Unchanged

      return;
    }

    this.selectedItems.update(selectedItems => {

      selectedItems[partIndex] = itemIndex;

      return [...selectedItems];
    });

    // Reset position on item change
    this.setItemsPosition(partIndex, {
      x: DEFAULT_POSITION.x,
      y: DEFAULT_POSITION.y
    } as Position);
  }

  getItemsPositions(): Signal<Position[]> {

    return this.selectedPositions.asReadonly();
  }

  getItemsPosition(partIndex: number): Position {

    if (
      // Out of range
      partIndex < 0 || partIndex >= this.selectedPositions().length ||
      // Null or undefined
      !this.selectedPositions()[partIndex] ||
      // Empty
      Object.keys(this.selectedPositions()[partIndex]).length === 0
    ) {

      return {
        x: DEFAULT_POSITION.x,
        y: DEFAULT_POSITION.y
      } as Position;
    }

    return this.selectedPositions()[partIndex];
  }

  setItemsPosition(partIndex: number, position: Position) {

    this.selectedPositions.update(selectedPositions => {

      selectedPositions[partIndex] = position;

      return [...selectedPositions];
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
        for (let j = 0; j < items.length; j++) {

          if (items[j].outfits && items[j].outfits.indexOf(outfit.uid) >= 0) {

            selectedItems[i] = j;
            break;
          }
        }
      }

      return [...selectedItems];
    });
  }

  randomize() {

    this.selectedItems.update(selectedItems => {

      let parts = this.assetData.getParts()();

      for (let i = 0; i < parts.length; i++) {

        let items = parts[i].items;

        let max = items.length;
        let min = (parts[i].noneAllowed) ? -1 : 0;

        let randomItem = Math.floor(Math.random() * (max - min) + min);

        selectedItems[i] = randomItem;

        // TODO random color
      }

      return [...selectedItems];
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

      return [...selectedItems];
    });
  }

  getCurrentFitObject(): { [key: string]: string } {

    let items: { [key: string]: string } = {};

    let parts = this.assetData.getParts()();

    this.selectedItems().forEach((itemIndex, partIndex) => {

      const part: Part = parts[partIndex];

      if (itemIndex >= 0) {
        // Item is selected

        items[part.layer] = part.items[itemIndex].item;
      }
    });

    return items;
  }
}
