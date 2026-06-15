import { IdDtoString } from './base/id.model';

/**
 * Tree node returned inside the login response (UserTokenDto.authorities).
 * Used by the sidebar to build the dynamic menu and by has-permission.directive.
 */
export interface AppMenu {
  id?: string;
  version?: number;
  code?: string;
  title?: string;
  route?: string;
  show?: boolean;
  parent?: AppMenu;
  authority?: string;
  created?: string;
  modified?: string;
  createdBy?: string;
  modifiedBy?: string;
}

/** DTO used by /api/app-menu/* CRUD endpoints */
export interface AppMenuDto {
  id?: string;
  version?: number;
  code: string;
  title: string;
  route?: string;
  show?: boolean;
  parent?: IdDtoString;
}
