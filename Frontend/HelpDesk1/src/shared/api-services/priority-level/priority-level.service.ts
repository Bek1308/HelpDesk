import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { API_BASE_URL } from '../../service-proxies/service-proxies';
import { CreatePriorityLevelDto, PriorityLevelDto, PriorityLevelPagedResultDto } from './model/priority-level-dto.model';



@Injectable()
export class PriorityLevelServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = baseUrl ?? "";
    }
    /**
         * @param body (optional) 
         * @return OK
         */
        create(body: CreatePriorityLevelDto | undefined): Observable<PriorityLevelDto> {
            let url_ = this.baseUrl + "/api/services/app/PriorityLevel/Create";
            url_ = url_.replace(/[?&]$/, "");
    
            const content_ = JSON.stringify(body);
    
            let options_ : any = {
                body: content_,
                observe: "response",
                responseType: "blob",
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                    "Accept": "text/plain"
                })
            };
    
            return this.http.request("post", url_, options_).pipe(_observableMergeMap((response_ : any) => {
                return this.processCreate(response_);
            })).pipe(_observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processCreate(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<PriorityLevelDto>;
                    }
                } else
                    return _observableThrow(response_) as any as Observable<PriorityLevelDto>;
            }));
        }
    
        protected processCreate(response: HttpResponseBase): Observable<PriorityLevelDto> {
            const status = response.status;
            const responseBlob =
                response instanceof HttpResponse ? response.body :
                (response as any).error instanceof Blob ? (response as any).error : undefined;
    
            let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
            if (status === 200) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                let result200: any = null;
                let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = PriorityLevelDto.fromJS(resultData200);
                return _observableOf(result200);
                }));
            } else if (status !== 200 && status !== 204) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
                }));
            }
            return _observableOf(null as any);
        }
    
    /**
         * @param id (optional) 
         * @return OK
         */
        delete(id: number | undefined): Observable<void> {
            let url_ = this.baseUrl + "/api/services/app/PriorityLevel/Delete?";
            if (id === null)
                throw new Error("The parameter 'id' cannot be null.");
            else if (id !== undefined)
                url_ += "Id=" + encodeURIComponent("" + id) + "&";
            url_ = url_.replace(/[?&]$/, "");
    
            let options_ : any = {
                observe: "response",
                responseType: "blob",
                headers: new HttpHeaders({
                })
            };
    
            return this.http.request("delete", url_, options_).pipe(_observableMergeMap((response_ : any) => {
                return this.processDelete(response_);
            })).pipe(_observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processDelete(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<void>;
                    }
                } else
                    return _observableThrow(response_) as any as Observable<void>;
            }));
        }
    
        protected processDelete(response: HttpResponseBase): Observable<void> {
            const status = response.status;
            const responseBlob =
                response instanceof HttpResponse ? response.body :
                (response as any).error instanceof Blob ? (response as any).error : undefined;
    
            let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
            if (status === 200) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return _observableOf(null as any);
                }));
            } else if (status !== 200 && status !== 204) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
                }));
            }
            return _observableOf(null as any);
        }
    

    /**
         * @param id (optional) 
         * @return OK
         */
        get(id: number | undefined): Observable<PriorityLevelDto> {
            let url_ = this.baseUrl + "/api/services/app/PriorityLevel/Get?";
            if (id === null)
                throw new Error("The parameter 'id' cannot be null.");
            else if (id !== undefined)
                url_ += "Id=" + encodeURIComponent("" + id) + "&";
            url_ = url_.replace(/[?&]$/, "");
    
            let options_ : any = {
                observe: "response",
                responseType: "blob",
                headers: new HttpHeaders({
                    "Accept": "text/plain"
                })
            };
    
            return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
                return this.processGet(response_);
            })).pipe(_observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGet(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<PriorityLevelDto>;
                    }
                } else
                    return _observableThrow(response_) as any as Observable<PriorityLevelDto>;
            }));
        }
    
        protected processGet(response: HttpResponseBase): Observable<PriorityLevelDto> {
            const status = response.status;
            const responseBlob =
                response instanceof HttpResponse ? response.body :
                (response as any).error instanceof Blob ? (response as any).error : undefined;
    
            let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
            if (status === 200) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                let result200: any = null;
                let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = PriorityLevelDto.fromJS(resultData200);
                return _observableOf(result200);
                }));
            } else if (status !== 200 && status !== 204) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
                }));
            }
            return _observableOf(null as any);
        }
    

