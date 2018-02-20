import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

@Injectable()
export class TablesDataService {

    /* 
        
    */
    public tables$: Observable<any> = new Observable(obs => {
        this.rosEp.get('tables', {})
            .then((tablesRaw: {}[]) => {
                obs.next({
                    tablesRaw: tablesRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp
    ) {

        // this.tables$.subscribe(data => {
        //     debugger;
        // });
    }

}
