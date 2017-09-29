import { Either, Left, Right, isRight } from 'fp-ts/lib/Either'
import { Option } from 'fp-ts/lib/Option'
import { Predicate } from 'fp-ts/lib/function'

declare global {
  interface Array<T> {
    _A: T
  }
}

export interface ContextEntry {
  readonly key: string
  readonly type: Any
}
export type Context = Array<ContextEntry>
export interface ValidationError {
  readonly value: any
  readonly context: Context
}
export type Validation<T> = Either<Array<ValidationError>, T>
export type Validate<T> = (value: any, context: Context) => Validation<T>
export type Any = Type<any>

type Errors = Array<ValidationError>

export type TypeOf<RT extends Any> = RT['_A']

export interface Type<A> {
  readonly _A: A
  readonly name: string
  readonly validate: Validate<A>
}

export const _A = (undefined as any) as never

export const getFunctionName = (f: any): string => f.displayName || f.name || `<function${f.length}>`

const getContextEntry = (key: string, type: Any): ContextEntry => ({ key, type })

const getValidationError = (value: any, context: Context): ValidationError => ({ value, context })

const pushAll = <A>(xs: Array<A>, ys: Array<A>): void => Array.prototype.push.apply(xs, ys)

export const failure = <T>(value: any, context: Context): Validation<T> =>
  new Left<Errors, T>([getValidationError(value, context)])

export const success = <T>(value: T): Validation<T> => new Right<Errors, T>(value)

const getDefaultContext = <T>(type: Type<T>): Context => [{ key: '', type }]

export const validate = <T>(value: any, type: Type<T>): Validation<T> => type.validate(value, getDefaultContext(type))

export const is = <T>(value: any, type: Type<T>): value is T => isRight(validate(value, type))

export class MapType<RT extends Any, A> implements Type<A> {
  readonly _tag: 'MapType' = 'MapType'
  readonly _A: A
  readonly validate: Validate<A>
  constructor(readonly type: RT, readonly f: (a: TypeOf<RT>) => A, readonly name: string) {
    this.validate = (v, c) => type.validate(v, c).map(f)
  }
}

export const map = <RT extends Any, B>(f: (a: TypeOf<RT>) => B, type: RT): MapType<RT, B> =>
  mapWithName(f, type, `(${type.name} => ?)`)

export const mapWithName = <RT extends Any, B>(f: (a: TypeOf<RT>) => B, type: RT, name: string): MapType<RT, B> =>
  new MapType(type, f, name)

//
// basic types
//

export class NullType implements Type<null> {
  readonly _tag: 'NullType' = 'NullType'
  readonly _A: null
  readonly name: 'null' = 'null'
  readonly validate: Validate<null> = (v, c) => (v === null ? success(v) : failure(v, c))
}

/** An alias of `null` */
export const nullType: NullType = new NullType()

export class UndefinedType implements Type<undefined> {
  readonly _tag: 'UndefinedType' = 'UndefinedType'
  readonly _A: undefined
  readonly name: 'undefined' = 'undefined'
  readonly validate: Validate<undefined> = (v, c) => (v === void 0 ? success(v) : failure(v, c))
}

const undefinedType: UndefinedType = new UndefinedType()

export class AnyType implements Type<any> {
  readonly _tag: 'AnyType' = 'AnyType'
  readonly _A: any
  readonly name: 'any' = 'any'
  readonly validate: Validate<any> = (v, _) => success(v)
}

export const any: AnyType = new AnyType()

export class NeverType implements Type<never> {
  readonly _tag: 'NeverType' = 'NeverType'
  readonly _A: never
  readonly name: 'never' = 'never'
  readonly validate: Validate<never> = (v, c) => failure<never>(v, c)
}

export const never: NeverType = new NeverType()

export class StringType implements Type<string> {
  readonly _tag: 'StringType' = 'StringType'
  readonly _A: string
  readonly name: 'string' = 'string'
  readonly validate: Validate<string> = (v, c) => (typeof v === 'string' ? success(v) : failure<string>(v, c))
}

export const string: StringType = new StringType()

export class NumberType implements Type<number> {
  readonly _tag: 'NumberType' = 'NumberType'
  readonly _A: number
  readonly name: 'number' = 'number'
  readonly validate: Validate<number> = (v, c) => (typeof v === 'number' ? success(v) : failure<number>(v, c))
}

export const number: NumberType = new NumberType()

export class BooleanType implements Type<boolean> {
  readonly _tag: 'BooleanType' = 'BooleanType'
  readonly _A: boolean
  readonly name: 'boolean' = 'boolean'
  readonly validate: Validate<boolean> = (v, c) => (typeof v === 'boolean' ? success(v) : failure<boolean>(v, c))
}

