import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './register-modal.component.html',
  styleUrls: ['./register-modal.component.css', '../auth-modal.css']
})
export class RegisterModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
      ]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;

      try {
        console.log('Form gönderiliyor:', this.registerForm.value);
        const { confirmPassword, acceptTerms, ...userData } = this.registerForm.value;
        await this.authService.register(userData);
        console.log('Kayıt başarılı');
        this.closeModal.emit();
      } catch (error) {
        console.error('Form gönderme hatası:', error);
        if (error instanceof Error) {
          // Supabase hata mesajlarını Türkçeleştir
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes('email already registered')) {
            this.errorMessage = 'Bu e-posta adresi zaten kayıtlı.';
          } else if (errorMessage.includes('password')) {
            this.errorMessage = 'Şifre gereksinimleri karşılanmıyor. Lütfen en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içeren bir şifre belirleyin.';
          } else {
            this.errorMessage = error.message;
          }
        } else {
          this.errorMessage = 'Kayıt işlemi başarısız oldu. Lütfen daha sonra tekrar deneyin.';
        }
      } finally {
        this.isLoading = false;
      }
    } else {
      this.errorMessage = 'Lütfen tüm alanları doğru şekilde doldurun.';
      // Hatalı alanları işaretle
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;
    
    switch (controlName) {
      case 'fullName':
        if (errors['required']) return 'Ad Soyad zorunludur';
        if (errors['minlength']) return 'Ad Soyad en az 3 karakter olmalıdır';
        break;
      
      case 'email':
        if (errors['required']) return 'E-posta zorunludur';
        if (errors['email']) return 'Geçerli bir e-posta adresi giriniz';
        break;
      
      case 'phone':
        if (errors['required']) return 'Telefon numarası zorunludur';
        if (errors['pattern']) return 'Geçerli bir telefon numarası giriniz';
        break;
      
      case 'password':
        if (errors['required']) return 'Şifre zorunludur';
        if (errors['minlength']) return 'Şifre en az 8 karakter olmalıdır';
        if (errors['pattern']) return 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir';
        break;
      
      case 'confirmPassword':
        if (errors['required']) return 'Şifre tekrarı zorunludur';
        if (errors['mismatch']) return 'Şifreler eşleşmiyor';
        break;
    }
    
    return '';
  }

  async registerWithGoogle() {
    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      await this.authService.loginWithGoogle();
      this.closeModal.emit();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Google ile kayıt başarısız oldu.';
    } finally {
      this.isLoading = false;
    }
  }

  async registerWithFacebook() {
    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      await this.authService.loginWithFacebook();
      this.closeModal.emit();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Facebook ile kayıt başarısız oldu.';
    } finally {
      this.isLoading = false;
    }
  }
} 