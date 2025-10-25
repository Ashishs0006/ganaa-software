import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as FamilyController from '../controllers/family.controller';

const router = express.Router();

// Protected Routes
router.use(AuthController.protect);
router.use(AuthController.checkPermission('Family Portal', '*'));
router.use(AuthController.checkPatientStatus);

router.route('/patient-info').get(FamilyController.getPatientInfo);
router.route('/nurse-note').get(FamilyController.getPatientNurseNote);
router.route('/group-activity').get(FamilyController.getPatientGroupActivity);

export default router;
