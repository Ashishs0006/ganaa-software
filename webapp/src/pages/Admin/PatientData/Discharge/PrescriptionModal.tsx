import { Button, Input, Modal, Select } from "@/components";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { IFrequency, IprescriptionState, IUsages } from "../Doctor/types";
import { getAllMedicine, getSingleMedicine } from "@/apis";
import { ISelectOption } from "@/components/Select/types";
import CustomCalenderForDoctor from "../Doctor/CustomCalenderForDocotor/CustomCalenderForDoctor";
import { RxCross2 } from "react-icons/rx";
import toast from "react-hot-toast";
import moment from "moment";

const PrescriptionModal = ({
  setPrescriptionDateTime,
  setPrescriptionToBeSaved,
  prescriptionToBeSaved,
  modal,
  toggleModal,
  setUpdateindex,
  setValue,
  value,
  Updateindex
}: {
  prescriptionToBeSaved: IprescriptionState[];
  modal: boolean;
  setPrescriptionDateTime: React.Dispatch<React.SetStateAction<string | undefined>>;
  setPrescriptionToBeSaved: React.Dispatch<React.SetStateAction<IprescriptionState[]>>;
  setValue: React.Dispatch<React.SetStateAction<IprescriptionState | null>>;
  setUpdateindex: React.Dispatch<React.SetStateAction<number | null>>;
  toggleModal: () => void;
  value: IprescriptionState | null;
  Updateindex: number | null;
}) => {
  const [calenderView, setCalenderView] = useState(false);

  const [updateIndex, setUpdateIndex] = useState<number | null>(null);

  const [prescriptionState, setPrescriptionState] = useState<IprescriptionState>({
    medicine: { label: "Select", value: "" },
    durationFrequency: { label: "Select", value: "" },
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

  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFrequencies, setSelectedFrequencies] = useState<string[]>([
    "Morning",
    "Noon",
    "Night"
  ]);

  const [frequencyName, setFrequencyName] = useState("");

  const [toggleAddFrequencyInput, setToggleAddFrequencyInput] = useState(false);

  const [dosages, setDosages] = useState<ISelectOption[]>([{ label: "select", value: "" }]);

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

  const handleUpdateLocal = async (value: IprescriptionState, indexId: number) => {
    setPrescriptionState({
      customDuration: value.customDuration,
      durationFrequency: value.durationFrequency,
      instructions: value.instructions,
      prescribedWhen: value.prescribedWhen,
      medicine: value.medicine,
      usages: value.usages
    });
    const response = await getSingleMedicine(value.medicine.value.toString());
    const dosageArray = response?.data?.data?.dosage || [{ label: "select", value: "" }];
    const formattedDosages = dosageArray.map((data: string) => ({
      label: data,
      value: data
    }));
    setDosages(formattedDosages);
    setUpdateIndex(indexId);
    setSelectedFrequencies(value.usages.map((data) => data.frequency));
  };

  useEffect(() => {
    if (value != null && Updateindex != null) handleUpdateLocal(value, Updateindex);
  }, [value, Updateindex]);

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
          durationFrequency: { label: "Select", value: "" },
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

  const addPrescriptionToBeSaveState = () => {
    if (prescriptionToBeSaved.length >= 30) {
      toast.error("You can only add 30 prescriptions at a time");
      return;
    }
    if (!prescriptionState.medicine.value) {
      toast.error("Medicine is required");
      return;
    }

    if (prescriptionState.usages.length === 0) {
      toast.error("At least one frequency is required");
      return;
    }

    setPrescriptionToBeSaved((prev) =>
      updateIndex !== undefined && updateIndex !== null
        ? prev.map((item, i) => (i === updateIndex ? prescriptionState : item))
        : [...prev, prescriptionState]
    );
    setPrescriptionDateTime(new Date().toISOString());
    setUpdateIndex(null);
    setPrescriptionState({
      medicine: { label: "Select", value: "" },
      durationFrequency: { label: "Select", value: "" },
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

    setUpdateindex(null);
    setSelectedFrequencies(["Morning", "Noon", "Night"]);
    toggleModal();
  };

  const handleDateTimeChange = (date: string) => {
    setPrescriptionState((prev) => ({
      ...prev,
      customDuration: date,
      durationFrequency: { label: "Custom Date", value: "Custom Date" }
    }));
    setCalenderView(false);
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

  const handleSelectFrequency = (name: string) => {
    if (selectedFrequencies.includes(name)) {
      setSelectedFrequencies(selectedFrequencies.filter((freq) => freq !== name));
    } else {
      setSelectedFrequencies([...selectedFrequencies, name]);
    }
  };

  const handleToggelEvent = () => {
    setValue(null);
    setUpdateIndex(null);
    setUpdateIndex(null);
    setPrescriptionState({
      medicine: { label: "Select", value: "" },
      durationFrequency: { label: "Select", value: "" },
      customDuration: "",
      prescribedWhen: { label: "Select", value: "" },
      instructions: "",
      usages: [
        {
          frequency: "Morning",
          quantity: 1,
          when: { label: "Select", value: "" },
          dosage: { label: "Select", value: "" }
        }
      ]
    });
    setUpdateindex(null);
    setSelectedFrequencies(["Morning"]);
    toggleModal();
  };

  return (
    <Modal isOpen={modal} toggleModal={handleToggelEvent} crossIcon>
      <div className="grid w-[700px] h-[600px] text-nowrap whitespace-nowrap overflow-auto col-span-1 items-center col-start-1 rounded-xl bg-white">
        <div className=" flex p-2 items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <p className="text-[16px] ml-3 font-bold mt-3">Add Discharge Prescription</p>
          </div>
        </div>
        <div className="lg:grid sm:flex sm:flex-col h-fit lg:grid-cols-1 px-5 sm:grid-cols-3 gap-4 p-4 items-start">
          <div className="  sm:w-full grid lg:grid-cols-2 gap-x-[18px] gap-y-8 items-center justify-center">
            <div className="grid col-span-3 col-start-1">
              <Select
                label="Medicines*"
                apiCall={true}
                fetchOptions={fetchMedines}
                options={[{ label: "Select", value: "" }]}
                className=" w-full!"
                placeholder="Select"
                onChange={(name, value) => {
                  handlePrescriptionUpdateSelectFields(-1, name, value);
                }}
                value={prescriptionState.medicine}
                name="medicine"
              />
            </div>
            <div className="grid col-span-1 relative">
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
                        label: prescriptionState?.customDuration
                          ?.split("|")
                          .map((d) => moment(d).format("D MMMM"))
                          .join(" to "),
                        value: prescriptionState.customDuration
                      }
                    : prescriptionState.durationFrequency
                }
                name="durationFrequency"
                className="col-span-2"
              />
              {calenderView && (
                <div ref={calenderRef}>
                  <CustomCalenderForDoctor
                    value={prescriptionState.customDuration}
                    onChange={(date) => {
                      handleDateTimeChange(date);
                    }}
                  />
                </div>
              )}
            </div>
            <div className="grid col-span-1">
              <Select
                label="Prescribed when"
                options={[
                  { label: "After Treament", value: "After Treament" },
                  { label: "During Treament", value: "During Treament" },
                  { label: "Before Treament", value: "Before Treament" },
                  { label: "Discharge Advice", value: "Discharge Advice" }
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
          </div>

          <div className="w-full">
            <div className="flex flex-col items-ce justify-between h-full mt-2  pb-3 space-y-2">
              <div className="sm:flex justify-between items-center">
                <div className="flex  sm:w-fit">
                  <div className=" w-fit ">
                    <label htmlFor="" className="text-sm font-medium">
                      Frequency/Routine*
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
                        Dosage
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
                            className="bg-[#9DAE57] cursor-pointer opacity-[50%] text-black font-semibold py-2 px-3 rounded-l-sm"
                            onClick={() => handlePrescriptionQuantityChange(index, "decrement")}
                          >
                            -
                          </button>
                          <span className="bg-[#ECF3CA] text-black font-semibold py-2 px-7 ">
                            {freq.quantity}
                          </span>
                          {/* Increment Button */}
                          <button
                            className="bg-[#9DAE57] opacity-[50%] cursor-pointer text-black font-semibold py-2 px-3 rounded-r-sm"
                            onClick={() => handlePrescriptionQuantityChange(index, "increment")}
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
                              { label: "Empty Stomach", value: "Empty Stomach" },
                              { label: "After BreakFast", value: "After BreakFast" },
                              { label: "After Lunch", value: "After Lunch" }
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
          <div className="grid ">
            <label htmlFor="" className="text-sm mb-2 font-medium ">
              Instructions
            </label>
            <textarea
              rows={2}
              name="instructions"
              value={prescriptionState.instructions}
              onChange={(e) => {
                setPrescriptionState({
                  ...prescriptionState,
                  instructions: e.target.value
                });
              }}
              className="resize-none col-span-3 rounded-lg border-2 border-[#A5A5A5] p-2 py-3 focus:outline-none focus:border-primary-dark"
              placeholder="Add"
            />
          </div>
        </div>
      </div>
      <div className="w-full px-4 ">
        <Button
          onClick={() => {
            addPrescriptionToBeSaveState();
          }}
          className="mx-auto w-full py-4! text-xs rounded-xl hover:bg-[#575F4A]!  mb-5 text-white bg-[#323E2A]"
        >
          Submit
        </Button>
      </div>
    </Modal>
  );
};

export default PrescriptionModal;
