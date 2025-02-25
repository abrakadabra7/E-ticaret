import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [AuthService],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css', '../auth-modal.css']
})
export class LoginModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  
  loginForm: FormGroup;
  showPassword = false;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      
      try {
        await this.authService.login(this.loginForm.value);
        this.closeModal.emit();
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Giriş işlemi başarısız oldu.';
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Lütfen tüm alanları doğru şekilde doldurun.';
    }
  }

  async loginWithGoogle() {
    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      await this.authService.loginWithGoogle();
      this.closeModal.emit();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Google ile giriş başarısız oldu.';
    } finally {
      this.isLoading = false;
    }
  }

  async loginWithFacebook() {
    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      await this.authService.loginWithFacebook();
      this.closeModal.emit();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Facebook ile giriş başarısız oldu.';
    } finally {
      this.isLoading = false;
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
        if (errors['minlength']) return 'Şifre en az 8 karakter olmalıdır';
        break;
    }
    
    return '';
  }
} 