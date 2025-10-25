import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as DashboardController from '../controllers/dashboard.controller';

const router = express.Router();

// Protected Routes
router.use(AuthController.protect);

router.route('/insights').get(DashboardController.insightDashboard);
router.route('/weekly-report').get(DashboardController.weeklyReportDashboard);
router.route('/therapist').get(DashboardController.therapistDashboard);
router.route('/doctor').get(DashboardController.doctorDashboard);
router.route('/daily-report').get(DashboardController.dailyReportDashboard);
router.route('/vital-report').get(DashboardController.vitalReportDashboard);

export default router;
