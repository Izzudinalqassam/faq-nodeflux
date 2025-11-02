import axios from 'axios';
import type { FAQ, Category, AuthResponse, User, PaginatedResponse, FAQStats, FAQFormData } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  register: async (username: string, password: string): Promise<void> => {
    await api.post('/auth/register', { username, password });
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// FAQ services
export const faqService = {
  getFAQs: async (params?: {
    category?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginatedResponse<FAQ>> => {
    const response = await api.get('/faqs', { params });
    return {
      data: response.data.faqs,
      pagination: response.data.pagination,
    };
  },

  getFAQ: async (id: number): Promise<FAQ> => {
    const response = await api.get(`/faqs/${id}`);
    return response.data;
  },

  createFAQ: async (data: FAQFormData): Promise<FAQ> => {
    const response = await api.post('/faqs', data);
    return response.data;
  },

  updateFAQ: async (id: number, data: Partial<FAQFormData>): Promise<FAQ> => {
    const response = await api.put(`/faqs/${id}`, data);
    return response.data;
  },

  deleteFAQ: async (id: number): Promise<void> => {
    await api.delete(`/faqs/${id}`);
  },
};

// Category services
export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  createCategory: async (data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    order?: number;
  }): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: Partial<{
    name: string;
    description: string;
    icon: string;
    color: string;
    order: number;
    is_active: boolean;
  }>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },
};

// Stats service
export const statsService = {
  getStats: async (): Promise<FAQStats> => {
    const response = await api.get('/stats');
    return response.data;
  },
};

// Feedback services
export const feedbackService = {
  submitRating: async (faqId: number, rating: number) => {
    const response = await api.post(`/faqs/${faqId}/rating`, { rating });
    return response.data;
  },

  submitFeedback: async (faqId: number, feedbackData: {
    feedback_text: string;
    contact_email?: string;
    rating_id?: number;
    is_helpful?: boolean;
  }) => {
    const response = await api.post(`/faqs/${faqId}/feedback`, feedbackData);
    return response.data;
  },

  getFAQRatings: async (faqId: number) => {
    const response = await api.get(`/faqs/${faqId}/ratings`);
    return response.data;
  },

  getFAQFeedbacks: async (faqId: number, params?: { page?: number; per_page?: number }) => {
    const response = await api.get(`/faqs/${faqId}/feedbacks`, { params });
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;