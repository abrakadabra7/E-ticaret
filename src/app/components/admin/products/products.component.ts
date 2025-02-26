import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { AddProductModalComponent } from './add-product-modal/add-product-modal.component';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule, AddProductModalComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  isAddModalOpen = false;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    await Promise.all([
      this.loadProducts(),
      this.loadCategories()
    ]);
  }

  async loadProducts() {
    try {
      this.products = await this.productService.getProducts();
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
    }
  }

  async loadCategories() {
    try {
      this.categories = await this.categoryService.getCategories();
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  }

  openAddModal() {
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
  }

  async onSaveProduct(productData: Partial<Product>) {
    try {
      console.log('Ürün kaydetme başladı:', productData);
      const savedProduct = await this.productService.addProduct(productData);
      console.log('Ürün başarıyla kaydedildi:', savedProduct);
      await this.loadProducts();
      this.closeAddModal();
    } catch (error) {
      console.error('Ürün kaydedilirken hata:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ürün kaydedilirken bir hata oluştu';
      alert(errorMessage);
    }
  }

  async deleteProduct(id: string) {
    if (confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        await this.productService.deleteProduct(id);
        await this.loadProducts();
      } catch (error) {
        console.error('Ürün silinirken hata:', error);
      }
    }
  }
} 