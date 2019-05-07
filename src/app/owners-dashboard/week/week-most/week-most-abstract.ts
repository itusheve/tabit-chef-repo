import {Input, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {DataService} from '../../../../tabit/data/data.service';

export abstract class WeekMostAbstract implements OnInit {
    @Input()
    protected data;

    protected services: any[] = [];



    protected constructor(protected dataService:DataService) {
    }

    ngOnInit() {
        // abstract //

        this.dataService.settings$.subscribe(settings =>{

            let servicesData =  _.groupBy(this.data, 'serviceId', 'serviceName');
            let c = 0;
            let servicesKeys= [];
            servicesKeys.push(-1);
            servicesKeys=servicesKeys.concat(Object.keys(servicesData).filter(e => e !== '-1'));

            servicesKeys.forEach(serviceKey => {

                let data =  servicesData[serviceKey];
                let departmentData = _.groupBy(data,'departmentName');
                this.services.push({data:[],title:data[0].serviceName});
                Object.keys(departmentData).forEach(departmentKey =>{
                    let data = departmentData[departmentKey];
                    data.sort(this.sort);
                    data = data.slice(0,settings.maxItemsPerDepartment);
                    this.services[c].data = this.services[c].data.concat(data);
                });
                this.services[c].data = this.services[c].data.sort((a,b)=>a.sortOrder - b.sortOrder);
                c++;
            });

        });

    }

    sort(a,b){
        return b.sold - a.sold;
    }

}
