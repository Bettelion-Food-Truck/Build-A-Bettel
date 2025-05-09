import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LogService } from '@services/log/log.service';

import { ASSET_PATH } from '@data/paths';

import JSONData from '@data/parts.json';
import { Part } from '@models/part.model';
import { Item } from '@models/item.model';

@Injectable({
  providedIn: 'root'
})
export class AssetDataService {

  private imageFolder: WritableSignal<string> = signal("");
  private thumbnailFolder: WritableSignal<string> = signal("");

  private parts: Part[] = [];
  private partSignal: WritableSignal<Part[]> = signal([]);

  private activePart: WritableSignal<number> = signal(0);
  private selectedItems: WritableSignal<number[]> = signal([]);

  constructor(private logger: LogService) {

    this.loadAssetData();
  }

  async loadAssetData() {

    this.logger.info("AssetDataService: loadAssetData()");

    this.imageFolder.set(JSONData.images ?? "items/");
    this.thumbnailFolder.set(JSONData.thumbnails ?? "thumbnails/");

    // Fetch data from all the JSON files
    const partData = await Promise.all(
      JSONData.parts.map(
        async (dataItem: any) => {

          let part = dataItem satisfies Part as Part;

          const resp = await fetch(`${ASSET_PATH}${part.folder}/${part.items}`, { cache: "no-cache" });

          let jsonResp = await resp.json();

          for (let i = 0; i < jsonResp.items.length; i++) {

            if (typeof jsonResp.items[i] === "string") {

              jsonResp.items[i] = {
                item: jsonResp.items[i]
              } as Item;
            }
          }

          return { ...part, ...jsonResp } as Part;
        }
      )
    );

    // Build functional structure
    this.parts = [];

    for (let partIndex = 0; partIndex < partData.length; partIndex++) {

      this.parts[partIndex] = partData[partIndex] satisfies Part;

      if (!this.parts[partIndex].layer) {
        // Ensure layer is set
        this.parts[partIndex].layer = this.parts[partIndex].folder;
      }
    }

    this.partSignal.set(this.parts);
  }

  getImageFolder(): Signal<string> {

    return this.imageFolder.asReadonly();
  }

  getThumbnailFolder(): Signal<string> {

    return this.thumbnailFolder.asReadonly();
  }

  getParts(): Signal<Part[]> {

    return this.partSignal.asReadonly();
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

    this.selectedItems.update(selectedItems => {

      selectedItems[partIndex] = itemIndex;

      return selectedItems;
    })
  }

  reset(render: boolean = true) {

    this.selectedItems.update(selectedItems => {

      selectedItems = [];

      for (let i = 0; i < this.parts.length; i++) {

        if (this.parts[i].noneAllowed) {
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
