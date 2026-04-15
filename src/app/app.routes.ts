import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)

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
    path: 'categories',
    loadChildren: () => import('./categorymanagement/categorymanagement.module').then(m => m.CategorymanagementModule)
  },
  {
    path: 'ingredients',
    loadChildren: () => import('./ingredientmanagement/ingredientmanagement.module').then(m => m.IngredientmanagementModule)
  },
  {
    path: 'ingredient-varient-recipe',
    loadChildren: () => import('./ingredient-varient-recipe/ingredient-varient-recipe.module').then(m => m.IngredientVarientRecipeModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reportmanagement/reportmanagement.module').then(m => m.ReportmanagementModule)
  },
  {
    path: 'varients',
    loadChildren: () => import('./varientmanagement/varientmanagement.module').then(m => m.VarientmanagementModule)
  },
  {
    path: 'restaurant-variant-price',
    loadChildren: () => import('./restaurent-varient-price/restaurent-varient-price.module').then(m => m.RestaurentVarientPriceModule)
  },
  {
    path: 'restaurant-ingredient-stock',
    loadChildren: () => import('./restaurant-ingredients-stock/restaurant-ingredients-stock.module').then(m => m.RestaurantIngredientsStockModule)
  },
  {
    path: 'product-variants',
    loadChildren: () => import('./globalproductvarients/globalproductvarients.module').then(m => m.GlobalproductvarientsModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule)
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
    path: 'coupons',
    loadChildren: () => import('./coupons/coupons.module')
      .then(m => m.CouponsModule)
  },
  {
    path: 'offers',
    loadChildren: () => import('./offers/offers.module')
      .then(m => m.OffersModule)
  },
  {
    path: 'stock-logs',
    loadChildren: () => import('./stock-logs/stock-logs.module')
      .then(m => m.StockLogsModule)
  },
  {
    path:'images',
    loadChildren:()=> import('./images/images.module').then(m=>m.ImagesModule)
  }

];
