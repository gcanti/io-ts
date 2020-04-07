/**
 * @since 2.2.0
 */
import { drawTree, Tree } from 'fp-ts/lib/Tree'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

/**
 * @since 2.2.0
 */
export function draw(es: NonEmptyArray<Tree<string>>): string {
  return es.map(drawTree).join('\n')
}
