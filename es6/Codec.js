import * as D from './Decoder';
import * as E from './Encoder';
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export function make(decoder, encoder) {
    return {
        decode: decoder.decode,
        encode: encoder.encode
    };
}
/**
 * @since 2.2.0
 */
export function literal() {
    var _a, _b;
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    return make((_a = D.decoder).literal.apply(_a, values), (_b = E.encoder).literal.apply(_b, values));
}
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export var string = make(D.decoder.string, E.encoder.string);
/**
 * @since 2.2.0
 */
export var number = make(D.decoder.number, E.encoder.number);
/**
 * @since 2.2.0
 */
export var boolean = make(D.decoder.boolean, E.encoder.boolean);
/**
 * @since 2.2.0
 */
export var UnknownArray = make(D.decoder.UnknownArray, E.encoder.UnknownArray);
/**
 * @since 2.2.0
 */
export var UnknownRecord = make(D.decoder.UnknownRecord, E.encoder.UnknownRecord);
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export function withExpected(codec, expected) {
    return make(D.withExpected(codec, expected), codec);
}
/**
 * @since 2.2.0
 */
export function refinement(from, refinement, expected) {
    return make(D.refinement(from, refinement, expected), from);
}
/**
 * @since 2.2.0
 */
export function nullable(or) {
    return make(D.decoder.nullable(or), E.encoder.nullable(or));
}
/**
 * @since 2.2.0
 */
export function type(properties) {
    return make(D.decoder.type(properties), E.encoder.type(properties));
}
/**
 * @since 2.2.0
 */
export function partial(properties) {
    return make(D.decoder.partial(properties), E.encoder.partial(properties));
}
/**
 * @since 2.2.0
 */
export function record(codomain) {
    return make(D.decoder.record(codomain), E.encoder.record(codomain));
}
/**
 * @since 2.2.0
 */
export function array(items) {
    return make(D.decoder.array(items), E.encoder.array(items));
}
/**
 * @since 2.2.0
 */
export function tuple() {
    var _a, _b;
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    return make((_a = D.decoder).tuple.apply(_a, components), (_b = E.encoder).tuple.apply(_b, components));
}
/**
 * @since 2.2.0
 */
export function intersection(left, right) {
    return make(D.decoder.intersection(left, right), E.encoder.intersection(left, right));
}
/**
 * @since 2.2.0
 */
export function sum(tag) {
    var sumD = D.decoder.sum(tag);
    var sumE = E.encoder.sum(tag);
    return function (members) { return make(sumD(members), sumE(members)); };
}
/**
 * @since 2.2.0
 */
export function lazy(id, f) {
    return make(D.decoder.lazy(id, f), E.encoder.lazy(id, f));
}
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export var URI = 'Codec';
/**
 * @since 2.2.0
 */
export var codec = {
    URI: URI,
    imap: function (fa, f, g) { return make(D.decoder.map(fa, f), E.encoder.contramap(fa, g)); },
    literal: literal,
    string: string,
    number: number,
    boolean: boolean,
    UnknownArray: UnknownArray,
    UnknownRecord: UnknownRecord,
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
