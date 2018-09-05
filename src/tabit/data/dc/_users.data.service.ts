import { Injectable } from '@angular/core';
import { Observable ,  from as fromPromise ,  zip } from 'rxjs';
import { ROSEp } from '../ep/ros.ep';
import { DebugService } from '../../../app/debug.service';
import {publishReplay, refCount} from 'rxjs/operators';

@Injectable()
export class UsersDataService {

    /*

    */
    public users$: Observable<any> = new Observable(obs => {

        this.ds.log('usersDS: fetching');
        let that = this;

        zip(
            fromPromise(that.rosEp.get('users?getInactive=true', {})),
            fromPromise(that.rosEp.get('systemusers', {}))
        ).subscribe(data => {

            let allusers = data[0];
            let systemusers = data[1];
            let result = allusers.concat(systemusers);

            this.ds.log('usersDS: fetching: done');
            obs.next({
                usersRaw: result
            });
        });

    }).pipe(
        publishReplay(1),
        refCount()
    );

    constructor(
        private rosEp: ROSEp,
        private ds: DebugService
    ) {

        // //lets cache!
        // setTimeout(() => {
        //     this.ds.log('usersDS: fetching');
        //     this.users$.subscribe(data => { });
        // }, Math.random() * 8000 + 5000);
    }

}
