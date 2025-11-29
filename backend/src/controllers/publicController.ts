import { Request, Response } from 'express';
import { PrismaClient, CreatedBy } from '@prisma/client';
import { z } from 'zod';
import { orderService } from '../services/orderService';

const prisma = new PrismaClient();

// Validation schemas
const createOrderSchema = z.object({
  createdBy: z.enum(['CUSTOMER', 'STAFF']),
  staffUserId: z.string().optional(),
  companyId: z.string(),
  siteId: z.string(),
  sitePin: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  customerPhone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\d+$/, 'Phone number must contain only digits')
    .regex(/^0/, 'UK phone number must start with 0')
    .min(10, 'UK phone number must be at least 10 digits')
    .max(11, 'UK phone number must be at most 11 digits')
    .refine((val) => !/\s/.test(val), 'Phone number must not contain spaces'),
  customerEmail: z.string().email('Valid email is required'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      garmentTypeId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'At least one item is required'),
});

export class PublicController {
  /**
   * Get all companies
   */
  async getCompanies(req: Request, res: Response) {
    try {
      const companies = await prisma.company.findMany({
        orderBy: { name: 'asc' },
      });
      res.json(companies);
    } catch (error) {
      console.error('Error fetching companies:', error);
      res.status(500).json({ error: 'Failed to fetch companies' });
    }
  }

  /**
   * Get sites for a company
   */
  async getSites(req: Request, res: Response) {
    try {
      const { companyId } = req.params;

      const sites = await prisma.site.findMany({
        where: { companyId },
        select: {
          id: true,
          name: true,
          address: true,
          companyId: true,
          // Don't expose PIN in list
        },
        orderBy: { name: 'asc' },
      });

      res.json(sites);
    } catch (error) {
      console.error('Error fetching sites:', error);
      res.status(500).json({ error: 'Failed to fetch sites' });
    }
  }

  /**
   * Verify site PIN (legacy - for existing flow)
   */
  async verifySitePin(req: Request, res: Response) {
    try {
      const { siteId, pin } = req.body;

      if (!siteId || !pin) {
        return res.status(400).json({ error: 'Site ID and PIN are required' });
      }

      const site = await prisma.site.findUnique({
        where: { id: siteId },
        select: { pin: true },
      });

      if (!site) {
        return res.status(404).json({ error: 'Site not found' });
      }

      const isValid = site.pin === pin;
      res.json({ valid: isValid });
    } catch (error) {
      console.error('Error verifying PIN:', error);
      res.status(500).json({ error: 'Failed to verify PIN' });
    }
  }

  /**
   * Login with PIN only - returns site and company information
   * This is the new PIN-based login that doesn't require selecting company/site first
   */
  async loginWithPin(req: Request, res: Response) {
    try {
      const { pin } = req.body;

      if (!pin) {
        return res.status(400).json({ error: 'PIN is required' });
      }

      const site = await prisma.site.findUnique({
        where: { pin },
        include: {
          company: true,
        },
      });

      if (!site) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }

      // Return site and company information (without the PIN)
      const { pin: _, ...siteWithoutPin } = site;
      res.json(siteWithoutPin);
    } catch (error) {
      console.error('Error logging in with PIN:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }

  /**
   * Get all garment types
   */
  async getGarmentTypes(req: Request, res: Response) {
    try {
      const garmentTypes = await prisma.garmentType.findMany({
        where: { active: true },
        orderBy: { displayOrder: 'asc' },
      });
      res.json(garmentTypes);
    } catch (error) {
      console.error('Error fetching garment types:', error);
      res.status(500).json({ error: 'Failed to fetch garment types' });
    }
  }

  /**
   * Create a new order
   */
  async createOrder(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData = createOrderSchema.parse(req.body);

      // Verify site PIN
      const site = await prisma.site.findUnique({
        where: { id: validatedData.siteId },
        select: { pin: true, companyId: true },
      });

      if (!site) {
        return res.status(404).json({ error: 'Site not found' });
      }

      if (site.pin !== validatedData.sitePin) {
        return res.status(401).json({ error: 'Invalid site PIN' });
      }

      if (site.companyId !== validatedData.companyId) {
        return res.status(400).json({ error: 'Site does not belong to selected company' });
      }

      // Create order
      const order = await orderService.createOrder({
        createdBy: validatedData.createdBy as CreatedBy,
        staffUserId: validatedData.staffUserId,
        companyId: validatedData.companyId,
        siteId: validatedData.siteId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        customerPhone: validatedData.customerPhone,
        customerEmail: validatedData.customerEmail,
        notes: validatedData.notes,
        items: validatedData.items,
      });

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors,
        });
      }
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  }

  /**
   * Record print attempt
   */
  async recordPrint(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const printedBy = req.ip || req.headers['x-forwarded-for'] as string;

      await orderService.recordPrint(orderId, printedBy);

      res.json({ success: true });
    } catch (error) {
      console.error('Error recording print:', error);
      res.status(500).json({ error: 'Failed to record print' });
    }
  }

  /**
   * Get order by ID (for success screen)
   */
  async getOrder(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      const order = await orderService.getOrderById(orderId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }
}

export const publicController = new PublicController();
