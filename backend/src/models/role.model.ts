import mongoose, { ObjectId } from 'mongoose';
import Collections from '../constant/collections';
import { IRole, IRoleModel } from '../interfaces/model/i.role.model';

const roleSchema = new mongoose.Schema<IRole, IRoleModel>({
  name: {
    type: String,
    trim: true,
    index: true,
  },
  permissions: [
    {
      _id: false,
      resource: { type: String, required: true },
      actions: [
        {
          type: String,
          enum: ['*', 'read', 'write', 'update', 'delete', 'manage'],
          required: true,
        },
      ],
    },
  ],
  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

roleSchema.pre(/^find/, function (next) {
  const query = this as mongoose.Query<any, any>;
  query.select({ createdAt: 0, __v: 0 });
  next();
});

// Static method
roleSchema.statics.getRoleIdsByNames = async function (names: string[]): Promise<ObjectId[]> {
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const regexConditions = names.map((name) => ({
    name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
  }));

  const roles = await this.find({ $or: regexConditions }, { _id: 1 });
  return roles.map((role: IRole) => role._id as ObjectId);
};

const Role = mongoose.model<IRole, IRoleModel>(Collections.role.name, roleSchema);

export default Role;
