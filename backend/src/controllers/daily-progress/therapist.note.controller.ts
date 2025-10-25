import multer from 'multer';
import { Response, NextFunction } from 'express';
import * as S3 from '../../utils/s3Helper';
import AppError from '../../utils/appError';
import { random } from '../../utils/random';
import { S3Path } from '../../constant/s3.path';
import catchAsync from '../../utils/catchAsync';
import { isLoaRecordExists } from '../../utils/helper';
import { MFileFilter } from '../../utils/multer.config';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import TherapistNote from '../../models/daily-progress/therapist.note.model';
import { ITherapistNote } from '../../interfaces/model/daily-progress/i.therapist.note';

/**
 * Multer Config
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: MFileFilter.pdfFilter,
});

export const uploadFile = upload.single('file');

export const getAllTherapistNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.patientAdmissionHistoryId)
      return next(new AppError('Patient Admission History Id in Params is Mandatory', 400));

    const features = new APIFeatures<ITherapistNote>(TherapistNote.find({}), req.query)
      .filter('noteDateTime[gte]', 'noteDateTime[lte]')
      .dateRangeFilter('noteDateTime')
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      TherapistNote.countDocuments(),
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

export const createNewTherapistNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.patientId) return next(new AppError('Patient ID is Mandatory', 400));
    if (!req.body.patientAdmissionHistoryId)
      return next(new AppError('Patient Admission History ID is Mandatory', 400));

    if (req.body._id) delete req.body._id;
    if (req.body.createdAt) delete req.body.createdAt;
    if (req.body.createdBy) delete req.body.createdBy;
    if (!req.body.therapistId) req.body.therapistId = req.user?._id;
    req.body.createdBy = req.user?._id;

    const isLoaExists = await isLoaRecordExists(
      req.body.patientId,
      req.body.patientAdmissionHistoryId
    );
    if (isLoaExists) return next(new AppError('Patient is absent today.', 400));

    const data = await TherapistNote.create(req.body);

    if (req.file) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${req.file?.originalname}`;
      const filePath = S3Path.therapistFile(req.body.patientId ?? '', fileName);

      await S3.uploadFile(filePath, req.file?.buffer, req.file?.mimetype);
      await TherapistNote.findByIdAndUpdate(data._id, {
        file: {
          fileName: req.file?.originalname,
          filePath: filePath,
        },
      });
    }

    const enrichData = await TherapistNote.findById(data._id);

    res.status(201).json({
      status: 'success',
      data: enrichData,
    });
  }
);

export const getSingleTherapistNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await TherapistNote.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleTherapistNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    const oldDoc = await TherapistNote.findById({ _id: req.params.id });
    if (!oldDoc) return next(new AppError('Please Provide Valid Therapist Note ID', 400));

    const isLoaExists = await isLoaRecordExists(
      oldDoc?.patientId?.toString(),
      oldDoc?.patientAdmissionHistoryId?.toString()
    );
    if (isLoaExists) return next(new AppError('Patient is absent today.', 400));

    if (req.file) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${req.file?.originalname}`;
      const filePath = S3Path.therapistFile(req.body.patientId ?? '', fileName);

      await S3.uploadFile(filePath, req.file?.buffer, req.file?.mimetype);
      await TherapistNote.findByIdAndUpdate(req.params.id, {
        file: {
          fileName: req.file?.originalname,
          filePath: filePath,
        },
      });
    }

    const data = await TherapistNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Therapist Note ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleTherapistNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // TODO: Add Check is that locker is added anywhere
    await TherapistNote.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
