/* eslint-disable @typescript-eslint/no-explicit-any */
import { capitalizeFirstLetter, formatDate, formatId } from "@/utils/formater";
import doctorpdfheader from "@/assets/images/ganaa-notes.png";
import { useState } from "react";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { Loader } from "@/components";
// utils/pdfmake.ts
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import handleError from "@/utils/handleError";

(pdfMake as typeof pdfMake & { vfs: any }).vfs = (pdfFonts as any).vfs;

const toBase64 = async (url: string | URL | Request) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result); // base64 string
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const DownloadCaseHistory = ({
  data,
  familyDetails,
  button
}: {
  data?: any;
  button: React.ReactNode;
  familyDetails?: any;
}) => {
  const [loading, setloading] = useState(false);

  const generatePdf = async (data: any) => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${now.getFullYear()}-${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    try {
      setloading(true);
      const image = (await toBase64(doctorpdfheader)) as string;

      const docDefinition: TDocumentDefinitions = {
        pageMargins: [20, 80, 20, 20],
        header: function () {
          return {
            stack: [
              {
                image: image, // ← your base64 logo here
                width: 100, // adjust size
                alignment: "center",
                margin: [0, 10, 0, 5]
              },
              {
                text: "Case History",
                alignment: "center",
                fontSize: 20,
                bold: true,
                margin: [0, 0, 0, 10]
              }
            ]
          };
        },

        content: [
          { text: "Patient Details", style: "header" },
          {
            table: {
              widths: ["25%", "25%", "25%", "25%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Name", style: "label" },
                      { text: `${data.firstName} ${data.lastName}` }
                    ]
                  },
                  { stack: [{ text: "UHID", style: "label" }, { text: formatId(data.UHID) }] },
                  { stack: [{ text: "Gender", style: "label" }, { text: data?.gender || "" }] },
                  {
                    stack: [
                      { text: "Admission Date", style: "label" },
                      { text: data?.admissionDate ? formatDate(data?.admissionDate) : "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Educational Qualification", style: "label" },
                      { text: capitalizeFirstLetter(data?.education) }
                    ]
                  },
                  {
                    stack: [
                      { text: "Occupation", style: "label" },
                      { text: capitalizeFirstLetter(data?.occupation) }
                    ]
                  },
                  {
                    stack: [
                      { text: "Marital Status", style: "label" },
                      { text: data?.ismarried === true ? "Yes" : "No" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Religion ", style: "label" },
                      { text: capitalizeFirstLetter(data?.religion) }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Mother’s Name", style: "label" },
                      { text: data?.motherName || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Father’s Name", style: "label" },
                      { text: data?.fatherName || "" }
                    ]
                  },
                  {
                    stack: [{ text: "Nationality", style: "label" }, { text: data?.country || "" }]
                  },
                  {
                    stack: [
                      { text: "Personal Income", style: "label" },
                      { text: data?.personalIncome || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Family Income", style: "label" },
                      { text: data?.familyIncome || "" }
                    ]
                  },
                  {
                    stack: [{ text: "Address", style: "label" }, { text: data?.address || "" }]
                  },
                  {
                    stack: [
                      { text: "Type of Admission", style: "label" },
                      { text: data?.involuntaryAdmissionType || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Nominated representative", style: "label" },
                      {
                        text: capitalizeFirstLetter(
                          familyDetails?.find((data: { infoType: string[] }) =>
                            data.infoType?.includes("Nominated Representative")
                          )?.name || "--"
                        )
                      }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Identification Mark", style: "label" },
                      { text: capitalizeFirstLetter(data.identificationMark) }
                    ]
                  },
                  {
                    stack: [
                      { text: "Advance Directive", style: "label" },
                      { text: data.isAdvanceDirectiveSelected === true ? "Yes" : "NO" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Advance Directive (Details)", style: "label" },
                      { text: data.advanceDirective || "" }
                    ]
                  },
                  {}
                ]
              ]
            },
            margin: [0, 10, 0, 20]
          },

          { text: "Patient Accompanied By", style: "header" },
          {
            table: {
              widths: ["20%", "20%", "20%", "20%", "20%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Name", style: "label" },
                      {
                        text: capitalizeFirstLetter(
                          familyDetails.find((data: { infoType: string[] }) =>
                            data.infoType?.includes("Nominated Representative")
                          )?.name || "--"
                        )
                      }
                    ]
                  },
                  {
                    stack: [
                      { text: "Age", style: "label" },
                      {
                        text: capitalizeFirstLetter(
                          familyDetails
                            .find((data: { infoType: string[] }) =>
                              data.infoType?.includes("Nominated Representative")
                            )
                            ?.age?.toString() || "--"
                        )
                      }
                    ]
                  },
                  {
                    stack: [
                      { text: "Relationship", style: "label" },
                      {
                        text: capitalizeFirstLetter(
                          familyDetails.find((data: { infoType: string[] }) =>
                            data.infoType?.includes("Nominated Representative")
                          )?.relationshipId?.shortName || "--"
                        )
                      }
                    ]
                  },
                  {
                    stack: [
                      { text: "Referral Type", style: "label" },
                      { text: data?.referredTypeId || "--" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Referral Details", style: "label" },
                      { text: capitalizeFirstLetter(data?.referralDetails) }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 10, 0, 20]
          },
          { text: "Informants Details", style: "header" },
          //later we will do
          {
            table: {
              widths: ["25%", "25%", "25%", "25%"],
              body: (data.informantsDetails ?? []).map((value: any, index: number) => [
                {
                  stack: [{ text: "Name", style: "label" }, { text: value.name || "" }]
                },
                {
                  stack: [
                    { text: "Relationship with Patient", style: "label" },
                    { text: data.informantsDetails?.[index]?.relationshipWithPatient?.label || "" }
                  ]
                },
                {
                  stack: [
                    { text: "Reliability & Adequacy", style: "label" },
                    { text: value.reliabilityAndAdequacy || "" }
                  ]
                },
                {
                  stack: [
                    { text: "Known to patient", style: "label" },
                    { text: value.knownToPatient || "" }
                  ]
                }
              ])
            },
            margin: [0, 10, 0, 20]
          },

          {
            text: "Chief Complaints (In Chronological Order with Duration)",
            style: "header"
          },
          {
            table: {
              widths: ["100%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Complaint", style: "label" },
                      { text: data.chiefComplaints?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 10, 0, 20]
          },

          { text: "Illness Specifiers", style: "header" },
          {
            table: {
              widths: ["20%", "20%", "20%", "20%", "20%"],
              body: [
                [
                  {
                    stack: [{ text: "Onset", style: "label" }, { text: data?.onset?.label || "" }]
                  },
                  {
                    stack: [
                      { text: "Onset Detail", style: "label" },
                      { text: data?.onsetOther || "" }
                    ]
                  },
                  {
                    stack: [{ text: "Course", style: "label" }, { text: data?.course?.label || "" }]
                  },
                  { stack: [{ text: "Progess", style: "label" }, { text: data?.progress?.label }] },
                  {
                    stack: [
                      { text: "Total Duration of Illness", style: "label" },
                      { text: data?.totalDurationOfIllness || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Duration (This Episode)", style: "label" },
                      { text: data.durationThisEpisode }
                    ]
                  },
                  {
                    stack: [
                      { text: "Perpetuating", style: "label" },
                      { text: data.perpetuating || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Predisposing", style: "label" },
                      { text: data.predisposing || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Precipitating Factors", style: "label" },
                      { text: data.precipitatingFactors || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Impact of Present Illness", style: "label" },
                      { text: data?.impactOfPresentIllness?.label || "" }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 10, 0, 0]
          },
          {
            table: {
              widths: ["100%"],
              body: [
                [
                  {
                    stack: [
                      { text: "History Of Present Illness (HOPI)", style: "label" },
                      { text: data.historyOfPresentIllness?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Negative History", style: "label" },
                      { text: data.negativeHistory?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Past Psychiatric History", style: "label" },
                      { text: data.pastPsychiatricHistory?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Past Psychiatric Treatment History", style: "label" },
                      { text: data.pastPsychiatricTreatmentHistory?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Past Medical History (If any)", style: "label" },
                      { text: data.pastMedicalHistory?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 10, 0, 20]
          },

          { text: "Family History", style: "header" },
          {
            table: {
              widths: ["100%"],
              body: [
                [
                  {
                    stack: [
                      {
                        text: "History of Psychiatric Illness with Genogram",
                        style: "label"
                      },
                      { text: data.historyofPsychiatricIllness?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Uploaded Genogram", style: "label" },
                      {
                        text: data?.file?.fileName, // Extract filename
                        link: data?.file?.filePath, // Actual URL
                        color: "blue",
                        decoration: "underline",
                        style: "tableContent"
                      }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 10, 0, 20]
          },

          { text: "Personal History", style: "header" },
          {
            table: {
              widths: ["25%", "25%", "25%", "25%"],
              body: [
                [
                  {
                    stack: [
                      {
                        text: "Birth and Childhood history (Prenatal)",
                        style: "label"
                      },
                      { text: data?.prenatal || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Birth and Childhood history (Natal)", style: "label" },
                      { text: data.natal || "" }
                    ]
                  },
                  {
                    stack: [
                      {
                        text: "Birth and Childhood history (Postnatal)",
                        style: "label"
                      },
                      { text: data.postnatal || "" }
                    ]
                  },
                  {
                    stack: [
                      {
                        text: "Birth and Childhood history (Developmental Milestone)",
                        style: "label"
                      },
                      { text: data.developmentalMilestone || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      {
                        text: "Birth and Childhood history (Immunization status)",
                        style: "label"
                      },
                      { text: data.immunizationStatus }
                    ]
                  },
                  {},
                  {},
                  {}
                ]
              ]
            },
            margin: [0, 10, 0, 0]
          },
          {
            table: {
              widths: ["100%"],
              body: [
                [
                  {
                    stack: [
                      {
                        text: "Educational History (Complaints at School)",
                        style: "label"
                      },
                      { text: data.complaintsAtSchool?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      {
                        text: "Educational History (Occupational History)",
                        style: "label"
                      },
                      { text: data.occupationalHistory?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      {
                        text: "Sexual History (Rule out High-Risk Behavior)",
                        style: "label"
                      },
                      { text: data.sexualHistory?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 0, 0, 0]
          },
          {
            table: {
              widths: ["25%", "25%", "25%", "25%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Menstrual History (Age at Menarche)", style: "label" },
                      { text: data.ageAtMenarche || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Menstrual History (Regularity)", style: "label" },
                      { text: data.regularity || "" }
                    ]
                  },
                  {
                    stack: [
                      {
                        text: "Menstrual History (No of days of menses)",
                        style: "label"
                      },
                      { text: data.noOfDaysOfMenses || "" }
                    ]
                  },
                  {
                    stack: [
                      {
                        text: "Menstrual History (Last Menstrual Period (Day1))",
                        style: "label"
                      },
                      { text: data.lastMenstrualPeriod || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Marital History", style: "label" },
                      { text: data.maritalHistoryStatus || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Marital History (Details)", style: "label" },
                      { text: data.spouseDetails || "" }
                    ]
                  },
                  {},
                  {}
                ]
              ]
            },
            margin: [0, 0, 0, 0]
          },
          {
            table: {
              widths: ["100%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Religious History", style: "label" },
                      { text: data.religiousHistory?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 0, 0, 20]
          },

          { text: "Substance Use History", style: "header" },
          {
            table: {
              widths: ["25%", "25%", "25%", "25%"],
              body: (data.substanceUseHistory ?? []).flatMap((value: any) => [
                [
                  {
                    stack: [
                      { text: "Age at First Use", style: "label" },
                      { text: value.ageAtFirstUse || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Substance Used", style: "label" },
                      { text: value.substanceUsed || "" }
                    ]
                  },
                  { stack: [{ text: "Duration", style: "label" }, { text: value.duration || "" }] },
                  {
                    stack: [
                      { text: "Abstinence Period and Reason", style: "label" },
                      { text: value.abstinencePeriodAndReason || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Relapses and Reason", style: "label" },
                      { text: value.relapsesAndReason || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Average Dose", style: "label" },
                      { text: value.averageDose || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Maximum Dose", style: "label" },
                      { text: value.maximumDose || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Last Intake", style: "label" },
                      { text: value.lastIntake || "" }
                    ]
                  }
                ]
              ])
            },
            margin: [0, 10, 0, 20]
          },

          { text: "Premorbid Personality", style: "header" },
          {
            table: {
              widths: ["25%", "25%", "25%", "25%"],
              body: [
                [
                  {
                    stack: [
                      {
                        text: "Social Relations with family/ friends/ colleagues",
                        style: "label"
                      },
                      { text: data.socialRelationsWitFamilyOrFriendsOrColleagues || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Hobbies/ Interests", style: "label" },
                      { text: data?.hobbiesOrInterests || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Personality Traits", style: "label" },
                      { text: data?.personalityTraits || "" }
                    ]
                  },
                  { stack: [{ text: "Mood", style: "label" }, { text: data?.mood || "" }] }
                ],
                [
                  {
                    stack: [
                      {
                        text: "Character/ Attitude to work or responsibility",
                        style: "label"
                      },
                      { text: data.characterOrAttitudeToWorkOrResponsibility || "" }
                    ]
                  },
                  { stack: [{ text: "Habits", style: "label" }, { text: data.habits || "" }] },
                  {},
                  {}
                ]
              ]
            },
            margin: [0, 10, 0, 20]
          },
          { text: "Mental Status Examination", style: "header" },
          {
            table: {
              widths: ["25%", "25%", "25%", "25%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Kempt and tidy", style: "label" },
                      { text: data.kemptAndTidy || "" }
                    ]
                  },
                  {
                    stack: [{ text: "Withdrawn", style: "label" }, { text: data.withdrawn || "" }]
                  },
                  {
                    stack: [
                      { text: "Looking at one's age", style: "label" },
                      { text: data.lookingAtOneAge || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Over Friendly", style: "label" },
                      { text: data.overfriendly || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [{ text: "Suspicious", style: "label" }, { text: data.suspicious || "" }]
                  },
                  {
                    stack: [
                      { text: "Eye contact", style: "label" },
                      { text: data.eyeContact || "" }
                    ]
                  },
                  { stack: [{ text: "Posture", style: "label" }, { text: data.posture || "" }] },
                  {
                    stack: [
                      { text: "Cooperative", style: "label" },
                      { text: data.cooperative || "" }
                    ]
                  }
                ],
                [
                  { stack: [{ text: "Grimaces", style: "label" }, { text: data.grimaces || "" }] },
                  {
                    stack: [
                      { text: "Help seeking", style: "label" },
                      { text: data.helpSeeking || "" }
                    ]
                  },
                  { stack: [{ text: "Guarded", style: "label" }, { text: data.guarded || "" }] },
                  {
                    stack: [
                      { text: "Ingratiated", style: "label" },
                      { text: data.ingratiated || "" }
                    ]
                  }
                ],
                [
                  { stack: [{ text: "Hostile", style: "label" }, { text: data.hostile || "" }] },
                  {
                    stack: [{ text: "Submissive", style: "label" }, { text: data.submissive || "" }]
                  },
                  {
                    stack: [
                      { text: "Psychomotor Activity", style: "label" },
                      { text: data.psychomotorActivity || "" }
                    ]
                  },
                  {}
                ],

                [
                  {
                    stack: [{ text: "Speech (Rate)", style: "label" }, { text: data.rate || "" }]
                  },
                  {
                    stack: [
                      { text: "Speech (Goal Directed)", style: "label" },
                      { text: data.goalDirected || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Speech (Volume)", style: "label" },
                      { text: data.volume || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Speech (Spontaneous)", style: "label" },
                      { text: data.spontaneous || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Speech (Pitch/Tone)", style: "label" },
                      { text: data.pitchOrTone || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Speech (Coherent)", style: "label" },
                      { text: data.coherent || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Speech (Reaction time)", style: "label" },
                      { text: data.reactionTime || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Speech (Relevant)", style: "label" },
                      { text: data.relevant || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Affect (Objective)", style: "label" },
                      { text: data.objective || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Affect (Subjective)", style: "label" },
                      { text: data.subjective || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Affect (Affect)", style: "label" },
                      { text: data.affect || "" }
                    ]
                  },
                  {
                    stack: [{ text: "Affect (Range)", style: "label" }, { text: data.range || "" }]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Affect (Reactivity)", style: "label" },
                      { text: data.reactivity || "" }
                    ]
                  },
                  {},
                  {},
                  {}
                ],
                [
                  {
                    stack: [
                      { text: "Stream (productivity)", style: "label" },
                      { text: data.stream || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Form (Progression)", style: "label" },
                      { text: data.form || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Content (Product)", style: "label" },
                      { text: data.content || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Possession (Control)", style: "label" },
                      { text: data.possession || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Hallucination", style: "label" },
                      { text: data.hallucination || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Sample(Hallucination)", style: "label" },
                      { text: data.hallucinationSample }
                    ]
                  },
                  { stack: [{ text: "Illusion", style: "label" }, { text: data.illusion || "" }] },
                  {
                    stack: [
                      { text: "Sample(Illusion)", style: "label" },
                      { text: data.illusionSample || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Orientation (Time)", style: "label" },
                      { text: data.time || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Orientation (Place)", style: "label" },
                      { text: data.place || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Orientation (Person)", style: "label" },
                      { text: data.person || "" }
                    ]
                  },
                  {}
                ],
                [
                  {
                    stack: [
                      { text: "Digit span test", style: "label" },
                      { text: data.digitSpanTest || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Serial subtraction test", style: "label" },
                      { text: data.serialSubtractionTest }
                    ]
                  },
                  {},
                  {}
                ],
                [
                  {
                    stack: [{ text: "Immediate", style: "label" }, { text: data.immediate || "" }]
                  },
                  { stack: [{ text: "Recent", style: "label" }, { text: data.recent || "" }] },
                  { stack: [{ text: "Remote", style: "label" }, { text: data.remote || "" }] },
                  {}
                ],
                [
                  {
                    stack: [
                      { text: "General fund of knowledge", style: "label" },
                      { text: data.generalFundOfKnowledge || "" }
                    ]
                  },
                  {
                    stack: [{ text: "Arithmetic", style: "label" }, { text: data.arithmetic || "" }]
                  },
                  {
                    stack: [
                      { text: "Comprehension", style: "label" },
                      { text: data.comprehesion || "" }
                    ]
                  },
                  {}
                ],
                [
                  {
                    stack: [
                      { text: "Similarities/ dissimilarities", style: "label" },
                      { text: data.similaritiesOrDissimilarities || "" }
                    ]
                  },
                  { stack: [{ text: "Proverbs", style: "label" }, { text: data.proverbs || "" }] },
                  {},
                  {}
                ],
                [
                  { stack: [{ text: "Personal", style: "label" }, { text: data.personal || "" }] },
                  { stack: [{ text: "Social", style: "label" }, { text: data.social || "" }] },
                  { stack: [{ text: "Test", style: "label" }, { text: data.test || "" }] },
                  {}
                ]
              ]
            },
            margin: [0, 10, 0, 20]
          },
          { text: "Insight", style: "header" },
          {
            table: {
              widths: ["30%", "70%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Insight Grade", style: "label" },
                      { text: data?.insightGrade?.label || "" }
                    ]
                  },
                  {
                    stack: [{ text: "Insight", style: "label" }, { text: data?.insight || "" }]
                  }
                ]
              ]
            },
            margin: [0, 10, 0, 20]
          },
          { text: "Patient Diagnosis", style: "header" },
          {
            table: {
              widths: ["100%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Diagnostic", style: "label" },
                      { text: data?.diagnosticFormulation?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 0, 0, 0]
          },
          {
            table: {
              widths: ["50%", "50%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Provisional Diagnosis", style: "label" },
                      { text: data?.provisionalDiagnosis || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Differential Diagnosis", style: "label" },
                      { text: data?.differentialDiagnosis || "" }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 0, 0, 0]
          },
          {
            table: {
              widths: ["33.33%", "33.33%", "33.33%"],
              body: [
                [
                  {
                    stack: [
                      { text: "Target Symptoms", style: "label" },
                      { text: data.targetSymptoms?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Pharmacological Plan", style: "label" },
                      { text: data.pharmacologicalPlan?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Non-Pharmacological Plan", style: "label" },
                      { text: data.nonPharmacologicalPlan?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ],
                [
                  {
                    stack: [
                      { text: "Reviews Required", style: "label" },
                      { text: data.reviewsRequired?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Psychological Assessments", style: "label" },
                      { text: data.psychologicalAssessments?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  },
                  {
                    stack: [
                      { text: "Investigations", style: "label" },
                      { text: data.investigations?.replace(/<[^>]+>/g, "") || "" }
                    ]
                  }
                ]
              ]
            },
            margin: [0, 0, 0, 0]
          }
        ],

        styles: {
          header: {
            fontSize: 14,
            margin: [0, 0, 0, 0]
          },
          label: {
            fontSize: 12,
            bold: true,
            margin: [0, 0, 0, 2]
          }
        }
      
      };

      pdfMake
        .createPdf(docDefinition)
        .download(`case-history-${formatId(data?.UHID, false)}-${formattedDate}.pdf`);

      setloading(false);
    } catch (error) {
      setloading(false);
      handleError(error);
    }
  };

  return (
    <div onClick={() => generatePdf(data)} className="w-fit">
      {!loading ? button : <Loader />}
    </div>
  );
};

export default DownloadCaseHistory;
