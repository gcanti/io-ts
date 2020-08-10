/**
 * @since 1.0.0
 */
import { Either, isLeft, left, right } from 'fp-ts/lib/Either'
import { Predicate, Refinement } from 'fp-ts/lib/function'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @category Model
 * @since 1.0.0
 */
export interface ContextEntry {
  readonly key: string
  readonly type: Decoder<any, any>
  /** the input data */
  readonly actual?: unknown
}

/**
 * @category Model
 * @since 1.0.0
 */
export interface Context extends ReadonlyArray<ContextEntry> {}

/**
 * @category Model
 * @since 1.0.0
 */
export interface ValidationError {
  /** the offending (sub)value */
  readonly value: unknown
  /** where the error originated */
  readonly context: Context
  /** optional custom error message */
  readonly message?: string
}

/**
 * @category Model
 * @since 1.0.0
 */
export interface Errors extends Array<ValidationError> {}

/**
 * @category Model
 * @since 1.0.0
 */
export type Validation<A> = Either<Errors, A>

/**
 * @category Model
 * @since 1.0.0
 */
export type Is<A> = (u: unknown) => u is A

/**
 * @category Model
 * @since 1.0.0
 */
export type Validate<I, A> = (i: I, context: Context) => Validation<A>

/**
 * @category Model
 * @since 1.0.0
 */
export type Decode<I, A> = (i: I) => Validation<A>

/**
 * @category Model
 * @since 1.0.0
 */
export type Encode<A, O> = (a: A) => O

/**
 * @since 1.0.0
 */
export interface Any extends Type<any, any, any> {}

/**
 * @since 1.0.0
 */
export interface Mixed extends Type<any, any, unknown> {}

/**
 * @since 1.0.0
 */
export type TypeOf<C extends Any> = C['_A']

/**
 * @since 1.0.0
 */
export type InputOf<C extends Any> = C['_I']

/**
 * @since 1.0.0
 */
export type OutputOf<C extends Any> = C['_O']

/**
 * @category Model
 * @since 1.0.0
 */
export interface Decoder<I, A> {
  readonly name: string
  readonly validate: Validate<I, A>
  readonly decode: Decode<I, A>
}

/**
 * @category Model
 * @since 1.0.0
 */
export interface Encoder<A, O> {
  readonly encode: Encode<A, O>
}

/**
 * @category Model
 * @since 1.0.0
 */
export class Type<A, O = A, I = unknown> implements Decoder<I, A>, Encoder<A, O> {
  /**
   * @since 1.0.0
   */
  readonly _A!: A
  /**
   * @since 1.0.0
   */
  readonly _O!: O
  /**
   * @since 1.0.0
   */
  readonly _I!: I
  constructor(
    /** a unique name for this codec */
    readonly name: string,
    /** a custom type guard */
    readonly is: Is<A>,
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly validate: Validate<I, A>,
    /** converts a value of type A to a value of type O */
    readonly encode: Encode<A, O>
  ) {
    this.decode = this.decode.bind(this)
  }

  /**
   * @since 1.0.0
   */
  pipe<B, IB, A extends IB, OB extends A>(
    this: Type<A, O, I>,
    ab: Type<B, OB, IB>,
    name: string = `pipe(${this.name}, ${ab.name})`
  ): Type<B, O, I> {
    return new Type(
      name,
      ab.is,
      (i, c) => {
        const e = this.validate(i, c)
        if (isLeft(e)) {
          return e
        }
        return ab.validate(e.right, c)
      },
      this.encode === identity && ab.encode === identity ? (identity as any) : (b) => this.encode(ab.encode(b))
    )
  }
  /**
   * @since 1.0.0
   */
  asDecoder(): Decoder<I, A> {
    return this
  }
  /**
   * @since 1.0.0
   */
  asEncoder(): Encoder<A, O> {
    return this
  }
  /**
   * a version of `validate` with a default context
   * @since 1.0.0
   */
  decode(i: I): Validation<A> {
    return this.validate(i, [{ key: '', type: this, actual: i }])
  }
}

/**
 * @since 1.0.0
 */
export const identity = <A>(a: A): A => a

/**
 * @since 1.0.0
 */
export const getFunctionName = (f: Function): string =>
  (f as any).displayName || (f as any).name || `<function${f.length}>`

/**
 * @since 1.0.0
 */
export const getContextEntry = (key: string, decoder: Decoder<any, any>): ContextEntry => ({ key, type: decoder })

/**
 * @since 1.0.0
 */
export const appendContext = (c: Context, key: string, decoder: Decoder<any, any>, actual?: unknown): Context => {
  const len = c.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = c[i]
  }
  r[len] = { key, type: decoder, actual }
  return r
}

/**
 * @since 1.0.0
 */
export const failures: <T>(errors: Errors) => Validation<T> = left

/**
 * @since 1.0.0
 */
export const failure = <T>(value: unknown, context: Context, message?: string): Validation<T> =>
  failures([{ value, context, message }])

/**
 * @since 1.0.0
 */
