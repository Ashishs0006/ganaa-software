import { ModalState } from "@/components/Header/types";
import { ISelectOption } from "@/components/Select/types";
import { IUser } from "@/pages/Admin/PatientData/TherapistNotes/types";
export interface IDoctorState {
  popId: number | null | string;
  popId1?: number | null | string;
  DateRangeModal: boolean;
  dateOfAdmission: string;
  totalPages: string | number;
  firstName: string;
  lastName: string;
  age?: string;
  UHID: string;
  gender: string;
  patientProfilePic: string;
  assignedDoctor: string;
  patientAdmissionHistoryId: string;
  patientId: string;
  doctorName: string;
  isTodayNoteExist?: boolean;
}
export interface IDoctorNote {
  _id: string;
  createdAt: string;
  note: string;
  sessionType: string;
  noteDateTime: string;
  doctorId: IUser;
}
export interface IDoctorNoteState {
  id: string;
  patientId: string;
  sessionType: string[];

  patientAdmissionHistoryId: string;
  doctorId: string;
  note: string;
  noteDate: string;
  noteTime: string;
}

export interface IDoctorDropDownsState {
  displayAddForm: boolean;
  isModalOpen: ModalState;
  displayDropdown: boolean;
  displaySessionTypeDropdown: boolean;
}

export interface IDoctorPrescrition {
  createdAt: string;
  patientId: string;
  _id: string;
  patientAdmissionHistoryId: string;
  noteDateTime: string;
  doctorId: { firstName: string; _id: string; lastName: string };
  medicinesInfo: [
    {
      customDuration: string;
      medicine: {
        createdAt: string;
        dosage: string[];
        genericName: string;
        name: string;
        _id: string;
      };
      durationFrequency: string;
      prescribedWhen: string;
      instructions: string;
      usages: [
        {
          frequency: string;
          quantity: number;
          when: string;
          dosage: string;
        }
      ];
    }
  ];
}

export interface IDoctorPrescritionRivison {
  createdAt: string;
  patientId: string;
  _id: string;
  patientAdmissionHistoryId: string;
  noteDateTime: string;
  doctorId: { firstName: string; _id: string; lastName: string };
  medicinesInfo: [
    {
      customDuration: string;
      medicine: {
        createdAt: string;
        dosage: string[];
        genericName: string;
        name: string;
        _id: string;
      };
      durationFrequency: string;
      prescribedWhen: string;
      instructions: string;
      usages: [
        {
          frequency: string;
          quantity: number;
          when: string;
          dosage: string;
        }
      ];
    }
  ];
}

export interface IFrequency {
  frequency: string;
  quantity: number;
  when: ISelectOption;
  dosage: ISelectOption;
}

export interface IUsages {
  frequency: string;
  quantity: number;
  when: ISelectOption;
  dosage: ISelectOption;
}

export interface IprescriptionState {
  medicine: ISelectOption;
  durationFrequency: ISelectOption;
  customDuration: string;
  prescribedWhen: ISelectOption;
  instructions: string;
  usages: IUsages[];
}
export interface IprescriptionBackend {
  medicine: { _id: string; name: string };
  durationFrequency: string;
  customDuration: string;
  prescribedWhen: string;
  instructions: string;
  usages: IUsages[];
}
