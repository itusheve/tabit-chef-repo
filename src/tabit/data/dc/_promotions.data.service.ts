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

        //lets cache!        
        setTimeout(() => {
            this.promotions$.subscribe(data => { });
        }, Math.random() * 8000 + 2000);
    }

}
