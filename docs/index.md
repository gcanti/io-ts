---
title: Home
---

# Runtime type system for IO decoding/encoding

## The idea

A value of type `Type<A, O, I>` (called "codec") is the runtime representation of the static type `A`.

A codec can:

- decode inputs of type `I` (through `decode`)
- encode outputs of type `O` (through `encode`)
- be used as a custom [type guard](https://basarat.gitbook.io/typescript/type-system/typeguard) (through `is`)

```ts
class Type<A, O, I> {
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

The [`Either`](https://gcanti.github.io/fp-ts/modules/Either.ts.html) type returned by `decode` is defined in [fp-ts](https://github.com/gcanti/fp-ts), a library containing implementations of common algebraic types in TypeScript.

The `Either` type represents a value of one of two possible types (a disjoint union). An instance of `Either` is either an instance of `Left` or `Right`:

```ts
type Either<E, A> =
  | {
      readonly _tag: 'Left'
      readonly left: E
    }
  | {
      readonly _tag: 'Right'
      readonly right: A
    }
```

Convention dictates that `Left` is used for **failure** and `Right` is used for **success**.

**Example**

A codec representing `string` can be defined as:

```ts
import * as t from 'io-ts'

const string = new t.Type<string, string, unknown>(
  'string',
  (input: unknown): input is string => typeof input === 'string',
  // `t.success` and `t.failure` are helpers used to build `Either` instances
  (input, context) => (typeof input === 'string' ? t.success(input) : t.failure(input, context)),
  // `A` and `O` are the same, so `encode` is just the identity function
  t.identity
)
```

and we can use it as follows:

```ts
import { isRight } from 'fp-ts/lib/Either'

isRight(string.decode('a string')) // true
isRight(string.decode(null)) // false
```

More generally the result of calling `decode` can be handled using [`fold`](https://gcanti.github.io/fp-ts/modules/Either.ts.html#fold-function) along with `pipe` (which is similar to the pipeline operator)

```ts
import * as t from 'io-ts'
import { pipe } from 'fp-ts/lib/pipeable'
import { fold } from 'fp-ts/lib/Either'

// failure handler
const onLeft = (errors: t.Errors): string => `${errors.length} error(s) found`

// success handler
const onRight = (s: string) => `No errors: ${s}`

pipe(t.string.decode('a string'), fold(onLeft, onRight))
// => "No errors: a string"

pipe(t.string.decode(null), fold(onLeft, onRight))
// => "1 error(s) found"
```

We can combine these codecs through [combinators](#implemented-types--combinators) to build composite types which represent entities like domain models, request payloads etc. in our applications:

```ts
import * as t from 'io-ts'

const User = t.type({
  userId: t.number,
  name: t.string
})
```

So this is equivalent to defining something like:

```ts
type User = {
  userId: number
  name: string
}
```

The advantage of using `io-ts` to define the runtime type is that we can validate the type at runtime, and we can also extract the corresponding static type, so we don’t have to define it twice.

Static types can be extracted from codecs using the `TypeOf` operator:

```ts
type User = t.TypeOf<typeof User>

// same as
type User = {
  userId: number
  name: string
}
```

## Error reporters

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

const result = User.decode({ name: 'Giulio' })

console.log(PathReporter.report(result))
// => [ 'Invalid value undefined supplied to : { userId: number, name: string }/userId: number' ]
```
