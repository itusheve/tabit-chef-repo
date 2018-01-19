import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
// import 'rxjs/add/operator/flatMap';
import { AuthService } from './auth.service';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    
    private authService: AuthService;//https://github.com/angular/angular/issues/18224

    constructor(private injector: Injector) { }//https://github.com/angular/angular/issues/18224
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        this.authService = this.injector.get(AuthService); //https://github.com/angular/angular/issues/18224

        //white list:
        if (request.url.indexOf('oauth2')>-1) return next.handle(request);
        
        return this.authService.getAuthToken('ros').mergeMap(authToken=>{
                request = request.clone({
                    setHeaders: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                return next.handle(request);
            });
            // .catch(e=>{
            //     debugger;
            // });
            
    }
}
