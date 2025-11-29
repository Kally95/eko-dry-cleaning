import { Router } from 'express';
import { publicController } from '../controllers/publicController';

const router = Router();

// Public routes for ticket creation
router.get('/companies', (req, res) => publicController.getCompanies(req, res));
router.get('/companies/:companyId/sites', (req, res) => publicController.getSites(req, res));
router.post('/sites/verify-pin', (req, res) => publicController.verifySitePin(req, res));
router.get('/garment-types', (req, res) => publicController.getGarmentTypes(req, res));
router.post('/orders', (req, res) => publicController.createOrder(req, res));
router.get('/orders/:orderId', (req, res) => publicController.getOrder(req, res));
router.post('/orders/:orderId/print', (req, res) => publicController.recordPrint(req, res));

export default router;
