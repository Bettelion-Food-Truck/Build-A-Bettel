import { ChangeDetectionStrategy, Component, ElementRef, output, Signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ASSET_PATH } from '@data/paths';

import { Part } from '@models/part.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';
import { LogService } from '@services/log/log.service';

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

  constructor(
    private logger: LogService,
    private assetData: AssetDataService,
    private modalData: ModelDataService
  ) {

    this.partSignal = this.assetData.getParts();
    this.activePart = this.modalData.getActivePart();
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

    return `${ASSET_PATH}${part.folder}/${part.icon}`;
  }

  getPartVisibility(index: number): boolean {
    this.logger.debug("PartsComponent: getPartVisibility()", index);

    if (this.partSignal().length < index) {
      return false;
    }

    let part = this.partSignal()[index];

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
