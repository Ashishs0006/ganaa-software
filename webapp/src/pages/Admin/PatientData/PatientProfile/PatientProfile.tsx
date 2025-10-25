import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getAllAllergy,
  getAllNurseNotes,
  getPatientFamily,
  getSinglePatient,
  getSinglePatientAdmissionHistory
} from "@/apis";
import { Button, BreadCrumb } from "@/components";
// import { ShimmerCircularImage, ShimmerSectionHeader, ShimmerTitle } from "react-shimmer-effects";

import pdfFile from "@/assets/images/pdfIcon.svg";
import file from "@/assets/images/fileIcon.svg";

import { capitalizeFirstLetter, convertBackendDateToTime, formatId } from "@/utils/formater";
import { formatDate } from "@/utils/formater";

import { IinjuriesDetails, IPatientState } from "@/pages/Admin/PatientData/PatientProfile/types";

import { GrView } from "react-icons/gr";
import { ProfileShimmer } from "@/components/Shimmer/Shimmer";
import { calculateBMI } from "@/utils/calculateBMI";
import { RESOURCES } from "@/constants/resources";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";

const PatientProfile = () => {
  const { id, aId } = useParams();

  const [loading, setLoading] = useState<boolean>(false);

  const [state, setState] = useState<IPatientState>({
    firstName: "",
    lastName: "",
    UHID: "",
    currentStatus: "",
    admissionDate: "",
    patientPicUrl: "",
    illnessType: "",

    dateOfBirth: "",
    age: "",
    email: "",
    mobileNo: "",
    alternateMobileNo: "",
    gender: "",
    identificationMark: "",
    country: "",
    address: "",
    area: "",
    refferalType: "",
    referralDetails: "",
    involuntary: "",
    involuntaryAdmissionType: "",
    admissionId: "",

    education: "",
    familyIncome: "",
    religion: "",
    language: "",
    married: "",
    numberOfChildren: "",
    occupation: "",

    center: "",
    roomType: "",
    room: "",
    lockerNo: "",
    assignedDoctor: "",
    assignedTherapist: "",
    belongingsInLocker: "",
    nurse: "",
    careStaff: "",

    // checklist
    applicationForAdmission: [],
    voluntaryAdmissionForm: [],
    inVoluntaryAdmissionForm: [],
    minorAdmissionForm: [],
    form90: [],
    familyDeclaration: [],
    section94: [],
    capacityAssessment: [],
    hospitalGuidelineForm: [],
    finacialCounselling: [],
    orientationOfFamily: "",
    orientationOfPatient: "",
    insuredFile: [],
    insuredDetail: "",
    isInsured: "",
    patientReport: {}
  });

  interface INurseData {
    note: string;
    bp: string;
    pulse: string;
    temperature: string;
    spo2: string;
    rbs: string;
    height: string;
    weight: string;
  }
  const [nurseData, setNurseData] = useState<INurseData>({
    note: "",
    bp: "",
    pulse: "",
    temperature: "",
    spo2: "",
    rbs: "",
    height: "",
    weight: ""
  });

  interface IFamilyDetails {
    _id: string;
    address: string;
    age: string;

    idProffNumber: string;
    idProffType: string;
    idProofUrl: string;
    infoType: string[];
    name: string;
    phoneNumber: string;
    phoneNumberCountryCode: string;
    relationshipId: {
      shortName: string;
      fullName: "";
    };
  }

  const [familyDetails, setFamilyDetail] = useState<IFamilyDetails[]>([]);

  const fetchPatient = async (id: string, aId: string) => {
    try {
      setLoading(true);
      const { data } = await getSinglePatient(id);
      if (!data) {
        throw new Error("patient data not found");
      }

      const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);

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
            name: data?.name
          }));
      }

      const { data: nurse } = await getAllNurseNotes({
        patientAdmissionHistoryId: aId,
        page: 1,
        limit: 1,
        sort: "createdAt"
      });

      setNurseData({
        note: nurse?.data[0]?.note || "",
        bp: nurse?.data[0]?.bp || "",
        pulse: nurse?.data[0]?.pulse || "",
        temperature: nurse?.data[0]?.temperature || "",
        spo2: nurse?.data[0]?.spo2 || "",
        rbs: nurse?.data[0]?.rbs || "",
        height: nurse?.data[0]?.height || "",
        weight: nurse?.data[0]?.weight || ""
      });
      setState({
        firstName: `${data?.data?.firstName || ""}`.trim(),
        lastName: `${data?.data?.lastName || ""}`.trim(),
        UHID: data?.data?.uhid || "",
        currentStatus: patientAdmissionHistory?.data?.currentStatus,
        admissionDate: patientAdmissionHistory?.data?.dateOfAdmission || "",
        patientPicUrl: data?.data?.patientPicUrl || "",
        dateOfBirth: data?.data?.dob || "",
        age: data?.data?.age || "",
        email: data?.data?.email || "",
        illnessType: patientAdmissionHistory?.data?.illnessType || "",
        mobileNo: `${data?.data?.phoneNumberCountryCode || ""} ${
          data?.data?.phoneNumber || ""
        }`.trim(),
        alternateMobileNo: `${data?.data?.alternativephoneNumberCountryCode || ""} ${
          data?.data?.alternativeMobileNumber || ""
        }`.trim(),
        gender: data?.data?.gender || "",
        identificationMark: data?.data?.identificationMark || "",
        country: data?.data?.country || "",
        area: data?.data?.area || "",
        refferalType: data?.data?.referredTypeId?.name || "",
        referralDetails: data?.data?.referralDetails || "",
        address: data?.data?.fullAddress || "",
        admissionId: patientAdmissionHistory?.data?._id || "",

        involuntary: patientAdmissionHistory?.data?.admissionType,
        involuntaryAdmissionType: patientAdmissionHistory?.data?.involuntaryAdmissionType,
        // demographic
        education: data?.data?.education || "",
        familyIncome: data?.data?.familyIncome || "",
        religion: data?.data?.religion || "",
        language: data?.data?.language || "",
        married: data?.data?.isMarried ? "Yes" : "No",
        numberOfChildren: data?.data?.numberOfChildren || "",
        occupation: data?.data?.occupation || "",

        center: patientAdmissionHistory?.data?.resourceAllocation?.centerId?.centerName || "",
        roomType: patientAdmissionHistory?.data?.resourceAllocation?.roomTypeId?.name || "",
        room: patientAdmissionHistory?.data?.resourceAllocation?.roomNumberId?.name || "",
        lockerNo: patientAdmissionHistory?.data?.resourceAllocation?.lockerNumberId?.name || "",
        belongingsInLocker:
          patientAdmissionHistory?.data?.resourceAllocation?.belongingsInLocker || "",
        assignedDoctor: `${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.firstName || ""
        } ${patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.lastName || ""}`,
        assignedTherapist: `${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.firstName || ""
        } ${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.lastName || ""
        }`,
        careStaff: patientAdmissionHistory?.data?.resourceAllocation?.careStaff || "",
        nurse: patientAdmissionHistory?.data?.resourceAllocation?.nurse || "",

        applicationForAdmission:
          patientAdmissionHistory?.data?.admissionChecklist?.applicationForAdmission || [],
        voluntaryAdmissionForm:
          patientAdmissionHistory?.data?.admissionChecklist?.voluntaryAdmissionForm || [],
        inVoluntaryAdmissionForm:
          patientAdmissionHistory?.data?.admissionChecklist?.inVoluntaryAdmissionForm || [],
        minorAdmissionForm:
          patientAdmissionHistory?.data?.admissionChecklist?.minorAdmissionForm || [],
        form90: patientAdmissionHistory?.data?.admissionChecklist?.form90 || [],
        familyDeclaration:
          patientAdmissionHistory?.data?.admissionChecklist?.familyDeclaration || [],
        section94: patientAdmissionHistory?.data?.admissionChecklist?.section94 || [],
        capacityAssessment:
          patientAdmissionHistory?.data?.admissionChecklist?.capacityAssessment || [],
        hospitalGuidelineForm:
          patientAdmissionHistory?.data?.admissionChecklist?.hospitalGuidelineForm || [],
        finacialCounselling:
          patientAdmissionHistory?.data?.admissionChecklist?.finacialCounselling || [],
        orientationOfFamily:
          patientAdmissionHistory?.data?.admissionChecklist?.orientationOfFamily?.length > 0
            ? "Complete"
            : "Incomplete",
        orientationOfPatient:
          patientAdmissionHistory?.data?.admissionChecklist?.orientationOfPatient?.length > 0
            ? "Complete"
            : "Incomplete",
        insuredFile: patientAdmissionHistory?.data?.admissionChecklist?.insuredFile || [],
        insuredDetail: patientAdmissionHistory?.data?.admissionChecklist?.insuredDetail || "",
        isInsured: patientAdmissionHistory?.data?.admissionChecklist?.isInsured ? "Yes" : "No",
        patientReport: {
          ...patientAdmissionHistory?.data?.patientReport,
          allergiesNames: allregyarray
        }
      });

      setLoading(false);
    } catch (error) {
      setLoading(true);
      console.log(error);
      throw new Error("patient not found or data fetching failed");
    }
  };

  const fetchPatientFamily = async (id: string) => {
    try {
      if (id) {
        const response = await getPatientFamily(id);
        setFamilyDetail(response.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (id && aId) {
      fetchPatient(id, aId);
      fetchPatientFamily(id);
    } else {
      throw Error("some thing wrong");
    }
  }, [id, aId]);

  const MAX_LENGTH = 200; // Set the slice limit
  type ExpandableKeys = "notes" | "riskDetails" | "heartDiseaseDetail";
  const [isExpanded, setIsExpanded] = useState<Record<ExpandableKeys, boolean>>({
    notes: false,
    riskDetails: false,
    heartDiseaseDetail: false
  });

  const toggleExpand = (value: ExpandableKeys) => {
    setIsExpanded({ ...isExpanded, [value]: !isExpanded[value] });
  };

  return (
    <div className="container px-8 pb-8" id="profile">
      <div className=" w-1/2  mt-5   flex flex-col items-start">
        <BreadCrumb
          name={`${capitalizeFirstLetter(
            state?.firstName.length > 15 ? state?.firstName.slice(0, 15) + "..." : state?.firstName
          )} ${
            state?.lastName
              ? capitalizeFirstLetter(
                  state?.lastName.length > 15
                    ? state?.lastName.slice(0, 15) + "..."
                    : state?.lastName
                )
              : ""
          }`}
          id={id}
          aId={aId}
        />
        <div className=" text-[18px] font-bold mt-2">Profile</div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center">
          <ProfileShimmer />
        </div>
      ) : (
        <div className="w-full flex flex-col items-center justify-evenly gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`flex rounded-full  border-2 ${
                state.gender == "Male"
                  ? "border-[#00685F]"
                  : state.gender == "Female"
                  ? "border-[#F14E9A]"
                  : "border-gray-500"
              }   overflow-hidden w-[119px] h-[119px] items-center justify-center`}
            >
              {state?.patientPicUrl ? (
                <div className="flex rounded-full w-full  h-full bg-white border border-[white]  overflow-hidden  items-center justify-center">
                  <img
                    src={state?.patientPicUrl}
                    alt="profile"
                    className="w-full h-full rounded-full"
                  />
                </div>
              ) : (
                <div className="flex rounded-full p-1 w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                  <div className="w-full uppercase text-2xl font-bold text-center">
                    {state?.firstName?.slice(0, 1)}
                    {state?.lastName?.slice(0, 1)}
                  </div>
                </div>
              )}
            </div>

            <div className=" grid gap-2">
              <div className="flex items-center">
                <h2
                  className="text-[15px] font-semibold"
                  title={state?.firstName + state?.lastName}
                >
                  {" "}
                  {state.firstName &&
                    capitalizeFirstLetter(
                      state?.firstName.length > 15
                        ? state?.firstName.slice(0, 15) + "..."
                        : state?.firstName
                    )}{" "}
                  {state.lastName &&
                    capitalizeFirstLetter(
                      state?.lastName.length > 15
                        ? state?.lastName.slice(0, 15) + "..."
                        : state?.lastName
                    )}
                </h2>
                {state.currentStatus && (
                  <div
                    className={`${
                      state.currentStatus == "Inpatient"
                        ? "text-[#3A913D] bg-[#E4FFEE]"
                        : "bg-gray-200"
                    } w-fit rounded-[5px] ml-2 gap-1 text-xs font-semibold px-[5px] py-[3px] flex items-center`}
                  >
                    {state.currentStatus !== "Discharged" && (
                      <div
                        className={`  ${
                          state.currentStatus == "Inpatient" ? "bg-[#3A913D]" : "bg-black"
                        } w-1 h-1 bg-black" rounded-full`}
                      ></div>
                    )}
                    <p>{state.currentStatus}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                UHID:
                <span className="font-semibold text-gray-800"> {formatId(state.UHID)} </span>
              </p>
              <p className="text-xs text-gray-500">
                Admission Date:
                <span className="font-semibold text-gray-800">
                  {" "}
                  {state.admissionDate && formatDate(state.admissionDate)},{" "}
                  {state.admissionDate && convertBackendDateToTime(state.admissionDate)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center w-full gap-4">
            {state.currentStatus !== "Discharged" && (
              <RBACGuard resource={RESOURCES.NEW_REGISTRATION} action="write">
                <Link to={`/admin/update-patient/${id}/${aId}`}>
                  <Button
                    type="submit"
                    name="save"
                    className="min-w-[150px]! font-bold! text-xs! px-[12px]! py-[8px]! rounded-xl! border-gray-300! text-black!"
                    variant="outlined"
                    size="base"
                  >
                    Update Patient Profile
                  </Button>
                </Link>
              </RBACGuard>
            )}
            {state.currentStatus == "Discharged" && (
              <Button
                type="submit"
                name="save"
                className="min-w-[150px]! font-bold! text-xs! px-[12px]! py-[8px]! rounded-xl! "
                variant="contained"
                size="base"
              >
                Profile
              </Button>
            )}

            {state.currentStatus == "Discharged" && (
              <RBACGuard resource={RESOURCES.DAILY_PROGRESS} action="read">
                <Link to={`/admin/patients/in-patient/${id}/daily-progress/${aId}`}>
                  <Button
                    type="submit"
                    name="save"
                    className="min-w-[150px]! font-bold! text-xs! px-[12px]! py-[8px]! rounded-xl! border-gray-300! text-black!"
                    variant="outlined"
                    size="base"
                  >
                    Daily Progress
                  </Button>
                </Link>
              </RBACGuard>
            )}
            {state.currentStatus == "Discharged" && (
              <RBACGuard resource={RESOURCES.CASE_HISTORY} action="read">
                <Link to={`/admin/patients/in-patient/${id}/case-history/${aId}`}>
                  <Button
                    type="submit"
                    name="save"
                    className="min-w-[150px]! font-bold! text-xs! px-[12px]! py-[8px]! rounded-xl! border-gray-300! text-black!"
                    variant="outlined"
                    size="base"
                  >
                    Case History
                  </Button>
                </Link>
              </RBACGuard>
            )}
            {state.currentStatus == "Discharged" && (
              <RBACGuard resource={RESOURCES.DISCHARGE} action="read">
                <Link to={`/admin/patients/in-patient/${id}/discharge/${aId}`}>
                  <Button
                    type="submit"
                    name="save"
                    className="min-w-[150px]! font-bold! text-xs! px-[12px]! py-[8px]! rounded-xl! border-gray-300! text-black!"
                    variant="outlined"
                    size="base"
                  >
                    Discharge Summary
                  </Button>
                </Link>
              </RBACGuard>
            )}

            <RBACGuard resource={RESOURCES.AUDIT_LOG} action="read">
              <Link to={`/admin/patients/all-patient/${id}/audit/${aId}`}>
                <Button
                  type="submit"
                  name="save"
                  className="min-w-[150px]! font-bold! text-xs! px-[12px]! py-[8px]! rounded-xl! border-gray-300! text-black!"
                  variant="outlined"
                  size="base"
                >
                  Audit Logs
                </Button>
              </Link>
            </RBACGuard>
          </div>

          <div className="border break-all grid gap-5 mt-5 md:grid-cols-1 h-fit lg:grid-cols-4 border-[#DEDEDE] bg-[#F4F2F0]  w-full px-[18px] py-[18px] rounded-[21px]">
            <div className="col-span-3 col-start-1 flex flex-col gap-5">
              <div className="flex flex-col gap-[13px] h-fit  rounded-xl bg-white p-5">
                <h1 className="text-[15px] font-bold">Patient Details</h1>
                <h2 className="text-[13px] font-bold">Basic Details</h2>
                <h2 className="text-[10px] font-medium uppercase">Patient Details</h2>
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 text-wrap sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Date of Birth</p>
                    <p className="font-semibold text-[13px]">
                      {(state.dateOfBirth && formatDate(state.dateOfBirth)) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Age</p>
                    <p className="font-semibold text-[13px]">{state.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs  font-medium">Email</p>
                    <p title={state.email} className="font-semibold text-[13px] w-[80%] truncate">
                      {state.email || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Mobile No.</p>
                    <p className="font-semibold text-[13px]">{state.mobileNo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Alternate Mobile No.</p>
                    <p className="font-semibold text-[13px]">{state.alternateMobileNo || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Gender</p>
                    <p className="font-semibold text-[13px]">{state.gender}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Identification mark</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state.identificationMark) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Country</p>
                    <p className="font-semibold text-[13px]">{state.country || "--"}</p>
                  </div>
                  <div className="text-wrap col-span-1">
                    <p className="text-gray-500 text-xs font-medium">Address</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state.address) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Area</p>
                    <p className="font-semibold text-[13px]">{state.area || "--"}</p>
                  </div>
                </div>

                <h2 className="text-[10px] mt-8 font-medium uppercase">Referral</h2>
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-gray-500 text-xs">Referral Type</p>
                    <p className="font-semibold text-[13px]">{state.refferalType || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Referred Details</p>
                    <p className="font-semibold text-[13px]">
                      {state.referralDetails ? capitalizeFirstLetter(state.referralDetails) : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Admission Type</p>
                    <p className="font-semibold text-[13px]">
                      {state.involuntary
                        ? `${state.involuntary}${
                            state.involuntary !== "Voluntary"
                              ? ` - ${state?.involuntaryAdmissionType}`
                              : ""
                          }`
                        : "--"}
                    </p>
                  </div>
                </div>
                <hr className=" border-1 my-5" />
                <h2 className="text-[13px] font-bold">Profile & Contacts</h2>
                <h2 className="text-[10px] font-medium uppercase">EDUCATION & PERSONAL DETAILS</h2>
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Education</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state?.education) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Family Income</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state.familyIncome)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs  font-medium">Religion</p>
                    <p className="font-semibold text-[13px] w-[80%] truncate">
                      {capitalizeFirstLetter(state.religion) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Language</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state.language) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Married</p>
                    <p className="font-semibold text-[13px]">{state.married || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Number of children</p>
                    <p className="font-semibold text-[13px]">{state.numberOfChildren || "--"}</p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Occupation</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state.occupation) || "--"}
                    </p>
                  </div>
                </div>

                {familyDetails.length > 0 && (
                  <h2 className="text-[10px] mt-8 font-medium uppercase">Family Details</h2>
                )}
                {familyDetails?.map((data: IFamilyDetails, index: number) => (
                  <div
                    key={data?._id}
                    className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4"
                  >
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Type</p>
                      <p className="font-semibold text-[13px]">
                        {data?.infoType.join(",") || "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Name</p>
                      <p className="font-semibold text-[13px]">
                        {data?.relationshipId?.shortName && data?.name
                          ? `${data?.relationshipId?.shortName} ${capitalizeFirstLetter(
                              data?.name
                            )}`
                          : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs  font-medium">Mobile no.</p>
                      <p className="font-semibold text-[13px] w-[80%] truncate">
                        {data?.phoneNumberCountryCode && data?.phoneNumber
                          ? `${data?.phoneNumberCountryCode} ${data?.phoneNumber}`
                          : "--"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Age</p>
                      <p className="font-semibold text-[13px]">{data?.age || "--"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">Address</p>
                      <p className="font-semibold text-[13px]">
                        {capitalizeFirstLetter(data?.address)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">ID Proof</p>
                      <p className="font-semibold text-[13px]">{data?.idProffType}</p>
                    </div>

                    <div>
                      <p className="text-gray-500 text-xs font-medium">ID Number</p>
                      <p className="font-semibold text-[13px]">{data?.idProffNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs font-medium">ID Proof</p>
                      {data?.idProofUrl ? (
                        <View
                          data={[
                            {
                              fileUrl: data?.idProofUrl,
                              filePath: "",
                              fileName: `${data?.idProffType || "id"}-${data?.name || "name"}`
                            }
                          ]}
                        />
                      ) : (
                        <p className="font-semibold text-[13px]">--</p>
                      )}
                    </div>
                    {familyDetails.length - 1 !== index && <hr className="col-span-4" />}
                  </div>
                ))}

                <hr className=" border-1 my-5" />
                <h2 className="text-[13px] font-bold">Admission Checklist</h2>
                <h2 className="text-[10px] font-medium uppercase">Checklist</h2>
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                  {/* <div>
                    <p className="text-gray-500 text-xs font-medium">Continuous admission form</p>
                    {(state?.applicationForAdmission ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.applicationForAdmission} />
                    )}
                  </div> */}
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Voluntry admission form</p>
                    {(state?.voluntaryAdmissionForm ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.voluntaryAdmissionForm} />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs  font-medium">Involuntary admission form</p>
                    {(state?.inVoluntaryAdmissionForm ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.inVoluntaryAdmissionForm} />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Minor admission form</p>
                    {(state?.minorAdmissionForm ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.minorAdmissionForm} />
                    )}
                  </div>
                  {/* <div>
                    <p className="text-gray-500 text-xs font-medium">Form 90</p>
                    {(state?.form90 ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.form90} />
                    )}
                  </div> */}
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Family declaration</p>
                    {(state?.familyDeclaration ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.familyDeclaration} />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Section 94</p>

                    {(state?.section94 ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.section94} />
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Capacity assessment</p>

                    {(state?.capacityAssessment ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.capacityAssessment} />
                    )}
                  </div>
                  {/* TODO: this will comment in sprint-5 */}
                  {/* <div>
                    <p className="text-gray-500 text-xs font-medium">Hospital guidelines form</p>
                    {(state?.hospitalGuidelineForm ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.hospitalGuidelineForm} />
                    )}
                  </div> */}
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Financial counselling</p>
                    {(state?.finacialCounselling ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.finacialCounselling} />
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Orientation of family Done</p>
                    <p className="font-semibold text-[13px]">{state.orientationOfFamily}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Orientation of patient Done</p>
                    <p className="font-semibold text-[13px]">{state.orientationOfPatient}</p>
                  </div>
                </div>
                <h2 className="text-[10px] mt-8 font-medium uppercase">Insurance</h2>
                <div className="grid sm:grid-cols-2 grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Insured</p>
                    <p className="font-semibold text-[13px]">{state.isInsured || "--"} </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Insured Details</p>
                    <p className="font-semibold text-[13px]">
                      {state.isInsured === "Yes"
                        ? capitalizeFirstLetter(state.insuredDetail)
                        : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Insured File</p>
                    {state.insuredFile.length <= 0 || state.isInsured !== "Yes" ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state.insuredFile} />
                    )}
                  </div>
                </div>
              </div>
              <div className="rounded-xl w-full col-start-1 col-span-3 flex flex-col gap-[13px] p-5 bg-white">
                <h1 className="text-[15px] font-bold">Medical Summary</h1>
                <h2 className="text-[10px] font-medium uppercase">Patient Assessment</h2>
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                  {state?.patientReport?.injuriesDetails?.map(
                    (data: IinjuriesDetails, index: number) => (
                      <div className="grid grid-cols-2 gap-x-10 gap-y-5 w-full col-span-2">
                        <div>
                          <p className="text-gray-500 text-xs font-medium">
                            Injury Details {index + 1}
                          </p>
                          <p className="font-semibold text-[13px]">
                            {capitalizeFirstLetter(data?.injuryName)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-medium">Files</p>
                          {(data?.fileUrls ?? []).length <= 0 ? (
                            <p className="font-semibold text-[13px]">--</p>
                          ) : (
                            <View data={data?.fileUrls} />
                          )}
                        </div>
                      </div>
                    )
                  )}
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Allergies</p>
                    <p className="font-semibold text-[13px] break-words whitespace-normal">
                      {state?.patientReport?.allergiesNames
                        ?.map((data: { name: string }) => data.name)
                        .join(", ") || "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Files</p>
                    {(state?.patientReport?.allergiesFiles ?? []).length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.patientReport?.allergiesFiles} />
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Diabetes Status</p>
                    <p className="font-semibold text-[13px]">
                      {state?.patientReport?.diabeticStatus || "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Hypertension</p>
                    <p className="font-semibold text-[13px]">
                      {state?.patientReport?.hyperTension || "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Heart Disease</p>
                    <p className="font-semibold text-[13px]">
                      {state?.patientReport?.heartDisease || "--"}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Heart Disease Detail</p>
                    <p
                      className={`font-semibold ${
                        isExpanded.heartDiseaseDetail ? "" : ""
                      } text-[13px] h-auto max-h-40`}
                    >
                      {isExpanded.heartDiseaseDetail
                        ? capitalizeFirstLetter(state?.patientReport?.heartDiseaseDescription) ||
                          "--"
                        : (
                            capitalizeFirstLetter(state?.patientReport?.heartDiseaseDescription) ||
                            "--"
                          ).slice(0, MAX_LENGTH) +
                          ((
                            capitalizeFirstLetter(state?.patientReport?.heartDiseaseDescription) ??
                            ""
                          ).length > MAX_LENGTH
                            ? "..."
                            : "")}
                    </p>

                    {(state?.patientReport?.heartDiseaseDescription ?? "").length > MAX_LENGTH && (
                      <button
                        className="text-blue-500 text-xs mt-1 cursor-pointer font-medium"
                        onClick={() => toggleExpand("heartDiseaseDetail")}
                      >
                        {isExpanded.heartDiseaseDetail ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Level of Risk</p>
                    <p className="font-semibold text-[13px]">
                      {state?.patientReport?.levelOfRisk || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Risk Details</p>
                    <p
                      className={`font-semibold ${
                        isExpanded.riskDetails ? "overflow-y-scroll" : ""
                      } text-[13px] h-auto max-h-40`}
                    >
                      {capitalizeFirstLetter(
                        isExpanded.riskDetails
                          ? state?.patientReport?.levelOfRiskDescription || "--"
                          : (state?.patientReport?.levelOfRiskDescription || "--").slice(
                              0,
                              MAX_LENGTH
                            ) +
                              ((state?.patientReport?.levelOfRiskDescription ?? "").length >
                              MAX_LENGTH
                                ? "..."
                                : "")
                      )}
                    </p>

                    {(state?.patientReport?.levelOfRiskDescription ?? "").length > MAX_LENGTH && (
                      <button
                        className="text-blue-500 text-xs mt-1 cursor-pointer font-medium"
                        onClick={() => toggleExpand("riskDetails")}
                      >
                        {isExpanded.riskDetails ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 text-xs font-medium">Illness Type</p>
                    <p className="font-semibold text-[13px]">{state.illnessType || "--"}</p>
                  </div>
                </div>

                <h2 className="text-[10px] font-medium uppercase">Vitals</h2>
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">B.P (mm Hg)</p>
                    <p className="font-semibold text-[13px]">{nurseData.bp || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Pulse (bpm)</p>
                    <p className="font-semibold text-[13px]">{nurseData.pulse || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Temperature (°F)</p>
                    <p className="font-semibold text-[13px]">{nurseData.temperature || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">SP02 (%)</p>
                    <p className="font-semibold text-[13px]">{nurseData.spo2 || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Weight (kg)</p>
                    <p className="font-semibold text-[13px]">{nurseData.weight || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">R.B.S (mg/dl)</p>
                    <p className="font-semibold text-[13px]">{nurseData.rbs || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Height (cm)</p>
                    <p className="font-semibold text-[13px]">{nurseData.height || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">BMI</p>
                    <p className="font-semibold text-[13px]">
                      {calculateBMI(nurseData.weight, nurseData.height) || "--"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs font-medium">Notes</p>
                    <p
                      className={`font-semibold ${
                        isExpanded.notes ? "overflow-y-scroll" : ""
                      } text-[13px] h-auto max-h-40`}
                      dangerouslySetInnerHTML={{
                        __html: isExpanded.notes
                          ? nurseData?.note || "--"
                          : (nurseData?.note || "--").slice(0, MAX_LENGTH) +
                            (nurseData?.note.length > MAX_LENGTH ? "..." : "")
                      }}
                    ></p>

                    {nurseData?.note.length > MAX_LENGTH && (
                      <button
                        className="text-blue-500 cursor-pointer text-xs mt-1 font-medium"
                        onClick={() => {
                          toggleExpand("notes");
                        }}
                      >
                        {isExpanded.notes ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs text-nowrap whitespace-nowrap font-medium">
                      Previous Treatment Record (Including Lab Test)
                    </p>
                    {(state?.patientReport?.previousTreatmentRecord ?? [])?.length <= 0 ? (
                      <p className="font-semibold text-[13px]">--</p>
                    ) : (
                      <View data={state?.patientReport?.previousTreatmentRecord} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 lg:col-span-1  sm:col-span-3 sm:col-start-1 h-fit col-start-3 grid lg:grid-cols-1 sm:grid-cols-1 gap-5">
              <div className="h-fit rounded-xl bg-white p-5 flex flex-col  items-start">
                <p className="text-[15px] font-bold mb-5">Resource Allocation</p>
                <p className="text-[13px] font-bold mb-5 uppercase">Assigned Resources</p>

                <div className="grid sm:grid-cols-2 grid-cols-1 w-full gap-5 md:grid-cols-2 lg:grid-cols-2">
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Center</p>
                    <p className="font-semibold text-[13px]">{state.center || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Room Type</p>
                    <p className="font-semibold text-[13px] ">{state.roomType || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Room No.</p>
                    <p className="font-semibold text-[13px]">{state?.room || "--"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Locker No</p>
                    <p className="font-semibold text-[13px]">{state?.lockerNo || "--"}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs font-medium">Belongings in Locker</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state?.belongingsInLocker) || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Doctor</p>
                    <p className="font-semibold text-[13px]">
                      {state?.assignedDoctor.trim() || "--"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium">Therapist</p>
                    <p className="font-semibold text-[13px]">
                      {state?.assignedTherapist.trim() || "--"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs font-medium">Nurse</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state.nurse) || "--"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs font-medium">Care Staff</p>
                    <p className="font-semibold text-[13px]">
                      {capitalizeFirstLetter(state?.careStaff?.trim()) || "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientProfile;

const View = ({ data }: { data?: { filePath: string; fileUrl: string; fileName?: string }[] }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("bottom");
  const viewref = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleState = () => {
    setOpen((prev) => !prev);
  };

  const handleClickOutside = (event: globalThis.MouseEvent) => {
    if (
      viewref.current &&
      !viewref.current.contains(event.target as Node) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (open && viewref.current && dropdownRef.current) {
      const viewRect = viewref.current.getBoundingClientRect();
      const dropdownHeight = dropdownRef.current.offsetHeight;
      const spaceBelow = window.innerHeight - viewRect.bottom;

      if (spaceBelow < dropdownHeight) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [open]);

  return (
    <div id="view" ref={viewref} className="relative">
      <div
        onClick={handleState}
        className="border-dashed mt-1 relative border-[#CAD2AA] px-3 py-1 w-fit min-h-4 rounded-[7px] bg-[#FAFFE2] border-2 flex items-start justify-center gap-1 cursor-pointer"
      >
        <img src={file} className="w-4" />
        <p className="text-xs font-medium">View</p>
      </div>

      {data && (
        <div
          ref={dropdownRef}
          className={`bg-gray-100 border  absolute z-20 border-gray-50 py-2 px-2 flex-col gap-2 rounded-xl shadow-xl ${
            open && data.length > 0 ? "flex" : "hidden"
          }`}
          style={{
            top: position === "bottom" ? "100%" : "auto",
            bottom: position === "top" ? "100%" : "auto",
            left: 0
          }}
        >
          {data.map((item, index) => (
            <div className="flex items-center justify-center w-full gap-2" key={index}>
              <div className="border-dashed w-[200px] cursor-default border-[#CAD2AA] px-3 py-2  text-nowrap whitespace-nowrap min-h-4 rounded-[7px] bg-[#FAFFE2] border-2 flex items-center gap-1">
                <img src={pdfFile} className="w-4" />
                <p className="text-xs font-bold truncate">
                  {item?.fileName ? item?.fileName : `file${index + 1}`}
                </p>
              </div>
              <a href={item.fileUrl} target="_blank" className="cursor-pointer">
                <GrView />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
