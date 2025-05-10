import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '@services/loading/loading.service';
import { finalize } from 'rxjs';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {

  // TODO Get loading intercetptor to work with HTTP requests automatically

  const loadingService = inject(LoadingService);

  loadingService.addLoadingItem();

  return next(req).pipe(
    finalize(() => {

      loadingService.removeLoadingItem();
    })
  );
};