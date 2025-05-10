import { Component, effect, inject, Injector, isDevMode, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CanvasComponent } from "@components/canvas/canvas.component";

import { PartsComponent } from "@components/parts/parts.component";
import { ItemsComponent } from "@components/items/items.component";

import { ZoomComponent } from '@components/zoom/zoom.component';

import { MovementComponent } from '@components/movement/movement.component';
import { PaletteComponent } from "@components/palette/palette.component";
import { OutfitsComponent } from "@components/outfits/outfits.component";

import { InfoComponent } from '@components/info/info.component';

import { LogService } from '@services/log/log.service';

import { Part } from '@models/part.model';
import { Outfit } from '@models/outfit.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';
import { LoadingComponent } from "./components/loading/loading.component";
import { OutfitDataService } from '@services/outfit-data/outfit-data.service';
import { LogLevel } from '@services/log/log-entry.model';

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
    LoadingComponent
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

  outfitsVisible = false;

  constructor(
    private assetData: AssetDataService,
    private outfitData: OutfitDataService,
    private modalData: ModelDataService,
    private logger: LogService
  ) {

    if (!isDevMode()) {

      this.logger.level = LogLevel.Error;
    }

    this.partSignal = this.assetData.getParts();
    this.outfitSignal = this.outfitData.getOutfits();
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

  showCredits() {
    this.logger.info("AppComponent: showCredits()");

    this.dialog.open(InfoComponent);
  }

  randomize() {
    this.logger.info("AppComponent: randomize()");

    this.modalData.randomize();
  }
}
