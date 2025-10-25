import multer from 'multer';
import multerS3 from 'multer-s3';
import { ObjectId } from 'mongoose';
import { Response, NextFunction } from 'express';
import Env from '../../constant/env';
import * as S3 from '../../utils/s3Helper';
import AppError from '../../utils/appError';
import { random } from '../../utils/random';
import * as Helper from '../../utils/helper';
import GDateTime from '../../utils/dateTime';
import { IUser } from '../../models/user.model';
import catchAsync from '../../utils/catchAsync';
import { S3Path } from '../../constant/s3.path';
import FilterObject from '../../utils/filterObject';
import { MFileFilter } from '../../utils/multer.config';
import Patient from '../../models/patient/patient.model';
import RoomType from '../../models/resources/room.type.model';
import { IBasicObj, IResult } from '../../interfaces/generics';
import RoomNumber from '../../models/resources/room.number.model';
import { ICenter } from '../../interfaces/model/resources/i.center';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import { IRoomType } from '../../interfaces/model/resources/i.room.type';
import PatientDischarge from '../../models/patient/patient.discharge.model';
import { IRoomNumber } from '../../interfaces/model/resources/i.room.number';
import PatientAdmissionHistory from '../../models/patient/patient.admission.history.model';
import {
  IInjuriesDetails,
  IPatientAdmissionHistory,
  IResourceDiscount,
} from '../../interfaces/model/patient/i.patient.admission.history';
import {
  IAuditLogFields,
  IExtendedRoomStaySummary,
  IRoomStaySummary,
} from '../../interfaces/controller/patient/i.patient.admission.history';
import PatientAdmissionHistoryRevision from '../../models/patient/patient.admission.history.revision.model';
import { IPatientAdmissionHistoryRevision } from '../../interfaces/model/patient/i.patient.admission.history.revision';

/**
 * Multer Config
 */
interface MulterS3File extends Express.Multer.File {
  key: string;
  location: string;
}

const uploadMemoryFields = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: MFileFilter.imageAndPdfFilter,
});

