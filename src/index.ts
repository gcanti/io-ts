import { Either, Left, Right } from 'fp-ts/lib/Either'

import { Predicate } from 'fp-ts/lib/function'

declare global {
  interface Array<T> {
    _A: T
  }
}

export type mixed = object | number | string | boolean | symbol | undefined | null

export interface ContextEntry {
  readonly key: string
  readonly type: Decoder<any, any>
}
export type Context = Array<ContextEntry>
export interface ValidationError {
  readonly value: mixed
  readonly context: Context
}
export type Errors = Array<ValidationError>
export type Validation<A> = Either<Errors, A>
export type Is<A> = (v: mixed) => v is A
export type Validate<S, A> = (s: S, context: Context) => Validation<A>
export type Serialize<S, A> = (a: A) => S
export type Any = Type<mixed, any>
export type TypeOf<RT extends Type<any, any>> = RT['_A']
export type InputOf<RT extends Type<any, any>> = RT['_S']

export interface Decoder<S, A> {
  readonly name: string
  readonly validate: Validate<S, A>
}

export interface Encoder<S, A> {
  readonly serialize: Serialize<S, A>
}

/**
 * Laws:
 * 1. validate(x, T).fold(() => x, T.serialize) = x
 * 2. validate(T.serialize(x), T) = Right(x)
 *
 * where `T` is a runtime type
 */
export class Type<S, A> implements Decoder<S, A>, Encoder<S, A> {
  // prettier-ignore
  readonly '_A': A
  // prettier-ignore
  readonly '_S': S
  constructor(
    /** a unique name for this runtime type */
    readonly name: string,
    /** a custom type guard */
    readonly is: Is<A>,
    /** succeeds if a value of type S can be decoded to a value of type A */
    readonly validate: Validate<S, A>,
    /** converts a value of type A to a value of type S */
    readonly serialize: Serialize<S, A>
  ) {}
  pipe<B>(ab: Type<A, B>, name?: string): Type<S, B> {
    return new Type(
      name || `pipe(${this.name}, ${ab.name})`,
      ab.is,
      (s, c) => this.validate(s, c).chain(a => ab.validate(a, c)),
      this.serialize === identity && ab.serialize === identity
        ? (identity as any)
        : b => this.serialize(ab.serialize(b))
    )
  }
  asDecoder(): Decoder<S, A> {
    return this
  }
  asEncoder(): Encoder<S, A> {
    return this
  }
}

export const identity = <A>(a: A): A => a

export const getFunctionName = (f: Function): string =>
  (f as any).displayName || (f as any).name || `<function${f.length}>`

export const getContextEntry = (key: string, type: Decoder<any, any>): ContextEntry => ({ key, type })

export const getValidationError = (value: mixed, context: Context): ValidationError => ({ value, context })

export const getDefaultContext = (type: Decoder<any, any>): Context => [{ key: '', type }]

export const appendContext = (c: Context, key: string, type: Decoder<any, any>): Context => {
  const len = c.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = c[i]
  }
  r[len] = { key, type }
  return r
}

export const failures = <T>(errors: Errors): Validation<T> => new Left(errors)

export const failure = <T>(value: mixed, context: Context): Validation<T> =>
  failures([getValidationError(value, context)])

export const success = <T>(value: T): Validation<T> => new Right<Errors, T>(value)

export const validate = <S, A>(value: S, type: Decoder<S, A>): Validation<A> =>
  type.validate(value, getDefaultContext(type))

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => Array.prototype.push.apply(xs, ys)

//
// basic types
//

export class NullType extends Type<mixed, null> {
  readonly _tag: 'NullType' = 'NullType'
  constructor() {
    super('null', (v): v is null => v === null, (s, c) => (this.is(s) ? success(s) : failure(s, c)), identity)
  }
}

/** @alias `null` */
export const nullType: NullType = new NullType()

