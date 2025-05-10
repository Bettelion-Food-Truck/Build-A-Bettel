import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LogService } from '@services/log/log.service';

import { ASSET_PATH } from '@data/paths';

import PartDataJSON from '@data/parts.json';
import LayerDataJSON from '@data/layers.json';

import { Part } from '@models/part.model';
import { Item } from '@models/item.model';
import { LoadingService } from '@services/loading/loading.service';
import { Layer } from '@models/layer.model';

@Injectable({
  providedIn: 'root'
})
export class AssetDataService {

  private imageFolder: WritableSignal<string> = signal("");
  private thumbnailFolder: WritableSignal<string> = signal("");

  private parts: Part[] = [];
  private partSignal: WritableSignal<Part[]> = signal([]);

  private layerSignal: Signal<Layer[]> = computed(() => {

    this.logger.info("AssetDataService: compute layerSignal");

    let layers = [];
    const parts = this.partSignal();

    for (let layerIndex = 0; layerIndex < LayerDataJSON.layers.length; layerIndex++) {

      let partList = parts
        .map((part, i) => part.layer === LayerDataJSON.layers[layerIndex] ? i : undefined)
        .filter(x => x !== undefined);

      layers[layerIndex] = {
        "layer": LayerDataJSON.layers[layerIndex],
        "partIndex": partList[0]
      } as Layer;
    }

    return [...layers];
  });

  constructor(
    private logger: LogService,
    private loading: LoadingService
  ) {

    this.loadAssetData();
  }

  async loadAssetData() {

    this.logger.info("AssetDataService: loadAssetData()");

    this.loading.addLoadingItem();

    this.imageFolder.set(PartDataJSON.images ?? "items/");
    this.thumbnailFolder.set(PartDataJSON.thumbnails ?? "thumbnails/");

    let partCount = 0;

    // Fetch data from all the JSON files
    const partData = await Promise.all(
      PartDataJSON.parts.map(
        async (dataItem: any) => {

          let part = dataItem satisfies Part as Part;

          const resp = await fetch(`${ASSET_PATH}${part.folder}/${part.items}`, { cache: "no-cache" });

          let jsonResp = await resp.json();

          partCount += jsonResp.items.length;

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
    this.logger.info(`AssetDataService: loadAssetData() - ${partCount} items loaded`);

    this.loading.removeLoadingItem();
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

  getPart(index: number): Part | null {

    if (index < 0 || index >= this.partSignal().length) {
      return null;
    }

    return this.partSignal()[index];
  }

  getLayers(): Signal<Layer[]> {

    return this.layerSignal;
  }
}
