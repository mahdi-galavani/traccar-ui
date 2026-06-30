// src/app/core/models/flight.model.ts

export interface AircraftTypeDto {
  id: number;
  title: string;
  code: string;
}

export interface JobDto {
  id: number;
  title: string;
  code: string;
}

export interface PersonDto {
  id: string;
  version?: number;
  name?: string;
  family?: string;
  nationalCode?: string;
  phoneNumber?: string;
  job?: JobDto;
  aircraftTypes?: AircraftTypeDto[];
}

export interface CrewJobDto {
  id: number;
  version?: number;
  title?: string;
  code?: string;
  description?: string;
  header?: { id: number };
}

export interface FlightCrewDto {
  id?: string; // اضافه شده برای سازگاری با پیاده‌سازی متد track در فرانت
  version?: number;
  person: PersonDto;  // تغییر یافته به مدل کامل‌تر
  crewJob: CrewJobDto; // تغییر یافته به مدل کامل‌تر
}

export interface FlightDto {
  id?: string;
  version?: number;
  number: string;
  firstClassSeat?: number | null;
  businessClassSeat?: number | null;
  economicClassSeat?: number | null;
  payload?: number | null;
  crew: FlightCrewDto[];
}
