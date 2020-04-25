/**
 * @since 2.2.0
 */
import { drawTree } from 'fp-ts/lib/Tree'
import { DecodeError } from './Decoder'

/**
 * @since 2.2.0
 */
export function draw(e: DecodeError): string {
  return e.map(drawTree).join('\n')
}
