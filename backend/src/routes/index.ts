import express, { Express } from 'express';
import Env from '../constant/env';
import leadRoutes from './lead.route';
import roleRoutes from './role.route';
import userRoutes from './user.route';
import familyRoutes from './family.route';
import patientRoute from './patient.route';
import wellcomeRoute from './wellcome.route';
import dropdownRoute from './dropdown.route';
import dashboardRoute from './dashboard.route';
import resourcesRoute from './resources.route';
import constantsRoutes from './constants.route';
import commonFileRoute from './common.file.route';
import groupActivityRoutes from './group.activity.route';
import dailyProgressRoutes from './daily.progress.route';
import feedbackQuestionnaireRoutes from './feedback.questionnaire.route';

const router = express.Router();

router.use('/role', roleRoutes);
router.use('/user', userRoutes);
router.use('/lead', leadRoutes);
router.use('/family', familyRoutes);
router.use('/patient', patientRoute);
router.use('/wellcome', wellcomeRoute);
router.use('/dropdown', dropdownRoute);
router.use('/dashboard', dashboardRoute);
router.use('/resources', resourcesRoute);
router.use('/constants', constantsRoutes);
router.use('/common-file', commonFileRoute);
router.use('/daily-progress', dailyProgressRoutes);
router.use('/group-activity', groupActivityRoutes);
router.use('/feedback-questionnaire', feedbackQuestionnaireRoutes);

const applyRoutes = (app: Express) => {
  app.use(`${Env.PREFIX_TERM}/api/v1`, router);
};

export default applyRoutes;
