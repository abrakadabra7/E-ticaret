import { Component } from '@angular/core';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { CategoriesSectionComponent } from './categories-section/categories-section.component';
import { FeaturedProductsComponent } from './featured-products/featured-products.component';
import { CampaignsSectionComponent } from './campaigns-section/campaigns-section.component';
import { BrandsSectionComponent } from './brands-section/brands-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroSectionComponent,
    CategoriesSectionComponent,
    FeaturedProductsComponent,
    CampaignsSectionComponent,
    BrandsSectionComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}
