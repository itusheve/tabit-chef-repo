import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

@Injectable()
export class ItemsDataService {

    /*

    */
    public items$: Observable<any> = new Observable(obs => {
        this.rosEp.get('items', {})
            .then((itemsRaw: {}[]) => {
                obs.next({
                    itemsRaw: itemsRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp
    ) {

        //lets cache!
        setTimeout(() => {
            this.items$.subscribe(data => { });
        }, Math.random() * 8000 + 5000);
    }

}
