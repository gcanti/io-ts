import { Either, Left, Right, isRight } from 'fp-ts/lib/Either'
import { Predicate } from 'fp-ts/lib/function'

declare global {
  interface Array<T> {
    _A: T
  }
}

export interface ContextEntry {
  readonly key: string
  readonly type: Any | NeverType
}
export type Context = Array<ContextEntry>
export interface ValidationError {
  readonly value: any
  readonly context: Context
}
export type Errors = Array<ValidationError>
export type Validation<A> = Either<Errors, A>
export type Is<A> = (v: any) => v is A
export type Validate<S, A> = (s: S, context: Context) => Validation<A>
export type Serialize<S, A> = (a: A) => S
export type Any = Type<any, any>
export type TypeOf<RT extends Any> = RT['_A']
export type InputOf<RT extends Any> = RT['_S']

/**
 * Laws:
 * 1. validate(x).fold(() => x, serialize) = x
 * 2. validate(serialize(x)) = Right(x)
 */
export class Type<S, A> {
  // prettier-ignore
  readonly '_A': A
  // prettier-ignore
  readonly '_S': S
  constructor(
    readonly name: string,
    readonly is: Is<A>,
    readonly validate: Validate<S, A>,
    readonly serialize: Serialize<S, A>
  ) {}
  pipe<B>(ab: Type<A, B>, name?: string): Type<S, B> {
    return new Type(
      name || `pipe(${this.name}, ${ab.name})`,
      (v): v is B => this.is(v) && ab.is(v),
      (s, c) => this.validate(s, c).chain(a => ab.validate(a, c)),
      this.serialize === identity && ab.serialize === identity
        ? (identity as any)
        : b => this.serialize(ab.serialize(b))
    )
  }
}

export const identity = <A>(a: A): A => a

export const getFunctionName = (f: any): string => f.displayName || f.name || `<function${f.length}>`

export const getContextEntry = (key: string, type: Any | NeverType): ContextEntry => ({ key, type })

export const getValidationError = (value: any, context: Context): ValidationError => ({ value, context })

export const getDefaultContext = (type: Any): Context => [{ key: '', type }]

export const failures = <T>(errors: Errors): Validation<T> => new Left(errors)

export const failure = <T>(value: any, context: Context): Validation<T> =>
  failures([getValidationError(value, context)])

export const success = <T>(value: T): Validation<T> => new Right<Errors, T>(value)

export const validate = <S, A>(value: S, type: Type<S, A>): Validation<A> =>
  type.validate(value, getDefaultContext(type))

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => Array.prototype.push.apply(xs, ys)

//
// basic types
//

export class NullType extends Type<any, null> {
  readonly _tag: 'NullType' = 'NullType'
  constructor() {
    super('null', (v): v is null => v === null, (s, c) => (this.is(s) ? success(s) : failure(s, c)), identity)
  }
}

/** @alias `null` */
export const nullType: NullType = new NullType()

