import { AfterViewInit, Component, effect, ElementRef, inject, Injector, Signal, viewChild } from '@angular/core';

import Panzoom, { PanzoomObject } from '@panzoom/panzoom'

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { LoadingService } from '@services/loading/loading.service';
import { LogService } from '@services/log/log.service';
import { ModelDataService } from '@services/model-data/model-data.service';

import { ASSET_PATH, ITEM_FOLDER } from '@data/paths';

import { Item } from '@models/item.model';
import { Layer } from '@models/layer.model';
import { Part } from '@models/part.model';
import { Position } from '@models/position.model';
import { LayerRender } from '@models/layerRender.model';

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent implements AfterViewInit {

  private injector = inject(Injector);

  private panzoom: PanzoomObject | null = null;

  canvas: Signal<ElementRef> = viewChild.required<ElementRef>('canvas');
  private context: CanvasRenderingContext2D | null = null;

  private canvas_height: number = 0;
  private canvas_width: number = 0;

  private workingCanvas: HTMLCanvasElement | null = null;
  private workingContext: CanvasRenderingContext2D | null = null;

  private layerCanvases: HTMLCanvasElement[] = [];
  private layerSignal: Signal<Layer[]>;

  private partSignal: Signal<Part[]>;
  private itemSignal: Signal<number[]>;
  private positionSignal: Signal<Position[]>;

  private lastPartIndex: number = -1;

  private currentlySelectedItems: number[] = [];

  constructor(
    private assetData: AssetDataService,
    private modelData: ModelDataService,
    private loading: LoadingService,
    private logger: LogService
  ) {

    this.layerSignal = this.assetData.getLayers();
    this.partSignal = this.assetData.getParts();
    this.itemSignal = this.modelData.getSelectedItems();
    this.positionSignal = this.modelData.getItemsPositions();
  }

  ngAfterViewInit() {

    this.initPanZoom(this.canvas().nativeElement);

    this.context = this.canvas().nativeElement.getContext('2d');

    // Initial load
    const initialLoadEffect = effect(() => {

      if (this.layerSignal().length > 0 && this.partSignal().length > 0) {
        // Wait until parts and layers are loaded before building the workspace

        this.buildWorkspace();
        initialLoadEffect.destroy();
      }
    }, {
      injector: this.injector,
      manualCleanup: true
    });

    // Watch for item changes
    effect(() => {
      this.logger.info("CanvasComponent: effect() - renderLayerStack() Check");
      this.logger.debug(
        "CanvasComponent: effect() - activePart(), itemSignal().length, positionSignal().length",
        this.modelData.getActivePart()(),
        this.itemSignal().length,
        this.positionSignal().length
      );

      if (!this.workingCanvas) {
        this.logger.debug("CanvasComponent: effect() - working canvas not found");

        return;
      }

      if (this.lastPartIndex >= 0 && this.lastPartIndex !== this.modelData.getActivePart()()) {
        this.logger.debug("CanvasComponent: effect() - Part changed, do not render.");

        this.lastPartIndex = this.modelData.getActivePart()();
        return;
      }

      this.lastPartIndex = this.modelData.getActivePart()();

      this.renderLayerStack();
    }, {
      injector: this.injector,
      manualCleanup: true
    });
  }

  watchForItemChanges() {
  }

  getCanvas(): Signal<ElementRef> {

    return this.canvas;
  }

  /**
   * Sets up and binds elements for use with the PanZoom
   */
  private initPanZoom(element: HTMLElement) {
    this.logger.info("CanvasComponent: initPanZoom()");

    if (!element) {

      return;
    }

    this.panzoom = Panzoom(element, {
      maxScale: 3,
      minScale: 1,
      panOnlyWhenZoomed: true,
    });

    element.parentElement?.addEventListener('wheel', this.panzoom.zoomWithWheel);

    // Forces canvas back into center of view on no zoom to help with view reset
    element.addEventListener('panzoomchange', this.checkAndReset.bind(this));
  }

  private checkAndReset() {

    if (this.panzoom?.getScale() === 1) {

      this.panzoom.reset();
    }
  }

  public zoomIn() {

    this.panzoom?.zoomIn();
  }

  public zoomOut() {

    this.panzoom?.zoomOut();
  }

  public reset() {

    this.panzoom?.reset();
  }

  /**
   * Workspace for the visible canvas.
   *
   * The working canvas is drawn to first to prevent flickering.
   * The layer canvases allow for this thing to actually work.
   */
  private buildWorkspace() {
    this.logger.info("CanvasComponent: buildWorkspace()");

    this.canvas_height = this.canvas().nativeElement.height;
    this.canvas_width = this.canvas().nativeElement.width;

    this.workingCanvas = this.createCanvas();
    this.workingContext = this.workingCanvas.getContext('2d');

    let layers: Layer[] = this.layerSignal();
    let parts: Part[] = this.partSignal();

    // Create layers noted in layers.json
    for (let i = 0; i < layers.length; i++) {

      this.layerCanvases[i] = this.createCanvas();
    }

    // Check each part folder has a layer
    for (let i = 0; i < parts.length; i++) {

      if (layers.filter(x => x.layer === parts[i].layer).length > 0) {
        continue;
      }

      this.logger.warn(`Part layer not found for ${parts[i].layer}`);

      // TODO Doesn't actually work with current setup; Need to change from computed signal?
      // No layer set, assign to the end
      let layerIndex = layers.length;
      layers[layerIndex] = {
        "layer": parts[i].layer ?? parts[i].folder,
        "partIndex": i
      };
      this.layerCanvases[layerIndex] = this.createCanvas();
    }

    // Make blank layers in case of missing ones
    for (let i = 0; i < this.layerCanvases.length; i++) {

      if (typeof this.layerCanvases[i] === 'undefined') {
        this.logger.warn(`Building layerfor ${layers[i].layer}`);

        this.layerCanvases[i] = this.createCanvas();
      }
    }
  }

  private createCanvas(): HTMLCanvasElement {

    if (this.canvas_height === 0 || this.canvas_width === 0) {
      this.logger.error("CanvasComponent: createCanvas() - canvas size not set");
    }

    let canvas = document.createElement('canvas');

    canvas.height = this.canvas_height;
    canvas.width = this.canvas_width;

    return canvas;
  }

  /**
   * Do the heavy lifting of figuring out what to draw and where
   */
  private renderLayerStack() {
    this.logger.info("CanvasComponent: renderLayerStack()");

    this.clearCanvas(this.workingCanvas!);

    this.loading.addLoadingItem();

    this.currentlySelectedItems = { ...this.itemSignal() };
    const layers: Layer[] = this.layerSignal();

    this.checkPartRequirements();

    // Render images to layers
    let renderPromises: Promise<LayerRender>[] = [];

    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {

      const partIndex = layers[layerIndex].partIndex;

      if (this.currentlySelectedItems[partIndex] >= 0) {

        // TODO turn into promise.all
        renderPromises.push(...this.renderItemToCanvas(layerIndex, partIndex, this.currentlySelectedItems[partIndex], -1));// TODO COLOR selectedColors[partIndex]);
      }
    }

    Promise
      .allSettled(renderPromises)
      .then((results) => {

        let resultLayers: LayerRender[] = [];
        results.forEach((result) => {
          if (result.status === "fulfilled") {
            resultLayers.push(result.value);
          } else {
            this.logger.error("CanvasComponent: renderLayerStack() - Error rendering layer", result.reason);
          }
        });

        // Draw layers onto master
        for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {

          let layer = resultLayers.find(result => result.id === layerIndex);

          if (!layer || !layer.canvas) {
            continue;
          }

          this.layerCanvases[layerIndex] = layer.canvas;
          this.workingContext!.drawImage(this.layerCanvases[layerIndex], 0, 0);
        }

        this.clearCanvas(this.canvas().nativeElement);

        this.context!.drawImage(this.workingCanvas!, 0, 0);

        this.modelData.setImageEncoded(this.canvas().nativeElement.toDataURL("image/png"));

        this.loading.removeLoadingItem();
      });
  }

  private clearCanvas(canvas: HTMLCanvasElement) {

    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }

  /**
   * Some parts are picky. Set up temp replacements when they are selected and deeper in the layers.
   */
  private checkPartRequirements() {
    this.logger.info("CanvasComponent: checkPartRequirements()");

    let layers: Layer[] = this.layerSignal();
    let parts: Part[] = this.partSignal();

    // Check for part requirements
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {

      const partIndex: number = layers[layerIndex].partIndex;

      if (this.currentlySelectedItems[partIndex] !== null && this.currentlySelectedItems[partIndex] !== undefined) {

        const item: Item = parts[partIndex].items[this.currentlySelectedItems[partIndex]];

        if (item && item.requires) {
          // Complex item with a requirement

          let results = this.locatedPart(item.requires.part, item.requires.item);

          if (results.part !== null && results.item !== null) {

            this.currentlySelectedItems[results.part] = results.item;
          }
        }
      }
    }
  }

  /**
   * Find the part and item index/id based on the given strings
   *
   * @param partName
   * @param itemName
   * @returns
   */
  private locatedPart(partName: string, itemName: string): { part: number | null, item: number | null } {
    this.logger.info("CanvasComponent: locatedPart()", partName, itemName);

    let parts: Part[] = this.partSignal();

    let foundPart: number | null = null;
    let foundItem: number | null = null;

    for (let neededPartIndex = 0; neededPartIndex < parts.length; neededPartIndex++) {
      // Loop through parts to find the one we want

      if (parts[neededPartIndex].layer === partName) {
        // Found the part;

        foundPart = neededPartIndex;

        const part = parts[neededPartIndex];
        let neededPartFound = false;

        if (itemName === "none" && part.noneAllowed) {
          // No item wanted & allowed

          this.currentlySelectedItems[neededPartIndex] = -1;
          neededPartFound = true;
        } else {
          // Check through items

          for (let neededItemIndex = 0; neededItemIndex < part.items.length; neededItemIndex++) {
            // Check each item in the part for a match

            let currentItem: Item = part.items[neededItemIndex];

            if (currentItem.item === itemName) {

              neededPartFound = true;
              foundItem = neededItemIndex;
              break;
            }

            // TODO Need to indicate incompatible options
            // Just a toggle or something to check and add 'disabled' class to the item
          }
        }

        if (!neededPartFound) {

          this.logger.error(`Required item "${itemName}" not found in part "${partName}"`);
        }

        break;
      }
    }

    return {
      part: foundPart,
      item: foundItem
    };
  }

  private renderItemToCanvas(layerIndex: number, partIndex: number, itemIndex: number, colorIndex: number): Promise<LayerRender>[] {

    const parts: Part[] = this.partSignal();
    const layers: Layer[] = this.layerSignal();

    const item: Item = parts[partIndex].items[itemIndex];
    const position: Position = { ...(this.modelData.getItemsPosition(partIndex) ?? {}) } as Position;// shallow copy

    let renderPromises: Promise<LayerRender>[] = [];

    if (!item) {
      this.logger.error(`Item not found for part ${partIndex} and item ${itemIndex}`);

      return renderPromises;
    }

    // Set color variant item
    const color = (parts[partIndex].colors.length > 0) ?
      "_" + parts[partIndex].colors[colorIndex]
      :
      "";

    // Set asset folder
    const partLocation = ASSET_PATH + (item.folder ? item.folder : parts[partIndex].folder) + "/" + ITEM_FOLDER;

    // Render the base layer
    const imgPath = partLocation + item.item + color + ".png";

    if (!item.hide) {

      // Special different layer for some items
      if (item.layer) {

        layerIndex = layers.findIndex(layer => layer.layer === item.layer);
      }

      renderPromises.push(this.renderImage(layerIndex, imgPath, position));
    }

    // Render additional layers
    if (item.multilayer) {

      for (let i = 0; i < item.multilayer.length; i++) {

        let buildLayer = true;

        if (item.multilayer[i].requires) {

          let requirements = item.multilayer[i].requires!;

          // Find the part/item
          let results = this.locatedPart(requirements.part, requirements.item);

          if (results.part !== null && results.item !== null) {

            // Check if they match a selected item
            if (this.currentlySelectedItems[results.part] !== results.item) {

              // Not the same item, so don't build this layer
              buildLayer = false;
            }
          }
        }

        if (buildLayer) {

          const addImgPath = partLocation + item.multilayer[i].item + color + ".png";
          const addLayerIndex = layers.findIndex(layer => layer.layer === item.multilayer[i].layer);

          renderPromises.push(this.renderImage(addLayerIndex, addImgPath, position));
        }
      }
    }

    return renderPromises;
  }

  private renderImage(layerId: number, imgPath: string, position: Position): Promise<LayerRender> {

    return new Promise<LayerRender>((resolve, reject) => {

      if (!imgPath || imgPath.length === 0) {
        // Somethings wrong, exit

        this.logger.error(`Invalid image path sent`);
        reject({
          id: -1,
          canvas: null
        });
      }

      this.loadImage(imgPath).then((img) => {

        const renderCanvas: HTMLCanvasElement = this.createCanvas();
        const ctx: CanvasRenderingContext2D = renderCanvas.getContext('2d')!;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.save();

        ctx.translate(position.x ?? 0, position.y ?? 0);

        ctx.drawImage(img, 0, 0);

        ctx.restore();

        resolve({
          id: layerId,
          canvas: renderCanvas
        });
      }).catch(() => {

        reject({
          id: -1,
          canvas: null
        });
      });
    });
  }

  private loadImage(path: string): Promise<HTMLImageElement> {

    return new Promise((resolve, reject) => {

      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = (err) => {
        this.logger.error(`Image not found: ${path}`, err);

        reject(null);
      };

      image.src = path;
    });
  }
}
