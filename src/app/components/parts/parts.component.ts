import { ChangeDetectionStrategy, Component, input, output, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ASSET_PATH } from '@data/paths';

import { Part } from '@models/part.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';

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

  partSignal: Signal<Part[]>;
  activePart: Signal<number>;

  randomizeOutfit = output<void>();

  constructor(
    private assetData: AssetDataService,
    private modalData: ModelDataService
  ) {

    this.partSignal = this.assetData.getParts();
    this.activePart = this.modalData.getActivePart();
  }

  getPartIcon(partIndex: number): string {

    let part = this.partSignal()[partIndex];

    if (!part) {

      return "";
    }

    return `${ASSET_PATH}${part.folder}/${part.icon}`;
  }

  getPartVisibility(index: number): boolean {

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

  onChange(partIndex: number) {

    this.modalData.setActivePart(partIndex);
  }
}
