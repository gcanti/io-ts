"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PathReporter_1 = require("./PathReporter");
var Either_1 = require("fp-ts/lib/Either");
/**
 * @since 1.0.0
 * @deprecated
 */
exports.ThrowReporter = {
    report: function (validation) {
        if (Either_1.isLeft(validation)) {
            throw new Error(PathReporter_1.PathReporter.report(validation).join('\n'));
        }
    }
};
