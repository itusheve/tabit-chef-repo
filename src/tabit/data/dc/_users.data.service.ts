import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

@Injectable()
export class UsersDataService {

    /* 
        
    */
    public users$:Observable<any> = new Observable(obs=>{
        this.rosEp.get('users', {})
            .then((usersRaw: {}[]) => {
                obs.next({
                    usersRaw: usersRaw
                });
            });
    }).publishReplay(1).refCount();
    
    constructor(
        private rosEp: ROSEp
    ) { 

        // this.users$.subscribe(data=>{
        //     debugger;
        // });
    }

}
