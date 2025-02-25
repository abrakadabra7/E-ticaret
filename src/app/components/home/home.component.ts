import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from './hero-section/hero-section.component';
import { FeaturedProductsComponent } from './featured-products/featured-products.component';
import { CategoriesSectionComponent } from './categories-section/categories-section.component';
import { CampaignsSectionComponent } from './campaigns-section/campaigns-section.component';
import { BrandsSectionComponent } from './brands-section/brands-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    HeroSectionComponent,
    FeaturedProductsComponent,
    CategoriesSectionComponent,
    CampaignsSectionComponent,
    BrandsSectionComponent
  ],
  template: `
    <div class="home-container">
      <app-hero-section></app-hero-section>
      <app-featured-products></app-featured-products>
      <app-categories-section></app-categories-section>
      <app-campaigns-section></app-campaigns-section>
      <app-brands-section></app-brands-section>

    </div>
  `
})
export class HomeComponent {}
