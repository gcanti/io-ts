<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Model](#model)
- [Built-in primitive decoders](#built-in-primitive-decoders)
- [Combinators](#combinators)
  - [The `literal` constructor](#the-literal-constructor)
  - [The `nullable` combinator](#the-nullable-combinator)
  - [The `struct` combinator](#the-struct-combinator)
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
interface Decoder<I, E, A> {
  readonly decode: (i: I) => T.These<E, A>
}
```

**Example**

A decoder representing `string` can be defined as

```ts
import * as D from 'io-ts/Decoder'

export interface StringE {
  readonly _tag: 'StringE'
  readonly actual: unknown
}
export interface StringLE extends LeafE<StringE> {}

export const string: D.Decoder<unknown, StringLE, string> = {
  decode: (u) => (typeof u === 'string' ? D.success(u) : D.failure(u, 'string'))
}
```

and we can use it as follows:

```ts
import { isRight } from 'fp-ts/These'

console.log(isRight(string.decode('a'))) // => true
console.log(isRight(string.decode(null))) // => false
```

More generally the result of calling `decode` can be handled using [`fold`](https://gcanti.github.io/fp-ts/modules/Either.ts.html#fold) along with `pipe` (which is similar to the pipeline operator)

```ts
import { pipe } from 'fp-ts/function'
import { fold } from 'fp-ts/These'

console.log(
  pipe(
    string.decode(null),
    fold(
      // failure handler
      (errors) => `error: ${JSON.stringify(errors)}`,
      // success handler
      (a) => `success: ${JSON.stringify(a)}`
      // warning handler
      (errors, a) => `success: ${JSON.stringify(a)} with warning: ${JSON.stringify(errors)}`
    )
  )
)
// => error: {"_tag":"Of","value":{"_tag":"Leaf","actual":null,"error":"string"}}
```
# FIXFIXFIXFIX - error: {...}

# Built-in primitive decoders

- `string: Decoder<unknown, StringLE, string>`
- `number: Decoder<unknown, NumberLE | NaNLE | InfinityLE, number>`
- `boolean: Decoder<unknown, BooleanLE, boolean>`
- `UnknownArray: Decoder<unknown, UnknownArrayLE, Array<unknown>>`
- `UnknownRecord: Decoder<unknown, UnknownRecordLE, Record<string, unknown>>`

# Combinators

We can combine these primitive decoders through _combinators_ to build composite types which represent entities like domain models, request payloads etc. in our applications.

## The `literal` constructor

The `literal` constructor describes one or more literals.

```ts
export const MyLiteral: D.LiteralD<["a"]> = D.literal('a')
export const MyLiterals: D.LiteralD<["a", "b"]> = D.literal('a', 'b')
```

## The `nullable` combinator

The `nullable` combinator describes a nullable value

```ts
export const NullableString: D.NullableD<D.stringUD> = D.nullable(D.string)
```

## The `struct` combinator

The `struct` combinator describes an object with required fields.

```ts
export const Person = D.struct({
  name: D.string,
  age: D.number
})

console.log(isRight(Person.decode({ name: 'name', age: 42 }))) // => true
console.log(isRight(Person.decode({ name: 'name' }))) // => false
```

The `struct` combinator will strip additional fields while decoding

```ts
console.log(Person.decode({ name: 'name', age: 42, rememberMe: true }))
// => { _tag: 'Right', right: { name: 'name', age: 42 } }
```
# FIXFIXFIXFIX - { _tag: 'Right', ...}

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
# FIXFIXFIXFIX - { _tag: 'Right', ...}

## The `record` combinator

The `record` combinator describes a `Record<string, ?>`

```ts
export const MyRecord: D.RecordD<D.numberUD> = D.record(D.number)

console.log(isRight(MyRecord.decode({ a: 1, b: 2 }))) // => true
```

## The `array` combinator

The `array` combinator describes an array `Array<?>`

```ts
export const MyArray: D.ArrayD<D.numberUD> = D.array(D.number)

console.log(isRight(MyArray.decode([1, 2, 3]))) // => true
```

## The `tuple` combinator

The `tuple` combinator describes a `n`-tuple

```ts
export const MyTuple: D.TupleD<[D.stringUD, D.numberUD]> = D.tuple(D.string, D.number)

console.log(isRight(MyTuple.decode(['a', 1]))) // => true
```

The `tuple` combinator will strip additional components while decoding

```ts
console.log(MyTuple.decode(['a', 1, true])) // => { _tag: 'Right', right: [ 'a', 1 ] }
```
# FIXFIXFIXFIX - { _tag: 'Both', ...}

## The `intersect` combinator

The `intersect` combinator is useful in order to mix required and optional props

```ts
export const Person = pipe(
  D.struct({
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
# FIXFIXFIXFIX - { _tag: 'Right', ...}

## The `sum` combinator

The `sum` combinator describes tagged unions (aka sum types)

Members = [UnknownRecordLE, UnknownArrayLE]
DE.CompoundE<{ [K in keyof Members]: DE.MemberE<K, ErrorOf<Members[K]>> }[number]>

```ts
export const MySum: D.SumD<"type", {
    A: D.StructD<{
        type: D.LiteralD<["A"]>;
        a: D.stringUD;
    }>;
    B: D.StructD<{
        type: D.LiteralD<["B"]>;
        b: D.numberUD;
    }>;
}> = D.sum('type')({
  //             +----- all union members in the dictionary must own a field named like the chosen tag ("type" in this case)
  //             |
  //             v               v----- this value must be equal to its corresponding dictionary key ("A" in this case)
  A: D.struct({ type: D.literal('A'), a: D.string }),
  //                             v----- this value must be equal to its corresponding dictionary key ("B" in this case)
  B: D.struct({ type: D.literal('B'), b: D.number })
})
```

**non-`string` tag values**

In case of non-`string` tag values, the respective key must be enclosed in brackets

```ts
export const MySum: D.SumD<"type", {
    1: D.StructD<{
        type: D.LiteralD<[1]>;
        a: D.stringUD;
    }>;
    2: D.StructD<{
        type: D.LiteralD<[2]>;
        b: D.numberUD;
    }>;
}> = D.sum('type')({
  [1]: D.struct({ type: D.literal(1), a: D.string }),
  [2]: D.struct({ type: D.literal(2), b: D.number })
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
  name: string
  categories: ReadonlyArray<Category>
}
const Category: D.LazyD<
  unknown,
  DE.DecodeError<DE.UnknownRecordE | DE.StringE | DE.UnknownArrayE>,
  Category
> = D.lazy('Category', () =>
  D.struct({
    name: D.string,
    categories: D.array(Category)
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
  D.struct({
    foo: D.string,
    bar: D.nullable(Bar)
  })
)

const Bar: D.Decoder<unknown, Bar> = D.lazy('Bar', () =>
  D.struct({
    bar: D.number,
    foo: D.nullable(Foo)
  })
)
```

## The `refine` combinator

The `refine` combinator allows to define refinements, for example a branded type

```ts
import { pipe } from 'fp-ts/function'

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

export const Positive: D.Decoder<
  unknown, 
  D.RefinementError<DE.NumberLE | DE.NaNLE | DE.InfinityLE, number, Positive>,
  Positive
> = pipe(
  D.number,
  D.refine((n): n is Positive => n > 0)
)

console.log(isRight(Positive.decode(1))) // => true
console.log(isRight(Positive.decode(-1))) // => false
```

## The `parse` combinator

The `parse` combinator is more powerful than `refine` in that you can change the output type

```ts
import { pipe } from 'fp-ts/function'
import { isRight } from 'fp-ts/Either'

export interface NumberFromStringE {
  readonly _tag: 'NumberFromStringE'
  readonly actual: unknown
}
export interface NumberFromStringLE extends LeafE<NumberFromStringE> {}

export const NumberFromString: D.Decoder<
  unknown,
  D.ParseError<DE.StringLE, NumberFromStringLE>,
  number
> = pipe(
  D.string,
  D.parse((s) => {
    const n = parseFloat(s)
    return isNaN(n) 
      ? _.failure(
        DE.leafE({ 
          _tag: "NumberFromStringE" as const, 
          actual: n
        }) as NumberFromStringLE
      )
      : _.success(n)
  })
)

console.log(isRight(NumberFromString.decode('1'))) // => true
console.log(isRight(NumberFromString.decode('a'))) // => false
```

# Extracting static types from decoders

Static types can be extracted from decoders using the `TypeOf` and `InputOf` operators

```ts
export const Person = D.struct({
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

type PersonInputType = D.InputOf<typeof Person>
/*
type PersonInputType = unknown
*/

type PersonErrorType = D.ErrorOf<typeof Person>
/*
type PersonErrorType = D.StructD<{
    name: D.stringUD;
    age: D.numberUD;
}>
*/
```

Note that you can define an `interface` instead of a type alias

```ts
export interface Person extends D.TypeOf<typeof Person> {}
```

# Built-in error reporter

```ts
import * as TH from 'fp-ts/These'
import { draw } from '../src/TreeReporter'

const printValue = (a: unknown): string => 'Value:\n' + util.format(a)
const printErrors = (s: string): string => 'Errors:\n' + s
const printWarnings = (s: string): string => 'Warnings:\n' + s

export const printAll = TH.fold(printErrors, printValue, (e, a) => printValue(a) + '\n' + printWarnings(e))

export const print = flow(TH.mapLeft(draw), printAll)

export const Person = D.struct({
  name: D.string,
  age: D.number
})

const result = Person.decode({})
if (!TH.isRight(result)) {
  console.log(print(result))
}
/*
required property "name"
└─ cannot decode undefined, should be string
required property "age"
└─ cannot decode undefined, should be number
*/
```
