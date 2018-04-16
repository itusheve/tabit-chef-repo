import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';
import { DebugService } from '../../../app/debug.service';

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
        private rosEp: ROSEp,
        private ds: DebugService
    ) {

        // this.peripherals$.subscribe(data => {
        // });
    }

}
