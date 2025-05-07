import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Part } from '@models/part.model';

import { AssetDataServiceService } from '@services/asset-data/asset-data-service.service';
import { LogService } from '@services/log/log.service';

@Component({
  selector: 'app-parts',
  imports: [
    CommonModule
  ],
  templateUrl: './parts.component.html',
  styleUrl: './parts.component.scss'
})
export class PartsComponent {

  partSignal: Signal<Part[]>;

  constructor(
    private logger: LogService,
    private assetData: AssetDataServiceService
  ) {

    this.partSignal = this.assetData.getParts();
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
}
