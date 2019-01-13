import { Either, Left, Right } from 'fp-ts/lib/Either'
import { Predicate } from 'fp-ts/lib/function'

/**
 * @since 1.0.0
 */
export type mixed = unknown

/**
 * @since 1.0.0
 */
export interface ContextEntry {
  readonly key: string
  readonly type: Decoder<any, any>
}
/**
 * @since 1.0.0
 */
export interface Context extends ReadonlyArray<ContextEntry> {}

/**
 * @since 1.0.0
 */
export interface ValidationError {
  readonly value: mixed
  readonly context: Context
}

/**
 * @since 1.0.0
 */
export interface Errors extends Array<ValidationError> {}

/**
 * @since 1.0.0
 */
export type Validation<A> = Either<Errors, A>

/**
 * @since 1.0.0
 */
export type Is<A> = (m: mixed) => m is A

/**
 * @since 1.0.0
 */
export type Validate<I, A> = (i: I, context: Context) => Validation<A>

/**
 * @since 1.0.0
 */
export type Decode<I, A> = (i: I) => Validation<A>

/**
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
export interface Mixed extends Type<any, any, mixed> {}

/**
 * @since 1.0.0
 */
export type TypeOf<RT extends any> = RT['_A']

/**
 * @since 1.0.0
 */
export type InputOf<RT extends any> = RT['_I']

/**
 * @since 1.0.0
 */
export type OutputOf<RT extends any> = RT['_O']

/**
 * @since 1.0.0
 */
export interface Decoder<I, A> {
  readonly name: string
  readonly validate: Validate<I, A>
  readonly decode: Decode<I, A>
}

/**
 * @since 1.0.0
 */
export interface Encoder<A, O> {
  readonly encode: Encode<A, O>
}

/**
 * @since 1.0.0
 */
export class Type<A, O = A, I = mixed> implements Decoder<I, A>, Encoder<A, O> {
  readonly _A!: A
  readonly _O!: O
  readonly _I!: I
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

