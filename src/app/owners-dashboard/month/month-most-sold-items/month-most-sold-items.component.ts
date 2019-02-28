import {Component, Input, OnInit} from '@angular/core';
import {DataWareHouseService} from '../../../services/data-ware-house.service';
import * as _ from 'lodash';

@Component({
    selector: 'app-month-most-sold-items',
    templateUrl: './month-most-sold-items.component.html',
    styleUrls: ['./month-most-sold-items.component.scss']
})
export class MonthMostSoldItemsComponent implements OnInit {

    @Input()
    data;
    allDayData = {};
    lunchData = {};
    eveningData = {};
    nightData = {};


    constructor() {
    }

    ngOnInit() {

        this.allDayData = {primary:this.data.filter(e => e.serviceId === -1),alt:[]};
        this.lunchData =  {primary:this.data.filter(e => e.serviceId === 10),alt:[]};
        this.eveningData = {primary :this.data.filter(e => e.serviceId === 20),alt:[]};
        this.nightData =  {primary:this.data.filter(e => e.serviceId >= 30),alt:[]};

    }

}
