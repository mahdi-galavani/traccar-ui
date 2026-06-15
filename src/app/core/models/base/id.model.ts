/**
 * Generic identifier wrappers, mirroring IdDtoLong / IdDtoString from the API.
 * Most "save" endpoints return one of these.
 */
export interface IdDto<T = string> {
  id?: T;
}

export type IdDtoLong = IdDto<number>;
export type IdDtoString = IdDto<string>;
