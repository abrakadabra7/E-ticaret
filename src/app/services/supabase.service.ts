import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      try {
        this.supabase = createClient(
          environment.supabaseUrl,
          environment.supabaseKey,
          {
            auth: {
              autoRefreshToken: true,
              persistSession: true
            }
          }
        );
        console.log('Supabase client başarıyla oluşturuldu');
      } catch (error) {
        console.error('Supabase client oluşturma hatası:', error);
      }
    }
  }

  get instance(): SupabaseClient {
    if (!this.isBrowser) {
      throw new Error('Supabase sadece tarayıcı ortamında kullanılabilir');
    }
    if (!this.supabase) {
      throw new Error('Supabase client henüz başlatılmadı');
    }
    return this.supabase;
  }

  async testConnection(): Promise<boolean> {
    if (!this.isBrowser) {
      console.log('Sunucu tarafında bağlantı testi atlanıyor');
      return true;
    }

    try {
      const { data, error } = await this.instance
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        return false;
      }

      console.log('Veritabanı bağlantısı başarılı');
      return true;
    } catch (error) {
      console.error('Beklenmeyen bir hata oluştu:', error);
      return false;
    }
  }
} 