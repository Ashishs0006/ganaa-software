import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { RootState } from "@/redux/store/store";

import {
  setHospitalRoomNoDetails,
  setHospitalRoomTypeDetails,
  setHospitalLockerNoDetails,
  setHostpitalDoctor,
  setHostpitalTherapist
} from "@/redux/slice/resourceSlice";
import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";
import { setPatientAdmission } from "@/redux/slice/patientSlice";

import {
  createSinglePatientResources,
  getAllLocker,
  getAllRoomNumber,
  getAllRoomType,
  getAllUser
} from "@/apis";

import { Button, DiscardModal, Input, Loader, Select } from "@/components";

import { IState, ResourceAllocationState } from "@/components/ResourceAllocation/types";
import { ISelectOption } from "@/components/Select/types";

import { capitalizeFirstLetter, formatId } from "@/utils/formater";
import compareObjects from "@/utils/compareObjects";
import handleError from "@/utils/handleError";

import { patientResourceSchema } from "@/validations/Yup/ResourceAllocationValidation";

const ResourceAllocation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const dropdownData = useSelector((store: RootState) => store.dropdown);
  const patientData = useSelector((store: RootState) => store.patient);
  const stepperData = useSelector((store: RootState) => store.stepper);
  const resourcesData = useSelector((store: RootState) => store.resources);

  const [state, setState] = useState<IState>({
    loading: false,
    init: false
  });

  const [data, setData] = useState<ResourceAllocationState>({
    centerId: { value: "", label: "" },
    roomTypeId: { value: "", label: "" },
    roomNumberId: { value: "", label: "" },
    lockerNumberId: { value: "", label: "" },
    belongingsInLocker: "",
    assignedDoctorId: { value: "", label: "" },
    assignedTherapistId: { value: "", label: "" },
    nurse: "",
    careStaff: ""
  });

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (patientData.patientAdmission._id) {
      setData((prevState) => ({
        ...prevState,
        centerId: patientData.patientAdmission?.centerId || prevState.centerId,
        roomTypeId: patientData.patientAdmission?.roomTypeId || prevState.roomTypeId,
        roomNumberId: patientData.patientAdmission?.roomNumberId || prevState.roomNumberId,
        lockerNumberId: patientData.patientAdmission?.lockerNumberId || prevState.lockerNumberId,
        belongingsInLocker:
          patientData.patientAdmission?.belongingsInLocker || prevState.belongingsInLocker,
        nurse: patientData.patientAdmission?.nurse || prevState.careStaff,
        careStaff: patientData.patientAdmission?.careStaff || prevState.careStaff,
        assignedDoctorId:
          patientData.patientAdmission?.assignedDoctorId || prevState.assignedDoctorId,
        assignedTherapistId:
          patientData.patientAdmission?.assignedTherapistId || prevState.assignedTherapistId
      }));
      setTimeout(() => {
        setState((prevState) => ({
          ...prevState,
          init: true
        }));
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRoomNoData = async (id: string | number, init: boolean) => {
    try {
      if (init) {
        setData((prev) => ({
          ...prev,
          roomNumberId: { label: "", value: "" }
        }));
      }

      const { data } = await getAllRoomNumber({ roomTypeId: id, sort: "name" });
      dispatch(setHospitalRoomNoDetails(data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!data.roomTypeId.value) return;
    fetchRoomNoData(data.roomTypeId.value, state.init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.roomTypeId.value]);

  const fetchRoomTypeData = async (id: string | number, init: boolean) => {
    try {
      if (init) {
        setData((prev) => ({
          ...prev,
          roomTypeId: { label: "", value: "" },
          roomNumberId: { label: "", value: "" },
          lockerNumberId: { label: "", value: "" }
        }));
      }

      const { data } = await getAllRoomType({ centerId: id, sort: "order" });
      dispatch(setHospitalRoomTypeDetails(data.data));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchLockerData = async (id: string | number, init: boolean) => {
    try {
      if (init) {
        setData((prev) => ({
          ...prev,
          lockerNumberId: { label: "", value: "" }
        }));
      }
      const { data } = await getAllLocker({ centerId: id, sort: "name" });
      dispatch(setHospitalLockerNoDetails(data.data));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchDoctorData = async (id: string | number, init: boolean) => {
    try {
      if (init) {
        setData((prev) => ({
          ...prev,
          assignedDoctorId: { label: "", value: "" }
        }));
      }

      const { data } = await getAllUser({
        roles: "doctor",
        centerId: id,
        sort: "firstName"
      });
      dispatch(setHostpitalDoctor(data.data));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchTherapistData = async (id: string | number, init: boolean) => {
    try {
      if (init) {
        setData((prev) => ({
          ...prev,
          assignedTherapistId: { label: "", value: "" }
        }));
      }

      const { data } = await getAllUser({
        roles: "therapist,Therapist+AM",
        centerId: id,
        sort: "firstName"
      });
      dispatch(setHostpitalTherapist(data.data));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!data.centerId.value) return;
    fetchRoomTypeData(data.centerId.value, state.init);
    fetchLockerData(data.centerId.value, state.init);
    fetchDoctorData(data.centerId.value, state.init);
    fetchTherapistData(data.centerId.value, state.init);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.centerId.value]);

  const updatePatientResourceData = async (pid: string, aid: string) => {
    const updatedPatientData = compareObjects(patientData.patientAdmission, data, true);

    const requiredKeys = [
      "centerId",
      "roomTypeId",
      "roomNumberId",
      "lockerNumberId",
      "belongingsInLocker",
      "assignedDoctorId",
      "assignedTherapistId",
      "nurse",
      "careStaff"
    ];

    const relevantKeysChanged = requiredKeys.some((key) => key in updatedPatientData);
    if (!relevantKeysChanged) return;

    // 3. Build payload
    const payload: Record<string, string> = {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractValue = (val: any) => {
      if (val && typeof val === "object" && "value" in val) return val.value;
      return val;
    };

    Object.keys(data).forEach((key) => {
      const val = extractValue(data[key as keyof typeof data]);
      if (val !== "" && val !== null && val !== undefined) {
        payload[key] = String(val);
      }
    });

    // 4. Submit
    return createSinglePatientResources(payload, pid, aid);
  };

  const centerDropdown = useMemo<ISelectOption[]>(() => {
    const centerList = dropdownData?.center?.data ?? [];
    return centerList.map(({ centerName, _id }) => ({
      label: centerName,
      value: _id
    }));
  }, [dropdownData?.center?.data]);

  const roomTypeDropdown = useMemo<ISelectOption[]>(() => {
    const roomtypeList = resourcesData?.hostpitalRoomType?.data ?? [];
    return roomtypeList.map(({ _id, name }) => ({
      label: name,
      value: _id
    }));
  }, [resourcesData?.hostpitalRoomType?.data]);

  const roomNoDropdown = useMemo<ISelectOption[]>(() => {
    const roomNo = resourcesData?.hostpitalRoomNo?.data ?? [];
    return roomNo.map(({ _id, name, availableBeds }) => ({
      label: `${name} `,
      subLabel: ` (${availableBeds} ${availableBeds <= 1 ? "Bed" : "Beds"} Available) `,
      value: _id
    }));
  }, [resourcesData?.hostpitalRoomNo?.data]);

  const lockerDropdown = useMemo<ISelectOption[]>(() => {
    const lockerNoList = resourcesData?.hostpitalLockerNo?.data ?? [];
    return lockerNoList.map((value) => ({
      label: value.name,
      value: value._id
    }));
  }, [resourcesData?.hostpitalLockerNo?.data]);

  const doctorDropdown = useMemo<ISelectOption[]>(() => {
    const doctorList = resourcesData?.hostpitalDoctor?.data ?? [];
    return doctorList.map(({ firstName, lastName, _id }) => ({
      label: `${firstName} ${lastName}`,
      value: _id
    }));
  }, [resourcesData?.hostpitalDoctor?.data]);

  const therapistDropdown = useMemo<ISelectOption[]>(() => {
    const therapistList = resourcesData?.hostpitalTherapist?.data ?? [];
    return therapistList.map(({ firstName, lastName, _id }) => ({
      label: `${firstName} ${lastName}`,
      value: _id
    }));
  }, [resourcesData?.hostpitalTherapist?.data]);

  const handleChange = useCallback(
    (e: SyntheticEvent) => {
      const { name, value } = e.target as HTMLInputElement;
      setData((prev) => ({ ...prev, [name]: value }));
      if (!stepperData.discardModal.isFormChanged)
        dispatch(setDiscardModal({ isFormChanged: true }));
    },
    [dispatch, stepperData.discardModal.isFormChanged]
  );

  const handleSelect = (key: string, value: ISelectOption) => {
    setData((prev) => ({ ...prev, [key]: value }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleSubmit = async (
    _e: SyntheticEvent,
    btnType: "SAVE" | "SAVE_AND_NEXT" | "SAVE_AND_NEXT_DISCARD"
  ) => {
    dispatch(setDiscardModal({ isDiscardModalOpen: false }));

    setState((prev) => ({ ...prev, loading: true }));
    try {
      await patientResourceSchema.validate(data, { abortEarly: false });
      setErrors({});

      if (patientData.patientAdmission._id && patientData.patientAdmission?.patientId) {
        const admissionReponse = await updatePatientResourceData(
          patientData.patientAdmission?.patientId,
          patientData.patientAdmission._id
        );
        if (admissionReponse && admissionReponse.data.status === "success") {
          const {
            centerId,
            roomNumberId,
            roomTypeId,
            assignedDoctorId,
            assignedTherapistId,
            belongingsInLocker,
            lockerNumberId,
            nurse,
            careStaff
          } = data;
          dispatch(
            setPatientAdmission({
              ...patientData.patientAdmission,
              centerId,
              roomNumberId,
              roomTypeId,
              assignedDoctorId,
              assignedTherapistId,
              belongingsInLocker,
              lockerNumberId,
              nurse,
              careStaff
            })
          );
          setState((prev) => ({ ...prev, loading: false }));
        }
        setState((prev) => ({ ...prev, loading: false }));
      }

      if (btnType === "SAVE_AND_NEXT") {
        dispatch(setStepper({ step: 3, tab: 3 }));
        toast.success("Resource Allocation save successfully");
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
        toast.success("Resource Allocation save successfully");
      } else {
        toast.success("Resource Allocation save successfully");
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
  return (
    <div id="resourceAllcation" className="w-full h-full mt-8">
      <p className="font-bold text-[15px] mb-4">Patient Details</p>
      <div className="pt-4 pb-[31px] px-6 h-full flex items-start justify-between lg:gap-60 rounded-xl w-fit bg-[#F7F8F5]">
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
                <span className="text-xs font-semibold ml-1">
                  {patientData?.patientDetails?.gender}
                </span>
              </p>
            </div>
            <p className="text-xs font-medium">
              Mobile No:
              <span className="text-xs ml-1 font-semibold">
                {patientData?.patientDetails?.phoneNumberCountryCode?.value}{" "}
                {patientData?.patientDetails?.phoneNumber}
              </span>
            </p>
          </div>
        </div>

        <div className="min-h-full">
          <div className="flex justify-between gap-14 items-end flex-col min-h-full">
            <p className="text-xs text-[#474747] font-medium">
              UHID:
              <span className="ml-1 font-semibold">
                {formatId(patientData?.patientDetails?.uhid)}
              </span>
            </p>
            <p
              className="underline  cursor-pointer font-bold text-xs  text-[#575F4A]"
              onClick={() => dispatch(setStepper({ step: 1, tab: 1 }))}
            >
              Edit
            </p>
          </div>
        </div>
      </div>

      <p className="font-bold text-[15px] mt-20 mb-5">Assign Resources</p>
      <div>
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 gap-x-[70px] gap-y-[38px]">
          <Select
            label="Center"
            className=" border-[#DEDEDE]!"
            required
            options={centerDropdown}
            placeholder="Select"
            onChange={handleSelect}
            value={data.centerId}
            name="centerId"
            errors={errors["centerId.value"]}
          />
          <Select
            label="Room Type"
            className=" border-[#DEDEDE]!"
            required
            options={roomTypeDropdown}
            placeholder="Select"
            onChange={handleSelect}
            value={data.roomTypeId}
            name="roomTypeId"
            errors={errors["roomTypeId.value"]}
          />
          <Select
            label="Room No."
            className=" border-[#DEDEDE]!"
            required
            // subLabelClassName="bg-red-400 py-0.5 px-1.5 rounded-sm font-normal text-white "
            options={roomNoDropdown}
            placeholder="Select Available Room"
            onChange={handleSelect}
            value={data.roomNumberId}
            name="roomNumberId"
            errors={errors["roomNumberId.value"]}
          />
          <Select
            label="Locker No."
            className=" border-[#DEDEDE]!"
            // disable
            required
            options={lockerDropdown}
            placeholder="Select No."
            onChange={handleSelect}
            value={data.lockerNumberId}
            name="lockerNumberId"
            errors={errors["lockerNumberId.value"]}
          />
          <Input
            id="belongingsInLocker"
            type="text"
            required
            maxLength={400}
            labelClassName="text-black!"
            label="Belongings In Locker"
            placeholder="Enter"
            name="belongingsInLocker"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={data.belongingsInLocker}
            errors={errors["belongingsInLocker"]}
            onChange={handleChange}
          />
          <Select
            label="Doctor"
            className=" border-[#DEDEDE]!"
            options={doctorDropdown}
            placeholder="Select Dr."
            onChange={handleSelect}
            value={data.assignedDoctorId}
            name="assignedDoctorId"
          />
          <Select
            label="Therapist"
            className=" border-[#DEDEDE]!"
            options={therapistDropdown}
            placeholder="Select"
            onChange={handleSelect}
            value={data.assignedTherapistId}
            name="assignedTherapistId"
          />
          <Input
            id="nurse"
            type="text"
            maxLength={400}
            labelClassName="text-black!"
            label="Nurse"
            placeholder="Enter"
            name="nurse"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={data.nurse}
            onChange={handleChange}
          />{" "}
          <Input
            id="careStaff"
            type="text"
            maxLength={400}
            labelClassName="text-black!"
            label="Care Staff"
            placeholder="Enter"
            name="careStaff"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={data.careStaff}
            onChange={handleChange}
          />
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
    </div>
  );
};

export default ResourceAllocation;
