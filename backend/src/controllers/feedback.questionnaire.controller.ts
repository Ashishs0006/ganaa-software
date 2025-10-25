import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { Request, Response, NextFunction } from 'express';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import FeedbackQuestionnaire from '../models/feedback.questionnaire.model';

export const getAllFq = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = await FeedbackQuestionnaire.find().sort('order').lean();

  res.status(200).json({
    status: 'success',
    data: data,
  });
});

export const createNewFq = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.question) return next(new AppError('Question is Mandatory', 400));
    if (!req.body.type) return next(new AppError('Type is Mandatory', 400));

    req.body.createdBy = req.user?._id;
    const data = await FeedbackQuestionnaire.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleFq = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await FeedbackQuestionnaire.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleFq = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.createdBy) delete req.body.createBy;

    const data = await FeedbackQuestionnaire.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Questionnaire ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleFq = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await FeedbackQuestionnaire.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
