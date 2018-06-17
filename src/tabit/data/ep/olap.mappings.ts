import {Injectable} from '@angular/core';

import * as moment from 'moment';

@Injectable()
export class OlapMappings {

    private monthsMap = {
        il: {
            'ינואר': 1,
            'פברואר': 2,
            'מרץ': 3,
            'אפריל': 4,
            'מאי': 5,
            'יוני': 6,
            'יולי': 7,
            'אוגוסט': 8,
            'ספטמבר': 9,
            'אוקטובר': 10,
            'נובמבר': 11,
            'דצמבר': 12
        },
        us: {
            'JAN': 1,
            'FEB': 2,
            'MAR': 3,
            'APR': 4,
            'MAY': 5,
            'JUN': 6,
            'JUL': 7,
            'AUG': 8,
            'SEP': 9,
            'OCT': 10,
            'NOV': 11,
            'DEC': 12
        }
    };

    public measures = {//deprecated, use measureGroups instead
        sales: {
            il: '[Measures].[salesNetAmount]',
            us: '[Measures].[salesNetAmount]'//'Item Net Sales $'
        },
        itemsSales: {
            il: '[Measures].[salesNetAmount]',
            us: '[Measures].[salesNetAmount]'//Item Net Sales $
        },
        ppa: {
            sales: {
                il: '[Measures].[dinersNetAmount]',
                us: '[Measures].[dinersNetAmount]'
            },
            diners: {
                il: '[Measures].[headerDiners]',
                us: '[Measures].[headerDiners]'
            }
        }
    };

