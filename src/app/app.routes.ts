import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },
      {
        path: 'products',
        loadComponent: () => import('./components/admin/products/products.component').then(m => m.ProductsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/admin/categories/categories.component').then(m => m.CategoriesComponent)
      }
    ]
  },
  // Catch-all route for 404
  { path: '**', redirectTo: '' }
];
