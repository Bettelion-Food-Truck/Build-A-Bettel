import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { AssetDataService } from '@services/asset-data/asset-data.service';

import { Outfit } from '@models/outfit.model';
import { Position, DEFAULT_POSITION } from '@models/position.model';
import { Part } from '@models/part.model';
import { SimpleFit } from '@models/simpleFit.modal';

@Injectable({
  providedIn: 'root'
})
export class ModelDataService {

  private activePart: WritableSignal<number> = signal(0);
  private selectedItems: WritableSignal<number[]> = signal([]);
  private selectedPositions: WritableSignal<Position[]> = signal([]);
  private selectedColors: WritableSignal<string[]> = signal([]);

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
    this.setItemPosition(partIndex, {
      x: DEFAULT_POSITION.x,
      y: DEFAULT_POSITION.y
    } as Position);
  }

  getItemPositions(): Signal<Position[]> {

    return this.selectedPositions.asReadonly();
  }

  getItemPosition(partIndex: number): Position {

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

  setItemPosition(partIndex: number, position: Position) {

    this.selectedPositions.update(selectedPositions => {

      selectedPositions[partIndex] = position;

      return [...selectedPositions];
    });
  }

  getItemColors(): Signal<string[]> {

    return this.selectedColors.asReadonly();
  }

  getItemColor(partIndex: number): string {

    if (
      // Out of range
      partIndex < 0 || partIndex >= this.selectedColors().length ||
      // Null or undefined
      !this.selectedColors()[partIndex] ||
      // Empty
      Object.keys(this.selectedColors()[partIndex]).length === 0
    ) {

      return "";
    }

    return this.selectedColors()[partIndex];
  }

  setItemColor(partIndex: number, color: string) {

    this.selectedColors.update(colors => {

      colors[partIndex] = color;

      return [...colors];
    });
  }

  setItemsColor(partIndex: number[], color: string) {

    this.selectedColors.update(colors => {

      partIndex.forEach((index: number) => {
        colors[index] = color;
      });

      return [...colors];
    });
  }

  selectOutfit(outfit: Outfit) {

    // Reset colors and positions
    this.selectedPositions.set([]);
    this.selectedColors.set([]);

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

    this.selectedPositions.set([]);
    this.selectedColors.set([]);// TODO randomize the colors

    this.selectedItems.update(selectedItems => {

      let parts = this.assetData.getParts()();

      for (let i = 0; i < parts.length; i++) {

        let items = parts[i].items;

        let max = items.length;
        let min = (parts[i].noneAllowed) ? -1 : 0;

        let randomItem = Math.floor(Math.random() * (max - min) + min);

        selectedItems[i] = randomItem;
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

    this.selectedPositions.set([]);
    this.selectedColors.set([]);
  }

  getCurrentFitObject(): SimpleFit {

    let items: SimpleFit = {};

    let parts = this.assetData.getParts()();

    this.selectedItems().forEach((itemIndex, partIndex) => {

      const part: Part = parts[partIndex];

      if (itemIndex >= 0) {
        // Item is selected

        items[part.layer] = {
          item: part.items[itemIndex].item,
          position: {} as Position,// TODO add movement
          color: this.selectedColors()[partIndex] || ""
        };
      }
    });

    return items;
  }

  setCurrentFitObject(fitItems: SimpleFit) {

    this.selectedItems.update(selectedItems => {

      let parts = this.assetData.getParts()();

      for (let i = 0; i < parts.length; i++) {

        // Reset part
        if (parts[i].noneAllowed) {
          selectedItems[i] = -1;
        } else {
          selectedItems[i] = 0;
        }

        const partLayer = parts[i].layer;

        if (partLayer in fitItems && fitItems[partLayer].item.length !== undefined && fitItems[partLayer].item.length > 0) {
          // Valid part in fitItems

          const fitItem = fitItems[partLayer];

          let items = parts[i].items;

          // Attempt to load item
          for (let j = 0; j < items.length; j++) {

            if (items[j].item === fitItem.item) {

              selectedItems[i] = j;
              break;
            }
          }
        }
      }

      return [...selectedItems];
    });

    this.selectedColors.update(colors => {

      let parts = this.assetData.getParts()();

      for (let i = 0; i < parts.length; i++) {

        const partLayer = parts[i].layer;

        if (partLayer in fitItems && fitItems[partLayer].color !== undefined && fitItems[partLayer].color.length > 0) {

          if (parts[i].colorMode && parts[i].colors.length > 0) {
            // Set color

            colors[i] = fitItems[parts[i].layer].color ?? "";
          }

          break;
        }
      }

      return [...colors];
    });
  }
}
