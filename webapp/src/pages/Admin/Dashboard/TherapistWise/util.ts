type AdmissionPeriod = {
  start: string; // ISO date string
  end?: string;  // optional ISO date string
};

type PatientData = Record<string, AdmissionPeriod[]>;

/**
 * Determine patient's admission status for a given date.
 * @param patientData - Object where keys are patient IDs and values are arrays of admission periods
 * @param patientId - Patient ID to check
 * @param date - Date to check against admission periods
 * @returns 'Not Admitted', null, or 'Discharge'
 */
export const  getAdmissionStatus=(
  patientData: PatientData,
  patientId: string,
  date: Date
): 'Not Admitted' | 'Discharge' | '--' =>{
  const admissions = patientData[patientId];

  // Patient does not exist
  if (!admissions || admissions.length === 0) {
    return 'Not Admitted';
  }

  // Convert date to timestamp for faster comparisons
  const checkTime = date.getTime();

  // Sort admissions by start date ascending (in case input is unordered)
  const sortedAdmissions = admissions.slice().sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  for (let i = 0; i < sortedAdmissions.length; i++) {
    const admission = sortedAdmissions[i];
    const startTime = new Date(admission.start).getTime();
    const endTime = admission.end ? new Date(admission.end).getTime() : null;

    // Before current admission period
    if (checkTime < startTime) {
      return i === 0 ? 'Not Admitted' : 'Discharge';
    }

    // Within current admission period
    if (checkTime >= startTime && (endTime === null || checkTime <= endTime)) {
      return '--';
    }

    // After current admission period but before next one
    if (endTime !== null && checkTime > endTime) {
      const nextAdmission = sortedAdmissions[i + 1];
      if (nextAdmission && checkTime < new Date(nextAdmission.start).getTime()) {
        return 'Discharge';
      }
    }
  }

  // After last admission period
  const lastAdmission = sortedAdmissions[sortedAdmissions.length - 1];
  if (lastAdmission.end && checkTime > new Date(lastAdmission.end).getTime()) {
    return 'Discharge';
  }

  // Edge case: last admission has no end, but checkTime is after start
  return "--";
}

// 2025-10-04T10:00:00Z

// Example usage:
// const patientData: PatientData = {
//   "68d89df61d21b87a3846f33b": [{ start: "2025-09-28T02:31:18.492Z" }],
//   "68da423e8665c795bbdbf21f": [
//     { start: "2025-09-20T08:24:30.349Z", end: "2025-09-24T06:11:00.000Z" },
//     { start: "2025-09-29T08:24:30.349Z", end: "2025-10-04T06:11:00.000Z" }
//   ],
//   "68db979ee14c15c3f4d5ca7a": [
//     { start: "2025-09-30T08:41:02.241Z", end: "2025-10-04T08:24:00.000Z" },
//     { start: "2025-10-04T15:33:49.172Z" }
//   ]
// };

// console.log(getAdmissionStatus(patientData, "68db979ee14c15c3f4d5ca7a", new Date("2025-10-04T10:00:00Z"))); // null
// console.log(getAdmissionStatus(patientData, "68db979ee14c15c3f4d5ca7a", new Date("2025-10-05T10:00:00Z"))); // null
// console.log(getAdmissionStatus(patientData, "68da423e8665c795bbdbf21f", new Date("2025-09-25T10:00:00Z"))); // Discharge
// console.log(getAdmissionStatus(patientData, "nonexistent", new Date())); // Not Admitted