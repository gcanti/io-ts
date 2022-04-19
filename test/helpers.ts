import * as D from '../src/Decoder'
import * as DE from '../src/DecodeError'
import { pipe } from 'fp-ts/lib/pipeable'
import { flow } from 'fp-ts/lib/function'

// -------------------------------------------------------------------------------------
// decoders
// -------------------------------------------------------------------------------------

export interface UndefinedE {
  readonly _tag: 'UndefinedE'
  readonly actual: unknown
}

export interface UndefinedLE extends DE.LeafE<UndefinedE> {}

export const decoderUndefined: D.Decoder<unknown, UndefinedLE, undefined> = {
  decode: (i) => (typeof i === 'undefined' ? D.success(i) : D.failure(DE.leafE({ _tag: 'UndefinedE', actual: i })))
}

export interface NumFromStrLE extends DE.LeafE<{ _tag: 'NumFromStrE'; actual: string }> {}

export const decoderNumberFromString: D.Decoder<string, NumFromStrLE, number> = {
  decode: (s) => {
    const n = parseFloat(s)
    return isNaN(n) ? D.failure(DE.leafE({ _tag: 'NumFromStrE', actual: s })) : D.success(n)
  }
}

export const decoderNumberFromUnknownString = pipe(D.string, D.compose(decoderNumberFromString))

export interface PositiveBrand {
  readonly Positive: unique symbol
}

export type Positive = number & PositiveBrand

export const decoderPositive = pipe(
  D.number,
  D.refine((n): n is Positive => n > 0)
)

export interface IntBrand {
  readonly Int: unique symbol
}

export type Int = number & IntBrand

export const decoderInt = pipe(
  D.number,
  D.refine((n): n is Int => Number.isInteger(n))
)

// -------------------------------------------------------------------------------------
// encoders
// -------------------------------------------------------------------------------------

export const encoderNumberToString: D.Decoder<number, never, string> = {
  decode: flow(String, D.success)
}

export const encoderBooleanToNumber: D.Decoder<boolean, never, number> = {
  decode: (b) => D.success(b ? 1 : 0)
}
