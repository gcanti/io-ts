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

export const PersonDecoder = Person(D.decoder)
export const PersonEncoder = Person(E.encoder)
export const PersonCodec = Person(C.codec)
export const PersonGuard = Person(G.guard)
export const PersonEq = Person(Eq.eq)
```
