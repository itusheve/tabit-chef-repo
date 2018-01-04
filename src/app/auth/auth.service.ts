import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const ROS_base_url = 'https://ros-office-beta.herokuapp.com';//TODO get from config
const loginUrl = '/oauth2/token';

@Injectable()
export class AuthService {

    constructor(private httpClient: HttpClient) {}

    private loggedIn = false;
    private authToken = undefined;


    // private setOrg(org: any): Promise<any> {

    // }

    //private getOrgs()

    login(opt): Promise<any> {        
        const p = new Promise((res, rej)=>{
            this.httpClient.post(ROS_base_url + loginUrl, {
                client_id: 'VbXPFm2RMiq8I2eV7MP4ZQ',
                grant_type: 'password',
                username: opt.email,
                password: opt.password
            })
                .subscribe(
                    (results: any) => {
                        this.authToken = results.access_token;
                        this.loggedIn = true;
                        res();
                    },
                    () => {
    
                    }
                );
        });    

        return p;
    }

    logout() {
        this.authToken = undefined;
        this.loggedIn = false;
    }

    isAuthenticated(): Promise<any> {
        const promise = new Promise((resolve, reject)=>{
            resolve(this.loggedIn);
        });
        return promise;
    }

    getAuthToken(ep: string): Promise<any> {
        return this.authToken;
    }
}
