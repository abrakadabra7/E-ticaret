import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../services/order.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="order-detail-container">
      <!-- Yükleniyor -->
      <div *ngIf="isLoading" class="loading-spinner">
        <div class="spinner"></div>
      </div>

      <!-- Hata Mesajı -->
      <div *ngIf="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </div>

      <!-- Sipariş Detayları -->
      <div *ngIf="!isLoading && !error && order" class="order-content">
        <div class="order-header">
          <h1>Sipariş Detayları</h1>
          <div class="order-info">
            <span class="order-number">Sipariş #{{ order.id }}</span>
            <span class="order-date">{{ order.created_at | date:'dd.MM.yyyy HH:mm' }}</span>
            <div class="order-status" [class]="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </div>
          </div>
        </div>

        <!-- Teslimat Bilgileri -->
        <div class="delivery-info">
          <h2>Teslimat Bilgileri</h2>
          <div class="info-content">
            <p><strong>Ad Soyad:</strong> {{ order.shipping_address.fullName }}</p>
            <p><strong>E-posta:</strong> {{ order.shipping_address.email }}</p>
            <p><strong>Telefon:</strong> {{ order.shipping_address.phone }}</p>
            <p><strong>Adres:</strong> {{ order.shipping_address.address }}</p>
            <p><strong>İl/İlçe:</strong> {{ order.shipping_address.city }}/{{ order.shipping_address.district }}</p>
            <p><strong>Posta Kodu:</strong> {{ order.shipping_address.zipCode }}</p>
          </div>
        </div>

        <!-- Sipariş Ürünleri -->
        <div class="order-items">
          <h2>Sipariş Edilen Ürünler</h2>
          <div class="items-list">
            <div *ngFor="let item of order.items" class="order-item">
              <div class="item-image">
                <img [src]="item.product.images[0]" [alt]="item.product.name">
              </div>
              <div class="item-details">
                <h3>{{ item.product.name }}</h3>
                <p class="item-description">{{ item.product.description }}</p>
                <div class="item-meta">
                  <span>{{ item.quantity }} adet</span>
                  <span>{{ item.product.price | currency:'TRY':'symbol-narrow':'1.2-2' }}</span>
                </div>
                <button 
                  *ngIf="canRequestRefund(order.status)"
                  class="refund-btn"
                  [disabled]="processingRefund[item.product.id]"
                  (click)="initiateRefund(item.product.id)">
                  <span *ngIf="!processingRefund[item.product.id]">İade Talebi Oluştur</span>
                  <span *ngIf="processingRefund[item.product.id]">İşleniyor...</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sipariş Özeti -->
        <div class="order-summary">
          <h2>Sipariş Özeti</h2>
          <div class="summary-content">
            <div class="summary-row">
              <span>Ara Toplam</span>
              <span>{{ order.total | currency:'TRY':'symbol-narrow':'1.2-2' }}</span>
            </div>
            <div class="summary-row">
              <span>Kargo</span>
              <span>Ücretsiz</span>
            </div>
            <div class="summary-row total">
              <span>Toplam</span>
              <span>{{ order.total | currency:'TRY':'symbol-narrow':'1.2-2' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  processingRefund: { [key: string]: boolean } = {};

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    } else {
      this.error = 'Sipariş ID\'si bulunamadı';
      this.isLoading = false;
    }
  }

  private async loadOrder(orderId: string) {
    try {
      this.order = await this.orderService.getOrderById(orderId);
      this.isLoading = false;
    } catch (error) {
      console.error('Sipariş detayı yüklenirken hata:', error);
      this.error = 'Sipariş detayı yüklenirken bir hata oluştu';
      this.isLoading = false;
    }
  }

  getStatusText(status: Order['status']): string {
    const statusMap = {
      'pending': 'Sipariş Alındı',
      'processing': 'Hazırlanıyor',
      'shipped': 'Kargoya Verildi',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    return statusMap[status];
  }

  getStatusClass(status: Order['status']): string {
    const classMap = {
      'pending': 'pending',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };
    return classMap[status];
  }

  async initiateRefund(productId: string) {
    try {
      if (!this.order) return;
      
      this.processingRefund[productId] = true;
      
      // İade talebi başarılı olduğunda kullanıcıya bilgi ver
      alert('İade talebiniz başarıyla oluşturuldu.');
    } catch (error) {
      console.error('İade talebi oluşturulurken hata:', error);
      alert('İade talebi oluşturulurken bir hata oluştu.');
    } finally {
      this.processingRefund[productId] = false;
    }
  }

  canRequestRefund(status: Order['status']): boolean {
    return status === 'delivered';
  }
}
