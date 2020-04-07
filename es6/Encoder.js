import { identity } from 'fp-ts/es6/function';
import { pipeable } from 'fp-ts/es6/pipeable';
import { memoize } from './Schemable';
import { intersect } from './Decoder';
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export var id = {
    encode: identity
};
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export function nullable(or) {
    return {
        encode: function (a) { return (a === null ? a : or.encode(a)); }
    };
}
/**
 * @since 2.2.0
 */
export function type(properties) {
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
/**
 * @since 2.2.0
 */
export function partial(properties) {
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
/**
 * @since 2.2.0
 */
export function record(codomain) {
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
/**
 * @since 2.2.0
 */
export function array(items) {
    return {
        encode: function (as) { return as.map(items.encode); }
    };
}
/**
 * @since 2.2.0
 */
export function tuple() {
    var components = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        components[_i] = arguments[_i];
    }
    return {
        encode: function (as) { return components.map(function (c, i) { return c.encode(as[i]); }); }
    };
}
/**
 * @since 2.2.0
 */
export function intersection(left, right) {
    return {
        encode: function (ab) { return intersect(left.encode(ab), right.encode(ab)); }
    };
}
/**
 * @since 2.2.0
 */
export function sum(tag) {
    return function (members) {
        return {
            encode: function (a) { return members[a[tag]].encode(a); }
        };
    };
}
/**
 * @since 2.2.0
 */
export function lazy(f) {
    var get = memoize(f);
    return {
        encode: function (a) { return get().encode(a); }
    };
}
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export var URI = 'Encoder';
/**
 * @since 2.2.0
 */
export var encoder = {
    URI: URI,
    contramap: function (fa, f) { return ({
        encode: function (b) { return fa.encode(f(b)); }
    }); },
    literal: function () { return id; },
    string: id,
    number: id,
    boolean: id,
    UnknownArray: id,
    UnknownRecord: id,
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
var contramap = pipeable(encoder).contramap;
export { 
/**
 * @since 2.2.0
 */
contramap };
