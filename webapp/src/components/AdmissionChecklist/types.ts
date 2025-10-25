export interface AdmissionChecklistState {
  loading: boolean;
  init: boolean;
  orientationOfFamily?: boolean | string;
  orientationOfPatient?: boolean | string;
  isInsured?: boolean | string;
  insuredDetail?: string;
  insuredFile?: null | File | string[];
}

export interface IisAdmissionChecklist {
  isapplicationForAdmission: boolean;
  isvoluntaryAdmissionForm: boolean;
  isinVoluntaryAdmissionForm: boolean;
  isminorAdmissionForm: boolean;
  isform90: boolean;
  isfamilyDeclaration: boolean;
  issection94: boolean;
  iscapacityAssessment: boolean;
  ishospitalGuidelineForm: boolean;
  isfinacialCounselling: boolean;
  isadmissionAssessment: boolean;
}

export interface IAdmissionChecklistArray {
  voluntaryAdmissionForm: string[];
  applicationForAdmission: string[];
  inVoluntaryAdmissionForm: string[];
  minorAdmissionForm: string[];
  form90: string[];
  familyDeclaration: string[];
  section94: string[];
  capacityAssessment: string[];
  hospitalGuidelineForm: string[];
  finacialCounselling: string[];
  admissionAssessment: string[];
  insuredFile: string[];
}

export interface IAdmissionChecklistLink {
  voluntaryAdmissionFormLink: { filePath: string; fileUrl: string; fileName?: string }[];
  applicationForAdmissionLink: { filePath: string; fileUrl: string; fileName?: string }[];
  inVoluntaryAdmissionFormLink: { filePath: string; fileUrl: string; fileName?: string }[];
  minorAdmissionFormLink: { filePath: string; fileUrl: string; fileName?: string }[];
  form90Link: { filePath: string; fileUrl: string; fileName?: string }[];
  familyDeclarationLink: { filePath: string; fileUrl: string; fileName?: string }[];
  section94Link: { filePath: string; fileUrl: string; fileName?: string }[];
  capacityAssessmentLink: { filePath: string; fileUrl: string; fileName?: string }[];
  hospitalGuidelineFormLink: { filePath: string; fileUrl: string; fileName?: string }[];
  finacialCounsellingLink: { filePath: string; fileUrl: string; fileName?: string }[];
  insuredFileLink: { filePath: string; fileUrl: string; fileName?: string }[];
  admissionAssessmentLink: { filePath: string; fileUrl: string; fileName?: string }[];
}
