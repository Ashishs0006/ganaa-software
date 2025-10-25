import { ICalcuateData } from "./type";
export function calculateTotal(rent?: number, noOfDays?: number, discount?: number): string {
  const rentNum = rent || 0;
  const daysNum = noOfDays || 0;
  const discountNum = discount || 0;

  const subtotal = rentNum * daysNum;
  const discounted = subtotal - (subtotal * discountNum) / 100;

  return discounted.toFixed(2); // returns string, e.g. "1600.00"
}
export function calculateGrandTotal(data: ICalcuateData[]): number {
  return data.reduce((sum, item) => {
    const rent = item.pricePerDayPerBed || 0;
    const days = item.totalNumberOfDaysSpent || 0;
    const discount = item.discountPercentage || 0;

    const subtotal = rent * days;
    const discounted = subtotal - (subtotal * discount) / 100;

    return sum + discounted;
  }, 0);
}
