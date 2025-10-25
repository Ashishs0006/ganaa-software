import axios, { AxiosHeaders } from "axios";
import { loginInterface } from "@/apis/types";
const baseUrl = import.meta.env.VITE_API_URL;

const http = axios.create({
  baseURL: baseUrl,
});

http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// auth
export const login = (data: loginInterface) => http.post("/user/login", data);

// User
export const me = (params?: unknown, headers?: AxiosHeaders) => http.get("/user/me", { params, headers });
export const getAllUser = (params?: unknown, headers?: AxiosHeaders) => http.get("/user/basic", { params, headers });
export const createUser = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/user/manage", data, { params, headers });
export const updateUser = (id: string, data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/user/manage/${id}`, data, { params, headers });
export const deleteUser = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/user/manage/${id}`, { params, headers });
export const resetPassword = (id: string, params?: unknown, headers?: AxiosHeaders) => http.patch(`/user/manage/reset-password/${id}`, { params, headers });
export const changePassword = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/user/me/change-password`, data, { params, headers });

// Role
export const getAllRoles = (params?: unknown, headers?: AxiosHeaders) => http.get("/role", { params, headers });

// DropDown
export const getAllRelationship = (params?: unknown, headers?: AxiosHeaders) => http.get("/dropdown/relationship", { params, headers });
export const getAllReference = (params?: unknown, headers?: AxiosHeaders) => http.get("/dropdown/reference-platform", { params, headers });
export const getAllReferredType = (params?: unknown, headers?: AxiosHeaders) => http.get("/dropdown/referred-type", { params, headers });
export const getAllCountry = (params?: unknown, headers?: AxiosHeaders) => http.get("/constants", { params, headers });
export const getAllMedicine = (params?: unknown, headers?: AxiosHeaders) => http.get("/dropdown/medicine", { params, headers });
export const createBulkMedicine = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/dropdown/medicine/bulk", data, { params, headers });
export const updateBulkMedicine = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch("/dropdown/medicine/bulk", data, { params, headers });
export const getSingleMedicine = (id: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/dropdown/medicine/${id}`, { params, headers });
export const deleteMedicine = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/dropdown/medicine/${id}`, { params, headers });
export const deleteBulkMedicine = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.delete(`/dropdown/medicine/bulk`, { data, params, ...headers });

// Allergy

export const getAllAllergy = (params?: unknown, headers?: AxiosHeaders) => http.get("/dropdown/allergy", { params, headers });
export const createAllergy = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/dropdown/allergy", data, { params, headers });
export const createbulkAllergy = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/dropdown/allergy/bulk", data, { params, headers });
export const deleteAllergy = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/dropdown/allergy/${id}`, { params, headers });
export const deleteBulkAllergy = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.delete(`/dropdown/allergy/bulk`, { data, params, headers });

// patient
export const getAllPatient = (params?: unknown, headers?: AxiosHeaders, signal?: AbortSignal) => http.get("/patient", { params, headers, signal });
export const createNewpatient = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/patient", data, { params, headers });
export const reAdmitNewpatient = (id: string, data: unknown, headers?: AxiosHeaders) => http.post(`/patient/${id}/re-admit`, data, { headers });
export const getSinglePatient = (pid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/${pid}`, { params, headers });
export const getPatientRentFair = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/${pid}/history/${aid}/fare-calculator`, { params, headers });
export const updateRentFair = (pid: string, aid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) =>
  http.patch(`/patient/${pid}/history/${aid}/fare-calculator`, data, { params, headers });
export const updatePatient = (data: unknown, pid: string, params?: unknown, headers?: AxiosHeaders) => http.patch(`/patient/${pid}`, data, { params, headers });
export const deletePatient = (pid: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/patient/${pid}`, { params, headers });
export const searchPatient = (params?: unknown, headers?: AxiosHeaders) => http.get("/patient/search", { params, headers });
export const existPatient = (params?: unknown, headers?: AxiosHeaders) => http.get("/patient/exist", { params, headers });
// Family
export const createPatientFamily = (pid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post(`/patient/family-details/${pid}`, data, { params, headers });
export const getPatientFamily = (pid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/family-details/${pid}`, { params, headers });
export const UpdatePatientFamilyDetail = (pid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/patient/family-details/${pid}/update`, data, { params, headers });
export const deletePatientFamilyDetail = (pid: string, fid: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/patient/family-details/${pid}/${fid}`, { params, headers });

export const getAllPatientAdmissionHistory = (pid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/${pid}/history`, { params, headers });
export const createPatientAdmissionHistory = (data: unknown, pid: string, params?: unknown, headers?: AxiosHeaders) => http.post(`/patient/${pid}/history`, data, { params, headers });
export const getSinglePatientAdmissionHistory = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/${pid}/history/${aid}`, { params, headers });
export const updateSinglePatinetAdmissionHistory = (data: unknown, pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) =>
  http.patch(`/patient/${pid}/history/${aid}`, data, { params, headers });
