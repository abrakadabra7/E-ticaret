import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProductsComponent } from './components/admin/products/products.component';
import { ProductsComponent as UserProductsComponent } from './components/products/products.component';
import { CategoriesComponent } from './components/admin/categories/categories.component';
import { ProductDetailComponent } from './components/products/product-detail/product-detail.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrdersComponent } from './components/orders/orders.component';
import { MyProfileComponent } from './components/my-profile/my-profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'products', component: UserProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'orders/:id', component: OrdersComponent },
  { path: 'profile', component: MyProfileComponent },
  { path: 'category/:slug', component: UserProductsComponent },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'products',
        children: [
          { path: '', component: ProductsComponent }
        ]
      },
      {
        path: 'categories',
        children: [
          { path: '', component: CategoriesComponent }
        ]
      }
    ]
  },
  // Catch-all route for 404
  { path: '**', redirectTo: '' }
];
