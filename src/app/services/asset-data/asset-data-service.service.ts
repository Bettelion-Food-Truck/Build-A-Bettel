import { Injectable, Signal, signal } from '@angular/core';

import { LogService } from '@services/log/log.service';

import { ASSET_PATH } from '@data/paths';

import Data from '@data/parts.json';
import { Part } from '@models/part.model';
import { Item } from '@models/item.model';

@Injectable({
  providedIn: 'root'
})
export class AssetDataServiceService {

  private parts: Part[] = [];
  private partSignal = signal(this.parts);

  private imageFolder = signal("");
  private thumbnailFolder = signal("");

  constructor(private logger: LogService) {

    this.loadAssetData();
  }

  async loadAssetData() {

    this.logger.info("AssetDataServiceService: loadAssetData()");

    this.imageFolder.set(Data.images ?? "items/");
    this.thumbnailFolder.set(Data.thumbnails ?? "thumbnails/");

    // Fetch data from all the JSON files
    const partData = await Promise.all(
      Data.parts.map(
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

  getParts(): Signal<Part[]> {

    return this.partSignal.asReadonly();
  }

  getImageFolder(): Signal<string> {

    return this.imageFolder.asReadonly();
  }

  getThumbnailFolder(): Signal<string> {

    return this.thumbnailFolder.asReadonly();
  }
}
