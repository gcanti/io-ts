import { Either, Left, Right, isRight } from 'fp-ts/lib/Either'
import { Option } from 'fp-ts/lib/Option'
import { Predicate } from 'fp-ts/lib/function'

export interface ContextEntry {
  readonly key: string,
  readonly type: Any
};
export type Context = Array<ContextEntry>;
export interface ValidationError {
  readonly value: any,
  readonly context: Context
};
export type Validation<T> = Either<Array<ValidationError>, T>;
export type Validate<T> = (value: any, context: Context) => Validation<T>;
export type Any = Type<any>

type Errors = Array<ValidationError>

export type TypeOf<RT extends Any> = RT['t'];

export class Type<A> {
  readonly t: A
  constructor(
    public readonly name: string,
    public readonly validate: Validate<A>
  ) {}
  is(x: any): x is A {
    return isRight(validate(x, this))
  }
}

export function getFunctionName(f: any): string {
  return f.displayName || f.name || `<function${f.length}>`
}

function getContextEntry(key: string, type: Any): ContextEntry {
  return { key, type }
}

function getValidationError(value: any, context: Context): ValidationError {
  return { value, context }
}

function pushAll<A>(xs: Array<A>, ys: Array<A>): void {
  Array.prototype.push.apply(xs, ys)
}

export function failure<T>(value: any, context: Context): Validation<T> {
  return new Left<Errors, T>([getValidationError(value, context)])
}

export function success<T>(value: T): Validation<T> {
  return new Right<Errors, T>(value)
}

function getDefaultContext<T>(type: Type<T>): Context {
  return [{ key: '', type }]
}

export function validate<T>(value: any, type: Type<T>): Validation<T> {
  return type.validate(value, getDefaultContext(type))
}

//
// Functor
//

declare module 'fp-ts/lib/HKT' {
  interface HKT<A> {
    'io-ts/Type': Type<A>
  }
}

export const URI = 'io-ts/Type'

export type URI = typeof URI

export class MapType<RT extends Any, B> extends Type<B> {
  constructor(name: string, public readonly type: RT, public readonly f: (a: TypeOf<RT>) => B) {
    super(name, (v, c) => type.validate(v, c).map(f))
  }
}

export function map<RT extends Any, B>(f: (a: TypeOf<RT>) => B, type: RT): MapType<RT, B> {
  return mapWithName(f, type, `(${type.name} => ?)`)
}

export function mapWithName<RT extends Any, B>(f: (a: TypeOf<RT>) => B, type: RT, name: string): MapType<RT, B> {
  return new MapType(name, type, f)
}

//
// getters
//

/** A Getter can be seen as a glorified get method between a type S and a type A */
export type Getter<S, A> = (s: S) => Option<A>

export class GetterType<RT extends Any, B> extends Type<B> {
  constructor(name: string, public readonly type: RT, public readonly getter: Getter<TypeOf<RT>, B>) {
    super(name, (v, c) => type.validate(v, c).chain(a => getter(a).fold(
      () => failure<B>(a, c),
      b => success(b)
    )))
  }
}

export function getter<RT extends Any, B>(type: RT, getter: Getter<TypeOf<RT>, B>, name?: string): GetterType<RT, B> {
  return new GetterType(
    name || `Getter<${type.name}, ?>`,
    type,
    getter
  )
}

//
// default types
//

const nullType = new Type<null>(
  'null',
  (v, c) => v === null ? success(v) : failure(v, c)
)

const undefinedType = new Type<undefined>(
  'undefined',
  (v, c) => v === void 0 ? success(v) : failure(v, c)
)

export const any = new Type<any>(
  'any',
  (v, _) => success(v)
)

export const never = new Type<never>(
  'never',
  (v, c) => failure<never>(v, c)
)

export const string = new Type<string>(
  'string',
  (v, c) => typeof v === 'string' ? success(v) : failure<string>(v, c)
)

export const number = new Type<number>(
  'number',
  (v, c) => typeof v === 'number' ? success(v) : failure<number>(v, c)
)

export const boolean = new Type<boolean>(
  'boolean',
  (v, c) => typeof v === 'boolean' ? success(v) : failure<boolean>(v, c)
)

const arrayType: Type<Array<any>> = new Type(
  'Array',
  (v, c) => Array.isArray(v) ? success(v) : failure<Array<any>>(v, c)
)

