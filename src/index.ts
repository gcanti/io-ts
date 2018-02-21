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
export type Is<A> = (m: mixed) => m is A
export type Validate<I, A> = (i: I, context: Context) => Validation<A>
export type Decode<I, A> = (i: I) => Validation<A>
export type Encode<A, O> = (a: A) => O
export type Any = Type<any, any, any>
export type Mixed = Type<any, any, mixed>
export type TypeOf<RT extends Any> = RT['_A']
export type InputOf<RT extends Any> = RT['_I']
export type OutputOf<RT extends Any> = RT['_O']

export interface Decoder<I, A> {
  readonly name: string
  readonly validate: Validate<I, A>
  readonly decode: Decode<I, A>
}

export interface Encoder<A, O> {
  readonly encode: Encode<A, O>
}

/**
 * Laws:
 * 1. T.decode(x).fold(() => x, T.serialize) = x
 * 2. T.decode(T.serialize(x)) = right(x)
 *
 * where `T` is a runtime type
 */
export class Type<A, O = A, I = mixed> implements Decoder<I, A>, Encoder<A, O> {
  // prettier-ignore
  readonly '_A': A
  // prettier-ignore
  readonly '_O': O
  // prettier-ignore
  readonly '_I': I
  constructor(
    /** a unique name for this runtime type */
    readonly name: string,
    /** a custom type guard */
    readonly is: Is<A>,
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly validate: Validate<I, A>,
    /** converts a value of type A to a value of type O */
    readonly encode: Encode<A, O>
  ) {}
  pipe<B>(ab: Type<B, A, A>, name?: string): Type<B, O, I> {
    return new Type(
      name || `pipe(${this.name}, ${ab.name})`,
      ab.is,
      (i, c) => {
        const validation = this.validate(i, c)
        if (validation.isLeft()) {
          return validation as any
        } else {
          return ab.validate(validation.value, c)
        }
      },
      this.encode === identity && ab.encode === identity ? (identity as any) : b => this.encode(ab.encode(b))
    )
  }
  asDecoder(): Decoder<I, A> {
    return this
  }
  asEncoder(): Encoder<A, O> {
    return this
  }
  /** a version of `validate` with a default context */
  decode(i: I): Validation<A> {
    return this.validate(i, getDefaultContext(this))
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

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => {
  const l = ys.length
  for (let i = 0; i < l; i++) {
    xs.push(ys[i])
  }
}

//
// basic types
//

export class NullType extends Type<null> {
  readonly _tag: 'NullType' = 'NullType'
  constructor() {
    super('null', (m): m is null => m === null, (m, c) => (this.is(m) ? success(m) : failure(m, c)), identity)
  }
}

/** @alias `null` */
export const nullType: NullType = new NullType()

export class UndefinedType extends Type<undefined> {
  readonly _tag: 'UndefinedType' = 'UndefinedType'
  constructor() {
    super(
      'undefined',
      (m): m is undefined => m === void 0,
      (m, c) => (this.is(m) ? success(m) : failure(m, c)),
      identity
    )
  }
}

const undefinedType: UndefinedType = new UndefinedType()

export class AnyType extends Type<any> {
  readonly _tag: 'AnyType' = 'AnyType'
  constructor() {
    super('any', (_): _ is any => true, success, identity)
  }
}

export const any: AnyType = new AnyType()

export class NeverType extends Type<never> {
  readonly _tag: 'NeverType' = 'NeverType'
  constructor() {
    super(
      'never',
      (_): _ is never => false,
      (m, c) => failure(m, c),
      () => {
        throw new Error('cannot serialize never')
      }
    )
  }
}

export const never: NeverType = new NeverType()

export class StringType extends Type<string> {
  readonly _tag: 'StringType' = 'StringType'
  constructor() {
    super(
      'string',
      (m): m is string => typeof m === 'string',
      (m, c) => (this.is(m) ? success(m) : failure(m, c)),
      identity
    )
  }
}

export const string: StringType = new StringType()

export class NumberType extends Type<number> {
  readonly _tag: 'NumberType' = 'NumberType'
  constructor() {
    super(
      'number',
      (m): m is number => typeof m === 'number',
      (m, c) => (this.is(m) ? success(m) : failure(m, c)),
      identity
    )
  }
}

export const number: NumberType = new NumberType()

export class BooleanType extends Type<boolean> {
  readonly _tag: 'BooleanType' = 'BooleanType'
  constructor() {
    super(
      'boolean',
      (m): m is boolean => typeof m === 'boolean',
      (m, c) => (this.is(m) ? success(m) : failure(m, c)),
      identity
    )
  }
}

export const boolean: BooleanType = new BooleanType()

export class AnyArrayType extends Type<Array<mixed>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor() {
    super('Array', Array.isArray, (m, c) => (this.is(m) ? success(m) : failure(m, c)), identity)
  }
}

const arrayType: AnyArrayType = new AnyArrayType()

export class AnyDictionaryType extends Type<{ [key: string]: mixed }> {
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  constructor() {
    super(
      'Dictionary',
      (m): m is { [key: string]: mixed } => m !== null && typeof m === 'object',
      (m, c) => (this.is(m) ? success(m) : failure(m, c)),
      identity
    )
  }
}

export const Dictionary: AnyDictionaryType = new AnyDictionaryType()

export class ObjectType extends Type<object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super('object', Dictionary.is, Dictionary.validate, identity)
  }
}

