import * as Yup from "yup";

const stausdropdownValueSchema = Yup.object({
  value: Yup.string().required("Discharge Status is required")
}).required("Discharge Status is required");

const dropdownValueSchema = Yup.object({
  value: Yup.string().required("Condition at Discharge is required")
}).required("Condition at Discharge is required");

export const DischargeValidation = Yup.object().shape({
  date: Yup.string().required("Date of Discharge is required"),
  reason: Yup.string().required("Reason of Discharge is required"),
  status: stausdropdownValueSchema,
  conditionAtTheTimeOfDischarge: dropdownValueSchema
});