export class UndefinedType extends Type<mixed, undefined> {
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

export class NeverType extends Type<mixed, never> {
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

export class StringType extends Type<mixed, string> {
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

export class NumberType extends Type<mixed, number> {
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

export class BooleanType extends Type<mixed, boolean> {
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

export class AnyArrayType extends Type<mixed, Array<mixed>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor() {
    super('Array', Array.isArray, (s, c) => (this.is(s) ? success(s) : failure(s, c)), identity)
  }
}

const arrayType: AnyArrayType = new AnyArrayType()

export class AnyDictionaryType extends Type<mixed, { [key: string]: mixed }> {
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  constructor() {
    super(
      'Dictionary',
      (v): v is { [key: string]: mixed } => v !== null && typeof v === 'object',
      (s, c) => (this.is(s) ? success(s) : failure(s, c)),
      identity
    )
  }
}

export const Dictionary: AnyDictionaryType = new AnyDictionaryType()

export class ObjectType extends Type<mixed, object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super('object', Dictionary.is, Dictionary.validate, identity)
  }
}

export const object: ObjectType = new ObjectType()

export class FunctionType extends Type<mixed, Function> {
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

export class RefinementType<RT extends Type<any, any>, S, A> extends Type<S, A> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(
    name: string,
    is: RefinementType<RT, S, A>['is'],
    validate: RefinementType<RT, S, A>['validate'],
    serialize: RefinementType<RT, S, A>['serialize'],
    readonly type: RT,
    readonly predicate: Predicate<A>
  ) {
    super(name, is, validate, serialize)
  }
}

export const refinement = <RT extends Type<any, any>>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name: string = `(${type.name} | ${getFunctionName(predicate)})`
): RefinementType<RT, InputOf<RT>, TypeOf<RT>> =>
  new RefinementType(
    name,
    (v): v is TypeOf<RT> => type.is(v) && predicate(v),
    (s, c) => type.validate(s, c).chain(a => (predicate(a) ? success(a) : failure(a, c))),
    type.serialize,
    type,
    predicate
  )

export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

//
// literals
//

export class LiteralType<V extends string | number | boolean> extends Type<mixed, V> {
  readonly _tag: 'LiteralType' = 'LiteralType'
  constructor(
    name: string,
    is: LiteralType<V>['is'],
    validate: LiteralType<V>['validate'],
    serialize: LiteralType<V>['serialize'],
    readonly value: V
  ) {
    super(name, is, validate, serialize)
  }
}

export const literal = <V extends string | number | boolean>(
  value: V,
  name: string = JSON.stringify(value)
): LiteralType<V> => {
  const is = (v: mixed): v is V => v === value
  return new LiteralType(name, is, (s, c) => (is(s) ? success(value) : failure(s, c)), identity, value)
}

//
// keyof
//

export class KeyofType<D extends { [key: string]: any }> extends Type<mixed, keyof D> {
  readonly _tag: 'KeyofType' = 'KeyofType'
  constructor(
    name: string,
    is: KeyofType<D>['is'],
    validate: KeyofType<D>['validate'],
    serialize: KeyofType<D>['serialize'],
    readonly keys: D
  ) {
    super(name, is, validate, serialize)
  }
}

export const keyof = <D extends { [key: string]: any }>(
  keys: D,
  name: string = `(keyof ${JSON.stringify(Object.keys(keys))})`
): KeyofType<D> => {
  const is = (v: mixed): v is keyof D => string.is(v) && keys.hasOwnProperty(v)
  return new KeyofType(name, is, (s, c) => (is(s) ? success(s) : failure(s, c)), identity, keys)
}

//
// recursive types
//

export class RecursiveType<RT extends Any, A> extends Type<mixed, A> {
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  constructor(
    name: string,
    is: RecursiveType<RT, A>['is'],
    validate: RecursiveType<RT, A>['validate'],
    serialize: RecursiveType<RT, A>['serialize'],
    private runDefinition: () => RT
  ) {
    super(name, is, validate, serialize)
  }
  get type(): RT {
    return this.runDefinition()
  }
}

export const recursion = <A, RT extends Type<mixed, A> = Type<mixed, A>>(
  name: string,
  definition: (self: RT) => RT
): RecursiveType<RT, A> => {
  let cache: RT
  const runDefinition = (): RT => {
    if (!cache) {
      cache = definition(Self)
    }
    return cache
  }
  const Self: any = new RecursiveType<RT, A>(
    name,
    (m): m is A => runDefinition().is(m),
    (m, c) => runDefinition().validate(m, c),
    a => runDefinition().serialize(a),
    runDefinition
  )
  return Self
}

//
// arrays
//

export class ArrayType<RT extends Any, A> extends Type<mixed, A> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(
    name: string,
    is: ArrayType<RT, A>['is'],
    validate: ArrayType<RT, A>['validate'],
    serialize: ArrayType<RT, A>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const array = <RT extends Any>(
  type: RT,
  name: string = `Array<${type.name}>`
): ArrayType<RT, Array<TypeOf<RT>>> =>
  new ArrayType(
    name,
    (v): v is Array<TypeOf<RT>> => arrayType.is(v) && v.every(type.is),
    (s, c) =>
      arrayType.validate(s, c).chain(xs => {
        const len = xs.length
        let a: Array<TypeOf<RT>> = xs
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const x = xs[i]
          const validation = type.validate(x, appendContext(c, String(i), type))
          validation.fold(
            e => pushAll(errors, e),
            vx => {
              if (vx !== x) {
                if (a === xs) {
                  a = xs.slice()
                }
                a[i] = vx
              }
            }
          )
        }
        return errors.length ? failures(errors) : success(a)
      }),
    type.serialize === identity ? identity : a => a.map(type.serialize),
    type
  )

//
// interfaces
//

export type Props = { [key: string]: Any }

export type InterfaceOf<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }

