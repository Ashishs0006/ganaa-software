import * as Yup from "yup";

// Helper to validate dropdowns (objects with a `value` string inside)
const centerDropdownValueSchema = Yup.object({
  value: Yup.string().required("Center is required")
}).required("Center is required");
const roomTypeDropdownValueSchema = Yup.object({
  value: Yup.string().required("Room type is required")
}).required("Room type is required");
const lokerDropdownValueSchema = Yup.object({
  value: Yup.string().required("Locker no. is required")
}).required("Locker no. is required");
const roomNumberDropdownValueSchema = Yup.object({
  value: Yup.string().required("Room no. is required")
}).required("Room no. is required");

export const patientResourceSchema = Yup.object().shape({
  centerId: centerDropdownValueSchema,
  roomTypeId: roomTypeDropdownValueSchema,
  lockerNumberId: lokerDropdownValueSchema,
  roomNumberId: roomNumberDropdownValueSchema,
  belongingsInLocker: Yup.string().required("Belongings In Locker is required")
});
