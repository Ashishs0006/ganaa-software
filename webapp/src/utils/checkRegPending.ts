/* eslint-disable @typescript-eslint/no-explicit-any */

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
    "alternativephoneNumberCountryCode",
    "alternativeMobileNumber",
    "gender",
    "identificationMark",
    "country",
    "fullAddress",
    "area",
    "referredTypeId._id",
    "referralDetails",
    "patientPicUrl",
    "patientHistory.admissionType",
    "patientHistory.involuntaryAdmissionType",

    // profile&contact
    "education",
    "familyIncome",
    "religion",
    "language",
    "isMarried",
    "numberOfChildren",
    "occupation",

    // "patientHistory.admissionChecklist.applicationForAdmission",
    // "patientHistory.admissionChecklist.capacityAssessment",
    // "patientHistory.admissionChecklist.voluntaryAdmissionForm",
    // "patientHistory.admissionChecklist.hospitalGuidelineForm",
    // "patientHistory.admissionChecklist.inVoluntaryAdmissionForm",
    // "patientHistory.admissionChecklist.finacialCounselling",
    // "patientHistory.admissionChecklist.minorAdmissionForm",
    // "patientHistory.admissionChecklist.form90",

    // "patientHistory.admissionChecklist.orientationOfFamily",
    // "patientHistory.admissionChecklist.orientationOfPatient",
    // "patientHistory.admissionChecklist.familyDeclaration",
    // "patientHistory.admissionChecklist.section94",

    // "patientHistory.admissionChecklist.insuredFile",
    // "patientHistory.admissionChecklist.isInsured",
    // "patientHistory.admissionChecklist.insuredDetail",

    //resourceAllocation
    "patientHistory.resourceAllocation.centerId._id",
    "patientHistory.resourceAllocation.roomTypeId._id",
    "patientHistory.resourceAllocation.roomNumberId._id",
    "patientHistory.resourceAllocation.lockerNumberId._id",
    "patientHistory.resourceAllocation.belongingsInLocker",
    "patientHistory.resourceAllocation.assignedDoctorId._id",
    "patientHistory.resourceAllocation.assignedTherapistId._id",
    "patientHistory.resourceAllocation.careStaff",
    "patientHistory.resourceAllocation.nurse"

    // "patientHistory.illnessType",
    // "patientHistory.patientCondition",
    // "patientHistory.conditionDetails",
    // "patientHistory.coverageStatus",
  ];

  if (typeof data !== "object" || !Array.isArray(fields)) {
    return { isValid: true, missingFields };
  }

  const inVoluntary = data?.patientHistory?.admissionType == "Involuntary";

  for (const field of fields) {
    if (field === "patientHistory.involuntaryAdmissionType" && !inVoluntary) {
      continue;
    }
    if (typeof field !== "string") {
      continue; // Skip invalid fields
    }

    const fieldValue = field.split(".").reduce((obj: any, key: string) => obj && obj[key], data);

    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
      missingFields.push(field);
    }
  }

  return { isValid: missingFields.length !== 0, missingFields };
}
