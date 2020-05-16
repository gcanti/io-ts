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

export const decoderPerson = S.interpreter(D.decoder)(Person)
export const encoderPerson = S.interpreter(E.encoder)(Person)
export const codecPerson = S.interpreter(C.codec)(Person)
export const guardPerson = S.interpreter(G.guard)(Person)
export const eqPerson = S.interpreter(Eq.eq)(Person)
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
import { Kind, URIS, HKT } from 'fp-ts/lib/HKT'

export interface MySchemable<S> extends S.Schemable<S> {
  readonly Int: HKT<S, Int>
}

export interface MySchemable1<S extends URIS> extends S.Schemable1<S> {
  readonly Int: Kind<S, Int>
}
```

...and a `make` constructor for our extended schemas

```ts
export interface MySchema<A> {
  <S>(S: MySchemable<S>): HKT<S, A>
}

export function make<A>(f: MySchema<A>): MySchema<A> {
  return S.memoize(f)
}
```

Finally we must define an instance of `MySchemable1` for `Decoder` and an interpreter

```ts
import * as D from 'io-ts/lib/Decoder'

export const mydecoder: MySchemable1<D.URI> = {
  ...D.decoder,
  Int: D.refinement(D.number, (n): n is Int => Number.isInteger(n), 'Int')
}

export function interpreter<S extends URIS>(S: MySchemable1<S>): <A>(schema: MySchema<A>) => Kind<S, A>
export function interpreter<S>(S: MySchemable<S>): <A>(schema: MySchema<A>) => HKT<S, A> {
  return (schema) => schema(S)
}
```

Now we can define a schema leveraging the new `Int` capability

```ts
export const Person = make((S) =>
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

export const decoderPerson = interpreter(mydecoder)(Person)
/*
const decoderPerson: D.Decoder<{
    name: string;
    age: Int;
}>
*/
```
