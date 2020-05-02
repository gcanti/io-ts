<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Eq interface](#eq-interface)
- [Built-in primitive eqs](#built-in-primitive-eqs)
- [Combinators](#combinators)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Eq interface

```ts
export interface Eq<A> {
  readonly equals: (x: A, y: A) => boolean
}
```

The `Eq` type class represents types which support decidable equality.

Instances must satisfy the following laws:

1. Reflexivity: `E.equals(a, a) === true`
2. Symmetry: `E.equals(a, b) === E.equals(b, a)`
3. Transitivity: if `E.equals(a, b) === true` and `E.equals(b, c) === true`, then `E.equals(a, c) === true`

**Example**

```ts
import { Eq } from 'fp-ts/lib/Eq'

export const string: Eq<string> = {
  equals: (x, y) => x === y
}
```

# Built-in primitive eqs

- `string: Eq<string>`
- `number: Eq<number>`
- `boolean: Eq<boolean>`
- `UnknownArray: Eq<Array<unknown>>`
- `UnknownRecord: Eq<Record<string, unknown>>`

# Combinators

- `literal`
- `nullable`
- `type`
- `partial`
- `record`
- `array`
- `tuple`
- `intersection`
- `sum`
- `lazy`

**Example**

```ts
import * as E from 'io-ts/lib/Eq'

const Person = E.type({
  name: E.string,
  age: E.number
})

console.log(Person.equals({ name: 'a', age: 0 }, { name: 'a', age: 0 })) // => true
console.log(Person.equals({ name: 'a', age: 0 }, { name: '', age: 0 })) // => false
console.log(Person.equals({ name: 'a', age: 0 }, { name: 'a', age: 1 })) // => false
```
