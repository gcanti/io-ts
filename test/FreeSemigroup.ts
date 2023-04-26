import * as FS from '../src/FreeSemigroup'

describe.concurrent('FreeSemigroup', () => {
  it('fold', () => {
    const sum: (input: FS.FreeSemigroup<string>) => string = FS.fold(
      (value) => value,
      (left, right) => sum(left) + sum(right)
    )

    expect(sum(FS.of('1'))).toBe('1')
    expect(sum(FS.concat(FS.of('1'), FS.of('2')))).toBe('12')
  })
})