export const updateSinglePatinetAdmissionChecklist = (data: unknown, pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) =>
  http.patch(`/patient/${pid}/history/${aid}/checklist`, data, { params, headers });
export const createSinglePatientResources = (data: unknown, pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) =>
  http.patch(`/patient/${pid}/history/${aid}/resource`, data, { params, headers });
export const singlePatientAdmissionHistory = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/patient/${pid}/history/${aid}`, { params, headers });
export const updateMedicalSummary = (data: unknown, pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) =>
  http.patch(`/patient/${pid}/history/${aid}/test-report`, data, { params, headers });

export const getPatientDailyProgress = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/${pid}/history/${aid}/daily-progress`, { params, headers });
export const getPatientAuditLogs = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/${pid}/history/${aid}/audit-log`, { params, headers });

export const getAllNurseNotes = (params?: unknown, headers?: AxiosHeaders) => http.get("/daily-progress/nurse", { params, headers });
export const createNurseNotes = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/daily-progress/nurse", data, { params, headers });
export const updateNurseNotes = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/daily-progress/nurse/${id}`, data, { params, headers });
export const deleteNurseNotes = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/daily-progress/nurse/${id}`, { params, headers });

export const createTherapistNotes = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/daily-progress/therapist", data, { params, headers });
export const getAllTherapistNotes = (params?: unknown, headers?: AxiosHeaders) => http.get("/daily-progress/therapist", { params, headers });
export const updateTherapistNotes = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/daily-progress/therapist/${id}`, data, { params, headers });
export const deleteTherapistNotes = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/daily-progress/therapist/${id}`, { params, headers });

//new added for Patient Followup section
export const createPatientFollowup = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/daily-progress/patient-followup", data, { params, headers });
export const getAllPatientFollowup = (params?: unknown, headers?: AxiosHeaders) => http.get("/daily-progress/patient-followup", { params, headers });
export const updatePatientFollowup = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/daily-progress/patient-followup/${id}`, data, { params, headers });
export const deletePatientFollowup = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/daily-progress/patient-followup/${id}`, { params, headers });

export const createDoctorNotes = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/daily-progress/doctor/note", data, { params, headers });
export const getAllDoctorNotes = (params?: unknown, headers?: AxiosHeaders) => http.get("/daily-progress/doctor/note", { params, headers });
export const updateDoctorNotes = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/daily-progress/doctor/note/${id}`, data, { params, headers });
export const deleteDoctorNotes = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/daily-progress/doctor/note/${id}`, { params, headers });

export const createDoctorPrescription = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("/daily-progress/doctor/prescription", data, { params, headers });
export const getAllDoctorPrescription = (params?: unknown, headers?: AxiosHeaders) => http.get("/daily-progress/doctor/prescription", { params, headers });
export const getAllDoctorPrescriptionRivision = (params?: unknown, headers?: AxiosHeaders) => http.get("/daily-progress/doctor/prescription/revision", { params, headers });
export const updateDoctorPrescription = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/daily-progress/doctor/prescription/${id}`, data, { params, headers });
export const deleteDoctorPrescription = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/daily-progress/doctor/prescription/${id}`, { params, headers });

// Case History
export const createCaseHistory = (pid: string, aid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post(`/patient/${pid}/case-history/${aid}`, data, { params, headers });
export const getCaseHistory = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/${pid}/case-history/${aid}`, { params, headers });
export const getPreviousCaseHistories = (pid: string, aid: string, cid: string, params?: unknown, headers?: AxiosHeaders) =>
  http.get(`/patient/${pid}/case-history/${aid}/${cid}/revision`, { params, headers });
export const updateCaseHistory = (pid: string, aid: string, cid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) =>
  http.patch(`/patient/${pid}/case-history/${aid}/${cid}`, data, { params, headers });
export const deleteCaseHistory = (pid: string, aid: string, cid: string, rid: string, params?: unknown, headers?: AxiosHeaders) =>
  http.delete(`/patient/${pid}/case-history/${aid}/${cid}/revision/${rid}`, { params, headers });

// Discharge

export const createDischarge = (pid: string, aid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post(`/patient/${pid}/discharge/${aid}`, data, { params, headers });
export const getDischarge = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/patient/${pid}/discharge/${aid}`, { params, headers });
export const updateDischarge = (pid: string, aid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/patient/${pid}/discharge/${aid}`, data, { params, headers });
// export const deleteDischarge = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/patient/${pid}/discharge/${aid}`, { params, headers });
export const updateDischargeStatus = (pid: string, aid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) =>
  http.patch(`/patient/${pid}/discharge/${aid}/discharge-patient`, data, { params, headers });

