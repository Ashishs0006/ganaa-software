/* eslint-disable @typescript-eslint/no-explicit-any */
import { convertBackendDateToTime, formatDate, formatId } from "@/utils/formater";
import dischargepdf from "@/assets/images/dischargepdf.jpg";
import footerpdf from "@/assets/images/footerpdf.jpg";
import { useState } from "react";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { Loader } from "@/components";
import { PatientDetails } from "./types";
import moment from "moment";
// utils/pdfmake.ts
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import handleError from "@/utils/handleError";

// 👇 This is the correct access path
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

const DischargeSummaryPdf = ({
  patientDetails,
  data,
  button,
  NRName,
  prescriptionArray
}: {
  patientDetails: PatientDetails;
  data: any;
  prescriptionArray: any;
  button: React.ReactNode;
  NRName: string;
}) => {
  const [loading, setloading] = useState(false);
  const generatePdf = async () => {
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, "0")}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${now.getFullYear()}-${String(now.getHours()).padStart(2, "0")}${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
    try {
      setloading(true);
      const image = (await toBase64(dischargepdf)) as string;
      const footerimg = (await toBase64(footerpdf)) as string;
      const docDefinition: TDocumentDefinitions = {
        // pageMargins: [20, 80, 20, 50],
        pageMargins: [20, 110, 20, 50],
        header: function (
          _currentPage: any,
          _pageCount: any,
          pageSize: any
        ): import("pdfmake/interfaces").Content {
          return {
            margin: [0, 0, 0, 0],
            image: image,
            width: pageSize.width, // Adjust for pageMargins [20, 80, 20, 50]
            alignment: "center"
          };
        },

        footer: function (
          _currentPage: any,
          _pageCount: any,
          pageSize: any
        ): import("pdfmake/interfaces").Content {
          return {
            margin: [0, 0, 0, 0],
            image: footerimg,
            width: pageSize.width - 40, // Adjust for pageMargins [20, 80, 20, 50]
            alignment: "center"
          };
        },

        content: [
          // {
          //   text: "Discharge Summary",
          //   style: "header",
          //   alignment: "center",
          //   decoration: "underline",
          //   margin: [0, 0, 0, 10]
          // },

          // { text: "Discharge Summary", style: "header", alignment: "center", margin: [0, 0, 0, 20] },

          {
            table: {
              widths: ["25%", "25%", "25%", "25%"], // 4 columns (2 label-value pairs)
              body: [
                [
                  { text: "Patient Name:", bold: true },
                  `${patientDetails?.firstName || ""} ${patientDetails?.lastName || ""}`,
                  { text: "Age/Sex:", bold: true },
                  `${patientDetails?.age || ""}/${patientDetails?.gender || ""}`
                ],
                [
                  { text: "Address:", bold: true },
                  patientDetails?.address || "",
                  { text: "UHID No.:", bold: true },
                  formatId(patientDetails?.UHID)
                ],
                [
                  { text: "Mobile Number:", bold: true },
                  patientDetails?.phoneNumber || "",
                  { text: "Admission Type:", bold: true },
                  patientDetails?.admissionType || ""
                ],
                [
                  { text: "Consultant:", bold: true },
                  patientDetails?.doctor || "",
                  { text: "Date of Admission:", bold: true },
                  `${formatDate(patientDetails?.admissionDate)} @ ${convertBackendDateToTime(
                    patientDetails?.admissionDate
                  )}`
                ],
                [
                  { text: "Therapist:", bold: true },
                  patientDetails?.therapist || "",
                  { text: "Date of Discharge:", bold: true },
                  formatDate(patientDetails?.dischargeDate)
                ],
                [
                  { text: "NR:", bold: true },
                  NRName || "",
                  { text: "Discharge Status:", bold: true },
                  patientDetails?.dischargeStatus || ""
                ]
              ]
            },
            layout: "grid", // full borders
            margin: [0, 0, 0, 20]
          },

          patientDetails.admissionType && [
            { text: "Admission Type", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],
                body: [
                  [
                    {
                      text: `${patientDetails.admissionType} ${
                        patientDetails.involuntaryAdmissionType
                          ? `- ${patientDetails.involuntaryAdmissionType}`
                          : ""
                      }`,
                      margin: [5, 5, 5, 5],
                      fontSize: 11,
                      alignment: "left"
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10],
              noWrap: false
            }
          ],
          data.chiefComplaints && [
            { text: "Chief Complaints", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],
                body: [
                  [
                    {
                      text: data.chiefComplaints.replace(/<[^>]+>/g, ""),
                      margin: [5, 5, 5, 5],
                      fontSize: 11,
                      alignment: "left"
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10],
              noWrap: false
            }
          ],
          data.historyOfPresentIllness && [
            { text: "History of Presenting Illness: ", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],

                body: [
                  [
                    {
                      text: data.historyOfPresentIllness.replace(/<[^>]+>/g, ""),
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10]
            }
          ],
          data.physicalExaminationAtAdmission && [
            { text: "Physical Examination at Admission:", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],

                body: [
                  [
                    {
                      text: data.physicalExaminationAtAdmission.replace(/<[^>]+>/g, ""),
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10]
            }
          ],

          data.mentalStatusExamination && [
            { text: "Mental Status Examination:", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],

                body: [
                  [
                    {
                      text: data.mentalStatusExamination.replace(/<[^>]+>/g, ""),
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10]
            }
          ],
          data.hospitalisationSummary && [
            { text: "Hospitalisation Summary:", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],

                body: [
                  [
                    {
                      text: data.hospitalisationSummary.replace(/<[^>]+>/g, ""),
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10]
            }
          ],
          data.investigation && [
            { text: "Investigation:", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],

                body: [
                  [
                    {
                      text: data.investigation.replace(/<[^>]+>/g, ""),
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10]
            }
          ],
          { text: "Prescrption at Discharge:", style: "sectionHeader" },

          {
            table: {
              headerRows: 1,
              widths: ["25%", "35%", "18%", "22%"],
              body: [
                // Header row
                [
                  { text: "Medicine", style: "tableHeader" },
                  { text: "Frequency/Routine", style: "tableHeader" },
                  { text: "Duration", style: "tableHeader" },
                  { text: "Instruction", style: "tableHeader" }
                ],
                // Content rows
                ...prescriptionArray.map((data: any) => [
                  { text: data?.medicine?.label || "-", style: "tableContent" },
                  {
                    text:
                      data?.usages
                        ?.map(
                          (usage: any) =>
                            `${usage.frequency} ${usage.quantity} Tablet ${usage.dosage.label} ${usage.when.label}`
                        )
                        .join("\n") || "-",
                    style: "tableContent"
                  },
                  {
                    text: data?.customDuration && data?.durationFrequency === "Custom Date"
                      ? data.customDuration
                          .split("|")
                          .map((d: any) => moment(d).format("D MMMM"))
                          .join(" to ")
                      : data?.durationFrequency?.label || "-",
                    style: "tableContent"
                  },
                  { text: data?.instructions || "-", style: "tableContent" }
                ])
              ]
            },

            margin: [0, 0, 0, 10],
            layout: {
              
              fillColor: (rowIndex: number) => (rowIndex === 0 ? "#e0e0e0" : null)
            }
          },

          data.referBackTo && [
            { text: "Referred back to:", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],

                body: [
                  [
                    {
                      text: data.referBackTo,
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10]
            }
          ],
          data.conditionAtTheTimeOfDischarge?.value && [
            { text: "Condition at Discharge:", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],

                body: [
                  [
                    {
                      text: data.conditionAtTheTimeOfDischarge?.value,
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10]
            }
          ],
          data.adviseAndPlan && [
            { text: "Advice and Plan on Discharge:", style: "sectionHeader" },
            {
              table: {
                widths: ["100%"],

                body: [
                  [
                    {
                      text: data.adviseAndPlan.replace(/<[^>]+>/g, ""),
                      margin: [5, 5, 5, 5]
                    }
                  ]
                ]
              },
              layout: "grid", // adds full border
              margin: [0, 0, 0, 10]
            }
          ],
          {
            columns: [
              { width: "*", text: "" }, // push right
              {
                width: "auto",
                text: "Doctor's Signature",
                alignment: "right",
                margin: [0, 40, 0, 0],
                bold: true
              }
            ]
          },
          { text: "\n\n" },
          { text: "\n\n" }
        ],

        styles: {
          header: {
            fontSize: 20,
            bold: true
          },
          tableHeader:{
             fontSize: 14,
            bold: true
          },
          tableContent: {
            fontSize: 10
          },
          sectionHeader: {
            fontSize: 14,
            bold: true,
            margin: [10, 10, 10, 4]
          }
        }
      };

      pdfMake
        .createPdf(docDefinition)
        .download(`DS-${formatId(patientDetails.UHID, false)}-${formattedDate}.pdf`);
      setloading(false);
    } catch (error) {
      setloading(false);
      handleError(error);
    }
  };

  return (
    <div onClick={generatePdf} className="w-fit">
      {!loading ? button : <Loader />}
    </div>
  );
};

export default DischargeSummaryPdf;
