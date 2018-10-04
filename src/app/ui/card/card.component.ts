import {Component, OnInit, Input} from '@angular/core';
import {DecimalPipe, PercentPipe, DatePipe} from '@angular/common';
import {BehaviorSubject} from 'rxjs';
// export interface Trend {
//   show: boolean;
//   val: number;
// }
import {environment} from '../../../environments/environment';
import {currencySymbol} from '../../../tabit/data/data.service';
import {TabitHelper} from '../../../tabit/helpers/tabit.helper';

export interface CardData {
    loading: boolean;
    title: string;
    tag: string;
    sales: number;
    diners: number;
    ppa: number;
    trends?: any;
    salesComment?: string;
    aggregations?: any;
    type?: any;
    currency?: string;
    noSeparator?: boolean;
    averages?: any;
    reductions?: any;
    holiday?: string;
    statusClass?: string;
}

@Component({
    selector: 'app-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss']
})

export class CardComponent implements OnInit {

    @Input() cardData: CardData;
    public region: any;
    public currency: any;
    public tabitHelper: TabitHelper;

    constructor() {
        this.region = environment.region;
        this.currency = currencySymbol;
        this.tabitHelper = new TabitHelper();
    }

    ngOnInit() {
    }

    getPercentageCssClass(change, isUpPositive) {
        let cssClass = this.tabitHelper.getTextClassByPercentage(change, isUpPositive);
        if(isUpPositive && change > 1) {
            cssClass += ' up';
        }
        else if(!isUpPositive && change < 1) {
            cssClass += ' down';
        }
        else if(!isUpPositive && change > 1) {
            cssClass += ' up';
        }
        else {
            cssClass += ' down';
        }
        return cssClass;
    }
}
