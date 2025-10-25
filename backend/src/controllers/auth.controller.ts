import { ObjectId } from 'mongoose';
import { NextFunction, Response } from 'express';
import Env from '../constant/env';
import User from '../models/user.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import Patient from '../models/patient/patient.model';
import { IRole } from '../interfaces/model/i.role.model';
import { jwtVerifyAsync, signToken } from '../utils/jwtHelper';
import { IDecodedJwt } from '../interfaces/extra/i_decoded_jwt';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import { IUserAttributes } from '../interfaces/model/i_users_attributes';
import PatientAdmissionHistory from '../models/patient/patient.admission.history.model';

export const login = catchAsync(async (req: UserRequest, res: Response, next: NextFunction) => {
  // Check Guard
  if (!req.body.email) return next(new AppError('Email is Mandatory', 400));
  if (!req.body.password) return next(new AppError('Password is Mandatory', 400));

  // Check if user exists && password is correct
  let user = await User.findOne({
    email: req.body.email,
    isEmailVerified: true,
    isDeleted: false,
  })
    .select('+password')
    .setOptions({ includePermission: true });
  if (!user) return next(new AppError('Email or Password is Invalid', 400));

  // Validate User Password
  if (!(await user.correctPassword(user.password!, req.body.password))) {
    return next(new AppError('Email or Password is Invalid', 401));
  }

  user.password = undefined;
  user.passwordChangedAt = undefined;

  // Log the user in, send JWT
  const token = signToken(user._id?.toString() as string);

  res.status(200).json({
    status: 'success',
    token,
    data: user,
  });
});

export const protect = catchAsync(async (req: UserRequest, res: Response, next: NextFunction) => {
  let token;

  // Extract token from headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  //  Validate presence of token
  if (!token) {
    return next(new AppError('Authentication token is missing. Please log in to access.', 401));
  }

  // Validate the token
  let decoded;
  try {
    const options = { issuer: Env.JWT_ISSUER_NAME };
    decoded = (await jwtVerifyAsync(token, Env.JWT_SECRET as string, options)) as IDecodedJwt;
  } catch (error) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // Verify required fields in decoded payload
  if (!decoded || !decoded.id || !decoded.exp) {
    return next(new AppError('Invalid token structure. Please log in again.', 401));
  }

  // Check token expiration (redundant if handled by jwt.verify but included for clarity)
  if (decoded.exp * 1000 < Date.now()) {
    return next(new AppError('Token has expired. Please log in again.', 401));
  }

  // Check if user still exists
  const currentUser = await User.findOne({ _id: decoded.id })
    .select('+passwordChangedAt')
    .setOptions({ includePermission: true });
  if (!currentUser) {
    return next(new AppError('The user associated with this token no longer exists.', 401));
  }

  // Check if user change password after the JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again', 401));
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser.toObject<IUserAttributes>();
  next();
});

export const isValidJWT = async (req: UserRequest) => {
  let token;

  // Extract token from headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  //  Validate presence of token
  if (!token) return false;

  // Validate the token
  let decoded;
  try {
    const options = { issuer: Env.JWT_ISSUER_NAME };
    decoded = (await jwtVerifyAsync(token, Env.JWT_SECRET as string, options)) as IDecodedJwt;
  } catch (error) {
    return false;
  }

  // Verify required fields in decoded payload
  if (!decoded || !decoded.id || !decoded.exp) return false;

  // Check token expiration (redundant if handled by jwt.verify but included for clarity)
  if (decoded.exp * 1000 < Date.now()) return false;

  // Check if user still exists
  const currentUser = await User.findOne({ _id: decoded.id });
  if (!currentUser) return false;

  // Check if user change password after the JWT was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) return false;

  return true;
};

export const checkPermission = (resource: string, action: string) =>
  catchAsync(async (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !user.roleId) {
      return next(new AppError('Access denied. No role assigned to user.', 403));
    }

    const role = user.roleId as IRole;
    const hasPermission = role.permissions.some((perm) => {
      return (
        (perm.resource === resource || perm.resource === '*') &&
        (perm.actions.includes(action) || perm.actions.includes('*'))
      );
    });

    if (!hasPermission) {
      return next(new AppError('Access denied. Insufficient permissions.', 403));
    }

    next();
  });

export const checkPatientStatus = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user?.roleId) {
      return next(new AppError('Access denied: user role not assigned.', 403));
    }

    if (!user.patientId) {
      return next(new AppError('No active patient assigned to user.', 400));
    }

    const patientExists = await Patient.exists({ _id: user.patientId });
    if (!patientExists) {
      return next(new AppError("Patient doesn't exist in the system.", 404));
    }

    const latestHistory = await PatientAdmissionHistory.getLatestPatientHistory([
      user.patientId as ObjectId,
    ]);

    const [latestRecord] = Object.values(latestHistory);
    if (!latestRecord) {
      return next(new AppError('Invalid patient admission information.', 400));
    }

    if (latestRecord.currentStatus === 'Discharged') {
      return next(new AppError('Patient is already discharged.', 400));
    }

    next();
  }
);
