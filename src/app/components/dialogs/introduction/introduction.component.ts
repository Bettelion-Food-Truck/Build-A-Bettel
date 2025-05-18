
import { Component, inject } from '@angular/core';

import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButton } from '@angular/material/button';

import { DialogType } from '@components/dialogs/dialogs.enum';

@Component({
  selector: 'app-safe-to-stream',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatCardModule
  ],
  templateUrl: './introduction.component.html',
  styleUrl: './introduction.component.scss'
})
export class IntroductionComponent {
  readonly dialogRef = inject(MatDialogRef<IntroductionComponent>);

  readonly types = DialogType;

  email(event: Event) {

    window.open('mailto:BettelionFoodTruck@gmail.com?subject=Build-A-Bettel', 'mail');

    event.preventDefault();
  }
}
