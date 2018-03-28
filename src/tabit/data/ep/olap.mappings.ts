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
                        us: 'salesNetAmount'
                    }
                },
                prepared: {//"הוכן"
                    path: {
                        il: 'Tlog Items Prepared',
                        us: 'salesNetAmount'
                    }
                },
                returned: {//"הוחזר"
                    path: {
                        il: 'Tlog Items Return',
                        us: 'salesNetAmount'
                    }
                },
                takalotTiful_value_pct: {//"% תקלות תפעול"
                    path: {
                        il: '%ShoviTakalotTiful',
                        us: 'salesNetAmount'
                    }
                },
                shimurShivuk_value_pct: {//"% שימור ושיווק"
                    path: {
                        il: '%ShoviShimurShivuk',
                        us: 'salesNetAmount'
                    }
                },
                shoviIrguni_value_pct: {//"% ארוחות עובדים"
                    path: {
                        il: '%ShoviIrguni',
                        us: 'salesNetAmount'
                    }
                },
                cancelled_value_pct: {//"% ביטול כספי"
                    path: {
                        il: '%CancelledAmount',
                        us: 'salesNetAmount'
                    }
                }
            }
        },
        priceReductions: {//הנחות
            measures: {
                cancellation: {
                    path: {
                        il: 'Tlog Pricereductions Cancellation Amount',
                        us: 'salesNetAMount'
                    },
                    type: 'number'
                },
                retention: {
                    path: {
                        il: 'Tlog Pricereductions Retention Discount Amount',
                        us: 'salesNetAMount'
                    },
                    type: 'number'
                },
                operational: {//"שווי תקלות תפעול"
                    path: {
                        il: 'Tlog Pricereductions Operational Discount Amount',
                        us: 'salesNetAMount'
                    },
                    type: 'number'
                },
                organizational: {
                    path: {
                        il: 'Tlog Pricereductions Organizational Discount Amount',
                        us: 'salesNetAMount'
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
                        us: 'salesNetAMount'
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
                    us: ''
                },
                yearAndMonth: {
                    il: '[Year Month Key]',  //TODO whats the difference between 'Month Year' and 'MMYYYY'
                    us: ''
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
                us: ''
            },
            dims: {
                time: {
                    il: '[Time Id]',
                    us: ''
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
                        us: 'Month Year'//'Aug2017'
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
                us: ''
            },
            attr: {
                subType: {//תת קבוצת החלטה
                    path: {
                        il: 'Tlog Pricereductions Reason Sub Type',
                        us: ''
                    }
                },
                reasonId: {//סיבות הנחה
                    path: {
                        il: 'Tlog Pricereductions Reason Id',
                        us: ''
                    }
                },
                reasons: {
                    path: {
                        il: 'Tlog Pricereductions Reason Type',
                        us: ''
                    },
                    parse: {
                        il: raw => {
                            switch (raw) {
                                case 'ביטולים'://TODO localization
                                    return 'cancellation';
                                case 'תפעול'://TODO localization
                                    return 'compensation';
                                case 'שימור ושיווק'://TODO localization
                                    return 'retention';
                                case 'ארגוני'://TODO localization
                                    return 'organizational';
                                case 'מבצעים'://TODO localization
                                    return 'promotions';
                            }
                        },
                        us: raw => raw //TODO
                    },
                    members: {
                        cancellation: {
                            path: {
                                il: 'cancellation',
                                us: ''
                            },
                            caption: 'ביטולים'//TODO localization
                        },
                        operational: {
                            path: {
                                il: 'compensation',
                                us: ''
                            },
                            caption: 'תפעול'
                        },
                        retention: {
                            path: {
                                il: 'retention',
                                us: ''
                            },
                            caption: 'שימור ושיווק'//TODO localization
                        },
                        organizational: {
                            path: {
                                il: 'organizational',
                                us: ''
                            },
                            caption: 'ארגוני'//TODO localization
                        },
                        promotions: {
                            path: {
                                il: '',
                                us: ''
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
                        us: 'Department Name'
                    }
                },
                subDepartment: {//תת מחלקה
                    path: {
                        il: 'Sub Department',
                        us: 'Sub Departmen Name'
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
                        us: 'Type'
                    }
                },
                account: {//"HQ Name"  e.g. "דינרס", "ישראכרט", "סיבוס", "מזומן", "עודף מאשראי"
                    path: {
                        il: 'HQ Name',
                        us: 'Name'
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
        tables: {//"שולחנות"    //TODO
            v: 2,
            path: {
                il: 'Tables',
                us: ''
            },
            attr: {
                tableId: {//מס שולחן
                    path: {
                        il: 'Table Id',
                        us: ''
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