export const object: ObjectType = new ObjectType()

export class FunctionType extends Type<Function> {
  readonly _tag: 'FunctionType' = 'FunctionType'
  constructor() {
    super(
      'Function',
      (m): m is Function => typeof m === 'function',
      (m, c) => (this.is(m) ? success(m) : failure(m, c)),
      identity
    )
  }
}

export const Function: FunctionType = new FunctionType()

//
// refinements
//

export class RefinementType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(
    name: string,
    is: RefinementType<RT, A, O, I>['is'],
    validate: RefinementType<RT, A, O, I>['validate'],
    serialize: RefinementType<RT, A, O, I>['encode'],
    readonly type: RT,
    readonly predicate: Predicate<A>
  ) {
    super(name, is, validate, serialize)
  }
}

export const refinement = <RT extends Any>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name: string = `(${type.name} | ${getFunctionName(predicate)})`
): RefinementType<RT, TypeOf<RT>, OutputOf<RT>, InputOf<RT>> =>
  new RefinementType(
    name,
    (m): m is TypeOf<RT> => type.is(m) && predicate(m),
    (i, c) => {
      const validation = type.validate(i, c)
      if (validation.isLeft()) {
        return validation
      } else {
        const a = validation.value
        return predicate(a) ? success(a) : failure(a, c)
      }
    },
    type.encode,
    type,
    predicate
  )

export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

//
// literals
//

export class LiteralType<V extends string | number | boolean> extends Type<V> {
  readonly _tag: 'LiteralType' = 'LiteralType'
  constructor(
    name: string,
    is: LiteralType<V>['is'],
    validate: LiteralType<V>['validate'],
    serialize: LiteralType<V>['encode'],
    readonly value: V
  ) {
    super(name, is, validate, serialize)
  }
}

export const literal = <V extends string | number | boolean>(
  value: V,
  name: string = JSON.stringify(value)
): LiteralType<V> => {
  const is = (m: mixed): m is V => m === value
  return new LiteralType(name, is, (m, c) => (is(m) ? success(value) : failure(m, c)), identity, value)
}

//
// keyof
//

export class KeyofType<D extends { [key: string]: mixed }> extends Type<keyof D> {
  readonly _tag: 'KeyofType' = 'KeyofType'
  constructor(
    name: string,
    is: KeyofType<D>['is'],
    validate: KeyofType<D>['validate'],
    serialize: KeyofType<D>['encode'],
    readonly keys: D
  ) {
    super(name, is, validate, serialize)
  }
}

