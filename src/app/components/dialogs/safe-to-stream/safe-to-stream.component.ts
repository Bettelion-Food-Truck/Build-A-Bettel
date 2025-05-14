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
  templateUrl: './safe-to-stream.component.html',
  styleUrl: './safe-to-stream.component.scss'
})
export class SafeToStreamComponent {
  readonly dialogRef = inject(MatDialogRef<SafeToStreamComponent>);

  readonly types = DialogType;
}
