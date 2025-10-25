import multer from 'multer';
import { Response, NextFunction } from 'express';
import * as S3 from '../../utils/s3Helper';
import { random } from '../../utils/random';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { S3Path } from '../../constant/s3.path';
import { IResult } from '../../interfaces/generics';
import { MFileFilter } from '../../utils/multer.config';
import Patient from '../../models/patient/patient.model';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import PatientCaseHistory from '../../models/patient/patient.case.history.model';
import PatientAdmissionHistory from '../../models/patient/patient.admission.history.model';
import { IPatientCaseHistory } from '../../interfaces/model/patient/i.patient.case.history';
import PatientCaseHistoryRevision from '../../models/patient/patient.case.history.revision.model';
import { IPatientCaseHistoryRevision } from '../../interfaces/model/patient/i.patient.case.history.revision.modal';

/**
 * Multer Config
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: MFileFilter.imageAndPdfFilter,
});
export const uploadFile = upload.single('genogram');

/**
 * Controllers
 */
export const getSinglePatientCaseHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const data = await PatientCaseHistory.findOne({
      patientId: req.params.patientId,
      patientAdmissionHistoryId: req.params.admissionHistoryId,
    });
    if (!data) return next(new AppError('Patient Id Or Admission History Id is Invalid', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const createNewPatientCaseHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const patient = await Patient.findById(req.params.patientId).lean();
    if (!patient) return next(new AppError('Please Send Valid Patient ID', 400));

    const patientAdmissionHistory = await PatientAdmissionHistory.findById(
      req.params.admissionHistoryId
    )
      .setOptions({
        skipUrlGeneration: true,
        skipResAllPopulate: true,
        populateUser: true,
        populateFeedback: true,
      })
      .lean();
    if (!patientAdmissionHistory)
      return next(new AppError('Please Send Valid Patient Admission History ID', 400));

    if (patientAdmissionHistory.patientId.toString() !== patient._id.toString())
      return next(new AppError("Patient Id & Doc Id doesn't have realtionship", 400));
    if (patientAdmissionHistory.currentStatus === 'Discharged')
      return next(new AppError('Patient is Discharged', 400));

    req.body.createdBy = req.user?._id?.toString();
    req.body.patientId = patient._id.toString();
    req.body.patientAdmissionHistoryId = patientAdmissionHistory._id.toString();

    const data = await PatientCaseHistory.create(req.body);

    if (req.file) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${req.file?.originalname}`;
      const filePath = S3Path.caseHistoryFile(req.body.patientId ?? '', fileName);

      await S3.uploadFile(filePath, req.file?.buffer, req.file?.mimetype);
      await PatientCaseHistory.findByIdAndUpdate(data._id, {
        genogram: {
          fileName: req.file?.originalname,
          filePath: filePath,
        },
      });
    }

    const populatedData = await PatientCaseHistory.findById(data._id).lean();

    await PatientAdmissionHistory.findByIdAndUpdate(patientAdmissionHistory._id, {
      caseHistoryId: data._id,
    });

    res.status(201).json({
      status: 'success',
      data: populatedData,
    });
  }
);

export const updateSinglePatientCaseHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));
    if (!req.params.id)
      return next(new AppError('Patient Case History in Params is Mandatory', 400));
    if (req.body.patientId) delete req.body.patientId;
    if (req.body.patientAdmissionHistoryId) delete req.body.patientAdmissionHistoryId;
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.updatedBy) delete req.body.updatedBy;
    if (req.body.updatedBy) delete req.body.updatedBy;

    req.body.updatedBy = req.user?._id;

    const patient = await Patient.findById(req.params.patientId).lean();
    if (!patient) return next(new AppError('Please Send Valid Patient ID', 400));

    const patientAdmissionHistory = await PatientAdmissionHistory.findById(
      req.params.admissionHistoryId
    )
      .setOptions({
        skipUrlGeneration: true,
        skipResAllPopulate: true,
        populateUser: true,
        populateFeedback: true,
      })
      .lean();
    if (!patientAdmissionHistory)
      return next(new AppError('Please Send Valid Patient Admission History ID', 400));

    if (patientAdmissionHistory.patientId.toString() !== patient._id.toString())
      return next(new AppError("Patient Id & Doc Id doesn't have realtionship", 400));
    if (patientAdmissionHistory.currentStatus === 'Discharged')
      return next(new AppError('Patient is Discharged', 400));

    const caseHistoryDoc = await getCaseHistoryDoc(req.params.id, req.params.patientId);
    if (!caseHistoryDoc.isSuccess)
      return next(new AppError(caseHistoryDoc.message ?? 'Something went wrong', 400));

    if (req.file) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${req.file?.originalname}`;
      const filePath = S3Path.caseHistoryFile(req.body.patientId ?? '', fileName);

      await S3.uploadFile(filePath, req.file?.buffer, req.file?.mimetype);
      await PatientCaseHistory.findByIdAndUpdate(req.params.id, {
        genogram: {
          fileName: req.file?.originalname,
          filePath: filePath,
        },
      });
    }

    const data = await PatientCaseHistory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!data) return next(new AppError('Please Send Valid Patient Case History ID', 400));

    // TODO: Add Check, If No Data is Changed Then Don't Create Revision History
    await createCaseHistoryRevision(caseHistoryDoc.data!);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSinglePatientCaseHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));
    if (!req.params.id)
      return next(new AppError('Patient Case History in Params is Mandatory', 400));

    // TODO: Add Check is that patient case history is added anywhere
    await PatientCaseHistory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

