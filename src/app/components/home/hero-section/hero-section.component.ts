import { Component, ViewChild, ElementRef, OnInit, AfterViewInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.css']
})
export class HeroSectionComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initializeVideo();
  }

  private initializeVideo() {
    if (this.videoPlayer && this.videoPlayer.nativeElement) {
      const video = this.videoPlayer.nativeElement;

      // Video yüklendiğinde
      video.addEventListener('loadeddata', () => {
        console.log('Video yüklendi');
        this.playVideo();
      });

      // Video hata verdiğinde
      video.addEventListener('error', (e) => {
        console.error('Video yükleme hatası:', e);
        this.handleVideoError(e);
      });

      // Video durakladığında
      video.addEventListener('pause', () => {
        this.playVideo();
      });

      // Video bittiğinde
      video.addEventListener('ended', () => {
        this.playVideo();
      });

      // İlk yükleme denemesi
      this.loadVideo();
    }
  }

  private loadVideo() {
    const video = this.videoPlayer.nativeElement;
    video.load();
    this.playVideo();
  }

  private playVideo() {
    const video = this.videoPlayer.nativeElement;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Video oynatılıyor');
      }).catch(error => {
        console.error('Video oynatma hatası:', error);
        this.handleVideoError(error);
      });
    }
  }

  handleVideoError(event: any) {
    console.error('Video hatası:', event);
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      this.renderer.setStyle(heroSection, 'background', 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)');
    }
  }
}
