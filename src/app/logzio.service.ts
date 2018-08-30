import {Injectable} from '@angular/core';
import {HttpClient, HttpBackend, HttpHeaders} from '@angular/common/http';

@Injectable()
export class LogzioService {

    private httpClient: HttpClient;
    private headers: HttpHeaders;

    constructor(handler: HttpBackend) {
        this.httpClient = new HttpClient(handler);
        this.headers = new HttpHeaders({});
    }

    log(type, message, payload) {

        let logUrl = `https://listener.logz.io:8091/?token=RUdaqvgfxbtHTLozMFDKKypDIudVyoRE&message=` + message + `&type=` + type;
        try {
            Object.keys(payload).forEach(function(key) {
                logUrl += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]);
            });

            let logImg = new Image();
            logImg.src = logUrl;
        } catch (ex) {
            if (window && window.console && typeof window.console.log === 'function') {
                console.log('Failed to send log because of exception:\n' + ex);
            }
        }

        /*return this.httpClient.post(`https://listener.logz.io:8071/?token=RUdaqvgfxbtHTLozMFDKKypDIudVyoRE&type=` + type, {
            chef: payload
        }, {
            headers: this.headers,
            withCredentials: false
        }).subscribe(result => {});*/
    }
}
