import { MouseEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import { BsFiletypePdf } from "react-icons/bs";

import { FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FaAngleDown } from "react-icons/fa";

import kabab from "@/assets/images/kebab-menu.svg";
import noPrescrition from "@/assets/images/emptyPrescriotion.svg";
import clock from "@/assets/images/clock.svg";
import calendar from "@/assets/images/calender.svg";

import {
  Button,
  Input,
  Select,
  CustomCalendar,
  CustomTimeDoctor,
  Pagination,
  DateRange,
  BreadCrumb,
  EmptyRecord,
  DeleteConfirm
} from "@/components";

import { CustomCalenderForDoctor } from "@/pages";
import { ModalState } from "@/components/Header/types";
import { ISelectOption } from "@/components/Select/types";
import {
  IDoctorPrescrition,
  IDoctorState,
  IFrequency,
  IprescriptionState,
  IUsages
} from "@/pages/Admin/PatientData/Doctor/types";
import { IUser } from "@/pages/Admin/PatientData/TherapistNotes/types";

import {
  createDoctorPrescription,
  deleteDoctorPrescription,
  getAllDoctorPrescription,
  getAllLoa,
  getAllMedicine,
  getAllUser,
  getSingleMedicine,
  getSinglePatient,
  getSinglePatientAdmissionHistory
} from "@/apis";

import {
  capitalizeFirstLetter,
  convertBackendDateToTime,
  formatDate,
  formateNormalDate,
  formatId
} from "@/utils/formater";
import handleError from "@/utils/handleError";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { setloa } from "@/redux/slice/patientSlice";
import LoaBlankScreen from "@/components/LoaBlankScreen/LoaBlankScreen";
import { useAuth } from "@/providers/AuthProvider";
import DoctorDataDownload from "./DoctorDataDownload/DoctorDataDownload";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import { docotorPrescriptionValidation } from "@/validations/Yup/docotorPrescriptionValidation";
export interface IDoctorDropDownsState {
  displayAddForm: boolean;
  isModalOpen: ModalState;
  displayDropdown: boolean;
  openMenuId?: string | null;
}

const DoctorPrescription = () => {
  const navigate = useNavigate();
  const { id, aId } = useParams();
  const { auth } = useAuth();

  const dispatch = useDispatch();

  const [searchParams, _setSearchParams] = useSearchParams();

  const [dosages, setDosages] = useState<ISelectOption[]>([{ label: "select", value: "" }]);

  const [prescriptionToBeSaved, setPrescriptionToBeSaved] = useState<IprescriptionState[]>([]);

  const [prescriptionState, setPrescriptionState] = useState<IprescriptionState>({
    medicine: { label: "Select", value: "" },
    durationFrequency: { label: "Today Only", value: "Today Only" },
    customDuration: "",
    prescribedWhen: { label: "Select", value: "" },
    instructions: "",
    usages: [
      {
        frequency: "Morning",
        quantity: 1,
        when: { label: "Select", value: "" },
        dosage: { label: "Select", value: "" }
      },
      {
        frequency: "Noon",
        quantity: 1,
        when: { label: "Select", value: "" },
        dosage: { label: "Select", value: "" }
      },
      {
        frequency: "Night",
        quantity: 1,
        when: { label: "Select", value: "" },
        dosage: { label: "Select", value: "" }
      }
    ]
  });

  const [data, setData] = useState({
    id: "",
    patientId: "",
    patientAdmissionHistoryId: "",
    doctorId: "",
    medicinesInfo: [],
    noteDate: "",
    noteTime: ""
  });

  const [state, setState] = useState<IDoctorState>({
    popId: null,
    popId1: null,
    DateRangeModal: false,
    UHID: "",
    patientId: "",
    dateOfAdmission: "",
    patientAdmissionHistoryId: "",
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    assignedDoctor: "",
    patientProfilePic: "",
    totalPages: "",
    doctorName: ""
  });

  const [dropDownsState, setDropDownsState] = useState<IDoctorDropDownsState>({
    displayAddForm: false,
    displayDropdown: false,
    isModalOpen: false,
    openMenuId: null
  });

  const [doctorPrescriptions, setDoctorPrescriptions] = useState<IDoctorPrescrition[]>([]);
  const [doctorPrescriptions1, setDoctorPrescriptions1] = useState<IDoctorPrescrition[]>([]);
  const groupByDate = (
    items: IDoctorPrescrition[]
  ): Array<{
    date: string;
    data: IDoctorPrescrition[];
  }> => {
    return items.slice(1, items.length).map((item) => {
      return {
        date: item.noteDateTime,
        data: [item] // individual items, not grouped
      };
    });
  };

  const [allDoctors, setAllDoctors] = useState<IUser[]>([]);

  const [isModalOpen, setModalOpen] = useState<ModalState>(false);

  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([
    "Morning",
    "Noon",
    "Night"
  ]);

  const patientData = useSelector((store: RootState) => store.patient);

  const [frequencyName, setFrequencyName] = useState("");

  const [toggleAddFrequencyInput, setToggleAddFrequencyInput] = useState(false);

  const [calenderView, setCalenderView] = useState(false);
  const [all, setAll] = useState<number | null>(null);

  const [updateIndex, setUpdateIndex] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const calenderRef = useRef<HTMLInputElement>(null);

  const handleClickOutsideCalender = (event: MouseEvent<Document>) => {
    if (calenderRef.current && !calenderRef.current.contains(event.target as Node)) {
      setCalenderView(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideCalender as unknown as EventListener);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutsideCalender as unknown as EventListener
      );
    };
  }, []);

  const fetchDoctorPrescriptions = async () => {
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

        const { data: doctorPrescription } = await getAllDoctorPrescription({
          limit: 20,
          page: page,
          sort: sort,
          patientAdmissionHistoryId: aId,
          "noteDateTime[gte]": searchParams.get("startDate"),
          "noteDateTime[lte]": searchParams.get("endDate")
        });

        const { data: doctorPrescription1 } = await getAllDoctorPrescription({
          limit: 1,
          patientAdmissionHistoryId: aId
        });

        setDoctorPrescriptions(doctorPrescription.data);
        setDoctorPrescriptions1(doctorPrescription1.data);

        setState((prev) => ({
          ...prev,
          totalPages: doctorPrescription?.pagination?.totalPages,
          patientId: id,
          dateOfAdmission: dateOfAdmission,
          patientAdmissionHistoryId: aId,
          patientProfilePic: patientData?.data?.patientPicUrl || "",
          firstName: patientData?.data?.firstName || "",
          lastName: patientData?.data?.lastName || "",
          gender: patientData?.data?.gender || "",
          age: patientData?.data?.age || "",
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
    fetchDoctorPrescriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      if (frequencyName.trim() !== "") {
        AddRemoveAnotherFrequencyRoutine(frequencyName);
        setFrequencyName("");
      }
      setToggleAddFrequencyInput(false);
    }
  };

  const handleEnterKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" && frequencyName.trim() !== "") {
      AddRemoveAnotherFrequencyRoutine(frequencyName);
      setToggleAddFrequencyInput(false); // Close input after pressing "Enter"
      setFrequencyName("");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    document.addEventListener("keydown", handleEnterKeyPress);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
      document.removeEventListener("keydown", handleEnterKeyPress);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleAddFrequencyInput, frequencyName]);

  const confirmDeleteNote = async () => {
    const response = await deleteDoctorPrescription(data.id);
    if (response.data?.status == "success") {
      toast.success(response.data?.message);
      fetchDoctorPrescriptions();
      toggleModal();
    }
    setData((prevData) => ({ ...prevData, id: "" }));
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  const handleDateTimeChange = (data: string, type: string, key: string) => {
    let value = new Date().toLocaleDateString("en-CA");
    if (data) {
      value = new Date(data).toLocaleDateString("en-CA");
    }
    if (type == "date") {
      if (key == "customDuration") {
        setPrescriptionState((prev) => ({
          ...prev,
          customDuration: data,
          durationFrequency: { label: "Custom Date", value: "Custom Date" }
        }));
        setCalenderView(false);
        return;
      }
      setData((prev) => ({ ...prev, [key]: value }));
    } else if (type == "time") {
      setData((prev) => ({ ...prev, noteTime: data }));
    }
  };

  const handleSelectFrequency = (name: string) => {
    if (selectedFrequencies.includes(name)) {
      setSelectedFrequencies(selectedFrequencies.filter((freq) => freq !== name));
    } else {
      setSelectedFrequencies([...selectedFrequencies, name]);
    }
  };

  const AddRemoveAnotherFrequencyRoutine = (name: string) => {
    setPrescriptionState((prev: IprescriptionState) => {
      const usageExists = prev.usages.some((usage: IUsages) => usage.frequency === name);

      if (usageExists) {
        // If the frequency already exists, remove it
        return {
          ...prev,
          usages: prev.usages.filter((usage) => usage.frequency !== name)
        };
      } else {
        // If the frequency doesn't exist, add it
        return {
          ...prev,
          usages: [
            ...prev.usages,
            {
              frequency: name,
              quantity: 1,
              when: { label: "Select", value: "" },
              dosage: { label: "Select", value: "" }
            }
          ]
        };
      }
    });
  };

  const handlePrescriptionQuantityChange = (index: number, action: "increment" | "decrement") => {
    const updatedFrequencies = prescriptionState.usages;

    if (action === "increment") {
      updatedFrequencies[index].quantity += 1;
    } else if (action === "decrement") {
      if (updatedFrequencies[index].quantity > 1) {
        updatedFrequencies[index].quantity -= 1;
      }
    }
    setPrescriptionState({ ...prescriptionState, usages: updatedFrequencies });
  };
  // Handle Usages Select Fields
  const handlePrescriptionUpdateSelectFields = async (
    index: number,
    key: string,
    value: ISelectOption
  ) => {
    if (index == -1) {
      // Handling the VAlues Except the Usages Array
      if (key == "durationFrequency" && value.value === "Custom Date") {
        setCalenderView(true);
        return;
      }
      if (key === "medicine") {
        const response = await getSingleMedicine(value.value.toString());
        const dosageArray = response?.data?.data?.dosage || [{ label: "select", value: "" }];
        const formattedDosages = dosageArray.map((data: string) => ({
          label: data,
          value: data
        }));
        setDosages(formattedDosages);
        setPrescriptionState((prev) => ({
          ...prev,
          [key]: value,
          customDuration: "",
          durationFrequency: { label: "Today Only", value: "Today Only" },
          usages: [
            {
              frequency: "Morning",
              quantity: 1,
              when: { label: "Select", value: "" },
              dosage: { label: "Select", value: "" }
            },
            {
              frequency: "Noon",
              quantity: 1,
              when: { label: "Select", value: "" },
              dosage: { label: "Select", value: "" }
            },
            {
              frequency: "Night",
              quantity: 1,
              when: { label: "Select", value: "" },
              dosage: { label: "Select", value: "" }
            }
          ]
        }));

        return;
      }
      setPrescriptionState((prev) => ({ ...prev, [key]: value }));
    } else {
      // Handling the Inside Usages Array VAlues
      setPrescriptionState((prevState: IprescriptionState) => {
        const updatedUsages = prevState.usages.map((usage, idx) =>
          idx === index ? { ...usage, [key]: value } : usage
        );

        // Return the updated state
        return {
          ...prevState,
          usages: updatedUsages
        };
      });
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [errors, setErrors] = useState<Record<string, any>>({});
  useEffect(() => {
    console.log(errors);
  }, [errors]);
  // Add Prescription to Right
  const addPrescriptionToBeSaveState = async () => {
    try {
      setErrors({});
      await docotorPrescriptionValidation.validate(prescriptionState, { abortEarly: false });

      if (prescriptionToBeSaved.length >= 30) {
        toast.error("You can only add 30 prescriptions at a time");
        return;
      }
      setErrors({});

      if (prescriptionState.usages.length === 0) {
        toast.error("At least one frequency is required");
        return;
      }

      // Validate all usages; exit function if any are invalid
      // const hasInvalidUsage = prescriptionState.usages.some((usage) => {
      //   if (!usage.dosage.value && dosages.length >= 1) {
      //     toast.error(`${usage.frequency} "dosages" are missing`);
      //     return true; // Stops further execution of `some()`
      //   }
      //   return false;
      // });

      // if (hasInvalidUsage) return; // Stop execution if any usage is invalid
      setPrescriptionToBeSaved((prev) =>
        updateIndex !== undefined && updateIndex !== null
          ? prev.map((item, i) => (i === updateIndex ? prescriptionState : item))
          : [...prev, prescriptionState]
      );

      setUpdateIndex(null);

      setPrescriptionState({
        medicine: { label: "Select", value: "" },
        durationFrequency: { label: "Today Only", value: "Today Only" },
        customDuration: "",
        prescribedWhen: { label: "Select", value: "" },
        instructions: "",
        usages: [
          {
            frequency: "Morning",
            quantity: 1,
            when: { label: "Select", value: "" },
            dosage: { label: "Select", value: "" }
          },
          {
            frequency: "Noon",
            quantity: 1,
            when: { label: "Select", value: "" },
            dosage: { label: "Select", value: "" }
          },
          {
            frequency: "Night",
            quantity: 1,
            when: { label: "Select", value: "" },
            dosage: { label: "Select", value: "" }
          }
        ]
      });
      setSelectedFrequencies(["Morning", "Noon", "Night"]);
    } catch (error) {
      if (error instanceof Error && "inner" in error) {
        console.log(error);
        const validationErrors: Record<string, string> = {};
        const validationErrorArray = error.inner as Array<{ path: string; message: string }>;
        validationErrorArray.forEach((e) => {
          if (e.path && !validationErrors[e.path]) {
            validationErrors[e.path] = e.message;
          }
        });
        setErrors(validationErrors);
        return; // ✅ Set the errors in the state
      } else {
        handleError(error);
      }
    }
  };

  const toggleDoctorMenu = () => {
    setDropDownsState({ ...dropDownsState, displayDropdown: !dropDownsState.displayDropdown });
  };

  const handleDelete = (id: string) => {
    setData((prevState) => ({
      ...prevState,
      id: id
    }));
    toggleModal();
  };

  const formatMedicineOption = (medicine: { _id: string; name: string; genericName: string }) => ({
    label: `${medicine.name} (${medicine.genericName})`,
    value: medicine._id
  });

  const fetchMedines = async (query: string) => {
    const response = await getAllMedicine({
      limit: 300,
      page: 1,
      sort: "name",
      term: query,
      searchField: "name"
    });
    return response?.data?.data?.map(formatMedicineOption);
  };

  const handleSave = async () => {
    try {
      const medicinesInfo = prescriptionToBeSaved.map((data: IprescriptionState) => ({
        medicine: data.medicine.value,
        durationFrequency: data.durationFrequency.value || "",
        customDuration: data.customDuration || "",
        prescribedWhen: data.prescribedWhen.value,
        instructions: data.instructions,
        usages: data.usages.map((data: IUsages) => ({
          frequency: data.frequency,
          quantity: data.quantity,
          when: data.when.value,
          dosage: data.dosage.value
        }))
      }));
      const combinedDateTime = `${data.noteDate} ${data.noteTime}`;
      const formattedDateTime = new Date(combinedDateTime).toISOString();
      const body = {
        ...data,
        noteDateTime: formattedDateTime,
        medicinesInfo
      };

      const response = await createDoctorPrescription(body);
      if (response && response?.status === 201) {
        toast.success("Prescription saved successfully");
      }
      fetchDoctorPrescriptions();
      setData((prev) => ({
        ...prev,
        noteDate: moment().format("YYYY-MM-DD"),
        noteTime: moment().format("HH:mm:ss")
      }));
      setPrescriptionToBeSaved([]);

      setPrescriptionState({
        medicine: { label: "Select", value: "" },
        durationFrequency: { label: "Today Only", value: "Today Only" },
        customDuration: "",
        prescribedWhen: { label: "Select", value: "" },
        instructions: "",
        usages: [
          {
            frequency: "Morning",
            quantity: 1,
            when: { label: "Select", value: "" },
            dosage: { label: "Select", value: "" }
          },
          {
            frequency: "Noon",
            quantity: 1,
            when: { label: "Select", value: "" },
            dosage: { label: "Select", value: "" }
          },
          {
            frequency: "Night",
            quantity: 1,
            when: { label: "Select", value: "" },
            dosage: { label: "Select", value: "" }
          }
        ]
      });

      setSelectedFrequencies(["Morning", "Noon", "Night"]);
    } catch (error) {
      handleError(error);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, aId]);

  const handleUpdate = (data: IDoctorPrescrition) => {
    setState((prev) => ({
      ...prev,
      doctorName: `${data?.doctorId?.firstName} ${data?.doctorId?.lastName}`
    }));

    setData((prev) => ({
      ...prev,
      doctorId: data?.doctorId?._id,
      noteDate: data?.noteDateTime && moment(data?.noteDateTime).format("YYYY-MM-DD"),
      noteTime: data?.noteDateTime && moment(data?.noteDateTime).format("HH:mm:ss"),

      id: data._id
    }));

    setPrescriptionToBeSaved(
      data?.medicinesInfo?.map((item) => ({
        medicine: {
          label: `${item?.medicine?.name} (${item?.medicine?.genericName})`,
          value: item?.medicine?._id
        },
        durationFrequency: {
          label: item?.durationFrequency || "CustomDate",
          value: item?.durationFrequency || "CustomDate"
        },
        customDuration: item?.customDuration || "", // Fixed missing comma
        instructions: item?.instructions,
        prescribedWhen: { label: item?.prescribedWhen, value: item?.prescribedWhen },
        usages:
          item?.usages?.map((usage) => ({
            frequency: usage.frequency,
            quantity: usage.quantity,
            when: { label: usage.when, value: usage.when },
            dosage: { label: usage.dosage, value: usage.dosage }
          })) || [] // Ensures `usages` isn't empty if missing
      })) || []
    );
  };

  const handleDeletePrescriptionToBeSaved = (indexToDelete: number) => {
    setPrescriptionToBeSaved((prev) => prev.filter((_, index) => index !== indexToDelete));
  };

  const popUpRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const popRefDoc = useRef<HTMLDivElement | null>(null);

  const handleUpdateLocal = async (value: IprescriptionState, indexId: number) => {
    setPrescriptionState({
      customDuration: value.customDuration,
      durationFrequency: value.durationFrequency,
      instructions: value.instructions,
      prescribedWhen: value.prescribedWhen,
      medicine: value.medicine,
      usages: value.usages
    });
    const response = await getSingleMedicine(value?.medicine?.value?.toString());
    const dosageArray = response?.data?.data?.dosage || [{ label: "select", value: "" }];
    const formattedDosages = dosageArray.map((data: string) => ({
      label: data,
      value: data
    }));
    setDosages(formattedDosages);
    setUpdateIndex(indexId);
    setSelectedFrequencies(value.usages.map((data) => data.frequency));
    // setPrescriptionToBeSaved((prev) => prev.filter((_, index) => index !== indexId));
  };

  const handleClickOutsides = (event: MouseEvent<Document>) => {
    if (popUpRef.current && !popUpRef.current.contains(event.target as Node)) {
      setState((prev) => ({ ...prev, popId: null }));
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsides as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsides as unknown as EventListener);
    };
  }, []);

  const handleClickOut = (event: MouseEvent<Document>) => {
    if (popRef.current && !popRef.current.contains(event.target as Node)) {
      setState((prev) => ({ ...prev, popId1: null }));
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOut as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOut as unknown as EventListener);
    };
  }, []);

  const handleClickOutDoc = (event: MouseEvent<Document>) => {
    if (popRefDoc.current && !popRefDoc.current.contains(event.target as Node)) {
      setDropDownsState({ ...dropDownsState, displayDropdown: false });
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutDoc as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutDoc as unknown as EventListener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-[#F4F2F0] min-h-[calc(100vh-64px)]">
      <div className=" container">
        <div className="flex flex-wrap lg:px-8 px-8  bg-[#F4F2F0] justify-between md:flex-row flex-col md:items-center">
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
              className="px-8 text-sm py-3 cursor-pointer"
            >
              Notes
            </Link>
            <Link
              to={`/admin/patients/in-patient/${id}/daily-progress/${aId}/doctor/prescription`}
              className="px-8 font-bold text-sm border-b cursor-pointer border-black py-3"
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

        <RBACGuard resource={RESOURCES.DOCTOR_PRESCRIPTION} action="write">
          {!patientData.loa.loa ? (
            <div className=" bg-[#F4F2F0]  p-5 px-8  py-0 pb-10 rounded-lg font-semibold">
              <div className="rounded-2xl h-fit  px-5 py-3">
                <div className="grid lg:grid-cols-2 sm:grid-cols-1   gap-3">
                  <div className="grid sm:col-span-1  lg:col-span-1 col-start-1 rounded-xl bg-white">
                    <div className=" flex p-4 items-center justify-between">
                      <div className="flex items-center justify-between w-full">
                        <p className="text-[13px] font-bold">Add Prescription</p>
                        <div className="flex">
                          <div className="ml-4 flex items-center text-gray-500">
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
                                handleDateTimeChange(date, "date", "noteDate");
                              }}
                            >
                              <div className="flex text-xs text-nowrap whitespace-nowrap items-center">
                                {data?.noteDate && formateNormalDate(data?.noteDate)}
                                <div className="flex cursor-pointer items-center justify-center w-4 mx-2 h-4">
                                  <img alt="calender" src={calendar} className="w-full h-full" />
                                </div>
                              </div>
                            </CustomCalendar>
                            <hr className="mx-[2px] text-gray-300  w-[15px] rotate-90 bg-blue-500 " />
                            <CustomTimeDoctor
                              value={data.noteTime}
                              onChange={(time) => {
                                handleDateTimeChange(time, "time", "noteTime");
                              }}
                            >
                              <div title={data.noteTime} className="flex  text-xs items-center">
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
                          <div className="ml-8 relative cursor-pointer text-xs flex items-center text-gray-500">
                            <div className="font-medium">Doctor : </div>
                            <div
                              onClick={() => {
                                toggleDoctorMenu();
                              }}
                              className="text-[#292929] mx-2 text-wrap font-bold"
                            >
                              {state.doctorName}
                            </div>
                            <IoIosArrowDown
                              onClick={() => {
                                toggleDoctorMenu();
                              }}
                              className="text-black h-4 w-4 cursor-pointer"
                            />
                            {dropDownsState.displayDropdown && (
                              <div
                                ref={popRefDoc}
                                className="absolute top-5  left-5  mt-1 z-20 bg-white shadow-lg rounded-md w-[210px]"
                              >
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
                                              toggleDoctorMenu();
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
                        </div>
                      </div>
                    </div>
                    <div className="lg:grid sm:flex sm:flex-col h-fit lg:grid-cols-1 px-5 sm:grid-cols-3 gap-4 p-4 items-start">
                      <div className="  sm:w-full grid sm:grid-cols-1  lg:grid-cols-2 gap-x-[18px] gap-y-8 items-start justify-center">
                        <div className="grid sm:col-span-2 lg:col-span-1 col-start-1">
                          <Select
                            errors={errors["medicine.value"]}
                            label="Medicines"
                            required
                            apiCall={true}
                            fetchOptions={fetchMedines}
                            options={[{ label: "Select", value: "" }]}
                            // className="
                            placeholder="Select"
                            onChange={(name, value) => {
                              handlePrescriptionUpdateSelectFields(-1, name, value);
                            }}
                            labelClassName="col-span-1"
                            value={prescriptionState.medicine}
                            name="medicine"
                          />
                        </div>
                        <div className="grid  sm:col-span-2 lg:col-span-1 lg:col-start-2 relative">
                          <Select
                            label="Duration"
                            options={[
                              { label: "Daily", value: "Daily" },
                              { label: "Today Only", value: "Today Only" },
                              { label: "Every Week on Sunday", value: "Every Week on Sunday" },
                              { label: "Every Weekday", value: "Every Weekday" },
                              { label: "Custom Date", value: "Custom Date" }
                            ]}
                            placeholder="Select"
                            onChange={(name, value) => {
                              handlePrescriptionUpdateSelectFields(-1, name, value);
                            }}
                            value={
                              prescriptionState.durationFrequency.label === "Custom Date"
                                ? {
                                    label: prescriptionState.customDuration
                                      .split("|")
                                      .map((d) => moment(d).format("D MMMM"))
                                      .join(" to "),
                                    value: prescriptionState.customDuration
                                  }
                                : prescriptionState.durationFrequency
                            }
                            name="durationFrequency"
                            className="col-span-2 "
                          />
                          {calenderView && (
                            <div ref={calenderRef}>
                              <CustomCalenderForDoctor
                                // disabledDate={(current) => {
                                //   const minDate = new Date(state.dateOfAdmission);

                                //   return current < minDate;
                                // }}
                                value={prescriptionState.customDuration}
                                onChange={(date) => {
                                  setPrescriptionState((prev) => ({
                                    ...prev,
                                    customDuration: date,
                                    durationFrequency: {
                                      label: "Custom Date",
                                      value: "Custom Date"
                                    }
                                  }));
                                  setCalenderView(false);
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <div className="grid sm:col-span-2 lg:col-span-1 col-span-1">
                          <Select
                            label="Prescribed when"
                            options={[
                              { label: "After Treament", value: "After Treament" },
                              { label: "Before Treament", value: "Before Treament" },
                              { label: "Discharge Advice", value: "Discharge Advice" },
                              { label: "During Treament", value: "During Treament" }
                            ]}
                            placeholder="Select"
                            onChange={(name, value) => {
                              handlePrescriptionUpdateSelectFields(-1, name, value);
                            }}
                            value={prescriptionState.prescribedWhen}
                            name="prescribedWhen"
                            className="col-span-2 "
                          />
                        </div>
                        <div className="grid sm:col-span-2 lg:col-span-1 lg:col-start-2  ">
                          <Input
                            label="Instructions"
                            labelClassName="text-black"
                            name="instructions"
                            value={prescriptionState.instructions}
                            onChange={(e) => {
                              setPrescriptionState({
                                ...prescriptionState,
                                instructions: e.target.value
                              });
                            }}
                            placeholder="Add"
                            className="col-span-3 rounded-[8px]! border-[#A5A5A5] border-2 p-2 py-3"
                          />
                        </div>
                      </div>

                      <div className="w-full">
                        <div className="flex flex-col items-ce justify-between h-full mt-2  pb-3 space-y-2">
                          <div className="sm:flex justify-between items-center">
                            <div className="flex  sm:w-fit">
                              <div className=" w-fit ">
                                <label htmlFor="" className="text-sm font-medium">
                                  Frequency/Routine<span>*</span>
                                </label>
                              </div>
                            </div>
                            <div className="flex items-center justify-evenly sm:w-full">
                              <div className=" w-36 ml-3 ">
                                <div className="w-fit ">
                                  <label htmlFor="" className="text-sm font-medium">
                                    Quantity
                                  </label>
                                </div>
                              </div>
                              <div className=" w-44  ">
                                <div className=" w-fit ">
                                  <label htmlFor="" className="text-sm font-medium">
                                    When
                                  </label>
                                </div>
                              </div>
                              <div className="w-44 ">
                                <div className="w-fit ">
                                  <label htmlFor="" className="text-sm font-medium">
                                    Dosage{" "}
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {prescriptionState &&
                          prescriptionState.usages.map((freq: IFrequency, index: number) => (
                            <div
                              key={index}
                              className="flex flex-col  justify-between h-full mb-2 border-b pb-3 "
                            >
                              <div className="sm:flex relative justify-between items-center">
                                <div className="relative">
                                  <Button
                                    className={`frequency-button ${
                                      selectedFrequencies.includes(freq.frequency)
                                        ? "bg-[#ECF3CA] border  border-[#848D5E] text-black"
                                        : "bg-[#F5F5F5] text-black border border-white"
                                    } font-semibold py-2! border rounded w-30! `}
                                    onClick={() => handleSelectFrequency(freq.frequency)}
                                  >
                                    <p className="truncate">{freq.frequency}</p>
                                  </Button>
                                  <div
                                    onClick={() => {
                                      AddRemoveAnotherFrequencyRoutine(freq.frequency);
                                    }}
                                    className="p-0.5 cursor-pointer bg-gray-200  rounded-full absolute top-0 right-0"
                                  >
                                    <RxCross2 />
                                  </div>
                                </div>

                                {selectedFrequencies.includes(freq.frequency) && (
                                  <div className="flex items-center justify-evenly sm:w-full">
                                    <div className="flex items-center ">
                                      {/* Decrement Button */}
                                      <button
                                        className="bg-[#9DAE57] opacity-[50%] cursor-pointer text-black font-semibold py-2 px-3 rounded-l-sm"
                                        onClick={() =>
                                          handlePrescriptionQuantityChange(index, "decrement")
                                        }
                                      >
                                        -
                                      </button>
                                      <span className="bg-[#ECF3CA] text-black font-semibold py-2 px-7 ">
                                        {freq.quantity}
                                      </span>
                                      {/* Increment Button */}
                                      <button
                                        className="bg-[#9DAE57] cursor-pointer opacity-[50%] text-black font-semibold py-2 px-3 rounded-r-sm"
                                        onClick={() =>
                                          handlePrescriptionQuantityChange(index, "increment")
                                        }
                                      >
                                        +
                                      </button>
                                    </div>
                                    <div>
                                      <Select
                                        // label={`${index == 0 ? "When" : ""}`}
                                        name="when"
                                        className="bg-gray-100 w-40! text-gray-700 font-semibold py-1! px-3 rounded-[7px]!"
                                        options={[
                                          { label: "Select", value: "" },
                                          { label: "After BreakFast", value: "After BreakFast" },
                                          { label: "After Lunch", value: "After Lunch" },
                                          { label: "Empty Stomach", value: "Empty Stomach" }
                                        ]}
                                        value={freq.when}
                                        onChange={(name, value) => {
                                          handlePrescriptionUpdateSelectFields(index, name, value);
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <Select
                                        // label={`${index == 0 ? "Dosage" : ""}`}
                                        name="dosage"
                                        className="bg-gray-100 w-40! text-gray-700 font-semibold py-1! px-3 rounded-lg!"
                                        options={dosages}
                                        value={freq.dosage}
                                        onChange={(name, value) => {
                                          handlePrescriptionUpdateSelectFields(index, name, value);
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        <div className="flex justify-between items-center">
                          {!toggleAddFrequencyInput ? (
                            <Button
                              className={`frequency-button border-[#D0DE8E] text-black border cursor-pointer font-semibold py-1! px-3 rounded min-w-24`}
                              onClick={() => {
                                setToggleAddFrequencyInput(!toggleAddFrequencyInput);
                              }}
                            >
                              +Add more
                            </Button>
                          ) : (
                            <div ref={inputRef}>
                              <Input
                                type="text"
                                onChange={(e) => {
                                  setFrequencyName(e.target.value);
                                }}
                                name="frequencyName"
                                maxLength={15}
                                className="w-24! rounded-xl py-1!"
                                placeholder="Add"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <Button
                        onClick={() => {
                          addPrescriptionToBeSaveState();
                        }}
                        className="mx-auto w-64 py-2! mb-5 text-xs rounded-xl hover:bg-[#575F4A]!    text-white bg-[#575F4A]"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="grid sm:col-span-1  lg:col-span-1 col-start-2  rounded-xl bg-white">
                    <div className="px-2 max-h-[700px] h-[600px]   bg-white rounded-xl font-semibold text-xs py-5">
                      <div className="w-full flex items-start  overflow-auto justify-center h-full">
                        {prescriptionToBeSaved.length > 0 ? (
                          <table className="sm:w-[1000px] lg:w-full rounded-lg text-sm text-left">
                            <thead className="bg-[rgb(233,232,229)]  w-full h-full  top-0 sticky z-10 ">
                              <tr className="text-[#505050] text-xs font-medium">
                                <th className="px-3 py-3 font-medium text-[#505050] text-xs w-1/4 text-nowrap whitespace-nowrap">
                                  Medicine & Dosage
                                </th>
                                <th className="px-3 py-3 font-medium text-[#505050] text-xs w-1/4 text-nowrap whitespace-nowrap">
                                  Duration
                                </th>
                                <th className="px-3 py-3 font-medium text-[#505050] text-xs w-1/4 text-nowrap whitespace-nowrap">
                                  Frequency/Routine
                                </th>
                                <th className="px-3 py-3 font-medium text-[#505050] text-xs w-1/4 text-nowrap whitespace-nowrap">
                                  Instructions
                                </th>
                                <th className="px-3 py-3 text-black text-xs">{""}</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white w-full h-full">
                              {prescriptionToBeSaved.map((value, index) => (
                                <tr
                                  key={index}
                                  className="text-[#505050] text-xs border-b  font-medium"
                                >
                                  <td className="px-3 py-3 w-10 truncate text-black text-xs font-semibold text-nowrap whitespace-nowrap">
                                    <p
                                      className="truncate w-[100px]"
                                      title={value?.medicine.label.toString()}
                                    >
                                      {value?.medicine.label}
                                    </p>
                                  </td>
                                  <td className="px-3 py-3 text-black text-xs text-nowrap whitespace-nowrap">
                                    {value?.durationFrequency.value == "Custom Date" &&
                                    value?.customDuration
                                      ? value?.customDuration
                                          .split("|")
                                          .map((d) => moment(d).format("D MMMM"))
                                          .join(" to ")
                                      : value?.durationFrequency.value || "--"}
                                  </td>
                                  <td className="px-3 py-3 text-black text-xs">
                                    {value.usages.map((data, key) => {
                                      return (
                                        <div
                                          key={key}
                                          className="flex my-1 items-center flex-wrap gap-2"
                                        >
                                          <span className="bg-[#ECF3CA] mr-1 text-black text-nowrap whitespace-nowrap  px-1 py-[2px] rounded-[10px] border-[#C9D686] border">
                                            <span className="text-xs font-bold">
                                              {data.frequency}
                                            </span>
                                            , {data.quantity}
                                            Tablet {data.dosage.value} {data.when.value}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </td>

                                  <td className="px-4 py-3 w-[10px] truncate text-black text-xs">
                                    <p className="truncate w-[70px]" title={value.instructions}>
                                      {value.instructions}
                                    </p>
                                  </td>
                                  <td className="w-fit relative pr-1">
                                    <div
                                      onClick={() =>
                                        setState((prev) => ({
                                          ...prev,
                                          popId: index === state.popId ? null : index
                                        }))
                                      }
                                      className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-md hover:bg-[#D4E299] cursor-pointer"
                                    >
                                      <img src={kabab} alt="icon" className="w-full h-full" />
                                      {index == state.popId && (
                                        <div
                                          ref={popUpRef}
                                          className="absolute right-3 top-0  overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-lg z-10 flex items-center justify-center"
                                        >
                                          <div className="p-1  text-nowrap whitespace-nowrap gap-0 flex-col flex justify-center bg-white shadow-lg rounded-lg w-fit">
                                            <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                              <div
                                                onClick={() => {
                                                  window.scrollTo({ top: 0 });
                                                  handleUpdateLocal(value, index);
                                                }}
                                                className="flex items-center  cursor-pointer"
                                              >
                                                <p>Edit</p>
                                              </div>
                                            </div>
                                            <hr />
                                            <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                              <div
                                                onClick={() => {
                                                  handleDeletePrescriptionToBeSaved(index);
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
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="flex w-full h-full flex-col items-center justify-center gap-6">
                            <img alt="nodata" src={noPrescrition} />
                            <p className="text-[14px] font-semibold">No Prescription</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {!patientData.loa.loa && (
                      <div>
                        {prescriptionToBeSaved.length > 0 && (
                          <Button
                            onClick={handleSave}
                            className="mx-auto w-64 rounded-xl hover:bg-[#575F4A]! text-xs!  mb-6 py-2! text-white bg-[#575F4A]"
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <LoaBlankScreen />
          )}
        </RBACGuard>

        <div className="px-8 w-full overflow-auto bg-white font-semibold text-xs py-5">
          {(searchParams.get("startDate") || doctorPrescriptions.length > 0) && (
            <div className="flex justify-between items-center w-full py-4 pl-3">
              <p className="text-[14px] font-semibold ml-4">All Records</p>
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
                <DoctorDataDownload
                  // data={doctorPrescriptions}
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

          {doctorPrescriptions.length > 0 ? (
            <div className="max-w-screen lg:overflow-visible overflow-scroll scrollbar-hidden ">
              <table className="sm:w-[1000px] lg:w-full text-sm text-left">
                <thead className="bg-[#E9E8E5] w-full  top-0 sticky z-10 ">
                  <tr className="text-[#505050] text-xs font-medium">
                    <th
                      className={` ${
                        all ? "px-8" : "px-8"
                      } py-3   font-medium text-[#505050] text-xs  pl-6    text-nowrap whitespace-nowrap`}
                    >
                      Date & Time
                    </th>
                    <th className="px-6 py-3  font-medium text-[#505050]  text-xs  text-nowrap whitespace-nowrap">
                      Doctor
                    </th>
                    <th className="px-6 py-3 font-medium text-[#505050]  text-xs  text-nowrap whitespace-nowrap">
                      Medicine & Dosage
                    </th>
                    <th className="px-6 py-3 font-medium text-[#505050]  text-xs  text-nowrap whitespace-nowrap">
                      Frequency/Routine
                    </th>
                    <th className="px-6 py-3 font-medium text-[#505050]  text-xs  text-nowrap whitespace-nowrap">
                      Duration
                    </th>
                    <th className="px-6 py-3 font-medium text-[#505050]  text-xs ">Instructions</th>
                    <th className="px-6 py-3 font-medium text-[#505050]  text-xs  text-nowrap whitespace-nowrap">
                      Prescribed When
                    </th>
                    <RBACGuard resource={RESOURCES.DOCTOR_PRESCRIPTION} action="write">
                      <th className="px-8 py-3 text-black text-xs ">{""}</th>
                    </RBACGuard>
                  </tr>
                </thead>
                <tbody className="bg-white  w-full h-full">
                  {doctorPrescriptions1.map((data: IDoctorPrescrition, index: number) =>
                    data.medicinesInfo.map((med, i) => (
                      <tr
                        className="text-[#505050] align-middle   text-xs font-medium"
                        key={`${index}-${i}`}
                      >
                        {/* ✅ Render Date Column Only Once per Prescription */}
                        {i === 0 && (
                          <td rowSpan={data.medicinesInfo.length} className="pl-6 py-3 text-left  ">
                            <div className="flex flex-col justify-start">
                              <p className="font-bold">{formatDate(data?.noteDateTime)}</p>
                              <p className="text-gray-500">
                                {data?.noteDateTime && convertBackendDateToTime(data?.noteDateTime)}
                              </p>
                            </div>
                          </td>
                        )}

                        {/* Doctor Name */}
                        {i === 0 && (
                          <td
                            rowSpan={data.medicinesInfo.length}
                            className="px-6  py-3 text-nowrap  text-black  text-sm"
                          >
                            {data?.doctorId?.firstName + " " + data?.doctorId?.lastName}
                          </td>
                        )}

                        {/* Medicine Name */}
                        <td
                          title={`${med?.medicine?.name || "--"} (${med.medicine.genericName})`}
                          className="px-6  py-3 border-b text-black text-xs font-semibold"
                        >
                          <div className="truncate w-32 text-wrap ">
                            {med?.medicine?.name || "--"}({med.medicine.genericName})
                          </div>
                        </td>

                        {/* Frequency/Routine */}
                        <td className="px-5 w-96  py-3 border-b text-black text-xs">
                          <div className="flex items-center flex-wrap gap-2 my-2">
                            {med?.usages?.map((d, i) => (
                              <span
                                key={i}
                                className="bg-[#ECF3CA] mr-1 text-black text-nowrap px-1 py-[2px] rounded-[10px] border-[#C9D686] border"
                              >
                                <span className="text-xs font-bold">{d?.frequency}</span>,{" "}
                                {d?.quantity} Tablet {d?.dosage} {d?.when}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-4  py-3 border-b text-black text-xs text-nowrap whitespace-nowrap">
                          <div className=" w-32 ml-2 text-wrap ">
                            {med?.customDuration && med?.durationFrequency == "Custom Date"
                              ? med?.customDuration
                                  .split("|")
                                  .map((d) => moment(d).format("D MMMM"))
                                  .join(" to ")
                              : med?.durationFrequency || "--"}
                          </div>
                        </td>

                        <td
                          title={med?.instructions || ""}
                          className="px-6    py-3 border-b text-black text-xs"
                        >
                          <div className="truncate w-64  ">{med?.instructions || "--"}</div>
                        </td>

                        {/* Prescribed When */}
                        <td className="px-6 py-3 border-b text-black text-xs text-nowrap whitespace-nowrap">
                          {med?.prescribedWhen || "--"}
                        </td>

                        {/* Instructions */}

                        {/* Actions */}
                        {i === 0 && (
                          <RBACGuard resource={RESOURCES.DOCTOR_PRESCRIPTION} action="write">
                            <td
                              rowSpan={data.medicinesInfo.length}
                              className="pl-6 align-middle border-b py-3 relative pr-1"
                            >
                              <div
                                onClick={() => {
                                  if (!patientData.loa.loa) {
                                    setState((prev) => ({
                                      ...prev,
                                      popId1: state.popId1 == index ? null : index
                                    }));
                                  }
                                }}
                                className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-md hover:bg-[#D4E299] cursor-pointer"
                              >
                                <img src={kabab} alt="icon" className="w-full h-full" />
                                {state.popId1 == index && (
                                  <div
                                    ref={popRef}
                                    className="absolute right-3 top-0 shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-lg z-10 flex items-center justify-center"
                                  >
                                    <div className="p-1 text-nowrap whitespace-nowrap gap-0 flex-col flex justify-center bg-white shadow-lg rounded-lg w-fit">
                                      <div
                                        onClick={() => {
                                          window.scrollTo({ top: 0 });
                                          handleUpdate(data);
                                        }}
                                        className="text-xs font-semibold cursor-pointer p-2 px-3"
                                      >
                                        <p>Edit</p>
                                      </div>
                                      <hr />
                                      <DoctorDataDownload
                                        patientDetails={state}
                                        data={[data]}
                                        button={
                                          <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                            <div className="flex items-center  cursor-pointer">
                                              <p>Download</p>
                                            </div>
                                          </div>
                                        }
                                      />

                                      <hr />
                                      <div
                                        onClick={() => handleDelete(data._id)}
                                        className="text-xs font-semibold cursor-pointer p-2 px-3 text-red-600"
                                      >
                                        <p>Delete</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </RBACGuard>
                        )}
                      </tr>
                    ))
                  )}
                  {groupByDate(doctorPrescriptions).map((data, i) => {
                    return (
                      <>
                        <tr className="text-[#505050] border-b w-full  bg-[#F3F3F3]  text-xs font-medium">
                          <td colSpan={8} className="pr-5 pl-3 py-3 text-left align-top ">
                            <div className=" w-full items-center flex justify-between ">
                              <div className="flex px-3 flex-col w-full justify-start">
                                <p className="font-bold">{formatDate(data?.date)}</p>
                                <p className="text-gray-500">
                                  {data.date && convertBackendDateToTime(data.date)}
                                </p>
                              </div>
                              <div className="p-2 mr-10 w-full flex items-center">
                                <p>Previous Prescription</p>
                              </div>

                              <div
                                onClick={() => (i == all ? setAll(null) : setAll(i))}
                                className={`p-2 cursor-pointer w-fit rounded-[6px]  bg-[#E5E5E5] ${
                                  i == all ? "rotate-180" : ""
                                } transition duration-300 `}
                              >
                                <FaAngleDown />
                              </div>
                            </div>
                          </td>
                        </tr>
                        {i == all &&
                          data.data.map((dataa: IDoctorPrescrition, index: number) =>
                            dataa.medicinesInfo.map((med, i) => (
                              <tr
                                className="text-[#505050]  text-xs font-medium"
                                key={`${index}-${i}`}
                              >
                                {i === 0 && (
                                  <td
                                    rowSpan={dataa.medicinesInfo.length}
                                    className="pl-6 py-3 text-left  "
                                  >
                                    <div className="flex flex-col justify-start">
                                      <p className="font-bold">{formatDate(dataa?.noteDateTime)}</p>
                                      <p className="text-gray-500">
                                        {dataa?.noteDateTime &&
                                          convertBackendDateToTime(dataa?.noteDateTime)}
                                      </p>
                                    </div>
                                  </td>
                                )}

                                {i === 0 && (
                                  <td
                                    rowSpan={dataa.medicinesInfo.length}
                                    className="px-6 text-nowrap py-3 text-black text-sm"
                                  >
                                    {dataa?.doctorId?.firstName + " " + dataa?.doctorId?.lastName}
                                  </td>
                                )}

                                <td
                                  title={`${med?.medicine?.name || "--"} (${
                                    med.medicine.genericName
                                  })`}
                                  className="px-6 py-3 border-b text-black text-xs font-semibold"
                                >
                                  <div className="truncate w-32 text-wrap ">
                                    {med?.medicine?.name || "--"}({med?.medicine?.genericName})
                                  </div>
                                </td>

                                <td className="px-5 w-96  py-3 border-b text-black text-xs">
                                  <div className="flex items-center flex-wrap gap-2 my-2">
                                    {med?.usages?.map((d, i) => (
                                      <span
                                        key={i}
                                        className="bg-[#ECF3CA] mr-1 text-black text-nowrap px-1 py-[2px] rounded-[10px] border-[#C9D686] border"
                                      >
                                        <span className="text-xs font-bold">{d?.frequency}</span>,{" "}
                                        {d?.quantity} Tablet {d?.dosage} {d?.when}
                                      </span>
                                    ))}
                                  </div>
                                </td>

                                <td className="px-4  ml-2 py-3 border-b text-black text-xs text-nowrap whitespace-nowrap">
                                  <div className=" w-32 ml-2 text-wrap">
                                    {med?.customDuration
                                      ? med?.customDuration
                                          .split("|")
                                          .map((d) => moment(d).format("D MMMM"))
                                          .join(" to ")
                                      : med?.durationFrequency || "--"}
                                  </div>
                                </td>

                                <td
                                  title={med?.instructions || ""}
                                  className="px-6    py-3 border-b text-black text-xs"
                                >
                                  <div className="truncate w-64 ">{med?.instructions || "--"}</div>
                                </td>

                                <td className="px-6 py-3 border-b text-black text-xs text-nowrap whitespace-nowrap">
                                  {med?.prescribedWhen || "--"}
                                </td>

                                {i === 0 && (
                                  <RBACGuard
                                    resource={RESOURCES.DOCTOR_PRESCRIPTION}
                                    action="write"
                                  >
                                    <td
                                      rowSpan={dataa.medicinesInfo.length}
                                      className="pl-6 align-middle border-b py-3 relative pr-1"
                                    >
                                      <div
                                        onClick={() => {
                                          if (!patientData.loa.loa) {
                                            setState((prev) => ({
                                              ...prev,
                                              popId: state.popId == dataa._id ? null : dataa._id
                                            }));
                                          }
                                        }}
                                        className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-md hover:bg-[#D4E299] cursor-pointer"
                                      >
                                        <img src={kabab} alt="icon" className="w-full h-full" />
                                        {state.popId == dataa._id && (
                                          <div className="absolute right-3 top-0 shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-lg z-10 flex items-center justify-center">
                                            <div className="p-1 text-nowrap whitespace-nowrap gap-0 flex-col flex justify-center bg-white shadow-lg rounded-lg w-fit">
                                              <div
                                                onClick={() => {
                                                  handleUpdate(dataa);
                                                  window.scrollTo({ top: 0 });
                                                }}
                                                className="text-xs font-semibold cursor-pointer p-2 px-3"
                                              >
                                                <p>Edit</p>
                                              </div>
                                              <hr />
                                              <DoctorDataDownload
                                                patientDetails={state}
                                                data={[dataa]}
                                                button={
                                                  <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                                    <div className="flex items-center  cursor-pointer">
                                                      <p>Download</p>
                                                    </div>
                                                  </div>
                                                }
                                              />

                                              <hr />
                                              <div
                                                onClick={() => handleDelete(dataa._id)}
                                                className="text-xs font-semibold cursor-pointer p-2 px-3 text-red-600"
                                              >
                                                <p>Delete</p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </RBACGuard>
                                )}
                              </tr>
                            ))
                          )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex  justify-center items-center bg-white py-[33px] font-semibold text-xs h-full">
              <EmptyRecord />
            </div>
          )}
        </div>
      </div>

      <DeleteConfirm
        isModalOpen={isModalOpen}
        confirmDeleteNote={confirmDeleteNote}
        toggleModal={toggleModal}
      />

      <div className="container">
        <Pagination totalPages={state.totalPages} />
      </div>
    </div>
  );
};

export default DoctorPrescription;
