let Utils = (function () {

    function Utils() {

    }

    function _toFixedSafe(value, num) {
        if (value !== undefined) {
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

    Utils.prototype.toFixedSafe = _toFixedSafe;
    Utils.prototype.currencyFraction = _currencyFraction;

    return Utils;

}());
