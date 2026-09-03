/**
 * Generic pagination and shared data transfer interfaces
 */

export interface Pageable {
  pageNumber: number;
  pageSize: number;
}

export interface Page<T> {
  content: T[];
  pageable: Pageable;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}
