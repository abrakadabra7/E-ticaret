import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { User } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { OrdersComponent } from '../orders/orders.component';

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, OrdersComponent],
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  currentUser: User | null = null;
  activeTab: 'profile' | 'orders' | 'favorites' = 'profile';
  isLoading = true;
  favoriteProducts: Product[] = [];
  loadingFavorites = false;

  constructor(
    private authService: AuthService,
    private favoriteService: FavoriteService
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  private async loadUserProfile() {
    try {
      this.currentUser = this.authService.currentUser;
      this.isLoading = false;
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
    }
  }

  async setActiveTab(tab: 'profile' | 'orders' | 'favorites') {
    this.activeTab = tab;
    if (tab === 'favorites' && this.favoriteProducts.length === 0) {
      await this.loadFavoriteProducts();
    }
  }

  private async loadFavoriteProducts() {
    if (!this.currentUser) return;
    
    this.loadingFavorites = true;
    try {
      this.favoriteProducts = await this.favoriteService.getFavoriteProducts();
    } catch (error) {
      console.error('Favori ürünler yüklenirken hata:', error);
    } finally {
      this.loadingFavorites = false;
    }
  }

  async removeFavorite(productId: string) {
    try {
      await this.favoriteService.removeFromFavorites(productId);
      this.favoriteProducts = this.favoriteProducts.filter(p => p.id !== productId);
    } catch (error) {
      console.error('Favori kaldırılırken hata:', error);
    }
  }
} 