import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category } from '../../../models/category.model';
import { CategoryService } from '../../../services/category.service';
import { AddCategoryModalComponent } from './add-category-modal/add-category-modal.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, AddCategoryModalComponent],
  template: `
    <div class="categories-page">
      <div class="header">
        <h1>Kategoriler</h1>
        <button class="btn-primary" (click)="openAddModal()">
          <i class="fas fa-plus"></i>
          Yeni Kategori
        </button>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Görsel</th>
              <th>İsim</th>
              <th>Slug</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of categories">
              <td>{{category.id}}</td>
              <td>
                <img *ngIf="category.image_url" [src]="category.image_url" [alt]="category.name" class="category-image">
                <span *ngIf="!category.image_url" class="no-image">Görsel Yok</span>
              </td>
              <td>{{category.name}}</td>
              <td>{{category.slug}}</td>
              <td>
                <span class="status" [class.active]="category.is_active">
                  {{category.is_active ? 'Aktif' : 'Pasif'}}
                </span>
              </td>
              <td>
                <button class="btn-icon" (click)="editCategory(category)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete" (click)="deleteCategory(category.id)">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-add-category-modal
        [isOpen]="isAddModalOpen"
        (closeModal)="closeAddModal()"
        (saveCategory)="onSaveCategory($event)">
      </app-add-category-modal>
    </div>
  `,
  styles: [`
    .categories-page {
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #2c3e50;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .btn-primary:hover {
      background: #2980b9;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #2c3e50;
    }

    .category-image {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }

    .no-image {
      color: #95a5a6;
      font-size: 0.875rem;
    }

    .status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.875rem;
      background: #fee;
      color: #e74c3c;
    }

    .status.active {
      background: #eefee4;
      color: #27ae60;
    }

    .btn-icon {
      background: none;
      border: none;
      color: #3498db;
      cursor: pointer;
      padding: 4px;
      margin: 0 4px;
      transition: color 0.3s ease;
    }

    .btn-icon:hover {
      color: #2980b9;
    }

    .btn-icon.delete {
      color: #e74c3c;
    }

    .btn-icon.delete:hover {
      color: #c0392b;
    }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  isAddModalOpen = false;

  constructor(private categoryService: CategoryService) {}

  async ngOnInit() {
    await this.loadCategories();
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

  async onSaveCategory(categoryData: Partial<Category>) {
    try {
      console.log('Kategori kaydetme başladı:', categoryData);
      const savedCategory = await this.categoryService.addCategory(categoryData);
      console.log('Kategori başarıyla kaydedildi:', savedCategory);
      await this.loadCategories();
      this.closeAddModal();
    } catch (error) {
      console.error('Kategori kaydedilirken hata:', error);
      // Modal'ı kapatmayalım ve hatayı gösterelim
      const errorMessage = error instanceof Error ? error.message : 'Kategori kaydedilirken bir hata oluştu';
      // Hata mesajını kullanıcıya göstermek için bir yöntem ekleyelim
      alert(errorMessage);
    }
  }

  editCategory(category: Category) {
    // TODO: Düzenleme modalını aç
    console.log('Düzenlenecek kategori:', category);
  }

  async deleteCategory(id: string) {
    if (confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) {
      try {
        await this.categoryService.deleteCategory(id);
        await this.loadCategories();
      } catch (error) {
        console.error('Kategori silinirken hata:', error);
      }
    }
  }
} 