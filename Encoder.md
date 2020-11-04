<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Encoder interface](#encoder-interface)
- [Extracting static types from encoders](#extracting-static-types-from-encoders)

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
import * as E from 'io-ts/Encoder'

export function nullable<O, A>(or: E.Encoder<O, A>): E.Encoder<null | O, null | A> {
  return {
    encode: (a) => (a === null ? null : or.encode(a))
  }
}
```

# Extracting static types from encoders

Static types can be extracted from encoders using the `OutputOf` operator

```ts
const NumberToString: E.Encoder<string, number> = {
  encode: String
}

type MyOutputType = E.OutputOf<typeof NumberToString>
/*
type MyOutputType = string
*/
```
