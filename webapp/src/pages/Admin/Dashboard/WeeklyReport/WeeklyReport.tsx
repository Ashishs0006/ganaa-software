import { YearSelector } from "@/components/Datetime/YearSelector";
import { useSearchParams } from "react-router-dom";
import { getWeeklyReport } from "@/apis";
import { useEffect, useRef, useState } from "react";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";

const formatWeeklyDateRange = (start: string, end: string): string => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const startDay = startDate.getDate();
  const startMonth = startDate.toLocaleString("default", { month: "short" }); // e.g., "Jun"

  const endDay = endDate.getDate();
  const endMonth = endDate.toLocaleString("default", { month: "short" }); // e.g., "Jul"

  return `${startDay} ${startMonth} to ${endDay} ${endMonth}`;
};

const WeeklyReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>();

  const fetchWeeklyData = async () => {
    try {
      let monthsParam = searchParams.get("Year");

      if (!monthsParam) {
        const now = new Date();
        const defaultYear = now.getFullYear();
        monthsParam = `${defaultYear}`;
        searchParams.set("Year", monthsParam);
        setSearchParams(searchParams);
      }

      const [yearStr] = monthsParam.split(" ");
      const year = parseInt(yearStr);

      if (isNaN(year)) return;

      const response = await getWeeklyReport({
        year: year.toString()
      });

      const reversedData = Object.fromEntries(Object.entries(response.data.data).reverse());

      setData(reversedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, [searchParams]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTable = (direction: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth"
      });
    }
  };

  // useEffect(() => {
  //   if (data && scrollRef.current) {
  //     const wrapper = scrollRef.current;
  //     wrapper.scrollLeft = wrapper.scrollWidth;
  //   }
  // }, [data]);

  return (
    <div className="bg-[#F4F2F0] min-h-screen">
      <div className="w-[1246px]! mx-auto">
        <div className="flex justify-between py-5 items-end w-full">
          <div className="flex flex-col gap-2">
            <p className="text-[22px] font-bold">Weekly Report Dashboard</p>
          </div>
          <div className="flex justify-end gap-2 mb-3"></div>
          <div className="flex gap-4">
            <YearSelector />
          </div>
        </div>
        <div className="bg-white relative  p-5 rounded-2xl">
          <button
            onClick={() => scrollTable("right")}
            className="px-[1px] py-4 rounded-tr-[4px]  bg-[#A2876A]  right-5 z-10 absolute top-5  "
          >
            <MdOutlineKeyboardArrowRight className="w-4 h-4" />{" "}
          </button>
          <div className=" font-sans   rounded-xl text-[13px] leading-[18px] text-[#1a1a1a]">
            <div className="mx-auto   overflow-x-auto rounded-md " ref={scrollRef}>
              <table className="w-full relative  min-w-[780px] border-collapse">
                <thead>
                  <tr className="rounded-t-md   border-b border-[#c7bfa7] bg-[#CCB69E] select-none">
                    <th className=" w-[240px] sticky left-0 z-20">
                      <div className="w-full border-r  relative  flex text-left align-top text-[12px] leading-[15px] font-semibold text-black h-full  px-3 py-4  bg-[#CCB69E]   border-[#c7bfa7]">
                        <p>Metric</p>
                        <button
                          onClick={() => scrollTable("left")}
                          className="px-[1px] py-4  bg-[#A2876A] flex items-center justify-center right-0 z-[50] absolute top-0"
                        >
                          <MdOutlineKeyboardArrowLeft className="w-4 h-4" />{" "}
                        </button>
                      </div>
                    </th>
                    {data &&
                      Object.keys(data).map((key) => {
                        return (
                          <th className="w-[162px] border-r border-[#c7bfa7] px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black">
                            {key}
                            <div className="w-[120px] text-nowrap text-[#505050] font-semibold mt-0.5 text-[10px] ">
                              {formatWeeklyDateRange(data[key]?.startDate, data[key]?.endDate)}
                            </div>
                          </th>
                        );
                      })}
                  </tr>
                </thead>
                <tbody>
                  <tr className="cursor-pointer text-nowrap border-b border-[#EEE2D2] bg-[#EEE2D2] text-[12px] font-semibold text-black select-none">
                    <td colSpan={data && Object.keys(data).length + 1} className=" px-3 py-2">
                      <div className="flex w-[240px] sticky left-3 z-20 justify-between">
                        <p>Admissions & Client Flow </p>
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20 px-3  pl-3 font-semibold">
                      Active Clients at start of the week
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.activeClients}
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20  pl-3   font-semibold text-black">
                      Total Admission
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.totalAdmission}
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20  pl-3  text-[12px] font-semibold text-black">
                      New Admission
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.newAdmission}
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20 pl-3 font-semibold text-black">
                      Total Discharges
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.totalDischarges}
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20  text-black  pl-3 font-semibold">
                      Average Occupancy Rate (%){" "}
                      <i className="fas fa-info-circle ml-1 text-[13px]"></i>
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.averageOccupancy} %
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-1  w-[240px] bg-white sticky left-0 z-20  text-black pl-3 font-semibold">
                      <div>
                        <div>4 Week Rolling Average Length of stay</div>
                      </div>
                      <i className="fas fa-info-circle ml-1 text-[13px]"></i>
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.fourWeekRolling}
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="cursor-pointer text-nowrap border-t border-[#EEE2D2] bg-[#EEE2D2] text-[12px] font-semibold text-black select-none">
                    <td colSpan={data && Object.keys(data).length + 1} className="px-3 py-2">
                      <div className="flex justify-between w-[240px] sticky left-3 z-50 ">
                        <p>Digital Marketing</p>
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20  pl-3  font-semibold text-black">
                      Total Leads Generated
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.totalLeadsGenerated}
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20  pl-3  text-[12px] font-semibold text-black">
                      Leads from Digital Marketing
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.leadsFromDigitalMarketing}
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="border-b text-nowrap border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20  pl-3  font-semibold text-black">
                      Total Conversion
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.totalConversion}
                          </td>
                        );
                      })}
                  </tr>

                  <tr className="cursor-pointer border-t text-nowrap border-[#EEE2D2] bg-[#EEE2D2] text-[12px] font-semibold text-black select-none">
                    <td colSpan={data && Object.keys(data).length + 1} className="px-3 py-2">
                      <div className="flex justify-between w-[240px] sticky left-3 z-50">
                        <p>Operational Metrics</p>
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b border-[#d9d4c9]">
                    <td className=" py-4  w-[240px] bg-white sticky left-0 z-20 pl-3 text-nowrap  font-semibold text-black">
                      Client Satisfaction Score
                    </td>
                    {data &&
                      Object.keys(data).map((value) => {
                        return (
                          <td className=" py-4 text-center font-bold">
                            {data[value].report.clientSatisfaction}
                          </td>
                        );
                      })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyReport;
