import moment from "moment";

export const formatId = (id: number | string | undefined, prefix: boolean = true): string => {
  if (!id) return "--";
  const prefixStr = "G-";
  const minLength = 5; // Minimum number of digits
  const paddedId = id.toString().padStart(minLength, "0");
  return `${prefix ? prefixStr : ""}${paddedId}`;
};

export const calculateDateDifferenceDetailed = (
  dateOfAdmission: string,
  dateOfDischarge: string
) => {
  const admissionDate = new Date(dateOfAdmission);
  const dischargeDate = new Date(dateOfDischarge);

  const timeDifference = dischargeDate.getTime() - admissionDate.getTime();
  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  // Format the result based on duration
  if (daysDifference > 365) {
    const years = Math.floor(daysDifference / 365);
    return `${years}Y`;
  } else if (daysDifference > 30) {
    const months = Math.floor(daysDifference / 30);
    return `${months}M`;
  } else {
    return `${daysDifference}D`;
  }
};

export const formatDate = (dateString: string | null, formatType?: string): string => {
  if (!dateString) return "--";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  const m = moment(dateString); // ✅ Use UTC

  if (formatType === "time") {
    const formatted = m.format("DD MMM, YYYY");
    const time = m.format("hh:mm A");
    return `${formatted}, ${time}`;
  }

  return m.format("DD MMM, YYYY");
};

export const convertBackendDateToTime = (backendDate: string): string => {
  // Create a Date object from the backend date string
  const date = new Date(backendDate);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }
  return moment(backendDate).format("hh:mm A");
};

export const capitalizeFirstLetter = (text: string | undefined): string => {
  if (!text) return "--";

  const words = text.split(" ");

  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );

  return capitalizedWords.join(" ");
};

export function formateNormalDate(inputDate: string) {
  // Create a new Date object from the input
  const date = new Date(inputDate);

  // Array of month names
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];

  // Format the date as "DD MMM YYYY"
  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
}
