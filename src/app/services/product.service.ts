import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private supabase: SupabaseService) {}

  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await this.supabase.instance
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const { data, error } = await this.supabase.instance
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Ürün bulunamadı');
      }

      return data;
    } catch (error) {
      console.error('Ürün detayı yüklenirken hata:', error);
      throw error;
    }
  }

  async addProduct(product: Partial<Product>): Promise<Product> {
    try {
      console.log('Ürün ekleme işlemi başladı:', product);
      
      // Slug oluştur
      const slug = product.name
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Önce resimleri storage'a yükle
      const imageUrls: string[] = [];
      if (product.images && product.images.length > 0) {
        console.log('Resim yükleme başladı');
        
        for (const image of product.images) {
          if (image instanceof File) {
            // Dosya adını güvenli hale getir
            const safeFileName = Date.now() + '-' + image.name.replace(/[^a-zA-Z0-9.]/g, '_');
            
            console.log('Yüklenecek dosya adı:', safeFileName);
            
            const { data: uploadData, error: uploadError } = await this.supabase.instance
              .storage
              .from('product-images')
              .upload(safeFileName, image, {
                upsert: true,
                cacheControl: '3600'
              });

            if (uploadError) {
              console.error('Resim yükleme hatası:', uploadError);
              throw uploadError;
            }

            console.log('Resim başarıyla yüklendi:', uploadData);

            // Public URL oluştur
            const { data: urlData } = this.supabase.instance
              .storage
              .from('product-images')
              .getPublicUrl(safeFileName);

            imageUrls.push(urlData.publicUrl);
          } else {
            // Eğer image bir string ise (yani zaten bir URL ise) direkt olarak ekle
            imageUrls.push(image);
          }
        }
        console.log('Resim URLleri:', imageUrls);
      }

      // Ürün verilerini hazırla
      const { images, ...productData } = product;
      const dataToInsert = {
        ...productData,
        slug,
        images: imageUrls,
        created_at: new Date().toISOString()
      };
      console.log('Veritabanına eklenecek ürün:', dataToInsert);

      // Ürünü veritabanına ekle
      const { data, error } = await this.supabase.instance
        .from('products')
        .insert([dataToInsert])
        .select(`
          *,
          category:categories (
            id,
            name
          )
        `)
        .single();

      if (error) {
        console.error('Veritabanı hatası:', error);
        throw error;
      }

      console.log('Ürün başarıyla eklendi:', data);
      return data;
    } catch (error) {
      console.error('Ürün eklenirken hata:', error);
      throw error;
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    try {
      let imageUrls = product.images as string[];
      
      // Eğer yeni resimler varsa yükle
      if (product.newImages && product.newImages.length > 0) {
        const newImageUrls: string[] = [];
        
        for (const image of product.newImages) {
          const fileName = `${Date.now()}-${image.name}`;
          const { data: uploadData, error: uploadError } = await this.supabase.instance
            .storage
            .from('product-images')
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: urlData } = this.supabase.instance
            .storage
            .from('product-images')
            .getPublicUrl(fileName);

          newImageUrls.push(urlData.publicUrl);
        }
        
        // Mevcut resimlerle yeni resimleri birleştir
        imageUrls = [...(imageUrls || []), ...newImageUrls];
      }

      // Ürünü güncelle
      const { data, error } = await this.supabase.instance
        .from('products')
        .update({
          ...product,
          images: imageUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          category:categories (
            id,
            name
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ürün güncellenirken hata:', error);
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      // Önce ürün resimlerini sil
      const { data: product } = await this.supabase.instance
        .from('products')
        .select('images')
        .eq('id', id)
        .single();

      if (product?.images && product.images.length > 0) {
        const fileNames = product.images.map((url: string) => url.split('/').pop());
        await this.supabase.instance
          .storage
          .from('product-images')
          .remove(fileNames.filter(Boolean) as string[]);
      }

      // Ürünü sil
      const { error } = await this.supabase.instance
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Ürün silinirken hata:', error);
      throw error;
    }
  }
} 