import { getInsights } from "@/apis";
import { useEffect, useState } from "react";
import { IInsightData } from "./types";
import { formatDate } from "@/utils/formater";
import { useSearchParams } from "react-router-dom";
import { TableShimmer } from "@/components/Shimmer/Shimmer";
import { MonthSelect } from "@/components/Datetime/MonthPicker";

interface IState {
  loading: boolean;
}

const Insights = () => {
  const [state, setState] = useState<IState>({
    loading: false
  });
  const [searchParams, _setSearchParams] = useSearchParams();
  const [data, setData] = useState<IInsightData>();

  const getDefaultMonths = (): string => {
    const today = new Date();
    const months: string[] = [];

    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthYear = date.toLocaleString("default", { month: "long", year: "numeric" });
      months.push(monthYear);
    }

    // Sort using calendar month order
    months.sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");

      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);

      return dateA.getTime() - dateB.getTime();
    });

    return months.join(",");
  };

  const fetchInsightsData = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const urlMonths = searchParams.get("months");
      const range = urlMonths?.trim() || getDefaultMonths();

      const response = await getInsights({ range });

      if (response.data.status === "success") {
        const sortedData = Object.fromEntries(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Object.entries(response.data.data).map(([month, centers]: any) => [
            month,
            centers
              .slice()
              .sort((a: { centerName: string }, b: { centerName: string }) =>
                a.centerName.localeCompare(b.centerName)
              )
          ])
        );
        setData(sortedData);
        setState((prev) => ({ ...prev, loading: false }));
      } else {
        console.error("Failed to fetch insights data");
      }
    } catch (error) {
      console.error("Error fetching insights data:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, [searchParams]);
  return (
    <div className="bg-[#F4F2F0] min-h-screen pb-5">
      {state.loading && (
        <div className="container gap-6 flex-col  flex items-start w-full p-10">
          <div className="flex justify-between items-end w-full"></div>
          <div className="font-semibold text-xs w-full min-h-screen text-nowrap whitespace-nowrap  overflow-x-auto scrollbar-hidden">
            <div className="w-full text-sm text-left ">
              <TableShimmer rows={10} columns={10} />
            </div>
          </div>
        </div>
      )}
      {!state.loading && (
        <div className="w-[1246px]! mx-auto">
          <div className="flex justify-between py-5 items-end w-full">
            <div className="flex flex-col gap-2">
              <p className="text-[22px] font-bold">Insights Dashboard</p>
            </div>
            <div className="flex gap-4 ">
              <MonthSelect>
                {/* <Button
                  variant="outlined"
                  size="base"
                  className="flex bg-white text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                >
                  <img src={calender} alt="calender" />
                  Date Range
                  <IoIosArrowDown />
                </Button> */}
              </MonthSelect>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl">
            <div className=" font-sans rounded-xl text-[13px] leading-[18px] text-[#1a1a1a]">
              <div className="mx-auto   overflow-x-auto rounded-md ">
                <table className=" min-w-[780px] w-full border-collapse">
                  <thead>
                    <tr className="rounded-t-md border-b border-[#c7bfa7] bg-[#CCB69E] select-none">
                      <th className="w-[120px] border-r border-[#c7bfa7] px-3 py-2 text-left align-center text-[12px] leading-[15px] font-semibold text-black">
                        <div className="flex justify center items-center">
                          <p>Metric</p>
                        </div>
                      </th>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((value, index) => (
                          <th
                            key={index}
                            className="w-[300px] border-r border-[#c7bfa7] px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"
                          >
                            {value}
                            <div className=" text-[#505050] font-semibold mt-0.5 text-[10px] ">
                              {formatDate(data[value][0].metadata.startDateTime)} {""} To {""}
                              {formatDate(data[value][0].metadata.endDateTime)}
                            </div>
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="rounded-t-md border-b border-[#c7bfa7] bg-[#D9C6B2] select-none">
                      <td className="w-[120px] border-r border-[#c7bfa7] px-3 py-2 text-left align-top text-[12px] leading-[15px] font-semibold text-black">
                        Centers
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => (
                          <td className="w-[300px] border-r border-[#c7bfa7]">
                            <div className="flex w-full">
                              {data[monthKey].map((center) => (
                                <div className="flex-1 border-r border-[#c7bfa7] px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {center.centerName}
                                </div>
                              ))}
                              <div className="flex-1 border-r border-[#c7bfa7] px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                Total
                              </div>
                            </div>
                          </td>
                        ))}
                    </tr>

                    <tr className="border-b border-[#d9d4c9] bg-[#EEE2D2]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Admission</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.totalAdmission,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid text-nowrap w-full"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.totalAdmission}
                                  </div>
                                ))}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Female</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.gender.female,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.gender.female}
                                  </div>
                                ))}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Male</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.gender.male,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.gender.male}
                                  </div>
                                ))}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    {/* TODO: Avg age and Repeated Rate Pending */}
                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Average Age</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          // Calculate total sum and count to get average
                          const { totalSum, totalCount } = data[monthKey].reduce(
                            (acc, value) => {
                              const ageArray = value.metric.age;
                              const sum = ageArray.reduce((a: number, b: number) => a + b, 0);
                              return {
                                totalSum: acc.totalSum + sum,
                                totalCount: acc.totalCount + ageArray.length
                              };
                            },
                            { totalSum: 0, totalCount: 0 }
                          );

                          const average = totalCount > 0 ? totalSum / totalCount : 0;

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.age.length > 0
                                      ? Math.round(
                                          value.metric.age.reduce((a, b) => a + b) /
                                            value.metric.age.length
                                        )
                                      : 0}
                                  </div>
                                ))}
                                {/* Display the average */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {Math.round(average)}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Repeat Rate (%)
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          // Calculate total sum and count for average
                          const { totalSum, totalCount } = data[monthKey].reduce(
                            (acc, value) => {
                              const arr = value.metric.repeatRate;
                              const sum = arr.reduce((a: number, b: number) => a + b, 0);
                              return {
                                totalSum: acc.totalSum + sum,
                                totalCount: acc.totalCount + arr.length
                              };
                            },
                            { totalSum: 0, totalCount: 0 }
                          );

                          const average = totalCount > 0 ? totalSum / totalCount : 0;

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.repeatRate.length > 0
                                      ? Math.round(
                                          value.metric.repeatRate.reduce((a, b) => a + b) /
                                            value.metric.repeatRate.length
                                        )
                                      : 0}
                                  </div>
                                ))}
                                {/* Display average */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {Math.round(average)}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    {/*  */}

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Involuntary</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const totalInvoluntary = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.involuntary,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.involuntary}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {totalInvoluntary}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Addiction</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const totalAddiction = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.addiction,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.addiction}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {totalAddiction}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Addiction & Mental Disorder
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.addictionAndMentalDisorder,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.addictionAndMentalDisorder}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Mental Disorder
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.mentalDisorder,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.mentalDisorder}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Online Referral Source Rate (%)
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.onlineReferralSource,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.onlineReferralSource}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9] bg-[#EEE2D2]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Discharge</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.dischargeTotal,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.dischargeTotal}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#c7d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Lama</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.lama,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.lama}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Absconding</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.absconding,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.absconding}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        On Request Discharge
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.onRequestDischarge,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.onRequestDischarge}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Partial Improved
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.partialImprovement,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.partialImprovement}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Improved</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.improvement,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.improvement}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Status Quo</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.statusQuo,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.statusQuo}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#c7bfa7]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">Referred</td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.reffered,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.reffered}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Routine Discharge
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.routineDischarge,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.routineDischarge}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Shifted to another Center
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.shiftedToAnotherCenter,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.shiftedToAnotherCenter}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Average Stay Duration
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          // Calculate the total sum of totalAdmission for this month
                          const { totalSum, totalCount } = data[monthKey].reduce(
                            (acc, value) => {
                              const ageArray = value.metric.averageStayDuration;
                              const sum = ageArray.reduce((a: number, b: number) => a + b, 0);
                              return {
                                totalSum: acc.totalSum + sum,
                                totalCount: acc.totalCount + ageArray.length
                              };
                            },
                            { totalSum: 0, totalCount: 0 }
                          );

                          const average = totalCount > 0 ? totalSum / totalCount : 0;

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.averageStayDuration.length > 0
                                      ? Math.round(
                                          value.metric.averageStayDuration.reduce((a, b) => a + b) /
                                            value.metric.averageStayDuration.length
                                        )
                                      : 0}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {Math.round(average)}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    {/* TODO: Below Table Pending Integration */}
                    <tr className="border-b border-[#d9d4c9] bg-[#EEE2D2]">
                      <td className=" py-3 w-[120px]  pl-3 font-semibold text-nowrap">Beds</td>
                      <td className="w-[300px] border-r border-[#c7bfa7]">
                        <div className="grid text-nowrap grid-cols-4">
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="border-r  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                        </div>
                      </td>

                      <td className="w-[300px] border-r border-[#c7bfa7]">
                        <div className="grid text-nowrap grid-cols-4">
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="border-r  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                        </div>
                      </td>

                      <td className="w-[300px] border-r border-[#c7bfa7]">
                        <div className="grid text-nowrap grid-cols-4">
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          <div className="border-r  px-3 py-2 text-center align-top text-[12px] leading-[15px] font-semibold text-black"></div>
                          {/* <div className="bg-white  flex items-center rounded-sm m-auto h-fit  justify-center w-fit text-black p-0.5">
                            <IoIosArrowDown className=" text-black text-sm" />
                          </div> */}
                        </div>
                      </td>
                    </tr>
                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Occupied Bed Days
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.occupiedBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.occupiedBedDays}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Total Available Bed Days
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.totalAvailableBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.totalAvailableBedDays}
                                  </div>
                                ))}
                                {/* Display total */}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Occupancy Rate (%)
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const occupiedTotal = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.occupiedBedDays,
                            0
                          );
                          const availableTotal = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.totalAvailableBedDays,
                            0
                          );

                          const total = occupiedTotal + availableTotal;
                          const totalRate = total > 0 ? (occupiedTotal / total) * 100 : 0;

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => {
                                  const occupied = value.metric.occupiedBedDays;
                                  const available = value.metric.totalAvailableBedDays;
                                  const total = occupied + available;
                                  const rate = total > 0 ? (occupied / total) * 100 : 0;

                                  return (
                                    <div
                                      key={value.id}
                                      className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                    >
                                      {rate.toFixed(2)}%
                                    </div>
                                  );
                                })}
                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {totalRate.toFixed(2)}%
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Single Total Occupied Bed Days & Rate
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.singleTotalOccupiedBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full items-center text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-2 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.singleTotalOccupiedBedDays}
                                    <span className="text-[10px]">
                                      {` (${Math.round(
                                        value.metric.singleTotalOccupiedBedDaysRate
                                      )}%)`}
                                    </span>
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Single Total Available Bed Days
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.singleTotalAvailableBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.singleTotalAvailableBedDays}
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Double Total Occupied Bed Days & Rate
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.doubleTotalOccupiedBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid items-center w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-2 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.doubleTotalOccupiedBedDays}
                                    <span className="text-[10px]">{` (${Math.round(
                                      value.metric.doubleTotalOccupiedBedDaysRate
                                    )}%)`}</span>
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Double Total Available Bed Days
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.doubleTotalAvailableBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.doubleTotalAvailableBedDays}
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Triple Total Occupied Bed Days & Rate
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.tripleTotalOccupiedBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.tripleTotalOccupiedBedDays}
                                    <span className="text-[10px]">{` (${Math.round(
                                      value.metric.tripleTotalOccupiedBedDaysRate
                                    )}%)`}</span>
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Triple Total Available Bed Days
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.tripleTotalAvailableBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.tripleTotalAvailableBedDays}
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Quad Total Occupied Bed Days & Rate
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.quadTotalOccupiedBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.quadTotalOccupiedBedDays}
                                    <span className="text-[10px]">{` (${Math.round(
                                      value.metric.quadTotalOccupiedBedDaysRate
                                    )}%)`}</span>
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Quad Total Available Bed Days
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.quadTotalAvailableBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.quadTotalAvailableBedDays}
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Acute Total Occupied Bed Days & Rate
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.acuteTotalOccupiedBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.acuteTotalOccupiedBedDays}
                                    <span className="text-[10px]">{` (${Math.round(
                                      value.metric.acuteTotalOccupiedBedDaysRate
                                    )}%)`}</span>
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
                            </td>
                          );
                        })}
                    </tr>

                    <tr className="border-b border-[#d9d4c9]">
                      <td className="py-3 w-[120px] pl-3 font-semibold text-nowrap">
                        Acute Total Available Bed Days
                      </td>
                      {data &&
                        Object.keys(data).length > 0 &&
                        Object.keys(data).map((monthKey: string) => {
                          const total = data[monthKey].reduce(
                            (acc, value) => acc + value.metric.acuteTotalAvailableBedDays,
                            0
                          );

                          return (
                            <td key={monthKey} className="w-[300px] border-r border-[#c7bfa7]">
                              <div
                                className="grid w-full text-nowrap"
                                style={{
                                  gridTemplateColumns: `repeat(${data[monthKey].length + 1}, 1fr)`
                                }}
                              >
                                {data[monthKey].map((value) => (
                                  <div
                                    key={value.id}
                                    className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black border-r border-[#c7bfa7]"
                                  >
                                    {value.metric.acuteTotalAvailableBedDays}
                                  </div>
                                ))}

                                <div className="px-3 py-2 text-center text-[12px] leading-[15px] font-semibold text-black">
                                  {total}
                                </div>
                              </div>
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
      )}
    </div>
  );
};

export default Insights;
