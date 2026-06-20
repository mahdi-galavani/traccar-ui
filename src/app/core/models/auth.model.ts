import { AppMenu } from './app-menu.model';

/** Payload for POST /api/auth/login */
export interface LoginRequest {
  username: string;
  password: string;
}

/** Actual Response from backend OpenAPI spec (api.json) */
export interface LoginResponse {
  access_token: string;
  expires_in: number;
}

/** Front-end Application Session State Model */
export interface UserTokenDto {
  token: string;
  username?: string;
  userId?: string;
  authorities?: AppMenu[]; // این فیلد را در صورت دریافت از ریکوئست‌های جانبی پر می‌کنید
}
