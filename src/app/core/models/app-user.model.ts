/** Full DTO used by /api/app-user/* */
export interface AppUserDto {
  id?: string;
  version?: number;
  username: string;
  /** writeOnly in the API: only sent on save, never present on load */
  password: string;
  enabled: boolean;
}