export const keyof = <D extends { [key: string]: mixed }>(
  keys: D,
  name: string = `(keyof ${JSON.stringify(Object.keys(keys))})`
): KeyofType<D> => {
  const is = (m: mixed): m is keyof D => string.is(m) && keys.hasOwnProperty(m)
  return new KeyofType(name, is, (m, c) => (is(m) ? success(m) : failure(m, c)), identity, keys)
}

//
// recursive types
//

export class RecursiveType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  constructor(
    name: string,
    is: RecursiveType<RT, A, O, I>['is'],
    validate: RecursiveType<RT, A, O, I>['validate'],
    serialize: RecursiveType<RT, A, O, I>['encode'],
    private runDefinition: () => RT
  ) {
    super(name, is, validate, serialize)
  }
  get type(): RT {
    return this.runDefinition()
  }
}

export const recursion = <A, O = A, I = mixed, RT extends Type<A, O, I> = Type<A, O, I>>(
  name: string,
  definition: (self: RT) => RT
): RecursiveType<RT, A, O, I> => {
  let cache: RT
  const runDefinition = (): RT => {
    if (!cache) {
      cache = definition(Self)
    }
    return cache
  }
  const Self: any = new RecursiveType<RT, A, O, I>(
    name,
    (m): m is A => runDefinition().is(m),
    (m, c) => runDefinition().validate(m, c),
    a => runDefinition().encode(a),
    runDefinition
  )
  return Self
}

//
// arrays
//

export class ArrayType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(
    name: string,
    is: ArrayType<RT, A, O, I>['is'],
    validate: ArrayType<RT, A, O, I>['validate'],
    serialize: ArrayType<RT, A, O, I>['encode'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const array = <RT extends Mixed>(
  type: RT,
  name: string = `Array<${type.name}>`
): ArrayType<RT, Array<TypeOf<RT>>, Array<OutputOf<RT>>, mixed> =>
  new ArrayType(
    name,
    (m): m is Array<TypeOf<RT>> => arrayType.is(m) && m.every(type.is),
    (m, c) => {
      const arrayValidation = arrayType.validate(m, c)
      if (arrayValidation.isLeft()) {
        return arrayValidation
      } else {
        const xs = arrayValidation.value
        const len = xs.length
        let a: Array<TypeOf<RT>> = xs
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const x = xs[i]
          const validation = type.validate(x, appendContext(c, String(i), type))
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          } else {
            const vx = validation.value
            if (vx !== x) {
              if (a === xs) {
                a = xs.slice()
              }
              a[i] = vx
            }
          }
        }
        return errors.length ? failures(errors) : success(a)
      }
    },
    type.encode === identity ? identity : a => a.map(type.encode),
    type
  )

//
// interfaces
//

export class InterfaceType<P extends AnyProps, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  constructor(
    name: string,
    is: InterfaceType<P, A, O, I>['is'],
    validate: InterfaceType<P, A, O, I>['validate'],
    serialize: InterfaceType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

export interface AnyProps {
  [key: string]: Any
}

const getNameFromProps = (props: Props): string =>
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

const useIdentity = (props: Props): boolean => {
  for (let k in props) {
    if (props[k].encode !== identity) {
      return false
    }
  }
  return true
}

export type TypeOfProps<P extends AnyProps> = { [K in keyof P]: TypeOf<P[K]> }

export type OutputOfProps<P extends AnyProps> = { [K in keyof P]: OutputOf<P[K]> }

export interface Props {
  [key: string]: Mixed
}

/** @alias `interface` */
export const type = <P extends Props>(
  props: P,
  name: string = getNameFromProps(props)
): InterfaceType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, mixed> =>
  new InterfaceType(
    name,
    (m): m is TypeOfProps<P> => {
      if (!Dictionary.is(m)) {
        return false
      }
      for (let k in props) {
        if (!props[k].is(m[k])) {
          return false
        }
      }
      return true
    },
    (m, c) => {
      const dictionaryValidation = Dictionary.validate(m, c)
      if (dictionaryValidation.isLeft()) {
        return dictionaryValidation
      } else {
        const o = dictionaryValidation.value
        let a = o
        const errors: Errors = []
        for (let k in props) {
          const ok = o[k]
          const type = props[k]
          const validation = type.validate(ok, appendContext(c, k, type))
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          } else {
            const vok = validation.value
            if (vok !== ok) {
              if (a === o) {
                a = { ...o }
              }
              a[k] = vok
            }
          }
        }
        return errors.length ? failures(errors) : success(a as any)
      }
    },
    useIdentity(props)
      ? identity
      : a => {
          const s: { [x: string]: any } = { ...(a as any) }
          for (let k in props) {
            s[k] = props[k].encode(a[k])
          }
          return s as any
        },
    props
  )

