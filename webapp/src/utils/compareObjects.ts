/* eslint-disable @typescript-eslint/no-explicit-any */
export default function compareObjects<T extends Record<string, any>>(
  originalData: T,
  newData: T,
  compareDeep: boolean = true
): Partial<T> {
  const changes: Partial<T> = {};

  if (!originalData || !newData) return changes;
  if (originalData === newData) return changes;

  if (typeof originalData !== "object" || typeof newData !== "object") {
    return changes;
  }

  for (const key in newData) {
    if (Object.prototype.hasOwnProperty.call(newData, key)) {
      const originalValue = originalData[key];
      const newValue = newData[key];

      if (
        typeof originalValue === "object" &&
        typeof newValue === "object" &&
        !Array.isArray(newValue) &&
        compareDeep
      ) {
        const nestedChanges = compareObjects(originalValue, newValue);

        if (Object.keys(nestedChanges).length > 0) {
          changes[key] = nestedChanges as T[typeof key];
        }
        continue;
      }

      if (Array.isArray(originalValue) && Array.isArray(newValue)) {
        const bool = isArraySame(originalValue, newValue);
        if (bool) continue;
      }

      if (originalValue !== newValue) {
        changes[key] = newValue;
      }
    }
  }

  return changes;
}

function isArraySame(arr1: any[], arr2: any[]) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}
