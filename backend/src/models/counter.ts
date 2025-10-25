import mongoose from 'mongoose';
import Collections from '../constant/collections';
import { ICounter } from '../interfaces/model/i.counter';

const counterSchema = new mongoose.Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model<ICounter>(Collections.counter.name, counterSchema);

export default Counter;
