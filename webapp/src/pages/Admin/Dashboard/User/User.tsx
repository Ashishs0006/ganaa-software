import {
  MouseEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import moment from "moment";
import toast from "react-hot-toast";
import { IData, IState } from "./types";
import { RootState } from "@/redux/store/store";
import { getAllUser, createUser, updateUser, deleteUser, resetPassword } from "@/apis";
import kabab from "@/assets/images/kebab-menu.svg";
import { IUser, resetUser, setUsers } from "@/redux/slice/userSlice";
import calender from "@/assets/images/calender.svg";
import { useDispatch, useSelector } from "react-redux";
import { ISelectOption } from "@/components/Select/types";
import { convertDate } from "@/components/BasicDetaills/utils";
import {
  Button,
  CropperImage,
  CustomCalendar,
  DeleteConfirm,
  Input,
  Loader,
  Modal,
  Multiselected,
  Pagination,
  Select
} from "@/components";
import { LuUserRound } from "react-icons/lu";
import handleError from "@/utils/handleError";
import { useSearchParams } from "react-router-dom";

const User = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const menuRef = useRef<HTMLDivElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [data, setData] = useState<IData>({
    _id: "",
    firstName: "",
    lastName: "",
    dob: "",
    phoneNumberCountryCode: { label: "Select", value: "" },
    phoneNumber: "",
    email: "",
    profilePic: "",
    role: { label: "Select", value: "" },
    gender: "Male",
    centerId: []
  });

  const [dataToCheck, setDataToCheck] = useState<IData>({
    _id: "",
    firstName: "",
    lastName: "",
    dob: "",
    phoneNumberCountryCode: { label: "Select", value: "" },
    phoneNumber: "",
    email: "",
    profilePic: "",
    role: { label: "Select", value: "" },
    gender: "Male",
    centerId: []
  });

  const userData = useSelector((store: RootState) => store.users);
  const dropdown = useSelector((store: RootState) => store.dropdown);
  const roles = useSelector((store: RootState) => store.roles);

  const [state, setState] = useState<IState>({
    openMenuId: null,
    isResetModal: false,
    loading: false,
    toggleAddModal: false,
    showModal: false,
    croppedImage: "",
    isDeleteModal: false
  });

  const rolesData = useMemo<ISelectOption[]>(() => {
    if (roles.loading) return [];
    const roleList = [{ label: "Select", value: "" }];
    roles.data.forEach((role) => {
      roleList.push({ label: role.name || "", value: role._id || "" });
    });

    return roleList;
  }, [roles.data, roles.loading]);

  const handleChange = (event: React.SyntheticEvent) => {
    const { name, value, type, files } = event.target as HTMLInputElement;
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
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelect = (key: string, value: ISelectOption) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };
  const handleMultiSelect = (value: string[]) => {
    setData((prev) => ({ ...prev, centerId: value }));
  };

  const handleDateTimeChange = (data: string) => {
    let value = "";
    if (data) {
      value = moment(data).format("YYYY-MM-DD");
    }
    setData((prev) => ({ ...prev, dob: value }));
  };

  const getAllUsersFunction = async () => {
    try {
      const page = searchParams.get("page") || 1;
      const response = await getAllUser({
        limit: 10,
        page,
        roles: "doctor,therapist,admin,sales,finance,admission manager,Therapist+AM,ROM+AM,IT"
      });
      if (response.data.status == "success") {
        dispatch(setUsers(response?.data));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditUserFunction = (user: IUser) => {
    if (user) {
      setData((prev) => ({
        ...prev,
        _id: user._id,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        dob: user.dob ?? "",
        phoneNumberCountryCode: { label: "+91", value: "+91" },
        phoneNumber: user.phoneNumber ?? "",
        email: user.email ?? "",
        profilePic: user.profilePic ?? "",
        role: { label: user.roleId?.name ?? "Select", value: user.roleId?._id ?? "" },
        centerId: user.centerId.map((data) => data._id || ""),
        isDeleted: user?.isDeleted || false
      }));
      setDataToCheck((prev) => ({
        ...prev,
        _id: user._id,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        centerId: user.centerId.map((data) => data._id || ""),
        dob: user.dob ?? "",
        phoneNumberCountryCode: { label: "+91", value: "+91" },
        phoneNumber: user.phoneNumber ?? "",
        email: user.email ?? "",
        profilePic: user.profilePic ?? "",
        role: { label: user.roleId?.name ?? "Select", value: user.roleId?._id ?? "" },
        isDeleted: user?.isDeleted || false
      }));
      toggleModal();
    }
  };

  const createAndUpdateUserFunction = async () => {
    const isValid =
      data.dob &&
      data.firstName &&
      data.lastName &&
      data?.centerId?.length > 0 &&
      data.email &&
      data.gender &&
      data.role?.value &&
      data.phoneNumber &&
      data.phoneNumberCountryCode;

    if (!isValid) return toast.error("Kindly Fill All Fields");

    const body = {
      ...data,
      roleId: data.role?.value,
      centerId: data.centerId
    };
    delete body.role;

    if (body.email === dataToCheck.email) {
      delete (body as { email?: string }).email;
    }

    const formData = new FormData();

    for (const key in body) {
      if (!Object.prototype.hasOwnProperty.call(body, key)) continue;

      const value = body[key as keyof typeof body];

      if (value === undefined || value === null) continue;

      // 🔹 Special handling for DOB
      if (key === "dob") {
        // Always send as YYYY-MM-DD (no timezone issues)
        formData.append("dob", value.toString());
        continue;
      }

      // 🔹 Special handling for centerId (array of ObjectIds)
      if (key === "centerId" && Array.isArray(value)) {
        value.forEach((id: string) => formData.append("centerId", id));
        continue;
      }

      // 🔹 Everything else
      formData.append(key, value.toString());
    }

    // Handle profilePic separately
    if (data.profilePic && fileInputRef) {
      formData.delete("profilePic");
      formData.append("profilePic", data.profilePic);
    }

    try {
      let response;

      if (data._id) {
        delete body._id;
        response = await updateUser(data._id, formData);
      } else {
        response = await createUser(formData);
      }

      // Reset form
      setData({
        _id: "",
        firstName: "",
        lastName: "",
        dob: "",
        phoneNumberCountryCode: { label: "Select", value: "" },
        phoneNumber: "",
        email: "",
        role: { label: "Select", value: "" },
        gender: "Male",
        centerId: [],
        profilePic: null
      });

      if (response?.data?.status === "success") {
        toggleModal();
        toast.success(data._id ? "Successfully Updated" : "Successfully Created");
        getAllUsersFunction();
      } else {
        toast.error(response.data.message || "Something went wrong");
      }
    } catch (error) {
      handleError(error);
    }
  };

  const deleteUserFunction = async (id: string, confirm: boolean = false) => {
    try {
      if (confirm) {
        const response = await deleteUser(id);
        if (response.data.status == "success") {
          setData((prev) => ({ ...prev, _id: "" }));
          toast.success("User Deleted");
          setState((prev) => ({ ...prev, isDeleteModal: false }));
          getAllUsersFunction();
        }
      } else {
        setState((prev) => ({ ...prev, isDeleteModal: true }));
        setData((prev) => ({ ...prev, _id: id }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleMenu = (_e: SyntheticEvent, id: string | number) => {
    setState((prev) => ({
      ...prev,
      openMenuId: state.openMenuId === id ? null : id.toString()
    }));
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
    getAllUsersFunction();
  }, [searchParams.get("page")]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const toggleModal = () => {
    setState((prev) => ({ ...prev, toggleAddModal: !prev.toggleAddModal }));
  };

  const handleRemoveImg = (e: SyntheticEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setData((prev) => ({ ...prev, profilePic: "" }));
  };

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleCropDone = (croppedImg: File) => {
    setData((prev) => ({ ...prev, profilePic: croppedImg }));
    setState((prev) => ({ ...prev, showModal: false }));
  };

  const handleCropCancel = () => {
    setState((prev) => ({ ...prev, showModal: false }));
  };

  const handleResetPassword = async (id: string) => {
    try {
      const response = await resetPassword(id);
      if (response.data.status == "success") {
        toast.success("Password Reset Successfully");
      } else {
        toast.error("Unable To Reset");
      }
      setState((prev) => ({ ...prev, isResetModal: false }));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(resetUser());
    };
  }, []);

  return (
    <div>
      <div className="w-[1036px]!">
        <div className=" bg-white w-full gap-6 flex-col rounded-xl flex items-start  p-4">
          <div className="flex justify-between items-end w-full">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold">User Management</p>
            </div>
            <div className="flex items-center text-nowrap whitespace-nowrap justify-center gap-2">
              {/* <div className="flex cursor-pointer bg-[#575F4A] text-white font-semibold items-center text-xs justify-center px-3 py-2 border border-[#D4D4D4] rounded-lg">
                All Filters
                <MdKeyboardArrowDown size={15} />
              </div> */}
              <div
                onClick={() => {
                  toggleModal();
                }}
                className="flex cursor-pointer  font-semibold items-center text-xs justify-center px-3 py-2 text-[#7C8E30] underline rounded-lg"
              >
                Add Users
              </div>
            </div>
          </div>
          <div className="font-semibold text-xs  w-full text-nowrap whitespace-nowrap overflow-x-auto scrollbar-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#E9E8E5]  w-full">
                <tr className="text-[rgb(80,80,80)] text-xs w-full font-medium">
                  <th className="py-3 px-3 w-1/7">S.No</th>
                  <th className="py-3 px-3 w-[200px]">First Name</th>
                  <th className="py-3 px-3 w-1/7">Email</th>
                  <th className="py-3 px-3 w-1/7">Mobile Number</th>
                  <th className="py-3 px-3 w-1/7">Role Type</th>
                  <th className="py-3 px-3 w-[200px]">Center</th>
                  <th className="py-3 px-3 w-1/7"></th>
                </tr>
              </thead>

              <tbody className="bg-white w-full h-full">
                {userData.data.length >= 1 &&
                  userData.data.map((user, index) => (
                    <tr
                      key={index}
                      className={` border-b border-[#DCDCDCE0] ${
                        user.isDeleted ? "bg-gray-200" : "hover:bg-[#F6F6F6C7]"
                      } `}
                    >
                      <td className="py-3 px-3 w-1/7">{index + 1}</td>
                      <td className="py-3 px-3 w-[200px] flex items-center gap-2">
                        <div
                          className={`flex rounded-full overflow-hidden w-[40px] h-[40px] items-center justify-center`}
                        >
                          <div className="flex rounded-full w-full h-full bg-[#EFCEC1] text-[#7E6055] border border-[white]  overflow-hidden  items-center justify-center">
                            {user?.profilePic ? (
                              <img
                                src={String(user.profilePic)}
                                alt="profile"
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="uppercase">
                                {user?.firstName?.slice(0, 1)}
                                {user?.lastName?.slice(0, 1)}
                              </div>
                            )}
                          </div>
                        </div>
                        <p
                          className="w-[50%] truncate"
                          title={`${user.firstName} ${user?.lastName}`}
                        >
                          {user.firstName} {user?.lastName}
                        </p>
                      </td>
                      <td className="py-3 px-3 w-1/7">{user.email}</td>
                      <td className="py-3 px-3 w-1/7">{user?.phoneNumber || 9012929592}</td>
                      <td className="py-3 px-3 w-1/7">{user.roleId?.name}</td>
                      <td className="py-3 px-3 w-1/7">
                        <div
                          className=" w-[200px] truncate"
                          title={user.centerId.map((data) => data.centerName).join(", ")}
                        >
                          {user.centerId.map((data) => data.centerName).join(", ")}
                        </div>
                      </td>
                      <td className="py-3 px-3 w-1/7">
                        <div
                          onClick={(_e) => {}}
                          className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-lg hover:bg-[#D4E299] cursor-pointer"
                        >
                          <div
                            onClick={() => {}}
                            className="text-xs cursor-pointer font-semibold p-2 "
                          >
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
                                  {!user.isDeleted ? (
                                    <div className="p-2  text-nowrap whitespace-nowrap gap-2 flex-col flex justify-center items-start bg-white shadow-lg rounded-lg w-fit">
                                      <div className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap">
                                        <div
                                          onClick={() => {
                                            handleEditUserFunction(user);
                                            setState((prev) => ({ ...prev, openMenuId: null }));
                                          }}
                                          className="flex items-center gap-2 cursor-pointer"
                                        >
                                          <div>
                                            <p>View Details & Edit</p>
                                          </div>
                                        </div>
                                      </div>
                                      <hr className="w-full" />
                                      <div
                                        onClick={() => {
                                          setState((prev) => ({
                                            ...prev,
                                            isResetModal: true,
                                            openMenuId: null
                                          }));
                                          setData((prev) => ({ ...prev, _id: user._id }));
                                        }}
                                        className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap"
                                      >
                                        <div className="flex items-center gap-2 cursor-pointer">
                                          <div>
                                            <p>Reset Password</p>
                                          </div>
                                        </div>
                                      </div>
                                      <hr className="w-full" />
                                      <div
                                        onClick={() => {
                                          if (user?._id) {
                                            deleteUserFunction(user._id);
                                            setState((prev) => ({ ...prev, openMenuId: null }));
                                          }
                                        }}
                                        className="text-xs cursor-pointer font-semibold p-2 "
                                      >
                                        <div className="flex items-center gap-2">
                                          <div>
                                            <p className="">Delete</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="p-2 cursor-default  text-nowrap whitespace-nowrap gap-2 flex-col flex justify-center items-start bg-white shadow-lg rounded-lg w-fit">
                                      <div className="text-xs font-semibold  p-2 text-nowrap whitespace-nowrap">
                                        <div className="flex items-center gap-2 ">
                                          <div>
                                            <p className="text-red-400">This User is Deleted</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
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
          <div className="w-full flex items-end justify-end">
            <Pagination totalPages={userData.pagination.totalPages} />
          </div>
        </div>
      </div>
      <Modal
        isOpen={state.toggleAddModal}
        toggleModal={() => {
          toggleModal();
          setData({
            _id: "",
            firstName: "",
            lastName: "",
            dob: "",
            phoneNumberCountryCode: { label: "Select", value: "" },
            phoneNumber: "",
            email: "",
            profilePic: "",
            role: { label: "Select", value: "" },
            gender: "Male",
            centerId: []
          });
        }}
        crossIcon
      >
        <div className="p-8">
          <form
            className="w-full "
            onSubmit={(e) => e.preventDefault()}
            noValidate
            autoComplete="off"
          >
            <p className="font-bold text-[18px] mb-5">Add User</p>
            <div className="w-full grid md:grid-cols-2 lg:grid-cols-3 lg:gap-x-[70px] md:gap-x-[40px]  gap-y-[30px]">
              <Input
                id="firstName"
                type="text"
                required
                label="First Name"
                placeholder="Enter"
                name="firstName"
                maxLength={100}
                labelClassName="text-black!"
                className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                value={data.firstName}
                onChange={handleChange}
              />
              <Input
                id="lastName"
                type="text"
                required
                label="Last Name"
                placeholder="Enter"
                name="lastName"
                maxLength={100}
                labelClassName="text-black!"
                className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                value={data.lastName}
                onChange={handleChange}
              />
              <CustomCalendar
                value={data.dob}
                disabledDate={(current) => {
                  if (!current) return false;

                  const maxDate = new Date();
                  maxDate.setHours(0, 0, 0, 0); // normalize

                  const currentDate = current.toDate(); // Convert from Moment to JS Date
                  currentDate.setHours(0, 0, 0, 0); // normalize

                  return currentDate > maxDate;
                }}
                // disabledDate={(current) => {
                //   const maxDate = new Date();
                //   maxDate.setDate(maxDate.getDate()); // Set maximum date to two days after today

                //   return current > maxDate; // Disable dates outside the range
                // }}
                onChange={(date) => {
                  handleDateTimeChange(date);
                }}
              >
                <div className="flex flex-col w-full">
                  <label htmlFor="dob" className="block mb-1.5  ml-0.5 text-sm font-medium">
                    Date of Birth <span>*</span>
                  </label>
                  <div
                    id="dob"
                    className="flex cursor-pointer w-full justify-between relative items-center   border-2 border-gray-300 p-3 uppercase rounded-[7px]! font-medium"
                  >
                    {data?.dob ? (
                      <p className="font-bold text-sm"> {convertDate(data.dob)}</p>
                    ) : (
                      <p className="text-gray-500 font-medium">DD/MM/YYYY</p>
                    )}
                    <div className=" flex items-center justify-center w-5 h-5">
                      <img src={calender} alt="calender" className="w-full h-full" />
                    </div>
                  </div>
                </div>
              </CustomCalendar>
              <div className="flex gap-1 w-full  items-start flex-col">
                <p className="block  ml-0.5 text-sm font-medium">
                  Phone No.<span>*</span>
                </p>
                <div className="flex w-full items-center border-2 h-fit border-gray-300  rounded-[7px]!  focus-within:border-primary-dark">
                  <Select
                    containerClass="w-fit!"
                    className="border-none w-[80px]!  truncate gap-1 font-semibold"
                    options={[{ label: "+91", value: "+91" }]}
                    optionClassName="w-[130px]!"
                    placeholder="Select"
                    onChange={() => {}}
                    value={{ label: "+91", value: "+91" }}
                    name="phoneNumberCountryCode"
                  />
                  <hr className="block mx-2 w-[2px] h-10 bg-gray-200" />

                  <div className="relative w-full h-full flex items-center">
                    <Input
                      className="border-none h-full focus-within:border-0 font-bold placeholder:font-normal pl-0"
                      value={data.phoneNumber}
                      onChange={handleChange}
                      maxLength={10}
                      id="phoneNumber"
                      type="text"
                      placeholder="Enter"
                      name="phoneNumber"
                    />
                  </div>
                </div>
              </div>
              <Input
                id="email"
                type="text"
                required
                label="Email"
                placeholder="Enter"
                name="email"
                maxLength={100}
                labelClassName="text-black!"
                className="w-[228px] rounded-[7px]! font-bold placeholder:font-normal"
                value={data.email}
                onChange={handleChange}
              />

              <Multiselected
                label="Center*"
                options={dropdown.center.data.map((value) => ({
                  label: value.centerName,
                  value: value._id
                }))}
                placeholder="Select"
                // className="bg-[#F4F2F0]! border-[#DEDEDE]!"
                value={data.centerId || []}
                onChange={handleMultiSelect}
              />

              <Select
                label="Role Type"
                required
                options={rolesData}
                placeholder="Select"
                // className="bg-[#F4F2F0]! border-[#DEDEDE]!"
                value={data.role || { label: "Select", value: "" }}
                onChange={handleSelect}
                name={"role"}
              />

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
                        checked={data.gender === "Male"}
                        name="gender"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Male"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                          data.gender === "Male" ? " border-[#586B3A]!" : "border-[#586B3A]"
                        }`}
                      >
                        {data.gender === "Male" && (
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
                        checked={data.gender === "Female"}
                        name="gender"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Female"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                          data.gender === "Female" ? "border-[#586B3A]!" : "border-[#586B3A]"
                        }`}
                      >
                        {data.gender === "Female" && (
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
                        checked={data.gender === "Other"}
                        name="gender"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Other"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                          data.gender === "Other" ? "border-[#586B3A]!" : "border-[#586B3A]"
                        }`}
                      >
                        {data.gender === "Other" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="Other" className="ms-2 text-sm font-medium">
                      Other
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-start flex-col gap-3 w-full">
                <p className="block ml-0.5 text-sm font-medium">Profile Photo</p>
                {data.profilePic ? (
                  <div className="py-3 px-2 w-full flex gap-2 rounded-lg items-center justify-start border-dashed border-[#A5A5A5] border-2 cursor-pointer">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      {typeof data.profilePic === "string" ? (
                        <img src={data.profilePic} alt="profile Pic" className="w-full h-full" />
                      ) : (
                        <img
                          src={URL.createObjectURL(data.profilePic)}
                          className="w-12 h-12"
                          alt="profile Pic"
                        />
                      )}
                    </div>
                    <div>
                      {data.profilePic && (
                        <p className="text-[#7E7E7E] w-[100px] truncate font-medium text-xs">
                          {typeof data.profilePic !== "string"
                            ? data.profilePic.name
                            : data.profilePic?.split("-").pop()}
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
                  name="profilePic"
                  // value={data.profilePic}
                  accept="image/jpeg ,image/png, image/jpg"
                  style={{ display: "none" }}
                  onChange={handleChange}
                />
                {/* {errors?.patientPic && <p className="text-red-600">{errors?.patientPic}</p>} */}
              </div>
            </div>
            <div className="w-full flex gap-x-5 items-center mt-12 justify-center">
              <Button
                type="submit"
                name="save"
                disabled={state.loading}
                className="min-w-[150px]! text-xs! bg-[#323E2A]! text-white! px-[30px]! py-[15px]! rounded-[10px]!"
                variant="outlined"
                size="base"
                onClick={(_e) => {
                  createAndUpdateUserFunction();
                }}
              >
                Save {state.loading && <Loader size="xs" />}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      <DeleteConfirm
        isModalOpen={state.isDeleteModal}
        toggleModal={() => {
          setState((prev) => ({ ...prev, isDeleteModal: false }));
        }}
        confirmDeleteNote={() => {
          if (data._id) deleteUserFunction(data._id, true);
        }}
      />

      <DeleteConfirm
        btn2="Yes, Reset"
        isModalOpen={state.isResetModal || false}
        toggleModal={() => {
          setState((prev) => ({ ...prev, isResetModal: state.isResetModal! }));
        }}
        title="Are you sure you want to Reset this User?"
        confirmDeleteNote={() => {
          if (data._id) handleResetPassword(data._id);
        }}
      />
    </div>
  );
};

export default User;
