import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Campaign {
  id: number;
  badge: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  oldPrice?: number;
  stockPercentage?: number;
  buttonText: string;
  buttonLink: string;
  badgeType?: 'gaming' | 'phones' | 'accessories';
  icon?: string;
}

@Component({
  selector: 'app-campaigns-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './campaigns-section.component.html',
  styleUrls: ['./campaigns-section.component.css']
})
export class CampaignsSectionComponent implements OnInit {
  mainCampaign: Campaign = {
    id: 1,
    badge: 'SÜPER FIRSAT',
    title: 'MacBook Pro M3',
    description: 'En yeni M3 işlemcili MacBook Pro',
    imageUrl: 'assets/images/macbook-pro.png',
    price: 89999,
    oldPrice: 99999,
    stockPercentage: 35,
    buttonText: 'Hemen İncele',
    buttonLink: '/products'
  };

  campaigns: Campaign[] = [
    {
      id: 2,
      badge: 'Gaming',
      title: 'Gaming Aksesuarları',
      description: '%40\'a varan indirimler',
      imageUrl: 'assets/images/gaming-accessories.png',
      buttonText: 'Keşfet',
      buttonLink: '/category/gaming',
      badgeType: 'gaming',
      icon: 'fa-gamepad'
    },
    {
      id: 3,
      badge: 'Telefonlar',
      title: 'Akıllı Telefonlar',
      description: '2.000₺\'ye varan indirim',
      imageUrl: 'assets/images/smartphones.png',
      buttonText: 'İncele',
      buttonLink: '/category/phones',
      badgeType: 'phones',
      icon: 'fa-mobile-alt'
    },
    {
      id: 4,
      badge: 'Aksesuarlar',
      title: 'Kablosuz Kulaklıklar',
      description: 'İkinci üründe %50 indirim',
      imageUrl: 'assets/images/wireless-headphones.png',
      buttonText: 'Alışverişe Başla',
      buttonLink: '/category/accessories',
      badgeType: 'accessories',
      icon: 'fa-headphones'
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  calculateDiscount(oldPrice: number, newPrice: number): number {
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  }
}
