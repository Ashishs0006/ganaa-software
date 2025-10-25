import { ModalState } from "@/components/Header/types";

export interface INurseNote {
  _id: string;
  bp: string;
  pulse: string;
  temperature: string;
  spo2: string;
  weight: string;
  rbs: string;
  height: string;
  note: string;
  noteDateTime: string;
  createdAt: string;
}
export interface INurseState {
  totalPages: string | number;
  firstName: string;
  lastName: string;
  age?: string;
  patientPic?: string;
  UHID: string;
  patientProfilePic: string;
  patientAdmissionHistoryId: string;
  dateOfAdmission: string;
  patientId: string;
  gender: string;
}

export interface INurseNoteState {
  id: string;
  patientId: string;
  patientAdmissionHistoryId: string;
  bp: string;
  bp1: string;
  bp2: string;
  pulse: string;
  temperature: string;
  spo2: string;
  weight: string;
  height: string;
  rbs: string;
  note: string;
  vitalsDate: string;
  vitalsTime: string;
  noteDateTime?: string;
}

export interface INurseDropDownsState {
  displayAddForm: boolean;
  isModalOpen: ModalState;
  displayViewModal: ModalState;
  openMenuId: string | null;
}
