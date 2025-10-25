import { Response, NextFunction } from 'express';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import Loa from '../../models/daily-progress/loa.model';
import { ILoa } from '../../interfaces/model/daily-progress/i.loa';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import { UserRequest } from '../../interfaces/extra/i_extended_class';

export const getAllLoa = catchAsync(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.query.patientAdmissionHistoryId)
    return next(new AppError('Patient Admission History Id in Params is Mandatory', 400));

  const features = new APIFeatures<ILoa>(Loa.find({}), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const rawQuery = features.rawQuery();
  const data = await features.query;

  const paginationInfo = await PaginationInfo.exec(Loa.countDocuments(), req.query, rawQuery);

  res.status(200).json({
    status: 'success',
    pagination: paginationInfo,
    data: data,
  });
});

export const createNewLoa = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.body._id) delete req.body._id;
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.createdAt) delete req.body.createdAt;
    req.body.createdBy = req.user?._id;
    req.body.loa = true;

    const data = await Loa.create(req.body);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleLoa = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Loa.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleLoa = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await Loa.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
