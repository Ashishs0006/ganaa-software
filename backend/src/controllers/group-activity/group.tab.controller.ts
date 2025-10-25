import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import GroupTab from '../../models/group-activity/group.tab.model';
import { UserRequest } from '../../interfaces/extra/i_extended_class';

export const getAllGroupTab = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.date) return next(new AppError('Date is Mandatory', 400));

    const dt = new Date(req.query.date as string);
    dt.setHours(13, 0, 0, 0);

    // centerId can be provided as query or inferred from logged in user
  const centerId = (req.query.centerId as string) || (req.user as any)?.centerId?.[0]?._id;
    if (!centerId) return next(new AppError('Center Id is Mandatory', 400));

    const data = await GroupTab.find({ activityDateTime: dt, centerId });
console.log('✌️data --abcd->', data);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const createNewGroupTab = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.activityDateTime)
      return next(new AppError('Activity Date Time is Mandatory', 400));
    if (!req.body.tabInfo) return next(new AppError('Tab Info is Mandatory', 400));

    req.body.createdBy = req.user?._id;

    const dt = new Date(req.body.activityDateTime);
    dt.setHours(13, 0, 0, 0);
    req.body.activityDateTime = dt;

    // centerId must be provided in body or inferred
  const centerId = req.body.centerId || (req.user as any)?.centerId?.[0]?._id;
    if (!centerId) return next(new AppError('Center Id is Mandatory', 400));
    req.body.centerId = centerId;

    const existing = await GroupTab.findOne({ activityDateTime: dt, centerId });
    if (existing) return next(new AppError(`A tab info for this date and center already exists`, 400));

    const data = await GroupTab.create(req.body);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleGroupTab = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await GroupTab.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleGroupTab = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // ensure the tab belongs to the user's center (or allow centerId in body)
    const centerId = req.body.centerId || (req.user as any)?.centerId?.[0]?._id;

    const existing = await GroupTab.findById(req.params.id).lean();
    if (!existing) return next(new AppError('Please Provide Valid Group Tab ID', 400));
    const existingCenterId = (existing as any).centerId;
    if (centerId && existingCenterId && existingCenterId.toString() !== centerId.toString())
      return next(new AppError('Not Authorized to update tab for this center', 403));

    const data = await GroupTab.findByIdAndUpdate(
      req.params.id,
      { tabInfo: req.body.tabInfo },
      { new: true }
    );
    if (!data) return next(new AppError('Please Provide Valid Group Tab ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleGroupTab = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await GroupTab.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
