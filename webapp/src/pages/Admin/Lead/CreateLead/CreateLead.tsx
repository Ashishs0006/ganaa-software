import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useBlocker, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import moment from "moment";

import { RootState } from "@/redux/store/store";
import { resetLead, setLead } from "@/redux/slice/LeadSlice";

import clock from "@/assets/images/clock.svg";
import calendar from "@/assets/images/calender.svg";

import {
  Button,
  CustomCalendar,
  CustomTimePicker,
  DiscardModal,
  Input,
  Loader,
  Modal,
  RichTextEditor,
  Select
} from "@/components";

import { calculateAge, convertDate, isNumeric } from "@/components/BasicDetaills/utils";
import { formateNormalDate } from "@/utils/formater";
import { progressStatusOption } from "@/pages/Admin/Lead/CreateLead/utils";

import { ISelectOption } from "@/components/Select/types";
import { LeadState } from "@/pages/Admin/Lead/CreateLead/types";
import { LeadValidation } from "@/validations/Yup/LeadValidation";

import {
  createComment,
  createLead,
  existPatient,
  getAllUser,
  getSingleLead,
  updateLead
} from "@/apis";

import handleError from "@/utils/handleError";
import compareObjects from "@/utils/compareObjects";
import { setDiscardModal } from "@/redux/slice/stepperSlice";

