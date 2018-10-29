import {Component, OnInit, Input} from '@angular/core';
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
    showDrillArrow?: boolean;
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
    public env;

    constructor() {
        this.region = environment.region;
        this.currency = currencySymbol;
        this.tabitHelper = new TabitHelper();
        this.env = environment;
    }

    ngOnInit() {
    }

    getArrow(percentage) {
        if(!percentage) {
            return 'trending_flat';
        }

        if(percentage > 0) {
            return 'trending_up';
        }
        else if(percentage < 0) {
            return 'trending_down';
        }
    }

    getPercentageCssClass(percentage, isUpPositive, change) {
        let cssClass = this.tabitHelper.getTextClassByPercentage(change || percentage, isUpPositive);
        return cssClass;
    }

    getReductionPercentageCssClass(percentage, isUpPositive, change) {
        let cssClass = this.tabitHelper.getTextClassByPercentage(((change / (percentage - change)) * 100) + 100, isUpPositive);
        return cssClass;
    }

    getIconClass() {
        return this.env.lang === 'he' ? 'iconFlipped' : '';
    }
}
