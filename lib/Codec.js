"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var D = require("./Decoder");
var E = require("./Encoder");
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
function make(decoder, encoder) {
    return {
        decode: decoder.decode,
        encode: encoder.encode
    };
}
exports.make = make;
/**
 * @since 2.2.0
 */
function literal() {
    var _a, _b;
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    return make((_a = D.decoder).literal.apply(_a, values), (_b = E.encoder).literal.apply(_b, values));
}
exports.literal = literal;
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
exports.string = make(D.decoder.string, E.encoder.string);
/**
 * @since 2.2.0
 */
exports.number = make(D.decoder.number, E.encoder.number);
/**
 * @since 2.2.0
 */
exports.boolean = make(D.decoder.boolean, E.encoder.boolean);
/**
 * @since 2.2.0
 */
exports.UnknownArray = make(D.decoder.UnknownArray, E.encoder.UnknownArray);
/**
 * @since 2.2.0
 */
exports.UnknownRecord = make(D.decoder.UnknownRecord, E.encoder.UnknownRecord);
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
function withExpected(codec, expected) {
    return make(D.withExpected(codec, expected), codec);
}
exports.withExpected = withExpected;
/**
 * @since 2.2.0
 */
function refinement(from, refinement, expected) {
    return make(D.refinement(from, refinement, expected), from);
}
exports.refinement = refinement;
/**
 * @since 2.2.0
 */
function nullable(or) {
    return make(D.decoder.nullable(or), E.encoder.nullable(or));
}
exports.nullable = nullable;
/**
 * @since 2.2.0
 */
function type(properties) {
    return make(D.decoder.type(properties), E.encoder.type(properties));
}
exports.type = type;
/**
 * @since 2.2.0
 */
function partial(properties) {
    return make(D.decoder.partial(properties), E.encoder.partial(properties));
}
exports.partial = partial;
/**
 * @since 2.2.0
 */
function record(codomain) {
    return make(D.decoder.record(codomain), E.encoder.record(codomain));
}
exports.record = record;
/**
 * @since 2.2.0
 */
function array(items) {
    return make(D.decoder.array(items), E.encoder.array(items));
}
exports.array = array;
/**
 * @since 2.2.0
 */
function tuple() {
    var _a, _b;
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    return make((_a = D.decoder).tuple.apply(_a, components), (_b = E.encoder).tuple.apply(_b, components));
}
exports.tuple = tuple;
/**
 * @since 2.2.0
 */
function intersection(left, right) {
    return make(D.decoder.intersection(left, right), E.encoder.intersection(left, right));
}
exports.intersection = intersection;
/**
 * @since 2.2.0
 */
function sum(tag) {
    var sumD = D.decoder.sum(tag);
    var sumE = E.encoder.sum(tag);
    return function (members) { return make(sumD(members), sumE(members)); };
}
exports.sum = sum;
/**
 * @since 2.2.0
 */
function lazy(id, f) {
    return make(D.decoder.lazy(id, f), E.encoder.lazy(id, f));
}
exports.lazy = lazy;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
exports.URI = 'Codec';
/**
 * @since 2.2.0
 */
exports.codec = {
    URI: exports.URI,
    imap: function (fa, f, g) { return make(D.decoder.map(fa, f), E.encoder.contramap(fa, g)); },
    literal: literal,
    string: exports.string,
    number: exports.number,
    boolean: exports.boolean,
    UnknownArray: exports.UnknownArray,
    UnknownRecord: exports.UnknownRecord,
    nullable: nullable,
    type: type,
    partial: partial,
    record: record,
    array: array,
    tuple: tuple,
    intersection: intersection,
    sum: sum,
    lazy: lazy
};
