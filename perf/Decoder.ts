import * as Benchmark from 'benchmark'
import * as t from '../src/Decoder'

/*
space-object (good) x 662,359 ops/sec ±0.65% (88 runs sampled)
space-object (bad) x 379,528 ops/sec ±0.56% (89 runs sampled)

space-object (good) x 295,284 ops/sec ±0.67% (85 runs sampled)
space-object (bad) x 295,530 ops/sec ±0.53% (88 runs sampled)
*/

const suite = new Benchmark.Suite()

const Vector = t.tuple(t.number, t.number, t.number)

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

const Rank = t.literal('captain', 'first mate', 'officer', 'ensign')

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

const T = t.sum('type')({
  asteroid: Asteroid,
  planet: Planet,
  ship: Ship
})

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
  location: [1, 2, 'a'],
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
  .add('space-object (good)', function () {
    T.decode(good)
  })
  .add('space-object (bad)', function () {
    T.decode(bad)
  })
  .on('cycle', function (event: any) {
    console.log(String(event.target))
  })
  .on('complete', function (this: any) {
    console.log('Fastest is ' + this.filter('fastest').map('name'))
  })
  .run({ async: true })
