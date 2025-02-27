import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../../models/product.model';
import { Category } from '../../../../models/category.model';

@Component({
  selector: 'app-edit-product-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-product-modal.component.html',
  styleUrls: ['./edit-product-modal.component.css']
})
export class EditProductModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() product!: Product;
  @Input() categories: Category[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveProduct = new EventEmitter<any>();

  productForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  selectedImages: File[] = [];
  imagePreviewUrls: (string | ArrayBuffer | null)[] = [];

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      original_price: [0, [Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      category_id: ['', Validators.required],
      specifications: this.fb.group({}),
      is_active: [true]
    });
  }

  ngOnInit() {
    if (this.product) {
      this.productForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price || 0,
        original_price: this.product.original_price || 0,
        stock: this.product.stock,
        category_id: this.product.category_id,
        is_active: this.product.is_active
      });

      const specificationsGroup = this.fb.group({});
      Object.entries(this.product.specifications || {}).forEach(([key, value]) => {
        specificationsGroup.addControl(key, this.fb.control(value));
      });
      this.productForm.setControl('specifications', specificationsGroup);

      this.imagePreviewUrls = this.product.images.map(img => 
        typeof img === 'string' ? img : URL.createObjectURL(img as File)
      );
    }
  }

  get specificationsGroup(): FormGroup {
    return this.productForm.get('specifications') as FormGroup;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      this.selectedImages.push(...files);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeImage(index: number) {
    if (index < this.product.images.length) {
      this.product.images.splice(index, 1);
    } else {
      const newImageIndex = index - this.product.images.length;
      this.selectedImages.splice(newImageIndex, 1);
      this.imagePreviewUrls.splice(newImageIndex, 1);
    }
  }

  addSpecification() {
    const newKey = `özellik${Object.keys(this.specificationsGroup.controls).length + 1}`;
    this.specificationsGroup.addControl(newKey, this.fb.control(''));
  }

  removeSpecification(key: string) {
    this.specificationsGroup.removeControl(key);
  }

  updateSpecificationKey(oldKey: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const newKey = input.value;
    const value = this.specificationsGroup.get(oldKey)?.value;
    
    if (newKey && newKey !== oldKey) {
      this.specificationsGroup.removeControl(oldKey);
      this.specificationsGroup.addControl(newKey, this.fb.control(value));
    }
  }

  async onSubmit() {
    if (this.productForm.valid) {
      try {
        this.isLoading = true;
        this.errorMessage = '';

        const formData = this.productForm.value;
        
        const changedValues = Object.keys(formData).reduce((acc: any, key) => {
          if (formData[key] !== this.product[key as keyof Product]) {
            if (typeof formData[key] === 'number') {
              acc[key] = formData[key];
            } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
              acc[key] = formData[key];
            }
          }
          return acc;
        }, {});

        const productData = {
          ...changedValues,
          images: this.product.images,
          newImages: this.selectedImages
        };

        this.saveProduct.emit(productData);
        this.closeModal.emit();
      } catch (error) {
        this.errorMessage = 'Ürün güncellenirken bir hata oluştu';
        console.error('Ürün güncelleme hatası:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  onOverlayClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-overlay')) {
      this.closeModal.emit();
    }
  }
} 