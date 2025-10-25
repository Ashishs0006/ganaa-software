import { MdDeleteOutline } from "react-icons/md";
import { Button, Input, DeleteConfirm, InputRef } from "@/components";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { RxCross2 } from "react-icons/rx";
import {
  deleteBulkAllergy,
  getAllAllergy,
  getAllMedicine,
  createbulkAllergy,
  createBulkMedicine,
  deleteBulkMedicine,
  updateBulkMedicine
} from "@/apis";
import toast from "react-hot-toast";
import { setAllergy } from "@/redux/slice/dropDown";
import { useEffect, useRef, useState } from "react";
import { IMedicineArray } from "./type";
import { IState, IMedicineToBeAdded, IAllergiesToBeAdded } from "./type";

const Allergy = () => {
  const dispatch = useDispatch();
  const [existDosageId, setExistDosageId] = useState<null | number>(null);
  const [existMedId, setExistMedId] = useState("");
  const [existDosageModal, setExistDosageModal] = useState(false);
  const [newDosageId, setNewDosageId] = useState<null | number>(null);
  const [newMedId, setNewMedId] = useState<null | number>(null);
  const [newDosageModal, setNewDosageModal] = useState(false);
  const dropdown = useSelector((store: RootState) => store.dropdown);

  const toggleModalExistingDosageModal = () => {
    setExistDosageModal(!existDosageModal);
  };
  const toggleModalNewDosageModal = () => {
    setNewDosageModal(!newDosageModal);
  };
  const [state, setState] = useState<IState>({
    displayAddAllergy: false,
    index: null,
    displayAddMedicineDosage: null,
    displayExistingMedicineDosage: null,
    allergyId: "",
    medicineId: "",
    isDeleteModal: false,
    isDeleteModalNewMedine: false
  });

  const [medicineArray, setMedicineArray] = useState<IMedicineArray[]>([]);

  const [medicineToBeAdd, setMedicineToBeAdd] = useState<IMedicineToBeAdded[]>([
    {
      name: "",
      genericName: "",
      dosage: []
    }
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    dosageIndex?: number
  ) => {
    const { name, value } = e.target;
    const updated = [...medicineToBeAdd];

    if (name === "dosage" && dosageIndex !== undefined) {
      updated[index].dosage[dosageIndex] = value;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updated[index] as any)[name] = value; // name could be "name" or future fields
    }

    setMedicineToBeAdd(updated);
  };

  const [medicinesToBeUpdated, setMedicinesToBeUpdated] = useState<IMedicineArray[]>([]);
  const [dosageInputExisting, setDosageInputExisting] = useState("");

  const handleExistingMedicineChange = (id: string, field: keyof IMedicineArray, value: string) => {
    setMedicineArray((prevState) =>
      prevState.map((med) => {
        if (med._id !== id) return med;

        if (field === "dosage") {
          let updatedDosage: string[];

          if (med.dosage.includes(value)) {
            // Remove dosage if it already exists
            updatedDosage = med.dosage.filter((d) => d !== value);
          } else {
            // Add dosage if it's new
            updatedDosage = [...med.dosage, value];
          }

          const updatedMedicine = { ...med, dosage: updatedDosage };
          addExstingMedicineToUpdatedList(updatedMedicine);
          return updatedMedicine;
        }

        const updatedMedicine = { ...med, [field]: value };
        addExstingMedicineToUpdatedList(updatedMedicine);
        return updatedMedicine;
      })
    );
  };

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const updateDosageInExistingMedicine = (id: string) => {
    if (dosageInputExisting.trim() === "") return;

    setMedicineArray((prevState) =>
      prevState.map((med) => {
        if (med._id !== id) return med;

        const updatedDosage = [...med.dosage, dosageInputExisting.trim()];
        const updatedMedicine = { ...med, dosage: updatedDosage };

        addExstingMedicineToUpdatedList(updatedMedicine);
        return updatedMedicine;
      })
    );

    setDosageInputExisting(""); // Clear input after adding
    setState((prev) => ({ ...prev, displayExistingMedicineDosage: null })); // Optional UI control
  };

  const removeDosageFromExistingMedicine = (medicineId: string, dosageIndex: number) => {
    setMedicineArray((prevState) =>
      prevState.map((med) => {
        if (med._id !== medicineId) return med;

        const updatedDosage = med.dosage.filter((_, idx) => idx !== dosageIndex);
        const updatedMedicine = { ...med, dosage: updatedDosage };

        addExstingMedicineToUpdatedList(updatedMedicine);
        return updatedMedicine;
      })
    );
    setExistDosageId(null);
    setExistMedId("");
  };

  const addExstingMedicineToUpdatedList = (updatedMedicine: IMedicineArray) => {
    setMedicinesToBeUpdated((prev) => {
      const exists = prev.find((m) => m._id === updatedMedicine._id);
      if (exists) {
        return prev.map((m) => (m._id === updatedMedicine._id ? updatedMedicine : m));
      } else {
        return [...prev, updatedMedicine];
      }
    });
  };

  const [dosageInput, setDosageInput] = useState("");

  const handleAddMoreMedicine = () => {
    const last = medicineToBeAdd[medicineToBeAdd.length - 1];
    if (last?.name && last?.genericName) {
      setMedicineToBeAdd((prev) => [
        {
          name: "",
          genericName: "",
          dosage: []
        },
        ...prev
      ]);
    }
    setTimeout(() => {
      const lastIndex = medicineToBeAdd.length;
      inputRefs.current[lastIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRefs.current[lastIndex]?.focus();
    }, 100);
  };

  const handleRemoveMedicine = (index: number) => {
    console.log("isDeleteModalNewMedine");
    setMedicineToBeAdd((prev) => prev.filter((_, i) => i !== index));
    setState((prev) => ({ ...prev, isDeleteModalNewMedine: false, index: null }));
  };

  const addDosage = (index: number) => {
    if (dosageInput.trim() === "") return;
    const updated = [...medicineToBeAdd];
    updated[index].dosage = [...updated[index].dosage, dosageInput];
    setMedicineToBeAdd(updated);
    setDosageInput("");
    setState((prev) => ({ ...prev, displayAddMedicineDosage: null }));
  };

  const removeDosage = (medicineIndex: number, dosageIndex: number) => {
    const updated = [...medicineToBeAdd];
    updated[medicineIndex].dosage = updated[medicineIndex].dosage.filter(
      (_, idx) => idx !== dosageIndex
    );
    setMedicineToBeAdd(updated);
    setNewDosageId(null);
    setNewMedId(null);
  };

  const [allergiesToBeAdd, setAllergiesToBeAdd] = useState<IAllergiesToBeAdded[]>([]);

  const getAllAllergyFuntion = async () => {
    const response = await getAllAllergy({
      limit: 300,
      sort: "asc"
    });
    if (response.data.status == "success") {
      dispatch(setAllergy(response.data));
    }
  };

  const [allergiesToBeDelete, setAllergiesToBeDelete] = useState(new Set());

  const deleteAllergyConfirmFunction = (id: string) => {
    setAllergiesToBeDelete((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const deleteAllergyFunction = async (id: string) => {
    try {
      // const response = await deleteAllergy(id);
      // if (response.data.status == "success") {
      //   toast.success("Allergy Deleted Successfully");
      //   getAllAllergyFuntion();
      //   setState((prev) => ({ ...prev, allergyId: "" }));
      //   toggleModal();
      // }
      deleteAllergyConfirmFunction(id);
      setState((prev) => ({ ...prev, allergyId: "" }));
      toggleModal();
    } catch (error) {
      console.log(error);
    }
  };

  const [medicinesToBeDelete, setMedicinesToBeDelete] = useState(new Set());

  const deleteMedicineConfirmFunction = (id: string) => {
    setMedicinesToBeDelete((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const [inputValue, setInputValue] = useState("");

  const addAllergy = () => {
    if (inputValue.trim() === "") return;
    const newAllergy = {
      name: inputValue.trim(),
      isDeleted: false,
      _id: Date.now().toString() // use timestamp or UUID in real app
    };
    dispatch(setAllergy({ data: [newAllergy, ...dropdown.allergy.data] }));
    setAllergiesToBeAdd((prev) => [...prev, { name: inputValue }]);
    setInputValue("");
    setState((prev) => ({ ...prev, displayAddAllergy: false }));
  };

  const getAllMedicinesFunction = async () => {
    try {
      const response = await getAllMedicine({
        limit: 300,
        sort: "name"
      });
      if (response.data.status == "success") {
        setMedicineArray(response.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteMedicineFunction = async (id: string) => {
    try {
      deleteMedicineConfirmFunction(id);
      setState((prev) => ({ ...prev, medicineId: "" }));
      toggleModal();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSaveFunction = async () => {
    try {
      if (allergiesToBeAdd.length >= 1 || medicineToBeAdd.length >= 1) {
        await saveAllergiesAndMedicines();
      }
      toast.success("Data update successfully");
    } catch (error) {
      console.error(error);
    }
  };

  const saveAllergiesAndMedicines = async () => {
    let shouldRefreshAllergies = false;
    let shouldRefreshMedicines = false;
    // Handle allergy addition
    const allergyPromise =
      allergiesToBeAdd.length > 0
        ? createbulkAllergy({ allergys: allergiesToBeAdd })
            .then((_res) => {
              setAllergiesToBeAdd([]);
              // toast.success("Allergies added successfully");
              shouldRefreshAllergies = true;
            })
            .catch((_err) => {
              toast.error("Failed to add allergies");
            })
        : Promise.resolve();

    // Handle medicine addition
    const validMedicines = medicineToBeAdd.filter(
      (m) => m?.name && m?.name.trim() !== "" && m?.genericName && m?.genericName.trim() !== ""
    );
    const medicinePromise =
      validMedicines.length > 0 && validMedicines[0].name && validMedicines[0].genericName
        ? createBulkMedicine({ medicines: validMedicines })
            .then((_res) => {
              // toast.success("Medicines added successfully");
              shouldRefreshMedicines = true;
            })
            .catch((_err) => {
              toast.error("Failed to add medicines");
            })
        : Promise.resolve();

    // Handle Update Medicine
    const updateMedicinePromise =
      medicinesToBeUpdated.length > 0
        ? updateBulkMedicine({ medicines: medicinesToBeUpdated })
            .then(() => {
              setMedicinesToBeUpdated([]);
              // toast.success("Medicines Updated successfully");
              shouldRefreshMedicines = true;
            })
            .catch((_err) => {
              toast.error("Failed to update medicines");
            })
        : Promise.resolve();

    // Handle allergy deletion
    const deleteAllergyPromise =
      allergiesToBeDelete.size > 0
        ? deleteBulkAllergy({ allergys: Array.from(allergiesToBeDelete) })
            .then(() => {
              setAllergiesToBeDelete(new Set());
              // toast.success("Allergies deleted successfully");
              shouldRefreshAllergies = true;
            })
            .catch((_err) => {
              toast.error("Failed to delete allergies");
            })
        : Promise.resolve();

    // Handle medicine deletion
    const deleteMedicinePromise =
      medicinesToBeDelete.size > 0
        ? deleteBulkMedicine({ medicines: Array.from(medicinesToBeDelete) })
            .then(() => {
              setMedicinesToBeDelete(new Set());
              // toast.success("Medicines deleted successfully");
              shouldRefreshMedicines = true;
            })
            .catch((_err) => {
              toast.error("Failed to delete medicines");
            })
        : Promise.resolve();

    // Wait for all to complete
    await Promise.all([
      allergyPromise,
      medicinePromise,
      deleteAllergyPromise,
      deleteMedicinePromise,
      updateMedicinePromise
    ]);

    setMedicineToBeAdd([
      {
        name: "",
        genericName: "",
        dosage: []
      }
    ]);

    if (shouldRefreshAllergies) getAllAllergyFuntion();
    if (shouldRefreshMedicines) getAllMedicinesFunction();
  };

  useEffect(() => {
    getAllMedicinesFunction();
  }, []);

  const toggleModal = () => {
    setState((prev) => ({ ...prev, isDeleteModal: !prev.isDeleteModal }));
  };
  const toggleModalisDeleteModalNewMedine = () => {
    setState((prev) => ({ ...prev, isDeleteModalNewMedine: !prev.isDeleteModalNewMedine }));
  };

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state.displayAddAllergy && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.displayAddAllergy]);

  const dosageInputRef = useRef<HTMLInputElement | null>(null);
  const dosageInputRefold = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (state.displayAddMedicineDosage && dosageInputRef.current) {
      dosageInputRef.current.focus();
    }
  }, [state.displayAddMedicineDosage]);

  useEffect(() => {
    if (state.displayExistingMedicineDosage && dosageInputRefold.current) {
      dosageInputRefold.current.focus();
    }
  }, [state.displayExistingMedicineDosage]);

  const handleCancel = () => {
    setAllergiesToBeAdd([]);
    setMedicinesToBeUpdated([]);
    setMedicineToBeAdd([
      {
        name: "",
        genericName: "",
        dosage: []
      }
    ]);
    setAllergiesToBeDelete(new Set());
    setMedicinesToBeDelete(new Set());

    getAllAllergyFuntion();
    getAllMedicinesFunction();
  };

  return (
    <div>
      <div className="w-[1036px]!">
        <div className="bg-white w-fit flex flex-col rounded-xl items-center p-4">
          <div className="max-w-3xl w-full">
            <div className="bg-white rounded-xl p-6 space-y-6  border border-transparent">
              <div className="text-sm font-semibold mb-5 text-gray-900">
                Allergy & Medicine Master List
              </div>

              <div className="border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="text-xs font-medium text-gray-700 mb-2">Allergy List</div>
                <div className="flex border max-h-60 overflow-y-scroll border-[#C5C5C5] rounded-lg flex-wrap gap-2 p-2">
                  <span className="bg-[#F4F2F0] ml-3 border border-[#F4F2F0]  rounded-md">
                    {state.displayAddAllergy ? (
                      <InputRef
                        ref={inputRef}
                        type="text"
                        className="text-xs h-fit! w-fit! border-gray-300 rounded px-2 py-1 focus:outline-none"
                        placeholder="Add allergy..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addAllergy()}
                        onBlur={addAllergy}
                      />
                    ) : (
                      <Button
                        onClick={() => {
                          setState((prev) => ({ ...prev, displayAddAllergy: true }));
                        }}
                        className="flex! bg-[#ECF3CA]! px-3! py-1! text-xs font-semibold text-gray-900 rounded-md "
                      >
                        Add +
                      </Button>
                    )}
                  </span>
                  {dropdown.allergy.data.filter((d) => !d.isDeleted).length >= 1 &&
                    [...dropdown.allergy.data]
                      .filter((d) => !d.isDeleted) // filter out deleted first
                      .sort((a, b) => a.name.localeCompare(b.name)) // then sort
                      .map((value, index) => {
                        return (
                          <div key={index} className="relative mx-2 group cursor-pointer">
                            <span
                              className={`bg-[#F4F2F0] border ${
                                allergiesToBeDelete.has(value._id)
                                  ? "border-2 border-red-500"
                                  : "border-[#F4F2F0]"
                              } text-gray-900 text-xs font-semibold rounded-md px-3 py-1`}
                            >
                              {value.name}
                            </span>
                            <div
                              onClick={() => {
                                if (allergiesToBeDelete.has(value._id)) {
                                  deleteAllergyConfirmFunction(value._id);
                                } else {
                                  setState((prev) => ({
                                    ...prev,
                                    isDeleteModal: true,
                                    allergyId: value._id
                                  }));
                                }
                              }}
                              className="absolute cursor-pointer -top-2 -right-2 text-xs rounded-full bg-gray-200 p-0.5 hidden group-hover:block"
                            >
                              <RxCross2 />
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>

              <form className="border border-gray-200  mt-5 rounded-xl overflow-hidden space-y-6">
                <div className="space-y-4 border-b max-h-96 p-6 overflow-y-scroll">
                  {medicineToBeAdd.length >= 1 &&
                    medicineToBeAdd.map((value, index) => {
                      return (
                        <div
                          key={index}
                          className="flex flex-col my-2 md:flex-row items-start md:space-x-4 gap-4"
                        >
                          <div className="flex-1">
                            <InputRef
                              ref={(el) => {
                                inputRefs.current[index] = el;
                              }}
                              labelClassName="font-medium! text-[12px]! text-black!"
                              onChange={(e) => {
                                handleChange(e, index);
                              }}
                              required
                              label={index == 0 ? "Add Medicine" : ""}
                              type="text"
                              name="name"
                              placeholder="Enter Medicine"
                              value={value.name}
                              className="w-full! rounded-lg! border! border-gray-300! px-4! py-2! text-sm! font-semibold! text-gray-900! focus:outline-none! focus:ring-1 focus:ring-black"
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              required
                              onChange={(e) => {
                                handleChange(e, index);
                              }}
                              labelClassName="font-medium! text-[12px]! text-black!"
                              label={index == 0 ? "Generic Name" : ""}
                              type="text"
                              name="genericName"
                              placeholder="Enter Medicine"
                              value={value.genericName}
                              className="w-full! rounded-lg! border! border-gray-300! px-4! py-2! text-sm! font-semibold! text-gray-900! focus:outline-none! focus:ring-1 focus:ring-black"
                            />
                          </div>
                          <div className="flex-1">
                            <label
                              htmlFor="dosage1"
                              className="block text-[12px]! font-medium text-black mb-2"
                            >
                              {index == 0 ? "Dosage" : ""}
                            </label>
                            <div className="flex flex-wrap gap-2 rounded-lg border border-gray-300 px-4 py-2">
                              {state.displayAddMedicineDosage == index.toString() ? (
                                <InputRef
                                  ref={dosageInputRef}
                                  onKeyDown={(e) => e.key === "Enter" && addDosage(index)}
                                  onBlur={() => {
                                    addDosage(index);
                                  }}
                                  onChange={(e) => {
                                    setDosageInput(e.target.value);
                                  }}
                                  key={index}
                                  type="text"
                                  name="dosage"
                                  value={dosageInput}
                                  className="bg-gray-100 w-24! text-gray-900 text-xs font-semibold rounded-md  py-1"
                                />
                              ) : (
                                <Button
                                  onClick={() => {
                                    setState((prev) => ({
                                      ...prev,
                                      displayAddMedicineDosage: index.toString()
                                    }));
                                  }}
                                  className="flex! bg-[#ECF3CA]! px-3! py-1! text-xs font-semibold text-gray-900 rounded-md "
                                >
                                  +Add
                                </Button>
                              )}
                              {value.dosage.length >= 1 &&
                                value.dosage.map((dos, indexx) => (
                                  <div key={indexx} className="relative  group cursor-pointer">
                                    <span className="bg-gray-100 text-gray-900 text-xs font-semibold rounded-md px-3 py-1">
                                      {dos}
                                    </span>
                                    <div
                                      onClick={() => {
                                        setNewDosageId(indexx);
                                        setNewMedId(index);
                                        toggleModalNewDosageModal();
                                      }}
                                      className="absolute cursor-pointer -top-2 -right-2 text-xs rounded-full bg-gray-200 p-0.5 hidden group-hover:block"
                                    >
                                      <RxCross2 />
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                          <div
                            className={`cursor-pointer ${
                              index != 0 ? "visible" : "invisible"
                            } mt-5 hover:bg-gray-200 p-2 rounded-full`}
                            onClick={() => {
                              setState((prev) => ({
                                ...prev,
                                index: index,
                                isDeleteModalNewMedine: true
                              }));
                            }}
                          >
                            <MdDeleteOutline className="text-red-600 text-lg hover:text-red-700" />
                          </div>
                        </div>
                      );
                    })}

                  {medicineArray.length >= 1 &&
                    [...medicineArray]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((value, index) => {
                        return (
                          <div
                            key={index}
                            className="flex flex-col my-2 md:flex-row  items-start md:space-x-4 gap-4"
                          >
                            <div className="flex-1">
                              <Input
                                type="text"
                                id="med2"
                                value={value.name}
                                onChange={(e) =>
                                  handleExistingMedicineChange(value._id, "name", e.target.value)
                                }
                                className={`w-full! rounded-lg! ${
                                  medicinesToBeDelete.has(value._id)
                                    ? "border-red-500"
                                    : "border-gray-300!"
                                } border!  px-4! py-2! text-sm! font-semibold! text-gray-900! focus:outline-none! focus:ring-1 focus:ring-black`}
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                type="text"
                                id="med2"
                                onChange={(e) =>
                                  handleExistingMedicineChange(
                                    value._id,
                                    "genericName",
                                    e.target.value
                                  )
                                }
                                value={value.genericName}
                                className={`w-full! rounded-lg! ${
                                  medicinesToBeDelete.has(value._id)
                                    ? "border-red-500"
                                    : "border-gray-300!"
                                } border!  px-4! py-2! text-sm! font-semibold! text-gray-900! focus:outline-none! focus:ring-1 focus:ring-black`}
                              />
                            </div>
                            <div className="flex-1">
                              <div
                                className={`flex flex-wrap gap-2 rounded-lg ${
                                  medicinesToBeDelete.has(value._id)
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } border  px-4 py-2`}
                              >
                                {state.displayExistingMedicineDosage == index.toString() ? (
                                  <InputRef
                                    ref={dosageInputRefold}
                                    onKeyDown={(e) =>
                                      e.key === "Enter" && updateDosageInExistingMedicine(value._id)
                                    }
                                    onBlur={() => {
                                      updateDosageInExistingMedicine(value._id);
                                    }}
                                    onChange={(e) => {
                                      setDosageInputExisting(e.target.value);
                                    }}
                                    key={index}
                                    type="text"
                                    name="dosage"
                                    value={dosageInputExisting}
                                    className="bg-gray-100 w-24! text-gray-900 text-xs font-semibold rounded-md  py-1"
                                  />
                                ) : (
                                  <Button
                                    onClick={() => {
                                      setState((prev) => ({
                                        ...prev,
                                        displayExistingMedicineDosage: index.toString()
                                      }));
                                    }}
                                    className="flex! bg-[#ECF3CA]! px-3! py-1! text-xs font-semibold text-gray-900 rounded-md "
                                  >
                                    +Add
                                  </Button>
                                )}
                                {value.dosage.length >= 1 &&
                                  value.dosage.map((dos, indexx) => {
                                    return (
                                      <div key={indexx} className="relative  group cursor-pointer">
                                        <span
                                          key={indexx}
                                          className="bg-gray-100 text-gray-900 text-xs font-semibold rounded-md px-3 py-1"
                                        >
                                          {dos}
                                        </span>
                                        <div
                                          onClick={() => {
                                            setExistDosageId(indexx);
                                            setExistMedId(value._id);
                                            toggleModalExistingDosageModal();
                                          }}
                                          className="absolute cursor-pointer -top-2 -right-2 text-xs rounded-full bg-gray-200 p-0.5 hidden group-hover:block"
                                        >
                                          <RxCross2 />
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                            <div
                              className="cursor-pointer mt-2 hover:bg-gray-200 p-2 rounded-full"
                              onClick={() => {
                                if (medicinesToBeDelete.has(value._id)) {
                                  deleteMedicineConfirmFunction(value._id);
                                } else {
                                  setState((prev) => ({
                                    ...prev,
                                    isDeleteModal: true,
                                    medicineId: value._id
                                  }));
                                }
                              }}
                            >
                              <MdDeleteOutline className="text-red-600 text-lg hover:text-red-700" />
                            </div>
                          </div>
                        );
                      })}
                </div>

                <Button
                  variant="outlined"
                  type="button"
                  onClick={() => {
                    handleAddMoreMedicine();
                  }}
                  className="w-full bg-[#ECF3CA] border-none! text-[#333E29] text-xs font-semibold rounded-b-md! rounded-none py-2 mt-2"
                >
                  Add 1 More
                </Button>
              </form>

              <div className="flex justify-center mt-6 gap-4">
                <Button
                  variant="outlined"
                  onClick={() => {
                    handleSaveFunction();
                  }}
                  type="submit"
                  className="bg-[#323E2A] text-white text-sm font-normal rounded-lg px-10 py-3"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="outlined"
                  size="base"
                  className="px-10 py-3 border-red-500! text-red-500! text-sm! font-normal rounded-lg!"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirm
        isModalOpen={state.isDeleteModal}
        toggleModal={toggleModal}
        confirmDeleteNote={() => {
          if (state?.allergyId) {
            deleteAllergyFunction(state?.allergyId);
          } else if (state?.medicineId) {
            deleteMedicineFunction(state?.medicineId);
          }
        }}
      />
      <DeleteConfirm
        isModalOpen={state.isDeleteModalNewMedine}
        toggleModal={toggleModalisDeleteModalNewMedine}
        confirmDeleteNote={() => {
          console.log("sdfg");
          console.log(state);
          if (state?.index) handleRemoveMedicine(state.index);
        }}
      />

      <DeleteConfirm
        isModalOpen={existDosageModal}
        toggleModal={() => {
          setExistDosageId(null);
          setExistMedId("");
          toggleModalExistingDosageModal();
        }}
        confirmDeleteNote={() => {
          console.log(existDosageId, existMedId);
          if (existDosageId != null) {
            removeDosageFromExistingMedicine(existMedId, existDosageId);
            setExistDosageModal(false);
          }
        }}
      />
      <DeleteConfirm
        isModalOpen={newDosageModal}
        toggleModal={() => {
          setNewDosageId(null);
          setNewMedId(null);
          toggleModalNewDosageModal();
        }}
        confirmDeleteNote={() => {
          if (newDosageId != null && newMedId != null) {
            removeDosage(newMedId, newDosageId);
            setNewDosageModal(false);
          }
        }}
      />
      <DeleteConfirm
        isModalOpen={state.isDeleteModalNewMedine}
        toggleModal={toggleModalisDeleteModalNewMedine}
        confirmDeleteNote={() => {
          console.log("sdfg");
          console.log(state);
          if (state?.index) handleRemoveMedicine(state.index);
        }}
      />
    </div>
  );
};

export default Allergy;