export const success: <T>(value: T) => Validation<T> = right

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => {
  const l = ys.length
  for (let i = 0; i < l; i++) {
    xs.push(ys[i])
  }
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 1.0.0
 */
export class NullType extends Type<null> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'NullType' = 'NullType'
  constructor() {
    super(
      'null',
      (u): u is null => u === null,
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface NullC extends NullType {}

/**
 * @category Primitives
 * @since 1.0.0
 */
export const nullType: NullC = new NullType()

/**
 * @since 1.0.0
 */
export class UndefinedType extends Type<undefined> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'UndefinedType' = 'UndefinedType'
  constructor() {
    super(
      'undefined',
      (u): u is undefined => u === void 0,
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface UndefinedC extends UndefinedType {}

const undefinedType: UndefinedC = new UndefinedType()

/**
 * @since 1.2.0
 */
export class VoidType extends Type<void> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'VoidType' = 'VoidType'
  constructor() {
    super('void', undefinedType.is, undefinedType.validate, identity)
  }
}

/**
 * @since 1.5.3
 */
export interface VoidC extends VoidType {}

/**
 * @category Primitives
 * @since 1.2.0
 */
export const voidType: VoidC = new VoidType()

/**
 * @since 1.5.0
 */
export class UnknownType extends Type<unknown> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'UnknownType' = 'UnknownType'
  constructor() {
    super('unknown', (_): _ is unknown => true, success, identity)
  }
}

/**
 * @since 1.5.3
 */
export interface UnknownC extends UnknownType {}

/**
 * @category Primitives
 * @since 1.5.0
 */
export const unknown: UnknownC = new UnknownType()

/**
 * @since 1.0.0
 */
export class StringType extends Type<string> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'StringType' = 'StringType'
  constructor() {
    super(
      'string',
      (u): u is string => typeof u === 'string',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface StringC extends StringType {}

/**
 * @category Primitives
 * @since 1.0.0
 */
export const string: StringC = new StringType()

/**
 * @since 1.0.0
 */
export class NumberType extends Type<number> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'NumberType' = 'NumberType'
  constructor() {
    super(
      'number',
      (u): u is number => typeof u === 'number',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface NumberC extends NumberType {}

/**
 * @category Primitives
 * @since 1.0.0
 */
export const number: NumberC = new NumberType()

/**
 * @since 2.1.0
 */
export class BigIntType extends Type<bigint> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'BigIntType' = 'BigIntType'
  constructor() {
    super(
      'bigint',
      // tslint:disable-next-line: valid-typeof
      (u): u is bigint => typeof u === 'bigint',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 2.1.0
 */
export interface BigIntC extends BigIntType {}

/**
 * @category Primitives
 * @since 2.1.0
 */
export const bigint: BigIntC = new BigIntType()

/**
 * @since 1.0.0
 */
export class BooleanType extends Type<boolean> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'BooleanType' = 'BooleanType'
  constructor() {
    super(
      'boolean',
      (u): u is boolean => typeof u === 'boolean',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface BooleanC extends BooleanType {}

/**
 * @category Primitives
 * @since 1.0.0
 */
export const boolean: BooleanC = new BooleanType()

/**
 * @since 1.0.0
 */
export class AnyArrayType extends Type<Array<unknown>> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor() {
    super('UnknownArray', Array.isArray, (u, c) => (this.is(u) ? success(u) : failure(u, c)), identity)
  }
}

/**
 * @since 1.5.3
 */
export interface UnknownArrayC extends AnyArrayType {}

/**
 * @category Primitives
 * @since 1.7.1
 */
export const UnknownArray: UnknownArrayC = new AnyArrayType()

/**
 * @since 1.0.0
 */
export class AnyDictionaryType extends Type<{ [key: string]: unknown }> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  constructor() {
    super(
      'UnknownRecord',
      (u): u is { [key: string]: unknown } => {
        const s = Object.prototype.toString.call(u)
        return s === '[object Object]' || s === '[object Window]'
      },
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @category Primitives
 * @since 1.7.1
 */
export const UnknownRecord: UnknownRecordC = new AnyDictionaryType()

/**
 * @since 1.5.3
 */
export interface UnknownRecordC extends AnyDictionaryType {}

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export class FunctionType extends Type<Function> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'FunctionType' = 'FunctionType'
  constructor() {
    super(
      'Function',
      // tslint:disable-next-line:strict-type-predicates
      (u): u is Function => typeof u === 'function',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @category deprecated
 * @since 1.5.3
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export interface FunctionC extends FunctionType {}

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export const Function: FunctionC = new FunctionType()

/**
 * @since 1.0.0
 */
export class RefinementType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(
    name: string,
    is: RefinementType<C, A, O, I>['is'],
    validate: RefinementType<C, A, O, I>['validate'],
    encode: RefinementType<C, A, O, I>['encode'],
    readonly type: C,
    readonly predicate: Predicate<A>
  ) {
    super(name, is, validate, encode)
  }
}

declare const _brand: unique symbol

/**
 * @since 1.8.1
 */
export interface Brand<B> {
  readonly [_brand]: B
}

/**
 * @since 1.8.1
 */
export type Branded<A, B> = A & Brand<B>

/**
 * @since 1.8.1
 */
export interface BrandC<C extends Any, B> extends RefinementType<C, Branded<TypeOf<C>, B>, OutputOf<C>, InputOf<C>> {}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @category Combinators
 * @since 1.8.1
 */
export const brand = <C extends Any, N extends string, B extends { readonly [K in N]: symbol }>(
  codec: C,
  predicate: Refinement<TypeOf<C>, Branded<TypeOf<C>, B>>,
  name: N
): BrandC<C, B> => {
  // tslint:disable-next-line: deprecation
  return refinement(codec, predicate, name)
}

/**
 * @since 1.8.1
 */
export interface IntBrand {
  readonly Int: unique symbol
}

/**
 * A branded codec representing an integer
 *
 * @category Primitives
 * @since 1.8.1
 */
export const Int = brand(number, (n): n is Branded<number, IntBrand> => Number.isInteger(n), 'Int')

/**
 * @since 1.8.1
 */
export type Int = Branded<number, IntBrand>

type LiteralValue = string | number | boolean

/**
 * @since 1.0.0
 */
export class LiteralType<V extends LiteralValue> extends Type<V> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'LiteralType' = 'LiteralType'
  constructor(
    name: string,
    is: LiteralType<V>['is'],
    validate: LiteralType<V>['validate'],
    encode: LiteralType<V>['encode'],
    readonly value: V
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface LiteralC<V extends LiteralValue> extends LiteralType<V> {}

/**
 * @category Combinators
 * @since 1.0.0
 */
export const literal = <V extends LiteralValue>(value: V, name: string = JSON.stringify(value)): LiteralC<V> => {
  const is = (u: unknown): u is V => u === value
  return new LiteralType(name, is, (u, c) => (is(u) ? success(value) : failure(u, c)), identity, value)
}

/**
 * @since 1.0.0
 */
export class KeyofType<D extends { [key: string]: unknown }> extends Type<keyof D> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'KeyofType' = 'KeyofType'
  constructor(
    name: string,
    is: KeyofType<D>['is'],
    validate: KeyofType<D>['validate'],
    encode: KeyofType<D>['encode'],
    readonly keys: D
  ) {
    super(name, is, validate, encode)
  }
}

const hasOwnProperty = Object.prototype.hasOwnProperty

/**
 * @since 1.5.3
 */
export interface KeyofC<D extends { [key: string]: unknown }> extends KeyofType<D> {}

/**
 * @category Combinators
 * @since 1.0.0
 */
export const keyof = <D extends { [key: string]: unknown }>(
  keys: D,
  name: string = Object.keys(keys)
    .map((k) => JSON.stringify(k))
    .join(' | ')
): KeyofC<D> => {
  const is = (u: unknown): u is keyof D => string.is(u) && hasOwnProperty.call(keys, u)
  return new KeyofType(name, is, (u, c) => (is(u) ? success(u) : failure(u, c)), identity, keys)
}

/**
 * @since 1.0.0
 */
export class RecursiveType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  constructor(
    name: string,
    is: RecursiveType<C, A, O, I>['is'],
    validate: RecursiveType<C, A, O, I>['validate'],
    encode: RecursiveType<C, A, O, I>['encode'],
    public runDefinition: () => C
  ) {
    super(name, is, validate, encode)
  }
  /**
   * @since 1.0.0
   */
  readonly type!: C
}

Object.defineProperty(RecursiveType.prototype, 'type', {
  get: function () {
    return this.runDefinition()
  },
  enumerable: true,
  configurable: true
})

/**
 * @category Combinators
 * @since 1.0.0
 */
export const recursion = <A, O = A, I = unknown, C extends Type<A, O, I> = Type<A, O, I>>(
  name: string,
  definition: (self: C) => C
): RecursiveType<C, A, O, I> => {
  let cache: C
  const runDefinition = (): C => {
    if (!cache) {
      cache = definition(Self)
      ;(cache as any).name = name
    }
    return cache
  }
  const Self: any = new RecursiveType<C, A, O, I>(
    name,
    (u): u is A => runDefinition().is(u),
    (u, c) => runDefinition().validate(u, c),
    (a) => runDefinition().encode(a),
    runDefinition
  )
  return Self
}

/**
 * @since 1.0.0
 */
export class ArrayType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(
    name: string,
    is: ArrayType<C, A, O, I>['is'],
    validate: ArrayType<C, A, O, I>['validate'],
    encode: ArrayType<C, A, O, I>['encode'],
    readonly type: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface ArrayC<C extends Mixed> extends ArrayType<C, Array<TypeOf<C>>, Array<OutputOf<C>>, unknown> {}

/**
 * @category Combinators
 * @since 1.0.0
 */
export const array = <C extends Mixed>(item: C, name: string = `Array<${item.name}>`): ArrayC<C> =>
  new ArrayType(
    name,
    (u): u is Array<TypeOf<C>> => UnknownArray.is(u) && u.every(item.is),
    (u, c) => {
      const e = UnknownArray.validate(u, c)
      if (isLeft(e)) {
        return e
      }
      const us = e.right
      const len = us.length
      let as: Array<TypeOf<C>> = us
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const ui = us[i]
        const result = item.validate(ui, appendContext(c, String(i), item, ui))
        if (isLeft(result)) {
          pushAll(errors, result.left)
        } else {
          const ai = result.right
          if (ai !== ui) {
            if (as === us) {
              as = us.slice()
            }
            as[i] = ai
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success(as)
    },
    item.encode === identity ? identity : (a) => a.map(item.encode),
    item
  )

/**
 * @since 1.0.0
 */
export class InterfaceType<P, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  constructor(
    name: string,
    is: InterfaceType<P, A, O, I>['is'],
    validate: InterfaceType<P, A, O, I>['validate'],
    encode: InterfaceType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.0.0
 */
export interface AnyProps {
  [key: string]: Any
}

const getNameFromProps = (props: Props): string =>
  Object.keys(props)
    .map((k) => `${k}: ${props[k].name}`)
    .join(', ')

const useIdentity = (codecs: Array<Any>): boolean => {
  for (let i = 0; i < codecs.length; i++) {
    if (codecs[i].encode !== identity) {
      return false
    }
  }
  return true
}

/**
 * @since 1.0.0
 */
export type TypeOfProps<P extends AnyProps> = { [K in keyof P]: TypeOf<P[K]> }

/**
 * @since 1.0.0
 */
export type OutputOfProps<P extends AnyProps> = { [K in keyof P]: OutputOf<P[K]> }

/**
 * @since 1.0.0
 */
export interface Props {
  [key: string]: Mixed
}

/**
 * @since 1.5.3
 */
export interface TypeC<P extends Props>
  extends InterfaceType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, unknown> {}

const getInterfaceTypeName = (props: Props): string => {
  return `{ ${getNameFromProps(props)} }`
}

/**
 * @category Combinators
 * @since 1.0.0
 */
export const type = <P extends Props>(props: P, name: string = getInterfaceTypeName(props)): TypeC<P> => {
  const keys = Object.keys(props)
  const types = keys.map((key) => props[key])
  const len = keys.length
  return new InterfaceType(
    name,
    (u): u is { [K in keyof P]: TypeOf<P[K]> } => {
      if (UnknownRecord.is(u)) {
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          const uk = u[k]
          if ((uk === undefined && !hasOwnProperty.call(u, k)) || !types[i].is(uk)) {
            return false
          }
        }
        return true
      }
      return false
    },
    (u, c) => {
      const e = UnknownRecord.validate(u, c)
      if (isLeft(e)) {
        return e
      }
      const o = e.right
      let a = o
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        const ak = a[k]
        const type = types[i]
        const result = type.validate(ak, appendContext(c, k, type, ak))
        if (isLeft(result)) {
          pushAll(errors, result.left)
        } else {
          const vak = result.right
          if (vak !== ak || (vak === undefined && !hasOwnProperty.call(a, k))) {
            /* istanbul ignore next */
            if (a === o) {
              a = { ...o }
            }
            a[k] = vak
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success(a as any)
    },
    useIdentity(types)
      ? identity
      : (a) => {
          const s: { [x: string]: any } = { ...a }
          for (let i = 0; i < len; i++) {
            const k = keys[i]
            const encode = types[i].encode
            if (encode !== identity) {
              s[k] = encode(a[k])
            }
          }
          return s as any
        },
    props
  )
}

/**
 * @since 1.0.0
 */
export class PartialType<P, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'PartialType' = 'PartialType'
  constructor(
    name: string,
    is: PartialType<P, A, O, I>['is'],
    validate: PartialType<P, A, O, I>['validate'],
    encode: PartialType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.0.0
 */
export type TypeOfPartialProps<P extends AnyProps> = { [K in keyof P]?: TypeOf<P[K]> }

/**
 * @since 1.0.0
 */
export type OutputOfPartialProps<P extends AnyProps> = { [K in keyof P]?: OutputOf<P[K]> }

/**
 * @since 1.5.3
 */
export interface PartialC<P extends Props>
  extends PartialType<P, { [K in keyof P]?: TypeOf<P[K]> }, { [K in keyof P]?: OutputOf<P[K]> }, unknown> {}

const getPartialTypeName = (inner: string): string => {
  return `Partial<${inner}>`
}

/**
 * @category Combinators
 * @since 1.0.0
 */
export const partial = <P extends Props>(
  props: P,
  name: string = getPartialTypeName(getInterfaceTypeName(props))
): PartialC<P> => {
  const keys = Object.keys(props)
  const types = keys.map((key) => props[key])
  const len = keys.length
  return new PartialType(
    name,
    (u): u is { [K in keyof P]?: TypeOf<P[K]> } => {
      if (UnknownRecord.is(u)) {
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          const uk = u[k]
          if (uk !== undefined && !props[k].is(uk)) {
            return false
          }
        }
        return true
      }
      return false
    },
    (u, c) => {
      const e = UnknownRecord.validate(u, c)
      if (isLeft(e)) {
        return e
      }
      const o = e.right
      let a = o
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        const ak = a[k]
        const type = props[k]
        const result = type.validate(ak, appendContext(c, k, type, ak))
        if (isLeft(result)) {
          if (ak !== undefined) {
            pushAll(errors, result.left)
          }
        } else {
          const vak = result.right
          if (vak !== ak) {
            /* istanbul ignore next */
            if (a === o) {
              a = { ...o }
            }
            a[k] = vak
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success(a as any)
    },
    useIdentity(types)
      ? identity
      : (a) => {
          const s: { [key: string]: any } = { ...a }
          for (let i = 0; i < len; i++) {
            const k = keys[i]
            const ak = a[k]
            if (ak !== undefined) {
              s[k] = types[i].encode(ak)
            }
          }
          return s as any
        },
    props
  )
}

/**
 * @since 1.0.0
 */
export class DictionaryType<D extends Any, C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  constructor(
    name: string,
    is: DictionaryType<D, C, A, O, I>['is'],
    validate: DictionaryType<D, C, A, O, I>['validate'],
    encode: DictionaryType<D, C, A, O, I>['encode'],
    readonly domain: D,
    readonly codomain: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.0.0
 */
export type TypeOfDictionary<D extends Any, C extends Any> = { [K in TypeOf<D>]: TypeOf<C> }

/**
 * @since 1.0.0
 */
export type OutputOfDictionary<D extends Any, C extends Any> = { [K in OutputOf<D>]: OutputOf<C> }

/**
 * @since 1.5.3
 */
export interface RecordC<D extends Mixed, C extends Mixed>
  extends DictionaryType<D, C, { [K in TypeOf<D>]: TypeOf<C> }, { [K in OutputOf<D>]: OutputOf<C> }, unknown> {}

function enumerableRecord<D extends Mixed, C extends Mixed>(
  keys: Array<string>,
  domain: D,
  codomain: C,
  name: string = `{ [K in ${domain.name}]: ${codomain.name} }`
): RecordC<D, C> {
  const len = keys.length
  return new DictionaryType(
    name,
    (u): u is { [K in TypeOf<D>]: TypeOf<C> } => UnknownRecord.is(u) && keys.every((k) => codomain.is(u[k])),
    (u, c) => {
      const e = UnknownRecord.validate(u, c)
      if (isLeft(e)) {
        return e
      }
      const o = e.right
      const a: { [key: string]: any } = {}
      const errors: Errors = []
      let changed: boolean = false
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        const ok = o[k]
        const codomainResult = codomain.validate(ok, appendContext(c, k, codomain, ok))
        if (isLeft(codomainResult)) {
          pushAll(errors, codomainResult.left)
        } else {
          const vok = codomainResult.right
          changed = changed || vok !== ok
          a[k] = vok
        }
      }
      return errors.length > 0 ? failures(errors) : success((changed || Object.keys(o).length !== len ? a : o) as any)
    },
    codomain.encode === identity
      ? identity
      : (a: any) => {
          const s: { [key: string]: any } = {}
          for (let i = 0; i < len; i++) {
            const k = keys[i]
            s[k] = codomain.encode(a[k])
          }
          return s as any
        },
    domain,
    codomain
  )
}

/**
 * @internal
 */
export function getDomainKeys<D extends Mixed>(domain: D): Record<string, unknown> | undefined {
  if (isLiteralC(domain)) {
    const literal = domain.value
    if (string.is(literal)) {
      return { [literal]: null }
    }
  } else if (isKeyofC(domain)) {
    return domain.keys
  } else if (isUnionC(domain)) {
    const keys = domain.types.map((type) => getDomainKeys(type))
    return keys.some(undefinedType.is) ? undefined : Object.assign({}, ...keys)
  }
  return undefined
}

function nonEnumerableRecord<D extends Mixed, C extends Mixed>(
  domain: D,
  codomain: C,
  name: string = `{ [K in ${domain.name}]: ${codomain.name} }`
): RecordC<D, C> {
  return new DictionaryType(
    name,
    (u): u is { [K in TypeOf<D>]: TypeOf<C> } => {
      if (UnknownRecord.is(u)) {
        return Object.keys(u).every((k) => domain.is(k) && codomain.is(u[k]))
      }
      return isAnyC(codomain) && Array.isArray(u)
    },
    (u, c) => {
      if (UnknownRecord.is(u)) {
        const a: { [key: string]: any } = {}
        const errors: Errors = []
        const keys = Object.keys(u)
        const len = keys.length
        let changed: boolean = false
        for (let i = 0; i < len; i++) {
          let k = keys[i]
          const ok = u[k]
          const domainResult = domain.validate(k, appendContext(c, k, domain, k))
          if (isLeft(domainResult)) {
            pushAll(errors, domainResult.left)
          } else {
            const vk = domainResult.right
            changed = changed || vk !== k
            k = vk
            const codomainResult = codomain.validate(ok, appendContext(c, k, codomain, ok))
            if (isLeft(codomainResult)) {
              pushAll(errors, codomainResult.left)
            } else {
              const vok = codomainResult.right
              changed = changed || vok !== ok
              a[k] = vok
            }
          }
        }
        return errors.length > 0 ? failures(errors) : success((changed ? a : u) as any)
      }
      if (isAnyC(codomain) && Array.isArray(u)) {
        return success(u)
      }
      return failure(u, c)
    },
    domain.encode === identity && codomain.encode === identity
      ? identity
      : (a) => {
          const s: { [key: string]: any } = {}
          const keys = Object.keys(a)
          const len = keys.length
          for (let i = 0; i < len; i++) {
            const k = keys[i]
            s[String(domain.encode(k))] = codomain.encode(a[k])
          }
          return s as any
        },
    domain,
    codomain
  )
}

/**
 * @category Combinators
 * @since 1.7.1
 */
export function record<D extends Mixed, C extends Mixed>(domain: D, codomain: C, name?: string): RecordC<D, C> {
  const keys = getDomainKeys(domain)
  return keys
    ? enumerableRecord(Object.keys(keys), domain, codomain, name)
    : nonEnumerableRecord(domain, codomain, name)
}

/**
 * @since 1.0.0
 */
export class UnionType<CS extends Array<Any>, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(
    name: string,
    is: UnionType<CS, A, O, I>['is'],
    validate: UnionType<CS, A, O, I>['validate'],
    encode: UnionType<CS, A, O, I>['encode'],
    readonly types: CS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface UnionC<CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends UnionType<CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}

const getUnionName = <CS extends [Mixed, Mixed, ...Array<Mixed>]>(codecs: CS): string => {
  return '(' + codecs.map((type) => type.name).join(' | ') + ')'
}

/**
 * @category Combinators
 * @since 1.0.0
 */
export const union = <CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = getUnionName(codecs)
): UnionC<CS> => {
  const index = getIndex(codecs)
  if (index !== undefined && codecs.length > 0) {
    const [tag, groups] = index
    const len = groups.length
    const find = (value: any): number | undefined => {
      for (let i = 0; i < len; i++) {
        if (groups[i].indexOf(value) !== -1) {
          return i
        }
      }
      return undefined
    }
    // tslint:disable-next-line: deprecation
    return new TaggedUnionType(
      name,
      (u): u is TypeOf<CS[number]> => {
        if (UnknownRecord.is(u)) {
          const i = find(u[tag])
          return i !== undefined ? codecs[i].is(u) : false
        }
        return false
      },
      (u, c) => {
        const e = UnknownRecord.validate(u, c)
        if (isLeft(e)) {
          return e
        }
        const r = e.right
        const i = find(r[tag])
        if (i === undefined) {
          return failure(u, c)
        }
        const codec = codecs[i]
        return codec.validate(r, appendContext(c, String(i), codec, r))
      },
      useIdentity(codecs)
        ? identity
        : (a) => {
            const i = find(a[tag])
            if (i === undefined) {
              // https://github.com/gcanti/io-ts/pull/305
              throw new Error(`no codec found to encode value in union codec ${name}`)
            } else {
              return codecs[i].encode(a)
            }
          },
      codecs,
      tag
    )
  } else {
    return new UnionType(
      name,
      (u): u is TypeOf<CS[number]> => codecs.some((type) => type.is(u)),
      (u, c) => {
        const errors: Errors = []
        for (let i = 0; i < codecs.length; i++) {
          const codec = codecs[i]
          const result = codec.validate(u, appendContext(c, String(i), codec, u))
          if (isLeft(result)) {
            pushAll(errors, result.left)
          } else {
            return success(result.right)
          }
        }
        return failures(errors)
      },
      useIdentity(codecs)
        ? identity
        : (a) => {
            for (const codec of codecs) {
              if (codec.is(a)) {
                return codec.encode(a)
              }
            }
            // https://github.com/gcanti/io-ts/pull/305
            throw new Error(`no codec found to encode value in union type ${name}`)
          },
      codecs
    )
  }
}

/**
 * @since 1.0.0
 */
export class IntersectionType<CS extends Array<Any>, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(
    name: string,
    is: IntersectionType<CS, A, O, I>['is'],
    validate: IntersectionType<CS, A, O, I>['validate'],
    encode: IntersectionType<CS, A, O, I>['encode'],
    readonly types: CS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface IntersectionC<CS extends [Mixed, Mixed, ...Array<Mixed>]>
  extends IntersectionType<
    CS,
    CS extends { length: 2 }
      ? TypeOf<CS[0]> & TypeOf<CS[1]>
      : CS extends { length: 3 }
      ? TypeOf<CS[0]> & TypeOf<CS[1]> & TypeOf<CS[2]>
      : CS extends { length: 4 }
      ? TypeOf<CS[0]> & TypeOf<CS[1]> & TypeOf<CS[2]> & TypeOf<CS[3]>
      : CS extends { length: 5 }
      ? TypeOf<CS[0]> & TypeOf<CS[1]> & TypeOf<CS[2]> & TypeOf<CS[3]> & TypeOf<CS[4]>
      : unknown,
    CS extends { length: 2 }
      ? OutputOf<CS[0]> & OutputOf<CS[1]>
      : CS extends { length: 3 }
      ? OutputOf<CS[0]> & OutputOf<CS[1]> & OutputOf<CS[2]>
      : CS extends { length: 4 }
      ? OutputOf<CS[0]> & OutputOf<CS[1]> & OutputOf<CS[2]> & OutputOf<CS[3]>
      : CS extends { length: 5 }
      ? OutputOf<CS[0]> & OutputOf<CS[1]> & OutputOf<CS[2]> & OutputOf<CS[3]> & OutputOf<CS[4]>
      : unknown,
    unknown
  > {}

const mergeAll = (base: any, us: Array<any>): any => {
  let equal = true
  let primitive = true
  for (const u of us) {
    if (u !== base) {
      equal = false
    }
    if (UnknownRecord.is(u)) {
      primitive = false
    }
  }
  if (equal) {
    return base
  } else if (primitive) {
    return us[us.length - 1]
  }
  let r: any = {}
  for (const u of us) {
    for (const k in u) {
      if (u[k] !== base[k] || !r.hasOwnProperty(k)) {
        r[k] = u[k]
      }
    }
  }
  return r
}

/**
 * @category Combinators
 * @since 1.0.0
 */
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  codecs: [A, B, C, D, E],
  name?: string
): IntersectionC<[A, B, C, D, E]>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  codecs: [A, B, C, D],
  name?: string
): IntersectionC<[A, B, C, D]>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(
  codecs: [A, B, C],
  name?: string
): IntersectionC<[A, B, C]>
export function intersection<A extends Mixed, B extends Mixed>(codecs: [A, B], name?: string): IntersectionC<[A, B]>
export function intersection<CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = `(${codecs.map((type) => type.name).join(' & ')})`
): IntersectionC<CS> {
  const len = codecs.length
  return new IntersectionType(
    name,
    (u: unknown): u is any => codecs.every((type) => type.is(u)),
    codecs.length === 0
      ? success
      : (u, c) => {
          const us: Array<unknown> = []
          const errors: Errors = []
          for (let i = 0; i < len; i++) {
            const codec = codecs[i]
            const result = codec.validate(u, appendContext(c, String(i), codec, u))
            if (isLeft(result)) {
              pushAll(errors, result.left)
            } else {
              us.push(result.right)
            }
          }
          return errors.length > 0 ? failures(errors) : success(mergeAll(u, us))
        },
    codecs.length === 0
      ? identity
      : (a) =>
          mergeAll(
            a,
            codecs.map((codec) => codec.encode(a))
          ),
    codecs
  )
}

/**
 * @since 1.0.0
 */
export class TupleType<CS extends Array<Any>, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(
    name: string,
    is: TupleType<CS, A, O, I>['is'],
    validate: TupleType<CS, A, O, I>['validate'],
    encode: TupleType<CS, A, O, I>['encode'],
    readonly types: CS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface TupleC<CS extends [Mixed, ...Array<Mixed>]>
  extends TupleType<
    CS,
    CS extends { length: 1 }
      ? [TypeOf<CS[0]>]
      : CS extends { length: 2 }
      ? [TypeOf<CS[0]>, TypeOf<CS[1]>]
      : CS extends { length: 3 }
      ? [TypeOf<CS[0]>, TypeOf<CS[1]>, TypeOf<CS[2]>]
      : CS extends { length: 4 }
      ? [TypeOf<CS[0]>, TypeOf<CS[1]>, TypeOf<CS[2]>, TypeOf<CS[3]>]
      : CS extends { length: 5 }
      ? [TypeOf<CS[0]>, TypeOf<CS[1]>, TypeOf<CS[2]>, TypeOf<CS[3]>, TypeOf<CS[4]>]
      : unknown,
    CS extends { length: 1 }
      ? [OutputOf<CS[0]>]
      : CS extends { length: 2 }
      ? [OutputOf<CS[0]>, OutputOf<CS[1]>]
      : CS extends { length: 3 }
      ? [OutputOf<CS[0]>, OutputOf<CS[1]>, OutputOf<CS[2]>]
      : CS extends { length: 4 }
      ? [OutputOf<CS[0]>, OutputOf<CS[1]>, OutputOf<CS[2]>, OutputOf<CS[3]>]
      : CS extends { length: 5 }
      ? [OutputOf<CS[0]>, OutputOf<CS[1]>, OutputOf<CS[2]>, OutputOf<CS[3]>, OutputOf<CS[4]>]
      : unknown,
    unknown
  > {}

/**
 * @category Combinators
 * @since 1.0.0
 */
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  codecs: [A, B, C, D, E],
  name?: string
): TupleC<[A, B, C, D, E]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  codecs: [A, B, C, D],
  name?: string
): TupleC<[A, B, C, D]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(
  codecs: [A, B, C],
  name?: string
): TupleC<[A, B, C]>
export function tuple<A extends Mixed, B extends Mixed>(codecs: [A, B], name?: string): TupleC<[A, B]>
export function tuple<A extends Mixed>(codecs: [A], name?: string): TupleC<[A]>
export function tuple<CS extends [Mixed, ...Array<Mixed>]>(
  codecs: CS,
  name: string = `[${codecs.map((type) => type.name).join(', ')}]`
): TupleC<CS> {
  const len = codecs.length
  return new TupleType(
    name,
    (u): u is any => UnknownArray.is(u) && u.length === len && codecs.every((type, i) => type.is(u[i])),
    (u, c) => {
      const e = UnknownArray.validate(u, c)
      if (isLeft(e)) {
        return e
      }
      const us = e.right
      let as: Array<any> = us.length > len ? us.slice(0, len) : us // strip additional components
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const a = us[i]
        const type = codecs[i]
        const result = type.validate(a, appendContext(c, String(i), type, a))
        if (isLeft(result)) {
          pushAll(errors, result.left)
        } else {
          const va = result.right
          if (va !== a) {
            /* istanbul ignore next */
            if (as === us) {
              as = us.slice()
            }
            as[i] = va
          }
        }
      }
      return errors.length > 0 ? failures(errors) : success(as)
    },
    useIdentity(codecs) ? identity : (a) => codecs.map((type, i) => type.encode(a[i])),
    codecs
  )
}

/**
 * @since 1.0.0
 */
export class ReadonlyType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(
    name: string,
    is: ReadonlyType<C, A, O, I>['is'],
    validate: ReadonlyType<C, A, O, I>['validate'],
    encode: ReadonlyType<C, A, O, I>['encode'],
    readonly type: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface ReadonlyC<C extends Mixed>
  extends ReadonlyType<C, Readonly<TypeOf<C>>, Readonly<OutputOf<C>>, unknown> {}

/**
 * @category Combinators
 * @since 1.0.0
 */
export const readonly = <C extends Mixed>(codec: C, name: string = `Readonly<${codec.name}>`): ReadonlyC<C> => {
  return new ReadonlyType(name, codec.is, codec.validate, codec.encode, codec)
}

/**
 * @since 1.0.0
 */
export class ReadonlyArrayType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(
    name: string,
    is: ReadonlyArrayType<C, A, O, I>['is'],
    validate: ReadonlyArrayType<C, A, O, I>['validate'],
    encode: ReadonlyArrayType<C, A, O, I>['encode'],
    readonly type: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface ReadonlyArrayC<C extends Mixed>
  extends ReadonlyArrayType<C, ReadonlyArray<TypeOf<C>>, ReadonlyArray<OutputOf<C>>, unknown> {}

/**
 * @category Combinators
 * @since 1.0.0
 */
export const readonlyArray = <C extends Mixed>(
  item: C,
  name: string = `ReadonlyArray<${item.name}>`
): ReadonlyArrayC<C> => {
  const codec = array(item)
  return new ReadonlyArrayType(name, codec.is, codec.validate, codec.encode, item) as any
}

/**
 * Strips additional properties
 *
 * @category Combinators
 * @since 1.0.0
 */
export const strict = <P extends Props>(props: P, name?: string): ExactC<TypeC<P>> => {
  return exact(type(props), name)
}

/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
export class TaggedUnionType<
  Tag extends string,
  CS extends Array<Mixed>,
  A = any,
  O = A,
  I = unknown
> extends UnionType<CS, A, O, I> {
  constructor(
    name: string,
    // tslint:disable-next-line: deprecation
    is: TaggedUnionType<Tag, CS, A, O, I>['is'],
    // tslint:disable-next-line: deprecation
    validate: TaggedUnionType<Tag, CS, A, O, I>['validate'],
    // tslint:disable-next-line: deprecation
    encode: TaggedUnionType<Tag, CS, A, O, I>['encode'],
    codecs: CS,
    readonly tag: Tag
  ) {
    super(name, is, validate, encode, codecs) /* istanbul ignore next */ // <= workaround for https://github.com/Microsoft/TypeScript/issues/13455
  }
}

/**
 * @category deprecated
 * @since 1.5.3
 * @deprecated
 */
export interface TaggedUnionC<Tag extends string, CS extends [Mixed, Mixed, ...Array<Mixed>]>  // tslint:disable-next-line: deprecation
  extends TaggedUnionType<Tag, CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}

/**
 * Use `union` instead
 *
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
export const taggedUnion = <Tag extends string, CS extends [Mixed, Mixed, ...Array<Mixed>]>(
  tag: Tag,
  codecs: CS,
  name: string = getUnionName(codecs)
  // tslint:disable-next-line: deprecation
): TaggedUnionC<Tag, CS> => {
  const U = union(codecs, name)
  // tslint:disable-next-line: deprecation
  if (U instanceof TaggedUnionType) {
    return U
  } else {
    console.warn(`[io-ts] Cannot build a tagged union for ${name}, returning a de-optimized union`)
    // tslint:disable-next-line: deprecation
    return new TaggedUnionType(name, U.is, U.validate, U.encode, codecs, tag)
  }
}

/**
 * @since 1.1.0
 */
export class ExactType<C extends Any, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'ExactType' = 'ExactType'
  constructor(
    name: string,
    is: ExactType<C, A, O, I>['is'],
    validate: ExactType<C, A, O, I>['validate'],
    encode: ExactType<C, A, O, I>['encode'],
    readonly type: C
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.1.0
 */
export interface HasPropsRefinement extends RefinementType<HasProps, any, any, any> {}
/**
 * @since 1.1.0
 */
export interface HasPropsReadonly extends ReadonlyType<HasProps, any, any, any> {}
/**
 * @since 1.1.0
 */
export interface HasPropsIntersection extends IntersectionType<Array<HasProps>, any, any, any> {}
/**
 * @since 1.1.0
 */
export type HasProps =
  | HasPropsRefinement
  | HasPropsReadonly
  | HasPropsIntersection
  | InterfaceType<any, any, any, any>
  // tslint:disable-next-line: deprecation
  | StrictType<any, any, any, any>
  | PartialType<any, any, any, any>

const getProps = (codec: HasProps): Props => {
  switch (codec._tag) {
    case 'RefinementType':
    case 'ReadonlyType':
      return getProps(codec.type)
    case 'InterfaceType':
    case 'StrictType':
    case 'PartialType':
      return codec.props
    case 'IntersectionType':
      return codec.types.reduce<Props>((props, type) => Object.assign(props, getProps(type)), {})
  }
}

/**
 * @since 1.5.3
 */
export interface ExactC<C extends HasProps> extends ExactType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}

const stripKeys = (o: any, props: Props): unknown => {
  const keys = Object.getOwnPropertyNames(o)
  let shouldStrip = false
  const r: any = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (!hasOwnProperty.call(props, key)) {
      shouldStrip = true
    } else {
      r[key] = o[key]
    }
  }
  return shouldStrip ? r : o
}

const getExactTypeName = (codec: Any): string => {
  if (isTypeC(codec)) {
    return `{| ${getNameFromProps(codec.props)} |}`
  } else if (isPartialC(codec)) {
    return getPartialTypeName(`{| ${getNameFromProps(codec.props)} |}`)
  }
  return `Exact<${codec.name}>`
}

/**
 * Strips additional properties
 * @since 1.1.0
 */
export const exact = <C extends HasProps>(codec: C, name: string = getExactTypeName(codec)): ExactC<C> => {
  const props: Props = getProps(codec)
  return new ExactType(
    name,
    codec.is,
    (u, c) => {
      const e = UnknownRecord.validate(u, c)
      if (isLeft(e)) {
        return e
      }
      const ce = codec.validate(u, c)
      if (isLeft(ce)) {
        return ce
      }
      return right(stripKeys(ce.right, props))
    },
    (a) => codec.encode(stripKeys(a, props)),
    codec
  )
}

export {
  /**
   * @since 1.0.0
   */
  nullType as null
}

export {
  /**
   * @since 1.0.0
   */
  undefinedType as undefined
}

export {
  /**
   * Use `UnknownArray` instead
   *
   * @category deprecated
   * @deprecated
   * @since 1.0.0
   */
  UnknownArray as Array
}

export {
  /**
   * Use `type` instead
   *
   * @category deprecated
   * @deprecated
   * @since 1.0.0
   */
  type as interface
}
export {
  /**
   * @since 1.0.0
   */
  voidType as void
}

//
// deprecations
//

/**
 * Use `unknown` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export type mixed = unknown

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export const getValidationError /* istanbul ignore next */ = (value: unknown, context: Context): ValidationError => ({
  value,
  context
})

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export const getDefaultContext /* istanbul ignore next */ = (decoder: Decoder<any, any>): Context => [
  { key: '', type: decoder }
]

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export class NeverType extends Type<never> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'NeverType' = 'NeverType'
  constructor() {
    super(
      'never',
      (_): _ is never => false,
      (u, c) => failure(u, c),
      /* istanbul ignore next */
      () => {
        throw new Error('cannot encode never')
      }
    )
  }
}

/**
 * @category deprecated
 * @since 1.5.3
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export interface NeverC extends NeverType {}

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export const never: NeverC = new NeverType()

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export class AnyType extends Type<any> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'AnyType' = 'AnyType'
  constructor() {
    super('any', (_): _ is any => true, success, identity)
  }
}

/**
 * @category deprecated
 * @since 1.5.3
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export interface AnyC extends AnyType {}

/**
 * Use `unknown` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export const any: AnyC = new AnyType()

/**
 * Use `UnknownRecord` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export const Dictionary: UnknownRecordC = UnknownRecord

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export class ObjectType extends Type<object> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super(
      'object',
      (u): u is { [key: string]: unknown } => u !== null && typeof u === 'object',
      (u, c) => (this.is(u) ? success(u) : failure(u, c)),
      identity
    )
  }
}

/**
 * @category deprecated
 * @since 1.5.3
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export interface ObjectC extends ObjectType {}

/**
 * Use `UnknownRecord` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export const object: ObjectC = new ObjectType()

/**
 * Use `BrandC` instead
 *
 * @category deprecated
 * @since 1.5.3
 * @deprecated
 */
export interface RefinementC<C extends Any> extends RefinementType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}

/**
 * Use `brand` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export function refinement<C extends Any>(
  codec: C,
  predicate: Predicate<TypeOf<C>>,
  name: string = `(${codec.name} | ${getFunctionName(predicate)})`
): // tslint:disable-next-line: deprecation
RefinementC<C> {
  return new RefinementType(
    name,
    (u): u is TypeOf<C> => codec.is(u) && predicate(u),
    (i, c) => {
      const e = codec.validate(i, c)
      if (isLeft(e)) {
        return e
      }
      const a = e.right
      return predicate(a) ? success(a) : failure(a, c)
    },
    codec.encode,
    codec,
    predicate
  )
}

/**
 * Use `Int` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export const Integer = refinement(number, Number.isInteger, 'Integer')

/**
 * Use `record` instead
 *
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export const dictionary: typeof record = record

/**
 * used in `intersection` as a workaround for #234
 *
 * @category deprecated
 * @since 1.4.2
 * @deprecated
 */
export type Compact<A> = { [K in keyof A]: A[K] }

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export class StrictType<P, A = any, O = A, I = unknown> extends Type<A, O, I> {
  /**
   * @since 1.0.0
   */
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(
    name: string,
    // tslint:disable-next-line: deprecation
    is: StrictType<P, A, O, I>['is'],
    // tslint:disable-next-line: deprecation
    validate: StrictType<P, A, O, I>['validate'],
    // tslint:disable-next-line: deprecation
    encode: StrictType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @category deprecated
 * @since 1.5.3
 * @deprecated
 */
export interface StrictC<P extends Props>  // tslint:disable-next-line: deprecation
  extends StrictType<P, { [K in keyof P]: TypeOf<P[K]> }, { [K in keyof P]: OutputOf<P[K]> }, unknown> {}

/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralType<any> }

/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export interface TaggedRefinement<Tag extends string, A, O = A> extends RefinementType<Tagged<Tag>, A, O> {}

/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export interface TaggedUnion<Tag extends string, A, O = A> extends UnionType<Array<Tagged<Tag>>, A, O> {}

/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
export type TaggedIntersectionArgument<Tag extends string> =
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>]
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Tagged<Tag>]
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Tagged<Tag>, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Tagged<Tag>]
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>, Mixed, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Tagged<Tag>, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Tagged<Tag>, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Mixed, Tagged<Tag>]
  // tslint:disable-next-line: deprecation
  | [Tagged<Tag>, Mixed, Mixed, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Tagged<Tag>, Mixed, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Tagged<Tag>, Mixed, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Mixed, Tagged<Tag>, Mixed]
  // tslint:disable-next-line: deprecation
  | [Mixed, Mixed, Mixed, Mixed, Tagged<Tag>]

/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
export interface TaggedIntersection<Tag extends string, A, O = A>  // tslint:disable-next-line: deprecation
  extends IntersectionType<TaggedIntersectionArgument<Tag>, A, O> {}

/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
// tslint:disable-next-line: deprecation
export interface TaggedExact<Tag extends string, A, O = A> extends ExactType<Tagged<Tag>, A, O> {}

/**
 * @category deprecated
 * @since 1.3.0
 * @deprecated
 */
export type Tagged<Tag extends string, A = any, O = A> =
  // tslint:disable-next-line: deprecation
  | InterfaceType<TaggedProps<Tag>, A, O>
  // tslint:disable-next-line: deprecation
  | StrictType<TaggedProps<Tag>, A, O>
  // tslint:disable-next-line: deprecation
  | TaggedRefinement<Tag, A, O>
  // tslint:disable-next-line: deprecation
  | TaggedUnion<Tag, A, O>
  // tslint:disable-next-line: deprecation
  | TaggedIntersection<Tag, A, O>
  // tslint:disable-next-line: deprecation
  | TaggedExact<Tag, A, O>
  | RecursiveType<any, A, O>

/**
 * Drops the codec "kind"
 *
 * @category deprecated
 * @since 1.1.0
 * @deprecated
 */
export function clean<A, O = A, I = unknown>(codec: Type<A, O, I>): Type<A, O, I> {
  return codec as any
}

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export type PropsOf<T extends { props: any }> = T['props']

/**
 * @category deprecated
 * @since 1.1.0
 * @deprecated
 */
export type Exact<T, X extends T> = T &
  { [K in ({ [K in keyof X]: K } & { [K in keyof T]: never } & { [key: string]: never })[keyof X]]?: never }

/**
 * Keeps the codec "kind"
 *
 * @category deprecated
 * @since 1.1.0
 * @deprecated
 */
export function alias<A, O, P, I>(
  codec: PartialType<P, A, O, I>
): <
  // tslint:disable-next-line: deprecation
  AA extends Exact<A, AA>,
  // tslint:disable-next-line: deprecation
  OO extends Exact<O, OO> = O,
  // tslint:disable-next-line: deprecation
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => PartialType<PP, AA, OO, II>
export function alias<A, O, P, I>(
  // tslint:disable-next-line: deprecation
  codec: StrictType<P, A, O, I>
): <
  // tslint:disable-next-line: deprecation
  AA extends Exact<A, AA>,
  // tslint:disable-next-line: deprecation
  OO extends Exact<O, OO> = O,
  // tslint:disable-next-line: deprecation
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => // tslint:disable-next-line: deprecation
StrictType<PP, AA, OO, II>
export function alias<A, O, P, I>(
  codec: InterfaceType<P, A, O, I>
): <
  // tslint:disable-next-line: deprecation
  AA extends Exact<A, AA>,
  // tslint:disable-next-line: deprecation
  OO extends Exact<O, OO> = O,
  // tslint:disable-next-line: deprecation
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => InterfaceType<PP, AA, OO, II>
export function alias<A, O, I>(
  codec: Type<A, O, I>
): // tslint:disable-next-line: deprecation
<AA extends Exact<A, AA>, OO extends Exact<O, OO> = O>() => Type<AA, OO, I> {
  return () => codec as any
}

interface NonEmptyArray<A> extends Array<A> {
  0: A
}

const isNonEmpty = <A>(as: Array<A>): as is NonEmptyArray<A> => as.length > 0

interface Tags extends Record<string, NonEmptyArray<LiteralValue>> {}

/**
 * @internal
 */
export const emptyTags: Tags = {}

function intersect(a: NonEmptyArray<LiteralValue>, b: NonEmptyArray<LiteralValue>): Array<LiteralValue> {
  const r: Array<LiteralValue> = []
  for (const v of a) {
    if (b.indexOf(v) !== -1) {
      r.push(v)
    }
  }
  return r
}

function mergeTags(a: Tags, b: Tags): Tags {
  if (a === emptyTags) {
    return b
  }
  if (b === emptyTags) {
    return a
  }
  let r: Tags = Object.assign({}, a)
  for (const k in b) {
    if (a.hasOwnProperty(k)) {
      const intersection = intersect(a[k], b[k])
      if (isNonEmpty(intersection)) {
        r[k] = intersection
      } else {
        r = emptyTags
        break
      }
    } else {
      r[k] = b[k]
    }
  }
  return r
}

function intersectTags(a: Tags, b: Tags): Tags {
  if (a === emptyTags || b === emptyTags) {
    return emptyTags
  }
  let r: Tags = emptyTags
  for (const k in a) {
    if (b.hasOwnProperty(k)) {
      const intersection = intersect(a[k], b[k])
      if (intersection.length === 0) {
        if (r === emptyTags) {
          r = {}
        }
        r[k] = a[k].concat(b[k]) as any
      }
    }
  }
  return r
}

// tslint:disable-next-line: deprecation
function isAnyC(codec: Any): codec is AnyC {
  return (codec as any)._tag === 'AnyType'
}

function isLiteralC(codec: Any): codec is LiteralC<LiteralValue> {
  return (codec as any)._tag === 'LiteralType'
}

function isKeyofC(codec: Any): codec is KeyofC<Record<string, unknown>> {
  return (codec as any)._tag === 'KeyofType'
}

function isTypeC(codec: Any): codec is TypeC<Props> {
  return (codec as any)._tag === 'InterfaceType'
}

function isPartialC(codec: Any): codec is PartialC<Props> {
  return (codec as any)._tag === 'PartialType'
}

// tslint:disable-next-line: deprecation
function isStrictC(codec: Any): codec is StrictC<Props> {
  return (codec as any)._tag === 'StrictType'
}

function isExactC(codec: Any): codec is ExactC<HasProps> {
  return (codec as any)._tag === 'ExactType'
}

// tslint:disable-next-line: deprecation
function isRefinementC(codec: Any): codec is RefinementC<Any> {
  return (codec as any)._tag === 'RefinementType'
}

function isIntersectionC(codec: Any): codec is IntersectionC<[Mixed, Mixed, ...Array<Mixed>]> {
  return (codec as any)._tag === 'IntersectionType'
}

function isUnionC(codec: Any): codec is UnionC<[Mixed, Mixed, ...Array<Mixed>]> {
  return (codec as any)._tag === 'UnionType'
}

function isRecursiveC(codec: Any): codec is RecursiveType<Any> {
  return (codec as any)._tag === 'RecursiveType'
}

const lazyCodecs: Array<Any> = []

/**
 * @internal
 */
export function getTags(codec: Any): Tags {
  if (lazyCodecs.indexOf(codec) !== -1) {
    return emptyTags
  }
  if (isTypeC(codec) || isStrictC(codec)) {
    let index: Tags = emptyTags
    // tslint:disable-next-line: forin
    for (let k in codec.props) {
      const prop = codec.props[k]
      if (isLiteralC(prop)) {
        if (index === emptyTags) {
          index = {}
        }
        index[k] = [prop.value]
      }
    }
    return index
  } else if (isExactC(codec) || isRefinementC(codec)) {
    return getTags(codec.type)
  } else if (isIntersectionC(codec)) {
    return codec.types.reduce((tags, codec) => mergeTags(tags, getTags(codec)), emptyTags)
  } else if (isUnionC(codec)) {
    return codec.types.slice(1).reduce((tags, codec) => intersectTags(tags, getTags(codec)), getTags(codec.types[0]))
  } else if (isRecursiveC(codec)) {
    lazyCodecs.push(codec)
    const tags = getTags(codec.type)
    lazyCodecs.pop()
    return tags
  }
  return emptyTags
}

/**
 * @internal
 */
export function getIndex(codecs: NonEmptyArray<Any>): [string, NonEmptyArray<NonEmptyArray<LiteralValue>>] | undefined {
  const tags = getTags(codecs[0])
  const keys = Object.keys(tags)
  const len = codecs.length
  keys: for (const k of keys) {
    const all = tags[k].slice()
    const index: NonEmptyArray<NonEmptyArray<LiteralValue>> = [tags[k]]
    for (let i = 1; i < len; i++) {
      const codec = codecs[i]
      const ctags = getTags(codec)
      const values = ctags[k]
      // tslint:disable-next-line: strict-type-predicates
      if (values === undefined) {
        continue keys
      } else {
        if (values.some((v) => all.indexOf(v) !== -1)) {
          continue keys
        } else {
          all.push(...values)
          index.push(values)
        }
      }
    }
    return [k, index]
  }
  return undefined
}
