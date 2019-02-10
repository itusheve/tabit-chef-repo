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
    @Input() order: Order;
    @Input() openOrder: Order;

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
        const documentViewer = new (<any>window).DocumentViewer({locale: this.organization.region === 'us' ? 'en-US' : 'he-IL'});
        const documents = await this.getDocuments(documentViewer);
        this.documents = documents.map(document => {
            if (this.organization.isDemo) {
                _.set(document, ['printData', 'variables', 'F_NAME'], this.organization.region === 'il' ? 'זיו' : 'Dror');
                _.set(document, ['printData', 'variables', 'L_NAME'], this.organization.region === 'il' ? 'וטורי' : '');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_ADDR_CITY'], '');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_ADDR_STREET'], '');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_BN_NUMBER'], '123456');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_LEGAL_NAME'], this.organization.region === 'il' ? 'טאביט בר' : 'Tabit Bar');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_NAME'], this.organization.region === 'il' ? 'טאביט בר' : 'Tabit Bar');
                _.set(document, ['printData', 'variables', 'ORGANIZATION_TEL'], '09-9585682');
            }
            const html = documentViewer.getDocumentHtml(document);
            return {
                title: document.title,
                type: document.documentType,
                html: html
            };
        });

        if (this.documents.length === 0) {
            this.translate.get('orderClosed').subscribe((translation: string) => {
                this.documents.push(translation);
            });
        }

        if (this.order && this.order.tlogId) {
            const enrichedOrder = await this.closedOrdersDataService.enrichOrder(this.order);
            this.order = enrichedOrder.order;
            this.orderOld = enrichedOrder.orderOld;
            this.showTimeline = true;
        }
        this.show = true;
    }

    private async getDocuments(documentViewer): Promise<Array<any>> {
        if (this.order && this.order.tlogId) {
            let documents = [];
            const bills = await this.rosEp.get(`tlogs/${this.order.tlogId}/bill`);
            const bill = _.get(bills, '[0]');
            _.set(bill, 'title', environment.tbtLocale === 'en-US' ? 'Order' : 'הזמנה');
            documents.push(bill);

            let tlog = await this.rosEp.get(`tlogs/${this.order.tlogId}`);
            let documentInfos = documentViewer.getDocumentsInfoFromTlog(tlog, {});

            documentInfos = documentInfos.filter(documentInfo => documentInfo.type !== 'tlog' && !documentInfo.isFakeDocument);

            let paymentDocuments = await Promise.all(documentInfos.map(async documentInfo => {
                if (documentInfo.type === 'check') {
                    let check = await this.rosEp.get(`tlogs/${documentInfo.id}/checks`);
                    check = _.get(check, [0]);
                    _.set(check, 'title', documentInfo.title);
                    return check;
                }

                let document = await this.rosEp.get(`documents/v2/${documentInfo.id}/printdata`);
                document = _.get(document, [0]);
                _.set(document, 'title', documentInfo.title);
                return document;
            }));

            documents.push(...paymentDocuments);
            return documents;
        }
        else if (this.openOrder) {
            const bill = await this.rosEp.get(`orders/${this.openOrder.id}/printdata/orderbill`);
            _.set(bill, [0, 'title'], environment.tbtLocale === 'en-US' ? 'Order' : 'הזמנה');
            return bill;
        }
    }
}
