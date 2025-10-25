import { ObjectId, Types } from 'mongoose';
import User from '../models/user.model';
import { IResult } from '../interfaces/generics';
import Loa from '../models/daily-progress/loa.model';
import Patient from '../models/patient/patient.model';
import Center from '../models/resources/center.model';
import { IRole } from '../interfaces/model/i.role.model';
import RoomType from '../models/resources/room.type.model';
import RoomNumber from '../models/resources/room.number.model';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import LockerNumber from '../models/resources/locker.number.model';
import { IMonthRange, IValidateIdsParms } from '../interfaces/helper';
import PatientAdmissionHistory from '../models/patient/patient.admission.history.model';

export const isExist = (req: UserRequest, field: string) => {
  return Object.prototype.hasOwnProperty.call(req.body, field);
};

export const buildUnset = (req: UserRequest, ...fields: string[]) => {
  const unsetQuery: { [key: string]: 1 } = {};

  fields.forEach((field) => {
    if (isExist(req, field) && (req.body[field].trim().length < 1 || req.body[field] === null)) {
      unsetQuery[field] = 1;
    }
  });

  if (Object.keys(unsetQuery).length === 0) {
    return {};
  }

  return { $unset: unsetQuery };
};

export const deleteFieldIfItsEmpty = (req: UserRequest, ...fields: string[]) => {
  // Delete the specified fields from req.body
  fields.forEach((field) => {
    if ((field in req.body && req.body[field].length <= 0) || req.body[field] === null) {
      delete req.body[field];
    }
  });

  // Check if the resulting object has more than 1 key
  return req.body;
};

export const buildUnsetAndDelete = (req: UserRequest, ...fields: string[]) => {
  const unsetQuery = buildUnset(req, ...fields);
  const modifiedBody = deleteFieldIfItsEmpty(req, ...fields);
  return { ...modifiedBody, ...unsetQuery };
};

export const validateDocIds = async (ids: IValidateIdsParms) => {
  const ErrorResponse = (message: string) =>
    ({ isSuccess: false, message: message }) as IResult<undefined>;

  if (ids.patientId) {
    const patient = await Patient.exists({ _id: ids.patientId }).lean();
    if (!patient) return ErrorResponse('Please Send Valid Patient ID');
  }

  if (ids.admissionHistoryId) {
    const doc = await PatientAdmissionHistory.exists({ _id: ids.admissionHistoryId }).lean();
    if (!doc) return ErrorResponse('Please Send Valid Patient Admission History ID');
  }

  if (ids.assignedDoctorId) {
    const user = await User.exists({ _id: ids.assignedDoctorId }).lean();
    if (!user) return ErrorResponse('Please Send Valid Assigned Doctor ID');
  }

  if (ids.assignedTherapistId) {
    const user = await User.exists({ _id: ids.assignedTherapistId }).lean();
    if (!user) return ErrorResponse('Please Send Valid Assigned Therapist ID');
  }

  if (ids.centerId) {
    const center = await Center.exists({ _id: ids.centerId }).lean();
    if (!center) return ErrorResponse('Please Send Valid Center ID');
  }

  if (ids.roomTypeId) {
    const roomType = await RoomType.exists({ _id: ids.roomTypeId }).lean();
    if (!roomType) return ErrorResponse('Please Send Valid Room Type ID');
  }

  if (ids.roomNumberId) {
    const roomNumber = await RoomNumber.exists({ _id: ids.roomNumberId }).lean();
    if (!roomNumber) return ErrorResponse('Please Send Valid Room Number ID');
  }

  if (ids.lockerNumberId) {
    const lockerNumber = await LockerNumber.exists({ _id: ids.lockerNumberId }).lean();
    if (!lockerNumber) return ErrorResponse('Please Send Valid Locker Number ID');
  }

  return { isSuccess: true, message: 'All IDs are valid', data: undefined };
};

