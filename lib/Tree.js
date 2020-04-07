"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @since 2.2.0
 */
var Tree_1 = require("fp-ts/lib/Tree");
/**
 * @since 2.2.0
 */
function draw(es) {
    return es.map(Tree_1.drawTree).join('\n');
}
exports.draw = draw;
