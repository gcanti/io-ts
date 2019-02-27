---
title: Home
---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [The idea](#the-idea)
- [TypeScript compatibility](#typescript-compatibility)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
import * as t from 'io-ts'

const User = t.type({
  userId: t.number,
  name: t.string
})

// validation succeeded
User.decode(JSON.parse('{"userId":1,"name":"Giulio"}')) // => Right({ userId: 1, name: "Giulio" })

// validation failed
User.decode(JSON.parse('{"name":"Giulio"}')) // => Left([...])
```

# TypeScript compatibility

The stable version is tested against TypeScript 3.2.4.

| io-ts version | required TypeScript version |
| ------------- | --------------------------- |
| 1.6.x+        | 3.2.2+                      |
| 1.5.3         | 3.0.1+                      |
| 1.5.2-        | 2.7.2+                      |

**Note**. This library is conceived, tested and is supposed to be consumed by TypeScript with the `strict` flag turned on.

**Note**. If you are running `< typescript@3.0.1` you have to polyfill `unknown`.

You can use [unknown-ts](https://github.com/gcanti/unknown-ts) as a polyfill.
