import { Button, DateTime, Modal } from "@/components";
import calender from "@/assets/images/calender.svg";
import { IoIosArrowDown } from "react-icons/io";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { getTherapistSession } from "@/apis";
import { IData, INote, IPatient, ITherapist } from "./type";
import { ISelectOption } from "@/components/Select/types";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, formatId } from "@/utils/formater";
import messageIcon from "@/assets/images/messageIcon.svg";
import toast from "react-hot-toast";
import { TableShimmer } from "@/components/Shimmer/Shimmer";
import { useAuth } from "@/providers/AuthProvider";
import Filter from "@/components/Filter/Filter";
import { getAdmissionStatus } from "./util";

interface IState {
  loading: boolean;
  center: ISelectOption;
  displayModal: boolean;
  patientData: IPatient;
  therapistData: ITherapist;
  sort: boolean;
}

const TherapistWiseSession = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [dischargeDate, setDischargeDate] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [dateArray, setDateArray] = useState<string[]>([]);
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
    patientData: { _id: "", firstName: "", lastName: "", uhid: "", patientPicUrl: "", gender: "" },
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
      const response = await getTherapistSession({
        startDate,
        endDate,
        centerId: centers.join(",")
      });

      if (response.data.status === "success") {
        setData(response.data.data);
        setDischargeDate(response?.data?.data?.dischargeResult);

        const dates: string[] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= new Date(endDate)) {
          dates.push(currentDate.toISOString().split("T")[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setDateArray(dates);
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
            <p className="text-[22px] font-bold">Therapist Wise Session</p>
            <p className="text-[10px] mt-2 font-medium ">
              R - Regular 15 min Session, T - 45-60 min Therapy Session, NF- Neurofeedback, HT -
              History, FS - Family Session, FM - Family Meeting, FC - Family Call, MSE, LOA Leave of
              Absence
            </p>
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

                    {dateArray.map((date, id) => (
                      <th
                        key={id}
                        className="bg-[#CCB69E] text-nowrap px-3 py-2 text-center text-xs font-semibold text-black"
                      >
                        <div className="w-44 mx-auto">{formatDate(date)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.patients?.length === 0 && (
                    <tr>
                      <td
                        colSpan={dateArray.length + 3}
                        className="text-center py-10 text-gray-500"
                      >
                        No patients found.
                      </td>
                    </tr>
                  )}

                  {data?.patients
                    ?.slice()
                    .sort((a, b) =>
                      state.sort
                        ? a.firstName.localeCompare(b.firstName)
                        : b.firstName.localeCompare(a.firstName)
                    )
                    .map((patient) => {
                      // All notes for this patient
                      const patientNotes =
                        data?.notes?.filter((note) => note.patientId === patient._id) || [];

                      // Group by therapistId
                      const notesByTherapist: Record<string, INote[]> = patientNotes.reduce(
                        (acc, note) => {
                          const therapistId = note.therapistId?._id || "unknown";
                          if (!acc[therapistId]) acc[therapistId] = [];
                          acc[therapistId].push(note);
                          return acc;
                        },
                        {} as Record<string, INote[]>
                      );

                      // If patient has no notes, render a single row with empty notes
                      if (patientNotes.length === 0) {
                        return (
                          <tr key={patient._id} className="border-b border-[#d9d4c9] font-semibold">
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
                                  {patient.patientPicUrl ? (
                                    <img
                                      src={patient.patientPicUrl}
                                      alt="profile"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="uppercase text-sm font-medium">
                                      {patient.firstName?.slice(0, 1)}
                                      {patient.lastName?.slice(0, 1)}
                                    </div>
                                  )}
                                </div>
                                <div className="w-[120px] truncate ">
                                  {patient.firstName} {patient.lastName}
                                  <br />
                                  {formatId(patient.uhid)}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sticky left-[200px] pr-10 z-10 bg-white py-4 text-xs text-center text-black text-nowrap">
                              {patient.centerId?.centerName}
                            </td>
                            <td className="px-3 sticky left-[340px] pr-10 z-10 bg-white py-4 text-xs text-left">
                              -
                            </td>
                            {dateArray.map((date, idx) => (
                              <td
                                key={idx}
                                className={`px-3 py-4 text-xs ${
                                  idx % 2 === 0 ? "" : "bg-gray-100"
                                } text-center font-medium text-black`}
                              >
                                {getAdmissionStatus(
                                  dischargeDate,
                                  patient._id,
                                  new Date(`${date}T10:00:00Z`)
                                )}
                              </td>
                            ))}
                          </tr>
                        );
                      }

                      // Else render rows per therapist
                      return Object.entries(notesByTherapist).map(([therapistId, notes]) => {
                        const notesByDate = notes.reduce<Record<string, INote[]>>((acc, note) => {
                          const date = note.noteDateTime.slice(0, 10);
                          if (!acc[date]) acc[date] = [];
                          acc[date].push(note);
                          return acc;
                        }, {});

                        return (
                          <tr
                            key={`${patient._id}-${therapistId}`}
                            className="border-b border-[#d9d4c9] font-semibold"
                          >
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
                                  {patient.patientPicUrl ? (
                                    <img
                                      src={patient.patientPicUrl}
                                      alt="profile"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="uppercase text-sm font-medium">
                                      {patient.firstName?.slice(0, 1)}
                                      {patient.lastName?.slice(0, 1)}
                                    </div>
                                  )}
                                </div>
                                <div className="w-[120px] truncate ">
                                    {patient.firstName} {patient.lastName}
                                  <br />
                                  {formatId(patient.uhid)}
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sticky left-[200px] pr-10 z-10 bg-white py-4 text-xs text-center text-black text-nowrap">
                              {patient.centerId?.centerName}
                            </td>
                            <td className="px-3 sticky left-[340px] pr-10 z-10 bg-white py-4 text-xs text-left">
                              {notes[0].therapistId?.firstName} {notes[0].therapistId?.lastName}
                            </td>
                            {dateArray.map((date, idx) => {
                              const notesForDate = notesByDate[date] || [];
                              const dayOfWeek = new Date(date).getDay();
                              if (notesForDate.length > 0) {
                                return (
                                  <td
                                    key={idx}
                                    className={`px-3 py-4 text-xs ${
                                      idx % 2 === 0 ? "" : "bg-gray-100"
                                    } text-center font-medium text-black`}
                                  >
                                    <div className="flex flex-col gap-1 justify-center">
                                      {notesForDate.map((value) => (
                                        <div
                                          key={value._id}
                                          className="flex items-center justify-center gap-2"
                                          title={value.sessionType.join(", ")}
                                        >
                                          <div className="relative">
                                            <img
                                              onClick={() => {
                                                setModalNote([value]);
                                                setState((prev) => ({
                                                  ...prev,
                                                  displayModal: true,
                                                  patientData: patient,
                                                  therapistData: value.therapistId
                                                }));
                                              }}
                                              src={messageIcon}
                                              className="w-4 h-4 text-[#505050] cursor-pointer"
                                            />
                                            {value.note?.length > 0 && (
                                              <div className="-top-1 -right-1 p-1 rounded-full bg-red-500 absolute"></div>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="text-base">
                                              {value.sessionType?.length
                                                ? value.sessionType
                                                    .toString()
                                                    .match(/\b[A-Z]{1,4}\b(?=\s*-\s*)/g)
                                                    ?.join(", ")
                                                : null}
                                            </div>
                                            {value?.file && value.file.filePath && (
                                              <Link
                                                to={value.file.filePath}
                                                target="_blank"
                                                title={value.file.fileName}
                                                className="underline text-[#575F4A]"
                                              >
                                                File Link
                                              </Link>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                );
                              }
                              if (dayOfWeek === 0) {
                                return (
                                  <td
                                    key={idx}
                                    className={`px-3 py-4 text-xs ${
                                      idx % 2 === 0 ? "" : "bg-gray-100"
                                    } text-center text-gray-500`}
                                  >
                                    Sunday
                                  </td>
                                );
                              }
                              return (
                                <td
                                  key={idx}
                                  className={`px-3 py-4 text-xs ${
                                    idx % 2 === 0 ? "" : "bg-gray-100"
                                  } text-center font-medium text-black`}
                                >
                                  {getAdmissionStatus(
                                    dischargeDate,
                                    patient._id,
                                    new Date(`${date}T10:00:00Z`)
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      });
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Modal
        // crossIcon
        isOpen={state.displayModal}
        toggleModal={() => {
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
              gender: ""
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
        <div className="w-3xl h-[70vh] overflow-hidden  mx-auto bg-gray-100 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`flex border-2 ${
                state.patientData?.gender == "Male"
                  ? "border-[#00685F]"
                  : state.patientData?.gender == "Female"
                  ? "border-[#F14E9A]"
                  : "border-gray-500"
              } rounded-full mr-4 w-10 h-10 bg-[#C1D1A8] border overflow-hidden items-center justify-center`}
            >
              {state.patientData.patientPicUrl ? (
                <img
                  alt="Profile picture of a man with short hair and beard, wearing a blue shirt"
                  className="  rounded-full object-cover"
                  src={state.patientData.patientPicUrl}
                />
              ) : (
                <div className="uppercase  text-sm font-medium">
                  {state.patientData?.firstName?.trim().slice(0, 1)}
                  {state.patientData?.lastName?.trim().slice(0, 1)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-900 leading-tight">
                {state.patientData.firstName} {state.patientData.lastName}
              </span>
              <span className="text-xs text-gray-700 leading-tight">
                {formatId(state.patientData.uhid)}
              </span>
            </div>
            <div className="flex-1"></div>
            <div className="text-left">
              <p className="text-xs text-[#393939] font-medium leading-tight">Center</p>
              <p className="text-xs font-semibold text-gray-900 leading-tight">
                {state.patientData.centerId?.centerName}
              </p>
            </div>
            <div className="text-left px-4">
              <p className="text-xs text-[#393939] font-medium  leading-tight">Therapist</p>
              <p className="text-xs font-semibold text-gray-900 leading-tight">
                {state.therapistData.firstName} {state.therapistData.lastName}
              </p>
            </div>
          </div>
          <div className="my-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-900 mb-2">Therapist notes</p>
            </div>
            {modalNote?.map((value: INote, index) => (
              <div className="mb-4" key={index}>
                <p className="text-xs text-right font-bold text-gray-900 leading-tight">
                  {value.noteDateTime && formatDate(value?.noteDateTime)} (
                  {value?.sessionType.join(", ")})
                </p>
                <div className="w-full mt-4 h-[50vh] overflow-auto">
                  <p
                    dangerouslySetInnerHTML={{ __html: value.note }}
                    key={index}
                    className="text-xs my-2  font-semibold text-black bg-[#EEEEEE] rounded-md p-3 leading-relaxed"
                  ></p>
                </div>
              </div>
            ))}
          </div>
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
                  patientPicUrl: ""
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

export default TherapistWiseSession;
