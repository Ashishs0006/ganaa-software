import { ISelectOption } from "@/components/Select/types";

export interface LeadState {
  illnessType:ISelectOption;
  referralTypeId: ISelectOption;
  referralDetails: string;
  isNewLead?:boolean;
  leadSelect: string;
  leadType: string;
  leadDate: string;
  leadTime: string;
  progressStatus: ISelectOption;

  firstName: string;
  lastName: string;
  dob: string;
  age: number;
  email: string;
  phoneNumber: string;
  phoneNumberCountryCode: ISelectOption;
  alternativephoneNumberCountryCode: ISelectOption;
  alternativeMobileNumber: string;
  gender: string;
  guardianName: string;
  guardianNameRelationshipId: ISelectOption;

  country: ISelectOption;
  fullAddress: string;
  // state: string;
  chiefComplaints: string;
  admissionType: string;
  involuntaryAdmissionType: ISelectOption;
  centerId: ISelectOption;
  firstPersonContactedAtGanaa: string;
  assignedTo: ISelectOption;
  nextFollowUpDate: string;
  centerVisitDateTime: string;
}
