import { useState, useEffect, useRef, MouseEvent, SyntheticEvent } from "react";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
// import toast from "react-hot-toast";

import { MdKeyboardArrowRight } from "react-icons/md";
import { LuFileText } from "react-icons/lu";
import { FaRegUser } from "react-icons/fa";

import { RootState } from "@/redux/store/store";
import { setAllPatient } from "@/redux/slice/patientSlice";

import { getAllPatient } from "@/apis";
import { EmptyPage, Modal, Pagination, Sort } from "@/components";
import kabab from "@/assets/images/kebab-menu.svg";

import { capitalizeFirstLetter, formatDate, formatId } from "@/utils/formater";
// TODO: for now
import { checkRegPending } from "@/utils/checkRegPending";
import { IPatient, IState } from "@/pages/Admin/PatientData/AllPatientData/types";
import toast from "react-hot-toast";
import { TableShimmer } from "@/components/Shimmer/Shimmer";
import Search from "@/components/Search/Search";
import Filter from "@/components/Filter/Filter";
import { useAuth } from "@/providers/AuthProvider";

const AllPatientData = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("All");
  const [searchParams, _setSearchParams] = useSearchParams();

  const dispatch = useDispatch();

  const [state, setState] = useState<IState>({
    openMenuId: null,
    loading: false,
    toggleDischargeModal: false,
    loadingSearch: false
  });

  const patientData = useSelector((store: RootState) => store.patient);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [previousTreatMentRecord, setPreviousTreatMentRecord] = useState<
    { filePath: string; fileUrl: string; fileName?: string }[]
  >([]);

  const { auth } = useAuth();

  const fetchAllPatient = async () => {
    // Get query parameters
    let centers;
    const selected = searchParams.get("filter") || "All";
    if (selected === "All" || !selected) {
      centers = auth.user.centerId.map((data) => data._id);
      if (centers.length <= 0) navigate("/");
    } else {
      centers = [selected];
    }
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-createdAt";

    setState((prev) => ({
      ...prev,
      loading: true
    }));

    try {
      const response = await getAllPatient({
        limit: patientData.allPatient?.pagination?.limit || 10, // Provide a fallback if undefined
        sort,
        status: "All",
        page: currentPage,
        centers: centers.join(","),
        ...(searchParams.get("admissionType") && {
          admissionType: searchParams.get("admissionType")
        }),
        ...(searchParams.get("illnessType") && { illnessType: searchParams.get("illnessType") }),
        ...(searchParams.get("gender") && { gender: searchParams.get("gender") }),
        ...(searchParams.get("hyperTension") && { hyperTension: searchParams.get("hyperTension") }),
        ...(searchParams.get("heartDisease") && { heartDisease: searchParams.get("heartDisease") }),
        ...(searchParams.get("levelOfRisk") && { levelOfRisk: searchParams.get("levelOfRisk") }),
        ...(searchParams.get("leadType") && {
          leadType: searchParams.get("leadType")
        }),

        ...(searchParams.get("search") && { searchField: "firstName,lastName" }),
        ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
      });

      dispatch(setAllPatient(response?.data));
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

  const fetchAllPatientFilter = async () => {
    // Get query parameters
    let centers;
    const selected = searchParams.get("filter") || "All";
    if (selected === "All" || !selected) {
      centers = auth.user.centerId.map((data) => data._id);
      if (centers.length <= 0) navigate("/");
    } else {
      centers = [selected];
    }
    const currentPage = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-createdAt";

    // setState((prev) => ({
    //   ...prev,
    //   loading: true
    // }));

    try {
      const response = await getAllPatient({
        limit: patientData.allPatient?.pagination?.limit || 10, // Provide a fallback if undefined
        sort,
        status: "All",
        page: currentPage,
        centers: centers.join(","),
        ...(searchParams.get("admissionType") && {
          admissionType: searchParams.get("admissionType")
        }),
        ...(searchParams.get("illnessType") && { illnessType: searchParams.get("illnessType") }),
        ...(searchParams.get("gender") && { gender: searchParams.get("gender") }),
        ...(searchParams.get("hyperTension") && { hyperTension: searchParams.get("hyperTension") }),
        ...(searchParams.get("heartDisease") && { heartDisease: searchParams.get("heartDisease") }),
        ...(searchParams.get("levelOfRisk") && { levelOfRisk: searchParams.get("levelOfRisk") }),
        ...(searchParams.get("leadType") && {
          leadType: searchParams.get("leadType")
        }),
        ...(searchParams.get("search") && { searchField: "firstName,lastName" }),
        ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
      });

      dispatch(setAllPatient(response?.data));
      // setTimeout(() => {
      //   setState((prev) => ({
      //     ...prev,
      //     loading: false
      //   }));
      // }, 500);
    } catch (err) {
      // setState((prev) => ({
      //   ...prev,
      //   loading: false
      // }));
      console.error("Error fetching patients:", err);
      throw new Error("Failed to fetch patient data");
    }
  };

  useEffect(() => {
    fetchAllPatientFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams.get("page"),
    searchParams.get("sort"),
    searchParams.get("filter"),
    searchParams.get("gender"),
    searchParams.get("admissionType"),
    searchParams.get("illnessType"),
    searchParams.get("hyperTension"),
    searchParams.get("heartDisease"),
    searchParams.get("levelOfRisk"),
    searchParams.get("leadType")
  ]);

  useEffect(() => {
    fetchAllPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let centers;
    const selected = searchParams.get("filter") || "All";
    if (selected === "All" || !selected) {
      centers = auth.user.centerId.map((data) => data._id);
      if (centers.length <= 0) navigate("/");
    } else {
      centers = [selected];
    }
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
        const response = await getAllPatient(
          {
            limit: patientData.allPatient?.pagination?.limit || 10, // Provide a fallback if undefined
            sort,
            status: "All",
            page: currentPage,
            centers: centers.join(","),
            ...(searchParams.get("admissionType") && {
              admissionType: searchParams.get("admissionType")
            }),
            ...(searchParams.get("illnessType") && {
              illnessType: searchParams.get("illnessType")
            }),
            ...(searchParams.get("gender") && { gender: searchParams.get("gender") }),
            ...(searchParams.get("hyperTension") && {
              hyperTension: searchParams.get("hyperTension")
            }),
            ...(searchParams.get("heartDisease") && {
              heartDisease: searchParams.get("heartDisease")
            }),
            ...(searchParams.get("levelOfRisk") && {
              levelOfRisk: searchParams.get("levelOfRisk")
            }),
            ...(searchParams.get("leadType") && {
              leadType: searchParams.get("leadType")
            }),
            ...(searchParams.get("search") && { searchField: "firstName,lastName" }),
            ...(searchParams.get("search") && { term: searchParams.get("search")?.trim() })
          },
          undefined,
          controller.signal
        );

        dispatch(setAllPatient(response?.data));
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

  const toggleMenu = (_e: SyntheticEvent, id: string) => {
    setState((prev) => ({
      ...prev,
      openMenuId: state.openMenuId === id ? null : id
    }));
  };

  const [displayModal, setDisplayModal] = useState<boolean>(false);

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
        <div className="container  gap-6 flex-col  flex items-start w-full p-4">
          <div className="flex py-2   bg-white justify-between items-end w-full">
            <div className="flex flex-col gap-2">
              <p className="text-[22px] font-bold">
                All Patient Data
                <span className="text-sm ml-3 font-medium text-[#7B7B7B]">
                  Total {patientData?.allPatient?.pagination?.totalDocuments}
                </span>
              </p>
              <p className="text-xs font-medium text-wrap text-[#505050]">
                Access and manage comprehensive patient records with actionable insights for
                seamless operations
              </p>
            </div>
            <div className="flex items-center text-nowrap whitespace-nowrap justify-center gap-2">
              <Search />

              <Sort
                value={[
                  { title: "First Name", value: "firstName" },
                  { title: "Last Name", value: "lastName" },
                  { title: "Created At", value: "createdAt" },
                  { title: "UHID", value: "uhid" }
                ]}
              />
              <Filter selected={selected} setSelected={setSelected} />
            </div>
          </div>

          {/* <div className="font-semibold text-xs  w-full min-h-screen text-nowrap whitespace-nowrap  overflow-x-auto scrollbar-hidden"> */}
          <div className="w-full  h-[calc(100vh - 64px - 40px)]  text-nowrap! whitespace-nowrap!">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#E9E8E5] w-full  py-2  z-30">
                <tr className="text-[#505050] text-xs w-full font-medium">
                  <th className="py-3 pl-3 w-fit">S.No.</th>
                  <th className="py-3 px-[0px] w-[300px]">Name</th>
                  <th className="py-3 pr-3">UHID</th>
                  <th className="py-3 px-3">Admission Date</th>
                  <th className="py-3 px-3">Discharge Date</th>
                  <th className="py-3 px-3">Gender</th>
                  <th className="py-3 px-3">DOB/Age</th>
                  <th className="py-3 px-3">Center</th>
                  <th className="py-3 px-3 ">Room Type/ No.</th>
                  <th className="py-3 pr-3 w-[1px]">Action</th>
                </tr>
              </thead>
              {patientData?.allPatient?.data?.length > 0 ? (
                <tbody className="bg-white w-full h-full">
                  {patientData?.allPatient?.data.map((patient: IPatient, index: number) => (
                    <tr
                      key={patient?._id}
                      onContextMenu={(e: SyntheticEvent) => {
                        e.preventDefault();
                        toggleMenu(e, patient?._id);
                      }}
                      className="hover:bg-[#F6F6F6C7] border-b border-[#DCDCDCE0]"
                    >
                      <td className="py-3 pl-[10px]">
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
                      <td className="py-3 px-[0px] flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex rounded-full  border-2 ${
                              patient?.gender == "Male"
                                ? "border-[#00685F]"
                                : patient?.gender == "Female"
                                ? "border-[#F14E9A]"
                                : "border-gray-500"
                            }   overflow-hidden w-[50px] h-[50px] items-center justify-center`}
                          >
                            <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                              {patient?.patientPicUrl ? (
                                <img
                                  src={patient?.patientPicUrl}
                                  alt="profile"
                                  className="w-full h-full"
                                />
                              ) : (
                                <div className="uppercase">
                                  {patient?.firstName?.trim().slice(0, 1)}
                                  {patient?.lastName?.trim().slice(0, 1)}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-start flex-col">
                            <p
                              className="text-xs font-semibold"
                              title={patient?.firstName + patient?.lastName}
                            >
                              {capitalizeFirstLetter(
                                patient?.firstName?.length > 15
                                  ? patient?.firstName.slice(0, 15) + "..."
                                  : patient?.firstName
                              )}{" "}
                              {patient?.lastName
                                ? capitalizeFirstLetter(
                                    patient?.lastName?.length > 15
                                      ? patient?.lastName.slice(0, 15) + "..."
                                      : patient?.lastName
                                  )
                                : ""}
                            </p>
                            <div className="flex gap-2">
                              {patient?.patientHistory?.currentStatus && (
                                <div
                                  className={`${
                                    patient?.patientHistory?.currentStatus == "Inpatient"
                                      ? "text-[#3A913D] bg-[#E4FFEE]"
                                      : "bg-gray-200"
                                  } w-fit rounded-[5px]  gap-1 text-[10px] font-semibold px-[5px] py-[3px] flex items-center`}
                                >
                                  {patient?.patientHistory?.currentStatus !== "Discharged" && (
                                    <div
                                      className={`  ${
                                        patient?.patientHistory?.currentStatus == "Inpatient"
                                          ? "bg-[#3A913D]"
                                          : "bg-black"
                                      } w-1 h-1 bg-black" rounded-full`}
                                    ></div>
                                  )}
                                  <p>{patient?.patientHistory?.currentStatus}</p>
                                </div>
                              )}
                              {checkRegPending(patient).isValid && (
                                <div className=" w-fit rounded-[5px] bg-[#FFEDD5] gap-1 text-[10px] font-semibold px-[5px] py-[3px] flex items-center">
                                  <p className="text-[#B74F00]">Reg. Incomplete</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 pr-3 font-medium">{formatId(patient?.uhid)}</td>

                      <td className="py-3 px-3 font-medium">
                        {(patient?.patientHistory?.dateOfAdmission &&
                          formatDate(patient?.patientHistory?.dateOfAdmission)) ||
                          "--"}
                      </td>
                      <td className="py-3 px-3 font-medium">
                        {(patient?.patientHistory?.dischargeId?.date &&
                          formatDate(patient?.patientHistory?.dischargeId?.date)) ||
                          "--"}
                      </td>
                      <td className="py-3 px-3 font-medium">{patient?.gender || "--"}</td>

                      <td className="py-3 px-3 font-medium">
                        {patient?.dob ? `${formatDate(patient?.dob)}` : patient?.age}
                      </td>

                      <td className="py-3 px-3 font-medium">
                        {patient?.patientHistory?.resourceAllocation.centerId?.centerName || "--"}
                      </td>

                      <td className="py-3 px-3 font-medium">
                        {patient?.patientHistory?.resourceAllocation?.roomTypeId?.name
                          ? `${patient?.patientHistory?.resourceAllocation?.roomTypeId?.name} / ${patient?.patientHistory?.resourceAllocation?.roomNumberId?.name}`
                          : "--"}
                      </td>

                      <td className="py-3 pr-3 font-medium ">
                        <div className="w-full text-nowrap whitespace-nowrap flex items-end justify-end gap-3">
                          {patient?.patientHistory?.currentStatus == "Discharged" ? (
                            <Link
                              to={`/admin/patients/all-patient/${patient?._id}/profile/${patient?.patientHistory?._id}`}
                              className="px-[5px] py-[7px] flex items-center justify-center cursor-pointer text-xs rounded-lg border border-[#DEDEDE] hover:border-[#636363]"
                            >
                              <p>View Profile</p>
                              <MdKeyboardArrowRight size={15} />
                            </Link>
                          ) : (
                            <Link
                              to={`/admin/update-patient/${patient?._id}/${patient?.patientHistory?._id}`}
                              className="px-[5px] py-[7px] min-w-[91px] flex items-center justify-center cursor-pointer text-xs rounded-lg border border-[#DEDEDE] hover:border-[#636363]"
                            >
                              <p>Update</p>
                              <MdKeyboardArrowRight size={15} />
                            </Link>
                          )}
                          <div
                            onClick={(e: SyntheticEvent) => toggleMenu(e, patient?._id)}
                            className="bg-[#E5EBCD] relative flex w-5 h-7  items-center justify-center rounded-md hover:bg-[#D4E299] cursor-pointer"
                          >
                            <img src={kabab} className="w-full h-full" />
                            {state.openMenuId === patient?._id && (
                              <div
                                ref={menuRef}
                                className={`absolute text-nowrap whitespace-nowrap right-3 
                                 ${
                                   index <= 1 || index >= patientData?.allPatient?.data?.length
                                     ? "top-0"
                                     : "bottom-0"
                                 } overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-xl z-10 flex items-center justify-center`}
                              >
                                <div className="p-2  text-nowrap whitespace-nowrap gap-2 flex-col flex justify-center items-start bg-white shadow-lg rounded-lg w-fit">
                                  {/* {patient?.patientHistory?.patientReport?.previousTreatmentRecord
                                    ?.length < 0 ? ( */}
                                    <>
                                      <div
                                        onClick={() => {
                                          setPreviousTreatMentRecord(
                                            patient?.patientHistory?.patientReport
                                              ?.previousTreatmentRecord
                                          );
                                          setDisplayModal(true);
                                        }}
                                        className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap"
                                      >
                                        <div className="flex items-center gap-2 cursor-pointer">
                                          <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                            <LuFileText />
                                          </div>
                                          <div>
                                            <p className="">View Test Report</p>
                                            <p className="text-xs text-[#636363]">
                                              Check Test Report
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {patient?.patientHistory?.currentStatus === "Discharged" && (
                                        <Link
                                          to={`/admin/patients/all-patient/${patient?._id}/patient-followup/${patient?.patientHistory?._id}`}
                                          className="text-xs cursor-pointer font-semibold p-2 "
                                        >
                                          <div className="flex items-center gap-2 cursor-pointer">
                                            <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                              <LuFileText />
                                            </div>
                                            <div>
                                              <p className="">Patient Followup</p>
                                              <p className="text-xs text-[#636363]">
                                                Patient Followup Report
                                              </p>
                                            </div>
                                          </div>
                                        </Link>
                                      )}
                                    </>
                                  {/* ) : (
                                    <>
                                      <div
                                        onClick={() => {
                                          toast.error("No Medical Record Found");
                                        }}
                                        className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap"
                                      >
                                        <div className="flex items-center gap-2 cursor-pointer">
                                          <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                            <LuFileText />
                                          </div>
                                          <div>
                                            <p className="">View Test Report</p>
                                            <p className="text-xs text-[#636363]">
                                              Check Test Report
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {patient?.patientHistory?.currentStatus === "Discharged" && (
                                        <div
                                          onClick={() => {
                                            toast.error("No Medical Record Found");
                                          }}
                                          className="text-xs font-semibold cursor-pointer p-2 text-nowrap whitespace-nowrap"
                                        >
                                          <div className="flex items-center gap-2 cursor-pointer">
                                            <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                              <LuFileText />
                                            </div>
                                            <div>
                                              <p className="">Patient Followup</p>
                                              <p className="text-xs text-[#636363]">
                                                Patient Followup Report
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  )} */}
                                  {patient?.patientHistory?.currentStatus != "Discharged" && (
                                    <hr className="w-full" />
                                  )}
                                  {patient?.patientHistory?.currentStatus != "Discharged" && (
                                    <Link
                                      to={`/admin/patients/all-patient/${patient?._id}/profile/${patient?.patientHistory?._id}`}
                                      className="text-xs cursor-pointer font-semibold p-2 "
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="bg-gray-200 rounded-full p-2 w-7 h-7 flex items-center justify-center ">
                                          <FaRegUser />
                                        </div>
                                        <div>
                                          <p>View Profile</p>
                                          <p className="text-xs text-[#636363]">
                                            Check patient details
                                          </p>
                                        </div>
                                      </div>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
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

            <Pagination totalPages={patientData.allPatient.pagination.totalPages} />
          </div>
        </div>
      ) : (
        !state.loading && (
          <EmptyPage
            links="/admin/registration"
            buttonText="Register Patient"
            title="No Patient Data"
            subtitle=" There are no patient records in the system yet. Start by adding a new patient."
          />
        )
      )}

      <Modal
        crossIcon
        isOpen={displayModal}
        toggleModal={() => {
          setDisplayModal(!displayModal);
        }}
      >
        <div className="relative w-md  bg-white  shadow-lg  ">
          <div className="relative  rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 rounded-t">
              <h3 className="text-lg font-semibold text-gray-900">Medical Reports</h3>
              {/* <button
                type="button"
                onClick={() => {
                  setDisplayModal(!displayModal);
                }}
                className="text-black cursor-pointer white-black hover:text-gray-900 rounded-lg text-sm h-8 w-8 inline-flex justify-center items-center"
              >
                Close
              </button> */}
            </div>

            <div className="p-4 max-h-[400px] overflow-y-auto ">
              {previousTreatMentRecord.map(
                (value: { filePath: string; fileUrl: string; fileName?: string }, index) => (
                  <div key={index} className="mb-6">
                    {/* <h2 className="text-lg font-bold text-gray-800 mb-3">File {index + 1}</h2> */}
                    <ul>
                      <li className="flex items-center justify-between py-2 px-4 bg-gray-100 rounded-lg mb-2">
                        <div className="text-gray-700 text-sm">
                          {value?.fileName ? value?.fileName : "File"}
                        </div>
                        <a href={value.fileUrl} target="_blank">
                          <button className="bg-[#575F4A] cursor-pointer text-white py-1 px-3 rounded-lg text-sm">
                            View
                          </button>
                        </a>
                      </li>
                    </ul>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllPatientData;
