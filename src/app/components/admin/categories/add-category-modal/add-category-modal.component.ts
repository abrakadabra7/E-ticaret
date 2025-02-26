import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-category-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-category-modal.component.html',
  styleUrls: ['./add-category-modal.component.css']
})
export class AddCategoryModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveCategory = new EventEmitter<any>();

  categoryForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedImage: File | null = null;
  imagePreviewUrl: string | null = null;

  constructor(private fb: FormBuilder) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
      is_active: [true]
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreviewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreviewUrl = null;
  }

  generateSlug(event: Event) {
    const input = event.target as HTMLInputElement;
    const name = input.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    this.categoryForm.patchValue({ slug });
  }

  async onSubmit() {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        console.log('Form değerleri:', this.categoryForm.value);
        console.log('Seçili resim:', this.selectedImage);
        
        const formData = {
          ...this.categoryForm.value,
          image: this.selectedImage
        };
        
        console.log('Gönderilecek veri:', formData);
        this.saveCategory.emit(formData);
        this.closeModal.emit();
      } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        this.errorMessage = 'Kategori eklenirken bir hata oluştu';
      } finally {
        this.isLoading = false;
      }
    } else {
      console.log('Form hataları:', this.categoryForm.errors);
      Object.keys(this.categoryForm.controls).forEach(key => {
        const control = this.categoryForm.get(key);
        if (control?.errors) {
          console.log(`${key} alanındaki hatalar:`, control.errors);
        }
      });
      this.errorMessage = 'Lütfen tüm alanları doğru şekilde doldurun';
    }
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }
} 