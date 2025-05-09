import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { AssetDataService } from '@services/asset-data/asset-data.service';

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
    })
  }

  reset(render: boolean = true) {

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

    // TODO reset movement data

    if (render) {

      // TODO await renderLayerStack();
    }
  }
}
