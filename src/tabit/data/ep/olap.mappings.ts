import { Injectable } from '@angular/core';

import * as moment from 'moment';

@Injectable()
export class OlapMappings {

//     select
// 	{
//     //Order Summary:
//     [Measures].[GrossSales],//Gross Sales $
//         [Measures].[headerTotalAmount],//headerTotalAmount
//         [Measures].[headerTotalIncludedTax],//headerTotalIncludedTax
//         [Measures].[headerTotalPaymentAmount],//headerTotalPaymentAmount
//         [Measures].[headerTotalSalesAmount],//Net Sales $

//         //Items:
//         [Measures].[salesNetAmount],//Item Net Sales $
//         [Measures].[ItemGrossSales],//Items Gross Sales $
//         [Measures].[salesGeneralAmount],//salesGeneralAmount
//         [Measures].[salesGrossAmount],//salesGrossAmount
//         [Measures].[salesNetAmountVat]//salesNetAmountVat
// }
// on 0
// from[Usadwhtabit Int]

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
                        us: 'TBD'
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
                dateAndWeekDay: {       //TODO NON EXISTING IN US!
                    il: '[Shortdayofweek Name]',
                    us: 'TBD'
                },
                yearAndMonth: {
                    il: '[Year Month Key]',  //TODO whats the difference between 'Month Year' and 'MMYYYY'
                    us: 'TBD'
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
        firingTime: {//v1, deprecated    TODO
            hierarchy: {
                il: '[FireTime]',
                us: 'TBD'
            },
            dims: {
                time: {
                    il: '[Time Id]',
                    us: 'TBD'
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
        tlog: {
            v: 2,
            path: {
                il: 'Tlog',
                us: 'Tlog'
            },
            attr: {
                id: {
                    path: {
                        il: 'Tlog Header Tlog Id',
                        us: 'Tlog Header Tlog Id'
                    }
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
                        us: raw => moment(raw, 'YYYY-MM-DD')//'20170108'
                    }
                },
                yearMonth: {//"שנה חודש"
                    path: {
                        il: 'Year Month Key',//'201803', '201812'
                        us: 'TBD'//'Aug2017'
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
                        il: 'Tlog Pricereductions Reason Type',
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
                                case 'Viods Actions':
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
                        cancellation: {
                            path: {
                                il: 'cancellation',
                                us: 'Viods Actions'
                            },
                            caption: 'ביטולים'//TODO localization
                        },
                        operational: {
                            path: {
                                il: 'compensation',
                                us: 'Compensation Actions'
                            },
                            caption: 'תפעול'
                        },
                        retention: {
                            path: {
                                il: 'retention',
                                us: 'Retention Actions'
                            },
                            caption: 'שימור ושיווק'//TODO localization
                        },
                        organizational: {
                            path: {
                                il: 'organizational',
                                us: 'TBD'
                            },
                            caption: 'ארגוני'//TODO localization
                        },
                        promotions: {
                            path: {
                                il: '',
                                us: 'TBD'
                            },
                            caption: 'מבצעים'//TODO localization
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
                us: 'TBD'
            },
            attr: {
                tableId: {//מס שולחן
                    path: {
                        il: 'Table Id',
                        us: 'TBD'
                    },
                    parse: {
                        il: raw => {
                            if (raw.indexOf('ללא שולחן') > -1) return '';
                            return raw.replace('שולחן ', '');
                        },
                        us: raw => raw
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
