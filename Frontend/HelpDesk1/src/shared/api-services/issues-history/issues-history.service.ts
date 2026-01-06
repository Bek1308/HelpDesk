import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { IssuesHistoryDto, GetHistoryByIssueInput, PagedResultDto } from './model/issues-history-dto.model';
import { API_BASE_URL } from '../../service-proxies/service-proxies';

@Injectable()
export class IssuesHistoryServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = baseUrl ?? '';
    }

    /**
     * Gets history records for an issue by ID
     * @param input (required) Input containing IssueId, pagination, and sorting
     * @return Observable<PagedResultDto<IssuesHistoryDto>> Paged history records
     */
    getHistoryByIssueId(input: GetHistoryByIssueInput): Observable<PagedResultDto<IssuesHistoryDto>> {
        if (input === null || input === undefined || input.issueId <= 0) {
            throw new Error("The parameter 'input' must be provided with a valid IssueId.");
        }

        let url_ = this.baseUrl + '/api/services/app/IssuesHistory/GetHistoryByIssueId?';
        url_ += 'IssueId=' + encodeURIComponent('' + input.issueId) + '&';
        if (input.skipCount !== undefined) {
            url_ += 'SkipCount=' + encodeURIComponent('' + input.skipCount) + '&';
        }
        if (input.maxResultCount !== undefined) {
            url_ += 'MaxResultCount=' + encodeURIComponent('' + input.maxResultCount) + '&';
        }
        if (input.sorting !== undefined) {
            url_ += 'Sorting=' + encodeURIComponent('' + input.sorting) + '&';
        }
        url_ = url_.replace(/[?&]$/, '');

        let options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                'Accept': 'text/plain'
            })
        };

        return this.http.request('get', url_, options_).pipe(
            _observableMergeMap((response_: any) => this.processGetHistoryByIssueId(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGetHistoryByIssueId(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<PagedResultDto<IssuesHistoryDto>>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<PagedResultDto<IssuesHistoryDto>>;
                }
            })
        );
    }

    protected processGetHistoryByIssueId(response: HttpResponseBase): Observable<PagedResultDto<IssuesHistoryDto>> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {};
        if (response.headers) {
            for (let key of response.headers.keys()) {
                _headers[key] = response.headers.get(key);
            }
        }

        if (status === 200) {
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    let result200: any = null;
                    let resultData200 = _responseText === '' ? null : JSON.parse(_responseText, this.jsonParseReviver);
                    result200 = PagedResultDto.fromJS(resultData200, IssuesHistoryDto.fromJS);
                    return _observableOf(result200);
                })
            );
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    return throwException('An unexpected server error occurred.', status, _responseText, _headers);
                })
            );
        }
        return _observableOf(null as any);
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any }, result?: any): Observable<any> {
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
            reader.onload = event => {
                observer.next((event.target as any).result);
                observer.complete();
            };
            reader.onerror = error => {
                observer.error(error);
                observer.complete();
            };
            reader.readAsText(blob);
        }
    });
}

export class ApiException extends Error {
    message: string;
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