const CreateLead = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [existModal, setExistModal] = useState<boolean>(false);
  const [uhid, setUhid] = useState<string>();

  const location = useLocation();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState<boolean>(false);

  const [allDoctors, setAllDoctors] = useState<ISelectOption[]>([]);

  const [state, setState] = useState<LeadState>({
    referralTypeId: { label: "", value: "" },
    referralDetails: "",
    illnessType: { label: "", value: "" },
    leadSelect: "",
    leadType: "",
    isNewLead: undefined,
    leadDate: moment().format("YYYY-MM-DD"),
    leadTime: moment().format("HH:mm"),
    progressStatus: { label: "", value: "" },

    firstName: "",
    lastName: "",
    dob: "",
    age: 0,
    email: "",
    phoneNumber: "",
    phoneNumberCountryCode: { label: "+91", value: "+91" },
    alternativephoneNumberCountryCode: { label: "+91", value: "+91" },
    alternativeMobileNumber: "",
    gender: "",
    guardianName: "",
    guardianNameRelationshipId: { label: "", value: "" },

    country: {
      value: "India",
      label: "India"
    },
    fullAddress: "",
    // state: "",
    chiefComplaints: "",
    admissionType: "",
    involuntaryAdmissionType: { label: "", value: "" },
    centerId: { label: "", value: "" },
    firstPersonContactedAtGanaa: "",
    assignedTo: { label: "", value: "" },
    nextFollowUpDate: "",
    centerVisitDateTime: ""
  });
  const [updateStatus, setUpdateStatus] = useState<boolean>(false);
  const [data, setData] = useState({ comment: "" });

  const leadData = useSelector((store: RootState) => store.leads);

  const dropdownData = useSelector((store: RootState) => store.dropdown);

  const stepperData = useSelector((store: RootState) => store.stepper);

  const referredType = useMemo<ISelectOption[]>(() => {
    if (dropdownData.referredType.loading) return [];
    const referredTypelist = [{ label: "Select", value: "" }];
    dropdownData.referredType.data.forEach(({ name, _id }) => {
      referredTypelist.push({ label: name, value: _id });
    });

    return referredTypelist;
  }, [dropdownData.referredType.data, dropdownData.referredType.loading]);

  const countryDropdown = useMemo<ISelectOption[]>(() => {
    if (dropdownData.country.loading) return [];

    const countryList = [{ label: "India", value: "India" }];
    dropdownData.country.data.forEach(({ name }) => {
      countryList.push({ label: `${name}`, value: name });
    });

    return countryList;
  }, [dropdownData.country.data, dropdownData.country.loading]);

  const relationShips = useMemo<ISelectOption[]>(() => {
    if (dropdownData.relationships.loading) return [];
    const relationshipList = [{ label: "Select", value: "" }];
    dropdownData.relationships.data.forEach((value) => {
      relationshipList.push({ label: `${value.fullName} (${value?.shortName})`, value: value._id });
    });

    return relationshipList;
  }, [dropdownData.relationships.data, dropdownData.relationships.loading]);

  const centerDropdown = useMemo<ISelectOption[]>(() => {
    const centerList = dropdownData?.center?.data ?? [];
    return centerList.map(({ centerName, _id }) => ({
      label: centerName,
      value: _id
    }));
  }, [dropdownData?.center?.data]);

  const phonecode = useMemo<ISelectOption[]>(() => {
    if (dropdownData.country.loading) return [];

    const countryList = [{ label: "+91", value: "+91" }];
    dropdownData.country.data.forEach((country) => {
      countryList.push({ label: country.phoneCode, value: country.phoneCode });
    });

    return countryList;
  }, [dropdownData.country.data, dropdownData.country.loading]);

  const fetchLead = async (id: string) => {
    const { data } = await getSingleLead(id);
    if (data.status === "success") {
      if (data?.data?.progressStatus) {
        setUpdateStatus(true);
      }
      dispatch(
        setLead({
          ...leadData.lead,
          referralTypeId: {
            label: data?.data?.referralTypeId?.name || "",
            value: data?.data?.referralTypeId?._id || ""
          },
          illnessType: {
            label: data?.data?.illnessType || "",
            value: data?.data?.illnessType || ""
          },
          referralDetails: data?.data?.referralDetails || "",
          leadSelect: data?.data?.leadSelect || "",
          leadType: data?.data?.leadType || "",
          isNewLead: data?.data?.isNewLead === true ? true : false,
          leadDate:
            data.data?.leadDateTime && moment(data?.data?.leadDateTime).format("YYYY-MM-DD"),
          leadTime: data?.data?.leadDateTime && moment(data?.data?.leadDateTime).format("HH:mm"),
          progressStatus: {
            label: data?.data?.progressStatus || "",
            value: data?.data?.progressStatus || ""
          },

          firstName: data?.data?.firstName || "",
          lastName: data?.data?.lastName || "",
          dob: (data?.data?.dob && new Date(data?.data?.dob).toISOString().split("T")[0]) || "",
          age: data?.data?.age || 0,
          email: data?.data?.email || "",
          phoneNumber: data?.data?.phoneNumber || "",
          phoneNumberCountryCode: {
            label: data?.data?.phoneNumberCountryCode || "+91",
            value: data?.data?.phoneNumberCountryCode || "+91"
          },
          alternativephoneNumberCountryCode: {
            label: data?.data?.alternativephoneNumberCountryCode || "+91",
            value: data?.data?.alternativephoneNumberCountryCode || "+91"
          },
          alternativeMobileNumber: data?.data?.alternativeMobileNumber || "",
          gender: data?.data?.gender || "",
          guardianName: data?.data?.guardianName || "",
          guardianNameRelationshipId: {
            label: `${data?.data?.guardianNameRelationshipId?.fullName} (${data?.data?.guardianNameRelationshipId?.shortName})`,
            value: data?.data?.guardianNameRelationshipId?._id || ""
          },

          country: { label: data?.data?.country || "", value: data?.data?.country || "" },
          fullAddress: data?.data?.fullAddress,
          chiefComplaints: data?.data?.chiefComplaints || "",
          admissionType: data?.data?.admissionType || "",
          involuntaryAdmissionType: {
            label: data?.data?.involuntaryAdmissionType || "",
            value: data?.data?.involuntaryAdmissionType || ""
          },
          centerId: {
            label: data?.data?.centerId?.centerName || "",
            value: data?.data?.centerId?._id || ""
          },
          firstPersonContactedAtGanaa: data?.data?.firstPersonContactedAtGanaa || "",
          assignedTo: { label: "", value: "" },
          nextFollowUpDate:
            (data?.data?.nextFollowUpDate &&
              new Date(data?.data?.nextFollowUpDate).toISOString().split("T")[0]) ||
            "",
          centerVisitDateTime:
            (data?.data?.centerVisitDateTime &&
              new Date(data?.data?.centerVisitDateTime).toISOString().split("T")[0]) ||
            ""
        })
      );
      setState((prev) => ({
        ...prev,
        illnessType: {
          label: data?.data?.illnessType || "",
          value: data?.data?.illnessType || ""
        },
        referralTypeId: {
          label: data?.data?.referralTypeId?.name || "",
          value: data?.data?.referralTypeId?._id || ""
        },
        referralDetails: data?.data?.referralDetails || "",
        leadSelect: data?.data?.leadSelect || "",
        leadType: data?.data?.leadType || "",
        leadDate: data.data?.leadDateTime && moment(data?.data?.leadDateTime).format("YYYY-MM-DD"),
        leadTime: data?.data?.leadDateTime && moment(data?.data?.leadDateTime).format("HH:mm"),
        progressStatus: {
          label: data?.data?.progressStatus || "",
          value: data?.data?.progressStatus || ""
        },

        firstName: data?.data?.firstName || "",
        lastName: data?.data?.lastName || "",
        dob: (data?.data?.dob && new Date(data?.data?.dob).toISOString().split("T")[0]) || "",
        age: data?.data?.age || 0,
        email: data?.data?.email || "",
        phoneNumber: data?.data?.phoneNumber || "",
        phoneNumberCountryCode: {
          label: data?.data?.phoneNumberCountryCode || "+91",
          value: data?.data?.phoneNumberCountryCode || "+91"
        },
        isNewLead: data?.data?.isNewLead === true ? true : false,
        alternativephoneNumberCountryCode: {
          label: data?.data?.alternativephoneNumberCountryCode || "+91",
          value: data?.data?.alternativephoneNumberCountryCode || "+91"
        },
        alternativeMobileNumber: data?.data?.alternativeMobileNumber || "",
        gender: data?.data?.gender || "",
        guardianName: data?.data?.guardianName || "",
        guardianNameRelationshipId: {
          label: `${data?.data?.guardianNameRelationshipId?.fullName} (${data?.data?.guardianNameRelationshipId?.shortName})`,
          value: data?.data?.guardianNameRelationshipId?._id || ""
        },

        country: { label: data?.data?.country || "", value: data?.data?.country || "" },
        fullAddress: data?.data?.fullAddress || "",
        // state: data?.data?.state || "",
        chiefComplaints: data?.data?.chiefComplaints || "",
        admissionType: data?.data?.admissionType || "",
        involuntaryAdmissionType: {
          label: data?.data?.involuntaryAdmissionType || "",
          value: data?.data?.involuntaryAdmissionType || ""
        },
        centerId: {
          label: data?.data?.centerId?.centerName || "",
          value: data?.data?.centerId?._id || ""
        },
        firstPersonContactedAtGanaa: data?.data?.firstPersonContactedAtGanaa || "",
        assignedTo: {
          label:
            `${data?.data?.assignedTo?.firstName || ""} ${
              data?.data?.assignedTo?.lastName || ""
            }`.trim() || "",
          value: data?.data?.assignedTo?._id || ""
        },
        nextFollowUpDate:
          (data?.data?.nextFollowUpDate &&
            new Date(data?.data?.nextFollowUpDate).toISOString().split("T")[0]) ||
          "",
        centerVisitDateTime:
          (data?.data?.centerVisitDateTime &&
            new Date(data?.data?.centerVisitDateTime).toISOString().split("T")[0]) ||
          ""
      }));
      setData((prev) => ({ ...prev }));
    }
  };

  useEffect(() => {
    if (id) {
      fetchLead(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDoctorData = async () => {
    try {
      const { data } = await getAllUser({
        limit: 100,
        page: 1,
        isDeleted: false,
        sort: "-leadDateTime",
        roles: "admin,sales,admission manager,Therapist+AM,ROM+AM" //doctor
      });
      setAllDoctors(
        data.data.map((data: { _id: string; firstName: string; lastName: string }) => ({
          label: `${data.firstName} ${data.lastName}`,
          value: data._id
        }))
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  useEffect(() => {
    return () => {
      dispatch(resetLead());
      dispatch(
        setDiscardModal({
          isFormChanged: false,
          isDiscardModalOpen: false,
          shouldSave: false,
          type: "navigate",
          step: 1,
          tab: 1
        })
      );
    };
  }, [location, dispatch]);

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

  const handleSelect = (key: string, value: ISelectOption) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleChange = useCallback((e: React.SyntheticEvent) => {
    const { name, value } = e.target as HTMLInputElement;
    const numberFieldsName = ["phoneNumber", "alternativeMobileNumber", "guardianName"];
    const stringFieldsName = [
      "firstName",
      "lastName",
      "referralDetails",
      "firstPersonContactedAtGanaa",
      "guardianName"
    ];
    if (name === "age") {
      if (isNumeric(value)) {
        setState((prev) => ({
          ...prev,
          age: +value,
          dob: ""
        }));
      }
    } else if (stringFieldsName.includes(name)) {
      if (/^[A-Za-z\s]*$/.test(value)) {
        setState((prev) => ({ ...prev, [name]: value }));
      }
    } else if (numberFieldsName.includes(name)) {
      if (isNumeric(value)) {
        setState((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setState((prev) => ({ ...prev, [name]: value }));
    }
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  }, []);

  const handleDateTimeChange = (data: string, type: string) => {
    let value = "";
    if (data) {
      value = moment(data).format("YYYY-MM-DD");
    }
    if (type == "dob") {
      const age = calculateAge(value);
      setState((prev) => ({
        ...prev,
        dob: value,
        age: +age
      }));
    }

    if (type == "date") {
      setState((prev) => ({ ...prev, leadDate: value }));
    } else if (type == "time") {
      setState((prev) => ({ ...prev, leadTime: data }));
    } else {
      setState((prev) => ({ ...prev, [type]: value }));
    }
    // if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleChangeQuill = useCallback(
    (name: string, value: string) => {
      setData((prev) => ({ ...prev, [name]: value }));
      if (!stepperData.discardModal.isFormChanged)
        dispatch(setDiscardModal({ isFormChanged: true }));
    },
    [dispatch, stepperData.discardModal.isFormChanged]
  );

  const handleApi = () => {
    const payload: { [key: string]: unknown } = {};
    if (id) {
      const states = compareObjects(leadData?.lead, state, true);
      if (Object.keys(states).length === 0) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extractValue = (val: any) => {
        if (val && typeof val === "object" && "value" in val) return val.value;
        return val;
      };

      Object.keys(states).forEach((key) => {
        const val = extractValue(states[key as keyof typeof states]);
        if (val !== "" && val !== null && val !== undefined) {
          payload[key] = String(val);
        }
      });
      if (states.firstName !== undefined) {
        payload.firstName = state.firstName.charAt(0).toUpperCase() + state.firstName.slice(1);
      }
      if (states.lastName !== undefined) {
        payload.lastName = state.lastName.charAt(0).toUpperCase() + state.lastName.slice(1);
      }
      if (states.leadDate !== undefined || states.leadTime !== undefined) {
        const combinedDateTime = `${state.leadDate} ${state.leadTime}`;
        const formattedDateTime = new Date(combinedDateTime).toISOString();
        payload.leadDateTime = formattedDateTime;
      }
      return updateLead(id, payload);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const extractValue = (val: any) => {
        if (val && typeof val === "object" && "value" in val) return val.value;
        return val;
      };

      Object.keys(state).forEach((key) => {
        const val = extractValue(state[key as keyof typeof state]);
        if (val !== "" && val !== null && val !== undefined) {
          payload[key] = String(val);
        }
      });
      const combinedDateTime = `${state.leadDate} ${state.leadTime}`;
      const formattedDateTime = new Date(combinedDateTime).toISOString();
      payload.leadDateTime = formattedDateTime;
      if (state.firstName.trim()) {
        payload.firstName = state.firstName.charAt(0).toUpperCase() + state.firstName.slice(1);
      }
      if (state.lastName.trim()) {
        payload.lastName = state.lastName.charAt(0).toUpperCase() + state.lastName.slice(1);
      }
      return createLead(payload);
    }
  };

  const handleClickIsNewLeadStatus = (e: SyntheticEvent, status: boolean) => {
    const { name } = e.target as HTMLInputElement;
    setState((prev) => ({ ...prev, [name]: status }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleSubmit = async (_e: SyntheticEvent, type: string) => {
    setLoading(true);
    dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));

    try {
      await LeadValidation.validate(state, { abortEarly: false });

      if (!id && state.dob && state.firstName && state.lastName && state.phoneNumber) {
        const existResponse = await existPatient({
          lastName: state.lastName,
          firstName: state.firstName,
          dob: state.dob,
          phoneNumber: state.phoneNumber
        });
        if (existResponse?.data?.data?.isExist) {
          setExistModal(true);
          setLoading(false);
          setUhid(existResponse?.data?.data?.patient[0]?.uhid);
          dispatch(setDiscardModal({ isFormChanged: false }));
          return;
        }
      }

      setErrors({});
      const response = await handleApi();
      if (response && response?.status == 200 && response?.data?.data?._id) {
        if (data.comment.trim()) {
          await createComment(response?.data?.data?._id, data);
        }
      }
      if (id) {
        toast.success("Lead Update successfully");
      } else {
        toast.success("Lead Created successfully");
      }

      setLoading(false);
      if (type === "SAVE_AND_NEXT_DISCARD") {
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
      } else {
        setTimeout(() => {
          navigate("/admin/lead/qualified-leads");
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
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

  const handleSubmitWithExist = async (_e: SyntheticEvent, type: string) => {
    setLoading(true);
    dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));

    try {
      await LeadValidation.validate(state, { abortEarly: false });
      setErrors({});
      const response = await handleApi();
      if (response && response?.status == 200 && response?.data?.data?._id) {
        if (data.comment.trim()) {
          await createComment(response?.data?.data?._id, data);
        }
      }
      if (id) {
        toast.success("Lead Update successfully");
      } else {
        toast.success("Lead Created successfully");
      }

      setLoading(false);
      if (type === "SAVE_AND_NEXT_DISCARD") {
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
      } else {
        setTimeout(() => {
          navigate("/admin/lead/qualified-leads");
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
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

  return (
    <div
      id="createLead"
      className="min-h-[calc(100vh-64px)] w-full bg-cover bg-[#F4F2F0] bg-center flex-col bg-no-repeat flex items-center p-2 sm:p-0"
    >
      <div className="container mb-20 px-[73px] flex-col h-full flex gap-[19px] justify-center items-start mt-8 w-full">
        <div className="flex ">
          <p className="text-[21px]  font-bold">{id ? "Update Lead" : "Create New Lead"}</p>
          <div className="flex text-nowrap text-xs whitespace-nowrap">
            <div className="ml-4 flex font-bold  items-center text-gray-500">
              <CustomCalendar
                value={state.leadDate}
                onChange={(date) => {
                  handleDateTimeChange(date, "date");
                }}
              >
                <div className="flex items-center font-bold">
                  {state?.leadDate && formateNormalDate(state.leadDate)}

                  <div className="flex items-center justify-center w-5 mx-1 h-5">
                    <img alt="calender" src={calendar} className="w-full h-full cursor-pointer" />
                  </div>
                </div>
              </CustomCalendar>
              <span className="mx-2">|</span>

              <CustomTimePicker
                value={state.leadTime}
                onChange={(time) => {
                  handleDateTimeChange(time, "time");
                }}
              >
                {state.leadTime && state.leadTime.split(":").slice(0, 2).join(":")}
                <div className="flex items-center justify-center w-5 mx-1 h-5">
                  <img src={clock} alt="clock" className="w-full h-full cursor-pointer ml-2" />
                </div>
              </CustomTimePicker>
            </div>
          </div>
        </div>

        <div className="border border-[#DEDEDE] bg-white w-full px-[51px] py-[25px] rounded-[21px]">
          <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
            <div className="flex gap-2 w-full items-start flex-col">
              <p className="block  ml-0.5 text-[15px] font-bold">Lead Type</p>
              <div className="flex mt-2.5">
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="Online"
                      type="radio"
                      value="Online"
                      onChange={handleChange}
                      checked={state.leadType === "Online"}
                      name="leadType"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="Online"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                        state.leadType === "Online" ? " border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {state.leadType === "Online" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="Online" className="ms-2 text-sm font-medium">
                    Online
                  </label>
                </div>
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="Offline"
                      type="radio"
                      value="Offline"
                      onChange={handleChange}
                      checked={state.leadType === "Offline"}
                      name="leadType"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="Offline"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                        state.leadType === "Offline" ? "border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {state.leadType === "Offline" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="Offline" className="ms-2 text-sm font-medium">
                    Offline
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full items-start flex-col">
              <p className="block  ml-0.5 text-[15px] font-bold">Select</p>
              <div className="flex mt-2.5">
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="IPD"
                      type="radio"
                      value="IPD"
                      onChange={handleChange}
                      checked={state.leadSelect === "IPD"}
                      name="leadSelect"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="IPD"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                        state.leadSelect === "IPD" ? " border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {state.leadSelect === "IPD" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="IPD" className="ms-2 text-sm font-medium">
                    IPD
                  </label>
                </div>
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="OPD"
                      type="radio"
                      value="OPD"
                      onChange={handleChange}
                      checked={state.leadSelect === "OPD"}
                      name="leadSelect"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="OPD"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                        state.leadSelect === "OPD" ? "border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {state.leadSelect === "OPD" && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="OPD" className="ms-2 text-sm font-medium">
                    OPD
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 w-full items-start flex-col">
              <p className="block  ml-0.5 text-[15px] font-bold">Lead Category</p>
              <div className="flex mt-2.5">
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="true"
                      type="radio"
                      value="true"
                      onChange={(e) => handleClickIsNewLeadStatus(e, true)}
                      checked={state.isNewLead === true}
                      name="isNewLead"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="true"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                        state.isNewLead === true ? " border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {state.isNewLead === true && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="true" className="ms-2 text-sm font-medium">
                    New
                  </label>
                </div>
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="false"
                      type="radio"
                      value="false"
                      onChange={(e) => handleClickIsNewLeadStatus(e, false)}
                      checked={state.isNewLead === false}
                      name="isNewLead"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="false"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                        state.isNewLead === false ? "border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {state.isNewLead === false && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="false" className="ms-2 text-sm font-medium">
                    Repeat
                  </label>
                </div>
              </div>
            </div>

            <Select
              label="Status"
              labelClassName="text-black! font-bold! text-[15px]!"
              options={progressStatusOption}
              placeholder="Select"
              disable={updateStatus}
              value={state.progressStatus}
              onChange={handleSelect}
              name="progressStatus"
            />
          </div>
          <p className="font-bold w-full text-[15px] my-3">Referral</p>
          <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
            <Select
              label="Referral Type"
              options={referredType}
              placeholder="Select"
              onChange={handleSelect}
              value={state.referralTypeId}
              name="referralTypeId"
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

        <div className="border border-[#DEDEDE] bg-white w-full px-[51px] py-[25px] rounded-[21px]">
          <p className="font-bold text-[18px] mb-3">Patient Details</p>
          <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
            <Input
              id="firstName"
              required={true}
              label="First name"
              maxLength={50}
              placeholder="Enter"
              name="firstName"
              labelClassName="text-black!"
              className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
              value={state?.firstName}
              onChange={handleChange}
              errors={errors?.firstName}
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
              // disabledDate={(current) => {
              //   const maxDate = new Date();
              //   maxDate.setDate(maxDate.getDate()); // Set maximum date to two days after today

              //   return current > maxDate; // Disable dates outside the range
              // }}
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
                <label htmlFor="dob" className="block mb-1.5  ml-0.5 text-sm font-medium">
                  Date of birth
                </label>
                <button
                  id="dob"
                  className="flex cursor-pointer w-full justify-between relative items-center border-2 border-gray-300 p-3 uppercase rounded-[7px] font-medium focus:outline-none focus:border-primary-dark"

                  // className="flex cursor-pointer w-full justify-between relative items-center   border-2 border-gray-300 p-3 uppercase rounded-[7px]! font-medium"
                >
                  {state?.dob ? (
                    <p className="font-bold text-sm"> {convertDate(state.dob)}</p>
                  ) : (
                    <p className="text-gray-500 font-medium">DD/MM/YYYY</p>
                  )}
                  <div className=" flex items-center justify-center w-5 h-5">
                    <img src={calendar} alt="calender" className="w-full h-full" />
                  </div>
                </button>
              </div>
            </CustomCalendar>
            <Input
              id="age"
              label="Age"
              maxLength={3}
              required={true}
              type="text"
              labelClassName="text-black!"
              placeholder="Enter (Number Only)"
              name="age"
              errors={errors?.age}
              className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
              value={state.age === 0 ? "" : state.age}
              onChange={handleChange}
            />
            <Input
              id="email"
              type="email"
              label="Email"
              maxLength={50}
              labelClassName="text-black!"
              placeholder="Enter"
              name="email"
              errors={errors?.email}
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
                    className="border-none h-full custom-no-autofill  focus-within:border-0 font-bold placeholder:font-normal pl-0"
                    value={state.phoneNumber}
                    onChange={handleChange}
                    maxLength={state.phoneNumberCountryCode.value == "+91" ? 10 : 15}
                    id="phoneNumber"
                    // type="text" // Changed from "phone" to "tel" (more appropriate)
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
                  className="border-none w-[80px]!  truncate gap-1 font-semibold"
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
            <div className="flex gap-1 w-full h-fit  items-start flex-col">
              <div className="relative w-full h-full flex items-center">
                <div className="flex gap-1 w-full  items-start flex-col">
                  <p className="block  ml-0.5 text-sm font-medium">Guardian Name</p>
                  <div className="flex w-full items-center border-2 h-fit border-gray-300  rounded-[7px]!  focus-within:border-primary-dark">
                    <Select
                      containerClass="w-fit!"
                      short
                      className="border-none w-[80px]!  truncate gap-1 font-semibold"
                      options={relationShips}
                      optionClassName="w-[130px]!"
                      placeholder="Select"
                      onChange={handleSelect}
                      value={state.guardianNameRelationshipId}
                      name="guardianNameRelationshipId"
                    />
                    <hr className="block mx-2 w-[2px] h-10 bg-gray-200" />

                    <Input
                      id="guardianName"
                      type="text"
                      labelClassName="text-black!"
                      placeholder="Enter"
                      name="guardianName"
                      maxLength={50}
                      className="border-none custom-no-autofill h-full focus-within:border-0 font-bold placeholder:font-normal pl-0"
                      value={state.guardianName}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
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
              label="Full address"
              maxLength={200}
              labelClassName="text-black!"
              placeholder="Enter"
              name="fullAddress"
              className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
              value={state.fullAddress}
              onChange={handleChange}
            />
            <Input
              id="chiefComplaints"
              type="text"
              label="Chief Complaints"
              maxLength={200}
              labelClassName="text-black!"
              placeholder="Enter"
              name="chiefComplaints"
              className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
              value={state.chiefComplaints}
              onChange={handleChange}
            />
            <Select
              label="Illness Type"
              options={[
                { label: "Select", value: "" },
                { label: "Addiction", value: "Addiction" },
                { label: "Mental Disorder", value: "Mental Disorder" },
                { label: "Addiction & Mental Disorder", value: "Addiction & Mental Disorder" }
              ]}
              placeholder="Select"
              onChange={handleSelect}
              value={state.illnessType}
              name="illnessType"
            />
            <div className="w-full">
              <p className="font-medium text-sm  mb-3">Admission Type</p>
              <div className="flex w-fit flex-col gap-2">
                <div className="flex gap-3 items-center">
                  <div className="flex py-3">
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
                  <div
                    className={`w-[228px]  ${
                      state.admissionType === "Involuntary" ? "visible" : "invisible"
                    }`}
                  >
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
                </div>
              </div>
            </div>
          </div>
          <p className="font-bold text-[18px] mb-3 mt-[66px]">Other Details</p>
          <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 mb-7 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
            <Select
              label="Select Center"
              // required
              options={centerDropdown}
              placeholder="Select"
              onChange={handleSelect}
              value={state.centerId}
              name="centerId"
              errors={errors["centerId.value"]}
            />
            <Input
              id="firstPersonContactedAtGanaa"
              type="text"
              label="First Person Contacted at Ganaa"
              maxLength={200}
              labelClassName="text-black!"
              placeholder="Enter"
              name="firstPersonContactedAtGanaa"
              className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
              value={state.firstPersonContactedAtGanaa}
              onChange={handleChange}
            />

            <Select
              label="Assigned To"
              options={allDoctors}
              placeholder="Select"
              onChange={handleSelect}
              value={state.assignedTo}
              name="assignedTo"
            />
            <CustomCalendar
              value={state.nextFollowUpDate}
              onChange={(date) => {
                handleDateTimeChange(date, "nextFollowUpDate");
              }}
            >
              <div className="flex flex-col w-full">
                <label
                  htmlFor="nextFollowUpDate"
                  className="block mb-1.5  ml-0.5 text-sm font-medium"
                >
                  Next Follow up Date
                </label>
                <button
                  id="nextFollowUpDate"
                  className="flex cursor-pointer w-full justify-between relative items-center   border-2 border-gray-300 p-3 uppercase rounded-[7px]! font-medium focus:outline-none focus:border-primary-dark"
                >
                  {state?.nextFollowUpDate ? (
                    <p className="font-bold text-sm"> {convertDate(state.nextFollowUpDate)}</p>
                  ) : (
                    <p className="text-gray-500 font-medium">DD/MM/YYYY</p>
                  )}
                  <div className=" flex items-center justify-center w-5 h-5">
                    <img src={calendar} alt="calender" className="w-full h-full" />
                  </div>
                </button>
              </div>
            </CustomCalendar>

            {id && (
              <CustomCalendar
                value={state.centerVisitDateTime}
                onChange={(date) => {
                  handleDateTimeChange(date, "centerVisitDateTime");
                }}
              >
                <div className="flex flex-col w-full">
                  <label
                    htmlFor="centerVisitDateTime"
                    className="block mb-1.5  ml-0.5 text-sm font-medium"
                  >
                    Center visit date
                  </label>
                  <button
                    id="centerVisitDateTime"
                    className="flex cursor-pointer w-full justify-between relative items-center   border-2 border-gray-300 p-3 uppercase rounded-[7px]! font-medium focus:outline-none focus:border-primary-dark"
                  >
                    {state?.centerVisitDateTime ? (
                      <p className="font-bold text-sm"> {convertDate(state.centerVisitDateTime)}</p>
                    ) : (
                      <p className="text-gray-500 font-medium">DD/MM/YYYY</p>
                    )}
                    <div className=" flex items-center justify-center w-5 h-5">
                      <img src={calendar} alt="calender" className="w-full h-full" />
                    </div>
                  </button>
                </div>
              </CustomCalendar>
            )}
          </div>
          <RichTextEditor
            label="Comments"
            placeholder="Start typing..."
            maxLength={5000}
            value={data.comment || ""}
            onChange={handleChangeQuill}
            name="comment"
          />
          <div className="w-full flex justify-center mt-8">
            <Button
              type="submit"
              name="next"
              disabled={loading}
              className="min-w-[281px]! text-xs! bg-[#323E2A]! py-[10px]! rounded-[20px]!"
              variant="contained"
              size="base"
              onClick={(e) => handleSubmit(e, "Save")}
            >
              Submit {loading && <Loader size="xs" />}
            </Button>
          </div>
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

export default CreateLead;
