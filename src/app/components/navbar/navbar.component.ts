import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CategoryService } from '../../services/category.service';
import { User } from '../../models/user.model';
import { Category } from '../../models/category.model';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';
import { RegisterModalComponent } from '../auth/register-modal/register-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, LoginModalComponent, RegisterModalComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isLoginModalOpen = false;
  isRegisterModalOpen = false;
  currentUser: User | null = null;
  isUserMenuOpen = false;
  cartItemCount = 0;
  categories: Category[] = [];

  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Kullanıcı durumunu takip et
    this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );

    // Sepet durumunu takip et
    this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });

    // Kategorileri yükle
    try {
      this.categories = await this.categoryService.getCategories();
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (this.isMenuOpen) {
      menuToggle?.classList.add('active');
      mobileMenu?.classList.add('active');
    } else {
      menuToggle?.classList.remove('active');
      mobileMenu?.classList.remove('active');
    }
  }

  closeMenu() {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      const menuToggle = document.querySelector('.menu-toggle');
      const mobileMenu = document.querySelector('.mobile-menu');
      
      menuToggle?.classList.remove('active');
      mobileMenu?.classList.remove('active');
    }
  }

  openLoginModal() {
    this.isLoginModalOpen = true;
    this.isRegisterModalOpen = false;
    this.closeMenu();
  }

  openRegisterModal() {
    this.isRegisterModalOpen = true;
    this.isLoginModalOpen = false;
    this.closeMenu();
  }

  closeLoginModal() {
    this.isLoginModalOpen = false;
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  async logout() {
    try {
      await this.authService.logout();
      this.isUserMenuOpen = false;
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  }

  scrollToCategories() {
    const categoriesSection = document.getElementById('categories');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/'], { fragment: 'categories' });
    }
    this.closeMenu();
  }

  goToCategory(categorySlug: string) {
    this.router.navigate(['/products'], { queryParams: { category: categorySlug } });
    this.closeMenu();
  }
}
