export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'LG 그램 노트북',
    category: '전자제품',
    price: 1500000,
    stock: 25,
    description: '가볍고 성능 좋은 노트북',
  },
  {
    id: '2',
    name: 'LG 울트라기어 모니터',
    category: '전자제품',
    price: 450000,
    stock: 15,
    description: '게이밍 모니터',
  },
  {
    id: '3',
    name: 'LG 스탠바이미',
    category: '가전제품',
    price: 1200000,
    stock: 10,
    description: '이동식 스마트 TV',
  },
];