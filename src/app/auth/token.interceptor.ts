import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    
    private authService: AuthService;//https://github.com/angular/angular/issues/18224

    constructor(private injector: Injector) { }//https://github.com/angular/angular/issues/18224
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        this.authService = this.injector.get(AuthService); //https://github.com/angular/angular/issues/18224

        const authToken = this.authService.getAuthToken('ros');
        
        if (authToken) {            
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${this.authService.getAuthToken('ros')}`
                }
            });
        }
        return next.handle(request);
    }
}
