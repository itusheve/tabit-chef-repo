import {OrderType} from '../../../tabit/model/OrderType.model';

export interface Data {
    operationalErrorsData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        operational: number;
        tlogId: string;
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
        retention: number;
        tlogId: string;
    }[];

    cancellationsData: {
        orderType: OrderType;
        waiter: string;
        approvedBy: string;
        orderNumber: number;
        tableId: string;
        item: string;
        subType: string;
        reasonId: string;
        cancellations: number;
        tlogId: string;
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
        waste: number;
        tlogId: string;
    }[];

    organizationalData: {
        orderType: OrderType;
        waiter: string;
        orderNumber: number;
        organizational: number;
        tlogId: string;
        service: string;
    }[];

    employeeData: {
        orderType: OrderType;
        orderNumber: number;
        amount: number;
        tlogId: string;
    }[];

}
