import {Input, Pipe, PipeTransform} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {DataService} from '../../../tabit/data/data.service';



@Pipe({
    name: 'currency',
    pure: false
})


export class CurrencyPipeDialog implements PipeTransform {
    private decPipe: DecimalPipe = new DecimalPipe(environment.region === 'il' ? 'he-IL' : 'en-US');

    constructor(private sanitized: DomSanitizer, private dataService: DataService){}

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
                    if(environment.lang === 'he') {
                        result = `<span style="font-size: calc(100% - 4px)">${this.dataService.currencySymbol$.value}</span>${result}-`;
                    }
                    else {
                        result = `<span style="font-size: calc(100% - 4px)">-${this.dataService.currencySymbol$.value}</span>${result}`;
                    }

                } else {
                    result = `<span style="font-size: calc(100% - 4px)">${this.dataService.currencySymbol$.value}</span>${result}`;
                }

            } else if(value < 0) {
                if(environment.lang === 'he') {
                    result = `${result}-`;
                }
                else {
                    result = `-${result}`;
                }

            }
        }

        return this.sanitized.bypassSecurityTrustHtml(result);
    }
}

@Pipe({
    name: 'curr',
    pure: false
})
export class OwnersDashboardCurrencyPipeDialog implements PipeTransform {
    private decPipe: DecimalPipe = new DecimalPipe(environment.region === 'il' ? 'he-IL' : 'en-US');

    constructor(private dataService: DataService){}

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
                    if(environment.lang === 'he') {
                        result = `${this.dataService.currencySymbol$.value}${result}-`;
                    }
                    else {
                        result = `-${this.dataService.currencySymbol$.value}${result}`;
                    }

                } else {
                    result = `${this.dataService.currencySymbol$.value}${result}`;
                }

            } else if(value < 0) {
                if(environment.lang === 'he') {
                    result = `${result}-`;
                }
                else {
                    result = `-${result}`;
                }
            }
        }

        return result;
    }





}
