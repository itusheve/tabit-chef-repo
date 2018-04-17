import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ROSEp } from '../ep/ros.ep';

import * as _ from 'lodash';

@Injectable()
export class CheckDataService {

    private URL_ORDER = "tlogs";
    private URL_CHECKS = "checks"

    /*
 
     */
    public getChecks(tlogId) {
        return this.rosEp.get(`${this.URL_ORDER}/${tlogId}/${this.URL_CHECKS}`, {})
            .then((result: any[]) => {
                return result;
            });
    };


    constructor(
        private rosEp: ROSEp
    ) {

        //lets cache!
        // setTimeout(() => {
        //     this.items$.subscribe(data => { });
        // }, Math.random() * 8000 + 5000);
    }

}
