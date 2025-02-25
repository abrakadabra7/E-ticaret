import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserLogin, UserRegister } from '../models/user.model';
import { isPlatformBrowser } from '@angular/common';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private readonly STORAGE_KEY = 'currentUser';
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private supabase: SupabaseService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.currentUserSubject = new BehaviorSubject<User | null>(null);
    this.currentUser$ = this.currentUserSubject.asObservable();

    if (this.isBrowser) {
      // Mevcut oturumu kontrol et
      this.supabase.instance.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          this.loadUserProfile(session.user.id);
        }
      });

      // Auth durumu değişikliklerini dinle
      this.supabase.instance.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          this.loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          this.clearStorage();
          this.currentUserSubject.next(null);
        }
      });
    }
  }

  private async loadUserProfile(userId: string) {
    try {
      const { data: profile, error } = await this.supabase.instance
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (profile) {
        const user: User = {
          id: profile.id,
          fullName: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar_url,
          isEmailVerified: profile.is_email_verified,
          createdAt: new Date(profile.created_at)
        };
        this.saveToStorage(user);
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
      this.clearStorage();
      this.currentUserSubject.next(null);
    }
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private saveToStorage(user: User | null): void {
    if (this.isBrowser && user) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.error('LocalStorage kayıt hatası:', e);
      }
    }
  }

  private clearStorage(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  async login(credentials: UserLogin): Promise<User> {
    try {
      console.log('Giriş yapılıyor...');
      
      const { data: { user, session }, error } = await this.supabase.instance.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        console.error('Giriş hatası:', error);
        if (error.message.includes('Email not confirmed')) {
          throw new Error('E-posta adresiniz henüz doğrulanmamış. Lütfen e-posta kutunuzu kontrol edin.');
        }
        throw error;
      }

      if (!user) {
        throw new Error('Kullanıcı bulunamadı');
      }

      // Profili yükle
      const { data: profile, error: profileError } = await this.supabase.instance
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Profil yükleme hatası:', profileError);
        throw new Error('Profil bilgileri yüklenemedi');
      }

      const currentUser: User = {
        id: user.id,
        fullName: profile.full_name,
        email: user.email!,
        phone: profile.phone,
        avatar: profile.avatar_url,
        isEmailVerified: user.email_confirmed_at !== null,
        createdAt: new Date(profile.created_at)
      };

      this.saveToStorage(currentUser);
      this.currentUserSubject.next(currentUser);

      return currentUser;
    } catch (error) {
      console.error('Giriş işlemi hatası:', error);
      throw error;
    }
  }

  async register(userData: UserRegister): Promise<User> {
    try {
      console.log('Kayıt işlemi başlatılıyor...');

      const { data: authData, error: signUpError } = await this.supabase.instance.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            phone: userData.phone
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) {
        console.error('Kayıt hatası:', signUpError);
        throw new Error(this.getErrorMessage(signUpError));
      }

      if (!authData.user) {
        throw new Error('Kullanıcı hesabı oluşturulamadı');
      }

      // Otomatik giriş yap
      return await this.login({
        email: userData.email,
        password: userData.password
      });
    } catch (error) {
      console.error('Kayıt işlemi hatası:', error);
      throw error;
    }
  }

  private getErrorMessage(error: any): string {
    if (!error) return 'Bilinmeyen bir hata oluştu';

    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('email already registered')) {
      return 'Bu e-posta adresi zaten kayıtlı';
    }
    if (message.includes('password')) {
      return 'Şifre gereksinimleri karşılanmıyor. Lütfen en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içeren bir şifre belirleyin.';
    }
    if (message.includes('rate limit')) {
      return 'Çok fazla deneme yaptınız. Lütfen bir süre bekleyin.';
    }
    
    return error.message || 'Kayıt işlemi başarısız oldu';
  }

  async logout(): Promise<void> {
    try {
      const { error } = await this.supabase.instance.auth.signOut();
      if (error) throw error;
      
      this.clearStorage();
      this.currentUserSubject.next(null);
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw new Error('Çıkış işlemi başarısız oldu');
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const { error } = await this.supabase.instance.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google giriş hatası:', error);
      throw new Error('Google ile giriş başarısız oldu');
    }
  }

  async loginWithFacebook(): Promise<void> {
    try {
      const { error } = await this.supabase.instance.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Facebook giriş hatası:', error);
      throw new Error('Facebook ile giriş başarısız oldu');
    }
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }
} 