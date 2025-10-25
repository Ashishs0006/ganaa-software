import Role from '../models/role.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import FilterObject from '../utils/filterObject';
import { Response, NextFunction } from 'express';
import { IRole } from '../interfaces/model/i.role.model';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../utils/appFeatures';

export const getAllRoles = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IRole>(Role.find(), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(Role.countDocuments(), req.query, rawQuery);

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: data,
    });
  }
);

export const createNewRole = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.name) return next(new AppError('Name is Mandatory', 400));
    if (!req.body.permissions) return next(new AppError('Permissions is Mandatory', 400));

    const data = await Role.create(req.body);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleRole = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Role.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleRole = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const filteredBody = new FilterObject(req.body, 'name', 'permissions').get();

    const data = await Role.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Role ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleRole = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await Role.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
