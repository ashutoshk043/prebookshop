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

const PUBLIC_OPERATIONS = ['loginRestraurent', 'RefreshToken'];


// 🔐 Auth Link (access token → Authorization header)
const authLink = setContext((operation, prevContext) => {
  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token');

  // 👇 ensure string
  const operationName = operation.operationName ?? '';

  const isPublic = PUBLIC_OPERATIONS.includes(operationName);

  if (isPublic) {
    console.log('🟢 Public operation:', operationName);
    return { headers: {} };
  }

  return {
    headers: {
      ...prevContext['headers'],
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    // 1. Pehle check karein ki kya koi UNAUTHENTICATED error hai
    const authError = graphQLErrors.find(
      (err) => err.extensions?.['code'] === 'UNAUTHENTICATED' && operation.operationName !== 'refreshToken'
    );

    // 2. Agar error hai, toh handleRefreshToken ka Observable YAHAN se return karein
    if (authError) {
      console.log('🔄 Auth error detected, calling handleRefreshToken...');
      return handleRefreshToken(operation, forward);
    }
  }

  if (networkError) {
    console.error(`[Network error]:`, networkError);
  }

  // Agar koi auth error nahi hai, toh function yahan se exit karega
  return; 
});


// Helper function to keep code clean
function handleRefreshToken(operation: any, forward: any) {
  const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

  if (!refreshToken) {
    console.error('❌ No Refresh Token found in storage');
    localStorage.clear();
    sessionStorage.clear();
    return;
  }

  return new Observable<FetchResult>((observer) => {
    fetch('http://localhost:8080/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operationName: 'refreshToken',
        query: `mutation refreshToken($refreshToken: String!) { refreshToken(refreshToken: $refreshToken) { accessToken refreshToken } }`,
        variables: { refreshToken },
      }),
    })
      .then(res => res.json())
      .then(res => {
        const data = res?.data?.refreshToken;
        
        if (!data?.accessToken) {
          throw new Error('Refresh failed - Access Token missing in response');
        }

        // // 🔥 Yahan tokens update ho rahe hain aur console lagega
        // console.log('✅ New Tokens Generated Successfully!');
        // console.log('🔑 New Access Token (Preview):', data.accessToken.substring(0, 15) + '...');
        
        // Storage update karein
        const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
        storage.setItem('access_token', data.accessToken);
        
        if (data.refreshToken) {
          console.log('🔁 Refresh Token also rotated/updated');
          storage.setItem('refresh_token', data.refreshToken);
        }

        // Original request retry setup
        operation.setContext(({ headers = {} }) => ({
          headers: { 
            ...headers, 
            Authorization: `Bearer ${data.accessToken}` 
          },
        }));

        console.log('🔄 Retrying original operation:', operation.operationName);

        const subscriber = forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: (err:any) => {
            console.error('❌ Retry failed:', err);
            observer.error(err);
          },
          complete: observer.complete.bind(observer),
        });
        
        return () => subscriber.unsubscribe();
      })
      .catch(err => {
        console.error('🚨 Critical Refresh Error:', err);
        localStorage.clear();
        sessionStorage.clear();
        // window.location.href = '/';
        observer.error(err);
      });
  });
}

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
        link: from([errorLink, authLink, httpLink]), // ✅ Correct Chain
        cache: new InMemoryCache(),
      };

    }),
  ],
};
