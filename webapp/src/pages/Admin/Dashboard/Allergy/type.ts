export interface IMedicineArray {
  _id: string;
  name: string;
  genericName: string;
  dosage: string[];
}
export interface IState {
  displayAddAllergy: boolean;
  displayAddMedicineDosage: string | null;
  displayExistingMedicineDosage: string | null;
  allergyId?: string;
  medicineId?: string;
  index?: number | null;
  isDeleteModal: boolean;
  isDeleteModalNewMedine: boolean;
}
export interface IMedicineToBeAdded {
  name: string;
  genericName: string;
  dosage: string[];
}
export interface IAllergiesToBeAdded {
  name: string;
}