/**
 

    /**
         * @param id (optional) 
         * @return OK
         */
        getForEdit(id: number | undefined): Observable<PriorityLevelDto> {
            let url_ = this.baseUrl + "/api/services/app/PriorityLevel/GetPriorityLevelForEdit?";
            if (id === null)
                throw new Error("The parameter 'id' cannot be null.");
            else if (id !== undefined)
                url_ += "Id=" + encodeURIComponent("" + id) + "&";
            url_ = url_.replace(/[?&]$/, "");
    
            let options_ : any = {
                observe: "response",
                responseType: "blob",
                headers: new HttpHeaders({
                    "Accept": "text/plain"
                })
            };
    
            return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
                return this.processGet(response_);
            })).pipe(_observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGetForEdit(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<PriorityLevelDto>;
                    }
                } else
                    return _observableThrow(response_) as any as Observable<PriorityLevelDto>;
            }));
        }
    
        protected processGetForEdit(response: HttpResponseBase): Observable<PriorityLevelDto> {
            const status = response.status;
            const responseBlob =
                response instanceof HttpResponse ? response.body :
                (response as any).error instanceof Blob ? (response as any).error : undefined;
    
            let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
            if (status === 200) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                let result200: any = null;
                let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = PriorityLevelDto.fromJS(resultData200);
                return _observableOf(result200);
                }));
            } else if (status !== 200 && status !== 204) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
                }));
            }
            return _observableOf(null as any);
        }
    

/**
     * @param keyword (optional) 
     * @param sorting (optional) 
     * @param skipCount (optional) 
     * @param maxResultCount (optional) 
     * @return OK
     */
    getAll(keyword: string | undefined, sorting: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined): Observable<PriorityLevelPagedResultDto> {
        let url_ = this.baseUrl + "/api/services/app/PriorityLevel/GetAll?";
        if (keyword === null)
            throw new Error("The parameter 'keyword' cannot be null.");
        else if (keyword !== undefined)
            url_ += "Keyword=" + encodeURIComponent("" + keyword) + "&";
        if (sorting === null)
            throw new Error("The parameter 'sorting' cannot be null.");
        else if (sorting !== undefined)
            url_ += "Sorting=" + encodeURIComponent("" + sorting) + "&";
        if (skipCount === null)
            throw new Error("The parameter 'skipCount' cannot be null.");
        else if (skipCount !== undefined)
            url_ += "SkipCount=" + encodeURIComponent("" + skipCount) + "&";
        if (maxResultCount === null)
            throw new Error("The parameter 'maxResultCount' cannot be null.");
        else if (maxResultCount !== undefined)
            url_ += "MaxResultCount=" + encodeURIComponent("" + maxResultCount) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_ : any = {
            observe: "response",
            responseType: "blob",
            headers: new HttpHeaders({
                "Accept": "text/plain"
            })
        };

        return this.http.request("get", url_, options_).pipe(_observableMergeMap((response_ : any) => {
            return this.processGetAll(response_);
        })).pipe(_observableCatch((response_: any) => {
            if (response_ instanceof HttpResponseBase) {
                try {
                    return this.processGetAll(response_ as any);
                } catch (e) {
                    return _observableThrow(e) as any as Observable<PriorityLevelPagedResultDto>;
                }
            } else
                return _observableThrow(response_) as any as Observable<PriorityLevelPagedResultDto>;
        }));
    }

    protected processGetAll(response: HttpResponseBase): Observable<PriorityLevelPagedResultDto> {
        const status = response.status;
        const responseBlob =
            response instanceof HttpResponse ? response.body :
            (response as any).error instanceof Blob ? (response as any).error : undefined;

        let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
        if (status === 200) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            let result200: any = null;
            let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
            result200 = PriorityLevelPagedResultDto.fromJS(resultData200);
            return _observableOf(result200);
            }));
        } else if (status !== 200 && status !== 204) {
            return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
            }));
        }
        return _observableOf(null as any);
    }

    /**
         * @param body (optional) 
         * @return OK
         */
        update(body: PriorityLevelDto | undefined): Observable<PriorityLevelDto> {
            let url_ = this.baseUrl + "/api/services/app/PriorityLevel/Update";
            url_ = url_.replace(/[?&]$/, "");
    
            const content_ = JSON.stringify(body);
    
            let options_ : any = {
                body: content_,
                observe: "response",
                responseType: "blob",
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                    "Accept": "text/plain"
                })
            };
    
            return this.http.request("put", url_, options_).pipe(_observableMergeMap((response_ : any) => {
                return this.processUpdate(response_);
            })).pipe(_observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processUpdate(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<PriorityLevelDto>;
                    }
                } else
                    return _observableThrow(response_) as any as Observable<PriorityLevelDto>;
            }));
        }
    
        protected processUpdate(response: HttpResponseBase): Observable<PriorityLevelDto> {
            const status = response.status;
            const responseBlob =
                response instanceof HttpResponse ? response.body :
                (response as any).error instanceof Blob ? (response as any).error : undefined;
    
            let _headers: any = {}; if (response.headers) { for (let key of response.headers.keys()) { _headers[key] = response.headers.get(key); }}
            if (status === 200) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                let result200: any = null;
                let resultData200 = _responseText === "" ? null : JSON.parse(_responseText, this.jsonParseReviver);
                result200 = PriorityLevelDto.fromJS(resultData200);
                return _observableOf(result200);
                }));
            } else if (status !== 200 && status !== 204) {
                return blobToText(responseBlob).pipe(_observableMergeMap((_responseText: string) => {
                return throwException("An unexpected server error occurred.", status, _responseText, _headers);
                }));
            }
            return _observableOf(null as any);
        }
}

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