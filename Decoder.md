<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents** _generated with [DocToc](https://github.com/thlorenz/doctoc)_

- [Decoder interface](#decoder-interface)
- [Combinators](#combinators)
  - [Built-in primitive decoders](#built-in-primitive-decoders)
  - [The `literal` constructor](#the-literal-constructor)
  - [The `nullable` combinator](#the-nullable-combinator)
  - [The `type` combinator](#the-type-combinator)
  - [The `partial` combinator](#the-partial-combinator)
  - [The `record` combinator](#the-record-combinator)
  - [The `array` combinator](#the-array-combinator)
  - [The `tuple` combinator](#the-tuple-combinator)
  - [The `intersection` combinator](#the-intersection-combinator)
  - [The `sum` combinator](#the-sum-combinator)
  - [The `refinement` combinator](#the-refinement-combinator)
  - [The `parse` combinator](#the-parse-combinator)
- [Extracting static types from decoders](#extracting-static-types-from-decoders)
- [Built-in error reporter](#built-in-error-reporter)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Decoder interface

```ts
export interface Decoder<A> {
  readonly decode: (u: unknown) => E.Either<NonEmptyArray<Tree<string>>, A>
}
```

**Example**

A codec representing `string` can be defined as:

```ts
import * as D from 'io-ts/lib/Decoder'

export const string: D.Decoder<string> = {
  decode: (u) =>
    typeof u === 'string' ? D.success(u) : D.failure(`cannot decode ${JSON.stringify(u)}, should be string`)
}
```

and we can use it as follows:

```ts
import { isRight } from 'fp-ts/lib/Either'

console.log(isRight(string.decode('a'))) // => true
console.log(isRight(string.decode(null))) // => false
```

More generally the result of calling `decode` can be handled using [`fold`](https://gcanti.github.io/fp-ts/modules/Either.ts.html#fold-function) along with `pipe` (which is similar to the pipeline operator)

```ts
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'

console.log(
  pipe(
    string.decode(null),
    fold(
      // failure handler
      (errors) => console.error(errors),
      // success handler
      (a) => console.log(a)
    )
  )
)
// => [ { value: 'cannot decode null, should be string', forest: [] } ]
```

# Combinators

We can combine these primitive decoders through _combinators_ to build composite types which represent entities like domain models, request payloads etc. in our applications.

## Built-in primitive decoders

- `never`
- `string`
- `number`
- `boolean`
- `UnknownArray`
- `UnknownRecord`

## The `literal` constructor

The `literal` constructor describes one or more literals.

```ts
export const MyLiteral: D.Decoder<'a'> = D.literal('a')
export const MyLiterals: D.Decoder<'a' | 'b'> = D.literal('a', 'b')
```

## The `nullable` combinator

The `nullable` combinator describes a nullable value

```ts
export const NullableString: D.Decoder<null | string> = D.nullable(D.string)
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
console.log(Person.decode({ name: 'name', age: 42, remeberMe: true }))
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
console.log(Person.decode({ name: 'name', remeberMe: true }))
// => { _tag: 'Right', right: { name: 'name' } }
```

## The `record` combinator

The `record` combinator describes a `Record<string, ?>`

```ts
export const MyRecord: D.Decoder<Record<string, number>> = D.record(D.number)

console.log(isRight(MyRecord.decode({ a: 1, b: 2 }))) // => true
```

## The `array` combinator

The `array` combinator describes an array `Array<?>`

```ts
export const MyArray: D.Decoder<Array<number>> = D.array(D.number)

console.log(isRight(MyArray.decode([1, 2, 3]))) // => true
```

## The `tuple` combinator

The `tuple` combinator describes a `n`-tuple

```ts
export const MyTuple: D.Decoder<[string, number]> = D.tuple(D.string, D.number)

console.log(isRight(MyTuple.decode(['a', 1]))) // => true
```

The `tuple` combinator will strip additional components while decoding

```ts
console.log(MyTuple.decode(['a', 1, true])) // => { _tag: 'Right', right: [ 'a', 1 ] }
```

## The `intersection` combinator

The `intersection` combinator is useful in order to mix required and optional props

```ts
export const Person = D.intersection(
  D.type({
    name: D.string
  }),
  D.partial({
    age: D.number
  })
)

console.log(isRight(Person.decode({ name: 'name' }))) // => true
console.log(isRight(Person.decode({}))) // => false
```

## The `sum` combinator

The `sum` combinator describes tagged unions (aka sum types)

```ts
export const MySum: D.Decoder<
  | {
      type: 'A'
      a: string
    }
  | {
      type: 'B'
      b: number
    }
> = D.sum('type')({
  A: D.type({ type: D.literal('A'), a: D.string }),
  B: D.type({ type: D.literal('B'), b: D.number })
})
```

## The `refinement` combinator

The `refinement` combinator allows to define refinements, for example a branded type

```ts
export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

export const Positive: D.Decoder<Positive> = D.refinement(D.number, (n): n is Positive => n > 0, 'Positive')

console.log(isRight(Positive.decode(1))) // => true
console.log(isRight(Positive.decode(-1))) // => false
```

## The `parse` combinator

The `parse` combinator is more powerful than `refinement` in that you can change the output type

```ts
import { left, right } from 'fp-ts/lib/Either'

export const NumberFromString: D.Decoder<number> = D.parse(D.string, (s) => {
  const n = parseFloat(s)
  return isNaN(n) ? left(`cannot decode ${JSON.stringify(s)}, should be NumberFromString`) : right(n)
})

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
import { draw } from 'io-ts/lib/Tree'

export const Person = D.type({
  name: D.string,
  age: D.number
})

const result = Person.decode({})
if (isLeft(result)) {
  console.log(draw(result.left))
}
/*
required property "name"
└─ cannot decode undefined, should be string
*/
```
