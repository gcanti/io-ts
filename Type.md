<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Type interface](#type-interface)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Type interface

```ts
export interface Type<A> extends t.Type<A, unknown, unknown> {}
```

A `Type` is a pipe-able wrapper for the old io-ts modules, mirroring the new Decoder module. It can be used as an intermediate step for projects that are transitioning to the 

It also conforms to the Schemable interface, found in the [io-ts-contib](https://github.com/anthonyjoeseph/io-ts-contrib) module, which enables anything defined as a [Schema](https://github.com/anthonyjoeseph/io-ts-contrib/blob/master/Schema.md) to derive an old io-ts type

**Example**

```ts
import * as t from 'io-ts'
import * as T from 'io-ts/Type'
import { pipe } from 'fp-ts/function'

export const numberFromString = pipe(
  T.string,
  T.parse((s) => {
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

export type NumberFromString = t.TypeOf<typeof numberFromString>
// NumberFromString = number

```
