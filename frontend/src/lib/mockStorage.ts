import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_ORDERS,
  MockProduct,
  MockUser,
  MockOrder,
} from './mockData';

const PRODUCTS_KEY = 'pos_mock_products';
const ORDERS_KEY = 'pos_mock_orders';
const USERS_KEY = 'pos_mock_users';

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage, using default`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

export const mockStorage = {
  // Ensure default datasets are populated
  init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(PRODUCTS_KEY)) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(ORDERS_KEY)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
  },

  // Auth Operations
  login(email: string, password: string): { access_token: string; user: { id: string; email: string; role: 'ADMIN' | 'CASHIER' } } {
    this.init();
    const users = getFromStorage<MockUser[]>(USERS_KEY, INITIAL_USERS);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!found) {
      // Fallback convenience match for default demo passwords
      if (email.toLowerCase() === 'admin@pos.com' && password === 'admin123') {
        const user = { id: 'user-admin', email: 'admin@pos.com', role: 'ADMIN' as const };
        return {
          access_token: 'mock-token-admin-' + Date.now(),
          user,
        };
      }
      if (email.toLowerCase() === 'cashier@pos.com' && password === 'cashier123') {
        const user = { id: 'user-cashier', email: 'cashier@pos.com', role: 'CASHIER' as const };
        return {
          access_token: 'mock-token-cashier-' + Date.now(),
          user,
        };
      }
      throw new Error('Invalid email or password');
    }

    return {
      access_token: `mock-token-${found.role.toLowerCase()}-${Date.now()}`,
      user: {
        id: found.id,
        email: found.email,
        role: found.role,
      },
    };
  },

  register(email: string, password: string, role: 'ADMIN' | 'CASHIER' = 'CASHIER') {
    this.init();
    const users = getFromStorage<MockUser[]>(USERS_KEY, INITIAL_USERS);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('User with this email already exists');
    }

    const newUser: MockUser = {
      id: `usr-${Date.now()}`,
      email,
      password,
      role,
    };

    users.push(newUser);
    saveToStorage(USERS_KEY, users);

    return {
      access_token: `mock-token-${role.toLowerCase()}-${Date.now()}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
    };
  },

  // Products Operations
  getProducts(search?: string): MockProduct[] {
    this.init();
    const products = getFromStorage<MockProduct[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    if (!search || !search.trim()) {
      return products;
    }
    const query = search.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    );
  },

  createProduct(data: { name: string; sku: string; price: number; stockQuantity: number; imageUrl?: string }): MockProduct {
    this.init();
    const products = getFromStorage<MockProduct[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    
    // Check SKU uniqueness
    if (products.some((p) => p.sku.toLowerCase() === data.sku.toLowerCase())) {
      throw new Error(`Product with SKU '${data.sku}' already exists.`);
    }

    const newProduct: MockProduct = {
      id: `prod-${Date.now()}`,
      name: data.name.trim(),
      sku: data.sku.trim().toUpperCase(),
      price: Number(data.price),
      stockQuantity: Number(data.stockQuantity),
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&q=80',
    };

    products.unshift(newProduct);
    saveToStorage(PRODUCTS_KEY, products);
    return newProduct;
  },

  updateProduct(id: string, updates: Partial<MockProduct>): MockProduct {
    this.init();
    const products = getFromStorage<MockProduct[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Product not found');
    }

    const current = products[index];
    const updated: MockProduct = {
      ...current,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : current.price,
      stockQuantity:
        updates.stockQuantity !== undefined
          ? Number(updates.stockQuantity)
          : current.stockQuantity,
    };

    products[index] = updated;
    saveToStorage(PRODUCTS_KEY, products);
    return updated;
  },

  deleteProduct(id: string): { success: boolean } {
    this.init();
    const products = getFromStorage<MockProduct[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    const filtered = products.filter((p) => p.id !== id);
    saveToStorage(PRODUCTS_KEY, filtered);
    return { success: true };
  },

  // Orders & Billing Operations
  getOrders(): MockOrder[] {
    this.init();
    const orders = getFromStorage<MockOrder[]>(ORDERS_KEY, INITIAL_ORDERS);
    return [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  createOrder(orderPayload: { items: { productId: string; quantity: number }[] }): MockOrder {
    this.init();
    const products = getFromStorage<MockProduct[]>(PRODUCTS_KEY, INITIAL_PRODUCTS);
    const orders = getFromStorage<MockOrder[]>(ORDERS_KEY, INITIAL_ORDERS);

    // Get current cashier from pos_user if available
    let currentCashier = { email: 'cashier@pos.com', role: 'CASHIER' };
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('pos_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          currentCashier = {
            email: parsed.email || 'cashier@pos.com',
            role: parsed.role || 'CASHIER',
          };
        }
      } catch (e) {
        // fallback to default cashier
      }
    }

    const orderItems: MockOrder['items'] = [];
    let totalAmount = 0;

    // Validate and build items
    for (const item of orderPayload.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product not found (ID: ${item.productId})`);
      }
      if (product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
      }

      // Decrement stock
      product.stockQuantity -= item.quantity;
      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        quantity: item.quantity,
        price: product.price,
        product: {
          name: product.name,
          sku: product.sku,
        },
      });
    }

    // Save updated products stock
    saveToStorage(PRODUCTS_KEY, products);

    // Create Order Record
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const newOrder: MockOrder = {
      id: `ORD-${orderNumber}`,
      totalAmount,
      createdAt: new Date().toISOString(),
      cashier: currentCashier,
      items: orderItems,
    };

    orders.unshift(newOrder);
    saveToStorage(ORDERS_KEY, orders);

    return newOrder;
  },
};