export const Dictionary = new Type<{ [key: string]: any }>(
  'Dictionary',
  (v, c) => v !== null && typeof v === 'object' ? success(v) : failure(v, c)
)

const functionType = new Type<Function>(
  'Function',
  (v, c) => typeof v === 'function' ? success(v) : failure<Function>(v, c)
)

//
// refinements
//

export class RefinementType<RT extends Any> extends Type<TypeOf<RT>> {
  constructor(name: string, validate: Validate<TypeOf<RT>>, public readonly type: RT, public readonly predicate: Predicate<TypeOf<RT>>) {
    super(name, validate)
  }
}

export function refinement<RT extends Any>(type: RT, predicate: Predicate<TypeOf<RT>>, name?: string): RefinementType<RT> {
  return new RefinementType(
    name || `(${type.name} | ${getFunctionName(predicate)})`,
    (v, c) => type.validate(v, c).chain(t => predicate(t) ? success(t) : failure(v, c)),
    type,
    predicate
  )
}

export const Integer = refinement(number, n => n % 1 === 0, 'Integer')

//
// literal types
//

export class LiteralType<T> extends Type<T> {
  constructor(name: string, validate: Validate<T>, public readonly value: T) {
    super(name, validate)
  }
}

export function literal<T extends string | number | boolean>(value: T): LiteralType<T> {
  return new LiteralType<T>(
    JSON.stringify(value),
    (v, c) => v === value ? success(value) : failure<T>(v, c),
    value
  )
}

//
// keyof types
//

export class KeyofType<D extends { [key: string]: any }> extends Type<keyof D> {
  constructor(name: string, validate: Validate<keyof D>, public readonly keys: D) {
    super(name, validate)
  }
}

export function keyof<D extends { [key: string]: any }>(map: D, name?: string): KeyofType<D> {
  return new KeyofType<D>(
    name || `(keyof ${JSON.stringify(Object.keys(map))})`,
    (v, c) => map.hasOwnProperty(v) ? success(v) : failure(v, c),
    map
  )
}

//
// recursive types
//

export function recursion<T>(name: string, definition: (self: Any) => Any): Type<T> {
  const Self = new Type(
    name,
    (v, c) => Result.validate(v, c)
  )
  const Result: any = definition(Self)
  Result.name = name
  return Result
}

//
// arrays
//

export class ArrayType<RT extends Any> extends Type<Array<TypeOf<RT>>> {
  constructor(name: string, validate: Validate<Array<TypeOf<RT>>>, public readonly type: RT) {
    super(name, validate)
  }
}

export function array<RT extends Any>(type: RT, name?: string): ArrayType<RT> {
  return new ArrayType(
    name || `Array<${type.name}>`,
    (v, c) => arrayType.validate(v, c).chain(as => {
      const t: Array<TypeOf<RT>> = []
      const errors: Errors = []
      let changed = false
      for (let i = 0, len = as.length; i < len; i++) {
        const a = as[i]
        const validation = type.validate(a, c.concat(getContextEntry(String(i), type)))
        validation.fold(
          error => pushAll(errors, error),
          va => {
            changed = changed || ( va !== a )
            t.push(va)
          }
        )
      }
      return errors.length ? new Left<Errors, Array<TypeOf<RT>>>(errors) : success(changed ? t : as)
    }),
    type
  )
}

//
// interfaces
//

export type Props = { [key: string]: Any };

// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type InterfaceOf<P extends Props> = { [K in keyof P]: TypeOf<P[K]> };

export class InterfaceType<P extends Props> extends Type<InterfaceOf<P>> {
  constructor(name: string, validate: Validate<InterfaceOf<P>>, public readonly props: P) {
    super(name, validate)
  }
}

function interfaceType<P extends Props>(props: P, name?: string): InterfaceType<P> {
  return new InterfaceType(
    name || `{ ${Object.keys(props).map(k => `${k}: ${props[k].name}`).join(', ')} }`,
    (v, c) => Dictionary.validate(v, c).chain(o => {
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
            changed = changed || ( vok !== ok )
            t[k] = vok
          }
        )
      }
      return errors.length ? new Left(errors) : success((changed ? t : o) as any)
    }),
    props
  )
}

//
// partials
//

// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type PartialOf<P extends Props> = { [K in keyof P]?: TypeOf<P[K]> };
// TODO remove this once https://github.com/Microsoft/TypeScript/issues/14041 is fixed
export type PartialPropsOf<P extends Props> = { [K in keyof P]: UnionType<[P[K], Type<undefined>], [TypeOf<P[K]>, undefined]> };

export class PartialType<P extends Props> extends Type<PartialOf<P>> {
  constructor(name: string, validate: Validate<PartialOf<P>>, public readonly props: PartialPropsOf<P>) {
    super(name, validate)
  }
}

export function partial<P extends Props>(props: P, name?: string): PartialType<P> {
  const partials: Props = {}
  for (let k in props) {
    partials[k] = union([props[k], undefinedType])
  }
  const type = interfaceType(partials)
  return new PartialType<P>(
    name || type.name,
    (v, c) => type.validate(v, c) as any,
    partials as any as PartialPropsOf<P>
  )
}

//
// dictionaries
//

export class DictionaryType<D extends Type<string>, C extends Any> extends Type<{ [key: string]: TypeOf<C> }> {
  constructor(name: string, validate: Validate<{ [key: string]: TypeOf<C> }>, public readonly domain: D, public readonly codomain: C) {
    super(name, validate)
  }
}

export function dictionary<D extends Type<string>, C extends Any>(domain: D, codomain: C, name?: string): DictionaryType<D, C> {
  return new DictionaryType(
    name || `{ [key: ${domain.name}]: ${codomain.name} }`,
    (v, c) => Dictionary.validate(v, c).chain(o => {
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
            changed = changed || ( vk !== k )
            k = vk
          }
        )
        codomainValidation.fold(
          error => pushAll(errors, error),
          vok => {
            changed = changed || ( vok !== ok )
            t[k] = vok
          }
        )
      }
      return errors.length ? new Left(errors) : success((changed ? t : o) as any)
    }),
    domain,
    codomain
  )
}

//
// unions
//

export type Match<RT extends Any, R> = (a: TypeOf<RT>) => R

export class UnionType<RTS extends Array<Any>, U> extends Type<U> {
  constructor(name: string, validate: Validate<U>, public readonly types: RTS) {
    super(name, validate)
  }
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>, s: Match<RTS[18], R>, t: Match<RTS[19], R>, u: Match<RTS[20], R>, v: Match<RTS[21], R>, w: Match<RTS[22], R>, x: Match<RTS[23], R>, y: Match<RTS[24], R>, z: Match<RTS[25], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>, s: Match<RTS[18], R>, t: Match<RTS[19], R>, u: Match<RTS[20], R>, v: Match<RTS[21], R>, w: Match<RTS[22], R>, x: Match<RTS[23], R>, y: Match<RTS[24], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>, s: Match<RTS[18], R>, t: Match<RTS[19], R>, u: Match<RTS[20], R>, v: Match<RTS[21], R>, w: Match<RTS[22], R>, x: Match<RTS[23], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>, s: Match<RTS[18], R>, t: Match<RTS[19], R>, u: Match<RTS[20], R>, v: Match<RTS[21], R>, w: Match<RTS[22], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>, s: Match<RTS[18], R>, t: Match<RTS[19], R>, u: Match<RTS[20], R>, v: Match<RTS[21], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>, s: Match<RTS[18], R>, t: Match<RTS[19], R>, u: Match<RTS[20], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>, s: Match<RTS[18], R>, t: Match<RTS[19], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>, s: Match<RTS[18], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>, r: Match<RTS[17], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>, q: Match<RTS[16], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>, p: Match<RTS[15], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>, o: Match<RTS[14], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>, n: Match<RTS[13], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>, m: Match<RTS[12], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>, l: Match<RTS[11], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>, k: Match<RTS[10], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>, j: Match<RTS[9], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>, i: Match<RTS[8], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>, h: Match<RTS[7], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>, g: Match<RTS[6], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>, f: Match<RTS[5], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>, e: Match<RTS[4], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>, d: Match<RTS[3], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>, c: Match<RTS[2], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>, b: Match<RTS[1], R>): (value: U) => R
  fold<R>(a: Match<RTS[0], R>): (value: U) => R
  fold<R>(...matches: Array<Function>): (value: U) => R {
    return value => {
      for (let i = 0, len = matches.length; i < len; i++) {
        const type = this.types[i]
        const match = matches[i]
        if (type.is(value)) {
          return match(value)
        }
      }
      throw new Error(`Invalid value ${JSON.stringify(value)} supplied to ${this.name}`)
    }
  }
}

