export function checkRegPending(data: Record<string, any>) {
  const missingFields: string[] = [];

  // REQUIRED FIELDS ONLY
  const requiredFields = [
    // basic detail
    "firstName",
    "lastName",
    "age",
    "email",
    "phoneNumberCountryCode",
    "phoneNumber",
    "gender",
    "country",
    "fullAddress",
    "area",
    "referredTypeId._id",
    "referralDetails",
    "patientPicUrl",
    "patientHistory.admissionType",

    // If admission type is involuntary — extra validation
    "patientHistory.involuntaryAdmissionType",

    // profile/contact
    "education",
    "isMarried",
    "occupation",

    // resource allocation
    "patientHistory.resourceAllocation.centerId._id",
    "patientHistory.resourceAllocation.roomTypeId._id",
    "patientHistory.resourceAllocation.roomNumberId._id",
    "patientHistory.resourceAllocation.assignedDoctorId._id",
    "patientHistory.resourceAllocation.assignedTherapistId._id",
    "patientHistory.resourceAllocation.careStaff",
    "patientHistory.resourceAllocation.nurse",
  ];

  const inVoluntary = data?.patientHistory?.admissionType === "Involuntary";

  for (const field of requiredFields) {
    // Skip involuntary admission check if patient is NOT involuntary
    if (field === "patientHistory.involuntaryAdmissionType" && !inVoluntary) {
      continue;
    }

    const fieldValue = field.split(".").reduce((obj: any, key) => obj && obj[key], data);

    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
      missingFields.push(field);
    }
  }

  return {
    isValid: missingFields.length === 0, // true when ALL required fields filled
    missingFields,
  };
}
