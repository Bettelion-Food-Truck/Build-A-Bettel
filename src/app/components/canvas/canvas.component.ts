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

  private workingCanvas: HTMLCanvasElement | null = null;
  private workingContext: CanvasRenderingContext2D | null = null;

  private layerCanvases: HTMLCanvasElement[] = [];
  private layerSignal: Signal<Layer[]>;

  private partSignal: Signal<Part[]>;
  private itemSignal: Signal<number[]>;

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
      this.logger.info("CanvasComponent: effect() - itemSignal() changed", this.itemSignal().length);

      if (!this.workingCanvas) {
        return;
      }

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

    const canvas_height = this.canvas().nativeElement.height;
    const canvas_width = this.canvas().nativeElement.width;

    this.workingCanvas = this.createCanvas(canvas_height, canvas_width);
    this.workingContext = this.workingCanvas.getContext('2d');

    let layers: Layer[] = this.layerSignal();
    let parts: Part[] = this.partSignal();

    // Create layers noted in layers.json
    for (let i = 0; i < layers.length; i++) {

      this.layerCanvases[i] = this.createCanvas(canvas_height, canvas_width);
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
      this.layerCanvases[layerIndex] = this.createCanvas(canvas_height, canvas_width);
    }

    // Make blank layers in case of missing ones
    for (let i = 0; i < this.layerCanvases.length; i++) {

      if (typeof this.layerCanvases[i] === 'undefined') {
        this.logger.warn(`Building layerfor ${layers[i].layer}`);

        this.layerCanvases[i] = this.createCanvas(canvas_height, canvas_width);
      }
    }
  }

  private createCanvas(height: number, width: number): HTMLCanvasElement {

    let canvas = document.createElement('canvas');

    canvas.height = height;
    canvas.width = width;

    return canvas;
  }

  /**
   * Do the heavy lifting of figuring out what to draw and where
   */
  private async renderLayerStack() {
    this.logger.info("CanvasComponent: renderLayerStack()");

    this.clearCanvas(this.workingCanvas!);

    this.loading.addLoadingItem();

    this.currentlySelectedItems = this.itemSignal();
    const layers: Layer[] = this.layerSignal();

    this.checkPartRequirements();

    // Clear layers
    for (let i = 0; i < layers.length; i++) {
      // Clearing layers is done first because sometimes layers are rendered out of order due to special logics
      // Additional execution time is minimal for data set size

      this.clearCanvas(this.layerCanvases[i]);
    }

    // Render images to layers
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {

      const partIndex = layers[layerIndex].partIndex;

      if (this.currentlySelectedItems[partIndex] >= 0) {

        await this.renderItemToCanvas(layerIndex, partIndex, this.currentlySelectedItems[partIndex], -1);// TODO COLOR selectedColors[partIndex]);
      }
    }

    // Draw layers onto master
    for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
      this.workingContext!.drawImage(this.layerCanvases[layerIndex], 0, 0);
    }

    this.clearCanvas(this.canvas().nativeElement);

    this.context!.drawImage(this.workingCanvas!, 0, 0);

    this.modelData.setImageEncoded(this.canvas().nativeElement.toDataURL("image/png"));

    this.loading.removeLoadingItem();
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

          // Locate part
          for (let neededPartIndex = 0; neededPartIndex < parts.length; neededPartIndex++) {

            if (parts[neededPartIndex].layer === item.requires.part) {
              // Found the part;

              const part = parts[neededPartIndex];
              let neededPartFound = false;

              if (item.requires.item === "none" && part.noneAllowed) {
                // No item wanted & allowed

                this.currentlySelectedItems[neededPartIndex] = -1;
                neededPartFound = true;
              } else {
                // Check through items

                for (let neededItemIndex = 0; neededItemIndex < part.items.length; neededItemIndex++) {

                  let currentItem: Item = part.items[neededItemIndex];

                  if (currentItem.item === item.requires.item) {

                    neededPartFound = true;
                    this.currentlySelectedItems[neededPartIndex] = neededItemIndex;
                    break;
                  }

                  // TODO Need to indicate incompatible options
                  // Just a toggle or something to check and add 'disabled' class to the item
                }
              }

              if (!neededPartFound) {

                this.logger.error(`Required item "${item.requires.item}" not found in part "${item.requires.part}"`);
              }

              break;
            }
          }
        }
      }
    }
  }

  private async renderItemToCanvas(layerIndex: number, partIndex: number, itemIndex: number, colorIndex: number) {

    const parts: Part[] = this.partSignal();
    const layers: Layer[] = this.layerSignal();

    const item: Item = parts[partIndex].items[itemIndex];
    const position: Position = (this.modelData.getItemsPosition(partIndex) ?? {}) as Position;

    if (!item) {
      this.logger.error(`Item not found for part ${partIndex} and item ${itemIndex}`);

      return;
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

      await (this.renderImage(imgPath, layerIndex, position));
    }

    // Render additional layers
    if (item.multilayer) {

      for (let i = 0; i < item.multilayer.length; i++) {

        const addImgPath = partLocation + item.multilayer[i].item + color + ".png";
        const addLayerIndex = layers.findIndex(layer => layer.layer === item.multilayer[i].layer);

        await (this.renderImage(addImgPath, addLayerIndex, position));
      }
    }
  }

  private async renderImage(imgPath: string, layerIndex: number, position: Position) {

    if (layerIndex < 0) {
      // Somethings wrong, exit
      return;
    }

    let img = await this.loadImage(imgPath);

    let ctx = this.layerCanvases[layerIndex].getContext('2d')!;
    ctx.save();

    ctx.translate(position.x ?? 0, position.y ?? 0);

    ctx.drawImage(img, 0, 0);

    ctx.restore();
  }

  private loadImage(path: string): Promise<HTMLImageElement> {

    return new Promise(resolve => {
      const image = new Image();

      image.addEventListener('load', () => {
        resolve(image);
      });

      image.src = path;
    });
  }
}
