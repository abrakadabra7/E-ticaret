import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  isLoading = true;
  orders: Order[] = [];

  constructor(private orderService: OrderService) {}

  async ngOnInit() {
    try {
      this.orders = await this.orderService.getOrders();
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
    } finally {
      this.isLoading = false;
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Onay Bekliyor',
      processing: 'Hazırlanıyor',
      shipped: 'Kargoya Verildi',
      delivered: 'Teslim Edildi',
      cancelled: 'İptal Edildi'
    };
    return statusMap[status] || status;
  }
} 