import { useState, useEffect, useRef } from "react";

import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import eye from "@/assets/images/eye.svg";
import edit from "@/assets/images/edit.svg";
import bin from "@/assets/images/bin.svg";

import { RootState } from "@/redux/store/store";

import { DeleteConfirm, EmptyPage, Pagination, Sort } from "@/components";

import { TableShimmer } from "@/components/Shimmer/Shimmer";
import SideBar from "../SideDrawer/SideDrawer";
import { setDisQualifiedLead } from "@/redux/slice/LeadSlice";
import { deleteLead, getAllLeads } from "@/apis";
import { capitalizeFirstLetter, formatDate } from "@/utils/formater";
import { ISingleLead } from "@/pages/Admin/Lead/QualifiedLeads/types";
import { IState } from "@/pages/Admin/Lead/DisqualifiedLeads/types";
import toast from "react-hot-toast";
import Search from "@/components/Search/Search";

const DisqualifiedLeads = () => {
  const [searchParams] = useSearchParams();

  const dispatch = useDispatch();

  const [state, setState] = useState<IState>({
    openMenuId: false,
    loading: false,
    id: "",
    toggleDischargeModal: false
  });

  const leadData = useSelector((store: RootState) => store.leads);

  const [SingleleadData, setSingleleadData] = useState<ISingleLead>({
    _id: "",
    firstName: "",
    lastName: "",
    isNewLead: undefined,
    status: "",
    illnessType: "",
    phoneNumberCountryCode: "",
    phoneNumber: "",
    comments: [],
    progressStatus: "",
    leadDateTime: "",
    centerId: { centerName: "" },
    centerVisitDateTime: "",
    nextFollowUpDate: "",
    assignedTo: { firstName: "", lastName: "", profilePic: "" },
    referralTypeId: { name: "" },
    email: "",
    alternativeMobileNumber: "",
    alternativephoneNumberCountryCode: "",
    leadSelect: "",
    dob: "",
    gender: "",
    guardianName: "",
    guardianNameRelationshipId: { shortName: "" },
    country: "",
    referralDetails: "",
    admissionType: "",
    involuntaryAdmissionType: "",
    chiefComplaints: "",
    firstPersonContactedAtGanaa: ""
  });

  const controllerRef = useRef<AbortController | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const fetchAllDisQualifiedLeads = async () => {
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-leadDateTime";

    setState((prev) => ({
      ...prev,
      loading: true
    }));

    try {
      const response = await getAllLeads({
        limit: leadData?.disQualifiedLead?.pagination?.limit || 10, // Provide a fallback if undefined
        sort,
        page: currentPage,
        status: "Unqualified",
        ...(searchParams.get("search") && { searchField: "firstName,lastName" }),

        ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
      });

      dispatch(setDisQualifiedLead(response?.data));
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          loading: false
        }));
      }, 500);
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false
      }));
      console.error("Error fetching patients:", err);
      throw new Error("Failed to fetch patient data");
    }
  };
  const fetchAllDisQualifiedLeadsFilter = async () => {
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-leadDateTime";

    try {
      const response = await getAllLeads({
        limit: leadData?.disQualifiedLead?.pagination?.limit || 10, // Provide a fallback if undefined
        sort,
        page: currentPage,
        status: "Unqualified",
        ...(searchParams.get("search") && { searchField: "firstName,lastName" }),

        ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
      });

      dispatch(setDisQualifiedLead(response?.data));
    } catch (err) {
      console.error("Error fetching patients:", err);
      throw new Error("Failed to fetch patient data");
    }
  };

  useEffect(() => {
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-createdAt";

    setState((prev) => ({
      ...prev,
      loadingSearch: true
    }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (controllerRef.current) controllerRef.current.abort();

      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await getAllLeads(
          {
            limit: leadData?.qualifiedLead?.pagination?.limit || 10, // Provide a fallback if undefined
            sort,
            page: currentPage,
            status: "Unqualified",
            ...(searchParams.get("search") && { searchField: "firstName,lastName" }),
            ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
          },
          undefined,
          controller.signal
        );

        dispatch(setDisQualifiedLead(response?.data));

        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            loadingSearch: false
          }));
        }, 500);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          loadingSearch: false
        }));
        if (
          (typeof err === "object" &&
            err !== null &&
            "name" in err &&
            (err as { name?: string }).name === "CanceledError") ||
          (err as { name?: string }).name === "AbortError"
        ) {
          console.log("Request was canceled");
        } else {
          console.error(err);
        }
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchParams.get("search")]);

  useEffect(() => {
    fetchAllDisQualifiedLeadsFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("page"), searchParams.get("sort")]);

  useEffect(() => {
    fetchAllDisQualifiedLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenMenu = (data?: ISingleLead) => {
    if (data) setSingleleadData(data);

    setState((prevState) => ({ ...prevState, openMenuId: !prevState.openMenuId }));
  };

  const [deleteModal, setDeleteModal] = useState<boolean>(false);

  const toggleModal = () => {
    setDeleteModal(!deleteModal);
  };

  const confirmDeleteNote = async () => {
    const response = await deleteLead(state.id);
    if (response.data?.status == "success") {
      toast.success(response.data?.message);
      fetchAllDisQualifiedLeads();
      setState((prev) => ({ ...prev, id: "" }));
      toggleModal();
    }
  };

  const handleDelete = (id: string) => {
    setState((prevState) => ({
      ...prevState,
      id: id
    }));

    toggleModal();
  };

  return (
    <div id="allPatientData" className="bg-center  w-full bg-cover bg-no-repeat">
      {state.loading && (
        <div className="container gap-6 flex-col  flex items-start w-full p-4">
          <div className="flex justify-between items-end w-full"></div>
          <div className="font-semibold text-xs w-full min-h-screen text-nowrap whitespace-nowrap  overflow-x-auto scrollbar-hidden">
            <div className="w-full text-sm text-left ">
              <TableShimmer rows={10} columns={10} />
            </div>
          </div>
        </div>
      )}

      {!state.loading ? (
        <div className="container gap-6 flex-col flex items-start  w-full p-4">
          <div className="flex  py-2 bg-white justify-between items-end w-full">
            <div className="flex flex-col gap-2">
              <p className="text-[22px] font-bold">
                Disqualified Leads
                <span className="text-sm ml-3 font-medium text-[#7B7B7B]">
                  Total {leadData?.disQualifiedLead?.pagination?.totalDocuments}
                </span>
              </p>
              <p className="text-xs font-medium text-wrap text-[#505050]">
                Track, manage, and convert patient inquiries seamlessly. View real-time lead
                statuses, assign follow-ups, and ensure no opportunity is missed—all in one place
              </p>
            </div>
            <div className="flex items-center text-nowrap whitespace-nowrap justify-center gap-2">
              <Search />
              <Sort
                value={[
                  { title: "First Name", value: "firstName" },
                  { title: "Last Name", value: "lastName" },
                  { title: "Created Date", value: "leadDateTime" },
                  { title: "Follow Up Date", value: "nextFollowUpDate" }
                ]}
              />
              {/* <div className="flex cursor-pointer bg-[#575F4A] text-white font-semibold items-center text-xs justify-center px-3 py-2 border border-[#D4D4D4] rounded-lg">
                All Filters
                <MdKeyboardArrowDown size={15} />
              </div> */}
            </div>
          </div>

          {/* <div className="font-semibold text-xs  w-full min-h-screen text-nowrap whitespace-nowrap  overflow-x-auto scrollbar-hidden"> */}
          <div className="w-full h-[calc(100vh-64px-60px)] overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#E9E8E5]  py-2 w-full">
                <tr className="text-[#505050] text-xs  w-full text-nowrap whitespace-nowrap font-medium">
                  <th className="py-3 w-[5%] px-3">S.No.</th>
                  <th className="py-3 px-3 w-1/10">Full Name</th>
                  <th className="py-3 px-3 w-1/10">Status</th>
                  <th className="py-3 px-3 w-1/10">Created Date</th>
                  <th className="py-3 px-3 w-1/10">Center</th>
                  <th className="py-3 px-3 w-1/10">Center Visit</th>
                  <th className="py-3 px-3 w-1/10">Follow up Date</th>
                  <th className="py-3 px-3 w-1/10">Assigned To</th>
                  <th className="py-3 px-3 w-1/10">Referral Type</th>
                  <th className="py-3 px-3 w-1/10">Action</th>
                </tr>
              </thead>
              {leadData?.disQualifiedLead?.data?.length > 0 ? (
                <tbody className="bg-white w-full h-full font-semibold text-nowrap whitespace-nowrap">
                  {leadData?.disQualifiedLead?.data.map((data: ISingleLead, index: number) => (
                    <tr
                      key={data?._id}
                      className="hover:bg-[#F6F6F6C7] border-b border-[#DCDCDCE0]"
                    >
                      <td className="px-3 py-3 w-[5%]">
                        {(
                          (+(searchParams.get("page") || 1) - 1) *
                            +leadData?.disQualifiedLead?.pagination.limit +
                          1 +
                          index
                        ).toString()?.length === 1
                          ? `0${
                              (+(searchParams.get("page") || 1) - 1) *
                                +leadData?.disQualifiedLead?.pagination.limit +
                              1 +
                              index
                            }`
                          : `${
                              (+(searchParams.get("page") || 1) - 1) *
                                +leadData?.disQualifiedLead?.pagination.limit +
                              1 +
                              index
                            }`}
                      </td>
                      <td className="py-3 px-3 w-1/10">
                        <div>
                          <p
                            title={`${capitalizeFirstLetter(
                              data?.firstName
                            )} ${capitalizeFirstLetter(data?.lastName)}`}
                          >
                            {" "}
                            {capitalizeFirstLetter(
                              data?.firstName?.length > 12
                                ? data?.firstName.slice(0, 5) + "..."
                                : data?.firstName
                            )}{" "}
                            {data?.lastName
                              ? capitalizeFirstLetter(
                                  data?.lastName?.length > 12
                                    ? data?.lastName.slice(0, 5) + "..."
                                    : data?.lastName
                                )
                              : ""}
                          </p>
                          <p className="font-semibold text-[12px] text-[#5B5B5B]">
                            {data?.phoneNumberCountryCode} {data?.phoneNumber}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-medium w-1/10">
                        {data?.progressStatus || "--"}
                      </td>

                      <td className="py-3 px-3 font-medium w-1/10">
                        {(data?.leadDateTime && formatDate(data?.leadDateTime)) || "--"}
                      </td>
                      <td className="py-3 px-3 font-medium w-1/10">
                        {data?.centerId?.centerName || "--"}
                      </td>
                      <td className="py-3 px-3 font-medium w-1/10">
                        {(data?.centerVisitDateTime && formatDate(data?.centerVisitDateTime)) ||
                          "--"}
                      </td>

                      <td className="py-3 px-3 font-medium w-1/10">
                        {(data?.nextFollowUpDate && formatDate(data?.nextFollowUpDate)) || "--"}
                      </td>

                      <td className="py-3 px-3 font-medium w-1/10">
                        {data?.assignedTo?.firstName || "--"} {data?.assignedTo?.lastName}
                      </td>

                      <td className="py-3 px-3 font-medium w-1/10">
                        {data?.referralTypeId?.name || "--"}
                      </td>

                      <td className="py-3 px-3 font-medium w-1/10 relative">
                        <div className="flex items-center gap-5">
                          <img
                            src={eye}
                            className={`${
                              data?.progressStatus !== "Admit"
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-45"
                            }`}
                            onClick={() => {
                              if (data?.progressStatus !== "Admit") handleOpenMenu(data);
                            }}
                          />
                          {data?.progressStatus !== "Admit" ? (
                            <Link to={`/admin/lead/update-lead/${data?._id}`}>
                              <img
                                src={edit}
                                className={`${
                                  data?.progressStatus !== "Admit"
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed "
                                }`}
                              />
                            </Link>
                          ) : (
                            <img
                              src={edit}
                              className={`${
                                data?.progressStatus !== "Admit"
                                  ? "cursor-pointer"
                                  : "cursor-not-allowed opacity-45"
                              }`}
                            />
                          )}
                          <img
                            src={bin}
                            onClick={() => {
                              if (data?.progressStatus !== "Admit") handleDelete(data?._id);
                            }}
                            className={` ${
                              data?.progressStatus !== "Admit"
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-45"
                            }`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              ) : (
                !state.loading && (
                  <tbody>
                    <tr>
                      <td colSpan={10} className="text-center">
                        <EmptyPage
                          hidden
                          links="/admin/lead/create-lead"
                          buttonText="Create Lead"
                          title="No Record Found"
                          subtitle=" There are no lead with this search criteria."
                        />
                      </td>
                    </tr>
                  </tbody>
                )
              )}
            </table>

            <Pagination totalPages={leadData.disQualifiedLead.pagination.totalPages} />
          </div>
        </div>
      ) : (
        !state.loading && (
          <EmptyPage
            links="/admin/lead/create-lead"
            buttonText="Create Lead"
            title="No Lead Data"
            subtitle=" There are no lead records in the system yet. Start by adding a new lead."
          />
        )
      )}

      {state.openMenuId && (
        <SideBar
          toggleDelete={handleDelete}
          SingleleadData={SingleleadData}
          unQualified
          toggleSidebar={handleOpenMenu}
        />
      )}
      <DeleteConfirm
        toggleModal={toggleModal}
        isModalOpen={deleteModal}
        confirmDeleteNote={confirmDeleteNote}
      />
    </div>
  );
};

export default DisqualifiedLeads;
