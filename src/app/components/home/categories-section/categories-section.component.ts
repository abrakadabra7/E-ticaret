import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-categories-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './categories-section.component.html',
  styleUrls: ['./categories-section.component.css']
})
export class CategoriesSectionComponent {
  constructor(private router: Router) {}

  goToCategory(categorySlug: string) {
    this.router.navigate(['/category', categorySlug]);
  }
}
