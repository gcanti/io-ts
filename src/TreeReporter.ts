/**
 * @since 2.2.17
 */
import { flow } from 'fp-ts/lib/function'
import * as util from 'util'
import * as DE from './DecodeError'

// -------------------------------------------------------------------------------------
// Tree
// -------------------------------------------------------------------------------------

type Forest<A> = ReadonlyArray<Tree<A>>

interface Tree<A> {
  readonly value: A
  readonly forest: Forest<A>
}

const empty: ReadonlyArray<never> = []

const tree = <A>(value: A, forest: Forest<A> = empty): Tree<A> => ({
  value,
  forest
})

const drawTree = (tree: Tree<string>): string => tree.value + drawForest('\n', tree.forest)

const drawForest = (indentation: string, forest: ReadonlyArray<Tree<string>>): string => {
  let r = ''
  const len = forest.length
  let tree: Tree<string>
  for (let i = 0; i < len; i++) {
    tree = forest[i]
    const isLast = i === len - 1
    r += indentation + (isLast ? '└' : '├') + '─ ' + tree.value
    r += drawForest(indentation + (len > 1 && !isLast ? '│  ' : '   '), tree.forest)
  }
  return r
}

// -------------------------------------------------------------------------------------
// draw
// -------------------------------------------------------------------------------------

/**
 * @since 2.2.17
 */
export const toTreeWith = <E>(toTree: (e: E) => Tree<string>): ((de: DE.DecodeError<E>) => Tree<string>) => {
  const go = (de: DE.DecodeError<E>): Tree<string> => {
    switch (de._tag) {
      case 'MissingIndexesE':
        return tree(
          `${de.indexes.length} error(s) found while checking indexes`,
          de.indexes.map((index) => tree(`missing required index ${JSON.stringify(index)}`))
        )
      case 'MissingKeysE':
        return tree(
          `${de.keys.length} error(s) found while checking keys`,
          de.keys.map((key) => tree(`missing required key ${JSON.stringify(key)}`))
        )
      case 'UnexpectedIndexesE':
        return tree(
          `${de.indexes.length} error(s) found while checking indexes`,
          de.indexes.map((index) => tree(`unexpected index ${JSON.stringify(index)}`))
        )
      case 'UnexpectedKeysE':
        return tree(
          `${de.keys.length} error(s) found while checking keys`,
          de.keys.map((key) => tree(`unexpected key ${JSON.stringify(key)}`))
        )
      case 'RefinementE':
        return tree(`1 error(s) found while decoding a refinement`, [go(de.error)])
      case 'ParseE':
        return tree(`1 error(s) found while decoding a refinement`, [go(de.error)])
      case 'LeafE':
        return toTree(de.error)
      case 'NullableE':
        return tree(`1 error(s) found while decoding a nullable`, [go(de.error)])
      case 'PrevE':
      case 'NextE':
        return go(de.error)
      case 'RequiredIndexE':
        return tree(`1 error(s) found while decoding required component ${de.index}`, [go(de.error)])
      case 'OptionalIndexE':
        return tree(`1 error(s) found while decoding optional index ${de.index}`, [go(de.error)])
      case 'RequiredKeyE':
        return tree(`1 error(s) found while decoding required key ${JSON.stringify(de.key)}`, [go(de.error)])
      case 'OptionalKeyE':
        return tree(`1 error(s) found while decoding optional key ${JSON.stringify(de.key)}`, [go(de.error)])
      case 'MemberE':
        return tree(`1 error(s) found while decoding member ${JSON.stringify(de.member)}`, [go(de.error)])
      case 'LazyE':
        return tree(`1 error(s) found while decoding lazy decoder ${de.id}`, [go(de.error)])
      case 'SumE':
        return tree(`1 error(s) found while decoding a sum`, [go(de.error)])
      case 'CompoundE': {
        if (de.name === 'composition') {
          return de.errors.length === 1
            ? go(de.errors[0]) // less noise in the output if there's only one error
            : tree(`${de.errors.length} error(s) found while decoding (${de.name})`, de.errors.map(go))
        }
        return tree(`${de.errors.length} error(s) found while decoding (${de.name})`, de.errors.map(go))
      }
    }
  }
  return go
}

const format = (a: unknown): string => {
  if (typeof a === 'string') return JSON.stringify(a)
  return util.format(a)
}

/**
 * @since 2.2.17
 */
export const toTreeBuiltin = (de: DE.BuiltinE): Tree<string> => {
  switch (de._tag) {
    case 'StringE':
      return tree(`cannot decode ${format(de.actual)}, expected a string`)
    case 'NumberE':
      return tree(`cannot decode ${format(de.actual)}, expected a number`)
    case 'BooleanE':
      return tree(`cannot decode ${format(de.actual)}, expected a boolean`)
    case 'UnknownArrayE':
      return tree(`cannot decode ${format(de.actual)}, expected an array`)
    case 'UnknownRecordE':
      return tree(`cannot decode ${format(de.actual)}, expected an object`)
    case 'LiteralE':
      return tree(
        `cannot decode ${format(de.actual)}, expected one of ${de.literals
          .map((literal) => JSON.stringify(literal))
          .join(', ')}`
      )
    case 'MessageE':
      return tree(de.message)
    case 'NaNE':
      return tree('value is NaN')
    case 'InfinityE':
      return tree('value is Infinity')
    case 'TagE':
      return tree(
        `1 error(s) found while decoding sum tag ${JSON.stringify(
          de.tag
        )}, expected one of ${de.literals.map((literal) => JSON.stringify(literal)).join(', ')}`
      )
  }
}

/**
 * @since 2.2.17
 */
export const draw = flow(toTreeWith(toTreeBuiltin), drawTree)
