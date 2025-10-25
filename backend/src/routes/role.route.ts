import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as RoleController from '../controllers/role.controller';

const router = express.Router();

// Protected Routes
router.use(AuthController.protect);

router.route('/').get(RoleController.getAllRoles).post(RoleController.createNewRole);

router
  .route('/:id')
  .get(RoleController.getSingleRole)
  .patch(RoleController.updateSingleRole)
  .delete(RoleController.deleteSingleRole);

export default router;
