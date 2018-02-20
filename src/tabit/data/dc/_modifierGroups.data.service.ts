import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

import * as _ from 'lodash';

@Injectable()
export class ModifierGroupsDataService {

    /* 
        
    */
    public modifierGroups$: Observable<any> = new Observable(obs => {
        this.rosEp.get('modifierGroups', {})
            .then((modifierGroupsRaw: {}[]) => {
                const allModifiersRaw = [];
                _.each(modifierGroupsRaw, function (mg) {
                    //was Array.prototype.push.apply(service.allModifiers, mg.modifiers); ?!?!?!?
                    allModifiersRaw.push(...mg.modifiers);
                });

                obs.next({
                    modifierGroups: modifierGroupsRaw,
                    allModifiersRaw: allModifiersRaw
                });
            });
    }).publishReplay(1).refCount();

    constructor(
        private rosEp: ROSEp
    ) {

        // this.modifierGroups$.subscribe(data => {
        //     debugger;
        // });
    }

}
