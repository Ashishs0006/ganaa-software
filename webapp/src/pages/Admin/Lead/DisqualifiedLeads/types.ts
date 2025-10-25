export interface IDisQualifiedLead {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumberCountryCode: string;
  phoneNumber: string;
  progressStatus: string;
  leadDateTime: string;
  centerId: { centerName: string };
  centerVisitDateTime: string;
  nextFollowUpDate: string;
  assignedTo: { firstName: string; lastName: string };
  referralTypeId: { name: string };
}
export interface IState {
  openMenuId: boolean;
  id: string;
  loading: boolean;
  toggleDischargeModal: boolean;
}
