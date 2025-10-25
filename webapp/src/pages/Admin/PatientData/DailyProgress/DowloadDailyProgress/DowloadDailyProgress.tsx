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
import { IDilyProgressState } from "./types";
import { getPatientDailyProgress } from "@/apis";
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

const DowloadDailyProgress = ({
  patientDetails,
  button,
  aid,
  id
}: {
  patientDetails: IDilyProgressState;
  id?: string;
  aid?: string;
  button: React.ReactNode;
  NRName?: string;
}) => {
  const [loading, setloading] = useState(false);

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

      if (aid && id) {
        setloading(true);
        const { data: dailyData } = await getPatientDailyProgress(id, aid, {
          limit: 500,
          page: 1,
          sort: "-createtdAt"
        });
        const content: any[] = [];

        dailyData.data.forEach((item: any) => {
          // nurse
          if (item.docType === "nurse") {
            const data = [item];

            content.push(
              sectionCard({
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
                margin: [0, 0, 0, 10]
              })
            );
          }
          // doctor notes
          if (item.docType === "doctor_notes") {
            const data = [item];

            content.push(
              sectionCard({
                table: {
                  headerRows: 1,
                  widths: ["10%", "20%", "20%", "50%"],
                  body: [
                    [
                      { text: "Date & Time", style: "tableHeader" },
                      { text: "Doctor", style: "tableHeader" },
                      { text: "Session Type", style: "tableHeader" },
                      { text: "Notes", style: "tableHeader" }
                    ],
                    ...(Array.isArray(data) ? data : []).map((d: any) => {
                      return [
                        {
                          text: moment(d?.noteDateTime).format("DD MMM YYYY, h:mm A") || "",
                          style: "tableContent"
                        },
                        {
                          text: `${d.doctorId.firstName} ${d.doctorId.lastName}`,
                          style: "tableContent"
                        },
                        {
                          text: `${d.sessionType.length > 0 ? d.sessionType : "--"}`,
                          style: "tableContent"
                        },
                        { text: d?.note?.replace(/<[^>]+>/g, "") || "--", style: "tableContent" }
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

          if (item.docType === "therapist") {
            const data = [item];

            content.push(
              sectionCard({
                table: {
                  headerRows: 1,
                  widths: ["10%", "16%", "16%", "10%", "48%"],

                  body: [
                    [
                      { text: "Date & Time", style: "tableHeader" },
                      { text: "Therapist", style: "tableHeader" },
                      { text: "Session Type", style: "tableHeader" },
                      { text: "Score", style: "tableHeader" },
                      { text: "Notes", style: "tableHeader" }
                    ],
                    ...(Array.isArray(data) ? data : []).map((d) => {
                      return [
                        {
                          text: moment(d?.noteDateTime).format("DD MMM YYYY, h:mm A") || "",
                          style: "tableContent"
                        },
                        {
                          text: `${d?.therapistId?.firstName} ${d?.therapistId?.lastName}`,
                          style: "tableContent"
                        },
                        {
                          text: `${d?.sessionType?.length > 0 ? d?.sessionType : "--"}${
                            d?.subSessionType ? ` (${d?.subSessionType})` : ""
                          }`,
                          style: "tableContent"
                        },
                        { text: d?.score || "--", style: "tableContent" },

                        { text: d?.note?.replace(/<[^>]+>/g, "") || "--", style: "tableContent" }
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

          if (item.docType === "doctor_prescriptions") {
            const data = [item];
            content.push(
              sectionCard([
                {
                  table: {
                    headerRows: 1,
                    widths: ["12%", "13%", "14%", "20%", "15%", "14%", "12%"],
                    body: [
                      [
                        { text: "Date & Time", style: "tableHeader" },
                        { text: "Doctor", style: "tableHeader" },
                        { text: "Medicine & Dosage", style: "tableHeader" },
                        { text: "Frequency", style: "tableHeader" },
                        { text: "Duration", style: "tableHeader" },
                        { text: "Instruction", style: "tableHeader" },
                        { text: "Prescribe When", style: "tableHeader" }
                      ],
                      ...(Array.isArray(data) ? data : []).flatMap((entry: any) => {
                        const createdAt = moment(entry.noteDateTime).format("DD MMM YYYY, h:mm A");
                        const doctor = `${entry.doctorId?.firstName || ""} ${
                          entry.doctorId?.lastName || ""
                        }`.trim();

                        return entry.medicinesInfo.map((med: any, idx: number) => {
                          const usages = med.usages || [];
                          const medicineName = `${med.medicine?.name} (${med.medicine?.genericName})`;
                          //   const dosage = usages.map((u: any) => u.dosage).join(", ");
                          const frequency = usages
                            .map(
                              (u: any) => `${u.frequency} ${u.quantity} Tab${u.dosage} ${u.when}`
                            )
                            .join(", ");
                          const duration = med.customDuration && med?.durationFrequency === "Custom Date"
                            ? med.customDuration
                                .split("|")
                                .map((d: string) => moment(d).format("D MMMM"))
                                .join(" to ")
                            : med.durationFrequency || "-";
                          const instruction = med.instructions || "-";
                          const prescribedWhen = med.prescribedWhen || "-";

                          return [
                            { text: idx === 0 ? createdAt : "", style: "tableContent" },
                            { text: idx === 0 ? doctor : "", style: "tableContent" },
                            { text: medicineName, style: "tableContent" },
                            { text: frequency || "-", style: "tableContent" },
                            { text: duration, style: "tableContent" },
                            { text: instruction, style: "tableContent" },
                            { text: prescribedWhen, style: "tableContent" }
                          ];
                        });
                      })
                    ]
                  },
                  layout: {
                    fillColor: (rowIndex: number) => (rowIndex === 0 ? "#e0e0e0" : null)
                  },
                  margin: [0, 0, 0, 10]
                }
              ])
            );
          }
        });

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
                  text: "Patient Progress",
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
            ...content
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
              fontSize:9,
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
          .download(
            `patient-progress-${formatId(patientDetails.UHID, false)}-${formattedDate}.pdf`
          );
        setloading(false);
      }
    } catch (error) {
      setloading(false);
      handleError(error);
    }
  };

  return (
    <div onClick={() => generatePdf()} className="w-fit">
      {!loading ? button : <Loader />}
    </div>
  );
};

export default DowloadDailyProgress;