//
// partials
//

export class PartialType<P extends AnyProps, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'PartialType' = 'PartialType'
  constructor(
    name: string,
    is: PartialType<P, A, O, I>['is'],
    validate: PartialType<P, A, O, I>['validate'],
    serialize: PartialType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

export type TypeOfPartialProps<P extends AnyProps> = { [K in keyof P]?: TypeOf<P[K]> }

export type OutputOfPartialProps<P extends AnyProps> = { [K in keyof P]?: OutputOf<P[K]> }

export const partial = <P extends Props>(
  props: P,
  name: string = `PartialType<${getNameFromProps(props)}>`
): PartialType<P, { [K in keyof P]?: TypeOf<P[K]> }, { [K in keyof P]?: OutputOf<P[K]> }, mixed> => {
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
              s[k] = props[k].encode(ak)
            }
          }
          return s as any
        },
    props
  )
}

//
// dictionaries
//

export class DictionaryType<D extends Any, C extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  constructor(
    name: string,
    is: DictionaryType<D, C, A, O, I>['is'],
    validate: DictionaryType<D, C, A, O, I>['validate'],
    serialize: DictionaryType<D, C, A, O, I>['encode'],
    readonly domain: D,
    readonly codomain: C
  ) {
    super(name, is, validate, serialize)
  }
}

export type TypeOfDictionary<D extends Any, C extends Any> = { [K in TypeOf<D>]: TypeOf<C> }

export type OutputOfDictionary<D extends Any, C extends Any> = { [K in OutputOf<D>]: OutputOf<C> }

export const dictionary = <D extends Mixed, C extends Mixed>(
  domain: D,
  codomain: C,
  name: string = `{ [K in ${domain.name}]: ${codomain.name} }`
): DictionaryType<D, C, { [K in TypeOf<D>]: TypeOf<C> }, { [K in OutputOf<D>]: OutputOf<C> }, mixed> =>
  new DictionaryType(
    name,
    (m): m is TypeOfDictionary<D, C> =>
      Dictionary.is(m) && Object.keys(m).every(k => domain.is(k) && codomain.is(m[k])),
    (m, c) => {
      const dictionaryValidation = Dictionary.validate(m, c)
      if (dictionaryValidation.isLeft()) {
        return dictionaryValidation
      } else {
        const o = dictionaryValidation.value
        const a: { [key: string]: any } = {}
        const errors: Errors = []
        let changed = false
        for (let k in o) {
          const ok = o[k]
          const domainValidation = domain.validate(k, appendContext(c, k, domain))
          const codomainValidation = codomain.validate(ok, appendContext(c, k, codomain))
          if (domainValidation.isLeft()) {
            pushAll(errors, domainValidation.value)
          } else {
            const vk = domainValidation.value
            changed = changed || vk !== k
            k = vk
          }
          if (codomainValidation.isLeft()) {
            pushAll(errors, codomainValidation.value)
          } else {
            const vok = codomainValidation.value
            changed = changed || vok !== ok
            a[k] = vok
          }
        }
        return errors.length ? failures(errors) : success((changed ? a : o) as any)
      }
    },
    domain.encode === identity && codomain.encode === identity
      ? identity
      : a => {
          const s: { [key: string]: any } = {}
          for (let k in a) {
            s[String(domain.encode(k))] = codomain.encode(a[k])
          }
          return s as any
        },
    domain,
    codomain
  )

