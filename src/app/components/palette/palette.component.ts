import { ChangeDetectionStrategy, Component, effect, signal, Signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { Part } from '@models/part.model';

import { LogService } from '@services/log/log.service';
import { AssetDataService } from '@services/asset-data/asset-data.service';
import { ModelDataService } from '@services/model-data/model-data.service';

@Component({
  selector: 'app-palette',
  imports: [
    CommonModule,
    MatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './palette.component.html',
  styleUrl: './palette.component.scss'
})
export class PaletteComponent {

  activePart: WritableSignal<Part | null> = signal(null);

  constructor(
    private logger: LogService,
    private assetData: AssetDataService,
    private modelData: ModelDataService
  ) {

    effect(() => {
      this.logger.debug('PaletteComponent: effect() - Change active part');

      const selectedPart: Signal<number> = this.modelData.getActivePart();

      if (selectedPart() === undefined || selectedPart() < 0) {
        return;
      }

      this.activePart.set(this.assetData.getPart(selectedPart()));
    });
  }

  selectColor(color: string) {
    this.logger.warn('PaletteComponent: selectColor()', color);
  }

  /**
   * Validates hex color as 3 or 6 digit version.
   *
   * @param hexColor
   * @returns boolean
   */
  isValidColor(hexColor: string): boolean {

    return /^#([0-9A-F]{3}){1,2}$/i.test(hexColor);
  }
}
