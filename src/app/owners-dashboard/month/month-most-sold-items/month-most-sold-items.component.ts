import {Component, Input, OnInit} from '@angular/core';


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

       let data = [-1,10,20,30].map(
           serviceId => {
              let d =  this.data.filter(e => e.serviceId === serviceId);
              d.sort(this.sort);
              d.sort(this.sortString);
              return d;
           }

       )
        this.allDayData = {primary:data[0],alt:[]};
        this.lunchData =  {primary:data[1],alt:[]};
        this.eveningData = {primary:data[2],alt:[]};
        this.nightData =  {primary:data[3],alt:[]};

    }

    sort(a,b){
        return b.salesAmountIncludeVat - a.salesAmountIncludeVat;
    }

    sortString(a,b){
        return b.departmentName.localeCompare(a.departmentName);
    }



}
