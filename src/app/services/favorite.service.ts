import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private supabase: SupabaseService) {
    this.loadFavorites();
  }

  private async loadFavorites() {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) return;

      const { data: favorites, error } = await this.supabase.instance
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      this.favoritesSubject.next(favorites.map(f => f.product_id));
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
    }
  }

  async addToFavorites(productId: string): Promise<void> {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) throw new Error('Kullanıcı girişi gerekli');

      const { error } = await this.supabase.instance
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId });

      if (error) throw error;

      const currentFavorites = this.favoritesSubject.value;
      this.favoritesSubject.next([...currentFavorites, productId]);
    } catch (error) {
      console.error('Favorilere eklenirken hata:', error);
      throw error;
    }
  }

  async removeFromFavorites(productId: string): Promise<void> {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) throw new Error('Kullanıcı girişi gerekli');

      const { error } = await this.supabase.instance
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      const currentFavorites = this.favoritesSubject.value;
      this.favoritesSubject.next(currentFavorites.filter(id => id !== productId));
    } catch (error) {
      console.error('Favorilerden çıkarılırken hata:', error);
      throw error;
    }
  }

  async getFavoriteProducts(): Promise<Product[]> {
    try {
      const user = await this.supabase.getCurrentUser();
      if (!user) return [];

      const { data: favorites, error } = await this.supabase.instance
        .from('favorites')
        .select(`
          products (
            id,
            name,
            slug,
            description,
            price,
            original_price,
            stock,
            images,
            category_id,
            is_active,
            created_at,
            specifications,
            category:categories (
              id,
              name,
              slug,
              description,
              image_url,
              is_active,
              created_at
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      // Tip güvenliği için önce unknown'a sonra Product'a dönüştürüyoruz
      const products = favorites.map(f => {
        const p = f.products as any;
        return {
          id: String(p.id),
          name: String(p.name),
          slug: String(p.slug),
          description: String(p.description),
          price: Number(p.price),
          original_price: p.original_price ? Number(p.original_price) : undefined,
          stock: Number(p.stock),
          images: Array.isArray(p.images) ? p.images.map(String) : [],
          category_id: String(p.category_id),
          is_active: Boolean(p.is_active),
          created_at: String(p.created_at),
          specifications: p.specifications || {},
          category: p.category ? {
            id: String(p.category.id),
            name: String(p.category.name),
            slug: String(p.category.slug),
            description: String(p.category.description),
            image_url: p.category.image_url,
            is_active: Boolean(p.category.is_active),
            created_at: String(p.category.created_at)
          } : undefined
        } as Product;
      });

      return products;
    } catch (error) {
      console.error('Favori ürünler yüklenirken hata:', error);
      return [];
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoritesSubject.value.includes(productId);
  }
} 