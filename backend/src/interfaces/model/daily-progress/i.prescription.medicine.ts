import { ObjectId } from 'mongoose';
import { IMedicine } from '../dropdown/i.medicine';

export interface IPrescriptionMedicine {
  medicine?: ObjectId | IMedicine;
  durationFrequency?: string;
  customDuration?: string;
  prescribedWhen?: string;
  instructions?: string;
  usages?: IMedicineUsages[];
}

export interface IMedicineUsages {
  frequency?: string;
  quantity?: number;
  when?: string;
  dosage?: string;
}
