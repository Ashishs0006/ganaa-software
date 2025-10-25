import * as Yup from "yup";

const phoneNumberRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LeadValidation = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  age: Yup.number()
    .required("Age is required")
    .moreThan(0, "Age must be greater than 0")
    .max(120, "Age must be less than or equal to 120"),
  email: Yup.string()
    .nullable()
    .test("is-valid-email", "A valid email address is required", (value) => {
      if (!value) return true; // No error if empty
      return emailRegex.test(value); // Validate only if there's a value
    }),
  phoneNumber: Yup.string()
    .trim()
    .required("Mobile no. is required")
    .when("phoneNumberCountryCode", ([code], schema) =>
      code?.value === "+91" ? schema.matches(phoneNumberRegex, "Invalid Phone number") : schema
    ),
  phoneNumberCountryCode: Yup.object({
    label: Yup.string().required(),
    value: Yup.string().required()
  }).required(),
  gender: Yup.string().trim().required("Gender is required"),
  // centerId: dropdownValueSchema
});
