import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Order} from '../../../tabit/model/Order.model';
import {ClosedOrdersDataService} from '../../../tabit/data/dc/closedOrders.data.service';
import {ORDERS_VIEW} from '../../../tabit/data/dc/closedOrders.data.service';
import {ROSEp} from '../../../tabit/data/ep/ros.ep';
import {environment} from '../../../environments/environment';
import {DataService} from '../../../tabit/data/data.service';
import * as _ from 'lodash';
import {TranslateService} from '@ngx-translate/core';

export interface SlipVM {
    id: number;
    class: string;//bill/club
    subclass?: string;
    caption: string;
    data?: any;
}

@Component({
    selector: 'app-order-view',
    templateUrl: './order-view.component.html',
    styleUrls: ['./order-view.component.scss']
})
export class OrderViewComponent implements OnInit {

    @Input() orderNumber: number;
    @Input() orders: Order[];
    @Input() order: Order;

    show = false;
    orderOld: any;
    printDataOld: any;
    ORDERS_VIEW: any;
    orderDocs: any;
    html: any;
    documents: any[];
    showTimeline: boolean;
    organization;

    constructor(private closedOrdersDataService: ClosedOrdersDataService,
                private route: ActivatedRoute, private rosEp: ROSEp, private dataService: DataService, private translate: TranslateService) {
        this.ORDERS_VIEW = ORDERS_VIEW.getTranslations();
        this.orderDocs = {};

        this.dataService.organization$.subscribe(organization => {
            this.organization = organization;
        });
    }

    async ngOnInit() {
        this.showTimeline = false;
        const documents = await this.getDocuments();
        const documentViewer = new (<any>window).DocumentViewer({locale: this.organization.region === 'us' ? 'en-US' : 'he-IL'});
        console.log(documents);

        this.documents = documents.map(document => {
            if(this.organization.isDemo) {
                _.set(document, ['printData', 'variables', 'F_NAME'], this.organization.region === 'il' ? 'זיו': 'Dror');
                _.set(document, ['printData', 'variables', 'L_NAME'], this.organization.region === 'il' ? 'וטורי': '');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_ADDR_CITY'], '');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_ADDR_STREET'], '');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_BN_NUMBER'], '123456');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_LEGAL_NAME'], this.organization.region === 'il' ? 'מסעדה לדוגמא': 'Demo restaurant');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_NAME'], this.organization.region === 'il' ? 'מסעדה לדוגמא': 'Demo restaurant');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_TEL'], '000-123-456');
            }
            return documentViewer.getDocumentHtml(document);
        });
        let orderClosedMessage = '';
        this.translate.get('orderClosed').subscribe((res: string) => {
            orderClosedMessage = res;
        });
        if(this.documents.length === 0) {
            this.documents.push(orderClosedMessage);
        }

        if (this.order.tlogId) {
            const enrichedOrder = await this.closedOrdersDataService.enrichOrder(this.order);
            this.order = enrichedOrder.order;
            this.orderOld = enrichedOrder.orderOld;
            this.showTimeline = true;
        }
        this.show = true;
    }

    private async getDocuments(): Promise<Array<any>> {
        if (this.order.tlogId) {
            return this.rosEp.get(`online-shopper/receipts`, {tlogId: this.order.tlogId});
        }

        return this.rosEp.get(`orders/${this.order.id}/printdata/orderbill`);
    }
}