export const boolean: BooleanType = new BooleanType()

export class AnyArrayType implements Type<Array<any>> {
  readonly _tag: 'AnyArrayType' = 'AnyArrayType'
  readonly _A: Array<any>
  readonly name: 'Array' = 'Array'
  readonly validate: Validate<Array<any>> = (v, c) => (Array.isArray(v) ? success(v) : failure<Array<any>>(v, c))
}

const arrayType: AnyArrayType = new AnyArrayType()

export class AnyDictionaryType implements Type<{ [key: string]: any }> {
  readonly _tag: 'AnyDictionaryType' = 'AnyDictionaryType'
  readonly _A: { [key: string]: any }
  readonly name: 'Dictionary' = 'Dictionary'
  readonly validate: Validate<{ [key: string]: any }> = (v, c) =>
    v !== null && typeof v === 'object' ? success(v) : failure(v, c)
}

export const Dictionary: AnyDictionaryType = new AnyDictionaryType()

export class FunctionType implements Type<Function> {
  readonly _tag: 'FunctionType' = 'FunctionType'
  readonly _A: Function
  readonly name: 'Function' = 'Function'
  readonly validate: Validate<Function> = (v, c) => (typeof v === 'function' ? success(v) : failure<Function>(v, c))
}

const functionType: FunctionType = new FunctionType()

//
// refinements
//

export class RefinementType<RT extends Any> implements Type<TypeOf<RT>> {
  readonly _tag: 'RefinementType' = 'RefinementType'
  readonly _A: TypeOf<RT>
  readonly validate: Validate<TypeOf<RT>>
  constructor(
    readonly type: RT,
    readonly predicate: Predicate<TypeOf<RT>>,
    readonly name: string = `(${type.name} | ${getFunctionName(predicate)})`
  ) {
    this.validate = (v, c) => type.validate(v, c).chain(t => (predicate(t) ? success(t) : failure(v, c)))
  }
}

export const refinement = <RT extends Any>(
  type: RT,
  predicate: Predicate<TypeOf<RT>>,
  name?: string
): RefinementType<RT> => new RefinementType(type, predicate, name)

export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

//
// prisms
//

export type GetOption<S, A> = (s: S) => Option<A>

export class PrismType<RT extends Any, A> implements Type<A> {
  readonly _tag: 'PrismType' = 'PrismType'
  readonly _A: A
  readonly validate: Validate<A>
  constructor(
    readonly type: RT,
    readonly getOption: GetOption<TypeOf<RT>, A>,
    readonly name: string = `Prism<${type.name}, ?>`
  ) {
    this.validate = (v, c) => type.validate(v, c).chain(a => getOption(a).fold(() => failure<A>(a, c), b => success(b)))
  }
}

export const prism = <RT extends Any, A>(
  type: RT,
  getOption: GetOption<TypeOf<RT>, A>,
  name?: string
): PrismType<RT, A> => new PrismType(type, getOption, name)

//
// literal types
//

export class LiteralType<V extends string | number | boolean> implements Type<V> {
  readonly _tag: 'LiteralType' = 'LiteralType'
  readonly _A: V
  readonly validate: Validate<V>
  constructor(readonly value: V, readonly name: string = JSON.stringify(value)) {
    this.validate = (v, c) => (v === value ? success(value) : failure<V>(v, c))
  }
}

export const literal = <V extends string | number | boolean>(value: V, name?: string): LiteralType<V> =>
  new LiteralType(value, name)

//
// keyof types
//

export class KeyofType<D extends { [key: string]: any }> implements Type<keyof D> {
  readonly _tag: 'KeyofType' = 'KeyofType'
  readonly _A: keyof D
  readonly validate: Validate<keyof D>
  constructor(readonly keys: D, readonly name: string = `(keyof ${JSON.stringify(Object.keys(keys))})`) {
    this.validate = (v, c) => (keys.hasOwnProperty(v) ? success(v) : failure(v, c))
  }
}

export const keyof = <D extends { [key: string]: any }>(keys: D, name?: string): KeyofType<D> =>
  new KeyofType(keys, name)

//
// recursive types
//

export const recursion = <T>(name: string, definition: (self: Any) => Any): Type<T> => {
  const Self = { name, validate: (v, c) => Result.validate(v, c) } as Type<any>
  const Result: any = definition(Self)
  Result.name = name
  return Result
}

//
// arrays
//

