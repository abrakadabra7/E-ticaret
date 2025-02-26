import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private supabase: SupabaseService) {}

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase.instance
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      throw error;
    }
  }

  async addCategory(category: Partial<Category>): Promise<Category> {
    try {
      console.log('Kategori ekleme işlemi başladı:', category);
      
      // Önce resmi storage'a yükle
      let imageUrl = null;
      if (category.image instanceof File) {
        console.log('Resim yükleme başladı');
        const fileName = `${Date.now()}-${category.image.name}`;
        const { data: uploadData, error: uploadError } = await this.supabase.instance
          .storage
          .from('category-images')
          .upload(fileName, category.image, {
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
          .from('category-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
        console.log('Resim URL:', imageUrl);
      }

      // Kategori verilerini hazırla
      const { image, ...categoryData } = category;
      const dataToInsert = {
        ...categoryData,
        image_url: imageUrl,
        created_at: new Date().toISOString()
      };
      console.log('Veritabanına eklenecek kategori:', dataToInsert);

      // Kategoriyi veritabanına ekle
      const { data, error } = await this.supabase.instance
        .from('categories')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Veritabanı hatası:', error);
        throw error;
      }

      console.log('Kategori başarıyla eklendi:', data);
      return data;
    } catch (error) {
      console.error('Kategori eklenirken hata:', error);
      throw error;
    }
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<Category> {
    try {
      // Eğer yeni resim varsa, eski resmi sil ve yenisini yükle
      let imageUrl = category.image_url;
      if (category.image instanceof File) {
        // Eski resmi sil
        if (category.image_url) {
          const oldFileName = category.image_url.split('/').pop();
          if (oldFileName) {
            await this.supabase.instance
              .storage
              .from('category-images')
              .remove([oldFileName]);
          }
        }

        // Yeni resmi yükle
        const fileName = `${Date.now()}-${category.image.name}`;
        const { data: uploadData, error: uploadError } = await this.supabase.instance
          .storage
          .from('category-images')
          .upload(fileName, category.image);

        if (uploadError) throw uploadError;

        // Public URL oluştur
        const { data: urlData } = this.supabase.instance
          .storage
          .from('category-images')
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // Kategoriyi güncelle
      const { data, error } = await this.supabase.instance
        .from('categories')
        .update({
          ...category,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori güncellenirken hata:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      console.log('Kategori silme işlemi başladı:', id);

      // Önce bu kategoriye ait ürünleri kontrol et
      const { data: products, error: productsError } = await this.supabase.instance
        .from('products')
        .select('id')
        .eq('category_id', id);

      if (productsError) throw productsError;

      if (products && products.length > 0) {
        throw new Error('Bu kategoriye ait ürünler var. Önce ürünleri silmeniz veya başka kategoriye taşımanız gerekiyor.');
      }

      // Önce kategori resmini sil
      const { data: category } = await this.supabase.instance
        .from('categories')
        .select('image_url')
        .eq('id', id)
        .single();

      if (category?.image_url) {
        const fileName = category.image_url.split('/').pop();
        if (fileName) {
          console.log('Kategori resmi siliniyor:', fileName);
          const { error: storageError } = await this.supabase.instance
            .storage
            .from('category-images')
            .remove([fileName]);

          if (storageError) {
            console.error('Resim silme hatası:', storageError);
            // Resim silme hatası kritik değil, devam edebiliriz
          }
        }
      }

      // Kategoriyi sil
      const { error } = await this.supabase.instance
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Kategori silme hatası:', error);
        throw error;
      }

      console.log('Kategori başarıyla silindi');
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      throw error;
    }
  }
} 