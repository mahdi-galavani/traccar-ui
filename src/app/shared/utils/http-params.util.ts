import { HttpParams } from '@angular/common/http';

/**
 * Recursively flattens an object into HttpParams using Spring-style
 * dot/bracket notation, e.g.:
 *   { criteria: [{ field: 'status', operator: 'EQUAL', value: 'DRAFT' }], page: 0 }
 * becomes:
 *   criteria[0].field=status&criteria[0].operator=EQUAL&criteria[0].value=DRAFT&page=0
 *
 * Used by search-based API services to serialize nested request objects.
 */
export function toHttpParams(obj: Record<string, unknown>, prefix = ''): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    params = appendValue(params, fullKey, value);
  }

  return params;
}

function appendValue(params: HttpParams, key: string, value: unknown): HttpParams {
  if (value === null || value === undefined) {
    return params;
  }

  if (Array.isArray(value)) {
    return value.reduce(
      (acc, item, index) => appendValue(acc, `${key}[${index}]`, item),
      params,
    );
  }

  if (typeof value === 'object') {
    let result = params;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result = appendValue(result, `${key}.${k}`, v);
    }
    return result;
  }

  return params.append(key, String(value));
}
