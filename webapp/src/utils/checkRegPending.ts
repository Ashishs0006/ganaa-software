export function checkRegPending(data: Record<string, any>): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];

  const fields = [
    // basic detail
    "firstName",
    "lastName",
    "age",
    "email",
    "phoneNumberCountryCode",
    "phoneNumber",
    // NO fields
    // "alternativephoneNumberCountryCode",
    // "alternativeMobileNumber",
    "gender",
    // "identificationMark",
    "country",
    "fullAddress",
    "area",
    "referredTypeId._id",
    "referralDetails",
    "patientPicUrl",
    "patientHistory.admissionType",

    // only for involuntary
    "patientHistory.involuntaryAdmissionType",

    // profile & contact
    "education",
    // "familyIncome",
    // "religion",
    // "language",
    "isMarried",
    // "numberOfChildren",
    "occupation",

    // resourceAllocation
    "patientHistory.resourceAllocation.centerId._id",
    "patientHistory.resourceAllocation.roomTypeId._id",
    "patientHistory.resourceAllocation.roomNumberId._id",
    // "patientHistory.resourceAllocation.lockerNumberId._id",
    // "patientHistory.resourceAllocation.belongingsInLocker",
    "patientHistory.resourceAllocation.assignedDoctorId._id",
    "patientHistory.resourceAllocation.assignedTherapistId._id",
    "patientHistory.resourceAllocation.careStaff",
    "patientHistory.resourceAllocation.nurse",
  ];

  const inVoluntary = data?.patientHistory?.admissionType === "Involuntary";

  for (const field of fields) {
    if (field === "patientHistory.involuntaryAdmissionType" && !inVoluntary) continue;

    const fieldValue = field.split(".").reduce((obj: any, key: string) => obj && obj[key], data);

    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0, // TRUE = COMPLETE
    missingFields,
  };
}
