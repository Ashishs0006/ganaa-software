import { ISelectOption } from "@/components/Select/types";

export interface ProfileContactsState {
  loading: boolean;
  education: string;
  placeOfStay: "Urban" | "Rural" | "";
  familyIncome: string;
  religion: string;
  language: string;
  isMarried: boolean | null;
  numberOfChildren: ISelectOption;
  occupation: string;
}

type IInfoType = string;
export interface IFamilyData {
  tempId?: string;
  _id?: string;
  patientId?: string;
  relationship: ISelectOption;
  relationshipId?: { fullName: string; shortName: string; _id: string };
  name: string;
  phoneNumberCountryCode: ISelectOption;
  phoneNumber: string;
  age: string;
  address: string;
  idProffType: ISelectOption;
  idProffNumber: string;
  infoType: IInfoType[];
  file: File | string | null;
  idProofUrl?: string | null;
  button?: boolean;
}
