import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as _ from 'lodash';
import { DataService } from '../../../../tabit/data/data.service';
import { Department } from '../../../../tabit/model/Department.model';

@Component({
  selector: 'app-most-sold-items-table',
  templateUrl: './day-most-sold-items-table.component.html',
  styleUrls: ['./day-most-sold-items-table.component.scss']
})
export class DayMostSoldItemsTableComponent implements OnChanges {
  @Input() itemsData: {
    byItem: {
      department: String;
      itemName: String;
      itemSales: number;
      itemSold: number;
    }[]
  };

  maxItemsPerDepartment = 5;

  data: {
    department?: Department,
    topItems?: {
      itemName?: String;
      itemSales?: number;
      itemSold?: number;
    }[]
  }[];

  show = true;
  loading = true;

  constructor(private dataService: DataService) {}

  ngOnChanges(o: SimpleChanges) {
    if (o.itemsData.currentValue) {      
      
      let data: {
        department?: Department,
        topItems?: {
          itemName?: String;
          itemSales ?: number;
          itemSold ?: number;
        }[]
      }[] = [];

      Object.keys(this.dataService.departments).forEach((key, indx, arr)=>{
        data.push({
          department: this.dataService.departments[key],
          topItems: []
        });
      });

      // sort by department ranks
      data = data.sort((a, b)=>{
        return a.department.rank < b.department.rank ? -1 : 1;
      });

      const clone: {
        byItem: {
          department: Department;
          itemName: String;
          itemSales: number;
          itemSold: number;
        }[]
      } = _.cloneDeep(this.itemsData);

      clone.byItem.forEach(tuple=>{
        const dataObj = data.find(o=>o.department.id===tuple.department.id);
        dataObj.topItems.push({
          itemName: tuple.itemName,
          itemSales: tuple.itemSales,
          itemSold: tuple.itemSold
        });
      });

      data.forEach(dataObj=>{
        dataObj.topItems = dataObj.topItems
          .sort((a, b)=>(a.itemSales < b.itemSales ? 1 : -1))
          .slice(0, this.maxItemsPerDepartment);
      });

      this.data = data;

      this.loading = false;
    }
  }
}
