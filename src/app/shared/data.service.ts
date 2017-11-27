import { Injectable } from '@angular/core';
import { OlapEp } from './olap.ep';

@Injectable()
export class DataService {
    constructor(private olapEp: OlapEp) {

    }

    getGridData() {
        //console.log('bla');
        return this.olapEp.getGridData();
    }
}
