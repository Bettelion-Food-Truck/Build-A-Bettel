import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CanvasComponent } from "./components/canvas/canvas.component";

import { PartsComponent } from "./components/parts/parts.component";
import { ItemsComponent } from "./components/items/items.component";

import { MovementComponent } from './components/movement/movement.component';
import { PaletteComponent } from "./components/palette/palette.component";
import { OutfitsComponent } from "./components/outfits/outfits.component";

import { InfoComponent } from './components/info/info.component';

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

  readonly dialog = inject(MatDialog);

  showCredits() {
    this.dialog.open(InfoComponent);
  }
}
