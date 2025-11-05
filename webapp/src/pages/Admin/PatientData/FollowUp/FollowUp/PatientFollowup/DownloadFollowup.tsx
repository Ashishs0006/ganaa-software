/* eslint-disable @typescript-eslint/no-explicit-any */
import { convertBackendDateToTime, formatDate, formatId } from "@/utils/formater";
import doctorpdfheader from "@/assets/images/ganaa-notes.png";
import { useState } from "react";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { Loader } from "@/components";
import moment from "moment";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { IPatientState, IPatientFollowup } from "@/pages/Admin/PatientData/FollowUp/FollowUp/types";
import { getAllPatientFollowup } from "@/apis";
import handleError from "@/utils/handleError";

(pdfMake as typeof pdfMake & { vfs: any }).vfs = (pdfFonts as any).vfs;

const toBase64 = async (url: string | URL | Request) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const DownloadFollowup = ({
  patientDetails,
  button,
  aid,
  id,
  singleFollowup // Add this new prop for single record download
}: {
  patientDetails: IPatientState;
  id?: string;
  aid?: string;
  button: React.ReactNode;
  singleFollowup?: IPatientFollowup; // Optional prop for single record
}) => {
  const [loading, setLoading] = useState(false);

  const sectionCard = (content: any) => content;

  const generatePdf = async () => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${now.getFullYear()}-${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    try {
      const image = (await toBase64(doctorpdfheader)) as string;

      setLoading(true);

      let content: any[] = [];

      // If singleFollowup is provided, generate single record PDF
      if (singleFollowup) {
        content = generateSingleFollowupContent(singleFollowup);
      } 
      // Otherwise, generate all records PDF
      else if (aid && id) {
        const { data: followupData } = await getAllPatientFollowup({
          patientAdmissionHistoryId: aid,
          limit: 500,
          page: 1,
          sort: "-createdAt"
        });
        content = generateAllFollowupContent(followupData.data);
      }

      const docDefinition: TDocumentDefinitions = {
        pageMargins: [20, 80, 20, 20],
        header: function () {
          return {
            stack: [
              {
                image: image,
                width: 100,
                alignment: "center",
                margin: [0, 10, 0, 5]
              },
              {
                text: singleFollowup ? "Follow-up Record" : "Patient Follow-up Report",
                alignment: "center",
                fontSize: 20,
                bold: true,
                margin: [0, 0, 0, 10]
              }
            ]
          };
        },
        content: [
          {
            table: {
              widths: ["25%", "25%", "25%", "25%"],
              body: [
                [
                  { text: "Patient Name:", bold: true },
                  `${patientDetails?.firstName || ""} ${patientDetails?.lastName || ""}`,
                  { text: "Age/Sex:", bold: true },
                  `${patientDetails?.age || ""}/${patientDetails?.gender || ""}`
                ],
                [
                  { text: "UHID No.:", bold: true },
                  formatId(patientDetails?.UHID),
                  { text: "Date of Admission:", bold: true },
                  `${formatDate(patientDetails?.dateOfAdmission)} @ ${convertBackendDateToTime(
                    patientDetails?.dateOfAdmission
                  )}`
                ],
                [
                  { text: "Illness Type:", bold: true },
                  patientDetails?.illnessType || "--",
                  { text: "Assigned Therapist:", bold: true },
                  patientDetails?.assignedTherapist || "--"
                ]
              ]
            },
            layout: "grid",
            margin: [0, 0, 0, 20]
          },
          ...content
        ],
        styles: {
          header: {
            fontSize: 9,
            bold: true
          },
          tableContent: {
            fontSize: singleFollowup ? 10 : 8
          },
          tableHeader: {
            fontSize: singleFollowup ? 10 : 8,
            bold: true
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            margin: [0, 10, 0, 4]
          },
          notesContent: {
            fontSize: 10,
            lineHeight: 1.4
          }
        }
      };

      const fileName = singleFollowup 
        ? `followup-${formatId(patientDetails.UHID, false)}-${moment(singleFollowup.noteDateTime).format("YYYY-MM-DD")}-${formattedDate}.pdf`
        : `patient-followup-${formatId(patientDetails.UHID, false)}-${formattedDate}.pdf`;

      pdfMake.createPdf(docDefinition).download(fileName);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleError(error);
    }
  };

  // Function to generate content for single follow-up record
  const generateSingleFollowupContent = (followup: IPatientFollowup) => {
    const content: any[] = [];

    // Follow-up Details Header
    content.push({
      text: "Follow-up Details",
      style: "sectionHeader",
      margin: [0, 0, 0, 10]
    });

    // Follow-up Information
    content.push(
      sectionCard({
        table: {
          widths: ["30%", "70%"],
          body: [
            [
              { text: "Date & Time", style: "tableHeader" },
              {
                text: `${moment(followup?.noteDateTime).format("DD MMM YYYY, h:mm A")}`,
                style: "tableContent"
              }
            ],
            [
              { text: "Therapist", style: "tableHeader" },
              {
                text: `${followup.therapistId?.firstName || ""} ${followup.therapistId?.lastName || ""}`.trim(),
                style: "tableContent"
              }
            ],
            [
              { text: "Current Status", style: "tableHeader" },
              { text: followup?.currentStatus || "--", style: "tableContent" }
            ],
            [
              { text: "Medication Adherence", style: "tableHeader" },
              { text: followup?.adherence || "--", style: "tableContent" }
            ],
            [
              { text: "Family Feedback", style: "tableHeader" },
              { text: followup?.feedbackFromFamily || "--", style: "tableContent" }
            ],
            [
              { text: "Attending Meeting", style: "tableHeader" },
              { text: followup?.meeting || "--", style: "tableContent" }
            ],
            [
              { text: "Making a Sponsor", style: "tableHeader" },
              { text: followup?.sponsor || "--", style: "tableContent" }
            ]
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? "#f5f5f5" : null)
        },
        margin: [0, 0, 0, 20]
      })
    );

    // Additional Details for Non-Mental Disorder Cases
    if (patientDetails.illnessType !== "Mental Disorder") {
      content.push(
        {
          text: "Additional Information",
          style: "sectionHeader",
          margin: [0, 20, 0, 10]
        },
        sectionCard({
          table: {
            widths: ["40%", "60%"],
            body: [
              [
                { text: "Urge", style: "tableHeader" },
                { text: followup?.urge || "--", style: "tableContent" }
              ],
              [
                { text: "Doing Prayer", style: "tableHeader" },
                { text: followup?.prayer || "--", style: "tableContent" }
              ],
              [
                { text: "Reading AA Literature", style: "tableHeader" },
                { text: followup?.literature || "--", style: "tableContent" }
              ],
              [
                { text: "Attending Daycare at Ganaa", style: "tableHeader" },
                { text: followup?.daycareAtGanaa || "--", style: "tableContent" }
              ],
              [
                { text: "Doing 12-step Program", style: "tableHeader" },
                { text: followup?.stepProgram || "--", style: "tableContent" }
              ],
              [
                { text: "Review with Ganaa Doctor", style: "tableHeader" },
                { text: followup?.reviewWithGanaaDoctor || "--", style: "tableContent" }
              ]
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex % 2 === 0 ? "#f5f5f5" : null)
          },
          margin: [0, 0, 0, 20]
        })
      );
    }

    // Notes Section
    content.push(
      {
        text: "Therapist Notes",
        style: "sectionHeader",
        margin: [0, 20, 0, 10]
      },
      {
        text: followup?.note?.replace(/<[^>]+>/g, "") || "No notes provided",
        style: "notesContent",
        margin: [0, 0, 0, 10]
      }
    );

    // File Attachment if exists
    if (followup?.file?.filePath) {
      content.push(
        {
          text: "Attached File",
          style: "sectionHeader",
          margin: [0, 20, 0, 10]
        },
        {
          text: `File: ${followup.file.fileName || "Download"}`,
          style: "tableContent",
          link: followup.file.filePath,
          margin: [0, 0, 0, 10]
        }
      );
    }

    return content;
  };

  // Function to generate content for all follow-up records
  const generateAllFollowupContent = (followupData: any[]) => {
    const content: any[] = [];

    // Add followup data section
    if (followupData.length > 0) {
      content.push(
        {
          text: "Patient Follow-up Records",
          style: "sectionHeader",
          margin: [0, 20, 0, 10]
        },
        sectionCard({
          table: {
            headerRows: 1,
            widths: ["12%", "12%", "10%", "10%", "12%", "12%", "10%", "22%"],
            body: [
              [
                { text: "Date & Time", style: "tableHeader" },
                { text: "Therapist", style: "tableHeader" },
                { text: "Current Status", style: "tableHeader" },
                { text: "Medication Adherence", style: "tableHeader" },
                { text: "Family Feedback", style: "tableHeader" },
                { text: "Attending Meeting", style: "tableHeader" },
                { text: "Making Sponsor", style: "tableHeader" },
                { text: "Notes", style: "tableHeader" }
              ],
              ...followupData.map((item: any) => {
                return [
                  {
                    text: moment(item?.noteDateTime).format("DD MMM YYYY, h:mm A") || "--",
                    style: "tableContent"
                  },
                  {
                    text: `${item.therapistId?.firstName || ""} ${item.therapistId?.lastName || ""}`.trim() || "--",
                    style: "tableContent"
                  },
                  { text: item?.currentStatus || "--", style: "tableContent" },
                  { text: item?.adherence || "--", style: "tableContent" },
                  { text: item?.feedbackFromFamily || "--", style: "tableContent" },
                  { text: item?.meeting || "--", style: "tableContent" },
                  { text: item?.sponsor || "--", style: "tableContent" },
                  { 
                    text: item?.note?.replace(/<[^>]+>/g, "").substring(0, 100) + (item?.note?.length > 100 ? "..." : "") || "--", 
                    style: "tableContent" 
                  }
                ];
              })
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? "#e0e0e0" : null)
          },
          margin: [0, 0, 0, 10]
        })
      );
    }

    // Add detailed followup data for non-mental disorder cases
    if (patientDetails.illnessType !== "Mental Disorder" && followupData.length > 0) {
      content.push(
        {
          text: "Detailed Follow-up Information",
          style: "sectionHeader",
          margin: [0, 20, 0, 10]
        },
        sectionCard({
          table: {
            headerRows: 1,
            widths: ["12%", "8%", "8%", "8%", "8%", "8%", "8%", "8%", "8%", "8%", "8%", "8%"],
            body: [
              [
                { text: "Date", style: "tableHeader" },
                { text: "Urge", style: "tableHeader" },
                { text: "Prayer", style: "tableHeader" },
                { text: "Literature", style: "tableHeader" },
                { text: "Daycare", style: "tableHeader" },
                { text: "Step Program", style: "tableHeader" },
                { text: "Doctor Review", style: "tableHeader" }
              ],
              ...followupData.map((item: any) => {
                return [
                  {
                    text: moment(item?.noteDateTime).format("DD MMM YYYY") || "--",
                    style: "tableContent"
                  },
                  { text: item?.urge || "--", style: "tableContent" },
                  { text: item?.prayer || "--", style: "tableContent" },
                  { text: item?.literature || "--", style: "tableContent" },
                  { text: item?.daycareAtGanaa || "--", style: "tableContent" },
                  { text: item?.stepProgram || "--", style: "tableContent" },
                  { text: item?.reviewWithGanaaDoctor || "--", style: "tableContent" }
                ];
              })
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => (rowIndex === 0 ? "#e0e0e0" : null)
          },
          margin: [0, 0, 0, 10]
        })
      );
    }

    return content;
  };

  return (
    <div onClick={() => generatePdf()} className="w-fit">
      {!loading ? button : <Loader />}
    </div>
  );
};

export default DownloadFollowup;