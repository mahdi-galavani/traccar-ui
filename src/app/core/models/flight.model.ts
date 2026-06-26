// src/app/core/models/flight.model.ts
export interface FlightCrewDto {
  person: { id: string };
  crewJob: { id: number };
}

export interface FlightDto {
  id?: string;
  version?: number;
  number: string;
  firstClassSeat?: number;
  businessClassSeat?: number;
  economicClassSeat?: number;
  payload?: number;
  crew: FlightCrewDto[];
}
