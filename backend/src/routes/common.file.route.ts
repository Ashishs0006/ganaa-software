import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as CommonFileController from '../controllers/common.file.controller';

const router = express.Router();

// Protected Routes
router.use(AuthController.protect);

router.route('/').get(CommonFileController.getCommonFiles);

router
  .route('/:id')
  .get(CommonFileController.getCommonFile)
  .delete(CommonFileController.deleteCommonFile);

export default router;
