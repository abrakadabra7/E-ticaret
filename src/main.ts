import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Uygulama başarıyla başlatıldı'))
  .catch(err => console.error('Uygulama başlatılırken hata oluştu:', err));
