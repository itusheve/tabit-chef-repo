import { Injectable } from '@angular/core';

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
            il: '[Measures].[Tlog Header Total Payment Amount]',
            us: '[Measures].[salesNetAmount]'//'Item Net Sales $'
        },
        itemsSales: {
            il: '[Measures].[Tlog Items Net Amount]',
            us: '[Measures].[salesNetAmount]'//Item Net Sales $
        },
        ppa: {
            sales: {
                il: '[Measures].[PPANetAmountSeated]',
                us: '[Measures].[dinersNetAmount]'
            },
            diners: {
                il: '[Measures].[PPADinersSeated]',
                us: '[Measures].[headerDiners]'
            }
        }
    };

    public measureGroups = {//the structure is similar to the one in the CUBE, with the hebrew captions in comments as helpers
        general: {//"כללי" and stuff in Measures' root
            measures: {
                ordersCount: {//"הזמנות"
                    path: {
                        il: 'PPAOrders',
                        us: 'headerOrderCount'
                    },
                    type: 'number'
                },
                sales: {//"מכירות"
                    path: {
                        il: 'Tlog Header Total Payment Amount',
                        us: 'salesNetAmount'
                    },
                    type: 'number'
                },
                dinersSales: {//"מכירות לסועד"
                    path: {
                        il: 'PPANetAmountSeated',
                        us: 'dinersNetAmount'
                    },
                    type: 'number'
                },
                dinersCount: {//"סועדים"
                    path: {
                        il: 'PPADinersSeated',
                        us: 'headerDiners'
                    },
                    type: 'number'
                },
                dinersPPA: {//"ממוצע לסועד"
                    path: {
                        il: 'PPA Seated',
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
                        il: 'Tlog Items Net Amount',
                        us: 'salesNetAmount'
                    },
                    type: 'number'
                },
                sold: {//"נמכר"
                    path: {
                        il: 'Tlog Items Sold',
                        us: 'salesSold'
                    }
                },
                prepared: {//"הוכן"
                    path: {
                        il: 'Tlog Items Prepared',
                        us: 'salesPrepared'
                    }
                },
                returned: {//"הוחזר"
                    path: {
                        il: 'Tlog Items Return',
                        us: 'salesReturn'
                    }
                },
                takalotTiful_value_pct: {//"% תקלות תפעול" TODO
                    path: {
                        il: '%ShoviTakalotTiful',
                        us: 'TBD'
                    }
                },
                shimurShivuk_value_pct: {//"% שימור ושיווק"  TODO
                    path: {
                        il: '%ShoviShimurShivuk',
                        us: 'TBD'
                    }
                },
                shoviIrguni_value_pct: {//"% ארוחות עובדים"   TODO
                    path: {
                        il: '%ShoviIrguni',
                        us: 'TBD'
                    }
                },
                cancelled_value_pct: {//"% ביטול כספי"  TODO
                    path: {
                        il: '%CancelledAmount',
                        us: 'TBD'
                    }
                }
            }
        },
        priceReductions: {//הנחות
            measures: {
                cancellation: {
                    path: {
                        il: 'Tlog Pricereductions Cancellation Amount',
                        us: 'salesReductionsCancellationAmount'//Voids$
                    },
                    type: 'number'
                },
                retention: {
                    path: {
                        il: 'Tlog Pricereductions Retention Discount Amount',
                        us: 'salesReductionsRetentionDiscountAmount'
                    },
                    type: 'number'
                },
                operational: {//"שווי תקלות תפעול"
                    path: {
                        il: 'Tlog Pricereductions Operational Discount Amount',
                        us: 'salesReductionsOperationalDiscountAmount'
                    },
                    type: 'number'
                },
                organizational: {
                    path: {
                        il: 'Tlog Pricereductions Organizational Discount Amount',
                        us: 'salesReductionsOrganizationalDiscountAmount'
                    },
                    type: 'number'
                }
            }
        },
        payments: {//"תקבולים"
            measures: {
                grossPayments: {
                    path: {
                        il: 'Tlog Payments Actual Amount',
                        us: 'paymentsActualAmount'
                    },
                    type: 'number'
                }
            }
        },
        init: function () {
            function recursFun(obj) {
                Object.keys(obj).forEach(k => {
                    if (k!=='init') {
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
        orderType: {//v1, deprecated
            hierarchy: {
                il: '[Ordertype]',
                us: '[orderType]'
            },
            dim: {
                il: '[Tlog Header Ordertype]',
                us: '[Order Type Key]'
            },
            members: {
                seated: {
                    il: '&[seated]',
                    us: '&[seated]'
                },
                takeaway: {
                    il: '&[takeaway]',
                    us: '&[takeaway]'
                },
                delivery: {
                    il: '&[delivery]',
                    us: '&[delivery]'
                },
                otc: {
                    il: '&[otc]',
                    us: '&[otc]'
                },
                refund: {
                    il: '&[refund]',
                    us: '&[refund]'
                },
                mediaexchange: {
                    il: '&[mediaexchange]',
                    us: '&[mediaexchange]'
                }
            }
        },
        service: {//v1, deprecated
            hierarchy: {
                il: '[Service]',
                us: '[Services]'
            },
            dim: {
                il: '[Service Name]',
                us: '[Service Key]'
            }
        },
        BusinessDate: {//v1, deprecated
            hierarchy: {
                il: '[BusinessDate]',
                us: '[Business Date]'
            },
            dims: {
                date: {
                    il: '[Date Key]',
                    us: '[Date Key]'
                },
                dateAndWeekDay: {
                    il: '[Shortdayofweek Name]',
                    us: '[Date With Dow]'
                },
                yearAndMonth: {
                    il: '[Year Month Key]',
                    us: '[YYYYMM]'//YYYYMM
                }
            }
        },
        orderOpeningDate: {//v1, deprecated
            hierarchy: {
                il: '[DateOpen]',
                us: '[Open Order Date]'
            },
            dims: {
                date: {
                    il: '[Date Key]',
                    us: '[Date Key]'
                }
            }
        },
        orderOpeningTime: {//v1, deprecated         TODO
            hierarchy: {
                il: '[TimeOpen]',
                us: '[Opened Hour]'
            },
            dims: {
                time: {
                    il: '[Time Id]',
                    us: '[HHMM Order]'
                }
            }
        },
        orderClosingTime: {//v1, deprecated
            hierarchy: {
                il: '[CloseTime]',
                us: '[Closed Hour]'
            },
            dims: {
                time: {
                    il: '[Time Id]',
                    us: '[HHMM Order]'
                }
            }
        },
        firingTime: {//v1, deprecated
            hierarchy: {
                il: '[FireTime]',
                us: '[FireOn Time]'
            },
            dims: {
                time: {
                    il: '[Time Id]',
                    us: '[HHMM Key]'
                }
            }
        },
        waiters: {//v1, deprecated
            hierarchy: {
                il: '[Owners]',
                us: '[WaiterOwner]'
            },
            dims: {
                waiter: {
                    il: '[Tlog Header Owner Id]',
                    us: '[Full Name]'
                }
            }
        },
        businessDateV2: {//"תאריך יום עסקים"
            v: 2,
            path: {
                il: 'BusinessDate',
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
                        il: 'Year Month Key',
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
                        il: 'Dayofweek Key',//'ראשון'...
                        us: 'Week Day Name'//'Sunday'...
                    }
                }
            }
        },
        ordersV2: {//
            v: 2,
            path: {
                il: 'Ordernumber',
                us: 'orderNumber'
            },
            attr: {
                orderNumber: {
                    path: {
                        il: 'Tlog Header Order Number',//'הזמנה מס <int>',
                        us: 'Order Number'//'#<int>'
                    },
                    parse: {
                        il: raw => {
                            try {
                                return (raw.replace('הזמנה מס ', '') * 1);
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
        priceReductions: {//סיבות הנחה          TODO
            v: 2,
            path: {
                il: 'Pricereductionreasons',
                us: 'Reasons'
            },
            attr: {
                subType: {//תת קבוצת החלטה
                    path: {
                        il: 'Tlog Pricereductions Reason Sub Type',
                        us: 'Reason Sub Type Key'
                    }
                },
                reasonId: {//סיבות הנחה
                    path: {
                        il: 'Tlog Pricereductions Reason Id',
                        us: 'Reason Id Key'
                    }
                },
                reasons: {
                    path: {
                        il: 'Tlog Pricereductions Reason Type',//קבוצת הנחה
                        us: 'Reason Type'
                    },
                    parse: {
                        il: raw => {
                            switch (raw) {
                                case 'ביטולים':
                                    return 'cancellation';
                                case 'תפעול':
                                    return 'compensation';
                                case 'שימור ושיווק':
                                    return 'retention';
                                case 'ארגוני':
                                    return 'organizational';
                                case 'מבצעים':
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
                                il: 'compensation',
                                us: 'Compensation Actions'
                            }
                        },
                        retention: {
                            path: {
                                il: 'retention',
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
                il: 'Items',
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
                        il: 'Sub Department',
                        us: 'Sub Department Id'
                    }
                },
                item: {//פריט
                    path: {
                        il: 'Item Group Id',
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
                accountType: {//"Typeid"  e.g. "אשראי", "הקפה", "מזומן"
                    path: {
                        il: 'Typeid',
                        us: 'Type Id'//offer need to fix
                    }
                },
                account: {//"HQ Name"  e.g. "דינרס", "ישראכרט", "סיבוס", "מזומן", "עודף מאשראי"
                    path: {
                        il: 'HQ Name',
                        us: 'TBD'
                    }
                }
            }
        },
        orderTypeV2: {//סוג הזמנה
            v: 2,
            path: {
                il: 'Ordertype',
                us: 'orderType'
            },
            attr: {
                orderType: {//סוג הזמנה
                    path: {
                        il: 'Tlog Header Ordertype',
                        us: 'Order Type Key'
                    }
                }
            }
        },
        source: {//מקור
            v: 2,
            path: {
                il: 'Source',
                us: 'Sources'
            },
            attr: {
                source: {//מקור
                    path: {
                        il: 'Tlog Header Source',
                        us: 'Source'
                    }
                }
            }
        },
        waitersV2: {//מלצרים
            v: 2,
            path: {
                il: 'Owners',
                us: 'WaiterOwner'
            },
            attr: {
                waiter: {//מלצר
                    path: {
                        il: 'Tlog Header Owner Id',
                        us: 'Full Name'
                    }
                }
            }
        },
        owner: {//waitersV2 is actually OWNER, but in US we have Owner, FiredBy and ApprovedBy
            v: 2,
            path: {
                il: 'Owners',
                us: 'WaiterOwner'
            },
            attr: {
                waiter: {//מלצר
                    path: {
                        il: 'Tlog Header Owner Id',
                        us: 'Full Name'
                    }
                }
            }
        },
        firedBy: {//waitersV2 is actually OWNER, but in US we have Owner, FiredBy and ApprovedBy
            v: 2,
            path: {
                il: 'NON EXISTING',
                us: 'WaiterFiredBy'
            },
            attr: {
                waiter: {//מלצר
                    path: {
                        il: 'NON EXISTING',
                        us: 'User Id'
                    }
                }
            }
        },
        approvedBy: {//waitersV2 is actually OWNER, but in US we have Owner, FiredBy and ApprovedBy
            v: 2,
            path: {
                il: 'NON EXISTING',
                us: 'WaiterPRapprovedBy'
            },
            attr: {
                waiter: {//מלצר
                    path: {
                        il: 'NON EXISTING',
                        us: 'User Id'
                    }
                }
            }
        },
        tables: {//"שולחנות"    //TODO
            v: 2,
            path: {
                il: 'Tables',
                us: 'tables'
            },
            attr: {
                tableId: {
                    path: {
                        il: 'Table Id',//מס שולחן
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
        init: function() {
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
