import { computed, Injectable, signal, Signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  private pendingRequests: WritableSignal<number> = signal(0);
  private loadingStatus: Signal<boolean> = computed(() => this.pendingRequests() > 0);

  getLoadingStatus(): Signal<boolean> {
    return this.loadingStatus;
  }

  addLoadingItem() {
    this.pendingRequests.update((count: number) => count + 1);
  }

  removeLoadingItem() {
    this.pendingRequests.update((count: number) => {
      count--;
      if (count < 0) {
        count = 0;
      }

      return count;
    });
  }
}
