import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as GroupTabController from '../controllers/group-activity/group.tab.controller';
import * as GroupActivityController from '../controllers/group-activity/group.activity.controller';

const router = express.Router();

// Protected Routes
router.use(AuthController.protect);

/*
 * Tabs Routes
 */
router
  .route('/tab')
  .get(GroupTabController.getAllGroupTab)
  .post(GroupTabController.createNewGroupTab);

router
  .route('/tab/:id')
  .get(GroupTabController.getSingleGroupTab)
  .patch(GroupTabController.updateSingleGroupTab)
  .delete(GroupTabController.deleteSingleGroupTab);

/*
 * Activity Routes
 */
router
  .route('/activity')
  .get(GroupActivityController.getAllGroupActivity)
  .post(GroupActivityController.createNewGroupActivity);

router
  .route('/activity/:id')
  .get(GroupActivityController.getSingleGroupActivity)
  .patch(GroupActivityController.updateSingleGroupActivity)
  .delete(GroupActivityController.deleteSingleGroupActivity);

export default router;
