import ExcelJS from 'exceljs';
import mongoose from 'mongoose';
import Lead from '../models/lead.model';
import * as S3 from '../utils/s3Helper';
import { random } from '../utils/random';
import { IUser } from '../models/user.model';
import { S3Path } from '../constant/s3.path';
import { IBasicObj } from '../interfaces/generics';
import CommonFile from '../models/common.file.model';
import Patient from '../models/patient/patient.model';
import { ICenter } from '../interfaces/model/resources/i.center';
import { IReferredType } from '../interfaces/model/dropdown/i.referredType';
import { IRelationship } from '../interfaces/model/dropdown/i.relationship';
import PatientAdmissionHistory from '../models/patient/patient.admission.history.model';

type QuestionAnswer = { question: string; answer: string };

export const buildWeeklyReport = async () => {
  // Leads Information
  const leads = await Lead.find();
  const leadsPatientId = leads
    .map((el) => el.patientId?.toString())
    .filter((id) => id !== null && id !== undefined);

  // Leads Patient Information
  const patientsFromLead = await Patient.find({ _id: { $in: leadsPatientId } }).lean();
  let patientFromLeadMap: IBasicObj = {};
  patientsFromLead.map((el) => (patientFromLeadMap[el._id.toString()] = el));

  // Rest of Others Patient Information
  const allPatients = await Patient.find({ _id: { $nin: leadsPatientId } }).lean();

  let allPatientIds = allPatients.map((e) => e._id.toString());
  allPatientIds = [...new Set([...allPatientIds, ...leadsPatientId])];
  const allPatientIdMongoDb: any = allPatientIds.map((e) => new mongoose.Types.ObjectId(e));

  // Admission History Data
  const allAdmissionHistoryDocs = await PatientAdmissionHistory.find({
    patientId: { $in: allPatientIdMongoDb },
  })
    .setOptions({ populateFeedback: false })
    .populate('dischargeId caseHistoryId')
    .lean();

  const admissionCounts = allAdmissionHistoryDocs.reduce<Record<string, number>>((acc, doc) => {
    const id = doc.patientId.toString();
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  // patientId => array of admission docs
  const admissionHistoryMap = allAdmissionHistoryDocs.reduce<Record<string, any[]>>((acc, doc) => {
    const id = doc.patientId.toString();
    if (!acc[id]) acc[id] = [];
    acc[id].push(doc);
    return acc;
  }, {});

  // Expand allPatients
  const expandedPatients = allPatients.flatMap((patient) => {
    const count = admissionCounts[patient._id.toString()] || 0;
    if (count <= 1) return [patient]; // keep only once if 0 or 1
    return Array(count).fill(patient); // duplicate as many times as it occurs
  });

  // Expand leads
  const expandedLeads = leads.flatMap((lead) => {
    const patientId = lead?.patientId?.toString();
    const count = patientId ? admissionCounts[patientId!] || 0 : 0;
    if (count <= 1) return [lead]; // keep only once if 0 or 1
    return Array(count).fill(lead);
  });

  function getAdmissionHistoryForDuplicates(patientId: string, count: number) {
    const histories = admissionHistoryMap[patientId] || [];
    // If there are fewer histories than duplicates, repeat last history
    return histories[count] || histories[histories.length - 1] || {};
  }

  let excelRows: any[] = [];
  const admissionHistoryIndex: Record<string, number> = {};

  expandedLeads.forEach((lead) => {
    const patientId = lead.patientId?.toString();
    const patient = patientId ? (patientFromLeadMap[patientId] ?? {}) : {};

    // Count which duplicate we are at
    const index = admissionHistoryIndex[patientId] ?? 0;
    const admissionHistory = patientId ? getAdmissionHistoryForDuplicates(patientId, index) : {};

    admissionHistoryIndex[patientId] = index + 1;

    const mergeLead = _mergeLeadFields(patient, lead);
    excelRows.push(_buildColumns({ ...mergeLead, ...admissionHistory }));
  });

  expandedPatients.forEach((patient) => {
    const patientId = patient._id?.toString();

    const index = admissionHistoryIndex[patientId] ?? 0;
    const admissionHistory = patientId ? getAdmissionHistoryForDuplicates(patientId, index) : {};

    admissionHistoryIndex[patientId] = index + 1;

    excelRows.push(_buildColumns({ ...patient, ...admissionHistory }));
  });

  if (excelRows.length === 0) return;
  const excelFile = await _buildExcelSheet(excelRows);

  const fileName = `patient_weekly_data_${Date.now()}-${random.randomAlphaNumeric(6)}.xlsx`;
  const filePath = S3Path.commonFiles(fileName);

  try {
    await S3.uploadFile(
      filePath,
      excelFile,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    await CommonFile.create({
      fileName: fileName,
      filePath: filePath,
      fileType: 'WEEKLY_REPORT',
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * Helper Functions
 */

const _buildExcelSheet = async (data: IBasicObj[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Weekly Report');

  // Add header row
  const headers = Object.keys(data[0]);
  const headerRow = worksheet.addRow(headers);

  // Freeze the first row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Add data rows
  data.forEach((row) => {
    worksheet.addRow(headers.map((header) => (row as Record<string, any>)[header]));
  });

  // Style headers
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, size: 14 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'A4C2F4' },
    };
  });

  // Auto-width column
  headers.forEach((header, idx) => {
    const columnData = [
      header,
      ...data.map((row) => ((row as Record<string, any>)[header] ?? '').toString()),
    ];

    const maxWidth = Math.max(...columnData.map((c) => _calculateExcelColumnWidth(c))) + 2;

    worksheet.getColumn(idx + 1).width = maxWidth;
  });

  // const fileName = _buildFileName();
  // await workbook.xlsx.writeFile(fileName);

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

const _buildFileName = (): string => {
  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  const formattedDate = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  return `weekly_report_${formattedDate}.xlsx`;
};

const _calculateExcelColumnWidth = (str: string): number => {
  if (!str) return 10;

  // Excel default font (Calibri) renders wide chars wider
  const doubleWidth = str.match(/[A-Z0-9]/g)?.length || 0;
  const normalWidth = str.length - doubleWidth;

  // Estimate width: wide chars ~1.2x normal ones
  const estimatedWidth = normalWidth + doubleWidth * 1.2;

  return Math.ceil(estimatedWidth);
};

const _separateDate = (input: string | Date | null | undefined): [string, string] => {
  if (!input) return ['', ''];

  let dateObj: Date;

  try {
    dateObj = typeof input === 'string' ? new Date(input) : input;

    if (isNaN(dateObj.getTime())) return ['', '']; // Invalid date

    const date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = dateObj.toTimeString().split(' ')[0]; // HH:MM:SS

    return [date, time];
  } catch (err) {
    return ['', ''];
  }
};

const _buildColumns = (data: any) => {
  const [date, time] = _separateDate(data?.leadDateTime);
  const [dob, _] = _separateDate(data?.dob);
  const [centerVisitDate, centerVisitTime] = _separateDate(data?.centerVisitDateTime);
  const [followUpDate] = _separateDate(data?.nextFollowUpDate);
  const [admissionDate] = _separateDate(data?.dateOfAdmission);

  const feedbackString =
    data?.feedbackId?.questionAnswer
      ?.slice()
      .sort((a: QuestionAnswer, b: QuestionAnswer) => a.question.localeCompare(b.question))
      .map((item: { question: string; answer: string }) => `${item.question}: ${item.answer ?? ''}`)
      .join('\n') ?? '';

  return {
    'Lead Date': date,
    'Lead Time': time,
    Status: data?.status,
    'Lead Type': data?.leadType,
    'New Lead': data?.isNewLead == null ? '' : data?.isNewLead ? 'Yes' : 'No',
    'Lead Select': data?.leadSelect,
    'Progress Status': data?.progressStatus,
    'Referral Type': (data?.referralTypeId as IReferredType)?.name,
    'Referral Details': data?.referralDetails,
    'First Name': data?.firstName,
    'Last Name': data?.lastName,
    DOB: dob,
    Age: data?.age,
    Email: data?.email,
    'Country Code': data?.phoneNumberCountryCode,
    'Phone Number': data?.phoneNumber,
    'Alternate Country Code': data?.alternativephoneNumberCountryCode,
    'Alternate Phone Number': data?.alternativeMobileNumber,
    Gender: data?.gender,
    'Guardian Relationship': (data?.guardianNameRelationshipId as IRelationship)?.fullName,
    'Guardian Name': data?.guardianName,
    Country: data?.country,
    'Full Address': data?.fullAddress,
    'Cheif Complaints': data?.chiefComplaints,
    'Admission Type': `${data?.admissionType ?? ''} -- ${data.involuntaryAdmissionType ?? ''}`,
    'Illness Type': data?.illnessType,
    'Center Vist Date': centerVisitDate,
    'Center Vist Time': centerVisitTime,
    'Center Name': (data?.centerId as ICenter)?.centerName,
    'First Person Contacted At Ganaa': data?.firstPersonContactedAtGanaa,
    'Assigned To': `${(data?.assignedTo as IUser)?.firstName ?? ''} ${(data?.assignedTo as IUser)?.lastName ?? ''}`,
    'Next Follow Up Date': followUpDate,
    Comments: data?.commentsString ?? '',
    UHID: data?.uhid,
    'Identification Mark': data?.identificationMark,
    Education: data?.education,
    Area: data?.area,
    'Family Income': data?.familyIncome,
    Religion: data?.religion,
    Language: data?.language,
    'Is Married': data?.isMarried ? 'Yes' : 'No',
    'Number Of Children': data?.numberOfChildren,
    Occupation: data?.occupation,
    'Personal Income': data?.personalIncome,
    'Date of Admission': admissionDate,
    'Current Status': data?.currentStatus,
    'Application For Admission': _isFileUploaded(
      data?.admissionChecklist,
      'applicationForAdmission'
    ),
    'Voluntary Admission Form': _isFileUploaded(data?.admissionChecklist, 'voluntaryAdmissionForm'),
    'In Voluntary Admission Form': _isFileUploaded(
      data?.admissionChecklist,
      'inVoluntaryAdmissionForm'
    ),
    'Minor Admission Form': _isFileUploaded(data?.admissionChecklist, 'minorAdmissionForm'),
    'Family Declaration': _isFileUploaded(data?.admissionChecklist, 'familyDeclaration'),
    'Section 94': _isFileUploaded(data?.admissionChecklist, 'section94'),
    'Capacity Assessment': _isFileUploaded(data?.admissionChecklist, 'capacityAssessment'),
    'Hospital Guideline Form': _isFileUploaded(data?.admissionChecklist, 'hospitalGuidelineForm'),
    'Finacial Counselling': _isFileUploaded(data?.admissionChecklist, 'finacialCounselling'),
    'Orientation Of Family': _isFileUploaded(data?.admissionChecklist, 'orientationOfFamily'),
    'Orientation Of Patient': _isFileUploaded(data?.admissionChecklist, 'orientationOfPatient'),
    'Is Insured': data?.admissionChecklist?.isInsured ? 'Yes' : 'No',
    'Insured Detail': data?.admissionChecklist?.insuredDetail,
    'Insured File': _isFileUploaded(data?.admissionChecklist, 'insuredFile'),
    'Center Name 2': data?.resourceAllocation?.centerId?.centerName ?? '',
    'Room Type': data?.resourceAllocation?.roomTypeId?.name ?? '',
    'Room Number': data?.resourceAllocation?.roomNumberId?.name ?? '',
    'Locker Number': data?.resourceAllocation?.lockerNumberId?.name ?? '',
    'Belongings In Locker': data?.resourceAllocation?.belongingsInLocker ?? '',
    'Assigned Doctor': `${data?.resourceAllocation?.assignedDoctorId?.firstName ?? ''} ${data?.resourceAllocation?.assignedDoctorId?.lastName ?? ''}`,
    'Assigned Therapist': `${data?.resourceAllocation?.assignedTherapistId?.firstName ?? ''} ${data?.resourceAllocation?.assignedDoctorId?.lastName ?? ''}`,
    Nurse: data?.resourceAllocation?.nurse ?? '',
    'Care Staff': data?.resourceAllocation?.careStaff ?? '',
    Allergies: data?.patientReport?.allergiesNames?.map((e: IBasicObj) => e.name).join(', '),
    'Diabetic Status': data?.patientReport?.diabeticStatus ?? '',
    'Hyper Tension': data?.patientReport?.hyperTension ?? '',
    'Heart Disease': data?.patientReport?.heartDisease ?? '',
    'Heart Description': data?.patientReport?.heartDiseaseDescription ?? '',
    'Level Of Risk': data?.patientReport?.levelOfRisk ?? '',
    'Level Of Risk Description': data?.patientReport?.levelOfRiskDescription ?? '',
    'Mother Name': _sanitizeContent(data?.caseHistoryId?.motherName ?? ''),
    'Father Name': _sanitizeContent(data?.caseHistoryId?.fatherName ?? ''),
    'Is Advance Directive': _sanitizeContent(data?.caseHistoryId?.isAdvanceDirectiveSelected ?? ''),
    'Advance Directive': _sanitizeContent(data?.caseHistoryId?.advanceDirective ?? ''),
    'Chief Complaints': _sanitizeContent(data?.caseHistoryId?.chiefComplaints ?? ''),
    'History Of Present Illness [Onset]': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.onset ?? ''
    ),
    'History Of Present Illness [onsetOther]': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.onsetOther ?? ''
    ),
    'History Of Present Illness [course]': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.course ?? ''
    ),
    'History Of Present Illness [courseOther]': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.courseOther ?? ''
    ),
    'History Of Present Illness [progress]': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.progress ?? ''
    ),
    'History of Present Illness': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.historyOfPresentIllness ?? ''
    ),
    'Total Duration Of Illness': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.totalDurationOfIllness ?? ''
    ),
    'Duration This Episode': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.durationThisEpisode ?? ''
    ),
    Predisposing: _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.predisposing ?? ''
    ),
    Perpetuating: _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.perpetuating ?? ''
    ),
    'Precipitating Factors': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.precipitatingFactors ?? ''
    ),
    'Impact Of Present Illness': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.impactOfPresentIllness ?? ''
    ),
    'Negative History': _sanitizeContent(data?.caseHistoryId?.negativeHistory ?? ''),
    'Past Psychiatric History': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.pastPsychiatricHistory ?? ''
    ),
    'past Psychiatric Treatment History': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.pastPsychiatricTreatmentHistory ?? ''
    ),
    'Past Medical History': _sanitizeContent(
      data?.caseHistoryId?.historyOfPresentIllness?.pastMedicalHistory ?? ''
    ),
    'Family History [History Of Psychiatric Illness]': _sanitizeContent(
      data?.caseHistoryId?.familyHistory?.historyofPsychiatricIllness ?? ''
    ),
    'Personal History [birth And Childhood History][Prenatal]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.birthAndChildhoodHistory?.prenatal ?? ''
    ),
    'Personal History [birth And Childhood History][Natal]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.birthAndChildhoodHistory?.natal ?? ''
    ),
    'Personal History [birth And Childhood History][Postnatal]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.birthAndChildhoodHistory?.postnatal ?? ''
    ),
    'Personal History [birth And Childhood History][Developmental Milestone]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.birthAndChildhoodHistory?.developmentalMilestone ?? ''
    ),
    'Personal History [birth And Childhood History][Immunization Status]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.birthAndChildhoodHistory?.immunizationStatus ?? ''
    ),
    'Personal History [Educational History][Complaints At School]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.educationalHistory?.educationalHistory ?? ''
    ),
    'Personal History [Occupational History]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.occupationalHistory ?? ''
    ),
    'Personal History [Sexual History]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.sexualHistory ?? ''
    ),
    'Personal History [Menstrual History] [Age At Menarche]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.menstrualHistory?.ageAtMenarche ?? ''
    ),
    'Personal History [Menstrual History] [Regularity]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.menstrualHistory?.regularity ?? ''
    ),
    'Personal History [Menstrual History] [No Of Days Of Menses]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.menstrualHistory?.noOfDaysOfMenses ?? ''
    ),
    'Personal History [Menstrual History] [Last Menstrual Period]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.menstrualHistory?.lastMenstrualPeriod ?? ''
    ),
    'Personal History [Marital History] [Status]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.maritalHistory?.status ?? ''
    ),
    'Personal History [Marital History] [Spouse Details]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.maritalHistory?.spouseDetails ?? ''
    ),
    'Personal History [religiousHistory]': _sanitizeContent(
      data?.caseHistoryId?.personalHistory?.religiousHistory ?? ''
    ),
    // 'Personal History [substanceUseHistory]': _sanitizeContent(
    //   data?.caseHistoryId?.personalHistory?.substanceUseHistory[0] ?? ''
    // ),
    'Premorbid Personality [Social Relations Wit Family Or Friends Or Colleagues]':
      _sanitizeContent(
        data?.caseHistoryId?.premorbidPersonality?.socialRelationsWitFamilyOrFriendsOrColleagues ??
          ''
      ),
    'Premorbid Personality [Hobbies Or Interests]': _sanitizeContent(
      data?.caseHistoryId?.premorbidPersonality?.hobbiesOrInterests ?? ''
    ),
    'Premorbid Personality [Personality Traits]': _sanitizeContent(
      data?.caseHistoryId?.premorbidPersonality?.personalityTraits ?? ''
    ),
    'Premorbid Personality [Mood]': _sanitizeContent(
      data?.caseHistoryId?.premorbidPersonality?.mood ?? ''
    ),
    'Premorbid Personality [Character Or Attitude To Work Or Responsibility]': _sanitizeContent(
      data?.caseHistoryId?.premorbidPersonality?.characterOrAttitudeToWorkOrResponsibility ?? ''
    ),
    'Premorbid Personality [Habits]': _sanitizeContent(
      data?.caseHistoryId?.premorbidPersonality?.habits ?? ''
    ),

    'Mental Status Examination [General Appearance Behavior] [Kempt And Tidy]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.kemptAndTidy ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [With Drawn]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.withdrawn ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [looking At One Age]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.lookingAtOneAge ??
          ''
      ),
    'Mental Status Examination [General Appearance Behavior] [Over Friendly]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.overfriendly ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Dress Appropriate]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.dressAppropriate ??
        ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Suspicious]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.Suspicious ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Eye Contact]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.eyeContact ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Posture]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.posture ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Cooperative]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.cooperative ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Grimaces]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.grimaces ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Help Seeking]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.helpSeeking ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Guarded]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.guarded ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Ingratiated]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.ingratiated ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Hostile]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.hostile ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Submissive]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior?.submissive ?? ''
    ),
    'Mental Status Examination [General Appearance Behavior] [Psychomotor Activity]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.generalAppearanceBehavior
          ?.psychomotorActivity ?? ''
      ),
    'Mental Status Examination [Speech] [Rate]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.speech?.Rate ?? ''
    ),
    'Mental Status Examination [Speech] [Goal Directed]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.speech?.goalDirected ?? ''
    ),
    'Mental Status Examination [Speech] [Volume]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.speech?.volume ?? ''
    ),
    'Mental Status Examination [Speech] [Spontaneous]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.speech?.spontaneous ?? ''
    ),
    'Mental Status Examination [Speech] [Pitch Or Tone]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.speech?.pitchOrTone ?? ''
    ),
    'Mental Status Examination [Speech] [Coherent]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.speech?.coherent ?? ''
    ),
    'Mental Status Examination [Speech] [Reaction Time]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.speech?.reactionTime ?? ''
    ),
    'Mental Status Examination [Speech] [Relevant]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.speech?.relevant ?? ''
    ),
    'Mental Status Examination [Affect] [Objective]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.affect?.objective ?? ''
    ),
    'Mental Status Examination [Affect] [Subjective]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.affect?.subjective ?? ''
    ),
    'Mental Status Examination [Affect] [Affect]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.affect?.affect ?? ''
    ),
    'Mental Status Examination [Affect] [Range]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.affect?.range ?? ''
    ),
    'Mental Status Examination [Affect] [Reactivity]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.affect?.reactivity ?? ''
    ),
    'Mental Status Examination [Thought] [Stream]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.thought?.stream ?? ''
    ),
    'Mental Status Examination [Thought] [Form]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.thought?.form ?? ''
    ),
    'Mental Status Examination [Thought] [Content]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.thought?.content ?? ''
    ),
    'Mental Status Examination [Thought] [Possession]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.thought?.possession ?? ''
    ),
    'Mental Status Examination [Thought] [Perception]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.thought?.perception ?? ''
    ),
    'Mental Status Examination [Perception] [Hallucination]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.perception?.hallucination ?? ''
    ),
    'Mental Status Examination [Perception] [Hallucination Sample]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.perception?.hallucinationSample ?? ''
    ),
    'Mental Status Examination [Perception] [Illusion]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.perception?.illusion ?? ''
    ),
    'Mental Status Examination [Perception] [Illusion Sample]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.perception?.illusionSample ?? ''
    ),
    'Mental Status Examination [Higher Cognitive Functions] [Orientation] [Time]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.orientation?.time ??
        ''
    ),
    'Mental Status Examination [Higher Cognitive Functions] [Orientation] [Place]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.orientation
          ?.place ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [Orientation] [Person]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.orientation
          ?.person ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [Attention Concentration] [Digit Span Test]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions
          ?.attentionConcentration?.digitSpanTest ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [Attention Concentration] [Serial Subtraction Test]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions
          ?.attentionConcentration?.serialSubtractionTest ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [Memory] [Immediate]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.Immediate ??
        ''
    ),
    'Mental Status Examination [Higher Cognitive Functions] [Memory] [Recent]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.recent ?? ''
    ),
    'Mental Status Examination [Higher Cognitive Functions] [Memory] [Remote]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.memory?.remote ?? ''
    ),
    'Mental Status Examination [Higher Cognitive Functions] [general Intelligence] [General Fund Of Knowledge]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
          ?.generalFundOfKnowledge ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [general Intelligence] [Arithmetic]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
          ?.arithmetic ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [general Intelligence] [Comprehesion]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.generalIntelligence
          ?.comprehesion ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [Abstract Thinking] [Similarities Or Dissimilarities]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.abstractThinking
          ?.similaritiesOrDissimilarities ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [Abstract Thinking] [Proverbs]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.abstractThinking
          ?.proverbs ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [Judgement] [Personal]':
      _sanitizeContent(
        data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.judgement
          ?.personal ?? ''
      ),
    'Mental Status Examination [Higher Cognitive Functions] [Judgement] [Social]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.judgement?.social ??
        ''
    ),
    'Mental Status Examination [Higher Cognitive Functions] [Judgement] [Test]': _sanitizeContent(
      data?.caseHistoryId?.mentalStatusExamination?.higherCognitiveFunctions?.judgement?.test ?? ''
    ),
    'Insight [Insight Grade]': _sanitizeContent(data?.caseHistoryId?.insight?.insightGrade ?? ''),
    'Insight [Insight]': _sanitizeContent(data?.caseHistoryId?.insight?.insight ?? ''),

    'Diagnostic Formulation [Description]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.description ?? ''
    ),
    'Diagnostic Formulation [Provisional Diagnosis]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.provisionalDiagnosis ?? ''
    ),
    'Diagnostic Formulation [Differential Diagnosis]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.differentialDiagnosis ?? ''
    ),
    'Diagnostic Formulation [Target Symptoms]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.targetSymptoms ?? ''
    ),
    'Diagnostic Formulation [Pharmacological Plan]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.pharmacologicalPlan ?? ''
    ),
    'Diagnostic Formulation [Nonpharmacological Plan]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.nonPharmacologicalPlan ?? ''
    ),
    'Diagnostic Formulation [Reviews Required]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.reviewsRequired ?? ''
    ),
    'Diagnostic Formulation [Psychological Assessments]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.psychologicalAssessments ?? ''
    ),
    'Diagnostic Formulation [Investigations]': _sanitizeContent(
      data?.caseHistoryId?.diagnosticFormulation?.investigations ?? ''
    ),
    Genogram: data?.caseHistoryId?.genogram?.fileName ? 'YES' : 'No',
    'Date of Discharge': data?.dischargeId?.date ?? '',
    'Discharge Status': data?.dischargeId?.status ?? '',
    'Reason of Discharge': data?.dischargeId?.reason ?? '',
    'Condition at the Time of Discharge': _sanitizeContent(
      data?.dischargeId?.conditionAtTheTimeOfDischarge ?? ''
    ),
    'Discharge [Chief Complaints]': _sanitizeContent(data?.dischargeId?.chiefComplaints ?? ''),
    'Discharge [History Of Present Illness]': _sanitizeContent(
      data?.dischargeId?.historyOfPresentIllness ?? ''
    ),
    'Discharge [Physical Examination At Admission]': _sanitizeContent(
      data?.dischargeId?.physicalExaminationAtAdmission ?? ''
    ),
    'Discharge [Mental Status Examination]': _sanitizeContent(
      data?.dischargeId?.mentalStatusExamination ?? ''
    ),
    'Discharge [Hospitalisation Summary]': _sanitizeContent(
      data?.dischargeId?.hospitalisationSummary ?? ''
    ),
    'Discharge [Investigation]': _sanitizeContent(data?.dischargeId?.investigation ?? ''),
    'Discharge [Prescription Date Time]': _sanitizeContent(
      data?.dischargeId?.prescriptionDateTime ?? ''
    ),
    // 'Discharge [Prescription Medicine]': _sanitizeContent(
    //   data?.dischargeId?.prescriptionMedicine?.[0] ?? ''
    // ),
    'Discharge [Refer Back To]': _sanitizeContent(data?.dischargeId?.referBackTo ?? ''),
    'Discharge [Advise And Plan]': _sanitizeContent(data?.dischargeId?.adviseAndPlan ?? ''),
    'User Feedback': _sanitizeContent(feedbackString ?? ''),
  };
};

