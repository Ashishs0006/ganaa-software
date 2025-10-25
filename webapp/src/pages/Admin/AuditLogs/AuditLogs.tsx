import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  getPatientAuditLogs,
  getPatientRentFair,
  getSinglePatient,
  getSinglePatientAdmissionHistory,
  updateRentFair
} from "@/apis";
import { EmptyRecord, BreadCrumb, Button, Input, Loader } from "@/components";
import { IAuditLogs, ICalcuateData, IState } from "@/pages/Admin/AuditLogs/type";
import { calculateGrandTotal, calculateTotal } from "@/pages/Admin/AuditLogs//utlis";
import { capitalizeFirstLetter, convertBackendDateToTime, formatDate } from "@/utils/formater";
import handleError from "@/utils/handleError";
import toast from "react-hot-toast";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";

const AuditLogs = () => {
  const { id, aId } = useParams();
  const [auditLogs, setAuditlogs] = useState<IAuditLogs[]>([]);
  const [loading, setloading] = useState<boolean>(false);

  const [state, setState] = useState<IState>({
    firstName: "",
    lastName: "",
    currentStatus: ""
  });

  const [data, setData] = useState<ICalcuateData[]>([]);

  useEffect(() => {
    fetchAuditLogs();
    fetchRentFare();
  }, [id, aId]);

  const fetchAuditLogs = async () => {
    if (aId === undefined || id === undefined) return;
    const { data: patientData } = await getSinglePatient(id);
    const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);

    if (patientData.status === "success") {
      setState((prev) => ({
        ...prev,
        firstName: patientData?.data?.firstName,
        lastName: patientData?.data?.lastName
      }));
    }
    if (patientAdmissionHistory.status === "success") {
      setState((prev) => ({
        ...prev,
        currentStatus: patientAdmissionHistory?.data?.currentStatus
      }));
    }

    const response = await getPatientAuditLogs(id, aId);

    if (response.status === 200) {
      setAuditlogs(response?.data?.data);
    }
  };

  const fetchRentFare = async () => {
    if (aId === undefined || id === undefined) return;

    const response = await getPatientRentFair(id, aId);

    if (response.status === 200) {
      setData(response?.data?.data);
    }
  };

  const handleChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const isNumeric = (val: string) => val === "" || /^\d*\.?\d*$/.test(val);
    const numberFields = ["discountPercentage", "pricePerDayPerBed", "totalNumberOfDaysSpent"];

    if (numberFields.includes(name) && !isNumeric(value)) return;

    let numericValue = +value;

    // Clamp discount between 0 and 100
    if (name === "discountPercentage") {
      if (numericValue > 100) numericValue = 100;
      if (numericValue < 0) numericValue = 0; // optional: prevent negative discount
    }

    setData((prevData) =>
      prevData.map((item, i) => (i === index ? { ...item, [name]: numericValue } : item))
    );
  }, []);

  const handleSubmit = async (_e: SyntheticEvent) => {
    try {
      setloading(true);
      if (id === undefined || aId === undefined) return;
      const res = await updateRentFair(id, aId, data);
      if (res.status === 200) {
        toast.success("Rent Fair Updated successfully");
        fetchRentFare();
      }
      setloading(false);
    } catch (error) {
      setloading(false);
      handleError(error);
    }
  };

  return (
    <div id="audit-logs" className="bg-[#F4F2F0]  min-h-[calc(100vh-64px)]">
      <div className=" container">
        <div className="flex lg:px-8 sm:px-2  bg-[#F4F2F0] justify-between md:flex-row flex-col md:items-center">
          <div className="flex items-center gap-3">
            <div className="my-5 flex flex-col items-start">
              <BreadCrumb
                profile
                discharge={state.currentStatus === "Discharged"}
                audit
                name={`${capitalizeFirstLetter(
                  state?.firstName.length > 15
                    ? state?.firstName.slice(0, 15) + "..."
                    : state?.firstName
                )} ${
                  state?.lastName
                    ? capitalizeFirstLetter(
                        state?.lastName.length > 15
                          ? state?.lastName.slice(0, 15) + "..."
                          : state?.lastName
                      )
                    : ""
                }`}
                id={id}
                aId={aId}
              />
              <div className=" text-[18px] font-bold mt-2">Room Rent</div>
            </div>
          </div>
        </div>
        <>
          {data.length > 0 && (
            <div className=" p-5 px-8  py-0 pb-10 rounded-lg font-semibold">
              <div className="rounded-t-2xl h-fit bg-white px-5 py-3">
                <div
                  className={` flex items-center justify-between border-b  "pb-0"
                 border-gray-300`}
                >
                  <div className="flex items-center">
                    <p className="text-[13px] font-bold">Rent Calculator</p>
                  </div>
                  <RBACGuard resource={RESOURCES.AUDIT_LOG} action="write">
                    <div className="flex items-center gap-4 mb-1">
                      {state.currentStatus !== "Discharged" && (
                        <Button
                          variant="outlined"
                          disabled={loading}
                          type="submit"
                          onClick={handleSubmit}
                          className="rounded-xl! text-xs! bg-[#575F4A] px-6! py-1! text-white"
                        >
                          Save{loading && <Loader size="xs" />}
                        </Button>
                      )}
                    </div>
                  </RBACGuard>
                </div>

                {data.map((data: ICalcuateData, index) => (
                  <div
                    key={index}
                    className={` grid  h-fit lg:grid-cols-10 sm:grid-cols-3 gap-10 py-4 items-start`}
                  >
                    <Input
                      containerClass="col-span-3"
                      type="text"
                      label="Center - Room Type - Room No"
                      labelClassName="text-black!"
                      value={data?.key || ""}
                      name="key"
                      disabled
                      className="w-full rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                    />
                    <Input
                      containerClass="col-span-2"
                      type="text"
                      label="Rent (Per day)"
                      labelClassName="text-black!"
                      value={data?.pricePerDayPerBed || ""}
                      name="pricePerDayPerBed"
                      disabled
                      className="w-full rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                    />
                    <Input
                      containerClass="col-span-1"
                      type="text"
                      label="No of Days"
                      disabled
                      labelClassName="text-black!"
                      value={data?.totalNumberOfDaysSpent || ""}
                      name="totalNumberOfDaysSpent"
                      className="w-full rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                    />
                    <Input
                      containerClass="col-span-1"
                      type="text"
                      label="Discount (%)"
                      labelClassName="text-black!"
                      value={data?.discountPercentage || ""}
                      name="discountPercentage"
                      maxLength={4}
                      className="w-full rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                      onChange={(e) => handleChange(index, e)}
                    />
                    <Input
                      containerClass="col-span-3"
                      type="text"
                      disabled
                      label="Total"
                      labelClassName="text-black!"
                      value={calculateTotal(
                        data.pricePerDayPerBed,
                        data.totalNumberOfDaysSpent,
                        data.discountPercentage
                      )}
                      // name="total"
                      className="w-full rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                      // onChange={(e) => handleChange(index, e)}
                    />
                  </div>
                ))}
              </div>
              <div className="w-full rounded-b-2xl text-sm text-nowrap whitespace-nowrap bg-[#D9D9D9]  h-10">
                <div className={` grid  h-fit lg:grid-cols-10 sm:grid-cols-3 px-5 gap-10  py-3`}>
                  <div className="col-span-3"></div>
                  <div className="col-span-2"></div>
                  <div className="col-span-1 flex items-center justify-center">
                    Total Days{" "}
                    <span className="font-bold ml-1">
                      {data.reduce((sum, item) => sum + (item.totalNumberOfDaysSpent ?? 0), 0)}
                    </span>
                  </div>
                  <div className="col-span-1"></div>
                  <div className="col-span-3 flex items-center justify-start ml-4">
                    Grand Total :{" "}
                    <span className="font-bold ml-1"> Rs. {calculateGrandTotal(data)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>

        <div className="bg-white px-8 font-semibold text-xs py-5">
          <div className="flex justify-between items-center w-full py-4">
            <p className="text-[14px] font-bold ml-1">Audit Logs</p>
          </div>
          {auditLogs.length > 0 ? (
            <div className="overflow-auto min-h-[160px] max-w-full">
              {" "}
              <table
                id="print-section"
                className=" sm:w-[1000px] lg:w-full text-sm text-left h-fit"
              >
                <thead className="bg-[#E9E8E5] w-full h-fit">
                  <tr className="text-[#505050] text-xs font-medium text-nowrap whitespace-nowrap">
                    <th className="px-6 py-3  w-1/6 ">Date & Time</th>
                    <th className="px-4 py-3 w-1/6">Center</th>
                    <th className="px-4 py-3 w-1/6">Room Type</th>
                    <th className="px-4 py-3 w-1/6">Room No</th>
                    <th className="px-4 py-3 w-1/6">Doctor</th>
                    <th className="px-4 py-3 w-1/6">Therapist</th>
                  </tr>
                </thead>
                <tbody className="bg-white w-full h-full">
                  {auditLogs.map((value: IAuditLogs, index: number) => {
                    return (
                      <tr
                        className="hover:bg-[#F6F6F6C7] text-xs border-b border-[#DCDCDCE0]"
                        key={index}
                      >
                        <td className="px-4 py-7 w-1/6 text-nowrap whitespace-nowrap ">
                          <p>{value?.createdAt && formatDate(value?.createdAt)}</p>
                          <p className="text-gray-500">
                            {value?.createdAt && convertBackendDateToTime(value?.createdAt)}
                          </p>
                        </td>
                        <td className="px-6 py-7 w-1/6">{value?.center.trim() || "--"}</td>
                        <td className="px-4 py-7  w-1/6">{value?.roomType.trim() || "--"}</td>
                        <td className="px-4 py-7  w-1/6">{value?.roomNumber.trim() || "--"}</td>
                        <td className="px-4 py-7   w-1/6">
                          {value?.assignedDoctor.trim() || "--"}
                        </td>
                        <td className="px-4 py-7   w-1/6">
                          {value?.assignedTherapist.trim() || "--"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex justify-center items-center bg-white py-[33px] font-semibold text-xs h-full">
              <EmptyRecord />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
