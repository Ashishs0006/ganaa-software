export interface IPatient {
  _id: string;
  firstName: string;
  lastName: string;
  uhid: number | string;
  patientPicUrl: string;
  gender?: string;
  centerId?: ICenter;
}

export interface ITherapist {
  _id: string;
  roleId?: IRole;
  firstName: string;
  lastName: string;
  centerId: ICenter;
}

interface IRole {
  _id: string;
  name: string;
}

interface ICenter {
  _id?: string;
  centerName?: string;
  isDeleted?: boolean;
  createdAt?: string;
}

export interface INote {
  _id: string;
  patientId: string;
  noteDateTime: string;
  therapistId: ITherapist;
  sessionType: string[];
  note: string;
  file?: {
    fileName: string;
    filePath: string;
  };
  createdBy: string;
  createdAt: string;
}

interface ILOA {
  _id: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  loa: boolean;
  createdBy: string;
  createdAt: string;
  noteDateTime: string;
}

export interface IData {
  patients: IPatient[];
  therapists: ITherapist[];
  notes: INote[];
  loa: ILOA[];
}
