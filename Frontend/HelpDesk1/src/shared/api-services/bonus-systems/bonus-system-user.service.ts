// src/shared/api-services/bonus-system/bonus-system-user.service.ts
import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { API_BASE_URL } from '../../service-proxies/service-proxies';
import {
    BonusSystemUserDto,
    CreateBonusSystemUserDto,
    EditBonusSystemUserDto,
    GetAllBonusSystemUsersInput
} from './model/bonus-system-user-dto.model';

interface PagedResultDto<T> {
    totalCount: number;
    items: T[];
}

interface ListResultDto<T> {
    items: T[];
}

@Injectable()
export class BonusSystemUserServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = baseUrl ?? "";
    }

    /**
     * GetAll – paged list of BonusSystemUser
     */
    getAll(input: GetAllBonusSystemUsersInput | undefined): Observable<PagedResultDto<BonusSystemUserDto>> {
        let url_ = this.baseUrl + "/api/services/app/BonusSystemUser/GetAll?";
        if (input) {
            Object.keys(input).forEach(key => {
                const val = (input as any)[key];
                if (val !== undefined && val !== null) {
                    url_ += `${key}=${encodeURIComponent(String(val))}&`;
                }
            });
        }
        url_ = url_.replace(/[?&]$/, "");

        const options_: any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({ "Accept": "text/plain" })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processGetAll(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processGetAll(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<PagedResultDto<BonusSystemUserDto>>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<PagedResultDto<BonusSystemUserDto>>;
            }
        }));
    }

    protected processGetAll(response: HttpResponseBase): Observable<PagedResultDto<BonusSystemUserDto>> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        const _headers: any = {}; if (response.headers) { for (const key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}

        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                const resultData = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                return _observableOf({
                    totalCount: resultData.totalCount,
                    items: (resultData.items || []).map(BonusSystemUserDto.fromJS)
                });
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf({ totalCount: 0, items: [] } as any);
    }

    /**
     * Create
     */
    create(body: CreateBonusSystemUserDto | undefined): Observable<BonusSystemUserDto> {
        let url_ = this.baseUrl + "/api/services/app/BonusSystemUser/Create";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        const options_: any = {
            body: content_,
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                "Accept": "text/plain"
            })
        };

        return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processCreate(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processCreate(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<BonusSystemUserDto>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<BonusSystemUserDto>;
            }
        }));
    }

    protected processCreate(response: HttpResponseBase): Observable<BonusSystemUserDto> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        const _headers: any = {}; if (response.headers) { for (const key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}

        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                const resultData = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                return _observableOf(BonusSystemUserDto.fromJS(resultData));
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
     * Update
     */
    update(body: EditBonusSystemUserDto | undefined): Observable<BonusSystemUserDto> {
        let url_ = this.baseUrl + "/api/services/app/BonusSystemUser/Update";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        const options_: any = {
            body: content_,
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                "Accept": "text/plain"
            })
        };

        return this.http.request("put", url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processUpdate(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processUpdate(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<BonusSystemUserDto>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<BonusSystemUserDto>;
            }
        }));
    }

    protected processUpdate(response: HttpResponseBase): Observable<BonusSystemUserDto> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        const _headers: any = {}; if (response.headers) { for (const key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}

        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                const resultData = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                return _observableOf(BonusSystemUserDto.fromJS(resultData));
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
     * Delete
     */
    delete(id: number | undefined): Observable<void> {
        let url_ = this.baseUrl + "/api/services/app/BonusSystemUser/Delete?";
        if (id === null || id === undefined) throw new Error("The parameter 'id' cannot be null.");
        url_ += "Id=" + encodeURIComponent("" + id);
        url_ = url_.replace(/[?&]$/, "");

        const options_: any = { observe: "response", responseType: "blob" };

        return this.http.request("delete", url_, options_).pipe(_observableMergeMap((response_: any) => {
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
        if (status === 200 || status === 204) {
            return _observableOf(null as any);
        } else {
            const responseBlob =
                response instanceof HttpResponse ? response.body :
                (response as any).error instanceof Blob ? (response as any).error : undefined;
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, {});
            }));
        }
    }

    /**
     * GetByBonusSystem – ListResultDto
     */
    getByBonusSystem(id: number | undefined): Observable<ListResultDto<BonusSystemUserDto>> {
        let url_ = this.baseUrl + "/api/services/app/BonusSystemUser/GetByBonusSystem?";
        if (id === null || id === undefined) throw new Error("The parameter 'id' cannot be null.");
        url_ += "Id=" + encodeURIComponent("" + id);
        url_ = url_.replace(/[?&]$/, "");

        const options_: any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({ "Accept": "text/plain" })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processList(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processList(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<ListResultDto<BonusSystemUserDto>>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<ListResultDto<BonusSystemUserDto>>;
            }
        }));
    }

    /**
     * GetByUser – ListResultDto
     */
    getByUser(id: number | undefined): Observable<ListResultDto<BonusSystemUserDto>> {
        let url_ = this.baseUrl + "/api/services/app/BonusSystemUser/GetByUser?";
        if (id === null || id === undefined) throw new Error("The parameter 'id' cannot be null.");
        url_ += "Id=" + encodeURIComponent("" + id);
        url_ = url_.replace(/[?&]$/, "");

        const options_: any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({ "Accept": "text/plain" })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_: any) => {
            return this.processList(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processList(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<ListResultDto<BonusSystemUserDto>>;
                }
            } else {
                return _observableThrow(response_) as any as Observable<ListResultDto<BonusSystemUserDto>>;
            }
        }));
    }

    protected processList(response: HttpResponseBase): Observable<ListResultDto<BonusSystemUserDto>> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        const _headers: any = {}; if (response.headers) { for (const key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}

        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                const resultData = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                return _observableOf({
                    items: (resultData.items || []).map(BonusSystemUserDto.fromJS)
                });
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf({ items: [] } as any);
    }
}

/* ------------------- Helper functions (exactly as in category.service.ts) ------------------- */
function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): Observable<any> {
    if (result !== null && result !== undefined)
        return _observableThrow(result);
    else
        return _observableThrow(new ApiException(message, status, response, headers, null));
}

function blobToText(blob: any): Observable<string> {
    return new Observable<string>((observer: any) => {
        if (!blob) {
            observer.next("");
            observer.complete();
        } else {
            const reader = new FileReader();
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
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
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