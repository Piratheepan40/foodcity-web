import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'online',
      name: 'Quman POS & Inventory REST API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          register: 'POST /auth/register',
          profile: 'GET /auth/me',
        },
        products: {
          list: 'GET /products',
          create: 'POST /products (ADMIN only)',
          update: 'PATCH /products/:id (ADMIN only)',
          delete: 'DELETE /products/:id (ADMIN only)',
        },
        orders: {
          checkout: 'POST /orders',
          list: 'GET /orders (ADMIN only)',
          receipt: 'GET /orders/:id',
        },
      },
    };
  }
}
