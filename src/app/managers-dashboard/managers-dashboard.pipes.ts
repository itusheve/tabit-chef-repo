import { Pipe, PipeTransform } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { environment } from '../../environments/environment';
import { currencySymbol, tmpTranslations } from '../../tabit/data/data.service';


@Pipe({
  name: 'tmpTranslate',
  pure: false
})
export class MDTMPTranslatePipe implements PipeTransform {
  transform(value: any): any {
    let ret = tmpTranslations.get(value);
    return ret || value;
  }
}

@Pipe({
  name: 'currencyFraction',
  pure: false
})
export class MDCurrencyFractionPipe implements PipeTransform {
  private decPipe: DecimalPipe = new DecimalPipe(environment.tbtLocale);
  transform(value: any, decimal?: string): any {
    decimal = decimal || '2';

    if (isNaN(value)) {
      return '';
    }
    value = value / 100;
    return this.decPipe.transform(value, `1.${decimal}-${decimal}`);
  }
}

@Pipe({
  name: 'mapList',
  pure: false
})
export class MDMapListPipe implements PipeTransform {
  transform(value: any, options: any, matchField?: any, valueField?: any): any {
    if (!matchField) matchField = "value";
    if (!valueField) valueField = "text";
    if (options) {
      for (var i = 0; i < options.length; i++) {
        if (options[i][matchField] == value) {
          return options[i][valueField];
        }
      }
    }
    return '';
  }
}

@Pipe({
  name: 'PPOKPI',
  pure: false
})
export class MDPPOKPIPipe implements PipeTransform {
  transform(value: any, goal: number, goalAlert: number): any {
    if (value >= goal) return 'badge-success';
    if (value <= goalAlert) return 'badge-danger';
    return 'badge-warning';
  }
}

@Pipe({
  name: 'KPIGoal',
  pure: false
})
export class KPIGoalPipe implements PipeTransform {
  private decPipe: DecimalPipe = new DecimalPipe(environment.tbtLocale);
  transform(value: any, decimal?: string): any {
    decimal = decimal || '1';
    if (isNaN(value)) return '';
    let respnse = this.decPipe.transform(value / 100, `1.${decimal}-${decimal}`);
    return value > 0 ? '+' + respnse : respnse;
  }
}

