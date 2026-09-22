/**
 * Shared search request shape used by list and report screens.
 */
export type SearchOperator =
  | 'EQUAL'
  | 'NOT_EQUAL'
  | 'LIKE'
  | 'CONTAINS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'BETWEEN'
  | 'IN';

export interface SearchCriteria {
  field: string;
  operator: SearchOperator | string;
  value?: unknown;
  valueTo?: unknown;
}

export type SortDirection = 'ASC' | 'DESC';

export interface SearchRequest {
  criteria?: SearchCriteria[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
}
