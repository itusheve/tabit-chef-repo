import {Observable, BehaviorSubject} from 'rxjs';
import {catchError, take, filter, switchMap} from 'rxjs/operators';
import {throwError as observableThrowError} from 'rxjs/internal/observable/throwError';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpSentEvent,
    HttpHeaderResponse,
    HttpProgressEvent,
    HttpResponse,
    HttpUserEvent,
    HttpErrorResponse
} from '@angular/common/http';
import {AuthService} from './auth.service';
import {Injectable, Injector} from '@angular/core';
import {DebugService} from '../debug.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

    private authService: AuthService;//https://github.com/angular/angular/issues/18224

    constructor(
        private injector: Injector,
        private ds: DebugService
    ) {

    }

    isRefreshingToken = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private addToken(req: HttpRequest<any>, accessToken: string): HttpRequest<any> {
        return req.clone({
            setHeaders: {
                Authorization: 'Bearer ' + accessToken
            }
        });
    }

    //https://www.intertech.com/Blog/angular-4-tutorial-handling-refresh-token-with-new-httpinterceptor/
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
        this.authService = this.injector.get(AuthService);

        if (request.url.indexOf('oauth2') > -1) return next.handle(request);

        const that = this;

        //to test the 401 behaviour:
        // let clonedReq = request.clone({
        //     setHeaders: {
        //         Authorization: 'Bearer ' + 'xxx'
        //     }
        // });
        // return next.handle(clonedReq)

        this.ds.log(`tokenInterceptor: request intercepted: adding token: ${that.authService.getToken()}`);
        return next.handle(that.addToken(request, that.authService.getToken()))
            .pipe(
                catchError(error => {
                    this.ds.log(`tokenInterceptor: intercept: catched error`);
                    if (error instanceof HttpErrorResponse) {
                        this.ds.log(`tokenInterceptor: intercept: catched error (1)`);
                        switch ((<HttpErrorResponse>error).status) {
                            case 400:
                                //TODO (general bad request the server couldnt understand)
                                this.ds.err(`tokenInterceptor: intercept: catched error (1): 400 ${JSON.stringify(request)}`);
                                return observableThrowError(error);
                            case 401:
                                this.ds.log(`tokenInterceptor: intercept: catched error (1): 401`);
                                return that.handle401Error(request, next);
                        }
                    } else {
                        this.ds.err(`tokenInterceptor: intercept: catched error (2)`);
                        return observableThrowError(error);
                    }
                })
            );
    }

    handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
        let that = this;
        this.ds.log(`tokenInterceptor: handle401Error`);
        if (!this.isRefreshingToken) {
            this.ds.log(`tokenInterceptor: handle401Error: !this.isRefreshingToken`);

            this.isRefreshingToken = true;

            // Reset here so that the following requests wait until the token
            // comes back from the refreshToken call.
            this.tokenSubject.next(null);

            return Observable.create(sub => {
                return this.authService.refreshToken()
                    .then((token: string) => {
                        if (token) {
                            this.ds.log(`tokenInterceptor: handle401Error: got new token`);
                            this.tokenSubject.next(that.authService.getToken());
                            sub.next(that.authService.getToken());
                        } else {
                            this.ds.err(`tokenInterceptor: handle401Error: failed getting new token (1)`);
                            // If we don't get a new token, we are in trouble so logout.
                            this.isRefreshingToken = false;
                            return this.authService.logout();
                        }
                    })
                    .catch(error => {
                        // If there is an exception calling 'refreshToken', bad news so logout.
                        this.ds.err(`tokenInterceptor: handle401Error: failed getting new token (2)`);
                        this.isRefreshingToken = false;
                        return this.authService.logout();
                    });
            })
                .take(1)
                .switchMap(token => {
                    return next.handle(this.addToken(req, token));
                });
        } else {
            this.ds.log(`tokenInterceptor: handle401Error: this.isRefreshingToken, waiting for new token`);
            return this.tokenSubject.pipe(
                filter(accessToken => accessToken != null),
                take(1),
                switchMap(accessToken => {
                    this.ds.log(`tokenInterceptor: handle401Error: this.isRefreshingToken, new token arrived, firing call`);
                    return next.handle(this.addToken(req, accessToken));
                })
            );
        }
    }

}