import multer from 'multer';
import mongoose, { ObjectId } from 'mongoose';
import { Response, NextFunction } from 'express';
import Lead from '../../models/lead.model';
import Role from '../../models/role.model';
import * as S3 from '../../utils/s3Helper';
import User from '../../models/user.model';
import AppError from '../../utils/appError';
import { random } from '../../utils/random';
import * as Helper from '../../utils/helper';
import catchAsync from '../../utils/catchAsync';
import { S3Path } from '../../constant/s3.path';
import FilterObject from '../../utils/filterObject';
import Collections from '../../constant/collections';
import { IBasicObj } from '../../interfaces/generics';
import { MFileFilter } from '../../utils/multer.config';
import Patient from '../../models/patient/patient.model';
import { IPatient } from '../../interfaces/model/patient/i.patient';
import { UserRequest } from '../../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../../utils/appFeatures';
import NurseNotes from '../../models/daily-progress/nurse.note.model';
import DoctorNote from '../../models/daily-progress/doctor.note.model';
import PatientRevision from '../../models/patient/patient.revision.model';
import Prescription from '../../models/daily-progress/prescription.model';
import TherapistNote from '../../models/daily-progress/therapist.note.model';
import PatientCaseHistory from '../../models/patient/patient.case.history.model';
import { IPatientRevision } from '../../interfaces/model/patient/i.patient.revision';
import { IPatientDischarge } from '../../interfaces/model/patient/i.patient.discharge';
import PatientAdmissionHistory from '../../models/patient/patient.admission.history.model';

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 2 * 1024 * 1024 },
//   fileFilter: MFileFilter.imageFilter,
// });

// const uploadFile = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 2 * 1024 * 1024 },
//   fileFilter: MFileFilter.pdfFilter,
// });

// export const uploadPatientPic = upload.single('patientPic');
// export const idProof = uploadFile.single('idProof');

export const uploadPatientFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'patientPic') {
      return MFileFilter.imageFilter(req, file, cb);
    }
    if (file.fieldname === 'idProof') {
      return MFileFilter.pdfFilter(req, file, cb);
    }
    cb(null, false);
  },
}).fields([
  { name: 'patientPic', maxCount: 1 },
  { name: 'idProof', maxCount: 5 },
]);

/**
 * Controllers
 */
export const getAllPatient = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    // Filtering Based on Center & Status
    const filterIds = await _buildPatientFilterQuery(req.query);
    if (filterIds.length > 0) req.query._id = { in: filterIds };
    if (filterIds.length < 1 && req.query.isStatusAndFilterQuery) {
      return res.status(200).json({
        status: 'success',
        pagination: null,
        data: [],
      });
    }

    if (req.query.isStatusAndFilterQuery) delete req.query.isStatusAndFilterQuery;
    if (req.query.status) delete req.query.status;
    if (req.query.centers) delete req.query.centers;
    if (req.query.admissionType) delete req.query.admissionType;
    if (req.query.illnessType) delete req.query.illnessType;
    if (req.query.hyperTension) delete req.query.hyperTension;
    if (req.query.heartDisease) delete req.query.heartDisease;
    if (req.query.levelOfRisk) delete req.query.levelOfRisk;
    if (req.query.leadType) delete req.query.leadType;

    let onlyPatient = false;
    if (req.query.onlyPatient && req.query.onlyPatient === 'true') {
      onlyPatient = true;
      delete req.query.onlyPatient;
    } else {
      delete req.query.onlyPatient;
    }

    const features = new APIFeatures<IPatient>(
      Patient.find().setOptions({ skipResAllPopulate: onlyPatient }),
      req.query
    )
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query.lean();
    const patientIds = data.map((el) => el._id as ObjectId);

    const paginationInfo = await PaginationInfo.exec(Patient.countDocuments(), req.query, rawQuery);

    if (onlyPatient) {
      return res.status(200).json({
        status: 'success',
        pagination: paginationInfo,
        data: data,
      });
    }
    const admissionHistoryMap = await PatientAdmissionHistory.getLatestPatientHistory(patientIds);
    const enrichedData = data.map((record) => ({
      ...record,
      patientHistory: admissionHistoryMap[record._id?.toString()!],
    }));

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: enrichedData,
    });
  }
);

