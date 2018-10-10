'use strict'
let TlogDocsUtils = (function () {

    function TlogDocsUtils() {

    }

    function _toFixedSafe(value, num) {
        if (value && value !== undefined) {
            return value.toFixed(num);
        }
        return "--";
    }

    function _currencyFraction(val, showZero) {
        if (showZero && (!val || isNaN(val))) val = 0;
        if (!isNaN(val)) {
            var num = val / 100;
            var fixnum = _toFixedSafe(num, 2);
            return parseFloat(fixnum);
        }

    }

    TlogDocsUtils.prototype.toFixedSafe = _toFixedSafe;
    TlogDocsUtils.prototype.currencyFraction = _currencyFraction;

    return TlogDocsUtils;

}());
