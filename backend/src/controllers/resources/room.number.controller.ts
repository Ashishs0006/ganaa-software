import { FlattenMaps, ObjectId } from 'mongoose';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import { IBasicObj } from '../../interfaces/generics';
import RoomType from '../../models/resources/room.type.model';
import RoomNumber from '../../models/resources/room.number.model';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import { IRoomNumber } from '../../interfaces/model/resources/i.room.number';
import PatientAdmissionHistory from '../../models/patient/patient.admission.history.model';

export const getAllRoomNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IRoomNumber>(RoomNumber.find({ isDeleted: false }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query.lean();

    const roomTypeId = req.query.roomTypeId ? (req.query.roomTypeId as string).split(',') : [];
    const enrichedData = await _buildAvailableRoomInfo(
      roomTypeId,
      data as unknown as IRoomNumber[]
    );

    const paginationInfo = await PaginationInfo.exec(
      RoomNumber.countDocuments({ isDeleted: false }),
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

export const createNewRoomNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.name) return next(new AppError('Room Type Name is Mandatory', 400));
    if (!req.body.roomTypeId) return next(new AppError('Room Type Id is Mandatory', 400));
    if (!req.body.totalBeds) return next(new AppError('Total Beds is Mandatory', 400));

    if (req.body._id) delete req.body._id;
    if (req.body.createdAt) delete req.body.createdAt;

    const check = await RoomType.findById(req.body.roomTypeId);
    if (!check) return next(new AppError('Please Provide Valid Room Type Id', 400));

    const data = await RoomNumber.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const createBulkNewRoomNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.roomNumbers)
      return next(new AppError('Room Numbers Array is Mandatory', 400));

    const data = await RoomNumber.create(req.body.roomNumbers);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleRoomNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await RoomNumber.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleRoomNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await RoomNumber.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Room Number ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleRoomNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await RoomNumber.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

export const deleteBulkRoomNumber = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    console.log(req.body.roomNumbers);
    if (!req.body.roomNumbers)
      return next(new AppError('Room Numbers Array is Mandatory', 400));

    await RoomNumber.updateMany({ _id: { $in: req.body.roomNumbers } }, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

/**
 * Helper Functions
 */
const _buildAvailableRoomInfo = async (roomTypeId: string[], allRooms: IRoomNumber[]) => {
  let roomTypeQuery: IBasicObj = { isDeleted: false };
  if (roomTypeId.length > 0) {
    roomTypeQuery = {
      ...roomTypeQuery,
      _id: { $in: roomTypeId },
    };
  }

  // 1. Get all RoomTypes for the center
  const roomTypes = await RoomType.find(roomTypeQuery).lean();

  const roomTypeMap = new Map<string, number>(); // roomTypeId => maxOccupancy
  roomTypes.forEach((rt) => {
    roomTypeMap.set(rt._id.toString(), rt.maxOccupancy);
  });

  // 2. Get all RoomNumbers for those RoomTypes
  const roomIds = allRooms.map((room) => room._id);

  // 3. Get active admissions grouped by roomNumberId
  const allocations = await PatientAdmissionHistory.aggregate([
    {
      $match: {
        'resourceAllocation.roomNumberId': { $in: roomIds },
        currentStatus: { $ne: 'Discharged' },
      },
    },
    {
      $group: {
        _id: '$resourceAllocation.roomNumberId',
        activeCount: { $sum: 1 },
      },
    },
  ]);

  const activeCountMap = new Map<string, number>();
  allocations.forEach((entry) => {
    activeCountMap.set(entry._id.toString(), entry.activeCount);
  });

  // 4. Filter out rooms that are at full capacity
  const availableRoomsWithBeds: IBasicObj[] = allRooms
    .map((room) => {
      const roomId = (room._id as ObjectId).toString();
      const typeId = (room.roomTypeId as ObjectId).toString();

      const max = roomTypeMap.get(typeId) ?? 1;
      const currentCount = activeCountMap.get(roomId) ?? 0;
      const availableBeds = max - currentCount;

      return { ...room, availableBeds };
    })
    .filter((room) => room.availableBeds > 0);

  return availableRoomsWithBeds;
};
