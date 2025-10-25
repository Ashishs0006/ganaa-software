import { ISelectOption } from "@/components/Select/types";

interface IPermission {
  resource: string;
  actions: string[];
}

interface IRoles {
  _id?: string;
  name?: string;
  permissions?: IPermission[];
}

export interface IPatient {
  _id: string;
  firstName: string;
  lastName: string;
  patientPicUrl: string;
  dob: string;
  age: number;
  gender: string;
  phoneNumberCountryCode: string;
  phoneNumber: string;
  uhid: number;

  patientHistory: {
    _id: string;
    dischargeId: string;
    currentStatus: string;
    patientReport: {
      previousTreatmentRecord: { filePath: string; fileUrl: string }[];
    };
    dateOfAdmission: string;
    resourceAllocation: {
      centerId: {
        centerName: string;
      };
      assignedDoctorId: {
        _id: string;
        roleId: IRoles;
        firstName: string;
        lastName: string;
        gender: string;
      };
      roomTypeId: {
        _id: string;
        name: string;
        centerId: string;
        createdAt: string;
      };
      roomNumberId: {
        _id: string;
        name: string;
        roomTypeId: string;
        totalBeds: string;
      };
    };
  };
  status: string;
}
export interface Iadmission {
  _id: string;
  currentStatus: string;
  dateOfDischarge: string;
  dateOfAdmission: string;
}

export interface IexistingPatient extends IPatient {
  admissionHistory: Iadmission[];
  currentStatus: string;
}
export interface IDischargeState {
  pid: string;
  aid: string;
  date: string;
  status: ISelectOption;
  reason: string;
  conditionAtTheTimeOfDischarge: ISelectOption;
  shouldSendfeedbackNotification: boolean;
}

export interface IState {
  openMenuId: string | null;
  loading: boolean;
  loadingSearch?: boolean;
  toggleDischargeModal: boolean;
}
