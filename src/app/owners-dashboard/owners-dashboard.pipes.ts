import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { environment } from '../../environments/environment';
import { currencySymbol } from '../../tabit/data/data.service';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
    name: 'currency',
    pure: false
})
export class CurrencyPipe implements PipeTransform {
    private decPipe: DecimalPipe = new DecimalPipe(environment.region === 'il' ? 'he-IL' : 'en-US');

    constructor(private sanitized: DomSanitizer){}

    transform(value: any, decimal?: string, cents?: string, nullify?: string, disableSymbol?: boolean): any {
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
        let result = this.decPipe.transform(Math.abs(value), `1.${decimal}-${decimal}`);
        if (result) {
            if(!disableSymbol) {
                if(value < 0){
                    result = `<span style="font-size: calc(100% - 4px)">${currencySymbol}</span>${result}-`;
                } else {
                    result = `<span style="font-size: calc(100% - 4px)">${currencySymbol}</span>${result}`;
                }

            } else if(value < 0) {
                result = `-${result}`;
            }
        }

        return this.sanitized.bypassSecurityTrustHtml(result);
    }
}

@Pipe({
    name: 'curr',
    pure: false
})
export class OwnersDashboardCurrencyPipe implements PipeTransform {
    private decPipe: DecimalPipe = new DecimalPipe(environment.region === 'il' ? 'he-IL' : 'en-US');

    transform(value: any, decimal?: string, cents?: string, nullify?: string, hideSymbol?: boolean): any {
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
        let result = this.decPipe.transform(Math.abs(value), `1.${decimal}-${decimal}`);
        if (result) {
            if(!hideSymbol) {
                if(value < 0){
                    result = `${currencySymbol}${result}-`;
                } else {
                    result = `${currencySymbol}${result}`;
                }

            } else if(value < 0) {
                result = `-${result}`;
            }
        }

        return result;
    }
}

@Pipe({
    name: 'pct',
    pure: false
})
export class OwnersDashboardPercentPipe implements PipeTransform {
    private pctPipe: PercentPipe = new PercentPipe(environment.region === 'il' ? 'he-IL' : 'en-US');

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
    private decPipe: DecimalPipe = new DecimalPipe(environment.tbtLocale);

    transform(value: any): any {
        return this.decPipe.transform(value, '1.0-0');
    }
}
