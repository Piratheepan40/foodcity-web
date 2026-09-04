import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(cashierId: string, dto: CreateOrderDto) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Fetch products
    const productIds = dto.items.map((i) => i.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Check availability and stock
    let totalAmount = 0;
    const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

    for (const item of dto.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundException(`Product with ID '${item.productId}' not found`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for '${product.name}'. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Execute atomic transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Order
      const order = await tx.order.create({
        data: {
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          cashierId: cashierId,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          cashier: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });

      // 2. Decrement inventory stock dynamically
      for (const item of dto.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        cashier: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        cashier: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID '${id}' not found`);
    }

    return order;
  }
}
