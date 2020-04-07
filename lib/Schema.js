"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Schemable_1 = require("./Schemable");
/**
 * @since 2.2.0
 */
function make(f) {
    return Schemable_1.memoize(f);
}
exports.make = make;
