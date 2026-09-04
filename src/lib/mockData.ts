export interface MockProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface MockUser {
  id: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'CASHIER';
}

export interface MockOrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    sku: string;
  };
}

export interface MockOrder {
  id: string;
  totalAmount: number;
  createdAt: string;
  cashier: {
    email: string;
    role: string;
  };
  items: MockOrderItem[];
}

export const INITIAL_USERS: MockUser[] = [
  {
    id: 'user-admin',
    email: 'admin@pos.com',
    password: 'admin123',
    role: 'ADMIN',
  },
  {
    id: 'user-cashier',
    email: 'cashier@pos.com',
    password: 'cashier123',
    role: 'CASHIER',
  },
];

export const INITIAL_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-001',
    name: 'Cream Cracker',
    sku: 'GRO-001',
    price: 240.0,
    stockQuantity: 80,
    imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&q=80',
  },
  {
    id: 'prod-002',
    name: 'Milk Powder',
    sku: 'GRO-002',
    price: 1050.0,
    stockQuantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80',
  },
  {
    id: 'prod-003',
    name: 'Ginger Beer',
    sku: 'BEV-001',
    price: 160.0,
    stockQuantity: 100,
    imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=80',
  },
  {
    id: 'prod-004',
    name: 'Samaposha',
    sku: 'GRO-003',
    price: 190.0,
    stockQuantity: 65,
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80',
  },
  {
    id: 'prod-005',
    name: 'Marie Biscuits',
    sku: 'GRO-004',
    price: 120.0,
    stockQuantity: 90,
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80',
  },
  {
    id: 'prod-006',
    name: 'Fresh Milk',
    sku: 'DAI-001',
    price: 480.0,
    stockQuantity: 30,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80',
  },
  {
    id: 'prod-007',
    name: 'Ceylon Tea',
    sku: 'BEV-002',
    price: 620.0,
    stockQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80',
  },
  {
    id: 'prod-008',
    name: 'Fruit Jam',
    sku: 'GRO-005',
    price: 540.0,
    stockQuantity: 35,
    imageUrl: 'https://images.unsplash.com/photo-1590497008127-d46779b5c308?w=300&q=80',
  },
  {
    id: 'prod-009',
    name: 'Tomato Sauce',
    sku: 'GRO-006',
    price: 450.0,
    stockQuantity: 40,
    imageUrl: 'https://images.unsplash.com/photo-1607301406259-dfb186e15de8?w=300&q=80',
  },
  {
    id: 'prod-010',
    name: 'Sunlight Soap',
    sku: 'HOU-001',
    price: 380.0,
    stockQuantity: 60,
    imageUrl: 'https://images.unsplash.com/photo-1607006482172-46631e8c7512?w=300&q=80',
  },
  {
    id: 'prod-011',
    name: 'Flavoured Milk',
    sku: 'DAI-003',
    price: 140.0,
    stockQuantity: 75,
    imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=300&q=80',
  },
  {
    id: 'prod-012',
    name: 'Kahata Tea',
    sku: 'BEV-003',
    price: 390.0,
    stockQuantity: 50,
    imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&q=80',
  },
  {
    id: 'prod-013',
    name: 'Butter',
    sku: 'DAI-002',
    price: 890.0,
    stockQuantity: 4,
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&q=80',
  },
  {
    id: 'prod-014',
    name: 'Chicken Sausages',
    sku: 'FRZ-001',
    price: 1180.0,
    stockQuantity: 3,
    imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300&q=80',
  },
  {
    id: 'prod-015',
    name: 'Roasted Coffee',
    sku: 'BEV-004',
    price: 420.0,
    stockQuantity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80',
  },
  {
    id: 'prod-016',
    name: 'Wheat Flour',
    sku: 'GRO-007',
    price: 320.0,
    stockQuantity: 0,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80',
  },
  {
    id: 'prod-017',
    name: 'Tea Bags',
    sku: 'BEV-005',
    price: 950.0,
    stockQuantity: 0,
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80',
  },
  {
    id: 'prod-018',
    name: 'Milo Powder',
    sku: 'BEV-006',
    price: 1120.0,
    stockQuantity: 0,
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&q=80',
  },
];

export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: 'ORD-9021',
    totalAmount: 1870.0,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    cashier: {
      email: 'cashier@pos.com',
      role: 'CASHIER',
    },
    items: [
      {
        id: 'item-1',
        quantity: 2,
        price: 240.0,
        product: { name: 'Cream Cracker', sku: 'GRO-001' },
      },
      {
        id: 'item-2',
        quantity: 1,
        price: 1050.0,
        product: { name: 'Milk Powder', sku: 'GRO-002' },
      },
      {
        id: 'item-3',
        quantity: 2,
        price: 170.0,
        product: { name: 'Ginger Beer', sku: 'BEV-001' },
      },
    ],
  },
  {
    id: 'ORD-9022',
    totalAmount: 1100.0,
    createdAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    cashier: {
      email: 'cashier@pos.com',
      role: 'CASHIER',
    },
    items: [
      {
        id: 'item-4',
        quantity: 1,
        price: 480.0,
        product: { name: 'Fresh Milk', sku: 'DAI-001' },
      },
      {
        id: 'item-5',
        quantity: 1,
        price: 620.0,
        product: { name: 'Ceylon Tea', sku: 'BEV-002' },
      },
    ],
  },
];
