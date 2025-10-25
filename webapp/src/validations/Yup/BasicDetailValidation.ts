import * as Yup from "yup";

const phoneNumberRegex = /^[0-9]{10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxSize = 2 * 1024 * 1024;

export const BasicDetailsValidation = Yup.object().shape({
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

  alternativeMobileNumber: Yup.string()
    .trim()
    .notRequired()
    .when("alternativephoneNumberCountryCode", ([code], schema) =>
      code?.value === "+91"
        ? schema.test(
            "valid-alt-number",
            "Invalid alternative Mobile number",
            (val) => !val || phoneNumberRegex.test(val)
          )
        : schema
    ),

  alternativephoneNumberCountryCode: Yup.object({
    label: Yup.string().notRequired(),
    value: Yup.string().notRequired()
  }).notRequired(),

  gender: Yup.string().trim().required("Gender is required"),

  fullAddress: Yup.string().trim().required("Address is required"),

  area: Yup.string().trim().required("Area is required"),
  patientPic: Yup.mixed()
    .test("fileSize", "File size exceeds 2 MB limit.", function (value) {
      if (!value || typeof value === "string") return true;
      return (value as File).size <= maxSize;
    })
    .notRequired(),
  dateOfAdmission: Yup.string().trim().required("Date of Admission is required"),
  time: Yup.string().trim().required("Admission time is required")
});

export const emergencyadmitValidation = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  age: Yup.number()
    .required("Age is required")
    .moreThan(0, "Age must be greater than 0")
    .max(120, "Age must be less than or equal to 120"),

});
