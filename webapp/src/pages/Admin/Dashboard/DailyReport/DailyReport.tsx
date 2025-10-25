import { CustomCalendar, EmptyPage } from "@/components";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getDailyReport } from "@/apis";
import calendar from "@/assets/images/calender.svg";

import handleError from "@/utils/handleError";
import moment from "moment";
import { convertDate } from "@/components/BasicDetaills/utils";
import { getStartAndEndUTC } from "./utils";

interface ICenterGender {
  male?: number;
  female?: number;
  other?: number;
}
interface IRoomType {
  maxOccupancy?: number;
  name: string;
  roomTypeId?: string;
  totalOccupiedBeds?: number;
  totalRooms?: number;
  _id?: string;
}
interface IDailyReport {
  centerId?: string;
  centerName: string;
  _id?: string;
  repeatAdmission?: number;
  newAdmission?: number;
  centerDischarge?: number;
  centerGenders?: ICenterGender;
  roomTypes?: IRoomType[];
}

const DailyReport = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<IDailyReport[]>([]);
  const [badName, setBadName] = useState<string[]>([]);
  function sortRoomTypes(roomList: string[]): string[] {
    const order: Record<string, number> = {
      "Acute": 1,
      "Single": 2,
      "Double-sharing":3,
      "Triple-sharing": 4,
      "Quad-sharing": 5,
    };

    return roomList.sort((a, b) => order[a] - order[b]);
  }

  const fetchDailyReport = async () => {
    try {
      const endDateParam = searchParams.get("endDate");
      let startDateISO: string;
      let endDateISO: string;

      if (endDateParam) {
        const start = new Date(`${endDateParam}T00:00:00.000Z`);
        const end = new Date(`${endDateParam}T23:59:59.999Z`);
        startDateISO = start.toISOString();
        endDateISO = end.toISOString();
      } else {
        const { start, end } = getStartAndEndUTC(0); // today
        startDateISO = start;
        endDateISO = end;
      }

      const { data } = await getDailyReport({
        startDate: startDateISO,
        endDate: endDateISO
      });

      const reports = data?.data?.date1?.reports || data?.data?.date2?.reports;
      if (reports) {
        setData(reports);

        const roomNames = new Set<string>();
        reports.forEach((report: IDailyReport) =>
          report?.roomTypes?.forEach((room: IRoomType) => {
            roomNames.add(room?.name);
          })
        );

        const uniqueRoomNames = sortRoomTypes(Array.from(roomNames));
        setBadName(uniqueRoomNames);
      } else {
        setData([]);
        setBadName([]);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleDateTimeChange = (datas: string, _type: string) => {
    let value = moment().format("YYYY-MM-DD");
    if (datas) {
      value = moment(datas).format("YYYY-MM-DD");
    }
    searchParams.set("endDate", value);
    setSearchParams(searchParams);
  };

  useEffect(() => {
    fetchDailyReport();
  }, [searchParams.get("endDate")]);
  return (
    <div className="bg-[#F4F2F0] mx-auto pb-5 min-h-[calc(100vh-64px)] min-w-[80%]">
      <div className="mx-auto">
        <div className="w-[80%] mx-auto">
          <div className="flex justify-between py-5 items-end w-full">
            <div className="flex flex-col gap-2">
              <p className="text-[22px] font-bold">Daily Report Dashboard</p>
            </div>
            <div className="flex gap-4">
              <CustomCalendar
                className="z-20!"
                value={searchParams.get("endDate") || moment().format("YYYY-MM-DD")}
                disabledDate={(current) => {
                  if (!current) return false;

                  const minDate = new Date();
                  minDate.setHours(0, 0, 0, 0); // normalize

                  const currentDate = current.toDate(); // Convert from Moment to JS Date
                  currentDate.setHours(0, 0, 0, 0); // normalize

                  return currentDate > minDate;
                }}
                // disabledDate={(current) => {

                //   const today = new Date();
                //   today.setHours(0, 0, 0, 0); // reset to start of day
                //   return current > today; // disables today and all future dates
                // }}
                onChange={(date) => {
                  handleDateTimeChange(date, "date");
                }}
              >
                <div className="flex flex-col w-fit">
                  <div
                    id="dateOfAdmission"
                    className="flex cursor-pointer bg-white justify-between gap-2 w-fit items-center border-2 border-gray-300 p-3  uppercase rounded-[7px]! font-medium"
                  >
                    <p>
                      {" "}
                      {convertDate(searchParams.get("endDate") || moment().format("YYYY-MM-DD"))}
                    </p>

                    <div className=" cursor-pointer flex items-center justify-center w-5 h-5">
                      <img src={calendar} alt="calender" className="w-full h-full" />
                    </div>
                  </div>
                </div>
              </CustomCalendar>
            </div>
          </div>
          <div className="bg-white p-5   rounded-2xl">
            <div className="font-sans  rounded-xl overflow-y-auto text-[13px] leading-[18px] text-[#1a1a1a]">
              <div className="mx-auto overflow-x-auto rounded-md">
                {data.length ? (
                  <table className="w-full  border-collapse">
                    <thead>
                      <tr className="rounded-t-md border-b border-[#c7bfa7] bg-[#CCB69E] select-none">
                        <th className="sticky z-10 left-0 w-[120px] bg-[#CCB69E] border-[#c7bfa7] px-3 py-2 text-left align-top text-[12px] leading-[15px] font-semibold text-black">
                          #
                        </th>
                        {data
                          ?.slice()
                          .sort((a, b) => a.centerName.localeCompare(b.centerName))
                          ?.map((data) => (
                            <th
                              key={data?.centerId}
                              className="w-[90px] px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"
                            >
                              {data?.centerName}
                            </th>
                          ))}

                        <th className="sticky z-10 right-0 border-l-2 border-[#c7bfa7] bg-[#CCB69E]  w-[120px] px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#d9d4c9]">
                        <td className=" py-4 flex w-[240px] items-center  pl-3 font-semibold text-black sticky z-10 left-0 bg-white">
                          Occupancy
                        </td>
                        {data
                          ?.slice()
                          .sort((a, b) => a.centerName.localeCompare(b.centerName))
                          ?.map((report) => (
                            <td key={report.centerId} className="py-4 text-center font-bold">
                              {report?.roomTypes?.reduce(
                                (o, r) => o + (r?.totalOccupiedBeds ?? 0),
                                0
                              ) ?? 0}
                              /
                              {report?.roomTypes?.reduce(
                                (t, r) => t + (r?.totalRooms ?? 0) * (r?.maxOccupancy ?? 0),
                                0
                              ) || 1}
                            </td>
                          ))}

                        <td className="sticky right-0 z-10 bg-white py-4 text-center font-bold">
                          {(() => {
                            const allRoomTypes = data?.flatMap((r) => r.roomTypes) ?? [];
                            const totalOccupied = allRoomTypes.reduce(
                              (sum, r) => sum + (r?.totalOccupiedBeds ?? 0),
                              0
                            );
                            const totalBeds = allRoomTypes.reduce(
                              (sum, r) => sum + (r?.totalRooms ?? 0) * (r?.maxOccupancy ?? 0),
                              0
                            );
                            return `${totalOccupied}/${totalBeds}`;
                          })()}
                        </td>
                      </tr>
                      <tr className="border-b border-[#d9d4c9]">
                        <td className=" py-4 flex w-[240px] items-center  pl-3 font-semibold text-black sticky z-10 left-0 bg-white">
                          Occupancy Percentage
                        </td>
                        {data
                          ?.slice()
                          .sort((a, b) => a.centerName.localeCompare(b.centerName))
                          ?.map((report) => (
                            <td key={report.centerId} className="py-4 text-center font-bold">
                              {(
                                ((report?.roomTypes?.reduce(
                                  (o, r) => o + (r?.totalOccupiedBeds ?? 0),
                                  0
                                ) ?? 0) /
                                  (report?.roomTypes?.reduce(
                                    (t, r) => t + (r?.totalRooms ?? 0) * (r?.maxOccupancy ?? 0),
                                    0
                                  ) || 1)) *
                                100
                              ).toFixed()}
                              %
                            </td>
                          ))}

                        <td className="  sticky right-0 z-10 bg-white py-4 text-center font-bold">
                          {(() => {
                            const allRoomTypes = data?.flatMap((r) => r.roomTypes) ?? [];
                            const totalOccupied = allRoomTypes.reduce(
                              (sum, r) => sum + (r?.totalOccupiedBeds ?? 0),
                              0
                            );
                            const totalBeds = allRoomTypes.reduce(
                              (sum, r) => sum + (r?.totalRooms ?? 0) * (r?.maxOccupancy ?? 0),
                              0
                            );

                            return ((totalOccupied / totalBeds) * 100).toFixed(2) + "%";
                          })()}
                        </td>
                      </tr>

                      {badName.length &&
                        badName?.map((name) => (
                          <tr className="border-b border-[#d9d4c9]">
                            <td className=" py-4 flex w-[240px] items-center  pl-3 font-semibold text-black sticky z-10 left-0 bg-white">
                              {name} Beds
                            </td>
                            {data
                              ?.slice()
                              .sort((a, b) => a.centerName.localeCompare(b.centerName))
                              ?.map((dataItem) => {
                                const singleRoom = dataItem?.roomTypes?.find(
                                  (room) => room.name === name
                                );
                                const totalCapacity = singleRoom
                                  ? (singleRoom?.totalRooms ?? 0) * (singleRoom?.maxOccupancy ?? 0)
                                  : 0;
                                return (
                                  <td
                                    key={dataItem?.centerId}
                                    className="py-4 text-center font-bold"
                                  >
                                    {singleRoom?.totalOccupiedBeds || 0}/{totalCapacity}
                                  </td>
                                );
                              })}

                            <td className="  sticky right-0 z-10 bg-white py-4 text-center font-bold">
                              {data?.reduce((total, center) => {
                                const single = center?.roomTypes?.find((r) => r.name === name);
                                return total + (single ? single?.totalOccupiedBeds ?? 0 : 0);
                              }, 0)}
                              /
                              {data?.reduce((total, center) => {
                                const single = center?.roomTypes?.find((r) => r.name === name);
                                return (
                                  total +
                                  (single
                                    ? (single?.totalRooms ?? 0) * (single?.maxOccupancy ?? 0)
                                    : 0)
                                );
                              }, 0)}
                            </td>
                          </tr>
                        ))}

                      <tr className="border-b border-[#d9d4c9]">
                        <td className=" py-4 flex w-[240px] items-center  pl-3 font-semibold text-black sticky z-10 left-0 bg-white">
                          Male
                        </td>
                        {data
                          ?.slice()
                          .sort((a, b) => a.centerName.localeCompare(b.centerName))
                          ?.map((data) => (
                            <td key={data?.centerId} className=" py-4 text-center font-bold ">
                              {data?.centerGenders?.male || "0"}
                            </td>
                          ))}

                        <td className="  sticky right-0 z-10 bg-white py-4 text-center font-bold">
                          {data?.reduce((acc, curr) => acc + (curr?.centerGenders?.male ?? 0), 0) ||
                            "0"}
                        </td>
                      </tr>
                      <tr className="border-b border-[#d9d4c9]">
                        <td className=" py-4 flex w-[240px] items-center  pl-3 font-semibold text-black sticky z-10 left-0 bg-white">
                          Female
                        </td>
                        {data
                          ?.slice()
                          .sort((a, b) => a.centerName.localeCompare(b.centerName))
                          ?.map((data) => (
                            <td key={data?.centerId} className=" py-4 text-center font-bold ">
                              {data?.centerGenders?.female || "0"}
                            </td>
                          ))}

                        <td className="  sticky right-0 z-10 bg-white py-4 text-center font-bold">
                          {data?.reduce(
                            (acc, curr) => acc + (curr?.centerGenders?.female ?? 0),
                            0
                          ) || "0"}
                        </td>
                      </tr>

                      <tr className="border-b border-[#d9d4c9]">
                        <td className=" py-4 flex w-[240px] items-center  pl-3 font-semibold text-black sticky z-10 left-0 bg-white">
                          New Admission
                        </td>
                        {data
                          ?.slice()
                          .sort((a, b) => a.centerName.localeCompare(b.centerName))
                          ?.map((data) => (
                            <td key={data?.centerId} className=" py-4 text-center font-bold ">
                              {data?.newAdmission || "0"}
                            </td>
                          ))}

                        <td className="  sticky right-0 z-10 bg-white py-4 text-center font-bold">
                          {data?.reduce((acc, curr) => acc + (curr?.newAdmission ?? 0), 0) || "0"}
                        </td>
                      </tr>

                      <tr className="border-b border-[#d9d4c9]">
                        <td className=" py-4 flex w-[240px] items-center  pl-3 font-semibold text-black sticky z-10 left-0 bg-white">
                          Repeat Admission
                        </td>
                        {data
                          ?.slice()
                          .sort((a, b) => a.centerName.localeCompare(b.centerName))
                          ?.map((data) => (
                            <td key={data?.centerId} className=" py-4 text-center font-bold ">
                              {data?.repeatAdmission || "0"}
                            </td>
                          ))}

                        <td className="  sticky right-0 z-10 bg-white py-4 text-center font-bold">
                          {data?.reduce((acc, curr) => acc + (curr?.repeatAdmission ?? 0), 0) ||
                            "0"}
                        </td>
                      </tr>

                      <tr className="border-b border-[#d9d4c9]">
                        <td className=" py-4 flex w-[240px] items-center  pl-3 font-semibold text-black sticky z-10 left-0 bg-white">
                          Discharge
                        </td>
                        {data
                          ?.slice()
                          .sort((a, b) => a.centerName.localeCompare(b.centerName))
                          ?.map((data) => (
                            <td key={data?.centerId} className=" py-4 text-center font-bold ">
                              {data?.centerDischarge || "0"}
                            </td>
                          ))}

                        <td className="  sticky right-0 z-10 bg-white py-4 text-center font-bold">
                          {data?.reduce((acc, curr) => acc + (curr?.centerDischarge ?? 0), 0) ||
                            "0"}
                        </td>
                      </tr>

                      {/* Repeat for other rows */}
                    </tbody>
                  </table>
                ) : (
                  <EmptyPage links="/admin/registration" hidden title="No Daily report Found" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
