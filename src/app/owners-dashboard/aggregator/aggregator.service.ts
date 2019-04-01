// import {Injectable} from '@angular/core';
// import * as _ from 'lodash';
// import * as moment from 'moment';

// export enum Period {MONTHLY, WEEKLY, HOURLY, YEARLY}

// @Injectable()
// export class PeriodAggregatorService {

//     private entries: Array<any>;

//     constructor(entries: Array<any>) {
//         this.entries = entries;
//     }

//     groupBy(period: Period) {
//         switch(period) {
//             case Period.MONTHLY: return this._groupByMonth();
//         }

//         throw new Error(`Period ${period} is not supported yet in PeriodAggregator`);
//     }

//     _groupByMonth() {
//         return _.groupBy(this.entries, entry => moment(entry.date).month());
//     }

// }
