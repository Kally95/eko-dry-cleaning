import { PrismaClient, CreatedBy, OrderStatus } from '@prisma/client';
import { generateTicketReference } from '../utils/ticketReference';

const prisma = new PrismaClient();

export interface CreateOrderData {
  createdBy: CreatedBy;
  staffUserId?: string;
  companyId: string;
  siteId: string;
  firstName: string;
  lastName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  items: Array<{
    garmentTypeId: string;
    quantity: number;
  }>;
}

export interface UpdateOrderData {
  firstName?: string;
  lastName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  status?: OrderStatus;
  items?: Array<{
    garmentTypeId: string;
    quantity: number;
  }>;
}

export class OrderService {
  /**
   * Create a new order
   */
  async createOrder(data: CreateOrderData) {
    // Get the next sequence number
    const lastOrder = await prisma.order.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { ticketReference: true },
    });

    let sequenceNumber = 1;
    if (lastOrder) {
      const match = lastOrder.ticketReference.match(/^EKO-\d{4}-(\d{6})$/);
      if (match) {
        sequenceNumber = parseInt(match[1], 10) + 1;
      }
    }

    const ticketReference = generateTicketReference(sequenceNumber);

    // Create order with items
    const order = await prisma.order.create({
      data: {
        ticketReference,
        createdBy: data.createdBy,
        staffUserId: data.staffUserId,
        companyId: data.companyId,
        siteId: data.siteId,
        firstName: data.firstName,
        lastName: data.lastName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        notes: data.notes,
        pinValidated: true,
        pinValidatedAt: new Date(),
        items: {
          create: data.items.map((item) => ({
            garmentTypeId: item.garmentTypeId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        company: true,
        site: true,
        items: {
          include: {
            garmentType: true,
          },
        },
      },
    });

    // Log creation
    await prisma.orderChangeLog.create({
      data: {
        orderId: order.id,
        field: 'order',
        newValue: 'Order created',
        changeType: 'CREATE',
      },
    });

    return order;
  }

  /**
   * Record print attempt
   */
  async recordPrint(orderId: string, printedBy?: string) {
    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          printTriggered: true,
          printTriggeredAt: new Date(),
          printCount: { increment: 1 },
        },
      }),
      prisma.printLog.create({
        data: {
          orderId,
          printedBy,
        },
      }),
    ]);
  }

  /**
   * Get order by ID with all relations
   */
  async getOrderById(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        company: true,
        site: true,
        items: {
          include: {
            garmentType: true,
          },
        },
        printLogs: {
          orderBy: { printedAt: 'desc' },
        },
        changeLogs: {
          include: {
            adminUser: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Get order by ticket reference
   */
  async getOrderByTicketReference(ticketReference: string) {
    return await prisma.order.findUnique({
      where: { ticketReference },
      include: {
        company: true,
        site: true,
        items: {
          include: {
            garmentType: true,
          },
        },
      },
    });
  }

  /**
   * Search and filter orders (for admin panel)
   */
  async searchOrders(filters: {
    ticketReference?: string;
    customerName?: string;
    customerEmail?: string;
    companyId?: string;
    siteId?: string;
    status?: OrderStatus;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.ticketReference) {
      where.ticketReference = { contains: filters.ticketReference, mode: 'insensitive' };
    }
    if (filters.customerName) {
      // Search in both firstName and lastName
      where.OR = [
        { firstName: { contains: filters.customerName, mode: 'insensitive' } },
        { lastName: { contains: filters.customerName, mode: 'insensitive' } },
      ];
    }
    if (filters.customerEmail) {
      where.customerEmail = { contains: filters.customerEmail, mode: 'insensitive' };
    }
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    if (filters.siteId) {
      where.siteId = filters.siteId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: {
          company: true,
          site: true,
          items: {
            include: {
              garmentType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  /**
   * Update order (admin only)
   */
  async updateOrder(orderId: string, data: UpdateOrderData, adminUserId: string) {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      throw new Error('Order not found');
    }

    const changeLogs: any[] = [];

    // Track changes
    if (data.firstName && data.firstName !== existingOrder.firstName) {
      changeLogs.push({
        orderId,
        adminUserId,
        field: 'firstName',
        oldValue: existingOrder.firstName,
        newValue: data.firstName,
        changeType: 'UPDATE',
      });
    }
    if (data.lastName && data.lastName !== existingOrder.lastName) {
      changeLogs.push({
        orderId,
        adminUserId,
        field: 'lastName',
        oldValue: existingOrder.lastName,
        newValue: data.lastName,
        changeType: 'UPDATE',
      });
    }
    if (data.customerPhone && data.customerPhone !== existingOrder.customerPhone) {
      changeLogs.push({
        orderId,
        adminUserId,
        field: 'customerPhone',
        oldValue: existingOrder.customerPhone,
        newValue: data.customerPhone,
        changeType: 'UPDATE',
      });
    }
    if (data.customerEmail && data.customerEmail !== existingOrder.customerEmail) {
      changeLogs.push({
        orderId,
        adminUserId,
        field: 'customerEmail',
        oldValue: existingOrder.customerEmail,
        newValue: data.customerEmail,
        changeType: 'UPDATE',
      });
    }
    if (data.notes !== undefined && data.notes !== existingOrder.notes) {
      changeLogs.push({
        orderId,
        adminUserId,
        field: 'notes',
        oldValue: existingOrder.notes || '',
        newValue: data.notes,
        changeType: 'UPDATE',
      });
    }
    if (data.status && data.status !== existingOrder.status) {
      changeLogs.push({
        orderId,
        adminUserId,
        field: 'status',
        oldValue: existingOrder.status,
        newValue: data.status,
        changeType: 'STATUS_CHANGE',
      });
    }

    // Update order
    const updateData: any = {};
    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.customerPhone) updateData.customerPhone = data.customerPhone;
    if (data.customerEmail) updateData.customerEmail = data.customerEmail;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.status) updateData.status = data.status;

    const updated = await prisma.$transaction(async (tx) => {
      // Update items if provided
      if (data.items) {
        // Delete existing items
        await tx.orderItem.deleteMany({ where: { orderId } });
        // Create new items
        await tx.orderItem.createMany({
          data: data.items.map((item) => ({
            orderId,
            garmentTypeId: item.garmentTypeId,
            quantity: item.quantity,
          })),
        });

        changeLogs.push({
          orderId,
          adminUserId,
          field: 'items',
          oldValue: JSON.stringify(existingOrder.items),
          newValue: JSON.stringify(data.items),
          changeType: 'UPDATE',
        });
      }

      // Log all changes
      if (changeLogs.length > 0) {
        await tx.orderChangeLog.createMany({ data: changeLogs });
      }

      // Update order
      return await tx.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          company: true,
          site: true,
          items: {
            include: {
              garmentType: true,
            },
          },
        },
      });
    });

    return updated;
  }

  /**
   * Get order statistics
   */
  async getStatistics() {
    const [total, byStatus] = await prisma.$transaction([
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const orderService = new OrderService();
