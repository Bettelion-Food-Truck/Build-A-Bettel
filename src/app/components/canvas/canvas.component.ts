import { AfterViewInit, Component, ElementRef, input, Signal, viewChild } from '@angular/core';

import Panzoom, { PanzoomObject } from '@panzoom/panzoom'

@Component({
  selector: 'app-canvas',
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss'
})
export class CanvasComponent implements AfterViewInit {

  panzoom: PanzoomObject | null = null;

  canvas = viewChild.required<ElementRef>('canvas');

  ngAfterViewInit() {

    this.initPanZoom(this.canvas().nativeElement);
  }

  getCanvas(): Signal<ElementRef> {

    return this.canvas;
  }

  /**
   * Sets up and binds elements for use with the PanZoom
   */
  private initPanZoom(element: HTMLElement) {

    if (!element) {

      return;
    }

    this.panzoom = Panzoom(element, {
      maxScale: 3,
      minScale: 1,
      panOnlyWhenZoomed: true,
    });

    element.parentElement?.addEventListener('wheel', this.panzoom.zoomWithWheel);

    // Forces canvas back into center of view on no zoom to help with view reset
    element.addEventListener('panzoomchange', this.checkAndReset.bind(this));
  }

  private checkAndReset() {

    if (this.panzoom?.getScale() === 1) {

      this.panzoom.reset();
    }
  }

  public zoomIn() {

    this.panzoom?.zoomIn();
  }

  public zoomOut() {

    this.panzoom?.zoomOut();
  }

  public reset() {

    this.panzoom?.reset();
  }
}
