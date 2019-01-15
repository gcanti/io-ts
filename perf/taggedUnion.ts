import * as Benchmark from 'benchmark'
import * as t from '../src'

const suite = new Benchmark.Suite()

const TUA = t.type(
  {
    type: t.literal('a'),
    foo: t.string
  },
  'TUA'
)

const TUB = t.intersection(
  [
    t.type({
      type: t.literal('b')
    }),
    t.type({
      bar: t.number
    })
  ],
  'TUB'
)

const DateFromNumber = new t.Type<Date, number, unknown>(
  'DateFromNumber',
  (u): u is Date => u instanceof Date,
  (s, c) =>
    t.number.validate(s, c).chain(n => {
      const d = new Date(n)
      return isNaN(d.getTime()) ? t.failure(n, c) : t.success(d)
    }),
  a => a.getTime()
)

const TUC = t.type(
  {
    type: t.literal('c'),
    baz: DateFromNumber
  },
  'TUC'
)

const T = t.taggedUnion('type', [TUA, TUB, TUC])

suite
  .add('taggedUnion (valid)', function() {
    T.decode({ type: 'a', foo: 'foo' })
  })
  .add('taggedUnion (invalid)', function() {
    T.decode({ type: 'D' })
  })
  .on('cycle', function(event: any) {
    console.log(String(event.target))
  })
  .on('complete', function(this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