  pipe<B, IB, A extends IB, OB extends A>(
    this: Type<A, O, I>,
    ab: Type<B, OB, IB>,
    name: string = `pipe(${this.name}, ${ab.name})`
  ): Type<B, O, I> {
    return new Type(
      name,
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
export const getContextEntry = (key: string, type: Decoder<any, any>): ContextEntry => ({ key, type })

/**
 * @since 1.0.0
 */
export const getValidationError = (value: mixed, context: Context): ValidationError => ({ value, context })

/**
 * @since 1.0.0
 */
export const getDefaultContext = (type: Decoder<any, any>): Context => [{ key: '', type }]

/**
 * @since 1.0.0
 */
export const appendContext = (c: Context, key: string, type: Decoder<any, any>): Context => {
  const len = c.length
  const r = Array(len + 1)
  for (let i = 0; i < len; i++) {
    r[i] = c[i]
  }
  r[len] = { key, type }
  return r
}

/**
 * @since 1.0.0
 */
export const failures = <T>(errors: Errors): Validation<T> => new Left(errors)

/**
 * @since 1.0.0
 */
export const failure = <T>(value: mixed, context: Context): Validation<T> =>
  failures([getValidationError(value, context)])

/**
 * @since 1.0.0
 */
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

/**
 * @since 1.0.0
 */
export class NullType extends Type<null> {
  readonly _tag: 'NullType' = 'NullType'
  constructor() {
    super('null', (m): m is null => m === null, (m, c) => (this.is(m) ? success(m) : failure(m, c)), identity)
  }
}

/**
 * @since 1.5.3
 */
export interface NullC extends NullType {}

/**
 * @alias `null`
 * @since 1.0.0
 */
export const nullType: NullC = new NullType()

/**
 * @since 1.0.0
 */
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

/**
 * @since 1.5.3
 */
export interface UndefinedC extends UndefinedType {}

const undefinedType: UndefinedC = new UndefinedType()

/**
 * @since 1.2.0
 */
export class VoidType extends Type<void> {
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
 * @alias `void`
 * @since 1.2.0
 */
export const voidType: VoidC = new VoidType()

/**
 * @since 1.0.0
 */
export class AnyType extends Type<any> {
  readonly _tag: 'AnyType' = 'AnyType'
  constructor() {
    super('any', (_): _ is any => true, success, identity)
  }
}

/**
 * @since 1.5.3
 */
export interface AnyC extends AnyType {}

/**
 * @since 1.0.0
 */
export const any: AnyC = new AnyType()

/**
 * @since 1.5.0
 */
export class UnknownType extends Type<unknown> {
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
 * @since 1.5.0
 */
export const unknown: UnknownC = new UnknownType()

/**
 * @since 1.0.0
 */
export class NeverType extends Type<never> {
  readonly _tag: 'NeverType' = 'NeverType'
  constructor() {
    super(
      'never',
      (_): _ is never => false,
      (m, c) => failure(m, c),
      /* istanbul ignore next */
      () => {
        throw new Error('cannot encode never')
      }
    )
  }
}

/**
 * @since 1.5.3
 */
export interface NeverC extends NeverType {}

/**
 * @since 1.0.0
 */
export const never: NeverC = new NeverType()

/**
 * @since 1.0.0
 */
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

/**
 * @since 1.5.3
 */
export interface StringC extends StringType {}

/**
 * @since 1.0.0
 */
export const string: StringC = new StringType()

/**
 * @since 1.0.0
 */
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

/**
 * @since 1.5.3
 */
export interface NumberC extends NumberType {}

/**
 * @since 1.0.0
 */
export const number: NumberC = new NumberType()

/**
 * @since 1.0.0
 */
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

/**
 * @since 1.5.3
 */
export interface BooleanC extends BooleanType {}

/**
 * @since 1.0.0
 */
export const boolean: BooleanC = new BooleanType()

/**
 * @since 1.0.0
 */
export class AnyArrayType extends Type<Array<mixed>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  constructor() {
    super('Array', Array.isArray, (m, c) => (this.is(m) ? success(m) : failure(m, c)), identity)
  }
}

/**
 * @since 1.5.3
 */
export interface UnknownArrayC extends AnyArrayType {}

const arrayType: UnknownArrayC = new AnyArrayType()

/**
 * @since 1.0.0
 */
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

/**
 * @since 1.5.3
 */
export interface UnknownRecordC extends AnyDictionaryType {}

/**
 * @since 1.0.0
 */
export const Dictionary: UnknownRecordC = new AnyDictionaryType()

/**
 * @since 1.0.0
 */
export class ObjectType extends Type<object> {
  readonly _tag: 'ObjectType' = 'ObjectType'
  constructor() {
    super('object', Dictionary.is, Dictionary.validate, identity)
  }
}

/**
 * @since 1.5.3
 */
export interface ObjectC extends ObjectType {}

/**
 * @since 1.0.0
 */
export const object: ObjectC = new ObjectType()

/**
 * @since 1.0.0
 */
export class FunctionType extends Type<Function> {
  readonly _tag: 'FunctionType' = 'FunctionType'
  constructor() {
    super(
      'Function',
      // tslint:disable-next-line:strict-type-predicates
      (m): m is Function => typeof m === 'function',
      (m, c) => (this.is(m) ? success(m) : failure(m, c)),
      identity
    )
  }
}

/**
 * @since 1.5.3
 */
export interface FunctionC extends FunctionType {}

/**
 * @since 1.0.0
 */
export const Function: FunctionC = new FunctionType()

/**
 * @since 1.0.0
 */
export class RefinementType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  constructor(
    name: string,
    is: RefinementType<RT, A, O, I>['is'],
    validate: RefinementType<RT, A, O, I>['validate'],
    encode: RefinementType<RT, A, O, I>['encode'],
    readonly type: RT,
    readonly predicate: Predicate<A>
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface RefinementC<C extends Any> extends RefinementType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}

/**
 * @since 1.0.0
 */
export const refinement = <RT extends Any>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name: string = `(${type.name} | ${getFunctionName(predicate)})`
): RefinementC<RT> =>
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

/**
 * @since 1.0.0
 */
export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

type LiteralValue = string | number | boolean

/**
 * @since 1.0.0
 */
export class LiteralType<V extends LiteralValue> extends Type<V> {
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
 * @since 1.0.0
 */
export const literal = <V extends LiteralValue>(value: V, name: string = JSON.stringify(value)): LiteralC<V> => {
  const is = (m: mixed): m is V => m === value
  return new LiteralType(name, is, (m, c) => (is(m) ? success(value) : failure(m, c)), identity, value)
}

/**
 * @since 1.0.0
 */
export class KeyofType<D extends { [key: string]: mixed }> extends Type<keyof D> {
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
export interface KeyofC<D extends { [key: string]: mixed }> extends KeyofType<D> {}

/**
 * @since 1.0.0
 */
export const keyof = <D extends { [key: string]: mixed }>(
  keys: D,
  name: string = `(keyof ${JSON.stringify(Object.keys(keys))})`
): KeyofC<D> => {
  const is = (m: mixed): m is keyof D => string.is(m) && hasOwnProperty.call(keys, m)
  return new KeyofType(name, is, (m, c) => (is(m) ? success(m) : failure(m, c)), identity, keys)
}

/**
 * @since 1.0.0
 */
export class RecursiveType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'RecursiveType' = 'RecursiveType'
  constructor(
    name: string,
    is: RecursiveType<RT, A, O, I>['is'],
    validate: RecursiveType<RT, A, O, I>['validate'],
    encode: RecursiveType<RT, A, O, I>['encode'],
    private runDefinition: () => RT
  ) {
    super(name, is, validate, encode)
  }
  get type(): RT {
    return this.runDefinition()
  }
}

/**
 * @since 1.0.0
 */
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

/**
 * @since 1.0.0
 */
export class ArrayType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  constructor(
    name: string,
    is: ArrayType<RT, A, O, I>['is'],
    validate: ArrayType<RT, A, O, I>['validate'],
    encode: ArrayType<RT, A, O, I>['encode'],
    readonly type: RT
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface ArrayC<C extends Mixed> extends ArrayType<C, Array<TypeOf<C>>, Array<OutputOf<C>>, unknown> {}

/**
 * @since 1.0.0
 */
export const array = <RT extends Mixed>(type: RT, name: string = `Array<${type.name}>`): ArrayC<RT> =>
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

/**
 * @since 1.0.0
 */
export class InterfaceType<P, A = any, O = A, I = mixed> extends Type<A, O, I> {
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
  `{ ${Object.keys(props)
    .map(k => `${k}: ${props[k].name}`)
    .join(', ')} }`

const useIdentity = (types: Array<Any>, len: number): boolean => {
  for (let i = 0; i < len; i++) {
    if (types[i].encode !== identity) {
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
export interface TypeC<P extends Props> extends InterfaceType<P, TypeOfProps<P>, OutputOfProps<P>, unknown> {}

/**
 * @alias `interface`
 * @since 1.0.0
 */
export const type = <P extends Props>(props: P, name: string = getNameFromProps(props)): TypeC<P> => {
  const keys = Object.keys(props)
  const types = keys.map(key => props[key])
  const len = keys.length
  return new InterfaceType(
    name,
    (m): m is TypeOfProps<P> => {
      if (!Dictionary.is(m)) {
        return false
      }
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        if (!hasOwnProperty.call(m, k) || !types[i].is(m[k])) {
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
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          if (!hasOwnProperty.call(a, k)) {
            if (a === o) {
              a = { ...o }
            }
            a[k] = a[k]
          }
          const ak = a[k]
          const type = types[i]
          const validation = type.validate(ak, appendContext(c, k, type))
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          } else {
            const vak = validation.value
            if (vak !== ak) {
              /* istanbul ignore next */
              if (a === o) {
                a = { ...o }
              }
              a[k] = vak
            }
          }
        }
        return errors.length ? failures(errors) : success(a as any)
      }
    },
    useIdentity(types, len)
      ? identity
      : a => {
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
export class PartialType<P, A = any, O = A, I = mixed> extends Type<A, O, I> {
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
  extends PartialType<P, TypeOfPartialProps<P>, OutputOfPartialProps<P>, unknown> {}

/**
 * @since 1.0.0
 */
export const partial = <P extends Props>(
  props: P,
  name: string = `PartialType<${getNameFromProps(props)}>`
): PartialC<P> => {
  const keys = Object.keys(props)
  const types = keys.map(key => props[key])
  const len = keys.length
  const partials: Props = {}
  for (let i = 0; i < len; i++) {
    partials[keys[i]] = union([types[i], undefinedType])
  }
  return new PartialType(
    name,
    (m): m is TypeOfPartialProps<P> => {
      if (!Dictionary.is(m)) {
        return false
      }
      for (let i = 0; i < len; i++) {
        const k = keys[i]
        if (!partials[k].is(m[k])) {
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
        for (let i = 0; i < len; i++) {
          const k = keys[i]
          const ak = a[k]
          const type = partials[k]
          const validation = type.validate(ak, appendContext(c, k, type))
          if (validation.isLeft()) {
            pushAll(errors, validation.value)
          } else {
            const vak = validation.value
            if (vak !== ak) {
              /* istanbul ignore next */
              if (a === o) {
                a = { ...o }
              }
              a[k] = vak
            }
          }
        }
        return errors.length ? failures(errors) : success(a as any)
      }
    },
    useIdentity(types, len)
      ? identity
      : a => {
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
export class DictionaryType<D extends Any, C extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
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

const refinedDictionary = refinement(Dictionary, d => Object.prototype.toString.call(d) === '[object Object]')

/**
 * @since 1.5.3
 */
export interface RecordC<D extends Mixed, C extends Mixed>
  extends DictionaryType<D, C, TypeOfDictionary<D, C>, OutputOfDictionary<D, C>, unknown> {}

/**
 * @since 1.0.0
 */
export const dictionary = <D extends Mixed, C extends Mixed>(
  domain: D,
  codomain: C,
  name: string = `{ [K in ${domain.name}]: ${codomain.name} }`
): RecordC<D, C> => {
  const isIndexSignatureRequired = (codomain as any) !== any
  const D = isIndexSignatureRequired ? refinedDictionary : Dictionary
  return new DictionaryType(
    name,
    (m): m is TypeOfDictionary<D, C> => D.is(m) && Object.keys(m).every(k => domain.is(k) && codomain.is(m[k])),
    (m, c) => {
      const dictionaryValidation = D.validate(m, c)
      if (dictionaryValidation.isLeft()) {
        return dictionaryValidation
      } else {
        const o = dictionaryValidation.value
        const a: { [key: string]: any } = {}
        const errors: Errors = []
        const keys = Object.keys(o)
        const len = keys.length
        let changed: boolean = false
        for (let i = 0; i < len; i++) {
          let k = keys[i]
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
 * @since 1.0.0
 */
export class UnionType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'UnionType' = 'UnionType'
  constructor(
    name: string,
    is: UnionType<RTS, A, O, I>['is'],
    validate: UnionType<RTS, A, O, I>['validate'],
    encode: UnionType<RTS, A, O, I>['encode'],
    readonly types: RTS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface UnionC<CS extends Array<Mixed>>
  extends UnionType<CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}

/**
 * @since 1.0.0
 */
export const union = <RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' | ')})`
): UnionC<RTS> => {
  const len = types.length
  return new UnionType(
    name,
    (m): m is TypeOf<RTS[number]> => types.some(type => type.is(m)),
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
    useIdentity(types, len)
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

/**
 * @since 1.0.0
 */
export class IntersectionType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  constructor(
    name: string,
    is: IntersectionType<RTS, A, O, I>['is'],
    validate: IntersectionType<RTS, A, O, I>['validate'],
    encode: IntersectionType<RTS, A, O, I>['encode'],
    readonly types: RTS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * used in `intersection` as a workaround for #234
 * @since 1.4.2
 * @deprecated
 */
export type Compact<A> = { [K in keyof A]: A[K] }

/**
 * @since 1.5.3
 */
export interface IntersectionC<CS extends Array<Mixed>>
  extends IntersectionType<
    CS,
    CS extends [Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']>
      : CS extends [Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']>
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']> & TypeOf<CS['3']>
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? TypeOf<CS['0']> & TypeOf<CS['1']> & TypeOf<CS['2']> & TypeOf<CS['3']> & TypeOf<CS['4']>
      : TypeOf<CS[number]>,
    CS extends [Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']>
      : CS extends [Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']>
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']> & OutputOf<CS['3']>
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? OutputOf<CS['0']> & OutputOf<CS['1']> & OutputOf<CS['2']> & OutputOf<CS['3']> & OutputOf<CS['4']>
      : OutputOf<CS[number]>,
    unknown
  > {}

/**
 * @since 1.0.0
 */
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  types: [A, B, C, D, E],
  name?: string
): IntersectionC<[A, B, C, D, E]>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  types: [A, B, C, D],
  name?: string
): IntersectionC<[A, B, C, D]>
export function intersection<A extends Mixed, B extends Mixed, C extends Mixed>(
  types: [A, B, C],
  name?: string
): IntersectionC<[A, B, C]>
export function intersection<A extends Mixed, B extends Mixed>(types: [A, B], name?: string): IntersectionC<[A, B]>
export function intersection<RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' & ')})`
): IntersectionC<RTS> {
  const len = types.length
  return new IntersectionType(
    name,
    (m): m is any => types.every(type => type.is(m)),
    (m, c) => {
      let a = m
      const errors: Errors = []
      for (let i = 0; i < len; i++) {
        const type = types[i]
        const validation = type.validate(a, appendContext(c, String(i), type))
        if (validation.isLeft()) {
          pushAll(errors, validation.value)
        } else {
          a = validation.value
        }
      }
      return errors.length ? failures(errors) : success(a)
    },
    useIdentity(types, len)
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

/**
 * @since 1.0.0
 */
export class TupleType<RTS extends Array<Any>, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'TupleType' = 'TupleType'
  constructor(
    name: string,
    is: TupleType<RTS, A, O, I>['is'],
    validate: TupleType<RTS, A, O, I>['validate'],
    encode: TupleType<RTS, A, O, I>['encode'],
    readonly types: RTS
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface TupleC<CS extends Array<Mixed>>
  extends TupleType<
    CS,
    CS extends [Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>]
      : CS extends [Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>, TypeOf<CS['3']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? [TypeOf<CS['0']>, TypeOf<CS['1']>, TypeOf<CS['2']>, TypeOf<CS['3']>, TypeOf<CS['4']>]
      : TypeOf<CS[number]>,
    CS extends [Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>]
      : CS extends [Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>, OutputOf<CS['3']>]
      : CS extends [Mixed, Mixed, Mixed, Mixed, Mixed]
      ? [OutputOf<CS['0']>, OutputOf<CS['1']>, OutputOf<CS['2']>, OutputOf<CS['3']>, OutputOf<CS['4']>]
      : OutputOf<CS[number]>,
    unknown
  > {}

/**
 * @since 1.0.0
 */
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed, E extends Mixed>(
  types: [A, B, C, D, E],
  name?: string
): TupleC<[A, B, C, D, E]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed, D extends Mixed>(
  types: [A, B, C, D],
  name?: string
): TupleC<[A, B, C, D]>
export function tuple<A extends Mixed, B extends Mixed, C extends Mixed>(
  types: [A, B, C],
  name?: string
): TupleC<[A, B, C]>
export function tuple<A extends Mixed, B extends Mixed>(types: [A, B], name?: string): TupleC<[A, B]>
export function tuple<A extends Mixed>(types: [A], name?: string): TupleType<[A], [TypeOf<A>], [OutputOf<A>], mixed>
export function tuple<RTS extends Array<Mixed>>(
  types: RTS,
  name: string = `[${types.map(type => type.name).join(', ')}]`
): TupleC<RTS> {
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
              /* istanbul ignore next */
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
    useIdentity(types, len) ? identity : a => types.map((type, i) => type.encode(a[i])),
    types
  )
}

/**
 * @since 1.0.0
 */
export class ReadonlyType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  constructor(
    name: string,
    is: ReadonlyType<RT, A, O, I>['is'],
    validate: ReadonlyType<RT, A, O, I>['validate'],
    encode: ReadonlyType<RT, A, O, I>['encode'],
    readonly type: RT
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
 * @since 1.0.0
 */
export const readonly = <RT extends Mixed>(type: RT, name: string = `Readonly<${type.name}>`): ReadonlyC<RT> =>
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

/**
 * @since 1.0.0
 */
export class ReadonlyArrayType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  constructor(
    name: string,
    is: ReadonlyArrayType<RT, A, O, I>['is'],
    validate: ReadonlyArrayType<RT, A, O, I>['validate'],
    encode: ReadonlyArrayType<RT, A, O, I>['encode'],
    readonly type: RT
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
 * @since 1.0.0
 */
export const readonlyArray = <RT extends Mixed>(
  type: RT,
  name: string = `ReadonlyArray<${type.name}>`
): ReadonlyArrayC<RT> => {
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

/**
 * @since 1.0.0
 */
export class StrictType<P, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'StrictType' = 'StrictType'
  constructor(
    name: string,
    is: StrictType<P, A, O, I>['is'],
    validate: StrictType<P, A, O, I>['validate'],
    encode: StrictType<P, A, O, I>['encode'],
    readonly props: P
  ) {
    super(name, is, validate, encode)
  }
}

/**
 * @since 1.5.3
 */
export interface StrictC<P extends Props> extends StrictType<P, TypeOfProps<P>, OutputOfProps<P>, unknown> {}

/**
 * Specifies that only the given properties are allowed
 * @deprecated use `exact` instead
 * @since 1.0.0
 */
export const strict = <P extends Props>(
  props: P,
  name: string = `StrictType<${getNameFromProps(props)}>`
): StrictC<P> => {
  const exactType = exact(type(props))
  return new StrictType(name, exactType.is, exactType.validate, exactType.encode, props)
}

/**
 * @since 1.3.0
 */
export type TaggedProps<Tag extends string> = { [K in Tag]: LiteralType<any> }
/**
 * @since 1.3.0
 */
export interface TaggedRefinement<Tag extends string, A, O = A> extends RefinementType<Tagged<Tag>, A, O> {}
/**
 * @since 1.3.0
 */
export interface TaggedUnion<Tag extends string, A, O = A> extends UnionType<Array<Tagged<Tag>>, A, O> {}
/**
 * @since 1.3.0
 */
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
/**
 * @since 1.3.0
 */
export interface TaggedIntersection<Tag extends string, A, O = A>
  extends IntersectionType<TaggedIntersectionArgument<Tag>, A, O> {}
/**
 * @since 1.3.0
 */
export interface TaggedExact<Tag extends string, A, O = A> extends ExactType<Tagged<Tag>, A, O> {}
/**
 * @since 1.3.0
 */
export type Tagged<Tag extends string, A = any, O = A> =
  | InterfaceType<TaggedProps<Tag>, A, O>
  | StrictType<TaggedProps<Tag>, A, O>
  | TaggedRefinement<Tag, A, O>
  | TaggedUnion<Tag, A, O>
  | TaggedIntersection<Tag, A, O>
  | TaggedExact<Tag, A, O>
  | RecursiveType<any, A, O>

/**
 * @since 1.3.0
 */
export const isTagged = <Tag extends string>(tag: Tag): ((type: Mixed) => type is Tagged<Tag>) => {
  const f = (type: Mixed): type is Tagged<Tag> => {
    if (type instanceof InterfaceType || type instanceof StrictType) {
      return hasOwnProperty.call(type.props, tag)
    } else if (type instanceof IntersectionType) {
      return type.types.some(f)
    } else if (type instanceof UnionType) {
      return type.types.every(f)
    } else if (type instanceof RefinementType || type instanceof ExactType) {
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

/**
 * @since 1.3.0
 */
export const getTagValue = <Tag extends string>(tag: Tag): ((type: Tagged<Tag>) => string | number | boolean) => {
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
      case 'ExactType':
      case 'RecursiveType':
        return f(type.type)
    }
  }
  return f
}

/**
 * @since 1.3.0
 */
export class TaggedUnionType<
  Tag extends string,
  RTS extends Array<Tagged<Tag>>,
  A = any,
  O = A,
  I = mixed
> extends UnionType<RTS, A, O, I> {
  constructor(
    name: string,
    is: TaggedUnionType<Tag, RTS, A, O, I>['is'],
    validate: TaggedUnionType<Tag, RTS, A, O, I>['validate'],
    encode: TaggedUnionType<Tag, RTS, A, O, I>['encode'],
    types: RTS,
    readonly tag: Tag
  ) {
    super(name, is, validate, encode, types) /* istanbul ignore next */ // <= workaround for https://github.com/Microsoft/TypeScript/issues/13455
  }
}

/**
 * @since 1.5.3
 */
export interface TaggedUnionC<Tag extends string, CS extends Array<Tagged<Tag>>>
  extends TaggedUnionType<Tag, CS, TypeOf<CS[number]>, OutputOf<CS[number]>, unknown> {}

/**
 * @since 1.3.0
 */
export const taggedUnion = <Tag extends string, RTS extends Array<Tagged<Tag>>>(
  tag: Tag,
  types: RTS,
  name: string = `(${types.map(type => type.name).join(' | ')})`
): TaggedUnionC<Tag, RTS> => {
  const len = types.length
  const values: Array<string | number | boolean> = new Array(len)
  const hash: { [key: string]: number } = {}
  let useHash = true
  const get = getTagValue(tag)
  for (let i = 0; i < len; i++) {
    const value = get(types[i])
    useHash = useHash && string.is(value)
    values[i] = value
    hash[String(value)] = i
  }
  const isTagValue = useHash
    ? (m: mixed): m is string | number | boolean => string.is(m) && hasOwnProperty.call(hash, m)
    : (m: mixed): m is string | number | boolean => values.indexOf(m as any) !== -1
  const getIndex: (tag: string | number | boolean) => number = useHash
    ? tag => hash[tag as any]
    : tag => {
        let i = 0
        for (; i < len - 1; i++) {
          if (values[i] === tag) {
            break
          }
        }
        return i
      }
  const TagValue = new Type(
    values.map(l => JSON.stringify(l)).join(' | '),
    isTagValue,
    (m, c) => (isTagValue(m) ? success(m) : failure(m, c)),
    identity
  )
  return new TaggedUnionType<Tag, RTS, TypeOf<RTS[number]>, OutputOf<RTS[number]>, mixed>(
    name,
    (v): v is TypeOf<RTS[number]> => {
      if (!Dictionary.is(v)) {
        return false
      }
      const tagValue = v[tag]
      return TagValue.is(tagValue) && types[getIndex(tagValue)].is(v)
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
          const i = getIndex(tagValueValidation.value)
          const type = types[i]
          return type.validate(d, appendContext(c, String(i), type))
        }
      }
    },
    useIdentity(types, len) ? identity : a => types[getIndex(a[tag] as any)].encode(a),
    types,
    tag
  )
}

/**
 * @since 1.1.0
 */
export class ExactType<RT extends Any, A = any, O = A, I = mixed> extends Type<A, O, I> {
  readonly _tag: 'ExactType' = 'ExactType'
  constructor(
    name: string,
    is: ExactType<RT, A, O, I>['is'],
    validate: ExactType<RT, A, O, I>['validate'],
    encode: ExactType<RT, A, O, I>['encode'],
    readonly type: RT
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
  | StrictType<any, any, any, any>
  | PartialType<any, any, any, any>

const getProps = (type: HasProps): Props => {
  switch (type._tag) {
    case 'RefinementType':
    case 'ReadonlyType':
      return getProps(type.type)
    case 'InterfaceType':
    case 'StrictType':
    case 'PartialType':
      return type.props
    case 'IntersectionType':
      return type.types.reduce<Props>((props, type) => Object.assign(props, getProps(type)), {})
  }
}

/**
 * @since 1.5.3
 */
export interface ExactC<C extends HasProps> extends ExactType<C, TypeOf<C>, OutputOf<C>, InputOf<C>> {}

/**
 * @since 1.1.0
 */
export function exact<RT extends HasProps>(type: RT, name: string = `ExactType<${type.name}>`): ExactC<RT> {
  const props: Props = getProps(type)
  return new ExactType(
    name,
    (m): m is TypeOf<RT> => type.is(m) && Object.getOwnPropertyNames(m).every(k => hasOwnProperty.call(props, k)),
    (m, c) => {
      const looseValidation = type.validate(m, c)
      if (looseValidation.isLeft()) {
        return looseValidation
      } else {
        const o = looseValidation.value
        const keys = Object.getOwnPropertyNames(o)
        const len = keys.length
        const errors: Errors = []
        for (let i = 0; i < len; i++) {
          const key = keys[i]
          if (!hasOwnProperty.call(props, key)) {
            errors.push(getValidationError(o[key], appendContext(c, key, never)))
          }
        }
        return errors.length ? failures(errors) : success(o)
      }
    },
    type.encode,
    type
  )
}

/**
 * Drops the runtime type "kind"
 * @since 1.1.0
 * @deprecated
 */
export function clean<A, O = A, I = mixed>(type: Type<A, O, I>): Type<A, O, I> {
  return type as any
}

/**
 * @since 1.0.0
 * @deprecated
 */
export type PropsOf<T extends { props: any }> = T['props']

/**
 * @since 1.1.0
 * @deprecated
 */
export type Exact<T, X extends T> = T &
  { [K in ({ [K in keyof X]: K } & { [K in keyof T]: never } & { [key: string]: never })[keyof X]]?: never }

/**
 * Keeps the runtime type "kind"
 * @since 1.1.0
 * @deprecated
 */
export function alias<A, O, P, I>(
  type: PartialType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => PartialType<PP, AA, OO, II>
export function alias<A, O, P, I>(
  type: StrictType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => StrictType<PP, AA, OO, II>
export function alias<A, O, P, I>(
  type: InterfaceType<P, A, O, I>
): <
  AA extends Exact<A, AA>,
  OO extends Exact<O, OO> = O,
  PP extends Exact<P, PP> = P,
  II extends I = I
>() => InterfaceType<PP, AA, OO, II>
export function alias<A, O, I>(
  type: Type<A, O, I>
): <AA extends Exact<A, AA>, OO extends Exact<O, OO> = O>() => Type<AA, OO, I> {
  return () => type as any
}

export { nullType as null, undefinedType as undefined, arrayType as Array, type as interface, voidType as void }
