import * as moment from 'moment';
import {User} from '../../../../tabit/model/User.model';


export class Order {
    id: number;
    tlogId: string;
    openingTime: string;
    businessDate: moment.Moment;
    number: number;
    waiter: string;
        user: {
            openedBy: User;
            owner: User;
        };
     // orderType: OrderType;
    sales: number;
    netSales: number;
    salesBeforeTip: number;
    diners: number;
    ppa: number;
        priceReductions: {
            cancellation: number,
            discountsAndOTH: number,
            employees: number,
            promotions: number
        }
    isReturnOrder: boolean;//copied from Office
    isTaxExempt: boolean;//copied from Office
    enrichmentLevels: {
        orderDetails: boolean,
    };
    wasKickout: boolean;

}