export const isPatientExist = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.firstName) return next(new AppError('First Name is Mandatory', 400));
    if (!req.query.lastName) return next(new AppError('Last Name is Mandatory', 400));
    if (!req.query.dob) return next(new AppError('Date of Birth is Mandatory', 400));
    if (!req.query.phoneNumber) return next(new AppError('Phone Number is Mandatory', 400));

    const filters: IBasicObj = {};

    filters.firstName = { $regex: `^${(req.query.firstName as string).trim()}$`, $options: 'i' };
    filters.lastName = { $regex: `^${(req.query.lastName as string).trim()}$`, $options: 'i' };
    filters.phoneNumber = { $regex: `^${(req.query.phoneNumber as string).trim()}$` };

    const date = new Date(req.query.dob as string);
    if (isNaN(date.getTime())) return next(new AppError('Invalid date format for dob', 400));

    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(24, 0, 0, 0));

    filters.dob = {
      $gte: startOfDay,
      $lt: endOfDay,
    };

    const patients = await Patient.find(filters)
      .select('uhid')
      .setOptions({ skipResAllPopulate: true })
      .lean();

    const isExist = patients.length > 0;

    res.status(200).json({
      status: 'success',
      data: {
        isExist,
        patient: isExist ? patients : [],
      },
    });
  }
);

export const createNewPatient = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.firstName) return next(new AppError('First Name is Mandatory', 400));
    if (!req.body.age) return next(new AppError('Age is Mandatory', 400));

    if (req.body._id) delete req.body._id;
    if (req.body.createdAt) delete req.body.createdAt;
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.updatedBy) delete req.body.updatedBy;

    if (req.body.firstName) req.body.firstName = Helper.normalizeAndTitleCase(req.body.firstName);
    if (req.body.lastName) req.body.lastName = Helper.normalizeAndTitleCase(req.body.lastName);

    if (req.body.email) {
      const check = await User.exists({ email: req.body.email });
      if (check) return next(new AppError('Email address already registered', 400));
    }

    req.body.createdBy = req.user?._id;
    const data = await Patient.create(req.body);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const patientPic = files?.['patientPic']?.[0];
    const idProofFiles = files?.['idProof'] || [];

    const idProofPaths: string[] = [];
    const idProofNames: string[] = [];

    if (patientPic) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${patientPic?.originalname}`;
      const filePath = S3Path.patientPic(data._id?.toString() ?? '', fileName);

      await S3.uploadFile(filePath, patientPic?.buffer, patientPic?.mimetype);
      await Patient.findByIdAndUpdate(data._id, {
        patientPic: filePath,
        patientPicFileName: fileName,
        updatedBy: req.user?._id,
      });
    }

    for (const file of idProofFiles) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${file.originalname}`;
      const filePath = S3Path.idProof(data._id?.toString() ?? '', fileName);

      await S3.uploadFile(filePath, file.buffer, file.mimetype);
      idProofPaths.push(filePath);
      idProofNames.push(fileName);
    }

    if (idProofPaths.length > 0) {
      await Patient.findByIdAndUpdate(data._id, {
        $push: {
          idProof: { $each: idProofPaths },
          patientIdProofName: { $each: idProofNames },
        },
        updatedBy: req.user?._id,
      });
    }

    if (req.body.email) {
      await _createPatientFamilyUser(req.body, data);
    }

    const populatedData = await Patient.findById(data._id).lean();

    res.status(200).json({
      status: 'success',
      data: populatedData,
    });
  }
);

