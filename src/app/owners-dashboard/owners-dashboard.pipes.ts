import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe } from '@angular/common';
// import { SlipVM } from '../order-view.component';

@Pipe({
    name: 'curr',
    pure: false
})
export class OwnersDashboardCurrencyPipe implements PipeTransform {
    private decPipe: DecimalPipe = new DecimalPipe('he-IL');
    private currencySymbol = '₪';

    transform(value: any, decimal?: string, cents?: string): any {
        //return values.filter(s=>s.class===class_);
        //let int = parseInt(value, 10);
        //if (!isNaN(int)) {

            decimal = decimal || '2';

            if (value && cents && cents === 'cents') {
                value = value / 100;
            }        
            //let tmp = this.decPipe.transform(value, 'ILS', 'symbol', '1.2-2');
            let result = this.decPipe.transform(value, `1.${decimal}-${decimal}`);
            if (result) {
                result = `${this.currencySymbol}${result}`;
            }
        return result;
        //}
        //return '';
    }
}
