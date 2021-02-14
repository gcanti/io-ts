import * as C from 'fp-ts/Const'
import { pipe } from 'fp-ts/function'
import * as R from 'fp-ts/ReadonlyRecord'
import { JSONSchema7 } from 'json-schema'
import * as S from '../src/Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface JsonSchema<A> {
  readonly compile: (definitions?: Record<string, JSONSchema7 | undefined>) => C.Const<JSONSchema7, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

export function literal<A extends readonly [S.Literal, ...ReadonlyArray<S.Literal>]>(
  ...values: A
): JsonSchema<A[number]> {
  return {
    compile: () => C.make({ enum: [...values] })
  }
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export const string: JsonSchema<string> = {
  compile: () => C.make({ type: 'string' })
}

export const number: JsonSchema<number> = {
  compile: () => C.make({ type: 'number' })
}

export const boolean: JsonSchema<boolean> = {
  compile: () => C.make({ type: 'boolean' })
}

// tslint:disable-next-line: readonly-array
export const UnknownArray: JsonSchema<Array<unknown>> = {
  compile: () => C.make({ type: 'array' })
}

export const UnknownRecord: JsonSchema<Record<string, unknown>> = {
  compile: () => C.make({ type: 'object' })
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

const nullJsonSchema: JsonSchema<null> = {
  compile: () => C.make({ enum: [null] })
}

export function nullable<A>(or: JsonSchema<A>): JsonSchema<null | A> {
  return union(nullJsonSchema, or)
}

export function type<A>(properties: { [K in keyof A]: JsonSchema<A[K]> }): JsonSchema<A> {
  return {
    compile: (lazy) =>
      C.make({
        type: 'object',
        properties: pipe(
          properties,
          R.map<JsonSchema<unknown>, JSONSchema7>((p) => p.compile(lazy))
        ),
        required: Object.keys(properties)
      })
  }
}

export function partial<A>(properties: { [K in keyof A]: JsonSchema<A[K]> }): JsonSchema<Partial<A>> {
  return {
    compile: (lazy) =>
      C.make({
        type: 'object',
        properties: pipe(
          properties,
          R.map<JsonSchema<unknown>, JSONSchema7>((p) => p.compile(lazy))
        )
      })
  }
}

export function record<A>(codomain: JsonSchema<A>): JsonSchema<Record<string, A>> {
  return {
    compile: (lazy) =>
      C.make({
        type: 'object',
        additionalProperties: codomain.compile(lazy)
      })
  }
}

// tslint:disable-next-line: readonly-array
export function array<A>(items: JsonSchema<A>): JsonSchema<Array<A>> {
  return {
    compile: (lazy) =>
      C.make({
        type: 'array',
        items: items.compile(lazy)
      })
  }
}

export function tuple<A extends ReadonlyArray<unknown>>(
  ...components: { [K in keyof A]: JsonSchema<A[K]> }
): JsonSchema<A> {
  const len = components.length
  return {
    compile: (lazy) =>
      C.make({
        type: 'array',
        items: len > 0 ? components.map((c) => c.compile(lazy)) : undefined,
        minItems: len,
        maxItems: len
      })
  }
}

export const intersect = <B>(right: JsonSchema<B>) => <A>(left: JsonSchema<A>): JsonSchema<A & B> => ({
  compile: (lazy) => C.make({ allOf: [left.compile(lazy), right.compile(lazy)] })
})

export function sum<T extends string>(
  _tag: T
): <A>(members: { [K in keyof A]: JsonSchema<A[K] & Record<T, K>> }) => JsonSchema<A[keyof A]> {
  return (members: Record<string, JsonSchema<unknown>>) => {
    return {
      compile: (lazy) => C.make({ anyOf: Object.keys(members).map((k) => members[k].compile(lazy)) })
    }
  }
}

export function lazy<A>(id: string, f: () => JsonSchema<A>): JsonSchema<A> {
  const $ref = `#/definitions/${id}`
  return {
    compile: (definitions) => {
      if (definitions !== undefined) {
        if (definitions.hasOwnProperty(id)) {
          return C.make({ $ref })
        }
        definitions[id] = undefined
        return (definitions[id] = f().compile(definitions))
      } else {
        definitions = { [id]: undefined }
        definitions[id] = f().compile(definitions)
        return C.make({
          definitions,
          $ref
        })
      }
    }
  }
}

export function union<A extends readonly [unknown, ...ReadonlyArray<unknown>]>(
  ...members: { [K in keyof A]: JsonSchema<A[K]> }
): JsonSchema<A[number]> {
  return {
    compile: (lazy) => C.make({ anyOf: members.map((m) => m.compile(lazy)) })
  }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

export const URI = 'io-ts/JsonSchema'

export type URI = typeof URI

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly [URI]: JsonSchema<A>
  }
}

export const Schemable: S.Schemable1<URI> & S.WithUnknownContainers1<URI> & S.WithUnion1<URI> = {
  URI,
  literal,
  string,
  number,
  boolean,
  UnknownArray,
  UnknownRecord,
  nullable,
  type,
  partial,
  record,
  array,
  tuple: tuple as S.Schemable1<URI>['tuple'],
  intersect,
  sum,
  lazy,
  union: union as S.WithUnion1<URI>['union']
}
