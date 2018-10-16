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

    getPercentageCssClass(percentage, isUpPositive, change) {
        let cssClass = this.tabitHelper.getTextClassByPercentage(change || percentage, isUpPositive);

        if(!percentage) {
            return cssClass += ' neutral';
        }

        if(percentage > 0) {
            cssClass += ' up';
        }
        else if(percentage < 0) {
            cssClass += ' down';
        }

        return cssClass;
    }

    getReductionPercentageCssClass(percentage, isUpPositive, change) {
        let cssClass = this.tabitHelper.getTextClassByPercentage(((change / (percentage - change)) * 100) + 100, isUpPositive);

        if(!percentage) {
            return cssClass += ' neutral';
        }

        if(percentage > 0) {
            cssClass += ' up';
        }
        else if(percentage < 0) {
            cssClass += ' down';
        }

        return cssClass;
    }
}
