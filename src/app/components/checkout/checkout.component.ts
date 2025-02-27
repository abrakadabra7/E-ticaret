import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService, Order } from '../../services/order.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  checkoutForm: FormGroup;
  isLoading = false;
  currentStep = 1; // 1: Teslimat, 2: Ödeme, 3: Onay
  paymentMethod: Order['payment_method'] = 'card';
  orderSuccess = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private supabaseService: SupabaseService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      // Teslimat Bilgileri
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', Validators.required],
      district: ['', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],

      // Kart Bilgileri
      cardNumber: ['', [Validators.pattern(/^[0-9]{16}$/)]],
      cardName: [''],
      expiryMonth: [''],
      expiryYear: [''],
      cvv: ['', [Validators.pattern(/^[0-9]{3,4}$/)]],
    });
  }

  ngOnInit() {
    this.loadCart();
    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });
  }

  loadCart() {
    this.cartItems = this.cartService.getCart();
  }

  nextStep() {
    if (this.currentStep < 3) {
      if (this.validateCurrentStep()) {
        this.currentStep++;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      // Teslimat bilgileri kontrolü
      const deliveryControls = ['fullName', 'email', 'phone', 'address', 'city', 'district', 'zipCode'];
      return deliveryControls.every(control => 
        this.checkoutForm.get(control)?.valid
      );
    } else if (this.currentStep === 2 && this.paymentMethod === 'card') {
      // Kart bilgileri kontrolü
      const cardControls = ['cardNumber', 'cardName', 'expiryMonth', 'expiryYear', 'cvv'];
      return cardControls.every(control => 
        this.checkoutForm.get(control)?.valid
      );
    }
    return true;
  }

  async completeOrder() {
    if (!this.validateCurrentStep()) return;

    this.isLoading = true;
    try {
      await this.processPayment();
      await this.saveOrder();
      
      // Başarılı sipariş
      this.orderSuccess = true;
      this.cartService.clearCart(); // Sepeti temizle

      // 3 saniye sonra siparişlerim sayfasına yönlendir
      setTimeout(() => {
        this.router.navigate(['/orders']);
      }, 3000);

    } catch (error) {
      console.error('Sipariş tamamlanırken hata:', error);
      alert('Sipariş işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      this.isLoading = false;
    }
  }

  private async processPayment() {
    // Gerçek ödeme işlemi burada yapılacak
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }

  private async saveOrder() {
    try {
      const user = await this.supabaseService.getCurrentUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const orderData = {
        user_id: user.id,
        items: this.cartItems,
        total: this.cartTotal,
        status: 'pending' as const,
        shipping_address: {
          fullName: this.checkoutForm.get('fullName')?.value,
          email: this.checkoutForm.get('email')?.value,
          phone: this.checkoutForm.get('phone')?.value,
          address: this.checkoutForm.get('address')?.value,
          city: this.checkoutForm.get('city')?.value,
          district: this.checkoutForm.get('district')?.value,
          zipCode: this.checkoutForm.get('zipCode')?.value,
        },
        payment_method: this.paymentMethod,
      };

      await this.orderService.createOrder(orderData);
    } catch (error) {
      console.error('Sipariş kaydedilirken hata:', error);
      throw error;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.checkoutForm.get(controlName);
    if (control?.errors) {
      if (control.errors['required']) return 'Bu alan zorunludur';
      if (control.errors['email']) return 'Geçerli bir e-posta adresi giriniz';
      if (control.errors['minlength']) return `En az ${control.errors['minlength'].requiredLength} karakter giriniz`;
      if (control.errors['pattern']) {
        switch (controlName) {
          case 'phone': return 'Geçerli bir telefon numarası giriniz';
          case 'zipCode': return 'Geçerli bir posta kodu giriniz';
          case 'cardNumber': return '16 haneli kart numarasını giriniz';
          case 'cvv': return 'Geçerli bir CVV numarası giriniz';
          default: return 'Geçersiz format';
        }
      }
    }
    return '';
  }
} 