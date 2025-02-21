import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css', '../auth-modal.css']
})
export class LoginModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  
  loginForm: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Form submitted:', this.loginForm.value);
      // Burada giriş işlemleri yapılacak
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    
    switch (controlName) {
      case 'email':
        if (errors['required']) return 'E-posta zorunludur';
        if (errors['email']) return 'Geçerli bir e-posta adresi giriniz';
        break;
      
      case 'password':
        if (errors['required']) return 'Şifre zorunludur';
        break;
    }
    
    return '';
  }

  loginWithGoogle() {
    console.log('Google ile giriş yap');
    // Google giriş işlemleri
  }

  loginWithFacebook() {
    console.log('Facebook ile giriş yap');
    // Facebook giriş işlemleri
  }
} 