import {Component, OnInit} from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {DataService} from '../../../tabit/data/data.service';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';

@Component({
    selector: 'app-month',
    templateUrl: './month.component.html',
    styleUrls: ['./month.component.scss']
})
export class MonthComponent implements OnInit {

    public monthReport: any;
    public payments: any;
    public summary: any;
    public summaryByOrderType: any;
    constructor(private ownersDashboardService: OwnersDashboardService, private dataService: DataService, private route: ActivatedRoute) {
        ownersDashboardService.toolbarConfig.left.back.pre = () => true;
        ownersDashboardService.toolbarConfig.left.back.target = '/owners-dashboard/home';
        ownersDashboardService.toolbarConfig.left.back.showBtn = true;
        ownersDashboardService.toolbarConfig.menuBtn.show = false;
        ownersDashboardService.toolbarConfig.settings.show = false;
        ownersDashboardService.toolbarConfig.center.showVatComment = false;
        ownersDashboardService.toolbarConfig.home.show = true;
    }

    async ngOnInit() {
        let month = this.route.snapshot.paramMap.get('month');
        let year = this.route.snapshot.paramMap.get('year');
        let monthReport = await this.dataService.getMonthReport(month, year);
        this.monthReport = monthReport;
        this.summary = _.get(monthReport, ['sales'], {});

        this.payments = {
            total: 0,
            accountGroups: []
        };
        let accountGroups = [];

        _.forEach(monthReport.payments, payment => {
            if (!payment.subType && payment.type) {
                let accountGroup = {
                    type: payment.type,
                    amount: payment.paymentAmount,
                    subTypes: []
                };
                accountGroups.push(accountGroup);
            }
            if(!payment.subType && !payment.type) {
                this.payments.total = payment.paymentAmount;
            }
        });

        _.forEach(monthReport.payments, payment => {
            if(payment.subType) {
                let accountGroup = _.find(accountGroups, {type: payment.type});
                if(payment.subType !== 'מזומן' && payment.subType !== 'cash') {
                    let subType = _.find(accountGroup.subTypes, {subType: payment.subType});
                    if (!subType) {
                        subType = {
                            subType: payment.subType,
                            amount: payment.paymentAmount
                        };
                        accountGroup.subTypes.push(subType);
                    }
                }
            }

        });

        this.payments.accountGroups = accountGroups;

        /*if (accountGroups) {
            accountGroups = _.orderBy(accountGroups, 'order');
        }*/
    }

}
