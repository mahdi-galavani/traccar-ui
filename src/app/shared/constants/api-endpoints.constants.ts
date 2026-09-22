/**
 * Base resource paths used by every API service.
 * Keeping them here avoids hardcoding strings inside each *-api.service.ts.
 */
export const API_BASE_PATH = {
  AUTH: '/api/auth',
  LOCATION: '/api/location',
  BASE_INFO: '/api/base-info',
  BASE_INFO_HEADER: '/api/base-info-header',
  APP_PERSON: '/api/app-person',
  APP_MENU: '/api/app-menu',
  APP_USER: '/api/app-user',
  APP_ROLE: '/api/app-role',
  APP_USER_ROLE: '/api/app-user-role',
} as const;

export const AUTH_HEADER = 'Authorization';
export const AUTH_SCHEME = 'Bearer';
