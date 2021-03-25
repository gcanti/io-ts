import * as t from '../../src/index'
import { assertFailure, assertSuccess } from './helpers'

describe('validate', () => {
  describe('type', () => {
    it('should validate type', () => {
      const T = t.type({ a: t.string, b: t.number })
      T.validateWith((v, c) => {
        if (v.b < 10) {
          return v.a === 'low' ? t.success(undefined) : t.failure(v, c, 'a must be set to "low"')
        } else {
          return v.a === 'high' ? t.success(undefined) : t.failure(v, c, 'a must be set to "high"')
        }
      })
      assertSuccess(T.decode({ a: 'low', b: 5 }), { a: 'low', b: 5 })
      assertSuccess(T.decode({ a: 'high', b: 12 }), { a: 'high', b: 12 })
      assertFailure(T, { a: 'high' }, ['Invalid value undefined supplied to : { a: string, b: number }/b: number'])
      assertFailure(T, { b: 5 }, ['Invalid value undefined supplied to : { a: string, b: number }/a: string'])
      assertFailure(T, { a: 'low', b: 12 }, ['a must be set to "high"'])
      assertFailure(T, { a: 'high', b: 5 }, ['a must be set to "low"'])
    })
    it('should validate nested types', () => {
      const T = t.type({ a: t.string, b: t.number })
      T.validateWith((v, c) => {
        if (v.b < 10) {
          return v.a === 'low' ? t.success(undefined) : t.failure(v, c, 'a must be set to "low"')
        } else {
          return v.a === 'high' ? t.success(undefined) : t.failure(v, c, 'a must be set to "high"')
        }
      })
      const T1 = t.type({ n: T })
      assertSuccess(T1.decode({ n: { a: 'low', b: 5 } }), { n: { a: 'low', b: 5 } })
      assertSuccess(T1.decode({ n: { a: 'high', b: 12 } }), { n: { a: 'high', b: 12 } })
      assertFailure(T1, { n: { a: 'high' } }, [
        'Invalid value undefined supplied to : { n: { a: string, b: number } }/n: { a: string, b: number }/b: number'
      ])
      assertFailure(T1, { n: { b: 5 } }, [
        'Invalid value undefined supplied to : { n: { a: string, b: number } }/n: { a: string, b: number }/a: string'
      ])
      assertFailure(T1, { n: { a: 'low', b: 12 } }, ['a must be set to "high"'])
      assertFailure(T1, { n: { a: 'high', b: 5 } }, ['a must be set to "low"'])
    })
    it('should validate type with multiple validators', () => {
      const T = t.type({ a: t.string, b: t.number })
      T.validateWith((v, c) => {
        if (v.b < 10) {
          return v.a === 'low' ? t.success(undefined) : t.failure(v, c, 'a must be set to "low"')
        }
        return t.success(undefined)
      }).validateWith((v, c) => {
        if (v.b >= 10) {
          return v.a === 'high' ? t.success(undefined) : t.failure(v, c, 'a must be set to "high"')
        }
        return t.success(undefined)
      })
      assertSuccess(T.decode({ a: 'low', b: 5 }), { a: 'low', b: 5 })
      assertSuccess(T.decode({ a: 'high', b: 12 }), { a: 'high', b: 12 })
      assertFailure(T, { a: 'high' }, ['Invalid value undefined supplied to : { a: string, b: number }/b: number'])
      assertFailure(T, { b: 5 }, ['Invalid value undefined supplied to : { a: string, b: number }/a: string'])
      assertFailure(T, { a: 'low', b: 12 }, ['a must be set to "high"'])
      assertFailure(T, { a: 'high', b: 5 }, ['a must be set to "low"'])
    })
    it('should validate type with multiple independent validators', () => {
      const T = t.type({ a: t.string, b: t.number, c: t.number })
      T.validateWith((v, c) => {
        if (v.b < 10) {
          return v.a === 'low' ? t.success(undefined) : t.failure(v, c, 'a must be set to "low"')
        } else {
          return v.a === 'high' ? t.success(undefined) : t.failure(v, c, 'a must be set to "high"')
        }
      }).validateWith((v, c) => {
        return v.c < 20 ? t.success(undefined) : t.failure(v, c, 'c must be lower than 20')
      })
      assertFailure(T, { a: 'low', b: 12, c: 5 }, ['a must be set to "high"'])
      assertFailure(T, { a: 'high', b: 5, c: 5 }, ['a must be set to "low"'])
      assertFailure(T, { a: 'low', b: 12, c: 21 }, ['a must be set to "high"', 'c must be lower than 20'])
      assertFailure(T, { a: 'high', b: 5, c: 35 }, ['a must be set to "low"', 'c must be lower than 20'])
    })
  })
  describe('intersection', () => {
    it('should validate intersection', () => {
      const T1 = t.type({ a: t.string })
      const T2 = t.partial({ b: t.number })
      const T = t.intersection([T1, T2])
      T.validateWith((v, c) => {
        if (!v.b) {
          return t.success(undefined)
        }
        if (v.b < 10) {
          return v.a === 'low' ? t.success(undefined) : t.failure(v, c, 'a must be set to "low"')
        } else {
          return v.a === 'high' ? t.success(undefined) : t.failure(v, c, 'a must be set to "high"')
        }
      })
      assertSuccess(T.decode({ a: 'low', b: 5 }), { a: 'low', b: 5 })
      assertSuccess(T.decode({ a: 'high', b: 12 }), { a: 'high', b: 12 })
      assertSuccess(T.decode({ a: 'high' }), { a: 'high' })
      assertFailure(T, { b: 5 }, [
        'Invalid value undefined supplied to : ({ a: string } & Partial<{ b: number }>)/0: { a: string }/a: string'
      ])
      assertFailure(T, { a: 'low', b: 12 }, ['a must be set to "high"'])
      assertFailure(T, { a: 'high', b: 5 }, ['a must be set to "low"'])
    })
    it('should validate intersection with multiple validators', () => {
      const T1 = t.type({ a: t.string })
      const T2 = t.partial({ b: t.number })
      const T = t.intersection([T1, T2])
      T.validateWith((v, c) => {
        if (!v.b) {
          return t.success(undefined)
        }
        if (v.b < 10) {
          return v.a === 'low' ? t.success(undefined) : t.failure(v, c, 'a must be set to "low"')
        }
        return t.success(undefined)
      }).validateWith((v, c) => {
        if (!v.b) {
          return t.success(undefined)
        }
        if (v.b >= 10) {
          return v.a === 'high' ? t.success(undefined) : t.failure(v, c, 'a must be set to "high"')
        }
        return t.success(undefined)
      })
      assertSuccess(T.decode({ a: 'low', b: 5 }), { a: 'low', b: 5 })
      assertSuccess(T.decode({ a: 'high', b: 12 }), { a: 'high', b: 12 })
      assertSuccess(T.decode({ a: 'high' }), { a: 'high' })
      assertFailure(T, { b: 5 }, [
        'Invalid value undefined supplied to : ({ a: string } & Partial<{ b: number }>)/0: { a: string }/a: string'
      ])
      assertFailure(T, { a: 'low', b: 12 }, ['a must be set to "high"'])
      assertFailure(T, { a: 'high', b: 5 }, ['a must be set to "low"'])
    })
  })
})
