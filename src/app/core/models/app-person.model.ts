/** Full DTO used by /api/app-person/* */
export interface AppPersonDto {
  id?: string;
  version?: number;
  name: string;
  family: string;
  nationalCode: string;
}
