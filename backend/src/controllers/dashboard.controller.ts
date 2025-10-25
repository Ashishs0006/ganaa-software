import { NextFunction, Response } from 'express';
import Role from '../models/role.model';
import Lead from '../models/lead.model';
import User from '../models/user.model';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';
import Collections from '../constant/collections';
import { IBasicObj } from '../interfaces/generics';
import Loa from '../models/daily-progress/loa.model';
import Center from '../models/resources/center.model';
import Patient from '../models/patient/patient.model';
import { IPatient } from '../interfaces/model/patient/i.patient';
import NurseNote from '../models/daily-progress/nurse.note.model';
import { UserRequest } from '../interfaces/extra/i_extended_class';
import DoctorNote from '../models/daily-progress/doctor.note.model';
import { getDaysBetweenDates, getMonthRanges } from '../utils/helper';
import PatientFeedback from '../models/patient/patient.feedback.model';
import PatientDischarge from '../models/patient/patient.discharge.model';
import GroupActivity from '../models/group-activity/group.activity.model';
import TherapistNote from '../models/daily-progress/therapist.note.model';
import { buildDailyResourceAllocation } from '../jobs/daily.resource.allocation.report';
import PatientAdmissionHistory from '../models/patient/patient.admission.history.model';
import DailyResourceAllocationReport from '../models/reports/daily.resource.report.model';
import { ICenterInfo, IGenderCounts } from '../interfaces/controller/i.dashboard.controller';
import PatientAdmissionHistoryRevision from '../models/patient/patient.admission.history.revision.model';

export const insightDashboard = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const monthRange = (req.query.range as string)?.split(',');
    if (!monthRange) return next(new AppError('Range is Mandatory Parameter', 400));

    const monthRanges = getMonthRanges(monthRange);
    if (Object.keys(monthRanges).length === 0) return next(new AppError('Invalid Range', 400));

    const entries = await Promise.all(
      Object.keys(monthRanges).map(async (key) => {
        const { startDateTime, endDateTime } = monthRanges[key];
        const info = await _getInsightData(startDateTime, endDateTime);
        return [key, info] as const;
      })
    );
    const data = Object.fromEntries(entries);

    res.status(200).json({
      status: 'success',
      data: data,
    });
  }
);

export const therapistDashboard = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.startDate) return next(new AppError('Start Date is Mandatory Field', 400));
    if (!req.query.endDate) return next(new AppError('End Date is Mandatory Field', 400));

    const start = new Date(req.query.startDate as string);
    const end = new Date(req.query.endDate as string);
    if (isNaN(start.getTime())) return next(new AppError('Invalid Start Date format', 400));
    if (isNaN(end.getTime())) return next(new AppError('Invalid End Date format', 400));

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Check range ≤ 31 days
    const msInDay = 24 * 60 * 60 * 1000;
    const maxSpan = 31 * msInDay;
    if (end.getTime() - start.getTime() > maxSpan)
      return next(new AppError('Date range cannot exceed 31 days', 400));

    let patientHistoryQuery: IBasicObj = {};
    let therapistQuery: IBasicObj = {};
    if (req.query.centerId) {
      const centerId = (req.query.centerId as string).split(',');
      patientHistoryQuery['resourceAllocation.centerId'] = { $in: centerId };
      therapistQuery['centerId'] = { $in: centerId };
    }

    // Get All Patients Data That are currently Admitted
    const patientAdmissionHistory = await PatientAdmissionHistory.find(patientHistoryQuery)
      .select('patientId dateOfAdmission dischargeId')
      .populate({ path: 'dischargeId', select: 'date' })
      .setOptions({
        skipUrlGeneration: true,
        skipResAllPopulate: false,
        populateUser: true,
        populateFeedback: true,
      });

    const dischargeResult: any = {};
    patientAdmissionHistory.forEach((admission: any) => {
      const patientId = admission.patientId;
      const start = admission.dateOfAdmission;
      const end = admission.dischargeId?.date;

      if (!dischargeResult[patientId]) dischargeResult[patientId] = [];
      dischargeResult[patientId].push({ start, end });
    });

    const inpatientIds = patientAdmissionHistory.map((el) => el.patientId?.toString()) as string[];

    const inPatientAdmissionIds = patientAdmissionHistory.map((el) =>
      el._id?.toString()
    ) as string[];

    const patients = await Patient.find({ _id: inpatientIds })
      .select('_id uhid firstName lastName patientPic gender')
      .setOptions({ skipResAllPopulate: true });

    const patientsWithCenterField = patients.map((patient, index) => ({
      ...patient.toObject(),
      centerId: patientAdmissionHistory[index].resourceAllocation?.centerId, // or any dynamic value
    }));

    // Get All Users Which has Therapist Role
    const therapistRoles = await Role.find({
      name: { $in: ['Therapist', 'Therapist+AM'] }, // Add as many names as needed
    }).select('_id');

    const therapistRoleIds = therapistRoles.map((el) => el._id?.toString());
    const therapists = await User.find({
      roleId: { $in: therapistRoleIds },
      ...therapistQuery,
    })
      .setOptions({ skipUrlGeneration: true, shouldSkipRole: true })
      .select('_id firstName lastName centerId');
    const therapistsIds = therapists.map((el) => el._id?.toString()) as string[];

    // Fetch LOAs and Therapist Notes in Parallel
    const [loa, notes] = await Promise.all([
      Loa.find({
        noteDateTime: { $gte: start, $lte: end },
        patientAdmissionHistoryId: { $in: inPatientAdmissionIds },
      }).lean(),

      TherapistNote.find({
        noteDateTime: { $gte: start, $lt: end },
        patientAdmissionHistoryId: { $in: inPatientAdmissionIds },
        therapistId: { $in: therapistsIds },
      })
        .select(
          '_id patientId noteDateTime note sessionType subSessionType score therapistId createdAt createdBy file'
        )
        .setOptions({ skipTherapistPopulation: false, skipUrlGeneration: false })
        .lean(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        patients: patientsWithCenterField,
        therapists,
        loa,
        dischargeResult,
        notes: notes,
      },
    });
  }
);

