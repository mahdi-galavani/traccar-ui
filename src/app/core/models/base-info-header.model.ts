/** Full DTO used by /api/base-info-header/* (groups for lookup tables) */
export interface BaseInfoHeaderDto {
  id?: number;
  version?: number;
  title: string;
  code: string;
  description?: string;
}
