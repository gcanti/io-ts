import * as C from 'fp-ts/Const'
import { pipe } from 'fp-ts/function'
import * as R from 'fp-ts/ReadonlyRecord'
import { make, Schema } from '../src/Schema'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export type Model =
  | { readonly _tag: 'string' }
  | { readonly _tag: 'number' }
  | { readonly _tag: 'type'; readonly props: Record<string, Model> }

export interface DSL<A> {
  readonly dsl: () => C.Const<Model, A>
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

export const string: DSL<string> = {
  dsl: () => C.make({ _tag: 'string' })
}

export const number: DSL<number> = {
  dsl: () => C.make({ _tag: 'number' })
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

export function type<A>(properties: { [K in keyof A]: DSL<A[K]> }): DSL<A> {
  return {
    dsl: () =>
      C.make({
        _tag: 'type',
        props: pipe(
          properties,
          R.map<DSL<unknown>, Model>((p) => p.dsl())
        )
      })
  }
}

export function toSchema<A>(dsl: DSL<A>): Schema<A> {
  const go = (model: Model): Schema<any> => {
    switch (model._tag) {
      case 'string':
        return make((S) => S.string)
      case 'number':
        return make((S) => S.number)
      case 'type':
        return make((S) =>
          S.type(
            pipe(
              model.props,
              R.map((model) => go(model)(S))
            )
          )
        )
    }
  }
  return go(dsl.dsl())
}
