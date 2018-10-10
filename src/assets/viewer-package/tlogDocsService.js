'use strict'

const TlogDocsService = (function () {

    var _options = {}


    var $translate;
    var $templateBuilder;
    var _utils;
    var _isUS;
    // var _tlog;
    // var _docData;


    const Enums = {
        DOC_TYPES: {
            INVOICE: "invoice",
            REFUND_INVOICE: "refundInvoice"
        },
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
        }
    }

    function printTlog(_tlog) {
        // console.log('THIS IS TLOG:' + _tlog);
    }

    function TlogDocsService(options) {

        _configure(options);

        $translate = new TlogDocsTranslateService({
            local: options.local
        });
    }

    function _configure(options) {
        if (options.local) _options.local = options.local;
        if (options.isUS !== undefined) {
            _options.isUS = options.isUS;
            _isUS = options.isUS;
        };

        if (options.moment) {
            moment = options.moment;
        }
        else {
            moment = window.moment;
        }

        //utils = new OfficeDocsUtils();
    }

    //Create the Buttons
    function orderTypesListCreator(tlog, billData, isClosedOrder) {
        //the array of orders for use of the buttons or other needs
        var orderSelection = [];
        debugger;
        //the type tlog is made for the template builder service which returns regular bill
        if (!isClosedOrder) {
            orderSelection.push({
                tlogId: '',
                id: 'openOrder',
                type: 'tlog',
                title: $translate.getText('order') + ' ',
                ep: '',
                isRefund: false,
                isFullOrder: false,
            });
        }
        else {

            orderSelection.push({
                tlogId: tlog._id,
                id: tlog._id,
                type: tlog._type,
                title: $translate.getText('order') + ' ' + tlog.number,
                ep: `tlogs/${tlog._id}/bill`,
                isRefund: false,
                isFullOrder: true,
            });

            if (tlog.order[0].clubMembers && tlog.order[0].clubMembers.length) {
                orderSelection.push({
                    tlogId: tlog._id,
                    id: tlog._id,
                    type: tlog._type,
                    title: $translate.getText('clubMembers'),
                    ep: `documents/v2/${doc._id}/printdata`,
                    isRefund: false
                });
            }
            if (tlog.order[0].checks && tlog.order[0].checks.length > 1) {


                //set check in split check to 'orderOptions' (the option btns on the PopupBill)
                tlog.order[0].checks.forEach(check => {

                    let paymentId = check.payments[0].paymentId;
                    orderSelection.push({
                        tlogId: tlog._id,
                        id: check._id,
                        type: 'check',
                        title: $translate.getText('CHECK') + ` ${check.number}`, //$translate.getText('CHECK') + ` ${check.variables.CHECK_NO}`,
                        ep: `tlogs/${tlog._id}/checks`,
                        md: {
                            paymentId: paymentId,
                            checkNumber: check.number
                        }
                    });
                });
            }

            if (_isUS) {
                var _tlog = tlog;


                billData.collections.PAYMENT_LIST.forEach(payment => {
                    var paymentForSignature;

                    var typeTitle = "";
                    if (payment.P_TENDER_TYPE === 'creditCard') typeTitle = $translate.getText('CreditSlip');
                    if (payment.P_TENDER_TYPE === 'giftCard') typeTitle = $translate.getText('GiftCardCreditSlip');

                    if (payment.P_TENDER_TYPE === 'creditCard' || payment.P_TENDER_TYPE === 'giftCard') {
                        _tlog.order[0].allDocuments.forEach(doc => {
                            doc.payments.forEach(p => {
                                if (p._id === payment.P_ID) {
                                    paymentForSignature = p;
                                }
                            }
                            )
                        })
                        payment.PAYMENT_NUMBER = `${tlog.order[0].number}/${payment.NUMBER}`;
                        orderSelection.push({
                            tlogId: tlog._id,
                            id: payment.P_ID,
                            type: payment.P_TENDER_TYPE,
                            title: typeTitle + "-" + payment.PAYMENT_NUMBER,
                            ep: `documents/v2/${payment._id}/printdata`,
                            md: {
                                paymentId: payment.P_ID,
                                signature: paymentForSignature.customerSignature ? paymentForSignature.customerSignature.data : null
                            },
                            docPaymentType: (payment.P_TENDER_TYPE ? payment.P_TENDER_TYPE : ''),
                            isRefund: payment.P_TENDER_TYPE.includes('Refund')
                        });
                    }
                })
            }

            //     var paymentList;

            //     tlog.order[0].allDocuments.forEach(doc => {
            //         paymentList = doc.payments;
            //         paymentList.forEach(payment => {
            //             var typeTitle;
            //             if (payment.tenderType === 'creditCard') typeTitle = $translate.getText('CreditSlip');
            //             else if (payment.tenderType === 'giftCard') typeTitle = $translate.getText('GiftCardCreditSlip');
            //             debugger;
            //             if (payment.tenderType === 'creditCard' || payment.tenderType === 'giftCard') {
            //                 payment.constractedNumber = `${tlog.order[0].number}/${payment.number}`;
            //                 orderSelection.push({
            //                     tlogId: tlog._id,
            //                     id: doc._id,
            //                     type: doc._type,
            //                     title: typeTitle + "-" + payment.constractedNumber,
            //                     ep: `documents/v2/${doc._id}/printdata`,
            //                     docPaymentType: (payment._type ? payment._type : ''),
            //                     isRefund: payment._type.includes('Refund'),
            //                     md: {
            //                         paymentId: payment._id,
            //                     }
            //                 });
            //             }

            //         })
            //     })
            // }



            //         // Check for Errors wehn getting the signature
            //         if (payment.SIGNATURE_CAPTURED) {
            //             orderOptions.forEach(orderOption => {
            //                 if (orderOption.view === "CreditCardSlip" && orderOption.data.P_ID === payment.P_ID) {

            //                     let paymentData = $ctrl.selectedOrder.payments.find(c => c._id === payment.P_ID)
            //                     let signatureData = paymentData.customerSignature;

            //                     orderOption.data.signature = {
            //                         view: 'signature',
            //                         data: signatureData.data,
            //                         format: signatureData.format
            //                     }
            //                 }
            //             })

            //         }


            //     })
            // }

            if (!_isUS) {


                if (tlog.order) {
                    if (tlog.order[0].allDocuments && tlog.order[0].allDocuments.length > 0) {
                        tlog.order[0].allDocuments.forEach(doc => {

                            switch (doc._type) {

                                case Enums.DOC_TYPES.INVOICE: {
                                    orderSelection.push({
                                        tlogId: tlog._id,
                                        id: doc._id,
                                        type: doc._type,
                                        title: $translate.getText('invoice_number') + doc.number,
                                        ep: `documents/v2/${doc._id}/printdata`,
                                        docPaymentType: (doc.payments[0]._type ? doc.payments[0]._type : ''),
                                        isRefund: false
                                    });
                                    break;
                                }

                                case Enums.DOC_TYPES.REFUND_INVOICE: {
                                    if (doc.payments[0]._type === 'ChequeRefund' ||
                                        doc.payments[0]._type === 'CashRefund' ||
                                        doc.payments[0]._type === 'CreditCardRefund') {
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: doc._id,
                                            type: doc._type,
                                            title: $translate.getText('credit_invoice_number') + doc.number,
                                            ep: `documents/v2/${doc._id}/printdata`,
                                            docPaymentType: doc.payments[0]._type,
                                            isRefund: true
                                        });

                                        break;
                                    }
                                }
                                case 'deliveryNote': {
                                    if (doc.payments[0]._type === 'ChargeAccountPayment') {
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: doc._id,
                                            type: doc._type,
                                            title: $translate.getText('delivery_note_number') + doc.number,
                                            ep: `documents/v2/${doc._id}/printdata`,
                                            docPaymentType: doc.payments[0]._type,
                                            isRefund: doc._type.includes('refund')
                                        });


                                        break;
                                    }
                                }
                                case 'refundDeliveryNote': {
                                    if (doc.payments[0]._type === 'ChargeAccountRefund') {
                                        orderSelection.push({
                                            tlogId: tlog._id,
                                            id: doc._id,
                                            type: doc._type,
                                            title: $translate.getText('refund_note_number') + doc.number,
                                            ep: `documents/v2/${doc._id}/printdata`,
                                            docPaymentType: doc.payments[0]._type,
                                            isRefund: doc._type.includes('refund')
                                        });
                                        break;
                                    }
                                }
                            }


                        })

                    }


                }
            }
            console.log('orderSelection');
            console.log(orderSelection);
        }
        return orderSelection;

    }

    // let getPrintDocs = function (tlog) {
    //     _docsArray = printDocsCreator(tlog);
    //     docsArray = _docsArray;
    //     return docsArray;
    // }


    //create the data for the documents list

    function getDocs(tlog, billData, isClosedOrder) {
        let docsArray;

        let _billService = new BillService(_options);
        let _enrichPrintData = _billService.resolvePrintData({
            collections: billData.printData.collections,
            variables: billData.printData.variables
        }, _options._isUS);

        docsArray = orderTypesListCreator(tlog, _enrichPrintData, isClosedOrder);

        printTlog(JSON.stringify(tlog));

        return docsArray;

    }

    function getTemplate(docObj, docData, billData) {

        var template;

        //_printData = printData;

        let documentType = docData.documentType;
        $templateBuilder = new TemplateBuilderService(_options)

        template = $templateBuilder.createHTMLFromPrintDATA(docObj, docData, billData)

        return template;
    }


    TlogDocsService.prototype.getDocs = (tlog, billData, isClosedOrder) => getDocs(tlog, billData, isClosedOrder);
    TlogDocsService.prototype.getTemplate = (docObj, docData, billData) => getTemplate(docObj, docData, billData);

    return TlogDocsService;

})();

