import { either, isLeft, isRight, left, mapLeft, right } from 'fp-ts/es6/Either';
import { pipe, pipeable } from 'fp-ts/es6/pipeable';
import * as G from './Guard';
import { memoize } from './Schemable';
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
var empty = [];
/**
 * @since 2.2.0
 */
export function tree(value, forest) {
    if (forest === void 0) { forest = empty; }
    return {
        value: value,
        forest: forest
    };
}
/**
 * @since 2.2.0
 */
export function success(a) {
    return right(a);
}
/**
 * @since 2.2.0
 */
export function failure(message) {
    return left([tree(message)]);
}
/**
 * @since 2.2.0
 */
export function failures(message, errors) {
    return left([tree(message, errors)]);
}
/**
 * @since 2.2.0
 */
export function fromGuard(guard, expected) {
    return {
        decode: function (u) { return (guard.is(u) ? success(u) : failure("cannot decode " + JSON.stringify(u) + ", should be " + expected)); }
    };
}
/**
 * @since 2.2.0
 */
export function literal() {
    var _a;
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    if (values.length === 0) {
        return never;
    }
    var expected = values.map(function (value) { return JSON.stringify(value); }).join(' | ');
    return fromGuard((_a = G.guard).literal.apply(_a, values), expected);
}
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export var never = fromGuard(G.never, 'never');
/**
 * @since 2.2.0
 */
export var string = fromGuard(G.string, 'string');
/**
 * @since 2.2.0
 */
export var number = fromGuard(G.number, 'number');
/**
 * @since 2.2.0
 */
export var boolean = fromGuard(G.boolean, 'boolean');
/**
 * @since 2.2.0
 */
export var UnknownArray = fromGuard(G.UnknownArray, 'Array<unknown>');
/**
 * @since 2.2.0
 */
export var UnknownRecord = fromGuard(G.UnknownRecord, 'Record<string, unknown>');
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export function withExpected(decoder, expected) {
    return {
        decode: function (u) {
            return pipe(decoder.decode(u), mapLeft(function (nea) { return expected(u, nea); }));
        }
    };
}
/**
 * @since 2.2.0
 */
export function refinement(from, refinement, expected) {
    return {
        decode: function (u) {
            var e = from.decode(u);
            if (isLeft(e)) {
                return e;
            }
            var a = e.right;
            return refinement(a) ? success(a) : failure("cannot refine " + JSON.stringify(u) + ", should be " + expected);
        }
    };
}
/**
 * @since 2.2.0
 */
export function parse(from, parser) {
    return {
        decode: function (u) {
            var e = from.decode(u);
            if (isLeft(e)) {
                return e;
            }
            var pe = parser(e.right);
            if (isLeft(pe)) {
                return failure(pe.left);
            }
            return pe;
        }
    };
}
/**
 * @since 2.2.0
 */
export function nullable(or) {
    return union(literal(null), or);
}
/**
 * @since 2.2.0
 */
export function type(properties) {
    return {
        decode: function (u) {
            var e = UnknownRecord.decode(u);
            if (isLeft(e)) {
                return e;
            }
            else {
                var r = e.right;
                var a = {};
                for (var k in properties) {
                    var e_1 = properties[k].decode(r[k]);
                    if (isLeft(e_1)) {
                        return failures("required property " + JSON.stringify(k), e_1.left);
                    }
                    else {
                        a[k] = e_1.right;
                    }
                }
                return success(a);
            }
        }
    };
}
/**
 * @since 2.2.0
 */
export function partial(properties) {
    return {
        decode: function (u) {
            var e = UnknownRecord.decode(u);
            if (isLeft(e)) {
                return e;
            }
            else {
                var r = e.right;
                var a = {};
                for (var k in properties) {
                    // don't add missing properties
                    if (k in r) {
                        var rk = r[k];
                        // don't strip undefined properties
                        if (rk === undefined) {
                            a[k] = undefined;
                        }
                        else {
                            var e_2 = properties[k].decode(rk);
                            if (isLeft(e_2)) {
                                return failures("optional property " + JSON.stringify(k), e_2.left);
                            }
                            else {
                                a[k] = e_2.right;
                            }
                        }
                    }
                }
                return success(a);
            }
        }
    };
}
/**
 * @since 2.2.0
 */
export function record(codomain) {
    return {
        decode: function (u) {
            var e = UnknownRecord.decode(u);
            if (isLeft(e)) {
                return e;
            }
            else {
                var r = e.right;
                var a = {};
                for (var k in r) {
                    var e_3 = codomain.decode(r[k]);
                    if (isLeft(e_3)) {
                        return failures("key " + JSON.stringify(k), e_3.left);
                    }
                    else {
                        a[k] = e_3.right;
                    }
                }
                return success(a);
            }
        }
    };
}
/**
 * @since 2.2.0
 */