const upload = multer({
  storage: multerS3({
    s3: S3.s3 as any,
    bucket: Env.AWS_BUCKET ?? '',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
      cb(null, { fieldName: file.fieldname, mimeType: file.mimetype });
    },
    key: (req: UserRequest, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
      if (!req.user) return cb(new AppError('User is not authenticated', 401));
      if (!req.params.patientId) return cb(new AppError('Patient Id is Mandatory', 400));

      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}.${fileExtension}`;
      const filePath = S3Path.patientTestReportDoc(req.params.patientId, fileName);

      cb(null, filePath);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: MFileFilter.imageAndPdfFilter,
});

export const uploadPatientReport = upload.single('report');
export const uploadPatientMedicalReports = upload.fields([
  { name: 'injuriesRecord', maxCount: 5 },
  { name: 'previousTreatmentRecord', maxCount: 5 },
  { name: 'allergiesRecord', maxCount: 5 },
]);

export const uploadPatientAdmissionChecklist = uploadMemoryFields.fields([
  { name: 'applicationForAdmission', maxCount: 5 },
  { name: 'form90', maxCount: 5 },
  { name: 'voluntaryAdmissionForm', maxCount: 5 },
  { name: 'inVoluntaryAdmissionForm', maxCount: 5 },
  { name: 'minorAdmissionForm', maxCount: 5 },
  { name: 'familyDeclaration', maxCount: 5 },
  { name: 'section94', maxCount: 5 },
  { name: 'capacityAssessment', maxCount: 5 },
  { name: 'hospitalGuidelineForm', maxCount: 5 },
  { name: 'finacialCounselling', maxCount: 5 },
  { name: 'admissionAssessment', maxCount: 5 },
  { name: 'orientationOfFamily', maxCount: 5 },
  { name: 'orientationOfPatient', maxCount: 5 },
  { name: 'insuredFile', maxCount: 5 },
]);

export const uploadDocument = upload.any();

/**
 * Controllers
 */
export const getAllPatientAdmissionHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));

    const patient = await Patient.findById(req.params.patientId);
    if (!patient) return next(new AppError('Please Send Valid Patient ID', 400));

    const features = new APIFeatures<IPatientAdmissionHistory>(
      PatientAdmissionHistory.find({ patientId: req.params.patientId }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      PatientAdmissionHistory.countDocuments(),
      req.query,
      rawQuery
    );

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: data,
    });
  }
);

export const createNewPatientAdmissionHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (req.body._id) delete req.body._id;
    if (req.body.createdAt) delete req.body.createdAt;
    if (req.body.resourceAllocation) delete req.body.resourceAllocation;
    if (req.body.patientReport) delete req.body.patientReport;
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.updatedBy) delete req.body.updatedBy;
    if (req.body.caseHistoryId) delete req.body.caseHistoryId;
    if (req.body.dischargeId) delete req.body.dischargeId;

    req.body.createdBy = req.user?._id;
    req.body.status = 'Registered';
    if (req.body.dateOfAdmission) {
      const doa = GDateTime.fromDate(new Date(req.body.dateOfAdmission));
      const pastDays = GDateTime.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

      if (doa.isBefore(pastDays)) {
        return next(new AppError('Date of admission should not be more than 1 day old', 400));
      }

      if (doa.isPast()) {
        req.body.status = 'Inpatient';
      }
    }

    const patient = await Patient.findById(req.params.patientId).lean();
    if (!patient) return next(new AppError('Please Send Valid Patient ID', 400));
    req.body.patientId = patient._id.toString();

    // Check if the patient is currently admitted
    const oldAdmission = await PatientAdmissionHistory.findOne({
      patientId: patient._id,
      currentStatus: { $ne: 'Discharged' },
    }).lean();
    if (oldAdmission) return next(new AppError("Patient isn't discharge yet", 400));

    const data = await PatientAdmissionHistory.create(req.body);

    const populatedData = await PatientAdmissionHistory.findById(data._id).lean();

    res.status(201).json({
      status: 'success',
      data: populatedData,
    });
  }
);

export const getSinglePatientAdmissionHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.params.patientId === null)
      return next(new AppError('Patient in Params is Mandatory', 400));

    const data = await PatientAdmissionHistory.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));
    if (data.patientId.toString() !== req.params.patientId)
      return next(new AppError("Patient Id & Doc Id doesn't have realtionship", 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSinglePatientAdmissionHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.resourceAllocation) delete req.body.resourceAllocation;
    if (req.body.patientReport) delete req.body.patientReport;
    if (req.body.patientId) delete req.body.patientId;
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.updatedBy) delete req.body.updatedBy;
    if (req.body.caseHistoryId) delete req.body.caseHistoryId;
    if (req.body.dischargeId) delete req.body.dischargeId;

    req.body.updatedBy = req.user?._id;

    if (req.body.dateOfAdmission) {
      const doa = GDateTime.fromDate(new Date(req.body.dateOfAdmission));
      const pastDays = GDateTime.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));

      if (doa.isBefore(pastDays)) {
        return next(new AppError('Date of admission should not be more than 1 day old', 400));
      }
    }

    const patient = await Patient.findById(req.params.patientId).lean();
console.log('✌️patient --->', patient);
    if (!patient) return next(new AppError('Please Send Valid Patient ID', 400));

    const admissionHistoryDoc = await getAdmissionHistoryDoc(req.params.id, req.params.patientId);
console.log('✌️admissionHistoryDoc --->', admissionHistoryDoc);
    if (!admissionHistoryDoc.isSuccess)
      return next(new AppError(admissionHistoryDoc.message ?? 'Something went wrong', 400));
    if (admissionHistoryDoc.data?.currentStatus === 'Discharged')
      return next(new AppError('Cannot update, patient is already discharged', 400));

    const modifiedBody = Helper.buildUnsetAndDelete(
      req,
      'payerRelationWithPatientId',
      'nominatedRelationWithPatientId'
    );

    const data = await PatientAdmissionHistory.findByIdAndUpdate(req.params.id, modifiedBody, {
      new: true,
    });
    if (!data) return next(new AppError('Please Send Valid Patient Admission History ID', 400));

    // TODO: Add Check, If No Data is Changed Then Don't Create Revision History
    await createRevisionHistory(admissionHistoryDoc.data!);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSinglePatientAdmissionCheckList = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.updatedBy) delete req.body.updatedBy;

    const checkIds = await Helper.validateDocIds({ patientId: req.params.patientId });
    if (!checkIds.isSuccess)
      return next(new AppError(checkIds.message || 'Something went Wrong', 400));

    const admissionHistoryDoc = await getAdmissionHistoryDoc(req.params.id, req.params.patientId);
    if (!admissionHistoryDoc.isSuccess)
      return next(new AppError(admissionHistoryDoc.message ?? 'Something went wrong', 400));

    if (admissionHistoryDoc.data?.currentStatus === 'Discharged')
      return next(new AppError('Cannot update, patient is already discharged', 400));

    // Admission Checklist fields mapping
    const filesKeys = [
      'applicationForAdmission',
      'voluntaryAdmissionForm',
      'form90',
      'inVoluntaryAdmissionForm',
      'minorAdmissionForm',
      'familyDeclaration',
      'section94',
      'capacityAssessment',
      'hospitalGuidelineForm',
      'finacialCounselling',
      'admissionAssessment',
      'insuredFile',
    ];

    // Fetch the existing document to merge file updates
    const existingDoc = await PatientAdmissionHistory.findById(req.params.id).setOptions({
      skipUrlGeneration: true,
    });
    if (!existingDoc) return next(new AppError('Invalid Patient ID', 400));

    let admissionChecklist: IBasicObj = existingDoc.admissionChecklist || {};

    const { type } = req.body;
    if (!type) return next(new AppError('Type is Mandatory', 400));

    if (type.toUpperCase() == 'UPDATE') {
      const files = req.files as { [key: string]: Express.Multer.File[] };
      const modifiedBody: IBasicObj = {};

      // Handle different types of updates
      await Promise.all(
        filesKeys.flatMap((field) =>
          (files[field] || []).map(async (file) => {
            const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}.${file.originalname.split('.').pop()}`;
            const filePath = S3Path.patientChecklistDoc(req.params.patientId, fileName);

            await S3.uploadFile(filePath, file.buffer, file.mimetype);
            const fileData = {
              fileName: file.originalname,
              filePath: filePath,
            };
            modifiedBody[field] = (modifiedBody[field] || []).concat(fileData);
          })
        )
      );

      // Merge new files with existing ones
      for (const field of filesKeys) {
        if (modifiedBody[field]) {
          admissionChecklist[field] = [
            ...(admissionChecklist[field] || []), // Keep existing files
            ...modifiedBody[field], // Add new files
          ];
        }
      }
      admissionChecklist = Helper.cleanObject(admissionChecklist);
    } else if (type.toUpperCase() === 'REMOVE') {
      for (const field of filesKeys) {
        if (req.body[field] && Array.isArray(req.body[field])) {
          admissionChecklist[field] = (admissionChecklist[field] || []).filter(
            (fileObj: { fileName: string; filePath: string }) =>
              !req.body[field].includes(fileObj.filePath)
          );

          // If the field becomes empty after removal, delete it
          if (admissionChecklist[field].length === 0) {
            delete admissionChecklist[field];
          }
        }
      }
      // TODO: Commented Below Line Because it removes the empty Field from admissionChecklist but body have an elem so body filtered
      // admissionChecklist = Helper.cleanObject(admissionChecklist);
    } else {
      return next(new AppError('Invalid type. Use "update" or "remove".', 400));
    }

    if (req.body.orientationOfFamily) {
      delete admissionChecklist['orientationOfFamily'];
    }
    if (req.body.orientationOfPatient) {
      delete admissionChecklist['orientationOfPatient'];
    }
    if (req.body.isInsured) {
      delete admissionChecklist['isInsured'];
    }
    let filteredBody = new FilterObject(
      { ...req.body, ...admissionChecklist },
      ...filesKeys,
      'orientationOfFamily',
      'orientationOfPatient',
      'isInsured',
      'insuredDetail'
    )
      .parse('orientationOfFamily', (value) => {
        return typeof req.body.orientationOfFamily === 'string' ? JSON.parse(value) : value;
      })
      .parse('orientationOfPatient', (value) => {
        return typeof req.body.orientationOfPatient === 'string' ? JSON.parse(value) : value;
      })
      .get();

    // Remove fields if explicitly set to null
    for (const key in filteredBody) {
      if (filteredBody[key] === null) {
        if (key == 'insuredDetail') {
          continue;
        } else {
          delete admissionChecklist[key]; // Remove field
        }
      } else {
        admissionChecklist[key] = filteredBody[key]; // Update field
      }
    }

    if (Object.keys(filteredBody).length === 0)
      return next(new AppError('No valid fields to update', 400));

    const updateQuery: IBasicObj = {
      updatedBy: req.user?._id,
      admissionChecklist,
    };
    // console.log('✌️updateQuery --->', updateQuery);

    const updatedData = await PatientAdmissionHistory.findByIdAndUpdate(
      req.params.id,
      { $set: updateQuery },
      { new: true }
    );
    // console.log('✌️updatedData --->', updatedData);
    if (!updatedData) return next(new AppError('Please Provide Valid Patient ID', 400));

    // TODO: Add Check, If No Data is Changed Then Don't Create Revision History
    await createRevisionHistory(admissionHistoryDoc.data!);

    res.status(200).json({
      status: 'success',
      data: updatedData,
    });
  }
);

