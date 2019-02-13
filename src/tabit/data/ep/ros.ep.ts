import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {AuthService} from '../../../app/auth/auth.service';

import {Observable, of, throwError} from 'rxjs';
import {environment} from '../../../environments/environment';
import {DebugService} from '../../../app/debug.service';
import {catchError, retry} from 'rxjs/operators';

@Injectable()
export class ROSEp {

    constructor(
        private httpClient: HttpClient,
        private authService: AuthService,
        private ds: DebugService
    ) {
    }

    get(url, params?, region?): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.get(this.authService.getRosUrl(region) + url, {
                params: params || {}
            }).pipe(
                retry(1), // retry a failed request up to 3 times
                catchError(this.handleError) // then handle the error
            )
                .subscribe(
                    (results: any) => {
                        resolve(results);
                    },
                    (err) => {
                        this.ds.err(`ROSEp: ${JSON.stringify(err)}`);
                    }
                );
        });
    }

    post(url, payload?, region?): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.authService.getRosUrl(region) + url, payload || {})
                .subscribe(
                    (results: any) => {
                        resolve(results);
                    },
                    (err) => {
                        this.ds.err(`ROSEp: ${JSON.stringify(err)}`);
                    }
                );
        });
    }

    put(url, payload?, region?): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.put(this.authService.getRosUrl(region) + url, payload || {})
                .subscribe(
                    (results: any) => {
                        resolve(results);
                    },
                    (err) => {
                        this.ds.err(`ROSEp: ${JSON.stringify(err)}`);
                    }
                );
        });
    }

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${error.error}`);
        }
        // return an observable with a user-facing error message
        return throwError(
            'Http error caught.');
    }
}
