import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Order } from '../../../tabit/model/Order.model';
import { ClosedOrdersDataService } from '../../../tabit/data/dc/closedOrders.data.service';
import { ORDERS_VIEW } from '../../../tabit/data/dc/closedOrders.data.service';
import { ROSEp } from '../../../tabit/data/ep/ros.ep';
import { DataService } from '../../../tabit/data/data.service';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { MatTabChangeEvent } from '@angular/material';
import { environment } from '../../../environments/environment';

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
    @Input() drillType: any;

    @ViewChild('tpl') tpl: ElementRef;

    show = false;
    orderOld: any;
    printDataOld: any;
    ORDERS_VIEW: any;
    orderDocs: any;
    html: any;
    showTimeline: boolean;
    organization;


    documents2: any = {};
    BILL_DATA: any;
    documentsList: Array<any>;
    selectedDocument: any;

    // PATCH
    serverName = {
        F_NAME: '',
        L_NAME: ''
    };
    billData = {
        ORDER_BILL_TYPE: ''
    };

    documentViewer;
    templateHTML;

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
        this.documentViewer = new (<any>window).DocumentViewer({ locale: this.organization.region === 'us' ? 'en-US' : 'he-IL' });

        // Timeline related - to be removed when timeline is integrated into document viewer
        if (this.drillType === 'closedOrder') {
            this.showTimeline = true;
        } else {
            this.showTimeline = false;
        }
        if (this.order && this.order.tlogId) {
            const enrichedOrder = await this.closedOrdersDataService.enrichOrder(this.order);
            this.order = enrichedOrder.order;
            this.orderOld = enrichedOrder.orderOld;
        }
        // end timeline related block

        await this.init();

        this.show = true;
    }

    public onSelectDocument(tabChangeEvent: MatTabChangeEvent) {

        let documentItem = this.documentsList[tabChangeEvent.index];

        this.selectedDocument = documentItem;

        if (this.selectedDocument.isFullOrderBill) {

            //patch
            this.BILL_DATA.printData.variables.ORDER_BILL_TYPE = this.BILL_DATA.ORDER_BILL_TYPE;
            //end patch

            if (this.organization.isDemo) {
                this.BILL_DATA = this.maskPrintDataForDemoMode(this.BILL_DATA);
            }

            this.templateHTML = this.documentViewer.getHTMLDocument(this.selectedDocument, this.BILL_DATA);
            
        } else {


            let selectedDocument = this.documents2[documentItem.id];

            if (!documentItem.tlogId) {
                return;
            }

            let documentData: any = {};

            if (['giftCard', 'creditCard', 'clubMembers'].indexOf(selectedDocument.docType) > -1) {
                documentData.documentType = selectedDocument.docType;
                documentData.organizationId = selectedDocument.organization;

                // set the bill print data in case of 'Gift Card' or 'Credit Card' or 'ClubMember'.
                documentData.printData = {
                    collections: this.BILL_DATA.printData.collections,
                    variables: this.BILL_DATA.printData.variables
                };
            } else if (selectedDocument.docType === 'invoice') {

                documentData = selectedDocument.data; // set print data of 'Invoice'.

            } else {

                //// ?????????
                documentData = selectedDocument.data;
            }

            if (documentItem.md === undefined) {
                documentItem.md = {};
            }

            debugger
            if (!_.isEmpty(documentItem.md.signature)) {

                let data = documentItem.md.signature;
                if (_.get(documentItem, 'md.signature.data') === undefined) {
                    documentItem.md.signature = { data: data };
                }
            } else if (_.get(selectedDocument, 'signature') !== undefined) {
                documentItem.md.signature = selectedDocument.signature;
            }

            //patch
            documentData.printData.variables.F_NAME = this.serverName.F_NAME;
            documentData.printData.variables.L_NAME = this.serverName.L_NAME;
            documentData.printData.variables.ORDER_BILL_TYPE = this.billData.ORDER_BILL_TYPE;
            //end patch

            if (this.organization.isDemo) {
                documentData = this.maskPrintDataForDemoMode(documentData);
            }

            this.templateHTML = this.documentViewer.getHTMLDocument(documentItem, {
                documentType: documentData.documentType,
                organizationId: documentData.organizationId,
                printData: {
                    collections: documentData.printData.collections,
                    variables: documentData.printData.variables
                }
            });

        }

    }

    private async getBillData(drillType, order) {
        if (drillType === 'closedOrder' && order && order.tlogId) {
            return await this.rosEp.get(`tlogs/${this.order.tlogId}/bill`);
        }
        else {
            const bill = await this.rosEp.get(`orders/${this.openOrder.id}/printdata/orderbill`);
            _.set(bill, [0, 'title'], environment.tbtLocale === 'en-US' ? 'Order' : 'הזמנה');
            return bill;
        }
    }

    private async init() {

        const bills = await this.getBillData(this.drillType, this.order || this.openOrder);
        this.BILL_DATA = _.get(bills, '[0]');

        let documentInfos;
        if (this.drillType === 'closedOrder') {
            let tlog = await this.rosEp.get(`tlogs/${this.order.tlogId}`);
            documentInfos = this.documentViewer.getDocumentsInfoFromTlog(tlog, {});
        }
        else {
            let order = await this.rosEp.get(`orders/${this.openOrder.id}`);
            let tlog = this.resolveOrderByStatus({ status: 'opened', data: order });
            documentInfos = this.documentViewer.getDocumentsInfoFromTlog(tlog, {});
        }
        this.documentsList = this.create(documentInfos);
        this.selectedDocument = this.documentsList[0];

        this.serverName = {
            F_NAME: this.BILL_DATA.printData.variables.F_NAME,
            L_NAME: this.BILL_DATA.printData.variables.L_NAME
        };

        this.BILL_DATA.printData.variables.ORDER_BILL_TYPE = this.BILL_DATA.printData.variables.ORDER_TYPE;

        if (this.organization.isDemo) {
            this.BILL_DATA = this.maskPrintDataForDemoMode(this.BILL_DATA);
        }

        this.templateHTML = this.documentViewer.getHTMLDocument(this.selectedDocument, this.BILL_DATA);
    }

    private create(docs: Array<any>) {

        let isChecksLoaded = false;

        docs.forEach(doc => {

            this.documents2[doc.id] = {
                id: doc.id,
                docType: doc.type,
                inProgress: true,
                data: undefined
            };

            if (this.isDocumentType(doc.type)) {

                if (doc.isFakeDocument !== true) {
                    this.rosEp.get(`documents/v2/${doc.id}/printdata`)
                        .then(printData => {

                            if (printData.length <= 0)
                                return;

                            let _printData = printData[0];

                            this.documents2[doc.id].inProgress = false;
                            this.documents2[doc.id].data = _printData;

                            debugger
                            if (_printData.documentType === 'invoice' || _printData.documentType === 'deliveryNote') {
                                this.documents2[doc.id].signature = this.resolveSignature(_printData, this.orderOld);
                            }

                        }).catch(err => console.log(err));
                }


            } else if (this.isCheckType(doc.type)) {

                if (!isChecksLoaded) {

                    isChecksLoaded = true;

                    this.getChecks(doc)
                        .then(checks => {

                            checks.forEach(printData => {

                                let checkNumber = _.get(printData, 'printData.variables.CHECK_NO');
                                let doc = docs.find(c => c.md && c.md.checkNumber === checkNumber && c.type === 'check');

                                if (doc) {
                                    this.documents2[doc.id].inProgress = false;
                                    this.documents2[doc.id].data = printData;
                                }

                            });

                        }).catch(err => console.log(err));

                }

            }

        });

        return docs;

    }

    private getChecks(doc) {

        if (this.openOrder) {
            return this.rosEp.get(`tlogs/${doc.tlogId}/checks/slips`);
        } else {
            return this.rosEp.get(`tlogs/${doc.tlogId}/checks`);
        }

    }

    private resolveOrderByStatus(options) {

        let status = options.status;
        let data = options.data;

        if (status === 'opened') {
            return {
                _id: data._id,
                _type: 'tlog',
                order: [data],
                number: data.number,
            };
        } else {
            return this.orderOld;
        }

    }

    private resolveSignature(printData, tlog) {
        debugger
        let data = this.resolveOrderByStatus({
            status: status,
            data: this.orderOld
        });

        let id = _.get(printData, 'printData.collections.PAYMENT_LIST[0].P_ID');
        let payment = data.order[0].payments.find(c => c._id === id);
        return payment.customerSignature;

    }

    private isDocumentType(type) {
        return (['check', 'tlog'].indexOf(type) === -1);
    }

    private isCheckType(type) {
        return (type === 'check');
    }

    private maskPrintDataForDemoMode(document) {
        _.set(document, ['printData', 'variables', 'F_NAME'], this.organization.region === 'il' ? 'זיו' : 'Dror');
        _.set(document, ['printData', 'variables', 'L_NAME'], this.organization.region === 'il' ? 'וטורי' : '');
        _.set(document, ['printData', 'variables', 'ORGANIZATION_ADDR_CITY'], this.organization.region === 'il' ? 'רשפון' : 'PLANO, TX 75024');
        _.set(document, ['printData', 'variables', 'ORGANIZATION_ADDR_STREET'], this.organization.region === 'il' ? 'דרך הפרדס 31' : '7700 WINDROSE AVE. G300');
        _.set(document, ['printData', 'variables', 'ORGANIZATION_BN_NUMBER'], '123456');
        _.set(document, ['printData', 'variables', 'ORGANIZATION_LEGAL_NAME'], this.organization.region === 'il' ? '' : '');
        _.set(document, ['printData', 'variables', 'ORGANIZATION_NAME'], this.organization.region === 'il' ? 'TABIT BAR' : 'TABIT RESTAURANT');
        _.set(document, ['printData', 'variables', 'ORGANIZATION_TEL'], this.organization.region === 'il' ? '09-9585682' : '1-833-822-4887');

        return document;
    }
}
