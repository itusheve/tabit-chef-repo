import {Input, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {DataService} from '../../../../tabit/data/data.service';

export abstract class MonthMostAbstract implements OnInit {

    @Input()
    protected data;

    services: any[] = [];



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
                let sortOrder = _.groupBy(data,'departmentName');
                this.services.push({data:{primary:[],alt:[]},title:data[0].serviceName});
                Object.keys(sortOrder).forEach(sortOrderKey =>{
                    let data = sortOrder[sortOrderKey];
                    data.sort(this.sort);
                    data = data.slice(0,settings.maxItemsPerDepartment);
                    this.services[c].data.primary = this.services[c].data.primary.concat(data);
                });
                this.services[c].data.primary = this.services[c].data.primary.sort((a,b)=>b.sortOrderKey + a.sortOrderKey);
                c++;
            });

        });

    }

    sort(a,b){
        return b.sold - a.sold;
    }


}
