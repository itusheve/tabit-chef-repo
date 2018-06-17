import { Pipe, PipeTransform } from '@angular/core';
import { Order } from '../../../../tabit/model/Order.model';
import { OrderTypeVM } from './day-orders-table.component';

@Pipe({
    name: 'hasSales',
    pure: false
})
export class DayOrdersTableHasSalesPipe implements PipeTransform {
    transform(orderTypes: OrderTypeVM[], filter: Object): any {
        return orderTypes.filter(i=>i.sales !== 0);
    }
}


@Pipe({
    name: 'filterr',
    pure: false
})
export class DayOrdersTableFilterPipe implements PipeTransform {
    transform(orders: any[], filter: Object): any {
        return orders.filter(o => !o.filtered);
    }
}
