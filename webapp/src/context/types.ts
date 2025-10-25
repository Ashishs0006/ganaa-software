import { ICenter } from "@/redux/slice/dropDown";

interface IPermission {
  resource: string;
  actions: string[];
}

interface IRoles {
  _id?: string;
  name?: string;
  permissions?: IPermission[];
}

export interface IUser {
  _id: string;
  roleId: IRoles;
  centerId: ICenter[];
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  gender: string;
  isEmailVerified: boolean;
  isSystemGeneratedPassword: boolean;
  createdAt: string;
  profilePic: string;
}
export interface IAuthState {
  loading: boolean;
  status: null | boolean;
  user: IUser;
}

export interface IAuthContext {
  auth: IAuthState;
  setAuth: React.Dispatch<React.SetStateAction<IAuthState>>;
}

export interface AuthContextType {
  auth: IAuthState;
  setAuth: React.Dispatch<React.SetStateAction<IAuthState>>;
  hasAccess: (_resource: string, _action?: string) => boolean;
  logout: () => void;
}
