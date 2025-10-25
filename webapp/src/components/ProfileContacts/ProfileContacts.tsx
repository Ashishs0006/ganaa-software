import { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { MdDelete } from "react-icons/md";
import { RootState } from "@/redux/store/store";
import { setPatientDetails } from "@/redux/slice/patientSlice";
import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";
import {
  updatePatient,
  createPatientFamily,
  getPatientFamily,
  UpdatePatientFamilyDetail,
  deletePatientFamilyDetail
} from "@/apis";

import {
  Button,
  CheckBox,
  DeleteConfirm,
  DiscardModal,
  DropDown,
  Input,
  Loader,
  Select
} from "@/components";

import { IFamilyData, ProfileContactsState } from "@/components/ProfileContacts/types";
import { ISelectOption } from "@/components/Select/types";

import compareObjects from "@/utils/compareObjects";
import handleError from "@/utils/handleError";
import { ProfileContactValidation } from "@/validations/Yup/ProfileContactValidation";

const ProfileContacts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [state, setState] = useState<ProfileContactsState>({
    loading: false,
    education: "",
    placeOfStay: "",
    familyIncome: "",
    religion: "",
    language: "",
    isMarried: null,
    numberOfChildren: { value: 0, label: 0 },
    occupation: ""
  });

  const [newFamilyDetails, setNewFamilyDetails] = useState<IFamilyData[]>([]);

  const [existingFamilyDetails, setExistingFamilyDetails] = useState<IFamilyData[]>([]);
  const [initialFamilyDetails, setInitialFamilyDetails] = useState<IFamilyData[]>([]);

  const patientData = useSelector((store: RootState) => store.patient);
  const stepperData = useSelector((store: RootState) => store.stepper);

  const dropdownData = useSelector((store: RootState) => store.dropdown);

  const phonecode = useMemo<ISelectOption[]>(() => {
    if (dropdownData.country.loading) return [];
    const countryList = [{ label: "+91", value: "+91" }];
    dropdownData.country.data.forEach((country) => {
      countryList.push({ label: country.phoneCode, value: country.phoneCode });
    });

    return countryList;
  }, [dropdownData.country.data, dropdownData.country.loading]);

  const relationShips = useMemo<ISelectOption[]>(() => {
    if (dropdownData.relationships.loading) return [];
    const relationshipList = [{ label: "Select", value: "" }];
    dropdownData.relationships.data.forEach((value) => {
      relationshipList.push({ label: value.fullName, value: value._id });
    });

    return relationshipList;
  }, [dropdownData.relationships.data, dropdownData.relationships.loading]);

  const numberofChildren = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((relation) => {
      return {
        label: relation,
        value: relation
      };
    });
  }, []);

  const [deleteModal, setDeleteModal] = useState<{ isModal: boolean; id?: number }>({
    isModal: false
  });

  const [deleteModalExisting, setDeleteModalExisting] = useState<{
    isModal: boolean;
    id?: string;
    pid?: string;
  }>({
    isModal: false
  });

  const [newFamilyErrors, setNewFamilyErrors] = useState<Record<number, string>>({});
  const [newFamilyAgeErrors, setNewFamilyAgeErrors] = useState<Record<number, string>>({});
  const [existingFamilyErrors, setExistingFamilyErrors] = useState<Record<number, string>>({});
  const [existingFamilyAgeErrors, setExistingFamilyAgeErrors] = useState<Record<number, string>>(
    {}
  );

  const toggleModalDelete = (id?: number) => {
    setDeleteModal((prev) => ({
      isModal: !prev.isModal,
      id: id
    }));
  };
  const toggleModalDeleteExisting = (id?: string, pid?: string) => {
    setDeleteModalExisting((prev) => ({
      isModal: !prev.isModal,
      id: id,
      pid: pid
    }));
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const fetchPatientFamily = async (id: string) => {
    try {
      if (id) {
        const response = await getPatientFamily(id, {
          sort: "createdAt"
        });
        if (response?.data?.data?.length > 0) {
          setExistingFamilyDetails(response?.data?.data);
          setInitialFamilyDetails(response?.data?.data);
        } else {
          setNewFamilyDetails([
            {
              tempId: "",
              relationship: { label: "Select", value: "" },
              name: "",
              phoneNumberCountryCode: { label: "+91", value: "+91" },
              phoneNumber: "",
              age: "",
              address: "",
              idProffType: { label: "Select", value: "" },
              idProffNumber: "",
              infoType: [],
              file: null,
              button: true
            }
          ]);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (patientData.patientDetails._id) {
      setState((prevState) => ({
        ...prevState,
        education: patientData.patientDetails?.education || prevState.education,
        familyIncome: patientData.patientDetails?.familyIncome || prevState.familyIncome,
        religion: patientData.patientDetails?.religion || prevState.religion,
        language: patientData.patientDetails?.language || prevState.language,
        isMarried: patientData?.patientDetails?.isMarried ?? prevState.isMarried,
        numberOfChildren:
          patientData.patientDetails?.numberOfChildren || prevState.numberOfChildren,
        occupation: patientData.patientDetails?.occupation || prevState.occupation
      }));
      fetchPatientFamily(patientData.patientDetails._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = useCallback(
    (e: SyntheticEvent) => {
      const { name, value } = e.target as HTMLInputElement;
      setState((prev) => ({ ...prev, [name]: value }));
      if (!stepperData.discardModal.isFormChanged)
        dispatch(setDiscardModal({ isFormChanged: true }));
    },
    [dispatch, stepperData.discardModal.isFormChanged]
  );

  const handleClickMartialStatus = useCallback(
    (e: SyntheticEvent, status: boolean) => {
      const { name } = e.target as HTMLInputElement;
      setState((prev) => ({ ...prev, [name]: status }));
      if (!stepperData.discardModal.isFormChanged)
        dispatch(setDiscardModal({ isFormChanged: true }));
    },
    [dispatch, stepperData.discardModal.isFormChanged]
  );

  const updatePatientData = (pid: string) => {
    const formData = new FormData();

    const updatedData = compareObjects(
      patientData.patientDetails,
      {
        ...state
      },
      true
    );

    const requiredKeys = [
      "education",
      "familyIncome",
      "religion",
      "language",
      "isMarried",
      "numberOfChildren",
      "occupation"
    ];

    const relevantKeysChanged = requiredKeys.some((key) => key in updatedData);
    if (!relevantKeysChanged) {
      return;
    }

    if (updatedData.education !== undefined) formData.append("education", updatedData.education);
    if (updatedData.familyIncome !== undefined)
      formData.append("familyIncome", updatedData.familyIncome);
    if (updatedData.religion !== undefined) formData.append("religion", updatedData.religion);
    if (updatedData.language !== undefined) formData.append("language", updatedData.language);

    if (updatedData.isMarried !== undefined && updatedData.isMarried !== null) {
      formData.append("isMarried", updatedData.isMarried.toString());
    }

    if (updatedData.numberOfChildren?.value !== undefined) {
      formData.append("numberOfChildren", updatedData.numberOfChildren.value.toString());
    }

    if (updatedData.occupation !== undefined) {
      formData.append("occupation", updatedData.occupation);
    }

    return updatePatient(formData, pid);
  };

  const hasDataChanged = (initialData: IFamilyData[], updatedData: IFamilyData[]) => {
    return JSON.stringify(initialData) !== JSON.stringify(updatedData);
  };

  const handleUpdate = async (id: string) => {
    if (hasDataChanged(initialFamilyDetails, existingFamilyDetails)) {
      const invalidIndexes: number[] = [];
      const invalidAgeIndexes: number[] = [];
      existingFamilyDetails.forEach((member, index) => {
        if (!member?.relationship && !member?.relationshipId) {
          invalidIndexes.push(index);
        } else if (member.relationship?.value == "") {
          invalidIndexes.push(index);
        }
        if (member.age && +member.age > 120) {
          invalidAgeIndexes.push(index);
        }
      });

      if (invalidAgeIndexes.length > 0) {
        const errorMap: Record<number, string> = {};
        invalidAgeIndexes.forEach((i) => {
          errorMap[i] = "Age is not greater then 120";
        });
        setExistingFamilyAgeErrors(errorMap);
        return { ageExist: false, invalidAgeIndexes };
      }

      if (invalidIndexes.length > 0) {
        const errorMap: Record<number, string> = {};
        invalidIndexes.forEach((i) => {
          errorMap[i] = "Relationship is required";
        });
        setExistingFamilyErrors(errorMap);
        return { relationshipExist: false, invalidIndexes };
      }

      setExistingFamilyErrors({});
      setExistingFamilyAgeErrors({});

      const formData = new FormData();
      const jsonString = JSON.stringify(
        existingFamilyDetails.map((ele) => {
          const member = JSON.parse(JSON.stringify(ele));
          if (member.relationship) {
            member["relationshipId"] = member.relationship.value; // Take only the value
          }
          if (member.phoneNumberCountryCode) {
            member.phoneNumberCountryCode = member.phoneNumberCountryCode.value; // Take only the value
          }
          if (member.idProffType) {
            member.idProffType = member.idProffType.value; // Take only the value
          }
          if (member.file == null) {
            member.idProof = "";
          }
          if (!member.name.trim() || !member?.relationship?.value) {
            delete member["relationshipId"];
          }
          delete member.file;
          return member;
        })
      );

      formData.append("patientFamilyDetails", jsonString);

      existingFamilyDetails.forEach((member) => {
        if (member.file) formData.append(`idProff_${member.tempId}`, member.file);
      });

      const response = await UpdatePatientFamilyDetail(id, formData);
      setInitialFamilyDetails(existingFamilyDetails);
      return response;
    } else {
      console.log("No changes detected. No API call made.");
    }
  };

  const handleCreate = async (id: string) => {
    const filteredFamilyDetails = newFamilyDetails.filter(
      (member) =>
        member.name || member.phoneNumber || member.age || member.address || member.idProffNumber
    );

    if (filteredFamilyDetails.length > 0) {
      const invalidIndexes: number[] = [];
      const invalidAgeIndexes: number[] = [];

      filteredFamilyDetails.forEach((member, index) => {
        if (member.relationship?.value === "") {
          invalidIndexes.push(index);
        }
        if (member.age && +member.age > 120) {
          invalidAgeIndexes.push(index);
        }
      });

      if (invalidIndexes.length > 0) {
        const errorMap: Record<number, string> = {};
        invalidIndexes.forEach((i) => {
          errorMap[i] = "Relationship is required";
        });
        setNewFamilyErrors(errorMap); // ✅ Set state with errors
        return { relationshipExist: false, invalidIndexes };
      }
      if (invalidAgeIndexes.length > 0) {
        const errorMap: Record<number, string> = {};
        invalidAgeIndexes.forEach((i) => {
          errorMap[i] = "Age is not greater then 120";
        });
        setNewFamilyAgeErrors(errorMap); // ✅ Set state with errors
        return { ageExist: false, invalidAgeIndexes };
      }

      setNewFamilyErrors({});
      setNewFamilyAgeErrors({});
      const formData = new FormData();

      const jsonString = JSON.stringify(
        filteredFamilyDetails.map((ele) => {
          // Deep copy the member object
          const member = JSON.parse(JSON.stringify(ele));
          if (member.relationship) {
            member["relationshipId"] = member.relationship.value; // Take only the value
          }
          if (member.phoneNumberCountryCode) {
            member.phoneNumberCountryCode = member.phoneNumberCountryCode.value; // Take only the value
          }
          if (member.idProffType) {
            member.idProffType = member.idProffType.value; // Take only the value
          }
          if (!member.name.trim() || !member?.relationship?.value) {
            delete member["relationshipId"];
          }
          // Remove the file from the JSON version of the object (it will be appended separately)
          delete member.file;
          return member;
        })
      );
      // Append the family details to formData
      formData.append("patientFamilyDetails", jsonString);

      // Append the file for each member if it exists
      filteredFamilyDetails.forEach((member) => {
        if (member.file) formData.append(`idProff_${member.tempId}`, member.file);
      });

      // Send the formData
      if (patientData.patientDetails._id) {
        const response = await createPatientFamily(id, formData);
        if (String(response.data.status) == "success") {
          await fetchPatientFamily(patientData.patientDetails._id);
          setNewFamilyDetails([]);
        }

        return response;
      }
    }
  };

  const handleSubmit = async (
    e: SyntheticEvent,
    btnType: "SAVE" | "SAVE_AND_NEXT" | "SAVE_AND_NEXT_DISCARD"
  ) => {
    e.preventDefault();
    dispatch(setDiscardModal({ isDiscardModalOpen: false }));
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const invalidMember = existingFamilyDetails.find(
        (member) =>
          (!member.infoType || member.infoType.length === 0) &&
          member.name &&
          member.name.trim() !== ""
      );

      const invalidnewMember = newFamilyDetails.find(
        (member) =>
          (!member.infoType || member.infoType.length === 0) &&
          member.name &&
          member.name.trim() !== ""
      );

      if (invalidMember || invalidnewMember) {
        throw new Error("One or more members have missing type of family details");
        // Early return to stop further processing
      }
      await ProfileContactValidation.validate(state, { abortEarly: false });
      if (patientData.patientDetails._id) {
        const admissionReponse = await updatePatientData(patientData.patientDetails._id);
        const response = await handleCreate(patientData.patientDetails._id);
        if (response && "relationshipExist" in response) {
          throw new Error("");
        }
        if (response && "ageExist" in response) {
          throw new Error("");
        }
        const responseExisting = await handleUpdate(patientData.patientDetails._id);
        if (responseExisting && "relationshipExist" in responseExisting) {
          throw new Error("");
        }
        if (responseExisting && "ageExist" in responseExisting) {
          throw new Error("");
        }
        if (admissionReponse && admissionReponse.data.status === "success") {
          const {
            education,
            familyIncome,
            religion,
            language,
            isMarried,
            numberOfChildren,
            occupation
          } = state;
          dispatch(
            setPatientDetails({
              ...patientData.patientDetails,
              education,
              familyIncome,
              religion,
              language,
              isMarried,
              numberOfChildren,
              occupation
            })
          );
          setState((prev) => ({ ...prev, loading: false }));
        }
        setState((prev) => ({ ...prev, loading: false }));
      }

      if (btnType === "SAVE_AND_NEXT") {
        dispatch(setStepper({ step: 1, tab: 3 }));
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
              navigate(discardLocation);
            } else {
              navigate(-1);
            }
          }
        }, 500);
      }
      toast.success("Profile & Contacts data save successfully");
      setState((prev) => ({ ...prev, loading: false }));
      dispatch(setDiscardModal({ isFormChanged: false }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));

      handleError(err);
    }
  };

  const removeNewFamilyDetails = () => {
    const value = newFamilyDetails.filter((_, i) => i !== deleteModal.id);
    setNewFamilyDetails(value);
    setDeleteModal({ isModal: false });
  };

  const handleDeleteExistingFamilyDetails = async () => {
    if (deleteModalExisting.id === undefined || deleteModalExisting.pid === undefined) return;
    try {
      const response = await deletePatientFamilyDetail(
        deleteModalExisting.pid,
        deleteModalExisting.id
      );
      if (String(response?.data.status) === "success") {
        setExistingFamilyDetails((prevDetails) =>
          prevDetails.filter((value) => value._id !== deleteModalExisting.id)
        );
        toast.success("Family member deleted successfully");
      } else {
        console.log("Unable to Delete");
      }
      setDeleteModalExisting({ isModal: false });
    } catch (err) {
      console.log(err);
    }
  };

  const addNewFamilyDetails = () => {
    if (newFamilyDetails.length >= 10) {
      toast.error("You can only add up to 10.");
      return;
    }
    if (newFamilyDetails.length < 10) {
      setNewFamilyDetails([
        ...newFamilyDetails,
        {
          tempId: "",
          relationship: { label: "Select", value: "" },
          name: "",
          phoneNumberCountryCode: { label: "+91", value: "+91" },
          phoneNumber: "",
          age: "",
          address: "",
          idProffType: { label: "Select", value: "" },
          idProffNumber: "",
          infoType: [],
          file: null
        }
      ]);
    }
  };

  const handleSelect = (key: string, value: ISelectOption) => {
    setState((prev) => ({ ...prev, [key]: value }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleSelectFamily = (index: number, key: string, value: ISelectOption) => {
    setNewFamilyDetails((prevDetails) =>
      prevDetails.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail))
    );
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const updateFamilyDetail = (
    index: number,
    key: keyof (typeof newFamilyDetails)[0],
    value: string | string[]
  ) => {
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    const isNumeric = (value: number | string | symbol) => {
      return value === "" || /^\d+$/.test(value.toString());
    };
    const numberFieldsName = ["age", "phoneNumber"];
    const stringFieldsName = ["name"];
    if (numberFieldsName.includes(key)) {
      if (isNumeric(+value)) {
        setNewFamilyDetails((prevDetails) =>
          prevDetails.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail))
        );
      }
    } else if (stringFieldsName.includes(key)) {
      if (/^[A-Za-z\s]*$/.test(value.toString())) {
        setNewFamilyDetails((prevDetails) =>
          prevDetails.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail))
        );
      }
    } else {
      setNewFamilyDetails((prevDetails) =>
        prevDetails.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail))
      );
    }
  };

  const handleDropFiles = useCallback((files: File[], index: number) => {
    const maxSize = 5 * 1024 * 1024;
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    try {
      if (files[0].size > maxSize) {
        throw new Error("File size exceeds 5 MB limit.");
      }
    } catch (error) {
      handleError(error);
    }
    if (files[0].size < maxSize) {
      setNewFamilyDetails((prevDetails) =>
        prevDetails.map((detail, i) =>
          i === index ? { ...detail, tempId: String(index), file: files[0] } : detail
        )
      );
    }
  }, []);

  const handleDeleteFiles = useCallback((index: number, type?: string) => {
    if (!stepperData.discardModal.isFormChanged) {
      dispatch(setDiscardModal({ isFormChanged: true }));
    }
    if (type === "old") {
      setExistingFamilyDetails((prevDetails) =>
        prevDetails.map((detail, i) =>
          i === index ? { ...detail, file: null, idProofUrl: "" } : detail
        )
      );
    } else {
      setNewFamilyDetails((prevDetails) =>
        prevDetails.map((detail, i) => (i === index ? { ...detail, file: null } : detail))
      );
    }
  }, []);

  const handleSelectExistingFamily = (index: number, key: string, value: ISelectOption) => {
    setExistingFamilyDetails((prevDetails) =>
      prevDetails.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail))
    );
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const updateExistingFamilyDetail = (
    index: number,
    key: keyof (typeof newFamilyDetails)[0],
    value: string | string[]
  ) => {
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    const isNumeric = (value: number | string | symbol) => {
      return value === "" || /^\d+$/.test(value.toString());
    };
    const numberFieldsName = ["age", "phoneNumber"];
    const stringFieldsName = ["name"];

    if (numberFieldsName.includes(key)) {
      if (isNumeric(+value)) {
        setExistingFamilyDetails((prevDetails) =>
          prevDetails.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail))
        );
      }
    } else if (stringFieldsName.includes(key)) {
      if (/^[A-Za-z\s]*$/.test(value.toString())) {
        setExistingFamilyDetails((prevDetails) =>
          prevDetails.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail))
        );
      }
    } else {
      setExistingFamilyDetails((prevDetails) =>
        prevDetails.map((detail, i) => (i === index ? { ...detail, [key]: value } : detail))
      );
    }
  };

  const handleDropFilesExistingFamily = useCallback((files: File[], index: number) => {
    const maxSize = 5 * 1024 * 1024;
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    try {
      if (files[0].size > maxSize) {
        throw new Error("File size exceeds 5 MB limit.");
      }
    } catch (error) {
      handleError(error);
    }
    if (files[0].size < maxSize) {
      setExistingFamilyDetails((prevDetails) =>
        prevDetails.map((detail, i) =>
          i === index
            ? { ...detail, tempId: String(index), file: files[0], idProofUrl: "" }
            : detail
        )
      );
    }
  }, []);

  const handleSelectRelation = (data: string, index: number) => {
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    setExistingFamilyDetails((prevDetails) =>
      prevDetails.map((detail, i) =>
        i === index
          ? {
              ...detail,
              infoType: detail.infoType.includes(data)
                ? detail.infoType.filter((item) => item !== data) // Remove if exists
                : [...detail.infoType, data] // Add if not exist
            }
          : detail
      )
    );
  };

  return (
    <div id="Profile&Contacts">
      <div
        className="w-full mt-8"
        // onSubmit={(e) => e.preventDefault()}
        // noValidate
        // autoComplete="off"
      >
        <p className="font-bold text-[18px] mb-3">Education & Personal Details</p>
        <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
          <Input
            id="education"
            labelClassName="text-black!"
            label="Education"
            placeholder="Enter"
            name="education"
            maxLength={50}
            className="w-[228px]  rounded-[7px]! font-bold placeholder:font-normal"
            value={state.education}
            onChange={handleChange}
          />
          <Input
            id="familyIncome"
            label="Family Income"
            placeholder="Enter"
            maxLength={50}
            name="familyIncome"
            labelClassName="text-black!"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={state.familyIncome}
            onChange={handleChange}
          />
          <Input
            id="religion"
            label="Religion"
            type="text"
            labelClassName="text-black!"
            placeholder="Enter"
            name="religion"
            maxLength={50}
            className="w-[228px]  rounded-[7px]! font-bold placeholder:font-normal"
            value={state.religion}
            onChange={handleChange}
          />
          <Input
            id="language"
            type="text"
            maxLength={50}
            label="Language"
            placeholder="Enter"
            name="language"
            labelClassName="text-black!"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={state.language}
            onChange={handleChange}
          />
          <div className="flex gap-5 w-full items-start flex-col">
            <p className="text-sm font-medium">Married</p>
            <div className="flex">
              <div className="flex items-center me-4">
                <div className="relative flex items-center">
                  <Input
                    id="unMarried"
                    type="radio"
                    onClick={(e) => handleClickMartialStatus(e, false)}
                    checked={state.isMarried === false}
                    name="isMarried"
                    containerClass="hidden!"
                  />
                  <label
                    htmlFor="unMarried"
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                      state.isMarried === false ? " border-[#586B3A]!" : "border-[#586B3A]"
                    }`}
                  >
                    {state.isMarried === false && (
                      <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                    )}
                  </label>
                </div>

                <label htmlFor="unMarried" className="ms-2 text-sm font-medium">
                  No
                </label>
              </div>
              <div className="flex items-center me-4">
                <div className="relative flex items-center">
                  <Input
                    id="isMarried"
                    type="radio"
                    onClick={(e) => handleClickMartialStatus(e, true)}
                    checked={state.isMarried === true}
                    name="isMarried"
                    containerClass="hidden!"
                  />
                  <label
                    htmlFor="isMarried"
                    className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                      state.isMarried === true ? " border-[#586B3A]!" : "border-[#586B3A]"
                    }`}
                  >
                    {state.isMarried === true && (
                      <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                    )}
                  </label>
                </div>

                <label htmlFor="isMarried" className="ms-2 text-sm font-medium">
                  Yes
                </label>
              </div>
            </div>
          </div>

          <Select
            label="Number Of Children"
            options={numberofChildren}
            placeholder="Select"
            className=" border-[#DEDEDE]!"
            value={state.numberOfChildren}
            onChange={handleSelect}
            name={"numberOfChildren"}
          />

          <Input
            id="occupation"
            type="text"
            label="Occupation"
            placeholder="Enter"
            name="occupation"
            maxLength={100}
            labelClassName="text-black!"
            className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
            value={state.occupation}
            onChange={handleChange}
          />
        </div>
        <hr className="mt-12 mb-4" />
        <DropDown
          childClass="px-0!"
          heading="Family Details"
          hr={false}
          pClass="font-bold! text-[18px]!"
          dropClass="px-0!"
          className="rounded-none!   shadow-none!"
        >
          {existingFamilyDetails.length > 0 &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            existingFamilyDetails.map((value: any, index: number) => (
              <div key={index} className="w-full ">
                <div className="flex w-full mb-5 gap-10 md:flex-wrap lg:flex-nowrap justify-between items-center">
                  <div className="flex gap-4 md:w-[50%] md:flex-wrap lg:flex-nowrap lg:w-full">
                    {["Guardian", "Emergency Contact", "Nominated Representative", "Payer"].map(
                      (data) => (
                        <div className="flex w-fit items-center justify-start gap-2">
                          <Input
                            type="checkbox"
                            onChange={() => handleSelectRelation(data, index)}
                            name={data}
                            checked={value.infoType.includes(data)}
                            className="accent-[#323E2A] w-4! h-4!"
                          />
                          <label
                            htmlFor={data}
                            className="whitespace-nowrap text-[13px] font-medium"
                          >
                            {data}
                          </label>
                        </div>
                      )
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      toggleModalDeleteExisting(value._id ?? "", value.patientId ?? "");
                    }}
                    type="button"
                    variant="outlined"
                    className="rounded-xl! text-xs! hover:bg-gray-300 px-2!  font-semibold border-0!"
                  >
                    <MdDelete className="text-xl  text-red-600" />
                  </Button>
                </div>
                <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
                  <div className="flex gap-1 w-full  items-start flex-col">
                    <div className="relative w-full h-full flex items-center">
                      <div className="flex gap-1 w-full  items-start flex-col">
                        <p className="block  ml-0.5 text-sm font-medium">Name</p>
                        <div
                          className={`flex w-full items-center border-2 h-fit ${
                            existingFamilyErrors[index] ? "border-red-600" : "border-gray-300"
                          }  rounded-[7px]!  focus-within:border-primary-dark`}
                        >
                          <Select
                            containerClass="w-fit!"
                            className="border-none w-[80px]!  truncate gap-1 font-semibold"
                            options={relationShips}
                            optionClassName="w-[130px]!"
                            placeholder="Select"
                            onChange={(_e, data) =>
                              handleSelectExistingFamily(index, "relationship", data)
                            }
                            // value={{
                            //   label: value?.relationshipId.shortName || "Select",
                            //   value: value?.relationshipId.shortName || ""
                            // }}
                            // value={{
                            //   label:
                            //     typeof value.relationshipId.shortName === "string"
                            //       ? value.relationshipId.shortName
                            //       : value.relationship.value,
                            //   value:
                            //     typeof value.relationshipId.shortName === "string"
                            //       ? value.relationshipId.shortName
                            //       : value.relationship.value
                            // }}
                            value={
                              value?.relationshipId?.shortName && !value?.relationship
                                ? {
                                    label:
                                      typeof value?.relationshipId?.shortName === "string"
                                        ? value?.relationshipId?.shortName
                                        : value?.relationship?.value,
                                    value:
                                      typeof value?.relationshipId?.shortName === "string"
                                        ? value?.relationshipId?.shortName
                                        : value?.relationship?.value
                                  }
                                : value?.relationship
                            }
                            name="relationship"
                          />
                          <hr className="block mx-2 w-[2px] h-10 bg-gray-200" />

                          <Input
                            id="name"
                            // label="Name"
                            type="text"
                            labelClassName="text-black!"
                            placeholder="Enter"
                            name="name"
                            maxLength={50}
                            className="border-none custom-no-autofill h-full focus-within:border-0 font-bold placeholder:font-normal pl-0"
                            value={value.name}
                            onChange={(e) => {
                              updateExistingFamilyDetail(index, "name", e.target.value);
                            }}
                          />
                        </div>
                        {existingFamilyErrors[index] && (
                          <p className="text-red-600">{existingFamilyErrors[index]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 w-full  items-start flex-col">
                    <p className="block  ml-0.5 text-sm font-medium">Mobile no.</p>
                    <div className="flex w-full items-center border-2 h-fit border-gray-300  rounded-[7px]!  focus-within:border-primary-dark">
                      <Select
                        containerClass="w-fit!"
                        className="border-none w-[80px]!  truncate gap-1 font-semibold"
                        options={phonecode}
                        optionClassName="w-[130px]!"
                        placeholder="Select"
                        onChange={(_e, data) => {
                          handleSelectExistingFamily(index, "phoneNumberCountryCode", data);
                        }}
                        value={{
                          label:
                            typeof value.phoneNumberCountryCode === "string"
                              ? value.phoneNumberCountryCode
                              : value?.phoneNumberCountryCode?.value,
                          value:
                            typeof value.phoneNumberCountryCode === "string"
                              ? value?.phoneNumberCountryCode
                              : value?.phoneNumberCountryCode?.value
                        }}
                        name="phoneNumberCountryCode"
                      />
                      <hr className="block mx-2 w-[2px] h-10 bg-gray-200" />

                      <div className="relative w-full h-full flex items-center">
                        <Input
                          className="border-none custom-no-autofill h-full focus-within:border-0 font-bold placeholder:font-normal pl-0"
                          value={value.phoneNumber}
                          onChange={(e) => {
                            updateExistingFamilyDetail(index, "phoneNumber", e.target.value);
                          }}
                          maxLength={value?.phoneNumberCountryCode?.value == "+91" ? 10 : 15}
                          id="phoneNumber"
                          type="tel"
                          placeholder="Enter"
                          name="phoneNumber"
                        />
                      </div>
                    </div>
                  </div>
                  <Input
                    id="age"
                    label="Age"
                    errors={existingFamilyAgeErrors[index]}
                    type="text"
                    labelClassName="text-black!"
                    placeholder="Enter"
                    name="age"
                    maxLength={3}
                    className="w-[228px]  rounded-[7px]! font-bold placeholder:font-normal"
                    value={value.age}
                    onChange={(e) => {
                      updateExistingFamilyDetail(index, "age", e.target.value);
                    }}
                  />
                  <Input
                    id="address"
                    type="text"
                    maxLength={200}
                    label="Address"
                    placeholder="Enter"
                    name="address"
                    labelClassName="text-black!"
                    className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                    value={value.address}
                    onChange={(e) => {
                      updateExistingFamilyDetail(index, "address", e.target.value);
                    }}
                  />

                  <Select
                    label="Select ID Proof"
                    options={[
                      { label: "Select", value: "" },
                      { label: "Aadhar Card", value: "Aadhar Card" },
                      { label: "Driving License", value: "Driving License" },
                      { label: "Pan Card", value: "Pan Card" },
                      { label: "Passport", value: "Passport" },
                      { label: "Voter Id", value: "Voter Id" },
                      { label: "Other", value: "Other" }
                    ]}
                    placeholder="Select"
                    value={
                      typeof value.idProffType === "string"
                        ? { label: value.idProffType, value: value.idProffType }
                        : value.idProffType
                    }
                    onChange={(_e, data) => {
                      handleSelectExistingFamily(index, "idProffType", data);
                    }}
                    name={"idProffType"}
                  />

                  <Input
                    id="IdNumber"
                    type="text"
                    label="ID Number"
                    placeholder="Enter"
                    name="idProffNumber"
                    maxLength={20}
                    labelClassName="text-black!"
                    className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                    value={value.idProffNumber}
                    onChange={(e) => {
                      updateExistingFamilyDetail(index, "idProffNumber", e.target.value);
                    }}
                  />
                  <div className="flex flex-col items-start">
                    <label htmlFor="" className="block mb-1.5 ml-0.5 text-sm font-medium ">
                      ID Proof
                    </label>
                    {/* <div className="pl-2 pr-20 flex gap-2  h-fit py-1 rounded-lg items-center w-[334px] border-dashed border-[#A5A5A5] border-2 relative">
                      <div className=" w-[30px] h-[30px] flex items-center overflow-hidden justify-center">
                        {value.idProofUrl || value?.file ? (
                          <a href={value.idProofUrl} target="_blank">
                            <img src={filePdf} className="w-full h-full" />
                          </a>
                        ) : (
                          <img src={file} className="w-full h-full" />
                        )}
                      </div>
                      {(value?.file || value?.idProofUrl) && (
                        <svg
                          onClick={() => handleDeleteFiles(index, "old")}
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
                      <AppDropZone
                        onDrop={(files) => {
                          handleDropFilesExistingFamily(files, index);
                        }}
                        accept="application/pdf"
                      >
                        {value.idProofUrl || value.file ? (
                          <div className=" w-full">
                            <a href={value.idProofUrl} target="_blank">
                              <p className="font-medium text-[13px] truncate w-40">
                                {value.file
                                  ? value.file?.name
                                  : `${value.idProffType}-${value.name}`}
                              </p>
                            </a>

                            <p className="font-semibold text-[12px]">
                              Drag & Drop for{" "}
                              <span className="underline cursor-pointer">Change</span>
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold text-[13px]">
                              Drag & Drop or{" "}
                              <span className="underline cursor-pointer">Browse Files</span>
                            </p>
                            <p className="font-medium text-[12px]">Format: PDF, Max size: 5MB</p>
                          </div>
                        )}
                      </AppDropZone>
                    </div> */}
                    <CheckBox
                      name=""
                      checked={true}
                      files={value.file instanceof File ? [value.file] : []}
                      filesString={
                        value.idProofUrl
                          ? [
                              {
                                filePath: value.idProofUrl,
                                fileUrl: value.idProofUrl,
                                fileName: `${value.idProffType}-${value.name}`
                              }
                            ]
                          : undefined
                      }
                      ContainerClass="-ml-5"
                      checkHide
                      handleDeletes={() => handleDeleteFiles(index, "old")}
                      handleDrop={(files) => {
                        handleDropFilesExistingFamily(files, index);
                      }}
                      handleCheck={function (_e: SyntheticEvent): void {
                        throw new Error("Function not implemented.");
                      }}
                    />
                  </div>
                </div>
                <hr className="my-5" />
              </div>
            ))}
          {newFamilyDetails.map((familyDetails, index) => (
            <div key={index} className="w-full mt-5">
              <div className="flex w-full mb-5 gap-10 md:flex-wrap-reverse lg:flex-nowrap justify-between items-center">
                <div className="flex flex-wrap md:w-[50%] lg:w-full gap-4">
                  {["Guardian", "Emergency Contact", "Nominated Representative", "Payer"].map(
                    (data) => (
                      <div className="flex w-fit items-center justify-start gap-2">
                        <Input
                          type="checkbox"
                          onChange={() => {
                            setNewFamilyDetails((prevDetails) =>
                              prevDetails.map((detail, i) =>
                                i === index
                                  ? {
                                      ...detail,
                                      infoType: detail.infoType.includes(data)
                                        ? detail.infoType.filter((item) => item !== data)
                                        : [...detail.infoType, data]
                                    }
                                  : detail
                              )
                            );
                          }}
                          name={data}
                          checked={newFamilyDetails[index].infoType.includes(data)}
                          className="accent-[#575F4A]! w-4! h-4! rounded-full!"
                        />
                        <label htmlFor={data} className="whitespace-nowrap text-[13px] font-medium">
                          {data}
                        </label>
                      </div>
                    )
                  )}
                </div>
                {!familyDetails.button && (
                  <Button
                    onClick={() => toggleModalDelete(index)}
                    variant="outlined"
                    className="rounded-xl! text-xs! hover:bg-gray-300 px-2!  font-semibold border-0!"
                  >
                    <MdDelete className="text-xl  text-red-600" />
                  </Button>
                )}
              </div>
              <div className="w-full grid md:grid-cols-2 lg:grid-cols-4 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
                <div className="flex gap-1 w-full  items-start flex-col">
                  <p className="block  ml-0.5 text-sm font-medium">Name</p>
                  <div
                    className={`flex w-full items-center border-2 h-fit ${
                      newFamilyErrors[index] ? "border-red-600" : "border-gray-300"
                    }  rounded-[7px]!  focus-within:border-primary-dark`}
                  >
                    <Select
                      containerClass="w-fit!"
                      className="border-none w-[80px]!  truncate gap-1 font-semibold"
                      options={relationShips}
                      optionClassName="w-[130px]!"
                      placeholder="Select"
                      onChange={(_e, data) => {
                        handleSelectFamily(index, "relationship", data);
                      }}
                      value={newFamilyDetails[index].relationship}
                      name="relationship"
                    />
                    <hr className="block mx-2 w-[2px] h-10 bg-gray-200" />

                    <Input
                      id="name"
                      type="text"
                      labelClassName="text-black!"
                      placeholder="Enter"
                      name="name"
                      maxLength={50}
                      className="border-none custom-no-autofill h-full focus-within:border-0 font-bold placeholder:font-normal pl-0"
                      value={newFamilyDetails[index].name}
                      onChange={(e) => updateFamilyDetail(index, "name", e.target.value)}
                    />
                  </div>
                  {newFamilyErrors[index] && (
                    <p className="text-red-600">{newFamilyErrors[index]}</p>
                  )}
                </div>
                <div className="flex gap-1 w-full  items-start flex-col">
                  <p className="block  ml-0.5 text-sm font-medium">Mobile no.</p>
                  <div className="flex w-full items-center border-2 h-fit border-gray-300  rounded-[7px]!  focus-within:border-primary-dark">
                    <Select
                      containerClass="w-fit!"
                      className="border-none w-[80px]!  truncate gap-1 font-semibold"
                      options={phonecode}
                      optionClassName="w-[130px]!"
                      placeholder="Select"
                      onChange={(_e, data) =>
                        handleSelectFamily(index, "phoneNumberCountryCode", data)
                      }
                      value={newFamilyDetails[index].phoneNumberCountryCode}
                      name="phoneNumberCountryCode"
                    />
                    <hr className="block mx-2 w-[2px] h-10 bg-gray-200" />

                    <div className="relative w-full h-full flex items-center">
                      <Input
                        className="border-none h-full custom-no-autofill focus-within:border-0 font-bold placeholder:font-normal pl-0"
                        value={newFamilyDetails[index].phoneNumber}
                        maxLength={
                          newFamilyDetails[index].phoneNumberCountryCode.value == "+91" ? 10 : 15
                        }
                        id="phoneNumber"
                        type="text" // Changed from "phone" to "tel" (more appropriate)
                        placeholder="Enter"
                        name="phoneNumber"
                        onChange={(e) => updateFamilyDetail(index, "phoneNumber", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <Input
                  id="age"
                  label="Age"
                  type="text"
                  errors={newFamilyAgeErrors[index]}
                  labelClassName="text-black!"
                  placeholder="Enter"
                  maxLength={3}
                  name="age"
                  className="w-[228px]  rounded-[7px]! font-bold placeholder:font-normal"
                  value={newFamilyDetails[index].age}
                  onChange={(e) => updateFamilyDetail(index, "age", e.target.value)}
                />
                <Input
                  id="address"
                  type="text"
                  maxLength={200}
                  label="Address"
                  placeholder="Enter"
                  name="address"
                  labelClassName="text-black!"
                  className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                  value={newFamilyDetails[index].address}
                  onChange={(e) => updateFamilyDetail(index, "address", e.target.value)}
                />

                <Select
                  label="Select ID Proof"
                  options={[
                    { label: "Select", value: "" },
                    { label: "Aadhar Card", value: "Aadhar Card" },
                    { label: "Driving License", value: "Driving License" },
                    { label: "Pan Card", value: "Pan Card" },
                    { label: "Passport", value: "Passport" },
                    { label: "Voter Id", value: "Voter Id" },
                    { label: "Other", value: "Other" }
                  ]}
                  placeholder="Select"
                  value={{
                    label:
                      typeof newFamilyDetails[index].idProffType === "object"
                        ? newFamilyDetails[index].idProffType.label
                        : newFamilyDetails[index].idProffType,
                    value:
                      typeof newFamilyDetails[index].idProffType === "object"
                        ? newFamilyDetails[index].idProffType.value
                        : newFamilyDetails[index].idProffType
                  }}
                  className=" border-[#DEDEDE]!"
                  onChange={(_e, data) => handleSelectFamily(index, "idProffType", data)}
                  name={"idProffType"}
                />

                <Input
                  id="IdNumber"
                  type="text"
                  label="ID Number"
                  placeholder="Enter"
                  name="idProffNumber"
                  maxLength={20}
                  labelClassName="text-black!"
                  className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                  value={newFamilyDetails[index].idProffNumber}
                  onChange={(e) => updateFamilyDetail(index, "idProffNumber", e.target.value)}
                />

                <div className="flex flex-col items-start">
                  <label htmlFor="" className="block mb-1.5 ml-0.5 text-sm font-medium ">
                    ID Proof
                  </label>
                  {/* <div className="py-1 pl-2 pr-20 flex gap-2 rounded-lg items-center w-[334px] border-dashed border-[#A5A5A5] border-2 relative">
                    <div className=" w-[30px] h-[30px] flex items-center overflow-hidden justify-center">
                      {newFamilyDetails[index].file ? (
                        <img src={filePdf} className="w-full h-full" />
                      ) : (
                        <img src={file} className="w-full h-full" />
                      )}
                    </div>
                    {newFamilyDetails[index].file && (
                      <svg
                        onClick={() => handleDeleteFiles(index)}
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

                    <AppDropZone
                      onDrop={(files) => {
                        handleDropFiles(files, index);
                      }}
                      accept="application/pdf"
                    >
                      {newFamilyDetails[index].file ? (
                        <div className=" w-full">
                          <p className="font-medium text-[13px] truncate w-40">
                            {newFamilyDetails[index].file instanceof File
                              ? newFamilyDetails[index].file.name
                              : ""}
                          </p>

                          <p className="font-semibold text-[12px]">
                            Drag & Drop for <span className="underline cursor-pointer">Change</span>
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-[13px]">
                            <span className="underline cursor-pointer">Click To Upload</span>
                          </p>
                          <p className="font-medium text-[12px] text-[#636363]">
                            Format: PDF, Max size: 5MB
                          </p>
                        </div>
                      )}
                    </AppDropZone>
                  </div> */}
                  <CheckBox
                    name=""
                    checked={true}
                    files={
                      newFamilyDetails[index].file && newFamilyDetails[index].file instanceof File
                        ? [newFamilyDetails[index].file]
                        : []
                    }
                    ContainerClass="-ml-5"
                    checkHide
                    handleDeletes={() => handleDeleteFiles(index)}
                    handleDrop={(files) => {
                      handleDropFiles(files, index);
                    }}
                    handleCheck={function (_e: SyntheticEvent): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
              </div>
              <hr className="my-5" />
            </div>
          ))}
          <Button
            onClick={addNewFamilyDetails}
            variant="outlined"
            // type="submit"
            className={`rounded-xl! mt-5 text-xs! ${
              newFamilyDetails.length < 10 ? "bg-[#ECF3CA]" : "bg-gray-200 cursor-default!"
            } font-semibold py-[7px]! px-[15px]! text-black border-0!`}
          >
            Add 1 more
          </Button>
        </DropDown>

        <div className="w-full flex gap-x-5 items-center mt-12 justify-center">
          <Button
            // type="submit"
            name="save"
            disabled={state.loading}
            className="min-w-[150px]! text-xs! px-[30px]! py-[10px]! rounded-[10px]r!"
            variant="outlined"
            size="base"
            onClick={(e) => handleSubmit(e, "SAVE")}
          >
            Save {state.loading && <Loader size="xs" />}
          </Button>
          <Button
            // type="submit"
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
      <DeleteConfirm
        toggleModal={toggleModalDelete}
        isModalOpen={deleteModal.isModal}
        confirmDeleteNote={removeNewFamilyDetails}
      />
      <DeleteConfirm
        toggleModal={toggleModalDeleteExisting}
        isModalOpen={deleteModalExisting.isModal}
        confirmDeleteNote={handleDeleteExistingFamilyDetails}
      />
    </div>
  );
};

export default ProfileContacts;
