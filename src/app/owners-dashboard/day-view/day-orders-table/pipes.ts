import { Pipe, PipeTransform } from '@angular/core';
import { Order } from '../../../../tabit/model/Order.model';
import { OrderTypeVM } from './day-orders-table.component';

@Pipe({
    name: 'hasSales',
    pure: false
})
export class DayOrdersTableHasSalesPipe implements PipeTransform {
    transform(orderTypes: OrderTypeVM[], filter: Object): any {
        return orderTypes.filter(i=>i.sales>0);
    }
}
