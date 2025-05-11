import { Component, computed, effect, inject, Injector, isDevMode, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CanvasComponent } from "@components/canvas/canvas.component";

import { PartsComponent } from "@components/parts/parts.component";
import { ItemsComponent } from "@components/items/items.component";

import { ZoomComponent } from '@components/zoom/zoom.component';

import { MovementComponent } from '@components/movement/movement.component';
import { PaletteComponent } from "@components/palette/palette.component";
import { OutfitsComponent } from "@components/outfits/outfits.component";
import { PromptComponent } from "@components/prompt/prompt.component";

import { InfoComponent } from '@components/info/info.component';

import { LogService } from '@services/log/log.service';

import { Part } from '@models/part.model';
import { Outfit } from '@models/outfit.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';
import { LoadingComponent } from "./components/loading/loading.component";
import { OutfitDataService } from '@services/outfit-data/outfit-data.service';
import { LogLevel } from '@services/log/log-entry.model';
import { PromptService } from '@services/prompt/prompt.service';

@Component({
  selector: 'app-root',
  imports: [
    CanvasComponent,
    PartsComponent,
    ItemsComponent,
    ZoomComponent,
    MovementComponent,
    PaletteComponent,
    OutfitsComponent,
    LoadingComponent,
    PromptComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'Build-A-Bettel';

  readonly dialog = inject(MatDialog);

  private injector = inject(Injector);
  private partSignal: Signal<Part[]>;
  private outfitSignal: Signal<Outfit[]>;
  imageDataString: Signal<string>;
  private activePart: Signal<number>;

  outfitsVisible = false;

  potentialItems: Signal<boolean> = computed(() => {

    if (!this.partSignal() || !this.activePart() || this.partSignal().length < this.activePart()) {
      return false;
    }

    const part: Part = this.partSignal()[this.activePart()];

    return part.items.length > 0;
  });

  potentialPalette: Signal<boolean> = computed(() => {

    if (!this.partSignal() || !this.activePart() || this.partSignal().length < this.activePart()) {
      return false;
    }

    const part: Part = this.partSignal()[this.activePart()];

    return part.colors.length > 0;
  });

  potentialMovement: Signal<boolean> = computed(() => {

    if (!this.partSignal() || !this.activePart() || this.partSignal().length < this.activePart()) {
      return false;
    }

    const part: Part = this.partSignal()[this.activePart()];

    return !(!part.movement || Object.keys(part.movement).length === 0);
  });

  itemsVisible = true;
  paletteVisible = false;
  movementVisible = false;

  constructor(
    private assetData: AssetDataService,
    private outfitData: OutfitDataService,
    private modalData: ModelDataService,
    private prompt: PromptService,
    private logger: LogService
  ) {

    if (!isDevMode()) {

      this.logger.level = LogLevel.Error;
    }

    this.partSignal = this.assetData.getParts();
    this.outfitSignal = this.outfitData.getOutfits();
    this.activePart = this.modalData.getActivePart();
    this.imageDataString = this.modalData.getImageEncoded();
  }

  ngOnInit() {
    this.logger.info("AppComponent: ngOnInit()");

    // TODO Show credits on initial load; Keeping this out until closer to production
    // this.showCredits();

    // Initial load
    const initialLoadEffect = effect(() => {
      this.logger.debug(`Parts: ${this.partSignal().length}`);

      if (this.partSignal().length > 0) {

        // Load game into a default outfit
        if (this.outfitSignal().length > 0) {

          this.modalData.selectOutfit(this.outfitSignal()[0])
        } else {

          this.modalData.reset();
        }

        // Initially visible part
        for (let i = 0; i < this.partSignal().length; i++) {
          if (this.partSignal()[i].hideFromPartsList) {
            continue;
          }

          this.modalData.setActivePart(i);
          break;
        }

        initialLoadEffect.destroy();
      }
    }, {
      injector: this.injector,
      manualCleanup: true
    });
  }

  showItems() {

    this.itemsVisible = true;
    this.paletteVisible = false;
    this.movementVisible = false;
  }

  showPalette() {

    this.itemsVisible = false;
    this.paletteVisible = true;
    this.movementVisible = false;
  }

  showMovement() {

    this.itemsVisible = false;
    this.paletteVisible = false;
    this.movementVisible = true;
  }

  reset() {
    this.logger.info("AppComponent: reset()");

    this.modalData.reset();
  }

  showOutfits() {
    this.logger.info("AppComponent: showOutfits()");

    this.outfitsVisible = true;
  }

  showComponents() {
    this.logger.info("AppComponent: showComponents()");

    this.outfitsVisible = false;
  }

  generatePrompt() {
    this.logger.info("AppComponent: generatePrompt()");

    this.prompt.generateRandomPrompt();
  }

  showCredits() {
    this.logger.info("AppComponent: showCredits()");

    this.dialog.open(InfoComponent);
  }
}
