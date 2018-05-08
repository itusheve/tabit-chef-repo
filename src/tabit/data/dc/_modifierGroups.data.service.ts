import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

import * as _ from 'lodash';
import { DebugService } from '../../../app/debug.service';

@Injectable()
export class ModifierGroupsDataService {

    /*

    */
    public modifierGroups$: Observable<any> = new Observable(obs => {
        this.ds.log('modifierGroupsDS: fetching');
        this.rosEp.get('modifierGroups', {})
            .then((modifierGroupsRaw: {}[]) => {
                const allModifiersRaw = [];
                _.each(modifierGroupsRaw, function (mg) {
                    //was Array.prototype.push.apply(service.allModifiers, mg.modifiers); ?!?!?!?
                    allModifiersRaw.push(...mg.modifiers);
                });

                this.ds.log('modifierGroupsDS: fetching: done');
                obs.next({
                    modifierGroups: modifierGroupsRaw,
                    allModifiersRaw: allModifiersRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp,
        private ds: DebugService
    ) {

        //lets cache!
        // setTimeout(() => {
        //     this.modifierGroups$.subscribe(data => { });
        // }, Math.random() * 8000 + 5000);
    }

}
