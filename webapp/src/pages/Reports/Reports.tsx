import { getAllReports, deleteSingleReports } from "@/apis";
import { Button, DateTime, DeleteConfirm, Pagination } from "@/components";
import { formatDate } from "@/utils/formater";
import { SyntheticEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiDownload } from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { Link, useSearchParams } from "react-router-dom";
import calender from "@/assets/images/calender.svg";
import { RESOURCES } from "@/constants/resources";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";

interface IData {
  _id: string;
  fileName?: string;
  fileType?: string;
  createdAt: string;
  filePath?: string;
}

const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection"
    }
  ]);

  const updateQueryParams = (startDate: Date, endDate: Date) => {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    searchParams.set("startDate", startOfDay.toISOString());
    searchParams.set("endDate", endOfDay.toISOString());

    setSearchParams(searchParams);
  };

  const handleClick = (_e?: SyntheticEvent, _bool?: boolean, cancel?: boolean) => {
    const { startDate, endDate } = dateRange[0];
    if (cancel) {
      searchParams.delete("startDate");
      searchParams.delete("endDate");
      setSearchParams(searchParams);
      setDateRange([
        {
          startDate: new Date(),
          endDate: new Date(),
          key: "selection"
        }
      ]);
    } else {
      if (startDate && endDate) {
        const diffDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        if (diffDays > 31) {
          toast.error("Date range cannot exceed 31 days!");
          return;
        }
        updateQueryParams(startDate, endDate);
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectDate = (ranges: any) => {
    // const { startDate, endDate } = ranges.selection;
    setDateRange([ranges.selection]);
  };

  const [state, setState] = useState({
    totalPages: 0,
    loading: false,
    showDeleteModal: false,
    reportIdAboutToDelete: ""
  });

  const [data, setData] = useState<IData[]>([]);

  const fetchAllReport = async () => {
    try {
      const currentPage = searchParams.get("page") || "1";

      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const startDate = searchParams.get("startDate") || thirtyDaysAgo.toISOString();
      const endDate = searchParams.get("endDate") || today.toISOString();

      const response = await getAllReports({
        limit: 10,
        page: currentPage,
        "createdAt[gte]": startDate,
        "createdAt[lte]": endDate
      });
      setData(response.data.data);
      setState((prev) => ({ ...prev, totalPages: response.data.pagination.totalPages }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false
      }));
      console.error("Error fetching Reports:", error);
      throw new Error("Failed to fetch report data");
    }
  };

  const confirmDeleteModal = (id: string) => {
    setState((prev) => ({ ...prev, showDeleteModal: true, reportIdAboutToDelete: id }));
  };

  const deleteSingleReportFunction = async (id: string) => {
    try {
      await deleteSingleReports(id);
      toast.success("Successfully Deleted");
      setState((prev) => ({ ...prev, reportIdAboutToDelete: "", showDeleteModal: false }));
      fetchAllReport();
    } catch (error) {
      setState((prev) => ({ ...prev, reportIdAboutToDelete: "", showDeleteModal: false }));
      console.error("Error Deleting Report:", error);
      fetchAllReport();
      throw new Error("Failed to delete report.");
    }
  };

  useEffect(() => {
    fetchAllReport();
  }, [searchParams]);

  return (
    <div className="bg-[#F4F2F0] mx-auto min-h-[calc(100vh-64px)] min-w-[80%]">
      <div className="mx-auto">
        <div className="w-[60%] m-auto">
          <div className="flex py-4 flex-col gap-2">
            <div className="flex justify-between  items-end">
              <div className="flex flex-col">
                <p className="text-[22px] font-bold">Reports </p>
              </div>
              <div className="flex gap-4 items-center">
                <DateTime
                  maxDate={new Date()}
                  ranges={dateRange}
                  onChange={handleSelectDate}
                  onClick={handleClick}
                >
                  <Button
                    variant="outlined"
                    size="base"
                    className="flex bg-white text-xs py-3!  rounded-lg text-[#505050]"
                  >
                    <img src={calender} alt="calender" />
                    <IoIosArrowDown />
                    {searchParams.get("startDate")
                      ? `${formatDate(searchParams.get("startDate"))} to ${formatDate(
                          searchParams.get("endDate")
                        )}`
                      : `${formatDate(
                          new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
                        )} to ${formatDate(new Date().toISOString())}`}
                  </Button>
                </DateTime>
                {/* <DateRange>
              <Button
                variant="outlined"
                size="base"
                className="flex bg-white text-xs py-2  rounded-lg text-[#505050]"
              >
                <img src={calender} alt="calender" />
                Date Range
                <IoIosArrowDown />
              </Button>
            </DateRange> */}
              </div>
            </div>
          </div>
          <div className=" ">
            <div className=" overflow-x-auto rounded-lg bg-white p-6 shadow-sm">
              <table className="w-full border-separate border-spacing-y-2 text-sm text-[#2f3e46]">
                <thead className="rounded-4xl border-b border-[#c7bfa7] bg-[#CCB69E] ">
                  <tr className="border-b  border-[#d9e2e7] text-xs font-semibold text-black">
                    <th className="min-w-[140px] py-2 pl-2 text-left text-[12px]">File Name</th>
                    <th className="min-w-[140px] py-2 pl-2 text-left text-[12px]">File Type</th>
                    <th className="min-w-[110px] py-2 text-left text-[12px]">Created At</th>
                    <th className="min-w-[80px] py-2 text-left text-[12px]">Download</th>
                    <th className="min-w-[60px] py-2 pr-2 text-left text-[12px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.length >= 1 &&
                    data.map((value) => {
                      return (
                        <tr className="border-b border-gray-300">
                          <td className="py-3  truncate pl-2 font-semibold">{value?.fileName}</td>
                          <td className="py-3  truncate pl-2 font-semibold">{value?.fileType}</td>

                          <td className="py-3 font-semibold">{formatDate(value?.createdAt)}</td>
                          <RBACGuard resource={RESOURCES.DOWNLOAD_SECTION} action="read">
                            <Link to={value.filePath || ""} target="_blank">
                              <td className="flex items-center space-x-1 py-3 text-[#2f3e46]">
                                <HiDownload className=" mr-1 h-4 w-4 text-green-400 cursor-pointer" />
                                <span>Download</span>
                              </td>
                            </Link>
                          </RBACGuard>

                          <RBACGuard resource={RESOURCES.DOWNLOAD_SECTION} action="delete">
                            <td className="cursor-pointer py-3 pr-2 text-[#d6336c]">
                              <MdDelete
                                onClick={() => {
                                  confirmDeleteModal(value._id);
                                }}
                                className="text-red-500 cursor-pointer h-4 w-5"
                              />
                            </td>
                          </RBACGuard>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <Pagination totalPages={state.totalPages} />
          </div>
        </div>
      </div>
      <DeleteConfirm
        isModalOpen={state.showDeleteModal}
        toggleModal={() => {
          setState((prev) => ({ ...prev, showDeleteModal: false }));
        }}
        confirmDeleteNote={() => {
          deleteSingleReportFunction(state.reportIdAboutToDelete);
        }}
      />
    </div>
  );
};

export default Reports;
