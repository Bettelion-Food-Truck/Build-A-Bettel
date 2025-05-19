import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from '@intercetors/loading-interceptor/loading.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withFetch(),
      withInterceptors(
        [
          loadingInterceptor
        ]
      )
    ),
    provideAnimationsAsync()
  ]
};
