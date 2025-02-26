import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../models/product.model';
import { Category } from '../../../models/category.model';
import { AddProductModalComponent } from './add-product-modal/add-product-modal.component';

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

  ngOnInit() {
    // TODO: Ürünleri ve kategorileri yükle
  }

  openAddModal() {
    this.isAddModalOpen = true;
  }

  closeAddModal() {
    this.isAddModalOpen = false;
  }

  async onSaveProduct(productData: any) {
    try {
      // TODO: Ürün kaydetme işlemi
      console.log('Kaydedilecek ürün:', productData);
      this.closeAddModal();
    } catch (error) {
      console.error('Ürün kaydetme hatası:', error);
    }
  }

  deleteProduct(id: string) {
    // TODO: Ürün silme işlemi
  }
} 