    public measureGroups = {//the structure is similar to the one in the CUBE, with the hebrew captions in comments as helpers
        newStructure: {//for now this will only hold measures that are part of the new cubes structure (e.g. supporting gross/net sales). for now only US cube supports this.
            measures: {
                grossSalesAmnt: {
                    path: {
                        il: 'GrossSales',
                        us: 'GrossSales'
                    },
                    type: 'number'
                },
                salesTotalAmount: {
                    path: {
                        il: 'headerTotalAmount',
                        us: 'headerTotalAmount'
                    },
                    type: 'number'
                },
                netSalesAmnt: {
                    path: {
                        il: 'salesNetAmount',
                        us: 'salesNetAmount'
                    },
                    type: 'number'
                },
                netSalesAmntWithoutVat: {
                    path: {
                        il: 'salesNetAmountWithOutVat',
                        us: 'salesNetAmount'
                    },
                    type: 'number'
                },
                taxAmnt: {
                    path: {
                        il: 'headerTaxs',
                        us: 'headerTaxs'
                    },
                    type: 'number'
                },
                tipAmnt: {
                    path: {
                        il: 'salesTipAmountWithOutVat',
                        us: 'Total Tips'
                    },
                    type: 'number'
                },
                serviceChargeAmnt: {
                    path: {
                        il: 'salesServiceCharge',
                        us: 'salesServiceCharge'
                    },
                    type: 'number'
                },
                paymentsAmnt: {
                    path: {
                        il: 'calcTotalPaymentAmount',
                        us: 'calcTotalPaymentAmount'
                    },
                    type: 'number'
                },
                dinersSales: {
                    path: {
                        il: 'dinersNetAmount',
                        us: 'dinersNetAmount'
                    },
                    type: 'number'
                },
                dinersCount: {
                    path: {
                        il: 'headerDiners',
                        us: 'headerDiners'
                    },
                    type: 'number'
                },
                ppa: {// :== dinersSales / dinersCount
                    path: {
                        il: 'calcPpaAmount',
                        us: 'calcPpaAmount'
                    },
                    type: 'number'
                },
                ordersCount: {
                    path: {
                        il: 'headerOrderCount',
                        us: 'headerOrderCount'
                    },
                    type: 'number'
                }
            }
        },
        general: {//"כללי" and stuff in Measures' root
            measures: {
                sales: {//"מכירות" DEPRECATED, only for use in the old IL cube. see 'newStructure'.
                    path: {
                        il: 'TtlItemsSales',
                        us: 'salesNetAmount'
                    },
                    type: 'number'
                },
                ordersCount: {//"הזמנות"
                    path: {
                        il: 'headerOrderCount',
                        us: 'headerOrderCount'
                    },
                    type: 'number'
                },
                dinersSales: {//"מכירות לסועד"
                    path: {
                        il: 'dinersNetAmount',
                        us: 'dinersNetAmount'
                    },
                    type: 'number'
                },
                dinersCount: {//"סועדים"
                    path: {
                        il: 'headerDiners',
                        us: 'headerDiners'
                    },
                    type: 'number'
                },
                dinersPPA: {//"ממוצע לסועד"
                    path: {
                        il: 'calcPpaAmount',
                        us: 'calcPpaAmount'
                    },
                    type: 'number'
                }
            }
        },
        items: {//"פריטים"
            measures: {
                sales: {//"מכירות פריטים"
                    path: {
                        il: 'salesNetAmount',
                        us: 'salesNetAmount'
                    },
                    type: 'number'
                },
                sold: {//"נמכר"
                    path: {
                        il: 'salesSold',
                        us: 'salesSold'
                    }
                },
                prepared: {//"הוכן"
                    path: {
                        il: 'salesPrepared',
                        us: 'salesPrepared'
                    }
                },
                returned: {//"הוחזר"
                    path: {
                        il: 'salesReturn',
                        us: 'salesReturn'
                    }
                },
                takalotTiful_value_pct: {//"% תקלות תפעול"
                    path: {
                        il: '%ReductionsOperationalDiscountAmount',
                        us: '%ReductionsOperationalDiscountAmount'
                    }
                },
                shimurShivuk_value_pct: {//"% שימור ושיווק"
                    path: {
                        il: '%ReductionsRetentionDiscountAmount',
                        us: '%ReductionsRetentionDiscountAmount'
                    }
                },
                shoviIrguni_value_pct: {//"% ארוחות עובדים"
                    path: {
                        il: '%ReductionsOrganizationalDiscountAmount',
                        us: '%ReductionsOrganizationalDiscountAmount'
                    }
                },
                cancelled_value_pct: {//"% ביטול כספי"
                    path: {
                        il: '%ReductionsCancellationAmount',
                        us: '%ReductionsCancellationAmount'
                    }
                }
            }
        },
        priceReductions: {//הנחות
            measures: {
                cancellation: {
                    path: {
                        il: 'salesReductionsCancellationAmount',
                        us: 'salesReductionsCancellationAmount'//Voids$
                    },
                    type: 'number'
                },
                retention: {
                    path: {
                        il: 'salesReductionsRetentionDiscountAmount',
                        us: 'salesReductionsRetentionDiscountAmount'
                    },
                    type: 'number'
                },
                operational: {//"שווי תקלות תפעול"
                    path: {
                        il: 'salesReductionsOperationalDiscountAmount',
                        us: 'salesReductionsOperationalDiscountAmount'
                    },
                    type: 'number'
                },
                organizational: {
                    path: {
                        il: 'salesReductionsOrganizationalDiscountAmount',
                        us: 'salesReductionsOrganizationalDiscountAmount'
                    },
                    type: 'number'
                }
            }
        },
        payments: {
            measures: {
                calcSalesAmnt: {
                    path: {
                        il: 'calcPaymentSalesAmount',
                        us: 'calcPaymentSalesAmount'
                    },
                    type: 'number'
                },
                refundAmnt: {
                    path: {
                        il: 'paymentsRefund',
                        us: 'paymentsRefund'
                    },
                    type: 'number'
                },
                paymentsAmount: {
                    path: {
                        il: 'paymentsPaymentAmount',
                        us: 'paymentsPaymentAmount'
                    },
                    type: 'number'
                },
                tipsAmnt: {
                    path: {
                        il: 'Total Tips',
                        us: 'Total Tips'
                    },
                    type: 'number'
                },
                totalPaymentsAmnt: {
                    path: {
                        il: 'calcTotalPaymentAmount',
                        us: 'calcTotalPaymentAmount'
                    },
                    type: 'number'
                }
            }
        },
        init: function () {
            function recursFun(obj) {
                Object.keys(obj).forEach(k => {
                    if (k !== 'init') {
                        if (typeof obj[k] === 'object') {
                            recursFun(obj[k]);
                            obj[k].parent = obj;
                        }
                    }
                });
            }

            recursFun(this);
            delete this.init;
            return this;
        }
    }.init();

