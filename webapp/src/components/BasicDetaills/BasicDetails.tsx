import { SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { LuUserRound } from "react-icons/lu";

import { RootState } from "@/redux/store/store";
import { setPatientAdmission, setPatientDetails } from "@/redux/slice/patientSlice";
import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";

import {
  Button,
  Input,
  Loader,
  Select,
  DiscardModal,
  CropperImage,
  CustomCalendar,
  CustomTimePicker,
  Modal,
  CheckBox
} from "@/components";

import calender from "@/assets/images/calender.svg";
import clock from "@/assets/images/clock.svg";

import { BasicDetailsState } from "@/components/BasicDetaills/types";
import { ISelectOption } from "@/components/Select/types";
import {
  createSinglePatientResources,
  existPatient,
  getSinglePatient,
} from "@/apis";
import handleError from "@/utils/handleError";
import compareObjects from "@/utils/compareObjects";

import {
  createPateintAddmissionData,
  createPateintData,
  convertDate,
  isNumeric,
  calculateAge
} from "@/components/BasicDetaills/utils";

import moment from "moment";
import {
  BasicDetailsValidation,
  emergencyadmitValidation
} from "@/validations/Yup/BasicDetailValidation";
import { useAuth } from "@/providers/AuthProvider";

const isFile = (item: any): item is File => {
  return item instanceof File;
};

const BasicDetails = () => {
  const { auth } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existModal, setExistModal] = useState<boolean>(false);
  const [uhid, setUhid] = useState<string>();

  const [idProofFiles, setIdProofFiles] = useState<File[]>([]);
  const [patientIdProofUrls, setIdProofUrls] = useState<string[]>([]); // uploaded or fetched URLs
  const [idProofError, setIdProofError] = useState<string>("");

  const patientData = useSelector((store: RootState) => store.patient);
  console.log("patientData: ", patientData);
  const stepperData = useSelector((store: RootState) => store.stepper);
  const dropdownData = useSelector((store: RootState) => store.dropdown);

  const [state, setState] = useState<BasicDetailsState>({
    showModal: false,
    croppedImage: "",
    idProof: [],
    loading: false,
    firstName: "",
    lastName: "",
    dob: "",
    age: 0,
    email: "",
    phoneNumberCountryCode: { label: "+91", value: "+91" },
    phoneNumber: "",
    alternativephoneNumberCountryCode: { label: "+91", value: "+91" },
    alternativeMobileNumber: "",
    gender: "",
    identificationMark: "",
    country: {
      value: "India",
      label: "India"
    },
    fullAddress: "",
    area: "",
    patientPic: null,

    dateOfAdmission: moment().format("YYYY-MM-DD"),
    time:
      (patientData.patientAdmission._id && patientData?.patientAdmission?.time) ||
      moment().format("HH:mm"),

    referredTypeId: { label: "", value: "" },
    referralDetails: "",

    admissionType: "",
    involuntaryAdmissionType: { label: "", value: "" }
  });

  console.log("state: ", state);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (patientData.patientDetails._id) {
      setState((prev) => {
        return {
          ...prev,
          ...patientData.patientDetails
        };
      });
    }
    if (patientData.patientAdmission._id) {
      setState((prev) => {
        return {
          ...prev,
          ...patientData.patientAdmission
        };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // ...existing code...

  const handleDropIdProof = (files: File[]) => {
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (const file of files) {
      if (file.type !== "application/pdf") {
        setIdProofError("Only PDF files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setIdProofError("File size should be less than 5MB.");
        return;
      }
      validFiles.push(file);
    }

    setIdProofFiles((prev) => [...prev, ...validFiles]);
    setState((prev) => ({
      ...prev,
      idProof: [...(prev.idProof || []), ...validFiles]
    }));
    setIdProofError("");
    setIdProofUrls([]); // reset URLs if uploading new ones
  };

  const handleDeleteIdProof = (index: number) => {
    // Check if we're deleting a locally uploaded file or a stored URL
    const isDeletingLocalFile = index < idProofFiles.length;

    if (isDeletingLocalFile) {
      // Delete from local files
      setIdProofFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Delete from stored URLs (adjust index for URL array)
      const urlIndex = index - idProofFiles.length;
      setIdProofUrls((prev) => prev.filter((_, i) => i !== urlIndex));
    }

    // Update the state.idProof array
    setState((prev) => ({
      ...prev,
      idProof: Array.isArray(prev.idProof)
        ? prev.idProof.filter((_: any, i: number) => i !== index)
        : []
    }));
  };

useEffect(() => {
  const id = patientData.patientDetails._id;
  if (typeof id === "string" && id.trim() !== "") {
    (async () => {
      try {
        const response = await getSinglePatient(id);
        const patient = response.data.data;

        // Only update ID proof related data, not the entire form state
        if (patient.idProof || patient.patientIdProofUrls) {
          const idProofUrls = Array.isArray(patient.idProof)
            ? patient.idProof
            : Array.isArray(patient.patientIdProofUrls)
            ? patient.patientIdProofUrls
            : [];

          setIdProofUrls(idProofUrls);
          
          // Update only ID proof in the state without affecting other fields
          setState((prev) => ({
            ...prev,
            idProof: idProofUrls
          }));
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      }
    })();
  }
}, [patientData.patientDetails._id]);

  useEffect(() => {
    if (patientData.patientDetails.idProof) {
      setIdProofUrls(patientData.patientDetails.idProof);
    }
  }, [patientData.patientDetails.idProof]);

  const phonecode = useMemo<ISelectOption[]>(() => {
    if (dropdownData.country.loading) return [];

    const countryList = [{ label: "+91", value: "+91" }];
    dropdownData.country.data.forEach((country) => {
      countryList.push({ label: country.phoneCode, value: country.phoneCode });
    });

    return countryList;
  }, [dropdownData.country.data, dropdownData.country.loading]);

  const countryDropdown = useMemo<ISelectOption[]>(() => {
    if (dropdownData.country.loading) return [];

    const countryList = [{ label: "India", value: "India" }];
    dropdownData.country.data.forEach(({ name }) => {
      countryList.push({ label: `${name}`, value: name });
    });

    return countryList;
  }, [dropdownData.country.data, dropdownData.country.loading]);

  const handleChange = useCallback((e: React.SyntheticEvent) => {
    const numberFieldsName = ["phoneNumber", "alternativeMobileNumber"];
    const stringFieldsName = ["firstName", "lastName", "referralDetails"];
    const { name, type, value, files } = e.target as HTMLInputElement;
    if (type === "file") {
      const maxSize = 2 * 1024 * 1024;
      try {
        if (files && files?.[0].size > maxSize) {
          if (fileInputRef.current) fileInputRef.current.value = "";
          throw new Error("Image size exceeds 2 MB limit.");
        }
      } catch (error) {
        handleError(error);
      }
      if (files?.[0] && files?.[0].size < maxSize) {
        const reader = new FileReader();
        reader.readAsDataURL(files?.[0]);
        reader.onload = () => {
          if (reader.result) {
            setState((prev) => ({
              ...prev,
              croppedImage: reader.result as string,
              showModal: true
            }));
          }
        };
      }
    } else if (stringFieldsName.includes(name)) {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setState((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "age") {
      if (isNumeric(value)) {
        setState((prev) => ({
          ...prev,
          age: +value,
          dob: ""
        }));
      }
    } else if (numberFieldsName.includes(name)) {
      if (isNumeric(value)) {
        setState((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setState((prev) => ({ ...prev, [name]: value }));
    }

    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const addDefaultResource = async (pid: string, aid: string) => {
    if (!auth?.user?.centerId[0]?._id) {
      return;
    }

    return createSinglePatientResources(
      {
        centerId: auth?.user?.centerId[0]?._id
      },
      pid,
      aid
    );
  };

  const handleSelect = (key: string, value: ISelectOption) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleRemoveImg = (e: SyntheticEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setState((prev) => ({ ...prev, patientPic: "" }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const updatePateintData = (pid: string) => {
    const formData = new FormData();
    const states = compareObjects(
      patientData?.patientDetails,
      {
        ...state,
        patientPic: "",
        idProof: undefined
      },
      true
    );
    if (states.firstName !== undefined)
      formData.append(
        "firstName",
        states.firstName.charAt(0).toUpperCase() + states.firstName.slice(1)
      );
    if (states.lastName !== undefined)
      formData.append(
        "lastName",
        states.lastName.charAt(0).toUpperCase() + states.lastName.slice(1)
      );
    if (states.dob !== undefined) formData.append("dob", states.dob);
    if (states.age !== undefined) formData.append("age", states.age.toString());
    if (states.email !== undefined) formData.append("email", states.email);
    if (states.phoneNumberCountryCode?.value)
      formData.append("phoneNumberCountryCode", states.phoneNumberCountryCode.value.toString());
    if (states.phoneNumber !== undefined) formData.append("phoneNumber", states.phoneNumber);
    if (states.alternativephoneNumberCountryCode?.value !== undefined)
      formData.append(
        "alternativephoneNumberCountryCode",
        states.alternativephoneNumberCountryCode.value.toString()
      );
    if (states.alternativeMobileNumber !== undefined)
      formData.append("alternativeMobileNumber", states.alternativeMobileNumber);
    if (states.gender !== undefined) formData.append("gender", states.gender);
    if (states.identificationMark !== undefined)
      formData.append("identificationMark", states.identificationMark);

    if (states.country?.value !== undefined)
      formData.append("country", states.country.value.toString());
    if (states.fullAddress !== undefined) formData.append("fullAddress", states.fullAddress);
    if (states.area !== undefined) formData.append("area", states.area);

    if (states.referredTypeId?.value !== undefined)
      formData.append("referredTypeId", states.referredTypeId?.value.toString());
    if (states.referralDetails !== undefined)
      formData.append("referralDetails", states.referralDetails);

    if (state.patientPic && typeof state.patientPic !== "string")
      formData.append("patientPic", state.patientPic);

    if (typeof state.patientPic == "string" && state.patientPic.trim() === "")
      formData.append("patientPic", state.patientPic);

    if (Array.isArray(state.idProof)) {
      state.idProof
        .filter((file): file is File => file instanceof File)
        .forEach((file) => formData.append("idProof", file));
    }

    // if (typeof state.idProof === "string" && state.idProof.trim() !== "") {
    //   formData.append("idProof", state.idProof);
    // }

    if (![...formData.entries()].length) {
      console.log("No changes detected, skipping update.");
      return;
    }

    console.log("formData: ", formData);
    return updatePatient(formData, pid);
  };

  const updatePateintAddmissionData = (pid: string, aid: string) => {
    const updatedPatientData = compareObjects(patientData.patientAdmission, state, true);
    const payload: { [key: string]: unknown } = {};
    if (
      updatedPatientData.involuntaryAdmissionType?.value !== undefined &&
      updatedPatientData.admissionType !== undefined &&
      updatedPatientData.admissionType === "Involuntary"
    ) {
      payload.involuntaryAdmissionType = updatedPatientData.involuntaryAdmissionType.value;
    }
    if (updatedPatientData.admissionType !== undefined) {
      payload.admissionType = updatedPatientData.admissionType;
    }

    if (updatedPatientData.dateOfAdmission !== undefined || updatedPatientData.time !== undefined) {
      const formattedDateTime = new Date(`${state.dateOfAdmission} ${state.time}`).toISOString();
      payload.dateOfAdmission = formattedDateTime;
      // payload.dateOfAdmission = utcDate.toISOString();
    }

    if (!Object.entries(payload).length) {
      return;
    }

    return updateSinglePatinetAdmissionHistory(payload, pid, aid);
  };

  const handleSubmit = async (
    _e: SyntheticEvent,
    btnType: "SAVE" | "SAVE_AND_NEXT" | "SAVE_AND_NEXT_DISCARD"
  ) => {
    dispatch(setDiscardModal({ isDiscardModalOpen: false }));
    setState((prev) => ({ ...prev, loading: true }));

    try {
      await emergencyadmitValidation.validate(state, { abortEarly: false });
      if (btnType === "SAVE_AND_NEXT" || btnType === "SAVE_AND_NEXT_DISCARD") {
        await BasicDetailsValidation.validate(state, { abortEarly: false });
      }
      if (
        !patientData.patientDetails._id &&
        state.dob &&
        state.firstName &&
        state.lastName &&
        state.phoneNumber
      ) {
        const existResponse = await existPatient({
          lastName: state.lastName,
          firstName: state.firstName,
          dob: state.dob,
          phoneNumber: state.phoneNumber
        });
        if (existResponse?.data?.data?.isExist) {
          setExistModal(true);
          setUhid(existResponse?.data?.data?.patient[0]?.uhid);
          setState((prev) => ({ ...prev, loading: false }));
          dispatch(setDiscardModal({ isFormChanged: false }));
          return;
        }
      }

      setErrors({});
      if (patientData.patientDetails._id) {
        const patientResponse = await updatePateintData(patientData.patientDetails._id);
        console.log("patientResponse: ", patientResponse);

        if (patientResponse && patientResponse.data.status === "success") {
          const {
            firstName,
            lastName,
            dob,
            age,
            email,
            phoneNumberCountryCode,
            phoneNumber,
            alternativephoneNumberCountryCode,
            alternativeMobileNumber,
            gender,
            identificationMark,
            country,
            fullAddress,
            area,
            referredTypeId,
            referralDetails
          } = state;

          setState((prev) => ({
            ...prev,
            patientPic: patientResponse?.data?.data?.patientPicUrl
              ? patientResponse?.data?.data?.patientPicUrl
              : patientResponse?.data?.data?.patientPic,
            idProof: patientResponse?.data?.data?.patientIdProofUrls
              ? patientResponse?.data?.data?.patientIdProofUrls
              : patientResponse?.data?.data?.idProof
          }));

          dispatch(
            setPatientDetails({
              ...patientData.patientDetails,
              uhid: patientResponse?.data?.data?.uhid,
              patientFileName: patientResponse.data?.data?.patientPicFileName,
              patientIdProofName: patientResponse.data?.data?.patientIdProofName,
              patientPic: patientResponse?.data?.data?.patientPicUrl
                ? patientResponse?.data?.data?.patientPicUrl
                : patientResponse?.data?.data?.patientPic,
              idProof: patientResponse?.data?.data?.patientIdProofUrls
                ? patientResponse?.data?.data?.patientIdProofUrls
                : patientResponse?.data?.data?.idProof,
              firstName,
              lastName,
              dob,
              age,
              email,
              phoneNumberCountryCode,
              phoneNumber,
              alternativephoneNumberCountryCode,
              alternativeMobileNumber,
              gender,
              identificationMark,
              country,
              fullAddress,
              area,
              referredTypeId,
              referralDetails
            })
          );
        }

        if (patientData.patientAdmission._id && patientData.patientAdmission.patientId) {
          const admissionReponse = await updatePateintAddmissionData(
            patientData.patientAdmission.patientId,
            patientData.patientAdmission._id
          );
          if (admissionReponse && admissionReponse?.data?.status === "success") {
            const { dateOfAdmission, admissionType, involuntaryAdmissionType, time } = state;
            dispatch(
              setPatientAdmission({
                ...patientData.patientAdmission,
                _id: admissionReponse?.data?.data?._id,
                dateOfAdmission,
                involuntaryAdmissionType:
                  admissionType === "Involuntary"
                    ? involuntaryAdmissionType
                    : { value: "", label: "" },
                time,
                admissionType
              })
            );
            setState((prev) => ({ ...prev, loading: false }));
          }
        } else {
          const admissionReponse = await createPateintAddmissionData(
            patientData.patientDetails._id,
            state
          );
          if (admissionReponse?.data?.status === "success") {
            const resourceData = await addDefaultResource(
              patientData.patientDetails._id,
              admissionReponse?.data?.data?._id
            );

            const { dateOfAdmission, time, admissionType, involuntaryAdmissionType } = state;
            dispatch(
              setPatientAdmission({
                ...patientData.patientAdmission,
                _id: admissionReponse?.data?.data?._id,
                patientId: patientResponse?.data?.data?._id,
                dateOfAdmission,
                time,
              involuntaryAdmissionType:
                  admissionType === "Involuntary"
                    ? involuntaryAdmissionType
                    : { value: "", label: "" },
                admissionType,
                centerId: {
                  value: resourceData?.data?.data?.resourceAllocation?.centerId?._id || "",
                  label: resourceData?.data?.data?.resourceAllocation?.centerId.centerName || ""
                }
              })
            );
            setState((prev) => ({ ...prev, loading: false }));
          }
        }
      } else {
        const patientResponse = await createPateintData(state);
        if (patientResponse.data.status === "success") {
          const {
            firstName,
            lastName,
            dob,
            age,
            email,
            phoneNumberCountryCode,
            phoneNumber,
            alternativephoneNumberCountryCode,
            alternativeMobileNumber,
            gender,
            identificationMark,
            country,
            fullAddress,
            area,
            referredTypeId,
            referralDetails
          } = state;
          setState((prev) => ({
            ...prev,
            patientPic: patientResponse?.data?.data?.patientPicUrl
              ? patientResponse?.data?.data?.patientPicUrl
              : state.patientPic,
            idProof: patientResponse?.data?.data?.patientIdProofUrls
              ? patientResponse?.data?.data?.patientIdProofUrls
              : patientResponse?.data?.data?.idProof
          }));
          dispatch(
            setPatientDetails({
              ...patientData.patientDetails,
              _id: patientResponse?.data?.data?._id,
              uhid: patientResponse?.data?.data?.uhid,
              patientFileName: patientResponse?.data?.data?.patientPicFileName,
              patientIdProofName: patientResponse?.data?.data?.patientIdProofName,
              patientPic: patientResponse?.data?.data?.patientPicUrl,
              idProof: patientResponse?.data?.data?.patientIdProofUrls,
              firstName,
              lastName,
              dob,
              age,
              email,
              phoneNumberCountryCode,
              phoneNumber,
              alternativephoneNumberCountryCode,
              alternativeMobileNumber,
              gender,
              identificationMark,
              country,
              fullAddress,
              area,
              referredTypeId,
              referralDetails
            })
          );
          const admissionReponse = await createPateintAddmissionData(
            patientResponse.data.data._id,
            state
          );
          if (admissionReponse?.data?.status === "success") {
            const resourceData = await addDefaultResource(
              patientResponse?.data?.data?._id,
              admissionReponse?.data?.data?._id
            );

            const { dateOfAdmission, time, admissionType, involuntaryAdmissionType } = state;
            dispatch(
              setPatientAdmission({
                ...patientData.patientAdmission,
                _id: admissionReponse?.data?.data?._id,
                patientId: patientResponse?.data?.data?._id,
                dateOfAdmission,
                time,
               involuntaryAdmissionType:
                  admissionType === "Involuntary"
                    ? involuntaryAdmissionType
                    : { value: "", label: "" },
                admissionType,
                centerId: {
                  value: resourceData?.data?.data?.resourceAllocation?.centerId?._id || "",
                  label: resourceData?.data?.data?.resourceAllocation?.centerId.centerName || ""
                }
              })
            );
            setState((prev) => ({ ...prev, loading: false }));
          }
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
      if (btnType === "SAVE_AND_NEXT") {
        dispatch(setStepper({ step: 1, tab: 2 }));
        toast.success("Basic Details save successfully");
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

        toast.success("Basic Details save successfully");
      } else {
        toast.success("Basic Details save successfully");
      }
      setState((prev) => ({ ...prev, loading: false }));
      dispatch(setDiscardModal({ isFormChanged: false }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
      if (err instanceof Error && "inner" in err) {
        const validationErrors: Record<string, string> = {};
        const validationErrorArray = err.inner as Array<{ path: string; message: string }>;
        validationErrorArray.forEach((e) => {
          if (e.path && !validationErrors[e.path]) {
            validationErrors[e.path] = e.message;
          }
        });
        setErrors(validationErrors);
        return; // ✅ Set the errors in the state
      }
      handleError(err);
    }
  };

  const handleSubmitWithExist = async (
    _e: SyntheticEvent,
    btnType: "SAVE" | "SAVE_AND_NEXT" | "SAVE_AND_NEXT_DISCARD"
  ) => {
    if (state.loading) return;
    dispatch(setDiscardModal({ isDiscardModalOpen: false }));
    setState((prev) => ({ ...prev, loading: true }));

    try {
      await emergencyadmitValidation.validate(state, { abortEarly: false });
      if (btnType === "SAVE_AND_NEXT" || btnType === "SAVE_AND_NEXT_DISCARD") {
        await BasicDetailsValidation.validate(state, { abortEarly: false });
      }
      // if (
      //   !patientData.patientDetails._id &&
      //   state.dob &&
      //   state.firstName &&
      //   state.lastName &&
      //   state.phoneNumber
      // ) {
      //   const existResponse = await existPatient({
      //     lastName: state.lastName,
      //     firstName: state.firstName,
      //     dob: state.dob,
      //     phoneNumber: state.phoneNumber
      //   });
      //   if (existResponse?.data?.data?.isExist) {
      //     setState((prev) => ({ ...prev, loading: false }));
      //     dispatch(setDiscardModal({ isFormChanged: false }));
      //     return;
      //   }
      // }

      setErrors({});
      if (patientData.patientDetails._id) {
        const patientResponse = await updatePateintData(patientData.patientDetails._id);

        if (patientResponse && patientResponse.data.status === "success") {
          const {
            firstName,
            lastName,
            dob,
            age,
            email,
            phoneNumberCountryCode,
            phoneNumber,
            alternativephoneNumberCountryCode,
            alternativeMobileNumber,
            gender,
            identificationMark,
            country,
            fullAddress,
            area,
            referredTypeId,
            referralDetails
          } = state;

          setState((prev) => ({
            ...prev,
            patientPic: patientResponse?.data?.data?.patientPicUrl
              ? patientResponse?.data?.data?.patientPicUrl
              : patientResponse?.data?.data?.patientPic
          }));

          dispatch(
            setPatientDetails({
              ...patientData.patientDetails,
              uhid: patientResponse?.data?.data?.uhid,
              patientFileName: patientResponse.data?.data?.patientPicFileName,
              patientIdProofName: patientResponse?.data?.data?.patientIdProofName,
              patientPic: patientResponse?.data?.data?.patientPicUrl
                ? patientResponse?.data?.data?.patientPicUrl
                : patientResponse?.data?.data?.patientPic,
              idProof: patientResponse?.data?.data?.patientIdProofUrls
                ? patientResponse?.data?.data?.patientIdProofUrls
                : patientResponse?.data?.data?.idProof,
              firstName,
              lastName,
              dob,
              age,
              email,
              phoneNumberCountryCode,
              phoneNumber,
              alternativephoneNumberCountryCode,
              alternativeMobileNumber,
              gender,
              identificationMark,
              country,
              fullAddress,
              area,
              referredTypeId,
              referralDetails
            })
          );
        }

        if (patientData.patientAdmission._id && patientData.patientAdmission.patientId) {
          const admissionReponse = await updatePateintAddmissionData(
            patientData.patientAdmission.patientId,
            patientData.patientAdmission._id
          );
          if (admissionReponse && admissionReponse?.data?.status === "success") {
            const { dateOfAdmission, admissionType, involuntaryAdmissionType, time } = state;
            dispatch(
              setPatientAdmission({
                ...patientData.patientAdmission,
                _id: admissionReponse?.data?.data?._id,
                dateOfAdmission,
                 involuntaryAdmissionType:
                  admissionType === "Involuntary"
                    ? involuntaryAdmissionType
                    : { value: "", label: "" },
                time,
                admissionType
              })
            );
            setState((prev) => ({ ...prev, loading: false }));
          }
        } else {
          const admissionReponse = await createPateintAddmissionData(
            patientData.patientDetails._id,
            state
          );
          if (admissionReponse?.data?.status === "success") {
            const resourceData = await addDefaultResource(
              patientData?.patientDetails?._id,
              admissionReponse?.data?.data?._id
            );

            const { dateOfAdmission, time, admissionType, involuntaryAdmissionType } = state;
            dispatch(
              setPatientAdmission({
                ...patientData.patientAdmission,
                _id: admissionReponse?.data?.data?._id,
                patientId: patientResponse?.data?.data?._id,
                dateOfAdmission,
                time,
                 involuntaryAdmissionType:
                  admissionType === "Involuntary"
                    ? involuntaryAdmissionType
                    : { value: "", label: "" },
                admissionType,
                centerId: {
                  value: resourceData?.data?.data?.resourceAllocation?.centerId?._id || "",
                  label: resourceData?.data?.data?.resourceAllocation?.centerId.centerName || ""
                }
              })
            );
            setState((prev) => ({ ...prev, loading: false }));
          }
        }
      } else {
        const patientResponse = await createPateintData(state);
        if (patientResponse.data.status === "success") {
          const {
            firstName,
            lastName,
            dob,
            age,
            email,
            phoneNumberCountryCode,
            phoneNumber,
            alternativephoneNumberCountryCode,
            alternativeMobileNumber,
            gender,
            identificationMark,
            country,
            fullAddress,
            area,
            referredTypeId,
            referralDetails
          } = state;
          setState((prev) => ({
            ...prev,
            patientPic: patientResponse?.data?.data?.patientPicUrl
              ? patientResponse?.data?.data?.patientPicUrl
              : state.patientPic
          }));
          dispatch(
            setPatientDetails({
              ...patientData.patientDetails,
              _id: patientResponse?.data?.data?._id,
              uhid: patientResponse?.data?.data?.uhid,
              patientFileName: patientResponse?.data?.data?.patientPicFileName,
              patientIdProofName: patientResponse?.data?.data?.patientIdProofName,
              patientPic: patientResponse?.data?.data?.patientPicUrl,
              idProof: patientResponse?.data?.data?.patientIdProofUrls,
              firstName,
              lastName,
              dob,
              age,
              email,
              phoneNumberCountryCode,
              phoneNumber,
              alternativephoneNumberCountryCode,
              alternativeMobileNumber,
              gender,
              identificationMark,
              country,
              fullAddress,
              area,
              referredTypeId,
              referralDetails
            })
          );
          const admissionReponse = await createPateintAddmissionData(
            patientResponse.data.data._id,
            state
          );
          if (admissionReponse?.data?.status === "success") {
            const resourceData = await addDefaultResource(
              patientResponse?.data?.data?._id,
              admissionReponse?.data?.data?._id
            );

            const { dateOfAdmission, time, admissionType, involuntaryAdmissionType } = state;
            dispatch(
              setPatientAdmission({
                ...patientData.patientAdmission,
                _id: admissionReponse?.data?.data?._id,
                patientId: patientResponse?.data?.data?._id,
                dateOfAdmission,
                time,
                involuntaryAdmissionType:
                  admissionType === "Involuntary"
                    ? involuntaryAdmissionType
                    : { value: "", label: "" },
                admissionType,
                centerId: {
                  value: resourceData?.data?.data?.resourceAllocation?.centerId?._id || "",
                  label: resourceData?.data?.data?.resourceAllocation?.centerId.centerName || ""
                }
              })
            );
            setState((prev) => ({ ...prev, loading: false }));
          }
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
      if (btnType === "SAVE_AND_NEXT") {
        dispatch(setStepper({ step: 1, tab: 2 }));
        toast.success("Basic Details save successfully");
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

        toast.success("Basic Details save successfully");
      } else {
        toast.success("Basic Details save successfully");
      }
      setState((prev) => ({ ...prev, loading: false }));
      dispatch(setDiscardModal({ isFormChanged: false }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
      if (err instanceof Error && "inner" in err) {
        const validationErrors: Record<string, string> = {};
        const validationErrorArray = err.inner as Array<{ path: string; message: string }>;
        validationErrorArray.forEach((e) => {
          if (e.path && !validationErrors[e.path]) {
            validationErrors[e.path] = e.message;
          }
        });
        setErrors(validationErrors);
        return; // ✅ Set the errors in the state
      }
      handleError(err);
    }
  };

  const handleCropDone = (croppedImg: File) => {
    setState((prev) => ({ ...prev, patientPic: croppedImg }));
    setState((prev) => ({ ...prev, showModal: false }));
  };

  const referredType = useMemo<ISelectOption[]>(() => {
    if (dropdownData.referredType.loading) return [];
    const referredTypelist = [{ label: "Select", value: "" }];
    dropdownData.referredType.data.forEach(({ name, _id }) => {
      referredTypelist.push({ label: name, value: _id });
    });

    return referredTypelist;
  }, [dropdownData.referredType.data, dropdownData.referredType.loading]);

  const handleDateTimeChange = (data: string, type: string) => {
    let value = "";
    if (data) {
      value = moment(data).format("YYYY-MM-DD");
    }
    if (type === "dob") {
      const age = calculateAge(value);
      setState((prev) => ({
        ...prev,
        dob: value,
        age: +age
      }));
    } else if (type === "dateOfAdmission") {
      setState((prev) => ({
        ...prev,
        dateOfAdmission: value
      }));
    } else if (type === "time") {
      setState((prev) => ({
        ...prev,
        time: data
      }));
    }
  };

  const handleCropCancel = () => {
    setState((prev) => ({ ...prev, showModal: false }));
  };

  return (
    <div id="basicDetails">
      <div className="w-full mt-8">
        <p className="font-bold text-[18px] mb-3">Patient Details</p>
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
          <Input
            id="firstName"
            required={true}
            label="First name"
            maxLength={50}
            placeholder="Enter"
            name="firstName"
            errors={errors?.firstName}
            labelClassName="text-black!"
            className="w-[228px] rounded-[7px]! border-red-600 font-bold placeholder:font-normal"
            value={state?.firstName}
            onChange={handleChange}
          />
          <Input
            id="lastName"
            maxLength={50}
            label="Last name"
            placeholder="Enter"
            name="lastName"
            labelClassName="text-black!"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={state.lastName}
            onChange={handleChange}
          />
          <CustomCalendar
            value={state.dob}
            disabledDate={(current) => {
              if (!current) return false;

              const maxDate = new Date();
              maxDate.setHours(0, 0, 0, 0); // normalize

              const currentDate = current.toDate(); // Convert from Moment to JS Date
              currentDate.setHours(0, 0, 0, 0); // normalize

              return currentDate > maxDate;
            }}
            onChange={(date) => {
              handleDateTimeChange(date, "dob");
            }}
          >
            <div className="flex flex-col w-full">
              <label htmlFor="dob" className="block mb-1.5 ml-0.5 text-sm font-medium">
                Date of birth
              </label>
              <button
                id="dob"
                type="button"
                // onClick={handleOpenDatePicker} // trigger modal or custom date picker
                className="flex cursor-pointer w-full justify-between relative items-center border-2 border-gray-300 p-3 uppercase rounded-[7px] font-medium focus:outline-none focus:border-primary-dark"
              >
                {state?.dob ? (
                  <p className="font-bold text-sm"> {convertDate(state.dob)}</p>
                ) : (
                  <p className="text-gray-500 font-medium">DD/MM/YYYY</p>
                )}
                <div className="flex items-center justify-center w-5 h-5">
                  <img src={calender} alt="calendar" className="w-full h-full" />
                </div>
              </button>
            </div>
          </CustomCalendar>
          <Input
            id="age"
            label="Age"
            errors={errors?.age}
            maxLength={3}
            required={true}
            type="text"
            labelClassName="text-black!"
            placeholder="Enter (Number Only)"
            name="age"
            className="w-[228px] rounded-[7px]! font-bold border-red-600 placeholder:font-normal"
            value={state.age === 0 ? "" : state.age}
            onChange={handleChange}
          />
          <Input
            id="email"
            type="email"
            label="Email"
            errors={errors?.email}
            maxLength={50}
            labelClassName="text-black!"
            placeholder="Enter"
            name="email"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={state.email}
            onChange={handleChange}
          />
          <div className="flex gap-1 w-full  items-start flex-col">
            <p className="block  ml-0.5 text-sm font-medium">
              Mobile no.<span>*</span>
            </p>
            <div className="flex w-full items-center border-2 h-fit border-gray-300  rounded-[7px]!  focus-within:border-primary-dark">
              <Select
                containerClass="w-fit!"
                className="border-none w-[80px]!  truncate gap-1 font-semibold"
                options={phonecode}
                optionClassName="w-[130px]!"
                placeholder="Select"
                onChange={handleSelect}
                value={state.phoneNumberCountryCode}
                name="phoneNumberCountryCode"
              />
              <hr className="block mx-2 w-[2px] h-10 bg-gray-200" />

              <div className="relative w-full h-full flex items-center">
                <Input
                  className="border-none custom-no-autofill h-full focus-within:border-0 font-bold placeholder:font-normal pl-0"
                  value={state.phoneNumber}
                  onChange={handleChange}
                  maxLength={state.phoneNumberCountryCode.value == "+91" ? 10 : 15}
                  id="phoneNumber"
                  type="text" // Changed from "phone" to "tel" (more appropriate)
                  placeholder="Enter"
                  name="phoneNumber"
                />
              </div>
            </div>
            {errors?.phoneNumber && <p className="text-red-600">{errors?.phoneNumber}</p>}
          </div>
          <div className="flex gap-1 w-full  items-start flex-col">
            <p className="block  ml-0.5 text-sm font-medium">Alternate mobile no.</p>
            <div className="flex w-full items-center border-2 h-fit border-gray-300  rounded-[7px]!  focus-within:border-primary-dark">
              <Select
                containerClass="w-fit!"
                className="border-none w-[80px]! truncate gap-1 font-semibold"
                options={phonecode}
                optionClassName="w-[130px]!"
                placeholder="Select"
                onChange={handleSelect}
                value={state.alternativephoneNumberCountryCode}
                name="alternativephoneNumberCountryCode"
              />
              <hr className="block mx-2 w-[2px] h-10 bg-gray-200" />

              <div className="relative w-full h-full flex items-center">
                <Input
                  className="border-none custom-no-autofill focus-within:border-0 font-bold placeholder:font-normal pl-0"
                  value={state.alternativeMobileNumber}
                  onChange={handleChange}
                  maxLength={state.alternativephoneNumberCountryCode.value == "+91" ? 10 : 15}
                  id="alternativeMobileNumber"
                  type="text"
                  placeholder="Enter"
                  name="alternativeMobileNumber"
                />
              </div>
            </div>
            {errors?.alternativeMobileNumber && (
              <p className="text-red-600">{errors?.alternativeMobileNumber}</p>
            )}
          </div>

          <div className="flex gap-5  w-full items-start flex-col">
            <p className="block  ml-0.5 text-sm font-medium">
              Gender<span>*</span>
            </p>
            <div className="flex">
              <div className="flex items-center me-4">
                <div className="relative flex items-center">
                  <Input
                    id="Male"
                    type="radio"
                    value="Male"
                    onChange={handleChange}
                    checked={state.gender === "Male"}
                    name="gender"
                    containerClass="hidden!"
                  />
                  <label
                    htmlFor="Male"
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                      state.gender === "Male" ? " border-[#586B3A]!" : "border-[#586B3A]"
                    }`}
                  >
                    {state.gender === "Male" && (
                      <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                    )}
                  </label>
                </div>

                <label htmlFor="Male" className="ms-2 text-sm font-medium">
                  Male
                </label>
              </div>
              <div className="flex items-center me-4">
                <div className="relative flex items-center">
                  <Input
                    id="Female"
                    type="radio"
                    value="Female"
                    onChange={handleChange}
                    checked={state.gender === "Female"}
                    name="gender"
                    containerClass="hidden!"
                  />
                  <label
                    htmlFor="Female"
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                      state.gender === "Female" ? "border-[#586B3A]!" : "border-[#586B3A]"
                    }`}
                  >
                    {state.gender === "Female" && (
                      <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                    )}
                  </label>
                </div>

                <label htmlFor="Female" className="ms-2 text-sm font-medium">
                  Female
                </label>
              </div>
              <div className="flex items-center me-4">
                <div className="relative flex items-center">
                  <Input
                    id="Other"
                    type="radio"
                    value="Other"
                    onChange={handleChange}
                    checked={state.gender === "Other"}
                    name="gender"
                    containerClass="hidden!"
                  />
                  <label
                    htmlFor="Other"
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                      state.gender === "Other" ? " border-[#586B3A]!" : "border-[#586B3A]"
                    }`}
                  >
                    {state.gender === "Other" && (
                      <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                    )}
                  </label>
                </div>

                <label htmlFor="Other" className="ms-2 text-sm font-medium">
                  Other
                </label>
              </div>
            </div>
            {errors?.gender && <p className="text-red-600">{errors?.gender}</p>}
          </div>
          <Input
            id="identificationMark"
            type="text"
            label="Identification mark"
            labelClassName="text-black!"
            placeholder="Enter"
            name="identificationMark"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={state.identificationMark}
            onChange={handleChange}
          />
          <Select
            label="Country"
            options={countryDropdown}
            placeholder="Select"
            onChange={handleSelect}
            value={state.country}
            name="country"
          />
          <Input
            id="fullAddress"
            type="text"
            errors={errors?.fullAddress}
            required={true}
            labelClassName="text-black!"
            label="Full Address"
            maxLength={200}
            placeholder="Enter"
            name="fullAddress"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={state.fullAddress}
            onChange={handleChange}
          />

          <div className="flex gap-5  w-full items-start flex-col">
            <p className="block  ml-0.5 text-sm font-medium">
              Area<span>*</span>
            </p>
            <div className="flex">
              <div className="flex items-center me-4">
                <div className="relative flex items-center">
                  <Input
                    id="Urban"
                    type="radio"
                    value="Urban"
                    onChange={handleChange}
                    checked={state.area === "Urban"}
                    name="area"
                    containerClass="hidden!"
                  />
                  <label
                    htmlFor="Urban"
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                      state.area === "Urban" ? " border-[#586B3A]!" : "border-[#586B3A]"
                    }`}
                  >
                    {state.area === "Urban" && (
                      <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                    )}
                  </label>
                </div>

                <label htmlFor="Urban" className="ms-2 text-sm font-medium">
                  Urban
                </label>
              </div>
              <div className="flex items-center me-4">
                <div className="relative flex items-center">
                  <Input
                    id="Rural"
                    type="radio"
                    value="Rural"
                    onChange={handleChange}
                    checked={state.area === "Rural"}
                    name="area"
                    containerClass="hidden!"
                  />
                  <label
                    htmlFor="Rural"
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                      state.area === "Rural" ? "border-[#586B3A]!" : "border-[#586B3A]"
                    }`}
                  >
                    {state.area === "Rural" && (
                      <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                    )}
                  </label>
                </div>

                <label htmlFor="Rural" className="ms-2 text-sm font-medium">
                  Rural
                </label>
              </div>
            </div>
            {errors?.area && <p className="text-red-600">{errors?.area}</p>}
          </div>
          <div>
            <div className="grid min-w-[200px] grid-cols-5 items-center gap-2">
              <div className="col-span-3">
                <CustomCalendar
                  value={state.dateOfAdmission}
                  disabledDate={(current) => {
                    if (!current) return false;

                    const minDate = new Date();
                    minDate.setHours(0, 0, 0, 0); // normalize
                    minDate.setDate(minDate.getDate() - 1);

                    const maxDate = new Date();
                    minDate.setHours(0, 0, 0, 0); // normalize
                    maxDate.setDate(maxDate.getDate() + 90);

                    const currentDate = current.toDate(); // Convert from Moment to JS Date
                    currentDate.setHours(0, 0, 0, 0); // normalize

                    return current && (current < minDate || current > maxDate); // Disable dates outside the range
                  }}
                  onChange={(date) => {
                    handleDateTimeChange(date, "dateOfAdmission");
                  }}
                >
                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="dateOfAdmission"
                      className="block mb-1.5 ml-0.5 text-nowrap whitespace-nowrap text-sm font-medium"
                    >
                      Date of Admission <span>*</span>
                    </label>
                    <button
                      id="dateOfAdmission"
                      className="flex cursor-pointer justify-between min-w-18 items-center border-2 border-gray-300 p-3  uppercase rounded-[7px]! font-medium focus:outline-none focus:border-primary-dark"
                    >
                      {state?.dateOfAdmission ? (
                        <p> {convertDate(state.dateOfAdmission)}</p>
                      ) : (
                        <p className="text-[#6B6B6B] text-bold">DD/MM/YYYY</p>
                      )}
                      <div className=" cursor-pointer flex items-center justify-center w-5 h-5">
                        <img src={calender} alt="calender" className="w-full h-full" />
                      </div>
                    </button>
                  </div>
                </CustomCalendar>
              </div>
              <div className="col-span-2">
                <CustomTimePicker
                  onChange={(data) => {
                    handleDateTimeChange(data, "time");
                  }}
                  value={state.time}
                >
                  <div className="flex flex-col w-full">
                    <label
                      htmlFor="time"
                      className="block mb-1.5 ml-0.5 text-nowrap whitespace-nowrap text-sm font-medium"
                    >
                      Time<span>*</span>
                    </label>
                    <button className="cursor-pointer flex justify-between w-full items-center border-2 gap-4 border-gray-300 p-3  uppercase rounded-[7px]! font-medium focus:outline-none focus:border-primary-dark">
                      <p> {state.time}</p>

                      <div className=" cursor-pointer flex items-center justify-center w-5 h-5">
                        <img src={clock} alt="clock" className="w-full h-full" />
                      </div>
                    </button>
                  </div>
                </CustomTimePicker>
              </div>
              {errors?.dateOfAdmission && (
                <p className="text-red-600 text-nowrap whitespace-nowrap">
                  {errors?.dateOfAdmission}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-start flex-col gap-3 w-full">
            <p className="block ml-0.5 text-sm font-medium">Profile Photo</p>
            {state.patientPic ? (
              <div className="py-3 px-2 w-full flex gap-2 rounded-lg items-center justify-start border-dashed border-[#A5A5A5] border-2 cursor-pointer">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  {typeof state.patientPic === "string" ? (
                    <img src={state.patientPic} alt="Patient Pic" className="w-full h-full" />
                  ) : (
                    <img
                      src={URL.createObjectURL(state.patientPic)}
                      className="w-12 h-12"
                      alt="Patient Pic"
                    />
                  )}
                </div>
                <div>
                  {state.patientPic && (
                    <p className="text-[#7E7E7E] w-[100px] truncate font-medium text-xs">
                      {typeof state.patientPic !== "string"
                        ? state.patientPic.name
                        : patientData?.patientDetails?.patientFileName?.split("-").pop()}
                    </p>
                  )}
                  <p className="font-medium  text-xs">
                    <span
                      onClick={handleRemoveImg}
                      className="font-medium text-red-500 text-xs underline"
                    >
                      Remove
                    </span>{" "}
                    &{" "}
                    <span className="font-medium  text-xs underline" onClick={handleClick}>
                      Update
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div
                onClick={handleClick}
                className="py-3 px-2 flex gap-2 rounded-lg items-center w-full border-dashed border-[#A5A5A5] border-2 cursor-pointer"
              >
                <div className=" w-12 bg-[#C1D1A8] rounded-full h-12 flex items-center overflow-hidden justify-center">
                  <LuUserRound className="object-cover text-xl text-white" />
                </div>
                <div>
                  <p className="font-semibold text-xs">
                    Click to <span className="underline">Upload</span>
                  </p>
                  <p className="text-[#7E7E7E] font-medium text-xs">Format: JPG, JPEG, PNG</p>
                  <p className="text-[#7E7E7E] font-medium text-xs">Size: Under 2 MB</p>
                </div>
              </div>
            )}
            {state.showModal && state.croppedImage && (
              <CropperImage
                image={state.croppedImage}
                onCropDone={handleCropDone}
                onCropCancel={handleCropCancel}
              />
            )}

            <input
              ref={fileInputRef}
              id="File"
              type="file"
              name="patientPic"
              // value={state.basicDetailfile}
              accept="image/jpeg ,image/png, image/jpg"
              style={{ display: "none" }}
              onChange={handleChange}
            />
            {errors?.patientPic && <p className="text-red-600">{errors?.patientPic}</p>}
          </div>

          <div className="flex flex-col items-start">
            <label className="block mb-1.5 ml-0.5 text-sm font-medium">ID Proof</label>
            <div className="flex flex-col gap-1">
              <CheckBox
                name="idProof"
                checked={true}
                files={idProofFiles} // Currently uploaded files
                filesString={
                  state.idProof && state.idProof.length > 0
                    ? state.idProof
                        .filter((url): url is string => typeof url === "string")
                        .map((url, idx) => ({
                          filePath: url,
                          fileUrl: url,
                          fileName:
                            patientData.patientDetails.patientIdProofName?.[idx] ||
                            `ID_Proof_${idx + 1}.pdf`
                        }))
                    : undefined
                }
                ContainerClass="-ml-5"
                checkHide
                handleDeletes={handleDeleteIdProof}
                handleDrop={handleDropIdProof}
                handleCheck={() => {}}
              />
              <span className="text-[11px] text-gray-500">Format: PDF, Max size: 5MB each</span>
              {idProofError && <span className="text-xs text-red-500">{idProofError}</span>}
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 md:grid-cols-1 w-full items-start gap-20">
          <div className="w-full">
            <p className="font-bold text-[18px] mt-14 mb-3">Referral</p>
            <div className="w-full grid grid-cols-2 gap-x-[65px] gap-y-[30px]">
              <Select
                label="Referral Type"
                options={referredType}
                placeholder="Select"
                onChange={handleSelect}
                value={state.referredTypeId}
                name="referredTypeId"
              />

              <Input
                id="referralDetails"
                type="text"
                labelClassName="text-black!"
                label="Referral Details"
                placeholder="Enter"
                name="referralDetails"
                className="w-[228px] rounded-[7px]!  py-3 font-bold placeholder:font-normal"
                value={state.referralDetails}
                onChange={handleChange}
                maxLength={50}
              />
            </div>
          </div>

          <div className="w-full">
            <p className="font-bold text-[18px] mt-14 mb-3">Admission Type</p>
            <div className="flex w-fit flex-col gap-2">
              <div className="flex gap-3  mt-5 items-center">
                <div className="py-5 flex">
                  <div className="flex items-center me-4">
                    <div className="relative flex items-center">
                      <Input
                        id="Voluntary"
                        type="radio"
                        value="Voluntary"
                        onChange={handleChange}
                        checked={state.admissionType == "Voluntary"}
                        name="admissionType"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Voluntary"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                          state.admissionType === "Voluntary"
                            ? " border-[#586B3A]!"
                            : "border-[#586B3A]"
                        }`}
                      >
                        {state.admissionType === "Voluntary" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="Voluntary" className="ms-2 text-sm font-medium">
                      Voluntary
                    </label>
                  </div>

                  <div className="flex items-center me-4">
                    <div className="relative flex items-center">
                      <Input
                        id="Involuntary"
                        type="radio"
                        value="Involuntary"
                        onChange={handleChange}
                        checked={state.admissionType == "Involuntary"}
                        name="admissionType"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Involuntary"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                          state.admissionType === "Involuntary"
                            ? " border-[#586B3A]!"
                            : "border-[#586B3A]"
                        }`}
                      >
                        {state.admissionType === "Involuntary" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="Involuntary" className="ms-2 text-sm font-medium">
                      Involuntary
                    </label>
                  </div>
                </div>
                {state.admissionType === "Involuntary" && (
                  <div className="w-[228px] ">
                    <Select
                      options={[
                        { value: "", label: "Select" },
                        { value: "Rescued", label: "Rescued" },
                        { value: "Brought by family", label: "Brought by family" }
                      ]}
                      placeholder="Select"
                      disable={state.admissionType !== "Involuntary"}
                      onChange={handleSelect}
                      value={state.involuntaryAdmissionType}
                      name="involuntaryAdmissionType"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex gap-x-5 items-center mt-12 justify-center">
          <Button
            type="submit"
            name="save"
            disabled={state.loading}
            className="min-w-[150px]! text-xs! px-[30px]! py-[10px]! rounded-[10px]!"
            variant="outlined"
            size="base"
            onClick={(e) => handleSubmit(e, "SAVE")}
          >
            Save {state.loading && <Loader size="xs" />}
          </Button>
          <Button
            type="submit"
            name="next"
            disabled={state.loading}
            className="min-w-[150px]! text-xs! py-[10px]! rounded-[10px]!"
            variant="contained"
            size="base"
            onClick={(e) => handleSubmit(e, "SAVE_AND_NEXT")}
          >
            Save & Continue {state.loading && <Loader size="xs" />}
          </Button>
        </div>
      </div>

      <DiscardModal
        handleClickSaveAndContinue={(_e: SyntheticEvent) =>
          handleSubmit(_e, "SAVE_AND_NEXT_DISCARD")
        }
      />
      <Modal isOpen={existModal}>
        <div className="w-[376px] px-6 py-5">
          <p className="text-[15px] font-bold mb-[11px]">Already Exist?</p>
          <p className="text-[13px] font-medium text-[#535353] mb-10">
            Patient already exists with the given information.
          </p>

          <div className="w-full flex gap-x-5 items-center justify-center">
            <Button
              className="w-full! text-xs! border-gray-300! shadow-sm bg-[#F6F6F6]! font-semibold py-[10px] rounded-xl"
              variant="outlined"
              size="base"
              onClick={() => {
                setExistModal(false);
                navigate(`/admin/existing-patient?uhid=${uhid}`);
              }}
            >
              Check Patient
            </Button>

            <Button
              className="w-full! text-xs! font-semibold py-[10px] rounded-xl"
              type="submit"
              name="save"
              variant="contained"
              size="base"
              onClick={(e) => {
                setExistModal(false);
                handleSubmitWithExist(e, "SAVE");
              }}
            >
              Continue
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BasicDetails;
