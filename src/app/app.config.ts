import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { Apollo, provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink, from, FetchResult, Observable } from '@apollo/client/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { REFRESH_TOKEN_MUTATION } from './graphql/authManagement/login.mutation';

// 🔐 Auth Link (access token → Authorization header)
const authLink = setContext(() => {
  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token');

  console.log('🧪 authLink token:', token);

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});


export const errorLink = onError((errorResponse) => {
  const { graphQLErrors, operation, forward } = errorResponse;

  if (!graphQLErrors || graphQLErrors.length === 0) {
    return;
  }

  for (const err of graphQLErrors) {
    const code = err.extensions?.['code'];

    if (code === 'UNAUTHENTICATED') {
      console.log('🔁 Access token expired');

      const refreshToken =
        localStorage.getItem('refresh_token') ||
        sessionStorage.getItem('refresh_token');

      if (!refreshToken) {
        console.log('❌ No refresh token → logout');
        localStorage.clear();
        sessionStorage.clear();
        return;
      }

      const apollo = inject(Apollo);

      // ✅ Apollo Link expects zen-observable
      return new Observable<FetchResult>((observer) => {
        apollo.mutate({
          mutation: REFRESH_TOKEN_MUTATION,
          variables: { refreshToken },
          fetchPolicy: 'no-cache',
        }).subscribe({
          next: (res: any) => {
            const newAccessToken =
              res?.data?.refreshToken?.accessToken;

            if (!newAccessToken) {
              observer.error('Refresh failed');
              return;
            }

            console.log('✅ New Access Token:', newAccessToken);

            // 🔐 Save new token
            localStorage.setItem('access_token', newAccessToken);

            // 🔁 Retry original operation
            operation.setContext({
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
            });

            forward(operation).subscribe({
              next: (result) => observer.next(result),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });
          },
          error: (err) => {
            console.log('❌ Refresh token invalid → logout');
            localStorage.clear();
            sessionStorage.clear();
            observer.error(err);
          },
        });
      });
    }
  }

  return;
});



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    importProvidersFrom(
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 1000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
      })
    ),

    provideApollo(() => {
      const httpLink = inject(HttpLink).create({
        uri: 'http://localhost:8080/graphql',
      });

     return {
        link: from([
          errorLink, // 🔥 FIRST (refresh logic)
          authLink,  // 🔐 SECOND (attach token)
          httpLink,  // 🌐 LAST (send request)
        ]),
        cache: new InMemoryCache(),
      };

    }),
  ],
};
