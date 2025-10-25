import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import Loa from '../../models/daily-progress/loa.model';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import GroupActivity from '../../models/group-activity/group.activity.model';

export const getAllGroupActivity = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.date) return next(new AppError('Date is Mandatory', 400));

    const dt = new Date(req.query.date as string);
    dt.setHours(13, 0, 0, 0);

    const data = await GroupActivity.find({ activityDateTime: dt });
    const loaPatientIds = await getAllPatientLoaByDate(dt);

    res.status(200).json({
      status: 'success',
      data: { data, loaPatientIds },
    });
  }
);

export const createNewGroupActivity = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.activityDateTime)
      return next(new AppError('Activity Date Time is Mandatory', 400));
    if (!req.body.patientId) return next(new AppError('Patient Id is Mandatory', 400));

    req.body.createdBy = req.user?._id;

    const dt = new Date(req.body.activityDateTime);
    dt.setHours(13, 0, 0, 0);
    req.body.activityDateTime = dt;

    const isLoaExists = await isLoaRecordExists(req.body.patientId, dt);
    if (isLoaExists) return next(new AppError('Patient is absent today.', 400));

    const existing = await GroupActivity.findOne({
      patientId: req.body.patientId,
      activityDateTime: dt,
    });
    if (existing) return next(new AppError(`An activity for patient already exists`, 400));

    const data = await GroupActivity.create(req.body);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleGroupActivity = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await GroupActivity.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleGroupActivity = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const oldDoc = await GroupActivity.findById(req.params.id).lean();
    if (!oldDoc) return next(new AppError('Please Provide Valid Doc ID', 400));

    const isLoaExists = await isLoaRecordExists(
      oldDoc?.patientId?.toString(),
      oldDoc?.activityDateTime
    );
    if (isLoaExists) return next(new AppError('Patient is absent today.', 400));

    const data = await GroupActivity.findByIdAndUpdate(
      req.params.id,
      { activity: req.body.activity },
      { new: true }
    );
    if (!data) return next(new AppError('Please Provide Valid Group Activity ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleGroupActivity = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await GroupActivity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

/**
 * Helper Functions
 */
export const getAllPatientLoaByDate = async (date: Date): Promise<String[]> => {
  const targetDate = new Date(date);

  // Strip time from the date (set time to 00:00:00)
  const startOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const existingRecord = await Loa.find({
    noteDateTime: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  }).lean();

  const patientIds = existingRecord.map((el) => el.patientId?.toString() ?? '') ?? [];

  return Array.from(new Set(patientIds));
};

export const isLoaRecordExists = async (patientId?: string, date?: Date): Promise<boolean> => {
  if (patientId == undefined) return false;

  const targetDate = date ? new Date(date) : new Date();

  // Strip time from the date (set time to 00:00:00)
  const startOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const existingRecord = await Loa.findOne({
    patientId: patientId,
    noteDateTime: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  }).lean();

  return !!existingRecord;
};
