import { BreadCrumb, Button, CustomCalendar, EmptyPage, Input } from "@/components";
import calender from "@/assets/images/calender.svg";
import React, { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  createNewGroupActivity,
  createNewGroupActivitytabs,
  getAllPatient,
  getGroupActivity,
  getGroupActivitytabs,
  updateNewGroupActivity,
  updateNewGroupActivitytabs
} from "@/apis";
import { setAllActivityPatient } from "@/redux/slice/patientSlice";
import { capitalizeFirstLetter, formatId } from "@/utils/formater";
import toast from "react-hot-toast";
import handleError from "@/utils/handleError";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TableShimmer } from "@/components/Shimmer/Shimmer";
import messageIcon from "@/assets/images/messageIcon.svg";
import messageIcondisbale from "@/assets/images/messageIconDisable.svg";
import moment from "moment";
import { convertDate } from "@/components/BasicDetaills/utils";
import { IData, IActivity, ITabData } from "./types";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import { useAuth } from "@/providers/AuthProvider";
import Filter from "@/components/Filter/Filter";

const GroupActivity = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("All");
  console.log("✌️selected --->", selected);
  const { auth } = useAuth();

  const [loaData, setLoaData] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<{
    row: string;
    col: string;
    state: string;
  } | null>(null);

  const [hoveredIndexTab, setHoveredIndexTab] = useState<{
    col: string;
    state: string;
  } | null>(null);

  const [state, setState] = useState({
    loading: false,
    activityDateTime: moment().format("YYYY-MM-DD")
  });

  const dropdownData = useSelector((store: RootState) => store.dropdown);
  console.log("✌️dropdownData --->", dropdownData);
  const [data, setData] = useState<IData[]>([]);

  const [tabdata, settabData] = useState<{ _id?: string; tabInfo?: ITabData[] }>({
    tabInfo: [],
    _id: ""
  });
  console.log("✌️tabdata --->", tabdata);

  const [rememeberstring, setRememberstring] = useState("");
  const [rememeberstringTab, setRememberstringTab] = useState("");

  const fetchAllPatient = async () => {
    setState((prev) => ({
      ...prev,
      loading: true
    }));
    let centers: string[] = [];
    // array of center objects for name lookup when aggregating notes
    const userCenters = (auth.user?.centerId || []) as {
      _id: string;
      name?: string;
      centerName?: string;
    }[];
    if (selected === "All" || !selected) {
      centers = userCenters.map((data: any) => data._id);
      console.log("✌️centers in All--->", centers);
      if (centers.length <= 0) navigate("/");
    } else {
      centers = [selected];
      console.log("✌️centers in selected--->", centers);
    }
    try {
      const tabs = dropdownData.groupActivityTabs.data.map((data) => ({
        name: data,
        note: "",
        notes: {}
      }));

      // determine centerId: if a specific center is selected use it, otherwise default to user's first center
      const currentCenterId =
        selected && selected !== "All"
          ? selected
          : auth.user?.centerId && auth.user.centerId.length
          ? auth.user.centerId[0]._id
          : undefined;

      // Fetch and aggregate tab notes. If 'All' is selected, fetch tabs for every center and combine notes.
      let updatedtabs: ITabData[] = [];
      let tabsResponseId = "";
      if (selected === "All") {
        const tabsResponses = await Promise.all(
          centers.map((cId) =>
            getGroupActivitytabs({
              date: new Date(`${state.activityDateTime} 00:00`).toISOString(),
              centerId: cId
            }).catch(() => null)
          )
        );

        // Build a map of tab name -> aggregated notes across centers
        const aggregated: Record<string, string[]> = {};
        tabsResponses.forEach((resp, idx) => {
          const cId = centers[idx];
          const centerObj =
            userCenters.find((c) => c._id === cId) ||
            ({} as { _id?: string; name?: string; centerName?: string });
          const centerName = centerObj.name || centerObj.centerName || cId;
          const tabInfo: ITabData[] = resp?.data?.data?.[0]?.tabInfo || [];
          tabInfo.forEach((t) => {
            if (!t.note || !t.note.trim()) return;
            if (!aggregated[t.name]) aggregated[t.name] = [];
            aggregated[t.name].push(`${centerName}: ${t.note}`);
          });
        });

        updatedtabs = tabs.map((item) => ({
          ...item,
          note: aggregated[item.name] ? aggregated[item.name].join("\n") : item.note
        }));
        // keep id empty for aggregated view (multiple centers)
        tabsResponseId = "";
      } else {
        const tabsdatareponse = await getGroupActivitytabs({
          date: new Date(`${state.activityDateTime} 00:00`).toISOString(),
          centerId: currentCenterId
        });

        const updateMap = new Map(
          tabsdatareponse?.data?.data[0]?.tabInfo.map((item: { name: string; note: string }) => [
            item.name,
            item.note
          ])
        );

        updatedtabs = tabs.map((item) => ({
          ...item,
          note:
            typeof updateMap.get(item.name) === "string"
              ? (updateMap.get(item.name) as string)
              : item.note
        }));
        tabsResponseId = tabsdatareponse?.data?.data[0]?._id || "";
      }
      console.log("✌️updatedtabs --->", updatedtabs);

      settabData({ _id: tabsResponseId, tabInfo: [...updatedtabs] });

      const response = await getAllPatient({
        status: "Inpatient,Discharge Initiated",
        isStatusAndFilterQuery: true,
        onlyPatient: true,
        centers: centers.join(","),
        fields: "_id firstName lastName patientPic gender uhid"
      });

      console.log("response --->", response);
      const data = response?.data?.data?.length
        ? response?.data?.data?.map((data: IData) => ({
            _id: "",
            firstName: data?.firstName,
            uhid: data.uhid,
            lastName: data?.lastName,
            patientId: data?._id,
            gender: data?.gender,
            patientPicUrl: data?.patientPicUrl,
            activity: dropdownData?.groupActivityTabs?.data?.map((value: string) => ({
              name: value,
              isSelected: false,
              note: ""
            }))
          }))
        : [];

      // Fetch group activity. If 'All' is selected aggregate notes across centers per patient
      const mergedGroupMap = new Map<string, IData>();
      let loaPatientIds: string[] = [];
      if (selected === "All") {
        const groupResponses = await Promise.all(
          centers.map((cId) =>
            getGroupActivity({
              date: new Date(`${state.activityDateTime} ${"00:00"}`).toISOString(),
              centerId: cId
            }).catch(() => null)
          )
        );
        groupResponses.forEach((resp, idx) => {
          const cId = centers[idx];
          const centerObj =
            userCenters.find((c) => c._id === cId) ||
            ({} as { _id?: string; name?: string; centerName?: string });
          const centerName = centerObj.name || centerObj.centerName || cId;
          const dataList: IData[] = resp?.data?.data?.data || [];
          // collect loa ids from first response that contains it
          if (!loaPatientIds.length && resp?.data?.data?.loaPatientIds) {
            loaPatientIds = resp.data.data.loaPatientIds || [];
          }
          dataList.forEach((p) => {
            const key = p.patientId || "";
            const existing =
              (mergedGroupMap.get(key) as IData & { activity: IActivity[] }) ||
              ({ ...p, activity: [] } as IData & { activity: IActivity[] });
            p.activity?.forEach((act: IActivity) => {
              const existingAct = existing.activity.find((a: IActivity) => a.name === act.name);
              const notePrefix = act.note ? `${centerName}: ${act.note}` : "";
              if (existingAct) {
                // append notes if both exist
                existingAct.note = [existingAct.note, notePrefix].filter(Boolean).join("\n");
                existingAct.isSelected = existingAct.isSelected || !!act.note;
              } else {
                existing.activity.push({ ...act, note: notePrefix, isSelected: !!act.note });
              }
            });
            mergedGroupMap.set(key, existing as IData);
          });
        });
      } else {
        const groupData = await getGroupActivity({
          date: new Date(`${state.activityDateTime} ${"00:00"}`).toISOString(),
          centerId: currentCenterId
        });
        loaPatientIds = groupData?.data?.data?.loaPatientIds || [];
        (groupData?.data?.data?.data || []).forEach((p: IData) =>
          mergedGroupMap.set(p.patientId || "", p)
        );
      }

      setLoaData(loaPatientIds);

      const updatedArray = data?.map((item: IData) => {
        const key = item.patientId || "";
        const match = mergedGroupMap.get(key);
        if (!match) return item;

        // Create a map for quick lookup from merged activities
        const matchActivities: IActivity[] = match.activity || [];
        const activityMap = new Map(matchActivities.map((act: IActivity) => [act?.name, act]));

        // Merge: update existing or keep as-is
        const mergedActivities = item?.activity?.map((act: IActivity) => {
          if (activityMap.has(act?.name)) {
            return activityMap.get(act?.name) as IActivity; // updated from merged data
          }
          return act; // keep original
        });

        // Add new activities from match that aren't in item.activity
        const existingNames = new Set((item?.activity || []).map((act: IActivity) => act.name));
        const newActivities = matchActivities.filter(
          (act: IActivity) => !existingNames.has(act.name)
        );

        return {
          ...item,
          _id: match._id,
          activity: [...(mergedActivities ?? []), ...(newActivities ?? [])]
        };
      });
      setData(updatedArray);
      dispatch(setAllActivityPatient(response?.data));
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

  useEffect(() => {
    fetchAllPatient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownData, state.activityDateTime, selected]);

  const [horizontalPosition, setHorizontalPosition] = useState<"left" | "right">("right");
  const [position, setPosition] = useState<"top" | "bottom">("bottom");

  const handleCheckboxChange = async (
    rowIdx: number,
    colIdx: number,
    patient: IData,
    cell: IActivity
  ) => {
    setRememberstring(cell.note || "");
    const updatedData = [...data];
    const current = updatedData[rowIdx];

    if (!current.activity || !current.activity[colIdx]) return;

    const activityItem = current.activity[colIdx];
    const wasSelected = activityItem.isSelected;

    // Toggle selection
    activityItem.isSelected = !wasSelected;
    const test = activityItem.note;
    if (!activityItem.isSelected) {
      // Case: Unchecked
      activityItem.note = "";

      setData(updatedData); // Update UI
      if (test) {
        await handleSubmit(patient?.patientId); // Submit changes
      } else {
        setHoveredIndex(null);
      }
    } else {
      // Case: Checked
      setData(updatedData); // Update UI
      setHoveredIndex({
        row: patient.patientId || "",
        col: cell.name || "",
        state: ""
      }); // Open note popup
    }
  };

  const handleDelete = async (rowIdx: number, colIdx: number, patient: IData) => {
    const updatedData = [...data];
    const current = updatedData[rowIdx];

    if (!current.activity || !current.activity[colIdx]) return;

    const activityItem = current.activity[colIdx];
    activityItem.note = "";
    setData(updatedData); // Update UI
    await handleSubmit(patient?.patientId); // Submit changes
  };

  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    if (pendingSubmit) {
      handleSubmitTab().then(() => setPendingSubmit(false));
    }
    // only run when pendingSubmit changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSubmit]);

  const handleDeleteTab = (tabname: string) => {
    settabData((prev) => ({
      ...prev,
      tabInfo: prev?.tabInfo?.map((row) => (row.name === tabname ? { ...row, note: "" } : row))
    }));
    setPendingSubmit(true); // trigger useEffect
  };

  const handleNoteChange = (rowIdx: number, colIdx: number, value: string) => {
    setData((prevData) =>
      prevData.map((row, rIdx) => {
        if (rIdx !== rowIdx) return row;
        return {
          ...row,
          activity:
            row?.activity &&
            row?.activity.map((activityItem, aIdx) => {
              if (aIdx !== colIdx) return activityItem;
              return {
                ...activityItem,
                note: value
              };
            })
        };
      })
    );
  };

  useEffect(() => {
    if (inputBoxRef.current) {
      const rect = inputBoxRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const spaceRight = window.innerWidth - rect.left;
      const spaceLeft = rect.right;

      // Vertical position
      if (spaceBelow < 500 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }

      // Horizontal position
      if (spaceRight < 550 && spaceLeft > spaceRight) {
        setHorizontalPosition("right");
      } else {
        setHorizontalPosition("left");
      }
    }
  }, [hoveredIndex, hoveredIndexTab]);

  const handleNoteChange1 = (name: string, value: string) => {
    settabData((prevData) => ({
      _id: prevData._id,
      tabInfo: prevData?.tabInfo?.map((row) => {
        if (row.name !== name) return row;
        return {
          ...row,
          note: value
        };
      })
    }));
  };

  const handleSubmit = async (id: string | undefined) => {
    if (id === undefined) return;
    try {
      const filterData = data?.filter((value) => value.patientId === id);

      if (filterData[0]._id) {
        const payload = filterData.map((value) => ({
          patientId: value?.patientId,
          activityDateTime: new Date(`${state.activityDateTime} ${"00:00"}`).toISOString(),
          _id: value._id,
          activity: value?.activity
            ?.filter((value) => value.note?.trim())
            .map((data) => ({
              name: data.name,
              note: data.note,
              isSelected: true
            }))
        }));
        const response = await updateNewGroupActivity(filterData[0]._id, payload[0]);

        // setData((prevData) => ({ ...prevData, _id: response?.data?.data?._id }));

        if (response.data.status === "success") {
          const incomingObj = response?.data?.data;
          // setData((prevData) => ({ ...prevData, _id: response?.data?.data?._id }));
          const updated = data.map((item) =>
            item.patientId === incomingObj.patientId ? { ...item, _id: incomingObj._id } : item
          );

          setData(updated);
          toast.success("Group activity added successfully");
        }
      } else {
        const payload = filterData?.map((value) => ({
          patientId: value?.patientId,
          activityDateTime: new Date(`${state.activityDateTime} ${"00:00"}`).toISOString(),
          activity: value?.activity
            ?.filter((value) => value.note?.trim())
            .map((data) => ({
              name: data.name,
              note: data.note,
              isSelected: true
            }))
        }));
        const response = await createNewGroupActivity(payload[0]);
        setData((prevData) => ({ ...prevData, _id: response?.data?.data?._id }));
        if (response.data.status === "success") {
          const incomingObj = response?.data?.data;
          // setData((prevData) => ({ ...prevData, _id: response?.data?.data?._id }));
          const updated = data.map((item) =>
            item.patientId === incomingObj.patientId ? { ...item, _id: incomingObj._id } : item
          );

          setData(updated);
          toast.success("Group activity added successfully");
        }
      }
      // fetchAllPatient();
      setHoveredIndex(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSubmitTab = async () => {
    try {
      const filterData = tabdata?.tabInfo?.filter((value) => value.note.trim());
      // determine centerId similar to fetch
      const currentCenterId =
        selected && selected !== "All"
          ? selected
          : auth.user?.centerId && auth.user.centerId.length
          ? auth.user.centerId[0]._id
          : undefined;

      if (tabdata._id) {
        const response = await updateNewGroupActivitytabs(tabdata._id, {
          tabInfo: filterData,
          centerId: currentCenterId
        });
        if (response.data.status === "success") {
          toast.success("Tabs note added successfully");
        }
        settabData((prevData) => ({ ...prevData, _id: response?.data?.data?._id }));
      } else {
        const response = await createNewGroupActivitytabs({
          activityDateTime: new Date(`${state.activityDateTime} ${"00:00"}`).toISOString(),
          tabInfo: filterData,
          centerId: currentCenterId
        });
        settabData((prevData) => ({ ...prevData, _id: response?.data?.data?._id }));

        if (response.data.status === "success") {
          toast.success("Tabs note added successfully");
        }
      }
      // fetchAllPatient();
      setHoveredIndexTab(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDateTimeChange = (data: string) => {
    let value = "";
    if (data) {
      value = moment(data).format("YYYY-MM-DD");
    } else {
      value = moment().format("YYYY-MM-DD");
    }
    setState((prev) => ({
      ...prev,
      activityDateTime: value
    }));
  };

  const inputBoxRef = useRef<HTMLDivElement>(null);
  const inputBoxTabRef = useRef<HTMLDivElement>(null);

  const hoveredIndexRef = useRef<typeof hoveredIndex>(null);
  const remeberstring = useRef<typeof rememeberstring>("");

  const hoveredIndexRefTab = useRef<typeof hoveredIndexTab>(null);
  const remeberstringTab = useRef<typeof rememeberstringTab>("");

  // keep ref in sync with state
  useEffect(() => {
    hoveredIndexRef.current = hoveredIndex;
  }, [hoveredIndex]);

  useEffect(() => {
    remeberstring.current = rememeberstring;
  }, [rememeberstring]);

  useEffect(() => {
    hoveredIndexRefTab.current = hoveredIndexTab;
  }, [hoveredIndexTab]);

  useEffect(() => {
    remeberstringTab.current = rememeberstringTab;
  }, [rememeberstringTab]);

  const closePopUpFunction = () => {
    const currentHoveredIndex = hoveredIndexRef.current;
    const remeberstrings = remeberstring.current;
    setData((prevData) =>
      prevData.map((row) => {
        if (row.patientId !== currentHoveredIndex?.row) return row;
        return {
          ...row,
          activity: row.activity?.map((activityItem) => {
            if (activityItem.name !== currentHoveredIndex?.col) return activityItem;
            const trimmedNote = remeberstrings?.trim();
            return {
              ...activityItem,
              note: remeberstrings,
              isSelected: trimmedNote.length > 0
            };
          })
        };
      })
    );

    setHoveredIndex(null);
    setRememberstring("");
  };

  const closePopUpFunctionTab = () => {
    const currentHoveredIndex = hoveredIndexRefTab.current;
    const remeberstrings = remeberstringTab.current;
    settabData((prevData) => ({
      _id: prevData._id,
      tabInfo: prevData?.tabInfo?.map((row) => {
        if (row.name !== currentHoveredIndex?.col) return row;
        return {
          ...row,
          note: remeberstrings.trim()
        };
      })
    }));

    setHoveredIndexTab(null);
    setRememberstringTab("");
  };

  // To Show Cursor Inside Textarea on Open

  const textAreaRefs = useRef<Record<string, React.RefObject<HTMLTextAreaElement | null>>>({});

  useEffect(() => {
    if (hoveredIndex?.row && hoveredIndex?.col) {
      const uniqueKey = `${hoveredIndex.row}-${hoveredIndex.col}`;
      const textAreaRef = textAreaRefs.current[uniqueKey];
      if (hoveredIndex?.state === "" && textAreaRef?.current) {
        textAreaRef.current.focus();
      }
    }
  }, [hoveredIndex]);

  const headerTextAreaRefs = useRef<Record<string, React.RefObject<HTMLTextAreaElement | null>>>(
    {}
  );

  useEffect(() => {
    if (hoveredIndexTab?.col) {
      const headerTextAreaRef = headerTextAreaRefs.current[hoveredIndexTab.col];
      if (hoveredIndexTab.state === "no" && headerTextAreaRef?.current) {
        headerTextAreaRef.current.focus();
      }
    }
  }, [hoveredIndexTab]);

  // To Show Cursor Inside Textarea on Open End

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (inputBoxRef.current && !inputBoxRef.current.contains(event.target as Node)) {
      closePopUpFunction();
    }
  }, []);

  const handleClickOutsideTab = useCallback((event: MouseEvent) => {
    if (inputBoxTabRef.current && !inputBoxTabRef.current.contains(event.target as Node)) {
      closePopUpFunctionTab();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside as unknown as EventListener);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutsideTab as unknown as EventListener);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideTab as unknown as EventListener);
    };
  }, [handleClickOutsideTab]);

  return (
    <div className="bg-[#F4F2F0] min-h-[calc(100vh-64px)] ">
      <div className=" ">
        <div className="w-[1328px]! mx-auto py-5  ">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div
                className="p-3 w-fit bg-white rounded-full cursor-pointer"
                onClick={() => {
                  navigate(-1);
                }}
              >
                <FaArrowLeft />
              </div>
              <div className="  my-5 flex flex-col items-start" aria-label="Breadcrumb">
                <BreadCrumb name="Group Activity" id={""} aId={""} />
                <div className=" text-[18px] font-bold">Group Activity</div>
              </div>
            </div>
            <div className="flex items-center ">
              <div className="flex border-r whitespace-nowrap text-nowrap text-gray-500 border-gray-400 items-center text-xs  px-5">
                <p className="mr-2"> Select Date (1 View Only)</p>
                <CustomCalendar
                  className="z-50!"
                  value={state?.activityDateTime}
                  onChange={(date) => {
                    handleDateTimeChange(date);
                  }}
                >
                  <div className="flex flex-col w-fit">
                    <div
                      id="dateOfAdmission"
                      className="flex cursor-pointer bg-white justify-between gap-2 w-fit items-center border-2 border-gray-300 p-3  uppercase rounded-[7px]! font-medium"
                    >
                      {state?.activityDateTime ? (
                        <p> {convertDate(state.activityDateTime)}</p>
                      ) : (
                        <p className="text-[#6B6B6B] text-bold">DD/MM/YYYY</p>
                      )}
                      <div className=" cursor-pointer flex items-center justify-center w-5 h-5">
                        <img src={calender} alt="calender" className="w-full h-full" />
                      </div>
                    </div>
                  </div>
                </CustomCalendar>
              </div>
              {/* <div className="flex ">GDL2</div> */}
              <Filter selected={selected} setSelected={setSelected} />
            </div>
          </div>
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
          {!state.loading && (
            <div className="bg-white  h-[70vh] overflow-y-auto rounded-2xl">
              {data.length ? (
                <div className="font-sans rounded-xl text-[13px] leading-[18px] text-[#1a1a1a]">
                  <div className="overflow-x-auto h-[70vh] scrollbar-hidden">
                    <table className="min-w-[1328px]   border-collapse">
                      <thead className="z-30 sticky  top-0">
                        <tr className="rounded-t-md border-b py-3 bg-[#E9E8E5] select-none">
                          <th className="sticky  left-0 z-10 bg-[#E9E8E5] px-3 py-4 text-left text-[12px] leading-[15px] font-semibold text-[#505050] ">
                            <span className=" text-center ">S.No</span>
                          </th>
                          <th className="sticky w-[200px] left-12 z-10 bg-[#E9E8E5] px-4 py-4 text-left text-[12px] leading-[15px] font-semibold text-[#505050] ">
                            <span className="min-w-[150px]">Patient Name</span>
                          </th>

                          {tabdata?.tabInfo?.map((data) => {
                            if (!headerTextAreaRefs.current[data.name]) {
                              headerTextAreaRefs.current[data.name] =
                                React.createRef<HTMLTextAreaElement>();
                            }
                            return (
                              <th
                                key={data.name}
                                className="text-nowrap z-0 min-w-[170px] py-3 text-center text-[12px] leading-[15px] font-semibold text-[#505050]"
                              >
                                <div className="relative min-w-[170px] gap-1 mx-auto flex items-center justify-center">
                                  <p> {data.name}</p>
                                  <div>
                                    <div className="relative w-full">
                                      <img
                                        onClick={() => {
                                          if (data.note.trim()) {
                                            setRememberstringTab(data.note);
                                            setHoveredIndexTab({
                                              col: data?.name || "",
                                              state: "yes"
                                            });
                                          } else {
                                            setHoveredIndexTab({
                                              col: data?.name || "",
                                              state: "no"
                                            });
                                          }
                                        }}
                                        src={messageIcon}
                                        className="w-4 h-4 text-[#505050] cursor-pointer"
                                      />
                                      {data.note && (
                                        <div className="absolute p-1 top-[-10%] right-[-10%] rounded-full bg-red-500"></div>
                                      )}
                                    </div>
                                    {hoveredIndexTab?.col == data.name && (
                                      <div
                                        ref={inputBoxTabRef}
                                        className={`absolute z-100 w-[305px] p-0.5 border rounded-lg bg-[#F2F2F2] shadow-mg   top-[-10] right-0`}
                                      >
                                        {hoveredIndexTab?.state == "no" ? (
                                          <div className="bg-[#F2F2F2] rounded-lg ">
                                            <textarea
                                              ref={headerTextAreaRefs.current[data.name]}
                                              value={data?.note}
                                              onChange={(e) =>
                                                selected === "All"
                                                  ? undefined
                                                  : handleNoteChange1(data.name, e.target.value)
                                              }
                                              placeholder="Enter note..."
                                              // disabled={selected === "All"}
                                              className="text-xs border-black bg-white p-2 h-[100px] resize-none border-2 focus:outline-none focus:border-primary-dark rounded-lg w-full"
                                            ></textarea>
                                            <RBACGuard
                                              resource={RESOURCES.GROUP_ACTIVITY}
                                              action="write"
                                            >
                                              <div className="flex justify-end py-1 space-x-4 text-[14px]">
                                                <button
                                                  onClick={closePopUpFunctionTab}
                                                  className="text-gray-700 cursor-pointer mx-2 font-normal"
                                                >
                                                  Cancel
                                                </button>
                                                {/* only show save when a specific center is selected */}
                                                {selected !== "All" &&
                                                  (data.note.trim() ? (
                                                    <Button
                                                      name="save"
                                                      onClick={() => handleSubmitTab()}
                                                      className=" text-xs! bg-[#323E2A]! px-[15px]! py-[4px]! rounded-lg!"
                                                      variant="contained"
                                                      size="base"
                                                    >
                                                      Save
                                                    </Button>
                                                  ) : (
                                                    <Button
                                                      className=" text-xs! cursor-not-allowed bg-gray-400! px-[15px]! py-[4px]! rounded-lg!"
                                                      variant="contained"
                                                      size="base"
                                                    >
                                                      Save
                                                    </Button>
                                                  ))}
                                              </div>
                                            </RBACGuard>
                                          </div>
                                        ) : (
                                          <div className="bg-[#F2F2F2] rounded-sm ">
                                            {/* Render each center's note with a border */}
                                            <div className="bg-white p-2 rounded-sm border-2 h-[100px] overflow-y-auto">
                                              {data.note
                                                .split("\n")
                                                .filter(Boolean)
                                                .map((line, idx, arr) => (
                                                  <div
                                                    key={idx}
                                                    className={`text-xs text-start text-gray-700 font-semibold py-1 px-2 ${
                                                      idx !== arr.length - 1
                                                        ? "border-b border-gray-300"
                                                        : ""
                                                    }`}
                                                  >
                                                    {line}
                                                  </div>
                                                ))}
                                            </div>
                                            <RBACGuard
                                              resource={RESOURCES.GROUP_ACTIVITY}
                                              action="write"
                                            >
                                              <div className="flex justify-end  py-1 space-x-4 text-[14px]">
                                                <button
                                                  onClick={() => handleDeleteTab(data.name)}
                                                  className="text-gray-700 mx-2 cursor-pointer font-normal"
                                                >
                                                  Delete
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    setRememberstringTab(data?.note || "");
                                                    setHoveredIndexTab({
                                                      col: hoveredIndexTab?.col || "",
                                                      state: "no"
                                                    });
                                                  }}
                                                  className="text-[#7C8E30] cursor-pointer mx-2 font-semibold underline"
                                                >
                                                  Edit
                                                </button>
                                              </div>
                                            </RBACGuard>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {data?.map((patient: IData, index: number) => (
                          <tr
                            key={patient?.patientId}
                            className="border-b left-0 z-10 border-[#d9d4c9]"
                          >
                            <td className="py-2 sticky left-0 z-10 bg-white px-3 ">
                              {/* S.No */}
                              <span className="  text-xs  text-center">{index + 1}</span>
                            </td>
                            <td className="py-2 sticky left-12 z-10 bg-white px-4 min-w-[240px]">
                              <div className="flex items-center gap-6">
                                {/* Patient Details */}
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`flex rounded-full border-2 ${
                                      patient?.gender === "Male"
                                        ? "border-[#00685F]"
                                        : patient?.gender === "Female"
                                        ? "border-[#F14E9A]"
                                        : "border-gray-500"
                                    } overflow-hidden w-[40px] h-[40px] items-center justify-center`}
                                  >
                                    <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-white overflow-hidden items-center justify-center">
                                      {patient?.patientPicUrl ? (
                                        <img
                                          src={patient?.patientPicUrl}
                                          alt="profile"
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="uppercase text-sm font-medium">
                                          {patient?.firstName?.trim().slice(0, 1)}
                                          {patient?.lastName?.trim().slice(0, 1)}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex flex-col items-start">
                                    <p
                                      className="text-xs font-semibold"
                                      title={`${patient?.firstName || ""} ${
                                        patient?.lastName || ""
                                      }`}
                                    >
                                      {patient?.firstName
                                        ? capitalizeFirstLetter(
                                            patient.firstName.length > 10
                                              ? patient.firstName.slice(0, 10) + "..."
                                              : patient.firstName
                                          )
                                        : ""}{" "}
                                      {patient?.lastName
                                        ? capitalizeFirstLetter(
                                            patient.lastName.length > 10
                                              ? patient.lastName.slice(0, 10) + "..."
                                              : patient.lastName
                                          )
                                        : ""}
                                      <br />
                                      {formatId(patient?.uhid)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Other columns */}

                            {patient.activity?.map((cell, colIdx) => {
                              const uniqueKey = `${patient.patientId}-${cell.name}`;
                              if (!textAreaRefs.current[uniqueKey]) {
                                textAreaRefs.current[uniqueKey] =
                                  React.createRef<HTMLTextAreaElement>();
                              }
                              return (
                                <td
                                  key={colIdx}
                                  className="py-3 px-3 min-w-[100px]  text-center font-bold"
                                >
                                  {patient.patientId && loaData.includes(patient.patientId) ? (
                                    <div
                                      title="The patient is on LOA today."
                                      className="relative  w-fit gap-2 mx-auto flex items-center justify-center"
                                    >
                                      {/* <Input
                                        type="checkbox"
                                        // checked={}
                                        // <-- add this
                                        className="accent-[#323E2A] bg-black! h-4"
                                      /> */}
                                      <div className=" bg-gray-200 rounded-xs w-4 h-4"></div>
                                      <div>
                                        <div className="w-full">
                                          <img
                                            // onClick={}
                                            src={messageIcondisbale}
                                            className="w-[20px] h-[20px] text-gray-200 cursor-pointer"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative  w-fit gap-1 mx-auto flex items-center justify-center">
                                      <Input
                                        type="checkbox"
                                        checked={cell?.isSelected}
                                        onChange={() =>
                                          handleCheckboxChange(index, colIdx, patient, cell)
                                        } // <-- add this
                                        className="accent-[#323E2A] h-4"
                                      />

                                      <div>
                                        <div className="relative w-full">
                                          <img
                                            onClick={() => {
                                              if (cell.note) {
                                                setRememberstring(cell?.note);
                                                setHoveredIndex({
                                                  row: patient?.patientId || "",
                                                  col: cell?.name || "",
                                                  state: "hey"
                                                });
                                              }
                                            }}
                                            src={messageIcon}
                                            className="w-8 h-8 text-[#505050] cursor-pointer"
                                          />

                                          {cell.note && (
                                            <div className="absolute p-1 top-[15%] right-0 rounded-full bg-red-500"></div>
                                          )}
                                        </div>
                                        {hoveredIndex?.row === patient.patientId &&
                                          hoveredIndex?.col === cell.name && (
                                            <div
                                              ref={inputBoxRef}
                                              className={`absolute z-100 w-[305px] p-0.5 border rounded-lg bg-[#F2F2F2] shadow-mg 
                                             ${
                                               position === "top"
                                                 ? "top-full mb-2"
                                                 : "top-full mt-2"
                                             }
    ${horizontalPosition === "right" ? "right-0" : "left-0"}
                                          
                                          `}
                                            >
                                              {hoveredIndex?.state !== "hey" ? (
                                                <div className="bg-[#F2F2F2] rounded-lg ">
                                                  {/* <Input
                                              type="text"
                                              value={cell?.note}
                                              placeholder="Enter note..."
                                              onChange={(e) =>
                                                handleNoteChange(index, colIdx, e.target.value)
                                              } // <-- add this
                                              className="text-xs  h-24! border w-full"
                                            /> */}
                                                  <textarea
                                                    value={cell?.note}
                                                    ref={textAreaRefs.current[uniqueKey]}
                                                    placeholder="Enter note..."
                                                    onChange={(e) =>
                                                      handleNoteChange(
                                                        index,
                                                        colIdx,
                                                        e.target.value
                                                      )
                                                    } // <-- add this
                                                    className="text-xs border-black bg-white p-2 h-[100px] resize-none border-2 focus:outline-none focus:border-primary-dark rounded-lg w-full"
                                                  ></textarea>

                                                  <RBACGuard
                                                    resource={RESOURCES.GROUP_ACTIVITY}
                                                    action="write"
                                                  >
                                                    <div className="flex justify-end py-1 space-x-4 text-[14px]">
                                                      <button
                                                        onClick={closePopUpFunction}
                                                        className="text-gray-700 cursor-pointer mx-2 font-normal"
                                                      >
                                                        Cancel
                                                      </button>
                                                      {cell.note?.trim() ? (
                                                        <Button
                                                          name="save"
                                                          onClick={() =>
                                                            handleSubmit(patient?.patientId)
                                                          }
                                                          className=" text-xs! bg-[#323E2A]! px-[15px]! py-[4px]! rounded-lg!"
                                                          variant="contained"
                                                          size="base"
                                                        >
                                                          Save
                                                        </Button>
                                                      ) : (
                                                        <Button
                                                          className=" text-xs! cursor-not-allowed bg-gray-400! px-[15px]! py-[4px]! rounded-lg!"
                                                          variant="contained"
                                                          size="base"
                                                        >
                                                          Save
                                                        </Button>
                                                      )}
                                                    </div>
                                                  </RBACGuard>
                                                </div>
                                              ) : (
                                                <div className="bg-[#F2F2F2] rounded-sm ">
                                                  <div className="px-0.5">
                                                    <textarea
                                                      disabled
                                                      className="resize-none text-gray-700 p-3 h-[100px] rounded-sm focus:outline-none border-2 focus:border-primary-dark font-semibold bg-white text-xs leading-5 w-full"
                                                      value={cell.note}
                                                    ></textarea>
                                                  </div>
                                                  <RBACGuard
                                                    resource={RESOURCES.GROUP_ACTIVITY}
                                                    action="write"
                                                  >
                                                    <div className="flex justify-end  py-1 space-x-4 text-[14px]">
                                                      <button
                                                        onClick={() =>
                                                          handleDelete(index, colIdx, patient)
                                                        }
                                                        className="text-gray-700 mx-2 cursor-pointer font-normal"
                                                      >
                                                        Delete
                                                      </button>
                                                      <button
                                                        onClick={() => {
                                                          setRememberstring(cell?.note || "");
                                                          setHoveredIndex({
                                                            row: hoveredIndex.row,
                                                            col: hoveredIndex.col,
                                                            state: ""
                                                          });
                                                        }}
                                                        className="text-[#7C8E30] cursor-pointer mx-2 font-semibold underline"
                                                      >
                                                        Edit
                                                      </button>
                                                    </div>
                                                  </RBACGuard>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <EmptyPage links="/admin/registration" hidden title="No Patient Found" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupActivity;
