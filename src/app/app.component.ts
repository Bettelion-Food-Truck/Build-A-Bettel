import { Component, effect, inject, Injector, Signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CanvasComponent } from "./components/canvas/canvas.component";

import { PartsComponent } from "./components/parts/parts.component";
import { ItemsComponent, ItemSelectedEvent } from "./components/items/items.component";

import { MovementComponent } from './components/movement/movement.component';
import { PaletteComponent } from "./components/palette/palette.component";
import { OutfitsComponent } from "./components/outfits/outfits.component";

import { InfoComponent } from './components/info/info.component';
import { LogService } from '@services/log/log.service';
import { AssetDataServiceService } from '@services/asset-data/asset-data-service.service';
import { Part } from '@models/part.model';

@Component({
  selector: 'app-root',
  imports: [
    CanvasComponent,
    PartsComponent,
    ItemsComponent,
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

  selectedPart: number = 0;
  selectedItems: number[] = [];

  private injector = inject(Injector);
  private partSignal: Signal<Part[]>;

  constructor(
    private assetData: AssetDataServiceService,
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
          this.selectedPart = i;
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

  updateSelectedPart(index: number) {

    this.logger.info("AppComponent: updateSelectedPart()", index);

    this.selectedPart = index;
  }

  updateSelectedItem(data: ItemSelectedEvent) {

    this.logger.info("AppComponent: updateSelectedItem()", data);

    this.selectedItems[data.part] = data.item;
  }

  randomize() {

    this.logger.info("AppComponent: randomize()");
  }
}
