// repair-issues.service.ts
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { API_BASE_URL } from '../../service-proxies/service-proxies';
import { IssuesDto, IssuesDtoPagedResultDto, GetAllIssuesInput } from './model/issues-dto.model';

@Injectable()
export class RepairIssuesServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = baseUrl ?? '';
    }

    get(id: number | undefined): Observable<IssuesDto> {
        let url_ = this.baseUrl + '/api/services/app/RepairIssues/Get?';
        if (id === null) {
            throw new Error('The parameter \'id\' cannot be null.');
        } else if (id !== undefined) {
            url_ += 'Id=' + encodeURIComponent('' + id) + '&';
        }
        url_ = url_.replace(/[?&]$/, '');

        let options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                'Accept': 'text/plain'
            })
        };

        return this.http.request('get', url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processGet(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processGet(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<IssuesDto>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<IssuesDto>;
            }
        }));
    }

    protected processGet(response: HttpResponseBase): Observable<IssuesDto> {
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
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                let result200: any = null;
                let resultData200 = _responseText === '' ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = IssuesDto.fromJS(resultData200);
                return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException('An unexpected server error occurred.', status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    getAll(input: GetAllIssuesInput): Observable<IssuesDtoPagedResultDto> {
        let url_ = this.baseUrl + '/api/services/app/Issue/GetAllRepairIssues?';
        const payload = input.toJSON ? input.toJSON() : { ...input };
        if (input.keyword !== undefined) {
            url_ += 'Keyword=' + encodeURIComponent('' + input.keyword) + '&';
        }
        if (input.title !== undefined) {
            url_ += 'Title=' + encodeURIComponent('' + input.title) + '&';
        }
        if (input.issueCategory !== undefined) {
            url_ += 'IssueCategory=' + encodeURIComponent('' + input.issueCategory) + '&';
        }
        if (input.description !== undefined) {
            url_ += 'Description=' + encodeURIComponent('' + input.description) + '&';
        }
        if (input.priorityId !== undefined) {
            url_ += 'PriorityId=' + encodeURIComponent('' + input.priorityId) + '&';
        }
        if (input.issueStatusId !== undefined) {
            url_ += 'IssueStatusId=' + encodeURIComponent('' + input.issueStatusId) + '&';
        }
        if (input.reportedBy !== undefined) {
            url_ += 'ReportedBy=' + encodeURIComponent('' + input.reportedBy) + '&';
        }
        if (input.isResolved !== undefined) {
            url_ += 'IsResolved=' + encodeURIComponent('' + input.isResolved) + '&';
        }
        if (payload.deadlineStart && !isNaN(new Date(payload.deadlineStart).getTime())) url_ += 'DeadlineStart=' + encodeURIComponent(payload.deadlineStart) + '&';
        if (payload.deadlineEnd && !isNaN(new Date(payload.deadlineEnd).getTime())) url_ += 'DeadlineEnd=' + encodeURIComponent(payload.deadlineEnd) + '&';
        if (payload.resolvedTimeStart && !isNaN(new Date(payload.resolvedTimeStart).getTime())) url_ += 'ResolvedTimeStart=' + encodeURIComponent(payload.resolvedTimeStart) + '&';
        if (payload.resolvedTimeEnd && !isNaN(new Date(payload.resolvedTimeEnd).getTime())) url_ += 'ResolvedTimeEnd=' + encodeURIComponent(payload.resolvedTimeEnd) + '&';
        if (input.tenantId !== undefined) {
            url_ += 'TenantId=' + encodeURIComponent('' + input.tenantId) + '&';
        }
        if (input.assigneeUserId !== undefined) {
            url_ += 'AssigneeUserId=' + encodeURIComponent('' + input.assigneeUserId) + '&';
        }
        if (input.claimKey !== undefined) {
            url_ += 'ClaimKey=' + encodeURIComponent('' + input.claimKey) + '&';
        }
        if (input.claimValue !== undefined) {
            url_ += 'ClaimValue=' + encodeURIComponent('' + input.claimValue) + '&';
        }
        if (input.agentFullName !== undefined) {
            url_ += 'AgentFullName=' + encodeURIComponent('' + input.agentFullName) + '&';
        }
        if (input.agentNumber !== undefined) {
            url_ += 'AgentNumber=' + encodeURIComponent('' + input.agentNumber) + '&';
        }
        if (input.equipment !== undefined) {
            url_ += 'Equipment=' + encodeURIComponent('' + input.equipment) + '&';
        }
        if (input.serialNumber !== undefined) {
            url_ += 'SerialNumber=' + encodeURIComponent('' + input.serialNumber) + '&';
        }
        if (input.repairIssueDescription !== undefined) {
            url_ += 'RepairIssueDescription=' + encodeURIComponent('' + input.repairIssueDescription) + '&';
        }
        if (input.workAmount !== undefined) {
            url_ += 'WorkAmount=' + encodeURIComponent('' + input.workAmount) + '&';
        }
        if (input.replacementParts !== undefined) {
            url_ += 'ReplacementParts=' + encodeURIComponent('' + input.replacementParts) + '&';
        }
        if (payload.creationTimeStart && !isNaN(new Date(payload.creationTimeStart).getTime())) url_ += 'CreationTimeStart=' + encodeURIComponent(payload.creationTimeStart) + '&';
        if (payload.creationTimeEnd && !isNaN(new Date(payload.creationTimeEnd).getTime())) url_ += 'CreationTimeEnd=' + encodeURIComponent(payload.creationTimeEnd) + '&';
        if (payload.lastModificationTimeStart && !isNaN(new Date(payload.lastModificationTimeStart).getTime())) url_ += 'LastModificationTimeStart=' + encodeURIComponent(payload.lastModificationTimeStart) + '&';
        if (payload.lastModificationTimeEnd && !isNaN(new Date(payload.lastModificationTimeEnd).getTime())) url_ += 'LastModificationTimeEnd=' + encodeURIComponent(payload.lastModificationTimeEnd) + '&';
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

        return this.http.request('get', url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processGetAll(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processGetAll(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<IssuesDtoPagedResultDto>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<IssuesDtoPagedResultDto>;
            }
        }));
    }

    protected processGetAll(response: HttpResponseBase): Observable<IssuesDtoPagedResultDto> {
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
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                let result200: any = null;
                let resultData200 = _responseText === '' ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = IssuesDtoPagedResultDto.fromJS(resultData200);
                return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException('An unexpected server error occurred.', status, _responseText, _headers);
            }));
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
            let reader = new FileReader();
            reader.onload = event => {
                observer.next((event.target as any).result);
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