export const getSinglePatient = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Patient.findById(req.params.id).lean();
    if (!data) return next(new AppError('No Data Found', 400));

    const admissionHistoryMap = await PatientAdmissionHistory.getLatestPatientHistory([
      data._id as ObjectId,
    ]);
    const enrichedData = {
      ...data,
      patientHistory: admissionHistoryMap[data._id?.toString()!],
    };

    res.status(200).json({
      status: 'success',
      data: enrichedData,
    });
  }
);

export const updateSinglePatient = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (Helper.isExist(req, 'firstName') && req.body.firstName.length === 0)
      return next(new AppError('First Name is Mandatory', 400));
    if (Helper.isExist(req, 'area') && req.body.area.length === 0)
      return next(new AppError('Area is Mandatory', 400));
    if (Helper.isExist(req, 'age') && req.body.age.length === 0)
      return next(new AppError('Age is Mandatory', 400));
    if (
      Helper.isExist(req, 'phoneNumberCountryCode') &&
      req.body.phoneNumberCountryCode.length === 0
    )
      return next(new AppError('Phone Number Country Code is Mandatory', 400));
    if (Helper.isExist(req, 'phoneNumber') && req.body.phoneNumber.length === 0)
      return next(new AppError('Phone Number is Mandatory', 400));
    if (Helper.isExist(req, 'gender') && req.body.gender.length === 0)
      return next(new AppError('Gender is Mandatory', 400));
    if (Helper.isExist(req, 'fullAddress') && req.body.fullAddress.length === 0)
      return next(new AppError('Full Address is Mandatory', 400));

    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.updatedBy) delete req.body.updatedBy;
    req.body.updatedBy = req.user?._id;
    if (req.body.firstName) req.body.firstName = Helper.normalizeAndTitleCase(req.body.firstName);
    if (req.body.lastName) req.body.lastName = Helper.normalizeAndTitleCase(req.body.lastName);

    const modifiedBody = Helper.buildUnsetAndDelete(
      req,
      'emergencyContactRelationshipId',
      'referredById'
    );

    // Filter Request Body
    let filterObj = new FilterObject(
      modifiedBody,
      'firstName',
      'lastName',
      'dob',
      'age',
      'email',
      'phoneNumberCountryCode',
      'phoneNumber',
      'alternativephoneNumberCountryCode',
      'alternativeMobileNumber',
      'gender',
      'identificationMark',
      'country',
      'fullAddress',
      'area',
      'patientPic',
      'patientPicFileName',
      'idProof',
      'patientIdProofName',
      'referredTypeId',
      'referralDetails',
      'education',
      'familyIncome',
      'religion',
      'language',
      'isMarried',
      'numberOfChildren',
      'occupation',
      'personalIncome',
      'updatedBy',
      '$unset'
    ).get();

    if (filterObj.email) {
      const check = await User.exists({ email: filterObj.email });
      if (check) return next(new AppError('Email address already registered', 400));
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const patientPic = files?.['patientPic']?.[0];
    const idProofFiles = files?.['idProof'] || [];
    console.log('idProofFiles: ', idProofFiles);

    const idProofPaths: string[] = [];
    const idProofNames: string[] = [];

    if (patientPic) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${patientPic?.originalname}`;
      const filePath = S3Path.patientPic(req.params.id ?? '', fileName);

      await S3.uploadFile(filePath, patientPic?.buffer, patientPic?.mimetype);
      filterObj.patientPic = filePath;
      filterObj.patientPicFileName = fileName;
    }

    
    const patientPreviousDoc = await Patient.findById(req.params.id).lean();
    if (!patientPreviousDoc) return next(new AppError('Please Provide Valid Patient ID', 400));
    
    const data = await Patient.findByIdAndUpdate(req.params.id, filterObj, { new: true });
    if (!data) return next(new AppError('Please Provide Valid Patient ID', 400));
    
    for (const file of idProofFiles) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${file.originalname}`;
      const filePath = S3Path.idProof(data._id?.toString() ?? '', fileName);

      await S3.uploadFile(filePath, file.buffer, file.mimetype);
      idProofPaths.push(filePath);
      idProofNames.push(fileName);
    }

    if (idProofPaths.length > 0) {
      await Patient.findByIdAndUpdate(data._id, {
        $push: {
          idProof: { $each: idProofPaths },
          patientIdProofName: { $each: idProofNames },
        },
        updatedBy: req.user?._id,
      });
    }

    const admissionHistoryMap = await PatientAdmissionHistory.getLatestPatientHistory([
      data._id as ObjectId,
    ]);
    const enrichedData = {
      ...data.toJSON(),
      patientHistory: admissionHistoryMap[data._id?.toString()!],
    };

    await _createPatientRevision(patientPreviousDoc);
    await _checkAndCreatePatientFamilyUser(data);

    res.status(200).json({
      status: 'success',
      data: enrichedData,
    });
  }
);

