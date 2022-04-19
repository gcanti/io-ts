<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [TaskDecoder interface](#taskdecoder-interface)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# TaskDecoder interface

```ts
export interface TaskDecoder<I, E, A> {
  readonly decode: (i: I) => TaskThese<E, A>
}
```

A `TaskDecoder` is a `Decoder` that can validate asynchronously. For example, schema data might come from a network request to create e.g. a graphql-type resolver

**Example**

```ts
import * as T from 'fp-ts/Task'
import * as TD from 'io-ts/TaskDecoder'
import { pipe } from 'fp-ts/function'

export interface NumberFromStringE {
  readonly _tag: 'NumberFromStringE'
  readonly actual: unknown
}
export interface NumberFromStringLE extends LeafE<NumberFromStringE> {}

declare const asyncParseFloat: (s: string) => Task<number>

export const decoder: TD.TaskDecoder<
  unknown,
  D.ParseError<DE.StringLE, NumberFromStringLE>,
  number
> = pipe(
  TD.string,
  TD.parse((s) => pipe(
    asyncParseFloat(s),
    T.map(
      n => isNaN(n) 
        ? TD.failure(
          DE.leafE({ 
            _tag: "NumberFromStringE" as const, 
            actual: n
          }) as NumberFromStringLE
        )
        : TD.success(n)
    )
  ))
)

```
