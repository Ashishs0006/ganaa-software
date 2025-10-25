import { MouseEvent, SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

import { RootState } from "@/redux/store/store";
import { resetTherapistNote, setTherapistNote } from "@/redux/slice/noteSlice";

import {
  getAllTherapistNotes,
  createTherapistNotes,
  getAllUser,
  getSinglePatient,
  deleteTherapistNotes,
  updateTherapistNotes,
  getSinglePatientAdmissionHistory,
  getAllLoa
} from "@/apis";

import {
  Button,
  EmptyRecord,
  CustomCalendar,
  CustomTimePicker,
  Pagination,
  BreadCrumb,
  RichTextEditor,
  DateRange,
  DeleteConfirm,
  Input,
  CheckBox
} from "@/components";

import clock from "@/assets/images/clock.svg";
import calendar from "@/assets/images/calender.svg";
import kabab from "@/assets/images/kebab-menu.svg";

import {
  capitalizeFirstLetter,
  convertBackendDateToTime,
  formateNormalDate,
  formatId
} from "@/utils/formater";
import { formatDate } from "@/utils/formater";
import handleError from "@/utils/handleError";
import compareObjects from "@/utils/compareObjects";

import {
  ITherapistDropDownsState,
  ITherapistNote,
  ITherapistNoteState,
  ITherapistState,
  IUser
} from "@/pages/Admin/PatientData/TherapistNotes/types";
import moment from "moment";
// import { ISessionType } from "@/redux/slice/dropDown";

import pdfFile from "@/assets/images/pdfIcon.svg";
import { isNumeric } from "@/components/BasicDetaills/utils";
import { setloa } from "@/redux/slice/patientSlice";
import LoaBlankScreen from "@/components/LoaBlankScreen/LoaBlankScreen";
import MultiSelectDropdown from "@/components/MultiSelectDropdown/MultiSelectDropdown";
import { useAuth } from "@/providers/AuthProvider";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import TherapistDataDownload from "./TherapistDataDownload/TherapistDataDownload";
import { BsFiletypePdf } from "react-icons/bs";

const TherapistNotes = () => {
  const { id, aId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const sessionMenuRef = useRef<HTMLDivElement>(null);
  const therapistMenuRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ITherapistNoteState>({
    id: "",
    patientId: "",
    patientAdmissionHistoryId: "",
    note: "",
    file: null,
    fileName: "",
    therapistId: "",
    sessionType: [],
    score: "",
    subSessionType: [],
    noteDate: moment().format("YYYY-MM-DD"),
    noteTime: moment().format("HH:mm")
  });
  const [selectedSessions, setSelectedSessions] = useState<
    { sessionType: string; subSessionType?: string }[]
  >([]);

  const [state, setState] = useState<ITherapistState>({
    totalPages: "",
    firstName: "",
    lastName: "",
    UHID: "",
    age: "",
    patientProfilePic: "",
    assignedTherapist: "",
    patientAdmissionHistoryId: "",
    dateOfAdmission: "",
    patientId: "",
    gender: "",
    therapistName: "",
    isTodayNoteExist: false
  });
  const [dropDownsState, setDropDownsState] = useState<ITherapistDropDownsState>({
    displayAddForm: false,
    displayDropdown: false,
    isModalOpen: false,
    openMenuId: null,
    displaySessionTypeDropdown: false
  });
  const [therapistNotes, setTherapistNotes] = useState([]);
  const [totalTherapistNotes, setTotalTherapistNotes] = useState([]);
  const [allTherapists, setAllTherapists] = useState([]);

  const patient = useSelector((store: RootState) => store.patient);

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

  const notes = useSelector((store: RootState) => store.notes);
  const dropdown = useSelector((store: RootState) => store.dropdown);

  const fetchTherapistNotes = async () => {
    try {
      const page = searchParams.get("page") || "1";
      const sort = searchParams.get("sort") || "-createdAt";

      if (id && aId) {
        const { data: patientData } = await getSinglePatient(id);
        const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);

        const { data: therapistNotesData } = await getAllTherapistNotes({
          limit: 20,
          page: page,
          sort: sort,
          patientAdmissionHistoryId: aId,
          "noteDateTime[gte]": searchParams.get("startDate"),
          "noteDateTime[lte]": searchParams.get("endDate")
        });
        await fetchAllNotesToCheck(moment().format("YYYY-MM-DD"));

        setTherapistNotes(therapistNotesData?.data);

        setState((prev) => ({
          ...prev,
          totalPages: therapistNotesData?.pagination?.totalPages,
          patientId: id,
          patientAdmissionHistoryId: aId,
          dateOfAdmission: patientAdmissionHistory?.data?.dateOfAdmission || "",
          patientProfilePic: patientData?.data?.patientPicUrl || "",
          firstName: patientData?.data?.firstName || "",
          lastName: patientData?.data?.lastName || "",
          gender: patientData?.data?.gender || "",
          age: patientData?.data?.age || "",
          UHID: patientData?.data?.uhid || "",
          assignedTherapist: `${
            patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.firstName || ""
          } ${
            patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.lastName || ""
          }`.trim(),
          therapistName: `${auth?.user?.firstName} ${auth?.user?.lastName}`
        }));
        let date = "";
        if (new Date(patientAdmissionHistory?.data?.dateOfAdmission) > new Date()) {
          date = patientAdmissionHistory?.data?.dateOfAdmission;
        }
        setData((prev) => ({
          ...prev,
          therapistId: auth?.user?._id,
          patientId: id,
          patientAdmissionHistoryId: aId,
          noteDate: date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
          noteTime: date ? moment(date).format("HH:mm") : moment().format("HH:mm")
        }));

        if (patientAdmissionHistory?.data?.resourceAllocation?.centerId?._id) {
          const { data: therapistsData } = await getAllUser({
            limit: 100,
            page: 1,
            sort: "-createdAt",
            roles: "therapist,Therapist+AM",
            centerId: patientAdmissionHistory?.data?.resourceAllocation?.centerId?._id
          });

          setAllTherapists(therapistsData?.data);
        }
      }
    } catch (error) {
      console.error("Error fetching therapist notes or patient data:", error);
    }
  };

  useEffect(() => {
    fetchTherapistNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchAllNotesToCheck = async (date?: string) => {
    try {
      const response = await getAllTherapistNotes({
        patientAdmissionHistoryId: aId
      });
      setTotalTherapistNotes(response.data.data);
      setState((prev) => ({
        ...prev,
        isTodayNoteExist:
          response.data.data.filter((elem: ITherapistNote) =>
            elem.noteDateTime.startsWith(date || data.noteDate)
          ).length > 0
      }));
    } catch (error) {
      console.error("Error fetching therapists:", error);
    }
  };

  // Every Time Note Date Change to Disable/enable Quill
  // useEffect(() => {
  //   if (totalTherapistNotes.length > 0) {
  //     const exist =
  //       totalTherapistNotes.filter(
  //         (elem: ITherapistNote) =>
  //           elem.noteDateTime.startsWith(data.noteDate) && elem._id != data.id
  //       ).length > 0;
  //     setState((prev) => ({
  //       ...prev,
  //       isTodayNoteExist: exist
  //     }));
  //     if (exist) {
  //       toast.error(`Note already exists On ${formateNormalDate(data.noteDate)}`);
  //     }
  //   } else {
  //     fetchAllNotesToCheck();
  //   }
  // }, [data.noteDate]);

  const resetState = () => {
    dispatch(resetTherapistNote());
    setData((prev) => ({
      ...prev,
      id: "",
      note: "",
      file: null,
      sessionType: [],
      score: "",
      subSessionType: [],
      noteDate: moment().format("YYYY-MM-DD"),
      noteTime: moment().format("HH:mm"),
      therapistId: auth?.user?._id
    }));
    setState((prev) => ({
      ...prev,
      therapistName: `${auth?.user?.firstName} ${auth?.user?.lastName}`,
      isTodayNoteExist:
        totalTherapistNotes.filter((elem: ITherapistNote) =>
          elem.noteDateTime.startsWith(data.noteDate)
        ).length > 0
    }));
    setSelectedSessions([]);
  };

  // const updateFunctionTtherapistNotes = (id: string) => {
  //   const updatedState = compareObjects(notes.therapistNote, data, true);
  //   const payload: { [key: string]: unknown } = {};
  //   if (updatedState.note !== undefined) payload.note = updatedState.note;
  //   if (updatedState.therapistId !== undefined)
  //     payload.therapistId = updatedState.therapistId;
  //   if (updatedState.noteTime !== undefined || updatedState.noteDate !== undefined) {
  //     const formattedDateTime = new Date(`${data.noteDate} ${data.noteTime}`).toISOString();
  //     payload.noteDateTime = formattedDateTime;
  //   }
  //   if (updatedState.file != null) {
  //     payload.file = updatedState.file;
  //   }
  //   if (updatedState.sessionType) {
  //     payload.sessionType = updatedState.sessionType;
  //   }
  //   if (updatedState.subSessionType) {
  //     payload.subSessionType = updatedState.subSessionType;
  //   }
  //   if (!Object.entries(payload).length) {
  //     return;
  //   }

  //   return updateTherapistNotes(id, payload);
  // };

  const updateFunctionTherapistNotes = (id: string) => {
    const updatedState = compareObjects(notes.therapistNote, data, true);
    const formData = new FormData();

    if (updatedState.note !== undefined) formData.append("note", updatedState.note);
    if (updatedState.therapistId !== undefined)
      formData.append("therapistId", updatedState.therapistId);

    if (updatedState.noteTime !== undefined || updatedState.noteDate !== undefined) {
      const formattedDateTime = new Date(`${data.noteDate} ${data.noteTime}`).toISOString();
      formData.append("noteDateTime", formattedDateTime);
    }

    if (data.file instanceof File) {
      formData.append("file", data.file);
    } else {
      if (typeof data.file !== "string") formData.append("file", "");
    }

    const keysToInclude = ["sessionType", "subSessionType"];

    Object.entries(updatedState).forEach(([key, value]) => {
      if (!keysToInclude.includes(key)) return;

      if (Array.isArray(value)) {
        if (value.length === 0) {
          if (key == "subSessionType") {
            formData.append(key, "");
          } else {
            formData.append(key, "");
          }
        } else {
          value.forEach((v) => formData.append(key, v));
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    if (
      updatedState.sessionType &&
      Array.isArray(updatedState.sessionType) &&
      updatedState.sessionType.includes("A - Assessment") &&
      updatedState.score != undefined
    ) {
      formData.append("score", updatedState.score);
    }
    if (
      updatedState.sessionType &&
      Array.isArray(updatedState.sessionType) &&
      !updatedState.sessionType.includes("A - Assessment") &&
      updatedState.score != undefined
    ) {
      formData.append("score", updatedState.score);
    }

    // Check if FormData has any entries
    if (!Array.from(formData.keys()).length) {
      return;
    }

    return updateTherapistNotes(id, formData);
  };

  const handleSubmit = async () => {
    try {
      if (!id) {
        throw new Error("Patient not found");
      }
      if (!data.note.trim()) throw new Error("Note is required");
      if (!data.therapistId) throw new Error("Therapist is required");
      if (!data.noteDate || !data.noteTime) throw new Error("Both note date and time are required");

      if (data.id) {
        const response = await updateFunctionTherapistNotes(data.id);
        if (response && response.status == 200) {
          fetchTherapistNotes();
        }
        toast.success("Therapist Notes Updated Successfully");
        resetState();
      } else {
        const formattedDateTime = new Date(`${data.noteDate} ${data.noteTime}`).toISOString();
        const body: Partial<typeof data> & { noteDateTime: string } = {
          ...data,
          noteDateTime: formattedDateTime
        };
        if (
          (Array.isArray(body.sessionType) && !body.sessionType.includes("A - Assessment")) ||
          (!Array.isArray(body.sessionType) && body.sessionType !== "A - Assessment") ||
          !body.score?.trim()
        ) {
          delete body.score;
        }

        if (!body.sessionType) {
          delete body.sessionType;
        }
        if (!body.subSessionType) {
          delete body.subSessionType;
        }
        const formData = new FormData();

        Object.entries(body).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else if (value instanceof File) {
            formData.append(key, value);
          } else if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        const response = await createTherapistNotes(formData);
        if (response && response?.status === 201) {
          toast.success("Note saved successfully");
          fetchTherapistNotes();
          resetState();
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const toggleTherapistsMenu = () => {
    setDropDownsState({ ...dropDownsState, displayDropdown: !dropDownsState.displayDropdown });
  };

  const toggleSessionTypeMenu = () => {
    setDropDownsState((prev) => ({
      ...prev,
      displaySessionTypeDropdown: !prev.displaySessionTypeDropdown
    }));
  };

  const toggleMenu = (id: string) => {
    setDropDownsState((prev) => ({
      ...prev,
      openMenuId: dropDownsState.openMenuId === id ? null : id
    }));
  };

  const toggleFunctionType = async (value: ITherapistNote, type: string) => {
    if (type == "edit") {
      const selected: { sessionType: string; subSessionType?: string }[] = [];

      if (Array.isArray(value.sessionType)) {
        value.sessionType.forEach((type) => {
          if (type === "A - Assessment" && value.subSessionType) {
            selected.push({ sessionType: type, subSessionType: value.subSessionType });
          } else {
            selected.push({ sessionType: type });
          }
        });
      } else if (value.sessionType) {
        if (value.sessionType === "A - Assessment" && value.subSessionType) {
          selected.push({
            sessionType: value.sessionType,
            subSessionType: value.subSessionType
          });
        } else {
          selected.push({ sessionType: value.sessionType });
        }
      }

      setSelectedSessions(selected);

      dispatch(
        setTherapistNote({
          noteDate: value?.noteDateTime && moment(value.noteDateTime).format("YYYY-MM-DD"),
          noteTime: value?.noteDateTime && moment(value?.noteDateTime).format("HH:mm"),
          note: value.note,
          therapistId: value.therapistId._id
        })
      );
      setState((prev) => ({
        ...prev,
        therapistName: value.therapistId.firstName + " " + value.therapistId.lastName,
        isTodayNoteExist: false
      }));
      setData((prev) => ({
        ...prev,
        id: value._id,
        note: value.note,
        sessionType: Array.isArray(value.sessionType)
          ? value.sessionType
          : value.sessionType
          ? [value.sessionType]
          : [],
        score: value.score || "",
        subSessionType: Array.isArray(value.subSessionType)
          ? value.subSessionType
          : value.subSessionType
          ? [value.subSessionType]
          : [],
        therapistId: value.therapistId._id,
        noteDate: value?.noteDateTime && moment(value.noteDateTime).format("YYYY-MM-DD"),
        noteTime: value?.noteDateTime && moment(value?.noteDateTime).format("HH:mm"),
        file: value?.file?.filePath || "",
        fileName: value?.file?.fileName || ""
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

  const handleChangeQuill = useCallback((name: string, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDropFiles = useCallback((files: File[]) => {
    const maxSize = 5 * 1024 * 1024;
    try {
      if (files[0].size > maxSize) {
        throw new Error("File size exceeds 5 MB limit.");
      }
    } catch (error) {
      handleError(error);
    }
    if (files[0].size < maxSize) {
      setData((prev) => ({ ...prev, file: files[0] }));
    }
  }, []);

  const confirmDeleteNote = async () => {
    const response = await deleteTherapistNotes(data.id);
    if (response.data?.status == "success") {
      resetState();
      toast.success(response.data?.message);
      fetchTherapistNotes();
      toggleModal();
    }
  };

  const toggleModal = () => {
    setDropDownsState({ ...dropDownsState, isModalOpen: !dropDownsState.isModalOpen });
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
    if (totalTherapistNotes.length > 0) {
      const exist =
        totalTherapistNotes.filter(
          (elem: ITherapistNote) => elem.noteDateTime.startsWith(value) && elem._id != data.id
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

  const [open, setOpen] = useState(false);

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

  const handleClickKabakOutside = (event: MouseEvent<Document>) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setDropDownsState((prev) => ({
        ...prev,
        openMenuId: null
      }));
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickKabakOutside as unknown as EventListener);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickKabakOutside as unknown as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const handleClickOutsideSession = (event: Event) => {
      const mouseEvent = event as unknown as MouseEvent;
      if (sessionMenuRef.current && !sessionMenuRef.current.contains(mouseEvent.target as Node)) {
        toggleSessionTypeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutsideSession);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSession);
    };
  }, []);

  const handleChange = useCallback((e: React.SyntheticEvent) => {
    const numberFieldsName = ["score"];
    const { name, value } = e.target as HTMLInputElement;
    if (numberFieldsName.includes(name)) {
      if (isNumeric(value)) {
        setData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeleteFile = () => {
    setData((prev) => ({ ...prev, file: null, fileName: "" }));
  };

  useEffect(() => {
    const handleClickOutsideTherapist = (event: Event) => {
      const mouseEvent = event as unknown as MouseEvent;
      if (
        therapistMenuRef.current &&
        !therapistMenuRef.current.contains(mouseEvent.target as Node)
      ) {
        setDropDownsState({ ...dropDownsState, displayDropdown: false });
      }
    };

    document.addEventListener("mousedown", handleClickOutsideTherapist);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideTherapist);
    };
  }, []);

  return (
    <div className="bg-[#F4F2F0]  min-h-[calc(100vh-64px)]">
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
            <div className="my-5 flex flex-col items-start" aria-label="Breadcrumb">
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
              <div className=" text-[18px] font-bold">Therapist Notes</div>
            </div>
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
                    <span className="font-medium text-black"> {formatId(state.UHID)}</span>
                  </p>
                </div>
              </div>
              <div className="border mx-5 h-10 my-auto"></div>
              <div>
                <div className="py-7 text-gray-500 text-xs font-medium">
                  Assigned Therapist <br />
                  <span className="text-black font-semibold text-xs">
                    {state.assignedTherapist || "--"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RBACGuard resource={RESOURCES.THERAPIST_NOTES} action="write">
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
                      <div className="flex text-nowrap text-xs whitespace-nowrap">
                        <div className="ml-4 flex  items-center text-gray-500">
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
                              {data?.noteDate && formateNormalDate(data.noteDate)}

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

                          <CustomTimePicker
                            value={data.noteTime}
                            onChange={(time) => {
                              handleDateTimeChange(time, "time");
                            }}
                          >
                            {data.noteTime && data.noteTime.split(":").slice(0, 2).join(":")}
                            <div className="flex items-center justify-center w-5 mx-1 h-5">
                              <img
                                src={clock}
                                alt="clock"
                                className="w-full h-full cursor-pointer ml-2"
                              />
                            </div>
                          </CustomTimePicker>
                        </div>

                        <div className="ml-8  w-[160px] min-w-[160px] z-30 gap-1 relative text-xs cursor-pointer flex items-center text-gray-500">
                          <div className="font-medium">Therapist: </div>
                          <div
                            onClick={() => {
                              toggleTherapistsMenu();
                            }}
                            className="text-[#292929] w-[60%] truncate font-bold"
                          >
                            {state.therapistName}
                          </div>
                          <IoIosArrowDown
                            onClick={() => {
                              toggleTherapistsMenu();
                            }}
                            className="text-black h-4 w-4 cursor-pointer"
                          />
                          {dropDownsState.displayDropdown && (
                            <div
                              ref={therapistMenuRef}
                              className="absolute top-5 left-5  mt-1  bg-white shadow-lg rounded-md w-[210px]"
                            >
                              <ul className="py-2 px-2 flex gap-4 flex-col justify-center">
                                {allTherapists.length >= 0 &&
                                  allTherapists.map((value: IUser, index: number) => {
                                    return (
                                      <div className="" key={index}>
                                        <div
                                          onClick={() => {
                                            setState({
                                              ...state,
                                              therapistName: `${value.firstName}  ${value.lastName}`
                                            });
                                            setData({
                                              ...data,
                                              therapistId: value._id
                                            });
                                            toggleTherapistsMenu();
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
                          <div
                            onClick={() => {
                              toggleSessionTypeMenu();
                            }}
                            className="text-[#292929] flex items-center mx-2 font-bold"
                          >
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
                            options={dropdown.sessionType.data}
                            selectedValues={selectedSessions}
                            onChange={(updated) => {
                              setSelectedSessions(updated);

                              const sessionTypeSet = new Set<string>();
                              const subSessionTypeSet = new Set<string>();

                              for (const item of updated) {
                                sessionTypeSet.add(item.sessionType);

                                if (item.sessionType === "A - Assessment" && item.subSessionType) {
                                  subSessionTypeSet.add(item.subSessionType);
                                }
                              }

                              setData((prev) => ({
                                ...prev,
                                sessionType: Array.from(sessionTypeSet),
                                subSessionType: Array.from(subSessionTypeSet)
                              }));
                            }}
                          />
                        </div>
                        <Input
                          id="score"
                          type="text"
                          placeholder="Enter Score"
                          name="score"
                          className={`w-[228px] mx-4 rounded-[7px]! ${
                            Array.isArray(data.sessionType) &&
                            data.sessionType.includes("A - Assessment")
                              ? "visible"
                              : "invisible"
                          }  font-bold placeholder:font-normal py-[6px]!`}
                          value={data.score}
                          onChange={handleChange}
                          maxLength={50}
                        />
                      </div>
                    )}
                  </div>
                  {!patient?.loa?.loa && (
                    <div className="flex sm:flex-col md:flex-row items-center px-4">
                      <div
                        className="mr-7 text-nowrap cursor-pointer whitespace-nowrap text-xs text-[#636363]"
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
                  <div className="col-span-1 col-start-1 ">
                    <RichTextEditor
                      name="note"
                      disable={state.isTodayNoteExist}
                      label="Notes"
                      // required
                      placeholder="Start typing..."
                      maxLength={5000}
                      value={data.note}
                      onChange={handleChangeQuill}
                    />
                  </div>
                </div>
                {/* <div className={`flex  items-center  gap-1  text-nowrap whitespace-nowrap`}>
              <div
                className={`px-3 mb-5  ml-5 py-1.5 w-fit flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative `}
              >
                <div className=" w-[30px] h-[30px] flex items-center overflow-hidden justify-center">
                  <img src={file} alt="file" className="w-full h-full" />
                  {data.file && (
                    <svg
                      onClick={() => {
                        handleDeleteFile();
                      }}
                      className="w-3 h-3 absolute top-2 right-2 text-red-500 cursor-pointer"
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
                  )}
                  <div id="view"  className="text-nowrap whitespace-nowrap">
                    {data.file && (
                      <div
                        className={`bg-gray-100 border absolute z-20 border-gray-50 py-2 px-2 ${
                          !open ? "flex" : "hidden"
                        } flex-col gap-2 w-fit rounded-xl  shadow-xl`}
                      >
                        <div className="py-1  w-60 text-nowrap whitespace-normal pl-2 pr-10  flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative">
                          <a
                            target="_blank"
                            className="flex gap-2 w-full items-center justify-center"
                          >
                            <div className=" w-[30px] h-[30px]  flex items-center overflow-hidden justify-center">
                              <img src={pdfFile} alt="file" className="w-full h-full" />
                            </div>
                            <div className="w-full truncate">
                              <p className="ml-5 w-[80%] truncate">{data.file.toString() || ""}</p>
                            </div>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <AppDropZone
                  onDrop={(files) => {
                    handleDropFiles(files);
                  }}
                  accept="application/pdf"
                >
                  {data.file ? (
                    <div className=" w-full">
                      <div>
                        <p className="font-medium text-[13px] truncate w-40">
                          {data.file instanceof File ? data.file?.name : data.fileName}
                        </p>
                      </div>

                      <p className="font-semibold text-[12px]">
                        Drag & Drop for <span className="underline cursor-pointer">Change</span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-[13px]">
                        Drag & Drop or{" "}
                        <span className={`underline cursor-pointer`}>Browse Files</span>
                      </p>
                      <p className="font-medium text-xs">Format: PDF, Max size: 5MB</p>
                    </div>
                  )}
                </AppDropZone>
                
              </div>
            </div> */}
                <div className="pb-6">
                  <CheckBox
                    checked={true}
                    name=""
                    handleDeletes={handleDeleteFile}
                    handleDrop={(files) => {
                      handleDropFiles(files);
                    }}
                    files={data.file instanceof File ? [data.file] : []}
                    filesString={
                      data.file && !(data.file instanceof File)
                        ? [
                            {
                              filePath: typeof data.file === "string" ? data.file : "",
                              fileUrl: typeof data.file === "string" ? data.file : "",
                              fileName: data.fileName || ""
                            }
                          ]
                        : undefined
                    }
                    ContainerClass="col-span-3"
                    checkHide
                    label={""}
                    handleCheck={function (_e: SyntheticEvent): void {
                      throw new Error("Function not implemented.");
                    }}
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
            {(searchParams.get("startDate") || therapistNotes.length > 0) && (
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
                  <TherapistDataDownload
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
                </div>
              </div>
            )}
          </div>
          {therapistNotes.length > 0 ? (
            <div>
              <table className="w-full text-xs font-semibold text-left">
                <thead className="bg-[#E9E8E5] w-full  top-0 sticky z-10 ">
                  <tr className="text-[#505050]  font-medium">
                    <th className="pl-7 py-3 w-1/7 text-xs">Date & Time</th>
                    <th className="px-2 py-3 w-1/7 text-xs">Therapist</th>
                    <th className="px-2 py-3 w-1/7 text-xs">Session Type</th>
                    <th className="px-2 py-3 w-1/7 text-xs">Score</th>
                    <th className="px-2 py-3 w-1/7 text-xs">File</th>
                    <th className="px-2 py-3 w-1/7 text-xs">Notes</th>
                    <RBACGuard resource={RESOURCES.THERAPIST_NOTES} action="write">
                      <th className="px-2 py-3 w-1/7 text-xs">{""}</th>
                    </RBACGuard>
                  </tr>
                </thead>

                <tbody className="bg-white w-full h-full">
                  {therapistNotes.map((value: ITherapistNote, index: number) => {
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
                          {value.therapistId.firstName} {value.therapistId.lastName}
                        </td>
                        <td className="px-2 py-7 w-1/7 ">
                          {`${value.sessionType.length > 0 ? value.sessionType : "--"}${
                            value.subSessionType ? ` (${value.subSessionType})` : ""
                          }`}
                        </td>
                        <td className="px-2 py-7 w-1/7 ">{value.score || "--"}</td>
                        {value.file?.filePath ? (
                          <td className="px-2 py-7 w-1/7 ">
                            <div id="view" ref={viewref} className="text-nowrap whitespace-nowrap">
                              <div
                                onClick={handleState}
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
                        <RBACGuard resource={RESOURCES.THERAPIST_NOTES} action="write">
                          <td className="pr-10 py-7 w-1/7 text-xs">
                            <div
                              onClick={() => {
                                if (!patient.loa.loa) {
                                  toggleMenu(value?._id);
                                }
                              }}
                              className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-md hover:bg-[#D4E299] cursor-pointer"
                            >
                              <img src={kabab} alt="icon" className="w-full h-full" />
                              {dropDownsState.openMenuId === value._id && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-3 top-1 overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-lg z-10 flex items-center justify-center"
                                >
                                  <div className="p-1  text-nowrap whitespace-nowrap gap-0 flex-col flex justify-center bg-white shadow-lg rounded-lg w-fit">
                                    <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                      <div
                                        onClick={() => {
                                          toggleFunctionType(value, "edit");
                                          window.scrollTo({ top: 0 });
                                        }}
                                        className="flex items-center  cursor-pointer"
                                      >
                                        <p>Edit</p>
                                      </div>
                                    </div>
                                    <hr />
                                    <TherapistDataDownload
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
              <Pagination totalPages={state.totalPages} />
            </div>
          ) : (
            <div className="flex justify-center items-center bg-white py-[33px] font-semibold text-xs h-full">
              <EmptyRecord />
            </div>
          )}
        </div>
      </div>
      <DeleteConfirm
        toggleModal={toggleModal}
        isModalOpen={dropDownsState.isModalOpen}
        confirmDeleteNote={confirmDeleteNote}
      />
    </div>
  );
};

export default TherapistNotes;
