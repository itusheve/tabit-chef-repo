

const OrderViewService = (function () {

    function OrderViewService(options) {
        _configure(options);
    }

    let translateService;
    let utils;
    let moment;

    let isUS = false;
    const _options = {};

    function _configure(options) {
        if (options.local) _options.local = options.local;

        if (options.isUS !== undefined) {
            _options.isUS = options.isUS;
            isUS = options.isUS;
        };

        if (options.moment) {
            moment = options.moment;
        }
        else {
            moment = window.moment;
        }

        translateService = new TranslateService({
            local: _options.local
        });

        utils = new Utils();
    }

    // Enums
    const Enums = {
        PaymentTypes: {
            OTH: 'OTH',
            CreditCardPayment: 'CreditCardPayment',
            ChargeAccountPayment: 'ChargeAccountPayment',
            CashPayment: 'CashPayment',
            ChequePayment: 'ChequePayment',
            CreditCardPayment: 'CreditCardPayment',
            ChargeAccountRefund: 'ChargeAccountRefund',
            CashRefund: 'CashRefund',
            ChequeRefund: 'ChequeRefund',
            CreditCardRefund: 'CreditCardRefund',
        },
        OrderTypes: {
            Refund: "Refund",
            TA: "TA",
            Delivery: "Delivery",
            Seated: "Seated",
            OTC: "OTC"
        },
        ReturnTypes: {
            Cancellation: 'cancellation',
            TransactionBased: "TRANSACTION BASED"
        },
        DiscountTypes: {
            OTH: "OTH",
        },
        OfferTypes: {
            Simple: "Simple",
            Combo: 'Combo',
            ComplexOne: 'Complex-One'
        },
        TransTypes: {
            Reversal: "Reversal",
            Return: "Return"
        },
        Sources: {
            TabitPay: "tabitPay"
        }
    }

    let billService = {
        resolveItems: function (variables, collections) {

            let isReturnOrder = false;
            if (variables.RETURN_TYPE === Enums.ReturnTypes.TransactionBased) {
                isReturnOrder = true;
            }

            let offersList = collections.ORDERED_OFFERS_LIST;
            if (isReturnOrder) {
                offersList = collections.RETURNED_OFFERS_LIST;
            }

            let isTaxExempt = false;
            if ((collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && isUS)) {
                isTaxExempt = true;
            }

            let items = [];
            let oth = [];

            if (offersList && offersList.length > 0) {
                offersList.forEach(offer => {

                    let offerQyt = 0;
                    if (offer.SPLIT_DENOMINATOR && offer.SPLIT_NUMERATOR && offer.SPLIT_DENOMINATOR !== 100 && offer.SPLIT_NUMERATOR !== 100) {
                        offerQyt = `${offer.SPLIT_NUMERATOR}/${offer.SPLIT_DENOMINATOR}`;
                    } else {
                        offerQyt = offer.OFFER_QTY
                    }

                    if (offer.OFFER_TYPE == Enums.OfferTypes.Simple) {
                        let item = {
                            isOffer: true,
                            name: offer.OFFER_NAME,
                            qty: offerQyt
                        };

                        if (offer.ON_THE_HOUSE) {
                            item.amount = translateService.getText('OTH');
                            oth.push(item)
                        } else {
                            item.amount = utils.toFixedSafe(offer.OFFER_AMOUNT, 2)
                            items.push(item);
                        }

                        if (offer.ORDERED_OFFER_DISCOUNTS && offer.ORDERED_OFFER_DISCOUNTS.length > 0) {
                            offer.ORDERED_OFFER_DISCOUNTS.forEach(discount => {
                                items.push({
                                    isOfferDiscount: true,
                                    name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : translateService.getText('MANUAL_ITEM_DISCOUNT'),
                                    qty: null,
                                    amount: utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                                })
                            });
                        }
                    }

                    if ([Enums.OfferTypes.ComplexOne, Enums.OfferTypes.Combo].indexOf(offer.OFFER_TYPE) > -1) {

                        items.push({
                            isOffer: true,
                            name: offer.OFFER_NAME,
                            qty: offerQyt,
                            amount: offer.ON_THE_HOUSE ? translateService.getText('OTH') : utils.toFixedSafe(isReturnOrder ? offer.OFFER_AMOUNT : offer.OFFER_CALC_AMT, 2)
                        });

                        if (!isReturnOrder) {
                            if (offer.ORDERED_ITEMS_LIST && offer.ORDERED_ITEMS_LIST.length > 0)
                                offer.ORDERED_ITEMS_LIST.forEach(item => {
                                    items.push({
                                        isItem: true,
                                        name: item.ITEM_NAME,
                                        qty: null,
                                        amount: null
                                    })
                                });
                        }

                        if (!isReturnOrder) {
                            if (offer.EXTRA_CHARGE_LIST && offer.EXTRA_CHARGE_LIST.length > 0) {
                                offer.EXTRA_CHARGE_LIST.forEach(item => {
                                    if (item.EXTRA_CHARGE_MODIFIERS_LIST && item.EXTRA_CHARGE_MODIFIERS_LIST.length > 0) {
                                        item.EXTRA_CHARGE_MODIFIERS_LIST.forEach(modifier => {
                                            items.push({
                                                isItem: true,
                                                name: modifier.MODIFIER_NAME,
                                                qty: null,
                                                amount: item.ON_THE_HOUSE ? translateService.getText('OTH') : utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                                            })
                                        })
                                    } else {
                                        items.push({
                                            isItem: true,
                                            name: item.ITEM_NAME,
                                            qty: null,
                                            amount: item.ON_THE_HOUSE ? translateService.getText('OTH') : utils.toFixedSafe(item.ITEM_AMOUNT, 2)
                                        })
                                    }
                                });
                            }
                        }

                        if (offer.ORDERED_OFFER_DISCOUNTS && offer.ORDERED_OFFER_DISCOUNTS.length > 0) {
                            offer.ORDERED_OFFER_DISCOUNTS.forEach(discount => {
                                items.push({
                                    isOfferDiscount: true,
                                    name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : translateService.getText('MANUAL_ITEM_DISCOUNT'),
                                    qty: null,
                                    amount: utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                                })
                            })
                        }
                    }
                });
            }

            return {
                items: items,
                oth: oth,
                isReturnOrder: isReturnOrder,
                isTaxExempt: isTaxExempt
            };

        },
        resolveTotals: function (order, collections, isCheck) {

            let totals = [];

            if (order.TOTAL_SALES_AMOUNT && ((collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) ||
                order.TOTAL_TIPS ||
                (isUS && collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0))) {
                totals.push({
                    name: translateService.getText('TOTAL_ORDER'),
                    amount: utils.toFixedSafe(order.TOTAL_SALES_AMOUNT, 2)
                })
            }

            if (collections.ORDER_DISCOUNTS_LIST && collections.ORDER_DISCOUNTS_LIST.length > 0) {
                collections.ORDER_DISCOUNTS_LIST.forEach(discount => {
                    totals.push({
                        name: discount.DISCOUNT_NAME ? discount.DISCOUNT_NAME : translateService.getText('ORDER_DISCOUNT'),
                        amount: utils.toFixedSafe(discount.DISCOUNT_AMOUNT * -1, 2)
                    })
                })
            }

            if (collections.EXCLUSIVE_TAXES && collections.EXCLUSIVE_TAXES.length > 0 && isUS) {
                collections.EXCLUSIVE_TAXES.forEach(tax => {
                    totals.push({
                        type: 'exclusive_tax',
                        name: tax.NAME ? tax.NAME : translateService.getText('ECVLUSIVE_TAX'),
                        amount: utils.toFixedSafe(tax.AMOUNT, 2),
                        rate: tax.RATE
                    })
                })
            }

            if (collections.TIPS) {

                let autoGratuityTips = collections.TIPS.filter(c => c.SCOPE === "order");
                if (autoGratuityTips && autoGratuityTips.length > 0) {

                    //Service charge
                    if (autoGratuityTips && autoGratuityTips.length > 0 && isUS) {
                        autoGratuityTips.forEach(tip => {

                            let _name = tip.NAME ? tip.NAME : translateService.getText('SERVICE_CHARGE')
                            let _percent = tip.PERCENT;
                            if (_percent !== undefined) {
                                _name = tip.NAME ? `${tip.NAME} ${_percent}%` : `${translateService.getText('SERVICE_CHARGE')} ${_percent}%`;
                            }

                            if (tip.AMOUNT !== 0) {
                                totals.push({
                                    type: 'service_charge',
                                    name: _name,
                                    amount: utils.toFixedSafe(tip.AMOUNT, 2)
                                })

                            }

                        })
                    }
                }

            }

            if (order.TOTAL_TIPS_ON_PAYMENTS !== undefined || order.TOTAL_TIPS !== undefined) {

                let tipAmount = 0;
                if (order.TOTAL_TIPS_ON_PAYMENTS !== undefined) { tipAmount = order.TOTAL_TIPS_ON_PAYMENTS; }
                else if (order.TOTAL_TIPS !== undefined) { tipAmount = order.TOTAL_TIPS; }

                if (tipAmount > 0) {
                    totals.push({
                        type: 'tips',
                        name: translateService.getText('TIP'),
                        amount: utils.toFixedSafe(tipAmount, 2)
                    })
                }
                //if it is a returned order, the tip is negative and needs to be presented
                if (collections.PAYMENT_LIST[0].TRANS_TYPE === Enums.TransTypes.Return) {
                    if (collections.PAYMENT_LIST[0].TIP_AMOUNT !== 0) {
                        totals.push({
                            type: 'tips',
                            name: translateService.getText('TIP'),
                            amount: utils.toFixedSafe(-1 * collections.PAYMENT_LIST[0].TIP_AMOUNT, 2)
                        })
                    }
                }
            }

            if (order.TOTAL_IN_VAT && !isUS) {
                totals.push({
                    name: translateService.getText('TOTAL_INC_VAT'),
                    amount: utils.toFixedSafe(order.TOTAL_IN_VAT, 2)
                })
            }

            if (order.TOTAL_AFTER_EXCLUDED_TAX && isUS) {
                totals.push({
                    name: translateService.getText('TOTAL_INC_VAT'),
                    amount: utils.toFixedSafe(order.TOTAL_AMOUNT, 2)
                })
            }

            return totals;
        },
        resolvePayments: function (order, collections, isCheck) {
            let payments = [];

            collections.PAYMENT_LIST.forEach(payment => {
                payments.push({
                    name: billService.resolvePaymentName(payment),
                    amount: payment.PAYMENT_TYPE ? utils.toFixedSafe(payment.P_AMOUNT * -1, 2) : utils.toFixedSafe(payment.P_AMOUNT, 2),
                    holderName: payment.CUSTOMER_NAME !== undefined ? payment.CUSTOMER_NAME : ''
                });
            });

            payments.push({
                type: 'change',
                name: translateService.getText('CHANGE'),
                amount: utils.toFixedSafe(order.CHANGE, 2)
            });

            return payments;
        },
        resolveTaxes: function (variables, collections, isCheck) {

            let taxes = {
                InclusiveTaxes: [],
                ExemptedTaxes: [],
                ExemptedTaxData: []
            };

            if (collections.INCLUSIVE_TAXES && collections.INCLUSIVE_TAXES.length > 0 && isUS) {

                taxes.InclusiveTaxes.push({
                    type: 'title',
                    name: `${translateService.getText('INCLUSIVE_TAXES')}:`,
                    amount: undefined
                })

                collections.INCLUSIVE_TAXES.forEach(tax => {
                    taxes.InclusiveTaxes.push({
                        type: 'inclusive_tax',
                        name: tax.NAME ? tax.NAME : translateService.getText('INCLUSIVE_TAXES'),
                        amount: utils.toFixedSafe(tax.AMOUNT, 2)
                    })
                })
            }

            if (collections.EXEMPTED_TAXES && collections.EXEMPTED_TAXES.length > 0 && isUS) {

                taxes.ExemptedTaxes.push({
                    type: 'title',
                    name: `${translateService.getText('EXEMPTED_TAXES')}:`,
                    amount: undefined
                })

                collections.EXEMPTED_TAXES.forEach(tax => {
                    taxes.ExemptedTaxes.push({
                        type: 'exempted_tax',
                        name: tax.NAME ? tax.NAME : translateService.getText('EXEMPTED_TAX'),
                        amount: utils.toFixedSafe(tax.AMOUNT, 2)
                    })
                });
            }

            return taxes;

        },
        resolvePaymentName: function (payment) {
            let refund = '';
            let paymentName = '';

            if (payment.PAYMENT_TYPE === 'REFUND') {

                if (payment.TRANS_TYPE === Enums.TransTypes.Reversal) {
                    refund = translateService.getText('REVERSAL');
                }
                else if (payment.TRANS_TYPE === Enums.TransTypes.Return) {
                    refund = translateService.getText('RETURN');
                }
                else {
                    refund = translateService.getText('REFUND');
                }

            }

            if (payment.P_TENDER_TYPE === 'creditCard') {
                paymentName = refund !== '' ? `${refund} (${payment.CARD_TYPE} ${payment.LAST_4})` : `${payment.CARD_TYPE} ${payment.LAST_4}`;
            } else {
                paymentName = `${refund} ${payment.P_NAME}`;
            }

            return paymentName;

        },
        resolvePrintByOrder: function (variables) {

            return translateService.getText('PRINT_BY_ORDER',
                ["order_number", "order_date", "order_time"],
                [variables.ORDER_NO, moment(variables.CREATED_AT).format('DD/MM/YYYY'), moment(variables.CREATED_AT).format('HH:mm:ss')]
            );
        },
        resolveWaiterDiners: function (variables) {

            let DISPLAY_NAME = "";
            if (variables.F_NAME !== undefined) {
                DISPLAY_NAME += variables.F_NAME;
            }

            if (variables.L_NAME !== undefined) {
                DISPLAY_NAME += ` ${variables.L_NAME[0]}`;
            }

            let TABLE_NO = "";
            if (variables.TABLE_NO !== undefined) {
                TABLE_NO = variables.TABLE_NO;
            }

            let RESULT_TEXT = "";

            let _TEXT_WAITER_N_DINERS = translateService.getText('WAITER_DINERS',
                ["waiter", "diners"],
                [`${DISPLAY_NAME}`, variables.NUMBER_OF_GUESTS]
            );

            RESULT_TEXT += _TEXT_WAITER_N_DINERS;

            // if (TABLE_NO !== "") {
            //     let _TEXT_TABLE = translateService.getText('TABLE_NUM',
            //         ["table"],
            //         [TABLE_NO]
            //     );

            //     RESULT_TEXT += ` ${_TEXT_TABLE}`;
            // }

            return RESULT_TEXT;
        }
    }

    function _enrichOrder(tlog, tables, items, users, promotions, allModifiers, tlogId, status) {

        let ResultOrder = {};

        //  Tlog data.
        let _tlogId = tlogId;
        let _tlog = tlog;
        let _status = status;

        //  Resources.
        let _tables = tables;
        let _items = items;
        let _users = users;
        let _promotions = promotions;
        let _allModifiers = allModifiers;


        const courseActions = [
            'notified',
            'fired',
            'served',
            'prepared',
            'taken'
        ];

        /**
         * resolve object Order / Tlog.
         * @param { Object } tlog 
         */
        function _resolveObject(tlog) {
            let _result;
            if (tlog.order === undefined) {
                _result = tlog;
            }
            else {
                _result = tlog.order[0];
            }
            return _result;
        }

        function _resolveId(tlog) {
            return tlog.id || tlog._id;
        }

        /**
         * resolve total cashback
         * @param { Object } ResultOrder 
         */
        function _resolveTotalCashback(payments) {

            let _totalCashback = 0;
            payments.forEach(payment => {
                _totalCashback += _.has(payment, 'auxAmount') ? payment.auxAmount : 0;
            });

            return _totalCashback ? _totalCashback / 100 : 0;;
        }

        function _resolveDinersNum(diners) {
            return diners.length;
        }

        function _resolveTotalAmount(totalAmount) {
            return totalAmount / 100;
        }

        function _resolveClosedDate(closed) {
            return closed;
        }

        function _resolveDeliveryNotes(deliveryNotes, tlogId) {
            if (deliveryNotes) {
                deliveryNotes.forEach(item => {
                    item.tlogId = tlogId;
                    if (item.payments) {
                        item.cardNum = item.payments[0].cardNum;
                        item.providerTransactionId = item.payments[0].providerTransactionId === undefined ? '' : item.payments[0].providerTransactionId;
                        if (item.payments[0].providerResponse) {
                            item.companyName = item.payments[0].providerResponse.companyName === undefined ? '' : item.payments[0].providerResponse.companyName;
                        }
                    }
                });
            }

            return deliveryNotes;
        }

        function _resolveInvoices(invoices, tlogId) {
            if (invoices) {
                invoices.forEach(item => {
                    item.tlogId = tlogId;
                    if (item.payments && item.payments[0]._type === Enums.PaymentTypes.CreditCardPayment) {
                        item.confirmationNum = item.payments[0].confirmationNum === undefined ? '' : item.payments[0].confirmationNum;
                        item.issuerName = item.payments[0].issuer.name === undefined ? '' : item.payments[0].issuer.name;
                        if (item.payments[0].providerResponse) {
                            item.last4 = item.payments[0].providerResponse.Last4;
                            item.CCType = item.payments[0].providerResponse.CCType;
                            item.transId = item.payments[0].providerResponse.TransID;
                        }
                    }
                });
            }

            return invoices;
        }

        function _resolveUserName(user) {
            let _result = 'None';

            if (_users && _users.length > 0) {
                let _user = _users.find(c => c._id === user);
                if (_user) {
                    return `${_user.firstName} ${_user.lastName}`;
                }
            }

            return _result;
        }

        function _resolveUser(user) {

            let _user;
            if (_users && _users.length > 0) {
                _user = _users.find(c => c._id === user);
            }

            if (_user) {
                _user.displayName = _resolveServerName(_user);
            }
            else {
                console.log("missing users");
            }

            return _user;
        }

        function _resolveServerName(user) {
            let _user;
            if (typeof user === "string") {
                _user = _resolveUser(user);
            } else {
                _user = user;
            }

            let result = "";
            if (_user.firstName !== undefined) {
                result += _user.firstName;
            }

            if (_user.lastName !== undefined) {
                result += ` ${_user.lastName[0]}`;
            }

            return result;

        }

        function _resolveClubMembers(order) {
            let _clubMembers = [];

            if (order.diners.length) {
                _clubMembers = _.chain(order.diners)
                    .filter(diner => {
                        if (diner.member) return diner;
                    }).map(diner => {
                        return {
                            firstName: diner.member.firstName,
                            lastName: diner.member.lastName,
                            phone: diner.member.phone
                        }
                    }).value();
            }

            return _clubMembers;
        }

        function _resolveLockedBy(lockedBy) {
            if (lockedBy) {
                return _users.find(user => user._id === lockedBy._id);
            }
        }

        function _resolveOrderedItem(orderedItemId, orderedItems) {
            return orderedItems.find(item => item._id === orderedItemId);
        }

        function _resolveDiscount(orderedItemId, discounts) {
            if (discounts && discounts.length > 0) {
                return discounts.find(c => c.target === orderedItemId);
            }
        }

        function _resolveItem(itemId) {
            return _items.find(c => c._id === itemId);
        }

        function _resolveOrderedOferModifiers(modifiers) {

            let _modifiers = [];
            modifiers.forEach(modifierItem => {
                if (modifierItem.price) {
                    let _modifier = allModifiers.find(modifier => modifier._id === modifierItem.modifier);

                    if (_modifier) {
                        modifierItem.name = _modifier.name;
                        _modifiers.push(modifierItem);
                    }
                }
            });

            return _modifiers;
        }

        function _resolveItemsByOrderedOffers(order) {

            let _orderedOffers = order.orderedOffers;
            let _orderedItems = order.orderedItems;
            let _discounts = order.discounts;

            let items = [];

            if (_orderedOffers) {
                _orderedOffers.forEach(itemOrderedOffer => {

                    if (!itemOrderedOffer.cancellation) {
                        let _item = { name: itemOrderedOffer.name, price: itemOrderedOffer.price, _id: itemOrderedOffer._id };

                        if (itemOrderedOffer.onTheHouse) {
                            _item.onTheHouse = translateService.getText('OTH')
                        }

                        items.push(_item);
                        if (itemOrderedOffer.amount !== itemOrderedOffer.price) {
                            itemOrderedOffer.orderedItems.forEach(orderedItem => {
                                let _orderedItem = _resolveOrderedItem(orderedItem, _orderedItems);
                                let _discount = _resolveDiscount(orderedItem._id, _discounts);

                                if (_discount) {
                                    _orderedItem.discount = _discount;
                                }

                                if (!_orderedItem.price) {
                                    _orderedItem.price = 0;
                                }

                                _orderedItem.item = _resolveItem(_orderedItem.item);
                                if (_orderedItem.item) {
                                    _orderedItem.item.price = _orderedItem.price;
                                    items.push(_orderedItem.item);
                                }

                                _orderedItem.selectedModifiers = _resolveOrderedOferModifiers(_orderedItem.selectedModifiers);
                                if (_orderedItem.selectedModifiers) {
                                    _orderedItem.selectedModifiers.forEach(selectedModifierItem => {
                                        let _discount = _resolveDiscount(_orderedItem._id, _discounts);
                                        if (_discount) {
                                            selectedModifierItem.discount = _discount;
                                        }

                                        items.push({
                                            name: selectedModifierItem.name,
                                            price: selectedModifierItem.price,
                                            type: 'modifier',
                                            _id: selectedModifierItem._id
                                        });
                                    });
                                }

                            });
                        }
                    }
                });
            }

            return {
                items: items,
                orderedOffers: _orderedOffers
            };
        }

        function _resolvePayments(ResultOrder) {

            function addIfNotExists(list, item) {
                if (list.indexOf(item) === -1) {
                    list.push(item);
                }
            }

            let _paymentNameList = [];
            let _payments = ResultOrder.payments;

            if (_payments) {
                if (ResultOrder.onTheHouse) {
                    _paymentNameList.push(Enums.PaymentTypes.OTH);
                } else {

                    _payments.forEach(payment => {

                        switch (payment._type) {
                            case Enums.PaymentTypes.ChargeAccountPayment:
                                addIfNotExists(_paymentNameList, Enums.PaymentTypes.ChargeAccountPayment);
                                break;
                            case Enums.PaymentTypes.CashPayment:
                                addIfNotExists(_paymentNameList, Enums.PaymentTypes.CashPayment);
                                break;
                            case Enums.PaymentTypes.ChequePayment:
                                addIfNotExists(_paymentNameList, Enums.PaymentTypes.ChequePayment);
                                break;
                            case Enums.PaymentTypes.CreditCardPayment:
                                addIfNotExists(_paymentNameList, Enums.PaymentTypes.CreditCardPayment);
                                break;
                            case Enums.PaymentTypes.CashRefund:
                                addIfNotExists(_paymentNameList, Enums.PaymentTypes.CashRefund);
                                break;
                            case Enums.PaymentTypes.ChequeRefund:
                                addIfNotExists(_paymentNameList, Enums.PaymentTypes.ChequeRefund);
                                break;
                            case Enums.PaymentTypes.CreditCardRefund:
                                addIfNotExists(_paymentNameList, Enums.PaymentTypes.CreditCardRefund);
                                break;

                            default:
                                break;
                        }

                    });

                }
            }

            return _paymentNameList.join('+');
        }

        function _resolvePaymentsAmount(payments) {

            payments.forEach(payment => {

                payment.name = payment._type;

                if (payment.customerDetails !== undefined) {
                    payment.holderName = payment.customerDetails.name !== undefined ? payment.customerDetails.name : ''
                }

                if (payment._type === Enums.PaymentTypes.CreditCardRefund ||
                    payment._type === Enums.PaymentTypes.ChargeAccountRefund ||
                    payment._type === Enums.PaymentTypes.CashRefund ||
                    payment._type === Enums.PaymentTypes.ChequeRefund ||
                    payment._type === Enums.PaymentTypes.CreditCardRefund) {
                    payment.amount *= -1;
                }

                payment.methodName = _resolvePaymentMethodName(payment._type, false) + " ";
                if (payment._type === Enums.PaymentTypes.ChargeAccountPayment) {
                    payment.methodName += payment.accountName;
                }

                if (payment._type === Enums.PaymentTypes.ChequeRefund) {
                    payment.accountName = "cheque_refund"
                }
            });

            return payments;
        }

        /**
         * get table number or OrderType (Refund/TA/Delivery)
         * @param {*} orderType 
         * @param {*} tableIds 
         */
        function _resolveTable(orderType, tableIds) {

            let table = "";
            if (orderType === Enums.OrderTypes.Refund) {
                table = translateService.getText('REFUND');
            } else if (orderType === Enums.OrderTypes.TA) {
                table = translateService.getText('TA');
            } else if (orderType === Enums.OrderTypes.Delivery) {
                table = translateService.getText('DELIVERY');
            }
            else {
                if (_tables && _tables.length > 0) {
                    let _table = _tables.find(c => c._id === tableIds[0]);
                    table = _table ? _table.number : '';
                }
            }

            return table;
        }

        //ticket discount
        function _resolveTotalDiscount(rewards) {

            let _totalDiscount = "";
            let _totalDiscountName = "";

            rewards.forEach(reward => {
                let _discount = reward.discount;
                if (_discount) {
                    if (_discount && (!_discount.rewardedResources)) {
                        _totalDiscount = _discount.amount;
                        _totalDiscountName = reward.manual ? translateService.getText('INITIATED_DISCOUNT') : reward.name;
                    }
                }
            });

            return {
                totalDiscount: _totalDiscount,
                totalDiscountName: _totalDiscountName
            }
        }

        function _resolveRewards(rewards, items, orderedDiscounts) {

            let _items = items;
            rewards.forEach(reward => {
                let _item;
                let _discount = reward.discount;

                if (!_discount) {
                    return; // ????????
                }

                if (_discount.rewardedResources && _discount.rewardedResources[0].orderedItem &&
                    _discount.rewardedResources[0].selectedModifier) {
                    //item discount with selected modifiers
                    _item = items.find(c => c._id === discount.rewardedResources[0].selectedModifier);
                    _item.discount = { amount: discount.amount, name: reward.name };
                }
                else if (_discount.rewardedResources && _discount.rewardedResources[0].orderedItem) {
                    //item discount
                    _item = items.find(c => c._id === discount.rewardedResources[0].item);
                    _item.discount = { amount: discount.amount, name: reward.name };
                }
                else if (_discount.rewardedResources && _discount.rewardedResources[0].orderedOffer) {
                    //offer discount
                    _item = items.find(c => c._id === _discount.rewardedResources[0].orderedOffer);
                    if (!reward.name) {
                        let _dis = orderedDiscounts.find(c => c.target === _item._id);
                        if (_dis) {
                            reward.name = translateService.getText('INITIATED_DISCOUNT')
                        }
                    }
                    _item.discount = { amount: _discount.amount, name: reward.name };
                }


                let itemIndex = items.indexOf(c => c._id === _item._id);
                _items[itemIndex] = _item;
            })

            return _items;
        }

        function _resolvePromotion(promotionId) {
            let _promotion = promotions.find(c => c._id === promotionId);
            if (_promotion) {
                return _promotion;
            }
            else {
                return null;
            }
        }

        function _resolvePromotionsData(orderedPromotions, rewards, orderedDiscounts) {

            let orderedPromotionsData = [];

            if ((orderedPromotions && orderedPromotions.length > 0) ||
                (rewards && rewards.length) > 0) {

                orderedPromotions.forEach(orderedPromotionItem => {
                    let _promotion = _resolvePromotion(orderedPromotionItem.promotion);
                    if (_promotion) {
                        _.extend(orderedPromotionItem, _promotion);
                    }
                })

                rewards.forEach(rewardItem => {
                    let _promotion = rewardItem.promotion;
                    let _orderedPromotion = orderedPromotions.find(c => c.promotion == _promotion);

                    if (_orderedPromotion) {
                        orderedPromotionsData.push({ promotionData: _orderedPromotion, discount: rewardItem.discount });
                    } else {
                        let hasValue = false;
                        orderedDiscounts.forEach(item => {
                            let _orderedDiscount = rewardItem.requiredResources.find(c => c.orderedDiscount && c.orderedDiscount === item._id);
                            if (_orderedDiscount) {
                                hasValue = true;
                            }
                        });

                        if (!hasValue) {
                            orderedPromotionsData.push({ promotionData: { name: rewardItem.name }, discount: rewardItem.discount });
                        }
                    }
                });

            }

            return orderedPromotionsData;
        }

        function _resolveOrderedOffers(orderedOffers, orderedItems) {

            let _orderedItems = orderedItems;
            let _allOffersItems = [];

            if (orderedOffers && orderedOffers.length > 0) {
                orderedOffers.forEach(offer => {
                    if (offer.orderedItems.length) {
                        offer.items = [];
                        offer.orderedItems.forEach(item => {
                            let orderedItem = _orderedItems.find(c => c._id === item);
                            if (orderedItem) {
                                offer.items.push(orderedItem);
                                _allOffersItems.push(orderedItem)
                            }
                        })
                    }
                });
            }

            return {
                orderedOffers: orderedOffers,
                allOffersItems: _allOffersItems
            }
        }

        function _resolveCourses(courses, orderedItems) {
            if (courses && courses.length) {
                courses.forEach(course => {
                    courseActions.forEach(action => {

                        if (course[action]) {
                            course[action].waiter = _resolveUserName(course[action].by);
                        }

                        if (course.orderedItems && course.orderedItems.length > 0) {
                            course.items = [];
                            course.orderedItems.forEach(item => {
                                let _orderedItem = orderedItems.find(c => c._id === item);
                                if (_orderedItem) {
                                    course.items.push(_orderedItem);
                                }
                            })
                        }
                    });
                })
            }

            return courses;
        }

        function _resolveOrderedItems(orderedItems, allOffersItems) {

            let cencelledItems = [];
            let unasignedItems = [];

            if (orderedItems && orderedItems.length > 0) {
                orderedItems.forEach(item => {
                    if (item.cancellation) {
                        if (item.cancellation.applied) {
                            item.cancellation.applied.user = _resolveUserName(item.cancellation.applied.by);
                        }

                        if (item.cancellation.approved) {
                            item.cancellation.approved.user = _resolveUserName(item.cancellation.approved.by);
                        }

                        if (item.cancellation.reason) {

                            if (item.cancellation.reason.returnType == Enums.ReturnTypes.Cancellation) { // canceled items
                                item.returnType = translateService.getText('CANCEL')
                            } else { // returned items
                                item.returnType = translateService.getText('RETURN');
                            }
                        }
                        else {
                            console.log('reason object id missing');
                        }

                        cencelledItems.push(item);
                    }
                    else {
                        let inItemInOffer = allOffersItems.find(c => c._id === item._id);
                        if (!inItemInOffer) {
                            unasignedItems.push(item);
                        }
                    }
                })
            }

            return {
                orderedItems: orderedItems,
                cencelledItems: cencelledItems,
                unasignedItems: unasignedItems
            }
        }

        function _resolveOffer(order, reward) {
            let offer = '';
            if (reward && reward.requiredResources && reward.requiredResources[0] && reward.requiredResources[0].orderedOffer) {
                offer = order.orderedOffers.find(item => item._id === reward.requiredResources[0].orderedOffer);
            }
            return offer;
        }

        function _resolvePaymentData(payment) {


            function buildPaymentRow(payment) {

                let result = [];
                let _paymentDetailsText = "";

                let arr = [];
                // 1. Payment Method Name.
                let paymentMethodName = _resolvePaymentMethodName(payment._type, true, ":");
                if (paymentMethodName !== "") {
                    arr.push(paymentMethodName);
                    _paymentDetailsText += paymentMethodName;
                }

                // 2. Payment : Credit Card Brand / Account Name
                if (payment._type === Enums.PaymentTypes.CreditCardPayment || payment._type === Enums.PaymentTypes.CreditCardRefund) {
                    if (payment.creditCardBrand && payment.creditCardBrand !== "") {
                        let value = payment.creditCardBrand;
                        arr.push(value);
                        _paymentDetailsText += `  ${value}`;
                    }

                }
                else if (payment._type === Enums.PaymentTypes.ChargeAccountPayment || payment._type === Enums.PaymentTypes.ChargeAccountRefund) {
                    if (payment.accountName && payment.accountName !== "") {
                        arr.push(payment.accountName);
                        _paymentDetailsText += payment.accountName;
                    }
                }

                // 3. Last 4 Number.
                if (payment.last4 && payment.last4 !== "" && payment.last4 !== "xxxx") {
                    arr.push(payment.last4);
                    _paymentDetailsText += `  ${payment.last4}`;
                }

                // Add array texts of 1, 2 & 3.
                if (arr.length > 0) {
                    let _text = "";
                    arr.forEach(c => _text += "  " + c);
                    result.push({ value: _text });
                }

                // 4. Amount.
                let amount = utils.toFixedSafe(utils.currencyFraction(payment.amount), 2);
                result.push({ key: translateService.getText('AMOUNT'), value: amount });

                // 5. Customer Holder Name.
                let holderName = "";
                if (payment.customerDetails) {
                    if (payment.customerDetails.name && payment.customerDetails.name !== "") {
                        result.push({ key: translateService.getText('CUSTOMER_NAME'), value: payment.customerDetails.name });
                    }
                }

                // 6. Source TabitPay.
                if (payment._type === Enums.PaymentTypes.CreditCardPayment || payment._type === Enums.PaymentTypes.CreditCardRefund) {

                    if (payment.source === Enums.Sources.TabitPay) {
                        let value = "(Tabit Pay)";
                        result.push({ key: 'source', value: value });
                    }
                }

                return result;
            }

            let data = [];
            // let paymentMethodName = _resolvePaymentMethodName(payment._type, false)
            // if (paymentMethodName !== "") {
            //     data.push({ value: paymentMethodName });
            // }
            let paymentDetails = buildPaymentRow(payment);
            paymentDetails.forEach(c => data.push(c));
            return data;
        }

        function _resolvePaymentMethodName(key, addSpace, addChar) {

            let paymentsHash = {
                oth: translateService.getText('OTH'),
                ChargeAccountPayment: translateService.getText('CHARGE_ACCOUNT'),
                CashPayment: translateService.getText('CASH'),
                GiftCard: translateService.getText('GIFT_CARD'),
                GiftCardLoad: translateService.getText('GIFT_CARD_LOAD'),
                ChequePayment: translateService.getText('CHEQUE'),
                CreditCardPayment: translateService.getText('CREDIT'),
                ChargeAccountRefund: translateService.getText('CHARGE_ACCOUNT_REFUND'),
                CashRefund: translateService.getText('CASH_REFUND'),
                ChequeRefund: translateService.getText('CHEQUE_REFUND'),
                CreditCardRefund: translateService.getText('CREDIT_REFUND'),
            }

            let result = "";
            if (key === "CreditCardPayment") {
                result = "";
            }
            else {
                result = paymentsHash[key];
                if (addChar === undefined) { addChar = "-" }
                if (addSpace) { result += " " + addChar + " "; }
            }

            return result;
        }

        //  Time Line.
        function _resolveOpenedTimeToTimeLine(order) {
            return {
                action: translateService.getText('OPEN'),
                data: translateService.getText('ORDER'),
                at: order.created,
                by: order.waiter
            }
        }

        function _resolveClosedTimeToTimeLine(order) {
            return {
                action: translateService.getText('CLOSE'),
                data: translateService.getText('ORDER'),
                at: order.closed,
                by: '' // can't determine who closed order
            }
        }

        function _resolveCourseToTimeLine(order) {
            let result = [];
            order.courses.forEach(course => {
                courseActions.forEach(action => {
                    if (_.has(course, action) && course[action]) {
                        result.push({
                            action: action + ' ' + course.courseType,
                            data: _.map(course.items, item => item.name).join(', '),
                            at: course[action].at,
                            by: course[action].waiter
                        })
                    }
                });
            });
            return result;
        }

        function _resolvePaymentsToTimeLine(order) {
            let result = [];
            order.payments.forEach(payment => {
                result.push({
                    action: translateService.getText('PAYMENT'),
                    data: _resolvePaymentData(payment), // Return array of values.
                    at: payment.lastUpdated,
                    by: _resolveUserName(payment.user),
                    recordType: "payment" //only for the payments record in the time line.
                });
            });
            return result;
        }

        function _resolveOrderOTH(order) {

            let result = [];
            let data;
            // add order oth
            if (order.onTheHouse) {

                data = order.onTheHouse.reason.name;
                if (order.onTheHouse.comment) {
                    data += ': ' + order.onTheHouse.comment;
                }

                // OTH request
                result.push({
                    action: translateService.getText('OTH_ORDER_APPLIED'),
                    data: data,
                    at: order.onTheHouse.applied.at,
                    by: _resolveUserName(order.onTheHouse.applied.by)
                });

                // OTH approved
                if (order.onTheHouse.approved) {
                    result.push({
                        action: translateService.getText('OTH_ORDER_APPROVED'),
                        data: data,
                        at: order.onTheHouse.applied.at,
                        by: _resolveUserName(order.onTheHouse.applied.by)
                    });
                }
            }

            return result;

        }

        function _resolveOTHByOrderdItem(order, item, timeline) {

            let result = [];
            let data = "";

            if (item.onTheHouse.reason.name) {
                data += item.onTheHouse.reason.name;
            }

            if (item.onTheHouse.comment) {
                data += " : " + item.onTheHouse.comment;
            }

            if (item.name) {
                data += " - " + item.name;
            }

            if (timeline) { //add to discount time line
                if (item.onTheHouse.approved) {

                    let _offer = order.orderedOffers.find(offer => offer.offer === item.offer);

                    // resolving for timeline format.
                    result.push({
                        discountType: Enums.DiscountTypes.OTH,
                        discountAmount: _offer ? _offer.amount : 0,
                        reason: {
                            name: data,
                            othType: item.onTheHouse.reason && item.onTheHouse.reason.othType ? translateService.getText('OTH_TYPE_' + item.onTheHouse.reason.othType.toUpperCase()) : ''
                        },
                    });
                }
            }
            else {

                // OTH request
                result.push({
                    action: translateService.getText('OTH_ITEM_APPLIED'),
                    data: data,
                    at: item.onTheHouse.applied.at,
                    by: _resolveUserName(item.onTheHouse.applied.by)
                });
                // OTH approved
                if (item.onTheHouse.approved) {
                    result.push({
                        action: translateService.getText('OTH_ITEM_APPROVED'),
                        data: data,
                        at: item.onTheHouse.approved.at,
                        by: _resolveUserName(item.onTheHouse.approved.by)
                    });
                }

            }

            return result;
        }

        function _resolveOrderTypeDisplayText(orderType) {
            return translateService.getText('ORDER_TYPES_' + orderType.toUpperCase());
        }

        function _resolveCancellationsAndOTHToTimeLine(order) {

            let result = [];
            let data;
            order.orderedItems.forEach(item => {
                data = "";
                if (item.cancellation) {
                    let _reasonName = "";
                    if (item.cancellation.reason) {
                        _reasonName = item.cancellation.reason.name;
                    }

                    data = item.name + ' - ' + _reasonName;
                    if (item.cancellation.comment) {
                        data += ': ' + item.cancellation.comment;
                    }
                    if (item.cancellation.reason && item.cancellation.reason.returnType == 'cancellation') {
                        // cancellation request
                        result.push({
                            action: translateService.getText('CANCEL_ITEM_APPLIED'),
                            data: data,
                            at: item.cancellation.applied.at,
                            by: _resolveUserName(item.cancellation.applied.by)
                        });
                        // cancellation approved
                        if (item.cancellation.approved) {
                            result.push({
                                action: translateService.getText('CANCEL_ITEM_APPROVED'),
                                data: data,
                                at: item.cancellation.approved.at,
                                by: _resolveUserName(item.cancellation.approved.by)
                            });
                        }
                    } else {
                        // return request
                        result.push({
                            action: translateService.getText('RETURN_ITEM_APPLIED'),
                            data: data,
                            at: item.cancellation.applied.at,
                            by: _resolveUserName(item.cancellation.applied.by)
                        });
                        // return approved
                        if (item.cancellation.approved) {
                            result.push({
                                action: translateService.getText('RETURN_ITEM_APPROVED'),
                                data: data,
                                at: item.cancellation.approved.at,
                                by: _resolveUserName(item.cancellation.approved.by)
                            })
                        }
                    }
                }

                if (item.onTheHouse && !order.onTheHouse) {
                    let OTHByOrderdItem = _resolveOTHByOrderdItem(order, item);
                    OTHByOrderdItem.forEach(c => result.push(c));
                }

            });

            let orderOTHs = _resolveOrderOTH(order);
            orderOTHs.forEach(item => { result.push(item); });

            return result;
        }

        function _resolveOrderedDiscountsToTimeLine(order) {

            let orderedDiscounts = order.orderedDiscounts;
            let rewards = order.rewards;

            let result = [];
            if (orderedDiscounts.length) {
                let rewardsHash = {};
                rewards.forEach(reward => {
                    if (reward.requiredResources) {
                        reward.requiredResources.forEach(item => {
                            if (item.orderedDiscount) {
                                rewardsHash[item.orderedDiscount] = reward;
                            }
                        })
                    }
                });

                orderedDiscounts.forEach(discount => {
                    let reward = rewardsHash[discount._id];
                    let offer = _resolveOffer(order, reward);
                    let data;
                    let action;
                    let reasonName = discount.reason !== undefined ? discount.reason.name : "--";

                    if (reward && reward._type) {
                        switch (reward._type) {
                            case 'PercentOffOrder':
                                action = translateService.getText('PERCENT_OFF_ORDER') + ' ' + reward.discount.percentage + '%';
                                data = reasonName;
                                break;

                            case 'AmountOffOrder':
                                action = translateService.getText('AMOUNT_OFF_ORDER') + ' ' + reward.discount.amount / 100;
                                data = reasonName;
                                break;

                            case 'PercentOff':
                                action = translateService.getText('PERCENT_OFF_ITEM') + ' ' + reward.discount.percentage + '%';
                                data = offer.name + ' - ' + reasonName;
                                break;

                            case 'AmountOff':
                                action = translateService.getText('AMOUNT_OFF_ORDER') + ' ' + reward.discount.amount / 100;
                                data = offer.name + ' - ' + reasonName;
                                break;
                        }
                    }
                    else {
                        if (discount && discount.discountType)
                            switch (discount.discountType) {
                                case "percent": {
                                    action = translateService.getText('PERCENT_OFF_ORDER') + ' ' + discount.value + '%';
                                    data = reasonName;
                                    break;
                                }
                                case "amount": {
                                    action = translateService.getText('AMOUNT_OFF_ORDER') + ' ' + discount.value / 100;
                                    data = reasonName;
                                    break;
                                }
                            }
                    }

                    if (reward && reward.discount && reward.discount.amount)
                        discount.discountAmount = reward.discount.amount;

                    if (discount.comment) {
                        data += ': ' + discount.comment;
                    }

                    result.push({
                        action: action,
                        data: data,
                        at: discount.applied.at,
                        by: _resolveUserName(discount.applied.by)
                    });
                });
            }

            return result;
        }

        function _resolveSegmentationsToTimeLine(order) {
            let result = [];
            if (order.segmentations.length > 0) {
                order.segmentations.forEach(segment => {
                    result.push({
                        action: translateService.getText('APPLIED_SEGMENTATION'),
                        data: segment.name,
                        at: segment.applied.at,
                        by: _resolveUserName(segment.applied.by)
                    })

                    if (segment.approved) {
                        result.push({
                            action: translateService.getText('APPROVED_SEGMENTATION'),
                            data: segment.name,
                            at: segment.approved.at,
                            by: _resolveUserName(segment.approved.by)
                        })
                    }
                });
            }
            return result;
        }

        function _resolveHistoriesToTimeLine(order) {
            let result = [];
            if (order.history && order.history.length > 0) {
                order.history.forEach(historyItem => {
                    result.push({
                        action: historyItem.action, // $translate.instant(`ORDERS_VIEW.${historyItem.action}`), // ??????????
                        data: `Device name: ${historyItem.deviceName}`,
                        at: historyItem.at,
                        by: _resolveUserName(historyItem.by)
                    });
                });
            }
            return result;
        }

        function _resolveTimeline(order) {


            let timeline = [];
            timeline.push(_resolveOpenedTimeToTimeLine(order));
            timeline.push(_resolveClosedTimeToTimeLine(order));

            let courses = _resolveCourseToTimeLine(order);
            courses.forEach(item => { timeline.push(item); });

            let payments = _resolvePaymentsToTimeLine(order);
            payments.forEach(item => { timeline.push(item); });

            let cancellationsAndOTH = _resolveCancellationsAndOTHToTimeLine(order);
            cancellationsAndOTH.forEach(item => { timeline.push(item); });

            let orderedDiscounts = _resolveOrderedDiscountsToTimeLine(order);
            orderedDiscounts.forEach(item => timeline.push(item));

            let segmentations = _resolveSegmentationsToTimeLine(order);
            segmentations.forEach(item => timeline.push(item));

            let histories = _resolveHistoriesToTimeLine(order);
            histories.forEach(item => timeline.push(item));

            timeline = _.sortBy(timeline, 'at');
            return timeline;

        }

        function _resolveOrderedDiscountsTimeLine(order) {

            let result = [];

            order.orderedDiscounts.forEach(item => {
                item.reason.othType = item.reason && item.reason.othType ? translateService.getText('OTH_TYPE_' + item.reason.othType.toUpperCase()) : ''
                result.push(item);
            });

            let data;
            if (!order.onTheHouse) {
                order.orderedItems.forEach(item => {
                    data = "";
                    if (item.onTheHouse && !order.onTheHouse) {
                        let OTHByOrderdItem = _resolveOTHByOrderdItem(order, item, true);
                        OTHByOrderdItem.forEach(c => result.push(c));
                    }
                });
            }
            else {

                data = order.onTheHouse.reason.name;
                if (order.onTheHouse.comment) {
                    data += ': ' + order.onTheHouse.comment;
                }

                result.push({
                    discountType: Enums.DiscountTypes.OTH,
                    discountAmount: "",
                    reason: {
                        name: data,
                        othType: order.onTheHouse.reason && order.onTheHouse.reason.othType ? translateService.getText('OTH_TYPE_' + order.onTheHouse.reason.othType.toUpperCase()) : ''
                    },

                });
            }

            return result;
        }

        function _resolvePaymentsTimeLine(order) {

            let PaymentRecord = function (payment) {
                this.methodName = payment.methodName;
                this.creditCardBrand = payment.creditCardBrand;
                this.customerName = payment.customerDetails ? payment.customerDetails.name : '';
                this.last4 = payment.last4 !== 'xxxx' ? payment.last4 : ''
                this.amount = payment.amount;
                this.faceValue = payment.faceValue;
                this.tipAmount = payment.change ? payment.change.amount : '';
                this.quantity = payment.auxIntent ? payment.auxIntent.quantity : ''; //auxIntent.quantity

                if (payment.source === Enums.Sources.TabitPay) {
                    this.source = "(Tabit Pay)";
                }
            }

            let result = [];
            order.payments.forEach(payment => {
                result.push(new PaymentRecord(payment));
            });
            return result;
        }


        ResultOrder = _resolveObject(_tlog);
        ResultOrder.tlogId = _resolveId(_tlog);
        ResultOrder.totalCashback = _resolveTotalCashback(ResultOrder.payments);
        ResultOrder.dinersNum = _resolveDinersNum(ResultOrder.diners);
        ResultOrder.totalAmount = _resolveTotalAmount(_tlog.totalAmount);
        ResultOrder.closed = _resolveClosedDate(ResultOrder.closed);
        ResultOrder.deliveryNotes = _resolveDeliveryNotes(ResultOrder.deliveryNotes, ResultOrder.tlogId);
        ResultOrder.invoices = _resolveInvoices(ResultOrder.invoices, ResultOrder.tlogId);
        ResultOrder.waiter = _resolveUserName(ResultOrder.openedBy);
        ResultOrder.openedBy = _resolveUser(ResultOrder.openedBy);
        ResultOrder.owner = _resolveUser(ResultOrder.owner);
        ResultOrder.clubMembers = _resolveClubMembers(ResultOrder);
        ResultOrder.lockedBy = _resolveUser(ResultOrder.lockedBy);
        ResultOrder.orderTypeDisplayText = _resolveOrderTypeDisplayText(ResultOrder.orderType);

        let ItemsByOrderedOffersResult = _resolveItemsByOrderedOffers(ResultOrder);  // merge function #1
        ResultOrder.orderedOffers = ItemsByOrderedOffersResult.orderedOffers;
        ResultOrder.items = ItemsByOrderedOffersResult.items;

        ResultOrder.paymentName = _resolvePayments(ResultOrder);
        ResultOrder.payments = _resolvePaymentsAmount(ResultOrder.payments);
        ResultOrder.table = _resolveTable(ResultOrder.orderType, ResultOrder.tableIds);
        ResultOrder.items = _resolveRewards(ResultOrder.rewards, ResultOrder.items, ResultOrder.orderedDiscounts); // update discount name and discount amount fot each item thet have discount.

        let TotalDiscountResult = _resolveTotalDiscount(ResultOrder.rewards);
        ResultOrder.totalDiscount = TotalDiscountResult.totalDiscount;
        ResultOrder.totalDiscountName = TotalDiscountResult.totalDiscountName;
        ResultOrder.orderedPromotionsData = _resolvePromotionsData(ResultOrder.orderedPromotions, ResultOrder.rewards, ResultOrder.orderedDiscounts);

        let OrderedOffersResult = _resolveOrderedOffers(ResultOrder.orderedOffers, ResultOrder.orderedItems); // merge function #1
        ResultOrder.orderedOffers = OrderedOffersResult.orderedOffers;
        ResultOrder.allOffersItems = OrderedOffersResult.allOffersItems;
        ResultOrder.courses = _resolveCourses(ResultOrder.courses, ResultOrder.orderedItems);

        let OrderedItemsResult = _resolveOrderedItems(ResultOrder.orderedItems, ResultOrder.allOffersItems);
        ResultOrder.orderedItems = OrderedItemsResult.orderedItems;
        ResultOrder.cencelledItems = OrderedItemsResult.cencelledItems;
        ResultOrder.unasignedItems = OrderedItemsResult.unasignedItems;

        //Time line
        let Timeline = _resolveTimeline(ResultOrder);
        ResultOrder.timeline = Timeline;

        let OrderedDiscountsTimeLine = _resolveOrderedDiscountsTimeLine(ResultOrder);
        ResultOrder.discountsTimeLine = OrderedDiscountsTimeLine;

        let PaymentsTimeLine = _resolvePaymentsTimeLine(ResultOrder);
        ResultOrder.PaymentsTimeLine = PaymentsTimeLine;

        return ResultOrder;

    }

    function _resolveBillCheck(printCheck) {

        let CheckBill = function (collections, variables, data, printByOrder, waiterDiners) {
            this.collections = collections;
            this.variables = variables;
            this.data = data;
            this.print_by_order = printByOrder;
            this.waiter_diners = waiterDiners;
        }

        let collections = printCheck.printData.collections;
        let variables = printCheck.printData.variables;

        if (collections.PAYMENT_LIST.length === 0) {
            return;
        }

        let data = {};

        let _details = billService.resolveItems(variables, collections);

        data.items = _details.items;
        data.oth = _details.oth;
        data.isReturnOrder = _details.isReturnOrder;
        data.isTaxExempt = _details.isTaxExempt;

        let _totals = billService.resolveTotals(variables, collections, true)
        data.totals = _totals;

        let _payments = billService.resolvePayments(variables, collections, true);
        data.payments = _payments;

        let _taxes = billService.resolveTaxes(variables, collections, true);
        data.taxes = _taxes;

        let printByOrder = billService.resolvePrintByOrder(variables);
        let waiterDiners = billService.resolveWaiterDiners(variables);

        let checkBill = new CheckBill(collections, variables, data, printByOrder, waiterDiners);
        return checkBill;
    }

    function _resolveBillData(printBill, isUS) {

        let DataBill = function (collections, variables, data, printByOrder, waiterDiners) {
            this.collections = collections;
            this.variables = variables;
            this.data = data;
            this.print_by_order = printByOrder;
            this.waiter_diners = waiterDiners;
        }

        let collections = printBill.printData.collections;
        let variables = printBill.printData.variables;

        let data = {};

        let _details = billService.resolveItems(variables, collections);

        data.items = _details.items;
        data.oth = _details.oth;
        data.isReturnOrder = _details.isReturnOrder;
        data.isTaxExempt = _details.isTaxExempt;

        let _totals = billService.resolveTotals(variables, collections, true)
        data.totals = _totals;
        let _payments = billService.resolvePayments(variables, collections, true);
        data.payments = _payments;

        let _taxes = billService.resolveTaxes(variables, collections, true);
        data.taxes = _taxes;

        data.isUS = isUS;

        let printByOrder = billService.resolvePrintByOrder(variables);
        let waiterDiners = billService.resolveWaiterDiners(variables);


        return new DataBill(collections, variables, data, printByOrder, waiterDiners);
    }

    OrderViewService.prototype.TimeLine = { enrichOrder: _enrichOrder };

    OrderViewService.prototype.Bill = {
        resolveBillCheck: _resolveBillCheck,
        resolveBillData: _resolveBillData
    };

    return OrderViewService;


}());



