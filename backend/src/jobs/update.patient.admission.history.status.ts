import PatientAdmissionHistory from './../models/patient/patient.admission.history.model';

export const updatePatientAdmissionHistoryStatus = async () => {
  try {
    const result = await PatientAdmissionHistory.updateMany(
      {
        dateOfAdmission: { $lt: new Date() },
        currentStatus: 'Registered',
      },
      {
        $set: { currentStatus: 'Inpatient' },
      }
    );

    console.log(
      `[${new Date().toISOString()}] Patient Admission History Status Updated: ${result.modifiedCount}`
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error updating Patient Admission History Status:`,
      error
    );
  }
};
