<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Schema interface](#schema-interface)
- [How to extend the built-in `Schema`](#how-to-extend-the-built-in-schema)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Schema interface

```ts
export interface Schema<A> {
  <S extends URIS>(S: Schemable<S>): Kind<S, A>
}
```

`Schema` allows to define (through the `make` constructor) a generic schema once and then derive multiple concrete instances.

**Example**

```ts
import * as S from 'io-ts/lib/Schema'
import * as D from 'io-ts/lib/Decoder'
import * as E from 'io-ts/lib/Encoder'
import * as C from 'io-ts/lib/Codec'
import * as G from 'io-ts/lib/Guard'
import * as Eq from 'io-ts/lib/Eq'

export const Person = S.make((S) =>
  S.type({
    name: S.string,
    age: S.number
  })
)

export const decoderPerson = Person(D.decoder)
export const encoderPerson = Person(E.encoder)
export const codecPerson = Person(C.codec)
export const guardPerson = Person(G.guard)
export const eqPerson = Person(Eq.eq)
```

# How to extend the built-in `Schema`

Let's say we want to add an `Int` capability to the default `Schemable` type class.

First of all we must represent an integer at the type level, I'll make use of a branded type for this

```ts
export interface IntBrand {
  readonly Int: unique symbol
}

export type Int = number & IntBrand
```

Now we must define a custom `MySchemable` type class containing a new member `Int`...

```ts
import { Kind, URIS } from 'fp-ts/lib/HKT'
import * as S from 'io-ts/lib/Schemable'

export interface MySchemable<S extends URIS> extends S.Schemable<S> {
  readonly Int: Kind<S, Int>
}
```

...and a `make` constructor for our extended schemas

```ts
export interface MySchema<A> {
  <S extends URIS>(S: MySchemable<S>): Kind<S, A>
}

export function make<A>(f: MySchema<A>): MySchema<A> {
  return S.memoize(f)
}
```

Finally we must define an instance of `MySchemable` for `Decoder`

```ts
import * as D from 'io-ts/lib/Decoder'

export const mydecoder: MySchemable<D.URI> = {
  ...D.decoder,
  Int: D.refinement(D.number, (n): n is Int => Number.isInteger(n), 'Int')
}
```

Now we can define a schema leveraging the new `Int` capability

```ts
const Person = make((S) =>
  S.type({
    name: S.string,
    age: S.Int
  })
)
/*
const Person: MySchema<{
    name: string;
    age: Int;
}>
*/

const decoderPerson = Person(mydecoder)
/*
const decoderPerson: D.Decoder<{
    name: string;
    age: Int;
}>
*/
```
