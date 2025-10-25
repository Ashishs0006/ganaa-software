import { Button, DateRange, EmptyRecord, Modal, Pagination } from "@/components";
import { useNavigate, useSearchParams } from "react-router-dom";
import calendar from "@/assets/images/calender.svg";

import logo from "@/assets/images/logo.png";

import {
  capitalizeFirstLetter,
  convertBackendDateToTime,
  formatDate,
  formatId
} from "@/utils/formater";
import { getAllFamilyGroupAcitvity, getAllFamilyNurseNotes, getFamilyDetails } from "@/apis";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { IGroup, IGroupActivity, INurseNote, IPatientInfo } from "./types";
import { calculateBMI } from "@/utils/calculateBMI";
import { useAuth } from "@/providers/AuthProvider";
import { ProfileShimmer } from "@/components/Shimmer/Shimmer";
import toast from "react-hot-toast";
type ModalState = boolean;

const FamilyDetail = () => {
  const isFirstRender = useRef(true);

  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [patientInfo, setPatientInfo] = useState<IPatientInfo>();
  const [nurseNote, setNurseNote] = useState<INurseNote>();
  const [groupActivityData, setGroupActivityData] = useState<IGroupActivity>();
  const [searchParams, _setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const [isModalOpen, setModalOpen] = useState<ModalState>(false);

  const handleLogout = (_e: SyntheticEvent) => {
    logout();
    toast.success("Logout successfully");
    navigate("/auth/login");
  };

  const toggleModal = () => {
    setModalOpen((prev) => !prev);
  };

  const fetchFamilyDetails = async () => {
    let response;
    try {
      setLoading(true);
      response = await getFamilyDetails();
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Oops! Something went wrong. You've been logged out for your security.");
      setTimeout(() => {
        logout();
      }, 1000);
    }
    if (response && response.status == 200) {
      setPatientInfo(response?.data?.data);

      try {
        const currentPageGroup = searchParams.get("gpage") || "1";
        const currentPageNurse = searchParams.get("page") || "1";
        const startDate =
          searchParams.get("startDate") ||
          new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
        const admissionDate =
          response?.data?.data?.dateOfAdmission ||
          new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString();
        const query = {
          limit: 5,
          page:
            groupActivityData?.pagination?.totalPages || 1 < +currentPageNurse
              ? groupActivityData?.pagination?.totalPages || 1
              : currentPageNurse,
          sort: "-createdAt",
          ...(startDate
            ? {
                "noteDateTime[gte]":
                  admissionDate && new Date(admissionDate) < new Date(startDate)
                    ? startDate
                    : admissionDate
              }
            : { "noteDateTime[gte]": new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString() }),
          ...(searchParams.get("endDate")
            ? {
                "noteDateTime[lte]": searchParams.get("endDate")
              }
            : { "noteDateTime[lte]": new Date().toISOString() })
        };
        const nurseNote = await getAllFamilyNurseNotes(query);

        if (nurseNote.status == 200) {
          setNurseNote(nurseNote?.data);
        }

        const gquery = {
          limit: 5,
          page:
            groupActivityData?.pagination?.totalPages || 1 < +currentPageGroup
              ? groupActivityData?.pagination?.totalPages || 1
              : currentPageGroup,
          sort: "-createdAt",
          ...(startDate
            ? {
                "activityDateTime[gte]":
                  admissionDate && new Date(admissionDate) < new Date(startDate)
                    ? startDate
                    : admissionDate
              }
            : {
                "activityDateTime[gte]": new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()
              }),
          ...(searchParams.get("endDate")
            ? {
                "activityDateTime[lte]": searchParams.get("endDate")
              }
            : {
                "activityDateTime[lte]": new Date().toISOString()
              })
        };
        const groupActivity = await getAllFamilyGroupAcitvity(gquery);
        if (groupActivity.status == 200) {
          setGroupActivityData(groupActivity?.data);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        // handleError(error);
      }
    } else {
      setLoading(false);
    }
  };

  const fetchNurseNotes = async () => {
    const currentPageNurse = searchParams.get("page") || "1";
    const admissionDate = patientInfo?.dateOfAdmission;
    const startDate = searchParams.get("startDate");

    const query = {
      limit: 5,
      page:
        groupActivityData?.pagination?.totalPages || 1 < +currentPageNurse
          ? groupActivityData?.pagination?.totalPages || 1
          : currentPageNurse,
      sort: "-createdAt",
      ...(startDate
        ? {
            "noteDateTime[gte]":
              admissionDate && new Date(admissionDate) < new Date(startDate)
                ? startDate
                : admissionDate
          }
        : { "noteDateTime[gte]": new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString() }),
      ...(searchParams.get("endDate")
        ? {
            "noteDateTime[lte]": searchParams.get("endDate")
          }
        : { "noteDateTime[lte]": new Date().toISOString() })
    };
    const nurseNote = await getAllFamilyNurseNotes(query);
    if (nurseNote.status == 200) {
      setNurseNote(nurseNote?.data);
    }
  };

  const fetchGroupActivity = async () => {
    const currentPageGroup = searchParams.get("gpage") || "1";
    const startDate = searchParams.get("startDate");
    const admissionDate = patientInfo?.dateOfAdmission;

    const query = {
      limit: 5,
      page:
        groupActivityData?.pagination?.totalPages || 1 < +currentPageGroup
          ? groupActivityData?.pagination?.totalPages || 1
          : currentPageGroup,
      sort: "-createdAt",
      ...(startDate
        ? {
            "activityDateTime[gte]":
              admissionDate && new Date(admissionDate) < new Date(startDate)
                ? startDate
                : admissionDate
          }
        : {
            "activityDateTime[gte]": new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()
          }),
      ...(searchParams.get("endDate")
        ? {
            "activityDateTime[lte]": searchParams.get("endDate")
          }
        : {
            "activityDateTime[lte]": new Date().toISOString()
          })
    };

    const groupActivity = await getAllFamilyGroupAcitvity(query);
    if (groupActivity.status == 200) {
      setGroupActivityData(groupActivity?.data);
    }
  };

  useEffect(() => {
    if (isFirstRender.current) return;
    fetchNurseNotes();
  }, [searchParams.get("page"), searchParams.get("startDate"), searchParams.get("endDate")]);

  useEffect(() => {
    if (isFirstRender.current) return;
    fetchGroupActivity();
  }, [searchParams.get("gpage"), searchParams.get("startDate"), searchParams.get("endDate")]);

  useEffect(() => {
    // This runs on initial load
    fetchFamilyDetails();
    // After first mount, mark that component has mounted
    isFirstRender.current = false;
  }, []);

  return (
    <div className="bg-[#F4F2F0] min-h-screens">
      {loading ? (
        <div className="flex items-center justify-center">
          <ProfileShimmer />
        </div>
      ) : (
        <div className="container rounded-xl">
          <div className=" mx-auto md:px-24 ">
            <div className="pt-5 flex items-center lg:justify-around justify-between px-3 lg:px-0!">
              <img className="w-36 lg:mx-auto h-auto" src={logo} alt="Logo" />
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10.822"
                  height="10.838"
                  viewBox="0 0 10.822 10.838"
                >
                  <g id="Group_270" data-name="Group 270" transform="translate(-1393.246 366.56)">
                    <path
                      id="Path_30"
                      data-name="Path 30"
                      d="M1393.249-361.159c0-1.206,0-2.412,0-3.617a1.691,1.691,0,0,1,1.461-1.766,2.145,2.145,0,0,1,.337-.017q2.02,0,4.04,0a1.7,1.7,0,0,1,1.8,1.8c0,.233,0,.465,0,.7a.426.426,0,0,1-.42.46.425.425,0,0,1-.425-.454c0-.254,0-.508,0-.762a.845.845,0,0,0-.885-.9q-2.084-.007-4.167,0a.833.833,0,0,0-.885.85c-.014.317,0,.634-.005.952q0,3.173,0,6.346a.868.868,0,0,0,.669.966,1.282,1.282,0,0,0,.273.022q2.02,0,4.04,0a.863.863,0,0,0,.96-.951c0-.254-.007-.508,0-.761a.415.415,0,0,1,.412-.4.4.4,0,0,1,.421.365,7.122,7.122,0,0,1-.033,1.222,1.638,1.638,0,0,1-1.619,1.371q-2.158.013-4.315,0a1.642,1.642,0,0,1-1.644-1.559c-.037-1.021-.015-2.044-.018-3.067C1393.249-360.623,1393.249-360.891,1393.249-361.159Z"
                    />
                    <path
                      id="Path_31"
                      data-name="Path 31"
                      d="M1496.879-278.72h-4.755c-.063,0-.127,0-.19,0-.3-.009-.48-.165-.484-.417s.18-.429.492-.43q2.031,0,4.062,0h.878l.026-.054c-.189-.185-.381-.367-.568-.555a.44.44,0,0,1-.056-.667.442.442,0,0,1,.653.067c.285.283.561.576.855.85a1.107,1.107,0,0,1-.005,1.571c-.294.273-.569.568-.855.85a.439.439,0,0,1-.653.056.434.434,0,0,1,.052-.651c.189-.188.386-.368.579-.552Z"
                      transform="translate(-94.048 -81.978)"
                    />
                  </g>
                </svg>
                <div onClick={toggleModal} className="text-right cursor-pointer ">
                  LOG OUT
                </div>
              </div>
            </div>
            <div className=" md:px-12 lg:py-8 py-4 rounded-lg   text-left">
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                {/* Patient Info */}
                <div className="col-span-2 lg:col-span-1 ">
                  <div className="h-fit w-fit mx-auto  rounded-xl">
                    <div className="flex  items-center py-4">
                      <div
                        className={`flex rounded-full  border-2 ${
                          patientInfo?.gender == "Male"
                            ? "border-[#00685F]"
                            : patientInfo?.gender == "Female"
                            ? "border-[#F14E9A]"
                            : "border-gray-500"
                        }   overflow-hidden w-16 h-16 items-center justify-center`}
                      >
                        <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                          {patientInfo?.patientPicUrl ? (
                            <img
                              src={patientInfo?.patientPicUrl}
                              alt="profile"
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="flex rounded-full p-1 w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                              <div className="w-full uppercase text-[13px] font-semibold text-center">
                                {patientInfo?.firstName?.slice(0, 1)}
                                {patientInfo?.lastName?.slice(0, 1)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex mb-1 items-center whitespace-nowrap">
                          <h2
                            title={patientInfo?.firstName + " " + patientInfo?.lastName}
                            className="text-[13px] font-semibold text-left text-wrap"
                          >
                            {patientInfo?.firstName &&
                              capitalizeFirstLetter(
                                patientInfo?.firstName?.length > 15
                                  ? patientInfo?.firstName?.slice(0, 15) + "..."
                                  : patientInfo?.firstName
                              )}{" "}
                            {patientInfo?.lastName &&
                              capitalizeFirstLetter(
                                patientInfo?.lastName.length > 15
                                  ? patientInfo?.lastName.slice(0, 15) + "..."
                                  : patientInfo?.lastName
                              )}
                          </h2>
                        </div>
                        <p className="text-xs md:text-base text-gray-600">
                          UHID:
                          <span className="font-semibold ml-1 text-nowrap whitespace-nowrap text-black">
                            {formatId(patientInfo?.uhid)}
                          </span>
                          {/* <span className="font-semibold text-black ml-1">{formatId(1)}</span> */}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admission Date */}
                <div className="col-span-1 mx-auto">
                  <p className="text-gray-600 text-xs md:text-base">Admission Date & Time</p>
                  <p className="font-bold text-black text-xs md:text-base">
                    {patientInfo?.dateOfAdmission && formatDate(patientInfo?.dateOfAdmission)} @
                    {patientInfo?.dateOfAdmission &&
                      convertBackendDateToTime(patientInfo?.dateOfAdmission)}
                  </p>
                </div>

                {/* therapist */}
                <div className="col-span-1 mx-auto">
                  <p className="text-gray-600 text-xs md:text-base">Therapist</p>
                  <p className="font-bold text-black text-xs md:text-base">
                    {patientInfo?.therapistInfo?.firstName
                      ? `${patientInfo?.therapistInfo?.firstName} ${patientInfo?.therapistInfo?.lastName}`
                      : "--"}
                  </p>
                </div>

                {/* Consultant Doctor */}
                <div className="col-span-1 mx-auto">
                  <p className="text-gray-600 text-xs md:text-base">Consultant Doctor</p>
                  <p className="font-bold text-black text-xs md:text-base">
                    {" "}
                    {patientInfo?.doctorInfo?.firstName
                      ? `${patientInfo?.doctorInfo?.firstName} ${patientInfo?.doctorInfo?.lastName}`
                      : "--"}
                  </p>
                </div>

                {/* Mobile Number */}
                <div className="col-span-1 mx-auto col-start-auto md:col-start-2 ">
                  <p className="text-gray-600 text-xs md:text-base">Mobile Number</p>
                  <p className="font-bold text-black text-xs md:text-base">
                    {patientInfo?.phoneNumber
                      ? `${patientInfo?.phoneNumberCountryCode} ${patientInfo?.phoneNumber}`
                      : "--"}
                  </p>
                </div>

                {/* Center */}
                <div className="col-span-1 mx-auto">
                  <p className="text-gray-600 text-xs md:text-base">Center</p>
                  <p className="font-bold text-black text-xs md:text-base">
                    {patientInfo?.centerName || "--"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:px-6! px-0  rounded-2xl ">
            <div className="rounded-2xl bg-white w-full md:px-8! lg:px-8! px-4! mb-5  pb-2!">
              <div className=" font-semibold  block  text-xs">
                <div className="flex sm:justify-between sm:flex-row flex-col sm:items-center items-start gap-1 w-full py-4">
                  <p className="text-lg font-semibold text-nowrap whitespace-nowrap mr-1">
                    Nurse Notes
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    <DateRange
                      {...(patientInfo?.dateOfAdmission
                        ? { minDate: new Date(patientInfo.dateOfAdmission) }
                        : {})}
                    >
                      <Button
                        type="submit"
                        variant="outlined"
                        size="base"
                        className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                      >
                        <img src={calendar} alt="calender" />
                        {searchParams.get("startDate")
                          ? `Date Range ${formatDate(
                              searchParams.get("startDate")
                            )} to ${formatDate(searchParams.get("endDate"))}`
                          : `Date Range ${formatDate(
                              new Date(new Date().setUTCHours(0, 0, 0, 0)).toISOString()
                            )} to ${formatDate(new Date().toISOString())} `}
                      </Button>
                    </DateRange>
                  </div>
                </div>
                <div className="max-w-full min-h-[160px] overflow-x-auto">
                  <table className="  text-sm text-left h-fit">
                    <thead className="bg-[#E9E8E5]  h-fit">
                      <tr className="text-[#505050] text-xs font-medium">
                        <th className="px-6 py-3 text-center  w-1/12 text-nowrap whitespace-nowrap">
                          Date &amp; Time
                        </th>
                        <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">
                          B.P (mm Hg)
                        </th>
                        <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">
                          {" "}
                          Pulse (bpm)
                        </th>
                        <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">
                          Temperature (°F)
                        </th>
                        <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">SPO2 (%)</th>
                        <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">
                          Weight (kg)
                        </th>
                        <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">
                          RBS(mg/dl)
                        </th>
                        <th className="px-3 py-3 w-1/12 text-nowrap whitespace-nowrap">
                          Height (cm)
                        </th>
                        <th className="px-3 py-3 w-1/12 text-nowrap whitespace-nowrap">BMI</th>
                        <th className="px-4 py-3 w-1/12 ">Notes</th>
                      </tr>
                    </thead>
                    {nurseNote?.data && nurseNote.data?.length > 0 ? (
                      nurseNote?.data?.map((value, index) => (
                        <tbody className="bg-white  h-full">
                          <tr
                            key={index}
                            className="hover:bg-[#F6F6F6C7] text-xs border-b border-[#DCDCDCE0]"
                          >
                            <td className="px-6 py-3 text-nowrap whitespace-nowrap ">
                              <p>{value.noteDateTime && formatDate(value.noteDateTime)}</p>
                              <p className="text-gray-500">
                                {value.noteDateTime && convertBackendDateToTime(value.noteDateTime)}
                              </p>
                            </td>
                            <td className="px-4 py-7">{value?.bp || "--"}</td>
                            <td className="px-4 py-7">{value?.pulse || "--"}</td>
                            <td className="px-4 py-7">{value?.temperature || "--"}</td>
                            <td className="px-4 py-7">{value?.spo2 || "--"}</td>
                            <td className="px-4 py-7">{value?.weight || "--"}</td>
                            <td className="px-4 py-7">{value?.rbs || "--"}</td>
                            <td className="px-4 py-7">{value?.height || "--"}</td>
                            <td className="px-4 py-7">
                              {(value?.weight &&
                                value?.height &&
                                calculateBMI(value?.weight, value?.height)) ||
                                "--"}
                            </td>
                            <td
                              className="px-4 py-7 sm:w-3/6 w-3/5 "
                              dangerouslySetInnerHTML={{ __html: value?.note || "--" }}
                            ></td>
                          </tr>
                        </tbody>
                      ))
                    ) : (
                      <tbody className="bg-white  h-full">
                        <tr>
                          <td
                            colSpan={10} // 👈 Make sure this matches your <thead> columns
                            className="text-center py-10 text-gray-500"
                          >
                            <EmptyRecord className="w-full!" />
                          </td>
                        </tr>
                      </tbody>
                    )}
                  </table>
                </div>

                <Pagination totalPages={nurseNote?.pagination?.totalPages || 1} />
              </div>
            </div>
          </div>
          <div className="lg:px-6! px-0 rounded-2xl pb-10 overflow-hidden">
            <div className="bg-white rounded-2xl md:px-8! lg:px-8! px-4!  pb-6!">
              <div className=" overflow-auto  mx-auto ">
                <div className="font-semibold text-lg my-3">Activity</div>
                {groupActivityData?.data && groupActivityData?.data?.length > 0 ? (
                  groupActivityData?.data?.map((data: IGroup) => (
                    <div className="mt-3">
                      <div className="font-semibold text-sm mb-1 ml-1">
                        {data?.activityDateTime && formatDate(data?.activityDateTime)}
                      </div>
                      <div className="bg-[#EEEEEE] rounded-lg px-4 py-2 flex flex-col gap-2">
                        {data?.activity &&
                          data?.activity?.length > 0 &&
                          data?.activity?.map((activity, index) => (
                            <div className="">
                              <h2 className="font-semibold text-sm mb-1">
                                {(
                                  (+(searchParams.get("page") || 1) - 1) *
                                    +groupActivityData?.pagination?.limit +
                                  1 +
                                  index
                                ).toString()?.length === 1
                                  ? `${
                                      (+(searchParams.get("page") || 1) - 1) *
                                        +groupActivityData.pagination.limit +
                                      1 +
                                      index
                                    }`
                                  : `${
                                      (+(searchParams.get("page") || 1) - 1) *
                                        +groupActivityData.pagination.limit +
                                      1 +
                                      index
                                    }`}
                                . {activity?.name ? capitalizeFirstLetter(activity.name) : "--"}
                              </h2>
                              <p className="rounded-md py-1 ml-2 px-4 text-xs font-semibold leading-snug text-gray-900">
                                {activity.note || "--"}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyRecord className="w-full!" />
                )}

                <Pagination
                  totalPages={groupActivityData?.pagination?.totalPages || 1}
                  paramName="gpage"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <Modal
        isOpen={isModalOpen}
        toggleModal={toggleModal}
        // button={<img src={logoutIcon} className="w-4 h-4 " title="Logout" />}
      >
        <div className="w-[376px] px-6 py-5">
          <p className="text-[15px] font-bold mb-[11px]">Are You Sure?</p>

          <p className="text-[13px] font-medium text-[#535353] mb-10">
            Are you sure you want to logout?
          </p>

          <div className="w-full flex gap-x-5 items-center justify-center">
            <Button
              className="w-full! text-xs! border-gray-300! shadow-sm bg-[#F6F6F6]! font-semibold py-[10px] rounded-xl"
              variant="outlined"
              size="base"
              onClick={toggleModal}
            >
              Cancel
            </Button>

            <Button
              className="w-full! text-xs! font-semibold py-[10px] rounded-xl"
              type="submit"
              name="save"
              variant="contained"
              size="base"
              onClick={handleLogout}
            >
              Yes, Logout
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FamilyDetail;
