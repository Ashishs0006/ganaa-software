import { CustomCalendar, Modal } from "@/components";
import messageIcon from "@/assets/images/messageIcon.svg";
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { IData, IModalData, IPatient } from "./types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ISelectOption } from "@/components/Select/types";
import { getVitalReport } from "@/apis";
import { convertBackendDateToTime, formatDate, formatId } from "@/utils/formater";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { calculateBMI } from "@/utils/calculateBMI";
import pdfFile from "@/assets/images/pdfIcon.svg";
import moment from "moment";
import { convertDate } from "@/components/BasicDetaills/utils";
import calendar from "@/assets/images/calender.svg";
import { IoIosArrowDown } from "react-icons/io";
import messageIcondisbale from "@/assets/images/messageIconDisable.svg";
import { useAuth } from "@/providers/AuthProvider";
import Filter from "@/components/Filter/Filter";

interface IState {
  loading: boolean;
  center: ISelectOption;
  displayModalNurse: boolean;
  displayModalTherapist: boolean;
  displayModalDoctor: boolean;
  displayModalGroupActivity: boolean;
  patientData: IPatient;
  sort: boolean;
}

const PatientVitalsReport = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [data, setData] = useState<IData>();
  const [state, setState] = useState<IState>({
    loading: false,
    center: { label: "Select", value: "" },
    displayModalNurse: false,
    displayModalTherapist: false,
    displayModalDoctor: false,
    displayModalGroupActivity: false,
    patientData: {
      _id: "",
      patientId: "",
      firstName: "",
      lastName: "",
      uhid: "",
      patientPicUrl: "",
      gender: ""
    },
    sort: false
  });

  const [modalData, setModalData] = useState<IModalData>();

  const [open, setOpen] = useState(false);

  const viewref = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (viewref.current && !viewref.current.contains(event.target as Node)) {
      setOpen(false);
    }
  };
  const handleFileOpenClose = () => {
    setOpen(!open);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelectDate = (datas: string, _type: string) => {
    let value = moment().format("YYYY-MM-DD");
    if (datas) {
      value = moment(datas).format("YYYY-MM-DD");
    }
    searchParams.set("startDate", value);
    searchParams.set("endDate", value);
    setSearchParams(searchParams);
  };

  const dropdownData = useSelector((store: RootState) => store.dropdown);

  const centerDropdown = useMemo<ISelectOption[]>(() => {
    const centerList = dropdownData?.center?.data ?? [];
    return centerList.map(({ centerName, _id }) => ({
      label: centerName,
      value: _id
    }));
  }, [dropdownData?.center?.data]);

  const fetchVitalReport = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    let centers;
const selected = searchParams.get("filter") || "All";
    if (selected === "All" || !selected) {
      centers = auth.user.centerId.map((data) => data._id);
      if (centers.length <= 0) navigate("/");
    } else {
      centers = [selected];
    }
    const today = new Date();
    const thirtyDaysAgo = new Date();

    const startDate = searchParams.get("startDate") || thirtyDaysAgo.toISOString();
    const endDate = searchParams.get("endDate") || today.toISOString();
    try {
      setState((prev) => ({ ...prev, loading: true }));
      const response = await getVitalReport({
        startDate: startDate,
        endDate: endDate,
        centerId: centers.join(",")
      });
      if (response.data.data) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching Session data:", error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchVitalReport();
  }, [searchParams]);

  return (
    <div className="bg-[#F4F2F0] pb-5 min-h-[calc(100vh-64px)]">
      <div className="w-[1246px]! mx-auto">
        <div className="flex justify-between py-5 items-end w-full">
          <div className="flex flex-col gap-2">
            <p className="text-[22px] font-bold">Patients Report</p>
          </div>
          <div className="flex gap-4 items-center">
            {/* <DateTime
              maxDate={new Date()}
              ranges={dateRange}
              onChange={handleSelectDate}
              onClick={handleClick}
            >
              <Button
                variant="outlined"
                size="base"
                className="flex bg-white text-xs py-3!  rounded-lg text-[#505050]"
              >
                <img src={calender} alt="calender" />
                <IoIosArrowDown />
                {searchParams.get("startDate")
                  ? `${formatDate(searchParams.get("startDate"))} to ${formatDate(
                      searchParams.get("endDate")
                    )}`
                  : `${formatDate(
                      new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
                    )} to ${formatDate(new Date().toISOString())}`}
              </Button>
            </DateTime> */}
            <CustomCalendar
              className="z-50!"
              value={
                searchParams.get("startDate") || moment().subtract(1, "days").format("YYYY-MM-DD")
              }
              onChange={(date) => {
                handleSelectDate(date, "date");
              }}
            >
              <div className="flex flex-col w-fit">
                <div
                  id="dateOfAdmission"
                  className="flex cursor-pointer bg-white justify-between gap-2 w-fit items-center border-2 border-gray-300 p-3  uppercase rounded-[7px]! font-medium"
                >
                  {searchParams.get("endDate") && searchParams.get("endDate") != null ? (
                    <p className="text-[#6B6B6B] text-xs text-bold">
                      {" "}
                      {convertDate(searchParams.get("endDate") || "")}
                    </p>
                  ) : (
                    <p className="text-[#6B6B6B] text-xs text-bold">
                      {convertDate(new Date().toISOString())}
                    </p>
                  )}
                  <div className=" cursor-pointer flex items-center justify-center w-5 h-5">
                    <img src={calendar} alt="calender" className="w-full h-full" />
                  </div>
                </div>
              </div>
            </CustomCalendar>
            <Filter />
          </div>
        </div>
        <div className="bg-white p-5  overflow-y-auto rounded-2xl">
          <div className=" font-sans rounded-xl text-[13px] leading-[18px] text-[#1a1a1a]">
            <div className=" overflow-y-auto rounded-md">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-30 bg-[#CCB69E]">
                  <tr className="rounded-t-md border-b border-[#c7bfa7] bg-[#CCB69E] select-none">
                    <th className="w-[120px]  bg-[#CCB69E]  px-3 py-4 text-left align-top text-[12px] leading-[15px] font-semibold text-black">
                      <div className="flex items-center gap-2 text-nowrap">
                        <div className="font-semibold">Patient Name</div>
                        <div
                          className={`cursor-pointer ${state.sort ? "rotate-180" : ""}`}
                          onClick={() => setState((prev) => ({ ...prev, sort: !prev.sort }))}
                        >
                          <IoIosArrowDown />
                        </div>
                      </div>
                    </th>

                    <th className="   w-[120px]  bg-[#CCB69E] px-3 py-4 text-left align-top text-[12px] leading-[15px] font-semibold text-black">
                      Center Name
                    </th>
                    <th className="   w-[120px]  bg-[#CCB69E]  px-3 py-4 align-top text-left text-[12px] leading-[15px] font-semibold text-black">
                      Nurse Assigned
                    </th>
                    <th className="   w-[120px]  bg-[#CCB69E]  px-3 py-4 align-top text-[12px] leading-[15px] font-semibold text-black">
                      Vitals & Notes
                    </th>
                    <th className="   w-[120px]  bg-[#CCB69E]  px-3 py-4 align-top text-[12px] leading-[15px] font-semibold text-black">
                      Doctor Notes
                    </th>
                    <th className="   w-[120px]  bg-[#CCB69E]  px-3 py-4 align-top text-[12px] leading-[15px] font-semibold text-black">
                      Therapist Notes
                    </th>
                    <th className="   w-[120px] bg-[#CCB69E]  px-3 py-4 align-top text-[12px] leading-[15px] font-semibold text-black">
                      Group Activity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.patients.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center   py-10 text-gray-500">
                        No Data exist for the selected date and center.
                      </td>
                    </tr>
                  )}
                  {(state.sort
                    ? (data?.patients ?? [])
                        .slice()
                        .sort((a, b) => a.firstName.localeCompare(b.firstName))
                    : (data?.patients ?? [])
                        .slice()
                        .sort((a, b) => b.firstName.localeCompare(a.firstName))
                  ).map((patient, pindex) => {
                    return (
                      <tr key={pindex} className="border-b border-[#d9d4c9]">
                        <td className="   text-nowrap  w-[120px]   bg-white py-3   pl-3 font-semibold">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex  rounded-full  w-8 h-8 bg-[#C1D1A8] border overflow-hidden items-center justify-center
                                          ${
                                            patient?.gender == "Male"
                                              ? "border-[#00685F]"
                                              : patient?.gender == "Female"
                                              ? "border-[#F14E9A]"
                                              : "border-gray-500"
                                          }
                                        `}
                            >
                              {patient?.patientPicUrl ? (
                                <img
                                  src={patient?.patientPicUrl}
                                  alt="profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="uppercase text-sm font-medium">
                                  {patient?.firstName?.trim().slice(0, 1)}
                                  {patient?.lastName?.trim().slice(0, 1)}
                                </div>
                              )}
                            </div>
                            <div className="w-[120px] truncate">
                              {patient.firstName} {patient.lastName}
                              <br />
                              {formatId(patient?.uhid)}
                            </div>
                          </div>
                        </td>
                        <td className=" font-semibold   w-[120px]  bg-white  py-4 text-xs  px-3">
                          {patient?.resourceAllocation?.centerId
                            ? centerDropdown.find(
                                (item) => item.value === patient.resourceAllocation?.centerId
                              )?.label || "--"
                            : "--"}
                        </td>
                        <td className=" w-[120px] py-4 text-xs font-semibold px-3">
                          {patient.resourceAllocation
                            ? patient.resourceAllocation.nurse || "--"
                            : "--"}
                        </td>
                        <td className="w-[120px] py-4 text-xs font-medium text-center">
                          <div className="flex flex-col gap-1 justify-center">
                            <div className="flex items-center justify-center gap-2">
                              {(() => {
                                const patientNotes =
                                  data?.nurseNotes?.filter(
                                    (note) => note.patientId === patient.patientId
                                  ) || [];
                                const loa = data?.loa?.filter(
                                  (elem) => elem.patientId === patient.patientId
                                );

                                return (
                                  <div
                                    className="relative cursor-pointer"
                                    onClick={() => {
                                      if (!loa || loa?.length <= 0) {
                                        setState((prev) => ({
                                          ...prev,
                                          displayModalNurse: true
                                        }));
                                      }
                                      setModalData((prev) => ({
                                        ...prev,
                                        doctorNotes: [],
                                        therapistNotes: [],
                                        groupActivityNotes: [],
                                        nurseNotes: patientNotes
                                      }));
                                    }}
                                  >
                                    {loa && loa?.length > 0 ? (
                                      <img
                                        src={messageIcondisbale}
                                        title="The Patient is on LOA Today."
                                        className={`w-5 h-5 text-gray-50 `}
                                      />
                                    ) : (
                                      <img src={messageIcon} className="w-5 h-5 text-[#505050]" />
                                    )}
                                    {patientNotes.length > 0 && (!loa || loa?.length <= 0) && (
                                      <div className="-top-2 text-[10px] -right-2 p-0.5 px-1 font-bold text-white rounded-full bg-red-500 absolute">
                                        {patientNotes.length}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>

                        <td className="w-[120px] py-4 text-xs font-medium text-center">
                          <div className="flex flex-col gap-1 justify-center">
                            <div className="flex items-center justify-center gap-2">
                              {(() => {
                                const patientNotes =
                                  data?.doctorNotes?.filter(
                                    (note) => note.patientId === patient.patientId
                                  ) || [];
                                const loa = data?.loa?.filter(
                                  (elem) => elem.patientId === patient.patientId
                                );

                                return (
                                  <div
                                    className="relative cursor-pointer"
                                    onClick={() => {
                                      if (!loa || loa?.length <= 0) {
                                        setState((prev) => ({
                                          ...prev,
                                          displayModalDoctor: true
                                        }));
                                        setModalData((prev) => ({
                                          ...prev,
                                          doctorNotes: patientNotes,
                                          therapistNotes: [],
                                          groupActivityNotes: [],
                                          nurseNotes: []
                                        }));
                                      }
                                    }}
                                  >
                                    {loa && loa?.length > 0 ? (
                                      <img
                                        src={messageIcondisbale}
                                        title="The Patient is on LOA Today."
                                        className={`w-5 h-5 text-gray-50 `}
                                      />
                                    ) : (
                                      <img src={messageIcon} className="w-5 h-5 text-[#505050]" />
                                    )}
                                    {patientNotes.length > 0 && (!loa || loa?.length <= 0) && (
                                      <div className="-top-2 text-[10px] -right-2 p-0.5 px-1 font-bold text-white rounded-full bg-red-500 absolute">
                                        {patientNotes.length}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>

                        <td className="w-[120px] py-4 text-xs font-medium text-center">
                          <div className="flex flex-col gap-1 justify-center">
                            <div className="flex items-center justify-center gap-2">
                              {(() => {
                                const patientNotes =
                                  data?.therapistNotes?.filter(
                                    (note) => note.patientId === patient.patientId
                                  ) || [];

                                const loa = data?.loa?.filter(
                                  (elem) => elem.patientId === patient.patientId
                                );

                                return (
                                  <div
                                    className="relative cursor-pointer"
                                    onClick={() => {
                                      if (!loa || loa?.length <= 0) {
                                        setState((prev) => ({
                                          ...prev,
                                          displayModalTherapist: true
                                        }));
                                        setModalData((prev) => ({
                                          ...prev,
                                          doctorNotes: [],
                                          therapistNotes: patientNotes,
                                          groupActivityNotes: [],
                                          nurseNotes: []
                                        }));
                                      }
                                    }}
                                  >
                                    {loa && loa?.length > 0 ? (
                                      <img
                                        src={messageIcondisbale}
                                        title="The Patient is on LOA Today."
                                        className={`w-5 h-5 text-gray-50 `}
                                      />
                                    ) : (
                                      <img src={messageIcon} className="w-5 h-5 text-[#505050]" />
                                    )}
                                    {patientNotes.length > 0 && (!loa || loa?.length <= 0) && (
                                      <div className="-top-2 text-[10px] -right-2 p-0.5 px-1 font-bold text-white rounded-full bg-red-500 absolute">
                                        {patientNotes.length}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>

                        <td className="w-[120px] py-4 text-xs font-medium text-center">
                          <div className="flex flex-col gap-1 justify-center">
                            <div className="flex items-center justify-center gap-2">
                              {(() => {
                                const groupActivity =
                                  data?.groupActivityNotes?.filter(
                                    (note) => note.patientId === patient.patientId
                                  ) || [];

                                const loa = data?.loa?.filter(
                                  (elem) => elem.patientId === patient.patientId
                                );
                                return (
                                  <div
                                    className="relative cursor-pointer"
                                    onClick={() => {
                                      if (!loa || loa?.length <= 0) {
                                        setState((prev) => ({
                                          ...prev,
                                          displayModalGroupActivity: true
                                        }));
                                        setModalData((prev) => ({
                                          ...prev,
                                          doctorNotes: [],
                                          therapistNotes: [],
                                          groupActivityNotes: groupActivity,
                                          nurseNotes: []
                                        }));
                                      }
                                    }}
                                  >
                                    {loa && loa?.length > 0 ? (
                                      <img
                                        src={messageIcondisbale}
                                        title="The Patient is on LOA Today."
                                        className={`w-5 h-5 text-gray-50 `}
                                      />
                                    ) : (
                                      <img src={messageIcon} className="w-5 h-5 text-[#505050]" />
                                    )}
                                    {groupActivity.length > 0 && (!loa || loa?.length <= 0) && (
                                      <div className="-top-2 text-[10px] -right-2 p-0.5 px-1 font-bold text-white rounded-full bg-red-500 absolute">
                                        {groupActivity[0].activity.length}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Modal
        // For Nurse
        crossIcon
        isOpen={state.displayModalNurse}
        toggleModal={() => {
          setState((prev) => ({
            ...prev,
            displayModalNurse: false
          }));
        }}
      >
        <div className="w-full mb-8 bg-gray-100"></div>
        <div className=" w-7xl h-[70vh] overflow-auto  px-4 pb-4 mx-auto rounded-lg  shadow-sm">
          <table id="print-section" className="text-sm w-full text-left h-fit">
            <thead className="bg-[#E9E8E5] sticky top-0 z-30">
              <tr className="text-[#505050] text-xs font-medium">
                <th className="px-6 py-3 text-center  w-1/12 text-nowrap whitespace-nowrap">
                  Date & Time
                </th>
                <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">B.P (mm Hg)</th>
                <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap"> Pulse (bpm)</th>
                <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">Temperature (°F)</th>
                <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">SPO2 (%)</th>
                <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">Weight (kg)</th>
                <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">RBS(mg/dl)</th>
                <th className="px-3 py-3 w-1/12 text-nowrap whitespace-nowrap">Height (cm)</th>
                <th className="px-3 py-3 w-1/12 text-nowrap whitespace-nowrap">BMI</th>
                <th className="px-4 py-3 w-1/12 ">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white font-semibold  h-full">
              {modalData?.nurseNotes.map((value, index) => {
                return (
                  <tr
                    className="hover:bg-[#F6F6F6C7] text-xs border-b border-[#DCDCDCE0]"
                    key={index}
                  >
                    <td className="px-6 py-3 text-nowrap whitespace-nowrap ">
                      <p>{value.noteDateTime && formatDate(value.noteDateTime)}</p>
                      <p className="text-gray-500">
                        {value.noteDateTime && convertBackendDateToTime(value.noteDateTime)}
                      </p>
                    </td>
                    <td className="px-4 py-7">{value?.bp || "--"}</td>
                    <td className="px-4 py-7">{value?.pulse || "--"}</td>
                    <td className="px-4 py-7">{value?.temperature || "--"}</td>
                    <td className="px-4 py-7 ">{value?.spo2 || "--"}</td>
                    <td className="px-4 py-7 ">{value?.weight || "--"}</td>
                    <td className="px-4 py-7 ">{value?.rbs || "--"}</td>
                    <td className="px-4 py-7">{value?.height || "--"}</td>
                    <td className="px-4 py-7">
                      {calculateBMI(String(value?.weight), String(value?.height)) || "--"}
                    </td>
                    <td
                      className="px-4 py-7 sm:w-3/6 w-3/5 overflow-hidden text-overflow-ellipsis break-all max-w-md"
                      dangerouslySetInnerHTML={{ __html: String(value?.note) }}
                    ></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {modalData?.nurseNotes.length == 0 && (
            <div>
              <div>
                <div className="text-center font-semibold fixed left-2/5  py-10 text-gray-500">
                  No Data exist for the selected date and center.
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        // For Doctor
        crossIcon
        isOpen={state.displayModalDoctor}
        toggleModal={() => {
          setState((prev) => ({
            ...prev,
            displayModalTherapist: false,
            displayModalDoctor: false
          }));
        }}
      >
        <div className="w-full mb-8 bg-gray-100"></div>
        <div className=" w-7xl h-[70vh] overflow-auto  px-4 pb-4 mx-auto rounded-lg  shadow-sm">
          <table id="print-section" className=" w-full  text-sm text-left h-fit">
            <thead className="bg-[#E9E8E5] sticky top-0 z-30">
              <tr className="text-[#505050]  font-medium">
                <th className="pl-7 py-3 w-1/7 text-xs">Date & Time</th>
                <th className="px-2 py-3 w-1/7 text-xs">Doctor</th>
                <th className="px-2 py-3 w-1/7 text-xs">Session Type</th>
                <th className="px-2 py-3 w-1/7 text-xs">Notes</th>
              </tr>
            </thead>

            <tbody className="bg-white font-semibold  h-full">
              {modalData?.doctorNotes.map((value, index) => {
                return (
                  <tr
                    key={index}
                    className="hover:bg-[#F6F6F6C7] border-b text-xs border-[#DCDCDCE0]"
                  >
                    <td className="pl-7 py-7 w-1/7">
                      <div className="flex flex-col justify-center">
                        <p>{value.noteDateTime && formatDate(value.noteDateTime)}</p>
                        <p className="text-gray-500 ">
                          {value.noteDateTime && convertBackendDateToTime(value.noteDateTime)}
                        </p>
                      </div>
                    </td>
                    <td className="px-2 py-7 w-1/7 ">
                      {typeof value.doctorId === "object" && value.doctorId !== null
                        ? `${value.doctorId.firstName} ${value.doctorId.lastName}`
                        : value.doctorId}
                    </td>
                    <td className="px-2 py-7 w-1/7 ">
                      {value.sessionType ? value.sessionType.join(", ") : "--"}
                    </td>
                    <td
                      className="px-2 py-7  w-3/5 overflow-hidden text-overflow-ellipsis break-all max-w-md"
                      dangerouslySetInnerHTML={{ __html: value?.note }}
                    ></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {modalData?.doctorNotes.length == 0 && (
            <div>
              <div>
                <div className="text-center font-semibold fixed left-2/5  py-10 text-gray-500">
                  No Data exist for the selected date and center.
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        crossIcon
        isOpen={state.displayModalTherapist}
        toggleModal={() => {
          setState((prev) => ({
            ...prev,
            displayModalTherapist: false,
            displayModalDoctor: false
          }));
        }}
      >
        <div className="w-full mb-8 bg-gray-100"></div>
        <div className=" w-7xl h-[70vh] overflow-auto  px-4 pb-4 mx-auto rounded-lg  shadow-sm">
          <table id="print-section" className="text-sm w-full text-left h-fit">
            <thead className="bg-[#E9E8E5] sticky top-0 z-30">
              <tr className="text-[#505050]  font-medium">
                <th className="pl-7 py-3 w-1/7 text-xs">Date & Time</th>
                <th className="px-2 py-3 w-1/7 text-xs">Therapist</th>
                <th className="px-2 py-3 w-1/7 text-xs">Session Type</th>
                <th className="px-2 py-3 w-1/7 text-xs">Score</th>
                <th className="px-2 py-3 w-1/7 text-xs">File</th>
                <th className="px-2 py-3 w-1/7 text-xs">Notes</th>
              </tr>
            </thead>

            <tbody className="bg-white  font-semibold w-full h-full">
              {modalData?.therapistNotes.map((value, index) => {
                return (
                  <tr
                    key={index}
                    className="hover:bg-[#F6F6F6C7] border-b text-xs border-[#DCDCDCE0]"
                  >
                    <td className="pl-7 py-7 w-1/7">
                      <div className="flex flex-col justify-center">
                        <p>{value.noteDateTime && formatDate(value.noteDateTime)}</p>
                        <p className="text-gray-500 ">
                          {value.noteDateTime && convertBackendDateToTime(value.noteDateTime)}
                        </p>
                      </div>
                    </td>
                    <td className="px-2 py-7 w-1/7 ">
                      {typeof value.therapistId === "object" && value.therapistId !== null
                        ? `${value.therapistId.firstName} ${value.therapistId.lastName}`
                        : value.therapistId}
                    </td>
                    <td className="px-2 py-7 w-1/7 ">
                      {`${value.sessionType ? value.sessionType : "--"}${
                        value.subSessionType ? ` (${value.subSessionType})` : ""
                      }`}
                    </td>
                    <td className="px-2 py-7 w-1/7 ">{value.score || "--"}</td>
                    {value.file?.filePath ? (
                      <td className="px-2 py-7 w-1/7 ">
                        <div id="view" ref={viewref} className="text-nowrap whitespace-nowrap">
                          <div
                            onClick={handleFileOpenClose}
                            className="border-dashed cursor-pointer relative border-[#CAD2AA] px-2 py-2 w-fit min-h-4 rounded-[7px] bg-[#FAFFE2] border-2  flex items-start justify-center gap-1"
                          >
                            <img src={pdfFile} className="w-4" />
                            <p className="text-xs font-bold">View</p>
                          </div>
                          {value.file?.filePath && (
                            <div
                              className={`bg-gray-100 border absolute z-20 border-gray-50 py-2 px-2 ${
                                open ? "flex" : "hidden"
                              } flex-col gap-2 w-fit rounded-xl  shadow-xl`}
                            >
                              <div className="py-1  w-60 text-nowrap whitespace-normal pl-2 pr-10  flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative">
                                <a
                                  target="_blank"
                                  href={value.file.filePath}
                                  className="flex gap-2 w-full items-center justify-center"
                                >
                                  <div className=" w-[30px] h-[30px]  flex items-center overflow-hidden justify-center">
                                    <img src={pdfFile} alt="file" className="w-full h-full" />
                                  </div>
                                  <div className="w-full truncate">
                                    <p
                                      title={value.file.fileName}
                                      className="ml-5 w-[80%] truncate"
                                    >
                                      {value.file.fileName || ""}
                                    </p>
                                  </div>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    ) : (
                      <td className="px-2 py-7 w-1/7 ">--</td>
                    )}
                    <td
                      className="px-2 py-7  w-3/5 overflow-hidden text-overflow-ellipsis break-all max-w-md"
                      dangerouslySetInnerHTML={{ __html: value?.note }}
                    ></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {modalData?.therapistNotes.length == 0 && (
            <div>
              <div>
                <div className="text-center font-semibold fixed left-2/5  py-10 text-gray-500">
                  No Data exist for the selected date and center.
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        // For Group Activity
        crossIcon
        isOpen={state.displayModalGroupActivity}
        toggleModal={() => {
          setState((prev) => ({
            ...prev,
            displayModalGroupActivity: false
          }));
        }}
      >
        <div className="w-7xl  overflow-hidden   mx-auto bg-gray-100 rounded-lg shadow-sm">
          <div className="font-extrabold sticky w-fit top-0 z-30 text-xl p-4">Activity</div>
          <div className="w-7xl h-[69vh]  overflow-auto  mx-auto bg-gray-100  px-4 mb-4">
            {modalData?.groupActivityNotes.map((value) => {
              return value.activity.map((activity, aindex) => {
                return (
                  <div className="mb-6" key={aindex}>
                    <h2 className="font-bold text-sm mb-1">{activity.name}</h2>
                    <p className="bg-gray-200 rounded-md p-3 text-xs font-semibold leading-snug text-gray-900">
                      {activity.note}
                    </p>
                  </div>
                );
              });
            })}
            {modalData?.groupActivityNotes.length == 0 && (
              <div>
                <div>
                  <div className="text-center fixed left-2/5  font-semibold py-10 text-gray-500">
                    No Data exist for the selected date and center.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientVitalsReport;
