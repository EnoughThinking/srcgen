'use strict';

exports.__esModule = true;
var between = {};
between.results = [];
between.string = {};
between.getFromBetween = function (prefix, suffix) {
    try {

        var s = between.string;
        var i = s.indexOf(prefix);
        if (i >= 0) {
            s = s.substring(i + prefix.length);
        }
        else {
            return null;
        }
        if (suffix) {
            i = s.indexOf(suffix);
            if (i >= 0) {
                s = s.substring(0, i);
            }
            else {
                return null;
            }
        }
        return s;
    } catch (error) {
        console.error(error);
    }
};
between.removeFromBetween = function (prefix, suffix) {
    try {
        var removal = prefix + this.getFromBetween(prefix, suffix);
        between.string = between.string.replace(removal, "");
    } catch (error) {
        console.error(error);
    }
};
between.getAllResults = function (prefix, suffix) {
    try {
        var prevString = between.string;
        var result = between.getFromBetween(prefix, suffix);
        if (result !== null) {
            between.results.push(result);
        }
        between.removeFromBetween(prefix, suffix);
        if (prevString !== between.string) {
            between.getAllResults(prefix, suffix);
        } else {
            return;
        }
    } catch (error) {
        console.error(error);
    }
};
between.get = function (string, prefix, suffix) {
    try {
        between.results = [];
        between.string = string;
        between.getAllResults(prefix, suffix);
        return between.results;
    } catch (error) {
        console.error(error);
    }
};
exports['default'] = between;
module.exports = exports['default'];