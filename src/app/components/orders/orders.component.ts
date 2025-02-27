import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  isLoading = true;
  orders: Order[] = [];
  private statusSubscription?: Subscription;

  constructor(private orderService: OrderService) {}

  async ngOnInit() {
    try {
      await this.loadOrders();
      
      // Sipariş durumu değişikliklerini takip et
      this.statusSubscription = this.orderService.orderStatus$.subscribe(statuses => {
        this.orders = this.orders.map(order => ({
          ...order,
          status: statuses[order.id] || order.status
        }));
      });
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    if (this.statusSubscription) {
      this.statusSubscription.unsubscribe();
    }
  }

  private async loadOrders() {
    this.orders = await this.orderService.getOrders();
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Sipariş Alındı',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };
    return statusMap[status] || status;
  }
} 