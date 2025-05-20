import { ChangeDetectionStrategy, Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OUTFIT_PATH } from '@data/paths';
import { OutfitDataService } from '@services/outfit-data/outfit-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';

import { Outfit } from '@models/outfit.model';

@Component({
  selector: 'app-outfits',
  imports: [
    CommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './outfits.component.html',
  styleUrl: './outfits.component.scss'
})
export class OutfitsComponent {

  outfitSignal: Signal<Outfit[]>;

  constructor(
    private outfitData: OutfitDataService,
    private modalData: ModelDataService
  ) {

    this.outfitSignal = this.outfitData.getOutfits();
  }

  getOutfitImage(index: number, ext: string = "png"): string {

    let outfit = this.outfitSignal()[index];

    if (!outfit) {

      return "";
    }

    return `${OUTFIT_PATH}${outfit.uid}.${ext}`;
  }

  onChange(partIndex: number) {

    this.modalData.selectOutfit(this.outfitSignal()[partIndex]);
  }

  isWebPEnabled(): boolean {

    return this.outfitData.isWebPEnabled();
  }
}
