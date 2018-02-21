var Benchmark = require('benchmark')
var t = require('../lib/index')

const suite = new Benchmark.Suite()

const Vector = t.tuple([t.number, t.number, t.number])

const Asteroid = t.type({
  type: t.literal('asteroid'),
  location: Vector,
  mass: t.number
})

const Planet = t.type({
  type: t.literal('planet'),
  location: Vector,
  mass: t.number,
  population: t.number,
  habitable: t.boolean
})

const Rank = t.keyof({
  captain: null,
  'first mate': null,
  officer: null,
  ensign: null
})

const CrewMember = t.type({
  name: t.string,
  age: t.number,
  rank: Rank,
  home: Planet
})

const Ship = t.type({
  type: t.literal('ship'),
  location: Vector,
  mass: t.number,
  name: t.string,
  crew: t.array(CrewMember)
})

const T = t.taggedUnion('type', [Asteroid, Planet, Ship])

const good = {
  type: 'ship',
  location: [1, 2, 3],
  mass: 4,
  name: 'foo',
  crew: [
    {
      name: 'bar',
      age: 44,
      rank: 'captain',
      home: {
        type: 'planet',
        location: [5, 6, 7],
        mass: 8,
        population: 1000,
        habitable: true
      }
    }
  ]
}

const bad = {
  type: 'ship',
  location: [1, 2, 3],
  mass: 4,
  name: 'foo',
  crew: [
    {
      name: 'bar',
      age: 44,
      rank: 'captain',
      home: {
        type: 'planet',
        location: [5, 6, 7],
        mass: 8,
        population: 'a',
        habitable: true
      }
    }
  ]
}

// console.log(T.decode(good))
// console.log(T.decode(bad))

suite
  .add('space-object (good)', function() {
    T.decode(good)
  })
  .add('space-object (bad)', function() {
    T.decode(bad)
  })
  .on('cycle', function(event) {
    console.log(String(event.target))
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