export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any, Y extends Any, Z extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R> | TypeOf<S> | TypeOf<T> | TypeOf<U> | TypeOf<V> | TypeOf<W> | TypeOf<X> | TypeOf<Y> | TypeOf<Z>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any, Y extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R> | TypeOf<S> | TypeOf<T> | TypeOf<U> | TypeOf<V> | TypeOf<W> | TypeOf<X> | TypeOf<Y>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R> | TypeOf<S> | TypeOf<T> | TypeOf<U> | TypeOf<V> | TypeOf<W> | TypeOf<X>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R> | TypeOf<S> | TypeOf<T> | TypeOf<U> | TypeOf<V> | TypeOf<W>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R> | TypeOf<S> | TypeOf<T> | TypeOf<U> | TypeOf<V>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R> | TypeOf<S> | TypeOf<T> | TypeOf<U>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R> | TypeOf<S> | TypeOf<T>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R> | TypeOf<S>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q> | TypeOf<R>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P> | TypeOf<Q>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O> | TypeOf<P>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N> | TypeOf<O>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M> | TypeOf<N>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L, M], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L> | TypeOf<M>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K, L], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K> | TypeOf<L>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J, K], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J> | TypeOf<K>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any>(types: [A, B, C, D, E, F, G, H, I, J], name?: string): UnionType<[A, B, C, D, E, F, G, H, I, J], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I> | TypeOf<J>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any>(types: [A, B, C, D, E, F, G, H, I], name?: string): UnionType<[A, B, C, D, E, F, G, H, I], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H> | TypeOf<I>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any>(types: [A, B, C, D, E, F, G, H], name?: string): UnionType<[A, B, C, D, E, F, G, H], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G> | TypeOf<H>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any>(types: [A, B, C, D, E, F, G], name?: string): UnionType<[A, B, C, D, E, F, G], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F> | TypeOf<G>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any>(types: [A, B, C, D, E, F], name?: string): UnionType<[A, B, C, D, E, F], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E> | TypeOf<F>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(types: [A, B, C, D, E], name?: string): UnionType<[A, B, C, D, E], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D> | TypeOf<E>>
export function union<A extends Any, B extends Any, C extends Any, D extends Any>(types: [A, B, C, D], name?: string): UnionType<[A, B, C, D], TypeOf<A> | TypeOf<B> | TypeOf<C> | TypeOf<D>>
export function union<A extends Any, B extends Any, C extends Any>(types: [A, B, C], name?: string): UnionType<[A, B, C], TypeOf<A> | TypeOf<B> | TypeOf<C>>
export function union<A extends Any, B extends Any>(types: [A, B], name?: string): UnionType<[A, B], TypeOf<A> | TypeOf<B>>
export function union<A extends Any>(types: [A], name?: string): UnionType<[A], TypeOf<A>>
export function union<RTS extends Array<Any>>(types: RTS, name?: string): UnionType<RTS, any> {
  return new UnionType(
    name || `(${types.map(type => type.name).join(' | ')})`,
    (v, c) => {
      for (let i = 0, len = types.length; i < len; i++) {
        const validation = types[i].validate(v, c)
        if (isRight(validation)) {
          return validation
        }
      }
      return failure(v, c)
    },
    types
  )
}

//
// intersections
//

export class IntersectionType<RTS, I> extends Type<I> {
  constructor(name: string, validate: Validate<I>, public readonly types: RTS) {
    super(name, validate)
  }
}

