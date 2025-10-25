export const calculateBMI = (weightStr: string, heightStr: string): string => {
  const weightKg = parseFloat(weightStr);
  const heightCm = parseFloat(heightStr);

  if (
    isNaN(weightKg) || isNaN(heightCm) || // Not a number
    weightKg <= 0 || heightCm <= 0        // Invalid physical values
  ) {
    return "";
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);

  return bmi.toFixed(2); // Return as string with 2 decimal places
};
