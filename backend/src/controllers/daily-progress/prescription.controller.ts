import { Response, NextFunction } from 'express';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { isLoaRecordExists } from '../../utils/helper';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import Prescription from '../../models/daily-progress/prescription.model';
import { IPrescription } from '../../interfaces/model/daily-progress/i.prescription';
import PrescriptionRevision from '../../models/daily-progress/prescription.revision.model';
import { IPrescriptionRevision } from '../../interfaces/model/daily-progress/i.prescription.revision';

export const getAllPrescription = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.patientAdmissionHistoryId)
      return next(new AppError('Patient Admission History Id in Params is Mandatory', 400));

    const features = new APIFeatures<IPrescription>(Prescription.find({}), req.query)
      .filter('noteDateTime[gte]', 'noteDateTime[lte]')
      .dateRangeFilter('noteDateTime')
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      Prescription.countDocuments(),
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

export const getAllPrescriptionRevision = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.patientAdmissionHistoryId)
      return next(new AppError('Patient Admission History Id in Params is Mandatory', 400));

    const features = new APIFeatures<IPrescriptionRevision>(
      PrescriptionRevision.find({}),
      req.query
    )
      .filter('noteDateTime[gte]', 'noteDateTime[lte]')
      .dateRangeFilter('noteDateTime')
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      PrescriptionRevision.countDocuments(),
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

export const createNewPrescription = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.patientId) return next(new AppError('Patient ID is Mandatory', 400));
    if (!req.body.patientAdmissionHistoryId)
      return next(new AppError('Patient Admission History ID is Mandatory', 400));

    if (req.body._id) delete req.body._id;
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.createdAt) delete req.body.createdAt;
    req.body.createdBy = req.user?._id;

    const isLoaExists = await isLoaRecordExists(
      req.body.patientId,
      req.body.patientAdmissionHistoryId
    );
    if (isLoaExists) return next(new AppError('Patient is absent today.', 400));

    const data = await Prescription.create(req.body);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSinglePrescription = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Prescription.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSinglePrescription = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));
    PrescriptionRevision;
    const oldDoc = await Prescription.findById(req.params.id)
      .populate([
        { path: 'createdBy', select: '_id firstName lastName gender roleId' },
        { path: 'updatedBy', select: '_id firstName lastName gender roleId' },
      ])
      .lean();
    if (!oldDoc) return next(new AppError('Please Provide Valid Doc ID', 400));

    const isLoaExists = await isLoaRecordExists(
      oldDoc?.patientId?.toString(),
      oldDoc?.patientAdmissionHistoryId?.toString()
    );
    if (isLoaExists) return next(new AppError('Patient is absent today.', 400));

    const data = await Prescription.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      {
        new: true,
      }
    );
    if (!data) return next(new AppError('Please Provide Valid Doctor Note ID', 400));

    await createRevisionHistory(oldDoc);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSinglePrescription = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await Prescription.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

/**
 * Helper Functions
 */
const createRevisionHistory = async (previousData: IPrescription) => {
  const revisionNumber = await PrescriptionRevision.countDocuments({
    originalId: previousData._id,
  });

  const newRevision = {
    ...previousData,
    originalId: previousData._id,
    revision: revisionNumber + 1,
    _id: null,
  } as IPrescriptionRevision;

  delete newRevision.createdAt;

  await PrescriptionRevision.create(newRevision);
};