export const doctorDashboard = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.startDate) return next(new AppError('Start Date is Mandatory Field', 400));
    if (!req.query.endDate) return next(new AppError('End Date is Mandatory Field', 400));

    const start = new Date(req.query.startDate as string);
    const end = new Date(req.query.endDate as string);
    if (isNaN(start.getTime())) return next(new AppError('Invalid Start Date format', 400));
    if (isNaN(end.getTime())) return next(new AppError('Invalid End Date format', 400));

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Check range ≤ 31 days
    const msInDay = 24 * 60 * 60 * 1000;
    const maxSpan = 31 * msInDay;
    if (end.getTime() - start.getTime() > maxSpan)
      return next(new AppError('Date range cannot exceed 31 days', 400));

    let patientHistoryQuery: IBasicObj = {};
    let doctorsQuery: IBasicObj = {};
    if (req.query.centerId) {
      const centerId = (req.query.centerId as string).split(',');
      patientHistoryQuery['resourceAllocation.centerId'] = { $in: centerId };
      doctorsQuery['centerId'] = { $in: centerId };
    }

    // Get All Patients Data That are currently Admitted
    const patientAdmissionHistory = await PatientAdmissionHistory.find(patientHistoryQuery)
      .select('patientId dateOfAdmission dischargeId')
      .populate({ path: 'dischargeId', select: 'date' })
      .setOptions({
        skipUrlGeneration: true,
        skipResAllPopulate: false,
        populateUser: true,
        populateFeedback: true,
      });

    const dischargeResult: any = {};
    patientAdmissionHistory.forEach((admission: any) => {
      const patientId = admission.patientId;
      const start = admission.dateOfAdmission;
      const end = admission.dischargeId?.date;

      if (!dischargeResult[patientId]) dischargeResult[patientId] = [];
      dischargeResult[patientId].push({ start, end });
    });
    const inpatientIds = patientAdmissionHistory.map((el) => el.patientId?.toString()) as string[];

    const inPatientAdmissionIds = patientAdmissionHistory.map((el) =>
      el._id?.toString()
    ) as string[];

    const patients = await Patient.find({ _id: inpatientIds })
      .select('_id uhid firstName lastName patientPic gender')
      .setOptions({ skipResAllPopulate: true });

    const patientsWithCenterField = patients.map((patient, index) => ({
      ...patient.toObject(),
      centerId: patientAdmissionHistory[index].resourceAllocation?.centerId, // or any dynamic value
    }));

    // Get All Users Which has Doctor Role
    const doctorRoles = await Role.find({ name: 'Doctor' }).select('_id');
    const doctorRoleIds = doctorRoles.map((el) => el._id?.toString()) as string[];

    const doctors = await User.find({
      roleId: { $in: doctorRoleIds },
      ...doctorsQuery,
    })
      .setOptions({ skipUrlGeneration: true, shouldSkipRole: true })
      .select('_id firstName lastName centerId');
    const doctorIds = doctors.map((el) => el._id?.toString()) as string[];

    // Fetch LOA and Doctor Notes Parallel
    const [loa, notes] = await Promise.all([
      Loa.find({
        noteDateTime: { $gte: start, $lte: end },
        patientAdmissionHistoryId: { $in: inPatientAdmissionIds },
      }).lean(),

      DoctorNote.find({
        noteDateTime: { $gte: start, $lt: end },
        patientAdmissionHistoryId: { $in: inPatientAdmissionIds },
        doctorId: { $in: doctorIds },
      })
        .select('_id patientId noteDateTime sessionType note doctorId createdAt createdBy')
        .setOptions({ skipTherapistPopulation: false })
        .lean(),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        patients: patientsWithCenterField,
        loa,
        doctors,
        dischargeResult,
        notes: notes,
      },
    });
  }
);

