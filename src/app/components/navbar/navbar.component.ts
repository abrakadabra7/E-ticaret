import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';
import { RegisterModalComponent } from '../auth/register-modal/register-modal.component';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoginModalComponent,
    RegisterModalComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isLoginModalOpen = false;
  isRegisterModalOpen = false;
  currentUser: User | null = null;
  isUserMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Kullanıcı durumunu takip et
    this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );
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
    this.isMenuOpen = false;
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    menuToggle?.classList.remove('active');
    mobileMenu?.classList.remove('active');
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

  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
  }
}
