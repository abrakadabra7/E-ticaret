export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  parent?: Category;
  created_at: string;
  updated_at: string;
} 