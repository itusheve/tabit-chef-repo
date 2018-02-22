import * as moment from 'moment';
import { User } from './User.model';

export class Order {
    id: number;
    tlogId: string;
    openingTime: moment.Moment;
    number: number;
    waiter: string;
    users: {
        waiter: User;
        owner: User;
        opened: User;
        locked: User;
    };
    orderTypeId: string;
    sales: number;
    diners: number;
    ppa: number;
    priceReductions: {
        cancellation: number,
        discountsAndOTH: number,
        employees: number,
        promotions: number
    };
    isReturnOrder: boolean;//copied from Office
    isTaxExempt: boolean;//copied from Office
    enrichmentLevels: {
        orderDetails: boolean,
    };

    constructor() {
        this.enrichmentLevels = {
            orderDetails: false//brings: users, 
        };
    }
}
