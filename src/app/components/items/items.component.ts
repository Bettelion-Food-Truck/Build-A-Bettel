import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, Injector, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ASSET_PATH, ICON_PATH, ITEM_FOLDER, THUMBNAIL_FOLDER } from '@data/paths';

import { Part } from '@models/part.model';

import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';
import { LogService } from '@services/log/log.service';

@Component({
  selector: 'app-items',
  imports: [
    CommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './items.component.html',
  styleUrl: './items.component.scss'
})
export class ItemsComponent {

  private injector = inject(Injector);

  partSignal: Signal<Part[]>;

  activePart: Signal<number>;
  selectedItems: Signal<number[]>;

  constructor(
    private hostElement: ElementRef,

    private logger: LogService,
    private assetData: AssetDataService,
    private modalData: ModelDataService
  ) {

    this.partSignal = this.assetData.getParts();
    this.activePart = this.modalData.getActivePart();
    this.selectedItems = this.modalData.getSelectedItems();
  }

  ngAfterViewInit() {

    effect(() => {
      this.logger.debug("ItemsComponent: activePart() chaged", this.activePart());

      this.hostElement.nativeElement.scrollTop = 0;
    }, {
      injector: this.injector
    });
  }

  getNonePath(partIndex: number): string {
    this.logger.debug("ItemsComponent: getNonePath()", partIndex);

    const part = this.partSignal()[partIndex];

    if (part.noneThumbnail) {

      return ASSET_PATH + part.folder + "/" + THUMBNAIL_FOLDER + part.noneThumbnail + ".png";
    }

    return `${ICON_PATH}none_button.svg`;
  }

  getItemPath(partIndex: number, itemIndex: number): string {
    this.logger.debug("ItemsComponent: getItemPath()", partIndex, itemIndex);

    const part = this.partSignal()[partIndex];

    if (!part) {

      return "";
    }

    const item = part.items[itemIndex];

    if (!item) {

      return "";
    }

    const hasThumbnail =
      (part.assumeThumbnails === true && item.thumbnail !== false) ||
      item.thumbnail === true;

    return ASSET_PATH +
      (item.folder ? item.folder : part.folder) + "/" +
      (hasThumbnail ? THUMBNAIL_FOLDER : ITEM_FOLDER) +
      item.item + ".png";
  }

  onChange(partIndex: number, itemIndex: number) {
    this.logger.info("ItemsComponent: onChange()", partIndex, itemIndex);

    this.modalData.setSelectedItem(partIndex, itemIndex);
  }
}