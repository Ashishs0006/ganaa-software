import mongoose from 'mongoose';
import AppError from '../../utils/appError';
import catchAsync from '../../utils/catchAsync';
import { Response, NextFunction } from 'express';
import Allergy from '../../models/dropdown/allergy.model';
import { IAllergy } from '../../interfaces/model/dropdown/i.allergy';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import PatientAdmissionHistory from '../../models/patient/patient.admission.history.model';

export const getAllAllergy = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IAllergy>(Allergy.find(), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(Allergy.countDocuments(), req.query, rawQuery);

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: data,
    });
  }
);

export const createNewAllergy = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.name) return next(new AppError('Name is Mandatory', 400));

    const data = await Allergy.create(req.body);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const createBulkAllergy = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.allergys) return next(new AppError('Allergys is Mandatory', 400));

    const data = await Allergy.create(req.body.allergys);

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleAllergy = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Allergy.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleAllergy = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.name) {
      const check = await Allergy.findOne({ name: new RegExp(`^${req.body.name}$`, 'i') });
      if (check) return next(new AppError('Name Already Exist', 400));
    }

    const data = await Allergy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Allergy ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleAllergy = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // TODO: Add Check is that Allergy is added anywhere
    await Allergy.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

export const deleteBulkAllergy = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const ids = req.body.allergys;

    if (!Array.isArray(ids) || ids.length === 0)
      return next(new AppError('Request body must contain a non-empty array of ids', 400));

    const referencedIds = await PatientAdmissionHistory.distinct('patientReport.allergiesNames', {
      'patientReport.allergiesNames': { $in: ids },
    });

    const referencedSet = new Set(referencedIds.map((id) => id.toString()));

    const idsToSoftDelete = [];
    const idsToHardDelete = [];

    for (const id of ids) {
      if (referencedSet.has(id.toString())) {
        idsToSoftDelete.push(id);
      } else {
        idsToHardDelete.push(id);
      }
    }

    if (idsToSoftDelete.length > 0) {
      await Allergy.updateMany({ _id: { $in: idsToSoftDelete } }, { $set: { isDeleted: true } });
    }

    if (idsToHardDelete.length > 0) {
      await Allergy.deleteMany({ _id: { $in: idsToHardDelete } });
    }

    res.status(200).json({
      status: 'success',
      message: `${idsToSoftDelete.length + idsToHardDelete.length} Allerg${idsToSoftDelete.length + idsToHardDelete.length === 1 ? 'y' : 'ies'} Deleted Successfully`,
    });
  }
);
