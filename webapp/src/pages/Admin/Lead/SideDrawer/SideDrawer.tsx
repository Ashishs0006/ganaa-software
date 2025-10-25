import { MdDelete, MdOutlineEmail } from "react-icons/md";
import { FaCalendarAlt, FaRegUser } from "react-icons/fa";

import { Button, RichTextEditor, Select } from "@/components";

import { progressStatusOption } from "@/pages/Admin/Lead/CreateLead/utils";

import assignTo from "@/assets/images/assignTo.svg";
import { BiPhoneCall } from "react-icons/bi";
import { IComments, ISingleLead } from "../QualifiedLeads/types";
import { capitalizeFirstLetter, convertBackendDateToTime, formatDate } from "@/utils/formater";
import { Link, useSearchParams } from "react-router-dom";
import { ISelectOption } from "@/components/Select/types";
import { createComment, getAllLeads, updateLead } from "@/apis";
import toast from "react-hot-toast";
import handleError from "@/utils/handleError";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDisQualifiedLead, setQualifiedLead } from "@/redux/slice/LeadSlice";
import { RootState } from "@/redux/store/store";

const SideBar = ({
  toggleSidebar,
  toggleDelete,
  toggleAdmit,
  SingleleadData,
  unQualified
}: {
  toggleSidebar: () => void;
  toggleDelete?: (_id: string) => void;
  toggleAdmit?: (_id: string) => void;
  SingleleadData: ISingleLead;
  unQualified?: boolean;
}) => {
  const [progressStatus, setProgressStatus] = useState<ISelectOption>({
    label: SingleleadData?.progressStatus || "",
    value: SingleleadData?.progressStatus || ""
  });

  const [comments, setComments] = useState<IComments[]>(SingleleadData?.comments || []);
  const [comment, setComment] = useState<string>("");
  const [searchParams, _setSearchParams] = useSearchParams();

  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      toggleSidebar();
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, []);

  const handleDelete = () => {
    if (SingleleadData.progressStatus === "Admit") return;
    if (toggleDelete) {
      toggleDelete(SingleleadData._id);
      toggleSidebar();
    }
  };
  const handleAdmit = () => {
    if (SingleleadData.progressStatus === "Admit") return;
    if (!SingleleadData?.centerId?.centerName) {
      toast.error("Please select a center before proceeding with admission.");
      return;
    }
    if (toggleAdmit) {
      toggleAdmit(SingleleadData._id);
      toggleSidebar();
    }
  };

  const dispatch = useDispatch();

  const handleSelect = async (key: string, value: ISelectOption) => {
    if (unQualified) return;
    if (value?.value) {
      try {
        const response = await updateLead(SingleleadData._id, { [key]: value.value });
        if (response.status === 200) {
          toast.success("Status Update Successfully");
          fetchAllQualifiedLeads();
          setProgressStatus(value);
        }
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleQualified = async () => {
    try {
      const response = await updateLead(SingleleadData._id, {
        status: SingleleadData.status === "Unqualified" ? "Qualified" : "Unqualified"
      });
      if (response.status === 200) {
        toast.success("Lead mark as Unqualified Successfully");
        if (unQualified) {
          fetchAllDisQualifiedLeads();
        } else {
          fetchAllQualifiedLeads();
        }
        toggleSidebar();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const leadData = useSelector((store: RootState) => store.leads);

  const fetchAllQualifiedLeads = async () => {
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-leadDateTime";

    try {
      const response = await getAllLeads({
        limit: leadData?.qualifiedLead?.pagination?.limit || 10, // Provide a fallback if undefined
        sort,
        page: currentPage,
        status: "Qualified",
        searchField: "firstName,lastName",
        ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
      });

      dispatch(setQualifiedLead(response?.data));
    } catch (err) {
      console.error("Error fetching patients:", err);
      throw new Error("Failed to fetch patient data");
    }
  };

  const fetchAllDisQualifiedLeads = async () => {
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-leadDateTime";

    try {
      const response = await getAllLeads({
        limit: leadData?.disQualifiedLead?.pagination?.limit || 10, // Provide a fallback if undefined
        sort,
        page: currentPage,
        status: "Unqualified",
        searchField: "firstName,lastName",
        ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
      });

      dispatch(setDisQualifiedLead(response?.data));
    } catch (err) {
      console.error("Error fetching patients:", err);
      throw new Error("Failed to fetch patient data");
    }
  };

  const handleChangeQuill = useCallback((_name: string, value: string) => {
    setComment(value);
  }, []);

  const handleComment = async () => {
    try {
      if (comment.trim()) {
        const response = await createComment(SingleleadData._id, { comment });

        if (response.status === 200) {
          setComments(response?.data?.data?.comments);
          setComment("");
          if (unQualified) {
            fetchAllDisQualifiedLeads();
          } else {
            fetchAllQualifiedLeads();
          }
        }
      }
    } catch (error) {
      handleError(error);
    }
  };
  return (
    <div className="w-screen  fixed h-full inset-y-0 flex items-end justify-end  z-50   bg-[#00000045]">
      <div
        ref={sidebarRef}
        className=" overflow-y-scroll right-0 fixed z-50  inset-y-0 w-[65%] bg-white border"
      >
        <div className=" px-5 py-4 bg-[#F4F2F0]  text-center">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-x-2">
              <div
                className=" bg-primary-dark p-1 rounded-[6px]  cursor-pointer"
                onClick={toggleSidebar}
              >
                <svg
                  className="w-3 h-3  text-white"
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
              </div>

              <div className="text-lg font-semibold text-black">Leads Preview</div>
            </div>
            <div className="flex gap-x-5 items-center ">
              {SingleleadData.progressStatus !== "Admit" && (
                <Button
                  className={`text-xs! min-w-[20px]   py-2! bg-[#323E2A]! px-4! rounded-full! ${
                    unQualified ? "cursor-not-allowed! bg-gray-400!" : "bg-[#323E2A]!"
                  }`}
                  name="next"
                  variant="contained"
                  size="base"
                  onClick={handleAdmit}
                >
                  Admit
                </Button>
              )}

              <Link
                to={`/admin/lead/update-lead/${SingleleadData?._id}`}
                className=" font-semibold text-black text-xs underline cursor-pointer"
              >
                Edit
              </Link>

              {SingleleadData.progressStatus !== "Admit" && (
                <div
                  onClick={handleQualified}
                  className=" cursor-pointer opacity-70 font-semibold text-[#575F4A] underline text-xs "
                >
                  {`Mark As ${unQualified ? "qualified" : "Unqualified"} Leads`}
                </div>
              )}
              {SingleleadData.progressStatus !== "Admit" && (
                <div className={`text-red-700 cursor-pointer `} onClick={handleDelete}>
                  <MdDelete size={20} />
                </div>
              )}
            </div>
          </div>
          <div className="flex w-full items-start mt-5  gap-5 py-4">
            <div className="flex rounded-full w-12 h-12 p-3 bg-[#333E29]   items-center justify-center">
              <FaRegUser className="w-full h-full text-white" />
            </div>
            <div className="flex flex-col w-full items-start">
              <h2 className="text-[14px] font-bold">
                {" "}
                {capitalizeFirstLetter(
                  SingleleadData?.firstName?.length > 15
                    ? SingleleadData?.firstName.slice(0, 15) + "..."
                    : SingleleadData?.firstName
                )}{" "}
                {SingleleadData?.lastName
                  ? capitalizeFirstLetter(
                      SingleleadData?.lastName?.length > 15
                        ? SingleleadData?.lastName.slice(0, 15) + "..."
                        : SingleleadData?.lastName
                    )
                  : ""}
              </h2>
              <div className="flex flex-col w-full items-start gap-10">
                <div className="flex items-center justify-between gap-x-5">
                  <div className="flex items-center">
                    <MdOutlineEmail />
                    <div className="text-[12px] mx-2 font-medium">
                      {SingleleadData?.email || "--"}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center gap-2 px-4 text-nowrap">
                      <BiPhoneCall />
                      <div className="text-[12px] font-medium">
                        {SingleleadData?.phoneNumber
                          ? `${SingleleadData?.phoneNumberCountryCode}
                        ${SingleleadData?.phoneNumber}`
                          : "--"}
                      </div>
                    </div>
                    <div className="border-l text-[12px] font-medium border-black px-4 text-nowrap">
                      {SingleleadData?.alternativeMobileNumber
                        ? `${SingleleadData?.alternativephoneNumberCountryCode}
                        ${SingleleadData?.alternativeMobileNumber}`
                        : "--"}
                      <div className="text-[12px] font-medium"></div>
                    </div>
                  </div>
                </div>

                <div className="grid w-full grid-cols-6">
                  <div className="col-span-1">
                    <p className="text-gray-600 text-[11px] font-medium text-left">Patient Type</p>
                    <p className="font-semibold text-xs text-black text-left">
                      {SingleleadData?.leadSelect || "--"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-gray-600 text-[11px] font-medium text-left">Date of birth</p>
                    <p className="font-semibold text-xs text-black text-left">
                      {SingleleadData?.dob ? formatDate(SingleleadData?.dob) : SingleleadData?.age}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-gray-600 text-[11px] font-medium text-left">
                      Patient Category
                    </p>
                    <p className="font-semibold text-xs text-black text-left">
                      {SingleleadData?.isNewLead === true
                        ? "New"
                        : SingleleadData?.isNewLead === false
                        ? "Repeat"
                        : "--"}
                    </p>
                  </div>
                  <div className="col-span-1  ">
                    <p className="text-gray-600 h text-[11px] font-medium text-left">Gender</p>
                    <p className="font-semibold text-xs text-black  text-left">
                      {SingleleadData?.gender}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-gray-600 text-[11px] font-medium text-left">Guardian Name</p>
                    <p
                      title={
                        SingleleadData?.guardianName
                          ? `${
                              SingleleadData?.guardianNameRelationshipId?.shortName
                            } ${capitalizeFirstLetter(SingleleadData?.guardianName)}`
                          : "--"
                      }
                      className="font-semibold text-xs w-[100px] truncate text-black text-left"
                    >
                      {SingleleadData?.guardianName
                        ? `${SingleleadData?.guardianNameRelationshipId?.shortName}
                        ${capitalizeFirstLetter(SingleleadData?.guardianName)}`
                        : "--"}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-gray-600 text-[11px] font-medium text-left">Country</p>
                    <p className="font-semibold text-xs text-black text-left">
                      {SingleleadData?.country || "--"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between  py-10 px-4 mr-24">
          <div>
            <Select
              disable={SingleleadData.progressStatus == "Admit"||unQualified}
              label="Status Progress"
              labelClassName="text-[#636363]! text-xs!"
              containerClass="w-full!"
              className="w-[220px]!   truncate gap-1 font-semibold"
              options={progressStatusOption}
              optionClassName="w-[220px]!"
              placeholder="Select"
              value={progressStatus}
              name="progressStatus"
              onChange={handleSelect}
            />
          </div>
          <div className="">
            <label className="font-medium text-xs text-[#636363]!">Assign to</label>
            <div>
              <div className={`flex gap-x-2 my-2 flex-row items-center justify-center`}>
                {SingleleadData?.assignedTo?.profilePic ? (
                  <div className="flex items-center justify-center overflow-hidden rounded-full w-8 h-8">
                    <img src={SingleleadData?.assignedTo?.profilePic} className="w-full h-full" />
                  </div>
                ) : (
                  <img src={assignTo} className="w-7 h-7" />
                )}
                <div>
                  {SingleleadData?.assignedTo
                    ? `${SingleleadData?.assignedTo?.firstName} ${SingleleadData?.assignedTo?.lastName}`
                    : "--"}
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <label className="font-medium text-xs text-[#636363]!">Next Follow Up Date</label>
            <div>
              <div className={`flex gap-x-2 my-2 flex-row items-center justify-center`}>
                <div className=" ">
                  <FaCalendarAlt className="w-5 h-5 text-black" />
                </div>
                <div>
                  {(SingleleadData?.nextFollowUpDate &&
                    formatDate(SingleleadData?.nextFollowUpDate)) ||
                    "--"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h2 className="text-sm font-bold  mb-5">Other Details</h2>
          <div className="grid border border-[#D6D6D6] rounded-xl p-5 grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-gray-500 text-xs font-medium">Referral Type</p>
              <p className="font-semibold text-[13px]">
                {SingleleadData?.referralTypeId?.name || "--"}
              </p>
            </div>
            <div className="w-full">
              <p className="text-gray-500 text-xs font-medium">Referral Source</p>
              <p
                title={capitalizeFirstLetter(SingleleadData?.referralDetails)}
                className="font-semibold truncate text-[13px]"
              >
                {capitalizeFirstLetter(SingleleadData?.referralDetails)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs  font-medium">Admission Type</p>
              <p className="font-semibold text-[13px]">
                {SingleleadData?.admissionType
                  ? `${SingleleadData?.admissionType}${
                      SingleleadData?.admissionType !== "Voluntary"
                        ? ` - ${SingleleadData?.involuntaryAdmissionType}`
                        : ""
                    }`
                  : "--"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Chief Complaints</p>
              <p
                title={capitalizeFirstLetter(SingleleadData?.chiefComplaints)}
                className="font-semibold text-[13px] truncate"
              >
                {capitalizeFirstLetter(SingleleadData?.chiefComplaints)}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Center</p>
              <p className="font-semibold text-[13px]">
                {SingleleadData?.centerId?.centerName || "--"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-medium">Created Date</p>
              <p className="font-semibold text-[13px]">
                {" "}
                {(SingleleadData?.leadDateTime && formatDate(SingleleadData?.leadDateTime)) || "--"}
              </p>
            </div>

            <div className="text-nowrap">
              <p className="text-gray-500 text-xs font-medium">First Person Contacted at Ganaa</p>
              <p
                title={capitalizeFirstLetter(SingleleadData?.firstPersonContactedAtGanaa)}
                className="font-semibold truncate text-[13px]"
              >
                {capitalizeFirstLetter(SingleleadData?.firstPersonContactedAtGanaa)}
              </p>
            </div>

            <div className="text-nowrap">
              <p className="text-gray-500 text-xs font-medium">Illness Type</p>
              <p
                title={capitalizeFirstLetter(SingleleadData?.illnessType)}
                className="font-semibold truncate text-[13px]"
              >
                {SingleleadData?.illnessType || "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 w-full">
          <h2 className="text-sm font-bold  mb-5">All Comments</h2>
          {comments.length > 0 ? (
            <div className="w-full lg:p-8 p-5 bg-[#F4F2F0] gap-[57px] rounded-3xl border border-gray-200 flex-col justify-start items-start  flex">
              {comments.map((data: IComments) => (
                <div className="flex w-full  gap-3 justify-start items-start">
                  <div
                    className={`flex rounded-full max-w-8  min-w-8 h-8 border-2 overflow-hidden border-[#00685F]  items-center justify-center`}
                  >
                    {data?.userId?.profilePic ? (
                      <img src={data?.userId?.profilePic} className="w-full h-full" />
                    ) : (
                      <div className="flex rounded-full p-1 w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                        <div className="w-full uppercase text-[12px] font-medium text-center">
                          {data?.userId?.firstName?.slice(0, 1)}
                          {data?.userId?.lastName?.slice(0, 1)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className=" flex-col gap-y-2 flex">
                    <div className="justify-start items-start gap-1 flex">
                      <p className="text-black text-[12px] font-semibold">
                        {" "}
                        {capitalizeFirstLetter(
                          data?.userId?.firstName?.length > 15
                            ? data?.userId.firstName.slice(0, 15) + "..."
                            : data?.userId?.firstName
                        )}{" "}
                        {data?.userId?.lastName
                          ? capitalizeFirstLetter(
                              data?.userId?.lastName?.length > 15
                                ? data?.userId?.lastName.slice(0, 15) + "..."
                                : data?.userId?.lastName
                            )
                          : ""}
                      </p>
                      <p className="text-black text-[12px] font-regular">
                        {(data.createdAt && formatDate(data.createdAt)) || "--"}.{" "}
                        <span className="text-black [12px] font-normal">
                          {(data.createdAt && convertBackendDateToTime(data.createdAt)) || "--"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p
                        dangerouslySetInnerHTML={{ __html: data.comment || "--" }}
                        className="text-gray-800 text-sm font-normal leading-snug"
                      ></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="opacity-70">No Comments</p>
          )}
        </div>

        <div className="sticky flex-col w-full flex items-center bottom-0 z-50 bg-white shadow p-3">
          <div className="w-full relative">
            <RichTextEditor
              countHide
              value={comment || ""}
              placeholder="Add a comment"
              name="comment"
              className=""
              disable={unQualified}
              onChange={handleChangeQuill}
              height="h-16"
            />
            <div className="w-fit mt-4 bottom-1 right-1 flex absolute justify-end">
              <Button
                onClick={handleComment}
                disabled={unQualified}
                name="next"
                variant="contained"
                size="base"
                className={`bg-[#575F4A] ${
                  unQualified ? "cursor-not-allowed!" : "cursor-pointer"
                } rounded-2xl! text-xs font-semibold text-white`}
              >
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SideBar;
