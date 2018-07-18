import {Component, OnInit, Input} from '@angular/core';
import {DecimalPipe, PercentPipe, DatePipe} from '@angular/common';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
// export interface Trend {
//   show: boolean;
//   val: number;
// }
import {environment} from '../../../environments/environment';
import {currencySymbol} from '../../../tabit/data/data.service';

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

    constructor() {
        this.region = environment.region;
        this.currency = currencySymbol;
    }

    ngOnInit() {
    }

}
