import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import Center from '../../models/resources/center.model';
import RoomType from '../../models/resources/room.type.model';
import RoomNumber from '../../models/resources/room.number.model';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import { IRoomType } from '../../interfaces/model/resources/i.room.type';

export const getAllRoomType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let includeRoomNumbers = false;
    if (req.query.includeRoomNumbers) {
      if (req.query.includeRoomNumbers === 'true') includeRoomNumbers = true;
      delete req.query.includeRoomNumbers;
    }

    const features = new APIFeatures<IRoomType>(RoomType.find({ isDeleted: false }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query.lean();

    const enrichedData = includeRoomNumbers
      ? await Promise.all(
          data.map(async (el) => {
            const roomNumbers = await RoomNumber.find({
              roomTypeId: el._id,
              isDeleted: false,
            }).lean();

            return { ...el, roomNumbers };
          })
        )
      : data;

    const paginationInfo = await PaginationInfo.exec(
      RoomType.countDocuments({ isDeleted: false }),
      req.query,
      rawQuery
    );

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: enrichedData,
    });
  }
);

export const createNewRoomType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.name) return next(new AppError('Room Type Name is Mandatory', 400));
    if (!req.body.centerId) return next(new AppError('Center Id is Mandatory', 400));

    if (req.body._id) delete req.body._id;
    if (req.body.createdAt) delete req.body.createdAt;

    const check = await Center.findById(req.body.centerId);
    if (!check) return next(new AppError('Please Provide Valid Center Id', 400));

    const data = await RoomType.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleRoomType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    let includeRoomNumbers = false;
    if (req.query.includeRoomNumbers) {
      if (req.query.includeRoomNumbers === 'true') includeRoomNumbers = true;
      delete req.query.includeRoomNumbers;
    }

    const data = await RoomType.findById(req.params.id).lean();
    if (!data) return next(new AppError('No Data Found', 400));

    let enrichedData = null;
    if (includeRoomNumbers) {
      const roomNumbers = await RoomNumber.find({
        roomTypeId: data._id,
        isDeleted: false,
      }).lean();

      enrichedData = { ...data, roomNumbers };
    } else {
      enrichedData = data;
    }

    res.status(200).json({
      status: 'success',
      data: enrichedData,
    });
  }
);

export const updateSingleRoomType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await RoomType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Center ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleRoomType = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await RoomType.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
