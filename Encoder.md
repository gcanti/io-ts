<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Encoder interface](#encoder-interface)
- [Combinators](#combinators)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Encoder interface

```ts
export interface Encoder<A> {
  readonly encode: (a: A) => unknown
}
```

**Example**

An encoder representing a nullable value

```ts
import * as E from 'io-ts/lib/Encoder'

export function nullable<A>(or: E.Encoder<A>): E.Encoder<null | A> {
  return {
    encode: (a) => (a === null ? a : or.encode(a))
  }
}
```

# Combinators

- `nullable`
- `type`
- `partial`
- `record`
- `array`
- `tuple`
- `intersection`
- `sum`
- `lazy`
