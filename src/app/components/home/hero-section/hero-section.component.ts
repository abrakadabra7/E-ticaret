import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Renderer2, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  private isBrowser: boolean;

  constructor(
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) {
      return;
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.initializeVideo();
    } else {
      this.setFallbackBackground();
    }
  }

  private initializeVideo() {
    if (this.videoPlayer?.nativeElement) {
      const video = this.videoPlayer.nativeElement;

      video.addEventListener('loadeddata', () => {
        console.log('Video yüklendi');
        this.playVideo();
      });

      video.addEventListener('error', (e) => {
        console.error('Video yükleme hatası:', e);
        this.setFallbackBackground();
      });

      video.addEventListener('ended', () => {
        video.play().catch(() => this.setFallbackBackground());
      });
    } else {
      this.setFallbackBackground();
    }
  }

  private playVideo() {
    if (!this.videoPlayer?.nativeElement) {
      return;
    }

    const video = this.videoPlayer.nativeElement;
    video.play().catch((error) => {
      console.error('Video oynatma hatası:', error);
      this.setFallbackBackground();
    });
  }

  private setFallbackBackground() {
    if (this.isBrowser) {
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        this.renderer.setStyle(heroSection, 'background', 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)');
      }
    }
  }
}

