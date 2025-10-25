// Global Import
import mongoose, { Model, ObjectId } from 'mongoose';
import Collections from '../../constant/collections';
import { getSignedUrlByKey } from '../../utils/s3Helper';
import { IPatientAdmissionHistory } from '../../interfaces/model/patient/i.patient.admission.history';

export interface IPatientAdmissionHistoryModel extends Model<IPatientAdmissionHistory> {
  getLatestPatientHistory(
    patientIds: ObjectId[]
  ): Promise<Record<string, IPatientAdmissionHistory>>;
}

const patientAdmissionHistorySchema = new mongoose.Schema<IPatientAdmissionHistory>({
  patientId: {
    type: mongoose.Schema.ObjectId,
    ref: Collections.patient.name,
    required: [true, 'Patient ID is Mandatory Field'],
    index: true,
  },

  dateOfAdmission: {
    type: Date,
    required: [true, 'Date of Admission is Mandatory Field'],
    index: true,
  },

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
  illnessType: {
    type: String,
    enum: ['Addiction', 'Mental Disorder', 'Addiction & Mental Disorder'],
  },

  // Admission Type
  admissionType: {
    type: String,
    enum: ['Voluntary', 'Involuntary'],
  },
  involuntaryAdmissionType: {
    type: String,
    enum: ['Rescued', 'Brought by family'],
  },

  // Patient Status
  currentStatus: {
    type: String,
    default: 'Registered',
    enum: ['Registered', 'Inpatient', 'Discharge Initiated', 'Discharged'],
  },

  // Admission Checklist
  admissionChecklist: {
    applicationForAdmission: [{ fileName: { type: String }, filePath: { type: String } }],
    form90: [{ fileName: { type: String }, filePath: { type: String } }],
    voluntaryAdmissionForm: [{ fileName: { type: String }, filePath: { type: String } }],
    inVoluntaryAdmissionForm: [{ fileName: { type: String }, filePath: { type: String } }],
    minorAdmissionForm: [{ fileName: { type: String }, filePath: { type: String } }],
    familyDeclaration: [{ fileName: { type: String }, filePath: { type: String } }],
    section94: [{ fileName: { type: String }, filePath: { type: String } }],
    capacityAssessment: [{ fileName: { type: String }, filePath: { type: String } }],
    admissionAssessment: [{ fileName: { type: String }, filePath: { type: String } }],
    hospitalGuidelineForm: [{ fileName: { type: String }, filePath: { type: String } }],
    finacialCounselling: [{ fileName: { type: String }, filePath: { type: String } }],
    orientationOfFamily: [{ type: String }],
    orientationOfPatient: [{ type: String }],
    isInsured: { type: Boolean },
    insuredDetail: { type: String },
    insuredFile: [{ fileName: { type: String }, filePath: { type: String } }],
  },

  // Resource Allocation
  resourceAllocation: {
    centerId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.center.name,
    },
    roomTypeId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.roomType.name,
    },
    roomNumberId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.roomNumber.name,
    },
    lockerNumberId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.lockerNumber.name,
    },
    belongingsInLocker: {
      type: String,
      trim: true,
    },
    assignedDoctorId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.user.name,
    },
    assignedTherapistId: {
      type: mongoose.Schema.ObjectId,
      ref: Collections.user.name,
    },
    nurse: {
      type: String,
    },
    careStaff: {
      type: String,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  resourceDiscount: [
    {
      key: String,
      roomNumber: String,
      center: String,
      roomType: String,
      roomTypeId: String,
      totalNumberOfDaysSpent: Number,
      startDate: Date,
      endDate: Date,
      discountPercentage: Number,
      pricePerDayPerBed: Number,
    },
  ],

  // Patient Test Report
  patientReport: {
    injuriesDetails: [
      {
        injuryName: {
          type: String,
        },
        fileUrls: [
          {
            fileName: {
              type: String,
            },
            filePath: {
              type: String,
            },
          },
        ],
      },
    ],

    allergiesNames: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: Collections.allergy.name,
    },
    allergiesFiles: [
      {
        fileName: {
          type: String,
        },
        filePath: {
          type: String,
        },
      },
    ],
    diabeticStatus: {
      type: String,
      enum: ['Diabetic', 'Non Diabetic'],
    },
    hyperTension: {
      type: String,
      enum: ['Yes', 'No'],
    },
    heartDisease: {
      type: String,
      enum: ['Yes', 'No'],
    },
    heartDiseaseDescription: {
      type: String,
    },
    levelOfRisk: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
    },
    levelOfRiskDescription: {
      type: String,
    },
    previousTreatmentRecord: [
      {
        fileName: {
          type: String,
        },
        filePath: {
          type: String,
        },
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
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
  if (!doc) return;

  // Process patientReport
  if (doc.patientReport && doc.patientReport.path) {
    const signedUrl = await getSignedUrlByKey(doc.patientReport.path);
    let report = { ...doc.patientReport };
    delete report.path;

    if (doc.hasOwnProperty('_doc')) {
      delete doc._doc.patientReport;
      doc._doc.patientReport = report;
      doc._doc.patientReport.url = signedUrl;
    } else {
      delete doc.patientReport;
      doc.patientReport = report;
      doc.patientReport.url = signedUrl;
    }
  }

  // Process admissionChecklist
  const checklistFields = [
    'applicationForAdmission',
    'voluntaryAdmissionForm',
    'inVoluntaryAdmissionForm',
    'form90',
    'minorAdmissionForm',
    'familyDeclaration',
    'section94',
    'capacityAssessment',
    'admissionAssessment', 
    'hospitalGuidelineForm',
    'finacialCounselling',
    'insuredFile',
  ];

  if (doc.admissionChecklist) {
    for (const field of checklistFields) {
      const files = doc.admissionChecklist[field];
      if (Array.isArray(files)) {
        const processedFiles = await Promise.all(
          files.map(async (file: { fileName: string; filePath: string }) => ({
            fileName: file.fileName,
            filePath: file.filePath,
            fileUrl: await getSignedUrlByKey(file.filePath),
          }))
        );

        if (doc.hasOwnProperty('_doc')) {
          doc._doc.admissionChecklist[field] = processedFiles;
        } else {
          doc.admissionChecklist[field] = processedFiles;
        }
      }
    }
    
  }

  // Process Medical Report
  const Report = ['allergiesFiles', 'previousTreatmentRecord', 'injuriesDetails'];
  if (doc.patientReport) {
    for (const field of Report) {
      if (Array.isArray(doc.patientReport[field])) {
        if (field == 'allergiesFiles' || field == 'previousTreatmentRecord') {
          const files = doc.patientReport[field];

          // Convert array of file paths to array of objects with fileUrl and filePath
          const processedFiles = await Promise.all(
            files.map(async (file: { fileName: string; filePath: string }) => ({
              fileName: file.fileName,
              filePath: file.filePath,
              fileUrl: await getSignedUrlByKey(file.filePath),
            }))
          );
          if (doc.hasOwnProperty('_doc')) {
            doc._doc.patientReport[field] = processedFiles;
          } else {
            doc.patientReport[field] = processedFiles;
          }
        }
        if (field === 'injuriesDetails') {
          const injuries = doc.patientReport[field];

          // Convert fileUrls inside each injury object to signed URLs
          const processedInjuries = await Promise.all(
            injuries.map(
              async (injury: {
                injuryName: string;
                fileUrls: { fileName: string; filePath: string }[];
              }) => ({
                injuryName: injury.injuryName,
                fileUrls: await Promise.all(
                  (injury.fileUrls || []).map(
                    async (file: { fileName: string; filePath: string }) => ({
                      fileName: file.fileName,
                      filePath: file.filePath,
                      fileUrl: await getSignedUrlByKey(file.filePath),
                    })
                  )
                ),
              })
            )
          );

          if (doc.hasOwnProperty('_doc')) {
            doc._doc.patientReport[field] = processedInjuries;
          } else {
            doc.patientReport[field] = processedInjuries;
          }
        }
      }
    }
  }
};

patientAdmissionHistorySchema.pre('findOne', async function (next) {
  const shouldSkip = this.getOptions().skipResAllPopulate ?? false;
  const shouldPopulateUser = this.getOptions().populateUser ?? false;
  const shouldPopulateFeedback = this.getOptions().populateFeedback ?? false;

  // Resoure Allocation Info
  if (!shouldSkip) {
    this.populate('resourceAllocation.centerId', '_id centerName googleMapLink');
    this.populate('resourceAllocation.roomTypeId', '_id name centerId');
    this.populate('resourceAllocation.roomNumberId', '_id name roomTypeId totalBeds');
    this.populate('resourceAllocation.lockerNumberId', '_id name centerId');
    this.populate('resourceAllocation.assignedDoctorId', '_id roleId firstName lastName');
    this.populate('resourceAllocation.assignedTherapistId', '_id roleId firstName lastName');
  }

  // Feedback Information
  if (!shouldPopulateFeedback) {
    this.populate('feedbackId', '_id questionAnswer status');
  }

  // Populate User Info
  if (!shouldPopulateUser) {
    this.populate('createdBy', '_id roleId firstName lastName');
    this.populate('updatedBy', '_id roleId firstName lastName');
  }

  next();
});

patientAdmissionHistorySchema.pre('find', async function (next) {
  const shouldSkip = this.getOptions().skipResAllPopulate ?? false;
  const shouldPopulateUser = this.getOptions().populateUser ?? false;
  const shouldPopulateFeedback = this.getOptions().populateFeedback ?? false;

  // Resoure Allocation Info
  if (!shouldSkip) {
    this.populate('resourceAllocation.centerId', '_id centerName googleMapLink');
    this.populate('resourceAllocation.roomTypeId', '_id name centerId');
    this.populate('resourceAllocation.roomNumberId', '_id name roomTypeId totalBeds');
    this.populate('resourceAllocation.lockerNumberId', '_id name centerId');
    this.populate('resourceAllocation.assignedDoctorId', '_id roleId firstName lastName');
    this.populate('resourceAllocation.assignedTherapistId', '_id roleId firstName lastName');
  }

  // Feedback Information
  if (!shouldPopulateFeedback) {
    this.populate('feedbackId', '_id questionAnswer status');
  }

  // Populate User Info
  if (!shouldPopulateUser) {
    this.populate('createdBy', '_id roleId firstName lastName');
    this.populate('updatedBy', '_id roleId firstName lastName');
  }

  next();
});

patientAdmissionHistorySchema.pre('findOneAndUpdate', async function (next) {
  const shouldSkip = this.getOptions().skipResAllPopulate ?? false;
  const shouldPopulateUser = this.getOptions().populateUser ?? false;
  const shouldPopulateFeedback = this.getOptions().populateFeedback ?? false;

  // Resoure Allocation Info
  if (!shouldSkip) {
    this.populate('resourceAllocation.centerId', '_id centerName googleMapLink');
    this.populate('resourceAllocation.roomTypeId', '_id name centerId');
    this.populate('resourceAllocation.roomNumberId', '_id name roomTypeId totalBeds');
    this.populate('resourceAllocation.lockerNumberId', '_id name centerId');
    this.populate('resourceAllocation.assignedDoctorId', '_id roleId firstName lastName');
    this.populate('resourceAllocation.assignedTherapistId', '_id roleId firstName lastName');
  }

  // Feedback Information
  if (!shouldPopulateFeedback) {
    this.populate('feedbackId', '_id questionAnswer status');
  }

  // Populate User Info
  if (!shouldPopulateUser) {
    this.populate('createdBy', '_id roleId firstName lastName');
    this.populate('updatedBy', '_id roleId firstName lastName');
  }

  next();
});

patientAdmissionHistorySchema.post('findOne', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;
  if (shouldSkip) return;

  if (doc) generateSignedUrl(doc);
});

