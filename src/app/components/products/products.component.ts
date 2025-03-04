import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { CartService } from '../../services/cart.service';
import { FavoriteService } from '../../services/favorite.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  selectedCategory: string = '';
  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  sortOption = 'default';
  categorySlug: string | null = null;
  addingToCart: { [key: string]: boolean } = {};

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private favoriteService: FavoriteService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    try {
      // URL'den kategori slug'ını al
      this.route.params.subscribe(async params => {
        this.categorySlug = params['slug'];
        await this.loadCategories();
        await this.loadProducts();
      });
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      this.error = 'Veriler yüklenirken bir hata oluştu';
    } finally {
      this.isLoading = false;
    }
  }

  async loadProducts() {
    try {
      this.products = await this.productService.getProducts();
      this.filterProducts();
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      throw error;
    }
  }

  async loadCategories() {
    try {
      this.categories = await this.categoryService.getCategories();
      if (this.categorySlug) {
        const category = this.categories.find(c => c.slug === this.categorySlug);
        if (category) {
          this.selectedCategory = category.id;
        }
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      throw error;
    }
  }

  filterProducts() {
    let filtered = [...this.products];

    // URL'den gelen kategori varsa ona göre filtrele
    if (this.categorySlug) {
      const category = this.categories.find(c => c.slug === this.categorySlug);
      if (category) {
        filtered = filtered.filter(product => product.category_id === category.id);
      }
    }
    // Yoksa seçili kategoriye göre filtrele
    else if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category_id === this.selectedCategory);
    }

    // Arama filtresi
    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      );
    }

    // Sıralama
    switch (this.sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    this.filteredProducts = filtered;
  }

  calculateDiscount(product: Product): number {
    if (product.original_price && product.price) {
      return ((product.original_price - product.price) / product.original_price) * 100;
    }
    return 0;
  }

  async addToCart(product: Product) {
    if (this.addingToCart[product.id]) return;

    try {
      this.addingToCart[product.id] = true;
      this.cartService.addToCart(product, 1);
      alert('Ürün sepete eklendi!');
    } catch (error) {
      console.error('Sepete eklenirken hata:', error);
      alert('Ürün sepete eklenirken bir hata oluştu!');
    } finally {
      this.addingToCart[product.id] = false;
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoriteService.isFavorite(productId);
  }

  async toggleFavorite(event: Event, product: Product) {
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
} 