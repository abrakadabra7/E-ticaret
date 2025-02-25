import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];

  ngOnInit() {
    // TODO: Kategorileri yükle
  }

  deleteCategory(id: string) {
    // TODO: Kategori silme işlemi
  }
} 