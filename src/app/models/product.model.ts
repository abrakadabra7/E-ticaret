import { Category } from './category.model';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  stock: number;
  category_id: string;
  category?: Category;
  images: (string | File)[];
  newImages?: File[];
  specifications: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
} 