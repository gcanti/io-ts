"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Either_1 = require("fp-ts/lib/Either");
;
;
var Type = (function () {
    function Type(name, validate) {
        this.name = name;
        this.validate = validate;
    }
    Type.prototype.is = function (x) {
        return Either_1.isRight(validate(x, this));
    };
    return Type;
}());
exports.Type = Type;
function getFunctionName(f) {
    return f.displayName || f.name || "<function" + f.length + ">";
}
exports.getFunctionName = getFunctionName;
function getContextEntry(key, type) {
    return { key: key, type: type };
}
function getValidationError(value, context) {
    return { value: value, context: context };
}
function pushAll(xs, ys) {
    Array.prototype.push.apply(xs, ys);
}
function failure(value, context) {
    return new Either_1.Left([getValidationError(value, context)]);
}
exports.failure = failure;
function success(value) {
    return new Either_1.Right(value);
}
exports.success = success;
function getDefaultContext(type) {
    return [{ key: '', type: type }];
}
function validate(value, type) {
    return type.validate(value, getDefaultContext(type));
}
exports.validate = validate;
exports.URI = 'io-ts/Type';
var MapType = (function (_super) {
    __extends(MapType, _super);
    function MapType(name, type, f) {
        var _this = _super.call(this, name, function (v, c) { return type.validate(v, c).map(f); }) || this;
        _this.type = type;
        _this.f = f;
        return _this;
    }
    return MapType;
}(Type));
exports.MapType = MapType;
function map(f, type) {
    return mapWithName(f, type, "(" + type.name + " => ?)");
}
exports.map = map;
function mapWithName(f, type, name) {
    return new MapType(name, type, f);
}
exports.mapWithName = mapWithName;
var GetterType = (function (_super) {
    __extends(GetterType, _super);
    function GetterType(name, type, getter) {
        var _this = _super.call(this, name, function (v, c) { return type.validate(v, c).chain(function (a) { return getter(a).fold(function () { return failure(a, c); }, function (b) { return success(b); }); }); }) || this;
        _this.type = type;
        _this.getter = getter;
        return _this;
    }
    return GetterType;
}(Type));
exports.GetterType = GetterType;
function getter(type, getter, name) {
    return new GetterType(name || "Getter<" + type.name + ", ?>", type, getter);
}
exports.getter = getter;
//
// default types
//
var nullType = new Type('null', function (v, c) { return v === null ? success(v) : failure(v, c); });
exports.null = nullType;
var undefinedType = new Type('undefined', function (v, c) { return v === void 0 ? success(v) : failure(v, c); });
exports.undefined = undefinedType;
exports.any = new Type('any', function (v, _) { return success(v); });
exports.never = new Type('never', function (v, c) { return failure(v, c); });
exports.string = new Type('string', function (v, c) { return typeof v === 'string' ? success(v) : failure(v, c); });
exports.number = new Type('number', function (v, c) { return typeof v === 'number' ? success(v) : failure(v, c); });
exports.boolean = new Type('boolean', function (v, c) { return typeof v === 'boolean' ? success(v) : failure(v, c); });
var arrayType = new Type('Array', function (v, c) { return Array.isArray(v) ? success(v) : failure(v, c); });
exports.Array = arrayType;
exports.Dictionary = new Type('Dictionary', function (v, c) { return v !== null && typeof v === 'object' ? success(v) : failure(v, c); });
var functionType = new Type('Function', function (v, c) { return typeof v === 'function' ? success(v) : failure(v, c); });
exports.Function = functionType;
//
// refinements
//
var RefinementType = (function (_super) {
    __extends(RefinementType, _super);
    function RefinementType(name, validate, type, predicate) {
        var _this = _super.call(this, name, validate) || this;
        _this.type = type;
        _this.predicate = predicate;
        return _this;
    }
    return RefinementType;
}(Type));
exports.RefinementType = RefinementType;
function refinement(type, predicate, name) {
    return new RefinementType(name || "(" + type.name + " | " + getFunctionName(predicate) + ")", function (v, c) { return type.validate(v, c).chain(function (t) { return predicate(t) ? success(t) : failure(v, c); }); }, type, predicate);
}
exports.refinement = refinement;
exports.Integer = refinement(exports.number, function (n) { return n % 1 === 0; }, 'Integer');
//
// literal types
//
var LiteralType = (function (_super) {
    __extends(LiteralType, _super);
    function LiteralType(name, validate, value) {
        var _this = _super.call(this, name, validate) || this;
        _this.value = value;
        return _this;
    }
    return LiteralType;
}(Type));
exports.LiteralType = LiteralType;
function literal(value) {
    return new LiteralType(JSON.stringify(value), function (v, c) { return v === value ? success(value) : failure(v, c); }, value);
}
exports.literal = literal;
//
// keyof types
//
var KeyofType = (function (_super) {
    __extends(KeyofType, _super);
    function KeyofType(name, validate, keys) {
        var _this = _super.call(this, name, validate) || this;
        _this.keys = keys;
        return _this;
    }
    return KeyofType;
}(Type));
exports.KeyofType = KeyofType;
function keyof(map, name) {
    return new KeyofType(name || "(keyof " + JSON.stringify(Object.keys(map)) + ")", function (v, c) { return map.hasOwnProperty(v) ? success(v) : failure(v, c); }, map);
}
exports.keyof = keyof;
//
// recursive types
//
function recursion(name, definition) {
    var Self = new Type(name, function (v, c) { return Result.validate(v, c); });
    var Result = definition(Self);
    Result.name = name;
    return Result;
}
exports.recursion = recursion;
//
// arrays
//
var ArrayType = (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(name, validate, type) {
        var _this = _super.call(this, name, validate) || this;
        _this.type = type;
        return _this;
    }
    return ArrayType;
}(Type));
exports.ArrayType = ArrayType;
function array(type, name) {
    return new ArrayType(name || "Array<" + type.name + ">", function (v, c) { return arrayType.validate(v, c).chain(function (as) {
        var t = [];
        var errors = [];
        var changed = false;
        var _loop_1 = function (i, len) {
            var a = as[i];
            var validation = type.validate(a, c.concat(getContextEntry(String(i), type)));
            validation.fold(function (error) { return pushAll(errors, error); }, function (va) {
                changed = changed || (va !== a);
                t.push(va);
            });
        };
        for (var i = 0, len = as.length; i < len; i++) {
            _loop_1(i, len);
        }
        return errors.length ? new Either_1.Left(errors) : success(changed ? t : as);
    }); }, type);
}
exports.array = array;
var InterfaceType = (function (_super) {
    __extends(InterfaceType, _super);
    function InterfaceType(name, validate, props) {
        var _this = _super.call(this, name, validate) || this;
        _this.props = props;
        return _this;
    }
    return InterfaceType;
}(Type));
exports.InterfaceType = InterfaceType;
function interfaceType(props, name) {
    return new InterfaceType(name || "{ " + Object.keys(props).map(function (k) { return k + ": " + props[k].name; }).join(', ') + " }", function (v, c) { return exports.Dictionary.validate(v, c).chain(function (o) {
        var t = __assign({}, o);
        var errors = [];
        var changed = false;
        var _loop_2 = function (k) {
            var ok = o[k];
            var type = props[k];
            var validation = type.validate(ok, c.concat(getContextEntry(k, type)));
            validation.fold(function (error) { return pushAll(errors, error); }, function (vok) {
                changed = changed || (vok !== ok);
                t[k] = vok;
            });
        };
        for (var k in props) {
            _loop_2(k);
        }
        return errors.length ? new Either_1.Left(errors) : success((changed ? t : o));
    }); }, props);
}
exports.interface = interfaceType;
var PartialType = (function (_super) {
    __extends(PartialType, _super);
    function PartialType(name, validate, props) {
        var _this = _super.call(this, name, validate) || this;
        _this.props = props;
        return _this;
    }
    return PartialType;
}(Type));
exports.PartialType = PartialType;
function partial(props, name) {
    var partials = {};
    for (var k in props) {
        partials[k] = union([props[k], undefinedType]);
    }
    var type = interfaceType(partials);
    return new PartialType(name || type.name, function (v, c) { return type.validate(v, c); }, partials);
}
exports.partial = partial;
//
// dictionaries
//
var DictionaryType = (function (_super) {
    __extends(DictionaryType, _super);
    function DictionaryType(name, validate, domain, codomain) {
        var _this = _super.call(this, name, validate) || this;
        _this.domain = domain;
        _this.codomain = codomain;
        return _this;
    }
    return DictionaryType;
}(Type));
exports.DictionaryType = DictionaryType;
function dictionary(domain, codomain, name) {
    return new DictionaryType(name || "{ [key: " + domain.name + "]: " + codomain.name + " }", function (v, c) { return exports.Dictionary.validate(v, c).chain(function (o) {
        var t = {};
        var errors = [];
        var changed = false;
        var _loop_3 = function (k) {
            var ok = o[k];
            var domainValidation = domain.validate(k, c.concat(getContextEntry(k, domain)));
            var codomainValidation = codomain.validate(ok, c.concat(getContextEntry(k, codomain)));
            domainValidation.fold(function (error) { return pushAll(errors, error); }, function (vk) {
                changed = changed || (vk !== k);
                k = vk;
            });
            codomainValidation.fold(function (error) { return pushAll(errors, error); }, function (vok) {
                changed = changed || (vok !== ok);
                t[k] = vok;
            });
        };
        for (var k in o) {
            _loop_3(k);
        }
        return errors.length ? new Either_1.Left(errors) : success((changed ? t : o));
    }); }, domain, codomain);
}
exports.dictionary = dictionary;
var UnionType = (function (_super) {
    __extends(UnionType, _super);
    function UnionType(name, validate, types) {
        var _this = _super.call(this, name, validate) || this;
        _this.types = types;
        return _this;
    }
    UnionType.prototype.fold = function () {
        var _this = this;
        var matches = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            matches[_i] = arguments[_i];
        }
        return function (value) {
            for (var i = 0, len = matches.length; i < len; i++) {
                var type = _this.types[i];
                var match = matches[i];
                if (type.is(value)) {
                    return match(value);
                }
            }
            throw new Error("Invalid value " + JSON.stringify(value) + " supplied to " + _this.name);
        };
    };
    return UnionType;
}(Type));
exports.UnionType = UnionType;
function union(types, name) {
    return new UnionType(name || "(" + types.map(function (type) { return type.name; }).join(' | ') + ")", function (v, c) {
        for (var i = 0, len = types.length; i < len; i++) {
            var validation = types[i].validate(v, c);
            if (Either_1.isRight(validation)) {
                return validation;
            }
        }
        return failure(v, c);
    }, types);
}
exports.union = union;
//
// intersections
//
var IntersectionType = (function (_super) {
    __extends(IntersectionType, _super);
    function IntersectionType(name, validate, types) {
        var _this = _super.call(this, name, validate) || this;
        _this.types = types;
        return _this;
    }
    return IntersectionType;
}(Type));
exports.IntersectionType = IntersectionType;
function intersection(types, name) {
    return new IntersectionType(name || "(" + types.map(function (type) { return type.name; }).join(' & ') + ")", function (v, c) {
        var t = v;
        var changed = false;
        var errors = [];
        for (var i = 0, len = types.length; i < len; i++) {
            var type = types[i];
            var validation = type.validate(t, c);
            validation.fold(function (error) { return pushAll(errors, error); }, function (vv) {
                changed = changed || (vv !== t);
                t = vv;
            });
        }
        return errors.length ? new Either_1.Left(errors) : success(changed ? t : v);
    }, types);
}
exports.intersection = intersection;
//
// tuples
//
var TupleType = (function (_super) {
    __extends(TupleType, _super);
    function TupleType(name, validate, types) {
        var _this = _super.call(this, name, validate) || this;
        _this.types = types;
        return _this;
    }
    return TupleType;
}(Type));
exports.TupleType = TupleType;
function tuple(types, name) {
    return new TupleType(name || "[" + types.map(function (type) { return type.name; }).join(', ') + "]", function (v, c) { return arrayType.validate(v, c).chain(function (as) {
        var t = [];
        var errors = [];
        var changed = false;
        var _loop_4 = function (i, len) {
            var a = as[i];
            var type = types[i];
            var validation = type.validate(a, c.concat(getContextEntry(String(i), type)));
            validation.fold(function (error) { return pushAll(errors, error); }, function (va) {
                changed = changed || (va !== a);
                t.push(va);
            });
        };
        for (var i = 0, len = types.length; i < len; i++) {
            _loop_4(i, len);
        }
        return errors.length ? new Either_1.Left(errors) : success(changed ? t : as);
    }); }, types);
}
exports.tuple = tuple;
//
// readonly
//
var ReadonlyType = (function (_super) {
    __extends(ReadonlyType, _super);
    function ReadonlyType(name, validate, type) {
        var _this = _super.call(this, name, validate) || this;
        _this.type = type;
        return _this;
    }
    return ReadonlyType;
}(Type));
exports.ReadonlyType = ReadonlyType;
function readonly(type, name) {
    return new ReadonlyType(name || "Readonly<" + type.name + ">", function (v, c) { return type.validate(v, c).map(function (x) {
        if (process.env.NODE_ENV !== 'production') {
            return Object.freeze(x);
        }
        return x;
    }); }, type);
}
exports.readonly = readonly;
//
// readonlyArray
//
var ReadonlyArrayType = (function (_super) {
    __extends(ReadonlyArrayType, _super);
    function ReadonlyArrayType(name, validate, type) {
        var _this = _super.call(this, name, validate) || this;
        _this.type = type;
        return _this;
    }
    return ReadonlyArrayType;
}(Type));
exports.ReadonlyArrayType = ReadonlyArrayType;
function readonlyArray(type, name) {
    var arrayType = array(type);
    return new ReadonlyArrayType(name || "ReadonlyArray<" + type.name + ">", function (v, c) { return arrayType.validate(v, c).map(function (x) {
        if (process.env.NODE_ENV !== 'production') {
            return Object.freeze(x);
        }
        return x;
    }); }, type);
}
exports.readonlyArray = readonlyArray;
//# sourceMappingURL=index.js.map