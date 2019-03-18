import {Component, Input, OnInit} from '@angular/core';
import * as _ from 'lodash';
import {DataService} from '../../../../tabit/data/data.service';


@Component({
  selector: 'app-month-most-returned-items',
  templateUrl: './month-most-returned-items.component.html',
  styleUrls: ['./month-most-returned-items.component.scss']
})
export class MonthMostReturnedItemsComponent implements OnInit {

  @Input()
  data;

  services: any[] = [];

  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.settings$.subscribe(settings =>{
      let servicesData = _.groupBy(this.data,'serviceId');
      let e = 0;
      Object.keys(servicesData).forEach( serviceKey =>{
        let data = servicesData[serviceKey];
        let departmentData = _.groupBy(data,'departmentName');
        this.services.push({data:{primary:[],alt:[]},title:data[0].serviceName});
        Object.keys(departmentData).forEach(departmentKey => {
          let data = departmentData[departmentKey];
          data.sort(this.sort);
          data = data.slice(0,settings.maxItemsPerDepartment);
          this.services[e].data.primary = this.services[e].data.primary.concat(data);
        });
        this.services[e].data.primary.sort((a,b)=> b.departmentName.localeCompare(a.departmentName));
        e++;
      });

    });
        console.log(this.data);
  }


  sort(a,b){
    return b.returnAmount - a.returnAmount;
  }
}
