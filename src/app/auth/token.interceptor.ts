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
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { Injectable, Injector } from '@angular/core';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {    
    
    private authService: AuthService;//https://github.com/angular/angular/issues/18224

    constructor(private injector: Injector) { 
        
    }

    isRefreshingToken = false;
    tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    private addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
        return req.clone({ 
            setHeaders: { 
                Authorization: 'Bearer ' + token
            } 
        });
    }

    //https://www.intertech.com/Blog/angular-4-tutorial-handling-refresh-token-with-new-httpinterceptor/
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
        this.authService = this.injector.get(AuthService); 
            
        if (request.url.indexOf('oauth2')>-1) return next.handle(request);

        return next.handle(this.addToken(request, this.authService.authToken))
                .catch(error => {
                    if (error instanceof HttpErrorResponse) {
                        switch ((<HttpErrorResponse>error).status) {
                            case 400:
                                //TODO (general bad request the server couldnt understand)
                                console.error(error);
                                return Observable.throw(error);        
                            case 401:
                                return this.handle401Error(request, next);
                        }
                    } else {
                        return Observable.throw(error);
                    }
                });
    }

    handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;

            // Reset here so that the following requests wait until the token
            // comes back from the refreshToken call.
            this.tokenSubject.next(null);

            return this.authService.refreshToken()
                .then((newToken: string) => {
                    if (newToken) {
                        this.tokenSubject.next(newToken);
                        return next.handle(this.addToken(req, newToken));
                    }
                    // If we don't get a new token, we are in trouble so logout.
                    this.isRefreshingToken = false;
                    return this.authService.logout();
                })
                .catch(error => {
                    // If there is an exception calling 'refreshToken', bad news so logout.
                    this.isRefreshingToken = false;
                    return this.authService.logout();
                });
        } else {
            return this.tokenSubject
                .filter(token => token != null)
                .take(1)
                .switchMap(token => {
                    return next.handle(this.addToken(req, token));
                });
        }
    }
    
}

    // private authService: AuthService;//https://github.com/angular/angular/issues/18224

    // constructor(private injector: Injector) { }//https://github.com/angular/angular/issues/18224

    //https://github.com/angular/angular/issues/18224
    // intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    //     this.authService = this.injector.get(AuthService); 

    //     //white list:
    //     if (request.url.indexOf('oauth2')>-1) return next.handle(request);
        
    //     return this.authService.getAuthToken('ros').mergeMap(authToken=>{
    //             request = request.clone({
    //                 setHeaders: {
    //                     Authorization: `Bearer ${authToken}`
    //                 }
    //             });
    //             return next.handle(request);
    //         });

//     }
// }
