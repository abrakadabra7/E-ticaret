import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../models/product.model';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  providers: [ProductService],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  error: string | null = null;
  selectedImageIndex = 0;
  quantity = 1;
  addingToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    window.scrollTo(0, 0);
    this.loadProduct();
  }

  private async loadProduct() {
    try {
      const productId = this.route.snapshot.paramMap.get('id');
      if (!productId) {
        throw new Error('Ürün ID\'si bulunamadı');
      }

      this.product = await this.productService.getProductById(productId);
      
      if (!this.product) {
        throw new Error('Ürün bulunamadı');
      }
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
      this.error = error instanceof Error ? error.message : 'Ürün yüklenirken bir hata oluştu';
      this.router.navigate(['/products']);
    } finally {
      this.isLoading = false;
    }
  }

  selectImage(index: number): void {
    if (this.product?.images && index >= 0 && index < this.product.images.length) {
      this.selectedImageIndex = index;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  calculateDiscount(): number {
    if (this.product?.original_price && this.product?.price) {
      const discount = ((this.product.original_price - this.product.price) / this.product.original_price) * 100;
      return Math.round(discount);
    }
    return 0;
  }

  async addToCart(): Promise<void> {
    if (this.product && !this.addingToCart) {
      try {
        this.addingToCart = true;
        this.cartService.addToCart(this.product, this.quantity);
        
        // Başarılı bildirim göster
        alert('Ürün başarıyla sepete eklendi!');
        
        // Miktarı sıfırla
        this.quantity = 1;
      } catch (error) {
        console.error('Sepete eklenirken hata:', error);
        alert('Ürün sepete eklenirken bir hata oluştu!');
      } finally {
        this.addingToCart = false;
      }
    }
  }
} 