// FAQ Types
export type FAQ = {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
};

// Category Types
export type Category = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  is_active: boolean;
};

// User Types
export type User = {
  id: number;
  username: string;
  is_admin: boolean;
};

// AUTH TYPES - USING TYPE ALIAS FOR BETTER MODULE RESOLUTION
export type AuthResponse = {
  access_token: string;
  user: User;
};

// Pagination Types
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
};

// Stats Types
export type FAQStats = {
  total_faqs: number;
  total_categories: number;
  category_breakdown: Array<{
    category: string;
    count: number;
  }>;
};

// Form Data Types
export type FAQFormData = {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  order: number;
  attachments?: FAQAttachment[];
};

export type FAQAttachment = {
  id: number;
  url: string;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
};