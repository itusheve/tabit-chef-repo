/* KPI per Order, per BusinessDay, per aggregation of BusinessDays */
export class KPI {
    sales: number;//total order(s) sales
    diners: {
        count: number;//count of diners ("seated")
        sales: number;//diners sales ("seated sales")
        ppa: number;//calc', :=diners sales / diners count
    };
    
    constructor(sales:number, dinersCount:number, dinersSales:number) {
        this.sales = sales;
        const ppa = dinersCount ? dinersSales / dinersCount : undefined;
        this.diners = {
            count: dinersCount,
            sales: dinersSales,
            ppa: ppa
        };
    }
}