export const updateSinglePatientResourceAllocation = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.updatedBy) delete req.body.updatedBy;
    if (req.body.caseHistoryId) delete req.body.caseHistoryId;
    if (req.body.dischargeId) delete req.body.dischargeId;
    if (Helper.isExist(req, 'belongingsInLocker') && req.body.belongingsInLocker.length === 0)
      return next(new AppError('belongings In Locker is Mandatory', 400));

    const checkIds = await Helper.validateDocIds({
      patientId: req.params.patientId,
      assignedDoctorId: req.body.assignedDoctorId,
      assignedTherapistId: req.body.assignedTherapistId,
      centerId: req.body.centerId,
      roomTypeId: req.body.roomTypeId,
      roomNumberId: req.body.roomNumberId,
      lockerNumberId: req.body.lockerNumberId,
    });
    if (!checkIds.isSuccess)
      return next(new AppError(checkIds.message ?? 'Something went Wrong', 400));

    if (req.body.roomNumberId) {
      const roomAvailability = await isRoomAvailable(req.body.roomNumberId);
      if (!roomAvailability) return next(new AppError('Room is Not available for Booking', 400));
    }

    const admissionHistoryDoc = await getAdmissionHistoryDoc(req.params.id, req.params.patientId);
    if (!admissionHistoryDoc.isSuccess)
      return next(new AppError(admissionHistoryDoc.message ?? 'Something went wrong', 400));

    const data = await PatientAdmissionHistory.findByIdAndUpdate(
      req.params.id,
      { resourceAllocation: { ...req.body, updatedAt: Date.now() }, updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return next(new AppError('Please Send Valid Patient Admission History ID', 400));

    // TODO: Add Check, If No Data is Changed Then Don't Create Revision History
    await createRevisionHistory(admissionHistoryDoc.data!);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSinglePatientMedicalSummary = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.updatedBy) delete req.body.updatedBy;

    const checkIds = await Helper.validateDocIds({ patientId: req.params.patientId });
    if (!checkIds.isSuccess)
      return next(new AppError(checkIds.message ?? 'Something went Wrong', 400));

    const admissionHistoryDoc = await getAdmissionHistoryDoc(req.params.id, req.params.patientId);
    if (!admissionHistoryDoc.isSuccess)
      return next(new AppError(admissionHistoryDoc.message ?? 'Something went wrong', 400));
    if (admissionHistoryDoc.data?.currentStatus === 'Discharged')
      return next(new AppError('Cannot update, patient is already discharged', 400));

    const existingDoc = await PatientAdmissionHistory.findById(req.params.id).setOptions({
      skipUrlGeneration: true,
    });

    if (!existingDoc) return next(new AppError('Invalid Patient ID', 400));

    let patientReport: IBasicObj = existingDoc.patientReport || {};

    const { type } = req.body;

    if (type.toUpperCase() == 'REMOVE') {
      if (req.body.allergiesFiles && Array.isArray(req.body.allergiesFiles)) {
        patientReport['allergiesFiles'] = (patientReport['allergiesFiles'] || []).filter(
          (fileObj: { fileName: string; filePath: string }) =>
            !req.body['allergiesFiles'].includes(fileObj.filePath)
        );
      }

      if (req.body.previousTreatmentRecord && Array.isArray(req.body.previousTreatmentRecord)) {
        patientReport['previousTreatmentRecord'] = (
          patientReport['previousTreatmentRecord'] || []
        ).filter(
          (fileObj: { fileName: string; filePath: string }) =>
            !req.body['previousTreatmentRecord'].includes(fileObj.filePath)
        );
      }

      if (req.body.injuryDetails && Array.isArray(req.body.injuryDetails)) {
        patientReport['injuriesDetails'] = (patientReport['injuriesDetails'] || [])
          .map((injury: IInjuriesDetails) => {
            const matchingInjury = req.body.injuryDetails.find(
              (i: { injuryName: string }) => i.injuryName === injury.injuryName
            );

            if (!matchingInjury) return injury;

            if (!matchingInjury.fileUrls || matchingInjury.fileUrls.length === 0) {
              return null;
            }

            // Remove only the specified file URLs by matching filePath
            injury.fileUrls = (injury.fileUrls ?? []).filter(
              (existingFile) =>
                !matchingInjury.fileUrls.some(
                  (filePath: string) => filePath === existingFile.filePath
                )
            );

            return injury.fileUrls.length > 0 ? injury : null;
          })
          .filter(Boolean);
      }
    } else if (type.toUpperCase() == 'UPDATE') {
      const files = req.files as MulterS3File[];
      const { injuries, allergies } = req.body;
      const fileMap: Record<
        string,
        { fieldName: string; tempId: string; awsKey: string; fileName: string }[]
      > = {};

      const allergyUrls: { fileName: string; filePath: string }[] = [];
      const previousTreatmentRecord: { fileName: string; filePath: string }[] = [];

      files.forEach((file) => {
        let tempId, fieldName, awsKey, fileName;

        if (file.fieldname.startsWith('injuryFile_')) {
          fieldName = file.fieldname;
          tempId = fieldName.split('_')[1];
          awsKey = file.key;
          fileName = file.originalname;
          const newFileObject = { fieldName, tempId, awsKey, fileName };

          if (fileMap[tempId]) {
            fileMap[tempId].push(newFileObject);
          } else {
            fileMap[tempId] = [newFileObject];
          }
        }

        if (file.fieldname === 'allergiesFiles') {
          allergyUrls.push({ fileName: file.originalname, filePath: file.key });
        }
        if (file.fieldname === 'previousTreatmentRecord') {
          previousTreatmentRecord.push({ fileName: file.originalname, filePath: file.key });
        }
      });

      const parsedInjuries = JSON.parse(injuries);
      const parsedAllergies = allergies ? JSON.parse(allergies) : [];

      if (!Array.isArray(parsedInjuries))
        return next(new AppError('injuries Should be an Array', 400));
      if (!Array.isArray(parsedAllergies))
        return next(new AppError('allergies Should be an Array', 400));

      const injuryRecords = parsedInjuries.map((detail: any) => {
        const injuryName = detail.split('_')[0];
        const tempId = detail.split('_')[1];

        const existingInjury = patientReport.injuriesDetails?.find(
          (injury: IInjuriesDetails) => injury.injuryName === injuryName
        );

        let fileUrls: { fileName: string; filePath: string }[] = [];

        if (fileMap[tempId] && Array.isArray(fileMap[tempId])) {
          fileUrls = fileMap[tempId].map((fileObj) => ({
            fileName: fileObj.fileName,
            filePath: fileObj.awsKey,
          }));
        }

        if (existingInjury) {
          const existingFiles: typeof fileUrls = existingInjury.fileUrls ?? [];

          const mergedFiles = [
            ...existingFiles,
            ...fileUrls.filter(
              (newFile) =>
                !existingFiles.some((existingFile) => existingFile.filePath === newFile.filePath)
            ),
          ];
          existingInjury.fileUrls = mergedFiles;
          return existingInjury;
        } else {
          return { injuryName, fileUrls };
        }
      });

      if (injuryRecords.length > 0) req.body.injuriesDetails = injuryRecords;

      if (allergyUrls.length > 0) {
        req.body.allergiesFiles = [...(patientReport.allergiesFiles ?? []), ...allergyUrls];
      } else {
        req.body.allergiesFiles = patientReport.allergiesFiles; // Keep existing data
      }

      if (previousTreatmentRecord.length > 0) {
        req.body.previousTreatmentRecord = [
          ...(patientReport.previousTreatmentRecord ?? []),
          ...previousTreatmentRecord,
        ];
      } else {
        req.body.previousTreatmentRecord = patientReport.previousTreatmentRecord; // Keep existing data
      }
    } else {
      return next(new AppError('Invalid type. Use "update" or "remove".', 400));
    }

    let body = {};
    if (type.toUpperCase() == 'UPDATE') {
      body = req.body;
    }
    if (type.toUpperCase() == 'REMOVE') {
      body = { ...req.body, ...patientReport };
    }
    let filteredBody = new FilterObject(
      body,
      'diabeticStatus',
      'hyperTension',
      'injuriesDetails',
      'heartDisease',
      'heartDiseaseDescription',
      'previousTreatmentRecord',
      'injuryDetails',
      'allergiesNames',
      'allergiesFiles',
      'levelOfRisk',
      'levelOfRiskDescription',
      'previousTreatmentRecord'
    ).get();

    const data = await PatientAdmissionHistory.findByIdAndUpdate(
      req.params.id,
      {
        patientReport: filteredBody,
      },
      { new: true }
    );
    // TODO: Add Check, If No Data is Changed Then Don't Create Revision History
    await createRevisionHistory(admissionHistoryDoc.data!);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSinglePatientAdmissionHistory = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.patientId === null)
      return next(new AppError('Patient in Params is Mandatory', 400));
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // TODO: Add Check is that patient is added anywhere
    await PatientAdmissionHistory.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

