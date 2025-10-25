import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { FaCheck } from "react-icons/fa";
import moment from "moment";

import { RootState } from "@/redux/store/store";
import {
  resetPatientAdmission,
  resetPatientDetails,
  setPatientDetails,
  setVital
} from "@/redux/slice/patientSlice";
import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";

import {
  createNurseNotes,
  updateNurseNotes,
  updateMedicalSummary,
  getAllAllergy,
  updateSinglePatinetAdmissionHistory
} from "@/apis";

import {
  AppDropZone,
  Button,
  DeleteConfirm,
  DiscardModal,
  Input,
  Loader,
  Modal,
  RichTextEditor,
  Select
} from "@/components";

import { IData, MedicalSummaryState } from "@/components/MedicalSummary/types";

import file from "@/assets/images/fileIcon.svg";

import compareObjects from "@/utils/compareObjects";
import handleError from "@/utils/handleError";
import { capitalizeFirstLetter, formatDate, formatId } from "@/utils/formater";
import { INurseNoteState } from "@/pages/Admin/PatientData/NurseNotes/types";
import { ISelectOption } from "../Select/types";
import MutliSelectCheck from "../MutliSelectCheck/MutliSelectCheck";
import toast from "react-hot-toast";
import CheckBox, { ViewInjury } from "../CheckBox/CheckBox";
import { calculateBMI } from "@/utils/calculateBMI";
import { MdDelete } from "react-icons/md";

