export interface AppPersonDto {
  id?: string;
  version?: number;
  name: string;
  family: string;
  nationalCode: string;
  phoneNumber?: string;
  job?: {
    id?: number;
    title?: string;
  };
}
