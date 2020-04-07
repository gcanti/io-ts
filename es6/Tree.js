/**
 * @since 2.2.0
 */
import { drawTree } from 'fp-ts/es6/Tree';
/**
 * @since 2.2.0
 */
export function draw(es) {
    return es.map(drawTree).join('\n');
}
