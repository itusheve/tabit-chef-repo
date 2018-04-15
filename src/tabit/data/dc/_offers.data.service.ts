import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

import * as _ from 'lodash';
import { DebugService } from '../../../app/debug.service';

@Injectable()
export class OffersDataService {

    /*

    */
    public offers$: Observable<any> = new Observable(obs => {
        this.rosEp.get('offers', {})
            .then((offersRaw: {}[]) => {

                const bundlesRaw = _.chain(offersRaw)
                    .filter(function (offer) {
                        if (!offer.items.length && offer.selectionGroups.length) {
                            return offer;
                        }
                    })
                    .keyBy('_id')
                    .value();

                this.ds.log('offersDS: fetching: done');
                obs.next({
                    offersRaw: offersRaw,
                    bundlesRaw: bundlesRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp,
        private ds: DebugService
    ) {

        //lets cache!
        // setTimeout(() => {
        //     this.ds.log('offersDS: fetching');
        //     this.offers$.subscribe(data => {});
        // }, Math.random() * 8000 + 5000);
    }

}
