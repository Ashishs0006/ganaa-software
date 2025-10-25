import React, { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BiPrinter } from "react-icons/bi";
import { FaArrowLeft } from "react-icons/fa6";
import { IoIosArrowUp } from "react-icons/io";

import { RootState } from "@/redux/store/store";
import { resetNurseNote, setNurseNote } from "@/redux/slice/noteSlice";

import {
  createNurseNotes,
  getAllNurseNotes,
  getSinglePatient,
  updateNurseNotes,
  deleteNurseNotes,
  getSinglePatientAdmissionHistory,
  getAllLoa
} from "@/apis";
import {
  Button,
  EmptyRecord,
  Input,
  Modal,
  CustomCalendar,
  CustomTimePicker,
  Pagination,
  BreadCrumb,
  RichTextEditor,
  DateRange,
  DeleteConfirm,
  Select
} from "@/components";

import clock from "@/assets/images/clock.svg";
import kabab from "@/assets/images/kebab-menu.svg";
import calendar from "@/assets/images/calender.svg";

import {
  capitalizeFirstLetter,
  convertBackendDateToTime,
  formateNormalDate,
  formatId,
  formatDate
} from "@/utils/formater";
import handleError from "@/utils/handleError";
import compareObjects from "@/utils/compareObjects";

import {
  INurseDropDownsState,
  INurseNote,
  INurseNoteState,
  INurseState
} from "@/pages/Admin/PatientData/NurseNotes/types";
import moment from "moment";
import Logo from "@/assets/images/logo.png";
import { RxCross2 } from "react-icons/rx";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { calculateBMI } from "@/utils/calculateBMI";
import { setloa } from "@/redux/slice/patientSlice";
import LoaBlankScreen from "@/components/LoaBlankScreen/LoaBlankScreen";
import { RESOURCES } from "@/constants/resources";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import NurseDataDownload from "./NurseDataDownload/NurseDataDownload";
import { BsFiletypePdf } from "react-icons/bs";

