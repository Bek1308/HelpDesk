import { Injectable, Inject, Optional } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Observable, throwError as _observableThrow, of as _observableOf } from 'rxjs';
import { mergeMap as _observableMergeMap, catchError as _observableCatch } from 'rxjs/operators';
import { IssuesCommentsDto, IssuesCommentsPagedResultDto, CreateIssuesCommentsDto, UpdateIssuesCommentsDto } from './model/issues-comments-dto.model';
import { API_BASE_URL } from '../../service-proxies/service-proxies';
import { IIssuesCommentsDto } from './interface/issues-comments-dto.interface';

@Injectable()
export class IssuesCommentsServiceProxy {
    private http: HttpClient;
    private baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(@Inject(HttpClient) http: HttpClient, @Optional() @Inject(API_BASE_URL) baseUrl?: string) {
        this.http = http;
        this.baseUrl = baseUrl ?? '';
    }

    /**
     * Creates a new comment
     * @param body (optional) Comment data to create
     * @return Observable<IssuesCommentsDto> Created comment
     */
    create(body: CreateIssuesCommentsDto | undefined): Observable<IssuesCommentsDto> {
        let url_ = this.baseUrl + '/api/services/app/IssuesComments/Create';
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

        return this.http.request('post', url_, options_).pipe(
            _observableMergeMap((response_: any) => this.processCreate(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processCreate(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<IssuesCommentsDto>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<IssuesCommentsDto>;
                }
            })
        );
    }