//
// unions
//

export class UnionType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(
    name: string,
    is: UnionType<RTS, A, O, I>['is'],
    validate: UnionType<RTS, A, O, I>['validate'],
    serialize: UnionType<RTS, A, O, I>['encode'],
    readonly types: RTS
  ) {
    super(name, is, validate, serialize)
  }
}

export const union = <RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' | ')})`
): UnionType<RTS, TypeOf<RTS['_A']>, OutputOf<RTS['_A']>, mixed> => {
  const len = types.length
  return new UnionType(
    name,
    (m): m is TypeOf<RTS['_A']> => types.some(type => type.is(m)),
    (m, c) => {
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type.validate(m, appendContext(c, String(i), type))
        if (validation.isRight()) {
          return validation
        } else {
          pushAll(errors, validation.value)
        }
      }
      return failures(errors)
    },
    types.every(type => type.encode === identity)
      ? identity
      : a => {
          let i = 0
          for (; i < len - 1; i++) {
            const type = types[i]
            if (type.is(a)) {
              return type.encode(a)
            }
          }
          return types[i].encode(a)
        },
    types
  )
}

//
// intersections
//

export class IntersectionType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(
    name: string,
    is: IntersectionType<RTS, A, O, I>['is'],
    validate: IntersectionType<RTS, A, O, I>['validate'],
    serialize: IntersectionType<RTS, A, O, I>['encode'],
    readonly types: RTS
  ) {
    super(name, is, validate, serialize)
  }
}

export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  types: [A, B, C, D, E],
  name?: string
): IntersectionType<
  [A, B, C, D, E],
  TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E>,
  OutputOf<A> & OutputOf<B> & OutputOf<C> & OutputOf<D> & OutputOf<E>,
  mixed
>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  types: [A, B, C, D],
  name?: string
): IntersectionType<
  [A, B, C, D],
  TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D>,
  OutputOf<A> & OutputOf<B> & OutputOf<C> & OutputOf<D>,
  mixed
>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(
  types: [A, B, C],
  name?: string
): IntersectionType<[A, B, C], TypeOf<A> & TypeOf<B> & TypeOf<C>, OutputOf<A> & OutputOf<B> & OutputOf<C>, mixed>
export function intersection<A extends Mixed, B extends Mixed>(
  types: [A, B],
  name?: string
): IntersectionType<[A, B], TypeOf<A> & TypeOf<B>, OutputOf<A> & OutputOf<B>, mixed>
export function intersection<A extends Mixed>(
  types: [A],
  name?: string
): IntersectionType<[A], TypeOf<A>, OutputOf<A>, mixed>
export function intersection<RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' & ')})`
): IntersectionType<RTS, any, any, mixed> {
  const len = types.length
  return new IntersectionType(
    name,
    (m): m is any => types.every(type => type.is(m)),
    (m, c) => {
      let a = m
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type.validate(a, c)
        if (validation.isLeft()) {
          pushAll(errors, validation.value)
        } else {
          a = validation.value
        }
      }
      return errors.length ? failures(errors) : success(a)
    },
    types.every(type => type.encode === identity)
      ? identity
      : a => {
          let s = a
          for (let i = 0; i < len; i++) {
            const type = types[i]
            s = type.encode(s)
          }
          return s
        },
    types
  )
}

//
// tuples
//

export class TupleType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(
    name: string,
    is: TupleType<RTS, A, O, I>['is'],
    validate: TupleType<RTS, A, O, I>['validate'],
    serialize: TupleType<RTS, A, O, I>['encode'],
    readonly types: RTS
  ) {
    super(name, is, validate, serialize)
  }
}

