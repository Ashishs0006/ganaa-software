import express from 'express';
import * as ConstantsController from '../controllers/constants.controller';

const router = express.Router();

router.route('/').get(ConstantsController.getAllConstants);

export default router;
