import {Component, OnInit} from '@angular/core';
import {OwnersDashboardService} from '../owners-dashboard.service';
import {DataService} from '../../../tabit/data/data.service';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'app-month',
    templateUrl: './month.component.html',
    styleUrls: ['./month.component.scss']
})
export class MonthComponent implements OnInit {

    public month: any;
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
        let monthlyReport = await this.dataService.getMonthReport(month, year);
        this.month = monthlyReport;
    }

}
