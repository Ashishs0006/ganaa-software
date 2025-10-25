import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

import { RootState } from "@/redux/store/store";
import { resetTherapistNote, setDoctorNote } from "@/redux/slice/noteSlice";

import clock from "@/assets/images/clock.svg";
import kabab from "@/assets/images/kebab-menu.svg";
import calendar from "@/assets/images/calender.svg";

import {
  Button,
  BreadCrumb,
  DateRange,
  CustomTimeDoctor,
  CustomCalendar,
  Pagination,
  RichTextEditor,
  EmptyRecord,
  DeleteConfirm
} from "@/components";
import {
  createDoctorNotes,
  deleteDoctorNotes,
  getAllDoctorNotes,
  getAllLoa,
  getAllUser,
  getSinglePatient,
  getSinglePatientAdmissionHistory,
  updateDoctorNotes
} from "@/apis";

import {
  capitalizeFirstLetter,
  convertBackendDateToTime,
  formatId,
  formatDate,
  formateNormalDate
} from "@/utils/formater";
import handleError from "@/utils/handleError";
import compareObjects from "@/utils/compareObjects";

import { IUser } from "@/pages/Admin/PatientData/TherapistNotes/types";
import {
  IDoctorDropDownsState,
  IDoctorNote,
  IDoctorNoteState,
  IDoctorState
} from "@/pages/Admin/PatientData/Doctor/types";
import moment from "moment";
import { setloa } from "@/redux/slice/patientSlice";
import LoaBlankScreen from "@/components/LoaBlankScreen/LoaBlankScreen";
import MultiSelectDropdown from "@/components/MultiSelectDropdown/MultiSelectDropdown";
import { useAuth } from "@/providers/AuthProvider";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import { BsFiletypePdf } from "react-icons/bs";
import DataDownload from "./DataDownload/DataDownload";

