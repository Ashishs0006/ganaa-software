import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as PatientController from '../controllers/patient/patient.controller';
import * as PatientFeedbackController from '../controllers/patient/patient.feedback.controller';
import * as PatientDischargeController from '../controllers/patient/patient.discharge.controller';
import * as PatientCaseHistoryController from '../controllers/patient/patient.case.history.controller';
import * as PatientFamilyDetailsController from '../controllers/patient/patient.family.details.controller';
import * as PatientAdmissionHistoryController from '../controllers/patient/patient.admission.history.controller';
const router = express.Router();

/**
 * Patient Feedback
 */
router
  .route('/:patientId/feedback/:admissionHistoryId')
  .get(PatientFeedbackController.getPatientFeedback)
  .patch(PatientFeedbackController.updateSinglePatientFeedback);

// Protected Routes
router.use(AuthController.protect);

/**
 * Patient Routes
 */
router
  .route('/')
  .get(PatientController.getAllPatient)
  .post(PatientController.uploadPatientFiles, PatientController.createNewPatient);

router.route('/search').get(PatientController.searchPatient);

router.route('/exist').get(PatientController.isPatientExist);

router
  .route('/:id')
  .get(PatientController.getSinglePatient)
  .patch(PatientController.uploadPatientFiles, PatientController.updateSinglePatient)
  .delete(PatientController.deleteSinglePatient);

router.route('/:id/re-admit').post(PatientController.reAdmitPatient);

/**
 * Patient Family Details Routes
 */
router
  .route('/family-details/:patientId')
  .get(PatientFamilyDetailsController.getAllFamilyDetails)
  .post(
    PatientFamilyDetailsController.uploadDocument,
    PatientFamilyDetailsController.createNewFamilyDetails
  );

router
  .route('/family-details/:patientId/:id')
  .get(PatientFamilyDetailsController.getSingleFamilyDetails)
  .patch(
    PatientFamilyDetailsController.uploadDocument,
    PatientFamilyDetailsController.updateMultipleFamilyDetails
  )
  .delete(PatientFamilyDetailsController.deleteSingleFamilyDetails);

/**
 * Patient Admission History Routes
 */
router
  .route('/:patientId/history')
  .get(PatientAdmissionHistoryController.getAllPatientAdmissionHistory)
  .post(PatientAdmissionHistoryController.createNewPatientAdmissionHistory);

router
  .route('/:patientId/history/:id')
  .get(PatientAdmissionHistoryController.getSinglePatientAdmissionHistory)
  .patch(PatientAdmissionHistoryController.updateSinglePatientAdmissionHistory)
  .delete(PatientAdmissionHistoryController.deleteSinglePatientAdmissionHistory);

router
  .route('/:patientId/history/:id/checklist')
  .patch(
    PatientAdmissionHistoryController.uploadPatientAdmissionChecklist,
    PatientAdmissionHistoryController.updateSinglePatientAdmissionCheckList
  );

router
  .route('/:patientId/history/:id/resource')
  .patch(PatientAdmissionHistoryController.updateSinglePatientResourceAllocation);

router
  .route('/:patientId/history/:id/test-report')
  .patch(
    PatientAdmissionHistoryController.uploadDocument,
    PatientAdmissionHistoryController.updateSinglePatientMedicalSummary
  );

router
  .route('/:patientId/history/:id/fare-calculator')
  .get(PatientAdmissionHistoryController.getCalculatedFare)
  .patch(PatientAdmissionHistoryController.updateCalculatedFare);

router
  .route('/:patientId/history/:id/audit-log')
  .get(PatientAdmissionHistoryController.getAuditLog);

/**
 * Patient Daily Progress
 */
router
  .route('/:patientId/history/:historyId/daily-progress')
  .get(PatientController.getAllSinglePatientDailyProgress);

/**
 * Patient Case History Routes
 */
router
  .route('/:patientId/case-history/:admissionHistoryId')
  .get(PatientCaseHistoryController.getSinglePatientCaseHistory)
  .post(
    PatientCaseHistoryController.uploadFile,
    PatientCaseHistoryController.createNewPatientCaseHistory
  );

// TODO: Make it similar to `Patient Discharge Route`
router
  .route('/:patientId/case-history/:admissionHistoryId/:id')
  .patch(
    PatientCaseHistoryController.uploadFile,
    PatientCaseHistoryController.updateSinglePatientCaseHistory
  )
  .delete(PatientCaseHistoryController.deleteSinglePatientCaseHistory);

router
  .route('/:patientId/case-history/:admissionHistoryId/:id/revision')
  .get(PatientCaseHistoryController.getCaseHistoryRevisions);

router
  .route('/:patientId/case-history/:admissionHistoryId/:id/revision/:revisionId')
  .delete(PatientCaseHistoryController.deleteCaseHistoryRevisions);

/**
 * Patient Discharge Routes
 */
router
  .route('/:patientId/discharge/:admissionHistoryId')
  .get(PatientDischargeController.getSinglePatientDischarge)
  .post(PatientDischargeController.createNewPatientDischarge)
  .patch(PatientDischargeController.updateSinglePatientDischarge);

router
  .route('/:patientId/discharge/:admissionHistoryId/discharge-patient')
  .patch(PatientDischargeController.dischargePatient);

router
  .route('/:patientId/discharge/:admissionHistoryId/cancel-patient-discharge')
  .delete(PatientDischargeController.cancelPatientDischarge);

export default router;
