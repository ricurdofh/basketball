'use strict';

var todayDate = new Date();

var validDayMonth = function (val) {
        return val < 10 ? '0' + val : val;
};

var globals = {

    getTodayDate : function () {
        var month = validDayMonth(todayDate.getMonth() + 1);
        var day = validDayMonth(todayDate.getDate());
        return todayDate.getFullYear() + '-' + month + '-' + day;
    },

    getDateFromNow : function (op, days) {
        var newDate,
            newMonth,
            newDay;
        switch(op) {
            case '+':
                newDate = new Date(todayDate.setDate(new Date().getDate() + days));
                newMonth = validDayMonth(newDate.getMonth() + 1);
                newDay = validDayMonth(newDate.getDate());
                return newDate.getFullYear() + '-' + newMonth + '-' + newDay;
                break;
            case '-':
                newDate = new Date(todayDate.setDate(new Date().getDate() - days));
                newMonth = validDayMonth(newDate.getMonth() + 1);
                newDay = validDayMonth(newDate.getDate());
                return newDate.getFullYear() + '-' + newMonth + '-' + newDay;
                break;
        }
    }

};

module.exports = globals;