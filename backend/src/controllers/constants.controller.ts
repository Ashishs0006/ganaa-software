import Constant from './../constant';
import catchAsync from './../utils/catchAsync';
import { Response, NextFunction } from 'express';
import { UserRequest } from '../interfaces/extra/i_extended_class';

export const getAllConstants = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: 'success',
      data: Constant,
    });
  }
);
