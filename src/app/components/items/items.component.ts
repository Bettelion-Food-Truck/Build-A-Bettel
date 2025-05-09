import { Component, input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ASSET_PATH, ICON_PATH, ITEM_FOLDER, THUMBNAIL_FOLDER } from '@data/paths';

import { Part } from '@models/part.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';

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

  activePart: Signal<number>;
  selectedItems: Signal<number[]>;

  constructor(
    private assetData: AssetDataService
  ) {

    this.partSignal = this.assetData.getParts();
    this.activePart = this.assetData.getActivePart();
    this.selectedItems = this.assetData.getSelectedItems();
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

  onChange(partIndex: number, itemIndex: number) {

    this.assetData.setSelectedItem(partIndex, itemIndex);
  }
}