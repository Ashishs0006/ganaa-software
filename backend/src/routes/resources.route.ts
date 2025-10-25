import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as CenterController from '../controllers/resources/center.controller';
import * as SummaryController from '../controllers/resources/summary.controller';
import * as RoomTypeController from '../controllers/resources/room.type.controller';
import * as RoomNumberController from '../controllers/resources/room.number.controller';
import * as LockerNumberController from '../controllers/resources/locker.number.controller';
const router = express.Router();

// Protected Routes
router.use(AuthController.protect);

/**
 * Summary Routes
 */
router.route('/summary').get(SummaryController.getResourceSummary);

/**
 * Center Routes
 */
router.route('/center').get(CenterController.getAllCenter).post(CenterController.createNewCenter);

router
  .route('/center/:id')
  .get(CenterController.getSingleCenter)
  .patch(CenterController.updateSingleCenter)
  .delete(CenterController.deleteSingleCenter);

/**
 * Room Type Routes
 */
router
  .route('/room-type')
  .get(RoomTypeController.getAllRoomType)
  .post(RoomTypeController.createNewRoomType);

router
  .route('/room-type/:id')
  .get(RoomTypeController.getSingleRoomType)
  .patch(RoomTypeController.updateSingleRoomType)
  .delete(RoomTypeController.deleteSingleRoomType);

/**
 * Room Number Routes
 */
router
  .route('/room-number')
  .get(RoomNumberController.getAllRoomNumber)
  .post(RoomNumberController.createNewRoomNumber);

  router
  .route('/room-number/bulk')
  .post(RoomNumberController.createBulkNewRoomNumber)
  .delete(RoomNumberController.deleteBulkRoomNumber);

router
  .route('/room-number/:id')
  .get(RoomNumberController.getSingleRoomNumber)
  .patch(RoomNumberController.updateSingleRoomNumber)
  .delete(RoomNumberController.deleteSingleRoomNumber);

/**
 * Locker Routes
 */
router
  .route('/locker')
  .get(LockerNumberController.getAllLockerNumber)
  .post(LockerNumberController.createNewLockerNumber);

router
  .route('/locker/bulk')
  .post(LockerNumberController.createBulkLockerNumber)
  .delete(LockerNumberController.deleteBulkLockerNumber);

router
  .route('/locker/:id')
  .get(LockerNumberController.getSingleLockerNumber)
  .patch(LockerNumberController.updateSingleLockerNumber)
  .delete(LockerNumberController.deleteSingleLockerNumber);

export default router;
