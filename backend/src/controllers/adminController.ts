import { Response } from 'express';
import { PrismaClient, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { orderService } from '../services/orderService';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const updateOrderSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  customerPhone: z.string()
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .regex(/^0/, 'UK phone number must start with 0')
    .min(10, 'UK phone number must be at least 10 digits')
    .max(11, 'UK phone number must be at most 11 digits')
    .refine((val) => !/\s/.test(val), 'Phone number must not contain spaces')
    .optional(),
  customerEmail: z.string().email().optional(),
  notes: z.string().optional(),
  status: z.enum(['SUBMITTED', 'IN_CLEANING', 'READY_FOR_COLLECTION', 'COLLECTED', 'CANCELLED']).optional(),
  items: z.array(
    z.object({
      garmentTypeId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).optional(),
});

export class AdminController {
  /**
   * Admin login
   */
  async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const admin = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (!admin) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, admin.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const secret = process.env.JWT_SECRET || 'default-secret-change-in-production';
      const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
        secret,
        { expiresIn }
      );

      res.json({
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  /**
   * Get current admin user
   */
  async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.adminUser) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      res.json(req.adminUser);
    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  }

  /**
   * Search orders with filters
   */
  async searchOrders(req: AuthRequest, res: Response) {
    try {
      const {
        ticketReference,
        customerName,
        customerEmail,
        companyId,
        siteId,
        status,
        dateFrom,
        dateTo,
        limit,
        offset,
      } = req.query;

      const filters: any = {};

      if (ticketReference) filters.ticketReference = ticketReference as string;
      if (customerName) filters.customerName = customerName as string;
      if (customerEmail) filters.customerEmail = customerEmail as string;
      if (companyId) filters.companyId = companyId as string;
      if (siteId) filters.siteId = siteId as string;
      if (status) filters.status = status as OrderStatus;
      if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
      if (dateTo) filters.dateTo = new Date(dateTo as string);
      if (limit) filters.limit = parseInt(limit as string);
      if (offset) filters.offset = parseInt(offset as string);

      const result = await orderService.searchOrders(filters);

      res.json(result);
    } catch (error) {
      console.error('Search orders error:', error);
      res.status(500).json({ error: 'Failed to search orders' });
    }
  }

  /**
   * Get order by ID with full details
   */
  async getOrder(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;

      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  }

  /**
   * Update order
   */
  async updateOrder(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;
      const validatedData = updateOrderSchema.parse(req.body);

      if (!req.adminUser) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const updated = await orderService.updateOrder(
        orderId,
        validatedData,
        req.adminUser.id
      );

      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      console.error('Update order error:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }

  /**
   * Record ticket reprint
   */
  async reprintTicket(req: AuthRequest, res: Response) {
    try {
      const { orderId } = req.params;

      if (!req.adminUser) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      await orderService.recordPrint(orderId, `admin:${req.adminUser.email}`);

      res.json({ success: true });
    } catch (error) {
      console.error('Reprint ticket error:', error);
      res.status(500).json({ error: 'Failed to record reprint' });
    }
  }

  /**
   * Get statistics
   */
  async getStatistics(req: AuthRequest, res: Response) {
    try {
      const stats = await orderService.getStatistics();
      res.json(stats);
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({ error: 'Failed to get statistics' });
    }
  }

  /**
   * Get all companies (for filters)
   */
  async getCompanies(req: AuthRequest, res: Response) {
    try {
      const companies = await prisma.company.findMany({
        orderBy: { name: 'asc' },
      });
      res.json(companies);
    } catch (error) {
      console.error('Get companies error:', error);
      res.status(500).json({ error: 'Failed to get companies' });
    }
  }

  /**
   * Get all sites (for filters)
   */
  async getSites(req: AuthRequest, res: Response) {
    try {
      const { companyId } = req.query;

      const where = companyId ? { companyId: companyId as string } : {};

      const sites = await prisma.site.findMany({
        where,
        include: {
          company: true,
        },
        orderBy: { name: 'asc' },
      });

      res.json(sites);
    } catch (error) {
      console.error('Get sites error:', error);
      res.status(500).json({ error: 'Failed to get sites' });
    }
  }
}

export const adminController = new AdminController();
