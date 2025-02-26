import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  isLoading = true;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.loadCart();
    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total;
    });
  }

  loadCart() {
    this.cartItems = this.cartService.getCart();
    this.isLoading = false;
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      if (confirm('Bu ürünü sepetten çıkarmak istediğinize emin misiniz?')) {
        this.removeItem(productId);
      }
      return;
    }
    
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item && quantity <= item.product.stock) {
      this.cartService.updateQuantity(productId, quantity);
      this.loadCart();
    }
  }

  removeItem(productId: string) {
    if (confirm('Bu ürünü sepetten çıkarmak istediğinize emin misiniz?')) {
      this.cartService.removeFromCart(productId);
      this.loadCart();
    }
  }

  clearCart() {
    if (confirm('Sepetinizi tamamen boşaltmak istediğinize emin misiniz?')) {
      this.cartService.clearCart();
      this.loadCart();
    }
  }

  calculateItemTotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }
} 