import {Component, Input, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {DataService} from '../../../../tabit/data/data.service';

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


    constructor(private dataService:DataService) {
    }

    ngOnInit() {

        this.dataService.settings$.subscribe(settings =>{
            let servicesData =  _.groupBy(this.data, 'serviceId');

            let finalData = {};

            Object.keys(servicesData).forEach(serviceKey => {
                let data =  servicesData[serviceKey];
                let departmentData = _.groupBy(data,'departmentName');
                finalData[serviceKey] = [];
                Object.keys(departmentData).forEach(departmentKey =>{
                    let data = departmentData[departmentKey];
                    data.sort(this.sort);
                    data = data.slice(0,settings.maxItemsPerDepartment);
                    finalData[serviceKey] = finalData[serviceKey].concat(data);
                });

            });

            this.allDayData = {primary:finalData['-1'],alt:[]};
            this.lunchData =  {primary:finalData['10'],alt:[]};
            this.eveningData = {primary:finalData['20'],alt:[]};
            this.nightData =  {primary:finalData['30'],alt:[]};
        });



/*       console.log(servicesData);
       let data = [-1,10,20,30].map(
           serviceId => {
              let d =  this.data.filter(e => e.serviceId === serviceId);
              d.sort(this.sort);
              d.sort(this.sortString);
              return d;
           }

       )*/


    }

    sort(a,b){
        return b.salesAmountIncludeVat - a.salesAmountIncludeVat;
    }

}