export function array(items) {
    return {
        decode: function (u) {
            var e = UnknownArray.decode(u);
            if (isLeft(e)) {
                return e;
            }
            else {
                var us = e.right;
                var len = us.length;
                var a = new Array(len);
                for (var i = 0; i < len; i++) {
                    var e_4 = items.decode(us[i]);
                    if (isLeft(e_4)) {
                        return failures("item " + i, e_4.left);
                    }
                    else {
                        a[i] = e_4.right;
                    }
                }
                return success(a);
            }
        }
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
        decode: function (u) {
            var e = UnknownArray.decode(u);
            if (isLeft(e)) {
                return e;
            }
            var us = e.right;
            var a = [];
            for (var i = 0; i < components.length; i++) {
                var e_5 = components[i].decode(us[i]);
                if (isLeft(e_5)) {
                    return failures("component " + i, e_5.left);
                }
                else {
                    a.push(e_5.right);
                }
            }
            return success(a);
        }
    };
}
function typeOf(x) {
    return x === null ? 'null' : typeof x;
}
/**
 * @internal
 */
export function intersect(a, b) {
    if (a !== undefined && b !== undefined) {
        var tx = typeOf(a);
        var ty = typeOf(b);
        if (tx === 'object' || ty === 'object') {
            return Object.assign({}, a, b);
        }
    }
    return b;
}
/**
 * @since 2.2.0
 */
export function intersection(left, right) {
    return {
        decode: function (u) {
            var ea = left.decode(u);
            if (isLeft(ea)) {
                return ea;
            }
            var eb = right.decode(u);
            if (isLeft(eb)) {
                return eb;
            }
            return success(intersect(ea.right, eb.right));
        }
    };
}
/**
 * @since 2.2.0
 */
export function lazy(id, f) {
    var get = memoize(f);
    return {
        decode: function (u) {
            return pipe(get().decode(u), mapLeft(function (nea) { return [tree(id, nea)]; }));
        }
    };
}
/**
 * @since 2.2.0
 */
export function sum(tag) {
    return function (members) {
        var keys = Object.keys(members);
        if (keys.length === 0) {
            return never;
        }
        var expected = keys.map(function (k) { return JSON.stringify(k); }).join(' | ');
        return {
            decode: function (u) {
                var e = UnknownRecord.decode(u);
                if (isLeft(e)) {
                    return e;
                }
                var v = e.right[tag];
                if (G.string.is(v) && v in members) {
                    return members[v].decode(u);
                }
                return failures("required property " + JSON.stringify(tag), [
                    tree("cannot decode " + JSON.stringify(v) + ", should be " + expected)
                ]);
            }
        };
    };
}
/**
 * @since 2.2.0
 */
export function union() {
    var members = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        members[_i] = arguments[_i];
    }
    var len = members.length;
    if (len === 0) {
        return never;
    }
    return {
        decode: function (u) {
            var e = members[0].decode(u);
            if (isRight(e)) {
                return e;
            }
            else {
                var forest = [tree("member 0", e.left)];
                for (var i = 1; i < len; i++) {
                    var e_6 = members[i].decode(u);
                    if (isRight(e_6)) {
                        return e_6;
                    }
                    else {
                        forest.push(tree("member " + i, e_6.left));
                    }
                }
                return left(forest);
            }
        }
    };
}
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
export var URI = 'Decoder';
/**
 * @since 2.2.0
 */
export var decoder = {
    URI: URI,
    map: function (fa, f) { return ({
        decode: function (u) { return either.map(fa.decode(u), f); }
    }); },
    of: function (a) { return ({
        decode: function () { return success(a); }
    }); },
    ap: function (fab, fa) { return ({
        decode: function (u) { return either.ap(fab.decode(u), fa.decode(u)); }
    }); },
    alt: function (fx, fy) { return ({
        decode: function (u) { return either.alt(fx.decode(u), function () { return fy().decode(u); }); }
    }); },
    zero: function () { return never; },
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
    lazy: lazy,
    union: union
};
var _a = pipeable(decoder), alt = _a.alt, ap = _a.ap, apFirst = _a.apFirst, apSecond = _a.apSecond, map = _a.map;
export { 
/**
 * @since 2.2.0
 */
alt, 
/**
 * @since 2.2.0
 */
ap, 
/**
 * @since 2.2.0
 */
apFirst, 
/**
 * @since 2.2.0
 */
apSecond, 
/**
 * @since 2.2.0
 */
map };
