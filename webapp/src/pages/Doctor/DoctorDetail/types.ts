import { IPagination } from "@/redux/slice/types";
export interface IPatientInfo {
  _id?: string;
  firstName?: string;
  lastName?: string;
  phoneNumberCountryCode?: string;
  phoneNumber?: string;
  gender?: string;
  uhid?: number;
  patientPicUrl?: string;
  dateOfAdmission: string;
  centerName?: string;
  therapistInfo?: {
    firstName?: string;
    lastName?: string;
  };
  doctorInfo?: {
    firstName?: string;
    lastName?: string;
  };
}

export interface INurse {
  patientId?: string;
  patientAdmissionHistoryId?: string;
  noteDateTime?: string;
  bp?: string;
  pulse?: string;
  temperature?: string;
  spo2?: string;
  height?: string;
  weight?: string;
  rbs?: string;
  note?: string;
  createdAt?: Date;
}

export interface INurseNote {
  pagination?: IPagination;
  data?: INurse[];
}

export interface IGroup {
  patientId?: string;
  createdAt?: string;
  activityDateTime?: string;
  activity?: [
    {
      name?: string;
      isSelected?: boolean;
      note?: string;
      createdAt?: Date;
    }
  ];
}

export interface IGroupActivity {
  pagination: IPagination;
  data?: IGroup[];
  status?: string;
}
