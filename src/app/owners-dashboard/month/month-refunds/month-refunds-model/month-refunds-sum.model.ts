import * as _ from 'lodash';
import {OrderType} from '../../../../../tabit/model/OrderType.model';

export class MonthRefundsSum {
    accountIds: string[];
    amount: number;
    approveBy: string[];
    approveByName: string[];
    opened: string[];
    orderNumber: number[];
    ownerId: string[];
    ownerName: string[];
    paymentsName: string[];
    tableNumber?: number;
    tlogId: string[];
    userId: string[];
    unserName: string[];

    constructor(data: any) {
        _.assign(this, data);
    }

}


