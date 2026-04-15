import { ApplicationConfig, importProvidersFrom, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, from, FetchResult, Observable } from '@apollo/client/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { environment } from '../environments/environment';
import { loaderInterceptor } from './interceptor/loader.interceptor';
import { provideSweetAlert2 } from '@sweetalert2/ngx-sweetalert2';

const GRAPHQL_URL = environment.graphQlApiUrl;

// Public operations that don't require authentication
const PUBLIC_OPERATIONS = ['loginRestraurent', 'restaurentRefreshToken'];

// Auth Link
const authLink = setContext((operation, prevContext) => {
  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token');

  const operationName = operation.operationName ?? '';
  const isPublic = PUBLIC_OPERATIONS.includes(operationName);

  if (isPublic) {
    return { headers: {} };
  }

  return {
    headers: {
      ...prevContext['headers'],
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Refresh state and queue
let isRefreshing = false;
let failedQueue: Array<{
  observer: any;
  operation: any;
  forward: any;
}> = [];

// Global logout handler
let globalLogoutFn: ((message?: string) => void) | null = null;

export function registerLogoutHandler(logoutFn: (message?: string) => void) {
  globalLogoutFn = logoutFn;
  console.log('✅ Logout handler registered');
}

// Force logout function - CLEARS EVERYTHING
const forceLogout = (message: string = 'Session expired. Please login again.') => {
  console.error('🚪 FORCE LOGOUT:', message);
  
  // Clear all storage
  localStorage.clear();
  sessionStorage.clear();
  
  // Call registered logout handler
  if (globalLogoutFn) {
    globalLogoutFn(message);
  } else {
    // Fallback: dispatch custom event
    window.dispatchEvent(new CustomEvent('sessionExpired', { detail: { message } }));
  }
};

// Process queued requests
const processQueue = (error: any = null, token: string | null = null) => {
  console.log(`📦 Processing ${failedQueue.length} queued requests`);
  
  failedQueue.forEach(request => {
    if (error) {
      request.observer.error(error);
    } else if (token) {
      const oldContext = request.operation.getContext();
      const newHeaders = {
        ...oldContext.headers,
        Authorization: `Bearer ${token}`,
      };
      request.operation.setContext({ headers: newHeaders, skipAuthRefresh: true });
      request.forward(request.operation).subscribe(request.observer);
    }
  });
  
  failedQueue = [];
};

// Handle refresh token
function handleRefreshToken(operation: any, forward: any) {
  const refreshToken =
    localStorage.getItem('refresh_token') ||
    sessionStorage.getItem('refresh_token');

  console.log('🔄 Attempting token refresh...');

  if (!refreshToken) {
    console.error('❌ No refresh token - forcing logout');
    forceLogout('No refresh token available');
    return;
  }

  return new Observable<FetchResult>((observer) => {
    // If already refreshing, queue this request
    if (isRefreshing) {
      console.log('⏳ Refresh in progress, queuing request...');
      failedQueue.push({ observer, operation, forward });
      return;
    }

    isRefreshing = true;
    console.log('🔄 Calling refresh mutation...');

    fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operationName: 'restaurentRefreshToken',
        query: `
          mutation restaurentRefreshToken($refreshToken: String!) {
            restaurentRefreshToken(refreshToken: $refreshToken) {
              accessToken
              refreshToken
            }
          }
        `,
        variables: { refreshToken },
      }),
    })
      .then(res => res.json())
      .then(res => {
        console.log('📦 Refresh response:', res);
        
        // Check for GraphQL errors
        if (res?.errors) {
          const errorMsg = res.errors[0]?.message || '';
          console.error('❌ Refresh mutation error:', errorMsg);
          
          // Check if refresh token is expired/invalid
          if (errorMsg.includes('expired') || errorMsg.includes('Invalid')) {
            console.error('💀 Refresh token is expired or invalid');
            throw new Error('REFRESH_TOKEN_EXPIRED');
          }
          throw new Error(errorMsg);
        }
        
        const data = res?.data?.restaurentRefreshToken;

        if (!data?.accessToken) {
          throw new Error('No access token in response');
        }

        const storage = localStorage.getItem('refresh_token')
          ? localStorage
          : sessionStorage;

        // Save new tokens
        storage.setItem('access_token', data.accessToken);
        console.log('✅ New access token saved');
        
        if (data.refreshToken) {
          storage.setItem('refresh_token', data.refreshToken);
          console.log('✅ New refresh token saved');
        }

        // Process queued requests
        processQueue(null, data.accessToken);

        // Retry current operation
        const newHeaders = {
          ...operation.getContext().headers,
          Authorization: `Bearer ${data.accessToken}`,
        };
        operation.setContext({ headers: newHeaders, skipAuthRefresh: true });

        console.log('🔁 Retrying original operation with new token');
        forward(operation).subscribe(observer);
      })
      .catch(err => {
        console.error('🚨 Token refresh failed:', err.message);
        
        // Process queue with error
        processQueue(err, null);
        
        // ✅ FORCE LOGOUT ON REFRESH FAILURE
        if (err.message === 'REFRESH_TOKEN_EXPIRED') {
          forceLogout('Your session has expired. Please login again.');
        } else {
          forceLogout('Authentication failed. Please login again.');
        }
        
        observer.error(err);
      })
      .finally(() => {
        isRefreshing = false;
      });
  });
}

// Error Link
export const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const context = operation.getContext() as { skipAuthRefresh?: boolean };
  
  // Skip if already retried
  if (context?.skipAuthRefresh) {
    console.log('⏭️ Skipping auth refresh (already retried)');
    return;
  }
  
  // Skip public operations
  if (PUBLIC_OPERATIONS.includes(operation.operationName || '')) {
    return;
  }

  // Handle GraphQL errors
  if (graphQLErrors && graphQLErrors.length > 0) {
    const authError = graphQLErrors.find(
      (err) => err.extensions?.['code'] === 'UNAUTHENTICATED'
    );

    if (authError) {
      console.log(`⚠️ Auth error for ${operation.operationName}, attempting refresh...`);
      return handleRefreshToken(operation, forward);
    }
  }

  // Handle network errors (401 Unauthorized)
  if (networkError) {
    console.error('[Network error]:', networkError);
    
    // Check if it's a 401 error
    const isUnauthorized = (networkError as any)?.statusCode === 401 || 
                          (networkError as any)?.status === 401 ||
                          (networkError as any)?.message?.includes('401');
    
    if (isUnauthorized) {
      console.log('⚠️ 401 Unauthorized error, attempting refresh...');
      return handleRefreshToken(operation, forward);
    }
    
    // For other network errors, dispatch event but don't logout
    window.dispatchEvent(new CustomEvent('networkError', { 
      detail: { error: networkError } 
    }));
  }

  return;
});

// App Config
export const appConfig: ApplicationConfig = {
  providers: [
        provideSweetAlert2(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loaderInterceptor])),
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
        uri: GRAPHQL_URL,
      });
      
      return {
        link: from([errorLink, authLink, httpLink]),
        cache: new InMemoryCache(),
      };
    }),
  ],
};