const DoctorNotes = () => {
  const { id, aId } = useParams();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const popRefDoc = useRef<HTMLDivElement | null>(null);
  const [searchParams, _setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth } = useAuth();
  const patient = useSelector((store: RootState) => store.patient);

  const [data, setData] = useState<IDoctorNoteState>({
    id: "",
    patientId: "",
    patientAdmissionHistoryId: "",
    doctorId: "",
    note: "",
    sessionType: [],
    noteDate: moment().format("YYYY-MM-DD"),
    noteTime: moment().format("HH:mm:ss")
  });

  const [selectedSessions, setSelectedSessions] = useState<
    { sessionType: string; subSessionType?: string }[]
  >([]);

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
          dispatch(setloa({ loa: data?.data[0]?.loa, id: data?.data[0]?._id }));
        } else {
          dispatch(setloa({ loa: false, id: "" }));
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchLoa();
  }, [id, aId]);

  const [state, setState] = useState<IDoctorState>({
    popId: null,
    DateRangeModal: false,
    UHID: "",
    dateOfAdmission: "",
    patientId: "",
    patientAdmissionHistoryId: "",
    firstName: "",
    lastName: "",
    gender: "",
    assignedDoctor: "",
    patientProfilePic: "",
    doctorName: "",
    totalPages: "",
    isTodayNoteExist: false
  });

  const [dropDownsState, setDropDownsState] = useState<IDoctorDropDownsState>({
    displayAddForm: false,
    displayDropdown: false,
    isModalOpen: false,
    // openMenuId: null,
    displaySessionTypeDropdown: false
  });
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [totalDoctorNotes, setTotalDoctorNotes] = useState([]);
  const [DoctorNotes, setDoctorNotes] = useState<IDoctorNote[]>([]);
  const [allDoctors, setAllDoctors] = useState<IUser[]>([]);

  const notes = useSelector((store: RootState) => store.notes);

  const fetchDoctorNotes = async () => {
    const page = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-createdAt";

    if (id && aId) {
      try {
        const { data: patientData } = await getSinglePatient(id);
        const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);

        const assignedDoctorFirstName =
          patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.firstName || "";
        const assignedDoctorLastName =
          patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.lastName || "";
        const centerId = patientAdmissionHistory?.data?.resourceAllocation?.centerId?._id || "";
        const dateOfAdmission = patientAdmissionHistory?.data?.dateOfAdmission;
        const { data: doctorNotesData } = await getAllDoctorNotes({
          limit: 20,
          page: page,
          sort: sort,
          patientAdmissionHistoryId: aId,
          "noteDateTime[gte]": searchParams.get("startDate"),
          "noteDateTime[lte]": searchParams.get("endDate")
        });

        await fetchAllNotesToCheck(moment().format("YYYY-MM-DD"));

        setDoctorNotes(doctorNotesData.data);
        setState((prev) => ({
          ...prev,
          totalPages: doctorNotesData?.pagination?.totalPages,
          patientId: id,
          dateOfAdmission: dateOfAdmission,
          patientAdmissionHistoryId: aId,
          patientProfilePic: patientData?.data?.patientPicUrl || "",
          firstName: patientData?.data?.firstName || "",
          lastName: patientData?.data?.lastName || "",
          gender: patientData?.data?.gender || "",
          UHID: patientData?.data?.uhid || "",
          assignedDoctor: `${assignedDoctorFirstName} ${assignedDoctorLastName}`.trim(),
          doctorName: `${auth?.user?.firstName} ${auth?.user?.lastName}`
        }));
        let date = "";
        if (new Date(patientAdmissionHistory?.data?.dateOfAdmission) > new Date()) {
          date = patientAdmissionHistory?.data?.dateOfAdmission;
        }
        setData((prev) => ({
          ...prev,
          patientId: id,
          patientAdmissionHistoryId: aId,
          doctorId: auth?.user?._id,
          noteDate: date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
          noteTime: date ? moment(date).format("HH:mm") : moment().format("HH:mm")
        }));

        if (centerId) {
          const { data: doctorsData } = await getAllUser({
            limit: 100,
            page: 1,
            sort: "-createdAt",
            roles: "doctor",
            centerId: centerId
          });
          setAllDoctors(doctorsData?.data);
        }
      } catch (error) {
        console.error("Error fetching doctor notes or patient data:", error);
      }
    }
  };

  useEffect(() => {
    fetchDoctorNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchAllNotesToCheck = async (date?: string) => {
    try {
      const response = await getAllDoctorNotes({
        patientAdmissionHistoryId: aId
      });
      setTotalDoctorNotes(response.data.data);
      setState((prev) => ({
        ...prev,
        isTodayNoteExist:
          response.data.data.filter((elem: IDoctorNote) =>
            elem.noteDateTime.startsWith(date || data.noteDate)
          ).length > 0
      }));
    } catch (error) {
      console.error("Error fetching therapists:", error);
    }
  };

  const handleChangeQuill = useCallback((name: string, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const updateFunctionDoctorNotes = (id: string) => {
    const updatedState = compareObjects(notes.doctorNote, data, true);
    const payload: { [key: string]: unknown } = {};
    if (updatedState.note !== undefined) payload.note = updatedState.note;
    if (updatedState.doctorId !== undefined) payload.doctorId = updatedState.doctorId;
    if (updatedState.noteTime !== undefined || updatedState.noteDate !== undefined) {
      const formattedDateTime = new Date(`${data.noteDate} ${data.noteTime}`).toISOString();
      payload.noteDateTime = formattedDateTime;
    }
    payload.sessionType = data.sessionType;

    return updateDoctorNotes(id, payload);
  };

  const resetState = () => {
    dispatch(resetTherapistNote());
    setData((prev) => ({
      ...prev,
      id: "",
      note: "",
      sessionType: [],
      noteDate: moment().format("YYYY-MM-DD"),
      noteTime: moment().format("HH:mm:ss"),
      doctorId: auth?.user?._id
    }));
    setState((prev) => ({
      ...prev,
      doctorName: `${auth?.user?.firstName + " " + auth?.user?.lastName}`,
      isTodayNoteExist:
        totalDoctorNotes.filter((elem: IDoctorNote) => elem.noteDateTime.startsWith(data.noteDate))
          .length > 0
    }));
    setSelectedSessions([]);
  };

  const handleSubmit = async () => {
    try {
      if (!data.note.trim()) throw new Error("Note is required");
      if (!data.doctorId) throw new Error("Doctor is required");
      if (!data.noteDate || !data.noteTime) throw new Error("Both note date and time are required");

      if (data.id) {
        const response = await updateFunctionDoctorNotes(data.id);
        if (response && response.status == 200) {
          fetchDoctorNotes();
        }
        toast.success("Doctor Notes Updated Successfully");
        resetState();
      } else {
        const combinedDateTime = `${data.noteDate} ${data.noteTime}`;
        const formattedDateTime = new Date(combinedDateTime).toISOString();
        const body = {
          ...data,
          noteDateTime: formattedDateTime
        };
        const response = await createDoctorNotes(body);
        if (response && response?.status === 201) {
          toast.success("Note saved successfully");
          fetchDoctorNotes();
          resetState();
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const toggleDoctorMenu = () => {
    setDropDownsState({ ...dropDownsState, displayDropdown: !dropDownsState.displayDropdown });
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const toggleFunctionType = async (value: IDoctorNote, type: string) => {
    if (type == "edit") {
      const selected: { sessionType: string; subSessionType?: string }[] = [];

      if (Array.isArray(value.sessionType)) {
        value.sessionType.forEach((type) => {
          selected.push({ sessionType: type });
        });
      } else if (value.sessionType) {
        selected.push({ sessionType: value.sessionType });
      }

      setSelectedSessions(selected);
      dispatch(
        setDoctorNote({
          noteDate: value?.noteDateTime && moment(value.noteDateTime).format("YYYY-MM-DD"),
          noteTime: value?.noteDateTime && moment(value?.noteDateTime).format("HH:mm:ss"),
          note: value.note,
          doctorId: value.doctorId._id
        })
      );
      setState((prev) => ({
        ...prev,
        doctorName: value.doctorId.firstName + " " + value.doctorId.lastName,
        isTodayNoteExist: false
      }));
      setData((prev) => ({
        ...prev,
        id: value._id,
        note: value.note,
        doctorId: value.doctorId._id,
        sessionType: Array.isArray(value.sessionType)
          ? value.sessionType
          : value.sessionType
          ? [value.sessionType]
          : [],
        noteDate: value?.noteDateTime && moment(value?.noteDateTime).format("YYYY-MM-DD"),
        noteTime: value?.noteDateTime && moment(value?.noteDateTime).format("HH:mm:ss")
      }));
    }
    if (type == "delete") {
      setData((prevState) => ({
        ...prevState,
        id: value._id
      }));
      toggleModal();
    }
  };

  const confirmDeleteNote = async () => {
    const response = await deleteDoctorNotes(data.id);
    if (response.data?.status == "success") {
      resetState();
      toast.success(response.data?.message);
      fetchDoctorNotes();
      toggleModal();
    }
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleDisabled = () => {
    if ((!data?.note.trim() && state.isTodayNoteExist) || !data?.note.trim()) {
      return true;
    }
    return false;
  };

  const handleDateTimeChange = (datas: string, type: string) => {
    let value = moment().format("YYYY-MM-DD");
    if (datas) {
      value = moment(datas).format("YYYY-MM-DD");
    }
    if (type == "date") {
      setData((prev) => ({ ...prev, noteDate: value }));
    } else if (type == "time") {
      setData((prev) => ({ ...prev, noteTime: datas }));
    }
    if (totalDoctorNotes.length > 0) {
      const exist =
        totalDoctorNotes.filter(
          (elem: IDoctorNote) => elem.noteDateTime.startsWith(value) && elem._id != data.id
        ).length > 0;
      setState((prev) => ({
        ...prev,
        isTodayNoteExist: exist
      }));
      if (exist) {
        toast.error(`Note already exists On ${formateNormalDate(value)}`);
      }
    } else {
      fetchAllNotesToCheck();
    }
  };

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOpenMenuId(null);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);
  const handleClickOutsideDoc = (event: MouseEvent<Document>) => {
    if (popRefDoc.current && !popRefDoc.current.contains(event.target as Node)) {
      setDropDownsState({ ...dropDownsState, isModalOpen: false });
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideDoc as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideDoc as unknown as EventListener);
    };
  }, []);

  return (
    <div className="bg-[#F4F2F0] min-h-[calc(100vh-64px)]">
      <div className=" container">
        <div className="flex lg:px-8 sm:px-2  bg-[#F4F2F0] justify-between md:flex-row flex-col md:items-center">
          <div className="flex items-center gap-3">
            <div
              className="p-3 w-fit bg-white rounded-full cursor-pointer"
              onClick={() => {
                navigate(-1);
              }}
            >
              <FaArrowLeft />
            </div>
            <div className="  my-5 flex flex-col items-start">
              <BreadCrumb
                name={`${capitalizeFirstLetter(
                  state?.firstName.length > 15
                    ? state?.firstName.slice(0, 15) + "..."
                    : state?.firstName
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
              <div className=" text-[18px] font-bold">Doctor Notes</div>
            </div>
          </div>
          <div className="flex  justify-between border-b border-gray-500 ">
            <Link
              to={`/admin/patients/in-patient/${id}/daily-progress/${aId}/doctor/notes`}
              className="px-8 font-bold text-sm border-b cursor-pointer border-black py-3"
            >
              Notes
            </Link>
            <Link
              to={`/admin/patients/in-patient/${id}/daily-progress/${aId}/doctor/prescription`}
              className="px-8 text-sm py-3 cursor-pointer"
            >
              Prescription
            </Link>
          </div>
          <div className="h-fit max-w-xl rounded-xl ">
            <div className=" flex">
              <div className="flex  items-center py-4">
                <div
                  className={`flex rounded-full  border-2 ${
                    state.gender == "Male"
                      ? "border-[#00685F]"
                      : state.gender == "Female"
                      ? "border-[#F14E9A]"
                      : "border-gray-500"
                  }   overflow-hidden w-12 h-12 items-center justify-center`}
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
                <div className="ml-4">
                  <div className="flex mb-1  items-center">
                    <h2
                      title={`${state.firstName} ${state.lastName}`}
                      className="text-xs font-semibold"
                    >
                      {state.firstName &&
                        capitalizeFirstLetter(
                          state.firstName?.length > 15
                            ? state.firstName?.slice(0, 15) + "..."
                            : state.firstName
                        )}{" "}
                      {state.lastName &&
                        capitalizeFirstLetter(
                          state.lastName.length > 15
                            ? state.lastName.slice(0, 15) + "..."
                            : state.lastName
                        )}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-600">
                    UHID:
                    <span className="font-semibold text-black"> {formatId(state.UHID)}</span>
                  </p>
                </div>
              </div>
              <div className="border mx-5 h-10 my-auto"></div>
              <div>
                <div className="py-7 text-gray-500 text-xs font-medium">
                  Assigned Doctor <br />{" "}
                  <span className="text-black font-semibold text-xs">
                    {" "}
                    {state.assignedDoctor || "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <RBACGuard resource={RESOURCES.DOCOTOR_NOTES} action="write">
          {!patient.loa.loa ? (
            <div className=" bg-[#F4F2F0] p-5 lg:px-8 sm:px-4 py-0 pb-10 rounded-lg font-semibold">
              <div className="rounded-2xl  bg-white ">
                <div className="mb-2 flex items-center justify-between border-b border-gray-300">
                  <div className="flex items-center p-4">
                    <IoIosArrowUp
                      className={`cursor-pointer h-4 w-4 mr-1 ${
                        !dropDownsState.displayAddForm ? "" : "rotate-180"
                      }`}
                      onClick={() => {
                        setDropDownsState({
                          ...dropDownsState,
                          displayAddForm: !dropDownsState.displayAddForm
                        });
                      }}
                    />
                    <div className="text-[13px] text-nowrap whitespace-nowrap font-bold">
                      Add Details
                    </div>
                    {!dropDownsState.displayAddForm && (
                      <div className="flex">
                        <div className="ml-4 text-nowrap flex text-xs items-center text-gray-500">
                          <CustomCalendar
                            value={data.noteDate}
                            disabledDate={(current) => {
                              if (!current) return false;

                              const minDate = new Date(state.dateOfAdmission);
                              minDate.setHours(0, 0, 0, 0); // normalize

                              const currentDate = current.toDate(); // Convert from Moment to JS Date
                              currentDate.setHours(0, 0, 0, 0); // normalize

                              return currentDate < minDate;
                            }}
                            onChange={(date) => {
                              handleDateTimeChange(date, "date");
                            }}
                          >
                            <div className="flex items-center">
                              {data?.noteDate && formateNormalDate(data?.noteDate)}

                              <div className="flex items-center justify-center w-5 mx-1 h-5">
                                <img
                                  alt="calender"
                                  src={calendar}
                                  className="w-full h-full cursor-pointer"
                                />
                              </div>
                            </div>
                          </CustomCalendar>
                          <span className="mx-2">|</span>

                          <CustomTimeDoctor
                            value={data.noteTime}
                            onChange={(time) => {
                              handleDateTimeChange(time, "time");
                            }}
                          >
                            <div title={data.noteTime} className="flex items-center">
                              {data.noteTime.slice(0, 5)}
                              <div className="flex items-center justify-center w-5 mx-1 h-5">
                                <img
                                  alt="clock"
                                  src={clock}
                                  className="w-full h-full cursor-pointer ml-2"
                                />
                              </div>
                            </div>
                          </CustomTimeDoctor>
                        </div>

                        <div
                          onClick={() => {
                            toggleDoctorMenu();
                          }}
                          ref={popRefDoc}
                          className="ml-8  w-[160px] gap-1 relative text-xs cursor-pointer flex items-center text-gray-500"
                        >
                          <div className="font-medium">Doctor: </div>
                          <div className="text-[#292929] w-[70%] truncate font-bold">
                            {state.doctorName}
                          </div>
                          <IoIosArrowDown
                            onClick={() => {
                              toggleDoctorMenu();
                            }}
                            className="text-black h-4 w-4 cursor-pointer"
                          />
                          {dropDownsState.displayDropdown && (
                            <div className="absolute top-5  left-5   mt-1 z-20 bg-white shadow-lg rounded-md w-[210px]">
                              <ul className="py-2 px-2 flex gap-4 flex-col justify-center">
                                {allDoctors.length >= 0 &&
                                  allDoctors.map((value: IUser, index: number) => {
                                    return (
                                      <div className="" key={index}>
                                        <div
                                          onClick={() => {
                                            setState({
                                              ...state,
                                              doctorName: `${value.firstName}  ${value.lastName}`
                                            });
                                            setData({
                                              ...data,
                                              doctorId: value._id
                                            });
                                            // toggleDoctorMenu();
                                          }}
                                          className="flex pb-1 gap-[30px]"
                                        >
                                          <li className=" text-wrap text-sm font-semibold cursor-pointer hover:bg-gray-100">
                                            {value.firstName + " " + value.lastName}
                                          </li>
                                          <hr />
                                        </div>
                                        <hr />
                                      </div>
                                    );
                                  })}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 relative text-nowrap whitespace-nowrap cursor-pointer z-30 text-xs flex items-center text-gray-500">
                          <div className="font-medium">Session Type: </div>
                          <div className="text-[#292929] flex items-center mx-2 font-bold">
                            {/* {`${data.sessionType}${
                            data.subSessionType ? ` (${data.subSessionType})` : ""
                          }`} */}

                            {/* <IoIosArrowDown className="text-black ml-2 h-4 w-4 cursor-pointer" /> */}
                          </div>
                          {/* {dropDownsState.displaySessionTypeDropdown && (
                            <div
                              ref={sessionMenuRef}
                              className="absolute top-5 left-0  mt-1  bg-white shadow-lg rounded-md w-[230px]"
                            >
                              <ul className="py-2  flex  flex-col justify-center">
                                {dropdown.sessionType.data.length >= 0 &&
                                  dropdown.sessionType.data.map(
                                    (value: ISessionType, index: number) => {
                                      return (
                                        <div
                                          className="group relative hover:bg-[#FDF4E5] border-b bg-white  w-full"
                                          key={index}
                                        >
                                          <div
                                            onClick={() => {
                                              if (value.name !== "A - Assessment") {
                                                setData({
                                                  ...data,
                                                  sessionType: value.name,
                                                  subSessionType: "",
                                                  score: ""
                                                });
                                              } else {
                                                setData({
                                                  ...data,
                                                  sessionType: value.name,
                                                  subSessionType: ""
                                                });
                                              }
                                              toggleSessionTypeMenu();
                                            }}
                                            className="flex  gap-[30px]"
                                          >
                                            <li className="  p-3 w-full flex items-center justify-between text-wrap text-sm  font-semibold cursor-pointer ">
                                              {value.name}
                                              {value.subMenu.length > 0 && <IoIosArrowForward />}
                                            </li>
                                          </div>
                                          <ul
                                            className={`py-2 group-hover:flex absolute -right-23   ${
                                              dropdown.sessionType.data.length - 1 > index + 2
                                                ? "-top-2"
                                                : "-bottom-29"
                                            }   hidden  flex-col justify-center`}
                                          >
                                            {value.subMenu.length > 0 &&
                                              value.subMenu.map((valuee: string, indexx: number) => {
                                                return (
                                                  <div
                                                    className=" rounded shadow hover:bg-[#FDF4E5] bg-white  w-full"
                                                    key={indexx}
                                                  >
                                                    <div
                                                      onClick={() => {
                                                        setData({
                                                          ...data,
                                                          sessionType: value.name,
                                                          subSessionType: valuee
                                                        });
                                                        toggleSessionTypeMenu();
                                                      }}
                                                      className="flex  gap-[30px]"
                                                    >
                                                      <li className=" p-3 text-wrap text-sm  font-semibold cursor-pointer ">
                                                        {valuee}
                                                      </li>
                                                      <hr />
                                                    </div>
                                                    <hr />
                                                  </div>
                                                );
                                              })}
                                          </ul>
                                        </div>
                                      );
                                    }
                                  )}
                              </ul>
                            </div>
                          )} */}
                          <MultiSelectDropdown
                            placeholder="Select Session"
                            options={[
                              { name: "R - Regular" },
                              { name: "FC - Family Counseling" },
                              { name: "RDU - Referring Doctor Update" }
                            ]}
                            selectedValues={selectedSessions}
                            onChange={(updated) => {
                              setSelectedSessions(updated);

                              const sessionTypeSet = new Set<string>();

                              for (const item of updated) {
                                sessionTypeSet.add(item.sessionType);
                              }
                              setData((prev) => ({
                                ...prev,
                                sessionType: Array.from(sessionTypeSet)
                              }));
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {!patient.loa.loa && (
                    <div className="flex sm:flex-col md:flex-row items-center px-4">
                      <div
                        className="mr-7 cursor-pointer text-nowrap whitespace-nowrap text-xs text-[#636363]"
                        onClick={() => {
                          resetState();
                        }}
                      >
                        Clear all
                      </div>
                      <Button
                        variant="outlined"
                        disabled={handleDisabled()}
                        onClick={() => {
                          if (!state.isTodayNoteExist) {
                            handleSubmit();
                          }
                        }}
                        type="submit"
                        className="rounded-xl! text-xs! bg-[#575F4A] px-6! py-1! text-white"
                      >
                        {data.id ? "Update" : "Save"}
                      </Button>
                    </div>
                  )}
                </div>

                <div
                  className={`${
                    dropDownsState.displayAddForm ? "hidden" : "grid"
                  } pb-5 grid-cols-1 px-5 py-1 items-center`}
                >
                  <RichTextEditor
                    label="Notes"
                    disable={state.isTodayNoteExist}
                    // required
                    placeholder="Start typing..."
                    maxLength={5000}
                    name="note"
                    value={data.note}
                    onChange={handleChangeQuill}
                  />
                </div>
              </div>
            </div>
          ) : (
            <LoaBlankScreen />
          )}
        </RBACGuard>

        <div className="px-8 bg-white font-semibold text-xs py-5">
          <div>
            {(searchParams.get("startDate") || DoctorNotes.length > 0) && (
              <div className="flex justify-between items-center w-full py-4 pl-3">
                <p className="text-[14px] font-semibold ml-3">All Records</p>

                <div className="flex items-center justify-center gap-2">
                  <DateRange>
                    <Button
                      variant="outlined"
                      size="base"
                      className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                    >
                      <img src={calendar} alt="calender" />
                      {searchParams.get("startDate")
                        ? `Date Range ${formatDate(searchParams.get("startDate"))} to ${formatDate(
                            searchParams.get("endDate")
                          )}`
                        : "Date Range"}
                    </Button>
                  </DateRange>
                  <DataDownload
                    patientDetails={state}
                    aid={aId}
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

                  {/* <Button
                    type="submit"
                    variant="outlined"
                    size="base"
                    className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                  >
                    <BiPrinter className="mr-2" size={18} />
                    Print
                  </Button>
                  <Button
                    type="submit"
                    variant="outlined"
                    size="base"
                    className="flex px-6! py-2! text-xs! border-[#D4D4D4]! border!  rounded-lg  text-[#505050] "
                  >
                    View
                  </Button> */}
                </div>
              </div>
            )}
          </div>
          {DoctorNotes.length > 0 ? (
            <table className="w-full text-xs text-left">
              <thead className="bg-[#E9E8E5] w-full  top-0 sticky z-0 ">
                <tr className="text-[#505050]  font-medium">
                  <th className="px-6 py-3  w-1/10 text-xs">Date & Time</th>
                  <th className="px-2 py-3 w-1/10 text-xs">Doctor</th>
                  <th className="px-2 py-3 w-1/10 text-xs">Session Type</th>
                  <th className="px-2 py-3 w-1/10 text-xs">Notes</th>
                  <RBACGuard resource={RESOURCES.DOCOTOR_NOTES} action="write">
                    <th className="px-2 py-3  w-1/10 text-xs">{""}</th>
                  </RBACGuard>
                </tr>
              </thead>
              <tbody className="bg-white w-full h-full">
                {DoctorNotes.map((value: IDoctorNote, index: number) => {
                  return (
                    <tr
                      key={index}
                      className="hover:bg-[#F6F6F6C7] border-b text-xs border-[#DCDCDCE0]"
                    >
                      <td className="pl-7 py-7 w-1/6">
                        <div className="flex flex-col justify-center">
                          <p>{value.noteDateTime && formatDate(value.noteDateTime)}</p>
                          <p className="text-gray-500 ">
                            {value.noteDateTime && convertBackendDateToTime(value.noteDateTime)}
                          </p>
                        </div>
                      </td>
                      <td className="px-2 py-7 w-1/6 ">
                        {value.doctorId.firstName} {value.doctorId.lastName}
                      </td>
                      <td className="px-2 py-7 w-1/7 ">
                        {`${value.sessionType.length > 0 ? value.sessionType : "--"}`}
                      </td>
                      <td
                        className="px-2 py-7  w-3/5 overflow-hidden text-overflow-ellipsis break-all max-w-md"
                        dangerouslySetInnerHTML={{ __html: value?.note }}
                      ></td>
                      <RBACGuard resource={RESOURCES.DOCOTOR_NOTES} action="write">
                        <td className="w-fit">
                          <div
                            onClick={() => {
                              if (!patient.loa.loa) {
                                toggleMenu(value?._id);
                              }
                            }}
                            className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-md hover:bg-[#D4E299] cursor-pointer"
                          >
                            <img src={kabab} alt="icon" className="w-full h-full" />
                            {openMenuId === value._id && (
                              <div
                                ref={menuRef}
                                className="absolute right-3 top-1 overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-lg z-10 flex items-center justify-center"
                              >
                                <div className="p-1  text-nowrap whitespace-nowrap gap-0 flex-col flex justify-center bg-white shadow-lg rounded-lg w-fit">
                                  <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                    <div
                                      onClick={() => {
                                        window.scrollTo({ top: 0 });
                                        toggleFunctionType(value, "edit");
                                      }}
                                      className="flex items-center  cursor-pointer"
                                    >
                                      <p>Edit</p>
                                    </div>
                                  </div>
                                  <hr />
                                  <DataDownload
                                    patientDetails={state}
                                    data={[value]}
                                    button={
                                      <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                        <div className="flex items-center  cursor-pointer">
                                          <p>Download</p>
                                        </div>
                                      </div>
                                    }
                                  />

                                  <hr />
                                  <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                    <div
                                      onClick={() => {
                                        toggleFunctionType(value, "delete");
                                      }}
                                      className="flex text-red-600 items-center  cursor-pointer"
                                    >
                                      <p>Delete</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </RBACGuard>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex justify-center items-center bg-white py-[33px] font-semibold text-xs h-full">
              <EmptyRecord />
            </div>
          )}
        </div>
      </div>

      <div className="container">
        <Pagination totalPages={state.totalPages} />
      </div>

      <DeleteConfirm
        toggleModal={toggleModal}
        isModalOpen={isModalOpen}
        confirmDeleteNote={confirmDeleteNote}
      />
    </div>
  );
};

export default DoctorNotes;
