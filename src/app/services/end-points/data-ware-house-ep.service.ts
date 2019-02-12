import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {catchError, retry} from 'rxjs/operators';
import {throwError} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DataWareHouseEpService {

    constructor(private httpClient: HttpClient) {
    }


    get(url, params?): Promise<any> {
            return this.httpClient.get(environment.reportingServer.url + url, {
                params: params || {}
            }).pipe(retry(1), catchError(this.handleError)).toPromise();
    }

    /*post(url, paylod?, region?): Promise<any> {
        return new Promise((resolve, reject) => {
            this.httpClient.post(this.authService.getRosUrl(region) + url, paylod || {})
                .subscribe((results: any) => {
                        resolve(results);
                    }, (err) => {
                        this.debugService.err(`DataWareHouseEpService: ${JSON.stringify(err)}`);
                    }
                );
        });
    }*/

    private handleError(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // client network error
            console.error('an error accourred:', error.error.message)
        } else {
            console.error(`backend returned code ${error.status},` +
                `body was: ${error.error}`);
        }

        return throwError(
            'Http error caught.');

    }
}
