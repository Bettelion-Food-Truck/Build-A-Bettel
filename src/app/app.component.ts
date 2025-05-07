import { Component } from '@angular/core';

import { CanvasComponent } from "./components/canvas/canvas.component";

import { PartsComponent } from "./components/parts/parts.component";
import { ItemsComponent } from "./components/items/items.component";

import { MovementComponent } from './components/movement/movement.component';
import { PaletteComponent } from "./components/palette/palette.component";
import { OutfitsComponent } from "./components/outfits/outfits.component";

@Component({
  selector: 'app-root',
  imports: [
    CanvasComponent,
    PartsComponent,
    ItemsComponent,
    MovementComponent,
    PaletteComponent,
    OutfitsComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Build-A-Bettel';
}
