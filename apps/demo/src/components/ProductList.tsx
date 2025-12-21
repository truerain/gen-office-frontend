import { useEffect, useState } from 'react';
import { productApi } from '../api/products';
import type { Product } from '../mocks/data/products';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@gen-office/ui';

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    loadProducts();
  }, [category]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productApi.getProducts(category || undefined);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = async (id: string) => {
    const product = await productApi.getProduct(id);
    if (product) {
      alert(
        `제품 상세:\n` +
        `이름: ${product.name}\n` +
        `가격: ${product.price.toLocaleString()}원\n` +
        `재고: ${product.stock}개\n` +
        `설명: ${product.description}`
      );
    }
  };

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>제품 목록 ({products.length}개)</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={category === '' ? 'default' : 'outline'}
              onClick={() => setCategory('')}
            >
              전체
            </Button>
            <Button
              size="sm"
              variant={category === '전자제품' ? 'default' : 'outline'}
              onClick={() => setCategory('전자제품')}
            >
              전자제품
            </Button>
            <Button
              size="sm"
              variant={category === '가전제품' ? 'default' : 'outline'}
              onClick={() => setCategory('가전제품')}
            >
              가전제품
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <p className="text-2xl font-bold text-primary-700 mb-2">
                ₩{product.price.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  재고: <strong>{product.stock}</strong>개
                </span>
                <Button
                  size="sm"
                  onClick={() => handleViewProduct(product.id)}
                >
                  상세보기
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};