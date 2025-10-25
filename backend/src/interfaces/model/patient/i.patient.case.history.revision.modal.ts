import mongoose, { ObjectId } from 'mongoose';
import { IPatient } from './i.patient';
import { IBasicFile } from '../../generics';
import { IUser } from '../../../models/user.model';
import { IRelationship } from '../dropdown/i.relationship';
import { IPatientCaseHistory } from './i.patient.case.history';
import { IPatientAdmissionHistory } from './i.patient.admission.history';

export interface IInsight {
  insightGrade?: string;
  insight: string;
}

export interface IDiagnosticFormulation {
  description?: string;
  provisionalDiagnosis?: string;
  differentialDiagnosis?: string;
  targetSymptoms?: string;
  pharmacologicalPlan?: string;
  nonPharmacologicalPlan?: string;
  reviewsRequired?: string;
  psychologicalAssessments?: string;
  investigations?: string;
}

export interface IMentalStatusExamination {
  generalAppearanceBehavior: {
    kemptAndTidy?: string;
    withdrawn?: string;
    lookingAtOneAge?: string;
    overfriendly?: string;
    dressAppropriate?: string;
    suspicious?: string;
    eyeContact?: string;
    posture?: string;
    cooperative?: string;
    grimaces?: string;
    helpSeeking?: string;
    guarded?: string;
    ingratiated?: string;
    hostile?: string;
    submissive?: string;
    psychomotorActivity?: string;
  };
  speech: {
    rate?: string;
    goalDirected?: string;
    volume?: string;
    spontaneous?: string;
    pitchOrTone?: string;
    coherent?: string;
    reactionTime?: string;
    relevant?: string;
  };
  affect: {
    objective?: string;
    subjective?: string;
    affect?: string;
    range?: string;
  };
  thought: {
    stream?: string;
    form?: string;
    content?: string;
    possession?: string;
  };
  perception: {
    hallucination?: string;
    hallucinationSample?: string;
    illusion?: string;
    illusionSample?: string;
  };
  higherCognitiveFunctions: {
    orientation: {
      time?: string;
      place?: string;
      person?: string;
    };
    attentionConcentration: {
      digitSpanTest?: string;
      serialSubtractionTest?: string;
    };
    memory: {
      immediate?: string;
      recent?: string;
      remote?: string;
    };
    generalIntelligence: {
      generalFundOfKnowledge?: string;
      arithmetic?: string;
      comprehesion?: string;
    };
    abstractThinking: {
      similaritiesOrDissimilarities?: string;
      proverbs?: string;
    };
    judgement: {
      personal?: string;
      social?: string;
      test?: string;
    };
  };
}

export interface IPremorbidPersonality {
  socialRelationsWitFamilyOrFriendsOrColleagues?: string;
  hobbiesOrInterests?: string;
  personalityTraits?: string;
  mood?: string;
  characterOrAttitudeToWorkOrResponsibility?: string;
  habits?: string;
}

export interface IPersonalHistory {
  birthAndChildhoodHistory?: {
    prenatal?: string;
    natal?: string;
    postnatal?: string;
    developmentalMilestone?: string;
    immunizationStatus?: string;
  };
  educationalHistory?: {
    complaintsAtSchool?: string;
  };
  occupationalHistory?: string;
  sexualHistory?: string;
  menstrualHistory: {
    ageAtMenarche?: string;
    regularity?: string;
    noOfDaysOfMenses?: string;
    lastMenstrualPeriod?: string;
  };
  maritalHistory: {
    status: string;
    spouseDetails: string;
  };
  religiousHistory?: string;
  substanceUseHistory: {
    ageAtFirstUse?: string;
    substanceUsed?: string;
    duration?: string;
    abstinencePeriodAndReason?: string;
    relapsesAndReason?: string;
    averageDose?: string;
    maximumDose?: string;
    lastIntake?: string;
  };
}

export interface IFamilyHistory {
  historyofPsychiatricIllness?: string;
}

export interface IHistoryOfPresentIllness {
  onset?: string;
  course?: string;
  progress?: string;
  totalDurationOfIllness?: string;
  durationThisEpisode?: string;
  precipitatingFactors?: string;
  impactOfPresentIllness?: string;
  historyOfPresentIllness?: string;
  negativeHistory?: string;
  pastPsychiatricHistory?: string;
  pastPsychiatricTreatmentHistory?: string;
  pastMedicalHistory?: string;
}

export interface IInformantsDetails {
  name?: string;
  relationshipWithPatient?: ObjectId | IRelationship;
  reliabilityAndAdequacy?: string;
  knownToPatient?: string;
}

export interface IPatientCaseHistoryRevision extends mongoose.Document {
  originalId?: ObjectId | IPatientCaseHistory;
  revision: number;
  isDeleted?: boolean;

  patientId: ObjectId | IPatient;
  patientAdmissionHistoryId: ObjectId | IPatientAdmissionHistory;

  motherName?: string;
  fatherName?: string;
  isAdvanceDirectiveSelected?: Boolean | string;
  advanceDirective?: string;
  informantsDetails?: IInformantsDetails[];
  chiefComplaints?: string;
  historyOfPresentIllness?: IHistoryOfPresentIllness;
  familyHistory?: IFamilyHistory;
  personalHistory?: IPersonalHistory;
  premorbidPersonality?: IPremorbidPersonality;
  mentalStatusExamination?: IMentalStatusExamination;
  insight?: IInsight;
  diagnosticFormulation?: IDiagnosticFormulation;
  genogram?: IBasicFile;

  updatedBy?: IUser;
  createdBy?: IUser;

  createdAt?: Date;
}
