import { Response, NextFunction } from 'express';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { formatObjectToString } from '../../utils/helper';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import Prescription from '../../models/daily-progress/prescription.model';
import PatientFeedback from '../../models/patient/patient.feedback.model';
import PatientDischarge from '../../models/patient/patient.discharge.model';
import PatientCaseHistory from '../../models/patient/patient.case.history.model';
import PatientAdmissionHistory from '../../models/patient/patient.admission.history.model';
import TherapistNote from '../../models/daily-progress/therapist.note.model';

/**
 * Controllers
 */
export const getSinglePatientDischarge = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const admissionHistory = await PatientAdmissionHistory.findOne({
      _id: req.params.admissionHistoryId,
      patientId: req.params.patientId,
    })
      .setOptions({
        skipUrlGeneration: true,
        shouldSkip: true,
      })
      .lean();
    if (!admissionHistory)
      return next(new AppError('Invalid Patient ID or Admission History ID', 400));
    if (!admissionHistory?.dischargeId)
      return next(new AppError("Discharge hasn't been created yet", 400));

    const therapistNotes = await TherapistNote.find({
      patientId: req.params.patientId,
      patientAdmissionHistoryId: req.params.admissionHistoryId,
      subSessionType: {
        $exists: true,
        $ne: null,
        $nin: [''],
      },
    })
      .setOptions({ skipTherapistPopulation: true, skipUrlGeneration: true })
      .select('sessionType subSessionType score noteDateTime createdAt')
      .lean();

    const data = await PatientDischarge.findOne({ _id: admissionHistory.dischargeId }).lean();

    res.status(200).json({
      status: 'success',
      data: { ...data, therapistNotes },
    });
  }
);

export const createNewPatientDischarge = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const admissionHistory = await PatientAdmissionHistory.findOne({
      _id: req.params.admissionHistoryId,
      patientId: req.params.patientId,
    })
      .setOptions({
        skipUrlGeneration: true,
        shouldSkip: true,
      })
      .lean();
    if (!admissionHistory)
      return next(new AppError('Invalid Patient ID or Admission History ID', 400));
    if (admissionHistory?.dischargeId)
      return next(new AppError('Discharge already has been created', 400));

    req.body.createdBy = req.user?._id?.toString();
    req.body.patientId = admissionHistory.patientId.toString();
    req.body.patientAdmissionHistoryId = admissionHistory._id.toString();

    const caseHistory = await PatientCaseHistory.findById(admissionHistory.caseHistoryId).lean();

    const prescription = await Prescription.findOne({
      patientId: admissionHistory.patientId,
      patientAdmissionHistoryId: admissionHistory._id,
    })
      .sort({ createdAt: -1 })
      .setOptions({ skipMedicine: true });

    const data = await PatientDischarge.create({
      ...req.body,
      chiefComplaints: caseHistory?.chiefComplaints,
      historyOfPresentIllness: formatObjectToString(caseHistory?.historyOfPresentIllness),
      mentalStatusExamination: formatObjectToString(caseHistory?.mentalStatusExamination),
      investigation: caseHistory?.diagnosticFormulation?.investigations,
      prescriptionDateTime: prescription?.noteDateTime,
      prescriptionMedicine: prescription?.medicinesInfo,
    });
    const populatedData = await PatientDischarge.findById(data._id).lean();

    const feedback = await PatientFeedback.create({
      patientId: req.params.patientId,
      patientAdmissionHistoryId: admissionHistory._id,
      status: 'Created',
    });

    if (populatedData?.shouldSendfeedbackNotification) {
      // TODO: Send Email Notification to Patient with Feedback Link
    }

    await PatientAdmissionHistory.findByIdAndUpdate(admissionHistory._id, {
      dischargeId: data._id,
      feedbackId: feedback._id,
      currentStatus: 'Discharge Initiated',
    });

    res.status(201).json({
      status: 'success',
      data: populatedData,
    });
  }
);

export const updateSinglePatientDischarge = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const admissionHistory = await PatientAdmissionHistory.findOne({
      _id: req.params.admissionHistoryId,
      patientId: req.params.patientId,
    })
      .setOptions({
        skipUrlGeneration: true,
        shouldSkip: true,
      })
      .lean();
    if (!admissionHistory)
      return next(new AppError('Invalid Patient ID or Admission History ID', 400));
    if (!admissionHistory?.dischargeId)
      return next(new AppError("Discharge hasn't been created yet", 400));
    
    // if (admissionHistory?.currentStatus === 'Discharged')
    //   return next(new AppError('Cannot update, patient is already discharged', 400));

    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.patientId) delete req.body.patientId;
    if (req.body.patientAdmissionHistoryId) delete req.body.patientAdmissionHistoryId;

    await PatientDischarge.findByIdAndUpdate(admissionHistory?.dischargeId, req.body);
    const populatedData = await PatientDischarge.findById(admissionHistory?.dischargeId).lean();

    res.status(200).json({
      status: 'success',
      data: populatedData,
    });
  }
);

export const dischargePatient = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const admissionHistory = await PatientAdmissionHistory.findOne({
      _id: req.params.admissionHistoryId,
      patientId: req.params.patientId,
    })
      .setOptions({
        skipUrlGeneration: true,
        shouldSkip: true,
      })
      .lean();
    if (!admissionHistory)
      return next(new AppError('Invalid Patient ID or Admission History ID', 400));
    if (admissionHistory?.dischargeId === null || admissionHistory?.dischargeId === undefined)
      return next(new AppError("Discharge hasn't been created yet", 400));
    if (admissionHistory?.currentStatus === 'Discharged')
      return next(new AppError('Patient is already Discharged', 400));

    await PatientAdmissionHistory.findByIdAndUpdate(admissionHistory._id, {
      currentStatus: 'Discharged',
    });

    res.status(200).json({
      status: 'success',
      data: 'Patient Discharged Successfully',
    });
  }
);

export const cancelPatientDischarge = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const admissionHistory = await PatientAdmissionHistory.findOne({
      _id: req.params.admissionHistoryId,
      patientId: req.params.patientId,
    })
      .setOptions({
        skipUrlGeneration: true,
        shouldSkip: true,
      })
      .lean();
    if (!admissionHistory)
      return next(new AppError('Invalid Patient ID or Admission History ID', 400));
    if (admissionHistory?.dischargeId === null || admissionHistory?.dischargeId === undefined)
      return next(new AppError("Discharge hasn't been created yet", 400));
    if (admissionHistory?.currentStatus === 'Discharged')
      return next(new AppError('Patient is already Discharged', 400));

    // Delete Feedback Information
    if (admissionHistory.feedbackId) {
      await PatientFeedback.findByIdAndDelete(admissionHistory.feedbackId);
    }

    // Delete Discharge Record
    await PatientDischarge.findByIdAndDelete(admissionHistory.dischargeId);

    // Remove Discharge Information from Patient Admission Table
    await PatientAdmissionHistory.findByIdAndUpdate(admissionHistory._id, {
      feedbackId: null,
      dischargeId: null,
      currentStatus: 'Inpatient',
    });

    res.status(200).json({
      status: 'success',
      data: 'Patient Discharged Cancelled Successfully',
    });
  }
);
