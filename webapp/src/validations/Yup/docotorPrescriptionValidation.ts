import * as Yup from "yup";

const medicineDropdownValueSchema = Yup.object({
  value: Yup.string().required("Medicine is required")
}).required("Medicine is required");

export const docotorPrescriptionValidation = Yup.object().shape({
  medicine: medicineDropdownValueSchema
});
