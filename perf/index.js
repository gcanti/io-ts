var Benchmark = require('benchmark')
var t = require('../lib/index')

const suite = new Benchmark.Suite()

const T = t.type({
  a: t.string,
  b: t.number,
  c: t.array(t.boolean),
  d: t.tuple([t.number, t.string])
})
const payloadKO = { c: [1], d: ['foo'] }
const payloadOK = { a: 'a', b: 1, c: [true], d: [1, 'foo'] }

suite
  .add('invalid payload', function() {
    t.validate(payloadKO, T)
  })
  .add('valid payload (no errors)', function() {
    t.validate(payloadOK, T)
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
