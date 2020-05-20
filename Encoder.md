<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Encoder interface](#encoder-interface)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Encoder interface

```ts
export interface Encoder<O, A> {
  readonly encode: (a: A) => O
}
```

**Example**

An encoder representing a nullable value

```ts
import * as E from 'io-ts/lib/Encoder'

export function nullable<O, A>(or: E.Encoder<O, A>): E.Encoder<null | O, null | A> {
  return {
    encode: (a) => (a === null ? null : or.encode(a))
  }
}
```
