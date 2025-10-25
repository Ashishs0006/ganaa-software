import {
  SyntheticEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo
} from "react";
import toast from "react-hot-toast";
import { Link, useBlocker, useNavigate, useParams } from "react-router-dom";

import { FaCheck } from "react-icons/fa";
import eye from "@/assets/images/eye.svg";
import {
  deleteDischarge,
  getDischarge,
  getPatientFamily,
  getSinglePatient,
  getSinglePatientAdmissionHistory,
  updateDischarge,
  updateDischargeStatus
} from "@/apis";
import {
  BreadCrumb,
  Button,
  DeleteConfirm,
  DiscardModal,
  Input,
  Loader,
  RichTextEditor,
  Select
} from "@/components";
import kabab from "@/assets/images/kebab-menu.svg";

import PrescriptionModal from "@/pages/Admin/PatientData/Discharge/PrescriptionModal";

import { IprescriptionBackend, IprescriptionState } from "@/pages/Admin/PatientData/Doctor/types";

import {
  capitalizeFirstLetter,
  convertBackendDateToTime,
  formatDate,
  formateNormalDate,
  formatId
} from "@/utils/formater";
import handleError from "@/utils/handleError";
import compareObjects from "@/utils/compareObjects";
import CancelDischarge from "./CancelDischarge";
import { IFamilyData } from "@/components/ProfileContacts/types";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { setDiscardModal } from "@/redux/slice/stepperSlice";
import LineChart from "@/components/LineChart/LineChart";
import { PatientDetails, IUsage } from "./types";
import { BsFiletypePdf } from "react-icons/bs";
import DischargeSummaryPdf from "./DischargePdf";
import { RESOURCES } from "@/constants/resources";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { IoIosRefresh } from "react-icons/io";

type GroupedBy<T> = Record<string, T[]>;

