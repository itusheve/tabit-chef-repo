import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';
import { DebugService } from '../../../app/debug.service';

@Injectable()
export class ItemsDataService {

    /*

    */
    public items$: Observable<any> = new Observable(obs => {
        this.rosEp.get('items', {})
            .then((itemsRaw: {}[]) => {
                this.ds.log('itemsDS: fetching: done');
                obs.next({
                    itemsRaw: itemsRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp,
        private ds: DebugService
    ) {

        //lets cache!
        setTimeout(() => {
            this.ds.log('itemsDS: fetching');
            this.items$.subscribe(data => { });
        }, Math.random() * 8000 + 5000);
    }

}
