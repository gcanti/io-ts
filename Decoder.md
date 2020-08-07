<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Model](#model)
- [Built-in primitive decoders](#built-in-primitive-decoders)
- [Combinators](#combinators)
  - [The `literal` constructor](#the-literal-constructor)
  - [The `nullable` combinator](#the-nullable-combinator)
  - [The `type` combinator](#the-type-combinator)
  - [The `partial` combinator](#the-partial-combinator)
  - [The `record` combinator](#the-record-combinator)
  - [The `array` combinator](#the-array-combinator)
  - [The `tuple` combinator](#the-tuple-combinator)
  - [The `intersect` combinator](#the-intersect-combinator)
  - [The `sum` combinator](#the-sum-combinator)
  - [The `union` combinator](#the-union-combinator)
  - [The `lazy` combinator](#the-lazy-combinator)
  - [The `refine` combinator](#the-refine-combinator)
  - [The `parse` combinator](#the-parse-combinator)
- [Extracting static types from decoders](#extracting-static-types-from-decoders)
- [Built-in error reporter](#built-in-error-reporter)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Model

```ts
interface Decoder<I, A> {
  readonly decode: (i: I) => E.Either<DecodeError, A>
}
```

**Example**

A decoder representing `string` can be defined as

```ts
import * as D from 'io-ts/lib/Decoder'

export const string: D.Decoder<unknown, string> = {
  decode: (u) => (typeof u === 'string' ? D.success(u) : D.failure(u, 'string'))
}
```

and we can use it as follows:

```ts
import { isRight } from 'fp-ts/lib/Either'

console.log(isRight(string.decode('a'))) // => true
console.log(isRight(string.decode(null))) // => false
```

More generally the result of calling `decode` can be handled using [`fold`](https://gcanti.github.io/fp-ts/modules/Either.ts.html#fold) along with `pipe` (which is similar to the pipeline operator)

```ts
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'

console.log(
  pipe(
    string.decode(null),
    fold(
      // failure handler
      (errors) => `error: ${JSON.stringify(errors)}`,
      // success handler
      (a) => `success: ${JSON.stringify(a)}`
    )
  )
)
// => error: {"_tag":"Of","value":{"_tag":"Leaf","actual":null,"error":"string"}}
```

# Built-in primitive decoders

- `string: Decoder<unknown, string>`
- `number: Decoder<unknown, number>`
- `boolean: Decoder<unknown, boolean>`
- `UnknownArray: Decoder<unknown, Array<unknown>>`
- `UnknownRecord: Decoder<unknown, Record<string, unknown>>`

# Combinators

We can combine these primitive decoders through _combinators_ to build composite types which represent entities like domain models, request payloads etc. in our applications.

## The `literal` constructor

The `literal` constructor describes one or more literals.

```ts
export const MyLiteral: D.Decoder<unknown, 'a'> = D.literal('a')
export const MyLiterals: D.Decoder<unknown, 'a' | 'b'> = D.literal('a', 'b')
```

## The `nullable` combinator

The `nullable` combinator describes a nullable value

```ts
export const NullableString: D.Decoder<unknown, null | string> = D.nullable(D.string)
```

## The `type` combinator

The `type` combinator describes an object with required fields.

```ts
export const Person = D.type({
  name: D.string,
  age: D.number
})

console.log(isRight(Person.decode({ name: 'name', age: 42 }))) // => true
console.log(isRight(Person.decode({ name: 'name' }))) // => false
```

The `type` combinator will strip additional fields while decoding

```ts
console.log(Person.decode({ name: 'name', age: 42, rememberMe: true }))
// => { _tag: 'Right', right: { name: 'name', age: 42 } }
```

## The `partial` combinator

The `partial` combinator describes an object with optional fields.

```ts
export const Person = D.partial({
  name: D.string,
  age: D.number
})

console.log(isRight(Person.decode({ name: 'name', age: 42 }))) // => true
console.log(isRight(Person.decode({ name: 'name' }))) // => true
```

The `partial` combinator will strip additional fields while decoding

```ts
console.log(Person.decode({ name: 'name', rememberMe: true }))
// => { _tag: 'Right', right: { name: 'name' } }
```

## The `record` combinator

The `record` combinator describes a `Record<string, ?>`

```ts
export const MyRecord: D.Decoder<unknown, Record<string, number>> = D.record(D.number)

console.log(isRight(MyRecord.decode({ a: 1, b: 2 }))) // => true
```

## The `array` combinator

The `array` combinator describes an array `Array<?>`

```ts
export const MyArray: D.Decoder<unknown, Array<number>> = D.array(D.number)

console.log(isRight(MyArray.decode([1, 2, 3]))) // => true
```

## The `tuple` combinator

The `tuple` combinator describes a `n`-tuple

```ts
export const MyTuple: D.Decoder<unknown, [string, number]> = D.tuple(D.string, D.number)

console.log(isRight(MyTuple.decode(['a', 1]))) // => true
```

The `tuple` combinator will strip additional components while decoding

```ts
console.log(MyTuple.decode(['a', 1, true])) // => { _tag: 'Right', right: [ 'a', 1 ] }
```

## The `intersect` combinator

The `intersect` combinator is useful in order to mix required and optional props

```ts
export const Person = pipe(
  D.type({
    name: D.string
  }),
  D.intersect(
    D.partial({
      age: D.number
    })
  )
)

console.log(isRight(Person.decode({ name: 'name' }))) // => true
console.log(isRight(Person.decode({}))) // => false
```

## The `sum` combinator

The `sum` combinator describes tagged unions (aka sum types)

```ts
export const MySum: D.Decoder<
  unknown,
  | {
      type: 'A'
      a: string
    }
  | {
      type: 'B'
      b: number
    }
  //        v--- tag name
> = D.sum('type')({
  //           +----- all union members in the dictionary must own a field named like the chosen tag ("type" in this case)
  //           |
  //           v               v----- this value must be equal to its corresponding dictionary key ("A" in this case)
  A: D.type({ type: D.literal('A'), a: D.string }),
  //                           v----- this value must be equal to its corresponding dictionary key ("B" in this case)
  B: D.type({ type: D.literal('B'), b: D.number })
})
```

## The `union` combinator

The `union` combinator describes untagged unions

```ts
const MyUnion = D.union(D.string, D.number)

console.log(isRight(MyUnion.decode('a'))) // => true
console.log(isRight(MyUnion.decode(1))) // => true
console.log(isRight(MyUnion.decode(null))) // => false
```

## The `lazy` combinator

The `lazy` combinator allows to define recursive and mutually recursive decoders

**Recursive**

```ts
interface Category {
  title: string
  subcategory: null | Category
}

const Category: D.Decoder<unknown, Category> = D.lazy('Category', () =>
  D.type({
    title: D.string,
    subcategory: D.nullable(Category)
  })
)
```

**Mutually recursive**

```ts
interface Foo {
  foo: string
  bar: null | Bar
}

interface Bar {
  bar: number
  foo: null | Foo
}

const Foo: D.Decoder<unknown, Foo> = D.lazy('Foo', () =>
  D.type({
    foo: D.string,
    bar: D.nullable(Bar)
  })
)

const Bar: D.Decoder<unknown, Bar> = D.lazy('Bar', () =>
  D.type({
    bar: D.number,
    foo: D.nullable(Foo)
  })
)
```

## The `refine` combinator

The `refine` combinator allows to define refinements, for example a branded type

```ts
import { pipe } from 'fp-ts/lib/function'

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

export const Positive: D.Decoder<unknown, Positive> = pipe(
  D.number,
  D.refine((n): n is Positive => n > 0, 'Positive')
)

console.log(isRight(Positive.decode(1))) // => true
console.log(isRight(Positive.decode(-1))) // => false
```

## The `parse` combinator

The `parse` combinator is more powerful than `refine` in that you can change the output type

```ts
import { pipe } from 'fp-ts/lib/function'
import { isRight } from 'fp-ts/lib/Either'

export const NumberFromString: D.Decoder<unknown, number> = pipe(
  D.string,
  D.parse((s) => {
    const n = parseFloat(s)
    return isNaN(n) ? D.failure(s, 'NumberFromString') : D.success(n)
  })
)

console.log(isRight(NumberFromString.decode('1'))) // => true
console.log(isRight(NumberFromString.decode('a'))) // => false
```

# Extracting static types from decoders

Static types can be extracted from decoders using the `TypeOf` operator

```ts
export const Person = D.type({
  name: D.string,
  age: D.number
})

export type Person = D.TypeOf<typeof Person>
/*
type Person = {
    name: string;
    age: number;
}
*/
```

Note that you can define an `interface` instead of a type alias

```ts
export interface Person extends D.TypeOf<typeof Person> {}
```

# Built-in error reporter

```ts
import { isLeft } from 'fp-ts/lib/Either'

export const Person = D.type({
  name: D.string,
  age: D.number
})

const result = Person.decode({})
if (isLeft(result)) {
  console.log(D.draw(result.left))
}
/*
required property "name"
└─ cannot decode undefined, should be string
required property "age"
└─ cannot decode undefined, should be number
*/
```
