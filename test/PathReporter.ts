import * as assert from 'assert'
import { PathReporter } from '../src/PathReporter'
import { bigint, brand, Branded } from '../src'
import { struct } from '../src/Type'

describe('PathReporter', () => {
  it('should properly report decoding errors against a bigint value', () => {
    interface PositiveBigIntBrand {
      readonly PositiveBigInt: unique symbol
    }

    const PositiveBigInt = brand(
      bigint,
      (n: bigint): n is Branded<bigint, PositiveBigIntBrand> => BigInt(0) < n,
      'PositiveBigInt'
    )

    const testC = struct({ value: PositiveBigInt })
    const testValidation = testC.decode({ value: BigInt(-10) })

    const result = PathReporter.report(testValidation).join('\n')

    assert.equal(result, 'Invalid value "BigInt(-10)" supplied to : { value: PositiveBigInt }/value: PositiveBigInt')
  })
})
