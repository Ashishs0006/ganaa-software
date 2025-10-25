import { IBasicObj } from '../interfaces/generics';
import Patient from '../models/patient/patient.model';
import Center from '../models/resources/center.model';
import RoomType from '../models/resources/room.type.model';
import RoomNumber from '../models/resources/room.number.model';
import PatientDischarge from '../models/patient/patient.discharge.model';
import PatientAdmissionHistory from '../models/patient/patient.admission.history.model';
import DailyResourceAllocationReport from '../models/reports/daily.resource.report.model';

export const generateDailyResourceAllocationReport = async () => {
  try {
    const data = await buildDailyResourceAllocation();

    await DailyResourceAllocationReport.create(data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in dailyResourceAllocationReport:`, error);
  }
};

export const buildDailyResourceAllocation = async () => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const centers = await Center.find({ isDeleted: false }).lean();
    if (centers.length < 1) return;

    const roomTypes = await RoomType.find({ isDeleted: false }).lean();

    let roomTypesMap: IBasicObj = {};

    await Promise.all(
      roomTypes.map(async (el) => {
        const centerId = el.centerId?.toString() ?? '';
        const totalRooms = await RoomNumber.countDocuments({
          roomTypeId: el._id,
          isDeleted: false,
        });
        const totalOccupiedBeds = await PatientAdmissionHistory.countDocuments({
          currentStatus: { $in: ['Inpatient', 'Discharge Initiated'] },
          'resourceAllocation.roomTypeId': el._id,
        });

        const type = {
          roomTypeId: el._id.toString(),
          name: el.name,
          maxOccupancy: el.maxOccupancy,
          totalRooms,
          totalOccupiedBeds,
        };

        if (roomTypesMap.hasOwnProperty(centerId)) {
          roomTypesMap[centerId].push(type);
        } else {
          roomTypesMap[centerId] = [type];
        }
      })
    );

    const allInfo = await Promise.all(
      centers.map(async (center) => {
        let centerGenders = {
          Male: 0,
          Female: 0,
          Other: 0,
        };
        let repeatAdmission = 0;
        let newAdmission = 0;
        let centerDischarge = 0;

        // Step 1: Get today's admissions for this center
        const todayAdmissions = await PatientAdmissionHistory.aggregate([
          {
            $match: {
              dateOfAdmission: { $gte: todayStart, $lte: todayEnd },
              'resourceAllocation.centerId': center._id,
            },
          },
          {
            $group: {
              _id: '$patientId',
              admissionIds: { $push: '$_id' },
            },
          },
        ]);

        const patientIdsToday = todayAdmissions.map((item) => item._id);

        // Step 2: Check total admissions for those patients to classify repeat vs new
        const allAdmissionsForPatients = await PatientAdmissionHistory.aggregate([
          { $match: { patientId: { $in: patientIdsToday } } },
          {
            $group: {
              _id: '$patientId',
              totalAdmissions: { $sum: 1 },
            },
          },
        ]);

        allAdmissionsForPatients.forEach((p) => {
          if (p.totalAdmissions > 1) {
            repeatAdmission++;
          } else {
            newAdmission++;
          }
        });

        // Step 3: Gender distribution for currently admitted patients
        const patientAdmission = await PatientAdmissionHistory.find({
          currentStatus: { $in: ['Inpatient', 'Discharge Initiated'] },
          'resourceAllocation.centerId': center._id.toString(),
        }).select('_id patientId');

        const patientAdmissionIds = patientAdmission.map((el) => el.patientId);
        const patientInfo = await Patient.find({ _id: { $in: patientAdmissionIds } })
          .select('gender')
          .lean();

        patientInfo.forEach((patient) => {
          const gender = patient.gender;
          if (!gender) return;
          centerGenders[gender]++;
        });

        const dischargeIds = await PatientAdmissionHistory.find({
          'resourceAllocation.centerId': center._id.toString(),
          dischargeId: { $exists: true, $ne: null },
        }).select('dischargeId');

        const dischargeIdList = dischargeIds.map((doc) => doc.dischargeId);

        const dischargeCount = await PatientDischarge.countDocuments({
          _id: { $in: dischargeIdList },
          date: { $gte: todayStart, $lt: todayEnd },
        });

        centerDischarge = dischargeCount;

        return {
          centerId: center._id.toString(),
          centerName: center.centerName,
          repeatAdmission,
          newAdmission,
          centerDischarge,
          roomTypes: roomTypesMap[center._id.toString()],
          centerGenders: centerGenders.toLowerCaseKeys(),
        };
      })
    );

    const todayAtElevenFiftyFivePM = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      55,
      0,
      0
    );

    return {
      date: todayAtElevenFiftyFivePM,
      reports: allInfo,
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in dailyResourceAllocationReport:`, error);
  }
};
