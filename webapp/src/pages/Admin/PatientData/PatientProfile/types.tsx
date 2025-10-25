export interface IinjuriesDetails {
  injuryName?: string;
  fileUrls?: { filePath: string; fileUrl: string; fileName?: string }[];
}

export interface IpatientReport {
  injuriesDetails?: IinjuriesDetails[];
  allergiesNames?: [{ name: string }];
  allergiesFiles?: { filePath: string; fileUrl: string; fileName?: string }[];
  diabeticStatus?: string;
  levelOfRisk?: string;
  levelOfRiskDescription?: string;
  previousTreatmentRecord?: { filePath: string; fileUrl: string; fileName?: string }[];
  hyperTension?: string;
  heartDisease?: string;
  heartDiseaseDescription?: string;
}
export interface IPatientState {
  firstName: string;
  lastName: string;
  UHID: string;
  currentStatus: string;
  admissionDate: string;
  patientPicUrl: string;

  dateOfBirth: string;
  age: string;
  email: string;
  mobileNo: string;
  illnessType: string;
  alternateMobileNo: string;
  gender: string;
  identificationMark: string;
  country: string;
  address: string;
  area: string;
  refferalType: string;
  referralDetails: string;
  involuntaryAdmissionType: string;
  involuntary: string;
  admissionId: string;

  education: string;
  familyIncome: string;
  religion: string;
  language: string;
  married: string;
  numberOfChildren: string;
  occupation: string;

  center: string;
  roomType: string;
  room: string;
  lockerNo: string;
  belongingsInLocker: string;
  assignedDoctor: string;
  assignedTherapist: string;
  nurse: string;
  careStaff: string;

  applicationForAdmission: { filePath: string; fileUrl: string; fileName?: string }[];
  voluntaryAdmissionForm: { filePath: string; fileUrl: string; fileName?: string }[];
  inVoluntaryAdmissionForm: { filePath: string; fileUrl: string; fileName?: string }[];
  minorAdmissionForm: { filePath: string; fileUrl: string; fileName?: string }[];
  form90: { filePath: string; fileUrl: string; fileName?: string }[];
  familyDeclaration: { filePath: string; fileUrl: string; fileName?: string }[];
  section94: { filePath: string; fileUrl: string; fileName?: string }[];
  capacityAssessment: { filePath: string; fileUrl: string; fileName?: string }[];
  hospitalGuidelineForm: { filePath: string; fileUrl: string; fileName?: string }[];
  finacialCounselling: { filePath: string; fileUrl: string; fileName?: string }[];
  orientationOfFamily: string;
  orientationOfPatient: string;
  insuredFile: { filePath: string; fileUrl: string; fileName?: string }[];
  insuredDetail: string;
  isInsured: string;
  patientReport: IpatientReport;
}
