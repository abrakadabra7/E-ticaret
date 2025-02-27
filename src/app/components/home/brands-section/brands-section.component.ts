import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface Brand {
  id: number;
  name: string;
  logo: string;
  productCount: number;
  rating: number;
  category: string;
  isPremium: boolean;
}

@Component({
  selector: 'app-brands-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brands-section.component.html',
  styleUrls: ['./brands-section.component.css']
})
export class BrandsSectionComponent implements OnInit {
  brands: Brand[] = [
    {
      id: 1,
      name: 'Apple',
      logo: '/assets/brands/apple.png',
      productCount: 150,
      rating: 4.8,
      category: 'Teknoloji',
      isPremium: true
    },
    {
      id: 2,
      name: 'Samsung',
      logo: '/assets/brands/samsung.jpeg',
      productCount: 200,
      rating: 4.7,
      category: 'Teknoloji',
      isPremium: true
    },
    {
      id: 3,
      name: 'Nike',
      logo: '/assets/brands/nike.png',
      productCount: 300,
      rating: 4.9,
      category: 'Spor',
      isPremium: true
    },
    {
      id: 4,
      name: 'Adidas',
      logo: '/assets/brands/adidas.png',
      productCount: 250,
      rating: 4.6,
      category: 'Spor',
      isPremium: false
    },
    {
      id: 5,
      name: 'Sony',
      logo: '/assets/brands/sony.png',
      productCount: 180,
      rating: 4.5,
      category: 'Teknoloji',
      isPremium: false
    }
  ];

  categories: string[] = ['Tümü', 'Teknoloji', 'Spor', 'Moda', 'Ev & Yaşam', 'Kozmetik'];
  selectedCategory: string = 'Tümü';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  get premiumBrands(): Brand[] {
    return this.brands.filter(brand => brand.isPremium);
  }

  get filteredBrands(): Brand[] {
    return this.brands.filter(brand => 
      !brand.isPremium && 
      (this.selectedCategory === 'Tümü' || brand.category === this.selectedCategory)
    );
  }

  filterBrands(category: string): void {
    this.selectedCategory = category;
  }

  navigateToBrand(brandId: number): void {
    this.router.navigate(['/brand', brandId]);
  }

  getRatingStars(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }
}
