import * as assert from 'assert'
import * as D from '../src/Decoder'
import * as S from '../src/Schema'
import * as _ from './DSL'

describe('DSL', () => {
  it('string', () => {
    assert.deepStrictEqual(_.string.dsl(), { _tag: 'string' })
  })

  it('number', () => {
    assert.deepStrictEqual(_.number.dsl(), { _tag: 'number' })
  })

  it('type', () => {
    assert.deepStrictEqual(
      _.type({
        name: _.string,
        age: _.number
      }).dsl(),
      {
        _tag: 'type',
        props: {
          name: { _tag: 'string' },
          age: { _tag: 'number' }
        }
      }
    )
  })

  it('toSchema', () => {
    const dsl = _.type({
      a: _.string
    })
    const schema = _.toSchema(dsl)
    const decoder = S.interpreter(D.Schemable)(schema)
    assert.deepStrictEqual(decoder.decode({ a: 'a' }), D.success({ a: 'a' }))
  })
})
