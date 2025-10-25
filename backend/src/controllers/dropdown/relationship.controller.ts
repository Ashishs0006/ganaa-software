import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import Relationship from '../../models/dropdown/relationship.model';
import { IRelationship } from '../../interfaces/model/dropdown/i.relationship';

export const getAllRelationship = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IRelationship>(
      Relationship.find({ isDeleted: false }),
      req.query
    )
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      Relationship.countDocuments({ isDeleted: false }),
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

export const createNewRelationship = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.shortName) return next(new AppError('Short Name is Mandatory', 400));
    if (!req.body.fullName) return next(new AppError('Full Name is Mandatory', 400));

    const data = await Relationship.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleRelationship = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Relationship.findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleRelationship = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.shortName) {
      const check = await Relationship.findOne({
        shortName: new RegExp(`^${req.body.shortName}$`, 'i'),
      });
      if (check) return next(new AppError('Short Name Already Exist', 400));
    }

    const data = await Relationship.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Relationship ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleRelationship = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await Relationship.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
