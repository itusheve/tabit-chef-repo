import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ROSEp } from '../ep/ros.ep';
import { DebugService } from '../../../app/debug.service';
import {publishReplay, refCount} from 'rxjs/operators';

@Injectable()
export class TablesDataService {

    /*

    */
    public tables$: Observable<any> = new Observable(obs => {
        this.ds.log('tablesDS: fetching');
        this.rosEp.get('tables', {})
            .then((tablesRaw: {}[]) => {
                this.ds.log('tablesDS: fetching: done');
                obs.next({
                    tablesRaw: tablesRaw
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
        //     this.ds.log('tablesDS: fetching');
        //     this.tables$.subscribe(data => { });
        // }, Math.random() * 8000 + 5000);
    }

}
