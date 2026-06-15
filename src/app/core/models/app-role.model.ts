/** Full DTO used by /api/app-role/* */
export interface AppRoleDto {
  id?: string;
  version?: number;
  code: string;
  title: string;
}

/** DTO used by /api/app-user-role/* (roles assigned to a user) */
export interface AppUserRoleDto {
  id?: string;
  version?: number;
  roles?: AppRoleDto[];
}