export const deleteDischarge = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/patient/${pid}/discharge/${aid}/cancel-patient-discharge`, { params, headers });

// resources
export const getAllCenter = (params?: unknown, headers?: AxiosHeaders) => http.get("resources/center", { params, headers });
export const createCenter = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("resources/center", data, { params, headers });
export const updateCenter = (id: string, data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`resources/center/${id}`, data, { params, headers });
export const deleteCenter = (cid: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`resources/center/${cid}`, { params, headers });
export const getAllRoomType = (params?: unknown, headers?: AxiosHeaders) => http.get("resources/room-type", { params, headers });
export const getAllRoomNumber = (params?: unknown, headers?: AxiosHeaders) => http.get("resources/room-number", { params, headers });
export const getAllLocker = (params?: unknown, headers?: AxiosHeaders) => http.get("resources/locker", { params, headers });
export const createBulkLocker = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("resources/locker/bulk", data, { params, headers });
export const deleteBulkLocker = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.delete("resources/locker/bulk", { data, params, headers });

// feedback
export const getFeedbackQuestionaire = (params?: unknown, headers?: AxiosHeaders) => http.get("feedback-questionnaire", { params, headers });
export const getFeedback = (pid: string, aid: string, params?: unknown, headers?: AxiosHeaders) => http.get(`patient/${pid}/feedback/${aid}`, { params, headers });
export const updateFeedback = (pid: string, aid: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/patient/${pid}/feedback/${aid}`, data, { params, headers });

//leads
export const getAllLeads = (params?: unknown, headers?: AxiosHeaders, signal?: AbortSignal) => http.get("/lead", { params, headers, signal });
export const getSingleLead = (id: string, params?: unknown, headers?: AxiosHeaders) => http.get(`lead/${id}`, { params, headers });
export const createLead = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post(`/lead`, data, { params, headers });
export const updateLead = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/lead/${id}`, data, { params, headers });
export const deleteLead = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/lead/${id}`, { params, headers });
export const createComment = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post(`/lead/${id}/comment`, data, { params, headers });
export const admitLead = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post(`/lead/${id}/admit`, data, { params, headers });

// GroupActivity
export const createNewGroupActivity = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post(`/group-activity/activity`, data, { params, headers });
export const getGroupActivity = (params?: unknown, headers?: AxiosHeaders) => http.get(`/group-activity/activity`, { params, headers });
export const updateNewGroupActivity = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/group-activity/activity/${id}`, data, { params, headers });

// GroupActivitytabs
export const createNewGroupActivitytabs = (data: unknown, params?: unknown, headers?: AxiosHeaders) => http.post(`/group-activity/tab`, data, { params, headers });
export const getGroupActivitytabs = (params?: unknown, headers?: AxiosHeaders) => http.get(`/group-activity/tab`, { params, headers });
export const updateNewGroupActivitytabs = (id: string, data: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`/group-activity/tab/${id}`, data, { params, headers });

// Dashboard
export const getInsights = (params?: unknown, headers?: AxiosHeaders) => http.get("/dashboard/insights", { params, headers });
export const getTherapistSession = (params?: unknown, headers?: AxiosHeaders) => http.get("/dashboard/therapist", { params, headers });
export const getDoctorSession = (params?: unknown, headers?: AxiosHeaders) => http.get("/dashboard/doctor", { params, headers });
export const getDailyReport = (params?: unknown, headers?: AxiosHeaders) => http.get("/dashboard/daily-report", { params, headers });
export const getWeeklyReport = (params?: unknown, headers?: AxiosHeaders) => http.get("/dashboard/weekly-report", { params, headers });
export const getVitalReport = (params?: unknown, headers?: AxiosHeaders) => http.get("/dashboard/vital-report", { params, headers });

export const getAllLoa = (params?: unknown, headers?: AxiosHeaders) => http.get("/daily-progress/loa", { params, headers });
export const createLoa = (data: unknown, headers?: AxiosHeaders) => http.post("/daily-progress/loa", data, { headers });
export const deleteLoa = (id: string, headers?: AxiosHeaders) => http.delete(`/daily-progress/loa/${id}`, { headers });

//family-portal
export const getFamilyDetails = (params?: unknown, headers?: AxiosHeaders) => http.get("/family/patient-info", { params, headers });
export const getAllFamilyNurseNotes = (params?: unknown, headers?: AxiosHeaders) => http.get("/family/nurse-note", { params, headers });
export const getAllFamilyGroupAcitvity = (params?: unknown, headers?: AxiosHeaders) => http.get("/family/group-activity", { params, headers });

// Download Reports
export const getAllReports = (params?: unknown, headers?: AxiosHeaders) => http.get("/common-file", { params, headers });
export const getSingleReports = (id: string, params?: unknown, headers?: AxiosHeaders) => http.get(`/common-file/${id}`, { params, headers });
export const deleteSingleReports = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`/common-file/${id}`, { params, headers });

export const createRoomType = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("resources/room-type", data, { params, headers });
export const updateRoomType = (id: string, data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.patch(`resources/room-type/${id}`, data, { params, headers });
export const deleteRoomType = (id: string, params?: unknown, headers?: AxiosHeaders) => http.delete(`resources/room-type/${id}`, { params, headers });
export const createRoomNumberBulk = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.post("resources/room-number/bulk", data, { params, headers });
export const deleteRoomNumberBulk = (data?: unknown, params?: unknown, headers?: AxiosHeaders) => http.delete("resources/room-number/bulk", { data, params, headers });
