import { AppMenu } from './app-menu.model';

/** Payload for POST /api/auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Response of POST /api/auth/login */
export interface UserTokenDto {
  token: string;
  userId?: string;
  username?: string;
  authorities?: AppMenu[];
}
