import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Category } from '../../../../models/category.model';

@Component({
  selector: 'app-add-product-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product-modal.component.html',
  styleUrls: ['./add-product-modal.component.css']
})
export class AddProductModalComponent {
  @Input() isOpen = false;
  @Input() categories: Category[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveProduct = new EventEmitter<any>();

  productForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      specifications: this.fb.group({}),
      is_active: [true]
    });
  }

  get specificationsGroup(): FormGroup {
    return this.productForm.get('specifications') as FormGroup;
  }

  get specifications(): { [key: string]: AbstractControl } {
    return this.specificationsGroup.controls;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedImages = [...this.selectedImages, ...files];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.imagePreviewUrls.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);
  }

  addSpecification() {
    const newKey = `spec_${Object.keys(this.specifications).length}`;
    this.specificationsGroup.addControl(newKey, this.fb.control(''));
  }

  removeSpecification(key: string) {
    this.specificationsGroup.removeControl(key);
  }

  updateSpecificationKey(oldKey: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newKey = input.value;
    const control = this.specificationsGroup.get(oldKey);
    if (control) {
      const value = control.value;
      this.specificationsGroup.removeControl(oldKey);
      this.specificationsGroup.addControl(newKey, this.fb.control(value));
    }
  }

  async onSubmit() {
    if (this.productForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      try {
        const formData = {
          ...this.productForm.value,
          images: this.selectedImages
        };
        
        this.saveProduct.emit(formData);
        this.closeModal.emit();
      } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        this.errorMessage = 'Ürün eklenirken bir hata oluştu';
      } finally {
        this.isLoading = false;
      }
    }
  }

  onOverlayClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }
} 