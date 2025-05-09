import { Component, effect, inject, Injector, Signal } from '@angular/core';
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
import { AssetDataService } from '@services/asset-data/asset-data.service';

@Component({
  selector: 'app-root',
  imports: [
    CanvasComponent,
    PartsComponent,
    ItemsComponent,
    ZoomComponent,
    MovementComponent,
    PaletteComponent,
    OutfitsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  title = 'Build-A-Bettel';

  readonly dialog = inject(MatDialog);

  private injector = inject(Injector);
  private partSignal: Signal<Part[]>;

  constructor(
    private assetData: AssetDataService,
    private logger: LogService
  ) {

    this.partSignal = this.assetData.getParts();
  }

  ngOnInit() {
    this.logger.info("AppComponent: ngOnInit()");

    const firstPartEffect = effect(() => {
      console.log(`Parts: ${this.partSignal().length}`);

      if (this.partSignal().length > 0) {

        for (let i = 0; i < this.partSignal().length; i++) {
          if (this.partSignal()[i].hideFromPartsList) {
            continue;
          }
          // TODO this.selectedPart = i;
          break;
        }

        firstPartEffect.destroy();
      }
    }, {
      injector: this.injector
    });
  }

  showCredits() {
    this.logger.info("AppComponent: showCredits()");

    this.dialog.open(InfoComponent);
  }

  randomize() {

    this.logger.info("AppComponent: randomize()");
  }
}
