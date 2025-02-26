export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  image?: File;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
} 