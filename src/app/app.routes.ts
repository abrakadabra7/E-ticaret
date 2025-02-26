import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProductsComponent } from './components/admin/products/products.component';
import { ProductsComponent as UserProductsComponent } from './components/products/products.component';
import { CategoriesComponent } from './components/admin/categories/categories.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'products', component: UserProductsComponent },
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
