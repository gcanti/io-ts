"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Either_1 = require("fp-ts/lib/Either");
var pipeable_1 = require("fp-ts/lib/pipeable");
var G = require("./Guard");
var Schemable_1 = require("./Schemable");
// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------
var empty = [];
/**
 * @since 2.2.0
 */
function tree(value, forest) {
    if (forest === void 0) { forest = empty; }
    return {
        value: value,
        forest: forest
    };
}
exports.tree = tree;
/**
 * @since 2.2.0
 */
function success(a) {
    return Either_1.right(a);
}
exports.success = success;
/**
 * @since 2.2.0
 */
function failure(message) {
    return Either_1.left([tree(message)]);
}
exports.failure = failure;
/**
 * @since 2.2.0
 */
function failures(message, errors) {
    return Either_1.left([tree(message, errors)]);
}
exports.failures = failures;
/**
 * @since 2.2.0
 */
function fromGuard(guard, expected) {
    return {
        decode: function (u) { return (guard.is(u) ? success(u) : failure("cannot decode " + JSON.stringify(u) + ", should be " + expected)); }
    };
}
exports.fromGuard = fromGuard;
/**
 * @since 2.2.0
 */
function literal() {
    var _a;
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    if (values.length === 0) {
        return exports.never;
    }
    var expected = values.map(function (value) { return JSON.stringify(value); }).join(' | ');
    return fromGuard((_a = G.guard).literal.apply(_a, values), expected);
}
exports.literal = literal;
// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
exports.never = fromGuard(G.never, 'never');
/**
 * @since 2.2.0
 */
exports.string = fromGuard(G.string, 'string');
/**
 * @since 2.2.0
 */
exports.number = fromGuard(G.number, 'number');
/**
 * @since 2.2.0
 */
exports.boolean = fromGuard(G.boolean, 'boolean');
/**
 * @since 2.2.0
 */
exports.UnknownArray = fromGuard(G.UnknownArray, 'Array<unknown>');
/**
 * @since 2.2.0
 */
exports.UnknownRecord = fromGuard(G.UnknownRecord, 'Record<string, unknown>');
// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
function withExpected(decoder, expected) {
    return {
        decode: function (u) {
            return pipeable_1.pipe(decoder.decode(u), Either_1.mapLeft(function (nea) { return expected(u, nea); }));
        }
    };
}
exports.withExpected = withExpected;
/**
 * @since 2.2.0
 */
function refinement(from, refinement, expected) {
    return {
        decode: function (u) {
            var e = from.decode(u);
            if (Either_1.isLeft(e)) {
                return e;
            }
            var a = e.right;
            return refinement(a) ? success(a) : failure("cannot refine " + JSON.stringify(u) + ", should be " + expected);
        }
    };
}
exports.refinement = refinement;
/**
 * @since 2.2.0
 */
function parse(from, parser) {
    return {
        decode: function (u) {
            var e = from.decode(u);
            if (Either_1.isLeft(e)) {
                return e;
            }
            var pe = parser(e.right);
            if (Either_1.isLeft(pe)) {
                return failure(pe.left);
            }
            return pe;
        }
    };
}
exports.parse = parse;
/**
 * @since 2.2.0
 */
function nullable(or) {
    return union(literal(null), or);
}
exports.nullable = nullable;
/**
 * @since 2.2.0
 */