const _isFileUploaded = (data: IBasicObj, key: string) => {
  if (data?.hasOwnProperty(key)) {
    return data[key].length > 0 ? 'Yes' : 'No';
  } else {
    return 'No';
  }
};

const _mergeLeadFields = (primary: any = {}, fallback: any = {}) => {
  const get = (val: any) => (val === undefined || val === null || val === '' ? undefined : val);

  let commentsString = '';
  if (fallback.comments) {
    commentsString =
      fallback.comments
        ?.map((item: any) => {
          const date = new Date(item.createdAt).toISOString().replace('T', ' ').split('.')[0]; // format YYYY-MM-DD HH:mm:ss
          const name = `${item.userId.firstName} ${item.userId.lastName}`;
          const commentText = item.comment.replace(/<[^>]+>/g, ''); // remove HTML tags
          return `[${date} : ${name}] ${commentText}`;
        })
        .join('\n') ?? '';
  }

  return {
    leadDateTime: get(primary.leadDateTime) ?? fallback.leadDateTime,
    status: get(primary.status) ?? fallback.status,
    leadType: get(primary.leadType) ?? fallback.leadType,
    isNewLead: primary.isNewLead == null ? fallback.isNewLead : primary.isNewLead,
    leadSelect: get(primary.leadSelect) ?? fallback.leadSelect,
    progressStatus: get(primary.progressStatus) ?? fallback.progressStatus,
    referralTypeId: get(primary.referralTypeId) ? primary.referralTypeId : fallback.referralTypeId,
    referralDetails: get(primary.referralDetails) ?? fallback.referralDetails,
    firstName: get(primary.firstName) ?? fallback.firstName,
    lastName: get(primary.lastName) ?? fallback.lastName,
    dob: get(primary.dob) ?? fallback.dob,
    age: get(primary.age) ?? fallback.age,
    email: get(primary.email) ?? fallback.email,
    phoneNumberCountryCode: get(primary.phoneNumberCountryCode) ?? fallback.phoneNumberCountryCode,
    phoneNumber: get(primary.phoneNumber) ?? fallback.phoneNumber,
    alternativephoneNumberCountryCode:
      get(primary.alternativephoneNumberCountryCode) ?? fallback.alternativephoneNumberCountryCode,
    alternativeMobileNumber:
      get(primary.alternativeMobileNumber) ?? fallback.alternativeMobileNumber,
    gender: get(primary.gender) ?? fallback.gender,
    guardianNameRelationshipId: get(primary.guardianNameRelationshipId)
      ? primary.guardianNameRelationshipId
      : fallback.guardianNameRelationshipId,
    guardianName: get(primary.guardianName) ?? fallback.guardianName,
    country: get(primary.country) ?? fallback.country,
    fullAddress: get(primary.fullAddress) ?? fallback.fullAddress,
    chiefComplaints: get(primary.chiefComplaints) ?? fallback.chiefComplaints,
    admissionType: get(primary.admissionType) ?? fallback.admissionType,
    involuntaryAdmissionType:
      get(primary.involuntaryAdmissionType) ?? fallback.involuntaryAdmissionType,
    illnessType: get(primary.illnessType) ?? fallback.illnessType,
    centerVisitDateTime: get(primary.centerVisitDateTime) ?? fallback.centerVisitDateTime,
    centerId: get(primary.centerId) ? primary.centerId : fallback.centerId,
    firstPersonContactedAtGanaa:
      get(primary.firstPersonContactedAtGanaa) ?? fallback.firstPersonContactedAtGanaa,
    assignedTo: get(primary.assignedTo) ? primary.assignedTo : fallback.assignedTo,
    followUpDate: get(primary.followUpDate) ?? fallback.followUpDate,
    uhid: get(primary.uhid) ?? fallback.uhid,
    identificationMark: get(primary.identificationMark) ?? fallback.identificationMark,
    education: get(primary.education) ?? fallback.education,
    area: get(primary.area) ?? fallback.area,
    familyIncome: get(primary.familyIncome) ?? fallback.familyIncome,
    religion: get(primary.religion) ?? fallback.religion,
    language: get(primary.language) ?? fallback.language,
    isMarried: primary.isMarried != null ? primary.isMarried : fallback.isMarried,
    numberOfChildren: get(primary.numberOfChildren) ?? fallback.numberOfChildren,
    occupation: get(primary.occupation) ?? fallback.occupation,
    personalIncome: get(primary.personalIncome) ?? fallback.personalIncome,
    commentsString: commentsString,
  };
};

const _getReportRange = () => {
  const now = new Date();

  // Create endDate = this week's Sunday 12:30 AM UTC
  let endDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 30, 0, 0)
  );

  // Move endDate back to Sunday (in UTC)
  endDate.setUTCDate(endDate.getUTCDate() - endDate.getUTCDay());

  // If current UTC time is before this Sunday 12:30 AM, shift back one week
  if (now < endDate) {
    endDate.setUTCDate(endDate.getUTCDate() - 7);
  }

  // Start = 7 days before endDate, at 12:31 AM UTC
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 7);
  startDate.setUTCMinutes(startDate.getUTCMinutes() + 1);

  return { startDate, endDate };
};

const _sanitizeContent = (html: string): string => {
  if (!html) return '';

  let text = String(html);

  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<\/p>|<br\s*\/?>/gi, '\n').replace(/<\/h[1-6]>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
};
