// src/shared/api-services/bonus-systems/lookups/lookup.service.ts

import { Injectable, Inject, Optional } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpResponse,
    HttpResponseBase
} from '@angular/common/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { API_BASE_URL } from '../../../service-proxies/service-proxies';
import { PeriodTypeDto, BudgetTypeDto, WeekdayDto } from './model/lookup-dto.model';

@Injectable({
    providedIn: 'root'
})
export class LookupServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(
        @Inject(HttpClient) http: HttpClient,
        @Optional() @Inject(API_BASE_URL) baseUrl?: string
    ) {
        this.http = http;
        this.baseUrl = baseUrl ?? '';
    }

    // GET: /api/services/app/Lookup/GetAllPeriodTypes
    getAllPeriodTypes(): Observable<PeriodTypeDto[]> {
        let url_ = this.baseUrl + '/api/services/app/Lookup/GetAllPeriodTypes';
        url_ = url_.replace(/[?&]$/, '');

        const options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                Accept: 'text/plain'
            })
        };

        return this.http.request('get', url_, options_).pipe(
            _observableMergeMap((response_: any) => {
                return this.processGetAllPeriodTypes(response_);
            })
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGetAllPeriodTypes(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<PeriodTypeDto[]>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<PeriodTypeDto[]>;
                }
            })
        );
    }

    protected processGetAllPeriodTypes(response: HttpResponseBase): Observable<PeriodTypeDto[]> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse
                ? response.body
                : (response as any).error instanceof Blob
                ? (response as any).error
                : undefined;

        let _headers: any = {};
        if (response.headers) {
            for (let key of response.headers.keys()) {
                _headers[key] = response.headers.get(key);
            }
        }

        if (status === 200) {
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    const resultData = _responseText === '' ? null : JSON.parse(_responseText, this.jsonParseReviver);
                    const result = (resultData || []).map(PeriodTypeDto.fromJS);
                    return _observableOf(result);
                })
            );
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    return throwException('An unexpected server error occurred.', status, _responseText, _headers);
                })
            );
        }
        return _observableOf([] as PeriodTypeDto[]);
    }

    // GET: /api/services/app/Lookup/GetAllBudgetTypes
    getAllBudgetTypes(): Observable<BudgetTypeDto[]> {
        let url_ = this.baseUrl + '/api/services/app/Lookup/GetAllBudgetTypes';
        url_ = url_.replace(/[?&]$/, '');

        const options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                Accept: 'text/plain'
            })
        };

        return this.http.request('get', url_, options_).pipe(
            _observableMergeMap((response_: any) => {
                return this.processGetAllBudgetTypes(response_);
            })
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGetAllBudgetTypes(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<BudgetTypeDto[]>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<BudgetTypeDto[]>;
                }
            })
        );
    }

    protected processGetAllBudgetTypes(response: HttpResponseBase): Observable<BudgetTypeDto[]> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse
                ? response.body
                : (response as any).error instanceof Blob
                ? (response as any).error
                : undefined;

        let _headers: any = {};
        if (response.headers) {
            for (let key of response.headers.keys()) {
                _headers[key] = response.headers.get(key);
            }
        }

        if (status === 200) {
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    const resultData = _responseText === '' ? null : JSON.parse(_responseText, this.jsonParseReviver);
                    const result = (resultData || []).map(BudgetTypeDto.fromJS);
                    return _observableOf(result);
                })
            );
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    return throwException('An unexpected server error occurred.', status, _responseText, _headers);
                })
            );
        }
        return _observableOf([] as BudgetTypeDto[]);
    }

    // GET: /api/services/app/Lookup/GetAllWeekdays
    getAllWeekdays(): Observable<WeekdayDto[]> {
        let url_ = this.baseUrl + '/api/services/app/Lookup/GetAllWeekdays';
        url_ = url_.replace(/[?&]$/, '');

        const options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                Accept: 'text/plain'
            })
        };

        return this.http.request('get', url_, options_).pipe(
            _observableMergeMap((response_: any) => {
                return this.processGetAllWeekdays(response_);
            })
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGetAllWeekdays(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<WeekdayDto[]>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<WeekdayDto[]>;
                }
            })
        );
    }

    protected processGetAllWeekdays(response: HttpResponseBase): Observable<WeekdayDto[]> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse
                ? response.body
                : (response as any).error instanceof Blob
                ? (response as any).error
                : undefined;

        let _headers: any = {};
        if (response.headers) {
            for (let key of response.headers.keys()) {
                _headers[key] = response.headers.get(key);
            }
        }

        if (status === 200) {
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    const resultData = _responseText === '' ? null : JSON.parse(_responseText, this.jsonParseReviver);
                    const result = (resultData || []).map(WeekdayDto.fromJS);
                    return _observableOf(result);
                })
            );
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    return throwException('An unexpected server error occurred.', status, _responseText, _headers);
                })
            );
        }
        return _observableOf([] as WeekdayDto[]);
    }
}

// Helper functions (MUST be inside the file)
function throwException(
    message: string,
    status: number,
    response: string,
    headers: { [key: string]: any },
    result?: any
): Observable<any> {
    if (result !== null && result !== undefined) {
        return _observableThrow(result);
    } else {
        return _observableThrow(new ApiException(message, status, response, headers, null));
    }
}

function blobToText(blob: any): Observable<string> {
    return new Observable<string>((observer: any) => {
        if (!blob) {
            observer.next('');
            observer.complete();
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                observer.next((event.target as any).result);
                observer.complete();
            };
            reader.readAsText(blob);
        }
    });
}

export class ApiException extends Error {
    override message: string;
    status: number;
    response: string;
    headers: { [key: string]: any };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any }, result: any) {
        super();
        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}