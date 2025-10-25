import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as LeadController from '../controllers/lead.controller';

const router = express.Router();

// Protected Routes
router.use(AuthController.protect);

router.route('/').get(LeadController.getAllLeads).post(LeadController.createNewLead);

router
  .route('/:id')
  .get(LeadController.getSingleLead)
  .patch(LeadController.updateSingleLead)
  .delete(LeadController.deleteSingleLead);

router.route('/:id/admit').post(LeadController.admitLead);

/**
 * Comments Routes
 */

router.route('/:id/comment').post(LeadController.createNewComment);

export default router;
