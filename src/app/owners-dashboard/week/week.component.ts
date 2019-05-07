import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { OwnersDashboardService } from '../owners-dashboard.service';
import { DataService, tmpTranslations } from '../../../tabit/data/data.service';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { DataWareHouseService } from '../../services/data-ware-house.service';
import { SummaryHelper } from '../summary-helper';
import * as _ from 'lodash';
import router from 'devextreme/framework/router';


@Component({
  selector: 'app-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss'],
  providers: [DatePipe]
})
export class WeekComponent implements OnInit,OnDestroy {

  @Input()
  data = [];

  @ViewChild('grid') weekGrid;

  public date: any;
  public summary: any;
  public title: string;
  public env: any;
  public isLoading: any;


  public reductionsByReason: any = {};
  public reductionsByFired: any = {};
  private mostSoldItems: any = [];
  private mostReturnsItems: any = [];
  public refunds: any = [];
  public payments: any = [];
  public salesWeek: any = [];

  private drilledOrder: any;
  private drilledOrderNumber: any;
  private drillType: string;
  private drill = false;



  private weekCardData :any = {};
  private promotions: any;
  private retention: any;
  private organizational: any;
  private wasteEod: any;
  private cancellation: any;
  private weeklyReports: any = {};
  public weeklyReportsInProgress: boolean;
  private summaryHelper: SummaryHelper;
  private selectedWeekSubscription: any;
  private vatSubscription: any;

  constructor(private ownersDashboardService: OwnersDashboardService,
              private dataService: DataService,
              private route: ActivatedRoute,
              private dataWareHouseService: DataWareHouseService,
              private datePipe: DatePipe,
              private router:Router ) {
    this.weekCardData = this.router.getCurrentNavigation().extras.state.weekCardData;
    this.summaryHelper = new SummaryHelper();
  }

  ngOnDestroy(){

    this.vatSubscription.unsubscribe();
    this.selectedWeekSubscription.unsubscribe();

  }