export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any, Y extends Any, Z extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R> & TypeOf<S> & TypeOf<T> & TypeOf<U> & TypeOf<V> & TypeOf<W> & TypeOf<X> & TypeOf<Y> & TypeOf<Z>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any, Y extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R> & TypeOf<S> & TypeOf<T> & TypeOf<U> & TypeOf<V> & TypeOf<W> & TypeOf<X> & TypeOf<Y>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R> & TypeOf<S> & TypeOf<T> & TypeOf<U> & TypeOf<V> & TypeOf<W> & TypeOf<X>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R> & TypeOf<S> & TypeOf<T> & TypeOf<U> & TypeOf<V> & TypeOf<W>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R> & TypeOf<S> & TypeOf<T> & TypeOf<U> & TypeOf<V>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R> & TypeOf<S> & TypeOf<T> & TypeOf<U>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R> & TypeOf<S> & TypeOf<T>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R> & TypeOf<S>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q> & TypeOf<R>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P> & TypeOf<Q>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O> & TypeOf<P>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N> & TypeOf<O>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M> & TypeOf<N>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L, M], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L> & TypeOf<M>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K, L], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K> & TypeOf<L>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J, K], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J> & TypeOf<K>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any>(types: [A, B, C, D, E, F, G, H, I, J], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I, J], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I> & TypeOf<J>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any>(types: [A, B, C, D, E, F, G, H, I], name?: string): IntersectionType<[A, B, C, D, E, F, G, H, I], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H> & TypeOf<I>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any>(types: [A, B, C, D, E, F, G, H], name?: string): IntersectionType<[A, B, C, D, E, F, G, H], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G> & TypeOf<H>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any>(types: [A, B, C, D, E, F, G], name?: string): IntersectionType<[A, B, C, D, E, F, G], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F> & TypeOf<G>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any>(types: [A, B, C, D, E, F], name?: string): IntersectionType<[A, B, C, D, E, F], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E> & TypeOf<F>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(types: [A, B, C, D, E], name?: string): IntersectionType<[A, B, C, D, E], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D> & TypeOf<E>>
export function intersection<A extends Any, B extends Any, C extends Any, D extends Any>(types: [A, B, C, D], name?: string): IntersectionType<[A, B, C, D], TypeOf<A> & TypeOf<B> & TypeOf<C> & TypeOf<D>>
export function intersection<A extends Any, B extends Any, C extends Any>(types: [A, B, C], name?: string): IntersectionType<[A, B, C], TypeOf<A> & TypeOf<B> & TypeOf<C>>
export function intersection<A extends Any, B extends Any>(types: [A, B], name?: string): IntersectionType<[A, B], TypeOf<A> & TypeOf<B>>
export function intersection<A extends Any>(types: [A], name?: string): IntersectionType<[A], TypeOf<A>>
export function intersection<RTS extends Array<Any>>(types: RTS, name?: string): IntersectionType<RTS, any> {
  return new IntersectionType(
    name || `(${types.map(type => type.name).join(' & ')})`,
    (v, c) => {
      let t = v
      let changed = false
      const errors: Errors = []
      for (let i = 0, len = types.length; i < len; i++) {
        const type = types[i]
        const validation = type.validate(t, c)
        validation.fold(
          error => pushAll(errors, error),
          vv => {
            changed = changed || ( vv !== t )
            t = vv
          }
        )
      }
      return errors.length ? new Left(errors) : success(changed ? t : v)
    },
    types
  )
}

//
// tuples
//

export class TupleType<RTS, T> extends Type<T> {
  constructor(name: string, validate: Validate<T>, public readonly types: RTS) {
    super(name, validate)
  }
}

