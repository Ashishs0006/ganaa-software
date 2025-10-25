import { Response, NextFunction } from 'express';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { isLoaRecordExists } from '../../utils/helper';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import NurseNote from '../../models/daily-progress/nurse.note.model';
import { INurseNote } from '../../interfaces/model/daily-progress/i.nurse.note';

export const getAllNurseNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.patientAdmissionHistoryId)
      return next(new AppError('Patient Admission History Id in Params is Mandatory', 400));

    const features = new APIFeatures<INurseNote>(NurseNote.find({}), req.query)
      .filter('noteDateTime[gte]', 'noteDateTime[lte]')
      .dateRangeFilter('noteDateTime')
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      NurseNote.countDocuments(),
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

export const createNewNurseNote = catchAsync(
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

    const data = await NurseNote.create(req.body);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleNurseNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await NurseNote.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleNurseNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    const oldDoc = await NurseNote.findById(req.params.id).lean();
    if (!oldDoc) return next(new AppError('Please Provide Valid Doc ID', 400));

    const isLoaExists = await isLoaRecordExists(
      oldDoc?.patientId?.toString(),
      oldDoc?.patientAdmissionHistoryId?.toString()
    );
    if (isLoaExists) return next(new AppError('Patient is absent today.', 400));

    const data = await NurseNote.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Center ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleNurseNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // TODO: Add Check is that locker is added anywhere
    await NurseNote.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
