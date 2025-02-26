import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  private cartTotalSubject = new BehaviorSubject<number>(0);
  private isBrowser: boolean;

  cart$ = this.cartSubject.asObservable();
  cartTotal$ = this.cartTotalSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadCart();
    }
  }

  private loadCart(): void {
    if (this.isBrowser) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems = JSON.parse(savedCart);
        this.updateCart();
      }
    }
  }

  private saveCart(): void {
    if (this.isBrowser) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems));
      this.updateCart();
    }
  }

  private updateCart(): void {
    this.cartSubject.next(this.cartItems);
    this.calculateTotal();
  }

  private calculateTotal(): void {
    const total = this.cartItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    this.cartTotalSubject.next(total);
  }

  addToCart(product: Product, quantity: number): void {
    const existingItem = this.cartItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
      if (existingItem.quantity > product.stock) {
        existingItem.quantity = product.stock;
      }
    } else {
      this.cartItems.push({
        product,
        quantity: Math.min(quantity, product.stock)
      });
    }

    this.saveCart();
  }

  removeFromCart(productId: string): void {
    this.cartItems = this.cartItems.filter(item => item.product.id !== productId);
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.cartItems.find(item => item.product.id === productId);
    if (item) {
      item.quantity = Math.min(quantity, item.product.stock);
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.saveCart();
  }

  getCartItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  getCart(): CartItem[] {
    return this.cartItems;
  }
} 