import {Component, OnInit, Input} from '@angular/core';
import {environment} from '../../../environments/environment';
import {TabitHelper} from '../../../tabit/helpers/tabit.helper';
import {DataService} from '../../../tabit/data/data.service';

export interface CardData {
    loading: boolean;
    title: string;
    tag: string;
    sales: number;
    diners: number;
    ppa: number;
    ppaOrders: number;
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

    constructor(private dataService: DataService) {
        this.region = environment.region;
        this.tabitHelper = new TabitHelper();
        this.env = environment;
    }

    ngOnInit() {
        this.dataService.currencySymbol$.subscribe(symbol => {
            this.currency = symbol;
        });
    }

    getArrow(percentage) {
        if(!percentage) {
            return 'minimize';
        }

        if(percentage > 0) {
            return 'arrow_drop_up';
        }
        else if(percentage < 0) {
            return 'arrow_drop_down';
        }
    }

    getPercentageCssClass(percentage, isUpPositive, change) {
        let cssClass = this.tabitHelper.getTextClassByPercentage(change || percentage, isUpPositive);
        return cssClass;
    }

    getReductionPercentageCssClass(change, isUpPositive, percentage) {
        let normalizedPercentage = percentage * 100;
        let normalizedAvg = (normalizedPercentage - change);

        normalizedPercentage = +(normalizedPercentage.toFixed(1));
        normalizedAvg = +(normalizedAvg.toFixed(1));

        let calculatedPercentage = normalizedPercentage / normalizedAvg;

        if(calculatedPercentage === 0) {
            calculatedPercentage = change;
        }
        let cssClass = this.tabitHelper.getTextClassByPercentage(calculatedPercentage * 100, isUpPositive);
        return cssClass;
    }

    getIconClass(change) {
        let classList = 'arrowIcon';
        if(!change) {
            classList += ' noChangeIcon';
        }
        return classList;
    }
}
