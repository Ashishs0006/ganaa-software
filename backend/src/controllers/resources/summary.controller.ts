import { Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import Center from '../../models/resources/center.model';
import { UserRequest } from '../../interfaces/extra/i_extended_class';

export const getResourceSummary = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const data = await Center.getCenterSummary();

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);
