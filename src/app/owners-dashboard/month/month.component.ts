import {Component, OnInit} from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {DataService, tmpTranslations} from '../../../tabit/data/data.service';
import {ActivatedRoute} from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import {DatePipe} from '@angular/common';
import {environment} from '../../../environments/environment';


@Component({
    selector: 'app-month',
    templateUrl: './month.component.html',
    styleUrls: ['./month.component.scss'],
    providers: [DatePipe]
})
export class MonthComponent implements OnInit {

    public monthReport: any;
    public payments: any;
    public summary: any;
    public summaryByOrderType: any;
    public env: any;
    public title: string;

    constructor(private ownersDashboardService: OwnersDashboardService, private dataService: DataService, private route: ActivatedRoute, private datePipe: DatePipe) {

        this.env = environment;

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


        let date = moment().month(month).year(year);
        let monthName = this.datePipe.transform(date, 'MMMM', '', this.env.lang);
        let monthState = moment().month() === date.month() ? tmpTranslations.get('home.month.notFinalTitle') : tmpTranslations.get('home.month.finalTitle');
        this.title = monthName + ' ' + monthState;


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
                    subTypes: [],
                    order: this.getAccountGroupOrderByType(payment.type)
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

        this.payments.accountGroups = _.orderBy(accountGroups, 'order');
    }

    getAccountGroupOrderByType(name) {
        if(name === 'מזומן' || name === 'Cash' ) {
            return 1;
        }
        else if(name === 'אשראי' || name === 'Credit') {
            return 2;
        }

        return 3;
    }

}