export const deleteSinglePatient = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // TODO: Add Check is that patient is added anywhere
    await Patient.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

export const searchPatient = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { name, dob, phoneNumber, age, currentStatus, uhid } = req.query;

    // Build a search query dynamically
    const searchQuery: { [key: string]: any } = {};

    if (name) {
      searchQuery.$or = [
        { firstName: { $regex: `^${name.toString().toLowerCase()}`, $options: 'i' } },
        { lastName: { $regex: `^${name.toString().toLowerCase()}`, $options: 'i' } },
      ];
    }

    if (uhid) {
      searchQuery.uhid = _extractNumber(uhid as string);
    }

    if (phoneNumber) {
      searchQuery.phoneNumber = { $regex: `^${phoneNumber}`, $options: 'i' };
    }
    if (currentStatus) {
      searchQuery.currentStatus = { $regex: `^${currentStatus}`, $options: 'i' };
    }

    if (dob) {
      const dobDate = new Date(dob as string); // Convert to Date

      if (!isNaN(dobDate.getTime())) {
        const startOfDay = new Date(dobDate.setHours(0, 0, 0, 0)); // Set to midnight (00:00:00)
        const endOfDay = new Date(dobDate.setHours(23, 59, 59, 999)); // Set to 23:59:59.999
        searchQuery.dob = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    if (age) {
      const ageNumber = parseInt(age as string, 10);

      if (!isNaN(ageNumber)) {
        searchQuery.age = ageNumber;
      }
    }

    const features = new APIFeatures<IPatient>(Patient.find(searchQuery), req.query)
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const enrichedData = await Promise.all(
      data.map(async (el) => {
        const plainEl = el.toObject();
        let status: string | undefined;

        let patientHistory = await PatientAdmissionHistory.find({ patientId: plainEl._id })
          .setOptions({
            skipUrlGeneration: true,
            populateUser: true,
            shouldPopulateFeedback: true,
            skipResAllPopulate: true,
            shouldSkip: true,
          })
          .populate({
            path: 'dischargeId',
            select: 'date',
          })
          .select('patientId dateOfAdmission dischargeId currentStatus')
          .lean();

        // Sort by dateOfAdmission in descending order (latest first)
        if (patientHistory.length > 1) {
          patientHistory = patientHistory.sort(
            (a, b) =>
              new Date(b.dateOfAdmission!).getTime() - new Date(a.dateOfAdmission!).getTime()
          );
        }

        // Get currentStatus from the latest admission
        if (patientHistory.length > 0) {
          status = patientHistory[0].currentStatus;
        }

        const enrichedPatientHistory = patientHistory.map((e) => ({
          ...e,
          dateOfDischarge: (e?.dischargeId as IPatientDischarge)?.date,
          dischargeId: undefined,
        }));

        return { ...plainEl, currentStatus: status, admissionHistory: enrichedPatientHistory };
      })
    );

    const paginationInfo = await PaginationInfo.exec(Patient.countDocuments(), req.query, rawQuery);

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: enrichedData,
    });
  }
);

