import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import ReferredType from '../../models/dropdown/referred.type.model';
import { IReferredType } from '../../interfaces/model/dropdown/i.referredType';

export const getAllReferredType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IReferredType>(ReferredType.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      ReferredType.countDocuments(),
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

export const createNewReferredType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.name) return next(new AppError('Name is Mandatory', 400));

    const data = await ReferredType.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleReferredType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await ReferredType.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleReferredType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.name) {
      const check = await ReferredType.findOne({ name: new RegExp(`^${req.body.name}$`, 'i') });
      if (check) return next(new AppError('Name Already Exist', 400));
    }

    const data = await ReferredType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid ReferredType ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleReferredType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // TODO: Add Check is that ReferredType is added anywhere
    await ReferredType.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
