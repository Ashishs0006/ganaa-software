import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IPatientCaseHistoryRevision } from '../../interfaces/model/patient/i.patient.case.history.revision.modal';

const patientCaseHistoryRevisionSchema = new mongoose.Schema<IPatientCaseHistoryRevision>({
  originalId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patientCaseHistory.name,
    required: [true, 'Original ID is Mandatory Field'],
  },
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
    required: [true, 'Patient ID is Mandatory Field'],
  },
  patientAdmissionHistoryId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patientAdmissionHistory.name,
    required: [true, 'Original ID is Mandatory Field'],
  },

  revision: {
    type: Number,
    default: 0,
    required: [true, 'Revision is Mandatory Field'],
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },

  motherName: { type: String },
  fatherName: { type: String },

  // Advance Directive
  isAdvanceDirectiveSelected: mongoose.Schema.Types.Mixed,
  advanceDirective: String,

  // Informants Details
  informantsDetails: [
    {
      name: String,
      relationshipWithPatient: {
        shortName: String,
        fullName: String,
      },
      reliabilityAndAdequacy: String,
      knownToPatient: String,
    },
  ],

  // Chief Complaints
  chiefComplaints: String,

  // History Of Present Illness
  historyOfPresentIllness: {
    onset: String,
    onsetOther: String,
    course: String,
    courseOther: String,
    progress: String,
    totalDurationOfIllness: String,
    durationThisEpisode: String,
    predisposing: String,
    perpetuating: String,
    precipitatingFactors: String,
    impactOfPresentIllness: String,
    historyOfPresentIllness: String,
    negativeHistory: String,
    pastPsychiatricHistory: String,
    pastPsychiatricTreatmentHistory: String,
    pastMedicalHistory: String,
  },

  // Family History
  familyHistory: {
    historyofPsychiatricIllness: String,
  },

  // Personal History
  personalHistory: {
    birthAndChildhoodHistory: {
      prenatal: String,
      natal: String,
      postnatal: String,
      developmentalMilestone: String,
      immunizationStatus: String,
    },
    educationalHistory: {
      complaintsAtSchool: String,
    },
    occupationalHistory: String,
    sexualHistory: String,
    menstrualHistory: {
      ageAtMenarche: String,
      regularity: String,
      noOfDaysOfMenses: String,
      lastMenstrualPeriod: String,
    },
    maritalHistory: {
      status: String,
      spouseDetails: String,
    },
    religiousHistory: String,
    substanceUseHistory: [
      {
        ageAtFirstUse: String,
        substanceUsed: String,
        duration: String,
        abstinencePeriodAndReason: String,
        relapsesAndReason: String,
        averageDose: String,
        maximumDose: String,
        lastIntake: String,
      },
    ],
  },

  // Premorbid Personality
  premorbidPersonality: {
    socialRelationsWitFamilyOrFriendsOrColleagues: String,
    hobbiesOrInterests: String,
    personalityTraits: String,
    mood: String,
    characterOrAttitudeToWorkOrResponsibility: String,
    habits: String,
  },

  // Mental Status Examination
  mentalStatusExamination: {
    generalAppearanceBehavior: {
      kemptAndTidy: String,
      withdrawn: String,
      lookingAtOneAge: String,
      overfriendly: String,
      dressAppropriate: String,
      suspicious: String,
      eyeContact: String,
      posture: String,
      cooperative: String,
      grimaces: String,
      helpSeeking: String,
      guarded: String,
      ingratiated: String,
      hostile: String,
      submissive: String,
      psychomotorActivity: String,
    },
    speech: {
      rate: String,
      goalDirected: String,
      volume: String,
      spontaneous: String,
      pitchOrTone: String,
      coherent: String,
      reactionTime: String,
      relevant: String,
    },
    affect: {
      objective: String,
      subjective: String,
      affect: String,
      range: String,
      reactivity: String,
    },
    thought: {
      stream: String,
      form: String,
      content: String,
      possession: String,
    },
    perception: {
      hallucination: String,
      hallucinationSample: String,
      illusion: String,
      illusionSample: String,
    },
    higherCognitiveFunctions: {
      orientation: {
        time: String,
        place: String,
        person: String,
      },
      attentionConcentration: {
        digitSpanTest: String,
        serialSubtractionTest: String,
      },
      memory: {
        immediate: String,
        recent: String,
        remote: String,
      },
      generalIntelligence: {
        generalFundOfKnowledge: String,
        arithmetic: String,
        comprehesion: String,
      },
      abstractThinking: {
        similaritiesOrDissimilarities: String,
        proverbs: String,
      },
      judgement: {
        personal: String,
        social: String,
        test: String,
      },
    },
  },

  // Insights
  insight: {
    insightGrade: String,
    insight: String,
  },

  // Diagnostic Formulation
  diagnosticFormulation: {
    description: String,
    provisionalDiagnosis: String,
    differentialDiagnosis: String,
    targetSymptoms: String,
    pharmacologicalPlan: String,
    nonPharmacologicalPlan: String,
    reviewsRequired: String,
    psychologicalAssessments: String,
    investigations: String,
  },
  genogram: {
    fileName: String,
    filePath: String,
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
});

const PatientCaseHistoryRevision = mongoose.model<IPatientCaseHistoryRevision>(
  Collections.patientCaseHistoryRevision.name,
  patientCaseHistoryRevisionSchema
);

export default PatientCaseHistoryRevision;