export const getAuditLog = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    // Validate Params ID
    const checkIds = await Helper.validateDocIds({
      patientId: req.params.patientId,
      admissionHistoryId: req.params.id,
    });
    if (!checkIds.isSuccess)
      return next(new AppError(checkIds.message ?? 'Something went Wrong', 400));

    const formatedDocs = await _buildAggregatedResourceHistory(req.params.id);

    const importantFields: (keyof IAuditLogFields)[] = [
      'center',
      'roomType',
      'roomNumber',
      'assignedDoctor',
      'assignedTherapist',
    ];
    const filteredData = _filterChangedAdmissions(importantFields, formatedDocs.docs);

    res.status(200).json({
      status: 'success',
      data: filteredData,
    });
  }
);

export const updateCalculatedFare = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    // Validate Params ID
    const checkIds = await Helper.validateDocIds({
      patientId: req.params.patientId,
      admissionHistoryId: req.params.id,
    });
    if (!checkIds.isSuccess)
      return next(new AppError(checkIds.message ?? 'Something went Wrong', 400));

    const data = await PatientAdmissionHistory.findOneAndUpdate(
      {
        patientId: req.params.patientId,
        _id: req.params.id,
      },
      { resourceDiscount: req.body },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: data?.resourceDiscount,
    });
  }
);