export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  types: [A, B, C, D, E],
  name?: string
): TupleType<
  [A, B, C, D, E],
  [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>, TypeOf<E>],
  [OutputOf<A>, OutputOf<B>, OutputOf<C>, OutputOf<D>, OutputOf<E>],
  mixed
>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  types: [A, B, C, D],
  name?: string
): TupleType<
  [A, B, C, D],
  [TypeOf<A>, TypeOf<B>, TypeOf<C>, TypeOf<D>],
  [OutputOf<A>, OutputOf<B>, OutputOf<C>, OutputOf<D>],
  mixed
>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(
  types: [A, B, C],
  name?: string
): TupleType<[A, B, C], [TypeOf<A>, TypeOf<B>, TypeOf<C>], [OutputOf<A>, OutputOf<B>, OutputOf<C>], mixed>
export function tuple<A extends Mixed, B extends Mixed>(
  types: [A, B],
  name?: string
): TupleType<[A, B], [TypeOf<A>, TypeOf<B>], [OutputOf<A>, OutputOf<B>], mixed>
export function tuple<A extends Mixed>(types: [A], name?: string): TupleType<[A], [TypeOf<A>], [OutputOf<A>], mixed>
export function tuple<RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `[${types.map(type => type.name).join(', ')}]`
): TupleType<RTS, any, any, mixed> {
  const len = types.length
  return new TupleType(
    name,
    (m): m is any => arrayType.is(m) && m.length === len && types.every((type, i) => type.is(m[i])),
    (m, c) => {
      const arrayValidation = arrayType.validate(m, c)
      if (arrayValidation.isLeft()) {
        return arrayValidation
      } else {
        const as = arrayValidation.value
        let t: Array<any> = as
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const a = as[i]
          const type = types[i]
          const validation = type.validate(a, appendContext(c, String(i), type))
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          } else {
            const va = validation.value
            if (va !== a) {
              if (t === as) {
                t = as.slice()
              }
              t[i] = va
            }
          }
        }
        if (as.length > len) {
          errors.push(getValidationError(as[len], appendContext(c, String(len), never)))
        }
        return errors.length ? failures(errors) : success(t)
      }
    },
    types.every(type => type.encode === identity) ? identity : a => types.map((type, i) => type.encode(a[i])),
    types
  )
}

//
// readonly objects
//

export class ReadonlyType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(
    name: string,
    is: ReadonlyType<RT, A, O, I>['is'],
    validate: ReadonlyType<RT, A, O, I>['validate'],
    serialize: ReadonlyType<RT, A, O, I>['encode'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const readonly = <RT extends Mixed>(
  type: RT,
  name: string = `Readonly<${type.name}>`
): ReadonlyType<RT, Readonly<TypeOf<RT>>, Readonly<OutputOf<RT>>, mixed> =>
  new ReadonlyType(
    name,
    type.is,
    (m, c) =>
      type.validate(m, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        }
        return x
      }),
    type.encode === identity ? identity : type.encode,
    type
  )

//
// readonly arrays
//

export class ReadonlyArrayType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(
    name: string,
    is: ReadonlyArrayType<RT, A, O, I>['is'],
    validate: ReadonlyArrayType<RT, A, O, I>['validate'],
    serialize: ReadonlyArrayType<RT, A, O, I>['encode'],
    readonly type: RT
  ) {
    super(name, is, validate, serialize)
  }
}

export const readonlyArray = <RT extends Mixed>(
  type: RT,
  name: string = `ReadonlyArray<${type.name}>`
): ReadonlyArrayType<RT, ReadonlyArray<TypeOf<RT>>, ReadonlyArray<OutputOf<RT>>, mixed> => {
  const arrayType = array(type)
  return new ReadonlyArrayType(
    name,
    arrayType.is,
    (m, c) =>
      arrayType.validate(m, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        } else {
          return x
        }
      }),
    arrayType.encode as any,
    type
  )
}

