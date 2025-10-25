/* eslint-disable @typescript-eslint/no-explicit-any */
import { convertBackendDateToTime, formatDate, formatId } from "@/utils/formater";
import doctorpdfheader from "@/assets/images/ganaa-notes.png";
import { useState } from "react";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { Loader } from "@/components";
import moment from "moment";
// utils/pdfmake.ts
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { INurseState } from "./types";
import { getAllNurseNotes } from "@/apis";
import handleError from "@/utils/handleError";
import { calculateBMI } from "@/utils/calculateBMI";

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

const NurseDataDownload = ({
  patientDetails,
  data,
  button,
  aid
}: {
  patientDetails: INurseState;
  data?: any;
  aid?: string;
  button: React.ReactNode;
  NRName?: string;
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
      const image = (await toBase64(doctorpdfheader)) as string;

      if (!data && aid) {
        setloading(true);

        const { data: nurseData } = await getAllNurseNotes({
          limit: 500,
          page: 1,
          sort: "-createdAt",
          patientAdmissionHistoryId: aid
        });
        // const image = (await toBase64(doctorpdfheader)) as string;
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
                  text: "Vitals",
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
                widths: ["25%", "25%", "25%", "25%"], // 4 columns (2 label-value pairs)
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
                  ]
                ]
              },
              layout: "grid", // full borders
              margin: [0, 0, 0, 20]
            },

            {
              table: {
                headerRows: 1,
                widths: [
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "25%"
                ],
                body: [
                    [
                    { text: "Date & Time", style: "tableHeader" },
                    { text: "B.P   (mm Hg)", style: "tableHeader" },
                    { text: "Pulse   (bpm)", style: "tableHeader" },
                    { text: "Temperature   (°F)", style: "tableHeader" },
                    { text: "SPO2  (%)", style: "tableHeader" },
                    { text: "Weight  (kg)", style: "tableHeader" },
                    { text: "RBS  (mg/dl)", style: "tableHeader" },
                    { text: "Height  (cm)", style: "tableHeader" },
                    { text: "BMI", style: "tableHeader" },
                    { text: "Notes", style: "tableHeader" }
                  ],
                  ...(Array.isArray(nurseData?.data) ? nurseData.data : []).map((d: any) => {
                    return [
                      {
                        text: moment(d?.noteDateTime).format("DD MMM YYYY, h:mm A") || "",
                        style: "tableContent"
                      }, // Date & Time
                      { text: d?.bp || "--", style: "tableContent" },
                      { text: d?.pulse || "--", style: "tableContent" },
                      { text: d?.temperature || "--", style: "tableContent" },
                      { text: d?.spo2 || "--", style: "tableContent" },
                      { text: d?.weight || "--", style: "tableContent" },
                      { text: d?.rbs || "--", style: "tableContent" },
                      { text: d?.height || "--", style: "tableContent" },
                      { text: calculateBMI(d.weight, d.height), style: "tableContent" }, // ← Added BMI
                      { text: d?.note?.replace(/<[^>]+>/g, "") || "--", style: "tableContent" }
                    ];
                  })
                ]
              },
              layout: {
                fillColor: (rowIndex: number) => (rowIndex === 0 ? "#e0e0e0" : null)
              },
              margin: [0, 0, 0, 0]
            }
          ],

          styles: {
            header: {
              fontSize: 9,
              bold: true
            },
            tableContent: {
              fontSize: 9
            },
            tableHeader: {
              fontSize: 9,
              bold: true
            },
            sectionHeader: {
              fontSize: 3,
              bold: true,
              margin: [0, 10, 0, 4]
            }
          }
        };
        pdfMake
          .createPdf(docDefinition)
          .download(`vitals-${formatId(patientDetails.UHID, false)}-${formattedDate}.pdf`);
        setloading(false);
      } else {
        setloading(true);
        // const image = (await toBase64(doctorpdfheader)) as string;
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
                  text: "Vital",
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
                widths: ["25%", "25%", "25%", "25%"], // 4 columns (2 label-value pairs)
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
                  ]
                ]
              },
              layout: "grid", // full borders
              margin: [0, 0, 0, 20]
            },

            {
              table: {
                headerRows: 1,
                widths: [
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "8.333%",
                  "25%"
                ],
                body: [
                  [
                    { text: "Date & Time", style: "tableHeader" },
                    { text: "B.P   (mm Hg)", style: "tableHeader" },
                    { text: "Pulse   (bpm)", style: "tableHeader" },
                    { text: "Temperature   (°F)", style: "tableHeader" },
                    { text: "SPO2  (%)", style: "tableHeader" },
                    { text: "Weight  (kg)", style: "tableHeader" },
                    { text: "RBS  (mg/dl)", style: "tableHeader" },
                    { text: "Height  (cm)", style: "tableHeader" },
                    { text: "BMI", style: "tableHeader" },
                    { text: "Notes", style: "tableHeader" }
                  ],
                  ...(Array.isArray(data) ? data : []).map((d) => {
                    return [
                      {
                        text: moment(d?.noteDateTime).format("DD MMM YYYY, h:mm A") || "",
                        style: "tableContent"
                      },
                      { text: d?.bp || "--", style: "tableContent" },
                      { text: d?.pulse || "--", style: "tableContent" },
                      { text: d?.temperature || "--", style: "tableContent" },
                      { text: d?.spo2 || "--", style: "tableContent" },
                      { text: d?.weight || "--", style: "tableContent" },
                      { text: d?.rbs || "--", style: "tableContent" },
                      { text: d?.height || "--", style: "tableContent" },
                      { text: calculateBMI(d.weight, d.height), style: "tableContent" }, // ← Added BMI
                      { text: d?.note?.replace(/<[^>]+>/g, "") || "--", style: "tableContent" }
                    ];
                  })
                ]
              },
              layout: {
                fillColor: (rowIndex: number) => (rowIndex === 0 ? "#e0e0e0" : null)
              },
              margin: [0, 0, 0, 0]
            }
          ],

          styles: {
            tableHeader: {
              fontSize: 9,
              bold: true
            },
            header: {
              fontSize: 5,
              bold: true
            },
            tableContent: {
              fontSize: 9
            },
            sectionHeader: {
              fontSize: 9,
              bold: true,
              margin: [0, 10, 0, 4]
            }
          }
        };

        pdfMake
          .createPdf(docDefinition)
          .download(`vital-${formatId(patientDetails.UHID, false)}-${formattedDate}.pdf`);

        setloading(false);
      }
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

export default NurseDataDownload;
