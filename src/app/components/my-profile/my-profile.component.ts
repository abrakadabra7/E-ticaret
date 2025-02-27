import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
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

  constructor(private authService: AuthService) {}

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

  setActiveTab(tab: 'profile' | 'orders' | 'favorites') {
    this.activeTab = tab;
  }
} 