export const getCaseHistoryRevisions = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const caseHistoryDoc = await getCaseHistoryDoc(req.params.id, req.params.patientId);
    if (!caseHistoryDoc.isSuccess)
      return next(new AppError(caseHistoryDoc.message ?? 'Something went wrong', 400));

    const data = await PatientCaseHistoryRevision.find({
      originalId: req.params.id,
      isDeleted: false,
    }).sort('-createdAt');

    if (!data)
      return next(
        new AppError('Patient Id Or Admission History Id or Case History is Invalid', 400)
      );

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteCaseHistoryRevisions = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // Only Updating the Flag of IsDeleted
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.admissionHistoryId)
      return next(new AppError('Patient Admission History in Params is Mandatory', 400));

    const caseHistoryDoc = await getCaseHistoryDoc(req.params.id, req.params.patientId);
    if (!caseHistoryDoc.isSuccess)
      return next(new AppError(caseHistoryDoc.message ?? 'Something went wrong', 400));
    const data = await PatientCaseHistoryRevision.findByIdAndUpdate(
      req.params.revisionId,
      {
        isDeleted: true,
      },
      { new: true }
    );
    if (!data)
      return next(
        new AppError('Patient Id Or Admission History Id or Case History is Invalid', 400)
      );

    res.status(200).json({
      status: 'success',
      data: data,
      message: 'Revision Deleted',
    });
  }
);

/**
 * Helper Function
 */

const createCaseHistoryRevision = async (previousData: IPatientCaseHistory) => {
  const revisionNumber = await PatientCaseHistoryRevision.countDocuments({
    originalId: previousData._id,
  });

  const newRevision = {
    ...previousData,
    revision: revisionNumber + 1,
    originalId: previousData._id,
  } as IPatientCaseHistoryRevision;

  delete newRevision._id;
  delete newRevision.createdAt;

  await PatientCaseHistoryRevision.create(newRevision);
};

const getCaseHistoryDoc = async (id: string, patientId: string) => {
  let result: IResult<IPatientCaseHistory> = {
    data: undefined,
    message: 'string',
    isSuccess: false,
  };

  const caseHistoryDoc = await PatientCaseHistory.findById(id)
    .setOptions({ skipUrlGeneration: true, populateUser: true })
    .lean();

  if (!caseHistoryDoc) {
    result.message = 'Please Send Valid Patient case History ID';
    result.isSuccess = false;
    return result;
  }

  if (caseHistoryDoc.patientId.toString() !== patientId) {
    result.message = "Patient Id & Doc Id doesn't have realtionship";
    result.isSuccess = false;
    return result;
  }

  result.message = 'Patient case History Loaded Successfully';
  result.data = caseHistoryDoc;
  result.isSuccess = true;
  return result;
};