export const getAllSinglePatientDailyProgress = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.patientId) return next(new AppError('Patient in Params is Mandatory', 400));
    if (!req.params.historyId)
      return next(new AppError('Admission History Id in Params is Mandatory', 400));

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const skip = (page - 1) * limit;

    const matchStage: IBasicObj = {
      patientId: new mongoose.Types.ObjectId(req.params.patientId),
      patientAdmissionHistoryId: new mongoose.Types.ObjectId(req.params.historyId),
    };

    if (req.query.startDate || req.query.endDate) {
      const dateFilter: any = {};
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate as string);
        if (!isNaN(startDate.getTime())) {
          dateFilter.$gte = startDate;
        }
      }

      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate as string);
        if (!isNaN(endDate.getTime())) {
          dateFilter.$lte = endDate;
        }
      }

      if (Object.keys(dateFilter).length) {
        matchStage.noteDateTime = dateFilter;
      }
    }

    const therapistRoles = await Role.find({
      name: { $in: ['Therapist', 'Therapist+AM'] }, // Add as many names as needed
    }).select('_id');

    const therapistRoleIds = therapistRoles.map((el) => el._id);

    const result = await NurseNotes.aggregate([
      { $match: matchStage },
      { $addFields: { docType: { $literal: 'nurse' } } },
      {
        $unionWith: {
          coll: Collections.therapistNote.d,
          pipeline: [
            { $match: matchStage }, // existing match stage
            { $addFields: { docType: { $literal: 'therapist' } } },

            // Lookup therapist details
            {
              $lookup: {
                from: Collections.user.d,
                localField: 'therapistId',
                foreignField: '_id',
                as: 'therapistId',
              },
            },
            { $unwind: { path: '$therapistId', preserveNullAndEmptyArrays: true } },

            // ✅ Filter by therapist roles here
            {
              $match: {
                'therapistId.roleId': { $in: therapistRoleIds },
              },
            },

            // Project final output
            {
              $project: {
                _id: 1,
                patientId: 1,
                patientAdmissionHistoryId: 1,
                noteDateTime: 1,
                note: 1,
                file: 1,
                sessionType: 1,
                subSessionType: 1,
                score: 1,
                'therapistId._id': 1,
                'therapistId.roleId': 1,
                'therapistId.firstName': 1,
                'therapistId.lastName': 1,
                'therapistId.gender': 1,
                createdBy: 1,
                createdAt: 1,
                docType: 1,
              },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: Collections.doctorNote.d,
          pipeline: [
            { $match: matchStage },
            { $addFields: { docType: { $literal: 'doctor_notes' } } },
            {
              $lookup: {
                from: Collections.user.d,
                localField: 'doctorId',
                foreignField: '_id',
                as: 'doctorId',
              },
            },
            { $unwind: { path: '$doctorId', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                patientId: 1,
                patientAdmissionHistoryId: 1,
                noteDateTime: 1,
                note: 1,
                sessionType: 1,
                'doctorId._id': 1,
                'doctorId.roleId': 1,
                'doctorId.firstName': 1,
                'doctorId.lastName': 1,
                'doctorId.gender': 1,
                createdBy: 1,
                createdAt: 1,
                docType: 1,
              },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: Collections.loa.d,
          pipeline: [
            { $match: matchStage },
            { $addFields: { docType: { $literal: 'loa' } } },
            {
              $lookup: {
                from: Collections.user.d,
                localField: 'createdBy',
                foreignField: '_id',
                as: 'createdBy',
              },
            },
            { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },
            {
              $project: {
                _id: 1,
                patientId: 1,
                patientAdmissionHistoryId: 1,
                loa: 1,
                noteDateTime: 1,
                'createdBy._id': 1,
                'createdBy.roleId': 1,
                'createdBy.firstName': 1,
                'createdBy.lastName': 1,
                'createdBy.gender': 1,
                createdAt: 1,
                docType: 1,
              },
            },
          ],
        },
      },
      {
        $unionWith: {
          coll: Collections.prescription.d,
          pipeline: [
            { $match: matchStage },
            { $addFields: { docType: { $literal: 'doctor_prescriptions' } } },
            {
              $lookup: {
                from: Collections.user.d,
                localField: 'doctorId',
                foreignField: '_id',
                as: 'doctorId',
              },
            },
            { $unwind: { path: '$doctorId', preserveNullAndEmptyArrays: true } },

            // Unwind medicinesInfo
            { $unwind: { path: '$medicinesInfo', preserveNullAndEmptyArrays: true } },

            // Lookup medicine
            {
              $lookup: {
                from: Collections.medicine.d,
                localField: 'medicinesInfo.medicine',
                foreignField: '_id',
                as: 'medicineInfo',
              },
            },
            { $unwind: { path: '$medicineInfo', preserveNullAndEmptyArrays: true } },

            // Select only required medicine fields
            {
              $project: {
                _id: 1,
                patientId: 1,
                patientAdmissionHistoryId: 1,
                noteDateTime: 1,
                createdBy: 1,
                createdAt: 1,
                docType: 1,
                doctorId: 1,
                'medicinesInfo._id': 1,
                'medicinesInfo.durationFrequency': 1,
                'medicinesInfo.customDuration': 1,
                'medicinesInfo.prescribedWhen': 1,
                'medicinesInfo.instructions': 1,
                'medicinesInfo.usages': 1,
                'medicineInfo._id': 1,
                'medicineInfo.name': 1,
                'medicineInfo.genericName': 1,
                'medicineInfo.dosage': 1,
              },
            },

            // Replace medicine reference
            {
              $addFields: {
                'medicinesInfo.medicine': '$medicineInfo',
              },
            },

            // Group medicines back
            {
              $group: {
                _id: '$_id',
                patientId: { $first: '$patientId' },
                patientAdmissionHistoryId: { $first: '$patientAdmissionHistoryId' },
                noteDateTime: { $first: '$noteDateTime' },
                createdBy: { $first: '$createdBy' },
                createdAt: { $first: '$createdAt' },
                docType: { $first: '$docType' },
                doctorId: { $first: '$doctorId' },
                medicinesInfo: { $push: '$medicinesInfo' },
              },
            },

            // Final output projection
            {
              $project: {
                _id: 1,
                patientId: 1,
                patientAdmissionHistoryId: 1,
                noteDateTime: 1,
                medicinesInfo: 1,
                'doctorId._id': 1,
                'doctorId.roleId': 1,
                'doctorId.firstName': 1,
                'doctorId.lastName': 1,
                'doctorId.gender': 1,
                createdBy: 1,
                createdAt: 1,
                docType: 1,
              },
            },
          ],
        },
      },
      { $sort: { noteDateTime: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    let enrichedData = result;
    if (enrichedData.length > 0) {
      enrichedData = await Promise.all(
        enrichedData.map(async (el) => {
          if (el.docType === 'therapist' && el?.file?.filePath) {
            const filePath = el?.file?.filePath;
            const signedUrl = await S3.getSignedUrlByKey(filePath);

            return { ...el, file: { fileName: el?.file?.fileName, url: signedUrl } };
          }

          return el;
        })
      );
    }

    const totalNurseDoc = await NurseNotes.countDocuments(matchStage);
    const totalTherapistDoc = await TherapistNote.countDocuments(matchStage);
    const totalDoctorNotesDoc = await DoctorNote.countDocuments(matchStage);
    const totalPrescriptionDoc = await Prescription.countDocuments(matchStage);

    const totalDocuments =
      totalNurseDoc + totalTherapistDoc + totalDoctorNotesDoc + totalPrescriptionDoc;
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).json({
      status: 'success',
      pagination: {
        page,
        limit,
        totalPages,
        totalDocuments,
      },
      data: enrichedData,
    });
  }
);

export const reAdmitPatient = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    // Validate Patient ID
    const patient = await Patient.findById(req.params.id).lean();
    if (!patient) return next(new AppError('Please Provide Valid Patient ID', 400));

    // Check is Patient is not Already Admitted.
    const isAdmissionHistoryExist = await PatientAdmissionHistory.exists({
      patientId: req.params.id,
      currentStatus: { $ne: 'Discharged' },
    });
    if (isAdmissionHistoryExist) return next(new AppError('Patient is Already Admitted', 400));

    // Get Old Information
    const admissionHistory = await PatientAdmissionHistory.findOne({
      patientId: req.params.id,
      currentStatus: 'Discharged',
    })
      .sort({ createdAt: -1 })
      .setOptions({
        skipResAllPopulate: true,
        populateUser: true,
        populateFeedback: true,
        skipUrlGeneration: true,
      })
      .lean();

    let caseHistory = await PatientCaseHistory.findById(admissionHistory?.caseHistoryId).lean();
    if (caseHistory?._id) delete (caseHistory as any)._id;
    if (caseHistory?._id) delete (caseHistory as any).patientId;
    if (caseHistory?._id) delete (caseHistory as any).patientAdmissionHistoryId;

    // Create New Admission
    const newAdmissionHistory = await PatientAdmissionHistory.create({
      patientId: req.params.id,
      dateOfAdmission: new Date(),
      illnessType: admissionHistory?.illnessType,
      admissionType: admissionHistory?.admissionType,
      currentStatus: 'Registered',
      admissionChecklist: Helper.cleanObject(admissionHistory?.admissionChecklist ?? {}),
      patientReport: Helper.cleanObject(admissionHistory?.patientReport ?? {}),
      resourceAllocation: {
        centerId: admissionHistory?.resourceAllocation?.centerId,
        updatedAt: Date.now(),
      },
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
      createdAt: new Date(),
    });

    const newCaseHistory = await PatientCaseHistory.create({
      ...Helper.cleanObject(caseHistory ?? {}),
      patientId: req.params.id,
      patientAdmissionHistoryId: newAdmissionHistory._id,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
      createdAt: new Date(),
    });

    await PatientAdmissionHistory.findByIdAndUpdate(newAdmissionHistory._id, {
      caseHistoryId: newCaseHistory._id,
    });

    res.status(200).json({
      status: 'success',
      data: newAdmissionHistory,
    });
  }
);

/**
 * Helper Functions
 */
const _buildPatientFilterQuery = async (queryObj: IBasicObj) => {
  let query: IBasicObj = {
    $and: [],
  };
  let leadQuery: IBasicObj = {
    $and: [],
  };

  if (queryObj.hasOwnProperty('status') && queryObj.status !== 'All') {
    let status = (queryObj.status as string).split(',');
    if (status.includes('All')) status = status.filter((s) => s !== 'All');
    query['$and'].push({ currentStatus: status.length > 1 ? { $in: status } : status[0] });
  }

  if (queryObj.hasOwnProperty('centers')) {
    let centers = (queryObj.centers as string).split(',');
    query['$and'].push({
      'resourceAllocation.centerId':
        centers.length > 1
          ? { $exists: true, $in: centers }
          : { $exists: true, $ne: null, $eq: centers[0] },
    });
  }

  // Admission Type Filter
  if (queryObj.hasOwnProperty('admissionType')) {
    let admissionTypes = queryObj.admissionType as string;
    query['$and'].push({
      admissionType: admissionTypes,
    });
  }
  // Illness Type Filter
  if (queryObj.hasOwnProperty('illnessType')) {
    let illnessTypes = queryObj.illnessType as string;
    query['$and'].push({
      illnessType: illnessTypes,
    });
  }

  // Hyper Tension Filter
  if (queryObj.hasOwnProperty('hyperTension')) {
    let hyperTensions = queryObj.hyperTension as string;
    query['$and'].push({
      'patientReport.hyperTension': hyperTensions,
    });
  }

  // Heart Disease Filter
  if (queryObj.hasOwnProperty('heartDisease')) {
    let heartDiseases = queryObj.heartDisease as string;
    query['$and'].push({
      'patientReport.heartDisease': heartDiseases,
    });
  }

  // Level Of Risk Filter
  if (queryObj.hasOwnProperty('levelOfRisk')) {
    let levelOfRisk = queryObj.levelOfRisk as string;
    query['$and'].push({
      'patientReport.levelOfRisk': levelOfRisk,
    });
  }

  // New Lead / Old Lead
  if (queryObj.hasOwnProperty('leadType')) {
    let isNewLead = false;
    if (queryObj.leadType === 'NEW') isNewLead = true;
    if (queryObj.leadType === 'OLD') isNewLead = false;

    const leadsIds = await Lead.find({
      isNewLead: isNewLead,
      patientId: { $exists: true, $ne: null },
    })
      .setOptions({
        skipReferralTypePopulate: true,
        skipCenterPopulate: true,
      })
      .select('patientId')
      .lean();
    const patientIds = Array.from(new Set(leadsIds.map((el) => el.patientId?.toString())));

    query['$and'].push({
      patientId: { $in: patientIds },
    });
  }

  if (Object.keys(query['$and']).length > 0) {
    const patientIds = await PatientAdmissionHistory.find(query)
      .setOptions({ skipResAllPopulate: true })
      .select('patientId resourceAllocation')
      .setOptions({
        skipResAllPopulate: true,
        skipUrlGeneration: true,
        populateUser: true,
        populateFeedback: false,
      })
      .select('patientId')
      .sort('-_id')
      .lean();

    return Array.from(new Set(patientIds.map((id) => id.patientId?.toString())));
  }

  return [];
};

const _createPatientRevision = async (previousData: IPatient) => {
  const revisionNumber = await PatientRevision.countDocuments({ originalId: previousData._id });

  const newRevision = {
    ...previousData,
    originalId: previousData._id,
    revision: revisionNumber + 1,
  } as IPatientRevision;

  delete newRevision._id;
  delete newRevision?.createdAt;

  await PatientRevision.create(newRevision);
};

const _createPatientFamilyUser = async (payload: IBasicObj, patient: IPatient) => {
  await User.create({
    roleId: _getPatientRoleId(),
    firstName: payload.firstName,
    lastName: payload.lastName,
    dob: payload.dob,
    email: payload.email,
    password: _generateUserPassword(
      patient?.uhid?.toString() ?? '',
      patient?.age?.toString() ?? ''
    ),
    gender: payload.gender,
    phoneNumberCountryCode: payload.phoneNumberCountryCode,
    phoneNumber: payload.phoneNumber,
    isEmailVerified: true,
    isSystemGeneratedPassword: true,
    patientId: patient._id,
  });
};

const _checkAndCreatePatientFamilyUser = async (patient: IPatient) => {
  if (!patient.email) return;

  const familyMember = await User.findOne({ patientId: patient._id });

  // If a user is found and their existing email differs from the updated patient email,
  // update the email address.
  if (familyMember?.email !== patient.email) {
    await User.findByIdAndUpdate(familyMember?._id, { email: patient.email });
  }

  // If the patient has a family account, return early from the function.
  if (familyMember) return;

  await User.create({
    roleId: _getPatientRoleId(),
    firstName: patient.firstName,
    lastName: patient.lastName,
    dob: patient.dob,
    email: patient.email,
    password: _generateUserPassword(
      patient?.uhid?.toString() ?? '',
      patient?.age?.toString() ?? ''
    ),
    gender: patient.gender,
    phoneNumberCountryCode: patient.phoneNumberCountryCode,
    phoneNumber: patient.phoneNumber,
    isEmailVerified: true,
    isSystemGeneratedPassword: true,
    patientId: patient._id,
  });
};

const _generateUserPassword = (uhid: string, age: string) => `UHID_${uhid}_${age}`;

// This is a build function to allow for future enhancements,
// such as performing a query and returning results.
// INFO: Do not change this until you change roles.
const _getPatientRoleId = () => `6857c50768fd8f1c6b64f5ce`;

const _extractNumber = (input: string): number => {
  const digitsOnly = input.replace(/\D/g, '');
  return Number(digitsOnly);
};
