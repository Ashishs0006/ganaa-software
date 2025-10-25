import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import Center from '../../models/resources/center.model';
import { ICenter } from '../../interfaces/model/resources/i.center';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';

export const getAllCenter = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<ICenter>(Center.find({ isDeleted: false }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      Center.countDocuments({ isDeleted: false }),
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

export const createNewCenter = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.centerName) return next(new AppError('Center Name is Mandatory', 400));

    if (req.body._id) delete req.body._id;
    if (req.body.createdAt) delete req.body.createdAt;

    const data = await Center.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleCenter = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Center.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleCenter = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Center.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Center ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleCenter = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await Center.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
