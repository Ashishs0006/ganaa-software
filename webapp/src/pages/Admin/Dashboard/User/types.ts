export interface IState {
  openMenuId: string | null; // Ensure openMenuId is always a string or null
  loading: boolean;
  toggleAddModal: boolean;
  isResetModal?: boolean;
  showModal: boolean;
  croppedImage: string | null;
  isDeleteModal: boolean;
}

export interface IData {
  _id?: string;
  firstName: string;
  lastName: string;
  dob: string;
  phoneNumberCountryCode: { label: string; value: string };
  phoneNumber: string;
  email: string;
  profilePic?: File | null | string;
  role?: { label: string; value: string };
  gender: string;
  centerId:string[];
}
