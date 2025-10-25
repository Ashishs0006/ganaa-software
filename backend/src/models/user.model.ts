// Global Import
import mongoose, { ObjectId } from 'mongoose';
import validator from 'validator';
// Local Import
import AppError from '../utils/appError';
import { random } from '../utils/random';
import IGender from '../interfaces/i_gender';
import Collections from '../constant/collections';
import { getSignedUrlByKey } from '../utils/s3Helper';
import { IRole } from '../interfaces/model/i.role.model';
import { createHash, verifyHash } from '../utils/jwtHelper';
import { IPatient } from '../interfaces/model/patient/i.patient';
import Env from '../constant/env';

export interface IUser extends mongoose.Document {
  roleId: ObjectId | IRole;
  firstName?: string;
  lastName?: string;
  dob?: Date;
  email?: string;
  password?: string;
  passwordChangedAt?: Date;
  gender?: IGender;
  phoneNumberCountryCode?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isSystemGeneratedPassword: boolean;
  resendOTP?: Date;
  otp?: string;
  otpExpiresIn?: Date;
  profilePic?: String;
  isDeleted?: Boolean;
  centerId?: ObjectId[];
  createdAt: Date;

  // This field is only available in the context of the family portal,
  // when the patient is assigned to a family and the current user is associated with that family.
  patientId?: ObjectId | IPatient;

  correctPassword(hash: string, userPass: string): Promise<boolean>;
  resetPassword(): string;
  changedPasswordAfter(jwtTimestamp: number): boolean;
  activateAccount(): void;
  createOtp(): string;
}

const userSchema = new mongoose.Schema<IUser>({
  roleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.role.name,
    required: [true, 'RoleId is Mandatory'],
  },
  firstName: {
    type: String,
    trim: true,
    index: true,
  },
  lastName: {
    type: String,
    trim: true,
    index: true,
  },
  dob: {
    type: Date,
    index: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate(value: string) {
      if (value === null || value === undefined || value.length === 0) return;

      if (!validator.isEmail(value)) {
        throw new AppError('Please provide Valid Email Address.', 400);
      }
    },
  },
  password: {
    type: String,
    select: false,
  },
  isSystemGeneratedPassword: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  isEmailVerified: {
    type: Boolean,
    select: false,
    default: false,
  },
  phoneNumberCountryCode: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  otp: {
    type: String,
  },
  resendOTP: {
    type: Date,
    select: false,
  },
  otpExpiresIn: {
    type: Date,
    select: false,
  },
  profilePic: {
    type: String,
  },

  centerId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: Collections.center.name,
    },
  ],

  isDeleted: {
    type: Boolean,
    default: false,
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Collections.patient.name,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ firstName: 1, lastName: 1 });

const generateSignedUrl = async (doc: any) => {
  let profilePic = doc.profilePic;
  if (!profilePic) return;

  const signedUrl = await getSignedUrlByKey(profilePic);
  delete doc.profilePic;

  if (doc.hasOwnProperty('_doc')) {
    delete doc._doc.profilePic;
    doc._doc.profilePic = signedUrl;
  } else {
    delete doc.profilePic;
    doc.profilePic = signedUrl;
  }
};

// Pre Middlewares
userSchema.pre('save', async function (next) {
  // Only run this function if password is actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await createHash(this.password as string);

  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = new Date();
  next();
});

userSchema.pre('find', async function (next) {
  const shouldSkip = this.getOptions().skipCenterPopulate ?? false;
  const shouldSkipRole = this.getOptions().skipRolePopulate ?? false;
  const includePermission = this.getOptions().includePermission ?? false;

  if (!shouldSkip) this.populate('centerId');
  if (!shouldSkipRole)
    this.populate('roleId', includePermission ? '_id name permissions' : '_id name');

  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const shouldSkip = this.getOptions().skipCenterPopulate ?? false;
  const shouldSkipRole = this.getOptions().skipRolePopulate ?? false;
  const includePermission = this.getOptions().includePermission ?? false;

  if (!shouldSkip) this.populate('centerId');
  if (!shouldSkipRole)
    this.populate('roleId', includePermission ? '_id name permissions' : '_id name');

  next();
});

userSchema.pre('findOne', async function (next) {
  const shouldSkip = this.getOptions().skipCenterPopulate ?? false;
  const shouldSkipRole = this.getOptions().skipRolePopulate ?? false;
  const includePermission = this.getOptions().includePermission ?? false;

  if (!shouldSkip) this.populate('centerId');
  if (!shouldSkipRole)
    this.populate('roleId', includePermission ? '_id name permissions' : '_id name');

  next();
});

// Post Middleware
userSchema.post('findOne', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

userSchema.post('find', function (docs) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (docs?.length > 0) {
    docs.forEach((doc: any) => generateSignedUrl(doc));
  }
});

userSchema.post('findOneAndUpdate', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

// Instance Method
userSchema.methods.correctPassword = async function (hash: string, userPass: string) {
  return await verifyHash(hash, userPass);
};

userSchema.methods.resetPassword = function () {
  const newPassword = Env.DEFAULT_USER_PASSWORD;

  this.password = newPassword;
  this.isSystemGeneratedPassword = true;

  return newPassword;
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      ((this.passwordChangedAt.getTime() as number) / 1000).toString(),
      10
    );

    return jwtTimestamp < changedTimestamp;
  }

  return false;
};

userSchema.methods.createOtp = function () {
  const otp = (random.randomInteger(0, 9, 6) as number[]).join('');
  this.otp = otp;
  this.otpExpiresIn = Date.now() + 20 * 60 * 1000;
  this.resendOTP = Date.now();

  return otp;
};

userSchema.methods.activateAccount = function () {
  this.otp = undefined;
  this.otpExpiresIn = undefined;
  this.resendOTP = undefined;
};

const User = mongoose.model<IUser>(Collections.user.name, userSchema);

export default User;
