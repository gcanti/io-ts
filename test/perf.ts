import * as assert from 'assert'
import * as Benchmark from 'benchmark'
import { Context, getDefaultContext, getContextEntry, string, number } from '../src/index'

const suite = new Benchmark.Suite()
const c: Context = getDefaultContext(string)

describe('perf', () => {
  ;(it('concat([a]) should be faster than concat(a)', done => {
    suite
      .add('concat(e)', function() {
        c.concat(getContextEntry('key', number))
      })
      .add('concat([e])', function() {
        c.concat([getContextEntry('key', number)])
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