export class InterfaceType<P extends Props, A> extends Type<mixed, A> {
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  constructor(
    name: string,
    is: InterfaceType<P, A>['is'],
    validate: InterfaceType<P, A>['validate'],
    serialize: InterfaceType<P, A>['serialize'],
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
export const type = <P extends Props>(
  props: P,
  name: string = getNameFromProps(props)
): InterfaceType<P, InterfaceOf<P>> =>
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
        let a = o
        const errors: Errors = []
        for (let k in props) {
          const ok = o[k]
          const type = props[k]
          const validation = type.validate(ok, appendContext(c, k, type))
          validation.fold(
            e => pushAll(errors, e),
            vok => {
              if (vok !== ok) {
                if (a === o) {
                  a = { ...o }
                }
                a[k] = vok
              }
            }
          )
        }
        return errors.length ? failures(errors) : success(a as any)
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

export class PartialType<P extends Props, A> extends Type<mixed, A> {
  readonly _tag: 'PartialType' = 'PartialType'
  constructor(
    name: string,
    is: PartialType<P, A>['is'],
    validate: PartialType<P, A>['validate'],
    serialize: PartialType<P, A>['serialize'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

export const partial = <P extends Props>(
  props: P,
  name: string = `PartialType<${getNameFromProps(props)}>`
): PartialType<P, PartialOf<P>> => {
  const partials: Props = {}
  for (let k in props) {
    partials[k] = union([props[k], undefinedType])
  }
  const partial = type(partials)
  return new PartialType(
    name,
    partial.is as any,
    partial.validate as any,
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

export class DictionaryType<D extends Any, C extends Any, A> extends Type<mixed, A> {
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  constructor(
    name: string,
    is: DictionaryType<D, C, A>['is'],
    validate: DictionaryType<D, C, A>['validate'],
    serialize: DictionaryType<D, C, A>['serialize'],
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
): DictionaryType<D, C, { [K in TypeOf<D>]: TypeOf<C> }> =>
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
          const domainValidation = domain.validate(k, appendContext(c, k, domain))
          const codomainValidation = codomain.validate(ok, appendContext(c, k, codomain))
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
            s[String(domain.serialize(k))] = codomain.serialize(a[k])
          }
          return s
        },
    domain,
    codomain
  )

//
// unions
//

export class UnionType<RTS extends Array<Any>, A> extends Type<mixed, A> {
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(
    name: string,
    is: UnionType<RTS, A>['is'],
    validate: UnionType<RTS, A>['validate'],
    serialize: UnionType<RTS, A>['serialize'],
    readonly types: RTS
  ) {
    super(name, is, validate, serialize)
  }
}

export const union = <RTS extends Array<Any>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' | ')})`
): UnionType<RTS, TypeOf<RTS['_A']>> => {
  const len = types.length
  return new UnionType(
    name,
    (v): v is TypeOf<RTS['_A']> => types.some(type => type.is(v)),
    (s, c) => {
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type.validate(s, appendContext(c, String(i), type))
        if (validation.isRight()) {
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
          let i = 0
          for (; i < len - 1; i++) {
            const type = types[i]
            if (type.is(a)) {
              return type.serialize(a)
            }
          }
          return types[i].serialize(a)
        },
    types
  )
}

//
// intersections
//

export class IntersectionType<RTS extends Array<Any>, A> extends Type<mixed, A> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(
    name: string,
    is: IntersectionType<RTS, A>['is'],
    validate: IntersectionType<RTS, A>['validate'],
    serialize: IntersectionType<RTS, A>['serialize'],
    readonly types: RTS
  ) {
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
  const len = types.length
  return new IntersectionType(
    name,
    (v): v is any => types.every(type => type.is(v)),
    (s, c) => {
      let a = s
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type.validate(a, c)
        validation.fold(e => pushAll(errors, e), va => (a = va))
      }
      return errors.length ? failures(errors) : success(a)
    },
    types.every(type => type.serialize === identity)
      ? identity
      : a => {
          let s = a
          for (let i = 0; i < len; i++) {
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

export class TupleType<RTS extends Array<Any>, A> extends Type<mixed, A> {
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(
    name: string,
    is: TupleType<RTS, A>['is'],
    validate: TupleType<RTS, A>['validate'],
    serialize: TupleType<RTS, A>['serialize'],
    readonly types: RTS
  ) {
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
        let t: Array<any> = as
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const a = as[i]
          const type = types[i]
          const validation = type.validate(a, appendContext(c, String(i), type))
          validation.fold(
            e => pushAll(errors, e),
            va => {
              if (va !== a) {
                if (t === as) {
                  t = as.slice()
                }
                t[i] = va
              }
            }
          )
        }
        if (as.length > len) {
          errors.push(getValidationError(as[len], appendContext(c, String(len), never)))
        }
        return errors.length ? failures(errors) : success(t)
      }),
    types.every(type => type.serialize === identity) ? identity : a => types.map((type, i) => type.serialize(a[i])),
    types
  )
}

//
// readonly objects
//

export class ReadonlyType<RT extends Any, A> extends Type<mixed, A> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(
    name: string,
    is: ReadonlyType<RT, A>['is'],
    validate: ReadonlyType<RT, A>['validate'],
    serialize: ReadonlyType<RT, A>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const readonly = <RT extends Any>(
  type: RT,
  name: string = `Readonly<${type.name}>`
): ReadonlyType<RT, Readonly<TypeOf<RT>>> =>
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

export class ReadonlyArrayType<RT extends Any, A> extends Type<mixed, A> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(
    name: string,
    is: ReadonlyArrayType<RT, A>['is'],
    validate: ReadonlyArrayType<RT, A>['validate'],
    serialize: ReadonlyArrayType<RT, A>['serialize'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const readonlyArray = <RT extends Any>(
  type: RT,
  name: string = `ReadonlyArray<${type.name}>`
): ReadonlyArrayType<RT, ReadonlyArray<TypeOf<RT>>> => {
  const arrayType = array(type)
  return new ReadonlyArrayType(
    name,
    arrayType.is,
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

export class StrictType<P extends Props, A> extends Type<mixed, A> {
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(
    name: string,
    is: StrictType<P, A>['is'],
    validate: StrictType<P, A>['validate'],
    serialize: StrictType<P, A>['serialize'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

/** Specifies that only the given interface properties are allowed */
export const strict = <P extends Props>(
  props: P,
  name: string = `StrictType<${getNameFromProps(props)}>`
): StrictType<P, InterfaceOf<P>> => {
  const loose = type(props)
  return new StrictType(
    name,
    (v): v is InterfaceOf<P> => loose.is(v) && Object.getOwnPropertyNames(v).every(k => props.hasOwnProperty(k)),
    (s, c) =>
      loose.validate(s, c).chain(o => {
        const keys = Object.getOwnPropertyNames(o)
        const len = keys.length
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const key = keys[i]
          if (!props.hasOwnProperty(key)) {
            errors.push(getValidationError(o[key], appendContext(c, key, never)))
          }
        }
        return errors.length ? failures(errors) : success(o)
      }),
    loose.serialize,
    props
  )
}

//
// tagged unions
//

export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralType<any> }
export interface TaggedRefinement<Tag extends string, A> extends RefinementType<Tagged<Tag>, mixed, A> {}
export interface TaggedUnion<Tag extends string, A> extends UnionType<Array<Tagged<Tag>>, A> {}
export type TaggedIntersectionArgument<Tag extends string> =
  | [Tagged<Tag>]
  | [Tagged<Tag>, Any]
  | [Any, Tagged<Tag>]
  | [Tagged<Tag>, Any, Any]
  | [Any, Tagged<Tag>, Any]
  | [Any, Any, Tagged<Tag>]
  | [Tagged<Tag>, Any, Any, Any]
  | [Any, Tagged<Tag>, Any, Any]
  | [Any, Any, Tagged<Tag>, Any]
  | [Any, Any, Any, Tagged<Tag>]
  | [Tagged<Tag>, Any, Any, Any, Any]
  | [Any, Tagged<Tag>, Any, Any, Any]
  | [Any, Any, Tagged<Tag>, Any, Any]
  | [Any, Any, Any, Tagged<Tag>, Any]
  | [Any, Any, Any, Any, Tagged<Tag>]
export interface TaggedIntersection<Tag extends string, A>
  extends IntersectionType<TaggedIntersectionArgument<Tag>, A> {}
export type Tagged<Tag extends string, A = any> =
  | InterfaceType<TaggedProps<Tag>, A>
  | StrictType<TaggedProps<Tag>, A>
  | TaggedRefinement<Tag, A>
  | TaggedUnion<Tag, A>
  | TaggedIntersection<Tag, A>

const isTagged = <Tag extends string>(tag: Tag): ((type: Any) => type is Tagged<Tag>) => {
  const f = (type: Any): type is Tagged<Tag> => {
    if (type instanceof InterfaceType || type instanceof StrictType) {
      return type.props.hasOwnProperty(tag)
    } else if (type instanceof IntersectionType) {
      return type.types.some(f)
    } else if (type instanceof UnionType) {
      return type.types.every(f)
    } else if (type instanceof RefinementType) {
      return f(type.type)
    } else {
      return false
    }
  }
  return f
}

const findTagged = <Tag extends string>(tag: Tag, types: TaggedIntersectionArgument<Tag>): Tagged<Tag> => {
  const len = types.length
  const is = isTagged(tag)
  let i = 0
  for (; i < len - 1; i++) {
    const type = types[i]
    if (is(type)) {
      return type
    }
  }
  return types[i] as any
}

const getTagValue = <Tag extends string>(tag: Tag): ((type: Tagged<Tag>) => string) => {
  const f = (type: Tagged<Tag>): string => {
    switch (type._tag) {
      case 'InterfaceType':
      case 'StrictType':
        return type.props[tag].value
      case 'IntersectionType':
        return f(findTagged(tag, type.types))
      case 'UnionType':
        return f(type.types[0])
      case 'RefinementType':
        return f(type.type)
    }
  }
  return f
}

export const taggedUnion = <Tag extends string, RTS extends Array<Tagged<Tag>>>(
  tag: Tag,
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' | ')})`
): UnionType<RTS, TypeOf<RTS['_A']>> => {
  const tagValue2Index: { [key: string]: number } = {}
  const tagValues: { [key: string]: null } = {}
  const len = types.length
  const get = getTagValue(tag)
  for (let i = 0; i < len; i++) {
    const value = get(types[i])
    tagValue2Index[value] = i
    tagValues[value] = null
  }
  const TagValue = keyof(tagValues)
  return new UnionType(
    name,
    (v): v is TypeOf<RTS['_A']> => {
      if (!Dictionary.is(v)) {
        return false
      }
      const tagValue = v[tag]
      return TagValue.is(tagValue) && types[tagValue2Index[tagValue]].is(v)
    },
    (s, c) =>
      Dictionary.validate(s, c).chain(d =>
        TagValue.validate(d[tag], appendContext(c, tag, TagValue)).chain(tagValue => {
          const i = tagValue2Index[tagValue]
          const type = types[i]
          return type.validate(d, appendContext(c, String(i), type))
        })
      ),
    types.every(type => type.serialize === identity) ? identity : a => types[tagValue2Index[a[tag]]].serialize(a),
    types
  )
}

export { nullType as null, undefinedType as undefined, arrayType as Array, type as interface }
