import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {ROSEp} from '../ep/ros.ep';
import {DebugService} from '../../../app/debug.service';
import {publishReplay, refCount} from 'rxjs/operators';

@Injectable()
export class ItemsDataService {

    /*

    */
    public items$: Observable<any> = new Observable(obs => {
        this.ds.log('itemsDS: fetching');
        this.rosEp.get('items', {})
            .then((itemsRaw: {}[]) => {
                this.ds.log('itemsDS: fetching: done');
                obs.next({
                    itemsRaw: itemsRaw
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

        //lets cache!
        // setTimeout(() => {
        //     this.ds.log('itemsDS: fetching');
        //     this.items$.subscribe(data => { });
        // }, Math.random() * 8000 + 5000);
    }

}
