import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
// import { SlipVM } from '../order-view.component';

@Pipe({
    name: 'curr',
    pure: false
})
export class OwnersDashboardCurrencyPipe implements PipeTransform {
    private decPipe: DecimalPipe = new DecimalPipe('he-IL');
    private currencySymbol = '₪';

    transform(value: any, decimal?: string, cents?: string, nullify?: string): any {
        decimal = decimal || '2';

        if (value===undefined || value===null) {
            return '';
        }
        if (value===0 && nullify==='nullify') {
            return '';
        }

        if (cents === 'cents') {
            value = value / 100;
        }        
        let result = this.decPipe.transform(value, `1.${decimal}-${decimal}`);
        if (result) {
            result = `${this.currencySymbol}${result}`;
        }

        return result;
    }
}

@Pipe({
    name: 'pct',
    pure: false
})
export class OwnersDashboardPercentPipe implements PipeTransform {
    private pctPipe: PercentPipe = new PercentPipe('he-IL');

    transform(value: any, decimal?: string, nullify?: string): any {
        decimal = decimal || '2';

        if (value === undefined || value === null) {
            return '';
        }

        if (value === 0 && nullify === 'nullify') {
            return '';
        }

        let result = this.pctPipe.transform(value, `1.${decimal}-${decimal}`);

        return result;
    }
}

@Pipe({
    name: 'count',
    pure: false
})
export class OwnersDashboardCountPipe implements PipeTransform {
    private decPipe: DecimalPipe = new DecimalPipe('he-IL');

    transform(value: any): any {
        return this.decPipe.transform(value, '1.0-0');
    }
}
