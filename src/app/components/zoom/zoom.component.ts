import { Component, input, output } from '@angular/core';
import { CanvasComponent } from '@components/canvas/canvas.component';

@Component({
  selector: 'app-zoom',
  imports: [],
  templateUrl: './zoom.component.html',
  styleUrl: './zoom.component.scss'
})
export class ZoomComponent {

  canvas = input.required<CanvasComponent>();

  zoomIn() {

    this.canvas().zoomIn();
  }

  zoomOut() {

    this.canvas().zoomOut();
  }

  reset() {

    this.canvas().reset();
  }
}