    protected processCreate(response: HttpResponseBase): Observable<IssuesCommentsDto> {
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
                    result200 = IssuesCommentsDto.fromJS(resultData200);
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

    /**
     * Creates a comment with a file
     * @param commentId Comment ID
     * @param file File to upload
     * @return Observable<IssuesCommentsDto> Created comment with file
     */
    createCommentWithFile(commentId: number, file: File): Observable<IssuesCommentsDto> {
        let url_ = this.baseUrl + '/api/services/app/IssuesComments/CreateCommentWithFile?CommentId=' + encodeURIComponent('' + commentId);
        url_ = url_.replace(/[?&]$/, '');

        const formData = new FormData();
        formData.append('file', file, file.name);

        let options_: any = {
            body: formData,
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({})
        };

        return this.http.request('post', url_, options_).pipe(
            _observableMergeMap((response_: any) => this.processCreateCommentWithFile(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processCreateCommentWithFile(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<IssuesCommentsDto>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<IssuesCommentsDto>;
                }
            })
        );
    }

    protected processCreateCommentWithFile(response: HttpResponseBase): Observable<IssuesCommentsDto> {
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
                    result200 = IssuesCommentsDto.fromJS(resultData200);
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

    /**
     * Updates a comment
     * @param body (optional) Comment data to update
     * @return Observable<IssuesCommentsDto> Updated comment
     */
    update(body: UpdateIssuesCommentsDto | undefined): Observable<IssuesCommentsDto> {
        let url_ = this.baseUrl + '/api/services/app/IssuesComments/Update';
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

        return this.http.request('put', url_, options_).pipe(
            _observableMergeMap((response_: any) => this.processUpdate(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processUpdate(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<IssuesCommentsDto>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<IssuesCommentsDto>;
                }
            })
        );
    }

    protected processUpdate(response: HttpResponseBase): Observable<IssuesCommentsDto> {
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
                    result200 = IssuesCommentsDto.fromJS(resultData200);
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

    /**
     * Updates a comment with a file
     * @param commentId Comment ID
     * @param file File to upload
     * @return Observable<IssuesCommentsDto> Updated comment with file
     */
    updateCommentWithFile(commentId: number, file: File): Observable<IssuesCommentsDto> {
        let url_ = this.baseUrl + '/api/services/app/IssuesComments/UpdateCommentWithFile?CommentId=' + encodeURIComponent('' + commentId);
        url_ = url_.replace(/[?&]$/, '');

        const formData = new FormData();
        formData.append('file', file, file.name);

        let options_: any = {
            body: formData,
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({})
        };

        return this.http.request('put', url_, options_).pipe(
            _observableMergeMap((response_: any) => this.processUpdateCommentWithFile(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processUpdateCommentWithFile(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<IssuesCommentsDto>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<IssuesCommentsDto>;
                }
            })
        );
    }

    protected processUpdateCommentWithFile(response: HttpResponseBase): Observable<IssuesCommentsDto> {
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
                    result200 = IssuesCommentsDto.fromJS(resultData200);
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

    /**
     * Deletes a comment
     * @param id (optional) Comment ID to delete
     * @return Observable<void>
     */
    delete(id: number | undefined): Observable<void> {
        let url_ = this.baseUrl + '/api/services/app/IssuesComments/Delete?';
        if (id === null) {
            throw new Error("The parameter 'id' cannot be null.");
        } else if (id !== undefined) {
            url_ += 'Id=' + encodeURIComponent('' + id) + '&';
        }
        url_ = url_.replace(/[?&]$/, '');

        let options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({})
        };

        return this.http.request('delete', url_, options_).pipe(
            _observableMergeMap((response_: any) => this.processDelete(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processDelete(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<void>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<void>;
                }
            })
        );
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
            return blobToText(responseBlob).pipe(
                _observableMergeMap((_responseText: string) => {
                    return _observableOf(null as any);
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

    /**
     * Gets a comment by ID
     * @param id (optional) Comment ID
     * @return Observable<IssuesCommentsDto> Comment data
     */
    get(id: number | undefined): Observable<IssuesCommentsDto> {
        let url_ = this.baseUrl + '/api/services/app/IssuesComments/Get?';
        if (id === null) {
            throw new Error("The parameter 'id' cannot be null.");
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

        return this.http.request('get', url_, options_).pipe(
            _observableMergeMap((response_: any) => this.processGet(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGet(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<IssuesCommentsDto>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<IssuesCommentsDto>;
                }
            })
        );
    }

    protected processGet(response: HttpResponseBase): Observable<IssuesCommentsDto> {
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
                    result200 = IssuesCommentsDto.fromJS(resultData200);
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

    /**
     * Gets a comment for editing
     * @param id (required) Comment ID
     * @return Observable<IssuesCommentsDto> Comment data for editing
     */
    getCommentForEdit(id: number): Observable<IssuesCommentsDto> {
        if (id === null || id === undefined) {
            throw new Error("The parameter 'id' cannot be null or undefined.");
        }

        let url_ = this.baseUrl + '/api/services/app/IssuesComments/GetCommentForEdit?';
        url_ += 'Id=' + encodeURIComponent('' + id);
        url_ = url_.replace(/[?&]$/, '');

        let options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({
                'Accept': 'text/plain'
            })
        };

        return this.http.request('get', url_, options_).pipe(
            _observableMergeMap((response_: any) => this.processGetCommentForEdit(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGetCommentForEdit(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<IssuesCommentsDto>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<IssuesCommentsDto>;
                }
            })
        );
    }

    protected processGetCommentForEdit(response: HttpResponseBase): Observable<IssuesCommentsDto> {
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
                    result200 = IssuesCommentsDto.fromJS(resultData200);
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

    /**
     * Gets all comments with pagination
     * @param keyword (optional) Search keyword
     * @param issueId (optional) Issue ID to filter
     * @param sorting (optional) Sorting order
     * @param skipCount (optional) Number of items to skip
     * @param maxResultCount (optional) Maximum number of items to return
     * @return Observable<IssuesCommentsPagedResultDto> Paged comment list
     */
    getAll(keyword: string | undefined, issueId: number | undefined, sorting: string | undefined, skipCount: number | undefined, maxResultCount: number | undefined): Observable<IssuesCommentsPagedResultDto> {
        let url_ = this.baseUrl + '/api/services/app/IssuesComments/GetAll?';
        if (keyword !== undefined) {
            url_ += 'Keyword=' + encodeURIComponent('' + keyword) + '&';
        }
        if (issueId !== undefined) {
            url_ += 'IssueId=' + encodeURIComponent('' + issueId) + '&';
        }
        if (sorting !== undefined) {
            url_ += 'Sorting=' + encodeURIComponent('' + sorting) + '&';
        }
        if (skipCount !== undefined) {
            url_ += 'SkipCount=' + encodeURIComponent('' + skipCount) + '&';
        }
        if (maxResultCount !== undefined) {
            url_ += 'MaxResultCount=' + encodeURIComponent('' + maxResultCount) + '&';
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
            _observableMergeMap((response_: any) => this.processGetAll(response_))
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return this.processGetAll(response_ as any);
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<IssuesCommentsPagedResultDto>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<IssuesCommentsPagedResultDto>;
                }
            })
        );
    }

    protected processGetAll(response: HttpResponseBase): Observable<IssuesCommentsPagedResultDto> {
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
                    result200 = IssuesCommentsPagedResultDto.fromJS(resultData200);
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

    /**
     * Gets a file associated with a comment
     * @param id (required) Comment ID
     * @return Observable<Blob> File content
     */
    getFile(id: number): Observable<Blob> {
        if (id === null || id === undefined) {
            throw new Error("The parameter 'id' cannot be null or undefined.");
        }

        let url_ = this.baseUrl + '/api/services/app/IssuesComments/GetFile?';
        url_ += 'Id=' + encodeURIComponent('' + id);
        url_ = url_.replace(/[?&]$/, '');

        let options_: any = {
            observe: 'response',
            responseType: 'blob',
            headers: new HttpHeaders({})
        };

        return this.http.request('get', url_, options_).pipe(
            _observableMergeMap((response_: any) => {
                if (response_ instanceof HttpResponse) {
                    return _observableOf(response_.body as Blob);
                }
                return _observableThrow(new Error('Invalid response type')) as any as Observable<Blob>;
            })
        ).pipe(
            _observableCatch((response_: any) => {
                if (response_ instanceof HttpResponseBase) {
                    try {
                        return blobToText((response_ as any).error).pipe(
                            _observableMergeMap((_responseText: string) => {
                                let headers: any = {};
                                if (response_.headers) {
                                    for (let key of response_.headers.keys()) {
                                        headers[key] = response_.headers.get(key);
                                    }
                                }
                                return throwException('An unexpected server error occurred.', response_.status, _responseText, headers);
                            })
                        );
                    } catch (e) {
                        return _observableThrow(e) as any as Observable<Blob>;
                    }
                } else {
                    return _observableThrow(response_) as any as Observable<Blob>;
                }
            })
        );
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