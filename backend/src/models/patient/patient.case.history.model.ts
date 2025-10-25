import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { getSignedUrlByKey } from '../../utils/s3Helper';
import { IPatientCaseHistory } from '../../interfaces/model/patient/i.patient.case.history';

const patientCaseHistorySchema = new mongoose.Schema<IPatientCaseHistory>({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
    index: true,
    required: [true, 'Patient ID is Mandatory Field'],
  },
  patientAdmissionHistoryId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patientAdmissionHistory.name,
    index: true,
    unique: true,
    required: [true, 'Patient Admission HistoryId ID is Mandatory Field'],
  },

  motherName: { type: String },
  fatherName: { type: String },
  // Advance Directive
  isAdvanceDirectiveSelected: {
    type: mongoose.Schema.Types.Mixed,
    set: (value: unknown): boolean | string => {
      if (typeof value === 'boolean') {
        return value;
      }

      if (typeof value === 'string' && value.trim() === '') {
        return '';
      }

      // Optional: default or undefined
      return '';
    },
  },
  advanceDirective: String,

  // Informants Details
  informantsDetails: [
    {
      name: String,
      relationshipWithPatient: {
        type: mongoose.Schema.ObjectId,
        ref: Collections.relationship.name,
        set: (value: string) => (value === '' ? null : value),
      },
      reliabilityAndAdequacy: String,
      knownToPatient: String,
    },
  ],

  // Chief Complaints
  chiefComplaints: String,

  // History Of Present Illness
  historyOfPresentIllness: {
    onset: {
      type: String,
      enum: ['Abrupt', 'Acute', 'Subacute', 'Insidious', 'Other', ''],
    },
    onsetOther: String,
    course: {
      type: String,
      enum: ['Continuous', 'Episodic', 'Fluctuating', 'Other', ''],
    },
    courseOther: String,
    progress: {
      type: String,
      enum: ['Deteriorating', 'Static', 'Improving', ''],
    },
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
      status: {
        type: String,
        enum: ['Married', 'Unmarried', ''],
      },
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
    insightGrade: {
      type: String,
      enum: ['1', '2', '3', '4', '5', '6', ''],
    },
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
    type: mongoose.Schema.ObjectId,
    ref: Collections.user.name,
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.user.name,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const generateSignedUrl = async (doc: any) => {
  let file = doc.genogram;
  if (!file) return;
  if (!file?.filePath) return;

  const signedUrl = await getSignedUrlByKey(file?.filePath);
  delete doc.genogram.filePath;

  if (doc.hasOwnProperty('_doc')) {
    delete doc._doc.genogram.filePath;
    doc._doc.genogram.filePath = signedUrl;
  } else {
    delete doc.genogram.filePath;
    doc.genogram.filePath = signedUrl;
  }
};

patientCaseHistorySchema.pre('findOne', async function (next) {
  this.populate('informantsDetails.relationshipWithPatient');

  this.populate('createdBy', '_id roles firstName lastName');
  this.populate('updatedBy', '_id roles firstName lastName');
  next();
});

patientCaseHistorySchema.pre('find', async function (next) {
  this.populate('informantsDetails.relationshipWithPatient');

  this.populate('createdBy', '_id roles firstName lastName');
  this.populate('updatedBy', '_id roles firstName lastName');
  next();
});

patientCaseHistorySchema.pre('findOneAndUpdate', async function (next) {
  this.populate('informantsDetails.relationshipWithPatient');

  this.populate('createdBy', '_id roles firstName lastName');
  this.populate('updatedBy', '_id roles firstName lastName');
  next();
});

// Post Middleware
patientCaseHistorySchema.post('findOne', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

patientCaseHistorySchema.post('find', function (docs) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (docs?.length > 0) {
    docs.forEach((doc: any) => generateSignedUrl(doc));
  }
});

patientCaseHistorySchema.post('findOneAndUpdate', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;

  if (shouldSkip) return;
  if (doc) generateSignedUrl(doc);
});

const PatientCaseHistory = mongoose.model<IPatientCaseHistory>(
  Collections.patientCaseHistory.name,
  patientCaseHistorySchema
);

export default PatientCaseHistory;