const MedicalSummary = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const patientData = useSelector((store: RootState) => store.patient);
  const stepperData = useSelector((store: RootState) => store.stepper);

  const [searchParam, setSearchParam] = useSearchParams();

  const [state, setState] = useState<MedicalSummaryState>({
    loading: false,
    isModalOpen: false,
    diagnosis: { label: "Select", value: "" }
  });

  const [data, setData] = useState<IData>({
    injuryDetails: [
      {
        injuryName: "",
        files: []
      }
    ],
    allergyArray: [],
    allergiesFiles: [],
    allergiesFilesLink: [],
    diabeticStatus: "",
    hyperTension: "",
    heartDisease: "",
    heartDiseaseDescription: "",
    levelOfRisk: "",
    levelOfRiskDescription: "",
    previousTreatmentRecord: [],
    previousTreatmentRecordLink: []
  });

  const [MedicalRemove, setMedicalRemove] = useState({
    previousTreatmentRecord: [],
    allergiesFiles: []
  });

  const [vitals, setVitals] = useState<INurseNoteState>({
    id: "",
    patientId: "",
    patientAdmissionHistoryId: "",
    bp: "",
    bp1: "",
    bp2: "",
    pulse: "",
    temperature: "",
    spo2: "",
    weight: "",
    rbs: "",
    height: "",
    note: patientData?.vitals?.note || "",
    vitalsDate: moment().format("YYYY-MM-DD"),
    vitalsTime: moment().format("HH:mm")
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleOneMoreInjury = () => {
    if (data?.injuryDetails?.length >= 10) {
      toast.error("You can only add up to 10 injuries.");
      return;
    }
    const allInjuriesValid = data.injuryDetails.every(
      (injury) => injury.injuryName !== "" && injury.files.length > 0
    );

    if (allInjuriesValid) {
      setData((prev) => ({
        ...prev,
        injuryDetails: [...prev.injuryDetails, { injuryName: "", files: [] }]
      }));
    } else {
      toast.error("Injury Name and file are required ");
    }
  };

 const handleChangeForVitals = useCallback((e: React.SyntheticEvent) => {
  if (!stepperData.discardModal.isFormChanged) {
    dispatch(setDiscardModal({ isFormChanged: true }));
  }

  const { name, value } = e.target as HTMLInputElement;

  function isNumeric(val: string) {
    return val === "" || /^-?\d*\.?\d*$/.test(val); // allow negative + decimal
  }

  const numberFieldsName = [
    "pulse",
    "temperature",
    "weight",
    "spo2",
    "rbs",
    "bp1",
    "bp2",
    "height",
  ];

  if (numberFieldsName.includes(name)) {
    if (isNumeric(value)) {
      // Special case: Fahrenheit validation for temperature
      if (name === "temperature") {
        // Max length check (e.g., 6 chars: -459.6, 9999.9 etc.)
        if (value.length > 6) return;

        // Absolute zero validation
        if (value !== "" && parseFloat(value) < -459.67) return;
      }

      setVitals((prev) => ({ ...prev, [name]: value }));
    }
  } else {
    setVitals((prev) => ({ ...prev, [name]: value }));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const handleChangeQuill = useCallback((name: string, value: string) => {
    setVitals((prev) => ({ ...prev, [name]: value }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatMedicineOption = (medicine: { _id: string; name: string }) => ({
    label: medicine.name,
    value: medicine._id
  });

  const fetchallergy = async (query: string) => {
    const response = await getAllAllergy({
      limit: 300,
      page: 1,
      sort: "name",
      term: query,
      searchField: "name"
    });
    return response?.data?.data?.map(formatMedicineOption);
  };

  useEffect(() => {
    if (patientData.patientAdmission._id) {
      setVitals((prev) => ({ ...prev, ...patientData.vitals }));
      setState((prev) => ({
        ...prev,
        diagnosis: patientData?.patientDetails?.diagnosis || { label: "", value: "" }
      }));
      setData((prev) => ({
        ...prev,
        injuryDetails: patientData?.patientDetails?.injuryDetails || [
          {
            injuryName: "",
            files: []
          }
        ],
        allergyArray: patientData?.patientDetails.allergyArray || [],
        allergiesFilesLink: patientData?.patientDetails.allergiesFilesLink || [],
        diabeticStatus: patientData?.patientDetails.diabeticStatus || "",
        hyperTension: patientData?.patientDetails.hyperTension || "",
        heartDisease: patientData?.patientDetails.heartDisease || "",
        heartDiseaseDescription: patientData?.patientDetails.heartDiseaseDescription || "",
        levelOfRisk: patientData?.patientDetails.levelOfRisk || "",
        levelOfRiskDescription: patientData?.patientDetails.levelOfRiskDescription || "",
        previousTreatmentRecordLink: patientData?.patientDetails.previousTreatmentRecordLink || []
      }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleModal = () => setState((prev) => ({ ...prev, isModalOpen: !state.isModalOpen }));

  const handleChange = useCallback((e: SyntheticEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    if (name == "heartDisease" && value == "No") {
      setData((prev) => ({ ...prev, [name]: value }));
      setData((prev) => ({ ...prev, heartDiseaseDescription: "" }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }

    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVitals = () => {
    if ((vitals.bp1.trim() && !vitals.bp2.trim()) || (!vitals.bp1.trim() && vitals.bp2.trim())) {
      throw new Error("bp not valid");
    }
    if (vitals.id) {
      if (vitals.bp1.trim() && vitals.bp2.trim()) {
        vitals.bp = `${vitals.bp1.trim()}/${vitals.bp2.trim()}`;
      }
      const updatedState = compareObjects(patientData.vitals, vitals, true);
      const payload: { [key: string]: unknown } = {};
      if (updatedState.bp1 !== undefined || updatedState.bp2 !== undefined) {
        payload.bp = `${vitals.bp1.trim()}/${vitals.bp2.trim()}`;
      }
      if (updatedState.pulse !== undefined) payload.pulse = updatedState.pulse;
      if (updatedState.temperature !== undefined) payload.temperature = updatedState.temperature;
      if (updatedState.spo2 !== undefined) payload.spo2 = updatedState.spo2;
      if (updatedState.rbs !== undefined) payload.rbs = updatedState.rbs;
      if (updatedState.height !== undefined) payload.height = updatedState.height;
      if (updatedState.weight !== undefined) payload.weight = updatedState.weight;
      if (updatedState.note !== undefined) payload.note = updatedState.note;
      if (!Object.entries(payload).length) {
        return;
      }
      if (
        (updatedState.height && Number(updatedState.height) < 50) ||
        Number(updatedState.height) > 272
      ) {
        throw new Error("Height Should Between 50cm to 272cm");
      }
      return updateNurseNotes(vitals.id, payload);
    } else {
      const combinedDateTime = `${vitals.vitalsDate} ${vitals.vitalsTime}`;
      const formattedDateTime = new Date(combinedDateTime).toISOString();
      if (Object.keys(vitals).length === 0) {
        return;
      }

      const body = {
        ...vitals,
        patientId: patientData.patientDetails._id,
        patientAdmissionHistoryId: patientData.patientAdmission._id,
        noteDateTime: formattedDateTime
      };
      if (vitals.bp1.trim() && vitals.bp2.trim()) {
        body.bp = `${vitals.bp1.trim()}/${vitals.bp2.trim()}`;
      }
      if ((body.height && Number(body.height) < 50) || Number(body.height) > 272) {
        throw new Error("Height Should Between 50cm to 272cm");
      }

      if (
        !body.bp.trim() &&
        !body.pulse.trim() &&
        !body.temperature.trim() &&
        !body.spo2.trim() &&
        !body.weight.trim() &&
        !body.rbs.trim() &&
        !body.height.trim()
      ) {
        return;
      }

      return createNurseNotes(body);
    }
  };

  const updatePateintData = (pid: string, aid: string) => {
    if (state.diagnosis.value == patientData?.patientDetails?.diagnosis?.value) return;

    if (state.diagnosis.value) {
      const body = {
        illnessType: state.diagnosis.value
      };
      return updateSinglePatinetAdmissionHistory(body, pid, aid);
    }
  };

  const handleSubmit = async (
    _e: SyntheticEvent,
    btnType: "SAVE" | "SAVE_AND_NEXT" | "SAVE_AND_NEXT_DISCARD"
  ) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const response = await handleVitals();
      if (response && response.data.status === "success") {
        if (response?.data?.data?._id) {
          setVitals((prev) => ({ ...prev, id: response.data.data._id }));
        }
        dispatch(setVital({ ...vitals }));
      }
      const medicalResponse = await createMedicalSummary();
      if (medicalResponse && medicalResponse.data.status === "success") {
        setData((prev) => ({
          ...prev,
          injuryDetails:
            medicalResponse?.data?.data?.patientReport?.injuriesDetails.length > 0
              ? medicalResponse?.data?.data?.patientReport?.injuriesDetails?.map(
                  (data: {
                    injuryName: string;
                    fileUrls: { filePath: string; fileUrl: string; fileName?: string }[];
                  }) => ({
                    injuryName: data?.injuryName || "",
                    files: data?.fileUrls || []
                  })
                )
              : [{ injuryName: "", files: [] }],
          previousTreatmentRecordLink:
            medicalResponse?.data?.data?.patientReport?.previousTreatmentRecord || [],
          allergiesFilesLink: medicalResponse?.data?.data?.patientReport?.allergiesFiles || [],
          allergiesFiles: [],
          previousTreatmentRecord: []
        }));

        const {
          diabeticStatus,
          allergyArray,
          heartDisease,
          heartDiseaseDescription,
          levelOfRiskDescription,
          levelOfRisk,
          hyperTension
        } = data;

        dispatch(
          setPatientDetails({
            ...patientData.patientDetails,

            injuryDetails:
              medicalResponse?.data?.data?.patientReport?.injuriesDetails?.length > 0
                ? medicalResponse?.data?.data?.patientReport?.injuriesDetails?.map(
                    (data: {
                      injuryName: string;
                      fileUrls: { filePath: string; fileUrl: string; fileName?: string }[];
                    }) => ({
                      injuryName: data.injuryName || "",
                      files: data?.fileUrls || []
                    })
                  )
                : [{ injuryName: "", files: [] }],
            allergiesFilesLink: medicalResponse?.data?.data?.patientReport?.allergiesFiles || [],
            allergyArray,
            diabeticStatus,
            hyperTension,
            heartDisease,
            heartDiseaseDescription,
            levelOfRisk,
            levelOfRiskDescription,
            previousTreatmentRecordLink:
              medicalResponse?.data?.data?.patientReport?.previousTreatmentRecord || []
          })
        );
      }

      const removeData = await removemedicalSummaryImage();
      if (removeData && removeData.data.status === "success") {
        setData((prev) => ({
          ...prev,
          injuryDetails:
            medicalResponse?.data?.data?.patientReport?.injuriesDetails?.length > 0
              ? medicalResponse?.data?.data?.patientReport?.injuriesDetails?.map(
                  (data: {
                    injuryName: string;
                    fileUrls: { filePath: string; fileUrl: string; fileName?: string }[];
                  }) => ({
                    injuryName: data.injuryName || "",
                    files: data.fileUrls || []
                  })
                )
              : [{ injuryName: "", files: [] }],
          previousTreatmentRecordLink:
            medicalResponse?.data?.data?.patientReport?.previousTreatmentRecord || [],
          allergiesFilesLink: medicalResponse?.data?.data?.patientReport?.allergiesFiles || [],
          allergiesFiles: [],
          previousTreatmentRecord: []
        }));
        setMedicalRemove({
          allergiesFiles: [],
          previousTreatmentRecord: []
        });
        const {
          diabeticStatus,
          allergyArray,
          heartDisease,
          heartDiseaseDescription,
          levelOfRiskDescription,
          levelOfRisk,
          hyperTension
        } = data;

        dispatch(
          setPatientDetails({
            ...patientData.patientDetails,
            injuryDetails:
              medicalResponse?.data?.data?.patientReport?.injuriesDetails?.length > 0
                ? medicalResponse?.data?.data?.patientReport?.injuriesDetails?.map(
                    (data: {
                      injuryName: string;
                      fileUrls: { filePath: string; fileUrl: string; fileName?: string }[];
                    }) => ({
                      injuryName: data.injuryName || "",
                      files: data.fileUrls || []
                    })
                  )
                : [{ injuryName: "", files: [] }],
            allergiesFilesLink: removeData?.data?.data?.patientReport?.allergiesFiles || [],
            allergyArray,
            diabeticStatus,
            hyperTension,
            heartDisease,
            heartDiseaseDescription,
            levelOfRisk,
            levelOfRiskDescription,
            previousTreatmentRecordLink:
              removeData?.data?.data?.patientReport?.previousTreatmentRecord || []
          })
        );
      }
      if (patientData.patientDetails._id && patientData.patientAdmission._id) {
        const patientdianosis = await updatePateintData(
          patientData.patientDetails._id,
          patientData.patientAdmission._id
        );
        if (
          patientdianosis &&
          "data" in patientdianosis &&
          patientdianosis.data?.status === "success"
        ) {
          dispatch(
            setPatientDetails({
              ...patientData.patientDetails,
              diagnosis: state.diagnosis
            })
          );
        }
      }

      dispatch(setDiscardModal({ isDiscardModalOpen: false }));

      if (btnType === "SAVE_AND_NEXT") {
        toast.success("Medical Summary saved successfully");
        toggleModal();
      } else if (btnType === "SAVE_AND_NEXT_DISCARD") {
        const discardLocation = stepperData.discardModal.discartLocation;
        dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));

        setTimeout(() => {
          if (stepperData.discardModal.type === "step") {
            dispatch(
              setStepper({ step: stepperData.discardModal.step, tab: stepperData.stepper.tab })
            );
          }

          if (stepperData.discardModal.type === "tab") {
            dispatch(
              setStepper({ step: stepperData.stepper.step, tab: stepperData.discardModal.tab })
            );
          }

          if (stepperData.discardModal.type === "navigate") {
            if (discardLocation) {
              // dispatch(setStepper({ step: 1, tab: 1 }));
              navigate(discardLocation);
            } else {
              // dispatch(setStepper({ step: 1, tab: 1 }));
              navigate(-1);
            }
          }
        }, 500);
        toast.success("Medical Summary saved successfully");
      } else {
        toast.success("Medical Summary saved successfully");
      }

      setState((prev) => ({ ...prev, loading: false }));
      dispatch(setDiscardModal({ isFormChanged: false }));
    } catch (err) {
      handleError(err);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteInjuryId, setDeleteInjuryId] = useState<number | undefined>();

  const toggleModalDelete = (index?: number) => {
    if (index) {
      setDeleteInjuryId(index);
    }
    setDeleteModal(!deleteModal);
  };

  const confirmDeleteInjury = async () => {
    if (!deleteInjuryId) return;
    setData((prevData) => ({
      ...prevData,
      injuryDetails: prevData.injuryDetails.filter((_, index) => index !== deleteInjuryId)
    }));
    setDeleteModal(false);
  };

  const handleHomePage = (_e: SyntheticEvent) => {
    toggleModal();
    dispatch(resetPatientAdmission());
    dispatch(resetPatientDetails());
    dispatch(setStepper({ step: 1, tab: 1 }));
    dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));

    setTimeout(() => {
      navigate("/admin");
    }, 300);
  };

  const handleDropFilesInjuryFiles = useCallback(
    (files: File[], index: number) => {
      if (!stepperData.discardModal.isFormChanged)
        dispatch(setDiscardModal({ isFormChanged: true }));

      const maxSize = 5 * 1024 * 1024; // 5 MB limit

      try {
        if (files.some((file) => file.size > maxSize)) {
          throw new Error("One or more files exceed the 5 MB size limit.");
        }
      } catch (error) {
        handleError(error);
        return;
      }

      // If all file sizes are under the limit, update the state
      setData((prevDetails) => {
        return {
          ...prevDetails,
          injuryDetails: prevDetails.injuryDetails.map((detail, idx) =>
            idx === index
              ? { ...detail, files: [...(detail.files || []), ...files] } // Ensure old files persist
              : detail
          )
        };
      });
    },
    [setData]
  );

  const handleDropCheck = useCallback((files: File[], name: string) => {
    if (!stepperData.discardModal.isFormChanged) {
      dispatch(setDiscardModal({ isFormChanged: true }));
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 4;

    try {
      // Filter out files that exceed the max size
      const validFiles = files.filter((file) => file.size <= maxSize);

      if (validFiles.length !== files.length) {
        toast.error("Some files exceed the 5 MB limit.");
        return; // Stop execution to avoid setting state
      }

      setData((prev) => {
        const existingFiles = prev[name as keyof typeof data] || [];
        const totalFiles = [...(Array.isArray(existingFiles) ? existingFiles : []), ...validFiles];

        if (totalFiles.length > maxFiles) {
          toast.error("You can only upload up to 4 files.");
          return prev; // Return previous state to prevent updates
        }

        return {
          ...prev,
          [name]: totalFiles
        };
      });
    } catch (error) {
      handleError(error);
    }
  }, []);

  const handleDelete = (index: number, type: string, name: string) => {
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    if (type === "URL") {
      setMedicalRemove((prev) => ({
        ...prev,
        [name]: [
          ...(prev[name as keyof typeof prev] || []), // Keep existing removed items
          ...(Array.isArray(data[`${name}Link` as keyof IData])
            ? (data[`${name}Link` as keyof IData] as unknown[]).filter(
                (_, i: number) => i === index
              )
            : []
          ).map((item) => (item as { filePath: string }).filePath)
        ]
      }));

      setData((prev) => ({
        ...prev,
        [`${name}Link`]: Array.isArray(prev[`${name}Link` as keyof typeof prev])
          ? Array.isArray(prev[`${name}Link` as keyof typeof prev])
            ? (prev[`${name}Link` as keyof typeof prev] as unknown[]).filter((_, i) => i !== index)
            : []
          : []
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [name]: Array.isArray(prev[name as keyof typeof prev])
          ? Array.isArray(prev[name as keyof typeof prev])
            ? (prev[name as keyof typeof prev] as unknown[]).filter((_, i) => i !== index)
            : []
          : []
      }));
    }
  };
  const [injuryDataRemove, setInjuryDataRemove] = useState<
    { injuryName: string; fileUrls: string[] }[]
  >([]);

  const handleDeleteForInjury = (index: number, mainIndex: number) => {
    if (!stepperData.discardModal.isFormChanged) {
      dispatch(setDiscardModal({ isFormChanged: true }));
    }

    setData((prev) => {
      const updatedInjuryDetails = prev.injuryDetails.map((detail, idx) => {
        if (idx !== mainIndex) return detail; // Keep other items unchanged

        const removedFile = detail.files[index];

        if (!(removedFile instanceof File)) {
          setInjuryDataRemove((prevRemove) => {
            const updatedRemove = [...prevRemove];
            const existingEntry = updatedRemove.find(
              (entry) => entry.injuryName === detail.injuryName
            );

            if (existingEntry) {
              if (!existingEntry.fileUrls.includes(removedFile.filePath)) {
                existingEntry.fileUrls.push(removedFile.filePath);
              }
            } else {
              updatedRemove.push({
                injuryName: detail.injuryName,
                fileUrls: [removedFile.filePath]
              });
            }

            return updatedRemove;
          });
        }

        return {
          ...detail,
          files: detail.files.filter((_, fidx) => fidx !== index)
        };
      });

      return {
        ...prev,
        injuryDetails: updatedInjuryDetails
      };
    });
  };

  const handleSelect = (key: string, value: ISelectOption) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };
  const createMedicalSummary = async () => {
    const formData = new FormData();
    const body = { ...data };

    // Prepare injuries array
    const injuries: string[] = [];
    if (body?.injuryDetails[0]?.injuryName.trim()) {
      body.injuryDetails.forEach((detail, index) => {
        if (detail.injuryName.trim()) {
          const injuryIndex = index + 1;
          injuries.push(`${detail.injuryName}_${injuryIndex}`);
          detail.files.forEach((file) => {
            if (!(file instanceof File)) {
              // Handle the case where file is a string, if needed
            } else {
              formData.append(`injuryFile_${injuryIndex}`, file);
            }
          });
        }
      });
    } else {
      body.injuryDetails = [];
    }
    body.allergiesFiles.forEach((file) => {
      formData.append(`allergiesFiles`, file);
    });
    body.allergyArray.forEach((data: ISelectOption) => {
      formData.append(`allergiesNames`, data?.value?.toString());
    });
    body.previousTreatmentRecord.forEach((file) => {
      formData.append(`previousTreatmentRecord`, file);
    });

    formData.append("injuries", JSON.stringify(injuries));
    // formData.append("allergiesNames", body.allergyArray.map((item) => item.value).join(","));
    // formData.append("allergiesNames", body.allergyArray.map((item) => item.value).join(","));
    formData.append("diabeticStatus", body.diabeticStatus);
    formData.append("hyperTension", body.hyperTension);
    formData.append("heartDisease", body.heartDisease);
    formData.append("heartDiseaseDescription", body.heartDiseaseDescription);
    formData.append("levelOfRisk", body.levelOfRisk);
    formData.append("levelOfRiskDescription", body.levelOfRiskDescription);
    formData.append("type", "Update");

    if (patientData.patientDetails._id && patientData.patientAdmission._id) {
      const response = await updateMedicalSummary(
        formData,
        patientData.patientDetails._id,
        patientData.patientAdmission._id
      );
      return response;
    }
  };

  const removemedicalSummaryImage = async () => {
    const body = { ...MedicalRemove, type: "Remove", injuryDetails: injuryDataRemove };
    if (patientData.patientDetails._id && patientData.patientAdmission._id) {
      const response = await updateMedicalSummary(
        body,
        patientData.patientDetails._id,
        patientData.patientAdmission._id
      );
      return response;
    }
  };

  return (
    <div id="MedicalSummary" className="w-full h-full mt-8">
      <p className="font-bold text-[15px] mb-4">Patient Details</p>
      <div className="pt-4  pb-[31px] px-6 h-full flex items-start justify-between lg:gap-60 rounded-xl w-full bg-[#F7F8F5]">
        <div className="flex h-full items-start gap-5">
          <div
            className={`flex rounded-full  border-2 ${
              patientData.patientDetails.gender == "Male"
                ? "border-[#00685F]"
                : patientData.patientDetails.gender == "Female"
                ? "border-[#F14E9A]"
                : "border-gray-500"
            }   overflow-hidden w-14 h-14 items-center justify-center`}
          >
            {patientData.patientDetails?.patientPic ? (
              <div className="flex rounded-full w-full  h-full bg-white border border-[white]  overflow-hidden  items-center justify-center">
                <img
                  src={patientData.patientDetails?.patientPic}
                  alt="profile"
                  className="w-full h-full rounded-full"
                />
              </div>
            ) : (
              <div className="flex rounded-full p-1 w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                <div className="w-full uppercase text-[13px] font-bold text-center">
                  {patientData.patientDetails?.firstName?.slice(0, 1)}
                  {patientData.patientDetails?.lastName?.slice(0, 1)}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-start gap-2">
            <p className="text-[10px] font-normal text-[#444444]">Personal Details</p>
            <p className="text-xs font-bold">
              {patientData?.patientDetails?.firstName &&
                capitalizeFirstLetter(
                  patientData?.patientDetails?.firstName?.length > 15
                    ? patientData?.patientDetails?.firstName?.slice(0, 15) + "..."
                    : patientData?.patientDetails?.firstName
                )}{" "}
              {patientData?.patientDetails?.lastName &&
                capitalizeFirstLetter(
                  patientData?.patientDetails?.lastName.length > 15
                    ? patientData?.patientDetails?.lastName.slice(0, 15) + "..."
                    : patientData?.patientDetails?.lastName
                )}
            </p>
            <div className="flex gap-2 items-center">
              <p className="text-xs font-medium">
                Age:
                <span className="text-xs font-semibold ml-1">
                  {patientData?.patientDetails?.age}
                </span>
              </p>

              <p className="text-xs font-semibold">|</p>
              <p className="text-xs font-medium">
                Gender:
                <span className="text-xs ml-[3px] font-semibold">
                  {patientData?.patientDetails?.gender}
                </span>
              </p>
            </div>
            <p className="text-xs font-medium">
              Mobile No:
              <span className="ml-[3px] text-xs font-semibold">
                {patientData?.patientDetails?.phoneNumberCountryCode?.label}{" "}
                {patientData?.patientDetails?.phoneNumber}
              </span>
            </p>
          </div>
        </div>
        <div className="flex h-full border-l-2 border-[##F4F2F0] pl-6 items-start gap-5">
          <div className="flex flex-col items-start gap-2">
            <p className="text-[10px] font-normal text-[#444444]">Assigned Resource</p>
            <p className="text-xs font-medium">
              Center:{" "}
              <span className="text-xs ml-[3px] font-semibold">
                {patientData.patientAdmission.centerId?.label}
              </span>
            </p>
            <p className="text-xs font-medium">
              Room:
              <span className="text-xs ml-[3px] font-semibold">
                {" "}
                {patientData.patientAdmission?.roomTypeId?.label},{" "}
                {patientData.patientAdmission?.roomNumberId?.label} No
              </span>
            </p>
            <p className="text-xs font-medium">
              Locker No. :
              <span className="text-xs ml-[3px] font-semibold">
                {patientData.patientAdmission?.lockerNumberId?.label}
              </span>
            </p>
          </div>
        </div>
        <div className="min-h-full">
          <div className="flex justify-between gap-14 items-end flex-col min-h-full">
            <p className="text-xs text-[#474747] font-medium">
              UHID:
              <span className="ml-[3px] font-semibold">
                {formatId(patientData?.patientDetails?.uhid)}
              </span>
            </p>
            <p
              onClick={() => {
                searchParam.set("resource", "3");
                setSearchParam(searchParam);

                navigate({
                  pathname: `/admin/patients/all-patient/${patientData?.patientDetails._id}/profile/${patientData?.patientAdmission?._id}`,
                  search: `?${searchParam.toString()}`
                });
              }}
              // to={`/admin/patients/all-patient/${patientData?.patientDetails._id}/profile/${patientData?.patientAdmission?._id}`}

              className="underline font-semibold text-[#575F4A] text-xs"
            >
              View All Details
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="w-full  h-full grid grid-cols-2 gap-10 mt-10 items-start justify-start">
          <div className="border-r-2 text-nowrap whitespace-nowrap border-[##F4F2F0] pr-10">
            <h3 className="text-sm font-bold mb-6">Patient Assessment</h3>
            <div>
              <p className="text-sm font-medium mb-2.5">Injury Details</p>
              {data?.injuryDetails.map((value, index) => (
                <div className="flex gap-2 items-center my-2">
                  <Input
                    id="injuryDetails"
                    type="text"
                    required={true}
                    maxLength={200}
                    placeholder="Enter"
                    name="injuryDetails"
                    className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                    value={value.injuryName}
                    onChange={(e) => {
                      if (!stepperData.discardModal.isFormChanged) {
                        dispatch(setDiscardModal({ isFormChanged: true }));
                      }

                      // Create a new array with updated value
                      const updatedData = [...data.injuryDetails]; // Clone the array
                      updatedData[index] = { ...updatedData[index], injuryName: e.target.value }; // Clone the object before modifying

                      setData({ ...data, injuryDetails: updatedData });
                    }}
                  />
                  <div className="px-3 py-1.5  w-fit flex gap-2 rounded-lg items-center  border-dashed border-[#A5A5A5] border-2 relative">
                    <div className=" w-[30px] h-[30px] flex items-center overflow-hidden justify-center">
                      <img src={file} alt="file" className="w-full h-full" />
                    </div>
                    <AppDropZone
                      onDrop={(files) => {
                        handleDropFilesInjuryFiles(files, index);
                      }}
                      accept="application/pdf"
                    >
                      <div>
                        <p className="font-semibold text-[13px]">
                          Drag & Drop or{" "}
                          <span className="underline cursor-pointer">Browse Files</span>
                        </p>
                        <p className="font-medium text-xs">Format: PDF, Max size: 5MB</p>
                      </div>
                    </AppDropZone>
                  </div>
                  <div className={`${value.files.length > 0 ? "visible" : "invisible"}`}>
                    <ViewInjury
                      files={value.files}
                      mainIndex={index}
                      handleDelete={handleDeleteForInjury}
                    />
                  </div>

                  <div
                    className={`text-red-700 cursor-pointer ${
                      index !== 0 ? "visible" : "invisible"
                    } `}
                    onClick={() => toggleModalDelete(index)}
                  >
                    <MdDelete size={20} />
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => {
                handleOneMoreInjury();
              }}
              variant="outlined"
              type="submit"
              className="rounded-xl! w-full! mt-2.5 text-xs! bg-[#ECF3CA] font-semibold py-[7px]! px-[15px]! text-black border-0!"
            >
              Add 1 more
            </Button>

            <div className="flex gap-5 mt-10  w-full items-start flex-col">
              <p className="block  ml-0.5 text-sm font-medium">Diabetes Status</p>
              <div className="flex">
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="Diabetic"
                      type="radio"
                      value="Diabetic"
                      onChange={handleChange}
                      checked={data.diabeticStatus === "Diabetic"}
                      name="diabeticStatus"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="Diabetic"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                        data.diabeticStatus === "Diabetic"
                          ? "border-[#586B3A]!"
                          : "border-[#586B3A]"
                      }`}
                    >
                      {data.diabeticStatus === "Diabetic" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="Diabetic" className="ms-2 text-sm font-medium">
                    Diabetic
                  </label>
                </div>

                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="Non Diabetic"
                      type="radio"
                      value="Non Diabetic"
                      onChange={handleChange}
                      checked={data.diabeticStatus === "Non Diabetic"}
                      name="diabeticStatus"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="Non Diabetic"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                        data.diabeticStatus === "Non Diabetic"
                          ? "border-[#586B3A]!"
                          : "border-[#586B3A]"
                      }`}
                    >
                      {data.diabeticStatus === "Non Diabetic" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="Non Diabetic" className="ms-2 text-sm font-medium">
                    Non Diabetic
                  </label>
                </div>
              </div>
            </div>

            <div className="w-full grid grid-cols-2">
              <div className="flex gap-5 mt-10  w-full items-start flex-col">
                <p className="block  ml-0.5 text-sm font-medium">Hypertension</p>
                <div className="flex">
                  <div className="flex items-center me-4">
                    <div className="relative flex items-center">
                      <Input
                        id="Hypertension"
                        type="radio"
                        value="Yes"
                        onChange={handleChange}
                        checked={data.hyperTension === "Yes"}
                        name="hyperTension"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Hypertension"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                          data.hyperTension == "Yes" ? " border-[#586B3A]!" : "border-[#586B3A]"
                        }`}
                      >
                        {data.hyperTension == "Yes" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="Hypertension" className="ms-2 text-sm font-medium">
                      Yes
                    </label>
                  </div>

                  <div className="flex items-center me-4">
                    <div className="relative flex items-center">
                      <Input
                        id="Hypertensionno"
                        type="radio"
                        value="No"
                        onChange={handleChange}
                        checked={data.hyperTension === "No"}
                        name="hyperTension"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Hypertensionno"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                          data.hyperTension == "No" ? " border-[#586B3A]!" : "border-[#586B3A]"
                        }`}
                      >
                        {data.hyperTension == "No" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="Hypertensionno" className="ms-2 text-sm font-medium">
                      No
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-5 mt-10  border-l-2 pl-8 w-full items-start flex-col">
                <p className="block  ml-0.5 text-sm font-medium">Heart Disease</p>
                <div className="flex">
                  <div className="flex items-center me-4">
                    <div className="relative flex items-center">
                      <Input
                        id="HeartDisease"
                        type="radio"
                        value="Yes"
                        onChange={handleChange}
                        checked={data.heartDisease === "Yes"}
                        name="heartDisease"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="HeartDisease"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                          data.heartDisease == "Yes" ? " border-[#586B3A]!" : "border-[#586B3A]"
                        }`}
                      >
                        {data.heartDisease == "Yes" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="HeartDisease" className="ms-2 text-sm font-medium">
                      Yes
                    </label>
                  </div>

                  <div className="flex items-center me-4">
                    <div className="relative flex items-center">
                      <Input
                        id="HeartDiseaseno"
                        type="radio"
                        value="No"
                        onChange={handleChange}
                        checked={data.heartDisease === "No"}
                        name="heartDisease"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="HeartDiseaseno"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                          data.heartDisease == "No" ? " border-[#586B3A]!" : "border-[#586B3A]"
                        }`}
                      >
                        {data.heartDisease == "No" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="HeartDiseaseno" className="ms-2 text-sm font-medium">
                      No
                    </label>
                  </div>
                </div>

                {data.heartDisease === "Yes" && (
                  <Input
                    id="heartDiseaseDescription"
                    required={true}
                    maxLength={200}
                    placeholder="Enter"
                    name="heartDiseaseDescription"
                    labelClassName="text-black!"
                    className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                    value={data.heartDiseaseDescription}
                    onChange={handleChange}
                  />
                )}
              </div>
            </div>

            <div className="mt-10 text-nowrap whitespace-nowrap">
              <p className="text-sm font-medium mb-2.5 ">Select Allergies</p>
              <div className="flex items-start gap-2 justify-start">
                <MutliSelectCheck
                  apiCall={true}
                  name="allergyArray"
                  options={[{ label: "Select", value: "" }]}
                  fetchOptions={fetchallergy}
                  placeholder="Select"
                  onChange={(key: string, value: ISelectOption) => {
                    if (!stepperData.discardModal.isFormChanged)
                      dispatch(setDiscardModal({ isFormChanged: true }));

                    setData((prev) => {
                      const currentValues = Array.isArray(prev[key as keyof IData])
                        ? [...(prev[key as keyof IData] as ISelectOption[])]
                        : [];
                      const valueExists = currentValues.some((item) => item.value === value.value);
                      return {
                        ...prev,
                        [key]: valueExists
                          ? currentValues.filter((item) => item.value !== value.value)
                          : [...currentValues, value]
                      };
                    });
                    if (!stepperData.discardModal.isFormChanged)
                      dispatch(setDiscardModal({ isFormChanged: true }));
                  }}
                  value={data.allergyArray}
                />
                <CheckBox
                  view=""
                  ContainerClass="w-fit"
                  checkHide
                  handleDeletes={handleDelete}
                  checked={true}
                  filesString={data.allergiesFilesLink}
                  files={data.allergiesFiles}
                  name="allergiesFiles"
                  handleDrop={handleDropCheck}
                  handleCheck={function (_e: SyntheticEvent): void {
                    throw new Error("Function not implemented.");
                  }}
                />
              </div>
            </div>

            <div className=" flex gap-5 mt-10  w-full items-start flex-col">
              <p className="block  ml-0.5 text-sm font-medium">Level of Risk</p>
              <div className="flex">
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="LevelOfRiskHigh"
                      type="radio"
                      value="High"
                      onChange={handleChange}
                      checked={data.levelOfRisk === "High"}
                      name="levelOfRisk"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="LevelOfRiskHigh"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                        data.levelOfRisk === "High" ? " border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {data.levelOfRisk === "High" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="LevelOfRiskHigh" className="ms-2 text-sm font-medium">
                    High
                  </label>
                </div>

                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="LevelOfRiskMedium"
                      type="radio"
                      value="Medium"
                      onChange={handleChange}
                      checked={data.levelOfRisk === "Medium"}
                      name="levelOfRisk"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="LevelOfRiskMedium"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                        data.levelOfRisk === "Medium" ? " border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {data.levelOfRisk === "Medium" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="LevelOfRiskMedium" className="ms-2 text-sm font-medium">
                    Medium
                  </label>
                </div>

                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="LevelOfRiskLow"
                      type="radio"
                      value="Low"
                      onChange={handleChange}
                      checked={data.levelOfRisk === "Low"}
                      name="levelOfRisk"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="LevelOfRiskLow"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                        data.levelOfRisk === "Low" ? " border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {data.levelOfRisk === "Low" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="LevelOfRiskLow" className="ms-2 text-sm font-medium">
                    Low
                  </label>
                </div>
              </div>
              <div className="w-full">
                <Input
                  id=""
                  type="text"
                  required={true}
                  maxLength={200}
                  placeholder="Enter"
                  name="levelOfRiskDescription"
                  className="w-[490px] rounded-[7px]! font-bold placeholder:font-normal"
                  value={data.levelOfRiskDescription}
                  onChange={handleChange}
                />
              </div>
            </div>
            <h3 className="text-sm font-bold my-6">Diagnosis</h3>
            <div className="w-full">
              <Select
                label="Illness Type"
                containerClass="w-fit!"
                className=" w-[228px]! truncate gap-1 font-semibold"
                options={[
                  { label: "Select", value: "" },
                  { label: "Addiction", value: "Addiction" },
                  { label: "Mental Disorder", value: "Mental Disorder" },
                  { label: "Addiction & Mental Disorder", value: "Addiction & Mental Disorder" }
                ]}
                optionClassName="w-[228px]!"
                placeholder="Select"
                onChange={handleSelect}
                value={state.diagnosis}
                name="diagnosis"
              />
            </div>
          </div>

          <div className="">
            <h3 className="text-sm font-bold mb-6">Vitals</h3>
            <div className={` h-fit lg:grid-cols-6 sm:grid-cols-3 gap-4 items-start`}>
              <div className="col-span-3 grid grid-cols-3 gap-x-12 gap-y-10">
                <div>
                  <label htmlFor="bp" className="block mb-1.5 ml-0.5 text-sm font-medium">
                    B.P (mm Hg)
                  </label>
                  <div
                    id="bp"
                    className="flex items-center gap-0 justify-start h-fit
                              px-3 text-gray-900 rounded-lg  border-2  focus-within:border-black border-gray-400 w-full placeholder:text-gray-400"
                  >
                    <Input
                      type="text"
                      name="bp1"
                      containerClass="w-fit!"
                      maxLength={3}
                      placeholder="___"
                      className="rounded-lg! border-none w-[30px]! placeholder:text-lg border-gray-400 border p-0! py-3!"
                      value={vitals.bp1}
                      onChange={handleChangeForVitals}
                    />
                    /
                    <Input
                      type="text"
                      name="bp2"
                      maxLength={3}
                      containerClass="w-fit!"
                      placeholder="___"
                      className="rounded-lg border-none w-[30px]! placeholder:text-lg border-gray-400 border p-0! py-3!"
                      value={vitals.bp2}
                      onChange={handleChangeForVitals}
                    />
                  </div>
                </div>

                <Input
                  type="text"
                  label="Pulse (bpm)"
                  labelClassName="text-black!"
                  value={vitals.pulse}
                  name="pulse"
                  maxLength={vitals.pulse.includes(".") ? 5 : 3}
                  className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                  placeholder="Enter"
                  onChange={handleChangeForVitals}
                />
                <Input
                  type="text"
                  maxLength={6}
                  label="Temperature (°F)"
                  labelClassName="text-black!"
                  onChange={handleChangeForVitals}
                  name="temperature"
                  placeholder="Enter"
                  value={vitals.temperature}
                  className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                />
                <Input
                  type="text"
                  maxLength={vitals.spo2.includes(".") ? 5 : 3}
                  name="spo2"
                  labelClassName="text-black!"
                  label="SP02 (%)"
                  value={vitals.spo2}
                  onChange={handleChangeForVitals}
                  className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                  placeholder="Enter"
                />
                <Input
                  type="text"
                  name="weight"
                  maxLength={vitals.weight.includes(".") ? 5 : 4}
                  labelClassName="text-black!"
                  label="Weight (kg)"
                  value={vitals.weight}
                  onChange={handleChangeForVitals}
                  className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                  placeholder="Enter"
                />
                <Input
                  type="text"
                  name="rbs"
                  maxLength={vitals.rbs.includes(".") ? 5 : 3}
                  labelClassName="text-black!"
                  label="R.B.S (mg/dl)"
                  value={vitals.rbs}
                  onChange={handleChangeForVitals}
                  className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                  placeholder="Enter"
                />
                <Input
                  type="text"
                  name="height"
                  maxLength={vitals.height.includes(".") ? 6 : 4}
                  labelClassName="text-black!"
                  label="Height (cm)"
                  value={vitals.height}
                  onChange={handleChangeForVitals}
                  className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                  placeholder="Enter"
                />
                <Input
                  type="text"
                  labelClassName="text-black!"
                  label="BMI"
                  disabled
                  value={calculateBMI(vitals.weight, vitals.height)}
                  onChange={handleChangeForVitals}
                  className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                  placeholder="BMI"
                />
              </div>
              <div className=" sm:col-span-3 my-8 sm:col-start-1 lg:col-span-3  lg:col-start-4 ">
                <RichTextEditor
                  label="Notes"
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={vitals.note}
                  name="note"
                  onChange={handleChangeQuill}
                />
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-medium mb-4">
                Previous Treatment Record (Including Lab Test)
              </div>
              <CheckBox
                boxClass="ml-0!"
                ContainerClass="col-span-3"
                checkHide
                handleDeletes={handleDelete}
                checked={true}
                filesString={data.previousTreatmentRecordLink}
                files={data.previousTreatmentRecord}
                name="previousTreatmentRecord"
                handleDrop={handleDropCheck}
                label={""}
                handleCheck={function (_e: SyntheticEvent): void {
                  throw new Error("Function not implemented.");
                }}
              />
            </div>
          </div>
        </div>

        <div className="w-full flex gap-x-5 items-center mt-12 justify-center">
          <Button
            type="submit"
            name="next"
            disabled={state.loading}
            className="min-w-[150px]! text-xs! py-[10px]! rounded-[10px]!"
            variant="contained"
            size="base"
            onClick={(e) => handleSubmit(e, "SAVE_AND_NEXT")}
          >
            Submit {state.loading && <Loader size="xs" />}
          </Button>
        </div>
      </div>
      <Modal isOpen={state.isModalOpen} toggleModal={toggleModal}>
        <div className="w-[376px] px-6 py-5 flex items-center flex-col">
          <div className="rounded-full bg-[#22A16C] mb-[7px] w-9 h-9 flex items-center justify-center">
            <FaCheck className="text-white" />
          </div>
          <p className="text-[16px] font-bold mb-[5px]">Successfully saved</p>
          <p className="text-xs font-medium text-[#535353] mb-[21px]">
            UHID #{formatId(patientData?.patientDetails?.uhid)}
          </p>
          <hr className="w-full h-full mb-[13px]" />
          <div className="justify-center mb-8 w-full gap-[9px] flex-col flex items-start">
            <div className="flex justify-between w-full items-center">
              <p className="text-xs font-medium text-[#535353]">Name</p>
              <p className="text-xs font-semibold text-[#535353]">
                {patientData?.patientDetails?.firstName &&
                  capitalizeFirstLetter(
                    patientData?.patientDetails?.firstName?.length > 15
                      ? patientData?.patientDetails?.firstName?.slice(0, 15) + "..."
                      : patientData?.patientDetails?.firstName
                  )}{" "}
                {patientData?.patientDetails?.lastName &&
                  capitalizeFirstLetter(
                    patientData?.patientDetails?.lastName.length > 15
                      ? patientData?.patientDetails?.lastName.slice(0, 15) + "..."
                      : patientData?.patientDetails?.lastName
                  )}
                {/* {patientData.patientDetails?.firstName} {patientData.patientDetails?.lastName} */}
              </p>
            </div>

            <div className="flex justify-between w-full items-center">
              <p className="text-xs font-medium text-[#535353]">Admission Date</p>
              <p className="text-xs font-semibold text-[#535353]">
                {patientData.patientAdmission?.dateOfAdmission &&
                  formatDate(patientData.patientAdmission?.dateOfAdmission)}
              </p>
            </div>

            <div className="flex justify-between w-full items-center">
              <p className="text-xs font-medium text-[#535353]">Gender</p>
              <p className="text-xs font-semibold text-[#535353]">
                {patientData.patientDetails?.gender}
              </p>
            </div>

            <div className="flex justify-between w-full items-center">
              <p className="text-xs font-medium text-[#535353]">Room Type</p>
              <p className="text-xs font-semibold text-[#535353]">
                {patientData.patientAdmission?.roomTypeId?.label}
              </p>
            </div>
            <div className="flex justify-between w-full items-center">
              <p className="text-xs font-medium text-[#535353]">Room No.</p>
              <p className="text-xs font-semibold text-[#535353]">
                {patientData.patientAdmission?.roomNumberId?.label}
              </p>
            </div>

            <div className="flex justify-between w-full items-center">
              <p className="text-xs font-medium text-[#535353]">Locker No.</p>
              <p className="text-xs font-semibold text-[#535353]">
                {patientData.patientAdmission?.lockerNumberId?.label || "--"}
              </p>
            </div>

            <div className="flex justify-between w-full items-center">
              <p className="text-xs font-medium text-[#535353]">Mobile No.</p>
              <p className="text-xs font-semibold text-[#535353]">
                {patientData.patientDetails?.phoneNumberCountryCode?.label}{" "}
                {patientData.patientDetails?.phoneNumber}
              </p>
            </div>
          </div>

          <Button
            onClick={handleHomePage}
            className="w-full text-xs border border-[#BFBFBF] bg-[#F6F6F6] font-semibold py-[10px] rounded-[10px]!"
            variant="outlined"
            size="base"
          >
            Go To Homepage
          </Button>
        </div>
      </Modal>
      <DiscardModal
        handleClickSaveAndContinue={(_e: SyntheticEvent) =>
          handleSubmit(_e, "SAVE_AND_NEXT_DISCARD")
        }
      />
      <DeleteConfirm
        toggleModal={toggleModalDelete}
        isModalOpen={deleteModal}
        confirmDeleteNote={confirmDeleteInjury}
      />
    </div>
  );
};

export default MedicalSummary;
