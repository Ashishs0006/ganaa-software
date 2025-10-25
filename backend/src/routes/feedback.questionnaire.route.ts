import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as FQController from '../controllers/feedback.questionnaire.controller';

const router = express.Router();

router.route('/').get(FQController.getAllFq).post(AuthController.protect, FQController.createNewFq);

router
  .route('/:id')
  .get(AuthController.protect, FQController.getSingleFq)
  .patch(AuthController.protect, FQController.updateSingleFq)
  .delete(AuthController.protect, FQController.deleteSingleFq);

export default router;
