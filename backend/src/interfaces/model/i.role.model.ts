import mongoose, { Model, Types } from 'mongoose';

export interface IPermission {
  resource: string; // Example: 'user', 'project', 'task'
  actions: string[]; // Example: ['read', 'write', 'delete']
}

export interface IRole extends mongoose.Document {
  name: string;
  permissions: IPermission[];
  isDeleted: Boolean;
  createdAt: Date;
}

export interface IRoleModel extends Model<IRole> {
  getRoleIdsByNames(names: string[]): Promise<Types.ObjectId[]>;
}
