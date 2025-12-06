import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',
    loadChildren:() => import('./auth/auth.module').then(m => m.AuthModule)

   },
   {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'user',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'restraurent',
    loadChildren: () => import('./manage-restraurent/manage-restraurent.module').then(m => m.ManageRestraurentModule)
  },
  {
    path: 'partner',
    loadChildren: () => import('./manage-delivery-partners/manage-delivery-partners.module').then(m => m.ManageDeliveryPartnersModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./ordermanagement/ordermanagement.module')
      .then(m => m.OrdermanagementModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./productmanagement/productmanagement.module')
      .then(m => m.ProductmanagementModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./productmanagement/productmanagement.module')
      .then(m => m.ProductmanagementModule)
  },

];
