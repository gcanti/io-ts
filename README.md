[![build status](https://img.shields.io/travis/gcanti/io-ts/master.svg?style=flat-square)](https://travis-ci.org/gcanti/io-ts)
[![dependency status](https://img.shields.io/david/gcanti/io-ts.svg?style=flat-square)](https://david-dm.org/gcanti/io-ts)
![npm downloads](https://img.shields.io/npm/dm/io-ts.svg)

# The idea

Blog post: ["Typescript and validations at runtime boundaries"](https://lorefnon.tech/2018/03/25/typescript-and-validations-at-runtime-boundaries/) by [@lorefnon](https://github.com/lorefnon)

A value of type `Type<A, O, I>` (called "runtime type") is the runtime representation of the static type `A`.

Also a runtime type can

* decode inputs of type `I` (through `decode`)
* encode outputs of type `O` (through `encode`)
* be used as a custom type guard (through `is`)

```ts
export type mixed = object | number | string | boolean | symbol | undefined | null

class Type<A, O = A, I = mixed> {
  readonly _A: A
  readonly _O: O
  readonly _I: I
  constructor(
    /** a unique name for this runtime type */
    readonly name: string,
    /** a custom type guard */
    readonly is: (v: mixed) => v is A,
    /** succeeds if a value of type I can be decoded to a value of type A */
    readonly validate: (input: I, context: Context) => Either<Errors, A>,
    /** converts a value of type A to a value of type O */
    readonly encode: (a: A) => O
  ) {}
  /** a version of `validate` with a default context */
  decode(i: I): Either<Errors, A>
}
```

Note. The `Either` type is defined in [fp-ts](https://github.com/gcanti/fp-ts), a library containing implementations of
common algebraic types in TypeScript.

**Example**

A runtime type representing `string` can be defined as

```js
import * as t from 'io-ts'

export class StringType extends Type<string> { // equivalent to Type<string, string, mixed> as per type parameter defaults
  readonly _tag: 'StringType' = 'StringType'
  constructor() {
    super(
      'string',
      (m): m is string => typeof m === 'string',
      (m, c) => (this.is(m) ? success(m) : failure(m, c)),
      a => a
    )
  }
}
```

A runtime type can be used to validate an object in memory (for example an API payload)

```js
const Person = t.type({
  name: t.string,
  age: t.number
})

// ok
Person.decode(JSON.parse('{"name":"Giulio","age":43}')) // => Right({name: "Giulio", age: 43})

// ko
Person.decode(JSON.parse('{"name":"Giulio"}')) // => Left([...])
```

# Error reporters

A reporter implements the following interface

```js
interface Reporter<A> {
  report: (validation: Validation<any>) => A;
}
```

This package exports two default reporters

* `PathReporter: Reporter<Array<string>>`
* `ThrowReporter: Reporter<void>`

Example

```js
import { PathReporter } from 'io-ts/lib/PathReporter'
import { ThrowReporter } from 'io-ts/lib/ThrowReporter'

const result = Person.decode({ name: 'Giulio' })

console.log(PathReporter.report(result))
// => ['Invalid value undefined supplied to : { name: string, age: number }/age: number']

ThrowReporter.report(result)
// => throws 'Invalid value undefined supplied to : { name: string, age: number }/age: number'
```

# Community

* [io-ts-types](https://github.com/gcanti/io-ts-types) - A collection of runtime types and combinators for use with
  io-ts
* [io-ts-reporters](https://github.com/OliverJAsh/io-ts-reporters) - Error reporters for io-ts
* [geojson-iots](https://github.com/pierremarc/geojson-iots) - Runtime types for GeoJSON as defined in rfc7946 made with
  io-ts
* [graphql-to-io-ts](https://github.com/micimize/graphql-to-io-ts) - Generate typescript and cooresponding io-ts types from a graphql
schema
# TypeScript integration

Runtime types can be inspected

![instrospection](docs/images/introspection.png)

This library uses TypeScript extensively. Its API is defined in a way which automatically infers types for produced
values

![inference](docs/images/inference.png)

Note that the type annotation isn't needed, TypeScript infers the type automatically based on a schema.

Static types can be extracted from runtime types with the `TypeOf` operator

```js
type IPerson = t.TypeOf<typeof Person>

// same as
type IPerson = {
  name: string,
  age: number
}
```

# Implemented types / combinators

```js
import * as t from 'io-ts'
```

| Type                  | TypeScript                              | Flow                                    | Runtime type / combinator                                    |
| --------------------- | --------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| null                  | `null`                                  | `null`                                  | `t.null` or `t.nullType`                                     |
| undefined             | `undefined`                             | `void`                                  | `t.undefined`                                                |
| string                | `string`                                | `string`                                | `t.string`                                                   |
| number                | `number`                                | `number`                                | `t.number`                                                   |
| boolean               | `boolean`                               | `boolean`                               | `t.boolean`                                                  |
| any                   | `any`                                   | `any`                                   | `t.any`                                                      |
| never                 | `never`                                 | `empty`                                 | `t.never`                                                    |
| object                | `object`                                | ✘                                       | `t.object`                                                   |
| integer               | ✘                                       | ✘                                       | `t.Integer`                                                  |
| array of any          | `Array<mixed>`                          | `Array<mixed>`                          | `t.Array`                                                    |
| array of type         | `Array<A>`                              | `Array<A>`                              | `t.array(A)`                                                 |
| dictionary of any     | `{ [key: string]: mixed }`              | `{ [key: string]: mixed }`              | `t.Dictionary`                                               |
| dictionary of type    | `{ [K in A]: B }`                       | `{ [key: A]: B }`                       | `t.dictionary(A, B)`                                         |
| function              | `Function`                              | `Function`                              | `t.Function`                                                 |
| literal               | `'s'`                                   | `'s'`                                   | `t.literal('s')`                                             |
| partial               | `Partial<{ name: string }>`             | `$Shape<{ name: string }>`              | `t.partial({ name: t.string })`                              |
| readonly              | `Readonly<T>`                           | `ReadOnly<T>`                           | `t.readonly(T)`                                              |
| readonly array        | `ReadonlyArray<number>`                 | `ReadOnlyArray<number>`                 | `t.readonlyArray(t.number)`                                  |
| interface             | `interface A { name: string }`          | `interface A { name: string }`          | `t.type({ name: t.string })` or `t.type({ name: t.string })` |
| interface inheritance | `interface B extends A {}`              | `interface B extends A {}`              | `t.intersection([ A, t.type({}) ])`                          |
| tuple                 | `[ A, B ]`                              | `[ A, B ]`                              | `t.tuple([ A, B ])`                                          |
| union                 | `A \| B`                                | `A \| B`                                | `t.union([ A, B ])` or `t.taggedUnion(tag, [ A, B ])`        |
| intersection          | `A & B`                                 | `A & B`                                 | `t.intersection([ A, B ])`                                   |
| keyof                 | `keyof M`                               | `$Keys<M>`                              | `t.keyof(M)`                                                 |
| recursive types       | see [Recursive types](#recursive-types) | see [Recursive types](#recursive-types) | `t.recursion(name, definition)`                              |
| refinement            | ✘                                       | ✘                                       | `t.refinement(A, predicate)`                                 |
| strict/exact types    | ✘                                       | `$Exact<{{ name: t.string }}>`          | `t.strict({ name: t.string })`                               |

# Recursive types

Recursive types can't be inferred by TypeScript so you must provide the static type as a hint

```js
// helper type
type ICategory = {
  name: string,
  categories: Array<ICategory>
}

const Category =
  t.recursion <
  ICategory >
  ('Category',
  self =>
    t.type({
      name: t.string,
      categories: t.array(self)
    }))
```

# Tagged unions

If you are encoding tagged unions, instead of the general purpose `union` combinator, you may want to use the
`taggedUnion` combinator in order to get better performances

```ts
const A = t.type({
  tag: t.literal('A'),
  foo: t.string
})

const B = t.type({
  tag: t.literal('B'),
  bar: t.number
})

// the actual presence of the tag is statically checked
const U = t.taggedUnion('tag', [A, B])
```

# Refinements

You can refine a type (_any_ type) using the `refinement` combinator

```ts
const Positive = t.refinement(t.number, n => n >= 0, 'Positive')

const Adult = t.refinement(Person, person => person.age >= 18, 'Adult')
```

# Strict/Exact interfaces

You can make an interface strict (which means that only the given properties are allowed) using the `strict` combinator

```ts
const Person = t.type({
  name: t.string,
  age: t.number
})

const StrictPerson = t.strict(Person.props)

Person.decode({ name: 'Giulio', age: 43, surname: 'Canti' }) // ok
StrictPerson.decode({ name: 'Giulio', age: 43, surname: 'Canti' }) // fails
```

# Mixing required and optional props

Note. You can mix required and optional props using an intersection

```ts
const A = t.type({
  foo: t.string
})

const B = t.partial({
  bar: t.number
})

const C = t.intersection([A, B])

type CT = t.TypeOf<typeof C>

// same as
type CT = {
  foo: string
  bar?: number
}
```

You can define a custom combinator to avoid the boilerplate

```ts
export function interfaceWithOptionals<RequiredProps extends t.Props, OptionalProps extends t.Props>(
  required: RequiredProps,
  optional: OptionalProps,
  name?: string
): t.IntersectionType<
  [
    t.InterfaceType<RequiredProps, t.TypeOfProps<RequiredProps>>,
    t.PartialType<OptionalProps, t.TypeOfPartialProps<OptionalProps>>
  ],
  t.TypeOfProps<RequiredProps> & t.TypeOfPartialProps<OptionalProps>
> {
  return t.intersection([t.interface(required), t.partial(optional)], name)
}

const C = interfaceWithOptionals({ foo: t.string }, { bar: t.number })
```

# Custom types

You can define your own types. Let's see an example

```ts
import * as t from 'io-ts'

// represents a Date from an ISO string
const DateFromString = new t.Type<Date, string>(
  'DateFromString',
  (m): m is Date => m instanceof Date,
  (m, c) =>
    t.string.validate(m, c).chain(s => {
      const d = new Date(s)
      return isNaN(d.getTime()) ? t.failure(s, c) : t.success(d)
    }),
  a => a.toISOString()
)

const s = new Date(1973, 10, 30).toISOString()

DateFromString.decode(s)
// right(new Date('1973-11-29T23:00:00.000Z'))

DateFromString.decode('foo')
// left(errors...)
```

Note that you can **deserialize** while validating.

# Custom combinators

You can define your own combinators. Let's see some examples

## The `maybe` combinator

An equivalent to `T | null`

```ts
export function maybe<RT extends t.Any>(
  type: RT,
  name?: string
): t.UnionType<[RT, t.NullType], t.TypeOf<RT> | null, t.OutputOf<RT> | null, t.InputOf<RT> | null> {
  return t.union<[RT, t.NullType]>([type, t.null], name)
}
```

## The `pluck` combinator

Extracting the runtime type of a field contained in each member of a union

```ts
const pluck = <F extends string, U extends t.UnionType<Array<t.InterfaceType<{ [K in F]: t.Mixed }>>>>(
  union: U,
  field: F
): t.Type<t.TypeOf<U>[F]> => {
  return t.union(union.types.map(type => type.props[field]))
}

export const Action = t.union([
  t.type({
    type: t.literal('Action1'),
    payload: t.type({
      foo: t.string
    })
  }),
  t.type({
    type: t.literal('Action2'),
    payload: t.type({
      bar: t.string
    })
  })
])

// ActionType: t.Type<"Action1" | "Action2", "Action1" | "Action2", t.mixed>
const ActionType = pluck(Action, 'type')
```

# Recipes

## Is there a way to turn the checks off in production code?

No, however you can define your own logic for that (if you _really_ trust the input and the involved types don't perform
deserializations)

```ts
import * as t from 'io-ts'
import { failure } from 'io-ts/lib/PathReporter'

const { NODE_ENV } = process.env

export function unsafeValidate<S, A>(value: any, type: t.Type<S, A>): A {
  if (NODE_ENV !== 'production') {
    return type.decode(value).getOrElse(errors => {
      throw new Error(failure(errors).join('\n'))
    })
  }
  // unsafe cast
  return value as A
}
```

# Known issues

Due to an upstream [bug](https://github.com/Microsoft/TypeScript/issues/14041), VS Code might display `any` for nested
types

```ts
const NestedInterface = t.type({
  foo: t.string,
  bar: t.type({
    baz: t.string
  })
})

type NestedInterfaceType = t.TypeOf<typeof NestedInterface>
/*
Hover on NestedInterfaceType will display

type NestedInterfaceType = {
    foo: string;
    bar: t.TypeOfProps<{
        baz: t.StringType;
    }>;
}

instead of

type NestedInterfaceType = {
  foo: string;
  bar: {
    baz: string
  }
}
*/
```
