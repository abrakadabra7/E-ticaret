import { Category } from './category.model';

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  category?: Category;
  images: string[];
  specifications: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
} 