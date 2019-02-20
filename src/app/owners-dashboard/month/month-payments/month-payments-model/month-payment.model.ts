import * as _ from 'lodash';

export class MonthPaymentModel {
    amount: string[];
    accountName: string[];
    isBold: boolean;
    rn: number[];
    type: string[];

    constructor(data: any) {
        _.assign(this, data);
    }

}
