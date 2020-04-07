import { memoize } from './Schemable';
/**
 * @since 2.2.0
 */
export function make(f) {
    return memoize(f);
}