export const getCalculatedFare = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    // Validate Params ID
    const checkIds = await Helper.validateDocIds({
      patientId: req.params.patientId,
      admissionHistoryId: req.params.id,
    });
    if (!checkIds.isSuccess)
      return next(new AppError(checkIds.message ?? 'Something went Wrong', 400));

    const formatedDocs = await _buildAggregatedResourceHistory(req.params.id);

    const importantFields: (keyof IAuditLogFields)[] = [
      'center',
      'roomType',
      'roomNumber',
      'assignedDoctor',
      'assignedTherapist',
    ];

    const filteredData = _summarizeRoomStay(
      importantFields,
      formatedDocs.docs,
      formatedDocs.dischargeDate
    );

    const roomTypeIds = [...new Set(filteredData.map((e) => e.roomTypeId.toString()))];
    const roomTypes = await RoomType.find({ _id: { $in: roomTypeIds } })
      .select('pricePerDayPerBed')
      .lean();

    const summariesWithPrice = _addRoomPricesToSummary(
      filteredData,
      roomTypes,
      formatedDocs.resourceDiscount
    );

    res.status(200).json({
      status: 'success',
      data: summariesWithPrice,
    });
  }
);

/**
 * Helper Functions
 */
const createRevisionHistory = async (previousData: IPatientAdmissionHistory) => {
  const revisionNumber = await PatientAdmissionHistoryRevision.countDocuments({
    originalId: previousData._id,
  });

  const newRevision = {
    ...previousData,
    originalId: previousData._id,
    revision: revisionNumber + 1,
  } as IPatientAdmissionHistoryRevision;

  if (previousData?.resourceAllocation) {
    const previousRes = previousData.resourceAllocation;

    newRevision.resourceAllocation = {
      center: previousRes.centerId as ICenter,
      roomType: previousRes.roomTypeId as IRoomType,
      roomNumber: previousRes.roomNumberId as IRoomNumber,
      lockerNumber: previousRes.lockerNumberId as ICenter,
      belongingsInLocker: previousRes.belongingsInLocker ?? '',
      assignedDoctor: previousRes.assignedDoctorId as IUser,
      assignedTherapist: previousRes.assignedTherapistId as IUser,
      nurse: previousRes.nurse ?? '',
      careStaff: previousRes.nurse ?? '',
      updatedAt: new Date(),
    };
  }

  if (previousData?.patientReport) {
    const previousRes = previousData.patientReport;

    newRevision.patientReport = {
      diabeticStatus: previousRes.diabeticStatus ?? '',
      hyperTension: previousRes.hyperTension ?? 'No',
      heartDisease: previousRes.heartDisease ?? 'No',
      heartDiseaseDescription: previousRes.heartDiseaseDescription ?? '',
      injuriesDetails: previousRes.injuriesDetails ?? [],
      allergiesNames: previousRes.allergiesNames ?? [],
      levelOfRisk: previousRes.levelOfRisk ?? '',
      levelOfRiskDescription: previousRes.levelOfRiskDescription ?? '',
      previousTreatmentRecord: previousRes.previousTreatmentRecord ?? [],
      updatedAt: new Date(),
    };
  }

  delete newRevision._id;
  delete newRevision.createdAt;

  await PatientAdmissionHistoryRevision.create(newRevision);
};

