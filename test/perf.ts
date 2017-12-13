/*
import * as Benchmark from 'benchmark'
import * as assert from 'assert'

import {
  Context,
  getContextEntry,
  getDefaultContext,
  number,
  string
} from '../src/index'

const suite = new Benchmark.Suite()
const c: Context = getDefaultContext(string)

const appendNext = (arr: any[], e: any) => {
  const len = arr.length
  const res = Array(len + 1)
  for (let i = 0; i < len; i++) {
    res[i] = arr[i]
  }
  res[len] = e
  return res
}

describe('perf', () => {
  ;(it('concat([a]) should be faster than concat(a)', done => {
    suite
      .add('concat(e)', function() {
        c.concat(getContextEntry('key', number))
      })
      .add('concat([e])', function() {
        c.concat([getContextEntry('key', number)])
      })
      .add('manual appendNext function', function() {
        snoc(c, getContextEntry('key', number))
      })
      .on('cycle', function(event: any) {
        console.log(String(event.target))
      })
      .on('complete', function(this: any) {
        assert.deepEqual(this.filter('fastest').map('name'), ['concat([e])'])
        done()
      })
      .run({ async: true })
  }) as any).timeout(20000)
})
*/
