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

    services: any[] = []
   /* allDayData = {};
    lunchData = {};
    eveningData = {};
    nightData = {};*/


    constructor(private dataService:DataService) {
    }

    ngOnInit() {

        this.dataService.settings$.subscribe(settings =>{
            let servicesData =  _.groupBy(this.data, 'serviceId');
            let c = 0;
            Object.keys(servicesData).forEach(serviceKey => {

                let data =  servicesData[serviceKey];
                let departmentData = _.groupBy(data,'departmentName');
                this.services.push({data:{primary:[],alt:[]},title:data[0].serviceName});
                Object.keys(departmentData).forEach(departmentKey =>{
                    let data = departmentData[departmentKey];
                    data.sort(this.sort);
                    data = data.slice(0,settings.maxItemsPerDepartment);
                    this.services[c].data.primary = this.services[c].data.primary.concat(data);
                });
                this.services[c].data.primary.sort((a,b)=>b.departmentName.localeCompare(a.departmentName));
                c++;
            });

        });

    }

    sort(a,b){
        return b.salesAmountIncludeVat - a.salesAmountIncludeVat;
    }

}
