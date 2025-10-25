import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { isValidJWT } from '../auth.controller';
import Patient from '../../models/patient/patient.model';
import { ICenter } from '../../interfaces/model/resources/i.center';
import PatientFeedback from '../../models/patient/patient.feedback.model';
import PatientDischarge from '../../models/patient/patient.discharge.model';
import PatientAdmissionHistory from '../../models/patient/patient.admission.history.model';

/**
 * Controllers
 */
export const getPatientFeedback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient Id is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History Id is Mandatory', 400));

    const isAuthenticUser = await isValidJWT(req);

    const admissionHistoryDoc = await PatientAdmissionHistory.findOne({
      patientId: req.params.patientId,
      _id: req.params.admissionHistoryId,
    });
    if (!admissionHistoryDoc) return next(new AppError('Invalid Ids', 400));
    if (admissionHistoryDoc.feedbackId === null)
      return next(new AppError("Feedback Form Isn't generated", 400));

    const feedbackInfo = await PatientFeedback.findOne({
      _id: admissionHistoryDoc.feedbackId,
    }).lean();
    if (!feedbackInfo) return next(new AppError('Invalid Feedback Information', 400));
    if (feedbackInfo.status == 'Completed' && !isAuthenticUser)
      return next(new AppError('Feedback already completed', 400));

    const patientInfo = await Patient.findOne({ _id: req.params.patientId })
      .select(
        'uhid firstName gender lastName phoneNumber phoneNumberCountryCode patientPic patientPicUrl'
      )
      .lean();
    const dischargeInfo = await PatientDischarge.findOne({
      _id: admissionHistoryDoc.dischargeId,
    }).lean();

    const centerMap = (admissionHistoryDoc.resourceAllocation?.centerId as ICenter).googleMapLink;

    res.status(200).json({
      status: 'success',
      data: {
        uhid: patientInfo?.uhid,
        patientPic: patientInfo?.patientPicUrl,
        firstName: patientInfo?.firstName,
        gender: patientInfo?.gender,
        lastName: patientInfo?.lastName,
        phoneNumber: patientInfo?.phoneNumber,
        phoneNumberCountryCode: patientInfo?.phoneNumberCountryCode,
        admissionDateTime: admissionHistoryDoc.dateOfAdmission,
        dischargeDate: dischargeInfo?.date,
        dischargeStatus: dischargeInfo?.status,
        feedbackInfo: isAuthenticUser ? feedbackInfo : null,
        centerMap: centerMap,
      },
    });
  }
);

export const updateSinglePatientFeedback = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient Id is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History Id is Mandatory', 400));
    if (!req.body.questionAnswer)
      return next(new AppError('Question & Answers are Mandatory', 400));
    if (req.body.questionAnswer.length < 1)
      return next(new AppError('Atleast 1 Question & Answers is Mandatory', 400));

    const admissionHistoryDoc = await PatientAdmissionHistory.findOne({
      patientId: req.params.patientId,
      _id: req.params.admissionHistoryId,
    });
    if (!admissionHistoryDoc) return next(new AppError('Invalid Ids', 400));
    if (admissionHistoryDoc.feedbackId === null)
      return next(new AppError("Feedback Form Isn't generated", 400));

    const feedbackInfo = await PatientFeedback.findOne({
      _id: admissionHistoryDoc.feedbackId,
    }).lean();
    if (!feedbackInfo) return next(new AppError('Invalid Feedback Information', 400));
    if (feedbackInfo.status == 'Completed')
      return next(new AppError('Feedback already completed', 400));

    await PatientFeedback.findOneAndUpdate(
      { _id: admissionHistoryDoc.feedbackId },
      {
        questionAnswer: req.body.questionAnswer,
        status: 'Completed',
      }
    );

    res.status(200).json({
      status: 'success',
      messages: 'Feedback Completed',
    });
  }
);
