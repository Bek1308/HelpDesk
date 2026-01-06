import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { API_BASE_URL } from '../../service-proxies/service-proxies';
import { IssuesDto, IssuesDtoPagedResultDto, CreateIssuesDto, EditIssuesDto, GetAllIssuesInput } from './model/issues-dto.model';

@Injectable()
export class IssuesServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = baseUrl ?? '';
    }

    create(body: CreateIssuesDto | undefined): Observable<IssuesDto> {
        let url_ = this.baseUrl + '/api/services/app/Issue/Create';
        url_ = url_.replace(/[?&]$/, '');

        const content_ = JSON.stringify(body);

        let options_: any = {
            body: content_,
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            })
        };

        return this.http.request('post', url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processCreate(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processCreate(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<IssuesDto>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<IssuesDto>;
            }
        }));
    }

    protected processCreate(response: HttpResponseBase): Observable<IssuesDto> {
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

    update(body: EditIssuesDto | undefined): Observable<IssuesDto> {
        let url_ = this.baseUrl + '/api/services/app/Issue/Update';
        url_ = url_.replace(/[?&]$/, '');

        const content_ = JSON.stringify(body);

        let options_: any = {
            body: content_,
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            })
        };

        return this.http.request('put', url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processUpdate(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processUpdate(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<IssuesDto>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<IssuesDto>;
            }
        }));
    }

    protected processUpdate(response: HttpResponseBase): Observable<IssuesDto> {
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

    delete(id: number | undefined): Observable<void> {
        let url_ = this.baseUrl + '/api/services/app/Issue/Delete?';
        if (id === null) {
            throw new Error('The parameter \'id\' cannot be null.');
        } else if (id !== undefined) {
            url_ += 'Id=' + encodeURIComponent('' + id) + '&';
        }
        url_ = url_.replace(/[?&]$/, '');

        let options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({})
        };

        return this.http.request('delete', url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processDelete(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processDelete(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<void>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<void>;
            }
        }));
    }

    protected processDelete(response: HttpResponseBase): Observable<void> {
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
                return _observableOf(null as any);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException('An unexpected server error occurred.', status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    get(id: number | undefined): Observable<IssuesDto> {
        let url_ = this.baseUrl + '/api/services/app/Issue/Get?';
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

    getIssueCategories(): Observable<any> {
    let url_ = this.baseUrl + '/api/services/app/Issue/GetIssueCategories';
    url_ = url_.replace(/[?&]$/, '');

    const options_: any = {
        observe: 'response',
        responseType: 'blob',
        headers: new HttpHeaders({
            'Accept': 'text/plain'
        })
    };

    return this.http.request('get', url_, options_).pipe(
        _observableMergeMap((response_: any) => {
            return this.processGetIssueCategories(response_);
        }),
        _observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processGetIssueCategories(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<any>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<any>;
            }
        })
    );
}

protected processGetIssueCategories(response: HttpResponseBase): Observable<any> {
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
                const resultData200 = _responseText === '' ? null : JSON.parse(_responseText);
                // interfeys yo‘q, shuning uchun any qaytaramiz
                return _observableOf(resultData200);
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


    getAll(input: GetAllIssuesInput): Observable<IssuesDtoPagedResultDto> {
        let url_ = this.baseUrl + '/api/services/app/Issue/GetAll?';
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
        if (input.subCategoryId !== undefined) {
            url_ += 'SubCategoryId=' + encodeURIComponent('' + input.subCategoryId) + '&';
        }
        if (input.subCategoryName !== undefined) {
            url_ += 'SubCategoryName=' + encodeURIComponent('' + input.subCategoryName) + '&';
        }
        if (input.serviceId !== undefined) {
            url_ += 'ServiceId=' + encodeURIComponent('' + input.serviceId) + '&';
        }
        if (input.serviceName !== undefined) {
            url_ += 'ServiceName=' + encodeURIComponent('' + input.serviceName) + '&';
        }
        if (input.wrongNumber !== undefined) {
            url_ += 'WrongNumber=' + encodeURIComponent('' + input.wrongNumber) + '&';
        }
        if (input.rightNumber !== undefined) {
            url_ += 'RightNumber=' + encodeURIComponent('' + input.rightNumber) + '&';
        }
        if (input.terminalNumber !== undefined) {
            url_ += 'TerminalNumber=' + encodeURIComponent('' + input.terminalNumber) + '&';
        }
        if (input.sum !== undefined) {
            url_ += 'Sum=' + encodeURIComponent('' + input.sum) + '&';
        }
        if (input.cancelledSum !== undefined) {
            url_ += 'CancelledSum=' + encodeURIComponent('' + input.cancelledSum) + '&';
        }
        if (input.subscriber !== undefined) {
            url_ += 'Subscriber=' + encodeURIComponent('' + input.subscriber) + '&';
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
        if (input.techTerminalNumber !== undefined) {
            url_ += 'TechTerminalNumber=' + encodeURIComponent('' + input.techTerminalNumber) + '&';
        }
        if (input.terminalName !== undefined) {
            url_ += 'TerminalName=' + encodeURIComponent('' + input.terminalName) + '&';
        }
        if (input.agentId !== undefined) {
            url_ += 'AgentId=' + encodeURIComponent('' + input.agentId) + '&';
        }
        if (input.techAgentNumber !== undefined) {
            url_ += 'TechAgentNumber=' + encodeURIComponent('' + input.techAgentNumber) + '&';
        }
        if (input.techIssueDescription !== undefined) {
            url_ += 'TechIssueDescription=' + encodeURIComponent('' + input.techIssueDescription) + '&';
        }
        if (input.issueGroupId !== undefined) {
            url_ += 'IssueGroupId=' + encodeURIComponent('' + input.issueGroupId) + '&';
        }
        if (input.issueGroupName !== undefined) {
            url_ += 'IssueGroupName=' + encodeURIComponent('' + input.issueGroupName) + '&';
        }
        if (input.terminalLocation !== undefined) {
            url_ += 'TerminalLocation=' + encodeURIComponent('' + input.terminalLocation) + '&';
        }
        if (input.cityId !== undefined) {
            url_ += 'CityId=' + encodeURIComponent('' + input.cityId) + '&';
        }
        if (input.cityName !== undefined) {
            url_ += 'CityName=' + encodeURIComponent('' + input.cityName) + '&';
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


    getAllAssigned(input: GetAllIssuesInput): Observable<IssuesDtoPagedResultDto> {
        let url_ = this.baseUrl + '/api/services/app/Issue/GetAssignedToMe?';
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
        if (input.subCategoryId !== undefined) {
            url_ += 'SubCategoryId=' + encodeURIComponent('' + input.subCategoryId) + '&';
        }
        if (input.subCategoryName !== undefined) {
            url_ += 'SubCategoryName=' + encodeURIComponent('' + input.subCategoryName) + '&';
        }
        if (input.serviceId !== undefined) {
            url_ += 'ServiceId=' + encodeURIComponent('' + input.serviceId) + '&';
        }
        if (input.serviceName !== undefined) {
            url_ += 'ServiceName=' + encodeURIComponent('' + input.serviceName) + '&';
        }
        if (input.wrongNumber !== undefined) {
            url_ += 'WrongNumber=' + encodeURIComponent('' + input.wrongNumber) + '&';
        }
        if (input.rightNumber !== undefined) {
            url_ += 'RightNumber=' + encodeURIComponent('' + input.rightNumber) + '&';
        }
        if (input.terminalNumber !== undefined) {
            url_ += 'TerminalNumber=' + encodeURIComponent('' + input.terminalNumber) + '&';
        }
        if (input.sum !== undefined) {
            url_ += 'Sum=' + encodeURIComponent('' + input.sum) + '&';
        }
        if (input.cancelledSum !== undefined) {
            url_ += 'CancelledSum=' + encodeURIComponent('' + input.cancelledSum) + '&';
        }
        if (input.subscriber !== undefined) {
            url_ += 'Subscriber=' + encodeURIComponent('' + input.subscriber) + '&';
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
        if (input.techTerminalNumber !== undefined) {
            url_ += 'TechTerminalNumber=' + encodeURIComponent('' + input.techTerminalNumber) + '&';
        }
        if (input.terminalName !== undefined) {
            url_ += 'TerminalName=' + encodeURIComponent('' + input.terminalName) + '&';
        }
        if (input.agentId !== undefined) {
            url_ += 'AgentId=' + encodeURIComponent('' + input.agentId) + '&';
        }
        if (input.techAgentNumber !== undefined) {
            url_ += 'TechAgentNumber=' + encodeURIComponent('' + input.techAgentNumber) + '&';
        }
        if (input.techIssueDescription !== undefined) {
            url_ += 'TechIssueDescription=' + encodeURIComponent('' + input.techIssueDescription) + '&';
        }
        if (input.issueGroupId !== undefined) {
            url_ += 'IssueGroupId=' + encodeURIComponent('' + input.issueGroupId) + '&';
        }
        if (input.issueGroupName !== undefined) {
            url_ += 'IssueGroupName=' + encodeURIComponent('' + input.issueGroupName) + '&';
        }
        if (input.terminalLocation !== undefined) {
            url_ += 'TerminalLocation=' + encodeURIComponent('' + input.terminalLocation) + '&';
        }
        if (input.cityId !== undefined) {
            url_ += 'CityId=' + encodeURIComponent('' + input.cityId) + '&';
        }
        if (input.cityName !== undefined) {
            url_ += 'CityName=' + encodeURIComponent('' + input.cityName) + '&';
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
            return this.processGetAllAssigned(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processGetAllAssigned(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<IssuesDtoPagedResultDto>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<IssuesDtoPagedResultDto>;
            }
        }));
    }

    protected processGetAllAssigned(response: HttpResponseBase): Observable<IssuesDtoPagedResultDto> {
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


    getMyIssuesAll(input: GetAllIssuesInput): Observable<IssuesDtoPagedResultDto> {
        let url_ = this.baseUrl + '/api/services/app/Issue/GetMyIssues?';
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
        if (input.subCategoryId !== undefined) {
            url_ += 'SubCategoryId=' + encodeURIComponent('' + input.subCategoryId) + '&';
        }
        if (input.subCategoryName !== undefined) {
            url_ += 'SubCategoryName=' + encodeURIComponent('' + input.subCategoryName) + '&';
        }
        if (input.serviceId !== undefined) {
            url_ += 'ServiceId=' + encodeURIComponent('' + input.serviceId) + '&';
        }
        if (input.serviceName !== undefined) {
            url_ += 'ServiceName=' + encodeURIComponent('' + input.serviceName) + '&';
        }
        if (input.wrongNumber !== undefined) {
            url_ += 'WrongNumber=' + encodeURIComponent('' + input.wrongNumber) + '&';
        }
        if (input.rightNumber !== undefined) {
            url_ += 'RightNumber=' + encodeURIComponent('' + input.rightNumber) + '&';
        }
        if (input.terminalNumber !== undefined) {
            url_ += 'TerminalNumber=' + encodeURIComponent('' + input.terminalNumber) + '&';
        }
        if (input.sum !== undefined) {
            url_ += 'Sum=' + encodeURIComponent('' + input.sum) + '&';
        }
        if (input.cancelledSum !== undefined) {
            url_ += 'CancelledSum=' + encodeURIComponent('' + input.cancelledSum) + '&';
        }
        if (input.subscriber !== undefined) {
            url_ += 'Subscriber=' + encodeURIComponent('' + input.subscriber) + '&';
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
        if (input.techTerminalNumber !== undefined) {
            url_ += 'TechTerminalNumber=' + encodeURIComponent('' + input.techTerminalNumber) + '&';
        }
        if (input.terminalName !== undefined) {
            url_ += 'TerminalName=' + encodeURIComponent('' + input.terminalName) + '&';
        }
        if (input.agentId !== undefined) {
            url_ += 'AgentId=' + encodeURIComponent('' + input.agentId) + '&';
        }
        if (input.techAgentNumber !== undefined) {
            url_ += 'TechAgentNumber=' + encodeURIComponent('' + input.techAgentNumber) + '&';
        }
        if (input.techIssueDescription !== undefined) {
            url_ += 'TechIssueDescription=' + encodeURIComponent('' + input.techIssueDescription) + '&';
        }
        if (input.issueGroupId !== undefined) {
            url_ += 'IssueGroupId=' + encodeURIComponent('' + input.issueGroupId) + '&';
        }
        if (input.issueGroupName !== undefined) {
            url_ += 'IssueGroupName=' + encodeURIComponent('' + input.issueGroupName) + '&';
        }
        if (input.terminalLocation !== undefined) {
            url_ += 'TerminalLocation=' + encodeURIComponent('' + input.terminalLocation) + '&';
        }
        if (input.cityId !== undefined) {
            url_ += 'CityId=' + encodeURIComponent('' + input.cityId) + '&';
        }
        if (input.cityName !== undefined) {
            url_ += 'CityName=' + encodeURIComponent('' + input.cityName) + '&';
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
            return this.processGetMyIssuesAll(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processGetMyIssuesAll(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<IssuesDtoPagedResultDto>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<IssuesDtoPagedResultDto>;
            }
        }));
    }

    protected processGetMyIssuesAll(response: HttpResponseBase): Observable<IssuesDtoPagedResultDto> {
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