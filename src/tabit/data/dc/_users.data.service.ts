import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

import { fromPromise } from 'rxjs/observable/fromPromise';
import { zip } from 'rxjs/observable/zip';

@Injectable()
export class UsersDataService {

    /* 
        
    */
    public users$: Observable<any> = new Observable(obs => {

        let that = this;

        zip(
            fromPromise(that.rosEp.get('users?getInactive=ture', {})),
            fromPromise(that.rosEp.get('systemusers', {}))
        ).subscribe(data => {

            let allusers = data[0];
            let systemusers = data[1];
            let result = allusers.concat(systemusers);

            obs.next({
                usersRaw: result
            });
        });

    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp
    ) {

        //lets cache!        
        setTimeout(() => {
            this.users$.subscribe(data => { });
        }, Math.random() * 8000 + 2000);
    }

}
