import {OrderType} from '../../../../tabit/model/OrderType.model';


export class  MonthWaste{
    WasteData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        reasons: string;
        waste: number;

    }[];

    retentionData: {
            orderType: OrderType;
            waiter: string;
            approvedBy: string;
            orderNumber: number;
            tableId: string;
            item: string;
            subType: string;
            reasonId: string;
            reasons: string;
            retention: number;
        }[];

    wasteData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        reasons: string;
        waste: number;
    }[];


}