function groupBy<T>(array: T[], keySelector: (_item: T) => string): GroupedBy<T> {
  return array.reduce((acc, item) => {
    const key = keySelector(item) || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as GroupedBy<T>);
}

const colors = [
  "rgba(75, 192, 192, 1)",
  "rgba(255, 99, 132, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(54, 162, 235, 1)",
  "rgba(153, 102, 255, 1)"
];

const Discharge = () => {
  const dispatch = useDispatch();

  const { id, aId } = useParams();
  const navigate = useNavigate();

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

  // Utility to format date labels

  // Format label

  const chartLabels = useMemo(() => {
    return patientDetails.therapistNotes.map((el) => formatDate(el.noteDateTime));
  }, [patientDetails.therapistNotes]);

  const chartData = useMemo(() => {
    const grouped = groupBy(patientDetails.therapistNotes, (el) => el.subSessionType);

    return Object.entries(grouped).map(([key, items], index) => ({
      label: key,
      data: items.map((item) => item.score),
      borderColor: colors[index % colors.length],
      backgroundColor: colors[index % colors.length],
      tension: 0.3
    }));
  }, [patientDetails.therapistNotes]);

  const popUpRef = useRef<HTMLDivElement | null>(null);
  const stepperData = useSelector((store: RootState) => store.stepper);

  const [familyDetails, setFamilyDetails] = useState<IFamilyData[]>([]);

  const [state, setState] = useState<{
    loading: boolean;
    open: boolean;
    open1: boolean;
    modal: boolean;
    popId: null | string | number;
  }>({
    loading: false,
    modal: false,
    open: false,
    open1: false,
    popId: null
  });

  const [updateValue, setUpdateValue] = useState<IprescriptionState | null>(null);
  const [updateIndex, setUpdateIndex] = useState<number | null>(null);

  const [data, setData] = useState({
    chiefComplaints: "",
    historyOfPresentIllness: "",
    physicalExaminationAtAdmission: "",
    mentalStatusExamination: "",
    hospitalisationSummary: "",
    investigation: "",
    prescriptionMedicine: [],
    referBackTo: "",
    conditionAtTheTimeOfDischarge: { label: "Select", value: "" },
    adviseAndPlan: ""
  });

  const [prescriptionDateTime, setPrescriptionDateTime] = useState<string>();

  const [data1, setData1] = useState({
    chiefComplaints: "",
    historyOfPresentIllness: "",
    physicalExaminationAtAdmission: "",
    mentalStatusExamination: "",
    hospitalisationSummary: "",
    investigation: "",
    prescriptionMedicine: [],
    referBackTo: "",
    conditionAtTheTimeOfDischarge: { label: "", value: "" },
    adviseAndPlan: ""
  });

  const [deleteModal, setDeleteModal] = useState<{ isModal: boolean; id?: number }>({
    isModal: false
  });

  const toggleModalDelete = (id?: number) => {
    setDeleteModal((prev) => ({
      isModal: !prev.isModal,
      id: id
    }));
  };

  const [IsLocked, setIsLocked] = useState(false);
  const [prescriptionArray, setPrescriptionArray] = useState<IprescriptionState[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = async () => {
    setIsLocked(true);
    setLoading(true);
    if (id && aId) {
      try {
        const familyDetailsResponse = await getPatientFamily(id);

        setFamilyDetails(familyDetailsResponse.data.data);

        const { data: patientData } = await getSinglePatient(id);
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
          dischargeDate: "",
          dischargeStatus: ""
        }));

        const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);

        if (patientAdmissionHistory?.data?._id && patientData?.data?._id) {
          const { data: dischargeData } = await getDischarge(
            patientData.data?._id,
            patientAdmissionHistory.data?._id
          );
          setPatientDetails((prevData) => ({
            ...prevData,
            shouldSendfeedbackNotification: dischargeData?.data?.shouldSendfeedbackNotification,
            patientId: patientData?.data?._id,
            patientAdmissionHistoryId: patientAdmissionHistory?.data?._id,
            dischargeDate: dischargeData?.data?.date
              ? moment(dischargeData?.data?.date).format("YYYY-MM-DD")
              : "",
            dischargeStatus: dischargeData?.data?.status,
            admissionType: patientAdmissionHistory?.data?.admissionType,
            involuntaryAdmissionType: patientAdmissionHistory?.data?.involuntaryAdmissionType,
            doctor: `${
              patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.firstName || ""
            } ${
              patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.lastName || ""
            }`.trim(),
            therapist: `${
              patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.firstName ||
              ""
            } ${
              patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.lastName || ""
            }`.trim(),
            admissionDate: patientAdmissionHistory?.data?.dateOfAdmission,
            feedbackId: patientAdmissionHistory?.data?.feedbackId?.status,
            nominatedRepresntative: patientAdmissionHistory?.data?.nominatedFullName,
            therapistNotes: dischargeData?.data?.therapistNotes,
            currentStatus: patientAdmissionHistory?.data?.currentStatus
          }));

          const prescriptionMedicine =
            dischargeData?.data?.prescriptionMedicine?.length > 0
              ? dischargeData?.data?.prescriptionMedicine?.map(
                  (prescription: IprescriptionBackend) => ({
                    medicine: {
                      value: prescription?.medicine?._id || "",
                      label: prescription?.medicine?.name || ""
                    },
                    durationFrequency: {
                      value: prescription?.durationFrequency || "",
                      label: prescription?.durationFrequency || ""
                    },
                    customDuration: prescription?.customDuration || "", // Ensures empty string if not present
                    prescribedWhen: {
                      label: prescription?.prescribedWhen || "",
                      value: prescription?.prescribedWhen || ""
                    },
                    instructions: prescription?.instructions || "",
                    usages: prescription?.usages?.map((usage: IUsage) => ({
                      frequency: usage?.frequency || "",
                      quantity: usage?.quantity || 1,
                      when: { value: usage?.when || "", label: usage?.when || "" },
                      dosage: { value: usage?.dosage || "", label: usage?.dosage || "" }
                    }))
                  })
                )
              : []; // Return an empty array if no data

          setPrescriptionArray(prescriptionMedicine);
          setData((prevData) => ({
            ...prevData,
            chiefComplaints: dischargeData?.data?.chiefComplaints || "",
            historyOfPresentIllness: dischargeData?.data?.historyOfPresentIllness || "",
            physicalExaminationAtAdmission:
              dischargeData?.data?.physicalExaminationAtAdmission || "",
            mentalStatusExamination: dischargeData?.data?.mentalStatusExamination || "",
            hospitalisationSummary: dischargeData?.data?.hospitalisationSummary || "",
            investigation: dischargeData?.data?.investigation || "",
            referBackTo: dischargeData?.data?.referBackTo || "",
            conditionAtTheTimeOfDischarge: {
              label: dischargeData?.data?.conditionAtTheTimeOfDischarge || "",
              value: dischargeData?.data?.conditionAtTheTimeOfDischarge || ""
            },
            adviseAndPlan: dischargeData?.data?.adviseAndPlan || ""
          }));
          setPrescriptionDateTime(dischargeData?.data?.prescriptionDateTime || "");
          const prescriptionMedicineUpdate =
            dischargeData?.data?.prescriptionMedicine?.length > 0
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dischargeData?.data?.prescriptionMedicine?.map((prescription: any) => ({
                  medicine: prescription?.medicine?._id || "",
                  durationFrequency: prescription?.durationFrequency || "",

                  customDuration: prescription?.customDuration || "", // Ensures empty string if not present
                  prescribedWhen: prescription?.prescribedWhen || "",

                  instructions: prescription?.instructions || "",
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  usages: prescription.usages.map((usage: any) => ({
                    frequency: usage?.frequency || "",
                    quantity: usage?.quantity || 1,
                    when: usage?.when || "",
                    dosage: usage?.dosage || ""
                  }))
                }))
              : [];
          setData1((prevData) => ({
            ...prevData,
            chiefComplaints: dischargeData?.data?.chiefComplaints || "",
            historyOfPresentIllness: dischargeData?.data?.historyOfPresentIllness || "",
            physicalExaminationAtAdmission:
              dischargeData?.data?.physicalExaminationAtAdmission || "",
            mentalStatusExamination: dischargeData?.data?.mentalStatusExamination || "",
            hospitalisationSummary: dischargeData?.data?.hospitalisationSummary || "",
            investigation: dischargeData?.data?.investigation || "",
            referBackTo: dischargeData?.data?.referBackTo || "",
            conditionAtTheTimeOfDischarge: {
              label: dischargeData?.data?.conditionAtTheTimeOfDischarge || "",
              value: dischargeData?.data?.conditionAtTheTimeOfDischarge || ""
            },
            adviseAndPlan: dischargeData?.data?.adviseAndPlan || "",
            prescriptionMedicine: prescriptionMedicineUpdate
          }));
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);

        console.log(error);
        handleError(error);
      } finally {
        // Unlock after 30 seconds
        setTimeout(() => {
          setIsLocked(false);
        }, 30000); // 30,000 ms = 30 seconds
      }
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, aId]);

  const updateDataData = () => {
    const formatPrescription =
      prescriptionArray.length > 0
        ? prescriptionArray.map((prescription: IprescriptionState) => ({
            medicine: prescription.medicine.value,
            durationFrequency: prescription.durationFrequency.value,
            customDuration: prescription.customDuration || "", // Ensures empty string if not present
            prescribedWhen: prescription.prescribedWhen.value,
            instructions: prescription.instructions,
            usages: prescription.usages.map((usage: IUsage) => ({
              frequency: usage.frequency,
              quantity: usage.quantity,
              when: usage.when.value,
              dosage: usage.dosage.value
            }))
          }))
        : [];
    const updateData = compareObjects(data1, data, true);
    const payload = {
      ...updateData,
      prescriptionDateTime: prescriptionDateTime,
      conditionAtTheTimeOfDischarge: data.conditionAtTheTimeOfDischarge.value,
      prescriptionMedicine: formatPrescription
    };

    if (Object.keys(payload).length === 0) return;
    return updateDischarge(
      patientDetails.patientId,
      patientDetails.patientAdmissionHistoryId,
      payload
    );
  };

  const handleSave = async (_e?: SyntheticEvent, type?: string) => {
    dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));

    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await updateDataData();

      if (response && response?.status === 200) {
        fetchData();
      }
      toast.success(" Discharge Initiate successfully");
      if (type && type === "SAVE_AND_NEXT_DISCARD") {
        const discardLocation = stepperData.discardModal.discartLocation;
        dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));
        setTimeout(() => {
          if (stepperData.discardModal.type === "navigate") {
            if (discardLocation) {
              navigate(discardLocation);
            } else {
              navigate(-1);
            }
          }
        }, 500);
      }
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      handleError(error);
    }
  };

  const handleSubmit = async (_e?: SyntheticEvent, type?: string) => {
    dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));
    setState((prev) => ({ ...prev, loading: true }));

    try {
      if (patientDetails.feedbackId === "Created") {
        throw Error("Please fill the feedback form before submitting discharge.");
      }
      if (id && aId) {
        const response = await updateDischargeStatus(id, aId, {});
        if (response && response?.status === 200) {
          navigate("/admin/patients/all-patient");
        }
      }
      toast.success(" Patient Discharged successfully");
      setState((prev) => ({ ...prev, loading: false }));
      if (type && type === "SAVE_AND_NEXT_DISCARD") {
        const discardLocation = stepperData.discardModal.discartLocation;
        dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));
        setTimeout(() => {
          if (stepperData.discardModal.type === "navigate") {
            if (discardLocation) {
              navigate(discardLocation);
            } else {
              navigate(-1);
            }
          }
        }, 500);
      }
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));
      handleError(error);
    }
  };

  const handleDelete = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      if (id && aId) {
        const response = await deleteDischarge(id, aId);
        if (response && response?.status === 200) {
          navigate(-1);
          // fetchData();
        }
      }
      toast.success(" Patient Discharge Cancel successfully");
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false }));

      handleError(error);
    }
  };

  const handleChange = useCallback((event: React.SyntheticEvent) => {
    const { name, value } = event.target as HTMLInputElement;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  }, []);

  const handleChangeQuill = useCallback((name: string, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  }, []);

  const toggleModal = () => {
    setState((prev) => ({ ...prev, modal: !state.modal }));
  };

  const handleDeletePrescriptionToBeSaved = () => {
    if (deleteModal?.id === undefined) return;
    setPrescriptionArray((prev) => prev.filter((_, index) => index !== deleteModal.id));
    setDeleteModal({ isModal: false });
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleUpdate = (value: IprescriptionState, index: number) => {
    setUpdateValue(value);
    setUpdateIndex(index);
    setState((prev) => ({ ...prev, modal: !state.modal }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handlePopup = (index: number) => {
    setState((prev) => ({
      ...prev,
      popId: index === state.popId ? null : index
    }));
  };

  const toggleOpen = () => {
    setState((prev) => ({ ...prev, open: !prev.open }));
  };

  const toggleOpen1 = () => {
    setState((prev) => ({ ...prev, open1: !prev.open1 }));
  };

  useEffect(() => {
    const checkStateBeforeUnload = (e: BeforeUnloadEvent) => {
      if (stepperData.discardModal.isFormChanged) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", checkStateBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", checkStateBeforeUnload);
    };
  }, [dispatch, stepperData.discardModal.isFormChanged]);

  useBlocker(({ nextLocation }) => {
    if (stepperData.discardModal.isFormChanged) {
      dispatch(
        setDiscardModal({ isDiscardModalOpen: true, discartLocation: nextLocation.pathname })
      );
      return true;
    }

    return false;
  });

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (popUpRef.current && !popUpRef.current.contains(event.target as Node)) {
      setState((prev) => ({ ...prev, popId: null }));
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  return (
    <div id="discharge" className="">
      <div className=" container py-5 lg:px-8 sm:px-2 flex flex-col gap-5">
        <div className="flex   justify-between md:flex-row flex-col md:items-center">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-start">
              <BreadCrumb
                discharge={patientDetails.currentStatus == "Discharged"}
                name={`${capitalizeFirstLetter(
                  patientDetails?.firstName.length > 15
                    ? patientDetails?.firstName.slice(0, 15) + "..."
                    : patientDetails?.firstName
                )} ${
                  patientDetails?.lastName
                    ? capitalizeFirstLetter(
                        patientDetails?.lastName.length > 15
                          ? patientDetails?.lastName.slice(0, 15) + "..."
                          : patientDetails?.lastName
                      )
                    : ""
                }`}
                id={id}
                aId={aId}
              />
              <div className=" text-[18px] font-bold">Discharge</div>
            </div>
          </div>

          <DischargeSummaryPdf
            patientDetails={patientDetails}
            data={data}
            prescriptionArray={prescriptionArray}
            NRName={capitalizeFirstLetter(
              familyDetails.find((data) => data.infoType?.includes("Nominated Representative"))
                ?.name || "--"
            )}
            button={
              <Button
                type="submit"
                variant="outlined"
                size="base"
                // onClick={() => setShowDownloadPdf(true)}
                className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
              >
                <BsFiletypePdf className="mr-2" size={18} />
                Download
              </Button>
            }
          />
        </div>

        <div className="w-full h-full border border-[#EAE9E7] rounded-2xl flex flex-col gap-8">
          <div className="w-full h-fit bg-[#F4F2F0] rounded-t-2xl px-5 py-6 ">
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
                    {patientDetails.admissionDate && formatDate(patientDetails.admissionDate)} @
                    {patientDetails.admissionDate &&
                      convertBackendDateToTime(patientDetails.admissionDate)}
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
                          patientDetails?.involuntaryAdmissionType
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
          <div className="w-full px-5 pb-10 flex flex-col gap-8">
            <RichTextEditor
              value={data.chiefComplaints}
              onChange={handleChangeQuill}
              name="chiefComplaints"
              label="Chief complaints"
            />
            <RichTextEditor
              name="historyOfPresentIllness"
              value={data.historyOfPresentIllness}
              onChange={handleChangeQuill}
              label="History of presenting illness"
            />
            <RichTextEditor
              name="physicalExaminationAtAdmission"
              value={data.physicalExaminationAtAdmission}
              onChange={handleChangeQuill}
              label="Physical Examination at admission"
            />
            <RichTextEditor
              name="mentalStatusExamination"
              value={data.mentalStatusExamination}
              onChange={handleChangeQuill}
              label="Mental Status Examination"
            />
            <div className="flex flex-col bg-[#F4F2F0] h-[446px] md:flex-row md:space-x-8 p-10 items-center">
              <div className="flex-1 w-1/2">
                <div className="mb-4 flex flex-col space-x-2">
                  <h2 className="text-sm mb-2 leading-5 font-semibold">Assessment Scores</h2>
                  <div className=" flex gap-8 space-x-4">
                    {Object.entries(
                      groupBy(patientDetails.therapistNotes, (el) => el.subSessionType)
                    ).map(([key, _items], index) => (
                      <div key={key} className="flex gap-1 items-center space-x-1">
                        <div
                          className="h-3 w-3 rounded-sm"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="legend-label font-semibold text-xs">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative h-[280px] w-full ">
                  <LineChart labels={chartLabels} datasets={chartData} />
                </div>
                <div className="mt-2 flex max-w-[600px] justify-between text-xs font-semibold">
                  <span> At the time of admission </span>
                  <span> At the time of Discharge </span>
                </div>
              </div>
              <div className="mt-6 w-1/2 flex-1 md:mt-0  ">
                <RichTextEditor
                  className="bg-white!"
                  height="h-44"
                  name="hospitalisationSummary"
                  value={data.hospitalisationSummary}
                  onChange={handleChangeQuill}
                  label="Hospitalisation Summary"
                />
              </div>
            </div>

            <div className="grid gap-[88px]">
              <RichTextEditor
                // height="24"
                // showToolBar={false}
                value={data.investigation}
                name="investigation"
                onChange={handleChangeQuill}
                label="Investigation"
              />
            </div>
            {/* table */}
            <div>
              <label className="mb-2 block font-semibold text-xs text-black">
                Prescrption at Discharge
              </label>
              {prescriptionArray.length > 0 && (
                <div className="w-full">
                  <table className="sm:w-[1000px] lg:w-full rounded-lg text-sm text-left">
                    <thead className="bg-[rgb(233,232,229)] w-full h-full top-0 sticky z-10">
                      <tr className="text-[#505050] text-xs font-medium">
                        <th className="px-4 py-3 font-medium text-[#505050] text-xs ">Date</th>
                        <th className="px-4 py-3 font-medium text-[#505050] text-xs ">Medicine</th>
                        <th className="px-4 py-3 font-medium text-[#505050] text-xs ">
                          Frequency/Routine
                        </th>
                        <th className="px-4 py-3 font-medium text-[#505050] text-xs">Duration</th>
                        <th className="px-4 py-3 font-medium text-[#505050] text-xs w-1/4">
                          Instructions
                        </th>
                        <RBACGuard resource={RESOURCES.DISCHARGE} action="write">
                          <th className="pl-4 py-3 text-black text-xs ">{""}</th>
                        </RBACGuard>
                      </tr>
                    </thead>

                    <tbody className="bg-white w-full h-full">
                      {prescriptionArray.map((data: IprescriptionState, index: number) => (
                        <tr key={index} className="text-[#505050] text-xs border-b font-medium">
                          {index === 0 && (
                            <td
                              rowSpan={prescriptionArray.length}
                              className="pl-4 p-3 align-center text-black text-xs font-semibold text-nowrap"
                            >
                              <p>
                                {" "}
                                {prescriptionDateTime && formateNormalDate(prescriptionDateTime)}
                              </p>
                              <p className="text-gray-500 ">
                                {prescriptionDateTime &&
                                  convertBackendDateToTime(prescriptionDateTime)}
                              </p>
                            </td>
                          )}

                          {/* Medicine Column */}
                          <td className=" align-center border text-black text-xs font-semibold text-nowrap">
                            <div className="w-full h-10 flex justify-start items-center p-5">
                              <p>{data?.medicine?.label || "--"}</p>
                            </div>
                          </td>

                          {/* Frequency/Routine Column */}
                          <td className=" align-center border text-black  px-5 text-xs">
                            {data.usages.map((usage: IUsage, key: number) => (
                              <div key={key} className="flex my-1 items-center flex-wrap gap-2">
                                <span className="bg-[#ECF3CA] mr-1 text-black text-nowrap px-1 py-[2px] rounded-[10px] border-[#C9D686] border">
                                  <span className="text-xs font-bold">{usage.frequency}</span>,{" "}
                                  {usage.quantity} Tablet {usage.dosage.label} {usage.when.label}
                                </span>
                              </div>
                            ))}
                          </td>

                          {/* Duration Column */}
                          <td className=" border align-center text-black  px-5 text-xs text-nowrap">
                            <p>
                              {data?.customDuration && data?.durationFrequency.value === "Custom Date"
                                ? data?.customDuration
                                    ?.split("|")
                                    .map((d) => moment(d).format("D MMMM"))
                                    .join(" to ")
                                : data?.durationFrequency?.label || "--"}
                            </p>
                          </td>

                          {/* Instructions Column */}
                          <td className=" align-center px-5 text-black text-xs">
                            <p className="break-all whitespace-normal" title={data.instructions}>
                              {data.instructions || "--"}
                            </p>
                          </td>

                          {/* Actions Column */}
                          <RBACGuard resource={RESOURCES.DISCHARGE} action="write">
                            <td className="w-fit  align-center pl-5 relative">
                              <div
                                onClick={() => handlePopup(index)}
                                className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-md hover:bg-[#D4E299] cursor-pointer"
                              >
                                <img src={kabab} alt="icon" className="w-full h-full" />
                                {index === state.popId && (
                                  <div
                                    ref={popUpRef}
                                    className="absolute right-3 top-0 overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-lg z-10 flex items-center justify-center"
                                  >
                                    <div className="p-1 text-nowrap whitespace-nowrap gap-0 flex-col flex justify-center bg-white shadow-lg rounded-lg w-fit">
                                      <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                        <div
                                          onClick={() => handleUpdate(data, index)}
                                          className="flex items-center cursor-pointer"
                                        >
                                          <p>Edit</p>
                                        </div>
                                      </div>
                                      <hr />
                                      <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                        <div
                                          onClick={() => toggleModalDelete(index)}
                                          className="flex text-red-600 items-center cursor-pointer"
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
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <RBACGuard resource={RESOURCES.DISCHARGE} action="write">
                <div
                  onClick={toggleModal}
                  className="w-full flex items-center cursor-pointer justify-center py-1 rounded-[6px] bg-[#E5EBCD]"
                >
                  <p className="text-[#575F4A] text-[13px] font-semibold"> Add 1 more</p>
                </div>
              </RBACGuard>
            </div>
            {/* table */}
            <div className="grid grid-cols-2 gap-[88px]">
              <Input
                // disabled={}
                label="Referred back to"
                labelClassName="text-black!"
                className="rounded-lg! font-bold placeholder:font-normal"
                placeholder="Enter"
                value={data.referBackTo}
                onChange={handleChange}
                name="referBackTo"
              />
              <Select
                label="Condition at the time of discharge"
                containerClass="w-full! "
                value={data.conditionAtTheTimeOfDischarge}
                labelClassName="text-black! font-medium! g"
                name="conditionAtTheTimeOfDischarge"
                options={[
                  { label: "Select", value: "" },
                  { label: "Improved", value: "Improved" },
                  { label: "Partially Improved", value: "Partially Improved" },
                  { label: "Status Quo", value: "Status Quo" }
                ]}
                onChange={(name, value) => {
                  setData((prev) => ({ ...prev, [name]: value }));
                }}
                className="w-full! rounded-[7px]! max-w-full! border border-gray-300 px-3 py-6!"
              />
            </div>
            <RichTextEditor
              name="adviseAndPlan"
              value={data.adviseAndPlan}
              onChange={handleChangeQuill}
              label="Advise and Plan on Discharge"
            />
            <div className="w-full flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold mb-2">Feedback form status</p>
                {patientDetails.feedbackId === "Completed" ? (
                  <div className="flex gap-2 items-center justify-center">
                    <Button
                      type="submit"
                      className=" text-xs! cursor-default! min-w-[90px]! hover:bg-auto  text-white! bg-[#3F9536] border-none   rounded-[10px]!"
                      name="next"
                      variant="outlined"
                      size="base"
                    >
                      <FaCheck />
                      Complete
                    </Button>
                    {
                      <Link to={`/feedback/${id}/${aId}`}>
                        <Button
                          type="submit"
                          className=" text-xs! hover:bg-auto  text-white! bg-[#F1F2ED] border-none  rounded-[10px]!"
                          name="next"
                          variant="outlined"
                          size="base"
                        >
                          <img src={eye} />
                        </Button>
                      </Link>
                    }
                  </div>
                ) : (
                  <div className="flex gap-2 items-center justify-center">
                    <Button
                      type="submit"
                      className=" text-xs! cursor-default! min-w-[90px]! hover:bg-auto  text-[#B74F00]! bg-[#FFEDD5] border-none   rounded-[10px]!"
                      name="next"
                      variant="outlined"
                      size="base"
                    >
                      Pending
                    </Button>

                    {
                      <Link to={`/feedback/${id}/${aId}`} target="_blank">
                        <Button
                          type="submit"
                          className=" text-xs! hover:bg-auto  text-white! bg-[#F1F2ED] border-none  rounded-[10px]!"
                          name="next"
                          variant="outlined"
                          size="base"
                        >
                          <img src={eye} />
                        </Button>
                      </Link>
                    }
                    {!loading ? (
                      IsLocked ? (
                        <Button
                          type="submit"
                          title="Please wait 30 seconds. Feedback form is in progress."
                          className=" text-sm! cursor-not-allowed!  hover:bg-auto text-[#848d5e]  bg-[#F1F2ED] border-none   rounded-[10px]!"
                          name="next"
                          variant="outlined"
                          size="base"
                        >
                          <IoIosRefresh className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          className=" text-sm! cursor-pointer!  hover:bg-auto text-[#848d5e]  bg-[#ecfab1] border-none   rounded-[10px]!"
                          name="next"
                          variant="outlined"
                          size="base"
                          onClick={fetchData}
                        >
                          <IoIosRefresh className="w-4 h-4" />
                        </Button>
                      )
                    ) : null}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{patientDetails.doctor || "--"}</p>
                <p className="text-xs font-medium text-[#636363]">Psychiatrist</p>
              </div>
            </div>
          </div>
        </div>

        <RBACGuard resource={RESOURCES.DISCHARGE} action="write">
          <div className="flex w-full gap-6 justify-center items-center">
            {patientDetails.currentStatus !== "Discharged" && (
              <Button
                type="submit"
                disabled={state.loading}
                className=" text-xs! min-w-[130px]! text-red-600! border-[#D8D8D8]!  py-[11px]! rounded-[10px]!"
                name="next"
                variant="outlined"
                size="base"
                onClick={toggleOpen}
              >
                Cancel Discharge
              </Button>
            )}
            <Button
              type="submit"
              disabled={state.loading}
              className=" text-xs! min-w-[130px]! py-[11px]! rounded-[10px]!"
              name="next"
              variant="outlined"
              size="base"
              onClick={handleSave}
            >
              Save
              {state.loading && <Loader size="xs" />}
            </Button>
            {patientDetails.currentStatus !== "Discharged" && (
              <Button
                type="submit"
                disabled={state.loading}
                className="min-w-[130px]! text-xs!  py-[11px]! bg-[#323E2A]! rounded-[10px]!"
                name="next"
                variant="contained"
                size="base"
                onClick={toggleOpen1}
              >
                Submit
                {state.loading && <Loader size="xs" />}
              </Button>
            )}
          </div>
        </RBACGuard>
      </div>
      <PrescriptionModal
        setPrescriptionDateTime={setPrescriptionDateTime}
        modal={state.modal}
        prescriptionToBeSaved={prescriptionArray}
        toggleModal={toggleModal}
        setPrescriptionToBeSaved={setPrescriptionArray}
        setValue={setUpdateValue}
        setUpdateindex={setUpdateIndex}
        value={updateValue}
        Updateindex={updateIndex}
      />
      {
        <CancelDischarge
          open={state.open}
          type="delete"
          toggleOpen={toggleOpen}
          handleClickCancelDischarge={handleDelete}
        />
      }
      <CancelDischarge
        open={state.open1}
        type="submit"
        toggleOpen={toggleOpen1}
        handleClickCancelDischarge={handleSubmit}
      />

      <DiscardModal
        resource={RESOURCES.DISCHARGE}
        action="write"
        handleClickSaveAndContinue={(_e: SyntheticEvent) => handleSave(_e, "SAVE_AND_NEXT_DISCARD")}
      />

      <DeleteConfirm
        toggleModal={toggleModalDelete}
        isModalOpen={deleteModal.isModal}
        confirmDeleteNote={handleDeletePrescriptionToBeSaved}
      />
    </div>
  );
};

export default Discharge;
