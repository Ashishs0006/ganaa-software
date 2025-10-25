export interface IState {
  openMenuId: boolean;
  loading: boolean;
  loadingSearch?:boolean;
  toggleDischargeModal: boolean;
  id: string;
  admitId: string;
}

export interface IComments {
  comment: string;
  createdAt: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePic: string;
  };
  _id: string;
}

export interface ISingleLead {
  _id: string;
  isNewLead?:boolean;
  illnessType?:string;
  status: string;
  firstName: string;
  lastName: string;
  comments: IComments[];
  age?: string;
  phoneNumberCountryCode: string;
  phoneNumber: string;
  progressStatus: string;
  leadDateTime: string;
  centerId: { centerName: string };
  centerVisitDateTime: string;
  nextFollowUpDate: string;
  assignedTo: { firstName: string; lastName: string; profilePic: string };
  referralTypeId: { name: string };
  email: string;
  alternativeMobileNumber: string;
  alternativephoneNumberCountryCode: string;
  leadSelect: string;
  dob: string;
  gender: string;
  guardianName: string;
  guardianNameRelationshipId: { shortName: string };
  country: string;
  referralDetails: string;
  admissionType: string;
  involuntaryAdmissionType: string;
  chiefComplaints: string;
  firstPersonContactedAtGanaa: string;
}
