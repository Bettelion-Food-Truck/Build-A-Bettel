import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LogService } from '@services/log/log.service';

import { ASSET_PATH } from '@data/paths';

import PartDataJSON from '@data/parts.json';
import LayerDataJSON from '@data/layers.json';

import { Part } from '@models/part.model';
import { Item } from '@models/item.model';
import { LoadingService } from '@services/loading/loading.service';
import { Layer } from '@models/layer.model';
import { PartConnection } from '@models/partConnection.model';

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

    this.loading.addLoadingItem(0);

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
    let partConnections: PartConnection = {};

    for (let i: number = 0; i < partData.length; i++) {

      this.parts[i] = partData[i] satisfies Part;

      if (!this.parts[i].layer) {
        // Ensure layer is set
        this.parts[i].layer = this.parts[i].folder;
      }

      for (let j: number = 0; j < this.parts[i].items.length; j++) {

        if (!this.parts[i].items[j].requires) {
          // Check if the item has a requirement

          continue;
        }

        const item = this.parts[i].items[j];

        let targetPart = item.requires!.part;
        let targetItem = item.requires!.item;

        if (!partConnections[targetPart] || partConnections[targetPart] === undefined) {

          partConnections[targetPart] = {};
        }

        if (!partConnections[targetPart][targetItem] || partConnections[targetPart][targetItem] === undefined) {

          partConnections[targetPart][targetItem] = [];
        }

        partConnections[targetPart][targetItem].push({
          part: this.parts[i].name,
          item: item.item
        });
      }
    }

    /*
    TODO
    Maybe
    Then when checking, if part is targeted, mark all things that target not the same item as incompatible (if they are NOT in the same part as the source)
    When selecting an incompatible item, confirm that the user wants to change the item
    */

    // console.log("CONNECTIONS", this.partConnections);
    //x.filter( entry => entry.source.part === "Socks" )

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
