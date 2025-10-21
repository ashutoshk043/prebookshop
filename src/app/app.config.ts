import { ApplicationConfig,importProvidersFrom, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideApollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache } from '@apollo/client/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
export const appConfig: ApplicationConfig = {
  
  providers: [
    provideRouter(routes),
    provideHttpClient(),
     importProvidersFrom(
      BrowserAnimationsModule
    ),
    provideApollo(() => {
      const httpLink = inject(HttpLink);
      return {
        link: httpLink.create({
          uri: 'http://localhost:3000/graphql',
          withCredentials: true,
        }),
        cache: new InMemoryCache(),
      };
    }),
    // provideApollo(() => {
    //   const httpLink = inject(HttpLink);

    //   return {
    //     link: httpLink.create({
    //       uri: 'http://localhost:3000/graphql', // Gateway URL
    //       withCredentials: true, // if you use auth tokens/cookies
    //     }),
    //     cache: new InMemoryCache(),
    //   };
    // }),
  ],
};
