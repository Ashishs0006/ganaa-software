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
console.log("total occupied beds:",totalOccupiedBeds)
        const roomTypeObj = {
          roomTypeId: el._id.toString(),
          name: el.name,
          maxOccupancy: el.maxOccupancy,
          totalRooms,
          totalOccupiedBeds,
        };

        if (!roomTypesMap[centerId]) roomTypesMap[centerId] = [];
        roomTypesMap[centerId].push(roomTypeObj);
      })
    );

    const allInfo = await Promise.all(
      centers.map(async (center) => {
        let centerGenders = { Male: 0, Female: 0, Other: 0 };
        let repeatAdmission = 0;
        let newAdmission = 0;

        // ✅ FIXED POPULATE for nested resourceAllocation paths
        const todayAdmissionsDetails = await PatientAdmissionHistory.find({
          dateOfAdmission: { $gte: todayStart, $lte: todayEnd },
          'resourceAllocation.centerId': center._id,
        })
          .populate({
            path: 'patientId',
            select: 'firstName lastName gender',
          })
          .populate({
            path: 'resourceAllocation.centerId',
            model: Center,
            select: 'centerName',
          })
          .populate({
            path: 'resourceAllocation.roomTypeId',
            model: RoomType,
            select: 'name',
          })
          .lean();

        const todayAdmissionsMapped = [];

        for (const adm of todayAdmissionsDetails) {
          const previousAdmissions = await PatientAdmissionHistory.countDocuments({
            patientId: adm.patientId._id,
            dateOfAdmission: { $lt: todayStart },
          });

          if (previousAdmissions > 0) repeatAdmission++;
          else newAdmission++;

          todayAdmissionsMapped.push({
            patientName:
              `${adm.patientId?.firstName ?? ''} ${adm.patientId?.lastName ?? ''}`.trim(),
            centerName: adm.resourceAllocation?.centerId?.centerName || center.centerName,
            roomType: adm.resourceAllocation?.roomTypeId?.name || 'NA',
          });

          const gender = adm.patientId?.gender;
          if (gender) centerGenders[gender]++;
        }

        // ✅ Discharges Today Details
        const dischargeRecords = await PatientAdmissionHistory.find({
          'resourceAllocation.centerId': center._id.toString(),
          dischargeId: { $exists: true, $ne: null },
        }).select('dischargeId');

        const dischargeIdList = dischargeRecords.map((d) => d.dischargeId);

        const todayDischargeDetails = await PatientDischarge.find({
          _id: { $in: dischargeIdList },
          date: { $gte: todayStart, $lt: todayEnd },
        })
          .populate('patientId', 'firstName lastName')
          .lean();

        const todayDischargeMapped = todayDischargeDetails.map((dc) => {
         
          // const stayDuration = Math.ceil(
          //   (dc.date.getTime() - new Date(dc.date).getTime()) / (1000 * 60 * 60 * 24)
          // );

          
            const diff = Math.ceil((new Date() - new Date(dc.date)) / (1000 * 60 * 60 * 24));
            const stayDuration = `${diff} ${diff === 1 ? 'day' : 'days'}`;

          return {
            patientName: `${dc.patientId?.firstName ?? ''} ${dc.patientId?.lastName ?? ''}`.trim(),
            dischargeType: dc.status || 'NA',
            dischargeCondition: dc.conditionAtTheTimeOfDischarge || 'NA',
            stayDuration,
          };
        });

        return {
          centerId: center._id.toString(),
          centerName: center.centerName,
          repeatAdmission,
          newAdmission,
          centerDischarge: todayDischargeMapped.length,
          roomTypes: roomTypesMap[center._id.toString()] ?? [],
          centerGenders: centerGenders.toLowerCaseKeys?.() ?? centerGenders,
          todayAdmissions: todayAdmissionsMapped,
          todayDischarges: todayDischargeMapped,
        };
      })
    );
    const reportDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 55, 0);

    return {
      date: reportDate,
      reports: allInfo,
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in dailyResourceAllocationReport:`, error);
  }
};
