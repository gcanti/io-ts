import * as t from '../src/index'
import { Right, Left } from 'fp-ts/lib/Either'

describe('partialPartial', () => {
  it('handles some optional props', () => {
    const Person = t.partialPartial({ name: t.string, age: t.optional(t.number) })
    expect(Person.decode({ name: 'bob', age: 30 })).toBeInstanceOf(Right)
    expect(Person.decode({ name: 'bob' })).toBeInstanceOf(Right)
    expect(Person.decode({})).toBeInstanceOf(Left)
  })

  it('handles all required props', () => {
    const Person = t.partialPartial({ name: t.string, age: t.number })
    expect(Person.decode({ name: 'bob', age: 30 })).toBeInstanceOf(Right)
    expect(Person.decode({ name: 'bob' })).toBeInstanceOf(Left)
    expect(Person.decode({})).toBeInstanceOf(Left)
  })
})