export const dailyReportDashboard = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(new AppError('Both Start Date and End Date are required', 400));
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new AppError('Invalid date format', 400));
    }

    const todayStr = _formatDate(new Date());
    let result: { [key: string]: any } = {};

    // Generate date range using native JS
    let current = new Date(start);
    let index = 1;

    while (current <= end) {
      const dateStr = _formatDate(current);
      const key = `date${index}`;
      if (dateStr === todayStr) {
        const freshReport = await buildDailyResourceAllocation();
        result[key] = freshReport;
      } else {
        const dayStart = new Date(current);
        const dayEnd = new Date(current);
        dayStart.setHours(0, 0, 0, 0);
        dayEnd.setHours(23, 59, 59, 999);

        const dbReport = await DailyResourceAllocationReport.findOne({
          date: { $gte: dayStart, $lte: dayEnd },
        }).lean();

        result[key] = dbReport;
      }

      // Move to next day
      current.setDate(current.getDate() + 1);
      index++;
    }

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const weeklyReportDashboard = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    const { year } = req.query;
    if (!year) return next(new AppError('Year is required', 400));

    const selectedYear = parseInt(year as string);
    if (isNaN(selectedYear)) return next(new AppError('Invalid Year', 400));

    const allWeeks = getSundayBasedWeeksInYear(selectedYear);
    const result: IBasicObj = {};

    const weeklyPromises = allWeeks.map(async (week, index) => {
      const startDate = new Date(week.startDate);
      const endDate = new Date(week.endDate);

      const previousDate = _getPreviousDate(startDate);
      const startOfPreviousDate = new Date(previousDate);
      const endOfPreviousDate = new Date(previousDate);
      startOfPreviousDate.setHours(0, 0, 0, 0);
      endOfPreviousDate.setHours(23, 59, 59, 999);

      const rollingDates = _getFourWeekRange(startDate, endDate);

      const [
        totalAdmission,
        totalNewAdmission,
        totalDischarge,
        totalLeadsGenerated,
        leadsFromDigitalMarketing,
        clientSatisfactionScoreObject,
        activeClientsAtStartOfWeekObject,
        fourWeekRollingAverageObject,
        averageOccupancyObject,
      ] = await Promise.all([
        PatientAdmissionHistory.countDocuments({
          dateOfAdmission: { $gte: startDate, $lte: endDate },
        }),
        Lead.countDocuments({
          leadDateTime: { $gte: startDate, $lte: endDate },
          isNewLead: true,
          patientAdmissionHistoryId: { $exists: true, $ne: null },
        }),
        PatientDischarge.countDocuments({ date: { $gte: startDate, $lte: endDate } }),
        Lead.countDocuments({ leadDateTime: { $gte: startDate, $lte: endDate } }),
        Lead.countDocuments({
          leadDateTime: { $gte: startDate, $lte: endDate },
          leadType: 'Online',
        }),
        PatientFeedback.aggregate([
          { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
          { $unwind: '$questionAnswer' },
          {
            $addFields: {
              numericAnswer: {
                $convert: {
                  input: '$questionAnswer.answer',
                  to: 'double',
                  onError: null,
                  onNull: null,
                },
              },
            },
          },
          { $match: { numericAnswer: { $ne: null } } },
          {
            $group: {
              _id: null,
              averageFeedback: { $avg: '$numericAnswer' },
            },
          },
        ]),
        DailyResourceAllocationReport.aggregate([
          { $match: { date: { $gte: startOfPreviousDate, $lte: endOfPreviousDate } } },
          { $unwind: '$reports' },
          { $unwind: '$reports.roomTypes' },
          {
            $group: { _id: '$date', totalPerDay: { $sum: '$reports.roomTypes.totalOccupiedBeds' } },
          },
          { $project: { _id: 0, totalPerDay: 1 } },
        ]),
        await PatientAdmissionHistory.aggregate([
          {
            $lookup: {
              from: Collections.patientDischarge.d,
              localField: 'dischargeId',
              foreignField: '_id',
              as: 'discharge',
            },
          },
          { $unwind: '$discharge' },
          {
            $match: {
              'discharge.date': { $gte: rollingDates.startDate, $lte: rollingDates.endDate },
            },
          },
          {
            $addFields: {
              lengthOfStay: {
                $ceil: {
                  $divide: [
                    { $subtract: ['$discharge.date', '$dateOfAdmission'] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              totalLengthOfStay: { $sum: '$lengthOfStay' },
              totalDischargedPatients: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              totalLengthOfStay: 1,
              totalDischargedPatients: 1,
              averageLengthOfStay: {
                $cond: [
                  { $eq: ['$totalDischargedPatients', 0] },
                  0,
                  { $divide: ['$totalLengthOfStay', '$totalDischargedPatients'] },
                ],
              },
            },
          },
        ]),
        DailyResourceAllocationReport.aggregate([
          { $match: { date: { $gte: startDate, $lte: endDate } } },
          { $unwind: '$reports' },
          { $unwind: '$reports.roomTypes' },
          {
            $addFields: {
              'reports.roomTypes.totalBeds': {
                $multiply: ['$reports.roomTypes.maxOccupancy', '$reports.roomTypes.totalRooms'],
              },
            },
          },
          {
            $group: {
              _id: '$_id',
              totalBedsPerDoc: { $sum: '$reports.roomTypes.totalBeds' },
              totalOccupiedBedsPerDoc: { $sum: '$reports.roomTypes.totalOccupiedBeds' },
            },
          },
          {
            $group: {
              _id: null,
              totalBeds: { $sum: '$totalBedsPerDoc' },
              totalOccupiedBeds: { $sum: '$totalOccupiedBedsPerDoc' },
            },
          },
          {
            $project: {
              _id: 0,
              totalBeds: 1,
              totalOccupiedBeds: 1,
              occupancyPercentage: {
                $cond: [
                  { $eq: ['$totalBeds', 0] },
                  0,
                  { $multiply: [{ $divide: ['$totalOccupiedBeds', '$totalBeds'] }, 100] },
                ],
              },
            },
          },
        ]),
      ]);

      // Calculate total conversion safely
      const totalConversion =
        isFinite(totalLeadsGenerated) && totalLeadsGenerated > 0
          ? Math.round((totalAdmission / totalLeadsGenerated) * 100)
          : 0;

      // Client Satisfaction Score
      const clientSatisfactionScore =
        clientSatisfactionScoreObject.length > 0
          ? Math.round(clientSatisfactionScoreObject[0].averageFeedback)
          : 0;

      // Active Clients at start of the week
      const activeClientsAtStartOfWeek: number =
        activeClientsAtStartOfWeekObject.length > 0
          ? Math.round(activeClientsAtStartOfWeekObject[0].totalPerDay)
          : 0;

      // 4 Week Rolling Average Length of stay
      const fourWeekRolling: number =
        fourWeekRollingAverageObject.length > 0
          ? Math.round(fourWeekRollingAverageObject[0].averageLengthOfStay)
          : 0;

      // Average Occupancy Rate (%)
      const averageOccupancy: number =
        fourWeekRollingAverageObject.length > 0
          ? Math.round(averageOccupancyObject[0].occupancyPercentage)
          : 0;

      return {
        [`Week ${index + 1}`]: {
          startDate: _formatDate(startDate),
          endDate: _formatDate(endDate),
          report: {
            activeClients: activeClientsAtStartOfWeek,
            totalAdmission,
            newAdmission: totalNewAdmission,
            totalDischarges: totalDischarge,
            averageOccupancy: averageOccupancy,
            fourWeekRolling: fourWeekRolling,
            totalLeadsGenerated,
            leadsFromDigitalMarketing,
            totalConversion,
            clientSatisfaction: clientSatisfactionScore,
          },
        },
      };
    });

    const weeklyResults = await Promise.all(weeklyPromises);
    weeklyResults.forEach((weekObj) => Object.assign(result, weekObj));

    res.status(200).json({
      status: 'success',
      data: result,
    });
  }
);

export const vitalReportDashboard = catchAsync(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.query.startDate) return next(new AppError('Start Date is a mandatory field', 400));
    if (!req.query.endDate) return next(new AppError('End Date is a mandatory field', 400));

    const start = new Date(req.query.startDate as string);
    const end = new Date(req.query.endDate as string);

    if (isNaN(start.getTime())) return next(new AppError('Invalid Start Date format', 400));
    if (isNaN(end.getTime())) return next(new AppError('Invalid End Date format', 400));

    const sameDay =
      start.getUTCFullYear() === end.getUTCFullYear() &&
      start.getUTCMonth() === end.getUTCMonth() &&
      start.getUTCDate() === end.getUTCDate();

    if (!sameDay) return next(new AppError('Start Date and End Date must be the same day', 400));

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    let patientHistoryQuery: IBasicObj = {
      currentStatus: { $in: ['Inpatient', 'Discharge Initiated'] },
    };
    let doctorsQuery: IBasicObj = {};
    let therapistQuery: IBasicObj = {};

    if (req.query.centerId) {
      const centerId = (req.query.centerId as string).split(',');
      patientHistoryQuery['resourceAllocation.centerId'] = { $in: centerId };
      doctorsQuery['centerId'] = { $in: centerId };
      therapistQuery['centerId'] = { $in: centerId };
    }

    const patientAdmissionHistory = await PatientAdmissionHistory.find(patientHistoryQuery)
      .select({
        patientId: 1,
        'resourceAllocation.nurse': 1,
        'resourceAllocation.centerId': 1,
      })
      .setOptions({
        skipUrlGeneration: true,
        skipResAllPopulate: true,
        populateUser: true,
        populateFeedback: true,
      });
    let patientAdmissionHistoryMap: IBasicObj = {};
    patientAdmissionHistory.map(
      (e) => (patientAdmissionHistoryMap[e.patientId?.toString()] = e.toJSON())
    );

    const inPatientIds = patientAdmissionHistory.map((el) => el.patientId?.toString()) as string[];
    const inPatientAdmissionIds = patientAdmissionHistory.map((el) =>
      el._id?.toString()
    ) as string[];

    let patients: IBasicObj[] = await Patient.find({ _id: inPatientIds })
      .select('_id uhid firstName lastName patientPic gender')
      .setOptions({ skipResAllPopulate: true });
    patients = patients.map((e) => {
      const p = e.toJSON();
      return {
        ...p,
        ...patientAdmissionHistoryMap[p?._id.toString()],
      };
    });

    // Doctor
    const doctorRoles = await Role.find({ name: 'Doctor' }).select('_id');
    const doctorRoleIds = doctorRoles.map((el) => el._id?.toString());

    const doctors = await User.find({
      roleId: { $in: doctorRoleIds },
      ...doctorsQuery,
    })
      .setOptions({ skipUrlGeneration: true, shouldSkipRole: true })
      .select('_id firstName lastName centerId');
    const doctorIds = doctors.map((el) => el._id?.toString()) as string[];

    // Therapist
    const therapistRoles = await Role.find({
      name: { $in: ['Therapist', 'Therapist+AM'] },
    }).select('_id');

    const therapistRoleIds = therapistRoles.map((el) => el._id?.toString());

    const therapists = await User.find({
      roleId: { $in: therapistRoleIds },
      ...therapistQuery,
    })
      .setOptions({ skipUrlGeneration: true, shouldSkipRole: true })
      .select('_id firstName lastName centerId');
    const therapistIds = therapists.map((el) => el._id?.toString()) as string[];

    // Notes Fetching in Parallel
    const [doctorNotes, therapistNotes, nurseNotes, groupActivityNotes, loa] = await Promise.all([
      DoctorNote.find({
        noteDateTime: { $gte: start, $lte: end },
        patientAdmissionHistoryId: { $in: inPatientAdmissionIds },
        doctorId: { $in: doctorIds },
      }).setOptions({ skipTherapistPopulation: false }),

      TherapistNote.find({
        noteDateTime: { $gte: start, $lte: end },
        patientAdmissionHistoryId: { $in: inPatientAdmissionIds },
        therapistId: { $in: therapistIds },
      }).setOptions({ skipTherapistPopulation: false }),

      NurseNote.find({
        noteDateTime: { $gte: start, $lte: end },
        patientAdmissionHistoryId: { $in: inPatientAdmissionIds },
      }),

      GroupActivity.find({
        activityDateTime: { $gte: start, $lte: end },
        patientId: { $in: inPatientIds },
      }),

      Loa.find({
        noteDateTime: { $gte: start, $lte: end },
        patientAdmissionHistoryId: { $in: inPatientAdmissionIds },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        patients,
        doctorNotes,
        therapistNotes,
        nurseNotes,
        groupActivityNotes,
        loa,
      },
    });
  }
);

/**
 * Helper Function
 */
const _getInsightData = async (startDate: Date, endDate: Date): Promise<ICenterInfo[]> => {
  // 1) Initialize info map with every center
  const centers = await Center.find({ isDeleted: false }).lean();
  const info: Record<string, ICenterInfo> = {};

  for (const c of centers) {
    info[c._id.toString()] = {
      id: c._id.toString(),
      centerName: c.centerName ?? '',
      metadata: {
        startDateTime: startDate,
        endDateTime: endDate,
      },
      metric: {
        totalAdmission: 0,
        gender: { male: 0, female: 0, other: 0 },
        age: [],
        repeatRate: [], // INFO: Logic?
        involuntary: 0,
        addiction: 0,
        addictionAndMentalDisorder: 0,
        mentalDisorder: 0,
        onlineReferralSource: 0, // INFO: Logic?
        dischargeTotal: 0,
        absconding: 0,
        onRequestDischarge: 0,
        lama: 0,
        reffered: 0,
        routineDischarge: 0,
        partialImprovement: 0,
        improvement: 0,
        statusQuo: 0,
        shiftedToAnotherCenter: 0,
        averageStayDuration: [],
        occupiedBedDays: 0,
        totalAvailableBedDays: 0,
        singleTotalAvailableBedDays: 0,
        singleTotalOccupiedBedDays: 0,
        singleTotalOccupiedBedDaysRate: 0,
        doubleTotalAvailableBedDays: 0,
        doubleTotalOccupiedBedDays: 0,
        doubleTotalOccupiedBedDaysRate: 0,
        tripleTotalAvailableBedDays: 0,
        tripleTotalOccupiedBedDays: 0,
        tripleTotalOccupiedBedDaysRate: 0,
        quadTotalAvailableBedDays: 0,
        quadTotalOccupiedBedDays: 0,
        quadTotalOccupiedBedDaysRate: 0,
        acuteTotalAvailableBedDays: 0,
        acuteTotalOccupiedBedDays: 0,
        acuteTotalOccupiedBedDaysRate: 0,
      },
    };
  }

  // 2) Fetch all admissions in the date range
  const admissions = await PatientAdmissionHistory.find({
    dateOfAdmission: { $gte: startDate, $lt: endDate },
  })
    .populate<{ patientId: IPatient }>('patientId')
    .setOptions({ skipResAllPopulate: true })
    .lean();

  // 3) Process each history entry
  await Promise.all(
    admissions.map(async (hist) => {
      const centerId = hist.resourceAllocation?.centerId?.toString();
      const patient = hist.patientId;

      if (!centerId || !info[centerId] || !patient) return;

      const metric = info[centerId].metric;
      metric.totalAdmission += 1;
      const g = patient.gender?.toLowerCase() as keyof IGenderCounts;
      metric.gender[g] = (metric.gender[g] ?? 0) + 1;
      if (typeof patient.age === 'number') metric.age.push(patient.age);

      if (hist.admissionType === 'Involuntary') metric.involuntary += 1;
      if (hist.illnessType === 'Addiction') metric.addiction += 1;
      if (hist.illnessType === 'Mental Disorder') metric.mentalDisorder += 1;
      if (hist.illnessType === 'Addiction & Mental Disorder')
        metric.addictionAndMentalDisorder += 1;

      if (!hist.dischargeId) return;

      const discharge = await PatientDischarge.findById(hist.dischargeId).lean();
      if (!discharge) return;

      metric.dischargeTotal += 1;
      if (discharge.status === 'Absconding') metric.absconding += 1;
      if (discharge.status === 'Discharge on Request') metric.onRequestDischarge += 1;
      if (discharge.status === 'LAMA') metric.lama += 1;
      if (discharge.status === 'Reffered') metric.reffered += 1;
      if (discharge.status === 'Routine Discharge') metric.routineDischarge += 1;
      if (discharge.conditionAtTheTimeOfDischarge === 'Partially Improved')
        metric.partialImprovement += 1;
      if (discharge.conditionAtTheTimeOfDischarge === 'Improved') metric.improvement += 1;
      if (discharge.conditionAtTheTimeOfDischarge === 'Status Quo') metric.statusQuo += 1;

      const stayDays = getDaysBetweenDates(hist?.dateOfAdmission, discharge?.createdAt);
      metric.averageStayDuration.push(stayDays);

      const patientRevision = await PatientAdmissionHistoryRevision.find({ originalId: hist._id });
      patientRevision.map((revision) => {
        if (revision.resourceAllocation?.center._id != centerId) {
          metric.shiftedToAnotherCenter += 1;
        }
      });
    })
  );

  for (const centerId of Object.keys(info)) {
    const metric = info[centerId].metric;

    let current = new Date(startDate);
    current.setUTCHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setUTCHours(0, 0, 0, 0);

    while (current <= end) {
      const dayStart = new Date(current);
      const dayEnd = new Date(current);
      dayStart.setUTCHours(0, 0, 0, 0);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const dbReport = await DailyResourceAllocationReport.findOne({
        date: { $gte: dayStart, $lte: dayEnd },
      }).lean();

      const centerReport = dbReport?.reports.find((r) => r.centerId?.toString() === centerId);
      if (!centerReport) {
        current.setUTCDate(current.getUTCDate() + 1);
        continue;
      }

      metric.occupiedBedDays +=
        centerReport.roomTypes.reduce(
          (sum, room) => sum + (room.totalRooms - room.totalOccupiedBeds),
          0
        ) || 0;

      metric.totalAvailableBedDays +=
        centerReport.roomTypes.reduce((sum, room) => sum + room.totalOccupiedBeds, 0) || 0;

      metric.singleTotalAvailableBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Single')
          .reduce((sum, room) => sum + (room.totalRooms - room.totalOccupiedBeds), 0) || 0;

      metric.singleTotalOccupiedBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Single')
          .reduce((sum, room) => sum + room.totalOccupiedBeds, 0) || 0;

      metric.singleTotalOccupiedBedDaysRate =
        metric.singleTotalAvailableBedDays > 0
          ? Number(
              (
                (metric.singleTotalOccupiedBedDays / metric.singleTotalAvailableBedDays) *
                100
              ).toFixed(2)
            )
          : 0;

      metric.doubleTotalAvailableBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Double-sharing')
          .reduce((sum, room) => sum + (room.totalRooms - room.totalOccupiedBeds), 0) || 0;

      metric.doubleTotalOccupiedBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Double-sharing')
          .reduce((sum, room) => sum + room.totalOccupiedBeds, 0) || 0;

      metric.doubleTotalOccupiedBedDaysRate =
        metric.doubleTotalAvailableBedDays > 0
          ? Number(
              (
                (metric.doubleTotalOccupiedBedDays / metric.doubleTotalAvailableBedDays) *
                100
              ).toFixed(2)
            )
          : 0;

      metric.tripleTotalAvailableBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Triple-sharing')
          .reduce((sum, room) => sum + (room.totalRooms - room.totalOccupiedBeds), 0) || 0;

      metric.tripleTotalOccupiedBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Triple-sharing')
          .reduce((sum, room) => sum + room.totalOccupiedBeds, 0) || 0;

      metric.tripleTotalOccupiedBedDaysRate =
        metric.tripleTotalAvailableBedDays > 0
          ? Number(
              (
                (metric.tripleTotalOccupiedBedDays / metric.tripleTotalAvailableBedDays) *
                100
              ).toFixed(2)
            )
          : 0;

      metric.quadTotalAvailableBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Quad-sharing')
          .reduce((sum, room) => sum + (room.totalRooms - room.totalOccupiedBeds), 0) || 0;

      metric.quadTotalOccupiedBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Quad-sharing')
          .reduce((sum, room) => sum + room.totalOccupiedBeds, 0) || 0;

      metric.quadTotalOccupiedBedDaysRate =
        metric.quadTotalAvailableBedDays > 0
          ? Number(
              ((metric.quadTotalOccupiedBedDays / metric.quadTotalAvailableBedDays) * 100).toFixed(
                2
              )
            )
          : 0;

      metric.acuteTotalAvailableBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Acute')
          .reduce((sum, room) => sum + (room.totalRooms - room.totalOccupiedBeds), 0) || 0;

      metric.acuteTotalOccupiedBedDays +=
        centerReport.roomTypes
          .filter((room) => room.name === 'Acute')
          .reduce((sum, room) => sum + room.totalOccupiedBeds, 0) || 0;

      metric.acuteTotalOccupiedBedDaysRate =
        metric.acuteTotalAvailableBedDays > 0
          ? Number(
              (
                (metric.acuteTotalOccupiedBedDays / metric.acuteTotalAvailableBedDays) *
                100
              ).toFixed(2)
            )
          : 0;

      current.setUTCDate(current.getUTCDate() + 1);
    }
  }

  // 4) Normalize dataset
  const updatedInfo = Object.values(info);

  return updatedInfo;
};

const _formatDate = (date: Date) => date.toString().split(' ').slice(0, 4).join(' ');

const _formatDateOnT = (d: Date): string => {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getSundayBasedWeeksInYear = (year: number) => {
  const weeks: { startDate: string; endDate: string }[] = [];
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Jan 1
  let date = new Date(year, 0, 1);

  // Move to first Sunday
  const dayOfWeek = date.getDay();
  if (dayOfWeek !== 0) {
    date.setDate(date.getDate() + (7 - dayOfWeek));
  }

  // Generate weeks
  while (date.getFullYear() === year && date <= today) {
    const startDate = new Date(date); // Sunday
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 6); // Saturday

    weeks.push({
      startDate: _formatDateOnT(startDate),
      endDate: _formatDateOnT(endDate > today ? today : endDate),
    });

    date.setDate(date.getDate() + 7); // next Sunday
  }

  return weeks;
};

const _getFourWeekRange = (currentWeekStart: Date, currentWeekEnd: Date) => {
  const start = new Date(currentWeekStart);
  const end = new Date(currentWeekEnd);

  const fourWeekStart = new Date(start);
  fourWeekStart.setDate(start.getDate() - 7 * 3);

  const fourWeekEnd = new Date(end);

  fourWeekStart.setHours(0, 0, 0, 0);
  fourWeekEnd.setHours(23, 59, 59, 999);

  return {
    startDate: fourWeekStart,
    endDate: fourWeekEnd,
  };
};

const _getPreviousDate = (date: Date | string): Date => {
  const inputDate = new Date(date);
  const previousDate = new Date(inputDate);
  previousDate.setDate(inputDate.getDate() - 1);
  return previousDate;
};

const _getPreviousWeekRange = (dateInput: Date | string) => {
  const date = new Date(dateInput);

  const day = date.getDay();

  const endOfPrevWeek = new Date(date);
  endOfPrevWeek.setDate(date.getDate() - day - 1);

  const startOfPrevWeek = new Date(endOfPrevWeek);
  startOfPrevWeek.setDate(endOfPrevWeek.getDate() - 6);

  const format = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'UTC' });

  return {
    startDate: startOfPrevWeek,
    endDate: endOfPrevWeek,
    formatted: {
      startDate: format(startOfPrevWeek),
      endDate: format(endOfPrevWeek),
    },
  };
};