patientAdmissionHistorySchema.post('find', function (docs) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;
  if (shouldSkip) return;

  if (docs?.length > 0) {
    docs.forEach((doc: any) => generateSignedUrl(doc));
  }
});

patientAdmissionHistorySchema.post('findOneAndUpdate', function (doc) {
  const shouldSkip = this.getOptions().skipUrlGeneration ?? false;
  if (shouldSkip) return;

  if (doc) generateSignedUrl(doc);
});

/**
 * Static Functions on Schema
 */
patientAdmissionHistorySchema.statics.getLatestPatientHistory = async (patientIds: ObjectId[]) => {
  const admissionHistoryDocs = await PatientAdmissionHistory.aggregate([
    { $match: { patientId: { $in: patientIds } } },
    { $sort: { createdAt: -1 } },
    { $group: { _id: '$patientId', latestRecord: { $first: '$$ROOT' } } },
    { $replaceRoot: { newRoot: '$latestRecord' } },
    {
      $lookup: {
        from: Collections.center.d,
        localField: 'resourceAllocation.centerId',
        foreignField: '_id',
        as: 'resourceAllocation.centerId',
      },
    },
    { $unwind: { path: '$resourceAllocation.centerId', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: Collections.roomType.d,
        localField: 'resourceAllocation.roomTypeId',
        foreignField: '_id',
        as: 'resourceAllocation.roomTypeId',
      },
    },
    { $unwind: { path: '$resourceAllocation.roomTypeId', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: Collections.roomNumber.d,
        localField: 'resourceAllocation.roomNumberId',
        foreignField: '_id',
        as: 'resourceAllocation.roomNumberId',
      },
    },
    { $unwind: { path: '$resourceAllocation.roomNumberId', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: Collections.lockerNumber.d,
        localField: 'resourceAllocation.lockerNumberId',
        foreignField: '_id',
        as: 'resourceAllocation.lockerNumberId',
      },
    },
    { $unwind: { path: '$resourceAllocation.lockerNumberId', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: Collections.user.d,
        let: { assignedDoctorId: '$resourceAllocation.assignedDoctorId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$assignedDoctorId'] } } },
          { $project: { _id: 1, firstName: 1, lastName: 1, gender: 1, roleId: 1 } },
        ],
        as: 'resourceAllocation.assignedDoctorId',
      },
    },
    { $unwind: { path: '$resourceAllocation.assignedDoctorId', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: Collections.user.d,
        let: { assignedTherapistId: '$resourceAllocation.assignedTherapistId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$assignedTherapistId'] } } },
          { $project: { _id: 1, firstName: 1, lastName: 1, gender: 1, roleId: 1 } },
        ],
        as: 'resourceAllocation.assignedTherapistId',
      },
    },
    {
      $unwind: {
        path: '$resourceAllocation.assignedTherapistId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: Collections.relationship.d,
        localField: 'nominatedRelationWithPatientId',
        foreignField: '_id',
        as: 'nominatedRelationWithPatientId',
      },
    },
    {
      $unwind: {
        path: '$nominatedRelationWithPatientId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: Collections.relationship.d,
        localField: 'payerRelationWithPatientId',
        foreignField: '_id',
        as: 'payerRelationWithPatientId',
      },
    },
    {
      $unwind: {
        path: '$payerRelationWithPatientId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: Collections.patientDischarge.d,
        localField: 'dischargeId',
        foreignField: '_id',
        as: 'dischargeId',
      },
    },
    {
      $unwind: {
        path: '$dischargeId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: Collections.patientFeedback.d,
        localField: 'feedbackId',
        foreignField: '_id',
        as: 'feedbackId',
      },
    },
    {
      $unwind: {
        path: '$feedbackId',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: Collections.allergy.d,
        localField: 'patientReport.allergiesNames',
        foreignField: '_id',
        as: 'patientReport.allergiesNames',
      },
    },
  ]);

  const admissionHistoryMap: Record<string, IPatientAdmissionHistory> = {};

  await Promise.all(
    admissionHistoryDocs.map(async (doc) => {
      await generateSignedUrl(doc);
      admissionHistoryMap[doc.patientId.toString()] = doc;
    })
  );

  return admissionHistoryMap;
};

const PatientAdmissionHistory = mongoose.model<
  IPatientAdmissionHistory,
  IPatientAdmissionHistoryModel
>(Collections.patientAdmissionHistory.name, patientAdmissionHistorySchema);

export default PatientAdmissionHistory;
