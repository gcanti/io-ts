[![build status](https://img.shields.io/travis/gcanti/io-ts/master.svg?style=flat-square)](https://travis-ci.org/gcanti/io-ts)
[![dependency status](https://img.shields.io/david/gcanti/io-ts.svg?style=flat-square)](https://david-dm.org/gcanti/io-ts)
![npm downloads](https://img.shields.io/npm/dm/io-ts.svg)
[![Minified Size](https://badgen.net/bundlephobia/minzip/io-ts)](https://bundlephobia.com/result?p=io-ts)

# The idea

Blog post: ["Typescript and validations at runtime boundaries"](https://lorefnon.tech/2018/03/25/typescript-and-validations-at-runtime-boundaries/) by [@lorefnon](https://github.com/lorefnon)

A value of type `Type<A, O, I>` (called "codec") is the runtime representation of the static type `A`.

Also a codec can

- decode inputs of type `I` (through `decode`)
- encode outputs of type `O` (through `encode`)
- be used as a custom type guard (through `is`)

```ts
class Type<A, O, I> {
  readonly _A: A
  readonly _O: O
  readonly _I: I
  constructor(
    /** a unique name for this codec */
    readonly name: string,
    /** a custom type guard */
    readonly is: (u: unknown) => u is A,
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

A codec representing `string` can be defined as

```ts
import * as t from 'io-ts'

const isString = (u: unknown): u is string => typeof u === 'string'

const string = new t.Type<string, string, unknown>(
  'string',
  isString,
  (u, c) => (isString(u) ? t.success(u) : t.failure(u, c)),
  t.identity
)
```

A codec can be used to validate an object in memory (for example an API payload)

```ts
const Person = t.type({
  name: t.string,
  age: t.number
})

// validation succeeded
Person.decode(JSON.parse('{"name":"Giulio","age":43}')) // => Right({name: "Giulio", age: 43})

// validation failed
Person.decode(JSON.parse('{"name":"Giulio"}')) // => Left([...])
```

# TypeScript compatibility

The stable version is tested against TypeScript 3.2.4.

| io-ts version | required TypeScript version |
| ------------- | --------------------------- |
| 1.6.x         | 3.2.2+                      |
| 1.5.3         | 3.0.1+                      |
| 1.5.2-        | 2.7.2+                      |

**Note**. If you are running `< typescript@3.0.1` you have to polyfill `unknown`.

You can use [unknown-ts](https://github.com/gcanti/unknown-ts) as a polyfill.

# Error reporters

A reporter implements the following interface

```ts
interface Reporter<A> {
  report: (validation: Validation<any>) => A
}
```

This package exports a default `PathReporter` reporter

Example

```ts
import { PathReporter } from 'io-ts/lib/PathReporter'

const result = Person.decode({ name: 'Giulio' })

console.log(PathReporter.report(result))
// => ['Invalid value undefined supplied to : { name: string, age: number }/age: number']
```

You can define your own reporter. `Errors` has the following type

```ts
interface ContextEntry {
  readonly key: string
  readonly type: Decoder<any, any>
}

interface Context extends ReadonlyArray<ContextEntry> {}

interface ValidationError {
  readonly value: unknown
  readonly context: Context
}

interface Errors extends Array<ValidationError> {}
```

Example

```ts
import * as t from 'io-ts'

const getPaths = <A>(v: t.Validation<A>): Array<string> => {
  return v.fold(errors => errors.map(error => error.context.map(({ key }) => key).join('.')), () => ['no errors'])
}

const Person = t.type({
  name: t.string,
  age: t.number
})

console.log(getPaths(Person.decode({}))) // => [ '.name', '.age' ]
```

# Custom error messages

You can set your own error message by providing a `message` argument to `failure`

Example

```ts
const NumberFromString = new t.Type<number, string, unknown>(
  'NumberFromString',
  t.number.is,
  (u, c) =>
    t.string.validate(u, c).chain(s => {
      const n = +s
      return isNaN(n) ? t.failure(u, c, 'cannot parse to a number') : t.success(n)
    }),
  String
)

console.log(PathReporter.report(NumberFromString.decode('a')))
// => ['cannot parse to a number']
```

# Community

- [io-ts-types](https://github.com/gcanti/io-ts-types) - A collection of codecs and combinators for use with
  io-ts
- [io-ts-reporters](https://github.com/OliverJAsh/io-ts-reporters) - Error reporters for io-ts
- [geojson-iots](https://github.com/pierremarc/geojson-iots) - codecs for GeoJSON as defined in rfc7946 made with
  io-ts
- [graphql-to-io-ts](https://github.com/micimize/graphql-to-io-ts) - Generate typescript and cooresponding io-ts types from a graphql
  schema

# TypeScript integration

codecs can be inspected

![instrospection](docs/images/introspection.png)

This library uses TypeScript extensively. Its API is defined in a way which automatically infers types for produced
values

![inference](docs/images/inference.png)

Note that the type annotation isn't needed, TypeScript infers the type automatically based on a schema.

Static types can be extracted from codecs using the `TypeOf` operator

```ts
type Person = t.TypeOf<typeof Person>

// same as
type Person = {
  name: string
  age: number
}
```

# Implemented types / combinators

```ts
import * as t from 'io-ts'
```

| Type              | TypeScript                              | codec / combinator                                    |
| ----------------- | --------------------------------------- | ----------------------------------------------------- |
| null              | `null`                                  | `t.null` or `t.nullType`                              |
| undefined         | `undefined`                             | `t.undefined`                                         |
| void              | `void`                                  | `t.void` or `t.voidType`                              |
| string            | `string`                                | `t.string`                                            |
| number            | `number`                                | `t.number`                                            |
| boolean           | `boolean`                               | `t.boolean`                                           |
| unknown           | `unknown`                               | t.unknown                                             |
| never             | `never`                                 | `t.never`                                             |
| object            | `object`                                | `t.object`                                            |
| integer           | ✘                                       | `t.Integer`                                           |
| array of unknown  | `Array<unknown>`                        | `t.UnknownArray`                                      |
| array of type     | `Array<A>`                              | `t.array(A)`                                          |
| record of unknown | `Record<string, unknown>`               | `t.UnknownRecord`                                     |
| record of type    | `Record<K, A>`                          | `t.record(K, A)`                                      |
| function          | `Function`                              | `t.Function`                                          |
| literal           | `'s'`                                   | `t.literal('s')`                                      |
| partial           | `Partial<{ name: string }>`             | `t.partial({ name: t.string })`                       |
| readonly          | `Readonly<T>`                           | `t.readonly(T)`                                       |
| readonly array    | `ReadonlyArray<number>`                 | `t.readonlyArray(t.number)`                           |
| type alias        | `type A = { name: string }`             | `t.type({ name: t.string })`                          |
| tuple             | `[ A, B ]`                              | `t.tuple([ A, B ])`                                   |
| union             | `A \| B`                                | `t.union([ A, B ])` or `t.taggedUnion(tag, [ A, B ])` |
| intersection      | `A & B`                                 | `t.intersection([ A, B ])`                            |
| keyof             | `keyof M`                               | `t.keyof(M)`                                          |
| recursive types   | see [Recursive types](#recursive-types) | `t.recursion(name, definition)`                       |
| refinement        | ✘                                       | `t.refinement(A, predicate)`                          |
| exact types       | ✘                                       | `t.exact(type)`                                       |

# Recursive types

Recursive types can't be inferred by TypeScript so you must provide the static type as a hint

```ts
interface Category {
  name: string
  categories: Array<Category>
}

const Category: t.RecursiveType<t.Type<Category>> = t.recursion('Category', () =>
  t.type({
    name: t.string,
    categories: t.array(Category)
  })
)
```

## Mutually recursive types

```ts
interface Foo {
  type: 'Foo'
  b: Bar | undefined
}

interface Bar {
  type: 'Bar'
  a: Foo | undefined
}

const Foo: t.RecursiveType<t.Type<Foo>> = t.recursion('Foo', () =>
  t.interface({
    type: t.literal('Foo'),
    b: t.union([Bar, t.undefined])
  })
)

const Bar: t.RecursiveType<t.Type<Bar>> = t.recursion('Bar', () =>
  t.interface({
    type: t.literal('Bar'),
    a: t.union([Foo, t.undefined])
  })
)

const FooBar = t.taggedUnion('type', [Foo, Bar])
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

# Exact types

You can make a codec alias exact (which means that only the given properties are allowed) using the `exact` combinator

```ts
const Person = t.type({
  name: t.string,
  age: t.number
})

const ExactPerson = t.exact(Person)

Person.decode({ name: 'Giulio', age: 43, surname: 'Canti' }) // ok
ExactPerson.decode({ name: 'Giulio', age: 43, surname: 'Canti' }) // fails
```

# Strict types (deprecated)

**Note**. This combinator is deprecated, use `exact` instead.

You can make a codec strict (which means that only the given properties are allowed) using the `strict` combinator

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

You can mix required and optional props using an intersection

```ts
const A = t.type({
  foo: t.string
})

const B = t.partial({
  bar: t.number
})

const C = t.intersection([A, B])

type C = t.TypeOf<typeof C>

// same as
type C = {
  foo: string
} & {
  bar?: number | undefined
}
```

You can apply `partial` to an already defined codec via its `props` field

```ts
const Person = t.type({
  name: t.string,
  age: t.number
})

const PartialPerson = t.partial(Person.props)

type PartialPerson = t.TypeOf<typeof PartialPerson>

// same as
type PartialPerson = {
  name?: string
  age?: number
}
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

# Generic Types

Polymorphic codecs are represented using functions.
For example, the following typescript:

```ts
interface ResponseBody<T> {
  result: T
  _links: Links
}
interface Links {
  previous: string
  next: string
}
```

Would be:

```ts
import * as t from 'io-ts'

// t.Mixed = t.Type<any, any, unknown>
const ResponseBody = <RT extends t.Mixed>(type: RT) =>
  t.interface({
    result: type,
    _links: Links
  })
const Links = t.interface({
  previous: t.string,
  next: t.string
})
```

And used like:

```ts
const UserModel = t.type({
  name: t.string
})

functionThatRequiresRuntimeType(ResponseBody(t.array(UserModel)), ...params)
```

# Piping

You can pipe two codecs if their type parameters do align

```ts
const NumberDecoder = new t.Type<number, string, string>(
  'NumberDecoder',
  t.number.is,
  (s, c) => {
    const n = parseFloat(s)
    return isNaN(n) ? t.failure(s, c) : t.success(n)
  },
  String
)

const NumberFromString = t.string.pipe(
  NumberDecoder,
  'NumberFromString'
)
```

# Tips and Tricks

## Is there a way to turn the checks off in production code?

No, however you can define your own logic for that (if you _really_ trust the input)

```ts
import * as t from 'io-ts'
import { Either, right } from 'fp-ts/lib/Either'

const { NODE_ENV } = process.env

export function unsafeDecode<A, O, I>(value: I, type: t.Type<A, O, I>): Either<t.Errors, A> {
  if (NODE_ENV !== 'production' || type.encode !== t.identity) {
    return type.decode(value)
  } else {
    // unsafe cast
    return right(value as any)
  }
}

// or...

import { failure } from 'io-ts/lib/PathReporter'

export function unsafeGet<A, O, I>(value: I, type: t.Type<A, O, I>): A {
  if (NODE_ENV !== 'production' || type.encode !== t.identity) {
    return type.decode(value).getOrElseL(errors => {
      throw new Error(failure(errors).join('\n'))
    })
  } else {
    // unsafe cast
    return value as any
  }
}
```

## Union of string literals

Use `keyof` instead of `union` when defining a union of string literals

```ts
const Bad = t.union([
  t.literal('foo'),
  t.literal('bar'),
  t.literal('baz')
  // etc...
])

const Good = t.keyof({
  foo: null,
  bar: null,
  baz: null
  // etc...
})
```

Benefits

- unique check for free
- better performance
- quick info stays responsive
