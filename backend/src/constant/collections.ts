import CollectionInfo from '../utils/collectionNamesUtil';

/**
 * Centralized collection of all model -> collection name mappings.
 */
class Collections {
  // Daily Progress
  static loa = new CollectionInfo('Loa');
  static nurseNote = new CollectionInfo('NurseNote');
  static doctorNote = new CollectionInfo('DoctorNote');
  static prescription = new CollectionInfo('Prescription');
  static therapistNote = new CollectionInfo('TherapistNote');
  static prescriptionRevision = new CollectionInfo('PrescriptionRevision');

  static patientFollowup = new CollectionInfo('PatientFollowup')
  // Dropdown
  // INFO: DD_Table Name, DD is used to distinguish between Dropdown table and other tables
  static allergy = new CollectionInfo('DD_Allergy');
  static medicine = new CollectionInfo('DD_Medicine');
  static referredType = new CollectionInfo('DD_ReferredType');
  static relationship = new CollectionInfo('DD_Relationship');

  // Patient
  static patientAdmissionHistory = new CollectionInfo('PatientAdmissionHistory');
  static patientAdmissionHistoryRevision = new CollectionInfo('PatientAdmissionHistoryRevision');
  static patientCaseHistory = new CollectionInfo('PatientCaseHistory');
  static patientCaseHistoryRevision = new CollectionInfo('PatientCaseHistoryRevision');
  static patientDischarge = new CollectionInfo('PatientDischarge');
  static patientFamilyDetailsRevision = new CollectionInfo('PatientFamilyDetailsRevision');
  static patientFamilyDetails = new CollectionInfo('PatientFamilyDetails');
  static patientFeedback = new CollectionInfo('PatientFeedback');
  static patient = new CollectionInfo('Patient');
  static patientRevision = new CollectionInfo('PatientRevision');

  // Resources
  static center = new CollectionInfo('Center');
  static lockerNumber = new CollectionInfo('LockerNumber');
  static roomNumber = new CollectionInfo('RoomNumber');
  static roomType = new CollectionInfo('RoomType');

  // Group Activity
  static groupTab = new CollectionInfo('GroupTab');
  static groupActivity = new CollectionInfo('GroupActivity');

  // Reports
  static dailyResourceAllocationReport = new CollectionInfo('DailyResourceAllocationReport');

  // ...
  static feedbackQuestionnaire = new CollectionInfo('FeedbackQuestionnaire');
  static lead = new CollectionInfo('Lead');
  static user = new CollectionInfo('User');
  static role = new CollectionInfo('Role');
  static counter = new CollectionInfo('Counter');
  static commonFile = new CollectionInfo('CommonFile');
}

export default Collections;
