'use strict'
let TemplateBuilderService = (function () {

    var _options = {}

    var $translate;
    var $utils;
    var _billService
    var _docData;
    var _docObj;
    var _printData;
    var _isUS;
    var _doc;
    var _local;

    function TemplateBuilderService(options) {
        _configure(options);

        if (options && options.local) {
            _local = options.local

        }
        else {
            _local = 'he-IL';
        }

        $translate = new TlogDocsTranslateService({
            local: options.local
        });

        $utils = new TlogDocsUtils();


        var cssStyling = `
        .templateDiv{
            background-color:white;
        }
        `
        var doc = document.implementation.createHTMLDocument("BillTemplate");

        _doc = doc;

        var styleTag = _doc.createElement('style');
        styleTag.id = 'styleTag'
        _doc.head.appendChild(styleTag);
        var styleContent = _doc.createTextNode(cssStyling)

        styleTag.appendChild(styleContent);
    }

    function _configure(options) {
        if (options.local) _options.local = options.local;
        if (options.isUS !== undefined) {
            _options.isUS = options.isUS;
            _isUS = options.isUS;
            if (options.local === 'en-US') {
                _options.isUS = true;
            }
        };

        if (options.moment) {
            moment = options.moment;
        }
        else {
            moment = window.moment;
        }

    }

    //create document for export 
    function createHTMLFromPrintDATA(docObj, docData, billData) {

        // Setting UP
        let isRefund = docObj.isRefund;

        // setting global variables
        _docObj = docObj;
        _docData = docData;

        //bill servuce for converting prnt data to collections, variables and data
        _billService = new BillService(_options);
        _printData = _billService.resolvePrintData(docData.printData, _isUS)
        _printData.isRefund = isRefund;

        //create basic document template the function create doc template returns a docTemplate with all its children
        var docTemplate = createDocTemplate(docObj, billData);
        _doc.body.appendChild(docTemplate);

        //******************  setting styling Try - delete when finished  ******************//
        // var htmlString = docTemplate.outerHTML;
        // _doc.getElementById('templateDiv').style.fontFamily = "Courier New, Courier, monospace";
        //******************************************************//

        // sending the doc
        var docToAdd = _doc;
        var htmlString = new XMLSerializer().serializeToString(docToAdd);
        return htmlString

    }

    function createDocTemplate(docTypeChosen, billData) {
        //create a template for the document and give it id 
        var docTemplate = _doc.createElement('div');
        docTemplate.id = 'docTemplate';
        docTemplate.classList.add('basicTemplate');

        //set language and locals
        if (_local == 'he-IL') {
            docTemplate.classList.add('rtl')
            docTemplate.classList.remove('ltr')
        }
        else {
            docTemplate.classList.add('ltr')
            docTemplate.classList.remove('rtl')
        }

        //create document header
        var templateHeader = createHeader(_printData);
        docTemplate.appendChild(templateHeader);

        var checkInIL;
        if (_local == 'he-IL' && docTypeChosen.documentType === 'check') {
            checkInIL = true;
        }


        var isCreditSlip = (docTypeChosen.md && docTypeChosen.type === 'creditCard' && !docTypeChosen.isFullOrder && !docTypeChosen.md.checkNumber && !checkInIL)

        if (isCreditSlip !== null && isCreditSlip) {
            var tplCreditSlipTemplate = createCreditSlip(_printData, docTypeChosen);
            docTemplate.appendChild(tplCreditSlipTemplate);
        }
        else {
            //create a general template content
            var tplOrderPaymentData = createOrderPaymentData(_printData);
            var tplOrderTotals = createTotalsData(_printData, billData);
            var tplOrderPayments = createPaymentsData(_printData);

            tplOrderPaymentData.id = 'tplOrderPaymentData';
            tplOrderTotals.id = 'tplOrderTotals';
            tplOrderPayments.id = 'tplOrderPayments';

            //adding styling to the template divs
            tplOrderPaymentData.hasChildNodes() ? tplOrderPaymentData.classList += ' body-div' : '';
            tplOrderTotals.hasChildNodes() ? tplOrderTotals.classList += ' body-div tpl-body-div' : '';
            tplOrderPayments.hasChildNodes() ? tplOrderPayments.classList += ' body-div tpl-body-div' : '';

            //set body main divs
            docTemplate.appendChild(tplOrderPaymentData);
            tplOrderTotals.hasChildNodes() ? docTemplate.appendChild(tplOrderTotals) : null;
            tplOrderPayments.hasChildNodes() ? docTemplate.appendChild(tplOrderPayments): null;

        }
        return docTemplate;
    }

    //header creator
    function createHeader(printData) {
        //creating a div to populate and return
        var headerDiv = _doc.createElement('div');
        headerDiv.id = "headerDiv";


        //setting header constants div for display
        var tplHeaderConstants = _doc.createElement('div');
        tplHeaderConstants.id = "tplHeaderConstants"
        tplHeaderConstants.classList += ' rowPadding';
        // setting constants
        let headerKeys = [
            'ORGANIZATION_NAME',
            'ORGANIZATION_LEGAL_NAME',
            'ORGANIZATION_ADDR_STREET',
            'ORGANIZATION_ADDR_CITY',
            'ORGANIZATION_TEL'
        ];

        headerKeys.forEach(element => {
            var constantLine = placeHeaderData(printData, element)
            tplHeaderConstants.appendChild(constantLine)
        })

        //inner function for placing the constants on the template with data
        function placeHeaderData(printData, element) {
            var tplHeaderLine = _doc.createElement('div');
            tplHeaderLine.id = 'tplHeaderLine';
            if (printData.variables.hasOwnProperty(element)) {

                switch (element) {
                    case 'ORGANIZATION_NAME': {
                        tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_NAME;
                        tplHeaderLine.classList += ' big-chars';
                    }
                        break;
                    case 'ORGANIZATION_LEGAL_NAME': {
                        if (!_isUS) {
                            var bnNumber = $translate.getText('BN_NUMBER');
                            var orgString = printData.variables.ORGANIZATION_LEGAL_NAME + "-" + bnNumber + " " + printData.variables.ORGANIZATION_BN_NUMBER;
                            tplHeaderLine.innerHTML = orgString;
                        }
                        else {
                            tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_LEGAL_NAME
                        }
                    }
                        break;
                    case 'ORGANIZATION_ADDR_STREET': {
                        tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_ADDR_STREET;
                    }
                        break;
                    case 'ORGANIZATION_ADDR_CITY': {
                        tplHeaderLine.innerHTML = printData.variables.ORGANIZATION_ADDR_CITY;
                    }
                        break;
                    case 'ORGANIZATION_TEL': {
                        var phoneTranslate = $translate.getText('PHONE');
                        var phoneString = phoneTranslate + " " + printData.variables.ORGANIZATION_TEL;
                        tplHeaderLine.innerHTML = phoneString;
                    }
                        break;

                }
            }
            return tplHeaderLine;

        }

        var tplHeader = _doc.createElement('div');
        tplHeader.id = 'tplHeader';
        tplHeader.setAttribute('style', "text-align:center;")
        tplHeader.classList += ' rowPadding'
        var orderHeader = createOrderHeader(printData);
        orderHeader.id = 'orderHeader';
        orderHeader.classList += ' rowPadding'

        var tplOrderInfoText = createOrderInfoText(printData);
        tplOrderInfoText.id = 'tplOrderInfoText';

        tplHeader.appendChild(tplHeaderConstants);
        tplHeader.appendChild(orderHeader);
        tplHeader.appendChild(tplOrderInfoText);


        headerDiv.appendChild(tplHeader);
        //styling the header
        headerDiv.classList.add('header-div');
        headerDiv.classList.add('header-border');

        return headerDiv;
    }

    function createOrderHeader(printData) {
        //Bring the tplOrderHeader for appending other divs to it
        var tplOrderHeader = _doc.createElement('div');
        tplOrderHeader.id = 'tplOrderHeader';
        //all order header needed Divs
        var tplOrderCustomer = _doc.createElement('div');
        tplOrderCustomer.id = "tplOrderCustomer";
        var tplOrderDateTime = _doc.createElement('div');
        tplOrderDateTime.id = "tplOrderDateTime";
        tplOrderDateTime.classList.add('mystyle');
        var tplOrderTitle = _doc.createElement('div');
        tplOrderTitle.id = "tplOrderTitle";
        var tplOrderType = _doc.createElement('div');
        tplOrderType.id = "tplOrderType";
        tplOrderType.setAttribute('style', 'text-align:center;')
        var tplOrderTable = _doc.createElement('div');
        tplOrderTable.id = "tplOrderTable";
        var tplOrderServerClients = _doc.createElement('div');
        tplOrderServerClients.id = "tplOrderServerClients";
        //create array for the appendChildren function
        var orderBasicInfoArray = [tplOrderCustomer, tplOrderDateTime, tplOrderTitle, tplOrderType, tplOrderTable, tplOrderServerClients,];

        var filledInfoArray = [];
        placeOrderHeaderData(printData, orderBasicInfoArray)

        function placeOrderHeaderData(printData, array) {
            array.forEach(element => {
                var singleElement = fillOrderHeaderData(printData, element)
                filledInfoArray.push(singleElement);

            });
        }

        var tplOrderHeaderReturn = appendChildren(tplOrderHeader, filledInfoArray)

        return tplOrderHeaderReturn;

    }

    function fillOrderHeaderData(printData, htmlElement) {

        switch (htmlElement.id) {
            case 'tplOrderCustomer': {
                if (printData.variables.CUSTOMER_ID) {
                    var forText = $translate.getText("FOR");
                    var BnOrSnText = $translate.getText("BN_OR_SN");
                    var customerName = printData.collections.PAYMENT_LIST[0].CUSTOMER_NAME;
                    var customerId = printData.collections.PAYMENT_LIST[0].CUSTOMER_ID;
                    htmlElement.innerText = forText + ": " + customerName + " " + BnOrSnText + ": " + customerId;
                }
            }
                break;

            case 'tplOrderDateTime': {
                if (printData.variables.CREATED_AT) {
                    var dateStr = printData.variables.CREATED_AT;
                    if (_isUS) htmlElement.innerHTML = formatDateUS(dateStr);

                    else if (!_isUS) {
                        htmlElement.innerHTML = formatDateIL(dateStr);
                    }
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            case 'tplOrderTitle': {
                if (_docObj.title) {
                    htmlElement.innerHTML = _docObj.title;
                    htmlElement.setAttribute('class', 'med-chars');
                }
            }
                break;
            case 'tplOrderType': {
                if (printData.variables.ORDER_TYPE) {
                    var typeTranslate = $translate.getText("ORDER_TYPE")
                    var orderType = "ORDER_TYPES_" + printData.variables.ORDER_TYPE;
                    var typeDataTranslate = $translate.getText(orderType);
                    htmlElement.innerHTML = "<div><span>" + typeTranslate + " " + typeDataTranslate + "</span>" + "<span> #" + printData.variables.ORDER_NO + "</span></div>"
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            case 'tplOrderTable': {
                if (printData.variables.ORDER_TYPE === "SEATED" && printData.variables.TABLE_NO) {
                    var tableTranslate = $translate.getText("table")
                    htmlElement.innerHTML = tableTranslate + " " + printData.variables.TABLE_NO;
                    htmlElement.setAttribute('class', 'med-chars');

                }
            }
                break;
            case 'tplOrderServerClients': {
                if (!(_docData.documentType === ("invoice" || "deliveryNote"))) {
                    var waiterTranslate = $translate.getText("Server")
                    var dinersTranslate = $translate.getText("Diners")
                    var firstName = printData.variables.F_NAME && printData.variables.F_NAME !== null ? printData.variables.F_NAME : '';
                    var lastName = printData.variables.L_NAME && printData.variables.L_NAME !== null ? printData.variables.L_NAME : '';
                    htmlElement.innerHTML = `<span> ` + waiterTranslate + ": " + firstName + " " + lastName.substring(0, 1) + " - " + dinersTranslate + ": " + printData.variables.NUMBER_OF_GUESTS + `</span>`;
                }
            }
                break;

        }
        return htmlElement;

    }

    function createOrderInfoText(printData) {
        var tplOrderInfoText = _doc.createElement('div');
        tplOrderInfoText.id = 'tplOrderInfoText';
        //check if  all the order  is OTH and prints if it is

        if (printData.variables.ORDER_ON_THE_HOUSE === "1") {
            var allOrderOthTextDiv = _doc.createElement('div');
            allOrderOthTextDiv.id = "";
            allOrderOthTextDiv.innerHTML = $translate.getText('ALL_ORDER_OTH');
            tplOrderInfoText.appendChild(allOrderOthTextDiv);
        }
        //check if this is a retrun order and prints if it is
        if (printData.data.isReturnOrder) {
            var isReturnOrderTextDiv = _doc.createElement('div');
            isReturnOrderTextDiv.id = "isReturnOrderTextDiv";
            isReturnOrderTextDiv.innerHTML = $translate.getText('RETURN_TRANSACTION');
            tplOrderInfoText.appendChild(isReturnOrderTextDiv);
            //return order comment
            if (printData.variables.RETURN_COMMENT) {
                var returnOrderCommentDiv = _doc.createElement('div');
                returnOrderCommentDiv.id = "returnOrderCommentDiv";
                returnOrderCommentDiv.innerHTML = printData.variables.RETURN_COMMENT;
                tplOrderInfoText.appendChild(returnOrderCommentDiv);
            }
        }
        //check if this is order is tax exempted  and prints if it is
        if (printData.data.isTaxExempt) {
            if (printData.variables.TAX_EXEMPTION_CODE) {
                var isTaxExemptCodeDiv = _doc.createElement('div');
                isTaxExemptCodeDiv.id = "isTaxExemptCodeDiv";
                isTaxExemptCodeDiv.innerHTML = printData.variables.TAX_EXEMPTION_CODE;
                tplOrderInfoText.appendChild(isTaxExemptCodeDiv);
            }
            if (printData.variables.TAX_EXEMPTION_COMMENT) {
                var isTaxExemptCodeDiv = _doc.createElement('div');
                isTaxExemptCodeDiv.id = "isTaxExemptCodeDiv";
                isTaxExemptCodeDiv.innerHTML = printData.variables.TAX_EXEMPTION_COMMENT;
                tplOrderInfoText.appendChild(isTaxExemptCodeDiv);
            }
        }

        return tplOrderInfoText;
    }

    function createOrderPaymentData(printData) {

        var tplOrderPaymentData = _doc.createElement('div');
        let data = _billService.resolveItems(printData.variables, printData.collections);
        tplOrderPaymentData.classList += ' tpl-body-div';
        var paymentDataDiv = _doc.createElement('div');
        paymentDataDiv.id = "paymentDataDiv";
        paymentDataDiv.classList += ' padding-top';
        paymentDataDiv.classList += ' padding-bottom';


        tplOrderPaymentData.appendChild(paymentDataDiv);

        if (_docObj && !(_docData.documentType === "deliveryNote")) {
            fillItemsData(paymentDataDiv, data, printData);
            fillOthData(paymentDataDiv, data);
        }
        else if (_docObj && _docData.documentType === "deliveryNote") {
            fillItemsData(paymentDataDiv, data, printData);
            fillOthData(paymentDataDiv, data);
            var delNoteTransDiv = createDeliveryNoteTransactionData(printData);
            tplOrderPaymentData.appendChild(delNoteTransDiv);
        }
        return tplOrderPaymentData
    }

    function fillItemsData(htmlElement, data, printData) {

        if (!printData.isRefund) {
            data.items.forEach(item => {
                var itemDiv = _doc.createElement('div');
                if (item.isOffer) {
                    itemDiv.classList.add("bold");
                    item.space = "";
                }
                else if (!item.isOffer) {
                    itemDiv.classList.add("itemDiv");
                    item.qty = '&nbsp;&nbsp;';
                    item.space = "&emsp;";
                }
                itemDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='item-qty'>" + (item.qty ? item.qty : " ") + "</div>" + " " +
                    "<div class='item-name'>" + item.space + "" + (item.name ? item.name : "") + "</div>" + " " +
                    "<div class='total-amount " + isNegative(item.amount) + "'>" + (item.amount ? item.amount : "") + "</div>" +
                    "</div>"

                htmlElement.appendChild(itemDiv);

            })
        }

        // if (printData.isRefund) {
        //     var vat = {};
        //     vat.TOTAL_EX_VAT = printData.variables.TOTAL_EX_VAT;
        //     vat.TOTAL_INCLUDED_TAX = printData.variables.TOTAL_INCLUDED_TAX;
        //     vat.TOTAL_IN_VAT = printData.variables.TOTAL_IN_VAT;
        //     vat.ITEM_AMOUNT = printData.variables.TOTAL_AMOUNT;

        //     var refundText = null;
        //     var vatItemHeaderDiv = _doc.createElement('div')

        //     var refundTranslate = $translate.getText('return');
        //     vatItemHeaderDiv.classList.add("bold");
        //     refundText = refundTranslate;

        //     vat.ITEM_AMOUNT = printData.variables.TOTAL_AMOUNT;
        //     vatItemHeaderDiv.innerHTML = "<div class='itemDiv'>" +
        //         "<div class='item-name'>" + (!(refundText === null) ? refundText : "") +
        //         "<div class='item-amount " + isNegative(vat.ITEM_AMOUNT) + "'>" + (vat.ITEM_AMOUNT ? vat.ITEM_AMOUNT : "") + "</div>" +
        //         "</div>"
        //     htmlElement.appendChild(vatItemHeaderDiv);
        //     createVatDataTemplate(htmlElement, vat, false);
        // }

    }

    function isNegative(amount) {
        var intAmount = parseInt(amount);
        return intAmount < 0 ? 'negative' : "";

    }

    function fillOthData(htmlElement, data) {
        data.oth.forEach(othItem => {
            var othItemDiv = _doc.createElement('div');
            if (othItem.isOffer) {
                othItemDiv.classList.add("bold");
                othItem.space = "";

            }
            else if (!othItem.isOffer) {
                othItem.id = "singleOthDiv"
                othItem.qty = '&nbsp;&nbsp;';
                othItem.space = "&emsp;";
            }


            othItemDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='item-qty'>" + (othItem.qty ? othItem.qty : " ") + "</div>" + " " +
                "<div class='item-name'>" + othItem.space + (othItem.name ? othItem.name : "") + "</div>" + " " +
                "<div class='total-amount " + isNegative(othItem.amount) + "'>" + (othItem.amount ? othItem.amount : "") + "</div>" +
                "</div>"

            htmlElement.appendChild(othItemDiv);

        })
    }


    function createVatTemplate(printData) {
        var vatTemplate = _doc.createElement('div');
        vatTemplate.id = "vatTemplate";
        var vatHeaderDiv = _doc.createElement('div');
        vatHeaderDiv.id = "vatHeaderDiv"
        let vat = {}
        if (printData.collections.DOCUMENT_ITEMS && printData.collections.DOCUMENT_ITEMS.length > 0) {
            vat = printData.collections.DOCUMENT_ITEMS;
            vat.forEach(item => {
                var refundText = null;
                var buisnessMealText = null;
                var totalAmountText = null;
                //check if refun, if does add  refund text
                if (printData.isRefund) {
                    var refundTranslate = $translate.getText('refund')
                    vatHeaderDiv.classList.add("bold");
                    refundText = refundTranslate;
                }
                //else, if not refund but multi doc, add buisness meal text
                else if (!printData.isRefund && printData.variables.ORDER_DOCUMENT_PRINT === 'MULTI_DOC') {
                    var buisnessMealTranslate = $translate.getText('BUSINESS_MEAL');
                    vatHeaderDiv.classList.add("bold");
                    buisnessMealText = buisnessMealTranslate;
                }
                //else, if not refund but single doc, add buisness meal text
                else if (!printData.isRefund && printData.variables.ORDER_DOCUMENT_PRINT === 'SINGLE_DOC') {
                    var totalAmountTranslate = $translate.getText('TOTAL_AMOUNT');
                    vatHeaderDiv.classList.add("bold");
                    totalAmountText = totalAmountTranslate;
                }

                vatHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(refundText === null) ? refundText : "") + (buisnessMealText ? buisnessMealText : "") + (totalAmountText ? totalAmountText : "") + "</div>" + " " +
                    "<div class='total-amount " + isNegative(item.ITEM_AMOUNT) + "'>" + (item.ITEM_AMOUNT ? Number(item.ITEM_AMOUNT).toFixed(2) : "") + "</div>" +
                    "</div>"
                vatTemplate.appendChild(vatHeaderDiv);

            })

            createVatDataTemplate(vatTemplate, vat, true)

        }
        else {
            var refundText = null;
            var buisnessMealText = null;
            var totalAmountText = null;
            if (printData.isRefund) {
                var refundTranslate = $translate.getText('refund');
                vatHeaderDiv.classList.add("bold");
                refundText = refundTranslate;
            }
            //else, if not refund but multi doc, add buisness meal text
            else if (!printData.isRefund && printData.variables.ORDER_DOCUMENT_PRINT === 'MULTI_DOC') {

                var buisnessMealTranslate = $translate.getText('BUSINESS_MEAL');
                vatHeaderDiv.classList.add("bold");
                buisnessMealText = buisnessMealTranslate;
            }
            //else, if not refund but single doc, add buisness meal text
            else if (!printData.isRefund && printData.variables.ORDER_DOCUMENT_PRINT === 'SINGLE_DOC') {
                var totalAmountTranslate = $translate.getText('TOTAL_AMOUNT');
                vatHeaderDiv.classList.add("bold");
                totalAmountText = totalAmountTranslate;
            }
            vat.TOTAL_EX_VAT = printData.variables.TOTAL_EX_VAT;
            vat.TOTAL_INCLUDED_TAX = printData.variables.TOTAL_INCLUDED_TAX;
            vat.VAT_PERCENT = printData.variables.VAT_PERCENT;
            vat.TOTAL_IN_VAT = printData.variables.TOTAL_IN_VAT;
            vat.ITEM_AMOUNT = printData.variables.TOTAL_AMOUNT;
            vatHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(refundText === null) ? refundText : "") + (buisnessMealText ? buisnessMealText : "") + (totalAmountText ? totalAmountText : "") + "</div>" + " " +
                "<div class='total-amount " + isNegative(vat.ITEM_AMOUNT) + "'>" + (vat.ITEM_AMOUNT ? Number(vat.ITEM_AMOUNT).toFixed(2) : "") + "</div>" +
                "</div>"

            vatTemplate.appendChild(vatHeaderDiv);

            createVatDataTemplate(vatTemplate, vat, false)

        }

        return vatTemplate;

    }

    function createVatDataTemplate(htmlElement, vat, isMulti) {

        var vatDataDiv = _doc.createElement('div');
        vatDataDiv.id = "vatDataDiv";


        vatDataDiv.classList += " padding-bottom";
        vatDataDiv.classList += " padding-top";
        vatDataDiv.classList += " tpl-body-div";


        var beforeVatTranslate = $translate.getText('BEFORE_VAT');
        var vatTranslate = $translate.getText('VAT');
        var includeVatTranslate = $translate.getText('INCLUDE_VAT');

        var beforeVatDiv = _doc.createElement('div');
        var vatTextDiv = _doc.createElement('div');
        var includeVatDiv = _doc.createElement('div');

        if (isMulti) {
            beforeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (vat[0].ITEM_AMOUNT_EX_VAT ? beforeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + isNegative(vat[0].ITEM_AMOUNT_EX_VAT) + "'>" + (vat[0].ITEM_AMOUNT_EX_VAT ? Number(vat[0].ITEM_AMOUNT_EX_VAT).toFixed(2) : "") + "</div>" +
                "</div>";

            vatTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (vat[0].ITEM_VAT_PERCENT ? vatTranslate : "") + " " + (vat[0].ITEM_VAT_PERCENT) + "%" + "</div>" + " " +
                "<div class='total-amount " + isNegative(vat[0].ITEM_VAT_AMOUNT) + "'>" + (vat[0].ITEM_VAT_AMOUNT ? vat[0].ITEM_VAT_AMOUNT : "") + "</div>" +
                "</div>";


            includeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (vat[0].ITEM_AMOUNT ? includeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + isNegative(vat[0].ITEM_AMOUNT) + "'>" + (vat[0].ITEM_AMOUNT ? Number(vat[0].ITEM_AMOUNT).toFixed(2) : "") + "</div>" +
                "</div>";

        }
        else {

            beforeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (vat.TOTAL_EX_VAT ? beforeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + isNegative(vat.TOTAL_EX_VAT) + "'>" + (vat.TOTAL_EX_VAT ? Number(vat.TOTAL_EX_VAT).toFixed(2) : "") + "</div>" +
                "</div>";

            vatTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (vat.TOTAL_INCLUDED_TAX ? vatTranslate : "") + " " + vat.VAT_PERCENT + "%" + "</div>" + " " +
                "<div class='total-amount " + isNegative(vat.TOTAL_INCLUDED_TAX) + "'>" + (vat.TOTAL_INCLUDED_TAX ? vat.TOTAL_INCLUDED_TAX : "") + "</div>" +
                "</div>";

            includeVatDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (vat.TOTAL_IN_VAT ? includeVatTranslate : "") + "</div>" + " " +
                "<div class='total-amount " + isNegative(vat.TOTAL_IN_VAT) + "'>" + (vat.TOTAL_IN_VAT ? Number(vat.TOTAL_IN_VAT).toFixed(2) : "") + "</div>" +
                "</div>";
        }

        vatDataDiv.appendChild(beforeVatDiv);
        vatDataDiv.appendChild(vatTextDiv);
        vatDataDiv.appendChild(includeVatDiv);

        htmlElement.appendChild(vatDataDiv);


    }



    function createCreditTemplate(printData) {
        var CreditTemplate = _doc.createElement('div');
        CreditTemplate.id = "CreditTemplate";
        var CreditHeaderDiv = _doc.createElement('div');
        CreditHeaderDiv.id = "CreditHeaderDiv";
        let credPayments = {}
        if (printData.collections.CREDIT_PAYMENTS && printData.collections.CREDIT_PAYMENTS.length > 0) {
            credPayments = printData.collections.CREDIT_PAYMENTS[0];

            var retrunedCredFromText = null;
            var paidCredFromText = null;
            var issuer = credPayments.ISSUER
            var paymentAmount = credPayments.P_AMOUNT;
            //check if refun, if does   refund text
            if (printData.isRefund) {
                var retrunedCredFromTranslate = $translate.getText('RETURNED_IN_CREDIT_FROM')
                CreditHeaderDiv.classList.add("bold");
                retrunedCredFromText = retrunedCredFromTranslate;
                CreditHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(retrunedCredFromText === null) ? retrunedCredFromText : "") + " " + (issuer ? issuer : "") + "</div>" + " " +
                    "<div class='total-amount " + isNegative(paymentAmount) + "'>" + (paymentAmount ? Number(paymentAmount).toFixed(2) : "") + "</div>" +
                    "</div>"
                CreditTemplate.appendChild(CreditHeaderDiv);

            }
            else {
                var paidCredFromTranslate = $translate.getText('PAID_IN_CREDIT_FROM')
                CreditHeaderDiv.classList.add("bold");
                paidCredFromText = paidCredFromTranslate;
                CreditHeaderDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (!(paidCredFromText === null) ? paidCredFromText : "") + " " + (issuer ? issuer : "") + "</div>" + " " +
                    "<div class='total-amount " + isNegative(paymentAmount) + "'>" + (paymentAmount ? Number(paymentAmount).toFixed(2) : "") + "</div>" +
                    "</div>"
                CreditTemplate.appendChild(CreditHeaderDiv);
            }


            var creditDataTemplate = createCreditDataTemplate(credPayments, printData)
            CreditTemplate.appendChild(creditDataTemplate)

        }
        return CreditTemplate;
    }

    function createCreditDataTemplate(creditData, printData) {
        var creditDataDiv = _doc.createElement('div');
        creditDataDiv.id = "creditDataDiv";
        if (creditData) {

            var lastFourText = $translate.getText(creditData.LAST_4 ? 'LAST_4' : "");
            var transactTimeText = $translate.getText(creditData.PROVIDER_PAYMENT_DATE ? 'TRANSACTION_TIME' : "");
            var transactNumText = $translate.getText(creditData.PROVIDER_TRANS_ID ? 'TRANSACTION_NO' : "");
            var approvalText = $translate.getText(creditData.CONFIRMATION_NUMBER ? 'APPROVAL_NO' : "");
            var cashBackText = $translate.getText(printData.variables.CHANGE ? 'TOTAL_CASHBACK' : "");

            var lastFourDiv = _doc.createElement('div');
            if (lastFourText) {
                lastFourDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (lastFourText ? lastFourText : " ")
                    + " " + (creditData.LAST_4 ? creditData.LAST_4 : " ") + "</div>"
            }
            creditDataDiv.appendChild(lastFourDiv);

            var dateTimeStr = creditData.PROVIDER_PAYMENT_DATE;
            var dateTimeResult;
            var transactionTimeDiv = _doc.createElement('div')
            if (_isUS) dateTimeResult = formatDateUS(dateTimeStr);
            else if (!_isUS) {
                dateTimeResult = formatDateIL(dateTimeStr);
            }
            transactionTimeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (transactTimeText ? transactTimeText : "") + " " + (transactTimeText ? dateTimeResult : "") + "</div>" +
                "</div>"

            creditDataDiv.appendChild(transactionTimeDiv);

            var transactNumDiv = _doc.createElement('div');
            if (creditData.PROVIDER_TRANS_ID) {
                transactNumDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (transactNumText ? transactNumText : " ") +
                    " " + (creditData.PROVIDER_TRANS_ID ? creditData.PROVIDER_TRANS_ID : " ") + "</div>" + "</div>"
            }
            creditDataDiv.appendChild(transactNumDiv);

            var approvalDiv = _doc.createElement('div');
            if (creditData.CONFIRMATION_NUMBER) {
                approvalDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (approvalText ? approvalText : " ") + " " + (creditData.CONFIRMATION_NUMBER ? creditData.CONFIRMATION_NUMBER : " ") + "</div>" + "</div>"

                creditDataDiv.appendChild(approvalDiv);

            }

            var cashBackDiv = _doc.createElement('div');
            if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
                cashBackDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (cashBackText ? cashBackText : " ") + "</div>" +
                    "<div class='total-amount'>" + (printData.collections.PAYMENT_LIST[0].P_AMOUNT ? printData.collections.PAYMENT_LIST[0].P_AMOUNT : " ") + "</div>"
                    + "</div >"
                creditDataDiv.appendChild(cashBackDiv);
            }
        }

        return creditDataDiv

    }

    function createTotalsData(printData, billData) {
        var tplOrderTotals = _doc.createElement('div');
        tplOrderTotals.id = 'tplOrderTotals';
        tplOrderTotals.hasChildNodes() ? tplOrderTotals.classList += ' tpl-body-div' : '';
        // let data = _billService.resolveItems(printData.variables, printData.collections);

        var taxDataDiv = addTaxData(printData);
        if (taxDataDiv !== null) { tplOrderTotals.appendChild(taxDataDiv); }

        if (_docObj && (_docData.documentType ===
            ('invoice' || 'CreditCardPayment' || 'CreditCardRefund' || 'CashPayment' || 'GiftCard' || 'CashRefund' || 'ChequePayment' || 'ChequeRefund'))) {
            var vatTemplateDiv = createVatTemplate(printData);
            tplOrderTotals.appendChild(vatTemplateDiv);
        }
        else if (_docObj && (_docData.documentType === 'deliveryNote')) {
            return tplOrderTotals
        }
        else {
            var OrderTotalsDiv = _doc.createElement('div');
            OrderTotalsDiv.id = "OrderTotalsDiv";
            tplOrderTotals.appendChild(OrderTotalsDiv);
            OrderTotalsDiv.hasChildNodes() ? OrderTotalsDiv.classList += " tpl-body-div" : '';

            fillOrderTotals(OrderTotalsDiv, printData, billData);
        }
        return tplOrderTotals
    }

    function fillOrderTotals(htmlElement, printData, billData) {
        if (printData.data.totals.length > 0) {

            // if (!_isUS) {
            printData.data.totals.forEach(total => {
                var totalDiv = _doc.createElement('div');
                if (total.type === 'exclusive_tax') {
                    totalDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='total-name'>" + "&nbsp;&nbsp;" + (total.name ? total.name : " ") + (total.rate ? total.rate + " &nbsp;%" : " ") + "</div>" + " " +
                        "<div class='total-amount " + isNegative(total.amount) + "'>" + (total.amount ? total.amount : " ") +
                        "</div>" +
                        "</div>"
                }
                else if (total.type !== 'exclusive_tax') {
                    totalDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='total-name'>" + (total.name ? total.name : " ") + "</div>" + " " +
                        "<div class='total-amount " + isNegative(total.amount) + "'>" + (total.amount ? total.amount : " ") + "</div>" +
                        "</div>"
                }

                htmlElement.appendChild(totalDiv);
            })
            // }
            // else {
            //     var exclusiveTaxes = (printData.collections.EXCLUSIVE_TAXES && printData.collections.EXCLUSIVE_TAXES.length > 0) ? printData.collections.EXCLUSIVE_TAXES : null;
            //     var totalDiv = _doc.createElement('div');
            //     var subtotalDiv = _doc.createElement('div');
            //     subtotalDiv.id = 'subtotalDiv';
            //     subtototal = (exclusiveTaxes !== null && exclusiveTaxes[0].TAXABLE_AMOUNT) ? exclusiveTaxes[0].TAXABLE_AMOUNT : null;
            //     subTotalText = $translate.getText('TAXABLE_AMOUNT');
            //     if (subtototal) {
            //         subtotalDiv.innerHTML = "<div class='itemDiv'>" +
            //             "<div class='total-name'>" + (subTotalText ? subTotalText : " ") + "</div>" + " " +
            //             "<div class='total-amount " + isNegative(subtototal) + "'>" + (subtototal ? subtototal : " ") + "</div>" +
            //             "</div>"
            //     }
            //     totalDiv.appendChild(subtotalDiv);
            //     var exclusiveTaxDiv = _doc.createElement('div');
            //     exclusiveTaxDiv.id = 'exclusiveTaxDiv';
            //     exclusiveTax = (exclusiveTaxes !== null && exclusiveTaxes[0].AMOUNT) ? exclusiveTaxes[0].AMOUNT : null;
            //     exclusiveText = $translate.getText('SALES_TAX');
            //     if (exclusiveTax) {
            //         totalDiv.innerHTML = "<div class='itemDiv'>" +
            //             "<div class='total-name'>" + (exclusiveTax.name ? exclusiveTax.name : " ") + "</div>" + " " +
            //             "<div class='total-amount " + isNegative(exclusiveTax) + "'>" + (exclusiveTax ? exclusiveTax : " ") + "</div>" +
            //             "</div>"
            //     }
            //     // var tipDiv = _doc.createElement('div');
            //     // tipDiv.id = 'tipDiv';
            //     // tip = (exclusiveTaxes !== null && exclusiveTaxes[0].AMOUNT) ? exclusiveTaxes[0].AMOUNT : null;
            //     // exclusiveText = $translate.getText('SALES_TAX');
            //     // if (exclusiveTax) {
            //     //     totalDiv.innerHTML = "<div class='itemDiv'>" +
            //     //         "<div class='total-name'>" + (exclusiveTax.name ? exclusiveTax.name : " ") + "</div>" + " " +
            //     //         "<div class='total-amount " + isNegative(exclusiveTax) + "'>" + (exclusiveTax ? exclusiveTax : " ") + "</div>" +
            //     //         "</div>"
            //     // }
            //     htmlElement.appendChild(totalDiv);

            // }
        }
    }

    function addTaxData(printData) {

        var taxDataDiv = null;

        if (
            (printData.data.taxes.InclusiveTaxes.length > 0 || printData.data.taxes.InclusiveTaxes[0] !== undefined) ||
            (printData.data.taxes.ExemptedTaxes.length > 0 || printData.data.taxes.ExemptedTaxes[0] !== undefined)
        ) {

            taxDataDiv = _doc.createElement('div');
            taxDataDiv.id = 'taxDataDiv';

            if (printData.data.totals && printData.data.totals.length > 0) {
                printData.data.totals.forEach(total => {
                    var totalItemDiv = _doc.createElement('div');
                    totalItemDiv.id = 'totalItemDiv';
                    totalItemDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='total-name'>" + (total.name ? total.name : " ") + total.rate + "%" + "</div>" + " " +
                        "<div class='total-amount " + isNegative(total.amount) + "'>" + (total.amount ? Number(total.amount).toFixed(2) : " ") + "</div>" +
                        "</div>"
                    taxDataDiv.appendChild(totalItemDiv)
                }
                )
            }


            if (printData.data.payments && printData.data.payments.length > 0) {
                printData.data.payments.forEach(payment => {
                    var paymentItemDiv = _doc.createElement('div');
                    paymentItemDiv.id = 'paymentItemDiv';
                    paymentItemDiv.innerHTML = "<div class='itemDiv'>" +
                        "<div class='payment-name'>" + (payment.name ? payment.name : " ") + "</div>" + " " +
                        "<div class='payment-amount " + isNegative(payment.amount) + "'>" + (payment.amount ? Number(payment.amount).toFixed(2) : " ") + "</div>" +
                        "</div><div class='itemDiv'>" + payment.holderName + "</div > ";

                    taxDataDiv.appendChild(paymentItemDiv)
                })
            }


            if (printData.data.taxes.InclusiveTaxes && printData.data.taxes.InclusiveTaxes.length > 0 ||
                printData.data.taxes.ExemptedTaxes && printData.data.taxes.ExemptedTaxes.length > 0) {
                if (printData.data.taxes.InclusiveTaxes.length > 0) {
                    printData.data.taxes.InclusiveTaxes.forEach(incTax => {
                        var incTaxItemDiv = _doc.createElement('div');
                        incTaxItemDiv.id = 'incTaxItemDiv';
                        incTaxItemDiv.innerHTML = "<div class='itemDiv'>" +
                            "<div class='incTax-name'>" + (incTax.name ? incTax.name : " ") + "</div>" + " " +
                            "<div class='incTax-amount " + isNegative(incTax.amount) + "'>" + (incTax.amount ? Number(incTax.amount).toFixed(2) : " ") + "</div>" +

                            taxDataDiv.appendChild(incTaxItemDiv)
                    })
                }
                if (printData.data.taxes.ExemptedTaxes.length > 0) {
                    printData.data.taxes.ExemptedTaxes.forEach(exmTax => {
                        var exmTaxItemDiv = _doc.createElement('div');
                        exmTaxItemDiv.id = 'exmTaxItemDiv';
                        exmTaxItemDiv.innerHTML = "<div class='itemDiv'>" +
                            "<div class='incTax-name'>" + (exmTax.name ? exmTax.name : " ") + "</div>" + " " +
                            "<div class='incTax-amount " + isNegative(exmTax.amount) + "'>" + (exmTax.amount ? Number(exmTax.amount).toFixed(2) : " ") + "</div>" +

                            taxDataDiv.appendChild(exmTaxItemDiv)
                    })
                }
            }
            return taxDataDiv;

        }

        return null;

    }

    function createDeliveryNoteTransactionData(printData) {

        var deliveryNoteTransactionDiv = _doc.createElement('div');
        deliveryNoteTransactionDiv.id = 'deliveryNoteTransactionDiv';

        var deliveryVat = createVatTemplate(printData)
        deliveryVat.id = 'deliveryVat';

        deliveryVat.classList += ' padding-bottom';
        deliveryVat.classList += ' padding-top';
        deliveryVat.classList += ' tpl-body-div';

        deliveryNoteTransactionDiv.appendChild(deliveryVat);

        var hAccountPayments;
        if (printData.collections.HOUSE_ACCOUNT_PAYMENTS[0]) {
            hAccountPayments = printData.collections.HOUSE_ACCOUNT_PAYMENTS[0];
        }
        var dNoteChargeAccntDiv = _doc.createElement('div');
        dNoteChargeAccntDiv.id = 'dNoteChargeAccntDiv';
        if (printData.isRefund === true) {

            var returnText = $translate.getText('RETURND_IN_CHARCHACCOUNT_FROM')
            var refundTextDiv = _doc.createElement('div')
            refundTextDiv.id = "refundTextDiv";
            refundTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (hAccountPayments ? returnText + " " + hAccountPayments.CHARGE_ACCOUNT_NAME : "") + "</div>" +
                "<div class='total-amount " + isNegative(hAccountPayments.P_AMOUNT) + "'>" + (hAccountPayments.P_AMOUNT ? hAccountPayments.P_AMOUNT : "") + "</div>" +
                "</div>";

            refundTextDiv.classList += " padding-bottom";
            refundTextDiv.classList += " padding-top";
            refundTextDiv.classList += " tpl-body-div";

            dNoteChargeAccntDiv.appendChild(refundTextDiv);


        }
        else if (!printData.isRefund && hAccountPayments && hAccountPayments.P_AMOUNT) {
            var returnText = $translate.getText('PAID_IN_CHARCHACCOUNT_FROM')
            var refundTextDiv = _doc.createElement('div')
            refundTextDiv.id = 'refundTextDiv';
            refundTextDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (hAccountPayments ? returnText + " " + hAccountPayments.CHARGE_ACCOUNT_NAME : "") + "</div>" +
                "<div class='total-amount " + isNegative(hAccountPayments.P_AMOUNT) + "'>" + (hAccountPayments.P_AMOUNT ? Number(hAccountPayments.P_AMOUNT).toFixed(2) : "") + "</div > " +
                "</div>";

            refundTextDiv.classList += " padding-bottom";
            refundTextDiv.classList += " padding-top";
            refundTextDiv.classList += " tpl-body-div";

            dNoteChargeAccntDiv.appendChild(refundTextDiv);

        }
        if (hAccountPayments) {

            if (hAccountPayments.P_CHANGE > 0) {
                var cashBackText = $translate.getText('TOTAL_CASHBACK')
                var cashBackDiv = _doc.createElement('div')
                cashBackDiv.id = "cashBackDiv";
                cashbackDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (hAccountPayments ? cashBackText : "") + "</div>" +
                    "<div class='total-amount " + isNegative(hAccountPayments.P_CHANGE) + "'>" + (hAccountPayments.P_CHANGE ? Number(hAccountPayments.P_CHANGE).toFixed(2) : "") + "</div>" +
                    "</div>";

                dNoteChargeAccntDiv.appendChild(cashBackDiv);
            }

            if (hAccountPayments.PROVIDER_TRANS_ID) {
                var providerTransText = $translate.getText('PROVIDER_TRANS_ID')
                var providerTransDiv = _doc.createElement('div');
                providerTransDiv.id = "providerTransDiv";
                providerTransDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (hAccountPayments ? providerTransText : "") + "</div>" +
                    "<div class='total-amount'>" + (hAccountPayments.PROVIDER_TRANS_ID ? hAccountPayments.PROVIDER_TRANS_ID : "") + "</div>" +
                    "</div>"

                dNoteChargeAccntDiv.appendChild(providerTransDiv);

            }

            if (hAccountPayments.CHARGE_ACCOUNT_NAME) {
                var cAccountNameText = $translate.getText('CHARGE_ACCOUNT_NAME')
                var cAccountNameDiv = _doc.createElement('div')
                cAccountNameDiv.id = "cAccountNameDiv";
                cAccountNameDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (hAccountPayments ? cAccountNameText : "") + " " +
                    (hAccountPayments.CHARGE_ACCOUNT_NAME ? hAccountPayments.CHARGE_ACCOUNT_NAME : "") + "</div>" +
                    "</div>"

                dNoteChargeAccntDiv.appendChild(cAccountNameDiv);

            }

            if (hAccountPayments.COMPANY_NAME) {
                var companyNameText = $translate.getText('COMPANY_NAME')
                var companyNameDiv = _doc.createElement('div');
                companyNameDiv.id = "companyNameDiv";
                companyNameDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='total-name'>" + (hAccountPayments ? companyNameText : "") + " " +
                    (hAccountPayments.COMPANY_NAME ? hAccountPayments.COMPANY_NAME : "") + "</div>" +
                    "</div>"

                dNoteChargeAccntDiv.appendChild(companyNameDiv);

            }

            if (hAccountPayments.LAST_4) {
                var lastFourText = $translate.getText('LAST_4')
                var lastFourDiv = _doc.createElement('div')
                lastFourDiv.id = "lastFourDiv";
                lastFourDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='item-name'>" + (hAccountPayments ? lastFourText : " ")
                    + " " + " " + (hAccountPayments.LAST_4 ? hAccountPayments.LAST_4 : " ") +
                    "</div>"

                dNoteChargeAccntDiv.appendChild(lastFourDiv);

            }

            if (hAccountPayments.PROVIDER_PAYMENT_DATE) {

                printData.collections.HOUSE_ACCOUNT_PAYMENTS[0];

                var dateTimeStr = hAccountPayments.PROVIDER_PAYMENT_DATE;
                var dateTimeResult;
                var transactionTimeText = $translate.getText('TRANSACTION_TIME')
                var transactionTimeDiv = _doc.createElement('div')
                if (_isUS) dateTimeResult = formatDateUS(dateTimeStr);
                else if (!_isUS) {
                    dateTimeResult = formatDateIL(dateTimeStr);
                }
                transactionTimeDiv.innerHTML = "<div class='itemDiv'>" +
                    "<div class='item-name'>" + (hAccountPayments ? transactionTimeText : "") +
                    " " + (hAccountPayments.PROVIDER_PAYMENT_DATE ? dateTimeResult : "") +
                    "</div>"

                dNoteChargeAccntDiv.appendChild(transactionTimeDiv);

            }
        }
        dNoteChargeAccntDiv.classList += ' tpl-body-div';
        deliveryNoteTransactionDiv.appendChild(dNoteChargeAccntDiv);
        return deliveryNoteTransactionDiv;
    }

    function createPaymentsData(printData) {

        var tplOrderPaymentsDiv = _doc.createElement('div');
        tplOrderPaymentsDiv.id = 'tplOrderPayments';


        // let data = _billService.resolveItems(printData.variables, printData.collections);

        if (_docObj && _docData.documentType === "deliveryNote") {
            return tplOrderPaymentsDiv;
        }

        else if (_docObj && _docData.documentType === "invoice") {
            if (_docObj.docPaymentType === "CreditCardPayment" || _docObj.docPaymentType === "CreditCardRefund") {
                var creditPaymentDiv = createCreditTemplate(printData);
                tplOrderPaymentsDiv.appendChild(creditPaymentDiv);
            }
            else if (_docObj.docPaymentType === ("GiftCard")) {
                var giftCardPayment = createGiftCardDetails(printData);
                tplOrderPaymentsDiv.appendChild(giftCardPayment);
            }
            else if (_docObj.docPaymentType === "CashPayment" || _docObj.docPaymentType === "CashRefund") {
                var cashPayment = createCashPaymentFooter(printData);
                tplOrderPaymentsDiv.appendChild(cashPayment);
            }
            else if (_docObj.docPaymentType === "ChequePayment" || _docObj.docPaymentType === "ChequeRefund") {
                var chequePayment = createChequePaymentFooter(printData);
                tplOrderPaymentsDiv.appendChild(chequePayment);
            }

        }
        else {
            var OrderPaymentsDiv = fillPaymentsData(printData);
            OrderPaymentsDiv.id = "OrderPaymentsDiv";
            tplOrderPaymentsDiv.appendChild(OrderPaymentsDiv);
        }
        return tplOrderPaymentsDiv
    }

    function fillPaymentsData(printData) {
        var OrderPaymentsDiv = _doc.createElement('tplOrderPayments');
        OrderPaymentsDiv.id = 'OrderPaymentsDiv';

        if (printData.data.payments.length > 0) {
            printData.data.payments.forEach(payment => {
                var paymentDiv = _doc.createElement('div');
                if (payment) {
                    paymentDiv.innerHTML =
                        "<div class='itemDiv'>" +
                        "<div class='total-name'>" + (payment.name ? payment.name : " ") + "</div>" + " " +
                        "<div class='total-amount " + isNegative(payment.amount) + "'>" + (payment.amount ? payment.amount : " ") + "</div>" +
                        "</div>"
                    OrderPaymentsDiv.appendChild(paymentDiv);
                }
                if (payment.holderName) {
                    var holderNameDiv = _doc.createElement('div');
                    holderNameDiv.innerHTML = "&nbsp;&nbsp;&nbsp;" + payment.holderName;
                    OrderPaymentsDiv.appendChild(holderNameDiv);
                }

            })
        }

        return OrderPaymentsDiv;
    }

    function createGiftCardDetails(printData) {

        var giftCardDiv = _doc.createElement('div');
        //giftCard Amount div
        var paidGiftCardText = $translate.getText('PAID_GIFTCARD');
        var pAmount = printData.collections.GIFT_CARD_PAYMENTS[0].P_AMOUNT ? printData.collections.GIFT_CARD_PAYMENTS[0].P_AMOUNT : '';
        var giftCardPaidDiv = _doc.createElement('div')
        giftCardPaidDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (paidGiftCardText ? paidGiftCardText : " ") + " " + pAmount + "</div>" + "</div>"

        giftCardDiv.appendChild(giftCardPaidDiv);

        //giftcard Num div
        var giftCardNum = $translate.getText('CARD_NO');
        var cardNum = printData.collections.GIFT_CARD_PAYMENTS[0].CARD_NUMBER ? printData.collections.GIFT_CARD_PAYMENTS[0].CARD_NUMBER : '';
        var giftCardNumDiv = _doc.createElement('div')
        giftCardNumDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (giftCardNum ? giftCardNum : " ") + " " + cardNum + "</div>" +
            "</div>"

        giftCardDiv.appendChild(giftCardNumDiv);

        //transaction Num div
        var transactionNumText = $translate.getText('TRANSACTION_NO');
        var transactNum = printData.collections.GIFT_CARD_PAYMENTS[0].PROVIDER_TRANS_ID ? printData.collections.GIFT_CARD_PAYMENTS[0].PROVIDER_TRANS_ID : '';
        var transactNumDiv = _doc.createElement('div')
        transactNumDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (transactionNumText ? transactionNumText : " ") + " " + transactNum + "</div>" +
            "</div>"

        giftCardDiv.appendChild(transactNumDiv);

        return giftCardDiv;
    }

    function createCashPaymentFooter(printData) {
        var cashDiv = _doc.createElement('div');
        cashDiv.id = 'cashDiv'
        //cash paid or returned  div
        var cashPaidText = $translate.getText('PAID_CASH');

        var cashReturnedText = $translate.getText('RETURNED_CASH');

        var pAmount = printData.collections.PAYMENT_LIST[0].P_AMOUNT ? printData.collections.PAYMENT_LIST[0].P_AMOUNT : '';
        var cashPaidDiv = _doc.createElement('div')
        cashPaidDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (!printData.isRefund ? cashPaidText : cashReturnedText) + "</div>" +
            "<div class='total-amount " + isNegative(pAmount) + "'>" + (pAmount).toFixed(2) + "</div>" +
            "</div>"

        cashDiv.appendChild(cashPaidDiv);

        //Change div
        if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
            var changeText = $translate.getText('TOTAL_CASHBACK');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE ? Number(printData.collections.PAYMENT_LIST[0].P_CHANGE).toFixed(2) : '';
            var transactNumDiv = _doc.createElement('div')
            transactNumDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + isNegative(pChange) + "'>" + pChange + "</div>" +
                "</div>"

            cashDiv.appendChild(transactNumDiv);
        }

        return cashDiv;
    }

    function createChequePaymentFooter(printData) {
        var chequeDiv = _doc.createElement('div');
        chequeDiv.id = 'chequeDiv';

        var chequePaidText = $translate.getText('PAID_CHEQUE');
        var chequeReturnedText = $translate.getText('RETURNED_CHEQUE');


        var pAmount = printData.collections.PAYMENT_LIST[0].P_AMOUNT ? printData.collections.PAYMENT_LIST[0].P_AMOUNT : '';
        var chequePaidDiv = _doc.createElement('div')
        chequePaidDiv.innerHTML = "<div class='itemDiv'>" +
            "<div class='total-name'>" + (!printData.isRefund ? chequePaidText : chequeReturnedText) + "</div>" +
            "<div class='total-amount " + isNegative(pAmount) + "'>" + (pAmount).toFixed(2) + "</div>" +
            "</div>"

        chequeDiv.appendChild(chequePaidDiv);

        //Change div
        if (printData.collections.PAYMENT_LIST[0].P_CHANGE) {
            var changeText = $translate.getText('TOTAL_CASHBACK');
            var pChange = printData.collections.PAYMENT_LIST[0].P_CHANGE ? Number(printData.collections.PAYMENT_LIST[0].P_CHANGE).toFixed(2) : '';
            var transactNumDiv = _doc.createElement('div')
            transactNumDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (changeText ? changeText : '') + "</div>" +
                "<div class='total-amount " + isNegative(pChange) + "'>" + pChange + "</div>" +
                "</div>"

            chequeDiv.appendChild(transactNumDiv);
        }

        return chequeDiv;
    }


    function createCreditSlip(_printData, docTypeChosen) {
        var creditSlipDiv = _doc.createElement('div');
        creditSlipDiv.id = 'creditSlipDiv';


        var creditSlipDocArray = _printData.collections.PAYMENT_LIST ? _printData.collections.PAYMENT_LIST : null;
        var creditSlipDoc;
        creditSlipDocArray.forEach(payment => {
            if (payment.P_ID === docTypeChosen.id) {
                creditSlipDoc = payment;
            }
        })

        if (creditSlipDoc) {
            var transactionTypeDiv = _doc.createElement('div');
            transactionTypeDiv.id = 'transactionTypeDiv';
            var TransactionTypeText = $translate.getText('TransactionType');
            transactionTypeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(TransactionTypeText === null) ? TransactionTypeText : "") + ": "
                + (creditSlipDoc.TRANS_TYPE ? creditSlipDoc.TRANS_TYPE : "") + "</div></div>"

            transactionTypeDiv.classList += ' padding-top';
            creditSlipDiv.appendChild(transactionTypeDiv);

            var cardTypeDiv = _doc.createElement('div');
            cardTypeDiv.id = 'cardTypeDiv';
            var cardTypeText = $translate.getText('CardType');
            cardTypeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(cardTypeText === null) ? cardTypeText : "") + ": "
                + (creditSlipDoc.CARD_TYPE ? creditSlipDoc.CARD_TYPE : "") + "</div></div>"
            creditSlipDiv.appendChild(cardTypeDiv)

            var cardNumDiv = _doc.createElement('div');
            cardNumDiv.id = 'cardNumDiv';
            var cardNumText = $translate.getText('CardNumber');
            cardNumDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(cardNumText === null) ? cardNumText : "") + ": " + (creditSlipDoc.CARD_NUMBER_MASKED ? creditSlipDoc.CARD_NUMBER_MASKED : "XXXX-" + creditSlipDoc.LAST_4) +
                "</div></div>"

            creditSlipDiv.appendChild(cardNumDiv)

            if (creditSlipDoc.P_TENDER_TYPE === 'creditCard') {
                var pTenderTypeDiv = _doc.createElement('div');
                pTenderTypeDiv.id = 'pTenderTypeDiv';
                var pTenderTypeText = $translate.getText('CardHolder');
                pTenderTypeDiv.innerHTML = "<div class='itemDiv'>" +
                    (!(pTenderTypeText === null) ? pTenderTypeText : "") + ": " + (creditSlipDoc.CUSTOMER_NAME ? creditSlipDoc.CUSTOMER_NAME : "") +
                    "</div></div>"
                creditSlipDiv.appendChild(pTenderTypeDiv)
            }


            var dateTimeStr = creditSlipDoc.PROVIDER_PAYMENT_DATE;
            var dateTimeResult;
            var transactTimeText = $translate.getText('transactTimeText');
            var creditSlipTimeDiv = _doc.createElement('div')
            if (_isUS) dateTimeResult = formatDateUS(dateTimeStr);
            else if (!_isUS) {
                dateTimeResult = formatDateIL(dateTimeStr);
            }
            creditSlipTimeDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (transactTimeText ? transactTimeText : "") + ": " + (transactTimeText ? dateTimeResult : "") + "</div>" +
                "</div>";

            creditSlipTimeDiv.classList += ' padding-bottom';
            creditSlipTimeDiv.classList += ' tpl-body-div';

            creditSlipDiv.appendChild(creditSlipTimeDiv);


            var merchantDiv = _doc.createElement('div');
            merchantDiv.id = 'merchantDiv';
            var merchantText = $translate.getText('Merchant');
            merchantDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(merchantText === null) ? merchantText : "") + ": " + (creditSlipDoc.MERCHANT_NUMBER ? creditSlipDoc.MERCHANT_NUMBER : "") +
                "</div></div>";
            merchantDiv.classList += ' padding-top';

            creditSlipDiv.appendChild(merchantDiv)


            var sequenceDiv = _doc.createElement('div');
            sequenceDiv.id = 'sequenceDiv';
            var sequenceText = $translate.getText('Sequence');
            sequenceDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(sequenceText === null) ? sequenceText : "") + ": " +
                + (creditSlipDoc.PROVIDER_TRANS_ID ? creditSlipDoc.PROVIDER_TRANS_ID : "") + "</div>" +
                "</div>"
            creditSlipDiv.appendChild(sequenceDiv)

            var responseDiv = _doc.createElement('div');
            responseDiv.id = 'responseDiv';
            var responseText = $translate.getText('Response');
            var responseMessage = creditSlipDoc.PROVIDER_RESPONSE_MESSAGE ? creditSlipDoc.PROVIDER_RESPONSE_MESSAGE : '';
            responseDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(responseText === null || responseText === undefined) ? responseText : "") + ": " +
                (creditSlipDoc.PROVIDER_RESPONSE_CODE ? creditSlipDoc.PROVIDER_RESPONSE_CODE + "/" + responseMessage : "") + "</div>" +
                "</div>"
            creditSlipDiv.appendChild(responseDiv)



            var approvalDiv = _doc.createElement('div');
            approvalDiv.id = 'approvalDiv';
            var approvalText = $translate.getText('Approval');
            approvalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(approvalText === null) ? approvalText : "") + ": " +
                (creditSlipDoc.CONFIRMATION_NUMBER ? creditSlipDoc.CONFIRMATION_NUMBER : "") + "</div></div>"

            creditSlipDiv.appendChild(approvalDiv)



            var entryDiv = _doc.createElement('div');
            entryDiv.classList += ' tpl-body-div';
            entryDiv.id = 'entryDiv';
            var entryText = $translate.getText('Entry');
            entryDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(entryText === null) ? entryText : "") + ": " +
                (creditSlipDoc.ENTRY_METHOD ? creditSlipDoc.ENTRY_METHOD : "") +
                "</div></div>"

            entryDiv.classList += ' padding-bottom';
            entryDiv.classList += ' tpl-body-div';
            creditSlipDiv.appendChild(entryDiv)




            var checkTotalDiv = _doc.createElement('div');
            checkTotalDiv.id = 'checkTotalDiv';
            var checkTotalText = $translate.getText('CheckTotal');
            checkTotalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(checkTotalText === null) ? checkTotalText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (creditSlipDoc.P_AMOUNT_WO_TIP ? creditSlipDoc.P_AMOUNT_WO_TIP : "") +
                "</div></div>"

            checkTotalDiv.classList += ' padding-top';
            creditSlipDiv.appendChild(checkTotalDiv)


            var tipDiv = _doc.createElement('div');
            tipDiv.id = 'tipDiv';
            var tipText = $translate.getText('Tip');
            var tipAmount;
            if (creditSlipDoc.TIP_AMOUNT !== undefined && creditSlipDoc.TIP_AMOUNT !== null) {
                tipAmount = creditSlipDoc.TIP_AMOUNT;
            }
            else {
                tipAmount = 0;
            }
            tipDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (!(tipText === null) ? tipText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (tipAmount ? Number(tipAmount).toFixed(2) : 0) +
                "</div></div>"
            creditSlipDiv.appendChild(tipDiv)


            var totalDiv = _doc.createElement('div');
            totalDiv.id = 'totalDiv';
            var totalText = $translate.getText('Total');
            totalDiv.innerHTML = "<div class='itemDiv'>" +
                "<div class='total-name'>" + (totalText ? totalText : "") + ": " + "</div >" +
                "<div class='total-amount'>" + (creditSlipDoc.P_AMOUNT ? Number(creditSlipDoc.P_AMOUNT).toFixed(2) : "") + "</div></div>";
            creditSlipDiv.appendChild(totalDiv)

            //Add signature 

            if (docTypeChosen.md.signature) {

                var signatureData = docTypeChosen.md.signature;
                var signatureDiv = _doc.createElement('div');
                signatureDiv.id = 'signatureDiv';
                signatureDiv.classList += " signature-container";

                var elementSVGDiv = _doc.createElement('div');
                elementSVGDiv.id = 'elementSVGDiv'
                elementSVGDiv.classList += " signature-container";
                var newSVG = _doc.createElement('div');
                newSVG.id = 'newSVG';

                elementSVGDiv.appendChild(newSVG)
                newSVG.outerHTML += `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id='svg' width='100%' height='100' transform='translate(0, 0)'  viewBox="0 0 500 150" ></svg>`
                // var svgString = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id='svg' width='100%' height='100' transform='translate(0, 0)'  viewBox="0 0 500 150" ></svg>`
                // var svgDoc = new DOMParser().parseFromString(svgString, "image/svg+xml");
                // var svgNode = svgDoc.getElementById('svg');
                var svgNode = elementSVGDiv.getElementsByTagName('svg')[0];
                svgNode.classList += " signature-container";


                elementSVGDiv.appendChild(svgNode);

                signatureDiv.appendChild(elementSVGDiv)


                var elementSVG = signatureDiv.getElementsByTagName('svg')[0];
                elementSVG.id = 'elementSVG';


                var path = makeSVG('path', { d: signatureData, version: "1.1", xmlns: "http://www.w3.org/2000/svg", stroke: "#06067f", 'stroke-width': "2", height: "auto", transform: 'translate(50,-80) scale(0.5,0.5)', 'stroke-linecap': "butt", fill: "none", 'stroke-linejoin': "miter" });
                path.setAttribute("width", "50%");
                path.setAttribute("height", "auto");

                elementSVG.setAttribute("width", "100");
                elementSVG.setAttribute("height", "auto");


                elementSVG.innerHTML = "";
                elementSVG.appendChild(path);
                elementSVG.setAttribute("width", "100%");
                elementSVG.setAttribute("height", "auto");


                elementSVGDiv.appendChild(elementSVG);
                creditSlipDiv.appendChild(signatureDiv)

            }


        }


        return creditSlipDiv;
    }
    //create svf function
    function makeSVG(tag, attrs) {
        var el = _doc.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            el.setAttribute(k, attrs[k]);
        return el;
    }
    //function for appending multiple children
    function appendChildren(target, array) {
        var divForAppending = _doc.createElement('div');
        var length = array.length;
        if (length > 0) {
            array.forEach(element => {
                divForAppending.appendChild(element);
            })
        }
        return divForAppending;
    }

    function formatDateUS(stringDate) {
        var date = new Date(stringDate);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + " " + date.getHours() + ":" + ((date.getMinutes() > 10) ? date.getMinutes() : "0" + date.getMinutes());
    }

    function formatDateIL(stringDate) {
        var date = new Date(stringDate);
        return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + " " + date.getHours() + ":" + ((date.getMinutes() > 10) ? date.getMinutes() : "0" + date.getMinutes());
    }

    TemplateBuilderService.prototype.createHTMLFromPrintDATA = (docObj, printData, billData) => createHTMLFromPrintDATA(docObj, printData, billData);

    return TemplateBuilderService;

})();