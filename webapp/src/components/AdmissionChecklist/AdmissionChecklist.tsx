import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@/redux/store/store";
import { setDiscardModal, setStepper } from "@/redux/slice/stepperSlice";
import { setPatientAdmission } from "@/redux/slice/patientSlice";

import { updateSinglePatinetAdmissionChecklist, getSinglePatientAdmissionHistory } from "@/apis";
import { Button, DiscardModal, Input, Loader, CheckBox } from "@/components";

import {
  AdmissionChecklistState,
  IisAdmissionChecklist,
  IAdmissionChecklistArray,
  IAdmissionChecklistLink
} from "@/components/AdmissionChecklist/types";

import { checklist, list } from "@/components/AdmissionChecklist/Constant";

import handleError from "@/utils/handleError";
import compareObjects from "@/utils/compareObjects";

const AdmissionChecklist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [state, setState] = useState<AdmissionChecklistState>({
    loading: false,
    init: false,
    orientationOfFamily: "",
    orientationOfPatient: "",
    isInsured: "",
    insuredDetail: ""
  });
  console.log('✌️state to check --->', state);

  const [admissionChecklist, setadmissionChecklist] = useState({
    voluntaryAdmissionForm: [],
    applicationForAdmission: [],
    inVoluntaryAdmissionForm: [],
    minorAdmissionForm: [],
    form90: [],
    familyDeclaration: [],
    section94: [],
    capacityAssessment: [],
    hospitalGuidelineForm: [],
    finacialCounselling: [],
    admissionAssessment: [],
    insuredFile: []
  });

  const [admissionChecklistRemove, setadmissionChecklistRemove] =
    useState<IAdmissionChecklistArray>({
      voluntaryAdmissionForm: [],
      applicationForAdmission: [],
      inVoluntaryAdmissionForm: [],
      minorAdmissionForm: [],
      form90: [],
      familyDeclaration: [],
      section94: [],
      capacityAssessment: [],
      hospitalGuidelineForm: [],
      finacialCounselling: [],
      admissionAssessment: [],
      insuredFile: []
    });

  const [admissionChecklistLink, setadmissionChecklistLink] = useState<IAdmissionChecklistLink>({
    voluntaryAdmissionFormLink: [],
    applicationForAdmissionLink: [],
    inVoluntaryAdmissionFormLink: [],
    minorAdmissionFormLink: [],
    form90Link: [],
    familyDeclarationLink: [],
    section94Link: [],
    capacityAssessmentLink: [],
    hospitalGuidelineFormLink: [],
    finacialCounsellingLink: [],
    admissionAssessmentLink: [],
    insuredFileLink: []
  });

  const [isAdmissionChecklist, setIsAdmissionChecklist] = useState<IisAdmissionChecklist>({
    isapplicationForAdmission: false,
    isvoluntaryAdmissionForm: false,
    isinVoluntaryAdmissionForm: false,
    isminorAdmissionForm: false,
    isform90: false,
    isfamilyDeclaration: false,
    issection94: false,
    iscapacityAssessment: false,
    ishospitalGuidelineForm: false,
    isfinacialCounselling: false
  });

  // console.log("admissionChecklist==========>>>>>>>>", admissionChecklistLink[`admissionAssessmentLink` as keyof typeof admissionChecklistLink]);
  // console.log('=======>', `finacialCounsellingLink` as keyof typeof admissionChecklistLink)
  const patientData = useSelector((store: RootState) => store.patient);
  // console.log("✌️patientData --->", patientData);
  const stepperData = useSelector((store: RootState) => store.stepper);
  // ...existing code inside component ...
  useEffect(() => {
    const pid = patientData.patientAdmission?.patientId;
    const aid = patientData.patientAdmission?._id;
    if (!pid || !aid) return;

    let mounted = true;
    const fetchAdmissionHistory = async () => {
      try {
        setState((s) => ({ ...s, loading: true }));
        const res = await getSinglePatientAdmissionHistory(pid, aid);
        if (!mounted) return;
        console.log("📊 Full API response structure:", JSON.stringify(res?.data, null, 2));
        // console.log("getSinglePatientAdmissionHistory raw ->", res?.data);
        const raw = res?.data?.data ?? res?.data;
        const payload = raw?.admissionChecklist ? raw.admissionChecklist : raw;
        if (!payload) return;

        // FIX: Properly handle admission assessment files
        const admissionAssessmentFiles = payload?.admissionAssessmentLink?.length
          ? payload.admissionAssessmentLink
          : payload?.admissionAssessment || [];

        // console.log('✌️admissionAssessmentFiles --->', admissionAssessmentFiles);

        const mapped = {
          ...patientData.patientAdmission,
          ...payload,
          admissionAssessmentLink: admissionAssessmentFiles
        };
        // console.log('✌️mapped --->', mapped);

        dispatch(setPatientAdmission(mapped));

        // FIX: Set the admissionAssessmentLink state immediately
        setadmissionChecklistLink((prev) => ({
          ...prev,
          admissionAssessmentLink: admissionAssessmentFiles
        }));

        // FIX: Set the checkbox state based on actual files
        setIsAdmissionChecklist((prev) => ({
          ...prev,
          isadmissionAssessment: admissionAssessmentFiles.length > 0
        }));

        setState((prev) => ({
          ...prev,
          orientationOfFamily: payload?.orientationOfFamily ?? prev.orientationOfFamily,
          orientationOfPatient: payload?.orientationOfPatient ?? prev.orientationOfPatient,
          isInsured: payload?.isInsured ?? prev.isInsured,
          insuredDetail: payload?.insuredDetail ?? prev.insuredDetail
        }));
      } catch (err) {
        console.error("fetchAdmissionHistory error:", err);
      } finally {
        setState((s) => ({ ...s, loading: false }));
      }
    };

    fetchAdmissionHistory();
    return () => {
      mounted = false;
    };
  }, [patientData.patientAdmission._id, patientData.patientAdmission.patientId]);

  useEffect(() => {
    if (patientData.patientAdmission._id) {
      setState((prevState) => ({
        ...prevState,
        orientationOfFamily: patientData?.patientAdmission?.orientationOfFamily ? true : false,
        orientationOfPatient: patientData?.patientAdmission?.orientationOfPatient ? true : false,
        isInsured: patientData.patientAdmission.isInsured,
        insuredDetail:
          patientData.patientAdmission?.isInsured == true
            ? patientData?.patientAdmission?.insuredDetail
            : "",
        insuredFile: patientData.patientAdmission.insuredFile
      }));

      // FIX: Get admission assessment files from the updated patientData
      const admissionAssessmentFiles = patientData.patientAdmission.admissionAssessmentLink?.length
        ? patientData.patientAdmission.admissionAssessmentLink
        : patientData.patientAdmission.admissionAssessment || [];

      console.log("🔄 Setting admissionAssessmentFiles:", admissionAssessmentFiles);

      setadmissionChecklistLink((prev) => ({
        ...prev,
        voluntaryAdmissionFormLink: patientData.patientAdmission.voluntaryAdmissionFormLink || [],
        applicationForAdmissionLink: patientData.patientAdmission.applicationForAdmissionLink || [],
        inVoluntaryAdmissionFormLink:
          patientData.patientAdmission.inVoluntaryAdmissionFormLink || [],
        minorAdmissionFormLink: patientData.patientAdmission.minorAdmissionFormLink || [],
        form90Link: patientData.patientAdmission.form90Link || [],
        familyDeclarationLink: patientData.patientAdmission.familyDeclarationLink || [],
        section94Link: patientData.patientAdmission.section94Link || [],
        capacityAssessmentLink: patientData.patientAdmission.capacityAssessmentLink || [],
        // FIX: Use the resolved files
        admissionAssessmentLink: admissionAssessmentFiles,
        hospitalGuidelineFormLink: patientData.patientAdmission.hospitalGuidelineFormLink || [],
        finacialCounsellingLink: patientData.patientAdmission.finacialCounsellingLink || [],
        insuredFileLink: patientData.patientAdmission.insuredFileLink || []
      }));
      setIsAdmissionChecklist((prevState) => ({
        ...prevState,
        isapplicationForAdmission: patientData.patientAdmission.isapplicationForAdmission || false,
        isvoluntaryAdmissionForm: patientData.patientAdmission.isvoluntaryAdmissionForm || false,
        isinVoluntaryAdmissionForm:
          patientData.patientAdmission.isinVoluntaryAdmissionForm || false,
        isminorAdmissionForm: patientData.patientAdmission.isminorAdmissionForm || false,
        isform90: patientData.patientAdmission.isform90 ?? false,
        isfamilyDeclaration: patientData.patientAdmission.isfamilyDeclaration || false,
        issection94: patientData.patientAdmission.issection94 || false,
        iscapacityAssessment: patientData.patientAdmission.iscapacityAssessment || false,
        isfamilyDeclaration: patientData.patientAdmission.isfamilyDeclaration || false,
        issection94: patientData.patientAdmission.issection94 || false,
        iscapacityAssessment: patientData.patientAdmission.iscapacityAssessment || false,
        // FIX: Set based on actual files
        isadmissionAssessment: admissionAssessmentFiles.length > 0,
        ishospitalGuidelineForm: patientData.patientAdmission.ishospitalGuidelineForm || false,
        isfinacialCounselling: patientData.patientAdmission.isfinacialCounselling || false
      }));
    }

    setTimeout(() => {
      setState((prevState) => ({ ...prevState, init: true }));
    }, 1000);
  }, [patientData.patientAdmission]); // FIX: Add dependency

  // Add comprehensive debugging
  useEffect(() => {
    console.log("=== ADMISSION ASSESSMENT DEBUG ===");
    console.log(
      "patientData.admissionAssessment:",
      patientData.patientAdmission.admissionAssessment
    );
    console.log(
      "patientData.admissionAssessmentLink:",
      patientData.patientAdmission.admissionAssessmentLink
    );
    console.log("state admissionAssessmentLink:", admissionChecklistLink.admissionAssessmentLink);
    console.log("isAdmissionAssessment:", isAdmissionChecklist.isadmissionAssessment);
    console.log("================================");
  }, [
    patientData.patientAdmission.admissionAssessment,
    patientData.patientAdmission.admissionAssessmentLink,
    admissionChecklistLink.admissionAssessmentLink,
    isAdmissionChecklist.isadmissionAssessment
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const handleCheckOrientation = (e: SyntheticEvent) => {
    const { name, checked } = e.target as HTMLInputElement;
    setState((prevState) => {
      if (checked) {
        return {
          ...prevState,
          [name]: true
        };
      } else {
        return {
          ...prevState,
          [name]: false
        };
      }
    });
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleCheckForAdmissionChecklist = (e: SyntheticEvent, name: string) => {
    const { checked } = e.target as HTMLInputElement;
    const names = name.startsWith("is") ? name.slice(2) : name;

    console.log(`🔄 Checkbox ${name} changed to:`, checked);
    console.log(`🔄 Corresponding files key: ${names}Link`);
    console.log(
      `🔄 Current files:`,
      admissionChecklistLink[`${names}Link` as keyof typeof admissionChecklistLink]
    );

    setIsAdmissionChecklist((prevState) => {
      if (checked) {
        return { ...prevState, [name]: true };
      } else {
        // Remove files when unchecked
        setadmissionChecklistRemove((prev) => ({
          ...prev,
          [names]: [
            ...(prev[names as keyof typeof prev] || []),
            ...(
              admissionChecklistLink[`${names}Link` as keyof typeof admissionChecklistLink] || []
            ).map(({ filePath }: { filePath: string }) => filePath)
          ]
        }));

        setadmissionChecklistLink((prev) => ({
          ...prev,
          [`${names}Link`]: []
        }));

        setadmissionChecklist((prev) => ({
          ...prev,
          [names]: []
        }));

        return { ...prevState, [name]: false };
      }
    });

    if (!stepperData.discardModal.isFormChanged) {
      dispatch(setDiscardModal({ isFormChanged: true }));
    }
  };

  const updatePateintAddmissionData = (pid: string, aid: string) => {
    const updatedPatientData = compareObjects(patientData.patientAdmission, state, true);

    const formData = new FormData();

    Object.entries(admissionChecklist).forEach(([key, files]) => {
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append(key, file);
        });
      }
    });

    if (updatedPatientData.isInsured != undefined) {
      formData.append("isInsured", updatedPatientData.isInsured.toString());
    }
    if (updatedPatientData.insuredDetail != undefined) {
      formData.append(
        "insuredDetail",
        updatedPatientData.insuredDetail.trim() ? updatedPatientData.insuredDetail : ""
      );
    }
    if (
      updatedPatientData.orientationOfFamily != undefined ||
      updatedPatientData.orientationOfPatient != undefined
    ) {
      formData.append(
        "orientationOfFamily",
        state.orientationOfFamily === true
          ? JSON.stringify(["orientationOfFamily"])
          : JSON.stringify([])
      );
      formData.append(
        "orientationOfPatient",
        state.orientationOfPatient === true
          ? JSON.stringify(["orientationOfPatient"])
          : JSON.stringify([])
      );
    }

    if (![...formData.entries()].length) {
      return; // Exit if formData is empty
    }
    formData.append("type", "update");
    // console.log('✌️formData --->', formData);

    return updateSinglePatinetAdmissionChecklist(formData, pid, aid);
  };

  const deleteateintAddmissionData = (pid: string, aid: string) => {
    if (
      Object.values(admissionChecklistRemove).every((arr) => Array.isArray(arr) && arr.length === 0)
    ) {
      return; // Exit if all arrays in admissionChecklistRemove are empty
    }

    const body = {
      ...admissionChecklistRemove,
      type: "REMOVE"
    };
    return updateSinglePatinetAdmissionChecklist(body, pid, aid);
  };

  const handleSubmit = async (
    _e: SyntheticEvent,
    btnType: "SAVE" | "SAVE_AND_NEXT" | "SAVE_AND_NEXT_DISCARD"
  ) => {
    dispatch(setDiscardModal({ isDiscardModalOpen: false }));
    setState((prev) => ({ ...prev, loading: true }));
    try {
      if (patientData.patientAdmission._id && patientData.patientAdmission?.patientId) {
        const admissionReponse = await updatePateintAddmissionData(
          patientData.patientAdmission?.patientId,
          patientData.patientAdmission._id
        );
        // console.log("✌️admissionReponse --->", admissionReponse);
        if (admissionReponse && admissionReponse.data.status === "success") {
          setadmissionChecklistLink((prev) => ({
            ...prev,
            voluntaryAdmissionFormLink:
              admissionReponse?.data?.data?.admissionChecklist?.voluntaryAdmissionForm,
            applicationForAdmissionLink:
              admissionReponse?.data?.data?.admissionChecklist?.applicationForAdmission,
            inVoluntaryAdmissionFormLink:
              admissionReponse?.data?.data?.admissionChecklist?.inVoluntaryAdmissionForm,
            minorAdmissionFormLink:
              admissionReponse?.data?.data?.admissionChecklist?.minorAdmissionForm,
            form90Link: admissionReponse?.data?.data?.admissionChecklist?.form90,
            familyDeclarationLink:
              admissionReponse?.data?.data?.admissionChecklist?.familyDeclaration,
            section94Link: admissionReponse?.data?.data?.admissionChecklist?.section94,
            capacityAssessmentLink:
              admissionReponse?.data?.data?.admissionChecklist?.capacityAssessment,
            admissionAssessmentLink:
              admissionReponse?.data?.data?.admissionChecklist?.admissionAssessment,
            hospitalGuidelineFormLink:
              admissionReponse?.data?.data?.admissionChecklist?.hospitalGuidelineForm,
            finacialCounsellingLink:
              admissionReponse?.data?.data?.admissionChecklist?.finacialCounselling,
            insuredFileLink: admissionReponse?.data?.data?.admissionChecklist?.insuredFile
          }));
          setIsAdmissionChecklist({
            isapplicationForAdmission: admissionReponse?.data?.data?.admissionChecklist
              ?.applicationForAdmission?.length
              ? true
              : false,
            isvoluntaryAdmissionForm: admissionReponse?.data?.data?.admissionChecklist
              ?.voluntaryAdmissionForm?.length
              ? true
              : false,
            isinVoluntaryAdmissionForm: admissionReponse?.data?.data?.admissionChecklist
              ?.inVoluntaryAdmissionForm?.length
              ? true
              : false,
            isminorAdmissionForm: admissionReponse?.data?.data?.admissionChecklist
              ?.minorAdmissionForm?.length
              ? true
              : false,
            isform90: admissionReponse?.data?.data?.admissionChecklist?.form90?.length
              ? true
              : false,
            isfamilyDeclaration: admissionReponse?.data?.data?.admissionChecklist?.familyDeclaration
              ?.length
              ? true
              : false,
            issection94: admissionReponse?.data?.data?.admissionChecklist?.section94?.length
              ? true
              : false,
            iscapacityAssessment: admissionReponse?.data?.data?.admissionChecklist
              ?.capacityAssessment?.length
              ? true
              : false,
            isadmissionAssessment: admissionReponse?.data?.data?.admissionChecklist
              ?.admissionAssessment?.length
              ? true
              : false,
            ishospitalGuidelineForm: admissionReponse?.data?.data?.admissionChecklist
              .hospitalGuidelineForm?.length
              ? true
              : false,
            isfinacialCounselling: admissionReponse?.data?.data?.admissionChecklist
              .finacialCounselling?.length
              ? true
              : false
          });
          setadmissionChecklist({
            voluntaryAdmissionForm: [],
            applicationForAdmission: [],
            inVoluntaryAdmissionForm: [],
            minorAdmissionForm: [],
            form90: [],
            familyDeclaration: [],
            section94: [],
            capacityAssessment: [],
            hospitalGuidelineForm: [],
            finacialCounselling: [],
            admissionAssessment: [],
            insuredFile: []
          });

          dispatch(
            setPatientAdmission({
              ...patientData.patientAdmission,
              ...isAdmissionChecklist,
              isapplicationForAdmission: admissionReponse?.data?.data?.admissionChecklist
                ?.applicationForAdmission?.length
                ? true
                : false,
              isvoluntaryAdmissionForm: admissionReponse?.data?.data?.admissionChecklist
                ?.voluntaryAdmissionForm?.length
                ? true
                : false,
              isinVoluntaryAdmissionForm: admissionReponse?.data?.data?.admissionChecklist
                ?.inVoluntaryAdmissionForm?.length
                ? true
                : false,
              isminorAdmissionForm: admissionReponse?.data?.data?.admissionChecklist
                ?.minorAdmissionForm?.length
                ? true
                : false,
              isform90: admissionReponse?.data?.data?.admissionChecklist?.form90?.length
                ? true
                : false,
              isfamilyDeclaration: admissionReponse?.data?.data?.admissionChecklist
                ?.familyDeclaration?.length
                ? true
                : false,
              issection94: admissionReponse?.data?.data?.admissionChecklist?.section94?.length
                ? true
                : false,
              iscapacityAssessment: admissionReponse?.data?.data?.admissionChecklist
                ?.capacityAssessment?.length
                ? true
                : false,
              isadmissionAssessment: admissionReponse?.data?.data?.admissionChecklist
                ?.admissionAssessment?.length
                ? true
                : false,
              ishospitalGuidelineForm: admissionReponse?.data?.data?.admissionChecklist
                ?.hospitalGuidelineForm?.length
                ? true
                : false,
              isfinacialCounselling: admissionReponse?.data?.data?.admissionChecklist
                ?.finacialCounselling?.length
                ? true
                : false,
              orientationOfFamily: admissionReponse?.data?.data?.admissionChecklist
                ?.orientationOfFamily?.length
                ? true
                : false,
              orientationOfPatient: admissionReponse?.data?.data?.admissionChecklist
                ?.orientationOfPatient?.length
                ? true
                : false,
              isInsured: admissionReponse?.data?.data?.admissionChecklist?.isInsured ? true : false,
              insuredDetail:
                admissionReponse?.data?.data?.admissionChecklist?.isInsured == true
                  ? admissionReponse?.data?.data?.admissionChecklist?.insuredDetail
                  : "",
              voluntaryAdmissionFormLink:
                admissionReponse?.data?.data?.admissionChecklist?.voluntaryAdmissionForm,
              applicationForAdmissionLink:
                admissionReponse?.data?.data?.admissionChecklist?.applicationForAdmission,
              inVoluntaryAdmissionFormLink:
                admissionReponse?.data?.data?.admissionChecklist?.inVoluntaryAdmissionForm,
              minorAdmissionFormLink:
                admissionReponse?.data?.data?.admissionChecklist?.minorAdmissionForm,
              form90Link: admissionReponse?.data?.data?.admissionChecklist?.form90,
              familyDeclarationLink:
                admissionReponse?.data?.data?.admissionChecklist?.familyDeclaration,
              section94Link: admissionReponse?.data?.data?.admissionChecklist?.section94,
              capacityAssessmentLink:
                admissionReponse?.data?.data?.admissionChecklist?.capacityAssessment,
              admissionAssessmentLink:
                admissionReponse?.data?.data?.admissionChecklist?.admissionAssessment,
              hospitalGuidelineFormLink:
                admissionReponse?.data?.data?.admissionChecklist?.hospitalGuidelineForm,
              finacialCounsellingLink:
                admissionReponse?.data?.data?.admissionChecklist?.finacialCounselling,
              insuredFileLink: admissionReponse?.data?.data?.admissionChecklist?.insuredFile
            })
          );

          setState((prev) => ({ ...prev, loading: false }));
        }

        const delteData = await deleteateintAddmissionData(
          patientData.patientAdmission?.patientId,
          patientData.patientAdmission._id
        );
        if (delteData) {
          setadmissionChecklistRemove({
            voluntaryAdmissionForm: [],
            applicationForAdmission: [],
            inVoluntaryAdmissionForm: [],
            minorAdmissionForm: [],
            form90: [],
            familyDeclaration: [],
            section94: [],
            capacityAssessment: [],
            hospitalGuidelineForm: [],
            finacialCounselling: [],
            insuredFile: [],
            admissionAssessment: []
          });
          setadmissionChecklistLink((prev) => ({
            ...prev,
            voluntaryAdmissionFormLink:
              delteData?.data?.data?.admissionChecklist?.voluntaryAdmissionForm,
            applicationForAdmissionLink:
              delteData?.data?.data?.admissionChecklist?.applicationForAdmission,
            inVoluntaryAdmissionFormLink:
              delteData?.data?.data?.admissionChecklist?.inVoluntaryAdmissionForm,
            minorAdmissionFormLink: delteData?.data?.data?.admissionChecklist?.minorAdmissionForm,
            form90Link: delteData?.data?.data?.admissionChecklist?.form90,
            familyDeclarationLink: delteData?.data?.data?.admissionChecklist?.familyDeclaration,
            section94Link: delteData?.data?.data?.admissionChecklist?.section94,
            capacityAssessmentLink: delteData?.data?.data?.admissionChecklist?.capacityAssessment,
            familyDeclarationLink: delteData?.data?.data?.admissionChecklist?.familyDeclaration,
            section94Link: delteData?.data?.data?.admissionChecklist?.section94,
            capacityAssessmentLink: delteData?.data?.data?.admissionChecklist?.capacityAssessment,
            admissionAssessmentLink: delteData?.data?.data?.admissionChecklist?.admissionAssessment,
            hospitalGuidelineFormLink:
              delteData?.data?.data?.admissionChecklist?.hospitalGuidelineForm,
            finacialCounsellingLink: delteData?.data?.data?.admissionChecklist?.finacialCounselling,
            insuredFileLink: delteData?.data?.data?.admissionChecklist?.insuredFile
          }));
          setIsAdmissionChecklist({
            isapplicationForAdmission: delteData?.data?.data?.admissionChecklist
              ?.applicationForAdmission?.length
              ? true
              : false,
            isvoluntaryAdmissionForm: delteData?.data?.data?.admissionChecklist
              ?.voluntaryAdmissionForm?.length
              ? true
              : false,
            isinVoluntaryAdmissionForm: delteData?.data?.data?.admissionChecklist
              ?.inVoluntaryAdmissionForm?.length
              ? true
              : false,
            isminorAdmissionForm: delteData?.data?.data?.admissionChecklist?.minorAdmissionForm
              ?.length
              ? true
              : false,
            isform90: delteData?.data?.data?.admissionChecklist?.form90?.length ? true : false,
            isfamilyDeclaration: delteData?.data?.data?.admissionChecklist?.familyDeclaration
              ?.length
              ? true
              : false,
            issection94: delteData?.data?.data?.admissionChecklist?.section94?.length
              ? true
              : false,
            iscapacityAssessment: delteData?.data?.data?.admissionChecklist?.capacityAssessment
              ?.length
              ? true
              : false,
            isadmissionAssessment: delteData?.data?.data?.admissionChecklist?.admissionAssessment
              ?.length
              ? true
              : false,
            ishospitalGuidelineForm: delteData?.data?.data?.admissionChecklist.hospitalGuidelineForm
              ?.length
              ? true
              : false,
            isfinacialCounselling: delteData?.data?.data?.admissionChecklist.finacialCounselling
              ?.length
              ? true
              : false
          });
          dispatch(
            setPatientAdmission({
              ...patientData.patientAdmission,
              ...isAdmissionChecklist,
              isInsured: delteData?.data?.data?.admissionChecklist?.isInsured ? true : false,
              insuredDetail:
                delteData?.data?.data?.admissionChecklist?.isInsured == true
                  ? delteData?.data?.data?.admissionChecklist?.insuredDetail
                  : "",
              orientationOfFamily: delteData?.data?.data?.admissionChecklist?.orientationOfFamily
                ?.length
                ? true
                : false,
              orientationOfPatient: delteData?.data?.data?.admissionChecklist?.orientationOfPatient
                ?.length
                ? true
                : false,
              isapplicationForAdmission: delteData?.data?.data?.admissionChecklist
                ?.applicationForAdmission?.length
                ? true
                : false,
              isvoluntaryAdmissionForm: delteData?.data?.data?.admissionChecklist
                ?.voluntaryAdmissionForm?.length
                ? true
                : false,
              isinVoluntaryAdmissionForm: delteData?.data?.data?.admissionChecklist
                ?.inVoluntaryAdmissionForm?.length
                ? true
                : false,
              isminorAdmissionForm: delteData?.data?.data?.admissionChecklist?.minorAdmissionForm
                ?.length
                ? true
                : false,
              isform90: delteData?.data?.data?.admissionChecklist?.form90?.length ? true : false,
              isfamilyDeclaration: delteData?.data?.data?.admissionChecklist?.familyDeclaration
                ?.length
                ? true
                : false,
              issection94: delteData?.data?.data?.admissionChecklist?.section94?.length
                ? true
                : false,
              iscapacityAssessment: delteData?.data?.data?.admissionChecklist?.capacityAssessment
                ?.length
                ? true
                : false,
              isadmissionAssessment: delteData?.data?.data?.admissionChecklist?.admissionAssessment
                ?.length
                ? true
                : false,
              ishospitalGuidelineForm: delteData?.data?.data?.admissionChecklist
                .hospitalGuidelineForm?.length
                ? true
                : false,
              isfinacialCounselling: delteData?.data?.data?.admissionChecklist.finacialCounselling
                ?.length
                ? true
                : false,
              voluntaryAdmissionFormLink:
                delteData?.data?.data?.admissionChecklist?.voluntaryAdmissionForm,
              applicationForAdmissionLink:
                delteData?.data?.data?.admissionChecklist?.applicationForAdmission,
              inVoluntaryAdmissionFormLink:
                delteData?.data?.data?.admissionChecklist?.inVoluntaryAdmissionForm,
              minorAdmissionFormLink: delteData?.data?.data?.admissionChecklist?.minorAdmissionForm,
              form90Link: delteData?.data?.data?.admissionChecklist?.form90,
              familyDeclarationLink: delteData?.data?.data?.admissionChecklist?.familyDeclaration,
              section94Link: delteData?.data?.data?.admissionChecklist?.section94,
              capacityAssessmentLink: delteData?.data?.data?.admissionChecklist?.capacityAssessment,
              familyDeclarationLink: delteData?.data?.data?.admissionChecklist?.familyDeclaration,
              section94Link: delteData?.data?.data?.admissionChecklist?.section94,
              capacityAssessmentLink: delteData?.data?.data?.admissionChecklist?.capacityAssessment,
              admissionAssessmentLink:
                delteData?.data?.data?.admissionChecklist?.admissionAssessment,
              hospitalGuidelineFormLink:
                delteData?.data?.data?.admissionChecklist?.hospitalGuidelineForm,
              finacialCounsellingLink:
                delteData?.data?.data?.admissionChecklist?.finacialCounselling,
              insuredFileLink: delteData?.data?.data?.admissionChecklist?.insuredFile
            })
          );
        }

        setState((prev) => ({ ...prev, loading: false }));
      }

      if (btnType === "SAVE_AND_NEXT") {
        dispatch(setStepper({ step: 2, tab: 3 }));
        toast.success("Admission checklist save successfully");
      } else if (btnType === "SAVE_AND_NEXT_DISCARD") {
        const discardLocation = stepperData.discardModal.discartLocation;
        dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));

        setTimeout(() => {
          if (stepperData.discardModal.type === "step") {
            dispatch(
              setStepper({ step: stepperData.discardModal.step, tab: stepperData.stepper.tab })
            );
          }

          if (stepperData.discardModal.type === "tab") {
            dispatch(
              setStepper({ step: stepperData.stepper.step, tab: stepperData.discardModal.tab })
            );
          }

          if (stepperData.discardModal.type === "navigate") {
            if (discardLocation) {
              dispatch(setStepper({ step: 1, tab: 1 }));
              navigate(discardLocation);
            } else {
              dispatch(setStepper({ step: 1, tab: 1 }));
              navigate(-1);
            }
          }
        }, 500);

        toast.success("Admission checklist save successfully");
      } else {
        toast.success("Admission checklist save successfully");
      }
      setState((prev) => ({ ...prev, loading: false }));
      dispatch(setDiscardModal({ isFormChanged: false }));
    } catch (err) {
      setState((prev) => ({ ...prev, loading: false }));
      handleError(err);
    }
  };

  const handleClickInsuredStatus = (e: SyntheticEvent, status: boolean) => {
    const { name } = e.target as HTMLInputElement;
    if (status) {
      setState((prev) => ({ ...prev, [name]: status }));
    } else {
      setState((prev) => ({ ...prev, [name]: status, insuredDetail: "" }));
      setadmissionChecklistRemove((prev) => ({
        ...prev,
        insuredFile: admissionChecklistLink["insuredFileLink"].map(
          ({ filePath }: { filePath: string }) => filePath
        )
      }));
      setadmissionChecklistLink((prev) => ({
        ...prev,
        insuredFileLink: []
      }));

      setadmissionChecklist((prev) => ({
        ...prev,
        insuredFile: []
      }));
    }
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleDropFiles = useCallback((files: File[], name: string) => {
    if (!stepperData.discardModal.isFormChanged) {
      dispatch(setDiscardModal({ isFormChanged: true }));
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxFiles = 5;

    try {
      // Filter out files that exceed the max size
      const validFiles = files.filter((file) => file.size <= maxSize);

      if (validFiles.length !== files.length) {
        toast.error("Some files exceed the 5 MB limit.");
        return; // Stop execution to avoid setting state
      }

      setadmissionChecklist((prev) => {
        const existingFiles = prev[name as keyof typeof admissionChecklist] || [];
        const existingFilesLink =
          admissionChecklistLink[`${name}Link` as keyof typeof admissionChecklistLink];
        const totalFiles = [...(Array.isArray(existingFiles) ? existingFiles : []), ...validFiles];
        const totalFiless = [
          ...(Array.isArray(existingFiles) ? existingFiles : []),
          ...(Array.isArray(existingFilesLink) ? existingFilesLink : []),
          ...validFiles
        ];

        if (totalFiless.length > maxFiles) {
          toast.error("You can only upload up to 5 files.");
          return prev; // Return previous state to prevent updates
        }

        return {
          ...prev,
          [name]: totalFiles
        };
      });
    } catch (error) {
      handleError(error);
    }
  }, []);

  const handleChange = useCallback(
    (e: SyntheticEvent) => {
      const { name, value } = e.target as HTMLInputElement;
      setState((prev) => ({ ...prev, [name]: value }));
      if (!stepperData.discardModal.isFormChanged)
        dispatch(setDiscardModal({ isFormChanged: true }));
    },
    [dispatch, stepperData.discardModal.isFormChanged]
  );

  const handleDelete = (index: number, type: string, name: string) => {
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
    if (type === "URL") {
      setadmissionChecklistRemove((prev) => ({
        ...prev,
        [name]: [
          ...(prev[name as keyof typeof prev] || []), // Keep existing removed items
          ...(admissionChecklistLink[`${name}Link` as keyof typeof admissionChecklistLink] || [])
            .filter((_, i) => i === index)
            .map(({ filePath }: { filePath: string }) => filePath) // Get only the item being removed
        ]
      }));
      setadmissionChecklistLink((prev) => ({
        ...prev,
        [`${name}Link`]:
          prev[`${name}Link` as keyof typeof prev]?.filter((_, i) => i !== index) || []
      }));
    } else {
      setadmissionChecklist((prev) => ({
        ...prev,
        [name]: prev[name as keyof typeof prev]?.filter((_, i) => i !== index) || []
      }));
    }
  };

  return (
    <div id="admissionChecklist" className="w-full mt-8">
      <h3 className="text-sm font-bold mb-6">Checklist</h3>
      <div>
        <div className="w-full h-full grid lg:grid-cols-2  items-start justify-between">
          <div className="flex flex-col  gap-[15px] items-start">
            {checklist.map((data: { title: string; name: string }) => (
              <CheckBox
                handleDeletes={handleDelete}
                checked={isAdmissionChecklist[`is${data?.name}` as keyof IisAdmissionChecklist]}
                files={admissionChecklist[data?.name as keyof typeof admissionChecklist]}
                filesString={
                  admissionChecklistLink[`${data?.name}Link` as keyof typeof admissionChecklistLink]
                }
                value={data.name}
                name={data.name}
                label={data.title}
                handleCheck={(e) => handleCheckForAdmissionChecklist(e, `is${data.name}`)}
                handleDrop={handleDropFiles}
              />
            ))}
          </div>

          <div className="flex lg:border-l-2 lg:border-t-0 sm:border-t-2 lg:pl-[63px] lg:pb-[63px] lg:mt-0  mt-10 flex-col gap-4">
            {list.map((data: { title: string; name: string }) => (
              <CheckBox
                handleDeletes={handleDelete}
                checked={isAdmissionChecklist[`is${data?.name}` as keyof IisAdmissionChecklist]}
                filesString={
                  admissionChecklistLink[`${data?.name}Link` as keyof typeof admissionChecklistLink]
                }
                files={admissionChecklist[data?.name as keyof typeof admissionChecklist]}
                name={data.name}
                label={data.title}
                handleCheck={(e) => handleCheckForAdmissionChecklist(e, `is${data.name}`)}
                handleDrop={handleDropFiles}
              />
            ))}
            <CheckBox
              checked={
                state.orientationOfFamily && state.orientationOfFamily == true ? true : false
              }
              value={"orientationOfFamily"}
              imageDrop={false}
              name={"orientationOfFamily"}
              label={"Orientation of family done"}
              handleCheck={handleCheckOrientation}
              handleDrop={handleDropFiles}
            />{" "}
            <CheckBox
              checked={
                state.orientationOfPatient && state.orientationOfPatient == true ? true : false
              }
              value={"orientationOfPatient"}
              imageDrop={false}
              name={"orientationOfPatient"}
              label={"Orientation of patient done"}
              handleCheck={handleCheckOrientation}
              handleDrop={handleDropFiles}
            />
            <div className="flex gap-5 mt-7 w-full items-start flex-col">
              <p className="text-xs font-medium">Insured</p>
              <div className="flex">
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="yes"
                      type="radio"
                      onClick={(e) => handleClickInsuredStatus(e, true)}
                      checked={state.isInsured === true}
                      name="isInsured"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="yes"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                        state.isInsured === true ? " border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {state.isInsured === true && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="yes" className="ms-2 text-sm font-medium">
                    Yes
                  </label>
                </div>
                <div className="flex items-center me-4">
                  <div className="relative flex items-center">
                    <Input
                      id="no"
                      type="radio"
                      onClick={(e) => handleClickInsuredStatus(e, false)}
                      checked={state.isInsured === false}
                      name="isInsured"
                      containerClass="hidden!"
                    />
                    <label
                      htmlFor="no"
                      className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                        state.isInsured === false ? " border-[#586B3A]!" : "border-[#586B3A]"
                      }`}
                    >
                      {state.isInsured === false && (
                        <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                      )}
                    </label>
                  </div>

                  <label htmlFor="no" className="ms-2 text-sm font-medium">
                    No
                  </label>
                </div>
              </div>
              {state.isInsured === true && (
                <div className="flex  gap-2 items-center">
                  <Input
                    id="insured"
                    required={true}
                    maxLength={50}
                    placeholder="Enter"
                    name="insuredDetail"
                    className="w-full! rounded-[7px]! font-bold placeholder:font-normal"
                    value={state?.insuredDetail}
                    onChange={handleChange}
                  />
                  <CheckBox
                    checkHide
                    handleDeletes={handleDelete}
                    checked={true}
                    filesString={admissionChecklistLink["insuredFileLink"]}
                    files={admissionChecklist["insuredFile"]}
                    name="insuredFile"
                    handleDrop={handleDropFiles}
                    label={""}
                    handleCheck={function (_e: SyntheticEvent): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full flex gap-x-5 items-center mt-12 justify-center">
          <Button
            type="submit"
            name="save"
            disabled={state.loading}
            className="min-w-[150px]! text-xs! px-[30px]! py-[10px]! rounded-[10px]!"
            variant="outlined"
            size="base"
            onClick={(e) => handleSubmit(e, "SAVE")}
          >
            Save {state.loading && <Loader size="xs" />}
          </Button>
          <Button
            type="submit"
            name="next"
            disabled={state.loading}
            className="min-w-[150px]! text-xs! py-[10px]! rounded-[10px]!"
            variant="contained"
            size="base"
            onClick={(e) => handleSubmit(e, "SAVE_AND_NEXT")}
          >
            Save & Continue {state.loading && <Loader size="xs" />}
          </Button>
        </div>
      </div>
      <DiscardModal
        handleClickSaveAndContinue={(_e: SyntheticEvent) =>
          handleSubmit(_e, "SAVE_AND_NEXT_DISCARD")
        }
      />
    </div>
  );
};

export default AdmissionChecklist;