const NurseNotes = () => {
  const { id, aId } = useParams();
  const [searchParams, _setSearchParams] = useSearchParams();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState<INurseNoteState>({
    id: "",
    patientId: "",
    patientAdmissionHistoryId: "",
    bp: "",
    bp1: "",
    bp2: "",
    pulse: "",
    temperature: "",
    spo2: "",
    weight: "",
    rbs: "",
    height: "",
    note: "",
    vitalsDate: moment().format("YYYY-MM-DD"),
    vitalsTime: moment().format("HH:mm")
  });
  const [state, setState] = useState<INurseState>({
    patientAdmissionHistoryId: "",
    patientId: "",
    UHID: "",
    totalPages: "",
    firstName: "",
    lastName: "",
    age: "",
    patientPic: "",
    dateOfAdmission: "",
    gender: "",
    patientProfilePic: ""
  });

  const patient = useSelector((store: RootState) => store.patient);

  const [dropDownsState, setDropDownsState] = useState<INurseDropDownsState>({
    displayAddForm: false,
    isModalOpen: false,
    openMenuId: null,
    displayViewModal: false
  });
  const [nurseNotes, setNurseNotes] = useState([]);

  const notes = useSelector((store: RootState) => store.notes);

  const fetchNurseNotes = async () => {
    const page = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "-createdAt";

    if (id && aId) {
      try {
        const { data: patientData } = await getSinglePatient(id);
        const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);

        const { data: nurseNotesData } = await getAllNurseNotes({
          limit: 20,
          page: page,
          sort: sort,
          patientAdmissionHistoryId: aId,
          "noteDateTime[gte]": searchParams.get("startDate"),
          "noteDateTime[lte]": searchParams.get("endDate")
        });

        setNurseNotes(nurseNotesData.data);

        setState((prev) => ({
          ...prev,
          totalPages: nurseNotesData?.pagination?.totalPages,
          patientId: id,
          patientAdmissionHistoryId: aId,
          dateOfAdmission: patientAdmissionHistory?.data?.dateOfAdmission,
          patientProfilePic: patientData?.data?.patientPicUrl || "",
          gender: patientData?.data?.gender || "",
          firstName: patientData?.data?.firstName || "",
          lastName: patientData?.data?.lastName || "",
          age: patientData?.data?.age || "",
          patientPic: patientData?.data?.patientPicUrl || "",
          UHID: patientData?.data?.uhid
        }));
        let date = "";
        if (new Date(patientAdmissionHistory?.data?.dateOfAdmission) > new Date()) {
          date = patientAdmissionHistory?.data?.dateOfAdmission;
        }
        setData((prev) => ({
          ...prev,
          patientId: id,
          vitalsDate: date ? moment(date).format("YYYY-MM-DD") : moment().format("YYYY-MM-DD"),
          vitalsTime: date ? moment(date).format("HH:mm") : moment().format("HH:mm"),
          patientAdmissionHistoryId: aId
        }));
      } catch (error) {
        console.error("Error fetching nurse notes or patient data:", error);
      }
    }
  };

  const fetchLoa = async () => {
    try {
      const { data } = await getAllLoa({
        limit: 1,
        page: 1,
        sort: "-noteDateTime",
        patientAdmissionHistoryId: aId
      });
      if (data.status == "success") {
        const isSameDate = (createdAt: string) => {
          const date1 = new Date(createdAt);
          const date2 = new Date(); // current date

          return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
          );
        };
        if (isSameDate(data?.data[0]?.noteDateTime)) {
          dispatch(setloa({ loa: data?.data[0]?.loa, id: data?.data[0]?._id }));
        } else {
          dispatch(setloa({ loa: false, id: "" }));
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchLoa();
  }, [id, aId]);
  useEffect(() => {
    fetchNurseNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const resetState = () => {
    dispatch(resetNurseNote());
    setData((prev) => ({
      ...prev,
      id: "",
      bp1: "",
      bp2: "",
      pulse: "",
      temperature: "",
      spo2: "",
      weight: "",
      rbs: "",
      height: "",
      note: "",
      vitalsDate: moment().format("YYYY-MM-DD"),
      vitalsTime: moment().format("HH:mm")
    }));
  };

  const updateFunctionNurseNotes = (id: string) => {
    const updatedState = compareObjects(notes.nurseNote, data, true);
    const payload: { [key: string]: unknown } = {};
    if (updatedState.vitalsDate !== undefined || updatedState.vitalsTime !== undefined) {
      const combinedDateTime = `${data.vitalsDate} ${data.vitalsTime}`;
      const formattedDateTime = new Date(combinedDateTime).toISOString();
      payload.noteDateTime = formattedDateTime;
    }
    if (updatedState.bp !== undefined) payload.bp = updatedState.bp;
    if (updatedState.pulse !== undefined) payload.pulse = updatedState.pulse;
    if (updatedState.temperature !== undefined) payload.temperature = updatedState.temperature;
    if (updatedState.spo2 !== undefined) payload.spo2 = updatedState.spo2;
    if (updatedState.rbs !== undefined) payload.rbs = updatedState.rbs;
    if (updatedState.height !== undefined) payload.height = updatedState.height;
    if (updatedState.weight !== undefined) payload.weight = updatedState.weight;
    if (updatedState.note !== undefined) payload.note = updatedState.note;

    if (!Object.entries(payload).length) {
      return;
    }

    return updateNurseNotes(id, payload);
  };

  const handleSubmit = async () => {
    try {
      if (!id) {
        throw new Error("Patient not found");
      }
      if ((data.bp1.trim() && !data.bp2.trim()) || (!data.bp1.trim() && data.bp2.trim())) {
        throw new Error("bp not valid");
      }
      if (
        !data.bp1.trim() &&
        !data.bp2.trim() &&
        !data.pulse.trim() &&
        !data.temperature.trim() &&
        !data.spo2.trim() &&
        !data.weight.trim() &&
        !data.rbs.trim() &&
        !data.height.trim() &&
        !data?.note.trim()
      ) {
        throw new Error("All fields are empty");
      }

      if ((data.height && Number(data.height) < 50) || Number(data.height) > 272) {
        toast.error("Height Should Between 50cm to 272cm");
        return;
      }
      if (data.id) {
        if (data.bp1.trim() && data.bp2.trim()) {
          data.bp = `${data.bp1.trim()}/${data.bp2.trim()}`;
        }

        const response = await updateFunctionNurseNotes(data.id);
        if (response && response.status == 200) {
          fetchNurseNotes();
        }
        toast.success("Nurse Note Updated Successfully");
        resetState();
      } else {
        const combinedDateTime = `${data.vitalsDate} ${data.vitalsTime}`;
        const formattedDateTime = new Date(combinedDateTime).toISOString();
        const body = { ...data, noteDateTime: formattedDateTime };

        if (data.bp1.trim() && data.bp2.trim()) {
          body.bp = `${data.bp1.trim()}/${data.bp2.trim()}`;
        }

        const response = await createNurseNotes(body);
        if (response && response?.status == 201) {
          toast.success("Note save successfully");
          resetState();
          fetchNurseNotes();
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleChange = useCallback((e: React.SyntheticEvent) => {
    const { name, value } = e.target as HTMLInputElement;

    // Regex patterns
    const positiveRegex = /^\d*\.?\d*$/; // only positive numbers + decimals
    const tempRegex = /^-?\d*\.?\d*$/; // allow negative + decimals

    const numberFieldsName = [
      "pulse",
      "temperature",
      "weight",
      "spo2",
      "rbs",
      "bp1",
      "bp2",
      "height"
    ];

    if (numberFieldsName.includes(name)) {
      const regex = name === "temperature" ? tempRegex : positiveRegex;

      if (value === "" || regex.test(value)) {
        setData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleChangeQuill = useCallback((name: string, value: string) => {
    setData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const toggleMenu = (id: string) => {
    setDropDownsState((prev) => ({
      ...prev,
      openMenuId: dropDownsState.openMenuId === id ? null : id
    }));
  };

  const toggleFunctionType = async (value: INurseNote, type: string) => {
    if (type == "edit") {
      dispatch(
        setNurseNote({
          vitalsDate: value?.noteDateTime && moment(value?.noteDateTime).format("YYYY-MM-DD"),
          vitalsTime: value?.noteDateTime && moment(value?.noteDateTime).format("HH:mm"),

          note: value.note || data.note,
          bp: value.bp || `${data.bp1}/${data.bp2}`,
          pulse: value.pulse || data.pulse,
          temperature: value?.temperature || data.temperature,
          spo2: value?.spo2 || data.spo2,
          rbs: value?.rbs || data.rbs,
          height: value?.height || data.height,
          weight: value?.weight || data.weight
        })
      );
      setData((prevState) => ({
        ...prevState,
        ...value,
        id: value?._id,
        bp1: value?.bp && value.bp.includes("/") ? value.bp.split("/")[0] : "",
        bp2: value?.bp && value.bp.includes("/") ? value.bp.split("/")[1] : "",
        vitalsDate: value?.noteDateTime && moment(value?.noteDateTime).format("YYYY-MM-DD"),
        vitalsTime: value?.noteDateTime && moment(value?.noteDateTime).format("HH:mm")
      }));
    }
    if (type == "delete") {
      setData((prevState) => ({
        ...prevState,
        id: value._id
      }));
      toggleModal();
    }
  };

  const confirmDeleteNote = async () => {
    const response = await deleteNurseNotes(data.id);
    if (response.data?.status == "success") {
      resetState();
      toast.success(response.data?.message);
      fetchNurseNotes();
      toggleModal();
    }
  };

  const toggleModal = () => {
    setDropDownsState({ ...dropDownsState, isModalOpen: !dropDownsState.isModalOpen });
  };

  const handleDisabled = () => {
    if (
      !data?.note.trim() &&
      !data.bp1.trim() &&
      !data.bp2.trim() &&
      !data.pulse.trim() &&
      !data.temperature.trim() &&
      !data.spo2.trim() &&
      !data.rbs.trim() &&
      !data.height.trim() &&
      !data.weight.trim()
    ) {
      return true;
    }
    return false;
  };

  const handleDateTimeChange = (data: string, type: string) => {
    let value = moment().format("YYYY-MM-DD");
    if (data) {
      value = moment(data).format("YYYY-MM-DD");
    }
    if (type == "date") {
      setData((prev) => ({ ...prev, vitalsDate: value }));
    } else if (type == "time") {
      setData((prev) => ({ ...prev, vitalsTime: data }));
    }
  };

  const toggleViewModal = () => {
    setDropDownsState({ ...dropDownsState, displayViewModal: !dropDownsState.displayViewModal });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calculateRowHeight = (_rowData: any) => {
    // For simplicity, let's assume a fixed height for now
    return 60; // adjust this value based on your row content
  };
  // Define A4 size dimensions (in pixels)
  const A4_HEIGHT = 542; // approx. 297mm
  // const _A4_WIDTH = 595; // approx. 210mm
  const [rowsPerPage, setRowsPerPage] = useState<INurseNote[][]>([]);
  const [currentPage, setCurrentPage] = useState<string | number>("All");

  useEffect(() => {
    if (nurseNotes.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let currentPageRows: any[] = [];
      let currentHeight = 0;

      nurseNotes.forEach((rowData: INurseNote) => {
        const rowHeight = calculateRowHeight(rowData);
        if (currentHeight + rowHeight > A4_HEIGHT) {
          rows.push(currentPageRows);
          currentPageRows = [rowData];
          currentHeight = rowHeight;
        } else {
          currentPageRows.push(rowData);
          currentHeight += rowHeight;
        }
      });

      if (currentPageRows.length > 0) {
        rows.push(currentPageRows);
      }

      setRowsPerPage(rows);
    }
  }, [nurseNotes]);

  const chunkArray = (array: INurseNote[], size: number) => {
    return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
      array.slice(i * size, i * size + size)
    );
  };
  const paginatedData = chunkArray(nurseNotes, 8);

  const targetRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  const handleDownload = async () => {
    const element = targetRef.current;
    const header = headerRef.current;
    if (!element || !header) return;

    try {
      const tables = element.querySelectorAll("table");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Add header to the first page
      const headerCanvas = await html2canvas(header, {
        useCORS: true,
        scale: 2, // reduce scale
        backgroundColor: "#ffffff"
      });
      const headerImgWidth = pdfWidth;
      const headerImgHeight = (headerCanvas.height * headerImgWidth) / headerCanvas.width;
      pdf.addImage(
        headerCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        headerImgWidth,
        headerImgHeight
      );

      let yOffset = headerImgHeight;

      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const wrapper = table.parentElement;
        if (!wrapper) return;
        const canvas = await html2canvas(wrapper, {
          useCORS: true,
          scale: 2, // reduce scale
          backgroundColor: "#ffffff"
        });

        const imgWidth = pdfWidth;
        const canvasPerPage = document.createElement("canvas");
        const ctx = canvasPerPage.getContext("2d");
        if (!ctx) return;
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const pageHeightPx = (canvas.width * pdfHeight) / pdfWidth;

        let position = 0;

        if (i > 0) {
          pdf.addPage();
          yOffset = 0;
        }

        while (position < canvas.height) {
          const sliceHeight = Math.min(pageHeightPx, canvas.height - position);

          canvasPerPage.width = canvas.width;
          canvasPerPage.height = sliceHeight;

          ctx.clearRect(0, 0, canvasPerPage.width, canvasPerPage.height);
          ctx.drawImage(
            canvas,
            0,
            position,
            canvas.width,
            sliceHeight,
            0,
            0,
            canvas.width,
            sliceHeight
          );

          const imgDataPart = canvasPerPage.toDataURL("image/png");
          if (i > 0 && position === 0) {
            // do nothing
          } else if (yOffset === headerImgHeight && i === 0 && position === 0) {
            // do nothing, yOffset is already set
          } else if (position > 0) {
            pdf.addPage();
            yOffset = 0;
          }
          pdf.addImage(
            imgDataPart,
            "PNG",
            0,
            yOffset,
            imgWidth,
            (sliceHeight * imgWidth) / canvas.width
          );
          yOffset += (sliceHeight * imgWidth) / canvas.width;

          position += sliceHeight;
        }
      }

      pdf.save("Notes.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleClickOutside = (event: MouseEvent<Document>) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setDropDownsState((prev) => ({
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

  return (
    <div className="bg-[#F4F2F0]  min-h-[calc(100vh-64px)]">
      <div className=" container">
        <div className="flex lg:px-8 sm:px-2  bg-[#F4F2F0] justify-between md:flex-row flex-col md:items-center">
          <div className="flex items-center gap-3">
            <div
              className="p-3 cursor-pointer w-fit bg-white rounded-full"
              onClick={() => {
                navigate(-1);
              }}
            >
              <FaArrowLeft />
            </div>
            <div className="my-5 flex flex-col items-start">
              <BreadCrumb
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
              <div className=" text-[18px] font-bold">RMO / Nurse Notes</div>
            </div>
          </div>
          <div className="h-fit max-w-xl rounded-xl">
            <div className=" flex">
              <div className="flex  items-center py-4   ">
                <div
                  className={`flex rounded-full  border-2 ${
                    state.gender == "Male"
                      ? "border-[#00685F]"
                      : state.gender == "Female"
                      ? "border-[#F14E9A]"
                      : "border-gray-500"
                  }   overflow-hidden w-12 h-12 items-center justify-center`}
                >
                  <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                    {state?.patientProfilePic ? (
                      <img src={state?.patientProfilePic} alt="profile" className="w-full h-full" />
                    ) : (
                      <div className="w-full flex text uppercase text font-semibold text-[#575F4A] items-center justify-center">
                        {state?.firstName?.slice(0, 1)}
                        {state?.lastName?.slice(0, 1)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4">
                  <div className="flex mb-1  items-center">
                    <h2
                      title={`${state.firstName} ${state.lastName}`}
                      className="text-xs font-semibold"
                    >
                      {state.firstName &&
                        capitalizeFirstLetter(
                          state.firstName?.length > 15
                            ? state.firstName?.slice(0, 15) + "..."
                            : state.firstName
                        )}{" "}
                      {state.lastName &&
                        capitalizeFirstLetter(
                          state.lastName.length > 15
                            ? state.lastName.slice(0, 15) + "..."
                            : state.lastName
                        )}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-600">
                    UHID:
                    <span className="font-medium text-black"> {formatId(state.UHID)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <RBACGuard resource={RESOURCES.NURSE_NOTES} action="write">
          {!patient.loa.loa ? (
            <div className=" bg-[#F4F2F0]  p-5 px-8  py-0 pb-10 rounded-lg font-semibold">
              <div className="rounded-2xl h-fit bg-white px-5 py-3">
                <div
                  className={` flex items-center justify-between border-b ${
                    patient.loa.loa ? "pb-2" : "pb-0"
                  }  border-gray-300`}
                >
                  <div className="flex items-center">
                    <IoIosArrowUp
                      className={`cursor-pointer h-4 w-4 mr-1 ${
                        !dropDownsState.displayAddForm ? "" : "rotate-180"
                      }`}
                      onClick={() => {
                        setDropDownsState({
                          ...dropDownsState,
                          displayAddForm: !dropDownsState.displayAddForm
                        });
                      }}
                    />
                    <p className="text-[13px] font-bold">Add Vitals</p>
                    {!dropDownsState.displayAddForm && (
                      <div className="ml-4 text-xs text-nowrap whitespace-nowrap flex items-center text-gray-500">
                        <CustomCalendar
                          value={data.vitalsDate}
                          disabledDate={(current) => {
                            if (!current) return false;

                            const minDate = new Date(state.dateOfAdmission);
                            minDate.setHours(0, 0, 0, 0); // normalize

                            const currentDate = current.toDate(); // Convert from Moment to JS Date
                            currentDate.setHours(0, 0, 0, 0); // normalize

                            return currentDate < minDate;
                          }}
                          onChange={(date) => {
                            handleDateTimeChange(date, "date");
                          }}
                        >
                          <div className="flex  items-center">
                            {data?.vitalsDate && formateNormalDate(data?.vitalsDate)}
                            <div className="flex cursor-pointer items-center justify-center w-4 mx-2 h-4">
                              <img alt="calender" src={calendar} className="w-full h-full" />
                            </div>
                          </div>
                        </CustomCalendar>
                        <hr className="mx-[2px] text-gray-300  w-[15px] rotate-90 bg-blue-500 " />
                        <CustomTimePicker
                          value={data.vitalsTime}
                          onChange={(time) => {
                            handleDateTimeChange(time, "time");
                          }}
                        >
                          {data.vitalsTime && data.vitalsTime.split(":").slice(0, 2).join(":")}
                          <div className="flex items-center justify-center w-4 ml-3 h-4">
                            <img alt="clock" src={clock} className="w-full cursor-pointer h-full" />
                          </div>
                        </CustomTimePicker>
                      </div>
                    )}
                  </div>
                  {!patient.loa.loa && (
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outlined"
                        className="text-[#636363]! cursor-pointer border-none text-xs!"
                        onClick={() => {
                          resetState();
                        }}
                      >
                        Clear all
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={handleDisabled()}
                        type="submit"
                        className="rounded-xl! text-xs! bg-[#575F4A] px-6! py-1! text-white"
                        onClick={() => {
                          handleSubmit();
                        }}
                      >
                        {data.id ? "Update" : "Save"}
                      </Button>
                    </div>
                  )}
                </div>
                <div
                  className={` ${
                    !dropDownsState.displayAddForm ? "grid" : "hidden"
                  } h-fit lg:grid-cols-6 sm:grid-cols-3 gap-4 py-4 items-start`}
                >
                  <div className="col-span-3 grid grid-cols-3 gap-x-12 gap-y-3">
                    <div>
                      <label className="block mb-1.5 ml-0.5 text-sm font-medium">B.P (mm Hg)</label>
                      <div
                        id="bp"
                        className="flex items-center gap-0 justify-start h-fit
                  px-3 text-gray-900 rounded-lg  border-2  focus-within:border-black border-gray-400 w-full placeholder:text-gray-400"
                      >
                        <Input
                          type="text"
                          name="bp1"
                          containerClass="w-fit!"
                          maxLength={3}
                          placeholder="___"
                          className="rounded-lg! border-none w-[30px]! placeholder:text-lg border-gray-400 border p-0! py-3!"
                          value={data.bp1}
                          onChange={handleChange}
                        />
                        /
                        <Input
                          type="text"
                          name="bp2"
                          maxLength={3}
                          containerClass="w-fit!"
                          placeholder="___"
                          className="rounded-lg border-none w-[30px]! placeholder:text-lg border-gray-400 border p-0! py-3!"
                          value={data.bp2}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <Input
                      type="text"
                      label="Pulse (bpm)"
                      labelClassName="text-black!"
                      value={data.pulse}
                      name="pulse"
                      maxLength={data.pulse.includes(".") ? 5 : 3}
                      className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                      onChange={handleChange}
                    />
                    <Input
                      type="text"
                      maxLength={6}
                      label="Temperature (°F)"
                      labelClassName="text-black!"
                      onChange={handleChange}
                      name="temperature"
                      placeholder="Enter"
                      value={data.temperature}
                      className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                    />
                    <Input
                      type="text"
                      maxLength={data.spo2.includes(".") ? 5 : 3}
                      name="spo2"
                      labelClassName="text-black!"
                      label="SP02 (%)"
                      value={data.spo2}
                      onChange={handleChange}
                      className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                    />
                    <Input
                      type="text"
                      name="weight"
                      maxLength={data.weight.includes(".") ? 5 : 4}
                      labelClassName="text-black!"
                      label="Weight (kg)"
                      value={data.weight}
                      onChange={handleChange}
                      className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                    />
                    <Input
                      type="text"
                      name="rbs"
                      maxLength={data.rbs.includes(".") ? 5 : 3}
                      labelClassName="text-black!"
                      label="R.B.S (mg/dl)"
                      value={data.rbs}
                      onChange={handleChange}
                      className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter"
                    />
                    <Input
                      type="text"
                      name="height"
                      maxLength={data.height.includes(".") ? 6 : 4}
                      labelClassName="text-black!"
                      label="Height (cm)"
                      value={data.height}
                      onChange={handleChange}
                      className="w-40 rounded-lg! border border-gray-400 p-2 py-3"
                      placeholder="Enter in cm"
                    />
                    <Input
                      name="BMI"
                      maxLength={3}
                      labelClassName="text-black!"
                      label="BMI"
                      disabled
                      value={calculateBMI(data.weight, data.height)}
                      className="w-40 rounded-lg!  border border-gray-400 p-2 py-3"
                      placeholder="BMI"
                    />
                  </div>
                  <div className=" sm:col-span-3 sm:col-start-1 lg:col-span-3  lg:col-start-4 ">
                    <RichTextEditor
                      label="Notes"
                      placeholder="Start typing..."
                      maxLength={5000}
                      value={data.note}
                      name="note"
                      onChange={handleChangeQuill}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <LoaBlankScreen />
          )}
        </RBACGuard>

        <div className="bg-white px-8 font-semibold text-xs py-5">
          {(searchParams.get("startDate") || nurseNotes.length > 0) && (
            <div className="flex justify-between items-center w-full py-4">
              <p className="text-[14px] font-semibold ml-6">All Records</p>

              <div className="flex items-center justify-center gap-2">
                <DateRange>
                  <Button
                    type="submit"
                    variant="outlined"
                    size="base"
                    className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                  >
                    <img src={calendar} alt="calender" />
                    {searchParams.get("startDate")
                      ? `Date Range ${formatDate(searchParams.get("startDate"))} to ${formatDate(
                          searchParams.get("endDate")
                        )}`
                      : "Date Range"}
                  </Button>
                </DateRange>
                <NurseDataDownload
                  patientDetails={state}
                  aid={aId}
                  button={
                    <Button
                      type="submit"
                      variant="outlined"
                      size="base"
                      className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                    >
                      <BsFiletypePdf className="mr-2" size={18} />
                      Download All
                    </Button>
                  }
                />
                {/* <Button
                  type="submit"
                  variant="outlined"
                  size="base"
                  onClick={() => {}}
                  className="flex text-xs! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                >
                  <BiPrinter className="mr-2" size={18} />
                  Print
                </Button>
                <Button
                  type="submit"
                  variant="outlined"
                  size="base"
                  // onClick={toggleViewModal}
                  className="flex px-6! py-2! text-xs! border-[#D4D4D4]! border!  rounded-lg  text-[#505050] "
                >
                  View
                </Button> */}
              </div>
            </div>
          )}
          {nurseNotes.length > 0 ? (
            <div className="overflow-auto min-h-[160px] max-w-full">
              {" "}
              <table
                id="print-section"
                className=" sm:w-[1000px] lg:w-full text-sm text-left h-fit"
              >
                <thead className="bg-[#E9E8E5] w-full h-fit">
                  <tr className="text-[#505050] text-xs font-medium">
                    <th className="px-6 py-3 text-center  w-1/12 text-nowrap whitespace-nowrap">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">B.P (mm Hg)</th>
                    <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap"> Pulse (bpm)</th>
                    <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">
                      Temperature (°F)
                    </th>
                    <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">SPO2 (%)</th>
                    <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">Weight (kg)</th>
                    <th className="px-4 py-3 w-1/12 text-nowrap whitespace-nowrap">RBS(mg/dl)</th>
                    <th className="px-3 py-3 w-1/12 text-nowrap text-center whitespace-nowrap">
                      Height (cm)
                    </th>
                    <th className="px-3 py-3 w-1/12 text-nowrap text-center whitespace-nowrap">
                      BMI
                    </th>
                    <th className="px-4 py-3 w-1/12 ">Notes</th>
                    <RBACGuard resource={RESOURCES.NURSE_NOTES} action="write">
                      <th className="px-4 py-3 w-1/10">{""}</th>
                    </RBACGuard>
                  </tr>
                </thead>
                <tbody className="bg-white w-full h-full">
                  {nurseNotes.map((value: INurseNote, index: number) => {
                    return (
                      <tr
                        className="hover:bg-[#F6F6F6C7] text-xs border-b border-[#DCDCDCE0]"
                        key={index}
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
                        <td className="px-4 py-7 ">{value?.spo2 || "--"}</td>
                        <td className="px-4 py-7 ">{value?.weight || "--"}</td>
                        <td className="px-4 py-7 ">{value?.rbs || "--"}</td>
                        <td className="pl-12 py-7">{value?.height || "--"}</td>
                        <td className="pl-12 py-7">
                          {calculateBMI(value?.weight, value?.height) || "--"}
                        </td>
                        <td
                          className="px-4 py-7 sm:w-3/6 w-3/5 overflow-hidden text-overflow-ellipsis break-all max-w-md"
                          dangerouslySetInnerHTML={{ __html: value?.note }}
                        ></td>
                        <RBACGuard resource={RESOURCES.NURSE_NOTES} action="write">
                          <td className="w-fit relative pr-1 ">
                            <div
                              onClick={() => {
                                if (!patient.loa.loa) {
                                  toggleMenu(value?._id);
                                }
                              }}
                              className="bg-[#E5EBCD] relative flex w-5 h-7 items-center justify-center rounded-md hover:bg-[#D4E299] cursor-pointer"
                            >
                              <img src={kabab} alt="icon" className="w-full h-full" />
                              {dropDownsState.openMenuId === value._id && (
                                <div
                                  ref={menuRef}
                                  className="absolute right-3 top-0  overflow-hidden shadow-[0px_0px_20px_#00000017] mt-2 w-fit bg-white border border-gray-300 rounded-lg z-10 flex items-center justify-center"
                                >
                                  <div className="p-1  text-nowrap whitespace-nowrap gap-0 flex-col flex justify-center bg-white shadow-lg rounded-lg w-fit">
                                    <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                      <div
                                        onClick={() => {
                                          window.scrollTo({ top: 0 });

                                          toggleFunctionType(value, "edit");
                                        }}
                                        className="flex items-center  cursor-pointer"
                                      >
                                        <p>Edit</p>
                                      </div>
                                    </div>
                                    <hr />
                                    <NurseDataDownload
                                      patientDetails={state}
                                      data={[value]}
                                      button={
                                        <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                          <div className="flex items-center  cursor-pointer">
                                            <p>Download</p>
                                          </div>
                                        </div>
                                      }
                                    />

                                    <hr />
                                    <div className="text-xs font-semibold cursor-pointer p-2 px-3 text-nowrap whitespace-nowrap">
                                      <div
                                        onClick={() => {
                                          toggleFunctionType(value, "delete");
                                        }}
                                        className="flex text-red-600 items-center  cursor-pointer"
                                      >
                                        <p>Delete</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </RBACGuard>
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
      <div>
        <DeleteConfirm
          toggleModal={toggleModal}
          isModalOpen={dropDownsState.isModalOpen}
          confirmDeleteNote={confirmDeleteNote}
        />
      </div>

      <Modal isOpen={dropDownsState.displayViewModal} toggleModal={toggleViewModal}>
        <div className="relative">
          <div className="flex">
            <div
              id="print-content"
              className=" max-w-[1282px] max-h-[583px]  overflow-y-scroll bg-white rounded-lg "
            >
              <div ref={targetRef} className="w-[799px] mr-2 rounded-xl bg-white print-container">
                <div ref={headerRef} className="flex items-center justify-evenly p-4 ">
                  <div className=" w-1/4 ">
                    <img alt="Logo" className="w-24 h-12" src={Logo} />
                  </div>
                  <div className="flex items-center justify-center w-full ">
                    <img
                      alt="Profile picture of Rajesh William"
                      className="h-16 w-16 rounded-full"
                      src={
                        state.patientPic ||
                        "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
                      }
                    />
                    <div className="ml-4 max-w-1/2 text-[10px] flex flex-col">
                      <div className="flex mb-1">
                        <h2 className=" font-semibold">
                          {state.firstName} {state.lastName}
                        </h2>

                        <div className="flex ml-1 items-center bg-[#E4FFEE] w-fit px-1">
                          <span className="bg-[#3A913D] h-1 w-1 mr-1 rounded-full "></span>
                          <span className=" text-[#3A913D] rounded-xl ">Inpatient</span>
                        </div>
                      </div>
                      <p className="mb-1">
                        UHD: <span className="font-semibold">{state.UHID}</span>
                      </p>
                      <p className="mb-1">
                        Gender: <span className="font-semibold">{state.gender}</span>
                        Age: <span className="font-semibold">{state.age}</span>
                      </p>
                    </div>
                  </div>
                  <div className="ml-auto  text-right items-end flex flex-col w-fit">
                    <p className=" mb-2 text-[10px] font-medium text-nowrap">
                      {/* 06 June, 2025 To 07 June, 2025 */}
                    </p>

                    <Button
                      type="submit"
                      variant="outlined"
                      size="base"
                      onClick={() => {
                        handleDownload();
                      }}
                      className="flex text-right  items-end text-[10px]! py-2! border-[#D4D4D4]!  border! rounded-lg! text-[#505050] "
                    >
                      <BiPrinter className="mr-1" size={12} />
                      Print
                    </Button>
                  </div>
                </div>
                <div className="overflow-x-hidden">
                  {currentPage != "All" ? (
                    <table id="print-section" className=" h-fit w-fit  text-sm text-left">
                      <thead className="bg-[#E9E8E5] ">
                        <tr className="text-[#505050] text-xs font-medium">
                          <th className="px-2 text-[8px] py-3 text-center  w-1/12 text-nowrap whitespace-nowrap">
                            Date & Time
                          </th>
                          <th className="px-2 text-[8px] py-3 text-center  w-1/12 text-nowrap whitespace-nowrap">
                            Time
                          </th>
                          <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                            B.P (mm Hg)
                          </th>
                          <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                            {" "}
                            Pulse (bpm)
                          </th>
                          <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                            Temperature (°F)
                          </th>
                          <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                            SPO2 (%)
                          </th>
                          <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                            Weight (kg)
                          </th>
                          <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                            RBS(mg/dl)
                          </th>
                          <th className="px-4 text-[8px] py-3 w-1/12 ">Notes</th>
                        </tr>
                      </thead>
                      <tbody
                        style={{ height: A4_HEIGHT, overflow: "hidden" }}
                        className="bg-white h-fit "
                      >
                        {(rowsPerPage[Number(currentPage) - 1] || []).map(
                          (value: INurseNote, index: number) => {
                            return (
                              <tr
                                className="hover:bg-[#F6F6F6C7] text-xs border-b border-[#DCDCDCE0]"
                                key={index}
                              >
                                <td className="pl-7 py-7">
                                  <p className="text-[9px] text-nowrap font-medium">
                                    {value.noteDateTime && formatDate(value.noteDateTime)}
                                  </p>
                                </td>
                                <td className="pl-7 py-7">
                                  <p className="text-gray-500 text-nowrap text-[9px] font-medium">
                                    {value.noteDateTime &&
                                      convertBackendDateToTime(value.noteDateTime)}
                                  </p>
                                </td>
                                <td className="px-0 py-7 text-center text-[9px] font-medium ">
                                  {value?.bp || "--"}
                                </td>
                                <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                  {value?.pulse || "--"}
                                </td>
                                <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                  {value?.temperature || "--"}
                                </td>
                                <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                  {value?.spo2 || "--"}
                                </td>
                                <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                  {value?.weight || "--"}
                                </td>
                                <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                  {value?.rbs || "--"}
                                </td>
                                <td
                                  className="px-2 py-7 text-[9px] sm:w-3/6 w-3/5 overflow-hidden text-overflow-ellipsis break-all max-w-md"
                                  dangerouslySetInnerHTML={{ __html: value?.note }}
                                ></td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  ) : (
                    (paginatedData || []).map((group, pageIndex: number) => (
                      <div
                        key={pageIndex}
                        style={{
                          pageBreakBefore: pageIndex !== 0 ? "always" : "auto",
                          breakBefore: pageIndex !== 0 ? "page" : "auto"
                        }}
                        className="w-full"
                      >
                        <table id="print-section" className=" h-fit w-fit  text-sm text-left">
                          <thead className="bg-[#E9E8E5] ">
                            <tr className="text-[#505050] text-xs font-medium">
                              <th className="px-2 text-[8px] py-3 text-center  w-1/12 text-nowrap whitespace-nowrap">
                                Date & Time
                              </th>
                              <th className="px-2 text-[8px] py-3 text-center  w-1/12 text-nowrap whitespace-nowrap">
                                Time
                              </th>
                              <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                                B.P (mm Hg)
                              </th>
                              <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                                {" "}
                                Pulse (bpm)
                              </th>
                              <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                                Temperature (°F)
                              </th>
                              <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                                SPO2 (%)
                              </th>
                              <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                                Weight (kg)
                              </th>
                              <th className="px-4 text-[8px] py-3 w-1/12 text-nowrap whitespace-nowrap">
                                RBS(mg/dl)
                              </th>
                              <th className="px-4 text-[8px] py-3 w-1/12 ">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.map((value: INurseNote, index: number) => {
                              const isLongNote = value?.note?.length > 100; // adjust the limit as you wish

                              return (
                                <>
                                  <tr
                                    className="hover:bg-[#F6F6F6C7] text-xs border-b border-[#DCDCDCE0]"
                                    key={index}
                                  >
                                    <td className="pl-7 py-7">
                                      <p className="text-[9px] text-nowrap font-medium">
                                        {value.noteDateTime && formatDate(value.noteDateTime)}
                                      </p>
                                    </td>
                                    <td className="pl-7 py-7">
                                      <p className="text-gray-500 text-nowrap text-[9px] font-medium">
                                        {value.noteDateTime &&
                                          convertBackendDateToTime(value.noteDateTime)}
                                      </p>
                                    </td>
                                    <td className="px-0 py-7 text-center text-[9px] font-medium ">
                                      {value?.bp || "--"}
                                    </td>
                                    <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                      {value?.pulse || "--"}
                                    </td>
                                    <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                      {value?.temperature || "--"}
                                    </td>
                                    <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                      {value?.spo2 || "--"}
                                    </td>
                                    <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                      {value?.weight || "--"}
                                    </td>
                                    <td className="px-2 py-7 text-center text-[9px] font-medium ">
                                      {value?.rbs || "--"}
                                    </td>
                                    {!isLongNote && (
                                      <td className="px-2 py-7 text-[9px] break-all max-w-md overflow-hidden text-ellipsis">
                                        <div
                                          dangerouslySetInnerHTML={{
                                            __html: isLongNote
                                              ? `${value.note?.slice(0, 50)}...`
                                              : value.note
                                          }}
                                        />
                                      </td>
                                    )}
                                  </tr>

                                  {/* Second row only for long note */}
                                  {isLongNote && (
                                    <tr className=" text-xs border-b border-[#DCDCDCE0]">
                                      <td
                                        colSpan={9}
                                        className="pl-7  text-[9px] px-2 py-7 w-full overflow-hidden  break-all "
                                        dangerouslySetInnerHTML={{ __html: value?.note }}
                                      ></td>
                                    </tr>
                                  )}
                                </>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="w-[478px] bg-[#F4F2F0] sticky top-0">
              <div className="w-full px-5">
                <div className="flex my-5 w-full items-center justify-between">
                  <div className="w-fit text-lg font-semibold ">Download </div>
                  <div className="text-xs font-medium text-[#636363]">
                    {rowsPerPage.length} Sheet of Paper
                  </div>
                </div>
                <div className="flex my-5 w-full items-center justify-between">
                  <div className="w-fit text-xs font-semibold ">Page</div>
                  <div className="">
                    <Select
                      optionClassName="w-[296px]!"
                      className="w-[296px]! bg-white border-0!"
                      options={[{ label: "All", value: "All" }]}
                      // options={[
                      //   { label: "All", value: "All" },
                      //   ...rowsPerPage.map((_, index) => ({
                      //     label: index + 1,
                      //     value: index + 1
                      //   }))
                      // ]}
                      onChange={(_e, data) => {
                        setCurrentPage(data.value);
                      }}
                      value={{ label: currentPage, value: currentPage }}
                      name="page"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    handleDownload();
                  }}
                  className="border! w-full! border-[#575F4A] bg-white! text-[#575F4A]!"
                >
                  Download as a Pdf
                </Button>
              </div>
            </div>
          </div>
          <div
            onClick={toggleViewModal}
            className="absolute cursor-pointer -top-3 -right-3 bg-white p-2 border rounded-full"
          >
            <div className="flex items-center justify-center bg-primary-dark rounded-[6px]">
              <RxCross2 size={15} />
            </div>
          </div>
        </div>
      </Modal>

      <div className="container">
        <Pagination totalPages={state.totalPages} />
      </div>
    </div>
  );
};

export default NurseNotes;
