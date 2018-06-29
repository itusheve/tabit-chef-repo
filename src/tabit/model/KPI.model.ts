import { OrderType } from './OrderType.model';

/* KPIs, for example for an Order(s), for BusinessDay(s) */
export class KPI {
    //NEW KPIS
    totalPaymentsAmnt?: number;

    // DEPRECATED KPIS:
    sales?: number;//total order(s) sales



    diners?: {
        count?: number;//count of diners ("seated")
        sales?: number;//diners sales ("seated sales")
        ppa?: number;//calc', :=diners sales / diners count
    };

    //FYI! the difference between the order model pricereduction calculation and the KPI ones -
    // looks like Order model's "cancellation" :== KPIs "cancellation" + "operational"

    //from order model:
    // _priceReductions: {
    //     operationalAndCancellations (THIS IS SUM OF CANCELLATIONS AND OPERATRIONAL!): false,//summarises: {dim:cancellations,measure:cancellations} AND {dim:operational,measure:operational}   heb: ביטולים
    //     discountsAndOTH: false,//{dim:retention,measure:retention}  heb: שימור ושיווק
    //     employees: false,//{dim:organizational,measure:organizational}  heb: עובדים
    //     promotions: false,//{dim:promotions,measure:retention}  heb: מבצעים
    // }

    //nest all under reductions?
    reductions?: {
        cancellation?: number;//"שווי ביטולים" {measure: Tlog Pricereductions Cancellation Amount}
        cancellation_pct?: number;

        retention?: number;//"שווי שימור ושיווק" {measure: Tlog Pricereductions Retention Discount Amount}
        retention_pct?: number;

        operational?: number;//"שווי תקלות תפעול" {measure: Tlog Pricereductions Operational Discount Amount}
        operational_pct?: number;

        organizational?: number;//"עובדים ובעלים", {measure: Tlog Pricereductions Organizational Discount Amount}
        organizational_pct?: number;
    };

    reductionsLastThreeMonthsAvg?: any;

    // auto ppa calculation is performed iff dinersCount & dinersSales are provided
    constructor(sales?:number, dinersCount?:number, dinersSales?:number) {
        this.sales = sales;
        const ppa = dinersCount ? dinersSales / dinersCount : undefined;
        this.diners = {
            count: dinersCount,
            sales: dinersSales,
            ppa: ppa
        };
    }
}
