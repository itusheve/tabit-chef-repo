import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { environment } from '../../environments/environment';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';
import {DataService} from '../../tabit/data/data.service';
import * as _ from 'lodash';



@Pipe({
    name: 'currency',
    pure: false
})
export class CurrencyPipe implements PipeTransform {
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
export class OwnersDashboardCurrencyPipe implements PipeTransform {
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

@Pipe({
    name: 'hour',
    pure: false
})
export class OwnersDashboardHourPipe implements PipeTransform {

    transform(minutes: any): any {
        minutes = Math.round(minutes);
        let h = Math.floor(minutes / 60);
        let m = minutes % 60;

        h = _.padStart(h,2,'0');
        m = _.padStart(m,2,'0');

        return `${h}:${m}`;
    }
}


@Pipe({
    name: 'safe'
  })
  export class SafePipe implements PipeTransform {
  
    constructor(protected sanitizer: DomSanitizer) {}
   
   public transform(value: any, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
      switch (type) {
              case 'html': return this.sanitizer.bypassSecurityTrustHtml(value);
              case 'style': return this.sanitizer.bypassSecurityTrustStyle(value);
              case 'script': return this.sanitizer.bypassSecurityTrustScript(value);
              case 'url': return this.sanitizer.bypassSecurityTrustUrl(value);
              case 'resourceUrl': return this.sanitizer.bypassSecurityTrustResourceUrl(value);
              default: throw new Error(`Invalid safe type specified: ${type}`);
          }
    }
  }