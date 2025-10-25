// Global Import
import mongoose from 'mongoose';
import Collections from '../../constant/collections';
import { IRelationship } from '../../interfaces/model/dropdown/i.relationship';

const relationshipSchema = new mongoose.Schema<IRelationship>({
  shortName: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  fullName: {
    type: String,
    trim: true,
    required: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

relationshipSchema.pre(/^find/, function (next) {
  const query = this as mongoose.Query<any, any>;
  query.select({ __v: 0, isDeleted: 0 });
  next();
});

const DDRelationship = mongoose.model<IRelationship>(
  Collections.relationship.name,
  relationshipSchema
);

export default DDRelationship;
