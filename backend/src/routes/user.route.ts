import express from 'express';
import RateLimiter from '../utils/rate.limiter';
import * as UserController from '../controllers/user.controller';
import * as AuthController from '../controllers/auth.controller';

const router = express.Router();

// Auth Routes
router.route('/login').post(RateLimiter.login, AuthController.login);

// Protected Routes
router.use(AuthController.protect);

router.route('/basic').get(UserController.getAllBasicUsers);

/**
 * User Management Routes
 */
router
  .route('/manage')
  .get(UserController.getAllUsers)
  .post(UserController.uploadProfilePic, UserController.createNewUsers);

router
  .route('/manage/:id')
  .get(UserController.getSingleUser)
  .patch(UserController.uploadProfilePic, UserController.updateUserInformation)
  .delete(UserController.deleteUser);

router.route('/manage/reset-password/:id').patch(UserController.resetUserPassword);

/**
 * Me Routes
 */
router
  .route('/me')
  .get(UserController.getMe)
  .patch(UserController.uploadProfilePic, UserController.updateMe)
  .delete(UserController.deleteMe);

router.route('/me/change-password').patch(UserController.changeMePassword);

export default router;
