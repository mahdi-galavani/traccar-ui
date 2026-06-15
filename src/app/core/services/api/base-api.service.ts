import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IdDto } from '../../models/base/id.model';

/**
 * Generic CRUD base for resources following the {resource}/load, /load/{id},
 * /save, /delete/{id} convention used across the Fleet Management API.
 */
export abstract class BaseApiService<T, ID = string> {
  protected http = inject(HttpClient);
  protected abstract readonly resourcePath: string;

  load(): Observable<T[]> {
    return this.http.get<T[]>(`${this.resourcePath}/load`);
  }

  loadById(id: ID): Observable<T> {
    return this.http.get<T>(`${this.resourcePath}/load/${id}`);
  }

  save(dto: T): Observable<IdDto<ID>> {
    return this.http.post<IdDto<ID>>(`${this.resourcePath}/save`, dto);
  }

  delete(id: ID): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath}/delete/${id}`);
  }
}
