import { RoleType } from '../utils/roles.mapper';

export type UserType = {
  id: number;
  email: string;
  username: string;
  phonenumber: string;
  firstname: string;
  lastname: string;
  imageurl?: string
  createdat: string | Date;
  updatedat: string | Date;
  role: keyof typeof RoleType;
  isactive: boolean;
  permissions: any;
  issuperadmin: boolean;
  lastlogin: string | Date;
  twofactorenabled: boolean;
  status: string;
  pushtoken?: string;
};

export type AuthState = {
  user: UserType;
  loading: boolean;
};

export type AuthContextValue = {
  user: UserType;
  loading: boolean;
  authenticated: boolean;
  unauthenticated: boolean;
  checkUserSession?: () => Promise<void>;
};
