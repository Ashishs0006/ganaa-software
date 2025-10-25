import { Response, NextFunction } from 'express';
import * as S3 from './../utils/s3Helper';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import CommonFile from '../models/common.file.model';
import { ICommonFiles } from '../interfaces/i.common.files';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../utils/appFeatures';

export const getCommonFiles = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<ICommonFiles>(CommonFile.find({}), req.query)
      .filter('createdAt[gte]', 'createdAt[lte]')
      .dateRangeFilter('createdAt')
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      CommonFile.countDocuments(),
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

export const getCommonFile = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await CommonFile.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteCommonFile = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await CommonFile.findById(req.params.id)
      .setOptions({ skipUrlGeneration: true })
      .lean();
    if (!data) return next(new AppError('No Data Found', 400));

    await S3.deleteFile(data.filePath);

    await CommonFile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