const getAdmissionHistoryDoc = async (id: string, patientId: string) => {
  let result: IResult<IPatientAdmissionHistory> = {
    data: undefined,
    message: 'string',
    isSuccess: false,
  };

  const admissionHistoryDoc = await PatientAdmissionHistory.findById(id)
    .setOptions({ skipUrlGeneration: true })
    .lean();

  if (!admissionHistoryDoc) {
    result.message = 'Please Send Valid Patient Admission History ID';
    result.isSuccess = false;
    return result;
  }

  if (admissionHistoryDoc.patientId.toString() !== patientId) {
    result.message = "Patient Id & Doc Id doesn't have realtionship";
    result.isSuccess = false;
    return result;
  }

  result.message = 'Patient Admission History Loaded Successfully';
  result.data = admissionHistoryDoc;
  result.isSuccess = true;
  return result;
};

const isRoomAvailable = async (roomNumberId: string): Promise<boolean> => {
  // Get room number object
  const roomNumber = await RoomNumber.findOne({ _id: roomNumberId, isDeleted: false }).lean();
  if (!roomNumber) return false;

  // Get the room type info
  const roomType = await RoomType.findOne({ _id: roomNumber.roomTypeId, isDeleted: false }).lean();
  if (!roomType) return false;

  const maxOccupancy = roomType.maxOccupancy ?? 1;

  // Count active admissions for this room
  const allocation = await PatientAdmissionHistory.aggregate([
    {
      $match: {
        'resourceAllocation.roomNumberId': roomNumberId,
        currentStatus: { $ne: 'Discharged' },
      },
    },
    {
      $group: {
        _id: '$resourceAllocation.roomNumberId',
        activeCount: { $sum: 1 },
      },
    },
  ]);

  const activeCount = allocation.length > 0 ? allocation[0].activeCount : 0;

  // Compare and return availability
  return activeCount < maxOccupancy;
};

