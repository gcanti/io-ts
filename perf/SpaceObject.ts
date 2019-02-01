import * as t from '../src'

const Vector = t.tuple([t.number, t.number, t.number], 'Vector')

const Asteroid = t.type(
  {
    type: t.literal('asteroid'),
    location: Vector,
    mass: t.number
  },
  'Asteroid'
)

const Planet = t.type(
  {
    type: t.literal('planet'),
    location: Vector,
    mass: t.number,
    population: t.number,
    habitable: t.boolean
  },
  'Planet'
)

const Rank = t.keyof(
  {
    captain: null,
    'first mate': null,
    officer: null,
    ensign: null
  },
  'Rank'
)

const CrewMember = t.type(
  {
    name: t.string,
    age: t.number,
    rank: Rank,
    home: Planet
  },
  'CrewMember'
)

const Ship = t.type(
  {
    type: t.literal('ship'),
    location: Vector,
    mass: t.number,
    name: t.string,
    crew: t.array(CrewMember)
  },
  'Ship'
)

export const SpaceObject = t.taggedUnion('type', [Asteroid, Planet, Ship], 'SpaceObject')

export const valid = {
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

export const invalid = {
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
        population: 'a', // <= bad value here
        habitable: true
      }
    }
  ]
}
