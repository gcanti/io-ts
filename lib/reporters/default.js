"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Either_1 = require("fp-ts/lib/Either");
var index_1 = require("../index");
function stringify(value) {
    return typeof value === 'function' ? index_1.getFunctionName(value) : JSON.stringify(value);
}
function getContextPath(context) {
    return context.map(function (_a) {
        var key = _a.key, type = _a.type;
        return key + ": " + type.name;
    }).join('/');
}
function getMessage(value, context) {
    return "Invalid value " + stringify(value) + " supplied to " + getContextPath(context);
}
function pathReporterFailure(es) {
    return es.map(function (e) { return getMessage(e.value, e.context); });
}
exports.pathReporterFailure = pathReporterFailure;
exports.PathReporter = {
    report: function (validation) { return validation.fold(pathReporterFailure, function () { return ['No errors!']; }); }
};
exports.ThrowReporter = {
    report: function (validation) {
        if (Either_1.isLeft(validation)) {
            throw exports.PathReporter.report(validation).join('\n');
        }
    }
};
//# sourceMappingURL=default.js.map