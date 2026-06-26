export interface BaseInfoCodeDto {
  id?: number;
  title?: string;
  code?: string;
}

export interface AirplaneDto {
  id?: string;
  version?: number;
  register?: string;
  seatStyle?: BaseInfoCodeDto;
  ownership?: BaseInfoCodeDto;
  type?: BaseInfoCodeDto;
  firstClassSeat?: number;
  businessClassSeat?: number;
  economicClassSeat?: number;
  payload?: number;
}