  ngOnInit() {

    this.env = environment;
    this.isLoading = true;

    this.vatSubscription = this.dataService.vat$.subscribe(vat => {
      this.weekGrid.incTax = vat;
    })

    this.selectedWeekSubscription = this.dataService.selectedWeek$.subscribe(async date => {



      this.weeklyReportsInProgress = true;

      this.title = '';
      this.summary = {};
      this.date = date;

      let week = date.week();
      let month = date.month();
      this.title = this.getTitle(week, month);


      date = moment().week(week).month(month);

      let dateStart = moment(date).startOf('week').format('YYYYMMDD');
      let dateEnd = moment(date).endOf('week').format('YYYYMMDD');


      let compData = await this.getComponentData(dateStart, dateEnd);


      this.reductionsByReason = compData.reductionsByReason;
      this.reductionsByFired = compData.reductionsByFired;
      this.mostSoldItems = compData.mostSoldItems;
      this.mostReturnsItems = compData.mostReturnsItems;
      this.refunds = compData.refunds;
      this.payments = compData.payments;
      this.salesWeek = compData.salesWeek;


      this.refunds = {reasons: _.get(this,'refunds.refund'), isShowing: _.get(this,'refunds.refund.length') > 0};



      this.weeklyReports = {

        compensation: this.getReductionData('compensation', true, ''),
        compensationReturns: this.getReductionData('compensationReturns', true, ''),
        percent : this.weekCardData.reductions['operational'].change
      };

      this.weeklyReports.isShowing = this.isShowing(this.weeklyReports.compensation.alt) || this.isShowing(this.weeklyReports.compensationReturns.alt);

      this.weeklyReportsInProgress = false;

      this.isLoading = false;



      this.organizational = {
        reasons: this.reductionsByReason['organizational'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        servers: this.reductionsByFired['organizational'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        percent : this.weekCardData.reductions['employee'].change
      };

      this.organizational.isShowing = this.isShowing(this.organizational.servers) || this.isShowing(this.organizational.reasons);

      this.promotions = {
        reasons: this.reductionsByReason['promotions'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        servers: this.reductionsByFired['promotions'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat'])
      };

      this.promotions.isShowing = this.isShowing(this.promotions.servers) || this.isShowing(this.promotions.reasons);


      this.retention = {
        reasons: this.reductionsByReason['retention'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        servers: this.reductionsByFired['retention'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        percent : this.weekCardData.reductions['retention'].change
      };
      this.retention.isShowing = this.isShowing(this.retention.servers) || this.isShowing(this.retention.reasons);


      this.wasteEod = {
        reasons: this.reductionsByReason['wasteEod'].sort((a, b) => b['businessDateCaption'] - a['businessDateCaption']),
        servers: this.reductionsByFired['wasteEod'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat'])
      };
      this.wasteEod.isShowing = this.isShowing(this.wasteEod.servers) || this.isShowing(this.wasteEod.reasons);


      this.cancellation = {
        servers: this.reductionsByFired['cancellation'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        percent:this.weekCardData.reductions['cancellations'].change
      };
      this.cancellation.isShowing = this.isShowing(this.cancellation.servers) || this.isShowing(this.cancellation.reasons);


      this.weeklyReports.compensation = {
        reasons: this.reductionsByReason['compensation'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        servers: this.reductionsByFired['compensation'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat'])
      };

      this.weeklyReports.compensationReturns = {
        reasons: this.reductionsByReason['compensationReturns'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
        servers: this.reductionsByFired['compensationReturns'].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat'])
      };


      this.ownersDashboardService.toolbarConfig.menuBtn.show = true;
      this.ownersDashboardService.toolbarConfig.left.back.showBtn = false;
      this.ownersDashboardService.toolbarConfig.left.back.target = '/owners-dashboard/week';
      this.ownersDashboardService.toolbarConfig.home.show = true;
    });

    // Init events.


  }

  isShowing(arr){
    return arr && arr.length > 0;
  }



  async getComponentData(dateStart, dateEnd) {
    let settings = JSON.parse(window.localStorage.getItem('settings'));
    let vat = settings.vat;

    return Promise.all([

      this.dataWareHouseService.getReductionByReason(dateStart, dateEnd),
      this.dataWareHouseService.getReductionByFired(dateStart, dateEnd),
      this.dataWareHouseService.getMostLeastSoldItems(dateStart, dateEnd),
      this.dataWareHouseService.getMostReturnItems(dateStart, dateEnd),
      this.dataWareHouseService.getRefund(dateStart, dateEnd),
      this.dataWareHouseService.getPayments(dateStart, dateEnd, {vat: vat}),
      this.dataWareHouseService.getSales(dateStart, dateEnd)
    ]).then(result => {

      return {

        reductionsByReason: result[0],
        reductionsByFired: result[1],
        mostSoldItems: result[2],
        mostReturnsItems: result[3],
        refunds: result[4],
        payments: result[5],
        salesWeek: result[6],
      };

    });

  }




  getReductionData(key, dataOption, percentKey) {

    let reductions = this.weekCardData.reductions;

    let data = dataOption === true ? {
      primary: this.reductionsByReason[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
      alt: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']),
    } : { primary: this.reductionsByFired[key].sort((a, b) => b['amountIncludeVat'] - a['amountIncludeVat']), alt: [] };

    return Object.assign(data, { isShowing: data.primary.length > 0 || data.alt.length > 0 });

  }

  onOrderClicked(order: any) {
    this.drilledOrder = order;
    this.drilledOrderNumber = order.number;
    this.drillType = 'closedOrder';

    setTimeout(() => {
      this.drill = true;
      this.ownersDashboardService.toolbarConfig.left.back.showBtn = true;
      this.ownersDashboardService.toolbarConfig.menuBtn.show = false;
    }, 300);


    this.ownersDashboardService.toolbarConfig.left.back.pre = () => {
      this.drill = false;
      this.ownersDashboardService.toolbarConfig.left.back.pre = undefined;
      //prevent navigating back
      this.ownersDashboardService.toolbarConfig.menuBtn.show = false;
      this.ownersDashboardService.toolbarConfig.left.back.showBtn = true;
      return true;
    };


  }



  //TODO need register the home.week.finalTitle for the title
  getTitle(week, month) {
    let date = moment().week(week).month(month);
    let weekName = this.datePipe.transform(date, 'YYYYMMDD', '', this.env.lang);
    let weekState = moment().week() === date.week() ? tmpTranslations.get('home.week.notFinalTitle') : tmpTranslations.get('home.week.finalTitle');
    return weekName + ' ' + weekState;
  }

  onDateClicked(data){
    let date = data.date;
    this.router.navigate(['/owners-dashboard/day', date, {category: data.category}]);

    this.ownersDashboardService.toolbarConfig.left.back.onGoBackClicked = () => {


      this.ownersDashboardService.toolbarConfig.menuBtn.show = true;
      this.ownersDashboardService.toolbarConfig.left.back.showBtn = false;
      this.router.navigate(['/owners-dashboard/week'],{state:{weekCardData:this.weekCardData}});
      return true;
    };

  }


  //const that = this;



}
