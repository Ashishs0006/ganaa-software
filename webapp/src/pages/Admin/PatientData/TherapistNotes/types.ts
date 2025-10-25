import { ModalState } from "@/components/Header/types";

interface IPermission {
  resource: string;
  actions: string[];
}

interface IRoles {
  _id?: string;
  name?: string;
  permissions?: IPermission[];
}
export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  roleId: IRoles;
}

export interface ITherapistState {
  totalPages: string | number;
  firstName: string;
  lastName: string;
  UHID: string;
  age: string;
  gender: string;
  patientProfilePic: string;
  assignedTherapist: string;
  patientAdmissionHistoryId: string;
  dateOfAdmission: string;
  patientId: string;
  therapistName: string;
  isTodayNoteExist: boolean;
}

export interface ITherapistNote {
  _id: string;
  createdAt: string;
  note: string;
  sessionType: string;
  score: string;
  subSessionType: string;
  file: { fileName: string; filePath: string };
  noteDateTime: string;
  therapistId: IUser;
}

export interface ITherapistNoteState {
  id: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  therapistId: string;
  sessionType: string[];
  score: string;
  subSessionType: string[];
  note: string;
  file: File | null | string;
  fileName: string;
  noteDate: string;
  noteTime: string;
}

export interface ITherapistDropDownsState {
  displayAddForm: boolean;
  displaySessionTypeDropdown: boolean;
  isModalOpen: ModalState;
  displayDropdown: boolean;
  openMenuId: string | null;
}
