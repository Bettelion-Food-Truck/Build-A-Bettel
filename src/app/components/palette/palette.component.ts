import { ChangeDetectionStrategy, Component, effect, ElementRef, signal, Signal, viewChild, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

import { MatIconModule } from '@angular/material/icon';

import { Color, Part } from '@models/part.model';

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
  styleUrl: './palette.component.scss',
  animations: [
    trigger(
      'enterExitTrigger', [
      transition(':enter', [
        style({
          opacity: 0,
          width: 0
        }),
        animate(
          '50ms',
          style({
            opacity: 1,
            width: '36px'
          })
        )
      ]),
      transition(':leave', [
        animate(
          '50ms',
          style({
            opacity: 0,
            width: 0
          })
        )
      ])
    ])
  ]
})
export class PaletteComponent {

  container = viewChild.required<ElementRef>('colormenu');

  activePartIndex: Signal<number>;
  activePart: WritableSignal<Part | null> = signal(null);

  itemColors: Signal<string[]>;

  constructor(
    private logger: LogService,
    private assetData: AssetDataService,
    private modelData: ModelDataService
  ) {

    this.activePartIndex = this.modelData.getActivePart();
    this.itemColors = this.modelData.getItemColors();

    effect(() => {
      this.logger.debug('PaletteComponent: effect() - Change active part');

      const selectedPart: Signal<number> = this.modelData.getActivePart();

      if (selectedPart() === undefined || selectedPart() < 0) {
        return;
      }

      this.activePart.set(this.assetData.getPart(selectedPart()));
    });
  }

  onScroll(e: WheelEvent) {

    if (window.matchMedia("(orientation: portrait)").matches) {
      return;
    }

    if (Math.abs(e.deltaY) > 0) {

      e.preventDefault();

      this.container().nativeElement.scrollLeft += e.deltaY;
    }
  }

  selectColor(color: Color = {} as Color) {
    this.logger.debug('PaletteComponent: selectColor()', color);

    const colorString: string = this.getColorString(color);

    let itemIndexs: number[] = [this.modelData.getActivePart()()];

    if (this.activePart()?.colorLinked && this.activePart()!.colorLinked.length > 0) {

      this.activePart()!.colorLinked.forEach((partName: string) => {

        const partId: number = this.assetData.getPartIdByName(partName);

        if (partId >= 0) {

          itemIndexs.push(partId);
        }
      });
    }

    this.modelData.setItemsColor(itemIndexs, colorString);
  }

  isColorSelected(color: Color): boolean {

    if (this.itemColors() && this.itemColors()[this.activePartIndex()]) {

      return this.getColorString(color) === this.itemColors()[this.activePartIndex()];
    }

    return false;
  }

  private getColorString(color: Color): string {

    let colorString: string = "";

    if (color.hex) {

      const transparency: string = Math.floor((color.transparency || 1) * 255).toString(16);
      const hex: string = color.hex || '000000';
      colorString = `#${hex}${transparency}`;
    }

    return colorString;
  }
}
