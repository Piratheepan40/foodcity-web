import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding FoodCity Products with concise names and images...');

  // Password hashes
  const adminPassword = await bcrypt.hash('admin123', 10);
  const cashierPassword = await bcrypt.hash('cashier123', 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: {
      email: 'admin@pos.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@pos.com' },
    update: {},
    create: {
      email: 'cashier@pos.com',
      password: cashierPassword,
      role: 'CASHIER',
    },
  });

  console.log(`Created users: Admin (${admin.email}), Cashier (${cashier.email})`);

  // FoodCity Sri Lanka Supermarket Products (with Image URLs)
  const foodCityProducts = [
    // --- IN STOCK ITEMS ---
    { name: 'Cream Cracker', sku: 'GRO-001', price: 240.00, stockQuantity: 80, imageUrl: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&q=80' },
    { name: 'Milk Powder', sku: 'GRO-002', price: 1050.00, stockQuantity: 50, imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&q=80' },
    { name: 'Ginger Beer', sku: 'BEV-001', price: 160.00, stockQuantity: 100, imageUrl: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=80' },
    { name: 'Samaposha', sku: 'GRO-003', price: 190.00, stockQuantity: 65, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80' },
    { name: 'Marie Biscuits', sku: 'GRO-004', price: 120.00, stockQuantity: 90, imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&q=80' },
    { name: 'Fresh Milk', sku: 'DAI-001', price: 480.00, stockQuantity: 30, imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&q=80' },
    { name: 'Ceylon Tea', sku: 'BEV-002', price: 620.00, stockQuantity: 45, imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80' },
    { name: 'Fruit Jam', sku: 'GRO-005', price: 540.00, stockQuantity: 35, imageUrl: 'https://images.unsplash.com/photo-1590497008127-d46779b5c308?w=300&q=80' },
    { name: 'Tomato Sauce', sku: 'GRO-006', price: 450.00, stockQuantity: 40, imageUrl: 'https://images.unsplash.com/photo-1607301406259-dfb186e15de8?w=300&q=80' },
    { name: 'Sunlight Soap', sku: 'HOU-001', price: 380.00, stockQuantity: 60, imageUrl: 'https://images.unsplash.com/photo-1607006482172-46631e8c7512?w=300&q=80' },
    { name: 'Flavoured Milk', sku: 'DAI-003', price: 140.00, stockQuantity: 75, imageUrl: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?w=300&q=80' },
    { name: 'Kahata Tea', sku: 'BEV-003', price: 390.00, stockQuantity: 50, imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=300&q=80' },

    // --- LOW STOCK ITEMS (<= 5) ---
    { name: 'Butter', sku: 'DAI-002', price: 890.00, stockQuantity: 3, imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&q=80' },
    { name: 'Chicken Sausages', sku: 'FRZ-001', price: 1180.00, stockQuantity: 2, imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=300&q=80' },
    { name: 'Roasted Coffee', sku: 'BEV-004', price: 420.00, stockQuantity: 4, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&q=80' },

    // --- OUT OF STOCK ITEMS (0) ---
    { name: 'Wheat Flour', sku: 'GRO-007', price: 320.00, stockQuantity: 0, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80' },
    { name: 'Tea Bags', sku: 'BEV-005', price: 950.00, stockQuantity: 0, imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&q=80' },
    { name: 'Milo Powder', sku: 'BEV-006', price: 1120.00, stockQuantity: 0, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&q=80' },
  ];

  for (const item of foodCityProducts) {
    await prisma.product.upsert({
      where: { sku: item.sku },
      update: {
        name: item.name,
        price: item.price,
        stockQuantity: item.stockQuantity,
        imageUrl: item.imageUrl,
      },
      create: item,
    });
  }

  console.log(`Seeded ${foodCityProducts.length} FoodCity products with images successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
