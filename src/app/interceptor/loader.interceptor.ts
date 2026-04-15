import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoaderService } from '../interceptor/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {

  const loader = inject(LoaderService);

  // 👉 Skip loader for specific requests
  if (req.headers.get('skip-loader')) {
    return next(req);
  }

  // 👉 Show loader
  loader.show();

  return next(req).pipe(
    finalize(() => {
      loader.hide();
    })
  );
};