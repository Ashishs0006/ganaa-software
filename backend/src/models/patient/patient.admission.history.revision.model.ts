// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IPatientAdmissionHistoryRevision } from '../../interfaces/model/patient/i.patient.admission.history.revision';

const patientAdmissionHistoryRevisionSchema = new mongoose.Schema<IPatientAdmissionHistoryRevision>(
  {
    originalId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.patientAdmissionHistory.name,
      required: [true, 'Original ID is Mandatory Field'],
    },
    revision: {
      type: Number,
      default: 0,
      required: [true, 'Revision is Mandatory Field'],
    },

    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.patient.name,
      required: [true, 'Patient ID is Mandatory Field'],
    },

    dateOfAdmission: { type: Date },

    caseHistoryId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.patientCaseHistory.name,
    },
    dischargeId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.patientDischarge.name,
    },
    feedbackId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.patientFeedback.name,
    },

    // Diagnosis
    illnessType: String,

    // Admission Type
    admissionType: String,
    involuntaryAdmissionType: String,

    // Patient Status
    currentStatus: String,

    // Admission Checklist
    admissionChecklist: {},

    // Resource Allocation History
    resourceAllocation: {
      center: {
        _id: mongoose.Schema.Types.ObjectId,
        centerName: String,
      },
      roomType: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        centerId: { type: mongoose.Schema.Types.ObjectId },
      },
      roomNumber: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        roomTypeId: mongoose.Schema.Types.ObjectId,
        totalBeds: Number,
      },
      lockerNumber: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
        centerId: mongoose.Schema.Types.ObjectId,
      },
      belongingsInLocker: String,
      assignedDoctor: {
        _id: mongoose.Schema.Types.ObjectId,
        roleId: {
          _id: mongoose.Schema.Types.ObjectId,
          name: String,
        },
        firstName: String,
        lastName: String,
      },
      assignedTherapist: {
        _id: mongoose.Schema.Types.ObjectId,
        roleId: {
          _id: mongoose.Schema.Types.ObjectId,
          name: String,
        },
        firstName: String,
        lastName: String,
      },
      nurse: {
        type: String,
      },
      careStaff: {
        type: String,
      },
      updatedAt: Date,
    },

    // Patient Report
    patientReport: {
      injuryDetails: [],
      allergiesNames: [],
      allergiesFiles: [],
      diabeticStatus: String,
      hyperTension: String,
      heartDisease: String,
      heartDiseaseDescription: String,
      levelOfRisk: String,
      levelOfRiskDescription: String,
      previousTreatmentRecord: [],
      updatedAt: Date,
    },

    createdBy: {
      _id: mongoose.Schema.Types.ObjectId,
      roleId: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
      },
      firstName: String,
      lastName: String,
    },
    updatedBy: {
      _id: mongoose.Schema.Types.ObjectId,
      roleId: {
        _id: mongoose.Schema.Types.ObjectId,
        name: String,
      },
      firstName: String,
      lastName: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const PatientAdmissionHistoryRevision = mongoose.model<IPatientAdmissionHistoryRevision>(
  Collections.patientAdmissionHistoryRevision.name,
  patientAdmissionHistoryRevisionSchema
);

export default PatientAdmissionHistoryRevision;