const _buildAggregatedResourceHistory = async (admissionId: string) => {
  const revisionDocs = await PatientAdmissionHistoryRevision.find({ originalId: admissionId })
    .select('dateOfAdmission resourceAllocation createdAt')
    .lean();

  const currentAdmission = await PatientAdmissionHistory.findOne({ _id: admissionId })
    .select(
      'dateOfAdmission currentStatus resourceDiscount dischargeId resourceAllocation createdAt'
    )
    .lean();

  let dischargeDateTime: Date | string | undefined = undefined;

  if (currentAdmission?.currentStatus === 'Discharged') {
    const dischargeInfo = await PatientDischarge.findOne({
      patientAdmissionHistoryId: admissionId,
      _id: currentAdmission.dischargeId,
    })
      .select('date')
      .setOptions({ skipMedicine: true, skipUserInfo: true })
      .lean();

    dischargeDateTime = dischargeInfo?.date;
  }

  const formattedDocs: IAuditLogFields[] = revisionDocs.map((el) => {
    const assignedDoctor = el.resourceAllocation?.assignedDoctor;
    const assignedTherapist = el.resourceAllocation?.assignedTherapist;

    return {
      dateOfAdmission: el.dateOfAdmission,
      center: el.resourceAllocation?.center?.centerName ?? '',
      roomType: el.resourceAllocation?.roomType?.name ?? '',
      roomNumber: el.resourceAllocation?.roomNumber?.name ?? '',
      roomTypeId: (el.resourceAllocation?.roomType?._id ?? '') as string,
      assignedDoctor: `${assignedDoctor?.firstName ?? ''} ${assignedDoctor?.lastName ?? ''}`.trim(),
      assignedTherapist:
        `${assignedTherapist?.firstName ?? ''} ${assignedTherapist?.lastName ?? ''}`.trim(),
      createdAt: el.resourceAllocation?.updatedAt ?? el.createdAt,
    };
  });

  if (currentAdmission) {
    const assignedDoctor = currentAdmission.resourceAllocation?.assignedDoctorId as IUser;
    const assignedTherapist = currentAdmission.resourceAllocation?.assignedTherapistId as IUser;

    formattedDocs.push({
      dateOfAdmission: currentAdmission.dateOfAdmission,
      center: (currentAdmission.resourceAllocation?.centerId as ICenter)?.centerName ?? '',
      roomType: (currentAdmission.resourceAllocation?.roomTypeId as IRoomType)?.name ?? '',
      roomTypeId: ((currentAdmission.resourceAllocation?.roomTypeId as IRoomType)?._id ??
        '') as string,
      roomNumber: (currentAdmission.resourceAllocation?.roomNumberId as IRoomNumber)?.name ?? '',
      assignedDoctor: `${assignedDoctor?.firstName ?? ''} ${assignedDoctor?.lastName ?? ''}`.trim(),
      assignedTherapist:
        `${assignedTherapist?.firstName ?? ''} ${assignedTherapist?.lastName ?? ''}`.trim(),
      createdAt: currentAdmission.resourceAllocation?.updatedAt ?? currentAdmission.createdAt,
    });
  }

  return {
    docs: formattedDocs,
    dischargeDate: dischargeDateTime,
    resourceDiscount: currentAdmission?.resourceDiscount,
  };
};

