import compareObjects from "./compareObjects";

export function generatePayload(
  originalNote: { [key: string]: unknown },
  updatedNote: { [key: string]: unknown },
  dateFields?: { dateKey: string; timeKey: string; payloadKey: string }
): { [key: string]: unknown } | null {
  const updatedState = compareObjects(originalNote, updatedNote, true);
  const payload: { [key: string]: unknown } = {};

  for (const key in updatedNote) {
    if (updatedState[key] !== undefined) {
      payload[key] = updatedState[key];
    }
  }

  if (
    dateFields &&
    (updatedState[dateFields.dateKey] !== undefined ||
      updatedState[dateFields.timeKey] !== undefined)
  ) {
    const combinedDateTime = `${updatedNote[dateFields.dateKey]} ${
      updatedNote[dateFields.timeKey]
    }`;
    const formattedDateTime = new Date(combinedDateTime).toISOString();
    payload[dateFields.payloadKey] = formattedDateTime;
  }

  return Object.entries(payload).length ? payload : null;
}