export class ArrayType<RT extends Any> implements Type<Array<TypeOf<RT>>> {
  readonly _tag: 'ArrayType' = 'ArrayType'
  readonly _A: Array<TypeOf<RT>>
  readonly validate: Validate<Array<TypeOf<RT>>>
  constructor(readonly type: RT, readonly name: string = `Array<${type.name}>`) {
    this.validate = (v, c) =>
      arrayType.validate(v, c).chain(as => {
        const t: Array<TypeOf<RT>> = []
        const errors: Errors = []
        let changed = false
        for (let i = 0; i < as.length; i++) {
          const a = as[i]
          const validation = type.validate(a, c.concat(getContextEntry(String(i), type)))
          validation.fold(
            error => pushAll(errors, error),
            va => {
              changed = changed || va !== a
              t.push(va)
            }
          )
        }
        return errors.length ? new Left<Errors, Array<TypeOf<RT>>>(errors) : success(changed ? t : as)
      })
  }
}

export const array = <RT extends Any>(type: RT, name?: string): ArrayType<RT> => new ArrayType(type, name)

//
// interfaces
//

export type Props = { [key: string]: Any }

// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type InterfaceOf<P extends Props> = { [K in keyof P]: TypeOf<P[K]> }

export class InterfaceType<P extends Props> implements Type<InterfaceOf<P>> {
  readonly _tag: 'InterfaceType' = 'InterfaceType'
  readonly _A: InterfaceOf<P>
  readonly validate: Validate<InterfaceOf<P>>
  constructor(
    readonly props: P,
    readonly name: string = `{ ${Object.keys(props).map(k => `${k}: ${props[k].name}`).join(', ')} }`
  ) {
    this.validate = (v, c) =>
      Dictionary.validate(v, c).chain(o => {
        const t = { ...o }
        const errors: Errors = []
        let changed = false
        for (let k in props) {
          const ok = o[k]
          const type = props[k]
          const validation = type.validate(ok, c.concat(getContextEntry(k, type)))
          validation.fold(
            error => pushAll(errors, error),
            vok => {
              changed = changed || vok !== ok
              t[k] = vok
            }
          )
        }
        return errors.length ? new Left(errors) : success((changed ? t : o) as any)
      })
  }
}

/** An alias of `interface` */
export const type = <P extends Props>(props: P, name?: string): InterfaceType<P> => new InterfaceType(props, name)

//
// partials
//

// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type PartialOf<P extends Props> = { [K in keyof P]?: TypeOf<P[K]> }
// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type PartialPropsOf<P extends Props> = {
  [K in keyof P]: UnionType<[P[K], Type<undefined>], [TypeOf<P[K]>, undefined]>
}

export class PartialType<P extends Props> implements Type<PartialOf<P>> {
  readonly _tag: 'PartialType' = 'PartialType'
  readonly _A: PartialOf<P>
  readonly validate: Validate<PartialOf<P>>
  readonly name: string
  constructor(readonly props: P, name?: string) {
    const partials: Props = {}
    for (let k in props) {
      partials[k] = union([props[k], undefinedType])
    }
    const partial = type(partials)
    this.name = name || partial.name
    this.validate = (v, c) => partial.validate(v, c) as any
  }
}

export const partial = <P extends Props>(props: P, name?: string): PartialType<P> => new PartialType(props, name)

//
// dictionaries
//

export class DictionaryType<D extends Type<string>, C extends Any> implements Type<{ [K in TypeOf<D>]: TypeOf<C> }> {
  readonly _tag: 'DictionaryType' = 'DictionaryType'
  readonly _A: { [K in TypeOf<D>]: TypeOf<C> }
  readonly validate: Validate<{ [K in TypeOf<D>]: TypeOf<C> }>
  constructor(
    readonly domain: D,
    readonly codomain: C,
    readonly name: string = `{ [key: ${domain.name}]: ${codomain.name} }`
  ) {
    this.validate = (v, c) =>
      Dictionary.validate(v, c).chain(o => {
        const t: { [key: string]: any } = {}
        const errors: Errors = []
        let changed = false
        for (let k in o) {
          const ok = o[k]
          const domainValidation = domain.validate(k, c.concat(getContextEntry(k, domain)))
          const codomainValidation = codomain.validate(ok, c.concat(getContextEntry(k, codomain)))
          domainValidation.fold(
            error => pushAll(errors, error),
            vk => {
              changed = changed || vk !== k
              k = vk
            }
          )
          codomainValidation.fold(
            error => pushAll(errors, error),
            vok => {
              changed = changed || vok !== ok
              t[k] = vok
            }
          )
        }
        return errors.length ? new Left(errors) : success((changed ? t : o) as any)
      })
  }
}

