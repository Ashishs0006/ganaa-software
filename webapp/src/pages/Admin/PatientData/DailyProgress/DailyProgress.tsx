import { MouseEvent, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import pdfFile from "@/assets/images/pdfIcon.svg";
import calender from "@/assets/images/calender.svg";
import noDailyData from "@/assets/images/noProgress.png";

import {
  getSinglePatient,
  getPatientDailyProgress,
  getSinglePatientAdmissionHistory,
  getAllLoa,
  createLoa,
  deleteLoa
} from "@/apis";
import { Button, BreadCrumb, Pagination, DateRange, ConfirmMOdalLoa } from "@/components";

import { formatDate } from "@/utils/formater";
import { capitalizeFirstLetter, formatId } from "@/utils/formater";

import {
  IDailyProgress,
  IDailyProgressState,
  IMedicinesInfo,
  IUsages
} from "@/pages/Admin/PatientData/DailyProgress/types";
import { DailyProgressShimmer } from "@/components/Shimmer/Shimmer";
import moment from "moment";
import { calculateBMI } from "@/utils/calculateBMI";
import handleError from "@/utils/handleError";
import { useDispatch, useSelector } from "react-redux";
import { setloa } from "@/redux/slice/patientSlice";
import { RootState } from "@/redux/store/store";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import { BsFiletypePdf } from "react-icons/bs";
import DowloadDailyProgress from "./DowloadDailyProgress/DowloadDailyProgress";
// import { ShimmerPostDetails } from "react-shimmer-effects";

const DailyProgress = () => {
  const { id, aId } = useParams();
  const dispatch = useDispatch();

  const [searchParams, _setSearchParams] = useSearchParams();

  const [progressArray, setProgressArray] = useState<IDailyProgress[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const [state, setState] = useState<IDailyProgressState>({
    DateRangeModal: false,
    UHID: "",
    totalPage: "1",
    age: "",
    firstName: "",
    lastName: "",
    currentStatus: "",
    patientProfilePic: "",
    admissionDate: "",
    AssignedDoctor: "",
    AssignedTherapist: "",
    center: "",
    roomNumber: "",
    illnessType: "",
    TestReportFile: "",
    TestReportName: "",
    historyId: "",
    gender: ""
  });

  const fetchDailyProgress = async () => {
    if (id && aId) {
      setLoading(true);
      const page = searchParams.get("page") || "1";
      const { data } = await getSinglePatient(id);
      const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);

      setState({
        ...state,
        gender: data?.data?.gender || "",
        patientProfilePic: data?.data?.patientPicUrl || "",
        firstName: `${data?.data?.firstName}`.trim(),
        lastName: data?.data?.lastName?.trim() || "",
        UHID: data?.data?.uhid,
        age: data?.data?.age || "",
        admissionDate: patientAdmissionHistory?.data?.dateOfAdmission,
        currentStatus: patientAdmissionHistory?.data?.currentStatus,
        AssignedDoctor: `${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.firstName || ""
        } ${patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.lastName || ""}`,
        historyId: aId,
        AssignedTherapist: `${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.firstName || ""
        } ${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.lastName || ""
        }`,
        center: patientAdmissionHistory?.data?.resourceAllocation?.centerId?.centerName || "",
        roomNumber: patientAdmissionHistory?.data?.resourceAllocation?.roomNumberId?.name || "",
        illnessType: patientAdmissionHistory?.data?.illnessType || "",
        TestReportFile: patientAdmissionHistory?.data?.patientReport?.url || "",
        TestReportName: patientAdmissionHistory?.data?.patientReport?.fileName || ""
      });

      const { data: dailyData } = await getPatientDailyProgress(id, aId, {
        page,
        limit: 20,
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate")
      });
      setProgressArray(dailyData?.data);
      setState((prev) => ({ ...prev, totalPage: dailyData.pagination.totalPages }));

      setTimeout(() => {
        setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    fetchDailyProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    id,
    aId,
    searchParams.get("page"),
    searchParams.get("startDate"),
    searchParams.get("endDate")
  ]);

  const fetchLoa = async () => {
    try {
      const { data } = await getAllLoa({
        limit: 1,
        page: 1,
        sort: "-noteDateTime",
        patientAdmissionHistoryId: aId
      });
      if (data.status == "success") {
        const isSameDate = (createdAt: string) => {
          const date1 = new Date(createdAt);
          const date2 = new Date(); // current date

          return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
          );
        };
        if (isSameDate(data?.data[0]?.noteDateTime)) {
          const updateData = [{ docType: "loa", ...data?.data[0] }, ...progressArray];
          setProgressArray(updateData);
          dispatch(setloa({ loa: data?.data[0]?.loa, id: data?.data[0]?._id }));
        } else {
          progressArray.shift();
          setProgressArray(progressArray);

          dispatch(setloa({ loa: false, id: "" }));
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const createLoaFunction = async () => {
    const response = await createLoa({
      patientId: id,
      patientAdmissionHistoryId: aId
    });
    if (response?.status == 201) {
      fetchLoa();
    }
  };

  const deleteLoaFunction = async () => {
    const response = await deleteLoa(patientData.loa.id);
    if (response?.status == 200) {
      fetchLoa();
    }
  };

  useEffect(() => {
    fetchLoa();
  }, [id, aId]);

  const patientData = useSelector((store: RootState) => store.patient);

  const [open, setOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const viewref = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (viewref.current && !viewref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const handleState = () => {
    setOpen(!open);
  };

  return loading ? (
    <DailyProgressShimmer />
  ) : (
    <div id="dailyProgress" className="container h-[calc(100vh-64px)] px-8">
      <div className="flex justify-between w-full flex-row md:flex-wrap lg:flex-nowrap md:mb-5 lg:mb-0 md:items-center">
        <div className=" my-5  flex flex-col items-start">
          <BreadCrumb
            discharge={state.currentStatus == "Discharged"}
            name={`${capitalizeFirstLetter(
              state?.firstName.length > 15
                ? state?.firstName.slice(0, 15) + "..."
                : state?.firstName
            )} ${
              state?.lastName.trim()
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
          <div className=" text-[18px] font-bold my-2">Daily Progress</div>
        </div>

        <div className="flex text-xs h-full gap-5">
          {state.currentStatus !== "Discharged" && (
            <div className="flex text-xs h-full gap-5">
              <RBACGuard resource={RESOURCES.LOA} action="write">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <p className="text-sm font-semibold">LOA</p>
                  <input
                    checked={patientData?.loa?.loa}
                    onChange={() => {
                      setIsOpen(true);
                    }}
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                  />
                  <div className="relative w-[42px] h-[22px] ring-1 ring-[#9E9E9E]   peer-checked:after:bg-[#7C8E30]  rounded-full  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[1px] after:bg-[#656565] peer-checked:ring-[#D6DCB9]! peer-checked:bg-[#F9FFD9]! after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </RBACGuard>

              <Link
                to={`/admin/patients/in-patient/${id}/daily-progress/${aId}/doctor/notes`}
                className=" font-semibold px-3! py-2! text-nowrap whitespace-nowrap  text-[#575F4A] items-center flex   bg-[#F0F5DB]  rounded-[9px]!  border border-[#575F4A]"
              >
                Doctor Notes
              </Link>
              <Link
                to={`/admin/patients/in-patient/${id}/daily-progress/${aId}/therapist`}
                className=" font-semibold px-3! text-nowrap whitespace-nowrap py-2! items-center flex  bg-[#F0F5DB] text-[#575F4A] rounded-[9px]!  border border-[#575F4A]"
              >
                Therapist Notes
              </Link>
              <Link
                to={`/admin/patients/in-patient/${id}/daily-progress/${aId}/nurse`}
                className=" font-semibold px-3! py-2! text-nowrap whitespace-nowrap items-center flex  bg-[#F0F5DB] text-[#575F4A] rounded-[9px]!  border border-[#575F4A]"
              >
                RMO / Nurse Notes
              </Link>
              <Link
                to={`/admin/patients/in-patient/group-activity`}
                className=" font-semibold px-3! py-2! text-nowrap whitespace-nowrap  text-[#575F4A] items-center flex   bg-[#F0F5DB]  rounded-[9px]!  border border-[#575F4A]"
              >
                Group Activity
              </Link>
            </div>
          )}

          {/* <div className="flex text-xs h-full gap-5">
            <Button
              variant="outlined"
              className=" bg-white px-4! py-2! text-nowrap whitespace-nowrap text-black text-xs! rounded-[9px]!  border border-gray-300! flex items-center"
            >
              <SlPrinter size={12} /> Print
            </Button>
            <Button
              variant="outlined"
              className="px-4! py-2! bg-white text-xs! text-nowrap whitespace-nowrap text-black rounded-[9px]! border border-gray-300!"
            >
              View
            </Button>
          </div> */}
        </div>
      </div>
      <div className="w-full grid lg:grid-cols-3 h-full justify-between md:grid-cols-1">
        <div className="col-span-2  w-full h-full overflow-scroll scrollbar-hidden pb-8">
          <div
            className={`col-span-2  h-auto p-5 w-full  gap-6 flex items-start flex-col rounded-2xl bg-[#F4F2F0] border border-[#EBEBEB]`}
          >
            {(searchParams.get("startDate") || progressArray.length > 0) && (
              <div className="flex gap-4">
                <DateRange>
                  <Button
                    variant="outlined"
                    size="base"
                    className="flex bg-white text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                  >
                    <img src={calender} alt="calender" />
                    {searchParams.get("startDate")
                      ? `Date Range ${formatDate(searchParams.get("startDate"))} to ${formatDate(
                          searchParams.get("endDate")
                        )}`
                      : "Date Range"}
                  </Button>
                </DateRange>
                <DowloadDailyProgress
                  patientDetails={{
                    UHID: state.UHID || "",
                    dateOfAdmission: state.admissionDate || "",
                    age: state.age || "",
                    gender: state.gender || "",
                    lastName: state.lastName || "",
                    firstName: state.firstName || ""
                  }}
                  aid={aId}
                  id={id}
                  button={
                    <Button
                      type="submit"
                      variant="outlined"
                      size="base"
                      className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                    >
                      <BsFiletypePdf className="mr-2" size={18} />
                      Download All
                    </Button>
                  }
                />
              </div>
            )}
            {/* {loading && <ShimmerPostDetails card cta variant="SIMPLE" />} */}
            {!loading && progressArray.length > 0 ? (
              <div className=" w-full  gap-6 flex items-start flex-col">
                {progressArray.map((data: IDailyProgress) =>
                  data?.docType !== "doctor_prescriptions" ? (
                    <div
                      key={data?._id}
                      className="bg-white px-2 pt-2 pb-3 text-xs items-center gap-4 overflow-auto rounded-lg  flex flex-col  justify-center w-full"
                    >
                      <div
                        className={`flex w-full  bg-[#575F4A] rounded-lg justify-between items-center px-5 py-2`}
                      >
                        <div className={`font-semibold  text-white`}>
                          {data?.docType == "nurse"
                            ? "Nurse"
                            : data?.docType == "therapist"
                            ? `Therapist: ${data?.therapistId?.firstName} ${data?.therapistId?.lastName}`
                            : data?.docType == "loa"
                            ? "LOA"
                            : `Doctor: ${data?.doctorId?.firstName} ${data?.doctorId?.lastName}`}
                        </div>
                        <div className=" font-medium text-white">
                          {data?.docType == "loa"
                            ? data?.noteDateTime && formatDate(data?.noteDateTime)
                            : data?.noteDateTime && formatDate(data?.noteDateTime, "time")}
                        </div>
                      </div>
                      {data?.docType == "nurse" ? (
                        <div className="w-full px-5">
                          <div className=" grid   grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ">
                            <div>
                              <div className="font-medium text-gray-500">B.P (mm Hg)</div>
                              <div className="text-black font-semibold text-[13px]">
                                {data?.bp || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-500">Pulse (bpm)</div>
                              <div className="text-black font-semibold text-[13px]">
                                {data?.pulse || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-500">Temperature (°F)</div>
                              <div className="text-black font-semibold text-[13px]">
                                {data?.temperature || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-500">SPO2 (%)</div>
                              <div className="text-black font-semibold text-[13px]">
                                {data?.spo2 || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-500">Weight (kg)</div>
                              <div className="text-black font-semibold text-[13px]">
                                {data?.weight || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-500">R.B.S (mg/dl)</div>
                              <div className="text-black font-semibold text-[13px]">
                                {data?.rbs || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-500">Height (cm)</div>
                              <div className="text-black font-semibold text-[13px]">
                                {data?.height || "--"}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-gray-500">BMI</div>
                              <div className="text-black font-semibold text-[13px]">
                                {calculateBMI(data?.weight ?? "", data?.height ?? "") || "--"}
                              </div>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="font-medium text-gray-600">Notes</div>
                            {data?.note && (
                              <div
                                className="font-medium text-xs break-words text-black"
                                dangerouslySetInnerHTML={{ __html: data?.note }}
                              ></div>
                            )}
                          </div>
                        </div>
                      ) : data?.docType == "therapist" ? (
                        <div className="w-full grid px-5  grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 ">
                          {/* <div className="w-full px-5">
                        <div className="font-medium text-gray-600">Notes</div>
                        {data?.note && (
                          <div
                            className="font-medium text-xs break-words text-black"
                            dangerouslySetInnerHTML={{ __html: data?.note }}
                          ></div>
                        )}
                      </div> */}
                          <div>
                            <div className="font-medium text-gray-500">Session Type</div>
                            <div className="text-black font-semibold text-[13px]">
                              {(data?.sessionType && data?.sessionType?.join(", ")) || "--"}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-500">Sub Session Type</div>
                            <div className="text-black font-semibold text-[13px]">
                              {data?.subSessionType || "--"}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-500">Score</div>
                            <div className="text-black font-semibold text-[13px]">
                              {data?.score || "--"}
                            </div>
                          </div>
                          {/* <a href={data.file?.filePath}>
                            <div className="font-medium text-gray-500">File</div>
                            <div className="text-black font-semibold text-[13px]">
                              {data?.file?.fileName || "--"}
                            </div>
                          </a> */}
                          <div>
                            <div className="font-medium text-gray-500">File</div>
                            {data.file?.fileName ? (
                              <div
                                id="view"
                                ref={viewref}
                                className=" relative py-1 text-nowrap whitespace-nowrap"
                              >
                                <div
                                  onClick={handleState}
                                  className="border-dashed cursor-pointer relative border-[#CAD2AA] px-2 py-1 w-fit min-h-4 rounded-[7px] bg-[#FAFFE2] border-2  flex items-start justify-center gap-1"
                                >
                                  <img src={pdfFile} className="w-4" />
                                  <p className="text-xs font-bold">View</p>
                                </div>
                                {data.file?.fileName && (
                                  <a
                                    href={data.file?.url}
                                    className={`bg-gray-100 cursor-pointer border absolute z-20 border-gray-50 py-1 px-2 ${
                                      open ? "flex" : "hidden"
                                    } flex-col gap-2 w-fit rounded-xl  shadow-xl`}
                                  >
                                    <div className="py-1  w-60 text-nowrap whitespace-normal pl-2 pr-10  flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative">
                                      <a
                                        target="_blank"
                                        href={data.file?.url}
                                        className="flex gap-2 w-full items-center justify-center"
                                      >
                                        <div className=" w-[30px] h-[30px]  flex items-center overflow-hidden justify-center">
                                          <img src={pdfFile} alt="file" className="w-full h-full" />
                                        </div>
                                        <div className="w-full truncate">
                                          <p
                                            title={data.file?.fileName}
                                            className="ml-5 w-[80%] truncate"
                                          >
                                            {data.file?.fileName || ""}
                                          </p>
                                        </div>
                                      </a>
                                    </div>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <div className="text-black font-semibold text-[13px]">--</div>
                            )}
                          </div>
                          <div className="col-span-3">
                            <div className="font-medium text-gray-500">Notes</div>
                            {data?.note && (
                              <div
                                className="font-medium text-xs break-words text-black"
                                dangerouslySetInnerHTML={{ __html: data?.note }}
                              ></div>
                            )}
                          </div>
                        </div>
                      ) : data?.docType == "loa" ? (
                        <div className="w-full grid px-5   grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 ">
                          {/* <div className="w-full col-span-3">
                            <div className="font-medium text-gray-600">LOA</div>
                            true
                          </div> */}
                        </div>
                      ) : (
                        <div className="w-full grid px-5   grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4 ">
                          <div className="w-full col-span-3">
                            <div className="font-medium text-gray-500">Session Type</div>
                            <div className="text-black font-semibold text-[13px]">
                              {(data?.sessionType && data?.sessionType.join(", ")) || "--"}
                            </div>
                          </div>
                          <div className="w-full col-span-3">
                            <div className="font-medium text-gray-600">Notes</div>
                            {data?.note && (
                              <div
                                className="font-medium text-xs break-words text-black"
                                dangerouslySetInnerHTML={{ __html: data?.note }}
                              ></div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <DoctorPrescription doctordata={data} />
                  )
                )}

                <div className="flex items-center justify-end w-full">
                  <Pagination totalPages={state.totalPage} />
                </div>
              </div>
            ) : (
              <div className="col-span-2 w-full p-4  gap-4 flex items-center h-full justify-center flex-col rounded-2xl bg-[#F4F2F0]">
                <img className=" mb-[33px] w-[20%]" src={noDailyData} />
                <p className="font-bold text-2xl">No Progress Update Recorded Yet</p>
                <p className="font-medium text-xs text-[#505050] w-[420px] text-wrap text-center">
                  The patient's daily progress has not been documented. Maintain an accurate medical
                  history by adding updates.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="w-full col-span-1 pl-5 flex  flex-col h-fit  gap-5">
          <div className="h-fit border border-[#EBEBEB] w-full rounded-xl bg-white p-4">
            <div className="flex mb-3 gap-2  items-start py-4 ">
              <div
                className={`flex rounded-full  border-2 
                     ${
                       state?.gender == "Male"
                         ? "border-[#00685F]"
                         : state?.gender == "Female"
                         ? "border-[#F14E9A]"
                         : "border-gray-500"
                     }  
                   overflow-hidden w-16 h-16 items-center justify-center`}
              >
                <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                  {state?.patientProfilePic ? (
                    <img src={state?.patientProfilePic} alt="profile" className="w-full h-full" />
                  ) : (
                    <div className="w-full flex text uppercase text font-semibold text-[#575F4A] items-center justify-center">
                      {state?.firstName?.slice(0, 1)}
                      {state?.lastName?.slice(0, 1)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-start">
                  <h2
                    title={`${state.firstName.trim()} ${state.lastName.trim()}`}
                    className="text-[13px] font-semibold text-left text-wrap"
                  >
                    {state.firstName &&
                      capitalizeFirstLetter(
                        state?.firstName.length > 15
                          ? state?.firstName.slice(0, 15) + "..."
                          : state?.firstName
                      )}{" "}
                    {state.lastName.trim() &&
                      capitalizeFirstLetter(
                        state?.lastName?.length > 15
                          ? state?.lastName?.slice(0, 15) + "..."
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
                <div className="text-xs text-gray-600">
                  <span>Admission Date:</span>
                  <span className="font-medium ml-1 text-black">
                    {state?.admissionDate && formatDate(state?.admissionDate)}
                  </span>
                  <p className="text-xs text-gray-600">
                    UHID:
                    <span className="font-medium ml-1 text-nowrap whitespace-nowrap text-black">
                      {formatId(state?.UHID)}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <h1 className="mb-6 text-xs font-bold">Assigned Resources</h1>
            <div className="grid sm:grid-cols-2 grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2 lg:grid-cols-2">
              <div>
                <p className="text-gray-500 text-xs">Assigned Doctor</p>
                <p className="font-semibold text-xs">{state?.AssignedDoctor.trim() || "--"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Assigned Therapist</p>
                <p className="font-semibold text-xs">{state?.AssignedTherapist.trim() || "--"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Center</p>
                <p className="font-semibold text-xs">{state?.center || "--"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Room</p>
                <p className="font-semibold text-xs">{state?.roomNumber || "--"}</p>
              </div>
            </div>
          </div>
          <div className="h-fit border w-full border-[#EBEBEB] rounded-xl bg-white p-6">
            <div>
              <p className="text-gray-500 text-xs mb-2 font-medium">Illness Type</p>
              <p className="font-semibold text-xs">{state?.illnessType || "--"}</p>
            </div>
          </div>
        </div>
      </div>
      <ConfirmMOdalLoa
        heading={"Are you Sure?"}
        subHeading={
          patientData.loa.loa
            ? "This action will mark the patient as present and remove their leave status immediately."
            : "Once this action is enabled, the patient will be marked as absent for today. The status will automatically reset by 12:00 AM tomorrow."
        }
        btnOneName={"Cancel"}
        btnTwoName={patientData.loa.loa ? "Yes, Mark as Present" : "Yes, Mark as Absent"}
        btnTwoFunction={() => {
          if (patientData.loa.loa) {
            deleteLoaFunction();
          } else {
            createLoaFunction();
          }
          setIsOpen(!isOpen);
        }}
        toggleOpen={() => {
          setIsOpen(!isOpen);
        }}
        isOpen={isOpen}
      />
    </div>
  );
};

// we not use in sprint-2
const DoctorPrescription = ({ doctordata }: { doctordata: IDailyProgress }) => {
  return (
    <div className="bg-white px-2  pt-2 pb-3 text-xs items-center gap-4 overflow-auto rounded-lg  flex flex-col  justify-center w-full">
      <div className=" bg-[#575F4A] rounded-lg justify-between items-center flex w-full px-5 py-2">
        <div className="font-medium text-white">
          Doctor:{" "}
          <span className="font-semibold">
            {`${doctordata?.doctorId?.firstName} ${doctordata?.doctorId?.lastName || ""}`}
          </span>
        </div>
        <div className="font-medium text-white">
          {doctordata?.noteDateTime && formatDate(doctordata?.noteDateTime, "time")}
        </div>
      </div>
      {doctordata?.medicinesInfo &&
        doctordata?.medicinesInfo.map((data: IMedicinesInfo, index) => (
          <div className="w-full">
            <div className="px-4 grid grid-cols-2 lg:grid-col-4 md:grid-cols-4 gap-2 text-nowrap whitespace-nowrap">
              <div>
                <div className="text-gray-500 font-semibold">Medicine</div>
                <div className="font-semibold text-black  text-wrap whitespace-wrap">
                  {data?.medicine?.name || "--"}
                </div>
              </div>
              <div>
                <div className=" text-gray-500 font-semibold">Duration</div>
                <div className="font-semibold text-black">
                  {data?.customDuration && data?.durationFrequency === "Custom Date"
                    ? data?.customDuration
                        .split("|")
                        .map((d) => moment(d).format("D MMMM"))
                        .join(" to ")
                    : data?.durationFrequency || "--"}
                </div>
              </div>
              <div>
                <div className=" text-gray-500 font-semibold">Prescribed When</div>
                <div className="font-semibold text-black">{data?.prescribedWhen || "--"}</div>
              </div>
              <div>
                <div className=" text-gray-500 font-semibold">Frequency/Routine/Dosage</div>
                <div className="flex items-center flex-wrap gap-2">
                  {data?.usages.map((data: IUsages) => (
                    <span className="bg-[#ECF3CA] mr-1 text-black  px-1 py-[2px] rounded-[10px] border-[#C9D686] border">
                      <span className="font-medium text-[11px">{data?.frequency}</span>,{" "}
                      {data?.dosage} , {data?.when}
                      <span className="text-center text-xs  px-1 rounded-full text-white bg-[#808a4c] ml-2">
                        {data?.quantity}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full px-5">
              <div className="font-medium text-gray-600">Instructions</div>
              <div className="font-medium text-xs break-words text-black">
                {data?.instructions || "--"}
              </div>
            </div>
            {(doctordata?.medicinesInfo && doctordata?.medicinesInfo?.length - 1) !== index && (
              <hr className="my-2" />
            )}
          </div>
        ))}
    </div>
  );
};

export default DailyProgress;
