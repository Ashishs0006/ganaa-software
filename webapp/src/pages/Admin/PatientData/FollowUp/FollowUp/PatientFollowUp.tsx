import { MouseEvent, SyntheticEvent, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BsFiletypePdf } from "react-icons/bs";

import { FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

import { RootState } from "@/redux/store/store";
import { resetPatientFollowup, setPatientFollowup } from "@/redux/slice/noteSlice";

import {
  getAllPatientFollowup,
  createPatientFollowup,
  getAllUser,
  getSinglePatient,
  deletePatientFollowup,
  updatePatientFollowup,
  getSinglePatientAdmissionHistory,
  getAllLoa,
  getPatientFamily
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
  CheckBox,
  Select,
  Modal
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
  IPatientFollowupDropDownsState,
  IPatientFollowup,
  IPatientFollowupState,
  IPatientState,
  IUser
} from "@/pages/Admin/PatientData/FollowUp/FollowUp/types";
import moment from "moment";
// import { ISessionType } from "@/redux/slice/dropDown";

import pdfFile from "@/assets/images/pdfIcon.svg";
import { isNumeric } from "@/components/BasicDetaills/utils";
import { setloa } from "@/redux/slice/patientSlice";
import LoaBlankScreen from "@/components/LoaBlankScreen/LoaBlankScreen";
// import MultiSelectDropdown from "@/components/MultiSelectDropdown/MultiSelectDropdown";
import { useAuth } from "@/providers/AuthProvider";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import { IFamilyData } from "@/components/ProfileContacts/types";
import { PatientDetails } from "../../Discharge/types";
import { ISelectOption } from "@/components/Select/types";
// import DataDownload from "../../Doctor/DataDownload/DataDownload";
import DownloadFollowup from "./PatientFollowup/DownloadFollowup";

const PatientFollowup = () => {
  const { id, aId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { auth } = useAuth();

  const menuRef = useRef<HTMLDivElement | null>(null);
  const sessionMenuRef = useRef<HTMLDivElement>(null);
  const therapistMenuRef = useRef<HTMLDivElement>(null);


  // const [lastFollowupDate, setLastFollowupDate] = useState<string | null>(null);
  // const [daysSinceLastFollowup, setDaysSinceLastFollowup] = useState<number | null>(null);
  const [modalState, setmodalState] = useState({
    displayNoteModal: false,
    selectedNote: ""
    // ...other state
  });

  const [data, setData] = useState<IPatientFollowupState>({
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
    noteTime: moment().format("HH:mm"),
    dischargeDate: "",
    dischargeStatus: "",
    nominatedRepresentative: "",
    currentStatus: "",
    stayDuration: "",
    dischargePlan: "",
    psychologist: "",
    followupDate: "",
    urge: "",
    adherence: "",
    prayer: "",
    literature: "",
    meeting: "",
    daycareAtGanaa: "",
    sponsor: "",
    stepProgram: "",
    reviewWithGanaaDoctor: "",
    feedbackFromFamily: "",
    UHID: "",
    therapistName: "",
    gender: ""
  });
  // const [selectedSessions, setSelectedSessions] = useState<
  //   { sessionType: string; subSessionType?: string }[]
  // >([]);

  const [state, setState] = useState<IPatientState>({
    totalPages: "",
    firstName: "",
    lastName: "",
    UHID: "",
    patientProfilePic: "",
    assignedTherapist: "",
    patientAdmissionHistoryId: "",
    dateOfAdmission: "",
    patientId: "",
    gender: "",
    therapistName: "",
    isTodayNoteExist: false,
    illnessType: ""
  });

  const [familyDetails, setFamilyDetails] = useState<IFamilyData[]>([]);

  const [patientDetails, setPatientDetails] = useState<PatientDetails>({
    gender: "",
    shouldSendfeedbackNotification: undefined,
    patientPicUrl: "",
    firstName: "",
    feedbackId: "",
    lastName: "",
    UHID: "",
    age: "",
    phoneNumber: "",
    address: "",
    admissionType: "",
    involuntaryAdmissionType: "",
    doctor: "",
    therapist: "",
    admissionDate: "",
    dischargeDate: "",
    nominatedRepresntative: "",
    dischargeStatus: "",
    patientId: "",
    patientAdmissionHistoryId: "",
    therapistNotes: [],
    currentStatus: ""
  });

  const [dropDownsState, setDropDownsState] = useState<IPatientFollowupDropDownsState>({
    displayAddForm: false,
    displayDropdown: false,
    isModalOpen: false,
    openMenuId: null,
    displaySessionTypeDropdown: false
  });
  const [therapistNotes, setTherapistNotes] = useState<IPatientFollowup[]>([]);
  const [totalTherapistNotes, setTotalTherapistNotes] = useState<IPatientFollowup[]>([]);
  const [allTherapists, setAllTherapists] = useState<IUser[]>([]);

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
  // const dropdown = useSelector((store: RootState) => store.dropdown);

  const fetchPatientFollowup = async () => {
    try {
      const page = searchParams.get("page") || "1";
      const sort = searchParams.get("sort") || "-createdAt";

      if (id && aId) {
        const { data: patientData } = await getSinglePatient(id);
        console.log("patientData:",patientData)
        
        const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);

    console.log("patienthistory:",patientAdmissionHistory)
        // Fetch the latest followup data to get the new fields
        const { data: latestFollowupData } = await getAllPatientFollowup({
          limit: 1,
          page: 1,
          sort: "-createdAt",
          patientAdmissionHistoryId: aId
        });

        const latestFollowup = latestFollowupData?.data?.[0];

        const familyDetailsResponse = await getPatientFamily(id);

        setFamilyDetails(familyDetailsResponse.data.data);

        setPatientDetails((prevData) => ({
          ...prevData,
          gender: patientData?.data?.gender,
          patientPicUrl: patientData?.data?.patientPicUrl,
          firstName: patientData?.data?.firstName,
          lastName: patientData?.data?.lastName,
          UHID: patientData?.data?.uhid,
          age: patientData?.data?.age,
          phoneNumber: `${patientData?.data?.phoneNumberCountryCode || ""} ${
            patientData?.data?.phoneNumber || ""
          }`.trim(),
          address: patientData?.data?.fullAddress,
          dischargeDate: patientData?.data?.patientHistory?.dischargeId?.date || "",
          dischargeStatus: patientData?.data?.patientHistory?.dischargeId?.status || "",
          admissionDate: patientData?.data?.patientHistory?.dateOfAdmission || "",
          admissionType: patientData?.data?.patientHistory?.admissionType || "",

          therapist: `${
            patientData?.data?.patientHistory?.resourceAllocation?.assignedTherapistId?.firstName ||
            ""
          } ${
            patientData?.data?.patientHistory?.resourceAllocation?.assignedTherapistId?.lastName ||
            ""
          }`.trim(),

          doctor: `${
            patientData?.data?.patientHistory?.resourceAllocation?.assignedDoctorId?.firstName || ""
          } ${
            patientData?.data?.patientHistory?.resourceAllocation?.assignedDoctorId?.lastName || ""
          }`.trim()
        }));

        const { data: therapistNotesData } = await getAllPatientFollowup({
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
          UHID: patientData?.data?.uhid || "",
          assignedTherapist: `${
            patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.firstName || ""
          } ${
            patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.lastName || ""
          }`.trim(),
          therapistName: `${auth?.user?.firstName} ${auth?.user?.lastName}`,
          illnessType: patientAdmissionHistory?.data?.illnessType || ""
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
          noteTime: date ? moment(date).format("HH:mm") : moment().format("HH:mm"),
          age: latestFollowup?.age || "",
          phoneNumber: `${latestFollowup?.phoneNumberCountryCode || ""} ${
            latestFollowup?.phoneNumber || ""
          }`.trim(),
          address: latestFollowup?.fullAddress || "",
          admissionType: latestFollowup?.admissionType || "",
          involuntaryAdmissionType: latestFollowup?.involuntaryAdmissionType || "",
          doctor: latestFollowup?.resourceAllocation?.assignedDoctorId?.firstName
            ? `${latestFollowup?.resourceAllocation?.assignedDoctorId?.firstName} ${latestFollowup?.resourceAllocation?.assignedDoctorId?.lastName}`
            : ""
        }));
        const centerName =
          patientAdmissionHistory?.data?.resourceAllocation?.centerId?.centerName ||
          patientAdmissionHistory?.data?.resourceAllocation?.centerId?.name ||
          "";

        // ✅ Fetch all therapists
        const { data: therapistsData } = await getAllUser({
          limit: 100,
          page: 1,
          sort: "-createdAt",
          roles: "therapist"
        });

        // ✅ Filter therapists who belong to same center
        const filteredTherapists = therapistsData?.data?.filter((therapist: any) => {
          // since centerId is an array, check inside
          return (
            Array.isArray(therapist.centerId) &&
            therapist.centerId.some(
              (c: any) =>
                c?.centerName?.toLowerCase() === centerName?.toLowerCase() ||
                c?.name?.toLowerCase() === centerName?.toLowerCase()
            )
          );
        });

        console.log("✅ Filtered Therapists:", filteredTherapists);

        // ✅ Save filtered therapists
        setAllTherapists(filteredTherapists);
      }
    } catch (error) {
      console.error("Error fetching therapist notes or patient data:", error);
    }
  };

  useEffect(() => {
    fetchPatientFollowup();
  }, [searchParams]);

  const fetchAllNotesToCheck = async (date?: string) => {
    try {
      const response = await getAllPatientFollowup({
        patientAdmissionHistoryId: aId
      });
      setTotalTherapistNotes(response.data.data);
      setState((prev) => ({
        ...prev,
        isTodayNoteExist:
          response.data.data.filter((elem: IPatientFollowup) =>
            elem.noteDateTime.startsWith(date || data.noteDate)
          ).length > 0
      }));
    } catch (error) {
      console.error("Error fetching therapists:", error);
    }
  };
  const resetState = () => {
    dispatch(resetPatientFollowup());
    setData((prev) => ({
      ...prev,
      id: "",
      patientId: id || "",
      patientAdmissionHistoryId: aId || "",
      note: "",
      file: null,
      fileName: "",
      therapistId: auth?.user?._id || "",
      sessionType: [],
      score: "",
      subSessionType: [],
      noteDate: moment().format("YYYY-MM-DD"),
      noteTime: moment().format("HH:mm"),

      // Reset all the form fields
      center: "",
      patientName: "",
      age: "",
      contact: "",
      address: "",
      admissionType: "",
      involuntaryAdmissionType: "",
      doctor: "",
      therapist: "",
      dischargeDate: "",
      dischargeStatus: "",
      nominatedRepresentative: "",
      currentStatus: "",
      stayDuration: "",
      dischargePlan: "",
      psychologist: "",
      followupDate: "",
      urge: "",
      adherence: "",
      prayer: "",
      literature: "",
      meeting: "",
      daycareAtGanaa: "",
      sponsor: "",
      stepProgram: "",
      reviewWithGanaaDoctor: "",
      feedbackFromFamily: "",
      UHID: "",
      therapistName: "",
      gender: ""
    }));
    setState((prev) => ({
      ...prev,
      therapistName: `${auth?.user?.firstName} ${auth?.user?.lastName}`,
      isTodayNoteExist:
        totalTherapistNotes.filter((elem: IPatientFollowup) =>
          elem.noteDateTime.startsWith(moment().format("YYYY-MM-DD"))
        ).length > 0
    }));
    // setSelectedSessions([]);
  };

  const updateFunctionTherapistNotes = (id: string) => {
    const updatedState = compareObjects(notes.therapistNote, data, true);
    const formData = new FormData();

    // Basic note fields
    if (updatedState.note !== undefined) formData.append("note", updatedState.note);
    if (updatedState.therapistId !== undefined)
      formData.append("therapistId", updatedState.therapistId);

    // Date time handling
    if (updatedState.noteTime !== undefined || updatedState.noteDate !== undefined) {
      const formattedDateTime = new Date(`${data.noteDate} ${data.noteTime}`).toISOString();
      formData.append("noteDateTime", formattedDateTime);
    }

    // File handling
    if (data.file instanceof File) {
      formData.append("file", data.file);
    } else if (typeof data.file === "string" && data.file.trim() === "") {
      formData.append("file", "");
    }

    // Session types
    const keysToInclude = [
      "sessionType",
      "subSessionType",
      // Add all the new form fields here
      "center",
      "patientName",
      "age",
      "contact",
      "address",
      "admissionType",
      "involuntaryAdmissionType",
      "doctor",
      "therapist",
      "dischargeDate",
      "dischargeStatus",
      "nominatedRepresentative",
      "currentStatus",
      "stayDuration",
      "dischargePlan",
      "psychologist",
      "followupDate",
      "urge",
      "adherence",
      "prayer",
      "literature",
      "meeting",
      "daycareAtGanaa",
      "sponsor",
      "stepProgram",
      "reviewWithGanaaDoctor",
      "feedbackFromFamily",
      "UHID",
      "therapistName",
      "gender"
    ];

    Object.entries(updatedState).forEach(([key, value]) => {
      if (!keysToInclude.includes(key)) return;

      if (Array.isArray(value)) {
        if (value.length === 0) {
          formData.append(key, "");
        } else {
          value.forEach((v) => formData.append(key, v));
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Score handling
    if (
      updatedState.sessionType &&
      Array.isArray(updatedState.sessionType) &&
      updatedState.sessionType.includes("A - Assessment") &&
      updatedState.score !== undefined
    ) {
      formData.append("score", updatedState.score);
    } else if (updatedState.score !== undefined) {
      formData.append("score", updatedState.score);
    }

    // Check if FormData has any entries
    if (!Array.from(formData.keys()).length) {
      console.log("No changes detected");
      return Promise.resolve({ status: 200 }); // Return resolved promise if no changes
    }

    // Log form data for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": ", pair[1]);
    }

    return updatePatientFollowup(id, formData);
  };
  const handleSubmit = async () => {
    try {
      // Check if new followup creation is restricted
      if (!data.id) {
       
        return;
      }

      if (!id) {
        throw new Error("Patient not found");
      }
      if (!data.note.trim()) throw new Error("Note is required");
      if (!data.therapistId) throw new Error("Therapist is required");
      if (!data.noteDate || !data.noteTime) throw new Error("Both note date and time are required");

      if (data.id) {
        // UPDATE EXISTING NOTE
        const response = await updateFunctionTherapistNotes(data.id);
        if (response && response.status == 200) {
          fetchPatientFollowup();
          toast.success("Therapist Notes Updated Successfully");
          resetState(); // Reset after successful update
        }
      } else {
        // CREATE NEW NOTE
        const formattedDateTime = new Date(`${data.noteDate} ${data.noteTime}`).toISOString();
        const body: Partial<typeof data> & { noteDateTime: string } = {
          ...data,
          noteDateTime: formattedDateTime
        };

        // Remove score if not assessment session
        if (
          (Array.isArray(body.sessionType) && !body.sessionType.includes("A - Assessment")) ||
          (!Array.isArray(body.sessionType) && body.sessionType !== "A - Assessment") ||
          !body.score?.trim()
        ) {
          delete body.score;
        }

        if (!body.sessionType) delete body.sessionType;
        if (!body.subSessionType) delete body.subSessionType;

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

        const response = await createPatientFollowup(formData);
        if (response && response?.status === 201) {
          toast.success("Note saved successfully");
          fetchPatientFollowup();
          resetState(); // Reset after successful creation
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

  const toggleFunctionType = async (value: IPatientFollowup, type: string) => {
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

      // setSelectedSessions(selected);

      dispatch(
        setPatientFollowup({
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
        fileName: value?.file?.fileName || "",

        // Set all the form fields from the fetched data
        center: value?.center || "",
        patientName: value?.patientName || "",
        UHID: value?.UHID || "",
        age: value?.age || "",
        gender: value?.gender || "",
        contact: value?.contact || "",
        address: value?.address || "",
        admissionType: value?.admissionType || "",
        involuntaryAdmissionType: value?.involuntaryAdmissionType || "",
        doctor: value?.doctor || "",
        therapist: value?.therapist || "",
        dischargeDate: value?.dischargeDate || "",
        dischargeStatus: value?.dischargeStatus || "",
        nominatedRepresentative: value?.nominatedRepresentative || "",
        currentStatus: value?.currentStatus || "",
        stayDuration: value?.stayDuration || "",
        dischargePlan: value?.dischargePlan || "",
        psychologist: value?.psychologist || "",
        followupDate: value?.followupDate || "",
        urge: value?.urge || "",
        adherence: value?.adherence || "",
        prayer: value?.prayer || "",
        literature: value?.literature || "",
        meeting: value?.meeting || "",
        daycareAtGanaa: value?.daycareAtGanaa || "",
        sponsor: value?.sponsor || "",
        stepProgram: value?.stepProgram || "",
        reviewWithGanaaDoctor: value?.reviewWithGanaaDoctor || "",
        feedbackFromFamily: value?.feedbackFromFamily || ""
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
    const maxSize = 10 * 1024 * 1024;
    try {
      if (files[0].size > maxSize) {
        throw new Error("File size exceeds 10 MB limit.");
      }
    } catch (error) {
      handleError(error);
    }
    if (files[0].size < maxSize) {
      setData((prev) => ({ ...prev, file: files[0] }));
    }
  }, []);

  const confirmDeleteNote = async () => {
    const response = await deletePatientFollowup(data.id);
    if (response.data?.status == "success") {
      resetState();
      toast.success(response.data?.message);
      fetchPatientFollowup();
      toggleModal();
    }
  };

  const toggleModal = () => {
    setDropDownsState({ ...dropDownsState, isModalOpen: !dropDownsState.isModalOpen });
  };

  // const handleDisabled = () => {
  //   if ((!data?.note.trim() && state.isTodayNoteExist) || !data?.note.trim()) {
  //     return true;
  //   }
  //   return false;
  // };

  const handleDisabled = () => {
    // Check if note is empty
    if ((!data?.note.trim() && state.isTodayNoteExist) || !data?.note.trim()) {
      return true;
    }

    // Check if date is not today, tomorrow, or day after tomorrow for new followups
    if (!data.id && totalTherapistNotes.length > 0) {
      const selectedDate = new Date(data.noteDate);
      selectedDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

      // Disable if selected date is NOT today, tomorrow, or day after tomorrow
      if (
        selectedDate.getTime() !== today.getTime() &&
        selectedDate.getTime() !== tomorrow.getTime() &&
        selectedDate.getTime() !== dayAfterTomorrow.getTime()
      ) {
        return true;
      }
    }

    return false;
  };

  // const handleDateTimeChange = (datas: string, type: string) => {
  //   let value = moment().format("YYYY-MM-DD");
  //   if (datas) {
  //     value = moment(datas).format("YYYY-MM-DD");
  //   }
  //   if (type == "date") {
  //     setData((prev) => ({ ...prev, noteDate: value }));
  //   } else if (type == "time") {
  //     setData((prev) => ({ ...prev, noteTime: datas }));
  //   }
  //   if (totalTherapistNotes.length > 0) {
  //     const exist =
  //       totalTherapistNotes.filter(
  //         (elem: IPatientFollowup) => elem.noteDateTime.startsWith(value) && elem._id != data.id
  //       ).length > 0;
  //     setState((prev) => ({
  //       ...prev,
  //       isTodayNoteExist: exist
  //     }));
  //     if (exist) {
  //       toast.error(`Note already exists On ${formateNormalDate(value)}`);
  //     }
  //   } else {
  //     fetchAllNotesToCheck();
  //   }
  // };

  const handleDateTimeChange = (datas: string, type: string) => {
    let value = moment().format("YYYY-MM-DD");
    if (datas) {
      value = moment(datas).format("YYYY-MM-DD");
    }

    if (type == "date") {
      setData((prev) => ({ ...prev, noteDate: value }));

      // Check if the selected date is today, tomorrow, or day after tomorrow
      if (totalTherapistNotes.length > 0 && !data.id) {
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

        // Check if selected date is NOT today, tomorrow, or day after tomorrow
        if (
          selectedDate.getTime() !== today.getTime() &&
          selectedDate.getTime() !== tomorrow.getTime() &&
          selectedDate.getTime() !== dayAfterTomorrow.getTime()
        ) {
          
        }
      }
    } else if (type == "time") {
      setData((prev) => ({ ...prev, noteTime: datas }));
    }

    if (totalTherapistNotes.length > 0) {
      const exist =
        totalTherapistNotes.filter(
          (elem: IPatientFollowup) => elem.noteDateTime.startsWith(value) && elem._id != data.id
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

  const handleSelect = (name: string, selectedOption: ISelectOption) => {
    // Update the state with the selected value
    setData((prev) => ({
      ...prev,
      [name]: selectedOption.value as string
    }));
  };

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

// Allow only 1 followup per day
// const checkFollowupRestriction = (): boolean => {
//   if (totalTherapistNotes.length === 0) return true; // No previous notes

//   // Get latest followup
//   const latestFollowup = totalTherapistNotes.reduce((latest, current) => {
//     const currentDate = new Date(current.noteDateTime);
//     const latestDate = new Date(latest.noteDateTime);
//     return currentDate > latestDate ? current : latest;
//   });

//   const latestDate = new Date(latestFollowup.noteDateTime);
//   const today = new Date();

//   // Compare only the date parts (ignore time)
//   const latestDateStr = latestDate.toDateString();
//   const todayStr = today.toDateString();

//   // ❌ If latest followup is already today → do not allow new followup
//   return latestDateStr !== todayStr;
// };


  return (
    <div className="bg-[#ffffff]  min-h-[calc(100vh-64px)]">
      <div className=" container">
        <div className="flex lg:px-8 sm:px-2  bg-[#ffffff] justify-between md:flex-row flex-col md:items-center">
          <div className="flex items-center gap-3">
            <div
              className="p-4 w-fit bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="text-gray-700" />
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
              <div className=" text-[18px] font-bold">Patient Follow-up</div>
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

        <div className="w-full h-fit bg-[#F4F2F0] border border-gray-300 rounded-t-2xl px-5 py-6 ">
          <div className="grid grid-cols-6">
            <div className="flex gap-2  items-center py-4">
              <div
                className={`flex rounded-full  border-2 ${
                  patientDetails.gender == "Male"
                    ? "border-[#00685F]"
                    : patientDetails.gender == "Female"
                    ? "border-[#F14E9A]"
                    : "border-gray-500"
                }   overflow-hidden w-16 h-16 items-center justify-center`}
              >
                <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                  {patientDetails?.patientPicUrl ? (
                    <img
                      src={patientDetails?.patientPicUrl}
                      alt="profile"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="flex rounded-full p-1 w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                      <div className="w-full uppercase text-[13px] font-semibold text-center">
                        {patientDetails?.firstName?.slice(0, 1)}
                        {patientDetails?.lastName?.slice(0, 1)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-start">
                  <h2
                    title={patientDetails.firstName + " " + patientDetails.lastName}
                    className="text-[13px] font-semibold text-left text-wrap"
                  >
                    {patientDetails.firstName &&
                      capitalizeFirstLetter(
                        patientDetails.firstName?.length > 15
                          ? patientDetails.firstName?.slice(0, 15) + "..."
                          : patientDetails.firstName
                      )}{" "}
                    {patientDetails.lastName &&
                      capitalizeFirstLetter(
                        patientDetails.lastName.length > 15
                          ? patientDetails.lastName.slice(0, 15) + "..."
                          : patientDetails.lastName
                      )}
                  </h2>
                </div>
                <div className="text-xs">
                  <div className="flex gap-3">
                    <p className="text-xs">
                      UHID:
                      <span className="font-semibold ml-1 text-nowrap whitespace-nowrap text-black">
                        {formatId(patientDetails.UHID)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center flex-col items-start gap-5">
              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Age/Sex</p>
                <p>
                  {patientDetails.age}/{patientDetails.gender}
                </p>
              </div>

              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Therapist</p>
                <p>{patientDetails.therapist || "--"}</p>
              </div>
            </div>

            <div className="flex justify-center flex-col items-start gap-5">
              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Mobile Number</p>
                <p>{patientDetails.phoneNumber || "--"}</p>
              </div>

              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Admission Date & Time</p>
                <p>
                  {patientDetails?.admissionDate && formatDate(patientDetails?.admissionDate)} @
                  {patientDetails?.admissionDate &&
                    convertBackendDateToTime(patientDetails?.admissionDate)}
                </p>
              </div>
            </div>

            <div
              className="flex justify-center flex-col items-start gap-5"
              title={patientDetails.address}
            >
              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Address</p>
                <p className="truncate w-30">{patientDetails.address || "--"}</p>
              </div>

              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Discharge Date</p>
                <p>
                  {(patientDetails.dischargeDate &&
                    formateNormalDate(patientDetails.dischargeDate)) ||
                    "--"}
                </p>
              </div>
            </div>

            <div className="flex justify-center flex-col items-start gap-5">
              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Admission Type</p>
                <p>
                  {patientDetails?.admissionType
                    ? `${patientDetails?.admissionType}${
                        patientDetails?.admissionType !== "Voluntary"
                          ? ` - ${patientDetails?.involuntaryAdmissionType}`
                          : ""
                      }`
                    : "--"}
                </p>
              </div>

              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Nominated Representative</p>
                <p>
                  {capitalizeFirstLetter(
                    familyDetails.find((data) =>
                      data.infoType?.includes("Nominated Representative")
                    )?.name || "--"
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-center flex-col items-start gap-5">
              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Consultant Doctor</p>
                <p>{patientDetails.doctor || "--"}</p>
              </div>

              <div className="text-xs font-semibold">
                <p className="text-[#636363] font-medium">Discharge Status</p>
                <p>{patientDetails.dischargeStatus || "--"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-gray-300">
          <RBACGuard resource={RESOURCES.THERAPIST_NOTES} action="write">
            {!patient.loa.loa ? (
              <div className="  rounded-lg font-semibold">
                <div className=" ">
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
                            {/* <CustomCalendar
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
                            </CustomCalendar> */}

                          <CustomCalendar
  value={data.noteDate}
  disabledDate={(current) => {
    if (!current) return false;

    const selectedDate = current.toDate();
    selectedDate.setHours(0, 0, 0, 0);

    // 1) Disable past dates (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return true;
    }

    // 2) Restrict same-day followup (only when creating new, not editing)
    if (totalTherapistNotes.length > 0 && !data.id) {
      const latestFollowup = totalTherapistNotes.reduce((latest, current) => {
        const currentDate = new Date(current.noteDateTime);
        const latestDate = new Date(latest.noteDateTime);
        return currentDate > latestDate ? current : latest;
      });

      const latestDate = new Date(latestFollowup.noteDateTime);
      latestDate.setHours(0, 0, 0, 0);

      // ❌ Disable if selected date = latest followup’s date
      if (selectedDate.getTime() === latestDate.getTime()) {
        return true;
      }
    }

    return false; // allow all other dates
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

                          {/* <div className="ml-4 relative text-nowrap whitespace-nowrap cursor-pointer z-30 text-xs flex items-center text-gray-500">
                          <div className="font-medium">Session Type: </div>
                          <div
                            onClick={() => {
                              toggleSessionTypeMenu();
                            }}
                            className="text-[#292929] flex items-center mx-2 font-bold"
                          >
                          </div>
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
                        /> */}
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
                    <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4 p-2 gap-x-[52px]">
                      {state.illnessType !== "Mental Disorder" && (
                        <>
                          <Select
                            disable={state.isTodayNoteExist}
                            label="Current Status"
                            options={[
                              // { label: "Select", value: "" },
                              { label: "Sober", value: "Sober" },
                              { label: "Relapsed", value: "Relapsed" },
                              { label: "Struggling", value: "Struggling" },
                              { label: "Vanished", value: "Vanished" }
                            ]}
                            value={
                              data?.currentStatus
                                ? { label: data.currentStatus, value: data.currentStatus }
                                : { label: "Select", value: "" }
                            }
                            name="currentStatus"
                            onChange={(name, data) => {
                              handleSelect(name, data);
                            }}
                          />

                          <Select
                            disable={state.isTodayNoteExist}
                            label="Attending Meeting"
                            options={[
                              { label: "Select", value: "" },
                              { label: "No", value: "No" },
                              { label: "At Ganaa", value: "At Ganaa" },
                              { label: "Outside Ganaa", value: "Outside Ganaa" },
                              { label: "At Ganaa & Outside", value: "At Ganaa & Outside" }
                            ]}
                            value={
                              data?.meeting
                                ? { label: data?.meeting, value: data?.meeting }
                                : { label: "Select", value: "" }
                            }
                            name="meeting"
                            onChange={(name, data) => {
                              handleSelect(name, data);
                            }}
                          />
                          <Select
                            disable={state.isTodayNoteExist}
                            label="Medication Adherence"
                            options={[
                              { label: "No", value: "No" },
                              { label: "Yes", value: "Yes" },
                              { label: "Sometimes", value: "Sometimes" }
                            ]}
                            value={
                              data?.adherence
                                ? { label: data.adherence, value: data.adherence }
                                : { label: "Select", value: "" }
                            }
                            name="adherence"
                            onChange={(name, data) => {
                              handleSelect(name, data);
                            }}
                          />
                          {/* <Select
                            disable={state.isTodayNoteExist}
                            label="Making a sponsor"
                            options={[
                              { label: "Yes", value: "Yes" },
                              { label: "No", value: "No" }
                            ]}
                            value={
                              data?.sponsor
                                ? { label: data.sponsor, value: data.sponsor }
                                : { label: "Select", value: "" }
                            }
                            name="sponsor"
                            onChange={(name, data) => {
                              handleSelect(name, data);
                            }}
                          /> */}
                          <div className="flex gap-[10px] items-start justify-start flex-col">
                            <label className="font-medium text-[14px]">
                              {" "}
                              Making a sponsor and following Given guidelines
                            </label>

                            <div className="flex gap-5 items-center justify-center mb-3">
                              {/* Yes option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="sponsor-yes"
                                  name="sponsor"
                                  value="Yes"
                                  checked={data?.sponsor === "Yes"}
                                  onChange={(e) =>
                                    handleSelect("sponsor", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="sponsor-yes"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.sponsor === "Yes"
                                      ? "border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.sponsor === "Yes" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="sponsor-yes"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  Yes
                                </label>
                              </div>

                              {/* No option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="sponsor-no"
                                  name="sponsor"
                                  value="No"
                                  checked={data?.sponsor === "No"}
                                  onChange={(e) =>
                                    handleSelect("sponsor", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="sponsor-no"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.sponsor === "No"
                                      ? "border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.sponsor === "No" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="sponsor-no"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-[10px] items-start justify-start flex-col">
                            <label className="font-medium text-[14px]">Urge</label>

                            <div className="flex gap-5 items-center justify-center mb-3">
                              {/* Yes option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="urge-yes"
                                  name="urge"
                                  value="Yes"
                                  checked={data?.urge === "Yes"}
                                  onChange={(e) =>
                                    handleSelect("urge", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="urge-yes"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.urge === "Yes" ? " border-[#586B3A]!" : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.urge === "Yes" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="urge-yes"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  Yes
                                </label>
                              </div>

                              {/* No option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="urge-no"
                                  name="urge"
                                  value="No"
                                  checked={data?.urge === "No"}
                                  onChange={(e) =>
                                    handleSelect("urge", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="urge-no"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.urge === "No" ? " border-[#586B3A]!" : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.urge === "No" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="urge-no"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-[10px] items-start justify-start flex-col">
                            <label className="font-medium text-[14px]">Doing Prayer</label>

                            <div className="flex gap-5 items-center justify-center mb-3">
                              {/* Yes option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="prayer-yes"
                                  name="prayer"
                                  value="Yes"
                                  checked={data?.prayer === "Yes"}
                                  onChange={(e) =>
                                    handleSelect("prayer", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="prayer-yes"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.prayer === "Yes"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.prayer === "Yes" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="prayer-yes"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  Yes
                                </label>
                              </div>

                              {/* No option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="prayer-no"
                                  name="prayer"
                                  value="No"
                                  checked={data?.prayer === "No"}
                                  onChange={(e) =>
                                    handleSelect("prayer", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="prayer-no"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.prayer === "No"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.prayer === "No" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="prayer-no"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-[10px] items-start justify-start flex-col">
                            <label className="font-medium text-[14px]">Reading AA literature</label>

                            <div className="flex gap-5 items-center justify-center mb-3">
                              {/* Yes option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="literature-yes"
                                  name="literature"
                                  value="Yes"
                                  checked={data?.literature === "Yes"}
                                  onChange={(e) =>
                                    handleSelect("literature", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="literature-yes"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.literature === "Yes"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.literature === "Yes" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="literature-yes"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  Yes
                                </label>
                              </div>

                              {/* No option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="literature-no"
                                  name="literature"
                                  value="No"
                                  checked={data?.literature === "No"}
                                  onChange={(e) =>
                                    handleSelect("literature", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="literature-no"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.literature === "No"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.literature === "No" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="literature-no"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-[10px] items-start justify-start flex-col">
                            <label className="font-medium text-[14px]">
                              Attending Daycare at Ganaa
                            </label>

                            <div className="flex gap-5 items-center justify-center mb-3">
                              {/* Yes option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="daycareAtGanaa-yes"
                                  name="daycareAtGanaa"
                                  value="Yes"
                                  checked={data?.daycareAtGanaa === "Yes"}
                                  onChange={(e) =>
                                    handleSelect("daycareAtGanaa", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="daycareAtGanaa-yes"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.daycareAtGanaa === "Yes"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.daycareAtGanaa === "Yes" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="daycareAtGanaa-yes"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  Yes
                                </label>
                              </div>

                              {/* No option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="daycareAtGanaa-no"
                                  name="daycareAtGanaa"
                                  value="No"
                                  checked={data?.daycareAtGanaa === "No"}
                                  onChange={(e) =>
                                    handleSelect("daycareAtGanaa", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="daycareAtGanaa-no"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.daycareAtGanaa === "No"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.daycareAtGanaa === "No" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="daycareAtGanaa-no"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-[10px] items-start justify-start flex-col">
                            <label className="font-medium text-[14px]">
                              Doing 12-step program work regularly
                            </label>

                            <div className="flex gap-5 items-center justify-center mb-3">
                              {/* Yes option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="stepProgram-yes"
                                  name="stepProgram"
                                  value="Yes"
                                  checked={data?.stepProgram === "Yes"}
                                  onChange={(e) =>
                                    handleSelect("stepProgram", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="stepProgram-yes"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.stepProgram === "Yes"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.stepProgram === "Yes" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="stepProgram-yes"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  Yes
                                </label>
                              </div>

                              {/* No option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="stepProgram-no"
                                  name="stepProgram"
                                  value="No"
                                  checked={data?.stepProgram === "No"}
                                  onChange={(e) =>
                                    handleSelect("stepProgram", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="stepProgram-no"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.stepProgram === "No"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.stepProgram === "No" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="stepProgram-no"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-[10px] items-start justify-start flex-col">
                            <label className="font-medium text-[14px]">
                              Doing review with Ganaa doctor every 15 days
                            </label>

                            <div className="flex gap-5 items-center justify-center mb-3">
                              {/* Yes option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="reviewWithGanaaDoctor-yes"
                                  name="reviewWithGanaaDoctor"
                                  value="Yes"
                                  checked={data?.reviewWithGanaaDoctor === "Yes"}
                                  onChange={(e) =>
                                    handleSelect("reviewWithGanaaDoctor", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="reviewWithGanaaDoctor-yes"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.reviewWithGanaaDoctor === "Yes"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.reviewWithGanaaDoctor === "Yes" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="reviewWithGanaaDoctor-yes"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  Yes
                                </label>
                              </div>

                              {/* No option */}
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="reviewWithGanaaDoctor-no"
                                  name="reviewWithGanaaDoctor"
                                  value="No"
                                  checked={data?.reviewWithGanaaDoctor === "No"}
                                  onChange={(e) =>
                                    handleSelect("reviewWithGanaaDoctor", {
                                      label: e.target.value,
                                      value: e.target.value
                                    })
                                  }
                                  disabled={state.isTodayNoteExist}
                                  className="hidden"
                                />
                                <label
                                  htmlFor="reviewWithGanaaDoctor-no"
                                  className={`w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer ${
                                    data?.reviewWithGanaaDoctor === "No"
                                      ? " border-[#586B3A]!"
                                      : "border-[#586B3A]"
                                  } ${
                                    state.isTodayNoteExist ? "cursor-not-allowed opacity-50" : ""
                                  }`}
                                >
                                  {data?.reviewWithGanaaDoctor === "No" && (
                                    <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                                  )}
                                </label>
                                <label
                                  htmlFor="reviewWithGanaaDoctor-no"
                                  className={`ms-2 text-sm font-medium ${
                                    state.isTodayNoteExist
                                      ? "cursor-not-allowed opacity-50"
                                      : "cursor-pointer"
                                  }`}
                                >
                                  No
                                </label>
                              </div>
                            </div>
                          </div>

                          <Input
                            disabled={state.isTodayNoteExist}
                            label="Feedback from family"
                            labelClassName="text-black!"
                            className="w-full sm:w-[400px] md:w-[500px] rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            name="feedbackFromFamily"
                            value={data.feedbackFromFamily}
                            onChange={handleChange}
                          />
                        </>
                      )}
                    </div>

                    <div className="col-span-1 col-start-1">
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

                    <div className="pb-6 mt-5">
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
                    <DownloadFollowup
                      patientDetails={state}
                      aid={aId}
                      id={id}
                      button={
                        <Button
                          type="submit"
                          variant="outlined"
                          size="base"
                          className="flex text-xs! py-2! border-[#D4D4D4]! border! rounded-lg! text-[#505050]"
                        >
                          <BsFiletypePdf className="mr-2" size={18} />
                          Download
                        </Button>
                      }
                    />
                    <DateRange>
                      <Button
                        variant="outlined"
                        size="base"
                        className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                      >
                        <img src={calendar} alt="calender" />
                        {searchParams.get("startDate")
                          ? `Date Range ${formatDate(
                              searchParams.get("startDate")
                            )} to ${formatDate(searchParams.get("endDate"))}`
                          : "Date Range"}
                      </Button>
                    </DateRange>
                  </div>
                </div>
              )}
            </div>
            {therapistNotes.length > 0 ? (
              <div>
                <table className="w-full text-xs font-semibold text-left">
                  <thead className="bg-[#E9E8E5] w-full  top-0 sticky z-10 ">
                    <tr className="text-[#505050]  font-medium">
                      <th className="pl-2 py-3 text-xs">Date & Time</th>
                      <th className="px-2 py-3 text-xs">Therapist</th>
                      {state.illnessType !== "Mental Disorder" && (
                        <>
                          <th className="px-4 py-3 text-xs">Current Status</th>
                          <th className="px-4 py-3 w-1/9 text-xs">Medication Adherence</th>
                          <th className="px-4 py-3 w-1/9 text-xs text-wrap">Attending Meeting</th>
                          <th className="px-5 py-3 w-1/9 text-xs">Making a sponsor</th>
                          <th className="px-4 py-3 text-xs">Urge</th>
                          <th className="px-4 py-3 text-xs">Prayer</th>
                          <th className="px-4 py-3 text-xs">Literature</th>
                          <th className="px-4 py-3 text-xs">Daycare</th>
                        </>
                      )}

                      <th className="px-4 py-3 w-1/9 text-xs">File</th>
                      {state.illnessType !== "Mental Disorder" && (
                        <th className="px-2 py-3 w-1/9 text-xs">Family Feedback</th>
                      )}
                      <th className="px-4 py-3 w-1/9 text-xs">Notes</th>
                      <RBACGuard resource={RESOURCES.THERAPIST_NOTES} action="write">
                        <th className="px-0 py-3 w-1/9 text-xs">{""}</th>
                      </RBACGuard>
                    </tr>
                  </thead>

                  <tbody className="bg-white w-full h-full">
                    {therapistNotes.map((value: IPatientFollowup, index: number) => {
                      return (
                        <tr
                          key={index}
                          className="hover:bg-[#F6F6F6C7] border-b text-xs border-[#DCDCDCE0]"
                        >
                          <td className="pl-2 py-7 text-nowrap">
                            <div className="flex flex-col justify-center">
                              <p>{value.noteDateTime && formatDate(value.noteDateTime)}</p>
                              <p className="text-gray-500 ">
                                {value.noteDateTime && convertBackendDateToTime(value.noteDateTime)}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-7 ">
                            {value.therapistId.firstName} {value.therapistId.lastName}
                          </td>
                          {state.illnessType !== "Mental Disorder" && (
                            <>
                              <td className="px-4 py-7">{value.currentStatus || "--"}</td>
                              <td className="px-4 py-7 w-1/9 ">{value.adherence || "--"}</td>
                              <td className="px-4 py-7 w-1/9 ">{value.meeting || "--"}</td>
                              <td className="px-4 py-7 w-1/9 ">{value.sponsor || "--"}</td>

                              <td className="px-4 py-7 ">{value.urge || "--"}</td>
                              <td className="px-4 py-7 ">{value.prayer || "--"}</td>
                              <td className="px-4 py-7 ">{value.literature || "--"}</td>
                              <td className="px-4 py-7 ">{value.daycareAtGanaa || "--"}</td>
                            </>
                          )}
                          {value.file?.filePath ? (
                            <td className="px-4 py-7 w-1/9 ">
                              <div
                                id="view"
                                ref={viewref}
                                className="text-nowrap whitespace-nowrap"
                              >
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
                            <td className="px-4 py-7 w-1/9 ">--</td>
                          )}
                          {state.illnessType !== "Mental Disorder" && (
                            <td className="px-4 py-7 w-1/9 ">{value.feedbackFromFamily || "--"}</td>
                          )}
                          <td className="px-4 py-7 w-1/7 whitespace-nowrap overflow-hidden text-ellipsis">
                            {/* {value?.note
                              ? value.note.replace(/<[^>]+>/g, "").slice(0, 20) + "..."
                              : "--"} */}
                            <button
                              className="text-blue-500 ml-2 underline"
                              onClick={() => {
                                setmodalState((prev) => ({
                                  ...prev,
                                  displayNoteModal: true,
                                  selectedNote: value.note
                                }));
                              }}
                            >
                              View
                            </button>
                          </td>

                          <RBACGuard resource={RESOURCES.THERAPIST_NOTES} action="write">
                            <td className="pr-0 py-7 text-xs">
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
                                      <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                        <DownloadFollowup
                                          patientDetails={state}
                                          singleFollowup={value} // Pass the single followup record
                                          button={
                                            <div className="flex items-center cursor-pointer">
                                              <p>Download</p>
                                            </div>
                                          }
                                        />
                                      </div>
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
      </div>

        <Modal
          isOpen={modalState.displayNoteModal}
          toggleModal={() => setmodalState((prev) => ({ ...prev, displayNoteModal: false }))}
          crossIcon
          // title="Follow-up Date Not Allowed"
        >
          {/* <div className="fixed inset-0 flex justify-center items-center z-50"> */}
          <div className="p-6 rounded-md max-w-[80vw] m-2 max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Followup Notes</h2>

            <div
              className="prose max-w-full"
              dangerouslySetInnerHTML={{ __html: modalState.selectedNote }}
            ></div>

          </div>
          {/* </div> */}
        </Modal>

      {/* Followup Restriction Modal */}
      {/* <Modal
        isOpen={showFollowupRestrictionModal}
        toggleModal={() => setShowFollowupRestrictionModal(false)}
        // title="Follow-up Date Not Allowed"
        // className="max-w-md"
      >
        <div className="p-4">
          <div className="text-center mb-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Selected Date Not Allowed</h3>
            <p className="text-xs text-gray-500">
              Selected date: {data.noteDate && formateNormalDate(data.noteDate)}
            </p>
          </div>
          <div className="flex justify-center">
            <Button
              onClick={() => setShowFollowupRestrictionModal(false)}
              className="bg-[#575F4A] text-white px-6 py-2 rounded-lg"
            >
              OK
            </Button>
          </div>
        </div>
      </Modal> */}

      <DeleteConfirm
        toggleModal={toggleModal}
        isModalOpen={dropDownsState.isModalOpen}
        confirmDeleteNote={confirmDeleteNote}
      />
    </div>
  );
};

export default PatientFollowup;
