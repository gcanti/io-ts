// TODO replace with fp-ts' Either once published

export abstract class HKT<F, A> {
  __hkt: F;
  __hkta: A;
}

export function identity<A>(a: A): A {
  return a
}

export abstract class Either<L, A> extends HKT<HKT<'Either', L>, A> {
  abstract map<B>(f: (a: A) => B): Either<L, B>
  abstract ap<B>(fab: Either<L, (a: A) => B>): Either<L, B>
  abstract chain<B>(f: (a: A) => Either<L, B>): Either<L, B>
  abstract fold<B>(l: (l: L) => B, r: (a: A) => B): B
}

export class Left<L, A> extends Either<L, A> {
  constructor(private value: L){ super() }
  map<B>(f: (a: A) => B): Either<L, B> {
    return this as any as Either<L, B>
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    return this as any as Either<L, B>
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return this as any as Either<L, B>
  }
  fold<B>(l: (l: L) => B, r: (a: A) => B): B {
    return l(this.value)
  }
}

export class Right<L, A> extends Either<L, A> {
  constructor(private value: A){ super() }
  map<B>(f: (a: A) => B): Either<L, B> {
    return new Right<L, B>(f(this.value))
  }
  ap<B>(fab: Either<L, (a: A) => B>): Either<L, B> {
    return fab.fold<Either<L, B>>(identity, f => this.map(f))
  }
  chain<B>(f: (a: A) => Either<L, B>): Either<L, B> {
    return f(this.value)
  }
  fold<B>(l: (l: L) => B, r: (a: A) => B): B {
    return r(this.value)
  }
}

export function of<L, A>(a: A): Either<L, A> {
  return new Right<L, A>(a)
}
