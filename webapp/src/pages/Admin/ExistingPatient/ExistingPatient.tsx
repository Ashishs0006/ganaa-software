/* eslint-disable no-constant-condition */
// TODO:   Still Have to Refactor It and changes After Discussion
import React, { SyntheticEvent, useEffect, useRef, useState } from "react";

import { IoSearchOutline } from "react-icons/io5";

import { Button, CustomCalendar, EmptyPage, Input, Modal, Pagination } from "@/components";

import ExistingImg from "@/assets/images/emptySearchBg.png";

import { IExistingState } from "@/pages/Admin/ExistingPatient/types";
import moment from "moment";
import {
  calculateDateDifferenceDetailed,
  capitalizeFirstLetter,
  formatDate,
  formateNormalDate,
  formatId
} from "@/utils/formater";

import calendar from "@/assets/images/calender.svg";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { reAdmitNewpatient, searchPatient } from "@/apis";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { setAllPatient } from "@/redux/slice/patientSlice";
import { Iadmission, IexistingPatient } from "../PatientData/InpatientData/types";
import handleError from "@/utils/handleError";
import ConfirmModal from "@/components/ConfirmModal/ConfirmModal";

interface IData {
  patientName: string;
  DOB: string;
  mobileNumber: string;
  uhid: string;
}