export const cleanObject = (obj: Record<string, any>): Record<string, any> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Skip null, undefined, empty string, and empty arrays
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "") ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return acc;
    }

    // Preserve ObjectId (mongoose or bson)
    if (
      typeof value === "object" &&
      value !== null &&
      (value instanceof Types.ObjectId ||
        (value.constructor && value.constructor.name === "ObjectId"))
    ) {
      acc[key] = value;
      return acc;
    }

    // Recursively clean plain objects
    if (typeof value === "object" && !Array.isArray(value)) {
      const cleaned = cleanObject(value);
      if (Object.keys(cleaned).length > 0) {
        acc[key] = cleaned;
      }
      return acc;
    }

    // Keep all other values
    acc[key] = value;
    return acc;
  }, {} as Record<string, any>);
};

export const formatObjectToString = (input?: Record<string, any>): string => {
  if (!input || typeof input !== 'object') return '';

  const formatKey = (key: string): string =>
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const formatValue = (obj: any): string => {
    if (typeof obj !== 'object' || obj === null) return '';

    return Object.entries(obj)
      .map(([key, value]) => {
        if (value === undefined || value === null || value === '') return null;

        const formattedKey = formatKey(key);

        if (typeof value === 'object') {
          const nested = formatValue(value);
          if (nested) {
            return `${formattedKey}: [ ${nested} ]`;
          }
          return null;
        } else {
          return `${formattedKey}: ${value}`;
        }
      })
      .filter(Boolean)
      .join(' , ');
  };

  return formatValue(input);
};

export const isAdmin = (role: IRole | ObjectId | undefined): boolean => {
  if (!role || role instanceof Types.ObjectId) return false;

  role = role as IRole;

  return role.name?.toLowerCase() === 'admin';
};

export const isUser = (role: IRole | ObjectId | undefined): boolean => {
  if (!role || role instanceof Types.ObjectId) return false;

  role = role as IRole;

  return role.name?.toLowerCase() !== 'admin';
};

export const getDaysBetweenDates = (startDate?: string | Date, endDate?: string | Date): number => {
  if (startDate == undefined) return 0;
  if (endDate == undefined) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffInMs: number = end.getTime() - start.getTime();
  const diffInDays: number = diffInMs / (1000 * 60 * 60 * 24);

  return Math.floor(diffInDays);
};

const MONTH_INDEX: Record<string, number> = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export const getMonthRanges = (inputs: string[]): Record<string, IMonthRange> => {
  const result: Record<string, IMonthRange> = {};

  for (const raw of inputs) {
    // Match “MonthName YYYY”
    const m = raw.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (!m) continue;

    const monthName = m[1].toLowerCase();
    const year = parseInt(m[2], 10);
    const monthIdx = MONTH_INDEX[monthName];
    if (monthIdx === undefined) continue;

    // Start: Fist instant of the month
    const startDateTime = new Date(year, monthIdx, 1, 0, 0, 0, 0);
    // End: Last instant of the month (day 0 of next month is last day of this month)
    const endDateTime = new Date(year, monthIdx + 1, 0, 23, 59, 59, 999);

    result[raw] = { startDateTime, endDateTime };
  }

  return result;
};

/**
 * Normalize a string by trimming, removing special characters,
 * and capitalizing the first letter of each word.
 *
 * @param input  The raw string to normalize
 * @returns      The cleaned, title-cased string
 */
export function normalizeAndTitleCase(input: string): string {
  const trimmed = input.trim();

  const cleaned = trimmed.replace(/[^a-zA-Z\s]/g, '');

  const titled = cleaned
    .split(/\s+/)
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''))
    .join(' ');

  return titled;
}

/**
 * Checks if an LOA record already exists for the given patient and date.
 *
 * @param patientId - The ID of the patient.
 * @param patientAdmissionHistoryId - The ID of the patient's admission history.
 * @param date - Optional date to check (defaults to today).
 * @returns Promise<boolean> - True if record exists, else false.
 */
export const isLoaRecordExists = async (
  patientId?: string,
  patientAdmissionHistoryId?: string,
  date?: Date
): Promise<boolean> => {
  if (patientId == undefined) return false;
  if (patientAdmissionHistoryId == undefined) return false;

  const targetDate = date ? new Date(date) : new Date();

  // Strip time from the date (set time to 00:00:00)
  const startOfDay = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const existingRecord = await Loa.findOne({
    patientId: patientId,
    patientAdmissionHistoryId: patientAdmissionHistoryId,
    noteDateTime: {
      $gte: startOfDay,
      $lt: endOfDay,
    },
  }).lean();

  return !!existingRecord;
};
