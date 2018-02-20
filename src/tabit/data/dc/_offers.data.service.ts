import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

import * as _ from 'lodash';

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


                obs.next({
                    offersRaw: offersRaw,
                    bundlesRaw: bundlesRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp
    ) {

        // this.offers$.subscribe(data => {
        //     debugger;
        // });
    }

}
