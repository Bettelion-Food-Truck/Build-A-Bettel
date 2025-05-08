import { Component, input, output, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ASSET_PATH, ICON_PATH, ITEM_FOLDER, THUMBNAIL_FOLDER } from '@data/paths';

import { Part } from '@models/part.model';

import { AssetDataServiceService } from '@services/asset-data/asset-data-service.service';

@Component({
  selector: 'app-items',
  imports: [
    CommonModule
  ],
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent {

  partSignal: Signal<Part[]>;

  selectedPart = input.required<number>();
  selectedItems = input.required<number[]>();

  onChange = output<{ part: number, item: number }>();

  constructor(
    private assetData: AssetDataServiceService
  ) {

    this.partSignal = this.assetData.getParts();
  }

  getNonePath(): string {

    return `${ICON_PATH}none_button.svg`;
  }

  getItemPath(partIndex: number, itemIndex: number): string {

    let part = this.partSignal()[partIndex];

    if (!part) {

      return "";
    }

    let item = part.items[itemIndex];

    if (!item) {

      return "";
    }

    return ASSET_PATH +
      (item.folder ? item.folder : part.folder) + "/" +
      (item.thumbnail ? THUMBNAIL_FOLDER : ITEM_FOLDER) +
      item.item + ".png";
  }
}

export interface ItemSelectedEvent {
  part: number,
  item: number
}