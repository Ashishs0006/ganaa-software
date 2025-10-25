import { ISelectOption } from "../Select/types";

export interface  MedicalSummaryState {
  loading: boolean;
  isModalOpen: boolean;
  diagnosis: ISelectOption;
}
interface IInjuryDetails {
  injuryName: string;
  files: ({ filePath: string; fileUrl: string,fileName?:string } | File)[];
}
export interface IData {
  injuryDetails: IInjuryDetails[];
  diabeticStatus: string;
  allergyArray: ISelectOption[];
  allergiesFiles: File[];
  allergiesFilesLink:  { filePath: string; fileUrl: string,fileName?:string }[];
  allergy?: ISelectOption;
  heartDisease: string;
  heartDiseaseDescription: string;
  levelOfRiskDescription: string;
  levelOfRisk: string;
  hyperTension: string;
  previousTreatmentRecord: [];
  previousTreatmentRecordLink:  { filePath: string; fileUrl: string,fileName?:string }[];
  injuries?: string[];
}

export interface IVitals {
  bp?: string;
  pulse?: string;
  temperature?: string;
  spo2?: string;
  weight?: string;
  note?: string;
}
