import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AdminComponent } from './components/admin/admin.component';
import { ProductsComponent } from './components/admin/products/products.component';
import { ProductsComponent as UserProductsComponent } from './components/products/products.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'products', component: UserProductsComponent },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'products',
        children: [
          { path: '', component: ProductsComponent }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 