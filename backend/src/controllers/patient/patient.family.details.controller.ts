import multer from 'multer';
import multerS3 from 'multer-s3';
import { Response, NextFunction } from 'express';
import Env from '../../constant/env';
import * as S3 from '../../utils/s3Helper';
import AppError from '../../utils/appError';
import { random } from '../../utils/random';
import catchAsync from '../../utils/catchAsync';
import { S3Path } from '../../constant/s3.path';
import { MFileFilter } from '../../utils/multer.config';
import Patient from '../../models/patient/patient.model';
import { IPatient } from '../../interfaces/model/patient/i.patient';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import PatientFamilyDetails from '../../models/patient/patient.family.details.model';
import { IPatientFamilyDetails } from '../../interfaces/model/patient/i.patient.family.details';
import PatientFamilyDetailsRevision from '../../models/patient/patient.family.details.model.revision';
import { IPatientFamilyDetailsRevision } from '../../interfaces/model/patient/i.patient.family.details.revision';

interface MulterS3File extends Express.Multer.File {
  key: string;
  location: string;
}

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
      const filePath = S3Path.patientFamilyDetailsDoc(req.params.patientId, fileName);

      cb(null, filePath);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: MFileFilter.pdfFilter,
});

export const uploadDocument = upload.any();

/**
 * Controllers
 */
export const getAllFamilyDetails = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient Id is Mandatory', 400));

    const features = new APIFeatures<IPatient>(
      PatientFamilyDetails.find({ patientId: req.params.patientId }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(Patient.countDocuments(), req.query, rawQuery);

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: data,
    });
  }
);

export const createNewFamilyDetails = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient Id is Mandatory', 400));

    const { patientFamilyDetails } = req.body;
    const files = req.files as MulterS3File[];

    if (!patientFamilyDetails)
      return next(new AppError('Patient Family Details is Mandatory', 400));

    let parsedDetails;
    try {
      parsedDetails = JSON.parse(patientFamilyDetails);
    } catch (error) {
      return next(new AppError('Invalid JSON format for patientFamilyDetails', 400));
    }

    if (!Array.isArray(parsedDetails))
      return next(new AppError('patientFamilyDetails Should be an Array', 400));

    const fileMap: Record<string, { fieldName: string; tempId: string; awsKey: string }> = {};
    files.forEach((file) => {
      if (file.fieldname.startsWith('idProff_')) {
        const fieldName = file.fieldname;
        const tempId = fieldName.split('_')[1];
        const awsKey = file.key;
        fileMap[tempId] = { fieldName, tempId, awsKey };
      }
    });

    const records = parsedDetails.map((detail) => {
      const newDetails = { ...detail, idProof: fileMap[detail.tempId]?.awsKey || undefined };
      if (newDetails._id) delete newDetails._id;
      if (newDetails.createdAt) delete newDetails.createdAt;
      if (newDetails.createdBy) delete newDetails.createdBy;
      if (newDetails.updatedBy) delete newDetails.updatedBy;
      newDetails.patientId = req.params.patientId;
      newDetails.createdBy = req.user?._id;

      return newDetails;
    });

    const data = await PatientFamilyDetails.create(records);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleFamilyDetails = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));
    if (!req.params.patientId) return next(new AppError('Patient Id is Mandatory', 400));

    const data = await PatientFamilyDetails.findById(req.params.id).lean();
    if (!data) return next(new AppError('No Data Found', 400));
    if (data.patientId.toString() !== req.params.patientId)
      return next(new AppError('Patient Id does not match with Family Details', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateMultipleFamilyDetails = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient Id is Mandatory', 400));

    const { patientFamilyDetails } = req.body;
    const files = req.files as MulterS3File[];

    if (!patientFamilyDetails)
      return next(new AppError('Patient Family Details is Mandatory', 400));

    let parsedDetails;
    try {
      parsedDetails = JSON.parse(patientFamilyDetails);
    } catch (error) {
      return next(new AppError('Invalid JSON format for patientFamilyDetails', 400));
    }

    if (!Array.isArray(parsedDetails))
      return next(new AppError('patientFamilyDetails Should be an Array', 400));

    const fileMap: Record<string, { fieldName: string; tempId: string; awsKey: string }> = {};
    files.forEach((file) => {
      if (file.fieldname.startsWith('idProff_')) {
        const fieldName = file.fieldname;
        const tempId = fieldName.split('_')[1];
        const awsKey = file.key;
        fileMap[tempId] = { fieldName, tempId, awsKey };
      }
    });

    // Get previous versions
    const previousDocs = await PatientFamilyDetails.find({
      _id: { $in: parsedDetails.map(({ _id }) => _id) },
    });

    // Create revision logs
    for (const doc of previousDocs) {
      await createRevisionHistory(doc.toObject());
    }

    const bulkOperations = parsedDetails.map(
      ({ _id, tempId, createdAt, createdBy, ...detail }) => ({
        updateOne: {
          filter: { _id },
          update: {
            $set: {
              ...detail,
              patientId: req.params.patientId,
              updatedBy: req.user?._id,
              ...(tempId ? { idProof: fileMap[tempId]?.awsKey || undefined } : {}),
            },
          },
        },
      })
    );

    await PatientFamilyDetails.bulkWrite(bulkOperations);

    const updatedDocs = await PatientFamilyDetails.find({
      _id: { $in: parsedDetails.map(({ _id }) => _id) },
    }).lean();

    res.status(200).json({
      status: 'success',
      data: updatedDocs,
    });
  }
);

export const deleteSingleFamilyDetails = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));
    if (!req.params.patientId) return next(new AppError('Patient Id is Mandatory', 400));

    const patientPreviousDoc = await PatientFamilyDetails.findOne({
      _id: req.params.id,
      patientId: req.params.patientId,
    }).lean();
    if (!patientPreviousDoc) return next(new AppError('Please Provide Valid IDs', 400));

    await PatientFamilyDetails.deleteOne({ _id: req.params.id });
    if (patientPreviousDoc?.idProof) await S3.deleteFile(patientPreviousDoc?.idProof);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

/*
Helper Functions
*/

const createRevisionHistory = async (previousData: IPatientFamilyDetails) => {
  const revisionNumber = await PatientFamilyDetailsRevision.countDocuments({
    originalId: previousData._id,
  });
  const revisionData = {
    ...previousData,
    originalId: previousData._id,
    revisionNumber: revisionNumber + 1,
  } as IPatientFamilyDetailsRevision;

  delete revisionData._id;
  delete revisionData.createdAt;
  delete revisionData.updatedBy;

  await PatientFamilyDetailsRevision.create(revisionData);
};
