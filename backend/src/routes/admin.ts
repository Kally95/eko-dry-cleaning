import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/auth';

const router = Router();

// Auth routes
router.post('/login', (req, res) => adminController.login(req, res));
router.get('/me', authenticateAdmin, (req, res) => adminController.getMe(req, res));

// Order management routes (all require authentication)
router.get('/orders', authenticateAdmin, (req, res) => adminController.searchOrders(req, res));
router.get('/orders/:orderId', authenticateAdmin, (req, res) => adminController.getOrder(req, res));
router.put('/orders/:orderId', authenticateAdmin, (req, res) => adminController.updateOrder(req, res));
router.post('/orders/:orderId/reprint', authenticateAdmin, (req, res) => adminController.reprintTicket(req, res));

// Statistics
router.get('/statistics', authenticateAdmin, (req, res) => adminController.getStatistics(req, res));

// Reference data
router.get('/companies', authenticateAdmin, (req, res) => adminController.getCompanies(req, res));
router.get('/sites', authenticateAdmin, (req, res) => adminController.getSites(req, res));

export default router;
