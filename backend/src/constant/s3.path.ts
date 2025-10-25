export const S3Path: S3PathsMap = {
  /// User File Paths
  usersPic: (userId, filename) => `users/${userId}/${filename}`,

  /// Patient File Paths
  patientPic: (patientId, filename) => `patients/${patientId}/${filename}`,
  idProof: (patientId, filename) => `patients/${patientId}/idproof/${filename}`,
  patientFamilyDetailsDoc: (patientId, filename) => `patients/${patientId}/family-details/${filename}`,
  patientTestReportDoc: (patientId, filename) => `patients/${patientId}/test-report/${filename}`,
  patientChecklistDoc: (patientId, filename) => `patients/${patientId}/checklist/${filename}`,
  therapistFile: (patientId, filename) => `patients/${patientId}/therapist/${filename}`,
  caseHistoryFile: (patientId, filename) => `patients/${patientId}/case-history/${filename}`,

  /// Common Files
  commonFiles: (filename) => `common-files/${filename}`,
};

type PathBuilder = (...args: string[]) => string;

interface S3PathsMap {
  [key: string]: PathBuilder;
}
