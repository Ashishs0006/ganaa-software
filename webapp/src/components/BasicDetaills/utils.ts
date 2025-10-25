import { createNewpatient, createPatientAdmissionHistory } from "@/apis";
import { BasicDetailsState } from "@/components/BasicDetaills/types";

export const createPateintData = (state: BasicDetailsState) => {
  const formData = new FormData();

  // if (!state.firstName.trim()) throw new Error("First name is required");
  // if (state.age <= 0 || state.age > 120)
  //   throw new Error("Age is required and must be less then 120 and greater then 0");
  // if (state.email && !emailRegex.test(state.email)) {
  //   throw new Error("A valid email address is required");
  // }
  // if (!state.phoneNumber.trim()) throw new Error("Mobile no. is required");
  // if (state.phoneNumberCountryCode.value === "+91" && state.phoneNumber.length != 10) {
  //   throw new Error("invalid Phone number");
  // }
  // if (
  //   state.alternativeMobileNumber.trim() &&
  //   state.alternativephoneNumberCountryCode.value === "+91" &&
  //   state.alternativeMobileNumber.length != 10
  // ) {
  //   throw new Error("invalid alternative Mobile number");
  // }

  // if (!state.gender.trim()) throw new Error("Gender is required");
  // if (!state.fullAddress.trim()) throw new Error("Address is required");
  // if (!state.area.trim()) throw new Error("Area is required");
  // if (
  //   state.patientPic &&
  //   typeof state.patientPic !== "string" &&
  //   state.patientPic?.size > maxSize
  // ) {
  //   throw new Error("File size exceeds 2 MB limit.");
  // }

  if (state.firstName)
    formData.append(
      "firstName",
      state.firstName.charAt(0).toUpperCase() + state.firstName.slice(1)
    );

  if (state.lastName)
    formData.append("lastName", state.lastName.charAt(0).toUpperCase() + state.lastName.slice(1));

  if (state.dob) formData.append("dob", state.dob);

  if (state.age.toString()) formData.append("age", state.age.toString());

  if (state.email) formData.append("email", state.email);

  if (state.phoneNumberCountryCode.value)
    formData.append("phoneNumberCountryCode", state.phoneNumberCountryCode.value.toString());

  if (state.phoneNumber) formData.append("phoneNumber", state.phoneNumber);

  if (state.alternativeMobileNumber)
    formData.append(
      "alternativephoneNumberCountryCode",
      state.alternativephoneNumberCountryCode.value.toString()
    );

  if (state.alternativephoneNumberCountryCode.value.toString())
    formData.append("alternativeMobileNumber", state.alternativeMobileNumber);

  if (state.gender) formData.append("gender", state.gender);
  if (state.identificationMark) formData.append("identificationMark", state.identificationMark);

  if (state.country.value) formData.append("country", state.country.value.toString());

  if (state.fullAddress) formData.append("fullAddress", state.fullAddress);
  if (state.area) formData.append("area", state.area);

  if (state.referredTypeId.value.toString())
    formData.append("referredTypeId", state.referredTypeId.value.toString());

  if (state.referralDetails) formData.append("referralDetails", state.referralDetails);

  if (state.patientPic) formData.append("patientPic", state.patientPic);

  return createNewpatient(formData);
};

export const createPateintAddmissionData = (id: string, state: BasicDetailsState) => {
  const payload: { [key: string]: unknown } = {
    patientId: id
  };
  if (state.dateOfAdmission && state.time) {
    const formattedDateTime = new Date(`${state.dateOfAdmission} ${state.time}`).toISOString();
    payload.dateOfAdmission = formattedDateTime;
  }
  if (state.admissionType) {
    payload.admissionType = state.admissionType;
  }
  if (state.admissionType === "Involuntary" && state.involuntaryAdmissionType?.value.toString()) {
    payload.involuntaryAdmissionType = state.involuntaryAdmissionType?.value.toString();
  }

  return createPatientAdmissionHistory(payload, id);
};

export const convertDate = (dateString: string): string => {
  const parts = dateString.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    const formattedDate = `${String(date.getUTCDate()).padStart(2, "0")}/${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}/${date.getUTCFullYear()}`;

    return formattedDate;
  } else {
    // Handle ISO format (YYYY-MM-DD)
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return `${String(date.getUTCDate()).padStart(2, "0")}/${String(
        date.getUTCMonth() + 1
      ).padStart(2, "0")}/${date.getUTCFullYear()}`;
    } else {
      return "Invalid Date";
    }
  }
};

export const isNumeric = (value: number | string | symbol) => {
  return value === "" || /^\d+$/.test(value.toString());
};

export const calculateAge = (dob: string) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age > 0 ? age : 0; // Prevent negative values
};
