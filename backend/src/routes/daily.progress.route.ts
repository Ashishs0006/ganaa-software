import express from 'express';
import * as AuthController from '../controllers/auth.controller';
import * as LoaController from '../controllers/daily-progress/loa.controller';
import * as NurseController from '../controllers/daily-progress/nurse.note.controller';
import * as DoctorController from '../controllers/daily-progress/doctor.note.controller';
import * as TherapistController from '../controllers/daily-progress/therapist.note.controller';
import * as PrescriptionController from '../controllers/daily-progress/prescription.controller';

// new call

import * as PatientFollowupController from '../controllers/daily-progress/patient.followup.controller'

const router = express.Router();

// Protected Routes
router.use(AuthController.protect);

/**
 * Nurse Routes
 */
router
  .route('/nurse')
  .get(NurseController.getAllNurseNote)
  .post(NurseController.createNewNurseNote);

router
  .route('/nurse/:id')
  .get(NurseController.getSingleNurseNote)
  .patch(NurseController.updateSingleNurseNote)
  .delete(NurseController.deleteSingleNurseNote);

/**
 * Therapist Routes
 */
router
  .route('/therapist')
  .get(TherapistController.getAllTherapistNote)
  .post(TherapistController.uploadFile, TherapistController.createNewTherapistNote);

router
  .route('/therapist/:id')
  .get(TherapistController.getSingleTherapistNote)
  .patch(TherapistController.uploadFile, TherapistController.updateSingleTherapistNote)
  .delete(TherapistController.deleteSingleTherapistNote);

  /**
 * Patient Followup Routes
 */
router
  .route('/patient-followup')
  .get(PatientFollowupController.getAllPatientFollowup)
  .post(PatientFollowupController.uploadFile, PatientFollowupController.createNewPatientFollowup);

router
  .route('/patient-followup/:id')
  .get(PatientFollowupController.getSinglePatientFollowup)
  .patch(PatientFollowupController.uploadFile, PatientFollowupController.updateSinglePatientFollowup)
  .delete(PatientFollowupController.deleteSinglePatientFollowup);

/**
 * Doctor Notes Routes
 */
router
  .route('/doctor/note')
  .get(DoctorController.getAllDoctorNote)
  .post(DoctorController.createNewDoctorNote);

router
  .route('/doctor/note/:id')
  .get(DoctorController.getSingleDoctorNote)
  .patch(DoctorController.updateSingleDoctorNote)
  .delete(DoctorController.deleteSingleDoctorNote);

/**
 * Prescription Routes
 */
router
  .route('/doctor/prescription')
  .get(PrescriptionController.getAllPrescription)
  .post(PrescriptionController.createNewPrescription);

router
  .route('/doctor/prescription/revision')
  .get(PrescriptionController.getAllPrescriptionRevision);

router
  .route('/doctor/prescription/:id')
  .get(PrescriptionController.getSinglePrescription)
  .patch(PrescriptionController.updateSinglePrescription)
  .delete(PrescriptionController.deleteSinglePrescription);

/**
 * Loa Routes
 */
router.route('/loa').get(LoaController.getAllLoa).post(LoaController.createNewLoa);

router.route('/loa/:id').get(LoaController.getSingleLoa).delete(LoaController.deleteSingleLoa);

export default router;
