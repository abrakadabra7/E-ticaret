import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginModalComponent } from '../auth/login-modal/login-modal.component';
import { RegisterModalComponent } from '../auth/register-modal/register-modal.component';

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
export class NavbarComponent {
  isMenuOpen = false;
  isLoginModalOpen = false;
  isRegisterModalOpen = false;

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
}
