import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
// import { SlipVM } from '../order-view.component';

@Pipe({
    name: 'curr2',
    pure: false
})
export class OwnersDashboardCurrencyPipe implements PipeTransform {
    currPipe: CurrencyPipe = new CurrencyPipe('he-IL');

    transform(value: any, cents?: string): any {
        //return values.filter(s=>s.class===class_);
        //let int = parseInt(value, 10);
        //if (!isNaN(int)) {
            if (value && cents && cents === 'cents') {
                value = value / 100;
            }
            return this.currPipe.transform(value, 'ILS', 'symbol', '1.2-2');
        //}
        //return '';
    }
}
