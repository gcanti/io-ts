import * as G from '../src/Guard'
import * as D from '../src/Decoder'
import * as E from '../src/Encoder'
import { pipe } from 'fp-ts/lib/pipeable'

// -------------------------------------------------------------------------------------
// guards
// -------------------------------------------------------------------------------------

export const guardUndefined: G.Guard<unknown, undefined> = {
  is: (u): u is undefined => u === undefined
}

// -------------------------------------------------------------------------------------
// decoders
// -------------------------------------------------------------------------------------

export const decoderUndefined: D.Decoder<unknown, undefined> = D.fromGuard(guardUndefined, 'undefined')

export const decoderNumberFromString: D.Decoder<string, number> = {
  decode: (s) => {
    const n = parseFloat(s)
    return isNaN(n) ? D.failure(s, 'parsable to a number') : D.success(n)
  }
}

export const decoderNumberFromUnknownString: D.Decoder<unknown, number> = pipe(
  D.string,
  D.compose(decoderNumberFromString)
)

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

export const decoderPositive: D.Decoder<unknown, Positive> = pipe(
  D.number,
  D.refine((n): n is Positive => n > 0, 'Positive')
)

export interface IntBrand {
  readonly Int: unique symbol
}

export type Int = number & IntBrand

export const decoderInt: D.Decoder<unknown, Int> = pipe(
  D.number,
  D.refine((n): n is Int => Number.isInteger(n), 'Int')
)

// -------------------------------------------------------------------------------------
// encoders
// -------------------------------------------------------------------------------------

export const encoderNumberToString: E.Encoder<string, number> = {
  encode: String
}

export const encoderBooleanToNumber: E.Encoder<number, boolean> = {
  encode: (b) => (b ? 1 : 0)
}
