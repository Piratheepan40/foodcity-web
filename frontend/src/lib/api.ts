import { mockStorage } from './mockStorage';

// Simulated realistic micro-delay for smooth UI spinner feedback
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createAxiosError(message: string, status = 400) {
  const error: any = new Error(message);
  error.response = {
    status,
    data: {
      message,
      statusCode: status,
    },
  };
  return error;
}

export const api = {
  // Mock Axios interceptors in case referenced
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },

  async get<T = any>(url: string, config?: { params?: Record<string, any> }): Promise<{ data: T }> {
    await delay(120);

    // GET /products
    if (url === '/products' || url.startsWith('/products?')) {
      const search = config?.params?.search;
      const products = mockStorage.getProducts(search);
      return { data: products as unknown as T };
    }

    // GET /orders
    if (url === '/orders') {
      const orders = mockStorage.getOrders();
      return { data: orders as unknown as T };
    }

    throw createAxiosError(`Endpoint not found: GET ${url}`, 404);
  },

  async post<T = any>(url: string, data?: any): Promise<{ data: T }> {
    await delay(150);

    // POST /auth/login
    if (url === '/auth/login') {
      try {
        const result = mockStorage.login(data.email, data.password);
        return { data: result as unknown as T };
      } catch (err: any) {
        throw createAxiosError(err.message || 'Invalid email or password', 401);
      }
    }

    // POST /auth/register
    if (url === '/auth/register') {
      try {
        const result = mockStorage.register(data.email, data.password, data.role);
        return { data: result as unknown as T };
      } catch (err: any) {
        throw createAxiosError(err.message || 'Registration failed', 400);
      }
    }

    // POST /products
    if (url === '/products') {
      try {
        const newProduct = mockStorage.createProduct(data);
        return { data: newProduct as unknown as T };
      } catch (err: any) {
        throw createAxiosError(err.message || 'Failed to create product', 400);
      }
    }

    // POST /orders
    if (url === '/orders') {
      try {
        const order = mockStorage.createOrder(data);
        return { data: order as unknown as T };
      } catch (err: any) {
        throw createAxiosError(err.message || 'Failed to create order', 400);
      }
    }

    throw createAxiosError(`Endpoint not found: POST ${url}`, 404);
  },

  async patch<T = any>(url: string, data?: any): Promise<{ data: T }> {
    await delay(150);

    // PATCH /products/:id
    if (url.startsWith('/products/')) {
      const id = url.replace('/products/', '');
      try {
        const updated = mockStorage.updateProduct(id, data);
        return { data: updated as unknown as T };
      } catch (err: any) {
        throw createAxiosError(err.message || 'Failed to update product', 400);
      }
    }

    throw createAxiosError(`Endpoint not found: PATCH ${url}`, 404);
  },

  async delete<T = any>(url: string): Promise<{ data: T }> {
    await delay(120);

    // DELETE /products/:id
    if (url.startsWith('/products/')) {
      const id = url.replace('/products/', '');
      try {
        const result = mockStorage.deleteProduct(id);
        return { data: result as unknown as T };
      } catch (err: any) {
        throw createAxiosError(err.message || 'Failed to delete product', 400);
      }
    }

    throw createAxiosError(`Endpoint not found: DELETE ${url}`, 404);
  },
};
