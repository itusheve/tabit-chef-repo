import { Injectable } from '@angular/core';

import * as moment from 'moment';

import { OlapMappings } from './olap.mappings';
import { OlapEp } from './olap.ep';

@Injectable()
export class NewCubeOlapEp {
    //The Class supports US cube only for now, until the IL cube will get updated

    constructor(
        private olapEp: OlapEp,
        private olapMappings: OlapMappings
    ) {}

    public get_BD_data_by_orderType_by_shift(bd: moment.Moment): Promise<{
        orderType: string,
        name: string,
        grossSalesAmnt: number,
        netSalesAmnt: number,
        taxAmnt: number,
        tipAmnt: number,
        serviceChargeAmnt: number,
        paymentsAmnt: number,
        dinersSales: number,
        dinersCount: number,
        ppa: number,
        ordersCount: number
    }[]> {
        return this.olapEp.smartQuery({
            measures: [
                this.olapMappings.measureGroups.newStructure.measures.grossSalesAmnt,
                this.olapMappings.measureGroups.newStructure.measures.netSalesAmnt,
                this.olapMappings.measureGroups.newStructure.measures.taxAmnt,
                this.olapMappings.measureGroups.newStructure.measures.tipAmnt,
                this.olapMappings.measureGroups.newStructure.measures.serviceChargeAmnt,
                this.olapMappings.measureGroups.newStructure.measures.paymentsAmnt,
                this.olapMappings.measureGroups.newStructure.measures.dinersSales,
                this.olapMappings.measureGroups.newStructure.measures.dinersCount,
                this.olapMappings.measureGroups.newStructure.measures.ppa,
                this.olapMappings.measureGroups.newStructure.measures.ordersCount
            ],
            dimensions: {
                membersConfigArr: [
                    { dimAttr: this.olapMappings.dims.orderTypeV2.attr.orderType },
                    { dimAttr: this.olapMappings.dims.serviceV2.attr.name }
                ]
            },
            slicers: [
                {
                    dimAttr: this.olapMappings.dims.businessDateV2.attr.date,
                    memberPath: bd.format('YYYYMMDD')
                }
            ]
        });
    }

}


// WEBPACK FOOTER //
// C:/dev/tabit/dashboard/src/tabit/data/ep/olap.ep.ts