function type(properties) {
    return {
        decode: function (u) {
            var e = exports.UnknownRecord.decode(u);
            if (Either_1.isLeft(e)) {
                return e;
            }
            else {
                var r = e.right;
                var a = {};
                for (var k in properties) {
                    var e_1 = properties[k].decode(r[k]);
                    if (Either_1.isLeft(e_1)) {
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
exports.type = type;
/**
 * @since 2.2.0
 */
function partial(properties) {
    return {
        decode: function (u) {
            var e = exports.UnknownRecord.decode(u);
            if (Either_1.isLeft(e)) {
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
                            if (Either_1.isLeft(e_2)) {
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
exports.partial = partial;
/**
 * @since 2.2.0
 */
function record(codomain) {
    return {
        decode: function (u) {
            var e = exports.UnknownRecord.decode(u);
            if (Either_1.isLeft(e)) {
                return e;
            }
            else {
                var r = e.right;
                var a = {};
                for (var k in r) {
                    var e_3 = codomain.decode(r[k]);
                    if (Either_1.isLeft(e_3)) {
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
exports.record = record;
/**
 * @since 2.2.0
 */
function array(items) {
    return {
        decode: function (u) {
            var e = exports.UnknownArray.decode(u);
            if (Either_1.isLeft(e)) {
                return e;
            }
            else {
                var us = e.right;
                var len = us.length;
                var a = new Array(len);
                for (var i = 0; i < len; i++) {
                    var e_4 = items.decode(us[i]);
                    if (Either_1.isLeft(e_4)) {
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
        decode: function (u) {
            var e = exports.UnknownArray.decode(u);
            if (Either_1.isLeft(e)) {
                return e;
            }
            var us = e.right;
            var a = [];
            for (var i = 0; i < components.length; i++) {
                var e_5 = components[i].decode(us[i]);
                if (Either_1.isLeft(e_5)) {
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
exports.tuple = tuple;
function typeOf(x) {
    return x === null ? 'null' : typeof x;
}
/**
 * @internal
 */
function intersect(a, b) {
    if (a !== undefined && b !== undefined) {
        var tx = typeOf(a);
        var ty = typeOf(b);
        if (tx === 'object' || ty === 'object') {
            return Object.assign({}, a, b);
        }
    }
    return b;
}
exports.intersect = intersect;
/**
 * @since 2.2.0
 */
function intersection(left, right) {
    return {
        decode: function (u) {
            var ea = left.decode(u);
            if (Either_1.isLeft(ea)) {
                return ea;
            }
            var eb = right.decode(u);
            if (Either_1.isLeft(eb)) {
                return eb;
            }
            return success(intersect(ea.right, eb.right));
        }
    };
}
exports.intersection = intersection;
/**
 * @since 2.2.0
 */
function lazy(id, f) {
    var get = Schemable_1.memoize(f);
    return {
        decode: function (u) {
            return pipeable_1.pipe(get().decode(u), Either_1.mapLeft(function (nea) { return [tree(id, nea)]; }));
        }
    };
}
exports.lazy = lazy;
/**
 * @since 2.2.0
 */
function sum(tag) {
    return function (members) {
        var keys = Object.keys(members);
        if (keys.length === 0) {
            return exports.never;
        }
        var expected = keys.map(function (k) { return JSON.stringify(k); }).join(' | ');
        return {
            decode: function (u) {
                var e = exports.UnknownRecord.decode(u);
                if (Either_1.isLeft(e)) {
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
exports.sum = sum;
/**
 * @since 2.2.0
 */
function union() {
    var members = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        members[_i] = arguments[_i];
    }
    var len = members.length;
    if (len === 0) {
        return exports.never;
    }
    return {
        decode: function (u) {
            var e = members[0].decode(u);
            if (Either_1.isRight(e)) {
                return e;
            }
            else {
                var forest = [tree("member 0", e.left)];
                for (var i = 1; i < len; i++) {
                    var e_6 = members[i].decode(u);
                    if (Either_1.isRight(e_6)) {
                        return e_6;
                    }
                    else {
                        forest.push(tree("member " + i, e_6.left));
                    }
                }
                return Either_1.left(forest);
            }
        }
    };
}
exports.union = union;
// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------
/**
 * @since 2.2.0
 */
exports.URI = 'Decoder';
/**
 * @since 2.2.0
 */
exports.decoder = {
    URI: exports.URI,
    map: function (fa, f) { return ({
        decode: function (u) { return Either_1.either.map(fa.decode(u), f); }
    }); },
    of: function (a) { return ({
        decode: function () { return success(a); }
    }); },
    ap: function (fab, fa) { return ({
        decode: function (u) { return Either_1.either.ap(fab.decode(u), fa.decode(u)); }
    }); },
    alt: function (fx, fy) { return ({
        decode: function (u) { return Either_1.either.alt(fx.decode(u), function () { return fy().decode(u); }); }
    }); },
    zero: function () { return exports.never; },
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
    lazy: lazy,
    union: union
};
var _a = pipeable_1.pipeable(exports.decoder), alt = _a.alt, ap = _a.ap, apFirst = _a.apFirst, apSecond = _a.apSecond, map = _a.map;
exports.alt = alt;
exports.ap = ap;
exports.apFirst = apFirst;
exports.apSecond = apSecond;
exports.map = map;
