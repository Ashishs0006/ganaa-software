/* eslint-disable @typescript-eslint/no-explicit-any */
import { convertBackendDateToTime, formatDate, formatId } from "@/utils/formater";
import doctorpdfheader from "@/assets/images/doctorpdfheader.jpg";
import footerpdf from "@/assets/images/footerpdf.jpg";
import { useState } from "react";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { Loader } from "@/components";
import moment from "moment";
// utils/pdfmake.ts
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { IDoctorState } from "../types";
import { getAllDoctorPrescription } from "@/apis";
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

const DoctorDataDownload = ({
  patientDetails,
  data,
  button,
  aid
}: {
  patientDetails: IDoctorState;
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
      if (!data && aid) {
        setloading(true);

        const { data: doctorPrescription } = await getAllDoctorPrescription({
          limit: 500,
          page: 1,
          sort: "-createdAt",
          patientAdmissionHistoryId: aid
        });
        const image = (await toBase64(doctorpdfheader)) as string;
        const footerimg = (await toBase64(footerpdf)) as string;
        const docDefinition: TDocumentDefinitions = {
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
                    formatId(patientDetails?.UHID, false),
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
                  ...(Array.isArray(doctorPrescription.data)
                    ? doctorPrescription.data
                    : []
                  ).flatMap((entry: any) => {
                    const createdAt = moment(entry.noteDateTime).format("DD MMM YYYY, h:mm A");
                    const doctor = `${entry.doctorId?.firstName || ""} ${
                      entry.doctorId?.lastName || ""
                    }`.trim();

                    return entry.medicinesInfo.map((med: any, idx: number) => {
                      const usages = med.usages || [];
                      const medicineName = `${med.medicine?.name} (${med.medicine?.genericName})`;
                      //   const dosage = usages.map((u: any) => u.dosage).join(", ");
                      const frequency = usages
                        .map((u: any) => `${u.frequency} ${u.quantity} Tab${u.dosage} ${u.when}`)
                        .join(", ");
                      const duration =
                        med.customDuration && med?.durationFrequency === "Custom Date"
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
              margin: [0, 0, 0, 0]
            }
          ],

          styles: {
            header: {
              fontSize: 9,
              bold: true
            },
             tableHeader: {
              fontSize: 12,
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
          .download(`prescription-${formatId(patientDetails.UHID, false)}-${formattedDate}.pdf`);
        setloading(false);
      } else {
        setloading(true);
        const image = (await toBase64(doctorpdfheader)) as string;
        const footerimg = (await toBase64(footerpdf)) as string;
        const docDefinition: TDocumentDefinitions = {
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
                        .map((u: any) => `${u.frequency} ${u.quantity} Tab ${u.dosage} ${u.when}`)
                        .join(", ");
                      const duration =
                        med.customDuration && med?.durationFrequency === "Custom Date"
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
              margin: [0, 0, 0, 0]
            }
          ],

          styles: {
            header: {
              fontSize: 9,
              bold: true
            },
            tableHeader: {
              fontSize: 12,
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
          .download(`prescription-${formatId(patientDetails.UHID, false)}-${formattedDate}.pdf`);

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

export default DoctorDataDownload;
