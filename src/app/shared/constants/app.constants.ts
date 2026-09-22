/** localStorage keys used by StorageService */
export const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
  LANG: 'app_lang',
} as const;

/** pagination defaults used by data-table / page-size-selector */
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/** i18n */
export const SUPPORTED_LANGS = ['fa', 'en'] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: SupportedLang = 'fa';
export const RTL_LANGS: SupportedLang[] = ['fa'];

/** known base-info-header codes, used to load select options in *.config.ts files */
export const BASE_INFO_HEADER_CODE = {
  VEHICLE_TYPE: 'vehicle-type',
  PERSONNEL_ROLE: 'personnel-role',
  ROUTE_TYPE: 'route-type',
  ALERT_TYPE: 'alert-type',
} as const;
