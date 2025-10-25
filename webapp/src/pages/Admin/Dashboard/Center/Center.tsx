import React, { MouseEvent, SyntheticEvent, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";
import { useDispatch, useSelector } from "react-redux";
import { CiEdit } from "react-icons/ci";
import { RootState } from "@/redux/store/store";
import kabab from "@/assets/images/kebab-menu.svg";
import { Button, DeleteConfirm, Input, InputRef, Modal } from "@/components";
import {
  createBulkLocker,
  createCenter,
  createRoomType,
  deleteBulkLocker,
  deleteCenter,
  getAllCenter,
  getAllLocker,
  getAllRoomType,
  deleteRoomType,
  updateCenter,
  updateRoomType,
  createRoomNumberBulk,
  deleteRoomNumberBulk
} from "@/apis";
import { IState, ICenterData } from "./types";
import { MdDelete } from "react-icons/md";
import constants from "@/constants";
import { ICenter, setCenter } from "@/redux/slice/dropDown";
import handleError from "@/utils/handleError";

interface IRoomNumber {
  _id: string;
  name: string;
  roomTypeId: string;
  totalBeds: number;
  isDeleted: boolean;
  createdAt: string;
  __v: number;
}
interface IRoomNumberToAdded {
  name: string;
  roomTypeId: string;
  totalBeds: string;
}

export interface IRoomTypeData {
  name: string;
  maxOccupancy: string;
  order: string;
  pricePerDayPerBed: string;
}
interface IRoomType {
  _id: string;
  name: string;
  order: number;
  centerId: string;
  isDeleted: boolean;
  createdAt: string;
  roomNumbers: IRoomNumber[];
}

interface ILockerToBeAdd {
  _id?: string;
  name: string;
  centerId: string;
}
interface ILocker {
  _id: string;
  name: string;
  centerId: string;
}
interface ILockerDelete {
  name: string;
  centerId: string;
}

const Center = () => {
  const dispatch = useDispatch();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const dropdown = useSelector((store: RootState) => store.dropdown);

  const [roomTypeAndNumber, setRoomTypeAndNumber] = useState<IRoomType[]>();

  const [lockersData, setLockersData] = useState<ILocker[]>([]);
  const [lockersDeleteOldData, setLockersOldDeleteData] = useState<ILocker[]>([]);
  const [lockersDeleteNewData, setLockersNewDeleteData] = useState<ILockerDelete[]>([]);

  const [state, setState] = useState<IState>({
    center: { label: "Select", value: "" },
    roomtypes: [],
    roomNumbers: [],
    roomNumberMenuId: null,
    roomNumberInput: "",
    isModal: false,
    isRoomTypeModal: false,
    openMenuId: null,
    displayAddLockerInput: false,
    isDeleteModal: false
  });

  const getAllRoomNumberAndRoomType = async () => {
    try {
      const response = await getAllRoomType({
        limit: 100,
        page: 1,
        sort: "-createdAt",
        includeRoomNumbers: true
      });
      if (response.data.status == "success") {
        setRoomTypeAndNumber(response.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getAllLockerFunction = async () => {
    try {
      if (state.center.value) {
        const response = await getAllLocker({ centerId: state.center.value });
        if (response.data.status == "success") {
          setLockersData(response.data.data);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };
  const getAllRoomTypeFunction = async () => {
    try {
      if (state.center.value) {
        const response = await getAllRoomType({
          centerId: state.center.value,
          includeRoomNumbers: true
        });
        if (response.data.status == "success") {
          setState((prev) => ({ ...prev, roomtypes: response.data.data }));
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAllRoomTypeFunction();
  }, [state.center.value]);

  const [editId, setEditCid] = useState("");

  const toggleModal = () => {
    setState((prevState) => ({ ...prevState, isModal: !prevState.isModal }));
  };

  const toggleIsRoomTypeModal = () => {
    setState((prevState) => ({ ...prevState, isRoomTypeModal: !prevState.isRoomTypeModal }));
  };

  const toggleMenu = (_e: SyntheticEvent, id: string | number) => {
    setState((prev) => ({
      ...prev,
      openMenuId: state.openMenuId === id ? null : id.toString()
    }));
  };

  useEffect(() => {
    getAllRoomNumberAndRoomType();
  }, [state.center.value]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dId, setDid] = useState("");

  useEffect(() => {
    getAllLockerFunction();
  }, [state.center.value]);

  const toggleDeleteModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const fetchAllCenter = async () => {
    try {
      const now = Date.now();

      const { data } = await getAllCenter({
        limit: dropdown.center.pagination.limit,
        sort: "centerName"
      });

      localStorage.setItem(
        constants.dropdown.ALLCENTER,
        JSON.stringify({
          timestamp: now,
          data: data.data,
          pagination: data.pagination
        })
      );

      dispatch(
        setCenter({
          data: data.data
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDeleteNote = async () => {
    try {
      const response = await deleteCenter(dId);
      if (response.data?.status == "success") {
        toast.success(response.data?.message);
        toggleDeleteModal();
        fetchAllCenter();
        getAllRoomNumberAndRoomType();
        getAllLockerFunction();
        setDid("");
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = (id: string) => {
    setDid(id);
    toggleDeleteModal();
  };

  const handleEdit = (data: ICenter) => {
    setEditCid(data._id);
    setCenterData({ centerName: data.centerName, googleMapLink: data.googleMapLink });
    toggleModal();
  };

  const handleRoomTypeEdit = (data: {
    _id: string;
    name: string;
    maxOccupancy: string;
    order: string;
    centerId: string;
    pricePerDayPerBed: {
      $numberDecimal: string;
    };
  }) => {
    setEditCid(data._id);
    setRoomTypeData({
      name: data.name,
      maxOccupancy: data.maxOccupancy.toString(),
      order: data.order.toString(),
      pricePerDayPerBed: data.pricePerDayPerBed.$numberDecimal
    });
    toggleIsRoomTypeModal();
  };

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setState((prev) => ({
        ...prev,
        openMenuId: null
      }));
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const [centerData, setCenterData] = useState<ICenterData>({
    centerName: "",
    googleMapLink: ""
  });

  const handleCenterDataChange = (event: React.SyntheticEvent) => {
    const { name, value } = event.target as HTMLInputElement;
    setCenterData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCreateCenterFunction = async () => {
    try {
      let response;
      if (editId) {
        response = await updateCenter(editId, centerData);
        if (response.data.status == "success") {
          fetchAllCenter();
          toast.success("Center Update successfully!");
          toggleModal();
          setEditCid("");
          setCenterData({
            centerName: "",
            googleMapLink: ""
          });
        } else {
          toast.error("Unable To create center!");
        }
      } else {
        response = await createCenter(centerData);
        if (response.data.status == "success") {
          fetchAllCenter();
          setEditCid("");
          toast.success("Center created successfully!");
          toggleModal();
          setCenterData({
            centerName: "",
            googleMapLink: ""
          });
        } else {
          toast.error("Unable To create center!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCreateRoomTypeFunction = async () => {
    try {
      let response;
      if (editId) {
        response = await updateRoomType(editId, { ...roomTypeData, centerId: state.center.value });
        if (response.data.status == "success") {
          fetchAllCenter();
          toast.success("Room Type Update successfully!");
          toggleIsRoomTypeModal();
          setEditCid("");
          setRoomTypeData({
            name: "",
            maxOccupancy: "",
            order: "",
            pricePerDayPerBed: ""
            // centerId: state.center.value
          });
        } else {
          toast.error("Unable To create center!");
        }
      } else {
        response = await createRoomType({ ...roomTypeData, centerId: state.center.value });
        if (response.data.status == "success") {
          fetchAllCenter();
          toast.success("Room Type created successfully!");
          toggleIsRoomTypeModal();
          setRoomTypeData({
            name: "",
            maxOccupancy: "",
            order: "",
            pricePerDayPerBed: ""
            // centerId: state.center.value
          });
        } else {
          toast.error("Unable To create Room Type!");
        }
      }
      setEditCid("");
      getAllRoomTypeFunction();
    } catch (error) {
      console.log(error);
    }
  };

  // locker
  const [lockerId, setLockerId] = useState("");
  const [lockerType, setLockerType] = useState("");
  const [isLockerOpen, setIsLockerOpen] = useState(false);
  const [lockerInputValue, setLockerInputValue] = useState("");
  const [lockerNumberToBeAdd, setLockerNumberToBeAdd] = useState<ILockerToBeAdd[]>([]);

  const [roomNumberId, setRoomNumberId] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [roomNumberDeleteModal, setRoomNumberDeleteModal] = useState(false);
  const [roomNumberType, setRoomNumberType] = useState("");
  const [roomNumberToBeDelete, setRoomNumberToBeDelete] = useState<IRoomNumber[]>([]);
  const [roomNumberToBeDeleteNew, setRoomNumberToBeDeleteNew] = useState<IRoomNumberToAdded[]>([]);
  const [roomNumberToBeAdded, setRoomNumberToBeAdded] = useState<IRoomNumberToAdded[]>([]);

  const toggleRoomNumberDeleteModal = () => {
    setRoomNumberDeleteModal(!roomNumberDeleteModal);
  };

  const toggleDeleteLockerModal = () => {
    setIsLockerOpen(!isLockerOpen);
  };

  const handleLockerDelete = (name: string, type: string) => {
    setLockerType(type);
    setLockerId(name);
    toggleDeleteLockerModal();
  };

  const handleRoomNumberDelete = (name: string, id: string, type: string) => {
    setRoomNumberType(type);
    setRoomNumberId(name);
    setRoomTypeId(id);
    toggleRoomNumberDeleteModal();
  };

  const [roomNumberInputValue, setRoomNumberInputValue] = useState("");

  const addRoomNumber = (totalBeds: string, roomTypeId: string) => {
    if (roomNumberInputValue.trim() === "") {
      toast.error("Please enter a Room number");
      return;
    }

    if (roomNumberToBeAdded.length >= 20) {
      toast.error("You can only add up to 20 room numbers");
      return;
    }

    // Check in the list you are about to add
    const roomNumberExistsInNew = roomNumberToBeAdded.some(
      (room) => room.name === roomNumberInputValue && room.roomTypeId === roomTypeId
    );

    // ✅ Check also in existing locker data
    const RoomNumbervalueExist = state.roomtypes.flatMap((roomtype) =>
      roomtype.roomNumbers.filter(
        (room: { name: string; roomTypeId: string }) =>
          room.name === roomNumberInputValue && room.roomTypeId === roomTypeId
      )
    )[0];

    if (roomNumberExistsInNew || RoomNumbervalueExist) {
      toast.error("Room number already exists");
      return;
    }

    const newRoomNumber = {
      name: roomNumberInputValue,
      totalBeds,
      roomTypeId
    };

    setRoomNumberToBeAdded((prev) => [...prev, newRoomNumber]);
    setState((prev) => ({ ...prev, roomNumberMenuId: "" }));
    setRoomNumberInputValue("");
  };

  const addLockerNumber = () => {
    if (lockerInputValue.trim() === "") {
      toast.error("Please enter a locker number");
      return;
    }

    // Check in the list you are about to add
    const lockerNumberExistsInNew = lockerNumberToBeAdd.some(
      (locker) => locker.name === lockerInputValue
    );

    // ✅ Check also in existing locker data
    const lockerNumberExistsInExisting = lockersData.some(
      (locker) => locker.name === lockerInputValue
    );

    if (lockerNumberExistsInNew || lockerNumberExistsInExisting) {
      toast.error("Locker number already exists");
      return;
    }

    const newLockerNumber = {
      name: lockerInputValue,
      centerId: state.center.value
    };

    setLockerNumberToBeAdd((prev) => [...prev, newLockerNumber]);
    setState((prev) => ({ ...prev, displayAddLockerInput: false }));
    setLockerInputValue("");
  };

  const confirmDeleteLocker = () => {
    if (lockerType == "new") {
      const lockervalue = lockerNumberToBeAdd.find((locker) => locker.name === lockerId);
      setLockersNewDeleteData((prev) => [...prev, lockervalue!]);
      toggleDeleteLockerModal();
      setLockerId("");
      setLockerType("");
    } else {
      const lockervalue = lockersData.find((locker) => locker.name === lockerId);
      setLockersOldDeleteData((prev) => [...prev, lockervalue!]);
      toggleDeleteLockerModal();
      setLockerId("");
      setLockerType("");
    }
  };

  const confirmDeleteRoomNumber = () => {
    if (roomNumberType == "new") {
      const RoomNumbervalue = roomNumberToBeAdded.find(
        (roomNumber) => roomNumber.name === roomNumberId && roomNumber.roomTypeId === roomTypeId // <-- replace with actual roomtype ID
      );
      setRoomNumberToBeDeleteNew((prev) => [...prev, RoomNumbervalue!]);
      toggleRoomNumberDeleteModal();
      setRoomNumberId("");
      setRoomTypeId("");
      setRoomNumberType("");
    } else {
      const RoomNumbervalue = state.roomtypes.flatMap((roomtype) =>
        roomtype.roomNumbers.filter(
          (room: { name: string; roomTypeId: string }) =>
            room.name === roomNumberId && room.roomTypeId === roomTypeId
        )
      )[0];

      setRoomNumberToBeDelete((prev) => [...prev, RoomNumbervalue!]);
      toggleRoomNumberDeleteModal();
      setRoomNumberId("");
      setRoomTypeId("");
      setRoomNumberType("");
    }
  };

  const handleLockerOperation = async () => {
    try {
      // 1. Filter out deleted new lockers (so they don't get added)
      const lockersToCreate = lockerNumberToBeAdd.filter(
        (locker) => !lockersDeleteNewData.some((del) => del.name === locker.name)
      );

      // 2. Extract old locker IDs to delete
      const lockerNumbers = lockersDeleteOldData
        .filter((locker) => locker._id) // Ensure _id exists
        .map((locker) => locker._id);

      // 3. API Calls
      if (lockerNumbers.length > 0) {
        await deleteBulkLocker({ lockerNumbers });
      }

      if (lockersToCreate.length > 0) {
        await createBulkLocker({ lockerNumbers: lockersToCreate });
      }

      // 4. Refresh lockers
      await getAllLockerFunction();

      // 5. Reset state
      setLockerNumberToBeAdd([]);
      setLockersOldDeleteData([]);
      setLockersNewDeleteData([]);
    } catch (error) {
      handleError(error);
    }
  };

  const handleRoomNumberOperation = async () => {
    try {
      // 1. Filter out deleted new lockers (so they don't get added)
      const RoomNumberToCreate = roomNumberToBeAdded.filter(
        (roomNumber) =>
          !roomNumberToBeDeleteNew.some(
            (del) => del.name === roomNumber.name && del.roomTypeId === roomNumber.roomTypeId
          )
      );

      // 2. Extract old locker IDs to delete
      const roomNumbers = roomNumberToBeDelete
        .filter((roomNumber) => roomNumber._id) // Ensure _id exists
        .map((roomNumber) => roomNumber._id);

      // 3. API Calls
      if (roomNumbers.length > 0) {
        await deleteRoomNumberBulk({ roomNumbers });
      }

      if (RoomNumberToCreate.length > 0) {
        await createRoomNumberBulk({ roomNumbers: RoomNumberToCreate });
      }

      // 4. Refresh lockers
      await getAllRoomTypeFunction();

      // 5. Reset state
      setRoomNumberToBeAdded([]);
      setRoomNumberToBeDelete([]);
      setRoomNumberToBeDeleteNew([]);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubmit = async () => {
    try {
      await handleLockerOperation();
      await handleRoomNumberOperation();
      toast.success("Changes saved successfully!");
    } catch (error) {
      handleError(error);
    }
  };
  const handleCancel = async () => {
    try {
      setRoomNumberToBeAdded([]);
      setRoomNumberToBeDelete([]);
      setRoomNumberToBeDeleteNew([]);
      setLockerNumberToBeAdd([]);
      setLockersOldDeleteData([]);
      setLockersNewDeleteData([]);
      setState({
        center: { label: "Select", value: "" },
        roomtypes: [],
        roomNumbers: [],
        roomNumberMenuId: null,
        roomNumberInput: "",
        isModal: false,
        isRoomTypeModal: false,
        openMenuId: null,
        displayAddLockerInput: false,
        isDeleteModal: false
      });
    } catch (error) {
      handleError(error);
    }
  };

  const [roomTypeData, setRoomTypeData] = useState<IRoomTypeData>({
    name: "",
    maxOccupancy: "",
    order: "",
    pricePerDayPerBed: ""
    // centerId: state.center.value
  });

  const handleDataChange = (event: React.SyntheticEvent) => {
    const { name, value } = event.target as HTMLInputElement;
    setRoomTypeData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const [openRoomTypeId, setOpenRoomTypeId] = useState<string | null>(null);
  const [roomTypeDeleteId, setRoomTypeDeleteId] = useState("");
  const [isRoomTypeOpen, setIsRoomTypeOpen] = useState(false);

  const toggleDeleteRoomType = () => {
    setIsRoomTypeOpen(!isRoomTypeOpen);
  };

  const confirmRoomType = async () => {
    try {
      const response = await deleteRoomType(roomTypeDeleteId);
      if (response.data?.status == "success") {
        toast.success(response.data?.message);
        toggleDeleteRoomType();
        getAllRoomTypeFunction();
        setRoomTypeDeleteId("");
      }
    } catch (error) {
      handleError(error);
    }
  };

  const inputRef = useRef<HTMLInputElement | null>(null);
  const lockerRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (state.roomNumberMenuId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.roomNumberMenuId]);

  useEffect(() => {
    if (state.displayAddLockerInput && lockerRef.current) {
      lockerRef.current.focus();
    }
  }, [state.displayAddLockerInput]);

  return (
    <div>
      <div className="w-[1036px]!">
        <div className="bg-white mb-4 w-fit  flex flex-col rounded-xl items-center p-4">
          <div className="mx-auto w-3xl ">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm leading-5 font-semibold">Center & Resources</h2>
              <div
                onClick={toggleModal}
                className="text-[#6B7A0B] text-xs cursor-pointer font-normal underline"
              >
                Add Center
              </div>
            </div>
            <div className="border rounded-xl overflow-hidden">
              <div className="font-semibold text-xs text-nowrap whitespace-nowrap overflow-x-auto scrollbar-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#E9E8E5] border w-full">
                    <tr className="text-[#505050] text-xs w-full font-medium">
                      <th className="py-3 font-medium text-xs w-[30%] px-2">Center Name</th>
                      <th className="py-3 font-medium text-xs w-[40%] px-2">
                        Types of Room Created
                      </th>
                      <th className="py-3 font-medium text-xs w-[20%] px-2">Total Rooms</th>
                      <th className="py-3 font-medium text-xs w-[20%] px-2"></th>
                    </tr>
                  </thead>

                  <tbody className="bg-white w-full h-full">
                    {dropdown.center.data.length >= 1 &&
                      dropdown.center.data.map((value, index) => (
                        <tr
                          key={index}
                          className="hover:bg-[#F6F6F6C7] border-b border-[#DCDCDCE0]"
                        >
                          <td className=" px-2 w-[30%] py-3 flex items-center font-bold gap-2">
                            {value.centerName}
                          </td>
                          <td className="py-3 px-2 w-[40%]">
                            <div className="flex  ">
                              {roomTypeAndNumber &&
                                roomTypeAndNumber
                                  .filter((rtValue) => rtValue.centerId == value._id)
                                  .map((rtValue, rtIndex, arr) => {
                                    return (
                                      <div key={rtIndex} className="text-xs font-bold mr-1">
                                        {rtValue.name}
                                        {rtIndex < arr.length - 1 && ","}
                                      </div>
                                    );
                                  })}
                            </div>
                          </td>

                          <td className="py-3 px-2 w-[20%]">
                            <div className="text-xs text-gray-700">
                              {roomTypeAndNumber &&
                                roomTypeAndNumber
                                  .filter((rt) => rt.centerId === value._id)
                                  .reduce((sum, rt) => sum + rt.roomNumbers.length, 0)}
                            </div>
                          </td>
                          <td className="py-3 px-2 w-[10%]">
                            <div className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-lg hover:bg-[#D4E299] cursor-pointer">
                              <div className="text-xs cursor-pointer font-semibold p-2 ">
                                <div
                                  onClick={(e: SyntheticEvent) => toggleMenu(e, index)}
                                  className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-lg hover:bg-[#D4E299] cursor-pointer"
                                >
                                  <img alt="icon" src={kabab} className="w-full h-full" />
                                  {state.openMenuId === index.toString() && (
                                    <div
                                      ref={menuRef}
                                      className={`absolute text-nowrap whitespace-nowrap right-4 ${
                                        index <= 1 ? "top-0" : "bottom-0"
                                      } overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-xl z-10 flex items-center justify-center`}
                                    >
                                      <div className="p-2  text-nowrap whitespace-nowrap gap-2 flex-col flex justify-center items-start bg-white shadow-lg rounded-lg w-fit">
                                        <div className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap">
                                          <div
                                            onClick={() => {
                                              setState((prev) => {
                                                return {
                                                  ...prev,
                                                  center: {
                                                    label: value.centerName,
                                                    value: value._id
                                                  }
                                                };
                                              });
                                            }}
                                            className="flex items-center gap-2 cursor-pointer"
                                          >
                                            <div>
                                              <p>View Details & Edit</p>
                                            </div>
                                          </div>
                                        </div>
                                        <hr className="w-full" />
                                        <div className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap">
                                          <div
                                            onClick={() => handleEdit(value)}
                                            className="flex items-center  gap-2 cursor-pointer"
                                          >
                                            <div>
                                              <p>Edit</p>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap">
                                          <div
                                            onClick={() => handleDelete(value._id)}
                                            className="flex items-center text-red-600 gap-2 cursor-pointer"
                                          >
                                            <div>
                                              <p>Delete</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div
          className={`bg-white w-fit  flex flex-col rounded-xl items-center p-4 ${
            state.center.value ? "visible" : "hidden"
          }`}
        >
          <div className="mx-auto w-3xl ">
            <div className="text-black font-medium  ">
              Center: <span className="underline font-bold">{state.center.label}</span>
            </div>

            <div className="space-y-4 mt-4 rounded-lg border border-gray-200 p-4">
              {state.roomtypes.length > 0 &&
                state.roomtypes.map((roomType) => {
                  const currentRooms = roomType?.roomNumbers || [];
                  const isOpen = openRoomTypeId === roomType._id;

                  return (
                    <div key={roomType._id} className="mb-4 border rounded-md">
                      {/* DROPDOWN HEADER */}
                      <div className="flex justify-between items-center cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200">
                        <span className="font-semibold">
                          {roomType?.name} (Max Occupancy: {roomType?.maxOccupancy}, Price:{" "}
                          {roomType?.pricePerDayPerBed?.$numberDecimal})
                        </span>
                        <div className=" flex gap-2 items-center justify-center">
                          <CiEdit
                            onClick={() => handleRoomTypeEdit(roomType)}
                            className="cursor-pointer text-lg"
                          />
                          <MdDelete
                            onClick={() => {
                              setRoomTypeDeleteId(roomType._id);
                              toggleDeleteRoomType();
                            }}
                            className="text-red-400 cursor-pointer text-lg hover:text-red-700"
                          />

                          <span onClick={() => setOpenRoomTypeId(isOpen ? null : roomType._id)}>
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {/* DROPDOWN CONTENT */}
                      {isOpen && (
                        <div className="p-4 border-t">
                          <div className="grid grid-cols-6 gap-4 items-start">
                            {/* Room Numbers Section */}
                            <div className="col-span-5">
                              <label className="block mb-2 text-xs font-semibold">
                                Room Numbers
                              </label>
                              <div className="flex flex-wrap gap-2 p-2 items-center">
                                {currentRooms.map((rn: IRoomNumber, idx: number) => (
                                  <div key={idx} className="relative cursor-pointer group">
                                    <span
                                      className={`bg-[#F4F2F0] border border-[#F4F2F0] ${
                                        roomNumberToBeDelete.find(
                                          (data) =>
                                            data.name === rn.name &&
                                            data.roomTypeId === roomType._id
                                        )
                                          ? "border-red-500"
                                          : "border-[#F4F2F0]"
                                      } text-gray-900 text-xs font-semibold rounded-md px-3 py-1`}
                                    >
                                      {rn.name}
                                      {roomNumberToBeDelete.find(
                                        (data) =>
                                          data.name === rn.name && data.roomTypeId === roomType._id
                                      ) ? null : (
                                        <div
                                          onClick={() => {
                                            handleRoomNumberDelete(rn.name, roomType._id, "old");
                                          }}
                                          className="absolute -top-2 -right-2 hidden group-hover:block bg-gray-200 rounded-full p-0.5 cursor-pointer text-xs"
                                        >
                                          <RxCross2 />
                                        </div>
                                      )}
                                    </span>
                                  </div>
                                ))}
                                {roomNumberToBeAdded
                                  .filter(
                                    (room: { name: string; roomTypeId: string }) =>
                                      room.roomTypeId === roomType._id
                                  )
                                  .map((rn: IRoomNumberToAdded, idx: number) => (
                                    <div key={idx} className="relative cursor-pointer group">
                                      <span
                                        className={`bg-[#F4F2F0] border border-[#F4F2F0] ${
                                          roomNumberToBeDeleteNew.find(
                                            (data) =>
                                              data.name === rn.name &&
                                              data.roomTypeId === roomType._id
                                          )
                                            ? "border-red-500"
                                            : "border-[#F4F2F0]"
                                        } text-gray-900 text-xs font-semibold rounded-md px-3 py-1`}
                                      >
                                        {rn.name}
                                        {roomNumberToBeDeleteNew.find(
                                          (data) =>
                                            data.name === rn.name &&
                                            data.roomTypeId === roomType._id
                                        ) ? null : (
                                          <div
                                            onClick={() => {
                                              handleRoomNumberDelete(rn.name, roomType._id, "new");
                                            }}
                                            className="absolute -top-2 -right-2 hidden group-hover:block bg-gray-200 rounded-full p-0.5 cursor-pointer text-xs"
                                          >
                                            <RxCross2 />
                                          </div>
                                        )}
                                      </span>
                                    </div>
                                  ))}
                                <div>
                                  {state.roomNumberMenuId === roomType._id ? (
                                    <InputRef
                                      type="text"
                                      ref={inputRef}
                                      className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                                      placeholder="Add room Number"
                                      onBlur={() => {
                                        addRoomNumber(roomType.maxOccupancy, roomType._id);
                                      }}
                                      value={roomNumberInputValue}
                                      onChange={(e) => setRoomNumberInputValue(e.target.value)}
                                      onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        addRoomNumber(roomType.maxOccupancy, roomType._id)
                                      }
                                    />
                                  ) : (
                                    <Button
                                      onClick={() =>
                                        setState((prev) => ({
                                          ...prev,
                                          roomNumberMenuId: roomType._id
                                        }))
                                      }
                                      className="flex! bg-[#ECF3CA]! px-3! py-1! text-xs font-semibold text-gray-900 rounded-md "
                                    >
                                      +Add
                                    </Button>
                                  )}
                                </div>
                                {/* Add Room Input / Button */}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

              <Button
                type="button"
                onClick={() => {
                  toggleIsRoomTypeModal();
                }}
                className="focus:ring-olive-700 mt-2 w-full rounded-md bg-[#E9F0C9] py-2 text-xs font-semibold text-gray-900 hover:bg-[#d6e0a3] focus:ring-2 focus:outline-none"
              >
                Add 1 More
              </Button>
            </div>

            <div className="mt-6 space-y-3  rounded-lg border border-gray-200 p-4">
              <label htmlFor="locker" className="mb-1 block text-xs font-semibold">
                Locker
              </label>
              <div className=" rounded-xl  space-y-2">
                <div className="text-xs font-medium text-gray-700 mb-2">Add Locker Number</div>
                <div className="flex border max-h-60 overflow-y-scroll border-[#C5C5C5] rounded-lg flex-wrap gap-2 p-2">
                  {[...lockersData].map((value, index) => {
                    return (
                      <div className="relative mx-2 group cursor-pointer">
                        <span
                          key={index}
                          className={`bg-[#F4F2F0] border border-[#F4F2F0] ${
                            lockersDeleteOldData.find((data) => data._id === value._id)
                              ? "border-red-500"
                              : "border-[#F4F2F0]"
                          } text-gray-900 text-xs font-semibold rounded-md px-3 py-1`}
                        >
                          {value.name}
                        </span>
                        {lockersDeleteOldData.find((data) => data._id === value._id) ? null : (
                          <div
                            onClick={() => {
                              handleLockerDelete(value.name, "old");
                            }}
                            className="absolute cursor-pointer -top-2 -right-2 text-xs rounded-full bg-gray-200 p-0.5 hidden group-hover:block"
                          >
                            <RxCross2 />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {[...lockerNumberToBeAdd].map((value, index) => {
                    return (
                      <div className="relative mx-2 group cursor-pointer">
                        <span
                          key={index}
                          className={`bg-[#F4F2F0] border border-[#F4F2F0] ${
                            lockersDeleteNewData.find((data) => data.name === value.name)
                              ? "border-red-500"
                              : "border-[#F4F2F0]"
                          } text-gray-900 text-xs font-semibold rounded-md px-3 py-1`}
                        >
                          {value.name}
                        </span>
                        {lockersDeleteNewData.find((data) => data.name === value.name) ? null : (
                          <div
                            onClick={() => {
                              handleLockerDelete(value.name, "new");
                            }}
                            className="absolute cursor-pointer -top-2 -right-2 text-xs rounded-full bg-gray-200 p-0.5 hidden group-hover:block"
                          >
                            <RxCross2 />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div>
                    {state.displayAddLockerInput ? (
                      <InputRef
                        type="text"
                        ref={lockerRef}
                        onKeyDown={(e) => e.key === "Enter" && addLockerNumber()}
                        onBlur={() => {
                          addLockerNumber();
                        }}
                        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none"
                        placeholder="Add Locker Number"
                        value={lockerInputValue}
                        onChange={(e) => {
                          setLockerInputValue(e.target.value);
                        }}
                      />
                    ) : (
                      <Button
                        onClick={() => {
                          setState((prev) => ({ ...prev, displayAddLockerInput: true }));
                        }}
                        className="flex! bg-[#ECF3CA]! px-3! py-1! text-xs font-semibold text-gray-900 rounded-md "
                      >
                        +Add
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button
                type="button"
                onClick={handleSubmit}
                variant="outlined"
                size="base"
                className="min-w-[150px]! text-xs! px-[30px]! py-[10px]! rounded-[10px]!"
              >
                Save
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outlined"
                size="base"
                className="min-w-[150px]! border-red-500! text-red-500! text-xs! px-[30px]! py-[10px]! rounded-[10px]!"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={state.isModal}
        toggleModal={() => {
          toggleModal();
          setCenterData({
            centerName: "",
            googleMapLink: ""
          });
          setEditCid("");
        }}
        crossIcon
      >
        <div className="flex rounded-xl w-[473px] py-10 items-center justify-center bg-white">
          <div className="w-full max-w-md rounded-lg px-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add Center </h2>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Input
                label="Center Name"
                placeholder="Enter"
                name="centerName"
                containerClass="col-span-2"
                className="w-full  rounded-[7px]! border border-gray-300 px-3 py-3!"
                labelClassName="text-black! font-medium!"
                value={centerData.centerName}
                onChange={(e) => {
                  handleCenterDataChange(e);
                }}
              />
              <Input
                label="Google Map Link"
                placeholder="Enter"
                name="googleMapLink"
                containerClass="col-span-2"
                className="w-full  rounded-[7px]! border border-gray-300 px-3 py-3!"
                labelClassName="text-black! font-medium!"
                value={centerData.googleMapLink}
                onChange={(e) => {
                  handleCenterDataChange(e);
                }}
              />

              <Button
                onClick={() => {
                  handleCreateCenterFunction();
                }}
                className="w-full hover:bg-[#323E2A]! col-span-2 rounded-lg cursor-pointer bg-[#323E2A] px-4 py-2 font-semibold text-white shadow-sm "
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={state.isRoomTypeModal}
        toggleModal={() => {
          toggleIsRoomTypeModal();
          setEditCid("");
          setRoomTypeData({
            name: "",
            maxOccupancy: "",
            order: "",
            pricePerDayPerBed: ""
          });
        }}
        crossIcon
      >
        <div className="flex rounded-xl w-[473px] py-10 items-center justify-center bg-white">
          <div className="w-full max-w-md rounded-lg px-3">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add Room Type</h2>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <Input
                label="Name"
                placeholder="Enter"
                name="name"
                containerClass="col-span-2"
                className="w-full  rounded-[7px]! border border-gray-300 px-3 py-3!"
                labelClassName="text-black! font-medium!"
                value={roomTypeData.name}
                onChange={(e) => {
                  handleDataChange(e);
                }}
              />
              <Input
                label="Max Occupancy"
                placeholder="Enter"
                name="maxOccupancy"
                containerClass="col-span-2"
                className="w-full  rounded-[7px]! border border-gray-300 px-3 py-3!"
                labelClassName="text-black! font-medium!"
                value={roomTypeData.maxOccupancy}
                onChange={(e) => {
                  handleDataChange(e);
                }}
              />
              <Input
                label="Order"
                placeholder="Enter"
                name="order"
                containerClass="col-span-2"
                className="w-full  rounded-[7px]! border border-gray-300 px-3 py-3!"
                labelClassName="text-black! font-medium!"
                value={roomTypeData.order}
                onChange={(e) => {
                  handleDataChange(e);
                }}
              />
              <Input
                label="Price Per Bed"
                placeholder="Enter"
                name="pricePerDayPerBed"
                containerClass="col-span-2"
                className="w-full  rounded-[7px]! border border-gray-300 px-3 py-3!"
                labelClassName="text-black! font-medium!"
                value={roomTypeData.pricePerDayPerBed}
                onChange={(e) => {
                  handleDataChange(e);
                }}
              />

              <Button
                onClick={() => {
                  handleCreateRoomTypeFunction();
                }}
                className="w-full hover:bg-[#323E2A]! col-span-2 rounded-lg cursor-pointer bg-[#323E2A] px-4 py-2 font-semibold text-white shadow-sm "
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirm
        isModalOpen={isModalOpen}
        confirmDeleteNote={confirmDeleteNote}
        toggleModal={toggleDeleteModal}
      />

      <DeleteConfirm
        isModalOpen={isLockerOpen}
        confirmDeleteNote={confirmDeleteLocker}
        toggleModal={toggleDeleteLockerModal}
      />

      <DeleteConfirm
        isModalOpen={isRoomTypeOpen}
        confirmDeleteNote={confirmRoomType}
        toggleModal={toggleDeleteRoomType}
      />
      <DeleteConfirm
        isModalOpen={roomNumberDeleteModal}
        confirmDeleteNote={confirmDeleteRoomNumber}
        toggleModal={toggleRoomNumberDeleteModal}
      />
    </div>
  );
};

export default Center;
