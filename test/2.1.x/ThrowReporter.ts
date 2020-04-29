import * as assert from 'assert'
import * as t from '../../src'
import { ThrowReporter } from '../../src/ThrowReporter'

describe('ThrowReporter', () => {
  it('should throw on invalid inputs', () => {
    assert.throws(() => {
      // tslint:disable-next-line: deprecation
      ThrowReporter.report(t.string.decode(1))
    })
  })

  it('should not throw on invalid inputs', () => {
    assert.doesNotThrow(() => {
      // tslint:disable-next-line: deprecation
      ThrowReporter.report(t.string.decode('a'))
    })
  })
})