export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any, Y extends Any, Z extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R> , TypeOf<S> , TypeOf<T> , TypeOf<U> , TypeOf<V> , TypeOf<W> , TypeOf<X> , TypeOf<Y> , TypeOf<Z>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any, Y extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R> , TypeOf<S> , TypeOf<T> , TypeOf<U> , TypeOf<V> , TypeOf<W> , TypeOf<X> , TypeOf<Y>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any, X extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R> , TypeOf<S> , TypeOf<T> , TypeOf<U> , TypeOf<V> , TypeOf<W> , TypeOf<X>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any, W extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R> , TypeOf<S> , TypeOf<T> , TypeOf<U> , TypeOf<V> , TypeOf<W>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any, V extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R> , TypeOf<S> , TypeOf<T> , TypeOf<U> , TypeOf<V>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any, U extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R> , TypeOf<S> , TypeOf<T> , TypeOf<U>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any, T extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R> , TypeOf<S> , TypeOf<T>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any, S extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R> , TypeOf<S>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any, R extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q> , TypeOf<R>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any, Q extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P> , TypeOf<Q>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any, P extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O> , TypeOf<P>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any, O extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N, O], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N> , TypeOf<O>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any, N extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M, N], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M, N], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M> , TypeOf<N>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any, M extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L, M], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L, M], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L> , TypeOf<M>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any, L extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K, L], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K, L], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K> , TypeOf<L>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any, K extends Any>(types: [A, B, C, D, E, F, G, H, I, J, K], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J, K], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J> , TypeOf<K>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any, J extends Any>(types: [A, B, C, D, E, F, G, H, I, J], name?: string): TupleType<[A, B, C, D, E, F, G, H, I, J], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I> , TypeOf<J>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any, I extends Any>(types: [A, B, C, D, E, F, G, H, I], name?: string): TupleType<[A, B, C, D, E, F, G, H, I], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H> , TypeOf<I>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any, H extends Any>(types: [A, B, C, D, E, F, G, H], name?: string): TupleType<[A, B, C, D, E, F, G, H], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G> , TypeOf<H>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any, G extends Any>(types: [A, B, C, D, E, F, G], name?: string): TupleType<[A, B, C, D, E, F, G], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F> , TypeOf<G>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any, F extends Any>(types: [A, B, C, D, E, F], name?: string): TupleType<[A, B, C, D, E, F], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E> , TypeOf<F>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any, E extends Any>(types: [A, B, C, D, E], name?: string): TupleType<[A, B, C, D, E], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D> , TypeOf<E>]>
export function tuple<A extends Any, B extends Any, C extends Any, D extends Any>(types: [A, B, C, D], name?: string): TupleType<[A, B, C, D], [TypeOf<A> , TypeOf<B> , TypeOf<C> , TypeOf<D>]>
export function tuple<A extends Any, B extends Any, C extends Any>(types: [A, B, C], name?: string): TupleType<[A, B, C], [TypeOf<A> , TypeOf<B> , TypeOf<C>]>
export function tuple<A extends Any, B extends Any>(types: [A, B], name?: string): TupleType<[A, B], [TypeOf<A> , TypeOf<B>]>
export function tuple<A extends Any>(types: [A], name?: string): TupleType<[A], [TypeOf<A>]>
export function tuple<RTS extends Array<Any>>(types: RTS, name?: string): TupleType<RTS, any> {
  return new TupleType(
    name || `[${types.map(type => type.name).join(', ')}]`,
    (v, c) => arrayType.validate(v, c).chain(as => {
      const t: Array<any> = []
      const errors: Errors = []
      let changed = false
      for (let i = 0, len = types.length; i < len; i++) {
        const a = as[i]
        const type = types[i]
        const validation = type.validate(a, c.concat(getContextEntry(String(i), type)))
        validation.fold(
          error => pushAll(errors, error),
          va => {
            changed = changed || ( va !== a )
            t.push(va)
          }
        )
      }
      return errors.length ? new Left(errors) : success(changed ? t : as)
    }),
    types
  )
}

//
// readonly
//

export class ReadonlyType<RT extends Any> extends Type<Readonly<TypeOf<RT>>> {
  constructor(name: string, validate: Validate<Readonly<TypeOf<RT>>>, public readonly type: RT) {
    super(name, validate)
  }
}

export function readonly<RT extends Any>(type: RT, name?: string): ReadonlyType<RT> {
  return new ReadonlyType(
    name || `Readonly<${type.name}>`,
    (v, c) => type.validate(v, c).map(x => {
      if (process.env.NODE_ENV !== 'production') {
        return Object.freeze(x)
      }
      return x
    }),
    type
  )
}

//
// readonlyArray
//

export class ReadonlyArrayType<RT extends Any> extends Type<ReadonlyArray<TypeOf<RT>>> {
  constructor(name: string, validate: Validate<ReadonlyArray<TypeOf<RT>>>, public readonly type: RT) {
    super(name, validate)
  }
}

export function readonlyArray<RT extends Any>(type: RT, name?: string): ReadonlyArrayType<RT> {
  const arrayType = array(type)
  return new ReadonlyArrayType(
    name || `ReadonlyArray<${type.name}>`,
    (v, c) => arrayType.validate(v, c).map(x => {
      if (process.env.NODE_ENV !== 'production') {
        return Object.freeze(x)
      }
      return x
    }),
    type
  )
}

export {
  nullType as null,
  undefinedType as undefined,
  arrayType as Array,
  functionType as Function,
  interfaceType as interface
}