const _filterChangedAdmissions = (
  importantFields: (keyof IAuditLogFields)[],
  data: IAuditLogFields[]
): IAuditLogFields[] => {
  // const sortedData = [...data].sort(
  //   (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  // );

  const result: IAuditLogFields[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      result.push(data[i]);
      continue;
    }

    const prev = data[i - 1];
    const current = data[i];

    const hasChanged = importantFields.some(
      (field) => prev[field]?.toString()?.trim() !== current[field]?.toString()?.trim()
    );

    if (hasChanged) {
      result.push(current);
    }
  }

  return result.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
};

const _summarizeRoomStay = (
  importantFields: (keyof IAuditLogFields)[],
  data: IAuditLogFields[],
  dischargeDate?: string | Date
): IRoomStaySummary[] => {
  if (!data || data.length === 0) return [];

  // const sortedData = [...data].sort(
  //   (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
  // );

  const cleanedData: IAuditLogFields[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      cleanedData.push(data[i]);
      continue;
    }

    const prev = data[i - 1];
    const current = data[i];

    const hasChanged = importantFields.some(
      (field) => prev[field]?.toString()?.trim() !== current[field]?.toString()?.trim()
    );

    if (hasChanged) {
      cleanedData.push(current);
    }
  }

  const filtered = cleanedData.filter(
    (entry) =>
      entry.center?.trim() !== '' &&
      entry.roomType?.trim() !== '' &&
      entry.roomNumber?.trim() !== ''
  );

  const summaries: IRoomStaySummary[] = [];

  let i = 0;
  while (i < filtered.length) {
    const current = filtered[i];
    const checkIn = new Date(current.createdAt!);

    // Track same room/center/roomType
    const currentRoomKey = `${current.center} - ${current.roomType} - ${current.roomNumber}`;

    let j = i + 1;
    while (
      j < filtered.length &&
      filtered[j].center === current.center &&
      filtered[j].roomType === current.roomType &&
      filtered[j].roomNumber === current.roomNumber
    ) {
      j++;
    }

    const checkOut =
      j < filtered.length
        ? new Date(filtered[j].createdAt!)
        : new Date(dischargeDate ?? new Date());

    const twoPmCheckIn = new Date(checkIn);
    twoPmCheckIn.setHours(14, 0, 0, 0);

    const twoPmCheckOut = new Date(checkOut);
    twoPmCheckOut.setHours(14, 0, 0, 0);

    let days = Math.floor(
      (twoPmCheckOut.getTime() - twoPmCheckIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (checkOut.getHours() >= 14) {
      days += 1;
    }

    if (days <= 0) {
      days = 1;
    }

    summaries.push({
      key: currentRoomKey,
      roomNumber: current.roomNumber!,
      center: current.center!,
      roomType: current.roomType!,
      roomTypeId: current.roomTypeId!,
      totalNumberOfDaysSpent: days,
      startDate: checkIn.toISOString(),
      endDate: checkOut.toISOString(),
    });

    i = j;
  }

  return summaries;
};

const _addRoomPricesToSummary = (
  summaries: IRoomStaySummary[],
  priceList: IRoomType[],
  discounts?: IResourceDiscount[]
): IExtendedRoomStaySummary[] => {
  const priceMap = new Map<string, number>();

  // Convert ObjectId to string and Decimal128 to number
  for (const entry of priceList) {
    priceMap.set(
      (entry._id as ObjectId).toString(),
      parseFloat(entry.pricePerDayPerBed.toString())
    );
  }

  return summaries.map((summary) => {
    const price = priceMap.get(summary.roomTypeId.toString()) ?? 0;

    const matchedDiscount = discounts?.find(
      (d) =>
        d.roomTypeId.toString() === summary.roomTypeId.toString() &&
        d.center === summary.center &&
        d.roomType === summary.roomType &&
        d.roomNumber === summary.roomNumber &&
        new Date(d.startDate).toISOString() === new Date(summary.startDate).toISOString()
    );

    return {
      ...summary,
      pricePerDayPerBed: price,
      discountPercentage: matchedDiscount?.discountPercentage ?? 0,
    };
  });
};
