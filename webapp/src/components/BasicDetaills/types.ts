import { ISelectOption } from "@/components/Select/types";

export interface BasicDetailsState {
  showModal: boolean;
  croppedImage: string;
  idProof: (string | File)[];
  loading: boolean;
  firstName: string;
  lastName: string;
  dob: string;
  age: number;
  email: string;
  phoneNumberCountryCode: ISelectOption;
  phoneNumber: string;
  alternativephoneNumberCountryCode: ISelectOption;
  alternativeMobileNumber: string;
  gender: "Male" | "Female" | "Other" | "";
  identificationMark: string;
  country: ISelectOption;
  fullAddress: string;
  area: string;
  patientPic: File | null | string;

  dateOfAdmission: string;
  time: string;

  referredTypeId: ISelectOption;
  referralDetails: string;

  admissionType: "Voluntary" | "Involuntary" | "";
  involuntaryAdmissionType: ISelectOption;
}
