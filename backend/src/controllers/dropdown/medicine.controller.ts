import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import Medicine from '../../models/dropdown/medicine.model';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import { IMedicine } from '../../interfaces/model/dropdown/i.medicine';

export const getAllMedicine = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IMedicine>(Medicine.find({ isDeleted: false }), req.query)
      .search('_id', 'createdAt', 'dosage')
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      Medicine.countDocuments({ isDeleted: false }),
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

export const createNewMedicine = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.name) return next(new AppError('Name is Mandatory', 400));

    const data = await Medicine.create(req.body);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const createBulkMedicine = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.medicines) return next(new AppError('Medicines Array is Mandatory', 400));

    const data = await Medicine.create(req.body.medicines);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleMedicine = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Medicine.findOne({ _id: req.params.id, isDeleted: false }).lean();
    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleMedicine = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.name) {
      const check = await Medicine.findOne({
        name: new RegExp(`^${req.body.name}$`, 'i'),
      });
      if (check) return next(new AppError('Name Already Exist', 400));
    }

    const data = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Medicine ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateBulkMedicine = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const medicines = req.body.medicines;

    if (!Array.isArray(medicines) || medicines.length === 0)
      return next(new AppError('Request body must be a non-empty array of medicines', 400));

    const updatedDocs = await Promise.all(
      medicines.map(async (med) => {
        const { _id, name, ...rest } = med;

        // 1. Ensure an _id is present
        if (!_id) return;

        // 2. If name is changing, ensure uniqueness
        if (name) {
          const conflict = await Medicine.findOne({
            name: new RegExp(`^${name}$`, 'i'),
            _id: { $ne: _id },
          });
          if (conflict) {
            throw new AppError(`Medicine name "${name}" already exists`, 400);
          }
        }

        // 3. Perform the update
        const updated = await Medicine.findByIdAndUpdate(
          _id,
          { ...(name !== undefined ? { name } : {}), ...rest },
          { new: true, runValidators: true }
        );

        if (!updated) throw new AppError(`No medicine found with ID ${_id}`, 400);

        return updated;
      })
    );

    res.status(200).json({
      status: 'success',
      data: updatedDocs,
    });
  }
);

export const deleteSingleMedicine = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    await Medicine.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

export const deleteBulkMedicine = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.medicines) return next(new AppError('Medicines Array is Mandatory', 400));

    await Medicine.updateMany({ _id: { $in: req.body.medicines } }, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);
