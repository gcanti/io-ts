var Benchmark = require('benchmark')
var t = require('../lib/index')
var { PathReporter } = require('../lib/PathReporter')

const suite = new Benchmark.Suite()

const T1 = t.type({
  a: t.string,
  b: t.optional(t.number)
})

const T2 = t.intersection([t.type({ a: t.string }), t.partial({ b: t.number })])

const valid = { a: 'a', b: 1 }
const invalid = { a: 'a', b: 'b' }

// console.log(PathReporter.report(T1.decode(valid)))
// console.log(PathReporter.report(T2.decode(valid)))
// console.log(PathReporter.report(T1.decode(invalid)))
// console.log(PathReporter.report(T2.decode(invalid)))

suite
  .add('optional (valid)', function() {
    T1.decode(valid)
  })
  .add('intersection (valid)', function() {
    T2.decode(valid)
  })
  .add('optional (invalid)', function() {
    T1.decode(invalid)
  })
  .add('intersection (invalid)', function() {
    T2.decode(invalid)
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
