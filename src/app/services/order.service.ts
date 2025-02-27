import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { CartItem } from './cart.service';
import { BehaviorSubject } from 'rxjs';

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    zipCode: string;
  };
  payment_method: 'card' | 'transfer';
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orderStatusSubject = new BehaviorSubject<{[key: string]: Order['status']}>({});
  public orderStatus$ = this.orderStatusSubject.asObservable();

  constructor(private supabase: SupabaseService) {}

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    try {
      const { items, ...orderDetails } = orderData;
      
      // Önce siparişi oluştur
      const { data: order, error: orderError } = await this.supabase.instance
        .from('orders')
        .insert([orderDetails])
        .select()
        .single();

      if (orderError) throw orderError;

      // Sonra sipariş öğelerini ekle
      if (items && items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }));

        const { error: itemsError } = await this.supabase.instance
          .from('order_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;
      }

      // Sipariş durumu simülasyonunu başlat
      this.startOrderSimulation(order.id);

      return order;
    } catch (error) {
      console.error('Sipariş oluşturulurken hata:', error);
      throw error;
    }
  }

  private async startOrderSimulation(orderId: string) {
    try {
      // İlk durum: Sipariş Alındı (pending)
      await this.updateOrderStatus(orderId, 'pending');
      this.orderStatusSubject.next({ 
        ...this.orderStatusSubject.value, 
        [orderId]: 'pending' 
      });

      // 3 saniye sonra: Hazırlanıyor
      setTimeout(async () => {
        try {
          await this.updateOrderStatus(orderId, 'processing');
          this.orderStatusSubject.next({ 
            ...this.orderStatusSubject.value, 
            [orderId]: 'processing' 
          });

          // 3 saniye sonra: Kargoya Verildi
          setTimeout(async () => {
            try {
              await this.updateOrderStatus(orderId, 'shipped');
              this.orderStatusSubject.next({ 
                ...this.orderStatusSubject.value, 
                [orderId]: 'shipped' 
              });

              // 3 saniye sonra: Teslim Edildi
              setTimeout(async () => {
                try {
                  await this.updateOrderStatus(orderId, 'delivered');
                  this.orderStatusSubject.next({ 
                    ...this.orderStatusSubject.value, 
                    [orderId]: 'delivered' 
                  });
                } catch (error) {
                  console.error('Teslim edildi durumu güncellenirken hata:', error);
                }
              }, 3000);
            } catch (error) {
              console.error('Kargoya verildi durumu güncellenirken hata:', error);
            }
          }, 3000);
        } catch (error) {
          console.error('Hazırlanıyor durumu güncellenirken hata:', error);
        }
      }, 3000);
    } catch (error) {
      console.error('Sipariş durumu simülasyonu başlatılırken hata:', error);
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { data: orders, error: ordersError } = await this.supabase.instance
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Her sipariş için öğeleri al
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const { data: items, error: itemsError } = await this.supabase.instance
            .from('order_items')
            .select(`
              quantity,
              price,
              product:products(*)
            `)
            .eq('order_id', order.id);

          if (itemsError) throw itemsError;

          return {
            ...order,
            items: items || []
          };
        })
      );

      return ordersWithItems;
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      throw error;
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) throw new Error('Kullanıcı bulunamadı');

      const { data: order, error: orderError } = await this.supabase.instance
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error('Sipariş bulunamadı');

      // Sipariş öğelerini al
      const { data: items, error: itemsError } = await this.supabase.instance
        .from('order_items')
        .select(`
          quantity,
          price,
          product:products(*)
        `)
        .eq('order_id', order.id);

      if (itemsError) throw itemsError;

      return {
        ...order,
        items: items || []
      };
    } catch (error) {
      console.error('Sipariş detayı yüklenirken hata:', error);
      throw error;
    }
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    try {
      const { error } = await this.supabase.instance
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
    } catch (error) {
      console.error('Sipariş durumu güncellenirken hata:', error);
      throw error;
    }
  }
} 