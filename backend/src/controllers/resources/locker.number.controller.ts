import { Response, NextFunction } from 'express';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import LockerNumber from '../../models/resources/locker.number.model';
import { ILockerNumber } from '../../interfaces/model/resources/i.locker.number';

export const getAllLockerNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<ILockerNumber>(
      LockerNumber.find({ isDeleted: false }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      LockerNumber.countDocuments({ isDeleted: false }),
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

export const createNewLockerNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.centerId) return next(new AppError('Center Id is Mandatory', 400));
    if (!req.body.name) return next(new AppError('Locker Name is Mandatory', 400));

    if (req.body._id) delete req.body._id;
    if (req.body.createdAt) delete req.body.createdAt;

    const data = await LockerNumber.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const createBulkLockerNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.lockerNumbers)
      return next(new AppError('Locker Numbers Array is Mandatory', 400));

    const data = await LockerNumber.create(req.body.lockerNumbers);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleLockerNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await LockerNumber.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleLockerNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await LockerNumber.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Center ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleLockerNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // TODO: Add Check is that locker is added anywhere
    await LockerNumber.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

export const deleteBulkLockerNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.lockerNumbers)
      return next(new AppError('Locker Numbers Array is Mandatory', 400));

    await LockerNumber.updateMany({ _id: { $in: req.body.lockerNumbers } }, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
