import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

@Injectable()
export class PromotionsDataService {

    /* 
        
    */
   
    public promotions$: Observable<any> = new Observable(obs => {
        this.rosEp.get('promotions', {})
            .then((promotionsRaw: {}[]) => {
                obs.next({
                    promotionsRaw: promotionsRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp
    ) {

        // this.promotions$.subscribe(data => {
        //     debugger;
        // });
    }

}
