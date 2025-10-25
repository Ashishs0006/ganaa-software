import React, { SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowDown } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RootState } from "@/redux/store/store";
import DeleteConfirm from "@/components/DeleteConfirm/DeleteConfirm";
import {
  Input,
  Select,
  BreadCrumb,
  InputBox,
  DropDown,
  ScrollToTop,
  Button,
  Loader,
  RichTextEditor,
  DiscardModal,
  CheckBox
} from "@/components";

import {
  createCaseHistory,
  getCaseHistory,
  getPreviousCaseHistories,
  getSinglePatient,
  updateCaseHistory,
  deleteCaseHistory,
  updatePatient,
  getPatientFamily,
  getSinglePatientAdmissionHistory
} from "@/apis";
import {
  ICaseHistoryData,
  ICaseHistoryState,
  IFamilyData
} from "@/pages/Admin/PatientData/CaseHistory/types";
import { capitalizeFirstLetter, formatDate, formatId } from "@/utils/formater";
import { ISelectOption } from "@/components/Select/types";
import handleError from "@/utils/handleError";
import { setDiscardModal } from "@/redux/slice/stepperSlice";
import { RBACGuard } from "@/components/RBACGuard/RBACGuard";
import { RESOURCES } from "@/constants/resources";
import DownloadCaseHistory from "./DownloadCaseHistory/DownloadCaseHistory";
import { BsFiletypePdf } from "react-icons/bs";

const CaseHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id, aId } = useParams();

  const dropdownData = useSelector((store: RootState) => store.dropdown);
  const stepperData = useSelector((store: RootState) => store.stepper);

  const [patientUpdate, setpatientUpdate] = useState<{
    personalIncome: string;
    personalIncomeOld: string;
  }>({
    personalIncome: "",
    personalIncomeOld: ""
  });

  const [data, setData] = useState<ICaseHistoryData>({
    _id: "",
    isAdvanceDirectiveSelected: "",
    file: null,
    fileName: "",
    advanceDirective: "",
    fatherName: "",
    motherName: "",
    informantsDetails: [
      {
        name: "",
        relationshipWithPatient: { label: "Select", value: "" },
        reliabilityAndAdequacy: "",
        knownToPatient: ""
      }
    ],
    substanceUseHistory: [
      {
        ageAtFirstUse: "",
        substanceUsed: "",
        duration: "",
        abstinencePeriodAndReason: "",
        relapsesAndReason: "",
        averageDose: "",
        maximumDose: "",
        lastIntake: ""
      }
    ],
    chiefComplaints: "",
    onset: { label: "Select", value: "" },
    onsetOther: "",
    course: { label: "Select", value: "" },
    courseOther: "",
    progress: { label: "Select", value: "" },
    totalDurationOfIllness: "",
    durationThisEpisode: "",
    perpetuating: "",
    predisposing: "",
    precipitatingFactors: "",
    impactOfPresentIllness: { label: "Select", value: "" },
    historyOfPresentIllness: "",
    negativeHistory: "",
    pastPsychiatricHistory: "",
    pastPsychiatricTreatmentHistory: "",
    pastMedicalHistory: "",
    historyofPsychiatricIllness: "",
    prenatal: "",
    natal: "",
    postnatal: "",
    developmentalMilestone: "",
    immunizationStatus: "",
    // achievements: "",
    complaintsAtSchool: "",
    occupationalHistory: "",
    sexualHistory: "",
    ageAtMenarche: "",
    regularity: "",
    noOfDaysOfMenses: "",
    lastMenstrualPeriod: "",
    maritalHistoryStatus: "",
    spouseDetails: "",
    religiousHistory: "",
    // TODO: Later Remove Substance use History Field because used them in array
    ageAtFirstUse: "",
    substanceUsed: "",
    duration: "",
    abstinencePeriodAndReason: "",
    relapsesAndReason: "",
    averageDose: "",
    maximumDose: "",
    lastIntake: "",
    // Substance use History End
    socialRelationsWitFamilyOrFriendsOrColleagues: "",
    hobbiesOrInterests: "",
    personalityTraits: "",
    mood: "",
    characterOrAttitudeToWorkOrResponsibility: "",
    habits: "",
    kemptAndTidy: "",
    withdrawn: "",
    lookingAtOneAge: "",
    overfriendly: "",
    dressAppropriate: "",
    suspicious: "",
    eyeContact: "",
    posture: "",
    cooperative: "",
    grimaces: "",
    helpSeeking: "",
    guarded: "",
    ingratiated: "",
    hostile: "",
    submissive: "",
    psychomotorActivity: "",
    rate: "",
    goalDirected: "",
    volume: "",
    spontaneous: "",
    pitchOrTone: "",
    coherent: "",
    reactionTime: "",
    relevant: "",
    objective: "",
    subjective: "",
    affect: "",
    range: "",
    reactivity: "",
    stream: "",
    form: "",
    content: "",
    possession: "",
    hallucination: "",
    hallucinationSample: "",
    illusion: "",
    illusionSample: "",
    time: "",
    place: "",
    person: "",
    digitSpanTest: "",
    serialSubtractionTest: "",
    immediate: "",
    recent: "",
    remote: "",
    generalFundOfKnowledge: "",
    arithmetic: "",
    comprehesion: "",
    similaritiesOrDissimilarities: "",
    proverbs: "",
    personal: "",
    social: "",
    test: "",
    insightGrade: { label: "Select", value: "" },
    insight: "",
    diagnosticFormulation: "",
    provisionalDiagnosis: "",
    differentialDiagnosis: "",
    targetSymptoms: "",
    pharmacologicalPlan: "",
    nonPharmacologicalPlan: "",
    reviewsRequired: "",
    psychologicalAssessments: "",
    investigations: ""
  });

  const handleDropFiles = useCallback((files: File[]) => {
    const maxSize = 5 * 1024 * 1024;
    try {
      if (files[0].size > maxSize) {
        throw new Error("File size exceeds 5 MB limit.");
      }
    } catch (error) {
      handleError(error);
    }
    if (files[0].size < maxSize) {
      setData((prev) => ({ ...prev, file: files[0] }));
    }
  }, []);

  const handleDeleteFile = () => {
    setData((prev) => ({ ...prev, file: null, fileName: "" }));
  };

  const [historyData, sethistoryData] = useState<ICaseHistoryData>({
    _id: "",
    file: null,
    fileName: "",
    isAdvanceDirectiveSelected: "",
    fatherName: "",
    motherName: "",
    advanceDirective: "",
    informantsDetails: [
      {
        name: "",
        relationshipWithPatient: { label: "Select", value: "" },
        reliabilityAndAdequacy: "",
        knownToPatient: ""
      }
    ],
    substanceUseHistory: [
      {
        ageAtFirstUse: "",
        substanceUsed: "",
        duration: "",
        abstinencePeriodAndReason: "",
        relapsesAndReason: "",
        averageDose: "",
        maximumDose: "",
        lastIntake: ""
      }
    ],
    chiefComplaints: "",
    onset: { label: "Select", value: "" },
    onsetOther: "",
    course: { label: "Select", value: "" },
    courseOther: "",
    progress: { label: "Select", value: "" },
    totalDurationOfIllness: "",
    durationThisEpisode: "",
    predisposing: "",
    perpetuating: "",
    precipitatingFactors: "",
    impactOfPresentIllness: { label: "Select", value: "" },
    historyOfPresentIllness: "",
    negativeHistory: "",
    pastPsychiatricHistory: "",
    pastPsychiatricTreatmentHistory: "",
    pastMedicalHistory: "",
    historyofPsychiatricIllness: "",
    prenatal: "",
    natal: "",
    postnatal: "",
    developmentalMilestone: "",
    immunizationStatus: "",
    // achievements: "",
    complaintsAtSchool: "",
    occupationalHistory: "",
    sexualHistory: "",
    ageAtMenarche: "",
    regularity: "",
    noOfDaysOfMenses: "",
    lastMenstrualPeriod: "",
    maritalHistoryStatus: "",
    spouseDetails: "",
    religiousHistory: "",
    // TODO: Later Remove Substance use History Field because used them in array
    ageAtFirstUse: "",
    substanceUsed: "",
    duration: "",
    abstinencePeriodAndReason: "",
    relapsesAndReason: "",
    averageDose: "",
    maximumDose: "",
    lastIntake: "",
    // Substance use History End
    socialRelationsWitFamilyOrFriendsOrColleagues: "",
    hobbiesOrInterests: "",
    personalityTraits: "",
    mood: "",
    characterOrAttitudeToWorkOrResponsibility: "",
    habits: "",
    kemptAndTidy: "",
    withdrawn: "",
    lookingAtOneAge: "",
    overfriendly: "",
    dressAppropriate: "",
    suspicious: "",
    eyeContact: "",
    posture: "",
    cooperative: "",
    grimaces: "",
    helpSeeking: "",
    guarded: "",
    ingratiated: "",
    hostile: "",
    submissive: "",
    psychomotorActivity: "",
    rate: "",
    goalDirected: "",
    volume: "",
    spontaneous: "",
    pitchOrTone: "",
    coherent: "",
    reactionTime: "",
    relevant: "",
    objective: "",
    subjective: "",
    affect: "",
    range: "",
    reactivity: "",
    stream: "",
    form: "",
    content: "",
    possession: "",
    hallucination: "",
    hallucinationSample: "",
    illusion: "",
    illusionSample: "",
    time: "",
    place: "",
    person: "",
    digitSpanTest: "",
    serialSubtractionTest: "",
    immediate: "",
    recent: "",
    remote: "",
    generalFundOfKnowledge: "",
    arithmetic: "",
    comprehesion: "",
    similaritiesOrDissimilarities: "",
    proverbs: "",
    personal: "",
    social: "",
    test: "",
    insightGrade: { label: "Select", value: "" },
    insight: "",
    diagnosticFormulation: "",
    provisionalDiagnosis: "",
    differentialDiagnosis: "",
    targetSymptoms: "",
    pharmacologicalPlan: "",
    nonPharmacologicalPlan: "",
    reviewsRequired: "",
    psychologicalAssessments: "",
    investigations: ""
  });

  const [dropDownState, setDropDownState] = useState({
    caseHistoryId: "",
    caseHistoryRevisionId: "",
    isDeleteModalOpen: false
  });

  const [deleteModal, setDeleteModal] = useState<{ isModal: boolean; id?: number }>({
    isModal: false
  });

  const [deleteModalSubstance, setDeleteModalSubstance] = useState<{
    isModal: boolean;
    id?: number;
  }>({
    isModal: false
  });

  const toggleModalDelete = (id?: number) => {
    if (state.currentStatus === "Discharged") return;

    setDeleteModal((prev) => ({
      isModal: !prev.isModal,
      id: id
    }));
  };

  const toggleModalDeleteSubstance = (id?: number) => {
    if (state.currentStatus === "Discharged") return;

    setDeleteModalSubstance((prev) => ({
      isModal: !prev.isModal,
      id: id
    }));
  };

  const toggleModal = () => {
    setDropDownState(() => ({
      ...dropDownState,
      isDeleteModalOpen: !dropDownState.isDeleteModalOpen
    }));
  };

  const [state, setState] = useState<ICaseHistoryState>({
    loading: false,
    firstName: "",
    lastName: "",
    identificationMark: "",
    referralDetails: "",
    referredTypeId: "",
    currentStatus: "",
    admissionId: "",
    UHID: "",
    admissionDate: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    email: "",
    patientPicUrl: "",
    mobileNo: "",
    alternateMobileNo: "",
    guardianName: "",
    country: "",
    address: "",
    illnessType: "",
    patientCondition: "",
    conditionDetails: "",
    coverageStatus: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    emergencyContactRelation: "",
    emergencyContactAddress: "",
    reference: "",
    referredBy: "",
    referredByName: "",
    referredByAge: "",
    involuntary: "",
    patientChecklist: [],
    patiendIdProofNumber: "",
    patientIdProofType: "",
    nominatedRelationWithPatient: "",
    nominatedFullName: "",
    nominatedAge: "",
    nominatedGender: "",
    involuntaryAdmissionType: "",
    nominatedIdProofType: "",
    nominatedIdProofNumber: "",
    payerRelationWithPatient: "",
    payerFullName: "",
    payerAge: "",
    payerGender: "",
    payerIdProofType: "",
    payerIdProofNumber: "",
    advanceExplained: [],
    education: "",
    placeOfStay: "",
    familyIncome: "",
    religion: "",
    language: "",
    ismarried: null,
    numberOfChildren: "",
    occupation: "",
    center: "",
    roomType: "",
    room: "",
    bedNo: "",
    lockerNo: "",
    assignedDoctor: "",
    assignedTherapist: "",
    belongingsInLocker: "",
    testReport: "",
    testReportName: ""
  });

  const [familyDetails, setFamilyDetails] = useState<IFamilyData[]>([]);

  const [previousHistoryLoader, setPreviousHistoryLoader] = useState<boolean>(false);

  const relationshipDropdown = useMemo<ISelectOption[]>(() => {
    const relationShipList = dropdownData?.relationships?.data ?? [];
    return [
      { label: "Select", value: "" },
      ...relationShipList.map(({ fullName, shortName, _id }) => ({
        label: `${fullName} (${shortName})`,
        value: _id
      }))
    ];
  }, [dropdownData?.relationships?.data]);

  const insightDropdown = useMemo<ISelectOption[]>(() => {
    const insight = dropdownData?.insight?.data ?? [];
    return [
      { label: "Select", value: "" },
      ...Object.entries(insight).map(([key, _value]) => ({
        label: key, // The description as the label
        value: key // The key as the value
      }))
    ];
  }, [dropdownData?.insight?.data]);

  const fetchPatientAndCaseHistory = async (id: string, aId: string) => {
    try {
      const { data } = await getSinglePatient(id);
      if (!data) {
        throw new Error("patient data not found");
      }
      const { data: patientAdmissionHistory } = await getSinglePatientAdmissionHistory(id, aId);
      if (!patientAdmissionHistory) {
        throw new Error("patient data not found");
      }

      const familyDetailsResponse = await getPatientFamily(id);

      setFamilyDetails(familyDetailsResponse?.data?.data);
      if (patientAdmissionHistory?.data?.caseHistoryId) {
        setData((prev) => ({ ...prev, _id: patientAdmissionHistory?.data?.caseHistoryId }));
      }

      if (!patientAdmissionHistory?.data?.caseHistoryId) {
        if (familyDetailsResponse?.data?.data && familyDetailsResponse?.data?.data?.length > 0) {
          const fatherName = familyDetailsResponse?.data?.data?.find(
            (item: { relationshipId: { fullName: string } }) =>
              item?.relationshipId?.fullName === "Father of"
          )?.name;
          const motherName = familyDetailsResponse?.data?.data?.find(
            (item: { relationshipId: { fullName: string } }) =>
              item?.relationshipId?.fullName === "Mother of"
          )?.name;
          setData((prev) => ({
            ...prev,
            motherName: motherName || "",
            fatherName: fatherName || ""
          }));
        }
      }

      setState((prevState) => ({
        ...prevState,
        firstName: `${data?.data?.firstName || ""}`.trim(),
        lastName: `${data?.data?.lastName || ""}`.trim(),
        currentStatus: patientAdmissionHistory?.data.currentStatus,
        UHID: data?.data?.uhid || "",
        gender: data?.data?.gender || "",
        referralDetails: data?.data?.referralDetails || "--",
        referredTypeId: data?.data?.referredTypeId?.name || "--",

        admissionId: patientAdmissionHistory?.data?._id || "",
        admissionDate: patientAdmissionHistory?.data?.dateOfAdmission || "",
        dateOfBirth: data?.data?.dob || "",
        age: data?.data?.age || "",
        email: data?.data?.email || "",
        mobileNo: `${data?.data?.phoneNumberCountryCode || ""} ${
          data?.data?.phoneNumber || ""
        }`.trim(),
        patientPicUrl: data?.data?.patientPicUrl || "",
        alternateMobileNo: `${data?.data?.alternativephoneNumberCountryCode || ""} ${
          data?.data?.alternativeMobileNumber || ""
        }`.trim(),
        guardianName: data?.data?.guardianName || "",
        country: data?.data?.country || "",
        identificationMark: data?.data?.identificationMark || "",

        address: data?.data?.fullAddress || "",
        illnessType: patientAdmissionHistory?.data?.illnessType || "",
        patientCondition: patientAdmissionHistory?.data?.patientCondition || "",
        conditionDetails: patientAdmissionHistory?.data?.conditionDetails || "",
        coverageStatus: patientAdmissionHistory?.data?.coverageStatus || "",
        emergencyContactName: data?.data?.emergencyContactName || "",
        emergencyContactNumber: `${data?.data?.emergencyContactPhoneNumberCountryCode || ""} ${
          data?.data?.emergencyContactPhoneNumber || ""
        }`.trim(),
        emergencyContactRelation: data?.data?.emergencyContactRelationshipId?.fullName || "",
        emergencyContactAddress: data?.data?.emergencyContactAddress || "",
        reference: data?.data?.referredById?.name || "",
        referredBy: data?.data?.referencePlatformId?.name || "",
        referredByName: data?.data?.referredByName || "",
        referredByAge: "",
        involuntary: patientAdmissionHistory?.data?.admissionType,
        involuntaryAdmissionType: patientAdmissionHistory?.data?.involuntaryAdmissionType,
        // Admission Checklist
        patientChecklist:
          patientAdmissionHistory?.data?.patientChecklist?.length !== 0
            ? patientAdmissionHistory?.data?.patientChecklist
            : [],
        patiendIdProofNumber: patientAdmissionHistory?.data?.patientIdProofNumber || "",
        patientIdProofType: patientAdmissionHistory?.data?.patientIdProof || "",
        nominatedRelationWithPatient:
          patientAdmissionHistory?.data?.nominatedRelationWithPatientId?.fullName || "",
        nominatedFullName: patientAdmissionHistory?.data?.nominatedFullName || "",
        nominatedAge: patientAdmissionHistory?.data?.nominatedAge || "",
        nominatedGender: patientAdmissionHistory?.data?.nominatedGender || "",
        nominatedIdProofType: patientAdmissionHistory?.data?.nominatedIdProof || "",
        nominatedIdProofNumber: patientAdmissionHistory?.data?.nominatedIdProofNumber || "",

        // Payer
        payerRelationWithPatient:
          patientAdmissionHistory?.data?.payerRelationWithPatientId?.fullName || "",
        payerFullName: patientAdmissionHistory?.data?.payerFullName || "",
        payerAge: patientAdmissionHistory?.data?.payerAge || "",
        payerGender: patientAdmissionHistory?.data?.payerGender || "",
        payerIdProofType: patientAdmissionHistory?.data?.payerIdProof || "",
        payerIdProofNumber: patientAdmissionHistory?.data?.payerIdProofNumber || "",
        advanceExplained: patientAdmissionHistory?.data?.advanceExplained || "",

        // demographic
        education: data?.data?.education || "",
        placeOfStay: data?.data?.placeOfStay || "",
        familyIncome: data?.data?.familyIncome || "",
        religion: data?.data?.religion || "",
        language: data?.data?.language || "",
        ismarried: data?.data?.isMarried ?? null,
        numberOfChildren: data?.data?.numberOfChildren || "",
        occupation: data?.data?.occupation || "",
        // Assigned Resources
        center: patientAdmissionHistory?.data?.resourceAllocation?.centerId?.centerName || "",
        roomType: patientAdmissionHistory?.data?.resourceAllocation?.roomTypeId?.name || "",
        room: patientAdmissionHistory?.data?.resourceAllocation?.roomNumberId?.name || "",
        lockerNo: patientAdmissionHistory?.data?.resourceAllocation?.lockerNumberId?.name || "",
        assignedDoctor: `${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.firstName || ""
        } ${patientAdmissionHistory?.data?.resourceAllocation?.assignedDoctorId?.lastName || ""}`,
        assignedTherapist: `${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.firstName || ""
        } ${
          patientAdmissionHistory?.data?.resourceAllocation?.assignedTherapistId?.lastName || ""
        }`,
        belongingsInLocker:
          patientAdmissionHistory?.data?.resourceAllocation?.belongingsInLocker || "",

        // Test Report
        testReport: patientAdmissionHistory?.data?.patientReport?.url || "",
        testReportName: patientAdmissionHistory?.data?.patientReport?.fileName || ""
      }));

      setpatientUpdate((prevState) => ({
        ...prevState,
        personalIncome: data?.data?.personalIncome,
        personalIncomeOld: data?.data?.personalIncome
      }));

      if (!patientAdmissionHistory?.data?.caseHistoryId) {
        return;
      }
      const response = await getCaseHistory(id, patientAdmissionHistory?.data?._id);
      if (response?.data?.status === "success") {
        const resData = response?.data?.data;

        const transformedData = {
          _id: resData?._id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          informantsDetails: resData?.informantsDetails.length
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              resData?.informantsDetails.map((detail: any) => ({
                name: detail?.name,
                relationshipWithPatient: {
                  label: detail?.relationshipWithPatient?.fullName || "Select",
                  value: detail?.relationshipWithPatient?._id || ""
                },
                reliabilityAndAdequacy: detail?.reliabilityAndAdequacy,
                knownToPatient: detail?.knownToPatient
              }))
            : [
                {
                  name: "",
                  relationshipWithPatient: { label: "Select", value: "" },
                  reliabilityAndAdequacy: "",
                  knownToPatient: ""
                }
              ],
          chiefComplaints: resData?.chiefComplaints || "",
          motherName: resData?.motherName?.trim() || "",
          fatherName: resData?.fatherName?.trim() || "",
          onset: {
            label: resData?.historyOfPresentIllness?.onset || "Select",
            value: resData?.historyOfPresentIllness?.onset || ""
          },
          onsetOther: resData?.historyOfPresentIllness?.onsetOther?.trim() || "",
          course: {
            label: resData?.historyOfPresentIllness?.course || "Select",
            value: resData?.historyOfPresentIllness?.course || ""
          },
          courseOther: resData?.historyOfPresentIllness?.courseOther?.trim() || "",
          progress: {
            label: resData?.historyOfPresentIllness?.progress || "Select",
            value: resData?.historyOfPresentIllness?.progress || ""
          },
          totalDurationOfIllness: resData?.historyOfPresentIllness?.totalDurationOfIllness,
          durationThisEpisode: resData?.historyOfPresentIllness?.durationThisEpisode,
          predisposing: resData?.historyOfPresentIllness?.predisposing,
          perpetuating: resData?.historyOfPresentIllness?.perpetuating,
          precipitatingFactors: resData?.historyOfPresentIllness?.precipitatingFactors,
          impactOfPresentIllness: {
            label: resData?.historyOfPresentIllness?.impactOfPresentIllness || "Select",
            value: resData?.historyOfPresentIllness?.impactOfPresentIllness || ""
          },
          historyOfPresentIllness: resData?.historyOfPresentIllness?.historyOfPresentIllness || "",
          negativeHistory: resData?.historyOfPresentIllness?.negativeHistory || "",
          pastPsychiatricHistory: resData?.historyOfPresentIllness?.pastPsychiatricHistory || "",
          pastPsychiatricTreatmentHistory:
            resData?.historyOfPresentIllness?.pastPsychiatricTreatmentHistory || "",
          pastMedicalHistory: resData?.historyOfPresentIllness?.pastMedicalHistory || "",
          historyofPsychiatricIllness: resData?.familyHistory?.historyofPsychiatricIllness || "",
          prenatal: resData?.personalHistory?.birthAndChildhoodHistory?.prenatal || "",
          natal: resData?.personalHistory?.birthAndChildhoodHistory?.natal || "",
          postnatal: resData?.personalHistory?.birthAndChildhoodHistory?.postnatal || "",
          developmentalMilestone:
            resData?.personalHistory?.birthAndChildhoodHistory?.developmentalMilestone || "",
          immunizationStatus:
            resData?.personalHistory?.birthAndChildhoodHistory?.immunizationStatus || "",
          // // achievements: resData?.personalHistory?.educationalHistory?.achievements || "",
          complaintsAtSchool:
            resData?.personalHistory?.educationalHistory?.complaintsAtSchool || "",
          occupationalHistory: resData?.personalHistory?.occupationalHistory || "",
          sexualHistory: resData?.personalHistory?.sexualHistory || "",
          ageAtMenarche: resData?.personalHistory?.menstrualHistory?.ageAtMenarche || "",
          regularity: resData?.personalHistory?.menstrualHistory?.regularity || "",
          noOfDaysOfMenses: resData?.personalHistory?.menstrualHistory?.noOfDaysOfMenses || "",
          lastMenstrualPeriod:
            resData?.personalHistory?.menstrualHistory?.lastMenstrualPeriod || "",
          maritalHistoryStatus: resData?.personalHistory?.maritalHistory?.status,
          spouseDetails: resData?.personalHistory?.maritalHistory?.spouseDetails,
          religiousHistory: resData?.personalHistory?.religiousHistory || "",

          substanceUseHistory: resData?.personalHistory?.substanceUseHistory.length
            ? resData?.personalHistory?.substanceUseHistory
            : [
                {
                  ageAtFirstUse: "",
                  substanceUsed: "",
                  duration: "",
                  abstinencePeriodAndReason: "",
                  relapsesAndReason: "",
                  averageDose: "",
                  maximumDose: "",
                  lastIntake: ""
                }
              ],
          ageAtFirstUse: resData?.personalHistory?.substanceUseHistory?.ageAtFirstUse || "",
          substanceUsed: resData?.personalHistory?.substanceUseHistory?.substanceUsed || "",
          duration: resData?.personalHistory?.substanceUseHistory?.duration || "",
          abstinencePeriodAndReason:
            resData?.personalHistory?.substanceUseHistory?.abstinencePeriodAndReason || "",
          relapsesAndReason: resData?.personalHistory?.substanceUseHistory?.relapsesAndReason || "",
          averageDose: resData?.personalHistory?.substanceUseHistory?.averageDose || "",
          maximumDose: resData?.personalHistory?.substanceUseHistory?.maximumDose || "",
          lastIntake: resData?.personalHistory?.substanceUseHistory?.lastIntake || "",
          socialRelationsWitFamilyOrFriendsOrColleagues:
            resData?.premorbidPersonality?.socialRelationsWitFamilyOrFriendsOrColleagues || "",
          hobbiesOrInterests: resData?.premorbidPersonality?.hobbiesOrInterests || "",
          personalityTraits: resData?.premorbidPersonality?.personalityTraits || "",
          mood: resData?.premorbidPersonality?.mood || "",
          characterOrAttitudeToWorkOrResponsibility:
            resData?.premorbidPersonality?.characterOrAttitudeToWorkOrResponsibility || "",
          habits: resData?.premorbidPersonality?.habits || "",
          kemptAndTidy:
            resData?.mentalStatusExamination?.generalAppearanceBehavior?.kemptAndTidy || "",
          withdrawn: resData?.mentalStatusExamination?.generalAppearanceBehavior?.withdrawn || "",
          lookingAtOneAge:
            resData?.mentalStatusExamination?.generalAppearanceBehavior?.lookingAtOneAge || "",
          overfriendly:
            resData?.mentalStatusExamination?.generalAppearanceBehavior?.overfriendly || "",
          dressAppropriate:
            resData?.mentalStatusExamination?.generalAppearanceBehavior?.dressAppropriate || "",
          suspicious: resData?.mentalStatusExamination?.generalAppearanceBehavior?.suspicious || "",
          eyeContact: resData?.mentalStatusExamination?.generalAppearanceBehavior?.eyeContact || "",
          posture: resData?.mentalStatusExamination?.generalAppearanceBehavior?.posture || "",
          cooperative:
            resData?.mentalStatusExamination?.generalAppearanceBehavior?.cooperative || "",
          grimaces: resData?.mentalStatusExamination?.generalAppearanceBehavior?.grimaces || "",
          helpSeeking:
            resData?.mentalStatusExamination?.generalAppearanceBehavior?.helpSeeking || "",
          guarded: resData?.mentalStatusExamination?.generalAppearanceBehavior?.guarded || "",
          ingratiated:
            resData?.mentalStatusExamination?.generalAppearanceBehavior?.ingratiated || "",
          hostile: resData?.mentalStatusExamination?.generalAppearanceBehavior?.hostile || "",
          submissive: resData?.mentalStatusExamination?.generalAppearanceBehavior?.submissive || "",
          psychomotorActivity:
            resData?.mentalStatusExamination?.generalAppearanceBehavior?.psychomotorActivity || "",
          rate: resData?.mentalStatusExamination?.speech?.rate || "",
          goalDirected: resData?.mentalStatusExamination?.speech?.goalDirected || "",
          volume: resData?.mentalStatusExamination?.speech?.volume || "",
          spontaneous: resData?.mentalStatusExamination?.speech?.spontaneous || "",
          pitchOrTone: resData?.mentalStatusExamination?.speech?.pitchOrTone || "",
          coherent: resData?.mentalStatusExamination?.speech?.coherent || "",
          reactionTime: resData?.mentalStatusExamination?.speech?.reactionTime || "",
          relevant: resData?.mentalStatusExamination?.speech?.relevant || "",
          objective: resData?.mentalStatusExamination?.affect?.objective || "",
          subjective: resData?.mentalStatusExamination?.affect?.subjective || "",
          affect: resData?.mentalStatusExamination?.affect?.affect || "",
          range: resData?.mentalStatusExamination?.affect?.range || "",
          reactivity: resData?.mentalStatusExamination?.affect?.reactivity || "",
          stream: resData?.mentalStatusExamination?.thought?.stream || "",
          form: resData?.mentalStatusExamination?.thought?.form || "",
          content: resData?.mentalStatusExamination?.thought?.content || "",
          possession: resData?.mentalStatusExamination?.thought?.possession || "",
          hallucination: resData?.mentalStatusExamination?.perception?.hallucination || "",
          hallucinationSample:
            resData?.mentalStatusExamination?.perception?.hallucinationSample || "",
          illusion: resData?.mentalStatusExamination?.perception?.illusion || "",
          illusionSample: resData?.mentalStatusExamination?.perception?.illusionSample || "",
          time: resData?.mentalStatusExamination?.higherCognitiveFunctions?.orientation.time || "",
          place:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.orientation?.place || "",
          person:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.orientation?.person || "",
          digitSpanTest:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.attentionConcentration
              ?.digitSpanTest || "",
          serialSubtractionTest:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.attentionConcentration
              ?.serialSubtractionTest || "",
          immediate:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.immediate || "",
          recent: resData?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.recent || "",
          remote: resData?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.remote || "",
          generalFundOfKnowledge:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
              ?.generalFundOfKnowledge || "",
          arithmetic:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
              ?.arithmetic || "",
          comprehesion:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
              ?.comprehesion || "",
          similaritiesOrDissimilarities:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.abstractThinking
              ?.similaritiesOrDissimilarities || "",
          proverbs:
            resData?.mentalStatusExamination?.higherCognitiveFunctions?.abstractThinking
              ?.proverbs || "",
          personal:
            resData?.mentalStatusExamination?.higherCognitiveFunctions.judgement?.personal || "",
          social:
            resData?.mentalStatusExamination?.higherCognitiveFunctions.judgement?.social || "",
          test: resData?.mentalStatusExamination?.higherCognitiveFunctions?.judgement?.test || "",

          insightGrade: {
            label: resData?.insight?.insightGrade || "Select",
            value: resData?.insight?.insightGrade || ""
          },
          insight: resData?.insight?.insight || "",
          diagnosticFormulation: resData?.diagnosticFormulation?.description || "",
          provisionalDiagnosis: resData?.diagnosticFormulation?.provisionalDiagnosis || "",
          differentialDiagnosis: resData?.diagnosticFormulation?.differentialDiagnosis || "",
          targetSymptoms: resData?.diagnosticFormulation?.targetSymptoms || "",
          pharmacologicalPlan: resData?.diagnosticFormulation?.pharmacologicalPlan || "",
          nonPharmacologicalPlan: resData?.diagnosticFormulation?.nonPharmacologicalPlan || "",
          reviewsRequired: resData?.diagnosticFormulation?.reviewsRequired || "",
          psychologicalAssessments: resData?.diagnosticFormulation?.psychologicalAssessments || "",
          investigations: resData?.diagnosticFormulation?.investigations || "",

          isAdvanceDirectiveSelected: resData?.isAdvanceDirectiveSelected ?? "",
          advanceDirective: resData?.advanceDirective,
          file: resData?.genogram?.filePath || "",
          fileName: resData?.genogram?.fileName || ""
        };
        setData(transformedData);
        fetchPreviousCaseHistories(id, patientAdmissionHistory?.data?._id, resData?._id);
      }
    } catch (error) {
      console.log(error);
      throw new Error("patient not found or data fetching failed");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [previousHistoryArray, setPreviousHistoryArray] = useState<any>([]);

  const fetchPreviousCaseHistories = async (id: string, pid: string, caseHistoryId: string) => {
    const previousHistoryResponse = await getPreviousCaseHistories(id, pid, caseHistoryId, {
      sort: "-createdAt"
    });
    if (previousHistoryResponse) {
      setPreviousHistoryArray(previousHistoryResponse.data.data);
    }
  };

  useEffect(() => {
    if (id && aId) {
      fetchPatientAndCaseHistory(id, aId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event: React.SyntheticEvent) => {
    if (state.currentStatus === "Discharged") return;
    const { name, value } = event.target as HTMLInputElement;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handlePatientUpdate = (event: React.SyntheticEvent) => {
    if (state.currentStatus === "Discharged") return;

    const { name, value } = event.target as HTMLInputElement;
    setpatientUpdate((prev) => ({
      ...prev,
      [name]: value
    }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleSelect = (name: string, value: ISelectOption) => {
    if (state.currentStatus === "Discharged") return;

    if (name == "insightGrade") {
      setData((prev) => ({
        ...prev,
        [name]: value,
        insight: value.value ? dropdownData?.insight.data[value.value] : ""
      }));
    } else {
      setData((prev) => ({ ...prev, [name]: value }));
    }
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleChangeQuill = (name: string, value: string) => {
    if (state.currentStatus === "Discharged") return;

    setData((prev) => ({ ...prev, [name]: value }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleAddInformants = () => {
    if (state.currentStatus === "Discharged") return;

    if (data?.informantsDetails && data?.informantsDetails?.length >= 10) {
      toast.error("You can only add up to 10.");
      return;
    }
    setData((prev) => ({
      ...prev,
      informantsDetails: [
        ...(prev.informantsDetails ?? []),
        {
          name: "",
          relationshipWithPatient: { label: "", value: "" },
          reliabilityAndAdequacy: "",
          knownToPatient: ""
        }
      ]
    }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleAddSubstanceUseHistory = () => {
    if (state.currentStatus === "Discharged") return;

    if (data?.substanceUseHistory && data?.substanceUseHistory?.length >= 10) {
      toast.error("You can only add up to 10.");
      return;
    }
    setData((prev) => ({
      ...prev,
      substanceUseHistory: [
        ...(prev.substanceUseHistory ?? []),
        {
          ageAtFirstUse: "",
          substanceUsed: "",
          duration: "",
          abstinencePeriodAndReason: "",
          relapsesAndReason: "",
          averageDose: "",
          maximumDose: "",
          lastIntake: ""
        }
      ]
    }));
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleRemove = () => {
    if (state.currentStatus === "Discharged") return;

    if (deleteModal?.id === undefined) return;
    setData((prevData) => ({
      ...prevData,
      informantsDetails: prevData.informantsDetails?.filter((_, i) => i !== deleteModal.id) ?? []
    }));
    setDeleteModal({ isModal: false });

    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleRemoveSubstanceUseHistory = () => {
    if (state.currentStatus === "Discharged") return;

    setData((prevData) => ({
      ...prevData,
      substanceUseHistory:
        prevData.substanceUseHistory?.filter((_, i) => i !== deleteModalSubstance?.id) ?? []
    }));
    setDeleteModalSubstance({ isModal: false });
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleSelectUpdateInformants = (index: number, name: string, value: ISelectOption) => {
    if (state.currentStatus === "Discharged") return;

    setData((prev) => {
      const updatedInformantDetails = [...(prev.informantsDetails || [])];
      updatedInformantDetails[index] = { ...updatedInformantDetails[index], [name]: value };
      return {
        ...prev,
        informantsDetails: updatedInformantDetails
      };
    });
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleUpdateInformants = (index: number, event: React.SyntheticEvent) => {
    if (state.currentStatus === "Discharged") return;

    const { name, value } = event.target as HTMLInputElement;
    setData((prev) => {
      const updatedInformantDetails = [...(prev.informantsDetails ?? [])];
      updatedInformantDetails[index] = { ...updatedInformantDetails[index], [name]: value };
      return {
        ...prev,
        informantsDetails: updatedInformantDetails
      };
    });

    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleUpdateSubstanceUseHistory = (index: number, event: React.SyntheticEvent) => {
    if (state.currentStatus === "Discharged") return;

    const { name, value } = event.target as HTMLInputElement;
    setData((prev) => {
      const updatedSubstanceUseHistory = [...(prev.substanceUseHistory ?? [])];
      updatedSubstanceUseHistory[index] = { ...updatedSubstanceUseHistory[index], [name]: value };
      return {
        ...prev,
        substanceUseHistory: updatedSubstanceUseHistory
      };
    });
    if (!stepperData.discardModal.isFormChanged) dispatch(setDiscardModal({ isFormChanged: true }));
  };

  const handleSave = async (e: SyntheticEvent, type?: string) => {
    dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));
    if (state.currentStatus === "Discharged") return;
    e.preventDefault();

    setState((prevState) => ({ ...prevState, loading: true }));
    const body = {
      isAdvanceDirectiveSelected: data.isAdvanceDirectiveSelected,
      advanceDirective: data.advanceDirective,
      motherName: data.motherName,
      fatherName: data.fatherName,
      informantsDetails: (data.informantsDetails ?? []).map((informant) => ({
        name: informant.name,
        relationshipWithPatient: informant.relationshipWithPatient.value,
        reliabilityAndAdequacy: informant.reliabilityAndAdequacy,
        knownToPatient: informant.knownToPatient
      })),
      chiefComplaints: data.chiefComplaints,
      historyOfPresentIllness: {
        onset: data?.onset?.value ?? "",
        onsetOther: data?.onsetOther ?? "",
        course: data?.course?.value ?? "",
        courseOther: data?.courseOther ?? "",
        progress: data?.progress?.value ?? "",
        totalDurationOfIllness: data?.totalDurationOfIllness ?? "",
        durationThisEpisode: data?.durationThisEpisode,
        predisposing: data?.predisposing,
        perpetuating: data?.perpetuating,
        precipitatingFactors: data?.precipitatingFactors,
        impactOfPresentIllness: data?.impactOfPresentIllness?.value ?? "",
        historyOfPresentIllness: data?.historyOfPresentIllness,
        negativeHistory: data?.negativeHistory,
        pastPsychiatricHistory: data?.pastPsychiatricHistory,
        pastPsychiatricTreatmentHistory: data?.pastPsychiatricTreatmentHistory,
        pastMedicalHistory: data?.pastMedicalHistory
      },
      familyHistory: {
        historyofPsychiatricIllness: data?.historyofPsychiatricIllness
      },
      personalHistory: {
        maritalHistory: {
          status: data?.maritalHistoryStatus,
          spouseDetails: data?.spouseDetails
        },
        birthAndChildhoodHistory: {
          prenatal: data?.prenatal,
          natal: data?.natal,
          postnatal: data?.postnatal,
          developmentalMilestone: data?.developmentalMilestone,
          immunizationStatus: data?.immunizationStatus
        },
        educationalHistory: {
          // // achievements: data.achievements,
          complaintsAtSchool: data?.complaintsAtSchool
        },
        occupationalHistory: data?.occupationalHistory,
        sexualHistory: data?.sexualHistory,
        menstrualHistory: {
          ageAtMenarche: data?.ageAtMenarche,
          regularity: data?.regularity,
          noOfDaysOfMenses: data?.noOfDaysOfMenses,
          lastMenstrualPeriod: data?.lastMenstrualPeriod
        },
        religiousHistory: data?.religiousHistory,
        // substanceUseHistory: {
        //   ageAtFirstUse: data.ageAtFirstUse,
        //   substanceUsed: data.substanceUsed,
        //   duration: data.duration,
        //   abstinencePeriodAndReason: data.abstinencePeriodAndReason,
        //   relapsesAndReason: data.relapsesAndReason,
        //   averageDose: data.averageDose,
        //   maximumDose: data.maximumDose,
        //   lastIntake: data.lastIntake
        // }
        substanceUseHistory: data?.substanceUseHistory
      },
      premorbidPersonality: {
        socialRelationsWitFamilyOrFriendsOrColleagues:
          data?.socialRelationsWitFamilyOrFriendsOrColleagues,
        hobbiesOrInterests: data?.hobbiesOrInterests,
        personalityTraits: data?.personalityTraits,
        mood: data?.mood,
        characterOrAttitudeToWorkOrResponsibility: data?.characterOrAttitudeToWorkOrResponsibility,
        habits: data?.habits
      },
      mentalStatusExamination: {
        generalAppearanceBehavior: {
          kemptAndTidy: data?.kemptAndTidy,
          withdrawn: data?.withdrawn,
          lookingAtOneAge: data?.lookingAtOneAge,
          overfriendly: data?.overfriendly,
          dressAppropriate: data?.dressAppropriate,
          suspicious: data?.suspicious,
          eyeContact: data?.eyeContact,
          posture: data?.posture,
          cooperative: data?.cooperative,
          grimaces: data?.grimaces,
          helpSeeking: data?.helpSeeking,
          guarded: data?.guarded,
          ingratiated: data?.ingratiated,
          hostile: data?.hostile,
          submissive: data?.submissive,
          psychomotorActivity: data?.psychomotorActivity
        },
        speech: {
          rate: data?.rate,
          goalDirected: data?.goalDirected,
          volume: data?.volume,
          spontaneous: data?.spontaneous,
          pitchOrTone: data?.pitchOrTone,
          coherent: data?.coherent,
          reactionTime: data?.reactionTime,
          relevant: data?.relevant
        },
        affect: {
          objective: data?.objective,
          subjective: data?.subjective,
          affect: data?.affect,
          range: data?.range,
          reactivity: data?.reactivity
        },
        thought: {
          stream: data?.stream,
          form: data?.form,
          content: data?.content,
          possession: data?.possession
        },
        perception: {
          hallucination: data?.hallucination,
          hallucinationSample: data?.hallucinationSample,
          illusion: data?.illusion,
          illusionSample: data?.illusionSample
        },
        higherCognitiveFunctions: {
          orientation: {
            time: data?.time,
            place: data?.place,
            person: data?.person
          },
          attentionConcentration: {
            digitSpanTest: data?.digitSpanTest,
            serialSubtractionTest: data?.serialSubtractionTest
          },
          memory: {
            immediate: data?.immediate,
            recent: data?.recent,
            remote: data?.remote
          },
          generalIntelligence: {
            generalFundOfKnowledge: data?.generalFundOfKnowledge,
            arithmetic: data?.arithmetic,
            comprehesion: data?.comprehesion
          },
          abstractThinking: {
            similaritiesOrDissimilarities: data?.similaritiesOrDissimilarities,
            proverbs: data?.proverbs
          },
          judgement: {
            personal: data?.personal,
            social: data?.social,
            test: data?.test
          }
        }
      },
      insight: {
        insightGrade: data?.insightGrade?.value, // Example hardcoded
        insight: data?.insight
      },
      // Example hardcoded
      diagnosticFormulation: {
        description: data?.diagnosticFormulation,
        provisionalDiagnosis: data?.provisionalDiagnosis,
        differentialDiagnosis: data?.differentialDiagnosis,
        targetSymptoms: data?.targetSymptoms,
        pharmacologicalPlan: data?.pharmacologicalPlan,
        nonPharmacologicalPlan: data?.nonPharmacologicalPlan,
        reviewsRequired: data?.reviewsRequired,
        psychologicalAssessments: data?.psychologicalAssessments,
        investigations: data?.investigations
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function appendFormData(formData: FormData, data: any, parentKey = "") {
      if (data === null || data === undefined) return;

      if (Array.isArray(data)) {
        data.forEach((value, index) => {
          const key = parentKey ? `${parentKey}[${index}]` : `${index}`;
          appendFormData(formData, value, key);
        });
      } else if (typeof data === "object" && !(data instanceof File)) {
        Object.keys(data).forEach((key) => {
          const newKey = parentKey ? `${parentKey}[${key}]` : key;
          appendFormData(formData, data[key], newKey);
        });
      } else {
        // only append if value is not undefined
        if (parentKey) {
          formData.append(parentKey, String(data));
        }
      }
    }

    const formData = new FormData();
    appendFormData(formData, body);

    if (data.file instanceof File) {
      formData.append("genogram", data.file);
    } else {
      if (typeof data.file !== "string") formData.append("genogram", "");
    }

    try {
      if (id) {
        if (patientUpdate.personalIncome !== patientUpdate.personalIncomeOld) {
          await updatePatient({ personalIncome: patientUpdate.personalIncome }, id);
        }
        if (data?._id) {
          const response = await updateCaseHistory(id, state.admissionId, data?._id, formData);
          if ((response?.data?.status as unknown as string) == "success") {
            toast.success("Case History updated");
            fetchPreviousCaseHistories(id, state.admissionId, data?._id);
          }
        } else {
          const response = await createCaseHistory(id, state.admissionId, formData);
          if ((response?.data?.status as unknown as string) == "success") {
            setData((prev) => ({ ...prev, _id: response?.data?.data?._id }));
            toast.success("Case History created");
          }
        }
      }
      if (type && type === "SAVE_AND_NEXT_DISCARD") {
        const discardLocation = stepperData.discardModal.discartLocation;
        dispatch(setDiscardModal({ isFormChanged: false, isDiscardModalOpen: false }));
        setTimeout(() => {
          if (stepperData.discardModal.type === "navigate") {
            if (discardLocation) {
              navigate(discardLocation);
            } else {
              navigate(-1);
            }
          }
        }, 500);
      }
      setState((prevState) => ({ ...prevState, loading: false }));
    } catch (error) {
      setState((prevState) => ({ ...prevState, loading: false }));
      handleError(error);
    }
  };

  const [historyToDisplay, setHistoryToDisplay] = useState<Set<string>>(new Set());

  const handleOnClickToshowPreviousHistory = (index: number, id: string) => {
    setPreviousHistoryLoader(true);
    setHistoryToDisplay(() => {
      const newSet = new Set<string>(); // Create a copy of the Set

      if (historyToDisplay.has(id)) {
        setHistoryToDisplay(newSet);
      } else {
        newSet.add(id); // Add if id doesn't exist
      }

      return newSet; // Update the state with the new Set
    });
    const resData = previousHistoryArray[index];
    if (resData) {
      const transformedData = {
        _id: resData?._id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        informantsDetails: resData?.informantsDetails?.map((detail: any) => ({
          name: detail?.name,
          relationshipWithPatient: {
            label: detail?.relationshipWithPatient?.fullName || "Select",
            value: detail?.relationshipWithPatient?._id || ""
          },
          reliabilityAndAdequacy: detail?.reliabilityAndAdequacy,
          knownToPatient: detail?.knownToPatient
        })),
        motherName: resData?.motherName || "",
        fatherName: resData?.fatherName || "",
        chiefComplaints: resData?.chiefComplaints || "",
        onset: {
          label: resData?.historyOfPresentIllness?.onset || "Select",
          value: resData?.historyOfPresentIllness?.onset || ""
        },
        onsetOther: resData?.onsetOther || "",
        course: {
          label: resData?.historyOfPresentIllness?.course || "Select",
          value: resData?.historyOfPresentIllness?.course || ""
        },
        courseOther: resData?.courseOther || "",
        progress: {
          label: resData?.historyOfPresentIllness?.progress || "Select",
          value: resData?.historyOfPresentIllness?.progress || ""
        },
        totalDurationOfIllness: resData?.historyOfPresentIllness?.totalDurationOfIllness,
        durationThisEpisode: resData?.historyOfPresentIllness?.durationThisEpisode,
        perpetuating: resData?.historyOfPresentIllness?.perpetuating,
        predisposing: resData?.historyOfPresentIllness?.predisposing,
        precipitatingFactors: resData?.historyOfPresentIllness?.precipitatingFactors,
        impactOfPresentIllness: {
          label: resData?.historyOfPresentIllness?.impactOfPresentIllness || "Select",
          value: resData?.historyOfPresentIllness?.impactOfPresentIllness || ""
        },
        historyOfPresentIllness: resData?.historyOfPresentIllness?.historyOfPresentIllness || "",
        negativeHistory: resData?.historyOfPresentIllness?.negativeHistory || "",
        pastPsychiatricHistory: resData?.historyOfPresentIllness?.pastPsychiatricHistory || "",
        pastPsychiatricTreatmentHistory:
          resData?.historyOfPresentIllness?.pastPsychiatricTreatmentHistory || "",
        pastMedicalHistory: resData?.historyOfPresentIllness?.pastMedicalHistory || "",
        historyofPsychiatricIllness: resData?.familyHistory?.historyofPsychiatricIllness || "",
        prenatal: resData?.personalHistory?.birthAndChildhoodHistory?.prenatal || "",
        natal: resData?.personalHistory?.birthAndChildhoodHistory?.natal || "",
        postnatal: resData?.personalHistory?.birthAndChildhoodHistory?.postnatal || "",
        developmentalMilestone:
          resData?.personalHistory?.birthAndChildhoodHistory?.developmentalMilestone || "",
        immunizationStatus:
          resData?.personalHistory?.birthAndChildhoodHistory?.immunizationStatus || "",
        // // achievements: resData?.personalHistory?.educationalHistory?.achievements || "",
        complaintsAtSchool: resData?.personalHistory?.educationalHistory?.complaintsAtSchool || "",
        occupationalHistory: resData?.personalHistory?.occupationalHistory || "",
        sexualHistory: resData?.personalHistory?.sexualHistory || "",
        ageAtMenarche: resData?.personalHistory?.menstrualHistory?.ageAtMenarche || "",
        regularity: resData?.personalHistory?.menstrualHistory?.regularity || "",
        noOfDaysOfMenses: resData?.personalHistory?.menstrualHistory?.noOfDaysOfMenses || "",
        lastMenstrualPeriod: resData?.personalHistory?.menstrualHistory?.lastMenstrualPeriod || "",
        maritalHistoryStatus: resData?.personalHistory?.maritalHistory?.status,
        spouseDetails: resData?.personalHistory?.maritalHistory?.spouseDetails,
        religiousHistory: resData?.personalHistory?.religiousHistory || "",
        substanceUseHistory: resData?.personalHistory?.substanceUseHistory || [],
        ageAtFirstUse: resData?.personalHistory?.substanceUseHistory?.ageAtFirstUse || "",
        substanceUsed: resData?.personalHistory?.substanceUseHistory?.substanceUsed || "",
        duration: resData?.personalHistory?.substanceUseHistory?.duration || "",
        abstinencePeriodAndReason:
          resData?.personalHistory?.substanceUseHistory?.abstinencePeriodAndReason || "",
        relapsesAndReason: resData?.personalHistory?.substanceUseHistory?.relapsesAndReason || "",
        averageDose: resData?.personalHistory?.substanceUseHistory?.averageDose || "",
        maximumDose: resData?.personalHistory?.substanceUseHistory?.maximumDose || "",
        lastIntake: resData?.personalHistory?.substanceUseHistory?.lastIntake || "",
        socialRelationsWitFamilyOrFriendsOrColleagues:
          resData?.premorbidPersonality?.socialRelationsWitFamilyOrFriendsOrColleagues || "",
        hobbiesOrInterests: resData?.premorbidPersonality?.hobbiesOrInterests || "",
        personalityTraits: resData?.premorbidPersonality?.personalityTraits || "",
        mood: resData?.premorbidPersonality?.mood || "",
        characterOrAttitudeToWorkOrResponsibility:
          resData?.premorbidPersonality?.characterOrAttitudeToWorkOrResponsibility || "",
        habits: resData?.premorbidPersonality?.habits || "",
        kemptAndTidy:
          resData?.mentalStatusExamination?.generalAppearanceBehavior?.kemptAndTidy || "",
        withdrawn: resData?.mentalStatusExamination?.generalAppearanceBehavior?.withdrawn || "",
        lookingAtOneAge:
          resData?.mentalStatusExamination?.generalAppearanceBehavior?.lookingAtOneAge || "",
        overfriendly:
          resData?.mentalStatusExamination?.generalAppearanceBehavior?.overfriendly || "",
        dressAppropriate:
          resData?.mentalStatusExamination?.generalAppearanceBehavior?.dressAppropriate || "",
        suspicious: resData?.mentalStatusExamination?.generalAppearanceBehavior?.suspicious || "",
        eyeContact: resData?.mentalStatusExamination?.generalAppearanceBehavior?.eyeContact || "",
        posture: resData?.mentalStatusExamination?.generalAppearanceBehavior?.posture || "",
        cooperative: resData?.mentalStatusExamination?.generalAppearanceBehavior?.cooperative || "",
        grimaces: resData?.mentalStatusExamination?.generalAppearanceBehavior?.grimaces || "",
        helpSeeking: resData?.mentalStatusExamination?.generalAppearanceBehavior?.helpSeeking || "",
        guarded: resData?.mentalStatusExamination?.generalAppearanceBehavior?.guarded || "",
        ingratiated: resData?.mentalStatusExamination?.generalAppearanceBehavior?.ingratiated || "",
        hostile: resData?.mentalStatusExamination?.generalAppearanceBehavior?.hostile || "",
        submissive: resData?.mentalStatusExamination?.generalAppearanceBehavior?.submissive || "",
        psychomotorActivity:
          resData?.mentalStatusExamination?.generalAppearanceBehavior?.psychomotorActivity || "",
        rate: resData?.mentalStatusExamination?.speech?.rate || "",
        goalDirected: resData?.mentalStatusExamination?.speech?.goalDirected || "",
        volume: resData?.mentalStatusExamination?.speech?.volume || "",
        spontaneous: resData?.mentalStatusExamination?.speech?.spontaneous || "",
        pitchOrTone: resData?.mentalStatusExamination?.speech?.pitchOrTone || "",
        coherent: resData?.mentalStatusExamination?.speech?.coherent || "",
        reactionTime: resData?.mentalStatusExamination?.speech?.reactionTime || "",
        relevant: resData?.mentalStatusExamination?.speech?.relevant || "",
        objective: resData?.mentalStatusExamination?.affect?.objective || "",
        subjective: resData?.mentalStatusExamination?.affect?.subjective || "",
        affect: resData?.mentalStatusExamination?.affect?.affect || "",
        range: resData?.mentalStatusExamination?.affect?.range || "",
        reactivity: resData?.mentalStatusExamination?.affect?.reactivity || "",
        stream: resData?.mentalStatusExamination?.thought?.stream || "",
        form: resData?.mentalStatusExamination?.thought?.form || "",
        content: resData?.mentalStatusExamination?.thought?.content || "",
        possession: resData?.mentalStatusExamination?.thought?.possession || "",
        hallucination: resData?.mentalStatusExamination?.perception?.hallucination || "",
        hallucinationSample:
          resData?.mentalStatusExamination?.perception?.hallucinationSample || "",
        illusion: resData?.mentalStatusExamination?.perception?.illusion || "",
        illusionSample: resData?.mentalStatusExamination?.perception?.illusionSample || "",
        time: resData?.mentalStatusExamination?.higherCognitiveFunctions?.orientation.time || "",
        place: resData?.mentalStatusExamination?.higherCognitiveFunctions?.orientation?.place || "",
        person:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.orientation?.person || "",
        digitSpanTest:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.attentionConcentration
            ?.digitSpanTest || "",
        serialSubtractionTest:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.attentionConcentration
            ?.serialSubtractionTest || "",
        immediate:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.immediate || "",
        recent: resData?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.recent || "",
        remote: resData?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.remote || "",
        generalFundOfKnowledge:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
            ?.generalFundOfKnowledge || "",
        arithmetic:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
            ?.arithmetic || "",
        comprehesion:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
            ?.comprehesion || "",
        similaritiesOrDissimilarities:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.abstractThinking
            ?.similaritiesOrDissimilarities || "",
        proverbs:
          resData?.mentalStatusExamination?.higherCognitiveFunctions?.abstractThinking?.proverbs ||
          "",
        personal:
          resData?.mentalStatusExamination?.higherCognitiveFunctions.judgement?.personal || "",
        social: resData?.mentalStatusExamination?.higherCognitiveFunctions.judgement?.social || "",
        test: resData?.mentalStatusExamination?.higherCognitiveFunctions?.judgement?.test || "",

        insightGrade: {
          label: resData?.insight?.insightGrade || "Select",
          value: resData?.insight?.insightGrade || ""
        },
        insight: resData?.insight?.insight || "",
        diagnosticFormulation: resData?.diagnosticFormulation?.description || "",
        provisionalDiagnosis: resData?.diagnosticFormulation?.provisionalDiagnosis || "",
        differentialDiagnosis: resData?.diagnosticFormulation?.differentialDiagnosis || "",
        targetSymptoms: resData?.diagnosticFormulation?.targetSymptoms || "",
        pharmacologicalPlan: resData?.diagnosticFormulation?.pharmacologicalPlan || "",
        nonPharmacologicalPlan: resData?.diagnosticFormulation?.nonPharmacologicalPlan || "",
        reviewsRequired: resData?.diagnosticFormulation?.reviewsRequired || "",
        psychologicalAssessments: resData?.diagnosticFormulation?.psychologicalAssessments || "",
        investigations: resData?.diagnosticFormulation?.investigations || "",

        isAdvanceDirectiveSelected: resData?.isAdvanceDirectiveSelected ?? "",
        advanceDirective: resData?.advanceDirective,
        file: resData?.genogram?.filePath || "",
        fileName: resData?.genogram?.fileName || ""
      };
      sethistoryData(transformedData);
    }
    setTimeout(() => {
      setPreviousHistoryLoader(false);
    }, 1000);
  };

  const deleteHistoryConfirmModalFunction = async (cid: string, rid: string) => {
    if (state.currentStatus === "Discharged") return;

    try {
      if (id) {
        setDropDownState((prev) => ({
          ...prev,
          caseHistoryId: cid,
          caseHistoryRevisionId: rid,
          isDeleteModalOpen: true
        }));
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleDeleteHistoryFunction = async (cid: string, rid: string) => {
    if (state.currentStatus === "Discharged") return;

    try {
      if (id) {
        const response = await deleteCaseHistory(id, state.admissionId, cid, rid);
        if ((response?.data?.status as unknown as string) == "success") {
          toast.success("Case History Deleted");
          fetchPreviousCaseHistories(id, state.admissionId, cid);
          setDropDownState((prev) => ({
            ...prev,
            caseHistoryId: "",
            caseHistoryRevisionId: "",
            isDeleteModalOpen: false
          }));
        }
        setDropDownState((prev) => ({
          ...prev,
          isDeleteModalOpen: false
        }));
      }
    } catch (error) {
      handleError(error);
      setDropDownState((prev) => ({
        ...prev,
        isDeleteModalOpen: false
      }));
    }
  };

  useEffect(() => {
    const checkStateBeforeUnload = (e: BeforeUnloadEvent) => {
      if (stepperData.discardModal.isFormChanged) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", checkStateBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", checkStateBeforeUnload);
    };
  }, [dispatch, stepperData.discardModal.isFormChanged]);

  useBlocker(({ nextLocation }) => {
    if (stepperData.discardModal.isFormChanged) {
      dispatch(
        setDiscardModal({ isDiscardModalOpen: true, discartLocation: nextLocation.pathname })
      );
      return true;
    }

    return false;
  });

  return (
    <div id="caseHistory" className="bg-[#F4F2F0]">
      <div className=" relative container py-20  lg:px-8 sm:px-2 flex flex-col gap-5">
        <div className="flex fixed w-full left-0 container right-0 px-8 top-15 z-20 bg-[#F4F2F0] justify-between md:flex-row flex-col md:items-center">
          <div className="flex items-center gap-3 h-20">
            <div
              className="p-3 w-fit bg-white rounded-full cursor-pointer"
              onClick={() => {
                navigate(-1);
              }}
            >
              <FaArrowLeft />
            </div>
            <div className="flex flex-col items-start">
              <BreadCrumb
                discharge={state.currentStatus == "Discharged"}
                name={`${capitalizeFirstLetter(
                  state?.firstName.length > 15
                    ? state?.firstName.slice(0, 15) + "..."
                    : state?.firstName
                )} ${
                  state.lastName
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
              <div className=" text-[18px] font-semibold">Case History</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2">
            {state.currentStatus !== "Discharged" && (
              <RBACGuard resource={RESOURCES.CASE_HISTORY} action="write">
                <Button
                  type="submit"
                  disabled={state.loading}
                  className="min-w-[93]! text-[13px]! px-[30px]! py-[10px]! rounded-[9px]!"
                  name="next"
                  variant="contained"
                  size="base"
                  onClick={handleSave}
                >
                  Save {state.loading && <Loader size="xs" />}
                </Button>
              </RBACGuard>
            )}
            <DownloadCaseHistory
              data={{ ...data, ...state, ...patientUpdate }}
              familyDetails={familyDetails}
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
          </div>
        </div>

        <div>
          <div id="DropDown" className=" rounded-xl ">
            <div>
              <DropDown heading="Patient Details">
                <div className="grid lg:grid-cols-3 grid-cols-1 gap-[60px]">
                  <div className="grid lg:grid-cols-5 grid-cols-3 lg:col-span-3 items-center col-span-1 gap-10">
                    <div className="flex mb-3 gap-2 col-span-2   items-center py-4 ">
                      <div
                        className={`flex rounded-full  border-2 ${
                          state.gender == "Male"
                            ? "border-[#00685F]"
                            : state.gender == "Female"
                            ? "border-[#F14E9A]"
                            : "border-gray-500"
                        }   overflow-hidden w-16 h-16 items-center justify-center`}
                      >
                        <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                          {state?.patientPicUrl ? (
                            <img
                              src={state?.patientPicUrl}
                              alt="profile"
                              className="w-full h-full"
                            />
                          ) : (
                            <div className="flex rounded-full p-1 w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                              <div className="w-full uppercase text-[13px] font-semibold text-center">
                                {state?.firstName?.slice(0, 1)}
                                {state?.lastName?.slice(0, 1)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-start">
                          <h2
                            title={state?.firstName + " " + state?.lastName}
                            className="text-[13px] font-semibold text-left text-wrap"
                          >
                            {state.firstName &&
                              capitalizeFirstLetter(
                                state.firstName?.length > 15
                                  ? state.firstName?.slice(0, 15) + "..."
                                  : state.firstName
                              )}{" "}
                            {state.lastName
                              ? capitalizeFirstLetter(
                                  state.lastName.length > 15
                                    ? state.lastName.slice(0, 15) + "..."
                                    : state.lastName
                                )
                              : ""}
                          </h2>
                          {state.currentStatus && (
                            <div
                              className={`${
                                state.currentStatus == "Inpatient"
                                  ? "text-[#3A913D] bg-[#E4FFEE]"
                                  : "bg-gray-200"
                              } w-fit rounded-[5px] ml-2 gap-1 text-xs font-semibold px-[5px] py-[3px] flex items-center`}
                            >
                              {state.currentStatus !== "Discharged" && (
                                <div
                                  className={`  ${
                                    state.currentStatus == "Inpatient" ? "bg-[#3A913D]" : "bg-black"
                                  } w-1 h-1 bg-black" rounded-full`}
                                ></div>
                              )}
                              <p>{state.currentStatus}</p>
                            </div>
                          )}
                        </div>
                        <div className="text-xs ">
                          <span>Admission Date:</span>
                          <span className="font-semibold ml-1 text-black">
                            {formatDate(state.admissionDate)}
                          </span>
                          <div className="flex gap-3">
                            <p className="text-xs">
                              UHID:
                              <span className="font-semibold ml-1 text-nowrap whitespace-nowrap text-black">
                                {formatId(state.UHID)}
                              </span>
                            </p>
                            <p className="text-xs ">
                              Gender:
                              <span className="font-semibold ml-1 text-nowrap whitespace-nowrap text-black">
                                {state.gender}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <InputBox
                      label="Educational Qualification"
                      value={capitalizeFirstLetter(state.education)}
                    />
                    <InputBox label="Occupation" value={capitalizeFirstLetter(state.occupation)} />
                    <div className="flex gap-[10px]  items-start justify-start flex-col">
                      <label className="font-medium text-xs">Marital Status</label>
                      <div className="flex gap-5 items-center justify-center mb-3">
                        <div className="flex items-center me-4">
                          <div className="relative flex items-center">
                            <label
                              htmlFor="married"
                              className={`w-5 h-5 flex items-center justify-center rounded-full border-2  cursor-pointer ${
                                state.ismarried === true ? " border-gray-300!" : "border-gray-300!"
                              }`}
                            >
                              {state.ismarried === true && (
                                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                              )}
                            </label>
                          </div>

                          <label
                            htmlFor="ismarried"
                            className="ms-2 cursor-not-allowed text-sm font-medium"
                          >
                            Yes
                          </label>
                        </div>
                        <div className="flex items-center cursor-not-allowed">
                          <div className="relative flex cursor-not-allowed items-center">
                            <label
                              htmlFor="unMarried"
                              className={`w-5 h-5 flex cursor-not-allowed items-center justify-center rounded-full border-2 border-black  ${
                                state.ismarried === false ? " border-gray-300!" : "border-gray-300!"
                              }`}
                            >
                              {state.ismarried === false && (
                                <div className="w-3 h-3 cursor-not-allowed rounded-full bg-gray-300"></div>
                              )}
                            </label>
                          </div>

                          <label
                            htmlFor="ismarried"
                            className="ms-2 cursor-not-allowed text-sm font-medium"
                          >
                            No
                          </label>
                        </div>
                      </div>
                    </div>
                    <InputBox
                      label="Religion"
                      value={state?.religion ? capitalizeFirstLetter(state.religion) : "--"}
                    />
                    <Input
                      label="Mother’s Name"
                      labelClassName="text-black!"
                      className="rounded-lg! font-bold placeholder:font-normal"
                      placeholder="Enter"
                      name="motherName"
                      disabled={state.currentStatus === "Discharged"}
                      value={data.motherName}
                      onChange={handleChange}
                    />

                    <Input
                      label="Father’s Name"
                      disabled={state.currentStatus === "Discharged"}
                      labelClassName="text-black!"
                      className="rounded-lg! font-bold placeholder:font-normal"
                      placeholder="Enter"
                      name="fatherName"
                      value={data.fatherName}
                      onChange={handleChange}
                    />

                    <InputBox label="Nationality" value={state.country} />
                    <Input
                      label="Personal Income"
                      disabled={state.currentStatus === "Discharged"}
                      labelClassName="text-black!"
                      className="rounded-lg! font-bold placeholder:font-normal"
                      placeholder="Enter"
                      name="personalIncome"
                      value={patientUpdate.personalIncome}
                      onChange={handlePatientUpdate}
                    />
                    <InputBox label="Family Income" value={state?.familyIncome} />
                    <div className="flex flex-col gap-2 text-xs col-span-2">
                      <InputBox label="Address" value={state?.address} />
                    </div>
                    <InputBox label="Type of Admission" value={state?.involuntaryAdmissionType} />
                    <InputBox
                      label="Nominated representative"
                      value={capitalizeFirstLetter(
                        familyDetails.find((data) =>
                          data.infoType?.includes("Nominated Representative")
                        )?.name || "--"
                      )}
                    />
                    <InputBox
                      label="Identification mark"
                      value={capitalizeFirstLetter(state.identificationMark)}
                    />
                    <div className="flex gap-[2px]  items-start flex-col col-span-2">
                      <label className="font-medium text-xs">Advance directive</label>
                      <div className="flex gap-5 items-center justify-center">
                        <div className="flex items-center me-4">
                          <div className="relative flex items-center">
                            <Input
                              id="Male"
                              type="radio"
                              value="Male"
                              onChange={() => {
                                if (state.currentStatus === "Discharged") return;

                                setData((prev) => ({
                                  ...prev,
                                  isAdvanceDirectiveSelected: true
                                }));
                              }}
                              checked={data.isAdvanceDirectiveSelected === true}
                              name="isAdvanceDirectiveSelected"
                              containerClass="w-full absolute opacity-0"
                            />
                            <label
                              htmlFor="yes"
                              className="w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer  !border-[#586B3A]"
                            >
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  data.isAdvanceDirectiveSelected === true ? "bg-[#586B3A]" : ""
                                }`}
                              ></div>
                            </label>
                          </div>
                          <label htmlFor="yes" className="ms-2 text-sm font-medium">
                            Yes
                          </label>
                        </div>
                        <div className="flex items-center me-4">
                          <div className="relative flex items-center">
                            <Input
                              id="Male"
                              type="radio"
                              value="Male"
                              onChange={() => {
                                if (state.currentStatus === "Discharged") return;
                                setData((prev) => ({
                                  ...prev,
                                  isAdvanceDirectiveSelected: false
                                }));
                              }}
                              checked={data.isAdvanceDirectiveSelected === false}
                              name="isAdvanceDirectiveSelected"
                              containerClass="w-full absolute opacity-0"
                            />
                            <label
                              htmlFor="no"
                              className="w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer  !border-[#586B3A]"
                            >
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  data.isAdvanceDirectiveSelected === false ? "bg-[#586B3A]" : ""
                                }`}
                              ></div>
                            </label>
                          </div>
                          <label htmlFor="no" className="ms-2 text-sm font-medium">
                            no
                          </label>
                        </div>
                        <Input
                          labelClassName="text-black!"
                          className={`rounded-lg! py-1! font-bold placeholder:font-normal 
                      ${data.isAdvanceDirectiveSelected == true ? "opacity-100" : "opacity-0"}
                    `}
                          placeholder="Enter"
                          disabled={state.currentStatus === "Discharged"}
                          value={data.advanceDirective}
                          name="advanceDirective"
                          onChange={(e) => {
                            handleChange(e);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 col-span-1">
                    <p className="text-sm font-semibold">Patient accompained by</p>
                    <div className="grid grid-cols-3 gap-10 mt-4">
                      <InputBox
                        label="Name"
                        value={capitalizeFirstLetter(
                          familyDetails.find((data) =>
                            data.infoType?.includes("Nominated Representative")
                          )?.name || "--"
                        )}
                      />
                      <InputBox
                        label="Age"
                        value={capitalizeFirstLetter(
                          familyDetails
                            .find((data) => data.infoType?.includes("Nominated Representative"))
                            ?.age?.toString() || "--"
                        )}
                      />
                      <InputBox
                        label="Relationship"
                        value={capitalizeFirstLetter(
                          familyDetails.find((data) =>
                            data.infoType?.includes("Nominated Representative")
                          )?.relationshipId?.shortName || "--"
                        )}
                      />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <p className="text-sm font-semibold">Reference</p>
                    <div className="grid grid-cols-2 gap-10 mt-4">
                      <InputBox label="Referral Type" value={state.referredTypeId || "--"} />
                      <InputBox
                        label="Referral Details"
                        value={capitalizeFirstLetter(state.referralDetails)}
                      />
                    </div>
                  </div>
                </div>
              </DropDown>

              {/* Informants Details */}

              <DropDown
                heading="Informants Details"
                button={
                  <RBACGuard resource={RESOURCES.CASE_HISTORY} action="write">
                    <Button
                      onClick={() => {
                        handleAddInformants();
                      }}
                      variant="outlined"
                      type="submit"
                      className="rounded-xl! text-xs! bg-[#ECF3CA] font-semibold py-[7px]! px-[15px]! text-black border-0!"
                    >
                      Add 1 more
                    </Button>
                  </RBACGuard>
                }
              >
                {(data.informantsDetails ?? []).map((value, index: number) => (
                  <div key={index} className="flex items-end justify-between pr-10">
                    <div>
                      <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4 items-center justify-center  gap-x-[52px]">
                        <Input
                          label="Name"
                          disabled={state.currentStatus === "Discharged"}
                          labelClassName="text-black!"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          placeholder="Enter"
                          value={value.name}
                          name="name"
                          onChange={(e) => {
                            handleUpdateInformants(index, e);
                          }}
                        />
                        <Select
                          label="Relationship with Patient"
                          disable={state.currentStatus === "Discharged"}
                          // labelClassName="text-black!"
                          className="rounded-lg! w-[240px]! font-bold placeholder:font-normal"
                          placeholder="Enter"
                          options={relationshipDropdown}
                          value={
                            data.informantsDetails?.[index]?.relationshipWithPatient ?? {
                              label: "Select",
                              value: ""
                            }
                          }
                          name="relationshipWithPatient"
                          onChange={(name, data) => {
                            handleSelectUpdateInformants(index, name, data);
                          }}
                        />
                        <Input
                          disabled={state.currentStatus === "Discharged"}
                          label="Reliability & Adequacy"
                          labelClassName="text-black!"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          placeholder="Enter"
                          value={value.reliabilityAndAdequacy}
                          name="reliabilityAndAdequacy"
                          onChange={(e) => {
                            handleUpdateInformants(index, e);
                          }}
                        />

                        <Input
                          disabled={state.currentStatus === "Discharged"}
                          label="Known to patient"
                          labelClassName="text-black!"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          placeholder="Enter"
                          name="knownToPatient"
                          value={value.knownToPatient}
                          onChange={(e) => {
                            handleUpdateInformants(index, e);
                          }}
                        />
                      </div>
                      {(data.informantsDetails?.length ?? 0) - 1 !== index && (
                        <hr className="my-6" />
                      )}
                    </div>
                    {index > 0 && (
                      <RBACGuard resource={RESOURCES.CASE_HISTORY} action="write">
                        <div className="align-bottom  flex h-full justify-end">
                          <Button
                            variant="contained"
                            onClick={() => toggleModalDelete(index)}
                            className="w-fit! text-xs bg-red-800! h-10!"
                          >
                            Remove
                          </Button>
                        </div>
                      </RBACGuard>
                    )}
                  </div>
                ))}
              </DropDown>

              {/* Chief complaints */}
              <DropDown
                heading="Chief complaints"
                subheading="(In Chronological Order with Duration)"
              >
                <RichTextEditor
                  disable={state.currentStatus === "Discharged"}
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.chiefComplaints || ""}
                  onChange={handleChangeQuill}
                  name="chiefComplaints"
                />
              </DropDown>

              {/* History of Present Illness */}
              <DropDown heading="Illness Specifiers">
                <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Select
                    label="Onset"
                    disable={state.currentStatus === "Discharged"}
                    options={[
                      { label: "Select", value: "" },
                      { label: "Abrupt", value: "Abrupt" },
                      { label: "Acute", value: "Acute" },
                      { label: "Insidious", value: "Insidious" },
                      { label: "Subacute", value: "Subacute" },
                      { label: "Other", value: "Other" }
                    ]}
                    value={data?.onset || { label: "Select", value: "" }}
                    name="onset"
                    onChange={handleSelect}
                  />
                  {data.onset && data.onset?.value == "Other" && (
                    <Input
                      disabled={state.currentStatus === "Discharged"}
                      label="Onset Other Detail"
                      labelClassName="text-black!"
                      className="rounded-lg! font-bold placeholder:font-normal"
                      placeholder="Enter"
                      name="onsetOther"
                      value={data?.onsetOther}
                      onChange={handleChange}
                    />
                  )}

                  <Select
                    disable={state.currentStatus === "Discharged"}
                    label="Course"
                    options={[
                      { label: "Select", value: "" },
                      { label: "Continuous", value: "Continuous" },
                      { label: "Episodic", value: "Episodic" },
                      { label: "Fluctuating", value: "Fluctuating" },
                      { label: "Other", value: "Other" }
                    ]}
                    value={data?.course || { label: "Select", value: "" }}
                    name="course"
                    onChange={(name, data) => {
                      handleSelect(name, data);
                    }}
                  />

                  {data.course && data.course?.value == "Other" && (
                    <Input
                      disabled={state.currentStatus === "Discharged"}
                      label="Course Other Detail"
                      labelClassName="text-black!"
                      className="rounded-lg! font-bold placeholder:font-normal"
                      placeholder="Enter"
                      name="courseOther"
                      value={data?.courseOther}
                      onChange={handleChange}
                    />
                  )}

                  <Select
                    disable={state.currentStatus === "Discharged"}
                    label="Progress"
                    options={[
                      { label: "Select", value: "" },
                      { label: "Deteriorating", value: "Deteriorating" },
                      { label: "Improving", value: "Improving" },
                      { label: "Static", value: "Static" }
                    ]}
                    value={data?.progress || { label: "Select", value: "" }}
                    name="progress"
                    onChange={(name, data) => {
                      handleSelect(name, data);
                    }}
                  />

                  <Input
                    label="Total Duration of Illness"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    name="totalDurationOfIllness"
                    value={data?.totalDurationOfIllness}
                    disabled={state.currentStatus === "Discharged"}
                    onChange={handleChange}
                  />

                  <Input
                    label="Duration (This Episode)"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    disabled={state.currentStatus === "Discharged"}
                    placeholder="Enter"
                    name="durationThisEpisode"
                    value={data.durationThisEpisode}
                    onChange={handleChange}
                  />
                  <Input
                    label="Perpetuating"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    disabled={state.currentStatus === "Discharged"}
                    placeholder="Enter"
                    name="perpetuating"
                    value={data.perpetuating}
                    onChange={handleChange}
                  />
                  <Input
                    label="Predisposing"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    disabled={state.currentStatus === "Discharged"}
                    placeholder="Enter"
                    name="predisposing"
                    value={data.predisposing}
                    onChange={handleChange}
                  />
                  <Input
                    label="Precipitating Factors"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    disabled={state.currentStatus === "Discharged"}
                    name="precipitatingFactors"
                    value={data.precipitatingFactors}
                    onChange={handleChange}
                  />
                  <Select
                    disable={state.currentStatus === "Discharged"}
                    label="Impact of Present Illness"
                    options={[
                      { label: "Select", value: "" },
                      { label: "Interpersonal", value: "Interpersonal" },
                      { label: "Legal", value: "Legal" },
                      { label: "Medical", value: "Medical" },
                      { label: "Social", value: "Social" },
                      { label: "Others", value: "Others" }
                    ]}
                    value={data?.impactOfPresentIllness || { label: "Select", value: "" }}
                    name="impactOfPresentIllness"
                    onChange={(name, data) => {
                      handleSelect(name, data);
                    }}
                  />
                  {/* <Multiselected
                    label="Impact of Present Illness"
                    options={[
                      // { label: "Select", value: "" },
                      { label: "Interpersonal", value: "Interpersonal" },
                      { label: "Legal", value: "Legal" },
                      { label: "Medical", value: "Medical" },
                      { label: "Professional", value: "Professional" },
                      { label: "Social", value: "Social" },
                      { label: "Others", value: "Others" }
                    ]}
                    value={data?.impactOfPresentIllness}
                    disable={state.currentStatus === "Discharged"}
                    onChange={(value) =>
                      setData((prev) => ({ ...prev, impactOfPresentIllness: value }))
                    }
                    placeholder="Select"
                  /> */}
                </div>
                <hr className="my-6" />
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.historyOfPresentIllness || ""}
                  onChange={handleChangeQuill}
                  name="historyOfPresentIllness"
                  disable={state.currentStatus === "Discharged"}
                  label="History Of Present Illness (HOPI)"
                />
                <hr className="my-6" />

                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.negativeHistory || ""}
                  onChange={handleChangeQuill}
                  name="negativeHistory"
                  disable={state.currentStatus === "Discharged"}
                  label="Negative History"
                />

                <hr className="my-6" />
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.pastPsychiatricHistory || ""}
                  onChange={handleChangeQuill}
                  disable={state.currentStatus === "Discharged"}
                  name="pastPsychiatricHistory"
                  label="Past Psychiatric History"
                />
                <hr className="my-6" />
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.pastPsychiatricTreatmentHistory || ""}
                  disable={state.currentStatus === "Discharged"}
                  onChange={handleChangeQuill}
                  name="pastPsychiatricTreatmentHistory"
                  label="Past Psychiatric Treatment History"
                />
                <hr className="my-6" />
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.pastMedicalHistory || ""}
                  onChange={handleChangeQuill}
                  disable={state.currentStatus === "Discharged"}
                  name="pastMedicalHistory"
                  label="Past Medical History (If any)"
                />
              </DropDown>

              {/* Family History */}
              <DropDown heading="Family History">
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.historyofPsychiatricIllness || ""}
                  disable={state.currentStatus === "Discharged"}
                  onChange={handleChangeQuill}
                  name="historyofPsychiatricIllness"
                  label="History of Psychiatric Illness with Genogram"
                />
                <hr className="my-6" />
                <div className="flex items-start flex-col">
                  <p className=" mb-2 ml-5 text-sm font-semibold">Upload Genogram</p>
                  <CheckBox
                    checked={true}
                    name=""
                    handleDeletes={handleDeleteFile}
                    handleDrop={(files) => {
                      handleDropFiles(files);
                    }}
                    accept=".pdf,image/jpeg,image/png"
                    files={data.file instanceof File ? [data.file] : []}
                    filesString={
                      data.file && !(data.file instanceof File)
                        ? [
                            {
                              filePath: typeof data.file === "string" ? data.file : "",
                              fileUrl: typeof data.file === "string" ? data.file : "",
                              fileName: data.fileName || ""
                            }
                          ]
                        : undefined
                    }
                    ContainerClass=""
                    checkHide
                    label={"Upload Genogram"}
                    handleCheck={function (_e: SyntheticEvent): void {
                      throw new Error("Function not implemented.");
                    }}
                  />
                </div>
              </DropDown>

              {/* Personal History */}
              <DropDown heading="Personal History">
                <p className=" mb-6 text-sm font-semibold">Birth and Childhood history</p>
                <div className="grid mb-6 lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Prenatal"
                    value={data.prenatal}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="prenatal"
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    label="Natal"
                    labelClassName="text-black!"
                    placeholder="Enter"
                    value={data.natal}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="natal"
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    label="Postnatal"
                    labelClassName="text-black!"
                    placeholder="Enter"
                    value={data.postnatal}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="postnatal"
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    label="Developmental Milestone"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.developmentalMilestone}
                    onChange={handleChange}
                    name="developmentalMilestone"
                    disabled={state.currentStatus === "Discharged"}
                    placeholder="Enter"
                  />
                  <Input
                    labelClassName="text-black!"
                    disabled={state.currentStatus === "Discharged"}
                    label="Immunization status"
                    className="rounded-lg! col-span-2 font-bold placeholder:font-normal"
                    value={data.immunizationStatus}
                    onChange={handleChange}
                    name="immunizationStatus"
                    placeholder="Enter"
                  />
                </div>
                {/* <RichTextEditor placeholder="Start typing..." maxLength={5000} value={""} name="note" /> */}
                <hr className="my-6" />
                <p className=" mb-4 text-sm font-semibold">Educational History</p>
                {/* <div className="grid mb-6 lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Achievements"
                    value={data.achievements}
                    onChange={handleChange}
                    name="achievements"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    containerClass="col-span-2"
                  />
                </div> */}
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.complaintsAtSchool || ""}
                  onChange={handleChangeQuill}
                  name="complaintsAtSchool"
                  disable={state.currentStatus === "Discharged"}
                  label="Complaints at School"
                />
                <hr className="my-6" />

                <p className=" mb-4 text-sm font-semibold">Occupational History</p>
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.occupationalHistory || ""}
                  onChange={handleChangeQuill}
                  name="occupationalHistory"
                  disable={state.currentStatus === "Discharged"}
                />

                <hr className="my-6" />

                <p className=" mb-4 text-sm font-semibold">Sexual History</p>
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  disable={state.currentStatus === "Discharged"}
                  value={data.sexualHistory || ""}
                  onChange={handleChangeQuill}
                  name="sexualHistory"
                  label="Add Details below (Rule out High-Risk Behavior)"
                />

                <hr className="my-6" />
                <p className=" mb-4 text-sm font-semibold">Menstrual History</p>
                <div className="grid mb-6 lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Age at Menarche"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.ageAtMenarche}
                    onChange={handleChange}
                    name="ageAtMenarche"
                  />

                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Regularity"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.regularity}
                    onChange={handleChange}
                    name="regularity"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    disabled={state.currentStatus === "Discharged"}
                    label="No of days of menses"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.noOfDaysOfMenses}
                    onChange={handleChange}
                    name="noOfDaysOfMenses"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Last Menstrual Period (Day1)"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.lastMenstrualPeriod}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="lastMenstrualPeriod"
                  />
                </div>
                <hr className="my-6" />
                <p className=" mb-4 text-sm font-semibold">Marital History</p>
                <div className="flex gap-5 items-center ">
                  <div className="flex items-center me-4">
                    <div className="relative flex items-center">
                      <Input
                        id="Married"
                        type="radio"
                        value="Married"
                        onChange={handleChange}
                        checked={data.maritalHistoryStatus === "Married"}
                        name="maritalHistoryStatus"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Married"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-black border-2  cursor-pointer ${
                          data.maritalHistoryStatus === "Married"
                            ? " border-[#586B3A]!"
                            : "border-[#586B3A]"
                        }`}
                      >
                        {data.maritalHistoryStatus === "Married" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="Married" className="ms-2 text-sm font-medium">
                      Married
                    </label>
                  </div>
                  <div className="flex items-center me-4">
                    <div className="relative flex items-center">
                      <Input
                        id="Unmarried"
                        type="radio"
                        value="Unmarried"
                        onChange={handleChange}
                        checked={data.maritalHistoryStatus === "Unmarried"}
                        name="maritalHistoryStatus"
                        containerClass="hidden!"
                      />
                      <label
                        htmlFor="Unmarried"
                        className={`w-5 h-5 flex items-center justify-center rounded-full border-2 border-black cursor-pointer ${
                          data.maritalHistoryStatus === "Unmarried"
                            ? "border-[#586B3A]!"
                            : "border-[#586B3A]"
                        }`}
                      >
                        {data.maritalHistoryStatus === "Unmarried" && (
                          <div className="w-3 h-3 rounded-full bg-[#586B3A]"></div>
                        )}
                      </label>
                    </div>

                    <label htmlFor="Unmarried" className="ms-2 text-sm font-medium">
                      Unmarried
                    </label>
                  </div>
                  <Input
                    disabled={state.currentStatus === "Discharged"}
                    labelClassName="text-black!"
                    className={`rounded-lg! font-bold placeholder:font-normal w-60! 
                     
                    `}
                    placeholder="Enter"
                    value={data.spouseDetails}
                    name="spouseDetails"
                    onChange={(e) => {
                      handleChange(e);
                    }}
                  />
                </div>
                <hr className="my-6" />

                <p className=" mb-4 text-sm font-semibold">Religious History</p>
                <RichTextEditor
                  placeholder="Start typing..."
                  disable={state.currentStatus === "Discharged"}
                  maxLength={5000}
                  value={data.religiousHistory || ""}
                  onChange={handleChangeQuill}
                  name="religiousHistory"
                  label="Add Details below"
                />
                <hr className="my-6" />
              </DropDown>
              {/* Substance Use */}
              <DropDown
                heading="Substance Use History "
                button={
                  <RBACGuard resource={RESOURCES.CASE_HISTORY} action="write">
                    <Button
                      onClick={() => {
                        handleAddSubstanceUseHistory();
                      }}
                      variant="outlined"
                      type="submit"
                      className="rounded-xl! text-xs! bg-[#ECF3CA] font-semibold py-[7px]! px-[15px]! text-black border-0!"
                    >
                      Add 1 more
                    </Button>
                  </RBACGuard>
                }
              >
                {Array.isArray(data.substanceUseHistory) &&
                  data.substanceUseHistory.map((value, index: number) => (
                    <div key={index} className="">
                      <div className="grid py-4 lg:grid-cols-5  grid-cols-2 gap-y-4  gap-x-[52px]">
                        <Input
                          disabled={state.currentStatus === "Discharged"}
                          placeholder="Enter"
                          labelClassName="text-black!"
                          label="Age at First Use"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          value={value.ageAtFirstUse}
                          onChange={(e) => {
                            handleUpdateSubstanceUseHistory(index, e);
                          }}
                          name="ageAtFirstUse"
                        />

                        <Input
                          disabled={state.currentStatus === "Discharged"}
                          placeholder="Enter"
                          labelClassName="text-black!"
                          label="Substance used"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          value={value.substanceUsed}
                          onChange={(e) => {
                            handleUpdateSubstanceUseHistory(index, e);
                          }}
                          name="substanceUsed"
                        />
                        <Input
                          placeholder="Enter"
                          labelClassName="text-black!"
                          disabled={state.currentStatus === "Discharged"}
                          label="Duration"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          value={value.duration}
                          onChange={(e) => {
                            handleUpdateSubstanceUseHistory(index, e);
                          }}
                          name="duration"
                        />
                        <Input
                          placeholder="Enter"
                          disabled={state.currentStatus === "Discharged"}
                          labelClassName="text-black!"
                          label="Abstinence period and reason"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          value={value.abstinencePeriodAndReason}
                          onChange={(e) => {
                            handleUpdateSubstanceUseHistory(index, e);
                          }}
                          name="abstinencePeriodAndReason"
                        />
                        <Input
                          placeholder="Enter"
                          disabled={state.currentStatus === "Discharged"}
                          labelClassName="text-black!"
                          label="Relapses and Reason"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          value={value.relapsesAndReason}
                          onChange={(e) => {
                            handleUpdateSubstanceUseHistory(index, e);
                          }}
                          name="relapsesAndReason"
                        />
                        <Input
                          placeholder="Enter"
                          labelClassName="text-black!"
                          label="Average Dose"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          disabled={state.currentStatus === "Discharged"}
                          value={value.averageDose}
                          onChange={(e) => {
                            handleUpdateSubstanceUseHistory(index, e);
                          }}
                          name="averageDose"
                        />
                        <Input
                          placeholder="Enter"
                          labelClassName="text-black!"
                          label="Maximum Dose"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          disabled={state.currentStatus === "Discharged"}
                          value={value.maximumDose}
                          onChange={(e) => {
                            handleUpdateSubstanceUseHistory(index, e);
                          }}
                          name="maximumDose"
                        />
                        <Input
                          placeholder="Enter"
                          labelClassName="text-black!"
                          disabled={state.currentStatus === "Discharged"}
                          label="Last Intake"
                          className="rounded-lg! font-bold placeholder:font-normal"
                          value={value.lastIntake}
                          onChange={(e) => {
                            handleUpdateSubstanceUseHistory(index, e);
                          }}
                          name="lastIntake"
                        />
                        {index > 0 && (
                          <div className="col-start-5 align-bottom items-end  flex h-full justify-end">
                            <RBACGuard resource={RESOURCES.CASE_HISTORY} action="write">
                              <Button
                                variant="contained"
                                onClick={() => toggleModalDeleteSubstance(index)}
                                className="w-fit!  text-xs bg-red-800! h-10!"
                              >
                                Remove
                              </Button>
                            </RBACGuard>
                          </div>
                        )}
                      </div>

                      <hr />
                    </div>
                  ))}
              </DropDown>

              {/* Premorbid Personality */}
              <DropDown heading="Premorbid Personality">
                <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    containerClass="col-span-2"
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Social Relations with family/ friends/ colleagues"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.socialRelationsWitFamilyOrFriendsOrColleagues}
                    disabled={state.currentStatus === "Discharged"}
                    onChange={handleChange}
                    name="socialRelationsWitFamilyOrFriendsOrColleagues"
                  />
                  <Input
                    label="Hobbies/ Interests"
                    labelClassName="text-black!"
                    placeholder="Enter"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.hobbiesOrInterests}
                    disabled={state.currentStatus === "Discharged"}
                    onChange={handleChange}
                    name="hobbiesOrInterests"
                  />
                  <Input
                    label="Personality Traits"
                    labelClassName="text-black!"
                    placeholder="Enter"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.personalityTraits}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="personalityTraits"
                  />
                  <Input
                    label="Mood"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.mood}
                    onChange={handleChange}
                    name="mood"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    containerClass="col-span-2"
                    labelClassName="text-black!"
                    label="Character/ Attitude to work or responsibility"
                    className="rounded-lg! col-span-2 font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.characterOrAttitudeToWorkOrResponsibility}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="characterOrAttitudeToWorkOrResponsibility"
                  />
                  <Input
                    label="Habits"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    containerClass="col-span-2"
                    placeholder="Enter"
                    value={data.habits}
                    onChange={handleChange}
                    name="habits"
                    disabled={state.currentStatus === "Discharged"}
                  />
                </div>
              </DropDown>

              {/* Mental Status Examination */}
              <DropDown heading="Mental Status Examination">
                <p className=" mb-6 text-sm font-semibold">General Appearance & Behavior</p>
                <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Kempt and tidy"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.kemptAndTidy}
                    onChange={handleChange}
                    name="kemptAndTidy"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Withdrawn"
                    labelClassName="text-black!"
                    placeholder="Enter"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.withdrawn}
                    onChange={handleChange}
                    name="withdrawn"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Looking at one’s age"
                    labelClassName="text-black!"
                    placeholder="Enter"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.lookingAtOneAge}
                    onChange={handleChange}
                    name="lookingAtOneAge"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Overfriendly"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.overfriendly}
                    onChange={handleChange}
                    name="overfriendly"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    labelClassName="text-black!"
                    label="Dress appropriate"
                    className="rounded-lg! col-span-2 font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.dressAppropriate}
                    onChange={handleChange}
                    name="dressAppropriate"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Suspicious"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.suspicious}
                    onChange={handleChange}
                    name="suspicious"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Eye contact"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.eyeContact}
                    onChange={handleChange}
                    name="eyeContact"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Posture"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.posture}
                    onChange={handleChange}
                    name="posture"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Cooperative"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.cooperative}
                    onChange={handleChange}
                    name="cooperative"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Grimaces"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.grimaces}
                    onChange={handleChange}
                    name="grimaces"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Help seeking"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.helpSeeking}
                    onChange={handleChange}
                    name="helpSeeking"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Guarded"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal "
                    placeholder="Enter"
                    value={data.guarded}
                    onChange={handleChange}
                    name="guarded"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Ingratiated"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.ingratiated}
                    onChange={handleChange}
                    name="ingratiated"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Hostile"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.hostile}
                    onChange={handleChange}
                    name="hostile"
                    disabled={state.currentStatus === "Discharged"}
                    placeholder="Enter"
                  />
                  <Input
                    label="Submissive"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.submissive}
                    onChange={handleChange}
                    name="submissive"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    label="Psychomotor Activity"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.psychomotorActivity}
                    onChange={handleChange}
                    name="psychomotorActivity"
                    placeholder="Enter"
                    disabled={state.currentStatus === "Discharged"}
                  />
                </div>
                <hr className="my-6" />
                <p className="mb-6 text-sm font-semibold">Speech</p>
                <div className="grid  lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Rate"
                    value={data.rate}
                    onChange={handleChange}
                    name="rate"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Goal Directed"
                    value={data.goalDirected}
                    onChange={handleChange}
                    name="goalDirected"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Volume"
                    value={data.volume}
                    onChange={handleChange}
                    name="volume"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Spontaneous"
                    value={data.spontaneous}
                    onChange={handleChange}
                    name="spontaneous"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Pitch/Tone"
                    value={data.pitchOrTone}
                    onChange={handleChange}
                    name="pitchOrTone"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Coherent"
                    value={data.coherent}
                    onChange={handleChange}
                    name="coherent"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Reaction time"
                    value={data.reactionTime}
                    onChange={handleChange}
                    name="reactionTime"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Relevant"
                    value={data.relevant}
                    onChange={handleChange}
                    name="relevant"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                </div>

                <hr className="my-6" />
                <p className="mb-6 text-sm font-semibold">Affect</p>
                <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Objective"
                    value={data.objective}
                    onChange={handleChange}
                    name="objective"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Subjective"
                    value={data.subjective}
                    onChange={handleChange}
                    name="subjective"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Affect"
                    value={data.affect}
                    onChange={handleChange}
                    name="affect"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Range"
                    value={data.range}
                    onChange={handleChange}
                    name="range"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Reactivity"
                    value={data.reactivity}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="reactivity"
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                </div>

                <hr className="my-6" />
                <p className="mb-6 text-sm font-semibold">Thought</p>
                <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Stream (productivity)"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.stream}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="stream"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Form (Progression)"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.form}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="form"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Content (Product)"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.content}
                    disabled={state.currentStatus === "Discharged"}
                    onChange={handleChange}
                    name="content"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Possession (Control)"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.possession}
                    onChange={handleChange}
                    name="possession"
                  />
                </div>

                <hr className="my-6" />
                <p className="mb-6 text-sm font-semibold">Perception</p>
                <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Hallucination"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    value={data.hallucination}
                    onChange={handleChange}
                    name="hallucination"
                    disabled={state.currentStatus === "Discharged"}
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Sample(Hallucination)"
                    value={data.hallucinationSample}
                    onChange={handleChange}
                    name="hallucinationSample"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Illusion"
                    value={data.illusion}
                    disabled={state.currentStatus === "Discharged"}
                    onChange={handleChange}
                    name="illusion"
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                  <Input
                    placeholder="Enter"
                    labelClassName="text-black!"
                    label="Sample(Illusion)"
                    value={data.illusionSample}
                    onChange={handleChange}
                    name="illusionSample"
                    disabled={state.currentStatus === "Discharged"}
                    className="rounded-lg! font-bold placeholder:font-normal"
                  />
                </div>
                <hr className="my-6" />
                <div className="grid lg:grid-cols-5 grid-cols-2 mb-6 lg:items-end gap-x-[62px] gap-y-8">
                  <div className="lg:col-span-3 col-span-2">
                    <p className="mb-6 text-sm font-semibold">Higher Cognitive Functions</p>
                    <p className="mb-6 text-[13px] font-semibold">Orientation</p>
                    <div className="grid lg:grid-cols-3 grid-cols-2 gap-y-4  gap-x-[52px]">
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Time"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.time}
                        onChange={handleChange}
                        name="time"
                        disabled={state.currentStatus === "Discharged"}
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Place"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.place}
                        onChange={handleChange}
                        name="place"
                        disabled={state.currentStatus === "Discharged"}
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Person"
                        value={data.person}
                        onChange={handleChange}
                        name="person"
                        disabled={state.currentStatus === "Discharged"}
                        className="rounded-lg! font-bold placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <p className="mb-6 text-[13px] font-semibold">Attention – concentration</p>
                    <div className="grid lg:grid-cols-2 grid-cols-2 gap-y-4  gap-x-[52px]">
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black! font-medium!"
                        label="Digit span test"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.digitSpanTest}
                        onChange={handleChange}
                        disabled={state.currentStatus === "Discharged"}
                        name="digitSpanTest"
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Serial subtraction test"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.serialSubtractionTest}
                        onChange={handleChange}
                        disabled={state.currentStatus === "Discharged"}
                        name="serialSubtractionTest"
                      />
                    </div>
                  </div>

                  <div className="col-span-3">
                    <p className="mb-6 text-[13px] font-semibold">Memory</p>
                    <div className="grid lg:grid-cols-3 grid-cols-2 gap-y-4  gap-x-[52px]">
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Immediate"
                        disabled={state.currentStatus === "Discharged"}
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.immediate}
                        onChange={handleChange}
                        name="immediate"
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Recent"
                        disabled={state.currentStatus === "Discharged"}
                        value={data.recent}
                        onChange={handleChange}
                        name="recent"
                        className="rounded-lg! font-bold placeholder:font-normal"
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Remote"
                        value={data.remote}
                        onChange={handleChange}
                        name="remote"
                        disabled={state.currentStatus === "Discharged"}
                        className="rounded-lg! font-bold placeholder:font-normal"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="mb-6 text-[13px] font-semibold">General intelligence</p>
                    <div className="grid lg:grid-cols-3 grid-cols-2 gap-y-4  gap-x-[52px] items-start justify-start">
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="General fund of knowledge"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.generalFundOfKnowledge}
                        onChange={handleChange}
                        disabled={state.currentStatus === "Discharged"}
                        name="generalFundOfKnowledge"
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Arithmetic"
                        value={data.arithmetic}
                        onChange={handleChange}
                        name="arithmetic"
                        disabled={state.currentStatus === "Discharged"}
                        className="rounded-lg! font-bold placeholder:font-normal"
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Comprehension"
                        value={data.comprehesion}
                        onChange={handleChange}
                        name="comprehesion"
                        disabled={state.currentStatus === "Discharged"}
                        className="rounded-lg! font-bold placeholder:font-normal"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="mb-6 text-[13px] font-semibold">Abstract thinking</p>
                    <div className="grid grid-cols-2  gap-y-4  gap-x-[52px]">
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Similarities/ dissimilarities"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.similaritiesOrDissimilarities}
                        onChange={handleChange}
                        disabled={state.currentStatus === "Discharged"}
                        name="similaritiesOrDissimilarities"
                      />

                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Proverbs"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.proverbs}
                        disabled={state.currentStatus === "Discharged"}
                        onChange={handleChange}
                        name="proverbs"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <p className="mb-6 text-[13px] font-semibold">Judgement</p>
                    <div className="grid lg:grid-cols-3 grid-cols-2 gap-y-4  gap-x-[52px] items-start justify-start">
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Personal"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.personal}
                        onChange={handleChange}
                        name="personal"
                        disabled={state.currentStatus === "Discharged"}
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Social"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.social}
                        onChange={handleChange}
                        name="social"
                        disabled={state.currentStatus === "Discharged"}
                      />
                      <Input
                        placeholder="Enter"
                        labelClassName="text-black!"
                        label="Test"
                        className="rounded-lg! font-bold placeholder:font-normal"
                        value={data.test}
                        disabled={state.currentStatus === "Discharged"}
                        onChange={handleChange}
                        name="test"
                      />
                    </div>
                  </div>
                </div>
              </DropDown>

              {/* Insight */}
              <DropDown heading="Insight">
                <div className="grid grid-cols-5  gap-[23px] mb-7">
                  <Select
                    containerClass="col-span-1"
                    label="Insight Grade"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data?.insightGrade || { label: "Select", value: "" }}
                    options={insightDropdown}
                    onChange={(name, value) => {
                      handleSelect(name, value);
                    }}
                    disable={state.currentStatus === "Discharged"}
                    name="insightGrade"
                  />
                  <Input
                    label="Insight"
                    containerClass="col-span-4"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    disabled={state.currentStatus === "Discharged" || !data?.insightGrade?.value}
                    value={data.insight}
                    onChange={handleChange}
                    name="insight"
                  />
                </div>
              </DropDown>
              {/* TODO:Insight Part is Pending Though */}
              <DropDown heading="Patient Diagnosis">
                <RichTextEditor
                  placeholder="Start typing..."
                  maxLength={5000}
                  value={data.diagnosticFormulation || ""}
                  onChange={handleChangeQuill}
                  disable={state.currentStatus === "Discharged"}
                  name="diagnosticFormulation"
                  label="Diagnostic Formulation"
                />
                <div className="grid grid-cols-2 gap-[77px] mt-7">
                  <Input
                    label="Provisional Diagnosis"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.provisionalDiagnosis}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="provisionalDiagnosis"
                  />
                  <Input
                    label="Differential Diagnosis"
                    labelClassName="text-black!"
                    className="rounded-lg! font-bold placeholder:font-normal"
                    placeholder="Enter"
                    value={data.differentialDiagnosis}
                    onChange={handleChange}
                    disabled={state.currentStatus === "Discharged"}
                    name="differentialDiagnosis"
                  />
                </div>
                <div className="grid lg:grid-cols-3 gap-x-[26px] gap-y-[39px] mt-6">
                  <RichTextEditor
                    placeholder="Start typing..."
                    maxLength={5000}
                    value={data.targetSymptoms || ""}
                    onChange={handleChangeQuill}
                    name="targetSymptoms"
                    disable={state.currentStatus === "Discharged"}
                    label="Target Symptoms"
                  />
                  <RichTextEditor
                    placeholder="Start typing..."
                    maxLength={5000}
                    value={data.pharmacologicalPlan || ""}
                    onChange={handleChangeQuill}
                    name="pharmacologicalPlan"
                    disable={state.currentStatus === "Discharged"}
                    label="Pharmacological Plan"
                  />
                  <RichTextEditor
                    placeholder="Start typing..."
                    maxLength={5000}
                    value={data.nonPharmacologicalPlan || ""}
                    onChange={handleChangeQuill}
                    name="nonPharmacologicalPlan"
                    disable={state.currentStatus === "Discharged"}
                    label="Non-Pharmacological Plan"
                  />
                  <RichTextEditor
                    placeholder="Start typing..."
                    maxLength={5000}
                    value={data.reviewsRequired || ""}
                    onChange={handleChangeQuill}
                    name="reviewsRequired"
                    disable={state.currentStatus === "Discharged"}
                    label="Reviews Required"
                  />
                  <RichTextEditor
                    placeholder="Start typing..."
                    maxLength={5000}
                    value={data.psychologicalAssessments || ""}
                    onChange={handleChangeQuill}
                    disable={state.currentStatus === "Discharged"}
                    name="psychologicalAssessments"
                    label="Psychological Assessments"
                  />
                  <RichTextEditor
                    placeholder="Start typing..."
                    maxLength={5000}
                    disable={state.currentStatus === "Discharged"}
                    value={data.investigations || ""}
                    onChange={handleChangeQuill}
                    name="investigations"
                    label="Investigations"
                  />
                </div>
              </DropDown>
            </div>
          </div>
        </div>

        {previousHistoryArray.length > 0 &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          previousHistoryArray.map((value: any, index: number) => {
            return (
              <div key={index}>
                <div id="DropDown" className=" rounded-xl ">
                  <div
                    className="flex w-full mb-2 bg-white items-center px-6 py-4 cursor-pointer justify-between"
                    role="button"
                  >
                    <p className="text-sm font-semibold">
                      Version History{" "}
                      <span className="ml-5">
                        {new Date(value.createdAt).toISOString().replace("T", " ").slice(0, 19)}
                      </span>
                      {/* {subheading && <span className="ml-1 font-medium opacity-90">{subheading}</span>} */}
                    </p>

                    <div className="flex gap-x-4 items-center">
                      <RBACGuard resource={RESOURCES.CASE_HISTORY} action="write">
                        <RiDeleteBin6Line
                          onClick={() => {
                            // handleDeleteHistoryFunction(value.originalId, value._id);
                            deleteHistoryConfirmModalFunction(value.originalId, value._id);
                          }}
                          className={` h-4 w-4 transition-transform text-red-400`}
                        />
                      </RBACGuard>
                      {previousHistoryLoader && historyToDisplay.has(value._id) ? (
                        historyToDisplay.has(value._id) && <Loader size="sm" />
                      ) : (
                        <IoIosArrowDown
                          onClick={() => {
                            handleOnClickToshowPreviousHistory(index, value._id);
                          }}
                          className={`text-black h-4 w-4 transition-transform ${
                            historyToDisplay.has(value._id) ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </div>
                  {!previousHistoryLoader && (
                    <div
                      className={` transition-all duration-200 ${
                        historyToDisplay.has(value._id)
                          ? "max-h-full opacity-100"
                          : "max-h-0 opacity-0 overflow-hidden"
                      }`}
                    >
                      <DropDown heading="Patient Details">
                        <div className="grid lg:grid-cols-3 grid-cols-1 gap-[60px]">
                          <div className="grid lg:grid-cols-5 grid-cols-3 lg:col-span-3 items-center col-span-1 gap-10">
                            <div className="flex mb-3 gap-2 col-span-2   items-center py-4 ">
                              <div
                                className={`flex rounded-full  border-2 ${
                                  state.gender == "Male"
                                    ? "border-[#00685F]"
                                    : state.gender == "Female"
                                    ? "border-[#F14E9A]"
                                    : "border-gray-500"
                                }   overflow-hidden w-16 h-16 items-center justify-center`}
                              >
                                <div className="flex rounded-full w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                                  {state?.patientPicUrl ? (
                                    <img
                                      src={state?.patientPicUrl}
                                      alt="profile"
                                      className="w-full h-full"
                                    />
                                  ) : (
                                    <div className="flex rounded-full p-1 w-full h-full bg-[#C1D1A8] border border-[white]  overflow-hidden  items-center justify-center">
                                      <div className="w-full uppercase text-[13px] font-semibold text-center">
                                        {state?.firstName?.slice(0, 1)}
                                        {state?.lastName?.slice(0, 1)}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center justify-start">
                                  <h2
                                    title={state.firstName + " " + state.lastName}
                                    className="text-[13px] font-semibold text-left text-wrap"
                                  >
                                    {state.firstName &&
                                      capitalizeFirstLetter(
                                        state.firstName?.length > 15
                                          ? state.firstName?.slice(0, 15) + "..."
                                          : state.firstName
                                      )}{" "}
                                    {state.lastName
                                      ? capitalizeFirstLetter(
                                          state.lastName.length > 15
                                            ? state.lastName.slice(0, 15) + "..."
                                            : state.lastName
                                        )
                                      : ""}
                                  </h2>
                                  {state.currentStatus && (
                                    <div
                                      className={`${
                                        state.currentStatus == "Inpatient"
                                          ? "text-[#3A913D] bg-[#E4FFEE]"
                                          : "bg-gray-200"
                                      } w-fit rounded-[5px] ml-2 gap-1 text-xs font-semibold px-[5px] py-[3px] flex items-center`}
                                    >
                                      {state.currentStatus !== "Discharged" && (
                                        <div
                                          className={`  ${
                                            state.currentStatus == "Inpatient"
                                              ? "bg-[#3A913D]"
                                              : "bg-black"
                                          } w-1 h-1 bg-black" rounded-full`}
                                        ></div>
                                      )}
                                      <p>{state.currentStatus}</p>
                                    </div>
                                  )}
                                </div>
                                <div className="text-xs ">
                                  <span>Admission Date:</span>
                                  <span className="font-semibold ml-1 text-black">
                                    {formatDate(state.admissionDate)}
                                  </span>
                                  <div className="flex gap-3">
                                    <p className="text-xs">
                                      UHID:
                                      <span className="font-semibold ml-1 text-nowrap whitespace-nowrap text-black">
                                        {formatId(state.UHID)}
                                      </span>
                                    </p>
                                    <p className="text-xs ">
                                      Gender:
                                      <span className="font-semibold ml-1 text-nowrap whitespace-nowrap text-black">
                                        {state.gender}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <InputBox
                              label="Educational Qualification"
                              value={
                                state?.education ? capitalizeFirstLetter(state.education) : "--"
                              }
                            />
                            <InputBox
                              label="Occupation"
                              value={
                                state?.occupation ? capitalizeFirstLetter(state.occupation) : "--"
                              }
                            />
                            <div className="flex gap-[10px]  items-start justify-start flex-col">
                              <label className="font-medium text-xs">Marital Status</label>
                              <div className="flex gap-5 items-center justify-center mb-3">
                                <div className="flex items-center me-4">
                                  <div className="relative flex items-center">
                                    <label
                                      htmlFor="married"
                                      className={`w-5 h-5 flex items-center justify-center rounded-full border-2  cursor-pointer ${
                                        state.ismarried === true
                                          ? " border-gray-300!"
                                          : "border-gray-300!"
                                      }`}
                                    >
                                      {state.ismarried === true && (
                                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                      )}
                                    </label>
                                  </div>

                                  <label
                                    htmlFor="ismarried"
                                    className="ms-2 cursor-not-allowed text-sm font-medium"
                                  >
                                    Yes
                                  </label>
                                </div>
                                <div className="flex items-center cursor-not-allowed">
                                  <div className="relative flex cursor-not-allowed items-center">
                                    <label
                                      htmlFor="unMarried"
                                      className={`w-5 h-5 flex cursor-not-allowed items-center justify-center rounded-full border-2 border-black  ${
                                        state.ismarried === false
                                          ? " border-gray-300!"
                                          : "border-gray-300!"
                                      }`}
                                    >
                                      {state.ismarried === false && (
                                        <div className="w-3 h-3 cursor-not-allowed rounded-full bg-gray-300"></div>
                                      )}
                                    </label>
                                  </div>

                                  <label
                                    htmlFor="ismarried"
                                    className="ms-2 cursor-not-allowed text-sm font-medium"
                                  >
                                    No
                                  </label>
                                </div>
                              </div>
                            </div>
                            <InputBox
                              label="Religion"
                              value={state?.religion ? capitalizeFirstLetter(state.religion) : "--"}
                            />
                            <InputBox
                              label="Father’s Name"
                              value={historyData?.fatherName || "--"}
                            />
                            <InputBox
                              label="Mother’s Name"
                              value={historyData?.motherName || "--"}
                            />
                            <InputBox label="Nationality" value={state.country || "--"} />
                            <InputBox
                              label="Personal Income"
                              value={patientUpdate.personalIncome || "--"}
                            />
                            <InputBox label="Family Income" value={state?.familyIncome} />
                            <div className="flex flex-col gap-2 text-xs col-span-2">
                              <InputBox
                                label="Address"
                                value={capitalizeFirstLetter(state?.address)}
                              />
                            </div>
                            <InputBox
                              label="Type of Admission"
                              value={state?.involuntaryAdmissionType}
                            />

                            <InputBox
                              label="Nominated representative"
                              value={capitalizeFirstLetter(
                                familyDetails.find((data) =>
                                  data.infoType?.includes("Nominated Representative")
                                )?.name || "--"
                              )}
                            />
                            <InputBox
                              label="Identification mark"
                              value={capitalizeFirstLetter(state.identificationMark)}
                            />
                            <div className="flex gap-[2px]  items-start flex-col col-span-2">
                              <label className="font-medium text-xs">Advance directive</label>
                              <div className="flex gap-5 items-center justify-center">
                                <div className="flex items-center me-4">
                                  <div className="relative flex items-center">
                                    <Input
                                      id="Male"
                                      type="radio"
                                      value="Male"
                                      checked={historyData.isAdvanceDirectiveSelected === true}
                                      name="isAdvanceDirectiveSelected"
                                      containerClass="w-full absolute opacity-0"
                                    />
                                    <label
                                      htmlFor="yes"
                                      className="w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer  !border-gray-300"
                                    >
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          historyData.isAdvanceDirectiveSelected === true
                                            ? "bg-gray-300"
                                            : ""
                                        }`}
                                      ></div>
                                    </label>
                                  </div>
                                  <label htmlFor="yes" className="ms-2 text-sm font-medium">
                                    Yes
                                  </label>
                                </div>
                                <div className="flex items-center me-4">
                                  <div className="relative flex items-center">
                                    <Input
                                      id="Male"
                                      type="radio"
                                      value="Male"
                                      // onChange={() => {
                                      //   setData((prev) => ({
                                      //     ...prev,
                                      //     isAdvanceDirectiveSelected: false
                                      //   }));
                                      // }}
                                      checked={historyData.isAdvanceDirectiveSelected === false}
                                      name="isAdvanceDirectiveSelected"
                                      containerClass="w-full absolute opacity-0"
                                    />
                                    <label
                                      htmlFor="no"
                                      className="w-5 h-5 flex items-center justify-center rounded-full border-2 cursor-pointer  !border-gray-300"
                                    >
                                      <div
                                        className={`w-3 h-3 rounded-full ${
                                          historyData.isAdvanceDirectiveSelected === false
                                            ? "bg-gray-300"
                                            : ""
                                        }`}
                                      ></div>
                                    </label>
                                  </div>
                                  <label htmlFor="no" className="ms-2 text-sm font-medium">
                                    no
                                  </label>
                                </div>
                                <Input
                                  labelClassName="text-black!"
                                  className={`rounded-lg! py-1! font-bold placeholder:font-normal 
                      ${
                        historyData.isAdvanceDirectiveSelected == true ? "opacity-100" : "opacity-0"
                      }
                    `}
                                  placeholder="Enter"
                                  value={historyData.advanceDirective}
                                  name="advanceDirective"
                                  // onChange={(e) => {
                                  //   handleChange(e);
                                  // }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="lg:col-span-2 col-span-1">
                            <p className="text-sm font-semibold">Patient accompained by</p>
                            <div className="grid grid-cols-3 gap-10 mt-4">
                              <InputBox
                                label="Name"
                                value={capitalizeFirstLetter(
                                  familyDetails.find((data) =>
                                    data.infoType?.includes("Nominated Representative")
                                  )?.name || "--"
                                )}
                              />
                              <InputBox
                                label="Age"
                                value={
                                  familyDetails.find((data) =>
                                    data.infoType?.includes("Nominated Representative")
                                  )?.age || "--"
                                }
                              />
                              <InputBox
                                label="Relationship"
                                value={
                                  familyDetails.find((data) =>
                                    data.infoType?.includes("Nominated Representative")
                                  )?.relationshipId?.shortName || "--"
                                }
                              />
                            </div>
                          </div>

                          <div className="col-span-1">
                            <p className="text-sm font-semibold">Reference</p>
                            <div className="grid grid-cols-2 gap-10 mt-4">
                              <InputBox
                                label="Referral Type"
                                value={state.referredTypeId || "--"}
                              />
                              <InputBox
                                label="Referral Details"
                                value={capitalizeFirstLetter(state.referralDetails)}
                              />
                            </div>
                          </div>
                        </div>
                      </DropDown>

                      {/* Informants Details */}

                      <DropDown heading="Informants Details">
                        {(historyData.informantsDetails ?? []).map((value, index: number) => {
                          return (
                            <div className="flex items-start justify-between pr-10">
                              <div>
                                <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4 items-center justify-center  gap-x-[52px]">
                                  <Input
                                    disabled={true}
                                    label="Name"
                                    labelClassName="text-black!"
                                    className="rounded-lg! font-bold placeholder:font-normal"
                                    placeholder="Enter"
                                    value={value.name}
                                    name="name"
                                    // onChange={(e) => {
                                    //   handleUpdateInformants(index, e);
                                    // }}
                                  />
                                  <Select
                                    disable
                                    label="Relationship with Patient"
                                    // labelClassName="text-black!"
                                    className="rounded-lg! font-bold placeholder:font-normal"
                                    // placeholder="Enter"
                                    options={relationshipDropdown}
                                    value={{
                                      label: value?.relationshipWithPatient.label,
                                      value: value?.relationshipWithPatient.label
                                    }}
                                    name="relationshipWithPatient"
                                  />
                                  <Input
                                    disabled={true}
                                    label="Reliability & Adequacy"
                                    labelClassName="text-black!"
                                    className="rounded-lg! font-bold placeholder:font-normal"
                                    placeholder="Enter"
                                    value={value.reliabilityAndAdequacy}
                                    name="reliabilityAndAdequacy"
                                  />

                                  <Input
                                    disabled={true}
                                    label="Known to patient"
                                    labelClassName="text-black!"
                                    className="rounded-lg! font-bold placeholder:font-normal"
                                    placeholder="Enter"
                                    name="knownToPatient"
                                    value={value.knownToPatient}
                                    // onChange={(e) => {
                                    //   handleUpdateInformants(index, e);
                                    // }}
                                  />
                                </div>
                                {(historyData.informantsDetails?.length ?? 0) - 1 !== index && (
                                  <hr className="my-6" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </DropDown>

                      {/* Chief complaints */}
                      <DropDown
                        heading="Chief complaints"
                        subheading="(In Chronological Order with Duration)"
                      >
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.chiefComplaints || ""}
                          // onChange={handleChangeQuill}
                          name="chiefComplaints"
                        />
                      </DropDown>

                      {/* History of Present Illness */}
                      <DropDown heading="Illness Specifiers">
                        <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Select
                            disable
                            label="Onset"
                            options={[
                              { label: "Select", value: "" },
                              { label: "Abrupt", value: "Abrupt" },
                              { label: "Acute", value: "Acute" },
                              { label: "Subacute", value: "Subacute" },
                              { label: "Insidious", value: "Insidious" },
                              { label: "Unknown", value: "Unknown" }
                            ]}
                            value={historyData?.onset || { label: "Select", value: "" }}
                            name="onset"
                            // onChange={handleSelect}
                          />
                          {historyData.onset && historyData.onset?.value == "Other" && (
                            <Input
                              disabled
                              label="Onset Other Detail"
                              labelClassName="text-black!"
                              className="rounded-lg! font-bold placeholder:font-normal"
                              placeholder="Enter"
                              name="onsetOther"
                              value={historyData?.onsetOther}
                            />
                          )}

                          <Select
                            disable
                            label="Course"
                            options={[
                              { label: "Select", value: "" },
                              { label: "Continuous", value: "Continuous" },
                              { label: "Episodic", value: "Episodic" },
                              { label: "Fluctuating", value: "Fluctuating" },
                              { label: "Other", value: "Other" }
                            ]}
                            value={historyData?.course || { label: "Select", value: "" }}
                            name="course"
                            // onChange={(name, data) => {
                            //   handleSelect(name, data);
                            // }}
                          />

                          {historyData.course && historyData.course?.value == "Other" && (
                            <Input
                              disabled
                              label="Course Dther Detail"
                              labelClassName="text-black!"
                              className="rounded-lg! font-bold placeholder:font-normal"
                              placeholder="Enter"
                              name="courseOther"
                              value={historyData?.courseOther}
                            />
                          )}

                          <Select
                            disable
                            label="Progress"
                            options={[
                              { label: "Select", value: "" },
                              { label: "Deteriorating", value: "Deteriorating" },
                              { label: "Static", value: "Static" },
                              { label: "Improving", value: "Improving" }
                            ]}
                            value={data?.progress || { label: "Select", value: "" }}
                            name="progress"
                            // onChange={(name, data) => {
                            //   handleSelect(name, data);
                            // }}
                          />

                          <Input
                            disabled={true}
                            label="Total Duration of Illness"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            name="totalDurationOfIllness"
                            value={data?.totalDurationOfIllness}
                            // onChange={handleChange}
                          />

                          <Input
                            disabled={true}
                            label="Duration (This Episode)"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            name="durationThisEpisode"
                            value={historyData.durationThisEpisode}
                            // onChange={handleChange}
                          />
                          <Input
                            disabled={true}
                            label="Perpetuating"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            name="perpetuating"
                            value={historyData.perpetuating}
                            // onChange={handleChange}
                          />
                          <Input
                            disabled={true}
                            label="Predisposing"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            name="predisposing"
                            value={historyData.predisposing}
                            // onChange={handleChange}
                          />
                          <Input
                            disabled={true}
                            label="Precipitating Factors"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            name="precipitatingFactors"
                            value={historyData.precipitatingFactors}
                            // onChange={handleChange}
                          />
                          {/* <Multiselected
                            label="Impact of Present Illness"
                            options={[
                              // { label: "Select", value: "" },
                              { label: "Interpersonal", value: "Interpersonal" },
                              { label: "Legal", value: "Legal" },
                              { label: "Medical", value: "Medical" },
                              { label: "Professional", value: "Professional" },
                              { label: "Social", value: "Social" },
                              { label: "Others", value: "Others" }
                            ]}
                            value={data?.impactOfPresentIllness}
                            disable
                            placeholder="Select"
                          /> */}
                          <Select
                            disable
                            label="Impact of Present Illness"
                            options={[
                              { label: "Select", value: "" },
                              { label: "Interpersonal", value: "Interpersonal" },
                              { label: "Legal", value: "Legal" },
                              { label: "Medical", value: "Medical" },
                              { label: "Social", value: "Social" },
                              { label: "Others", value: "Others" }
                            ]}
                            value={data?.impactOfPresentIllness || { label: "Select", value: "" }}
                            name="impactOfPresentIllness"
                          />
                        </div>

                        <hr className="my-6" />
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          // onChange={handleChangeQuill}
                          value={historyData.historyOfPresentIllness || ""}
                          name="historyOfPresentIllness"
                          label="History Of Present Illness (HOPI)"
                        />
                        <hr className="my-6" />
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.negativeHistory || ""}
                          // onChange={handleChangeQuill}
                          name="negativeHistory"
                          label="Negative History"
                        />
                        <hr className="my-6" />

                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.pastPsychiatricHistory || ""}
                          // onChange={handleChangeQuill}
                          name="pastPsychiatricHistory"
                          label="Past Psychiatric History"
                        />
                        <hr className="my-6" />
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.pastPsychiatricTreatmentHistory || ""}
                          // onChange={handleChangeQuill}
                          name="pastPsychiatricTreatmentHistory"
                          label="Past Psychiatric Treatment History"
                        />
                        <hr className="my-6" />
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.pastMedicalHistory || ""}
                          // onChange={handleChangeQuill}
                          name="pastMedicalHistory"
                          label="Past Medical History (If any)"
                        />
                      </DropDown>

                      {/* Family History */}
                      <DropDown heading="Family History">
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.historyofPsychiatricIllness || ""}
                          // onChange={handleChangeQuill}
                          name="historyofPsychiatricIllness"
                          label="History of Psychiatric Illness with Genogram"
                        />
                        <hr className="my-6" />
                        <div className="flex items-start flex-col">
                          <p className=" mb-2 ml-5 text-sm font-semibold">Upload Genogram</p>
                          <CheckBox
                            checked={true}
                            name=""
                            handleDeletes={() => {}}
                            handleDrop={(files) => {
                              return;
                              handleDropFiles(files);
                            }}
                            accept=".pdf,image/jpeg,image/png"
                            files={[]}
                            disable
                            filesString={
                              historyData.file && !(historyData.file instanceof File)
                                ? [
                                    {
                                      filePath:
                                        typeof historyData.file === "string"
                                          ? historyData.file
                                          : "",
                                      fileUrl:
                                        typeof historyData.file === "string"
                                          ? historyData.file
                                          : "",
                                      fileName: historyData.fileName || ""
                                    }
                                  ]
                                : undefined
                            }
                            ContainerClass=""
                            checkHide
                            label={"Upload Genogram"}
                            handleCheck={function (_e: SyntheticEvent): void {
                              throw new Error("Function not implemented.");
                            }}
                          />
                        </div>
                      </DropDown>

                      {/* Personal History */}
                      <DropDown heading="Personal History">
                        <p className=" mb-6 text-sm font-semibold">Birth and Childhood history</p>
                        <div className="grid mb-6 lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Prenatal"
                            value={historyData.prenatal}
                            // onChange={handleChange}
                            name="prenatal"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            label="Natal"
                            labelClassName="text-black!"
                            placeholder="Enter"
                            value={historyData.natal}
                            // onChange={handleChange}
                            name="natal"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            label="Postnatal"
                            labelClassName="text-black!"
                            placeholder="Enter"
                            value={historyData.postnatal}
                            // onChange={handleChange}
                            name="postnatal"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            label="Developmental Milestone"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.developmentalMilestone}
                            // onChange={handleChange}
                            name="developmentalMilestone"
                            placeholder="Enter"
                          />
                          <Input
                            disabled={true}
                            labelClassName="text-black!"
                            label="Immunization status"
                            className="rounded-lg! col-span-2 font-bold placeholder:font-normal"
                            value={historyData.immunizationStatus}
                            // onChange={handleChange}
                            name="immunizationStatus"
                            placeholder="Enter"
                          />
                        </div>
                        {/* <RichTextEditor disable={true} placeholder="Start typing..." maxLength={5000} value={""} name="note" /> */}
                        <hr className="my-6" />
                        <p className=" mb-4 text-sm font-semibold">Educational History</p>
                        {/* <div className="grid mb-6 lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Achievements"
                            value={historyData.achievements}
                            // onChange={handleChange}
                            name="achievements"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            containerClass="col-span-2"
                          />
                        </div> */}
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.complaintsAtSchool || ""}
                          // onChange={handleChangeQuill}
                          name="complaintsAtSchool"
                          label="Complaints at School"
                        />
                        <hr className="my-6" />

                        <p className=" mb-4 text-sm font-semibold">Occupational History</p>
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.occupationalHistory || ""}
                          // onChange={handleChangeQuill}
                          name="occupationalHistory"
                        />

                        <hr className="my-6" />

                        <p className=" mb-4 text-sm font-semibold">Sexual History</p>
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.sexualHistory || ""}
                          // onChange={handleChangeQuill}
                          name="sexualHistory"
                          label="Add Details below (Rule out High-Risk Behavior)"
                        />

                        <hr className="my-6" />
                        <p className=" mb-4 text-sm font-semibold">Menstrual History</p>
                        <div className="grid mb-6 lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Age at Menarche"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.ageAtMenarche}
                            // onChange={handleChange}
                            name="ageAtMenarche"
                          />

                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Regularity"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.regularity}
                            // onChange={handleChange}
                            name="regularity"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="No of days of menses"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.noOfDaysOfMenses}
                            // onChange={handleChange}
                            name="noOfDaysOfMenses"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Last Menstrual Period (Day1)"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.lastMenstrualPeriod}
                            // onChange={handleChange}
                            name="lastMenstrualPeriod"
                          />
                        </div>
                        <hr className="my-6" />
                        <p className=" mb-4 text-sm font-semibold">Marital History</p>
                        <div className="flex gap-5 items-center ">
                          <div className="flex items-center me-4">
                            <div className="relative flex items-center">
                              <label
                                htmlFor="Married"
                                className={`w-5 h-5 flex items-center justify-center rounded-full border-2  cursor-pointer ${
                                  historyData.maritalHistoryStatus === "Married"
                                    ? " border-gray-300!"
                                    : "border-gray-300!"
                                }`}
                              >
                                {historyData.maritalHistoryStatus === "Married" && (
                                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                                )}
                              </label>
                            </div>

                            <label
                              htmlFor="Married"
                              className="ms-2 cursor-not-allowed text-sm font-medium"
                            >
                              Married
                            </label>
                          </div>
                          <div className="flex items-center cursor-not-allowed">
                            <div className="relative flex cursor-not-allowed items-center">
                              <label
                                htmlFor="Unmarried"
                                className={`w-5 h-5 flex cursor-not-allowed items-center justify-center rounded-full border-2 border-black  ${
                                  historyData.maritalHistoryStatus === "Unmarried"
                                    ? " border-gray-300!"
                                    : "border-gray-300!"
                                }`}
                              >
                                {historyData.maritalHistoryStatus === "Unmarried" && (
                                  <div className="w-3 h-3 cursor-not-allowed rounded-full bg-gray-300"></div>
                                )}
                              </label>
                            </div>

                            <label
                              htmlFor="Unmarried"
                              className="ms-2 cursor-not-allowed text-sm font-medium"
                            >
                              Unmarried
                            </label>
                          </div>
                          <Input
                            labelClassName="text-black!"
                            className={`rounded-lg! font-bold placeholder:font-normal w-60! 
                     
                    `}
                            placeholder="Enter"
                            value={historyData.spouseDetails}
                            name="spouseDetails"
                            onChange={(e) => {
                              handleChange(e);
                            }}
                          />
                        </div>
                        <hr className="my-6" />

                        <p className=" mb-4 text-sm font-semibold">Religious History</p>
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.religiousHistory || ""}
                          // onChange={handleChangeQuill}
                          name="religiousHistory"
                          label="Add Details below"
                        />
                        <hr className="my-6" />
                      </DropDown>
                      <DropDown heading="Substance Use History">
                        {Array.isArray(historyData.substanceUseHistory) &&
                          historyData.substanceUseHistory.map((value, index: number) => (
                            <div key={index}>
                              <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                                <Input
                                  disabled={true}
                                  placeholder="Enter"
                                  labelClassName="text-black!"
                                  label="Age at First Use"
                                  className="rounded-lg! font-bold placeholder:font-normal"
                                  value={value.ageAtFirstUse}
                                  // onChange={handleChange}
                                  name="ageAtFirstUse"
                                />

                                <Input
                                  disabled={true}
                                  placeholder="Enter"
                                  labelClassName="text-black!"
                                  label="Substance used"
                                  className="rounded-lg! font-bold placeholder:font-normal"
                                  value={value.substanceUsed}
                                  // onChange={handleChange}
                                  name="substanceUsed"
                                />
                                <Input
                                  disabled={true}
                                  placeholder="Enter"
                                  labelClassName="text-black!"
                                  label="Duration"
                                  className="rounded-lg! font-bold placeholder:font-normal"
                                  value={value.duration}
                                  // onChange={handleChange}
                                  name="duration"
                                />
                                <Input
                                  disabled={true}
                                  placeholder="Enter"
                                  labelClassName="text-black!"
                                  label="Abstinence period and reason"
                                  className="rounded-lg! font-bold placeholder:font-normal"
                                  value={value.abstinencePeriodAndReason}
                                  // onChange={handleChange}
                                  name="abstinencePeriodAndReason"
                                />
                                <Input
                                  disabled={true}
                                  placeholder="Enter"
                                  labelClassName="text-black!"
                                  label="Relapses and Reason"
                                  className="rounded-lg! font-bold placeholder:font-normal"
                                  value={value.relapsesAndReason}
                                  // onChange={handleChange}
                                  name="relapsesAndReason"
                                />
                                <Input
                                  disabled={true}
                                  placeholder="Enter"
                                  labelClassName="text-black!"
                                  label="Average Dose"
                                  className="rounded-lg! font-bold placeholder:font-normal"
                                  value={value.averageDose}
                                  // onChange={handleChange}
                                  name="averageDose"
                                />
                                <Input
                                  disabled={true}
                                  placeholder="Enter"
                                  labelClassName="text-black!"
                                  label="Maximum Dose"
                                  className="rounded-lg! font-bold placeholder:font-normal"
                                  value={value.maximumDose}
                                  // onChange={handleChange}
                                  name="maximumDose"
                                />
                                <Input
                                  disabled={true}
                                  placeholder="Enter"
                                  labelClassName="text-black!"
                                  label="Last Intake"
                                  className="rounded-lg! font-bold placeholder:font-normal"
                                  value={value.lastIntake}
                                  // onChange={handleChange}
                                  name="lastIntake"
                                />
                              </div>
                            </div>
                          ))}
                      </DropDown>
                      {/* Premorbid Personality */}
                      <DropDown heading="Premorbid Personality">
                        <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            containerClass="col-span-2"
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Social Relations with family/ friends/ colleagues"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.socialRelationsWitFamilyOrFriendsOrColleagues}
                            // onChange={handleChange}
                            name="socialRelationsWitFamilyOrFriendsOrColleagues"
                          />
                          <Input
                            disabled={true}
                            label="Hobbies/ Interests"
                            labelClassName="text-black!"
                            placeholder="Enter"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.hobbiesOrInterests}
                            // onChange={handleChange}
                            name="hobbiesOrInterests"
                          />
                          <Input
                            disabled={true}
                            label="Personality Traits"
                            labelClassName="text-black!"
                            placeholder="Enter"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.personalityTraits}
                            // onChange={handleChange}
                            name="personalityTraits"
                          />
                          <Input
                            disabled={true}
                            label="Mood"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.mood}
                            // onChange={handleChange}
                            name="mood"
                          />
                          <Input
                            disabled={true}
                            containerClass="col-span-2"
                            labelClassName="text-black!"
                            label="Character/ Attitude to work or responsibility"
                            className="rounded-lg! col-span-2 font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.characterOrAttitudeToWorkOrResponsibility}
                            // onChange={handleChange}
                            name="characterOrAttitudeToWorkOrResponsibility"
                          />
                          <Input
                            disabled={true}
                            label="Habits"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            containerClass="col-span-2"
                            placeholder="Enter"
                            value={historyData.habits}
                            // onChange={handleChange}
                            name="habits"
                          />
                        </div>
                      </DropDown>

                      {/* Mental Status Examination */}
                      <DropDown heading="Mental Status Examination">
                        <p className=" mb-6 text-sm font-semibold">General Appearance & Behavior</p>
                        <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Kempt and tidy"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.kemptAndTidy}
                            // onChange={handleChange}
                            name="kemptAndTidy"
                          />
                          <Input
                            disabled={true}
                            label="Withdrawn"
                            labelClassName="text-black!"
                            placeholder="Enter"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.withdrawn}
                            // onChange={handleChange}
                            name="withdrawn"
                          />
                          <Input
                            disabled={true}
                            label="Looking at one’s age"
                            labelClassName="text-black!"
                            placeholder="Enter"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.lookingAtOneAge}
                            // onChange={handleChange}
                            name="lookingAtOneAge"
                          />
                          <Input
                            disabled={true}
                            label="Overfriendly"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.overfriendly}
                            // onChange={handleChange}
                            name="overfriendly"
                          />
                          <Input
                            disabled={true}
                            labelClassName="text-black!"
                            label="Dress appropriate"
                            className="rounded-lg! col-span-2 font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.dressAppropriate}
                            // onChange={handleChange}
                            name="dressAppropriate"
                          />
                          <Input
                            disabled={true}
                            label="Suspicious"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.suspicious}
                            // onChange={handleChange}
                            name="suspicious"
                          />
                          <Input
                            disabled={true}
                            label="Eye contact"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.eyeContact}
                            // onChange={handleChange}
                            name="eyeContact"
                          />
                          <Input
                            disabled={true}
                            label="Posture"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.posture}
                            // onChange={handleChange}
                            name="posture"
                          />
                          <Input
                            disabled={true}
                            label="Cooperative"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.cooperative}
                            // onChange={handleChange}
                            name="cooperative"
                          />
                          <Input
                            disabled={true}
                            label="Grimaces"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.grimaces}
                            // onChange={handleChange}
                            name="grimaces"
                          />
                          <Input
                            disabled={true}
                            label="Help seeking"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.helpSeeking}
                            // onChange={handleChange}
                            name="helpSeeking"
                          />
                          <Input
                            disabled={true}
                            label="Guarded"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal "
                            placeholder="Enter"
                            value={historyData.guarded}
                            // onChange={handleChange}
                            name="guarded"
                          />
                          <Input
                            disabled={true}
                            label="Ingratiated"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.ingratiated}
                            // onChange={handleChange}
                            name="ingratiated"
                          />
                          <Input
                            disabled={true}
                            label="Hostile"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.hostile}
                            // onChange={handleChange}
                            name="hostile"
                            placeholder="Enter"
                          />
                          <Input
                            disabled={true}
                            label="Submissive"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.submissive}
                            // onChange={handleChange}
                            name="submissive"
                          />
                          <Input
                            disabled={true}
                            label="Psychomotor Activity"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.psychomotorActivity}
                            // onChange={handleChange}
                            name="psychomotorActivity"
                            placeholder="Enter"
                          />
                        </div>
                        <hr className="my-6" />
                        <p className="mb-6 text-sm font-semibold">Speech</p>
                        <div className="grid  lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Rate"
                            value={historyData.rate}
                            // onChange={handleChange}
                            name="rate"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Goal Directed"
                            value={historyData.goalDirected}
                            // onChange={handleChange}
                            name="goalDirected"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Volume"
                            value={historyData.volume}
                            // onChange={handleChange}
                            name="volume"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Spontaneous"
                            value={historyData.spontaneous}
                            // onChange={handleChange}
                            name="spontaneous"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Pitch/Tone"
                            value={historyData.pitchOrTone}
                            // onChange={handleChange}
                            name="pitchOrTone"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Coherent"
                            value={historyData.coherent}
                            // onChange={handleChange}
                            name="coherent"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Reaction time"
                            value={historyData.reactionTime}
                            // onChange={handleChange}
                            name="reactionTime"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Relevant"
                            value={historyData.relevant}
                            // onChange={handleChange}
                            name="relevant"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                        </div>

                        <hr className="my-6" />
                        <p className="mb-6 text-sm font-semibold">Affect</p>
                        <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Objective"
                            value={historyData.objective}
                            // onChange={handleChange}
                            name="objective"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Subjective"
                            value={historyData.subjective}
                            // onChange={handleChange}
                            name="subjective"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Affect"
                            value={historyData.affect}
                            // onChange={handleChange}
                            name="affect"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Range"
                            value={historyData.range}
                            // onChange={handleChange}
                            name="range"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Reactivity"
                            value={historyData.reactivity}
                            // onChange={handleChange}
                            name="reactivity"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                        </div>

                        <hr className="my-6" />
                        <p className="mb-6 text-sm font-semibold">Thought</p>
                        <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Stream (productivity)"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.stream}
                            // onChange={handleChange}
                            name="stream"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Form (Progression)"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.form}
                            // onChange={handleChange}
                            name="form"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Content (Product)"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.content}
                            // onChange={handleChange}
                            name="content"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Possession (Control)"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.possession}
                            // onChange={handleChange}
                            name="possession"
                          />
                        </div>

                        <hr className="my-6" />
                        <p className="mb-6 text-sm font-semibold">Perception</p>
                        <div className="grid lg:grid-cols-5 grid-cols-2 gap-y-4  gap-x-[52px]">
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Hallucination"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            value={historyData.hallucination}
                            // onChange={handleChange}
                            name="hallucination"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Sample(Hallucination)"
                            value={historyData.hallucinationSample}
                            // onChange={handleChange}
                            name="hallucinationSample"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Illusion"
                            value={historyData.illusion}
                            // onChange={handleChange}
                            name="illusion"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                          <Input
                            disabled={true}
                            placeholder="Enter"
                            labelClassName="text-black!"
                            label="Sample(Illusion)"
                            value={historyData.illusionSample}
                            // onChange={handleChange}
                            name="illusionSample"
                            className="rounded-lg! font-bold placeholder:font-normal"
                          />
                        </div>
                        <hr className="my-6" />
                        <div className="grid lg:grid-cols-5 grid-cols-2 mb-6 lg:items-end gap-x-[62px] gap-y-8">
                          <div className="lg:col-span-3 col-span-2">
                            <p className="mb-6 text-sm font-semibold">Higher Cognitive Functions</p>
                            <p className="mb-6 text-[13px] font-semibold">Orientation</p>
                            <div className="grid lg:grid-cols-3 grid-cols-2 gap-y-4  gap-x-[52px]">
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Time"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.time}
                                // onChange={handleChange}
                                name="time"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Place"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.place}
                                // onChange={handleChange}
                                name="place"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Person"
                                value={historyData.person}
                                // onChange={handleChange}
                                name="person"
                                className="rounded-lg! font-bold placeholder:font-normal"
                              />
                            </div>
                          </div>

                          <div className="col-span-2">
                            <p className="mb-6 text-[13px] font-semibold">
                              Attention – concentration
                            </p>
                            <div className="grid lg:grid-cols-2 grid-cols-2 gap-y-4  gap-x-[52px]">
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black! font-medium!"
                                label="Digit span test"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.digitSpanTest}
                                // onChange={handleChange}
                                name="digitSpanTest"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Serial subtraction test"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.serialSubtractionTest}
                                // onChange={handleChange}
                                name="serialSubtractionTest"
                              />
                            </div>
                          </div>

                          <div className="col-span-3">
                            <p className="mb-6 text-[13px] font-semibold">Memory</p>
                            <div className="grid lg:grid-cols-3 grid-cols-2 gap-y-4  gap-x-[52px]">
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Immediate"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.immediate}
                                // onChange={handleChange}
                                name="immediate"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Recent"
                                value={historyData.recent}
                                // onChange={handleChange}
                                name="recent"
                                className="rounded-lg! font-bold placeholder:font-normal"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Remote"
                                value={historyData.remote}
                                // onChange={handleChange}
                                name="remote"
                                className="rounded-lg! font-bold placeholder:font-normal"
                              />
                            </div>
                          </div>
                          <div className="col-span-3">
                            <p className="mb-6 text-[13px] font-semibold">General intelligence</p>
                            <div className="grid lg:grid-cols-3 grid-cols-2 gap-y-4  gap-x-[52px] items-start justify-start">
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="General fund of knowledge"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.generalFundOfKnowledge}
                                // onChange={handleChange}
                                name="generalFundOfKnowledge"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Arithmetic"
                                value={historyData.arithmetic}
                                // onChange={handleChange}
                                name="arithmetic"
                                className="rounded-lg! font-bold placeholder:font-normal"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Comprehension"
                                value={historyData.comprehesion}
                                // onChange={handleChange}
                                name="comprehesion"
                                className="rounded-lg! font-bold placeholder:font-normal"
                              />
                            </div>
                          </div>
                          <div className="col-span-2">
                            <p className="mb-6 text-[13px] font-semibold">Abstract thinking</p>
                            <div className="grid grid-cols-2  gap-y-4  gap-x-[52px]">
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Similarities/ dissimilarities"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.similaritiesOrDissimilarities}
                                // onChange={handleChange}
                                name="similaritiesOrDissimilarities"
                              />

                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Proverbs"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.proverbs}
                                // onChange={handleChange}
                                name="proverbs"
                              />
                            </div>
                          </div>
                          <div className="col-span-3">
                            <p className="mb-6 text-[13px] font-semibold">Judgement</p>
                            <div className="grid lg:grid-cols-3 grid-cols-2 gap-y-4  gap-x-[52px] items-start justify-start">
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Personal"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.personal}
                                // onChange={handleChange}
                                name="personal"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Social"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.social}
                                // onChange={handleChange}
                                name="social"
                              />
                              <Input
                                disabled={true}
                                placeholder="Enter"
                                labelClassName="text-black!"
                                label="Test"
                                className="rounded-lg! font-bold placeholder:font-normal"
                                value={historyData.test}
                                // onChange={handleChange}
                                name="test"
                              />
                            </div>
                          </div>
                        </div>
                      </DropDown>

                      {/* Insight */}
                      <DropDown heading="Insight">
                        <div className="grid grid-cols-5  gap-[23px] mb-7">
                          <Select
                            disable
                            containerClass="col-span-1"
                            label="Insight Grade"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={data?.insightGrade || { label: "Select", value: "" }}
                            options={insightDropdown}
                            // onChange={(name, value) => {
                            //   handleSelect(name, value);
                            // }}
                            name="insightGrade"
                          />
                          <Input
                            disabled={true}
                            label="Insight"
                            containerClass="col-span-4"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.insight}
                            // onChange={handleChange}
                            name="insight"
                          />
                        </div>
                      </DropDown>
                      {/* TODO:Insight Part is Pending Though */}
                      <DropDown heading="Patient Diagnosis">
                        <RichTextEditor
                          disable={true}
                          placeholder="Start typing..."
                          maxLength={5000}
                          value={historyData.diagnosticFormulation || ""}
                          // onChange={handleChangeQuill}
                          name="diagnosticFormulation"
                          label="Diagnostic Formulation"
                        />
                        <div className="grid grid-cols-2 gap-[77px] mt-7">
                          <Input
                            disabled={true}
                            label="Provisional Diagnosis"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.provisionalDiagnosis}
                            // onChange={handleChange}
                            name="provisionalDiagnosis"
                          />
                          <Input
                            disabled={true}
                            label="Differential Diagnosis"
                            labelClassName="text-black!"
                            className="rounded-lg! font-bold placeholder:font-normal"
                            placeholder="Enter"
                            value={historyData.differentialDiagnosis}
                            // onChange={handleChange}
                            name="differentialDiagnosis"
                          />
                        </div>
                        <div className="grid lg:grid-cols-3 gap-x-[26px] gap-y-[39px] mt-6">
                          <RichTextEditor
                            disable={true}
                            placeholder="Start typing..."
                            maxLength={5000}
                            value={historyData.targetSymptoms || ""}
                            // onChange={handleChangeQuill}
                            name="targetSymptoms"
                            label="Target Symptoms"
                          />
                          <RichTextEditor
                            disable={true}
                            placeholder="Start typing..."
                            maxLength={5000}
                            value={historyData.pharmacologicalPlan || ""}
                            // onChange={handleChangeQuill}
                            name="pharmacologicalPlan"
                            label="Pharmacological Plan"
                          />
                          <RichTextEditor
                            disable={true}
                            placeholder="Start typing..."
                            maxLength={5000}
                            value={historyData.nonPharmacologicalPlan || ""}
                            // onChange={handleChangeQuill}
                            name="nonPharmacologicalPlan"
                            label="Non-Pharmacological Plan"
                          />
                          <RichTextEditor
                            disable={true}
                            placeholder="Start typing..."
                            maxLength={5000}
                            value={historyData.reviewsRequired || ""}
                            // onChange={handleChangeQuill}
                            name="reviewsRequired"
                            label="Reviews Required"
                          />
                          <RichTextEditor
                            disable={true}
                            placeholder="Start typing..."
                            maxLength={5000}
                            value={historyData.psychologicalAssessments || ""}
                            // onChange={handleChangeQuill}
                            name="psychologicalAssessments"
                            label="Psychological Assessments"
                          />
                          <RichTextEditor
                            disable={true}
                            placeholder="Start typing..."
                            maxLength={5000}
                            value={historyData.investigations || ""}
                            // onChange={handleChangeQuill}
                            name="investigations"
                            label="Investigations"
                          />
                        </div>
                      </DropDown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        <DeleteConfirm
          toggleModal={() => {
            toggleModal();
          }}
          isModalOpen={dropDownState.isDeleteModalOpen}
          confirmDeleteNote={() => {
            handleDeleteHistoryFunction(
              dropDownState.caseHistoryId,
              dropDownState.caseHistoryRevisionId
            );
          }}
        />

        <DiscardModal
          resource={RESOURCES.CASE_HISTORY}
          action="write"
          handleClickSaveAndContinue={(_e: SyntheticEvent) =>
            handleSave(_e, "SAVE_AND_NEXT_DISCARD")
          }
        />
        <DeleteConfirm
          toggleModal={toggleModalDelete}
          isModalOpen={deleteModal.isModal}
          confirmDeleteNote={handleRemove}
        />
        <DeleteConfirm
          toggleModal={toggleModalDeleteSubstance}
          isModalOpen={deleteModalSubstance.isModal}
          confirmDeleteNote={handleRemoveSubstanceUseHistory}
        />
      </div>
      <div className="flex w-full items-center justify-center  pb-10">
        <ScrollToTop />
      </div>
    </div>
  );
};
export default CaseHistory;
