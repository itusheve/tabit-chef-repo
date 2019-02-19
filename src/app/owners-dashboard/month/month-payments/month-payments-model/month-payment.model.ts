export interface MonthPaymentModel {
    payment:  {
        total: number,
        accountGroups: string
    };

    accountGroup: {
      typr: any,
      amount: any,
      order: any
    }
}
