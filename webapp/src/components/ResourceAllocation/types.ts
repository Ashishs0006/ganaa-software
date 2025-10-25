import { ISelectOption } from "@/components/Select/types";

export interface ResourceAllocationState {
  centerId: ISelectOption;
  roomTypeId: ISelectOption;
  roomNumberId: ISelectOption;
  lockerNumberId: ISelectOption;
  belongingsInLocker: string;
  assignedDoctorId: ISelectOption;
  assignedTherapistId: ISelectOption;
  nurse: string;
  careStaff: string;
}
export interface IState {
  loading: boolean;
  init: boolean;
}
