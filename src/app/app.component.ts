import { Component, computed, effect, inject, Injector, isDevMode, Signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
    MatButtonModule,
    MatIconModule,

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

  potentialPalette: Signal<boolean> = computed(() => {

    if (this.isInvalidActivePart()) {
      return false;
    }

    const part: Part = this.partSignal()[this.activePart()];

    return part.colors.length > 0;
  });

  potentialMovement: Signal<boolean> = computed(() => {

    if (this.isInvalidActivePart()) {
      return false;
    }

    const part: Part = this.partSignal()[this.activePart()];

    return !(!part || !part.movement || Object.keys(part.movement).length === 0);
  });

  featuresEnabled: Signal<boolean> = computed(() => {

    if (this.isInvalidActivePart()) {
      return false;
    }

    const item: number = this.modalData.getSelectedItem(this.activePart());

    return item >= 0;
  });

  outfitsVisible = false;
  itemsVisible = true;
  movementVisible = false;

  constructor(
    private assetData: AssetDataService,
    private outfitData: OutfitDataService,
    private modalData: ModelDataService,
    private prompt: PromptService,
    private logger: LogService
  ) {

    if (isDevMode()) {
      // Enable up to Info level logging in dev mode
      this.logger.level = LogLevel.Info;

      // Debug level when trying to find strange behaviors
      // this.logger.level = LogLevel.Debug;
    } else {
      this.logger.level = LogLevel.Error;
    }

    this.partSignal = this.assetData.getParts();
    this.outfitSignal = this.outfitData.getOutfits();
    this.activePart = this.modalData.getActivePart();
    this.imageDataString = this.modalData.getImageEncoded();

    effect(() => {
      this.logger.debug(`AppComponent: partChangeEffect() ${this.activePart()}`);

      this.showItems();
    });
  }

  ngOnInit() {
    this.logger.info("AppComponent: ngOnInit()");

    // TODO Show credits on initial load; Keeping this out until closer to production
    // this.showCredits();

    // Initial load
    const initialLoadEffect = effect(() => {
      this.logger.debug(`AppComponent: initialLoadEffect() ${this.partSignal().length}`);

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

  toggleMovement() {
    this.logger.info("AppComponent: toggleMovement()");

    if (!this.potentialMovement() || !this.featuresEnabled()) {
      return;
    }

    if (this.movementVisible) {
      this.showItems();
    } else {
      this.showMovement();
    }
  }

  private showItems() {
    this.movementVisible = false;
    this.itemsVisible = true;
  }

  private showMovement() {
    this.movementVisible = true;
    this.itemsVisible = false;
  }

  reset() {
    this.logger.info("AppComponent: reset()");

    this.modalData.reset();
  }

  generatePrompt() {
    this.logger.info("AppComponent: generatePrompt()");

    this.prompt.generateRandomPrompt();
  }

  showCredits() {
    this.logger.info("AppComponent: showCredits()");

    this.dialog.open(InfoComponent);
  }

  isInvalidActivePart() {

    return (!this.partSignal() || !this.activePart() || this.activePart() >= 0 || this.partSignal().length < this.activePart())
  }
}
