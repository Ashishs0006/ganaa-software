import multer from 'multer';
import { NextFunction, Response } from 'express';
import Env from '../constant/env';
import * as S3 from '../utils/s3Helper';
import AppError from '../utils/appError';
import { random } from '../utils/random';
import Role from './../models/role.model';
import { S3Path } from '../constant/s3.path';
import catchAsync from '../utils/catchAsync';
import { signToken } from '../utils/jwtHelper';
import FilterObject from './../utils/filterObject';
import User, { IUser } from '../models/user.model';
import { MFileFilter } from '../utils/multer.config';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import APIFeatures, { PaginationInfo } from '../utils/appFeatures';

/**
 * Multer Config
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: MFileFilter.imageFilter,
});

export const uploadProfilePic = upload.single('profilePic');

export const getMe = catchAsync(async (req: UserRequest, res: Response, next: NextFunction) => {
  res.status(200).json({
    status: 'success',
    data: req.user,
  });
});

export const updateMe = catchAsync(async (req: UserRequest, res: Response, next: NextFunction) => {
  // Filter Request Body
  const filterObj = new FilterObject(
    req.body,
    'firstName',
    'lastName',
    'dob',
    'email',
    'gender',
    'phoneNumberCountryCode',
    'phoneNumber'
  ).get();

  if (filterObj.hasOwnProperty('email')) {
    const emailCheck = await User.exists({ email: filterObj.email });
    if (emailCheck) return next(new AppError('Email Already Exists', 400));
  }

  if (req.file) {
    const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${req.file?.originalname}`;
    const filePath = S3Path.usersPic(req.user!._id?.toString() ?? '', fileName);

    await S3.uploadFile(filePath, req.file?.buffer, req.file?.mimetype);
    filterObj.profilePic = filePath;
  }

  let updatedUser = await User.findByIdAndUpdate(req!.user!._id, filterObj, {
    new: true,
  }).setOptions({ includePermission: true });

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

export const changeMePassword = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.oldPassword) return next(new AppError('Old Password is Mandatory', 400));
    if (!req.body.newPassword) return next(new AppError('New Password is Mandatory', 400));

    const user = await User.findById(req?.user?._id).select('+password');
    if (!user) return next(new AppError('Invalid Logged User', 400));

    if (!(await user.correctPassword(user.password ?? '', req.body.oldPassword))) {
      return next(new AppError('Old Password is Incorrect', 401));
    }

    user.password = req.body.newPassword;
    user.isSystemGeneratedPassword = false;
    await user.save();

    const token = signToken(user._id?.toString() as string);

    res.status(200).json({
      status: 'success',
      token,
      data: 'Password Updated, Successfully',
    });
  }
);

export const deleteMe = catchAsync(async (req: UserRequest, res: Response, next: NextFunction) => {
  // TODO: Remove all the user related docs
  await User.findByIdAndDelete(req.user?._id);

  res.status(200).json({
    status: 'success',
    data: 'User Deleted Successfully',
  });
});

export const getAllBasicUsers = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (req.query.roleId) delete req.query.roleId;
    if (!req.query.roles) return next(new AppError('Roles are Mandatory', 400));

    let rolesToSerach: string[] = [];
    const validRoles = [
      'doctor',
      'therapist',
      'admin',
      'sales',
      'finance',
      'admission manager',
      'Therapist+AM',
      'ROM+AM',
      "IT"
    ];

    const roles = req.query.roles.toString()?.split(',');
    roles.map((role) => validRoles.includes(role) && rolesToSerach.push(role));
    if (rolesToSerach.length === 0) return next(new AppError('Invalid role provided', 400));

    const rolesId = await Role.getRoleIdsByNames(rolesToSerach);
    req.query.roleId = { in: rolesId.map((e) => e.toString()) };

    const filteredQuery = new FilterObject(req.query, 'roleId', 'centerId', 'page', 'sort', 'limit')
      .parseDate('dob')
      .get();

    const features = new APIFeatures<IUser>(
      User.find({isDeleted:false})
        .select(
          'firstName lastName gender centerId roleId email dob profilePic phoneNumber isDeleted'
        )
        .setOptions({ skipCenterPopulate: false }),
      filteredQuery
    )
      .filter()
      .sort()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;
    const paginationInfo = await PaginationInfo.exec(
      User.countDocuments({isDeleted:false}),
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

export const getAllUsers = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const features = new APIFeatures<IUser>(User.find({isDeleted:false}), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const rawQuery = features.rawQuery();
    const data = await features.query;
    const paginationInfo = await PaginationInfo.exec(User.countDocuments({isDeleted:false}), req.query, rawQuery);

    res.status(200).json({
      status: 'success',
      pagination: paginationInfo,
      data: data,
    });
  }
);

export const createNewUsers = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.body.roleId) return next(new AppError('Name is Mandatory', 400));
    if (!req.body.firstName) return next(new AppError('Name is Mandatory', 400));
    if (!req.body.lastName) return next(new AppError('Name is Mandatory', 400));
    if (!req.body.dob) return next(new AppError('Name is Mandatory', 400));
    if (!req.body.email) return next(new AppError('Name is Mandatory', 400));

    // Filter Request Body
    let filteredBody = new FilterObject(
      req.body,
      'roleId',
      'firstName',
      'lastName',
      'dob',
      'email',
      'gender',
      'centerId',
      'phoneNumberCountryCode',
      'phoneNumber'
    ).get();

    if (filteredBody.hasOwnProperty('email')) {
      const emailCheck = await User.exists({ email: filteredBody.email });
      if (emailCheck) return next(new AppError('Email Already Exists', 400));
    }

    let data: IUser | null = await User.create({
      ...filteredBody,
      isDeleted: false,
      isEmailVerified: true,
      password: Env.DEFAULT_USER_PASSWORD,
      isSystemGeneratedPassword: true,
    });

    if (req.file) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${req.file?.originalname}`;
      const filePath = S3Path.usersPic(data!._id?.toString() ?? '', fileName);

      await S3.uploadFile(filePath, req.file?.buffer, req.file?.mimetype);
      await User.findByIdAndUpdate(data._id, { profilePic: filePath });
      data = await User.findById(data._id);
    }

    res.status(201).json({
      status: 'success',
      data: data,
    });
  }
);

export const getSingleUser = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('Id is Mandatory', 400));

    const user = await User.findOne({ _id: req.params.id });
    if (!user) return next(new AppError('Invalid User ID', 400));

    res.status(200).json({
      status: 'success',
      data: user,
    });
  }
);

export const updateUserInformation = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('Id is Mandatory', 400));

    const isUserExist = await User.exists({ _id: req.params.id }).lean();
    if (!isUserExist) return next(new AppError('Please provide valid User Id', 400));

    // Filter Request Body
    const filterObj = new FilterObject(
      req.body,
      'roleId',
      'firstName',
      'lastName',
      'dob',
      'email',
      'gender',
      'centerId',
      'phoneNumberCountryCode',
      'phoneNumber'
    ).get();

    if (filterObj.hasOwnProperty('email')) {
      const emailCheck = await User.exists({ email: filterObj.email });
      if (emailCheck) return next(new AppError('Email Already Exists', 400));
    }

    if (req.file) {
      const fileName = `${Date.now()}-${random.randomAlphaNumeric(6)}-${req.file?.originalname}`;
      const filePath = S3Path.usersPic(req.user!._id?.toString() ?? '', fileName);

      await S3.uploadFile(filePath, req.file?.buffer, req.file?.mimetype);
      filterObj.profilePic = filePath;
    }

    let updatedUser = await User.findByIdAndUpdate(req.params.id, filterObj, {
      new: true,
    });

    res.status(200).json({
      status: 'success',
      data: updatedUser,
    });
  }
);

export const deleteUser = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('Id is Mandatory', 400));

    const isUserExist = await User.exists({ _id: req.params.id }).lean();
    if (!isUserExist) return next(new AppError('Please provide valid User Id', 400));

    await User.findByIdAndUpdate(req.params.id, { isDeleted: true });

    res.status(200).json({
      status: 'success',
      message: 'User Deleted Successfully',
    });
  }
);

export const resetUserPassword = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.params.id) return next(new AppError('Id is Mandatory', 400));

    const user = await User.findOne({ _id: req.params.id });
    if (!user) return next(new AppError('Please provide valid User Id', 400));

    const newPassword = user.resetPassword();
    await user.save();

    // TODO: Added New Password Email to Queue.

    res.status(200).json({
      status: 'success',
      message:
        'Your password has been reset successfully. Please check your email for the new password.',
    });
  }
);
