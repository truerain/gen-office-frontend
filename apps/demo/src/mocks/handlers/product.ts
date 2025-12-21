import { http, HttpResponse } from 'msw';
import { mockProducts } from '../data/products';

export const productHandlers = [
  // GET /api/products
  http.get('/api/products', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let filteredProducts = mockProducts;

    if (category) {
      filteredProducts = mockProducts.filter(
        (p) => p.category === category
      );
    }

    // 지연 시뮬레이션 (실제 API처럼)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          HttpResponse.json({
            success: true,
            data: filteredProducts,
          })
        );
      }, 500); // 500ms 지연
    });
  }),

  // GET /api/products/:id
  http.get('/api/products/:id', ({ params }) => {
    const { id } = params;
    const product = mockProducts.find((p) => p.id === id);

    if (!product) {
      return HttpResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: product,
    });
  }),
];