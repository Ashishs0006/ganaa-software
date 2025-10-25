export const RESOURCES = {
  INSIGHTS: "Insights",
  // ADMIN: "admin",
  // DASHBOARD: "Dashboard",
  DAILY_REPORT: "Daily Report",
  WEEKLY_REPORT: "Weekly Report",
  DOCTOR_WISE_SESSION: "Doctor Wise Session",
  PATIENT_VITAL_REPORT: "Patient Vital Report",
  THERAPIST_WISE_SESSION: "Therapist Wise Session",

  // LEAD: "Lead",
  CREATE_LEAD: "Create Lead",
  QUALIFIED_LEAD: "Qualified lead",
  DISQUALIFIED_LEAD: "Disqualified lead",

  // REGISTRATION: "Registration",
  NEW_REGISTRATION: "New Registration",
  SEARCH_EXISTING_PATIENT: "Search Existing Patient",

  // PATIENT: "Patient",
  IN_PATIENT: "In Patient",
  ALL_PATIENT: "All Patient",

  LOA: "LOA", //need to disccuss
  NURSE_NOTES: "Nurse Notes",
  DOCOTOR_NOTES: "Doctor Notes",
  DAILY_PROGRESS: "Daily progress",
  THERAPIST_NOTES: "Therapist Notes",
  DOCTOR_PRESCRIPTION: "Doctor Prescription",

  GROUP_ACTIVITY: "Group Activity",

  CASE_HISTORY: "Case History",

  FEEDBACK: "Feedback",
  DISCHARGE: "Discharge",

  FAMILY_PORTAL: "Family Portal",
  DOWNLOAD_SECTION: "Download Section",
  AUDIT_LOG: "Resource Audit Log"
  
} as const;

export const ROUTES = {
  HOME: "",
  ADMIN: "admin",

  DASHBOARD: "dashboard",
  WEEKLY_REPORT: "weekly-report",
  INSIGHTS: "insights-dashboard",
  DAILY_REPORT: "daily-report-dashboard",
  REPORTS: "reports",
  DOCTOR_WISE_SESSION: "doctor-wise-session",
  PATIENT_VITAL_REPORT: "patients-report",
  THERAPIST_WISE_SESSION: "therapist-wise-session",

  PATIENT: "patients",
  ALL_PATIENT: "all-patient",
  IN_PATIENT: "in-patient",
  PATIENT_PROFILE: "all-patient/:id/profile/:aId",
  PATIENT_AUDIT_LOGS: "all-patient/:id/audit/:aId",
  DAILY_PROGRESS: "in-patient/:id/daily-progress/:aId",
  NURSE_NOTES: "in-patient/:id/daily-progress/:aId/nurse",
  THERAPIST_NOTES: "in-patient/:id/daily-progress/:aId/therapist",
  CASE_HISTORY: "in-patient/:id/case-history/:aId",
  DOCTOR_NOTES: "in-patient/:id/daily-progress/:aId/doctor/notes",
  DOCTOR_PRESCRIPTION: "in-patient/:id/daily-progress/:aId/doctor/prescription",
  PATIENT_FOLLOWUP: "all-patient/:id/patient-followup/:aId",

  DISCHARGE: "in-patient/:id/discharge/:aId",
  GROUP_ACTIVITY: "in-patient/group-activity",

  REGISTRATION: "registration",
  UPDATE_REGISTRATION: "update-patient/:id/:aId",
  SEARCH_EXISTING_PATIENT: "existing-patient",

  LEAD: "Lead",
  CREATE_LEAD: "Create-Lead",
  UPDATE_LEAD: "update-lead/:id",
  QUALIFIED_LEAD: "qualified-leads",
  DISQUALIFIED_LEAD: "disqualified-leads",

  FAMILY: "family",
  FAMILY_PORTAL: "family-portal",

  AUTH: "auth",
  LOGIN: "login",
  CHANGE_PASSWORD: "change-password",

  FEEDBACK: "feedback",
  FEEDBACK_FORM: ":id/:aid",
  REVIEW: "review",

  INVALID: "invalid",
  NOT_FOUND: "*",
  NO_ACCESS: "no-access"
} as const;

export type ResourceKey = keyof typeof RESOURCES;
export type ResourceValue = (typeof RESOURCES)[ResourceKey];
