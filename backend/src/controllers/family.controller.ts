import { ObjectId } from 'mongoose';
import { Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import { IUser } from '../models/user.model';
import catchAsync from '../utils/catchAsync';
import FilterObject from '../utils/filterObject';
import Patient from '../models/patient/patient.model';
import { ICenter } from '../interfaces/model/resources/i.center';
import NurseNote from '../models/daily-progress/nurse.note.model';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../utils/appFeatures';
import GroupActivity from '../models/group-activity/group.activity.model';
import { INurseNote } from '../interfaces/model/daily-progress/i.nurse.note';
import { IGroupActivity } from '../interfaces/model/group-activity/i.group.activity';
import PatientAdmissionHistory from '../models/patient/patient.admission.history.model';

export const getPatientInfo = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const patientInfo = await Patient.findById(req.user?.patientId)
      .select('uhid firstName lastName phoneNumberCountryCode phoneNumber patientPic gender')
      .setOptions({ skipResAllPopulate: true })
      .lean();
    if (!patientInfo) return next(new AppError('No active patient assigned to user.', 400));

    const latestHistory = await PatientAdmissionHistory.getLatestPatientHistory([
      req.user?.patientId as ObjectId,
    ]);
    const [latestRecord] = Object.values(latestHistory);
    if (!latestRecord) return next(new AppError('Invalid patient admission information.', 400));

    const therapistInfo = latestRecord.resourceAllocation?.assignedTherapistId as IUser;
    const doctorInfo = latestRecord.resourceAllocation?.assignedDoctorId as IUser;

    res.status(200).json({
      status: 'success',
      data: {
        ...patientInfo,
        dateOfAdmission: latestRecord.dateOfAdmission,
        centerName: (latestRecord.resourceAllocation?.centerId as ICenter)?.centerName ?? '',
        therapistInfo: { firstName: therapistInfo?.firstName, lastName: therapistInfo?.lastName },
        doctorInfo: { firstName: doctorInfo?.firstName, lastName: doctorInfo?.lastName },
      },
    });
  }
);

export const getPatientNurseNote = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // Accept only the required parameters to ensure security.
    const filteredQuery = new FilterObject(
      req.query,
      'limit',
      'page',
      'sort',
      'noteDateTime[gte]',
      'noteDateTime[lte]'
    ).get();

    const latestHistory = await PatientAdmissionHistory.getLatestPatientHistory([
      req.user?.patientId as ObjectId,
    ]);
    const [latestRecord] = Object.values(latestHistory);
    if (!latestRecord) return next(new AppError('Invalid patient admission information.', 400));

    const features = new APIFeatures<INurseNote>(
      NurseNote.find({ patientAdmissionHistoryId: latestRecord._id }),
      filteredQuery
    )
      .filter('noteDateTime[gte]', 'noteDateTime[lte]')
      .dateRangeFilter('noteDateTime')
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      NurseNote.countDocuments(),
      filteredQuery,
      rawQuery
    );

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: data,
    });
  }
);

export const getPatientGroupActivity = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // Accept only the required parameters to ensure security.
    const filteredQuery = new FilterObject(
      req.query,
      'limit',
      'page',
      'sort',
      'activityDateTime[gte]',
      'activityDateTime[lte]'
    ).get();

    const latestHistory = await PatientAdmissionHistory.getLatestPatientHistory([
      req.user?.patientId as ObjectId,
    ]);
    const [latestRecord] = Object.values(latestHistory);
    if (!latestRecord) return next(new AppError('Invalid patient admission information.', 400));

    if (!latestRecord.dateOfAdmission)
      return next(new AppError('Invalid Admission Date Time.', 400));
    if (isNaN(latestRecord.dateOfAdmission.getTime()))
      return next(new AppError('Invalid date of admission.', 400));

    const activityDateGteStr = filteredQuery['activityDateTime[gte]'];
    const activityDateLteStr = filteredQuery['activityDateTime[lte]'];
    const admissionDate = new Date(latestRecord.dateOfAdmission);
    if (activityDateGteStr) {
      const activityDateGte = new Date(activityDateGteStr);
      if (isNaN(activityDateGte.getTime())) {
        return next(new AppError('Invalid activityDateTime[gte] value.', 400));
      }

      if (activityDateGte < admissionDate) {
        return next(
          new AppError('activityDateTime[gte] cannot be before the date of admission.', 400)
        );
      }
    } else {
      filteredQuery['activityDateTime[gte]'] = admissionDate.toISOString();
    }

    if (activityDateLteStr) {
      const activityDateLte = new Date(activityDateLteStr);
      if (isNaN(activityDateLte.getTime())) {
        return next(new AppError('Invalid activityDateTime[lte] value.', 400));
      }

      if (activityDateLte < admissionDate) {
        return next(
          new AppError('activityDateTime[lte] cannot be before the date of admission.', 400)
        );
      }
    } else {
      filteredQuery['activityDateTime[lte]'] = new Date().toISOString();
    }

    const features = new APIFeatures<IGroupActivity>(
      GroupActivity.find({ patientId: latestRecord.patientId }),
      filteredQuery
    )
      .filter('activityDateTime[gte]', 'activityDateTime[lte]')
      .dateRangeFilter('activityDateTime')
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(
      GroupActivity.countDocuments(),
      filteredQuery,
      rawQuery
    );

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: data,
    });
  }
);
