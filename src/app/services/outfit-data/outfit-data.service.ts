import { computed, Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LogService } from '@services/log/log.service';

import OutfitDataJSON from '@data/outfits.json';

import { Outfit } from '@models/outfit.model';

import { LoadingService } from '@services/loading/loading.service';

@Injectable({
  providedIn: 'root'
})
export class OutfitDataService {

  private outfits: Outfit[] = [];
  private outfitSignal: WritableSignal<Outfit[]> = signal([]);

  constructor(
    private logger: LogService,
    private loading: LoadingService
  ) {

    this.loadOutfitData();
  }

  async loadOutfitData() {

    this.logger.info("OutfitDataService: loadOutfitData()");

    this.loading.addLoadingItem();

    this.outfits = [];

    for (let i = 0; i < OutfitDataJSON.outfits.length; i++) {

      this.outfits.push(OutfitDataJSON.outfits[i] as Outfit);
    }

    this.outfitSignal.set(this.outfits);
    this.logger.info(`OutfitDataService: loadOutfitData() - ${this.outfits.length} outfits loaded`);

    this.loading.removeLoadingItem();
  }

  getOutfits(): Signal<Outfit[]> {

    return this.outfitSignal.asReadonly();
  }
}
