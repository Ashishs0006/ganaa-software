import {
  Root,
  Auth,
  Home,
  Lead,
  Admin,
  User,
  Dashboard,
  Center,
  Allergy,
  Error,
  Login,
  Family,
  Welcome,
  AuditLogs,
  Feedback,
  Insights,
  NoAccess,
  NotFound,
  Discharge,
  CreateLead,
  NurseNotes,
  DoctorNotes,
  PatientData,
  CaseHistory,
  DailyReport,
  WeeklyReport,
  FeedbackForm,
  Registration,
  FamilyDetail,
  DailyProgress,
  InpatientData,
  InValidScreen,
  GroupActivity,
  AllPatientData,
  PatientProfile,
  QualifiedLeads,
  ChangePassword,
  TherapistNotes,
  ExistingPatient,
  DoctorWiseSession,
  DisQualifiedLeads,
  DoctorPrescription,
  PatientVitalsReport,
  TherapistWiseSession,
  BlackModalGoogleReview,
  Reports
} from "@/pages";
import { RouteItem } from "@/router/type";
import { RESOURCES, ROUTES } from "@/constants/resources";
import PatientFollowUp from "@/pages/Admin/PatientData/FollowUp/PatientFollowUp";

export const routes: RouteItem[] = [
  {
    path: ROUTES.HOME,
    element: <Root />,
    children: [
      { path: ROUTES.HOME, element: <Home /> },
      {
        path: ROUTES.ADMIN,
        element: <Admin />,
        children: [
          { path: ROUTES.HOME, element: <Welcome /> },
          { path: ROUTES.CHANGE_PASSWORD, element: <ChangePassword /> },

          {
            path: ROUTES.DASHBOARD,
            element: <Dashboard />,
            children: [
              {
                path: "center",
                element: <Center />
              },
              {
                path: "center/:centerId",
                element: <Center />
              },
              {
                path: "allergy-medicine",
                element: <Allergy />
              },
              {
                path: "user",
                element: <User />
              }
            ]
          },
          {
            path: ROUTES.WEEKLY_REPORT,
            element: <WeeklyReport />,
            resource: RESOURCES.WEEKLY_REPORT
          },
          {
            path: ROUTES.THERAPIST_WISE_SESSION,
            element: <TherapistWiseSession />,
            resource: RESOURCES.THERAPIST_WISE_SESSION
          },
          {
            path: ROUTES.DOCTOR_WISE_SESSION,
            element: <DoctorWiseSession />,
            resource: RESOURCES.DOCTOR_WISE_SESSION
          },
          {
            path: ROUTES.PATIENT_VITAL_REPORT,
            element: <PatientVitalsReport />,
            resource: RESOURCES.PATIENT_VITAL_REPORT
          },
          { path: ROUTES.DAILY_REPORT, element: <DailyReport />, resource: RESOURCES.DAILY_REPORT },
          { path: ROUTES.REPORTS, element: <Reports /> },
          { path: ROUTES.INSIGHTS, element: <Insights />, resource: RESOURCES.INSIGHTS },
          {
            path: ROUTES.PATIENT,
            element: <PatientData />,
            children: [
              {
                path: ROUTES.ALL_PATIENT,
                element: <AllPatientData />,
                resource: RESOURCES.ALL_PATIENT
              },
              {
                path: ROUTES.PATIENT_FOLLOWUP,
                element: <PatientFollowUp />,
                resource: RESOURCES.DOCOTOR_NOTES
              },
              {
                path: ROUTES.IN_PATIENT,
                element: <InpatientData />,
                resource: RESOURCES.IN_PATIENT
              },
              {
                path: ROUTES.PATIENT_PROFILE,
                element: <PatientProfile />,
                resource: RESOURCES.ALL_PATIENT
              },
              {
                resource: RESOURCES.AUDIT_LOG,
                path: ROUTES.PATIENT_AUDIT_LOGS,
                element: <AuditLogs />
              },
              {
                path: ROUTES.DAILY_PROGRESS,
                element: <DailyProgress />,
                resource: RESOURCES.DAILY_PROGRESS
              },
              {
                path: ROUTES.NURSE_NOTES,
                element: <NurseNotes />,
                resource: RESOURCES.NURSE_NOTES
              },
              {
                path: ROUTES.THERAPIST_NOTES,
                element: <TherapistNotes />,
                resource: RESOURCES.THERAPIST_NOTES
              },
              {
                path: ROUTES.CASE_HISTORY,
                element: <CaseHistory />,
                resource: RESOURCES.CASE_HISTORY
              },
              {
                path: ROUTES.DOCTOR_NOTES,
                element: <DoctorNotes />,
                resource: RESOURCES.DOCOTOR_NOTES
              },
              {
                path: ROUTES.DOCTOR_PRESCRIPTION,
                element: <DoctorPrescription />,
                resource: RESOURCES.DOCTOR_PRESCRIPTION
              },
              { path: ROUTES.DISCHARGE, element: <Discharge />, resource: RESOURCES.DISCHARGE },
              {
                path: ROUTES.GROUP_ACTIVITY,
                element: <GroupActivity />,
                resource: RESOURCES.GROUP_ACTIVITY
              }
            ]
          },
          {
            path: ROUTES.REGISTRATION,
            element: <Registration key="create" />,
            resource: RESOURCES.NEW_REGISTRATION
          },
          {
            path: ROUTES.UPDATE_REGISTRATION,
            element: <Registration key="update" />,
            resource: RESOURCES.NEW_REGISTRATION
          },
          {
            path: ROUTES.SEARCH_EXISTING_PATIENT,
            element: <ExistingPatient />,
            resource: RESOURCES.SEARCH_EXISTING_PATIENT
          },
          {
            path: ROUTES.LEAD,
            element: <Lead />,
            children: [
              {
                path: ROUTES.CREATE_LEAD,
                element: <CreateLead key="new" />,
                resource: RESOURCES.CREATE_LEAD
              },
              {
                path: ROUTES.UPDATE_LEAD,
                element: <CreateLead key="edit" />,
                resource: RESOURCES.CREATE_LEAD
              },
              {
                path: ROUTES.QUALIFIED_LEAD,
                element: <QualifiedLeads />,
                resource: RESOURCES.QUALIFIED_LEAD
              },
              {
                path: ROUTES.DISQUALIFIED_LEAD,
                element: <DisQualifiedLeads />,
                resource: RESOURCES.DISQUALIFIED_LEAD
              }
            ]
          }
        ]
      },
      {
        path: ROUTES.FAMILY,
        element: <Family />,
        children: [
          {
            path: ROUTES.FAMILY_PORTAL,
            element: <FamilyDetail />,
            resource: RESOURCES.FAMILY_PORTAL
          }
        ]
      },
      {
        path: ROUTES.AUTH,
        element: <Auth />,
        children: [
          { path: ROUTES.LOGIN, element: <Login /> },
          { path: ROUTES.CHANGE_PASSWORD, element: <ChangePassword /> }
        ]
      },
      {
        path: ROUTES.FEEDBACK,
        element: <Feedback />,
        children: [
          { path: ROUTES.FEEDBACK_FORM, element: <FeedbackForm /> },
          {
            path: ROUTES.REVIEW,
            element: <BlackModalGoogleReview />
            // resource: RESOURCES.FEEDBACK
          }
        ]
      },
      { path: ROUTES.INVALID, element: <InValidScreen /> },
      { path: ROUTES.NOT_FOUND, element: <NotFound /> },
      { path: ROUTES.NO_ACCESS, element: <NoAccess /> }
    ],
    errorElement: <Error />
  }
];