export const dictionary = <D extends Type<string>, C extends Any>(
  domain: D,
  codomain: C,
  name?: string
): DictionaryType<D, C> => new DictionaryType(domain, codomain, name)

//
// unions
//

export class UnionType<RTS extends [Any], U = TypeOf<RTS['_A']>> implements Type<U> {
  readonly _tag: 'UnionType' = 'UnionType'
  readonly _A: U
  readonly validate: Validate<U>
  constructor(readonly types: RTS, readonly name: string = `(${types.map(type => type.name).join(' | ')})`) {
    this.validate = (v, c) => {
      for (let i = 0; i < types.length; i++) {
        const validation = types[i].validate(v, c)
        if (isRight(validation)) {
          return validation
        }
      }
      return failure(v, c)
    }
  }
}

export const union = <RTS extends [Any]>(types: RTS, name?: string): UnionType<RTS> => new UnionType(types, name)

//
// intersections
//

export class IntersectionType<RTS extends Array<Any>, I> implements Type<I> {
  readonly _tag: 'IntersectionType' = 'IntersectionType'
  readonly _A: I
  readonly validate: Validate<I>
  constructor(readonly types: RTS, readonly name: string = `(${types.map(type => type.name).join(' & ')})`) {
    this.validate = (v, c) => {
      let t = v
      let changed = false
      const errors: Errors = []
      for (let i = 0; i < types.length; i++) {
        const type = types[i]
        const validation = type.validate(t, c)
        validation.fold(
          error => pushAll(errors, error),
          vv => {
            changed = changed || vv !== t
            t = vv
          }
        )
      }
      return errors.length ? new Left(errors) : success(changed ? t : v)
    }
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
export function intersection<RTS extends Array<Any>>(types: RTS, name?: string): IntersectionType<RTS, any> {
  return new IntersectionType(types, name)
}

//
// tuples
//

export class TupleType<RTS extends Array<Any>, I> implements Type<I> {
  readonly _tag: 'TupleType' = 'TupleType'
  readonly _A: I
  readonly validate: Validate<I>
  constructor(readonly types: RTS, readonly name: string = `[${types.map(type => type.name).join(', ')}]`) {
    this.validate = (v, c) =>
      arrayType.validate(v, c).chain(as => {
        const t: Array<any> = []
        const errors: Errors = []
        let changed = false
        for (let i = 0; i < types.length; i++) {
          const a = as[i]
          const type = types[i]
          const validation = type.validate(a, c.concat(getContextEntry(String(i), type)))
          validation.fold(
            error => pushAll(errors, error),
            va => {
              changed = changed || va !== a
              t.push(va)
            }
          )
        }
        return errors.length ? new Left(errors) : success((changed ? t : as) as any)
      })
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
export function tuple<RTS extends Array<Any>>(types: RTS, name?: string): TupleType<RTS, any> {
  return new TupleType(types, name)
}

//
// readonly
//

export class ReadonlyType<RT extends Any> implements Type<Readonly<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyType' = 'ReadonlyType'
  readonly _A: Readonly<TypeOf<RT>>
  readonly validate: Validate<Readonly<TypeOf<RT>>>
  constructor(readonly type: RT, readonly name: string = `Readonly<${type.name}>`) {
    this.validate = (v, c) =>
      type.validate(v, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        }
        return x
      })
  }
}

export const readonly = <RT extends Any>(type: RT, name?: string): ReadonlyType<RT> => new ReadonlyType(type, name)

//
// readonlyArray
//

export class ReadonlyArrayType<RT extends Any> implements Type<ReadonlyArray<TypeOf<RT>>> {
  readonly _tag: 'ReadonlyArrayType' = 'ReadonlyArrayType'
  readonly _A: ReadonlyArray<TypeOf<RT>>
  readonly validate: Validate<ReadonlyArray<TypeOf<RT>>>
  constructor(readonly type: RT, readonly name: string = `ReadonlyArray<${type.name}>`) {
    const arrayType = array(type)
    this.validate = (v, c) =>
      arrayType.validate(v, c).map(x => {
        if (process.env.NODE_ENV !== 'production') {
          return Object.freeze(x)
        }
        return x
      })
  }
}

export const readonlyArray = <RT extends Any>(type: RT, name?: string): ReadonlyArrayType<RT> =>
  new ReadonlyArrayType(type, name)

export { nullType as null, undefinedType as undefined, arrayType as Array, functionType as Function, type as interface }
