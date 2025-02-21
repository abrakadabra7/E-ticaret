import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
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

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Form submitted:', this.registerForm.value);
      // Burada kayıt işlemleri yapılacak
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
        if (errors['pattern']) return 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir';
        break;
      
      case 'confirmPassword':
        if (errors['required']) return 'Şifre tekrarı zorunludur';
        if (errors['mismatch']) return 'Şifreler eşleşmiyor';
        break;
    }
    
    return '';
  }

  registerWithGoogle() {
    console.log('Google ile kayıt ol');
    // Google kayıt işlemleri
  }

  registerWithFacebook() {
    console.log('Facebook ile kayıt ol');
    // Facebook kayıt işlemleri
  }
} 