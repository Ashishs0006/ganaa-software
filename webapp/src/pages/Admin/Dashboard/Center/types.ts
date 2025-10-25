export interface IState {
  center: {
    label: string;
    value: string;
  };
  roomtypes: any[]; // Replace `any` with a specific type if available
  roomNumbers: any[]; // Replace `any` with a specific type if available
  roomNumberMenuId: string | null;
  roomNumberInput: string;
  isModal: boolean;
  isRoomTypeModal: boolean;
  openMenuId: string | null;
  displayAddLockerInput: boolean;
  isDeleteModal: boolean;
}
export interface ICenterData {
  centerName: string;
  googleMapLink: string;
}
export interface ICenterData {
  centerName: string;
  googleMapLink: string;
}
