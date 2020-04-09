import * as t from '../../../src'

const Tuple8 = t.tuple([t.string, t.string, t.string, t.string, t.string, t.string])
type Tuple8TypeTest = t.TypeOf<typeof Tuple8> // $ExpectType [string, string, string, string, string, string]
type Tuple8OutputTest = t.OutputOf<typeof Tuple8> // $ExpectType [string, string, string, string, string, string]

const Tuple9 = t.tuple([t.string, t.string, t.boolean, t.string, t.string, t.string, t.string])
type Tuple9TypeTest = t.TypeOf<typeof Tuple8> // $ExpectType [string, string, boolean, string, string, string, string]
type Tuple9OutputTest = t.OutputOf<typeof Tuple8> // $ExpectType [string, string, boolean, string, string, string, string]