const ExistingPatient = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [state, setState] = useState<IExistingState>({
    isDropdownOpen: false,
    search: true
  });

  const [modalData, setModalData] = useState<IexistingPatient>();

  const [data, setData] = useState<IData>({
    patientName: "",
    DOB: "",
    mobileNumber: "",
    uhid: ""
  });
  const [modal, setModal] = useState<boolean>(false);

  const toggleModal = () => {
    setModal(!modal);
  };
  const toggleModalData = (data: IexistingPatient) => {
    setModalData(data);
    setModal(!modal);
  };
  const patientData = useSelector((store: RootState) => store.patient);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setState((prev) => ({ ...prev, isDropdownOpen: false }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // const toggleDropdown = useCallback((select: keyof IExistingState) => {
  //   setState((prev) => ({
  //     ...prev,
  //     [select]: !prev[select]
  //   }));
  // }, []);

  const handleClick = (_e: SyntheticEvent) => {
    addSearchInQuery();
  };

  const handleChange = (event: React.SyntheticEvent) => {
    const { name, value } = event.target as HTMLInputElement;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (data: string) => {
    let value = "";
    if (data) {
      value = moment(data).format("YYYY-MM-DD");
    }
    setData((prev) => ({ ...prev, DOB: value }));
  };

  const searchPatientFunction = async () => {
    const currentPage = searchParams.get("page") || "1";

    const patientName = searchParams.get("name");
    const phoneNumber = searchParams.get("phoneNumber");
    const uhid = searchParams.get("uhid");
    const dob = searchParams.get("dob");
    const sort = "-createdAt";

    try {
      const response = await searchPatient({
        limit: patientData.allPatient.pagination.limit,
        sort: sort,
        page: currentPage,
        // status: "All",
        ...(searchParams.get("name") && { name: patientName }),
        ...(searchParams.get("phoneNumber") && { phoneNumber: phoneNumber }),
        ...(searchParams.get("uhid") && { uhid: uhid }),
        ...(searchParams.get("dob") && { dob: dob })
      });

      dispatch(setAllPatient(response?.data));
    } catch (err) {
      console.error("Error fetching patients:", err);
      throw new Error("Failed to fetch patient data");
    }
  };

  const addSearchInQuery = () => {
    if (data.patientName.trim()) {
      searchParams.set("name", data.patientName);
    } else {
      searchParams.delete("name");
    }

    if (data.DOB.trim()) {
      searchParams.set("dob", data.DOB);
    } else {
      searchParams.delete("dob");
    }

    if (data.mobileNumber) {
      searchParams.set("phoneNumber", data.mobileNumber);
    } else {
      searchParams.delete("phoneNumber");
    }

    if (data.uhid) {
      searchParams.set("uhid", data.uhid);
    } else {
      searchParams.delete("uhid"); // Fixed typo: was "delet"
    }

    setSearchParams(searchParams);
  };

  useEffect(() => {
    searchPatientFunction();
  }, [searchParams]);

  const [admitModal, setAdmitModal] = useState<boolean>(false);
  const [admitid, setAdmitId] = useState<string>("");

  const toggleModalAdmitModal = (id: string) => {
    setAdmitId(id);
    setAdmitModal(!admitModal);
  };
  const toggleModalAdmit = () => {
    setAdmitModal(!admitModal);
  };

  const readminFunction = async () => {
    try {
      const { data } = await reAdmitNewpatient(admitid, {});
      if (data.status === "success") {
        toggleModalAdmit();
        navigate(`/admin/update-patient/${admitid}/${data.data._id}`);
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className=" bg-[#F4F2F0] p-4 bg-center  min-h-[calc(100vh-64px)] w-full bg-cover bg-no-repeat">
      <div
        id="Existing-Patient-Page"
        className={`container ${
          state.search ? "gap-[85px]" : "gap-[32px]"
        }  flex-col  flex items-center w-full p-2 sm:p-0`}
      >
        <div className="flex-col flex gap-[19px] items-center mt-8">
          <p className="font-bold text-[22px]">
            Search Existing Patient{" "}
            <span className="text-[#505050] ml-1 text-xs font-semibold">
              {`(Total ${patientData?.allPatient?.pagination?.totalDocuments} Available)`}
            </span>
          </p>

          <form
            className="p-2 rounded-lg bg-white flex items-center"
            onSubmit={(e) => {
              e.preventDefault(); // Prevent form submission/page refresh
              handleClick(e); // Call your search function instead
            }}
          >
            {/* <div className="relative p-2" ref={dropdownRef}>
              <div
                className="flex items-center gap-20"
                onClick={(_e: SyntheticEvent) => toggleDropdown("isDropdownOpen")}
              >
                <div className="w-full flex gap-4 items-center">
                  <div>
                    <IoSearchOutline className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-md cursor-pointer w-full whitespace-nowrap">
                    Patient Name
                  </p>
                </div>
                <div>
                  {state.isDropdownOpen ? (
                    <FaAngleUp className="w-6 h-6" />
                  ) : (
                    <FaAngleDown className="w-6 h-6" />
                  )}
                </div>
              </div>

              {state.isDropdownOpen && (
                <div className="absolute left-0 mt-1 top-[125%] bg-white shadow-lg rounded-md w-[210px]">
                  <ul className="py-2 px-2 flex gap-4 flex-col justify-center">
                    <div className="flex gap-[30px]">
                      <li className=" text-sm font-semibold cursor-pointer hover:bg-gray-100">
                        Rajender Kumar Yadav
                      </li>
                      <MdArrowOutward />
                    </div>
                    <hr />
                    <div className="flex gap-[30px]">
                      <li className=" text-sm font-semibold cursor-pointer hover:bg-gray-100">
                        Rajender Kumar Yadav
                      </li>
                      <MdArrowOutward />
                    </div>

                    <hr />
                    <div className="flex gap-[30px]">
                      <li className=" text-sm font-medium cursor-pointer hover:bg-gray-100">
                        Rajender Kumar Yadav
                      </li>
                      <MdArrowOutward />
                    </div>
                  </ul>
                </div>
              )}
            </div> */}
            <div className="flex w-full items-center">
              <div>
                <IoSearchOutline className="w-5 h-5 text-[#848D5E]" />
              </div>
              <Input
                type="text"
                placeholder="Patient Name"
                value={data.patientName}
                onChange={handleChange}
                name="patientName"
                className="border-none placeholder:text-black placeholder:font-medium"
              />
            </div>
            <hr className="block w-2 h-10 mx-4 bg-gray-100" />
            <div>
              <CustomCalendar
                value={data.DOB}
                onChange={(date) => {
                  handleDateTimeChange(date);
                }}
              >
                <div className="flex w-full  relative  items-center">
                  <Input
                    placeholder="DOB"
                    disabled
                    value={data?.DOB && formateNormalDate(data.DOB)}
                    className=" pointer-events-none border-none   bg-white! w-60! placeholder:text-black placeholder:font-medium"
                  />
                  <div className="flex items-center justify-center w-5 mx-1 h-5">
                    <img alt="calender" src={calendar} className="w-full h-full cursor-pointer" />
                  </div>
                </div>
              </CustomCalendar>
            </div>

            <hr className="block w-2 h-10 bg-gray-100" />

            <Input
              type="tel"
              onChange={handleChange}
              value={data.mobileNumber}
              name="mobileNumber"
              placeholder="Mobile Number"
              className="border-none placeholder:text-black placeholder:font-medium"
            />
            <hr className="block w-2 h-10 bg-gray-100" />
            <Input
              placeholder="UHID"
              name="uhid"
              value={data.uhid}
              onChange={handleChange}
              className="border-none placeholder:text-black placeholder:font-medium"
            />
            <Button
              onClick={handleClick}
              type="submit"
              className="bg-[#323E2A]!"
              variant="contained"
              size="md"
            >
              Search
            </Button>
          </form>
        </div>

        {patientData?.allPatient?.data?.length <= 0 ? (
          <div className="flex w-full h-full items-center justify-center">
            <img className="w-60" alt="existingimg" src={ExistingImg} />
          </div>
        ) : (
          <div className="font-semibold text-xs w-full min-h-screen text-nowrap whitespace-nowrap  overflow-x-auto scrollbar-hidden">
            <table className="w-full text-sm text-left ">
              <thead className="bg-[#E9E8E5] w-full">
                <tr className="text-[#505050] text-xs w-full font-medium">
                  <th className="pl-3 py-3 w-fit">S.No.</th>
                  <th className="px-[30px] py-3 w-fit">Name</th>
                  <th className="py-3 pr-[100px]">Mobile No.</th>
                  <th className="py-3 pr-[92px]"> DOB/Age</th>
                  <th className="py-3 pr-[92px]">Gender</th>
                  <th className="py-3 pr-[92px]">UHID</th>
                  <th className="py-3 pr-[92px]">Total Admissions</th>

                  <th className="py-3">Action</th>
                </tr>
              </thead>
              {patientData?.allPatient?.data?.length > 0 ? (
                <tbody className="bg-white w-full h-full">
                  {patientData?.allPatient?.data.map((data: IexistingPatient, index: number) => (
                    <tr
                      // onContextMenu={(e: SyntheticEvent) => toggleMenu(e, patient?._id)}
                      key={data?._id}
                      className="hover:bg-[#F6F6F6C7] border-b border-[#DCDCDCE0]"
                    >
                      <td className="pl-3 py-3">
                        {(
                          (+(searchParams.get("page") || 1) - 1) *
                            +patientData.allPatient.pagination.limit +
                          1 +
                          index
                        ).toString()?.length === 1
                          ? `0${
                              (+(searchParams.get("page") || 1) - 1) *
                                +patientData.allPatient.pagination.limit +
                              1 +
                              index
                            }`
                          : `${
                              (+(searchParams.get("page") || 1) - 1) *
                                +patientData.allPatient.pagination.limit +
                              1 +
                              index
                            }`}
                      </td>

                      <td className="px-[27px] py-3 flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex rounded-full  border-2 ${
                              data?.gender == "Male"
                                ? "border-[#00685F]"
                                : data?.gender == "Female"
                                ? "border-[#F14E9A]"
                                : "border-gray-500"
                            }   overflow-hidden w-[50px] h-[50px] items-center justify-center`}
                          >
                            <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                              {data?.patientPicUrl ? (
                                <img
                                  src={data?.patientPicUrl}
                                  alt="profile"
                                  className="w-full h-full"
                                />
                              ) : (
                                <div className="uppercase">
                                  {data?.firstName?.trim().slice(0, 1)}
                                  {data?.lastName?.trim().slice(0, 1)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start flex-col">
                            <p
                              className="text-xs font-semibold"
                              title={data?.firstName + data?.lastName}
                            >
                              {capitalizeFirstLetter(
                                data?.firstName?.length > 15
                                  ? data?.firstName.slice(0, 15) + "..."
                                  : data?.firstName
                              )}{" "}
                              {data?.lastName
                                ? capitalizeFirstLetter(
                                    data?.lastName?.length > 15
                                      ? data?.lastName.slice(0, 15) + "..."
                                      : data?.lastName
                                  )
                                : ""}
                            </p>
                            <div className="flex gap-2">
                              {data?.currentStatus && (
                                <div
                                  className={`${
                                    data?.currentStatus == "Inpatient"
                                      ? "text-[#3A913D] bg-[#E4FFEE]"
                                      : "bg-gray-200"
                                  } w-fit rounded-[5px]  gap-1 text-[10px] font-semibold px-[5px] py-[3px] flex items-center`}
                                >
                                  {data?.currentStatus !== "Discharged" && (
                                    <div
                                      className={`  ${
                                        data?.currentStatus == "Inpatient"
                                          ? "bg-[#3A913D]"
                                          : "bg-black"
                                      } w-1 h-1 bg-black" rounded-full`}
                                    ></div>
                                  )}
                                  <p>{data?.currentStatus}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3   font-medium">
                        {data?.phoneNumber ? data.phoneNumberCountryCode + data?.phoneNumber : "--"}
                      </td>

                      <td className="py-3  pr-[92px] font-medium">
                        {data?.dob ? `${formatDate(data?.dob)}` : data?.age || "--"}
                      </td>
                      <td className="py-3 pr-[92px] font-medium">{data?.gender || "--"}</td>
                      <td className="py-3   font-medium">{formatId(data?.uhid)}</td>
                      <td className="py-3   font-medium">{data?.admissionHistory?.length}</td>

                      <td className="py-3   font-medium">
                        <div className="flex gap-4 items-start justify-start">
                          {data?.currentStatus === "Discharged" && (
                            <div
                              onClick={() => {
                                toggleModalAdmitModal(data._id);
                              }}
                              className="px-[9px]  cursor-pointer py-[7px] w-[70px] text-xs bg-[#E0F2C3] rounded-lg"
                            >
                              <p className="text-[#3D480C] font-medium hover:font-bold">Re-Admit</p>
                            </div>
                          )}
                          {data?.admissionHistory?.length <= 1 ? (
                            <Link
                              to={`/admin/patients/all-patient/${data?._id}/profile/${data?.admissionHistory[0]?._id}`}
                              className="px-[9px] cursor-pointer py-[7px] w-[50px] text-xs rounded-lg border-[#DEDEDE] border font-medium hover:border-[#636363] hover:font-bold"
                            >
                              <p>View</p>
                            </Link>
                          ) : (
                            <button
                              onClick={() => toggleModalData(data)}
                              className="px-[9px] cursor-pointer py-[7px] w-[50px] text-xs rounded-lg border-[#DEDEDE] border font-medium hover:border-[#636363] hover:font-bold"
                            >
                              <p>View</p>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td colSpan={10} className="text-center">
                      <EmptyPage
                        links="/admin/registration"
                        buttonText="Register Patient"
                        title="No Record Found"
                        subtitle=" There are no patient with this search criteria."
                      />
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
            <div className="flex w-full items-end justify-end">
              <Pagination totalPages={patientData.allPatient.pagination.totalPages} />
            </div>
          </div>
        )}
      </div>
      <Modal isOpen={modal} toggleModal={toggleModal} crossIcon>
        <div className="w-[80vw] h-[80vh] overflow-auto py-10 text-nowrap whitespace-nowrap">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#E9E8E5] w-full">
              <tr className="text-[#505050] text-xs w-full font-medium">
                <th className="px-[30px] py-3 w-fit">Name</th>
                {/* <th className="py-3 px-2">Mobile No.</th> */}
                {/* <th className="py-3 px-2"> DOB/Age</th> */}
                {/* <th className="py-3 px-2">Gender</th> */}
                {/* <th className="py-3 px-2">UHID</th> */}
                <th className="py-3 px-2">Date of Admission</th>
                <th className="py-3 px-2">Date of Discharge</th>
                <th className="py-3 px-2">Length of Stay</th>

                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white w-full h-full">
              {modalData?.admissionHistory?.length &&
                modalData?.admissionHistory?.map((data: Iadmission) => (
                  <tr key={data?._id} className="hover:bg-[#F6F6F6C7] border-b border-[#DCDCDCE0]">
                    {/* <td className="pl-3 py-3">
                    {(
                      (+(searchParams.get("page") || 1) - 1) *
                        +patientData.allPatient.pagination.limit +
                      1 +
                      index
                    ).toString()?.length === 1
                      ? `0${
                          (+(searchParams.get("page") || 1) - 1) *
                            +patientData.allPatient.pagination.limit +
                          1 +
                          index
                        }`
                      : `${
                          (+(searchParams.get("page") || 1) - 1) *
                            +patientData.allPatient.pagination.limit +
                          1 +
                          index
                        }`}
                  </td> */}

                    <td className="px-3 py-3 flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex rounded-full  border-2 ${
                            modalData?.gender == "Male"
                              ? "border-[#00685F]"
                              : modalData?.gender == "Female"
                              ? "border-[#F14E9A]"
                              : "border-gray-500"
                          }   overflow-hidden w-[50px] h-[50px] items-center justify-center`}
                        >
                          <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                            {modalData?.patientPicUrl ? (
                              <img
                                src={modalData?.patientPicUrl}
                                alt="profile"
                                className="w-full h-full"
                              />
                            ) : (
                              <div className="uppercase">
                                {modalData?.firstName?.trim().slice(0, 1)}
                                {modalData?.lastName?.trim().slice(0, 1)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start flex-col">
                          <p
                            className="text-xs font-semibold"
                            title={modalData?.firstName +' '+ modalData?.lastName}
                          >
                            {capitalizeFirstLetter(
                              modalData?.firstName?.length > 15
                                ? modalData?.firstName.slice(0, 15) + "..."
                                : modalData?.firstName
                            )}{" "}
                            {modalData?.lastName
                              ? capitalizeFirstLetter(
                                  modalData?.lastName?.length > 15
                                    ? modalData?.lastName.slice(0, 15) + "..."
                                    : modalData?.lastName
                                )
                              : ""}
                          </p>
                          <div className="flex gap-2">
                            {data?.currentStatus && (
                              <div
                                className={`${
                                  data?.currentStatus == "Inpatient"
                                    ? "text-[#3A913D] bg-[#E4FFEE]"
                                    : "bg-gray-200"
                                } w-fit rounded-[5px]  gap-1 text-[10px] font-semibold px-[5px] py-[3px] flex items-center`}
                              >
                                {data?.currentStatus !== "Discharged" && (
                                  <div
                                    className={`  ${
                                      data?.currentStatus == "Inpatient"
                                        ? "bg-[#3A913D]"
                                        : "bg-black"
                                    } w-1 h-1 bg-black" rounded-full`}
                                  ></div>
                                )}
                                <p>{data?.currentStatus}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* <td className="py-3 px-3   font-medium">
                      {modalData?.phoneNumber
                        ? modalData.phoneNumberCountryCode + modalData?.phoneNumber
                        : "--"}
                    </td> */}

                    {/* <td className="py-3  px-3 font-medium">
                      {modalData?.dob ? `${formatDate(modalData?.dob)}` : modalData?.age || "--"}
                    </td> */}
                    {/* <td className="py-3 px-3 font-medium">{modalData?.gender || "--"}</td> */}
                    {/* <td className="py-3   px-3 font-medium">{formatId(modalData?.uhid)}</td> */}
                    <td className="py-3   px-3 font-medium">
                      {data?.dateOfAdmission ? formatDate(data?.dateOfAdmission) : "--"}
                    </td>
                    <td className="py-3  px-3 font-medium">
                      {data?.dateOfDischarge ? formatDate(data?.dateOfDischarge) : "--"}
                    </td>
                    <td className="py-3  px-3 font-medium">
                      {data?.dateOfDischarge && data?.dateOfAdmission
                        ? calculateDateDifferenceDetailed(
                            data?.dateOfAdmission,
                            data?.dateOfDischarge
                          )
                        : "--"}
                    </td>

                    <td className="py-3  px-3 font-medium">
                      <div className="flex gap-4 items-start justify-start">
                        <Link
                          to={`/admin/patients/all-patient/${modalData?._id}/profile/${data?._id}`}
                          className="px-[9px] cursor-pointer py-[7px] w-[50px] text-xs rounded-lg border-[#DEDEDE] border font-medium hover:border-[#636363] hover:font-bold"
                        >
                          <p>View</p>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Modal>
      <ConfirmModal
        heading="Are you sure you want to Re-admit?"
        toggleModal={toggleModalAdmit}
        isModalOpen={admitModal}
        confirmAdmit={readminFunction}
      />
    </div>
  );
};

export default ExistingPatient;
