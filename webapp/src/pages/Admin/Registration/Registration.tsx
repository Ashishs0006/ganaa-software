import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useBlocker, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import { RootState } from "@/redux/store/store";
import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";
import {
  resetPatientAdmission,
  resetPatientDetails,
  resetVitals,
  setPatientAdmission,
  setPatientDetails,
  setVital
} from "@/redux/slice/patientSlice";
import {
  getAllAllergy,
  getAllNurseNotes,
  getSinglePatient,
  getSinglePatientAdmissionHistory
} from "@/apis";
import { Stepper, ResourceAllocation, MedicalSummary } from "@/components";
import { PatientDetails } from "@/pages/Admin/Registration/Components";
import moment from "moment";
import toast from "react-hot-toast";

const Registration = () => {
  const { id, aId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);

  const patientData = useSelector((store: RootState) => store.patient);
  const stepperData = useSelector((store: RootState) => store.stepper);

  useEffect(() => {
    return () => {
      dispatch(resetPatientAdmission());
      dispatch(resetPatientDetails());
      dispatch(resetVitals());
      dispatch(setStepper({ step: 1, tab: 1 }));
      dispatch(
        setDiscardModal({
          isFormChanged: false,
          isDiscardModalOpen: false,
          shouldSave: false,
          type: "navigate",
          step: 1,
          tab: 1
        })
      );
    };
  }, [location, dispatch]);

  const fetchSinglePatient = async (id: string, aId: string | undefined) => {
    try {
      let patientAdmissionHistory;
      const { data } = await getSinglePatient(id);
      if (aId) {
        const res = await getSinglePatientAdmissionHistory(id, aId);
        patientAdmissionHistory = res.data;
      }
      if (patientAdmissionHistory?.data?.currentStatus === "Discharged") {
        toast.error("Patient is already discharged.");
        navigate("/");
      }
      const { data: nurse } = await getAllNurseNotes({
        patientAdmissionHistoryId: patientAdmissionHistory?.data?._id,
        page: 1,
        limit: 1,
        sort: "createdAt"
      });
      const { data: allergydata } = await getAllAllergy({ limit: 300 });
      let allregyarray = [];
      if (
        patientAdmissionHistory?.data?.patientReport?.allergiesNames &&
        patientAdmissionHistory?.data?.patientReport?.allergiesNames?.length > 0
      ) {
        allregyarray = allergydata?.data
          .filter((data: { _id: string }) =>
            patientAdmissionHistory?.data?.patientReport?.allergiesNames?.includes(data._id)
          )
          .map((data: { name: string; _id: string }) => ({
            label: data?.name,
            value: data?._id
          }));
      }

      dispatch(
        setPatientDetails({
          ...patientData?.patientDetails,
          _id: data?.data?._id || patientData.patientDetails?._id,
          uhid: data?.data?.uhid || patientData?.patientDetails?.uhid,
          firstName: data?.data?.firstName || patientData?.patientDetails?.firstName,
          lastName: data?.data?.lastName || patientData?.patientDetails?.lastName,
          patientFileName:
            data?.data?.patientPicFileName || patientData?.patientDetails?.patientFileName,
          dob:
            (data?.data?.dob && new Date(data?.data?.dob).toISOString().split("T")[0]) ||
            patientData?.patientDetails?.dob,
          age: data?.data?.age || patientData?.patientDetails?.age,
          email: data?.data?.email || patientData?.patientDetails?.email,
          phoneNumberCountryCode: {
            label:
              data?.data?.phoneNumberCountryCode ||
              patientData?.patientDetails?.phoneNumberCountryCode?.label,
            value:
              data?.data?.phoneNumberCountryCode ||
              patientData?.patientDetails?.phoneNumberCountryCode?.value
          },
          phoneNumber: data?.data?.phoneNumber || patientData?.patientDetails?.phoneNumber,
          alternativephoneNumberCountryCode: {
            label:
              data?.data?.alternativephoneNumberCountryCode ||
              patientData?.patientDetails?.alternativephoneNumberCountryCode?.label,
            value:
              data?.data?.alternativephoneNumberCountryCode ||
              patientData?.patientDetails?.alternativephoneNumberCountryCode?.value
          },

          alternativeMobileNumber:
            data?.data?.alternativeMobileNumber ||
            patientData?.patientDetails?.alternativeMobileNumber,
          gender: data?.data?.gender || patientData?.patientDetails?.gender,
          identificationMark:
            data?.data?.identificationMark || patientData?.patientDetails?.identificationMark,
          country: {
            label: data?.data?.country || patientData?.patientDetails?.country?.label,
            value: data?.data?.country || patientData?.patientDetails?.country?.value
          },
          fullAddress: data?.data?.fullAddress || patientData?.patientDetails?.fullAddress,
          area: data?.data?.area || patientData?.patientDetails?.area,
          patientPic: data?.data?.patientPicUrl || patientData?.patientDetails?.patientPic,

          referredTypeId: {
            label:
              data?.data?.referredTypeId?.name ||
              patientData?.patientDetails?.referredTypeId?.label,
            value:
              data?.data?.referredTypeId?._id || patientData?.patientDetails?.referredTypeId?.value
          },
          referralDetails:
            data?.data?.referralDetails || patientData?.patientDetails?.referralDetails,

          education: data?.data?.education || patientData?.patientDetails?.education,
          familyIncome: data?.data?.familyIncome || patientData?.patientDetails?.familyIncome,
          religion: data?.data?.religion || patientData?.patientDetails?.religion,
          language: data?.data?.language || patientData?.patientDetails?.language,
          isMarried: data?.data?.isMarried ?? patientData?.patientDetails?.isMarried,
          numberOfChildren: {
            value:
              data?.data?.numberOfChildren || patientData?.patientDetails?.numberOfChildren?.label,
            label:
              data?.data?.numberOfChildren || patientData?.patientDetails?.numberOfChildren?.value
          },
          occupation: data?.data?.occupation || patientData?.patientDetails?.occupation,
          diagnosis: {
            label:
              patientAdmissionHistory?.data?.illnessType ||
              patientData?.patientDetails?.diagnosis?.label,
            value:
              patientAdmissionHistory?.data?.illnessType ||
              patientData?.patientDetails?.diagnosis?.value
          },

          // patientReport
          injuryDetails:
            (patientAdmissionHistory?.data?.patientReport?.injuriesDetails?.length > 0 &&
              patientAdmissionHistory?.data?.patientReport?.injuriesDetails?.map(
                (data: {
                  injuryName: string;
                  fileUrls: { filePath: string; fileUrl: string }[];
                }) => ({
                  injuryName: data?.injuryName,
                  files: data?.fileUrls || []
                })
              )) ||
            patientData?.patientDetails?.injuryDetails,
          previousTreatmentRecordLink:
            patientAdmissionHistory?.data?.patientReport?.previousTreatmentRecord ||
            patientData?.patientDetails?.previousTreatmentRecordLink,
          allergiesFilesLink:
            patientAdmissionHistory?.data?.patientReport?.allergiesFiles ||
            patientData?.patientDetails?.allergiesFilesLink,
          diabeticStatus:
            patientAdmissionHistory?.data?.patientReport?.diabeticStatus ||
            patientData?.patientDetails?.diabeticStatus,
          allergyArray: allregyarray,
          heartDisease:
            patientAdmissionHistory?.data?.patientReport?.heartDisease ||
            patientData?.patientDetails?.heartDisease,
          heartDiseaseDescription:
            patientAdmissionHistory?.data?.patientReport?.heartDiseaseDescription ||
            patientData?.patientDetails?.heartDiseaseDescription,
          levelOfRiskDescription:
            patientAdmissionHistory?.data?.patientReport?.levelOfRiskDescription ||
            patientData?.patientDetails?.levelOfRiskDescription,
          levelOfRisk:
            patientAdmissionHistory?.data?.patientReport?.levelOfRisk ||
            patientData?.patientDetails?.levelOfRisk,
          hyperTension:
            patientAdmissionHistory?.data?.patientReport?.hyperTension ||
            patientData?.patientDetails?.hyperTension
        })
      );

      dispatch(
        setPatientAdmission({
          ...patientData?.patientAdmission,
          _id: patientAdmissionHistory?.data?._id || patientData.patientAdmission._id,
          patientId: data?.data?._id || patientData.patientAdmission.patientId,
          dateOfAdmission: patientAdmissionHistory?.data?.dateOfAdmission
            ? moment(patientAdmissionHistory?.data?.dateOfAdmission).format("YYYY-MM-DD")
            : patientData?.patientAdmission?.dateOfAdmission,
          // (patientAdmissionHistory?.data?.dateOfAdmission &&
          //   new Date(patientAdmissionHistory?.data?.dateOfAdmission).toISOString().split("T")[0]) ||
          // patientData.patientAdmission.dateOfAdmission,
          // time: `${new Date(patientAdmissionHistory?.data?.dateOfAdmission)
          //   .getUTCHours() // Use getUTCHours() for UTC hours
          //   .toString()
          //   .padStart(2, "0")}:${new Date(patientAdmissionHistory?.data?.dateOfAdmission)
          //   .getUTCMinutes() // Use getUTCMinutes() for UTC minutes
          //   .toString()
          //   .padStart(2, "0")}`,
          time: patientAdmissionHistory?.data?.dateOfAdmission
            ? moment(patientAdmissionHistory?.data?.dateOfAdmission).format("HH:mm")
            : patientData?.patientAdmission?.time,

          admissionType:
            patientAdmissionHistory?.data?.admissionType ||
            patientData?.patientAdmission?.admissionType,
          involuntaryAdmissionType: {
            label:
              patientAdmissionHistory?.data?.involuntaryAdmissionType ||
              patientData?.patientAdmission?.involuntaryAdmissionType?.label,
            value:
              patientAdmissionHistory?.data?.involuntaryAdmissionType ||
              patientData?.patientAdmission?.involuntaryAdmissionType?.value
          },

          voluntaryAdmissionFormLink:
            patientAdmissionHistory?.data?.admissionChecklist?.voluntaryAdmissionForm ||
            patientData?.patientAdmission?.voluntaryAdmissionFormLink,

          applicationForAdmissionLink:
            patientAdmissionHistory?.data?.admissionChecklist?.applicationForAdmission ||
            patientData?.patientAdmission?.applicationForAdmissionLink,

          inVoluntaryAdmissionFormLink:
            patientAdmissionHistory?.data?.admissionChecklist?.inVoluntaryAdmissionForm ||
            patientData?.patientAdmission?.inVoluntaryAdmissionFormLink,

          minorAdmissionFormLink:
            patientAdmissionHistory?.data?.admissionChecklist?.minorAdmissionForm ||
            patientData?.patientAdmission?.minorAdmissionFormLink,
          form90Link:
            patientAdmissionHistory?.data?.admissionChecklist?.form90 ||
            patientData?.patientAdmission?.form90Link,

          familyDeclarationLink:
            patientAdmissionHistory?.data?.admissionChecklist?.familyDeclaration ||
            patientData?.patientAdmission?.familyDeclarationLink,

          section94Link:
            patientAdmissionHistory?.data?.admissionChecklist?.section94 ||
            patientData?.patientAdmission?.section94Link,

          capacityAssessmentLink:
            patientAdmissionHistory?.data?.admissionChecklist?.capacityAssessment ||
            patientData?.patientAdmission?.capacityAssessmentLink,

          hospitalGuidelineFormLink:
            patientAdmissionHistory?.data?.admissionChecklist?.hospitalGuidelineForm ||
            patientData?.patientAdmission?.hospitalGuidelineFormLink,

          finacialCounsellingLink:
            patientAdmissionHistory?.data?.admissionChecklist?.finacialCounselling ||
            patientData?.patientAdmission?.finacialCounsellingLink,

          insuredFileLink:
            patientAdmissionHistory?.data?.admissionChecklist?.insuredFile ||
            patientData?.patientAdmission?.insuredFileLink,
          //admiision checklist
          isfinacialCounselling:
            patientAdmissionHistory?.data?.admissionChecklist?.finacialCounselling?.length > 0
              ? true
              : false,
          issection94:
            patientAdmissionHistory?.data?.admissionChecklist?.section94?.length > 0 ? true : false,
          isapplicationForAdmission:
            patientAdmissionHistory?.data?.admissionChecklist?.applicationForAdmission?.length > 0
              ? true
              : false,
          iscapacityAssessment:
            patientAdmissionHistory?.data?.admissionChecklist?.capacityAssessment?.length > 0
              ? true
              : false,
          isfamilyDeclaration:
            patientAdmissionHistory?.data?.admissionChecklist?.familyDeclaration?.length > 0
              ? true
              : false,
          ishospitalGuidelineForm:
            patientAdmissionHistory?.data?.admissionChecklist?.hospitalGuidelineForm?.length > 0
              ? true
              : false,
          isinVoluntaryAdmissionForm:
            patientAdmissionHistory?.data?.admissionChecklist?.inVoluntaryAdmissionForm?.length > 0
              ? true
              : false,
          isvoluntaryAdmissionForm:
            patientAdmissionHistory?.data?.admissionChecklist?.voluntaryAdmissionForm?.length > 0
              ? true
              : false,
          isminorAdmissionForm:
            patientAdmissionHistory?.data?.admissionChecklist?.minorAdmissionForm?.length > 0
              ? true
              : false,
          isform90:
            patientAdmissionHistory?.data?.admissionChecklist?.form90?.length > 0 ? true : false,
          orientationOfFamily:
            patientAdmissionHistory?.data?.admissionChecklist?.orientationOfFamily?.length > 0
              ? true
              : false,
          orientationOfPatient:
            patientAdmissionHistory?.data?.admissionChecklist?.orientationOfPatient?.length > 0
              ? true
              : false,
          isInsured:
            patientAdmissionHistory?.data?.admissionChecklist?.isInsured ??
            patientData?.patientAdmission?.isInsured,
          insuredDetail:
            patientAdmissionHistory?.data?.admissionChecklist?.insuredDetail ||
            patientData?.patientAdmission?.insuredDetail,
          centerId: {
            value:
              patientAdmissionHistory?.data?.resourceAllocation?.centerId?._id ||
              patientData?.patientAdmission?.centerId?.value,
            label:
              patientAdmissionHistory?.data?.resourceAllocation?.centerId?.centerName ||
              patientData?.patientAdmission?.centerId?.label
          },
          roomTypeId: {
            value:
              patientAdmissionHistory?.data?.resourceAllocation?.roomTypeId?._id ||
              patientData?.patientAdmission?.roomTypeId?.value,
            label:
              patientAdmissionHistory?.data?.resourceAllocation?.roomTypeId?.name ||
              patientData?.patientAdmission?.roomTypeId?.label
          },
          roomNumberId: {
            value:
              patientAdmissionHistory?.data?.resourceAllocation?.roomNumberId?._id ||
              patientData?.patientAdmission?.roomNumberId?.value,
            label:
              patientAdmissionHistory?.data?.resourceAllocation?.roomNumberId?.name ||
              patientData?.patientAdmission?.roomNumberId?.label
          },
          lockerNumberId: {
            value:
              patientAdmissionHistory?.data?.resourceAllocation?.lockerNumberId?._id ||
              patientData?.patientAdmission?.lockerNumberId?.value,
            label:
              patientAdmissionHistory?.data?.resourceAllocation?.lockerNumberId?.name ||
              patientData?.patientAdmission?.lockerNumberId?.label
          },
          belongingsInLocker:
            patientAdmissionHistory?.data?.resourceAllocation?.belongingsInLocker ||
            patientData?.patientAdmission?.belongingsInLocker,
          assignedDoctorId: {
            value:
              patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?._id ||
              patientData?.patientAdmission?.assignedDoctorId?.value,
            label:
              patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.firstName ||
              patientData?.patientAdmission?.assignedDoctorId?.label
          },
          assignedTherapistId: {
            value:
              patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?._id ||
              patientData?.patientAdmission?.assignedTherapistId?.value,
            label:
              patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.firstName ||
              patientData?.patientAdmission?.assignedTherapistId?.label
          },
          nurse:
            patientAdmissionHistory?.data?.resourceAllocation?.nurse ||
            patientData?.patientAdmission?.nurse,
          careStaff:
            patientAdmissionHistory?.data?.resourceAllocation?.careStaff ||
            patientData?.patientAdmission?.careStaff
        })
      );
      dispatch(
        setVital({
          id: nurse?.data[0]?._id || patientData?.vitals?.id,
          patientId: nurse?.data[0]?.patientId || patientData?.vitals?.patientId,
          patientAdmissionHistoryId:
            nurse?.data[0]?.patientAdmissionHistoryId ||
            patientData?.vitals?.patientAdmissionHistoryId,
          vitalsDate: moment().format("YYYY-MM-DD"),
          vitalsTime: moment().format("HH:mm"),
          note: nurse?.data[0]?.note || patientData?.vitals?.note,
          bp: nurse?.data[0]?.bp || patientData?.vitals.bp,
          bp1:
            nurse?.data[0]?.bp && nurse?.data[0]?.bp.includes("/")
              ? nurse?.data[0]?.bp.split("/")[0]
              : patientData?.vitals?.bp1,
          bp2:
            nurse?.data[0]?.bp && nurse?.data[0]?.bp.includes("/")
              ? nurse?.data[0]?.bp.split("/")[1]
              : patientData?.vitals?.bp2,
          pulse: nurse?.data[0]?.pulse || patientData?.vitals?.pulse,
          temperature: nurse?.data[0]?.temperature || patientData?.vitals?.temperature,
          spo2: nurse?.data[0]?.spo2 || patientData?.vitals?.spo2,
          rbs: nurse?.data[0]?.rbs || patientData?.vitals?.rbs,
          height: nurse?.data[0]?.height || patientData?.vitals?.height,
          weight: nurse?.data[0]?.weight || patientData?.vitals?.weight
        })
      );
    } catch (error) {
      console.error("Failed to fetch patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSinglePatient(id, aId);
      if (searchParams.get("resource") === "2") {
        dispatch(setStepper({ step: 2, tab: 3 }));
      } else if (searchParams.get("resource") == "3") {
        dispatch(setStepper({ step: 3, tab: 3 }));
      }
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkStateBeforeUnload = (e: BeforeUnloadEvent) => {
      if (stepperData.discardModal.isFormChanged) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", checkStateBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", checkStateBeforeUnload);
    };
  }, [dispatch, stepperData.discardModal.isFormChanged]);

  useBlocker(({ nextLocation }) => {
    if (stepperData.discardModal.isFormChanged) {
      dispatch(
        setDiscardModal({ isDiscardModalOpen: true, discartLocation: nextLocation.pathname })
      );
      return true;
    }

    return false;
  });

  return (
    !loading && (
      <div
        id="Registration"
        className="min-h-[calc(100vh-64px)] w-full bg-cover bg-[#F4F2F0] bg-center flex-col bg-no-repeat flex items-center p-2 sm:p-0"
      >
        <div className="container mb-20 flex-col h-full flex gap-[19px] items-center mt-8 w-full">
          <p className="text-[30px] font-elmessiri font-normal">
            {!id ? "Register Patient" : "Update Patient Record"}
          </p>
          <Stepper />

          <div className="px-[73px] pt-[35px] w-full">
            <div className="border border-[#DEDEDE] bg-white w-full px-[51px] py-[25px] rounded-[21px]">
              {stepperData.stepper.step == 1 && <PatientDetails />}
              {stepperData.stepper.step == 2 && <ResourceAllocation />}
              {stepperData.stepper.step == 3 && <MedicalSummary />}
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default Registration;
