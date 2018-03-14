import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import * as _ from 'lodash';
import { tmpTranslations } from '../../../../tabit/data/data.service';

@Component({
  selector: 'app-most-returned-items-table',
  templateUrl: './day-most-returned-items-table.component.html',
  styleUrls: ['./day-most-returned-items-table.component.scss']
})
export class DayMostReturnedItemsTableComponent implements OnChanges {
  @Input() itemsData: {
    byItem: {
      department: string;
      itemName: string;
      itemSales: number;
      itemSold: number;
      itemPrepared: number;
      itemReturned: number;
      itemReturnValue: number;
    }[]
  };

  maxItemsPerDepartment = 5;

  data: {
    department?: string,
    topItems?: {
      itemName?: string;
      itemPrepared?: number;
      itemReturned?: number;
      itemReturnedPct?: number;
      itemReturnValue?: number;
    }[]
  }[];

  show = true;
  loading = true;

  constructor() {}

  ngOnChanges(o: SimpleChanges) {
    if (o.itemsData.currentValue) {                  

      let data: {
        department?: string,
        topItems?: {
          itemName?: string;
          itemPrepared?: number;
          itemReturned?: number;
          itemReturnedPct?: number;
          itemReturnValue?: number;
        }[]
      }[] = [];

      const clone: {
        byItem: {
          department: string;
          item: string;
          itemSales: number;
          itemSold: number;
          itemPrepared: number;
          itemReturned: number;
          itemReturnValue: number;
        }[]
      } = _.cloneDeep(this.itemsData);

      // unfortunately departments from the OLAP are not as the departments from the ROS, and for now we dynamicaly get the departments from the results.

      clone.byItem.forEach(tuple=>{
        
        let dataObj = data.find(o=>o.department===tuple.department);
        
        if (!dataObj) {
          dataObj = {
            department: tuple.department,
            topItems: []
          };
          data.push(dataObj);
        }

        dataObj.topItems.push({
          itemName: tuple.item,
          itemPrepared: tuple.itemPrepared,
          itemReturned: tuple.itemReturned,
          itemReturnValue: tuple.itemReturnValue
        });
      });

      //make sure food is first and then beverages:
      data.sort((a, b)=>{        
        if (a.department===tmpTranslations.get('departments.food')) return -1;
        if (b.department === tmpTranslations.get('departments.food')) return 1;
        if (a.department === tmpTranslations.get('departments.beverages')) return -1;
        if (b.department === tmpTranslations.get('departments.beverages')) return 1;      
      });

      data.forEach(dataObj=>{
        dataObj.topItems = dataObj.topItems
          .filter(dataObj=>dataObj.itemReturned>0)
          .sort((a, b) => {
            if (a.itemReturned < b.itemReturned) return 1;
            if (a.itemReturned > b.itemReturned) return -1; 
            return a.itemReturnValue<b.itemReturnValue ? 1 : -1;            
          })
          .slice(0, this.maxItemsPerDepartment)
          .map(dataObj=>(dataObj.itemReturnedPct=dataObj.itemReturned/dataObj.itemPrepared,dataObj));
      });

      this.data = data;

      this.loading = false;
    }
  }
}
