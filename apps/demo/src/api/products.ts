import type { Product } from '../mocks/data/products';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const productApi = {
  // 전체 제품 조회
  getProducts: async (category?: string): Promise<Product[]> => {
    const url = category ? `/api/products?category=${category}` : '/api/products';
    const response = await fetch(url);
    const json: ApiResponse<Product[]> = await response.json();
    return json.data || [];
  },

  // 특정 제품 조회
  getProduct: async (id: string): Promise<Product | null> => {
    const response = await fetch(`/api/products/${id}`);
    const json: ApiResponse<Product> = await response.json();
    return json.data || null;
  },
};