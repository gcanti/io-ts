import * as assert from 'assert'
import * as t from '../src'
import { PathReporter } from '../src/PathReporter'
import { NumberFromString } from './helpers'

describe('PathReporter', () => {
  it('should use the function name as error message', () => {
    // tslint:disable-next-line: no-empty
    assert.deepStrictEqual(PathReporter.report(t.number.decode(function() {})), [
      'Invalid value <function0> supplied to : number'
    ])
    // tslint:disable-next-line: no-empty
    assert.deepStrictEqual(PathReporter.report(t.number.decode(function f() {})), [
      'Invalid value f supplied to : number'
    ])
  })

  it('should say something whene there are no errors', () => {
    assert.deepStrictEqual(PathReporter.report(t.number.decode(1)), ['No errors!'])
  })

  it('should account for the optional message field', () => {
    assert.deepStrictEqual(PathReporter.report(NumberFromString.decode('a')), ['cannot parse to a number'])
  })

  it('should handle NaN', () => {
    assert.deepStrictEqual(PathReporter.report(t.string.decode(NaN)), ['Invalid value NaN supplied to : string'])
  })

  it('should handle Infinity', () => {
    assert.deepStrictEqual(PathReporter.report(t.string.decode(Infinity)), [
      'Invalid value Infinity supplied to : string'
    ])
    assert.deepStrictEqual(PathReporter.report(t.string.decode(-Infinity)), [
      'Invalid value -Infinity supplied to : string'
    ])
  })
})
