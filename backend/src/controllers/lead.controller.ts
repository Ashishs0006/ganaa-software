import Lead from '../models/lead.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import { Response, NextFunction } from 'express';
import { ILead } from '../interfaces/model/i.lead';
import Patient from '../models/patient/patient.model';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../utils/appFeatures';
import PatientCaseHistory from '../models/patient/patient.case.history.model';
import PatientFamilyDetails from '../models/patient/patient.family.details.model';
import PatientAdmissionHistory from '../models/patient/patient.admission.history.model';
import { normalizeAndTitleCase } from '../utils/helper';

export const getAllLeads = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<ILead>(Lead.find(), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;

    const paginationInfo = await PaginationInfo.exec(Lead.countDocuments(), req.query, rawQuery);

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: data,
    });
  }
);

export const createNewLead = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.leadDateTime) return next(new AppError('Lead Date Time is Mandatory', 400));
    if (!req.body.firstName) return next(new AppError('First Name is Mandatory', 400));
    if (!req.body.age) return next(new AppError('Age is Mandatory', 400));
    if (!req.body.phoneNumberCountryCode)
      return next(new AppError('Country Code is Mandatory', 400));
    if (!req.body.phoneNumber) return next(new AppError('Phone Number is Mandatory', 400));
    if (!req.body.gender) return next(new AppError('Gender is Mandatory', 400));
    // if (!req.body.centerId) return next(new AppError('Center Id is Mandatory', 400));
    if (req.body.progressStatus === 'Admit')
      return next(new AppError('Invalid Progress Status!', 400));

    if (req.body.patientId) delete req.body.patientId;
    if (req.body.patientAdmissionHistoryId) delete req.body.patientAdmissionHistoryId;
    if (req.body.comments) delete req.body.comments;

    req.body.firstName = normalizeAndTitleCase(req.body.firstName);
    if (req.body.lastName) req.body.lastName = normalizeAndTitleCase(req.body.lastName);

    req.body.createdBy = req.user?._id;

    const data = await Lead.create(req.body);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const admitLead = catchAsync(async (req: UserRequest, res: Response, next: NextFunction) => {
  if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

  const lead = await Lead.findOne({ _id: req.params.id });
  if (!lead) return next(new AppError('Please provide valid Lead ID', 400));
  if (lead.progressStatus === 'Admit' || lead.patientId || lead.patientAdmissionHistoryId)
    return next(new AppError('Lead Already Admitted', 400));

  const patient = await Patient.create({
    firstName: lead.firstName,
    lastName: lead.lastName,
    dob: lead.dob,
    age: lead.age,
    email: lead.email,
    phoneNumberCountryCode: lead.phoneNumberCountryCode,
    phoneNumber: lead.phoneNumber,
    alternativephoneNumberCountryCode: lead.alternativephoneNumberCountryCode,
    alternativeMobileNumber: lead.alternativeMobileNumber,
    gender: lead.gender,
    country: lead.country,
    fullAddress: lead.fullAddress,
    referredTypeId: lead.referralTypeId,
    referralDetails: lead.referralDetails,
    createdBy: req.user?._id,
  });

  if (lead.guardianName) {
    await PatientFamilyDetails.create({
      patientId: patient._id,
      infoType: 'Guardian',
      relationshipId: lead.guardianNameRelationshipId,
      name: lead.guardianName,
      createdBy: req.user?._id,
    });
  }

  const admissionHistory = await PatientAdmissionHistory.create({
    patientId: patient._id,
    dateOfAdmission: new Date(),
    admissionType: lead.admissionType,
    illnessType: lead.illnessType,
    involuntaryAdmissionType: lead.involuntaryAdmissionType,
    resourceAllocation: {
      centerId: lead.centerId,
    },
    createdBy: req.user?._id,
  });

  const caseHistory = await PatientCaseHistory.create({
    patientId: patient._id,
    patientAdmissionHistoryId: admissionHistory._id,
    chiefComplaints: lead.chiefComplaints,
    createdBy: req.user?._id,
  });

  await PatientAdmissionHistory.findByIdAndUpdate(admissionHistory._id, {
    caseHistoryId: caseHistory._id,
  });

  await Lead.findByIdAndUpdate(req.params.id, {
    progressStatus: 'Admit',
    status: 'Qualified',
    patientId: patient._id,
    patientAdmissionHistoryId: admissionHistory._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'Lead Admitted Successfully',
  });
});

export const getSingleLead = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('ID in Params is Mandatory', 400));

    const data = await Lead.findById(req.params.id).lean();

    if (!data) return next(new AppError('No Data Found', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const updateSingleLead = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (req.body.createdBy) delete req.body.createdBy;
    if (req.body.patientId) delete req.body.patientId;
    if (req.body.patientAdmissionHistoryId) delete req.body.patientAdmissionHistoryId;
    if (req.body.comments) delete req.body.comments;
    if (req.body?.progressStatus === 'Admit')
      return next(new AppError('Invalid Progress Status!', 400));

    req.body.updatedBy = req.user?._id;

    if (req.body.firstName) req.body.firstName = normalizeAndTitleCase(req.body.firstName);
    if (req.body.lastName) req.body.lastName = normalizeAndTitleCase(req.body.lastName);

    const lead = await Lead.findOne({ _id: req.params.id });
    if (!lead) return next(new AppError('Please provide valid Lead ID', 400));
    // if (lead.progressStatus === 'Admit' || lead.patientId || lead.patientAdmissionHistoryId)
    //   return next(new AppError('Lead Already Admitted', 400));

    const data = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!data) return next(new AppError('Please Provide Valid Lead ID', 400));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const deleteSingleLead = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));

    const lead = await Lead.findOne({ _id: req.params.id });
    if (!lead) return next(new AppError('Please provide valid Lead ID', 400));
    if (lead.progressStatus === 'Admit' || lead.patientId || lead.patientAdmissionHistoryId)
      return next(new AppError('Admitted Lead cannot be deleted.', 400));

    await Lead.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Data deleted successfully',
    });
  }
);

/**
 * Comment Controllers
 */

export const createNewComment = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.params.id === null) return next(new AppError('ID in Params is Mandatory', 400));
    if (!req.body.comment) return next(new AppError('Comment is Mandatory', 400));
    if (req.body.createdAt) delete req.body.createAt;

    req.body.userId = req.user?._id;

    const data = await Lead.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: req.body } },
      { new: true }
    );

    if (!data) return next(new AppError('Lead not found', 404));

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);
