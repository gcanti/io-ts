"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var function_1 = require("fp-ts/lib/function");
var pipeable_1 = require("fp-ts/lib/pipeable");
var Schemable_1 = require("./Schemable");
var Decoder_1 = require("./Decoder");
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
exports.id = {
    encode: function_1.identity
};
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
function nullable(or) {
    return {
        encode: function (a) { return (a === null ? a : or.encode(a)); }
    };
}
exports.nullable = nullable;
/**
 * @since 2.2.0
 */
function type(properties) {
    return {
        encode: function (a) {
            var o = {};
            for (var k in properties) {
                o[k] = properties[k].encode(a[k]);
            }
            return o;
        }
    };
}
exports.type = type;
/**
 * @since 2.2.0
 */
function partial(properties) {
    return {
        encode: function (a) {
            var o = {};
            for (var k in properties) {
                var v = a[k];
                // don't add missing properties
                if (k in a) {
                    // don't strip undefined properties
                    o[k] = v === undefined ? v : properties[k].encode(v);
                }
            }
            return o;
        }
    };
}
exports.partial = partial;
/**
 * @since 2.2.0
 */
function record(codomain) {
    return {
        encode: function (r) {
            var o = {};
            for (var k in r) {
                o[k] = codomain.encode(r[k]);
            }
            return o;
        }
    };
}
exports.record = record;
/**
 * @since 2.2.0
 */
function array(items) {
    return {
        encode: function (as) { return as.map(items.encode); }
    };
}
exports.array = array;
/**
 * @since 2.2.0
 */
function tuple() {
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    return {
        encode: function (as) { return components.map(function (c, i) { return c.encode(as[i]); }); }
    };
}
exports.tuple = tuple;
/**
 * @since 2.2.0
 */
function intersection(left, right) {
    return {
        encode: function (ab) { return Decoder_1.intersect(left.encode(ab), right.encode(ab)); }
    };
}
exports.intersection = intersection;
/**
 * @since 2.2.0
 */
function sum(tag) {
    return function (members) {
        return {
            encode: function (a) { return members[a[tag]].encode(a); }
        };
    };
}
exports.sum = sum;
/**
 * @since 2.2.0
 */
function lazy(f) {
    var get = Schemable_1.memoize(f);
    return {
        encode: function (a) { return get().encode(a); }
    };
}
exports.lazy = lazy;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
exports.URI = 'Encoder';
/**
 * @since 2.2.0
 */
exports.encoder = {
    URI: exports.URI,
    contramap: function (fa, f) { return ({
        encode: function (b) { return fa.encode(f(b)); }
    }); },
    literal: function () { return exports.id; },
    string: exports.id,
    number: exports.id,
    boolean: exports.id,
    UnknownArray: exports.id,
    UnknownRecord: exports.id,
    nullable: nullable,
    type: type,
    partial: partial,
    record: record,
    array: array,
    tuple: tuple,
    intersection: intersection,
    sum: sum,
    lazy: function (_, f) { return lazy(f); }
};
var contramap = pipeable_1.pipeable(exports.encoder).contramap;
exports.contramap = contramap;
