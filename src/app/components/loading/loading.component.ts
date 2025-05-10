import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LoadingService } from '@services/loading/loading.service';

@Component({
  selector: 'app-loading',
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {

  loadingStatus: Signal<boolean>;

  constructor(private loadingService: LoadingService) {

    this.loadingStatus = this.loadingService.getLoadingStatus();
  }
}
