import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

import * as _ from 'lodash';
import {DataService, tmpTranslations} from '../../../../tabit/data/data.service';

@Component({
    selector: 'app-most-sold-items-table',
    templateUrl: './day-most-sold-items-table.component.html',
    styleUrls: ['./day-most-sold-items-table.component.scss']
})
export class DayMostSoldItemsTableComponent implements OnChanges {
    loading = true;
    noData = false;
    @Input() title: string;
    @Input() itemsData: {
        byItem: {
            department: string;
            item: string;
            sales: number;
            sold: number;
            prepared: number;
            returned: number;
            operational: number;
        }[]
    };

    maxItemsPerDepartment: number;

    data: {
        department?: string,
        topItems?: {
            itemName?: string;
            itemSales?: number;
            itemSold?: number;
        }[]
    }[];

    constructor(private dataService: DataService) {
        dataService.settings$.subscribe((settings: any) => {
            this.maxItemsPerDepartment = _.get(settings, 'maxItemsPerDepartment') || 5;
        });
    }

    ngOnChanges(o: SimpleChanges) {
        if (o.itemsData.currentValue) {

            this.loading = true;
            this.noData = false;

            let data: {
                department?: string,
                topItems?: {
                    itemName?: string;
                    itemSales?: number;
                    itemSold?: number;
                }[]
            }[] = [];

            // Object.keys(this.dataService.departments).forEach((key, indx, arr)=>{
            //   data.push({
            //     department: this.dataService.departments[key],
            //     topItems: []
            //   });
            // });

            // sort by department ranks
            // data = data.sort((a, b)=>{
            //   return a.department.rank < b.department.rank ? -1 : 1;
            // });

            const clone: {
                byItem: {
                    department: string;
                    item: string;
                    sales: number;
                    sold: number;
                }[]
            } = _.cloneDeep(this.itemsData);

            // unfortunately departments from the OLAP are not as the departments from the ROS, and for now we dynamicaly get the departments from the results.
            // const departments: { name: string }[] = [];

            // clone.byItem.forEach(tuple => {

            // });

            clone.byItem.forEach(tuple => {

                let dataObj = data.find(o => o.department === tuple.department);

                if (!dataObj) {
                    dataObj = {
                        department: tuple.department,
                        topItems: []
                    };
                    data.push(dataObj);
                }

                dataObj.topItems.push({
                    itemName: tuple.item,
                    itemSales: tuple.sales,
                    itemSold: tuple.sold
                });
            });

            //make sure food is first and then beverages:
            data.sort((a, b) => {
                if (a.department === tmpTranslations.get('departments.food')) return -1;
                if (b.department === tmpTranslations.get('departments.food')) return 1;
                if (a.department === tmpTranslations.get('departments.beverages')) return -1;
                if (b.department === tmpTranslations.get('departments.beverages')) return 1;
            });

            data.forEach(dataObj => {
                dataObj.topItems = dataObj.topItems
                    .sort((a, b) => (a.itemSales < b.itemSales ? 1 : -1))
                    .slice(0, this.maxItemsPerDepartment);
            });

            this.data = data;

            let totalCount = 0;
            Object.keys(this.data).forEach(k => {
                totalCount += this.data[k].topItems.length;
            });

            if (!totalCount) {
                this.noData = true;
            }

            this.loading = false;
        }
    }
}