//
// strict interfaces
//

export class StrictType<P extends AnyProps, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(
    name: string,
    is: StrictType<P, A, O, I>['is'],
    validate: StrictType<P, A, O, I>['validate'],
    serialize: StrictType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, serialize)
  }
}

/** Specifies that only the given interface properties are allowed */
export const strict = <P extends Props>(
  props: P,
  name: string = `StrictType<${getNameFromProps(props)}>`
): StrictType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, mixed> => {
  const loose = type(props)
  return new StrictType(
    name,
    (m): m is TypeOfProps<P> => loose.is(m) && Object.getOwnPropertyNames(m).every(k => props.hasOwnProperty(k)),
    (m, c) => {
      const looseValidation = loose.validate(m, c)
      if (looseValidation.isLeft()) {
        return looseValidation
      } else {
        const o = looseValidation.value
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
      }
    },
    loose.encode,
    props
  )
}

//
// tagged unions
//

export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralType<any> }
export interface TaggedRefinement<Tag extends string, A, O = A> extends RefinementType<Tagged<Tag>, A, O> {}
export interface TaggedUnion<Tag extends string, A, O = A> extends UnionType<Array<Tagged<Tag>>, A, O> {}
export type TaggedIntersectionArgument<Tag extends string> =
  | [Tagged<Tag>]
  | [Tagged<Tag>, Mixed]
  | [Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Mixed, Tagged<Tag>]
  | [Tagged<Tag>, Mixed, Mixed, Mixed, Mixed]
  | [Mixed, Tagged<Tag>, Mixed, Mixed, Mixed]
  | [Mixed, Mixed, Tagged<Tag>, Mixed, Mixed]
  | [Mixed, Mixed, Mixed, Tagged<Tag>, Mixed]
  | [Mixed, Mixed, Mixed, Mixed, Tagged<Tag>]
export interface TaggedIntersection<Tag extends string, A, O = A>
  extends IntersectionType<TaggedIntersectionArgument<Tag>, A, O> {}
export type Tagged<Tag extends string, A = any, O = A> =
  | InterfaceType<TaggedProps<Tag>, A, O>
  | StrictType<TaggedProps<Tag>, A, O>
  | TaggedRefinement<Tag, A, O>
  | TaggedUnion<Tag, A, O>
  | TaggedIntersection<Tag, A, O>

const isTagged = <Tag extends string>(tag: Tag): ((type: Mixed) => type is Tagged<Tag>) => {
  const f = (type: Mixed): type is Tagged<Tag> => {
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
): UnionType<RTS, TypeOf<RTS['_A']>, OutputOf<RTS['_A']>, mixed> => {
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
  return new UnionType<RTS, TypeOf<RTS['_A']>, OutputOf<RTS['_A']>, mixed>(
    name,
    (v): v is TypeOf<RTS['_A']> => {
      if (!Dictionary.is(v)) {
        return false
      }
      const tagValue = v[tag]
      return TagValue.is(tagValue) && types[tagValue2Index[tagValue]].is(v)
    },
    (s, c) => {
      const dictionaryValidation = Dictionary.validate(s, c)
      if (dictionaryValidation.isLeft()) {
        return dictionaryValidation
      } else {
        const d = dictionaryValidation.value
        const tagValueValidation = TagValue.validate(d[tag], appendContext(c, tag, TagValue))
        if (tagValueValidation.isLeft()) {
          return tagValueValidation
        } else {
          const tagValue = tagValueValidation.value
          const i = tagValue2Index[tagValue]
          const type = types[i]
          return type.validate(d, appendContext(c, String(i), type))
        }
      }
    },
    types.every(type => type.encode === identity) ? identity : a => types[tagValue2Index[a[tag] as any]].encode(a),
    types
  )
}

export { nullType as null, undefinedType as undefined, arrayType as Array, type as interface }
