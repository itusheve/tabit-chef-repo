import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ROSEp } from '../ep/ros.ep';
import { DebugService } from '../../../app/debug.service';
import {publishReplay, refCount} from 'rxjs/operators';

@Injectable()
export class PromotionsDataService {

    /*

    */

    public promotions$: Observable<any> = new Observable(obs => {
        this.ds.log('promotionsDS: fetching');
        this.rosEp.get('promotions', {})
            .then((promotionsRaw: {}[]) => {
                this.ds.log('promotionsDS: fetching: done');
                obs.next({
                    promotionsRaw: promotionsRaw
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
        //     this.ds.log('promotionsDS: fetching');
        //     this.promotions$.subscribe(data => { });
        // }, Math.random() * 8000 + 5000);
    }

}
