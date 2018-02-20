import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

@Injectable()
export class PeripheralsDataService {

    /* 
        
    */
    public peripherals$: Observable<any> = new Observable(obs => {
        this.rosEp.get('peripherals', {})
            .then((peripheralsRaw: {}[]) => {
                obs.next({
                    peripheralsRaw: peripheralsRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp
    ) {

        // this.peripherals$.subscribe(data => {
        //     debugger;
        // });
    }

}
