# The idea

A value of type `Type<T>` (called "runtime type") is the runtime representation of the static type `T`:

```js
class Type<T> {
  constructor(public readonly name: string, public readonly validate: Validate<T>) {}
}
```

where `Validate<T>` is a specific validation function for `T`

```js
type Validate<T> = (value: any, context: Context) => Either<Array<ValidationError>, T>;
```

**Example**

A runtime type representing `string` can be defined as

```js
import * as t from 'io-ts'

const string = new t.Type<string>(
  'string',
  (value, context) => typeof value === 'string' ? new Right(value) : new Left([{ value, context }])
)
```

A runtime type can be used to validate an object in memory (for example an API payload)

```js
const Person = t.object({
  name: t.string,
  age: t.number
})

// ok
t.validate(JSON.parse('{"name":"Giulio","age":43}'), Person) // => Right({name: "Giulio", age: 43})

// ko
t.validate(JSON.parse('{"name":"Giulio"}'), Person) // => Left([...])
```

# Error reporters

A reporter implements the following interface

```js
interface Reporter<A> {
  report: (validation: Validation<any>) => A;
}
```

This package exports two default reporters

- `PathReporter: Reporter<Array<string>>`
- `ThrowReporter: Reporter<void>`

Example

```js
import { PathReporter, ThrowReporter } from '../src/reporters/default'

const validation = t.validate({"name":"Giulio"}, Person)

console.log(PathReporter.report(validation))
// => ['Invalid value undefined supplied to : { name: string, age: number }/age: number']

ThrowReporter.report(validation)
// => throws 'Invalid value undefined supplied to : { name: string, age: number }/age: number'
```

# TypeScript integration

Runtime types can be inspected

![instrospection](docs/images/introspection.png)

This library uses TypeScript extensively. Its API is defined in a way which automatically infers types for produced values

![inference](docs/images/inference.png)

Note that the type annotation isn't needed, TypeScript infers the type automatically based on a schema.

Static types can be extracted from runtime types with the `TypeOf` operator

```js
type IPerson = t.TypeOf<typeof Person>

// same as
type IPerson = {
  name: string,
  age: number
}
```

Note that recursive types can't be inferred

```js
// helper type
type ICategory = {
  name: string,
  categories: Array<ICategory>
}

const Category = t.recursion<ICategory>('Category', self => t.object({
  name: t.string,
  categories: t.array(self)
}))
```

# Implemented types / combinators

```js
import * as t from 'io-ts'
```

| Type | TypeScript annotation syntax | Runtime type / combinator |
|------|-------|-------------|
| null | `null` | `t.null` |
| undefined | `undefined` | `t.undefined` |
| string | `string` | `t.string` |
| number | `number` | `t.number` |
| boolean | `boolean` | `t.boolean` |
| generic array | `Array<any>` | `t.Array` |
| generic object | `{ [key: string]: any }` | `t.Pojo` |
| generic function | `Function` | `t.Function` |
| instance of `C` | `C` | `t.instanceOf(C)` |
| list | `Array<A>` | `t.array(A)` |
| literal | `'s'` | `t.literal('s')` |
| maybe | `A | undefined | null` | `t.maybe(A)` |
| mapping | `{ [key: A]: B }` | `t.mapping(A, B)` |
| refinement | ✘ | `t.refinement(A, predicate)` |
| record | `{ name: string }` | `t.record({ name: t.string })` |
| tuple | `[A, B]` | `t.tuple([A, B])` |
| union | `A | B` | `t.union([A, B])` |
| intersection | `A & B` | `t.intersection([A, B])` |
| recursive types |  | `t.recursion(name, definition)` |