export class UndefinedType extends Type<any, undefined> {
  readonly _tag: 'UndefinedType' = 'UndefinedType'
  constructor() {
    super(
      'undefined',
      (v): v is undefined => v === void 0,
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

const undefinedType: UndefinedType = new UndefinedType()

export class AnyType extends Type<any, any> {
  readonly _tag: 'AnyType' = 'AnyType'
  constructor() {
    super('any', (_): _ is any => true, success, identity)
  }
}

export const any: AnyType = new AnyType()

export class NeverType extends Type<any, never> {
  readonly _tag: 'NeverType' = 'NeverType'
  constructor() {
    super(
      'never',
      (_): _ is never => false,
      (s, c) => failure(s, c),
      () => {
        throw new Error('cannot serialize never')
      }
    )
  }
}

export const never: NeverType = new NeverType()

export class StringType extends Type<any, string> {
  readonly _tag: 'StringType' = 'StringType'
  constructor() {
    super(
      'string',
      (v): v is string => typeof v === 'string',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const string: StringType = new StringType()

export class NumberType extends Type<any, number> {
  readonly _tag: 'NumberType' = 'NumberType'
  constructor() {
    super(
      'number',
      (v): v is number => typeof v === 'number',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const number: NumberType = new NumberType()

export class BooleanType extends Type<any, boolean> {
  readonly _tag: 'BooleanType' = 'BooleanType'
  constructor() {
    super(
      'boolean',
      (v): v is boolean => typeof v === 'boolean',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const boolean: BooleanType = new BooleanType()

export class AnyArrayType extends Type<any, Array<any>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor() {
    super(
      'Array',
      (v): v is Array<any> => Array.isArray(v),
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

const arrayType: AnyArrayType = new AnyArrayType()

export class AnyDictionaryType extends Type<any, { [key: string]: any }> {
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  constructor() {
    super(
      'Dictionary',
      (v): v is { [key: string]: any } => v !== null && typeof v === 'object',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const Dictionary: AnyDictionaryType = new AnyDictionaryType()

export class ObjectType extends Type<any, object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super('object', Dictionary.is, Dictionary.validate, identity)
  }
}

export const object: ObjectType = new ObjectType()

export class FunctionType extends Type<any, Function> {
  readonly _tag: 'FunctionType' = 'FunctionType'
  constructor() {
    super(
      'Function',
      (v): v is Function => typeof v === 'function',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const Function: FunctionType = new FunctionType()

//
// refinements
//

export class RefinementType<RT extends Any> extends Type<InputOf<RT>, TypeOf<RT>> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(name: string, readonly type: RT, readonly predicate: Predicate<TypeOf<RT>>) {
    super(
      name,
      (v): v is TypeOf<RT> => type.is(v) && predicate(v),
      (s, c) => type.validate(s, c).chain(a => (predicate(a) ? success(a) : failure(a, c))),
      type.serialize
    )
  }
}

export const refinement = <RT extends Any>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name: string = `(${type.name} | ${getFunctionName(predicate)})`
): RefinementType<RT> => new RefinementType(name, type, predicate)

export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

//
// literals
//

export class LiteralType<V extends string | number | boolean> extends Type<any, V> {
  readonly _tag: 'LiteralType' = 'LiteralType'
  constructor(name: string, readonly value: V) {
    super(name, (v): v is V => v === value, (s, c) => (this.is(s) ? success(value) : failure(s, c)), identity)
  }
}

export const literal = <V extends string | number | boolean>(
  value: V,
  name: string = JSON.stringify(value)
): LiteralType<V> => new LiteralType(name, value)

//
// keyof
//

export class KeyofType<D extends { [key: string]: any }> extends Type<any, keyof D> {
  readonly _tag: 'KeyofType' = 'KeyofType'
  constructor(name: string, readonly keys: D) {
    super(
      name,
      (v): v is keyof D => string.is(v) && keys.hasOwnProperty(v),
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const keyof = <D extends { [key: string]: any }>(
  keys: D,
  name: string = `(keyof ${JSON.stringify(Object.keys(keys))})`
): KeyofType<D> => new KeyofType(name, keys)

//
// recursive types
//

export class RecursiveType<A> extends Type<any, A> {
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  readonly type: Any
  constructor(name: string, is: Is<A>, validate: Validate<any, A>, serialize: Serialize<any, A>) {
    super(name, is, validate, serialize)
  }
}

export const recursion = <A>(name: string, definition: (self: Any) => Any): RecursiveType<A> => {
  const Self: any = new RecursiveType<A>(name, (v): v is A => type.is(v), (s, c) => type.validate(s, c), identity)
  const type = definition(Self)
  Self.type = type
  Self.serialize = type.serialize
  return Self
}

//
// arrays
//

export class ArrayType<RT extends Any> extends Type<any, Array<TypeOf<RT>>> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(
    name: string,
    is: ArrayType<RT>['is'],
    validate: ArrayType<RT>['validate'],
    serialize: ArrayType<RT>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const array = <RT extends Any>(type: RT, name: string = `Array<${type.name}>`): ArrayType<RT> =>
  new ArrayType(
    name,
    (v): v is Array<TypeOf<RT>> => arrayType.is(v) && v.every(type.is),
    (s, c) =>
      arrayType.validate(s, c).chain(xs => {
        const a: Array<TypeOf<RT>> = []
        const errors: Errors = []
        let changed = false
        for (let i = 0; i < xs.length; i++) {
          const x = xs[i]
          const validation = type.validate(x, c.concat(getContextEntry(String(i), type)))
          validation.fold(
            e => pushAll(errors, e),
            vx => {
              changed = changed || vx !== x
              a.push(vx)
            }
          )
        }
        return errors.length ? failures(errors) : success(changed ? a : xs)
      }),
    type.serialize === identity ? identity : a => a.map(type.serialize),
    type
  )

//
// interfaces
//

export type Props = { [key: string]: Any }

export type InterfaceOf<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }

export class InterfaceType<P extends Props> extends Type<any, InterfaceOf<P>> {
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  constructor(
    name: string,
    is: InterfaceType<P>['is'],
    validate: InterfaceType<P>['validate'],
    serialize: InterfaceType<P>['serialize'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

const useIdentity = (props: Props): boolean => {
  for (let k in props) {
    if (props[k].serialize !== identity) {
      return false
    }
  }
  return true
}

/** @alias `interface` */
export const type = <P extends Props>(props: P, name: string = getNameFromProps(props)): InterfaceType<P> =>
  new InterfaceType(
    name,
    (v): v is InterfaceOf<P> => {
      if (!Dictionary.is(v)) {
        return false
      }
      for (let k in props) {
        if (!props[k].is(v[k])) {
          return false
        }
      }
      return true
    },
    (s, c) =>
      Dictionary.validate(s, c).chain(o => {
        const a = { ...o }
        const errors: Errors = []
        let changed = false
        for (let k in props) {
          const ok = o[k]
          const type = props[k]
          const validation = type.validate(ok, c.concat(getContextEntry(k, type)))
          validation.fold(
            e => pushAll(errors, e),
            vok => {
              changed = changed || vok !== ok
              a[k] = vok
            }
          )
        }
        return errors.length ? failures(errors) : success((changed ? a : o) as any)
      }),
    useIdentity(props)
      ? identity
      : a => {
          const s: { [x: string]: any } = { ...(a as any) }
          for (let k in props) {
            s[k] = props[k].serialize(a[k])
          }
          return s
        },
    props
  )

//
// partials
//

export type PartialOf<P extends Props> = { [K in keyof P]?: TypeOf<P[K]> }

export class PartialType<P extends Props> extends Type<any, PartialOf<P>> {
  readonly _tag: 'PartialType' = 'PartialType'
  constructor(
    name: string,
    is: PartialType<P>['is'],
    validate: PartialType<P>['validate'],
    serialize: PartialType<P>['serialize'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

export const partial = <P extends Props>(
  props: P,
  name: string = `PartialType<${getNameFromProps(props)}>`
): PartialType<P> => {
  const partials: Props = {}
  for (let k in props) {
    partials[k] = union([props[k], undefinedType])
  }
  const partial = type(partials)
  return new PartialType(
    name,
    (v): v is PartialOf<P> => partial.is(v),
    (s, c) => partial.validate(s, c) as any,
    useIdentity(props)
      ? identity
      : a => {
          const s: { [key: string]: any } = {}
          for (let k in props) {
            const ak = a[k]
            if (ak !== undefined) {
              s[k] = props[k].serialize(ak)
            }
          }
          return s
        },
    props
  )
}

//
// dictionaries
//

export class DictionaryType<D extends Any, C extends Any> extends Type<any, { [K in TypeOf<D>]: TypeOf<C> }> {
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  constructor(
    name: string,
    is: DictionaryType<D, C>['is'],
    validate: DictionaryType<D, C>['validate'],
    serialize: DictionaryType<D, C>['serialize'],
    readonly domain: D,
    readonly codomain: C
  ) {
    super(name, is, validate, serialize)
  }
}

export const dictionary = <D extends Any, C extends Any>(
  domain: D,
  codomain: C,
  name: string = `{ [K in ${domain.name}]: ${codomain.name} }`
): DictionaryType<D, C> =>
  new DictionaryType(
    name,
    (v): v is { [K in TypeOf<D>]: TypeOf<C> } =>
      Dictionary.is(v) && Object.keys(v).every(k => domain.is(k) && codomain.is(v[k])),
    (s, c) =>
      Dictionary.validate(s, c).chain(o => {
        const a: { [key: string]: any } = {}
        const errors: Errors = []
        let changed = false
        for (let k in o) {
          const ok = o[k]
          const domainValidation = domain.validate(k, c.concat(getContextEntry(k, domain)))
          const codomainValidation = codomain.validate(ok, c.concat(getContextEntry(k, codomain)))
          domainValidation.fold(
            e => pushAll(errors, e),
            vk => {
              changed = changed || vk !== k
              k = vk
            }
          )
          codomainValidation.fold(
            e => pushAll(errors, e),
            vok => {
              changed = changed || vok !== ok
              a[k] = vok
            }
          )
        }
        return errors.length ? failures(errors) : success((changed ? a : o) as any)
      }),
    domain.serialize === identity && codomain.serialize === identity
      ? identity
      : a => {
          const s: { [key: string]: any } = {}
          for (let k in a) {
            s[domain.serialize(k)] = codomain.serialize((a as any)[k])
          }
          return s
        },
    domain,
    codomain
  )

//
// unions
//

export class UnionType<RTS extends Array<Any>> extends Type<any, TypeOf<RTS['_A']>> {
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(
    name: string,
    is: UnionType<RTS>['is'],
    validate: UnionType<RTS>['validate'],
    serialize: UnionType<RTS>['serialize'],
    readonly types: RTS
  ) {
    super(name, is, validate, serialize)
  }
}

export const union = <RTS extends Array<Any>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' | ')})`
): UnionType<RTS> =>
  new UnionType(
    name,
    (v): v is TypeOf<RTS['_A']> => types.some(type => type.is(v)),
    (s, c) => {
      const errors: Errors = []
      for (let i = 0; i < types.length; i++) {
        const type = types[i]
        const validation = type.validate(s, c.concat(getContextEntry(String(i), type)))
        if (isRight(validation)) {
          return validation
        } else {
          pushAll(errors, validation.value)
        }
      }
      return failures(errors)
    },
    types.every(type => type.serialize === identity)
      ? identity
      : a => {
          for (let i = 0; i < types.length; i++) {
            const type = types[i]
            if (type.is(a)) {
              return type.serialize(a)
            }
          }
          return a
        },
    types
  )

//
// intersections
//

export class IntersectionType<RTS extends Array<Any>, A> extends Type<any, A> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(name: string, is: Is<A>, validate: Validate<any, A>, serialize: Serialize<any, A>, readonly types: RTS) {
    super(name, is, validate, serialize)
  }
}

export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
  types: [A, B, C, D, E],
  name?: string
): IntersectionType<[A, B, C, D, E], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any>(
  types: [A, B, C, D],
  name?: string
): IntersectionType<[A, B, C, D], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D>>
export function intersection<A extends Any, B extends Any, C extends Any>(
  types: [A, B, C],
  name?: string
): IntersectionType<[A, B, C], TypeOf<A> & TypeOf<B> & TypeOf<C>>
export function intersection<A extends Any, B extends Any>(
  types: [A, B],
  name?: string
): IntersectionType<[A, B], TypeOf<A> & TypeOf<B>>
export function intersection<A extends Any>(types: [A], name?: string): IntersectionType<[A], TypeOf<A>>
export function intersection<RTS extends Array<Any>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' & ')})`
): IntersectionType<RTS, any> {
  return new IntersectionType(
    name,
    (v): v is any => types.every(type => type.is(v)),
    (s, c) => {
      let a = s
      let changed = false
      const errors: Errors = []
      for (let i = 0; i < types.length; i++) {
        const type = types[i]
        const validation = type.validate(a, c)
        validation.fold(
          e => pushAll(errors, e),
          va => {
            changed = changed || va !== a
            a = va
          }
        )
      }
      return errors.length ? failures(errors) : success(changed ? a : s)
    },
    types.every(type => type.serialize === identity)
      ? identity
      : a => {
          let s = a
          for (let i = 0; i < types.length; i++) {
            const type = types[i]
            s = type.serialize(s)
          }
          return s
        },
    types
  )
}

//
// tuples
//

export class TupleType<RTS extends Array<Any>, A> extends Type<any, A> {
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(name: string, is: Is<A>, validate: Validate<any, A>, serialize: Serialize<any, A>, readonly types: RTS) {
    super(name, is, validate, serialize)
  }
}

export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(
  types: [A, B, C, D, E],
  name?: string
): TupleType<[A, B, C, D, E], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>, TypeOf<E>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any>(
  types: [A, B, C, D],
  name?: string
): TupleType<[A, B, C, D], [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>]>
export function tuple<A extends Any, B extends Any, C extends Any>(
  types: [A, B, C],
  name?: string
): TupleType<[A, B, C], [TypeOf<A>, TypeOf<B>, TypeOf<C>]>
export function tuple<A extends Any, B extends Any>(
  types: [A, B],
  name?: string
): TupleType<[A, B], [TypeOf<A>, TypeOf<B>]>
export function tuple<A extends Any>(types: [A], name?: string): TupleType<[A], [TypeOf<A>]>
export function tuple<RTS extends Array<Any>>(
  types: RTS,
  name: string = `[${types.map(type => type.name).join(', ')}]`
): TupleType<RTS, any> {
  const len = types.length
  return new TupleType(
    name,
    (v): v is any => arrayType.is(v) && v.length === len && types.every((type, i) => type.is(v[i])),
    (s, c) =>
      arrayType.validate(s, c).chain(as => {
        const t: Array<any> = []
        const errors: Errors = []
        let changed = false
        for (let i = 0; i < len; i++) {
          const a = as[i]
          const type = types[i]
          const validation = type.validate(a, c.concat(getContextEntry(String(i), type)))
          validation.fold(
            e => pushAll(errors, e),
            va => {
              changed = changed || va !== a
              t.push(va)
            }
          )
        }
        if (as.length > len) {
          errors.push(getValidationError(as[len], c.concat(getContextEntry(String(len), never))))
        }
        return errors.length ? failures(errors) : success((changed ? t : as) as any)
      }),
    types.every(type => type.serialize === identity)
      ? identity
      : (a: Array<any>) => types.map((type, i) => type.serialize(a[i])),
    types
  )
}

//
// readonly objects
//

export class ReadonlyType<RT extends Any> extends Type<any, Readonly<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(
    name: string,
    is: ReadonlyType<RT>['is'],
    validate: ReadonlyType<RT>['validate'],
    serialize: ReadonlyType<RT>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const readonly = <RT extends Any>(type: RT, name: string = `Readonly<${type.name}>`): ReadonlyType<RT> =>
  new ReadonlyType(
    name,
    type.is,
    (s, c) =>
      type.validate(s, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        }
        return x
      }),
    type.serialize === identity ? identity : type.serialize,
    type
  )

//
// readonly arrays
//

export class ReadonlyArrayType<RT extends Any> extends Type<any, ReadonlyArray<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(
    name: string,
    is: ReadonlyArrayType<RT>['is'],
    validate: ReadonlyArrayType<RT>['validate'],
    serialize: ReadonlyArrayType<RT>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const readonlyArray = <RT extends Any>(
  type: RT,
  name: string = `ReadonlyArray<${type.name}>`
): ReadonlyArrayType<RT> => {
  const arrayType = array(type)
  return new ReadonlyArrayType(
    name,
    (v): v is ReadonlyArray<TypeOf<RT>> => arrayType.is(v),
    (s, c) =>
      arrayType.validate(s, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        } else {
          return x
        }
      }),
    arrayType.serialize as any,
    type
  )
}

//
// strict interfaces
//

export class StrictType<P extends Props> extends Type<any, InterfaceOf<P>> {
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(
    name: string,
    is: StrictType<P>['is'],
    validate: StrictType<P>['validate'],
    serialize: StrictType<P>['serialize'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

/** Specifies that only the given interface properties are allowed */
export const strict = <P extends Props>(
  props: P,
  name: string = `StrictType<${getNameFromProps(props)}>`
): StrictType<P> => {
  const loose = type(props)
  const len = Object.keys(props).length
  return new StrictType(
    name,
    (v): v is InterfaceOf<P> => loose.is(v) && Object.getOwnPropertyNames(v).every(k => props.hasOwnProperty(k)),
    (s, c) =>
      loose.validate(s, c).chain(o => {
        const keys = Object.getOwnPropertyNames(o)
        if (keys.length !== len) {
          const errors: Errors = []
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i]
            if (!props.hasOwnProperty(key)) {
              errors.push(getValidationError(o[key], c.concat(getContextEntry(key, never))))
            }
          }
          return errors.length ? failures(errors) : failure(o, c)
        } else {
          return success(o)
        }
      }),
    loose.serialize,
    props
  )
}

export { nullType as null, undefinedType as undefined, arrayType as Array, type as interface }
