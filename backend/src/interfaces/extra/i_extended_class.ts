import { Request } from 'express';
import { IUserAttributes } from '../model/i_users_attributes';

export interface UserRequest extends Request {
  user?: IUserAttributes;
}
