import { ChangeDetectionStrategy, Component, ElementRef, output, Signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ASSET_PATH } from '@data/paths';

import { Part } from '@models/part.model';
import { Outfit } from '@models/outfit.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';
import { LogService } from '@services/log/log.service';
import { OutfitDataService } from '@services/outfit-data/outfit-data.service';

@Component({
  selector: 'app-parts',
  imports: [
    CommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './parts.component.html',
  styleUrl: './parts.component.scss'
})
export class PartsComponent {

  container = viewChild.required<ElementRef>('partmenu');

  partSignal: Signal<Part[]>;
  activePart: Signal<number>;
  outfitSignal: Signal<Outfit[]>;

  constructor(
    private logger: LogService,
    private outfitData: OutfitDataService,
    private assetData: AssetDataService,
    private modalData: ModelDataService
  ) {

    this.partSignal = this.assetData.getParts();
    this.activePart = this.modalData.getActivePart();
    this.outfitSignal = this.outfitData.getOutfits();
  }

  onScroll(e: WheelEvent) {

    if (Math.abs(e.deltaY) > 0) {

      e.preventDefault();

      this.container().nativeElement.scrollLeft += e.deltaY;
    }
  }

  getPartIcon(partIndex: number): string {
    this.logger.debug("PartsComponent: getPartIcon()", partIndex);

    let part = this.partSignal()[partIndex];

    if (!part) {

      return "";
    }

    return `${ASSET_PATH}${part.folder}/${part.icon}.png`;
  }

  getPartVisibility(partIndex: number): boolean {
    this.logger.debug("PartsComponent: getPartVisibility()", partIndex);

    if (partIndex === -1) {
      // Special case for Outfits
      return this.outfitSignal().length === 0;
    }

    if (this.partSignal().length < partIndex) {
      // Out of bounds
      return false;
    }

    let part = this.partSignal()[partIndex];

    // Part manually hidden OR
    // Part has 0|1 items, no color variants, and is required
    return part.hideFromPartsList || (
      part.items.length <= 1 &&
      !part.noneAllowed && (
        !part.colors || part.colors.length === 0
      )
    );
  }

  randomize() {
    this.logger.info("PartsComponent: randomize()");

    this.modalData.randomize();
  }

  onChange(partIndex: number) {
    this.logger.info("PartsComponent: onChange()", partIndex);

    this.modalData.setActivePart(partIndex);
  }
}
