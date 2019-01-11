import * as assert from 'assert'
import { readFileSync } from 'fs'

const actual = readFileSync('./declaration/out/declaration/index.d.ts').toString()
const expected = readFileSync('./test/declaration.fixture').toString()

describe('emitted declaration file', () => {
  it('should emit nested types', () => {
    assert.strictEqual(actual, expected)
  })
})
