<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Codec interface](#codec-interface)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Codec interface

```ts
export interface Codec<I, O, A> extends D.Decoder<I, A>, E.Encoder<O, A> {}
```

A `Codec` is just a `Decoder` and its dual packed together

You can build a new codec using the `codec` helper

**Example**

```ts
import * as C from 'io-ts/Codec'
import * as D from 'io-ts/Decoder'
import { pipe } from 'fp-ts/function'

export interface NumberFromStringE {
  readonly _tag: 'NumberFromStringE'
  readonly actual: unknown
}
export interface NumberFromStringLE extends LeafE<NumberFromStringE> {}

export const decoder: D.Decoder<
  unknown,
  D.ParseError<DE.StringLE, NumberFromStringLE>,
  number
> = pipe(
  D.string,
  D.parse((s) => {
    const n = parseFloat(s)
    return isNaN(n) 
      ? D.failure(
        DE.leafE({ 
          _tag: "NumberFromStringE" as const, 
          actual: n
        }) as NumberFromStringLE
      )
      : D.success(n)
  })
)

const encoder: D.Decoder<
  number, 
  never, 
  string
> = {
  encode: flow(String, D.success)
}

export const NumberFromString: C.Codec<
  D.Decoder<
    unknown,
    D.ParseError<DE.StringLE, NumberFromStringLE>,
    number
  >,
  D.Decoder<
    number, 
    never, 
    string
  >
> = C.codec(decoder, encoder)
```
