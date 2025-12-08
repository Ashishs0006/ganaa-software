import express from 'express';
import RateLimiter from '../utils/rate.limiter';
import * as DoctorReferralController from '../controllers/doctor.controller';
import * as AuthController from '../controllers/auth.controller';

const router = express.Router();

// Auth Routes
router.route('/login').post(RateLimiter.login, AuthController.login);

// Protected Routes
router.use(AuthController.protect);

router.route('/basic').get(DoctorReferralController.getAllBasicDoctors);

/**
 * Doctor Management Routes
 */
router
  .route('/manage')
  .get(DoctorReferralController.getAllDoctors)
  .post(DoctorReferralController.uploadProfilePic, DoctorReferralController.createNewDoctors);

router
  .route('/manage/:id')
  .get(DoctorReferralController.getSingleDoctor)
  .patch(DoctorReferralController.uploadProfilePic, DoctorReferralController.updateDoctorInformation)
  .delete(DoctorReferralController.deleteDoctor);

router.route('/manage/reset-password/:id').patch(DoctorReferralController.resetDoctorPassword);

/**
 * Me Routes
 */
router
  .route('/me')
  .get(DoctorReferralController.getMe)
  .patch(DoctorReferralController.uploadProfilePic, DoctorReferralController.updateMe)
  .delete(DoctorReferralController.deleteMe);

router.route('/me/change-password').patch(DoctorReferralController.changeMePassword);

export default router;
