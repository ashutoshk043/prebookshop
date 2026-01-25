import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable, catchError, switchMap, throwError, filter, take, map } from 'rxjs';
import { REFRESH_TOKEN_MUTATION } from '../../graphql/authManagement/login.mutation';
import { TokenService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenService: TokenService,
    private apollo: Apollo
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const accessToken = this.tokenService.getAccessToken();

    // 1️⃣ Attach access token
    let authReq = req;
    if (accessToken) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }

    return next.handle(authReq).pipe(
      catchError(error => {

        // 🔴 LOG original error
        console.warn('⛔ API Error:', error.status);

        // 2️⃣ Token expired → refresh
        if (error.status === 401 && !this.isRefreshing) {

          console.log('🔄 Access token expired. Refreshing token...');
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);

          return this.refreshAccessToken().pipe(
            switchMap((newToken: string) => {

              console.log('✅ NEW ACCESS TOKEN RECEIVED:', newToken);

              this.isRefreshing = false;
              this.tokenService.setAccessToken(newToken);
              this.refreshTokenSubject.next(newToken);

              // 🔁 Retry original request with new token
              return next.handle(
                authReq.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`,
                  },
                })
              );
            }),
            catchError(err => {
              console.error('❌ Refresh token failed:', err);
              this.isRefreshing = false;
              this.tokenService.clear();
              return throwError(() => err);
            })
          );
        }

        // 3️⃣ Multiple requests wait for refresh
        if (error.status === 401 && this.isRefreshing) {
          console.log('⏳ Waiting for refresh token...');
          return this.refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
              console.log('🔁 Retrying request with refreshed token');
              return next.handle(
                authReq.clone({
                  setHeaders: {
                    Authorization: `Bearer ${token}`,
                  },
                })
              );
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

  // 🔁 Refresh API call
  refreshAccessToken(): Observable<string> {

    const refreshToken = this.tokenService.getRefreshToken();
    console.log('🧪 Using refresh token:', refreshToken);

    return this.apollo.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { refreshToken },
      fetchPolicy: 'no-cache',
    }).pipe(
      map((res: any) => {
        const newAccessToken = res?.data?.refreshToken?.accessToken;
        console.log('🎯 Refresh mutation response token:', newAccessToken);
        return newAccessToken;
      })
    );
  }
}

