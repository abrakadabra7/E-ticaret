import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories-section.component.html',
  styleUrls: ['./categories-section.component.css']
})
export class CategoriesSectionComponent implements OnInit {
  categories: Category[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private router: Router,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    try {
      this.categories = await this.categoryService.getCategories();
    } catch (error) {
      this.error = 'Kategoriler yüklenirken bir hata oluştu';
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      this.isLoading = false;
    }
  }

  goToCategory(categorySlug: string) {
    this.router.navigate(['/products'], { queryParams: { category: categorySlug } });
  }
}
