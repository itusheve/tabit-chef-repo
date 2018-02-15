import * as moment from 'moment';

export class Order {
    id: number;
    openingTime: moment.Moment;
    number: number;
    waiter: string;
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
}
