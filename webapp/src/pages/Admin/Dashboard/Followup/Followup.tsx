import { Button, DateTime, Modal } from "@/components";
import calender from "@/assets/images/calender.svg";
import { IoIosArrowDown } from "react-icons/io";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { getFollowups} from "@/apis";
import { IData, INote, IPatient, ITherapist } from "./type";
import { ISelectOption } from "@/components/Select/types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { convertBackendDateToTime, formatDate, formatId } from "@/utils/formater";
import messageIcon from "@/assets/images/messageIcon.svg";
import toast from "react-hot-toast";
import { TableShimmer } from "@/components/Shimmer/Shimmer";
import { useAuth } from "@/providers/AuthProvider";
import Filter from "@/components/Filter/Filter";
import pdfFile from "@/assets/images/pdfIcon.svg";

interface IState {
  loading: boolean;
  center: ISelectOption;
  displayModal: boolean;
  patientData: IPatient;
  therapistData: ITherapist;
  sort: boolean;
}

const PatientFollowup = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  // const [dischargeDate, setDischargeDate] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  // const [dateArray, setDateArray] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection"
    }
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectDate = (ranges: any) => {
    setDateRange([ranges.selection]);
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const updateQueryParams = (startDate: Date, endDate: Date) => {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    searchParams.set("startDate", formatLocalDate(startOfDay));
    searchParams.set("endDate", formatLocalDate(endOfDay));
    setSearchParams(searchParams);
  };

  const handleClick = (_e?: SyntheticEvent, _bool?: boolean, cancel?: boolean) => {
    const { startDate, endDate } = dateRange[0];
    if (cancel) {
      searchParams.delete("startDate");
      searchParams.delete("endDate");
      setSearchParams(searchParams);
      setDateRange([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);
    } else if (startDate && endDate) {
      const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 31) {
        toast.error("Date range cannot exceed 31 days!");
        return;
      }
      updateQueryParams(startDate, endDate);
    }
  };

  const [state, setState] = useState<IState>({
    loading: false,
    center: { label: "Select", value: "" },
    displayModal: false,
    patientData: { _id: "", firstName: "", lastName: "", uhid: "", patientPicUrl: "", gender: "" ,patientPic:"",},
    therapistData: { _id: "", firstName: "", lastName: "", centerId: { centerName: "" } },
    sort: false
  });

  const [modalNote, setModalNote] = useState<INote[] | []>([]);
  const [data, setData] = useState<IData>();

  const fetchSessionData = async () => {
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
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = searchParams.get("startDate") || thirtyDaysAgo.toISOString();
    const endDate = searchParams.get("endDate") || today.toISOString();

    try {
      const response = await getFollowups({
        startDate,
        endDate,
        centerId: centers.join(",")
      });

      if (response.data.status === "success") {
        setData(response.data.data);
        // setDischargeDate(response?.data?.data?.dischargeResult);

        const dates: string[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= new Date(endDate)) {
          dates.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        // setDateArray(dates);
      } else {
        console.error("Failed to fetch Session data");
      }
    } catch (error) {
      console.error("Error fetching Session data:", error);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [searchParams, searchParams.get("filter")]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-[#F4F2F0] pb-5  min-h-[calc(100vh-64px)]">
      <div className="w-[1304px] mx-auto">
        <div className="flex justify-between py-5 items-end">
          <div className="flex flex-col">
            <p className="text-[22px] font-bold">Patient Follow-up Report</p>
            {/* <p className="text-[10px] mt-2 font-medium ">
              R - Regular 15 min Session, T - 45-60 min Therapy Session, NF- Neurofeedback, HT -
              History, FS - Family Session, FM - Family Meeting, FC - Family Call, MSE, LOA Leave of
              Absence
            </p> */}
          </div>
          <div className="flex gap-4 items-center">
            <DateTime
              maxDate={new Date()}
              ranges={dateRange}
              onChange={handleSelectDate}
              onClick={handleClick}
            >
              <Button
                variant="outlined"
                size="base"
                className="flex bg-white text-xs py-3! rounded-lg text-[#505050]"
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
            </DateTime>
            <Filter />
          </div>
        </div>

        {state.loading ? (
          <div className="container gap-6 flex-col flex items-start w-full p-4">
            <div className="flex justify-between items-end w-full"></div>
            <div className="font-semibold text-xs w-full min-h-screen text-nowrap whitespace-nowrap overflow-x-auto scrollbar-hidden">
              <div className="w-full text-sm text-left ">
                <TableShimmer rows={10} columns={10} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 overflow-auto rounded-2xl">
            <div className="mx-auto overflow-x-auto rounded-md" ref={scrollContainerRef}>
              <table className="w-full border-collapse ">
                <thead className="sticky top-0 z-30">
                  <tr className="bg-[#CCB69E] border-b border-[#c7bfa7]">
                    <th className="w-[120px] sticky left-0 text-nowrap bg-[#CCB69E] px-3 py-4 text-left text-xs font-semibold text-black">
                      <div className="flex w-[176px] items-center gap-2">
                        <div className="font-semibold">Patient Name</div>
                        <div
                          className={`cursor-pointer ${state.sort ? "rotate-180" : ""}`}
                          onClick={() => setState((prev) => ({ ...prev, sort: !prev.sort }))}
                        >
                          <IoIosArrowDown />
                        </div>
                      </div>
                    </th>
                    <th className="sticky left-[200px] text-nowrap pr-10 bg-[#CCB69E] py-2 text-center text-xs font-semibold text-black">
                      <div className="w-[100px] flex items-center gap-2 mx-auto font-semibold">
                        Center Name
                      </div>
                    </th>
                    <th className="sticky left-[340px] pr-16 bg-[#CCB69E] text-nowrap px-3 py-2 text-center text-xs font-semibold text-black">
                      <div className="w-[50px] flex items-center gap-2 font-semibold ">
                        Therapist Assigned
                      </div>
                    </th>

                    <th className="sticky left-[450px] pr-16 bg-[#CCB69E] text-nowrap px-3 py-2 text-center text-xs font-semibold text-black">
                      <div className="w-[50px] flex items-center gap-2 font-semibold ">
                        Date of discharge
                      </div>
                    </th>
                    {/* 🔹 Fixed 10 Followup columns */}
                    {[...Array(10)].map((_, i) => (
                      <th
                        key={i}
                        className="bg-[#CCB69E] text-nowrap px-10 py-2 text-center text-xs font-semibold text-black"
                      >
                        Follow-up {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {data?.patients?.length === 0 && (
                    <tr>
                      <td colSpan={13} className="text-center py-10 text-gray-500">
                        No patients found.
                      </td>
                    </tr>
                  )}

                  {data?.patients
                    ?.slice()
                    .sort((a, b) =>
                      state?.sort
                        ? a?.firstName?.localeCompare(b.firstName)
                        : b?.firstName?.localeCompare(a.firstName)
                    )
                    .map((patient) => {
                      const followups = patient.followups || []; // fetched from backend
                      const therapistName = followups[0]?.therapistId
                        ? `${followups[0].therapistId.firstName} ${followups[0].therapistId.lastName}`
                        : "-";

                      return (
                        <tr key={patient._id} className="border-b border-[#d9d4c9] font-semibold">
                          {/* 🔹 Patient name */}
                          <td className="sticky text-nowrap left-0 z-10 bg-white px-3 py-2 text-xs text-black">
                            <div className="flex items-center gap-2">
                              <div
                                className={`flex rounded-full w-10 h-10 bg-[#C1D1A8] border overflow-hidden items-center justify-center ${
                                  patient?.gender === "Male"
                                    ? "border-[#00685F]"
                                    : patient?.gender === "Female"
                                    ? "border-[#F14E9A]"
                                    : "border-gray-500"
                                }`}
                              >
                                {patient?.patientPicUrl ? (
                                  <img
                                    src={patient?.patientPicUrl}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="uppercase text-sm font-medium">
                                    {patient?.firstName?.slice(0, 1)}
                                    {patient?.lastName?.slice(0, 1)}
                                  </div>
                                )}
                              </div>
                              <div className="w-[120px] truncate">
                                {patient?.firstName} {patient?.lastName}
                                <br />
                                {formatId(patient?.uhid)}
                              </div>
                            </div>
                          </td>

                          {/* 🔹 Center name */}
                          <td className="px-3 sticky left-[200px] pr-10 z-10 bg-white py-4 text-xs text-center text-black text-nowrap">
                            {patient?.centerId?.centerName}
                          </td>

                          {/* 🔹 Therapist */}
                          <td className="px-3 sticky left-[340px] pr-10 z-10 bg-white py-4 text-xs text-left">
                            {therapistName}
                          </td>

                          {/* 🔹 Date of Discharge */}
                          <td className="px-3 sticky left-[440px] pr-0 z-10 bg-white py-4 text-xs text-left">
                            {patient?.dischargeDate && formatDate(patient?.dischargeDate)}
                          </td>

                          {/* 🔹 Fixed 10 followup columns with chat icon */}
                          {[...Array(10)].map((_, idx) => {
                            const followup = followups[idx];
                            return (
                              <td
                                key={idx}
                                className={`px-3 py-4 text-xs ${
                                  idx % 2 === 0 ? "" : "bg-gray-100"
                                } text-center font-medium text-black`}
                              >
                                {followup ? (
                                  <div className="relative  w-full">
                                    <img
                                      src={messageIcon}
                                      onClick={() => {
                                        setModalNote([followup as unknown as INote]);
                                        // setState((prev) => ({
                                        //   ...prev,
                                        //   displayModal: true,
                                        //   patientData: patient,
                                        //   therapistData: followup.therapistId
                                        // }));
                                        setState((prev) => ({
                                          ...prev,
                                          displayModal: true,
                                          patientData: patient,
                                          // therapistData: {
                                          //   _id: followup.therapistId?._id || "",
                                          //   firstName: followup.therapistId?.firstName || "",
                                          //   lastName: followup.therapistId?.lastName || "",
                                          //   centerId: followup.therapistId?.centerId || {
                                          //     centerName: ""
                                          //   }
                                          // }
                                        }));
                                      }}
                                      className=" w-4 h-4 text-[#505050] cursor-pointer mx-auto"
                                      title="View Followup"
                                    />

                                 <div className="absolute p-1 right-[3.3rem] -top-1 rounded-full bg-red-500"></div>


                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Modal
        isOpen={state.displayModal}
        toggleModal={() => {
          setModalNote([]);
          // setState((prev) => ({
          //   ...prev,
          //   displayModal: false,
          //   patientData: {
          //     _id: "",
          //     firstName: "",
          //     lastName: "",
          //     uhid: "",
          //     patientPicUrl: "",
          //     gender: ""
          //   },
          //   therapistData: {
          //     _id: "",
          //     firstName: "",
          //     lastName: "",
          //     centerId: { centerName: "" }
          //   }
          // }));
          setState((prev) => ({
            ...prev,
            displayModal: false,
            patientData: {
              ...prev.patientData,
              _id: "",
              firstName: "",
              lastName: "",
              uhid: "",
              patientPicUrl: "",
              gender: ""
            },
            // therapistData: {
            //   ...prev.therapistData,
            //   _id: "",
            //   firstName: "",
            //   lastName: "",
            //   centerId: { centerName: "" }
            // }
          }));
        }}
      >
        <div className="w-full h-[70vh] overflow-hidden mx-auto bg-gray-100 rounded-lg p-4 shadow-sm">
          {/* <div className="mb-4">
            <p className="text-lg font-bold">
              {state.patientData.firstName} {state.patientData.lastName}
            </p>
            <p className="text-sm text-gray-500">
              UHID: {state.patientData.uhid} • Therapist: {state.therapistData.firstName}{" "}
              {state.therapistData.lastName}
            </p>
          </div> */}

          <table className="w-full mt-10 text-xs font-semibold text-left">
            <thead className="bg-[#E9E8E5] w-full top-0 sticky z-10">
              <tr className="text-[#505050] font-medium">
                <th className="pl-7 py-3 text-xs">Date & Time</th>
                <th className="px-4 py-3 text-xs">Therapist</th>
                <th className="px-7 py-3 text-xs">Current Status</th>
                <th className="px-7 py-3 w-1/9 text-xs">Medication Adherence</th>
                <th className="px-7 py-3 w-1/9 text-xs">Attending Meeting</th>
                <th className="px-5 py-3 w-1/9 text-xs">Making a Sponsor</th>
                <th className="px-7 py-3 text-xs">Urge</th>
                <th className="px-7 py-3 text-xs">Prayer</th>
                <th className="px-7 py-3 text-xs">Literature</th>
                <th className="px-7 py-3 text-xs">Daycare</th>
                <th className="px-7 py-3 w-1/9 text-xs">File</th>
                <th className="px-2 py-3 w-1/9 text-xs">Family Feedback</th>
                <th className="px-7 py-3 w-1/9 text-xs">Notes</th>
                <th className="px-7 py-3 w-1/9 text-xs"></th>

              </tr>
            </thead>

            <tbody className="bg-white w-full h-full">
              {modalNote.length > 0 ? (
                modalNote.map((value: any, index: number) => (
                  <tr
                    key={index}
                    className="hover:bg-[#F6F6F6C7] border-b text-xs border-[#DCDCDCE0]"
                  >
                    {/* Date & Time */}
                    <td className="pl-7 py-7 text-nowrap">
                      <div className="flex flex-col justify-center">
                        <p>{value.noteDateTime && formatDate(value.noteDateTime)}</p>
                        <p className="text-gray-500">
                          {value.noteDateTime && convertBackendDateToTime(value.noteDateTime)}
                        </p>
                      </div>
                    </td>

                    {/* Therapist */}
                    <td className="px-7 py-7">
                      {value.therapistId?.firstName} {value.therapistId?.lastName}
                    </td>

                    {/* Followup Data */}
                    <td className="px-7 py-7">{value.currentStatus || "--"}</td>
                    <td className="px-7 py-7">{value.adherence || "--"}</td>
                    <td className="px-7 py-7">{value.meeting || "--"}</td>
                    <td className="px-7 py-7">{value.sponsor || "--"}</td>
                    <td className="px-7 py-7">{value.urge || "--"}</td>
                    <td className="px-7 py-7">{value.prayer || "--"}</td>
                    <td className="px-7 py-7">{value.literature || "--"}</td>
                    <td className="px-7 py-7">{value.daycareAtGanaa || "--"}</td>

                    {/* File */}
                    {value.file?.filePath ? (
                      <td className="px-7 py-7 w-1/9">
                        <a
                          href={value.file.filePath}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 bg-[#FAFFE2] border-2 border-dashed border-[#CAD2AA] rounded-lg px-2 py-1 hover:bg-[#F1F8D9]"
                        >
                          <img src={pdfFile} className="w-4" />
                          <p className="text-xs font-bold">View</p>
                        </a>
                      </td>
                    ) : (
                      <td className="px-7 py-7 w-1/9">--</td>
                    )}

                    {/* Family Feedback */}
                    <td className="px-7 py-7">{value.feedbackFromFamily || "--"}</td>

                    {/* Notes */}
                   <td className="px-7 py-7 max-w-[250px]">
  <div className="note-cell" 
    dangerouslySetInnerHTML={{ __html: value?.note || "--" }}
  />
</td>

                    <td className="px-7 py-7"></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="text-center py-10 text-gray-500">
                    No followups available for this patient.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div
            className="absolute bg-primary-dark p-1 rounded-[6px] top-3 right-5 cursor-pointer"
            onClick={() => {
              setModalNote([]);
              setState((prev) => ({
                ...prev,
                displayModal: false,
                patientData: {
                  _id: "",
                  firstName: "",
                  lastName: "",
                  uhid: "",
                  patientPicUrl: "",
                  patientPic:""
                },
                therapistData: {
                  _id: "",
                  firstName: "",
                  lastName: "",
                  centerId: { centerName: "" }
                }
              }));
            }}
          >
            <svg
              className="w-3 h-3  text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientFollowup;
