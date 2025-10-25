import { useState, useEffect, useRef, SyntheticEvent, MouseEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { GoArrowSwitch } from "react-icons/go";
import { MdKeyboardArrowRight } from "react-icons/md";

import { RootState } from "@/redux/store/store";
import { setAllPatient } from "@/redux/slice/patientSlice";

import { createDischarge, getAllPatient } from "@/apis";
import { EmptyPage, Pagination, Input, Modal, Select, CustomCalendar, Sort } from "@/components";

import calender from "@/assets/images/calender.svg";
import kabab from "@/assets/images/kebab-menu.svg";
import caseHistory from "@/assets/images/caseStudyIcon.svg";
import discharge from "@/assets/images/discharge.svg";

import { capitalizeFirstLetter, formatDate, formatId } from "@/utils/formater";
import { IPatient, IDischargeState, IState } from "@/pages/Admin/PatientData/InpatientData/types";
import moment from "moment";
// import handleError from "@/utils/handleError";
import { TableShimmer } from "@/components/Shimmer/Shimmer";
import { DischargeValidation } from "@/validations/Yup/DischargeValidation";
import Search from "@/components/Search/Search";
import Filter from "@/components/Filter/Filter";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import { convertDate } from "@/components/BasicDetaills/utils";
import { RBACGuardArray } from "@/components/RBACGuard/RBACGuardArray";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import { LuFileText } from "react-icons/lu";
import Filtered from "@/components/Filtered/Filtered";
import { FaRegUser } from "react-icons/fa";
// import { ShimmerTable } from "react-shimmer-effects";

const InpatientData = () => {
  const [searchParams] = useSearchParams();

  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { auth } = useAuth();

  const [previousTreatMentRecord, setPreviousTreatMentRecord] = useState<
    { filePath: string; fileUrl: string; fileName?: string }[]
  >([]);

  const [displayModal, setDisplayModal] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<IState>({
    openMenuId: null,
    loading: false,
    loadingSearch: false,
    toggleDischargeModal: false
  });

  const [dischargeState, setDischargeState] = useState<IDischargeState>({
    pid: "",
    aid: "",
    date: "",
    status: { value: "", label: "Select" },
    reason: "",
    conditionAtTheTimeOfDischarge: { value: "", label: "Select" },
    shouldSendfeedbackNotification: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const patientData = useSelector((store: RootState) => store.patient);

  const fetchAllPatient = async () => {
    let centers;
    const selected = searchParams.get("filter") || "All";
    if (selected === "All" || selected) {
      centers = auth.user.centerId.map((data: { _id: string }) => data._id);
      if (centers.length <= 0) navigate("/");
    } else {
      centers = [selected];
    }
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-createdAt";

    setState((prev) => ({
      ...prev,
      loading: true
    }));

    try {
      const response = await getAllPatient({
        limit: patientData.allPatient.pagination.limit,
        sort: sort,
        page: currentPage,
        status: "Inpatient,Discharge Initiated",
        centers: centers.join(","),
        ...(searchParams.get("admissionType") && {
          admissionType: searchParams.get("admissionType")
        }),
        ...(searchParams.get("illnessType") && { illnessType: searchParams.get("illnessType") }),
        ...(searchParams.get("gender") && { gender: searchParams.get("gender") }),
        ...(searchParams.get("hyperTension") && { hyperTension: searchParams.get("hyperTension") }),
        ...(searchParams.get("heartDisease") && { heartDisease: searchParams.get("heartDisease") }),
        ...(searchParams.get("levelOfRisk") && { levelOfRisk: searchParams.get("levelOfRisk") }),
        ...(searchParams.get("leadType") && {
          leadType: searchParams.get("leadType")
        }),
        ...(searchParams.get("search") && { searchField: "firstName,lastName" }),
        ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
      });

      dispatch(setAllPatient(response?.data));
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          loading: false
        }));
      }, 500);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false
      }));
      console.error("Error fetching patients:", err);
      throw new Error("Failed to fetch patient data");
    }
  };
  const fetchAllPatientFilter = async () => {
    let centers;
    const selected = searchParams.get("filter") || "All";
    if (selected === "All" || !selected) {
      centers = auth.user.centerId.map((data: { _id: string }) => data._id);
      if (centers.length <= 0) navigate("/");
    } else {
      centers = [selected];
    }
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-createdAt";

    try {
      const response = await getAllPatient({
        limit: patientData.allPatient.pagination.limit,
        sort: sort,
        page: currentPage,
        status: "Inpatient,Discharge Initiated",
        centers: centers.join(","),
        ...(searchParams.get("admissionType") && {
          admissionType: searchParams.get("admissionType")
        }),
        ...(searchParams.get("illnessType") && { illnessType: searchParams.get("illnessType") }),
        ...(searchParams.get("gender") && { gender: searchParams.get("gender") }),
        ...(searchParams.get("hyperTension") && { hyperTension: searchParams.get("hyperTension") }),
        ...(searchParams.get("heartDisease") && { heartDisease: searchParams.get("heartDisease") }),
        ...(searchParams.get("levelOfRisk") && { levelOfRisk: searchParams.get("levelOfRisk") }),
        ...(searchParams.get("leadType") && {
          leadType: searchParams.get("leadType")
        }),
        ...(searchParams.get("search") && { searchField: "firstName,lastName" }),
        ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
      });

      dispatch(setAllPatient(response?.data));
    } catch (err) {
      console.error("Error fetching patients:", err);
      throw new Error("Failed to fetch patient data");
    }
  };

  useEffect(() => {
    fetchAllPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    fetchAllPatientFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get("page"),
    searchParams.get("sort"),
    searchParams.get("filter"),
    searchParams.get("gender"),
    searchParams.get("admissionType"),
    searchParams.get("illnessType"),
    searchParams.get("hyperTension"),
    searchParams.get("heartDisease"),
    searchParams.get("levelOfRisk"),
    searchParams.get("leadType")
  ]);

  useEffect(() => {
    let centers;
    const selected = searchParams.get("filter") || "All";
    if (selected === "All" || !selected) {
      centers = auth.user.centerId.map((data) => data._id);
      if (centers.length <= 0) navigate("/");
    } else {
      centers = [selected];
    }
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-createdAt";

    setState((prev) => ({
      ...prev,
      loadingSearch: true
    }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (controllerRef.current) controllerRef.current.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await getAllPatient(
          {
            limit: patientData.allPatient.pagination.limit,
            sort: sort,
            page: currentPage,
            status: "Inpatient,Discharge Initiated",
            centers: centers.join(","),
            ...(searchParams.get("admissionType") && {
              admissionType: searchParams.get("admissionType")
            }),
            ...(searchParams.get("illnessType") && {
              illnessType: searchParams.get("illnessType")
            }),
            ...(searchParams.get("gender") && { gender: searchParams.get("gender") }),
            ...(searchParams.get("hyperTension") && {
              hyperTension: searchParams.get("hyperTension")
            }),
            ...(searchParams.get("heartDisease") && {
              heartDisease: searchParams.get("heartDisease")
            }),
            ...(searchParams.get("levelOfRisk") && {
              levelOfRisk: searchParams.get("levelOfRisk")
            }),
            ...(searchParams.get("leadType") && {
              leadType: searchParams.get("leadType")
            }),
            ...(searchParams.get("search") && { searchField: "firstName,lastName" }),
            ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
          },
          undefined,
          controller.signal
        );

        dispatch(setAllPatient(response?.data));
        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            loadingSearch: false
          }));
        }, 500);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loadingSearch: false
        }));
        if (
          (typeof err === "object" &&
            err !== null &&
            "name" in err &&
            (err as { name?: string }).name === "CanceledError") ||
          (err as { name?: string }).name === "AbortError"
        ) {
          console.log("Request was canceled");
        } else {
          console.error(err);
        }
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchParams.get("search")]);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setState((prev) => ({
        ...prev,
        openMenuId: null
      }));
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const toggleMenu = (_e: SyntheticEvent, id: string) => {
    setState((prev) => ({
      ...prev,
      openMenuId: state.openMenuId === id ? null : id
    }));
  };

  const updateDischargeState = (e: SyntheticEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    setDischargeState((prev) => ({ ...prev, [name]: value }));
  };

  const handleDischarge = async (_e: SyntheticEvent) => {
    try {
      await DischargeValidation.validate(dischargeState, { abortEarly: false });
      setErrors({});
      const body = {
        date: new Date(`${dischargeState.date} ${moment().format("HH:mm")}`).toISOString(),
        status: dischargeState.status.value,
        reason: dischargeState.reason,
        conditionAtTheTimeOfDischarge: dischargeState.conditionAtTheTimeOfDischarge.value,
        shouldSendfeedbackNotification: dischargeState.shouldSendfeedbackNotification
      };

      // Remove keys with empty string, null, or undefined values
      const cleanedBody = Object.fromEntries(
        Object.entries(body).filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined
        )
      );
      const response = await createDischarge(dischargeState.pid, dischargeState.aid, cleanedBody);
      if (response && response?.status === 201) {
        if (response.data.data.patientId && response?.data?.data?.patientAdmissionHistoryId)
          navigate(
            `/admin/patients/in-patient/${response?.data?.data?.patientId}/discharge/${response?.data?.data?.patientAdmissionHistoryId}`
          );
      }
    } catch (error) {
      if (error instanceof Error && "inner" in error) {
        const validationErrors: Record<string, string> = {};
        const validationErrorArray = error.inner as Array<{ path: string; message: string }>;
        validationErrorArray.forEach((e) => {
          if (e.path && !validationErrors[e.path]) {
            validationErrors[e.path] = e.message;
          }
        });
        setErrors(validationErrors); // ✅ Set the errors in the state
      }
      console.log(error, "Error");
      // handleError(error);
    }
  };

  return (
    <div id="inPatientData" className="bg-center    w-full bg-cover bg-no-repeat">
      {state.loading && (
        <div className="container gap-6 flex-col  flex items-start w-full p-4">
          <div className="flex justify-between items-end w-full"></div>
          <div className="font-semibold text-xs w-full min-h-screen text-nowrap whitespace-nowrap  overflow-x-auto scrollbar-hidden">
            <div className="w-full text-sm text-left ">
              <TableShimmer rows={10} columns={10} />
            </div>
          </div>
        </div>
      )}

      {!state.loading ? (
        <div className="container  gap-6 flex-col  flex items-start w-full p-4">
          <div className="flex  top-[64px] py-2  z-40  bg-white justify-between items-end w-full">
            <div className="flex flex-col gap-2">
              <p className="text-[22px] font-bold">
                InPatient Data
                <span className="text-sm ml-3 font-medium text-[#7B7B7B]">
                  Total {patientData?.allPatient?.pagination?.totalDocuments}
                </span>
              </p>
              <p className="text-xs text-wrap font-medium text-[#505050]">
                Access and manage comprehensive patient records with actionable insights for
                seamless operations
              </p>
            </div>
            <div className="flex items-center text-nowrap! whitespace-nowrap justify-center gap-2">
              <Search />

              <Sort
                value={[
                  { title: "First Name", value: "firstName" },
                  { title: "Last Name", value: "lastName" },
                  { title: "Created At", value: "createdAt" },
                  { title: "UHID", value: "uhid" }
                ]}
              />
              <Filtered />
              <Filter />
            </div>
          </div>

          {/* <div className="font-semibold text-xs w-full h-screen   text-nowrap whitespace-nowrap  overflow-x-auto scrollbar-hidden"> */}
          <div className="w-full  h-[calc(100vh - 64px - 40px)] text-nowrap! whitespace-nowrap!">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#E9E8E5] w-full   py-2">
                <tr className="text-[#505050] text-xs w-full font-medium">
                  <th className="pl-3 py-3 w-fit">S.No.</th>
                  <th className="px-[30px] py-3 w-fit">Name</th>
                  <th className="py-3 pr-[100px]">UHID</th>
                  <th className="py-3 pr-[92px]">Admission Date</th>
                  <th className="py-3 pr-[92px]">Gender</th>
                  <th className="py-3 pr-[92px]">DOB / Age</th>
                  <th className="py-3 pr-[92px]">Center</th>
                  <th className="py-3 pr-[92px]">Room Type/ No.</th>

                  <th className="py-3 ">Action</th>
                </tr>
              </thead>
              {patientData?.allPatient?.data?.length > 0 ? (
                <tbody className="bg-white w-full h-full">
                  {patientData?.allPatient?.data.map((patient: IPatient, index: number) => (
                    <tr
                      //  onContextMenu={(e: SyntheticEvent) => {
                      //     toggleMenu(e, patient?._id);
                      //   }}
                      onContextMenu={(e: SyntheticEvent) => {
                        e.preventDefault();
                        toggleMenu(e, patient?._id);
                      }}
                      key={patient?._id}
                      className="hover:bg-[#F6F6F6C7] border-b border-[#DCDCDCE0]"
                    >
                      <td className="pl-[10px] py-3">
                        {(
                          (+(searchParams.get("page") || 1) - 1) *
                            +patientData.allPatient.pagination.limit +
                          1 +
                          index
                        ).toString().length === 1
                          ? `0${
                              (+(searchParams.get("page") || 1) - 1) *
                                +patientData.allPatient.pagination.limit +
                              1 +
                              index
                            }`
                          : `${
                              (+(searchParams.get("page") || 1) - 1) *
                                +patientData.allPatient.pagination.limit +
                              1 +
                              index
                            }`}
                      </td>

                      <td className="px-[27px] py-3 flex items-center gap-2">
                        <div
                          className={`flex rounded-full  border-2 ${
                            patient?.gender == "Male"
                              ? "border-[#00685F]"
                              : patient?.gender == "Female"
                              ? "border-[#F14E9A]"
                              : "border-gray-500"
                          }   overflow-hidden w-[50px] h-[50px] items-center justify-center`}
                        >
                          <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                            {patient?.patientPicUrl ? (
                              <img
                                src={patient?.patientPicUrl}
                                alt="profile"
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="uppercase">
                                {patient?.firstName?.slice(0, 1)}
                                {patient?.lastName?.slice(0, 1)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-start flex-col">
                          <p
                            className="text-xs font-semibold"
                            title={patient?.firstName + patient?.lastName}
                          >
                            {capitalizeFirstLetter(
                              patient?.firstName?.length > 15
                                ? patient?.firstName.slice(0, 15) + "..."
                                : patient?.firstName
                            )}{" "}
                            {patient?.lastName
                              ? capitalizeFirstLetter(
                                  patient?.lastName?.length > 15
                                    ? patient?.lastName.slice(0, 15) + "..."
                                    : patient?.lastName
                                )
                              : ""}
                          </p>

                          {patient?.patientHistory?.currentStatus && (
                            <div
                              className={`${
                                patient?.patientHistory?.currentStatus == "Inpatient"
                                  ? "text-[#3A913D] bg-[#E4FFEE]"
                                  : "bg-gray-200"
                              } w-fit rounded-[5px]  gap-1 text-[10px] font-semibold px-[5px] py-[3px] flex items-center`}
                            >
                              {patient?.patientHistory?.currentStatus !== "Discharged" && (
                                <div
                                  className={`  ${
                                    patient?.patientHistory?.currentStatus == "Inpatient"
                                      ? "bg-[#3A913D]"
                                      : "bg-black"
                                  } w-1 h-1 bg-black" rounded-full`}
                                ></div>
                              )}
                              <p>{patient?.patientHistory?.currentStatus}</p>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3   font-medium">{formatId(patient?.uhid)}</td>

                      <td className="py-3  pr-[92px] font-medium">
                        {(patient?.patientHistory?.dateOfAdmission &&
                          formatDate(patient?.patientHistory?.dateOfAdmission)) ||
                          "--"}
                      </td>
                      <td className="py-3 pr-[92px] font-medium">{patient?.gender || "--"}</td>

                      <td className="py-3  pr-[92px] font-medium">
                        {patient?.dob ? `${formatDate(patient?.dob)}` : patient?.age}
                      </td>

                      <td className="py-3  pr-[92px] font-medium">
                        {patient?.patientHistory?.resourceAllocation?.centerId?.centerName
                          ? patient?.patientHistory?.resourceAllocation?.centerId?.centerName
                          : "--"}
                      </td>
                      <td className="py-3  pr-[92px] font-medium">
                        {patient?.patientHistory?.resourceAllocation?.roomTypeId?.name
                          ? `${patient?.patientHistory?.resourceAllocation?.roomTypeId?.name} / ${patient?.patientHistory?.resourceAllocation?.roomNumberId?.name}`
                          : "--"}
                      </td>

                      <td className="py-3 pr-3 font-medium ">
                        <div className="w-full text-nowrap whitespace-nowrap flex items-center gap-3">
                          <RBACGuard resource={RESOURCES.DAILY_PROGRESS} action="read">
                            <Link
                              to={`/admin/patients/in-patient/${patient?._id}/daily-progress/${patient?.patientHistory?._id}`}
                              className="px-[9px] py-[7px] flex items-center cursor-pointer text-xs rounded-lg border border-[#DEDEDE] hover:border-[#636363]"
                            >
                              <p>Daily Progress</p>
                              <MdKeyboardArrowRight size={15} />
                            </Link>
                          </RBACGuard>
                          <RBACGuardArray
                            resource={[
                              { resource: `${RESOURCES.NEW_REGISTRATION}`, action: "write" },
                              { resource: `${RESOURCES.CASE_HISTORY}`, action: "read" },
                              { resource: `${RESOURCES.DISCHARGE}`, action: "read" }
                            ]}
                          >
                            <div
                              onClick={(e: SyntheticEvent) => toggleMenu(e, patient?._id)}
                              className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-lg hover:bg-[#D4E299] cursor-pointer"
                            >
                              <img alt="icon" src={kabab} className="w-full h-full" />
                              {state.openMenuId === patient?._id && (
                                <div
                                  ref={menuRef}
                                  className={`absolute text-nowrap whitespace-nowrap right-4 ${
                                    index <= 1 || index >= patientData?.allPatient?.data?.length
                                      ? "top-0"
                                      : "bottom-0"
                                  } overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-xl z-10 flex items-center justify-center`}
                                >
                                  <div className="p-2  text-nowrap whitespace-nowrap gap-2 flex-col flex justify-center items-start bg-white shadow-lg rounded-lg w-fit">
                                    {patient?.patientHistory?.patientReport?.previousTreatmentRecord
                                      ?.length > 0 ? (
                                      <div
                                        onClick={() => {
                                          setPreviousTreatMentRecord(
                                            patient?.patientHistory?.patientReport
                                              ?.previousTreatmentRecord
                                          );
                                          setDisplayModal(true);
                                        }}
                                        className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap"
                                      >
                                        <div className="flex items-center gap-2 cursor-pointer">
                                          <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                            <LuFileText />
                                          </div>
                                          <div>
                                            <p className="">View Test Report</p>
                                            <p className="text-xs text-[#636363]">
                                              Check Test Report
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        onClick={() => {
                                          toast.error("No Medical Record Found");
                                        }}
                                        className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap"
                                      >
                                        <div className="flex items-center gap-2 cursor-pointer">
                                          <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                            <LuFileText />
                                          </div>
                                          <div>
                                            <p className="">View Test Report</p>
                                            <p className="text-xs text-[#636363]">
                                              Check Test Report
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                    <hr className="w-full" />

                                    {patient?.patientHistory?.currentStatus != "Discharged" && (
                                      <Link
                                        to={`/admin/patients/all-patient/${patient?._id}/profile/${patient?.patientHistory?._id}`}
                                        className="text-xs cursor-pointer font-semibold p-2 "
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                            <FaRegUser />
                                          </div>
                                          <div>
                                            <p>View Profile</p>
                                            <p className="text-xs text-[#636363]">
                                              Check patient details
                                            </p>
                                          </div>
                                        </div>
                                      </Link>
                                    )}
                                    <hr className="w-full" />

                                    <RBACGuard resource={RESOURCES.NEW_REGISTRATION} action="write">
                                      <>
                                        <div className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap">
                                          <Link
                                            to={`/admin/update-patient/${patient?._id}/${patient?.patientHistory?._id}?resource=2`}
                                            className="flex items-center gap-2 cursor-pointer"
                                          >
                                            <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center">
                                              <GoArrowSwitch />
                                            </div>
                                            <div>
                                              <p>Change Resources</p>
                                              <p className="text-xs text-[#636363]">
                                                Center, Bed, & More
                                              </p>
                                            </div>
                                          </Link>
                                        </div>
                                        <hr className="w-full" />
                                      </>
                                    </RBACGuard>
                                    <RBACGuard resource={RESOURCES.CASE_HISTORY} action="read">
                                      <>
                                        <Link
                                          to={`/admin/patients/in-patient/${patient?._id}/case-history/${patient?.patientHistory?._id}`}
                                          className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap"
                                        >
                                          <div className="flex items-center gap-2 cursor-pointer">
                                            <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                              <img src={caseHistory} alt="icon" />
                                            </div>
                                            <div>
                                              <p>Case History</p>
                                              <p className="text-xs text-[#636363]">
                                                Update Patients details
                                              </p>
                                            </div>
                                          </div>
                                        </Link>
                                        <hr className="w-full" />
                                      </>
                                    </RBACGuard>

                                    <RBACGuard resource={RESOURCES.DISCHARGE} action="read">
                                      <div
                                        onClick={() => {
                                          if (patient?.patientHistory?.dischargeId) {
                                            navigate(
                                              `/admin/patients/in-patient/${patient?._id}/discharge/${patient?.patientHistory?._id}`
                                            );
                                          } else {
                                            setState((prev) => ({
                                              ...prev,
                                              toggleDischargeModal: !state.toggleDischargeModal
                                            }));
                                            setDischargeState((prev) => ({
                                              ...prev,
                                              pid: patient._id,
                                              aid: patient.patientHistory._id
                                            }));
                                          }
                                        }}
                                        className="text-xs cursor-pointer font-semibold p-2 "
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                            <img src={discharge} alt="discharge" />
                                          </div>
                                          <div>
                                            <p className="">Discharge</p>
                                            <p className="text-xs text-[#636363]">
                                              Initate Discharge Form
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    </RBACGuard>
                                  </div>
                                </div>
                              )}
                            </div>
                          </RBACGuardArray>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={10} className="text-center">
                      <EmptyPage
                        links="/admin/registration"
                        buttonText="Register Patient"
                        title="No Record Found"
                        subtitle=" There are no patient with this search criteria."
                      />
                    </td>
                  </tr>
                </tbody>
              )}
            </table>

            <Pagination totalPages={patientData.allPatient.pagination.totalPages} />
          </div>
        </div>
      ) : (
        !state.loading && (
          <EmptyPage
            links="/admin/registration"
            buttonText="Register Patient"
            title="No Patient Data"
            subtitle=" There are no patient records in the system yet. Start by adding a new patient."
          />
        )
      )}

      <Modal
        isOpen={state.toggleDischargeModal}
        toggleModal={() => {
          setDischargeState({
            pid: "",
            aid: "",
            date: "",
            status: { value: "", label: "Select" },
            reason: "",
            conditionAtTheTimeOfDischarge: { value: "", label: "Select" },
            shouldSendfeedbackNotification: true
          });
          setState((prev) => ({
            ...prev,
            toggleDischargeModal: !state.toggleDischargeModal
          }));
        }}
        crossIcon={true}
      >
        <div className="flex rounded-xl w-[450px] max-h-[550px] items-start text-nowrap whitespace-nowrap justify-center bg-white">
          <div className="w-full max-w-md rounded-lg px-4 py-4">
            <div className="flex mb-4 items-center justify-between">
              <h2 className="text-xl font-semibold">Discharge</h2>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <CustomCalendar
                disabledDate={(current) => {
                  if (!current) return false;

                  const minDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  minDate.setHours(0, 0, 0, 0); // normalize

                  const currentDate = current.toDate(); // Convert from Moment to JS Date
                  currentDate.setHours(0, 0, 0, 0); // normalize

                  return currentDate <= minDate;
                }}
                onChange={(date) => {
                  setDischargeState((prev) => ({
                    ...prev,
                    date: date ? moment(date).format("YYYY-MM-DD") : ""
                  }));
                }}
              >
                <div className="flex flex-col w-full">
                  <label
                    htmlFor="dob"
                    className="block mb-1.5 ml-0.5 text-sm font-medium text-black "
                  >
                    Select Date of Discharge<span>*</span>
                  </label>
                  <button
                    id="dob"
                    className="flex cursor-pointer justify-between relative items-center bg-[#F4F2F0]!    border! border-[#DEDEDE] p-3 uppercase rounded-[7px] font-medium focus:outline-none focus:border-primary-dark"
                  >
                    <p className=" font-normal">
                      {/* {data?.vitalsDate && formateNormalDate(data?.vitalsDate)} */}

                      {dischargeState?.date ? convertDate(dischargeState.date) : "DD/MM/YYYY"}
                    </p>
                    <div className=" flex items-center justify-center w-5 h-5">
                      <img src={calender} alt="calender" className="w-full h-full" />
                    </div>
                  </button>
                  {errors?.date && <p className="text-red-600">{errors.date}</p>}
                </div>
              </CustomCalendar>
              <Select
                required
                errors={errors["status.value"]}
                label="Discharge Status"
                value={dischargeState.status}
                name="status"
                options={[
                  { label: "Absconding", value: "Absconding" },
                  { label: "Discharge on Request", value: "Discharge on Request" },
                  { label: "LAMA", value: "LAMA" },
                  { label: "Reffered", value: "Reffered" },
                  { label: "Routine Discharge", value: "Routine Discharge" }
                ]}
                onChange={(name, value) => {
                  setDischargeState((prev) => ({ ...prev, [name]: value }));
                }}
                className="w-full rounded-md border! border-[#DEDEDE] px-3 py-2 shadow-sm bg-[#F4F2F0]! font-medium!"
              />
              <Input
                required
                errors={errors["reason"]}
                label="Reason of Discharge"
                placeholder="Enter"
                name="reason"
                containerClass="col-span-2"
                className="w-full  rounded-[7px]! border border-gray-300 px-3 py-3!"
                labelClassName="text-black! font-medium!"
                value={dischargeState.reason}
                onChange={(e) => updateDischargeState(e)}
              />

              <Select
                required
                errors={errors["conditionAtTheTimeOfDischarge.value"]}
                label="Condition at the time of discharge"
                value={dischargeState.conditionAtTheTimeOfDischarge}
                labelClassName="text-black! font-medium!"
                name="conditionAtTheTimeOfDischarge"
                options={[
                  { label: "Select", value: "" },
                  { label: "Improved", value: "Improved" },
                  { label: "Partially Improved", value: "Partially Improved" },
                  { label: "Status Quo", value: "Status Quo" }
                ]}
                onChange={(name, value) => {
                  setDischargeState((prev) => ({ ...prev, [name]: value }));
                }}
                containerClass="w-full! col-span-2!"
                className="w-full! rounded-[7px]! max-w-full! border border-gray-300 px-3 py-6!"
              />
              {/* <div className="flex w-fit col-span-2 items-center gap-1 my-2">
                <Input
                  type="checkbox"
                  required
                  id="shouldSendfeedbackNotification"
                  name="shouldSendfeedbackNotification"
                  className="accent-[#323E2A] w-4! h-4! cursor-pointer!"
                  checked={dischargeState.shouldSendfeedbackNotification}
                  onChange={() =>
                    setDischargeState((prev) => ({
                      ...prev,
                      shouldSendfeedbackNotification: !prev.shouldSendfeedbackNotification
                    }))
                  }
                />
                <label
                  htmlFor="shouldSendfeedbackNotification"
                  className="ml-2 cursor-pointer block text-nowrap text-sm text-gray-700"
                >
                  Send feedback notification to the family.
                </label>
              </div> */}
              <RBACGuard resource={RESOURCES.DISCHARGE} action="write">
                <button
                  onClick={handleDischarge}
                  className="w-full col-span-2 rounded-lg cursor-pointer bg-[#323E2A] px-4 py-2 font-semibold text-white shadow-sm "
                >
                  Next
                </button>
              </RBACGuard>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        crossIcon
        isOpen={displayModal}
        toggleModal={() => {
          setDisplayModal(!displayModal);
        }}
      >
        <div className="relative w-md  bg-white  shadow-lg  ">
          <div className="relative  rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 rounded-t">
              <h3 className="text-lg font-semibold text-gray-900">Medical Reports</h3>
              {/* <button
                type="button"
                onClick={() => {
                  setDisplayModal(!displayModal);
                }}
                className="text-black cursor-pointer white-black hover:text-gray-900 rounded-lg text-sm h-8 w-8 inline-flex justify-center items-center"
              >
                Close
              </button> */}
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto ">
              {previousTreatMentRecord.map(
                (value: { filePath: string; fileUrl: string; fileName?: string }, index) => (
                  <div key={index} className="mb-6">
                    {/* <h2 className="text-lg font-bold text-gray-800 mb-3">File {index + 1}</h2> */}
                    <ul>
                      <li className="flex items-center justify-between py-2 px-4 bg-gray-100 rounded-lg mb-2">
                        <div className="text-gray-700 text-sm">
                          {value?.fileName ? value?.fileName : "File"}
                        </div>
                        <a href={value.fileUrl} target="_blank">
                          <button className="bg-[#575F4A] cursor-pointer text-white py-1 px-3 rounded-lg text-sm">
                            View
                          </button>
                        </a>
                      </li>
                    </ul>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InpatientData;
