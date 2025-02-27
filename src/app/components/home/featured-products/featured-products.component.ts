import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { FavoriteService } from '../../../services/favorite.service';
import { CartService } from '../../../services/cart.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-featured-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './featured-products.component.html',
  styleUrl: './featured-products.component.css'
})
export class FeaturedProductsComponent implements OnInit {
  featuredProducts: Product[] = [];
  isLoading = true;
  error: string | null = null;
  addingToCart: { [key: string]: boolean } = {};

  constructor(
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  async loadFeaturedProducts(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      // En çok favoriye eklenen ve en çok satılan ürünleri getir
      const products = await this.productService.getFeaturedProducts();
      this.featuredProducts = products.slice(0, 8); // İlk 8 ürünü göster
    } catch (error) {
      this.error = 'Öne çıkan ürünler yüklenirken bir hata oluştu.';
      console.error('Featured products error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoriteService.isFavorite(productId);
  }

  async toggleFavorite(event: Event, product: Product): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    
    try {
      if (this.isFavorite(product.id)) {
        await this.favoriteService.removeFromFavorites(product.id);
      } else {
        await this.favoriteService.addToFavorites(product.id);
      }
    } catch (error) {
      console.error('Favori işlemi sırasında hata:', error);
    }
  }

  calculateDiscount(product: Product): number {
    if (!product.original_price || !product.price) return 0;
    return ((product.original_price - product.price) / product.original_price) * 100;
  }

  async addToCart(product: Product): Promise<void> {
    try {
      this.addingToCart[product.id] = true;
      await this.cartService.addToCart(product, 1);
    } finally {
      this.addingToCart[product.id] = false;
    }
  }
}