    public dims = {
        BusinessDate: {//v1, deprecated TODO
            hierarchy: {
                il: '[Business Date]',
                us: '[Business Date]'
            },
            dims: {
                date: {
                    il: '[Date Key]',
                    us: '[Date Key]'
                },
                dateAndWeekDay: {
                    il: '[Date With Dow]',
                    us: '[Date With Dow]'
                },
                yearAndMonth: {
                    il: '[YYYYMM]',
                    us: '[YYYYMM]'//YYYYMM
                }
            }
        },
        orderClosingTime: {//v1, deprecated TODO
            hierarchy: {
                il: '[Closed Hour]',
                us: '[Closed Hour]'
            },
            dims: {
                time: {
                    il: '[HHMM Order]',
                    us: '[HHMM Order]'
                }
            }
        },
        firingTime: {//v1, deprecated TODO
            hierarchy: {
                il: '[FireOn Time]',
                us: '[FireOn Time]'
            },
            dims: {
                time: {
                    il: '[HHMM Key]',
                    us: '[HHMM Key]'
                }
            }
        },
        businessDateV2: {//"תאריך יום עסקים"
            v: 2,
            path: {
                il: 'Business Date',
                us: 'Business Date'
            },
            attr: {
                date: {//"תאריך"
                    path: {
                        il: 'Date Key',
                        us: 'Date Key'
                    },
                    parse: {
                        il: raw => moment(raw, 'DD/MM/YYYY'),
                        us: raw => moment(raw, 'MM/DD/YYYY')//'12/27/2017'
                    }
                },
                yearMonth: {//"שנה חודש"
                    path: {
                        il: 'YYYYMM',
                        us: 'YYYYMM'
                    },
                    parse: {
                        il: raw => {//'201803', '201812'
                            if (!raw) return null;
                            const regex = /(\d+) (\D+)/;
                            let m;
                            let year;
                            let month;
                            let monthInt;
                            try {
                                m = regex.exec(raw);
                                year = m[1];
                                month = m[2];
                                if (!year || !month) {
                                    return null;
                                }
                                monthInt = this.monthsMap['il'][month];
                                if (!monthInt) {
                                    return null;
                                }
                            } catch (e) {
                                return null;
                            }
                            return moment().year(year).month(monthInt - 1).date(1);
                        },
                        us: raw => {//'Aug2017'
                            if (!raw) return null;
                            const regex = /(\D+)(\d+)/;
                            let m;
                            let year;
                            let month;
                            let monthInt;
                            try {
                                m = regex.exec(raw);
                                month = m[1];
                                year = m[2];
                                if (!year || !month) {
                                    return null;
                                }
                                monthInt = this.monthsMap['us'][month.toUpperCase()];
                                if (!monthInt) {
                                    return null;
                                }
                            } catch (e) {
                                return null;
                            }
                            return moment().year(year).month(monthInt - 1).date(1);
                        }
                    }
                },
                dayOfWeek: {//יום בשבוע
                    path: {
                        il: 'Week Day Name',//'ראשון'...
                        us: 'Week Day Name'//'Sunday'...
                    },
                    parse: {
                        il: raw => raw,
                        us: raw => {
                            switch (raw.toUpperCase()) {
                                case 'SUNDAY':
                                    return moment('0', 'e');
                                case 'MONDAY':
                                    return moment('1', 'e');
                                case 'TUESDAY':
                                    return moment('2', 'e');
                                case 'WEDNESDAY':
                                    return moment('3', 'e');
                                case 'THURSDAY':
                                    return moment('4', 'e');
                                case 'FRIDAY':
                                    return moment('5', 'e');
                                case 'SATURDAY':
                                    return moment('6', 'e');
                            }
                        }
                    }
                }
            }
        },
        ordersV2: {//
            v: 2,
            path: {
                il: 'orderNumber',
                us: 'orderNumber'
            },
            attr: {
                orderNumber: {
                    path: {
                        il: 'Order Number',//'הזמנה <int>',
                        us: 'Order Number'//'#<int>'
                    },
                    parse: {
                        il: raw => {
                            try {
                                return (raw.replace('הזמנה ', '') * 1);
                            } catch (e) {
                                return 0;
                            }
                        },
                        us: raw => {
                            try {
                                return (raw.replace('#', '') * 1);
                            } catch (e) {
                                return 0;
                            }
                        }
                    }
                }
            }
        },
        serviceV2: {
            v: 2,
            path: {
                il: 'Services',
                us: 'Services'
            },
            attr: {
                name: {
                    path: {
                        il: 'Service Key',
                        us: 'Service Key'
                    },
                    parse: {
                        il: raw => raw,
                        us: raw => raw
                    }
                }
            }
        },
        priceReductions: {//סיבות הנחה
            v: 2,
            path: {
                il: 'Reasons',
                us: 'Reasons'
            },
            attr: {
                subType: {//תת קבוצת החלטה
                    path: {
                        il: 'Reason Sub Type Key',
                        us: 'Reason Sub Type Key'
                    },
                    members: {
                        retention: {
                            path: {
                                il: 'retention@OTH',
                                us: 'retention@OTH'
                            }
                        },
                        discounts: {
                            path: {
                                il: 'retention@Discounts',
                                us: 'retention@Discounts'
                            }
                        }
                    }
                },
                reasonId: {//סיבות הנחה
                    path: {
                        il: 'Reason Name',
                        us: 'Reason Name'
                    }
                },
                reasons: {
                    path: {
                        il: 'Reason Type',//קבוצת הנחה
                        us: 'Reason Type'
                    },
                    parse: {
                        il: raw => {
                            switch (raw) {
                                case 'Voids Actions':
                                    return 'cancellation';
                                case 'Compensation Actions':
                                    return 'compensation';
                                case 'Retention Actions':
                                    return 'retention';
                                case 'TBD':
                                    return 'organizational';
                                case 'TBD':
                                    return 'promotions';
                            }
                        },
                        us: raw => {
                            switch (raw) {
                                case 'Voids Actions':
                                    return 'cancellation';
                                case 'Compensation Actions':
                                    return 'compensation';
                                case 'Retention Actions':
                                    return 'retention';
                                case 'TBD':
                                    return 'organizational';
                                case 'TBD':
                                    return 'promotions';
                            }
                        }
                    },
                    members: {
                        operational: {
                            path: {
                                il: 'Compensation Actions',
                                us: 'Compensation Actions'
                            }
                        },
                        retention: {
                            path: {
                                il: 'Retention Actions',
                                us: 'Retention Actions'
                            }
                        }
                    }
                }
            }
        },
        items: {//פריטים
            v: 2,
            path: {
                il: 'ItemsCategories',
                us: 'ItemsCategories'
            },
            attr: {
                department: {//מחלקה
                    path: {
                        il: 'Department Id',
                        us: 'Department Id'
                    }
                },
                subDepartment: {//תת מחלקה
                    path: {
                        il: 'Sub Department Id',
                        us: 'Sub Department Id'
                    }
                },
                item: {//פריט
                    path: {
                        il: 'Item Name',
                        us: 'Item Name'
                    }
                }
            }
        },
        accounts: {//"אמצעי תשלום"
            v: 2,
            path: {
                il: 'Accounts',
                us: 'Accounts'
            },
            attr: {
                accountGroup: {//e.g. CashAccount, CreditAccount
                    path: {
                        il: 'Type',
                        us: 'Type'
                    }
                },
                accountType: {//e.g. Cash, Credit, CreditCard (?)
                    path: {
                        il: 'Name',
                        us: 'Name'
                    }
                }
            }
        },
        clearer: {
            v: 2,
            path: {
                il: 'Clearing',
                us: 'Clearing'
            },
            attr: {
                clearerName: {// e.g. diners, amex...
                    path: {
                        il: 'Clearing Name',
                        us: 'Clearing Name'
                    }
                }
            }
        },
        orderTypeV2: {//סוג הזמנה
            v: 2,
            path: {
                il: 'orderType',
                us: 'orderType'
            },
            attr: {
                orderType: {//סוג הזמנה
                    path: {
                        il: 'Order Type Key',
                        us: 'Order Type Key'
                    },
                    parse: {
                        il: raw => {
                            switch (raw) {//must map to the indexes in dataService.orderTypes!
                                case 'בישיבה':
                                    return 'seated';
                                case 'דלפק':
                                    return 'counter';
                                case 'לקחת':
                                    return 'ta';
                                case 'משלוח':
                                    return 'delivery';
                                case 'החזר':
                                    return 'refund';
                                case 'mediaexchange':
                                    return 'mediaExchange';
                                default:
                                    return 'other';
                            }
                        },
                        us: raw => {
                            switch (raw) {//must map to the indexes in dataService.orderTypes!
                                case 'seated':
                                    return 'seated';
                                case 'otc':
                                    return 'counter';
                                case 'takeaway':
                                    return 'ta';
                                case 'delivery':
                                    return 'delivery';
                                case 'refund':
                                    return 'refund';
                                case 'mediaexchange':
                                    return 'mediaExchange';
                                default:
                                    return 'other';
                            }
                        }
                    },
                    members: {
                        seated: {
                            path: {
                                il: 'seated',
                                us: 'seated'
                            }
                        },
                        otc: {
                            path: {
                                il: 'otc',
                                us: 'otc'
                            }
                        },
                        takeaway: {
                            path: {
                                il: 'takeaway',
                                us: 'takeaway'
                            }
                        },
                        delivery: {
                            path: {
                                il: 'delivery',
                                us: 'delivery'
                            }
                        },
                        refund: {
                            path: {
                                il: 'refund',
                                us: 'refund'
                            }
                        },
                        mediaexchange: {
                            path: {
                                il: 'mediaexchange',
                                us: 'mediaexchange'
                            }
                        }
                    }
                }
            }
        },
        source: {//מקור
            v: 2,
            path: {
                il: 'Sources',
                us: 'Sources'
            },
            attr: {
                source: {//מקור
                    path: {
                        il: 'Source',
                        us: 'Source'
                    }
                }
            }
        },
        waitersV2: {//מלצרים
            v: 2,
            path: {
                il: 'WaiterOwner',
                us: 'WaiterOwner'
            },
            attr: {
                waiter: {//מלצר
                    path: {
                        il: 'Full Name',
                        us: 'Full Name'
                    }
                }
            }
        },
        owner: {//waitersV2 is actually OWNER, but in US we have Owner, FiredBy and ApprovedBy
            v: 2,
            path: {
                il: 'WaiterOwner',
                us: 'WaiterOwner'
            },
            attr: {
                waiter: {//מלצר
                    path: {
                        il: 'Full Name',
                        us: 'Full Name'
                    }
                }
            }
        },
        firedBy: {//waitersV2 is actually OWNER, but in US we have Owner, FiredBy and ApprovedBy
            v: 2,
            path: {
                il: 'WaiterFiredBy',
                us: 'WaiterFiredBy'
            },
            attr: {
                waiter: {//מלצר
                    path: {
                        il: 'User Id',
                        us: 'User Id'
                    }
                }
            }
        },
        approvedBy: {//waitersV2 is actually OWNER, but in US we have Owner, FiredBy and ApprovedBy
            v: 2,
            path: {
                il: 'WaiterPRapprovedBy',
                us: 'WaiterPRapprovedBy'
            },
            attr: {
                waiter: {//מלצר
                    path: {
                        il: 'User Id',
                        us: 'User Id'
                    }
                }
            }
        },
        tables: {//"שולחנות"    //TODO
            v: 2,
            path: {
                il: 'tables',
                us: 'tables'
            },
            attr: {
                tableId: {
                    path: {
                        il: 'Tablenumber',//מס שולחן
                        us: 'Tablenumber'//Tablenumber
                    },
                    parse: {
                        il: raw => {
                            if (raw.indexOf('ללא שולחן') > -1) return '';
                            return raw.replace('שולחן ', '');
                        },
                        us: raw => {//"Table #<int>"
                            if (raw.toUpperCase().indexOf('UNKNOWN') > -1) return '';
                            return raw.replace('Table #', '');
                        }
                    }

                }
            }
        },
        orderOpeningDateV2: {
            v: 2,
            path: {
                il: 'Open Order Date',
                us: 'Open Order Date'
            },
            attr: {
                openingDate: {
                    path: {
                        il: 'Date Key',
                        us: 'Date Key'
                    }
                }
            }
        },
        orderOpeningTimeV2: {
            v: 2,
            path: {
                il: 'Opened Hour',
                us: 'Opened Hour'
            },
            attr: {
                openingTime: {
                    path: {
                        il: 'HHMM Order',
                        us: 'HHMM Order'
                    }
                }
            }
        },
        init: function () {
            function recursFun(obj) {
                Object.keys(obj).forEach(k => {
                    if (k !== 'init') {
                        if (typeof obj[k] === 'object') {
                            recursFun(obj[k]);
                            obj[k].parent = obj;
                        }
                    }
                });
            }

            recursFun(this);
            delete this.init;
            return this;
        }
    }.init();

}


// WEBPACK FOOTER //
// C:/dev/tabit/dashboard/src/tabit/data/ep/olap.ep.ts
