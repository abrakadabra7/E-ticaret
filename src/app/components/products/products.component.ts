import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

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
  isLoading = true;
  error: string | null = null;
  searchTerm = '';
  sortOption = 'default';

  constructor(private productService: ProductService) {}

  async ngOnInit() {
    try {
      this.products = await this.productService.getProducts();
      this.filteredProducts = [...this.products];
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      this.error = 'Ürünler yüklenirken bir hata oluştu';
    } finally {
      this.isLoading = false;
    }
  }

  filterProducts() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const search = this.searchTerm.toLowerCase().trim();
      this.filteredProducts = this.products.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search)
      );
    }
    this.sortProducts();
  }

  sortProducts() {
    switch (this.sortOption) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        this.filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        this.filteredProducts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  }

  calculateDiscount(product: Product): number {
    if (product.original_price && product.price) {
      return ((product.original_price - product.price) / product.original_price) * 100;
    }
    return 0;
  }

  addToCart(product: Product) {
    // TODO: Sepete ekleme işlemi burada yapılacak
    console.log('Ürün sepete eklendi:', product);
  }
} 