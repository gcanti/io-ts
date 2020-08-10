/**
 * @deprecated
 * @since 1.0.0
 */
import { Reporter } from './Reporter'
import { PathReporter } from './PathReporter'
import { isLeft } from 'fp-ts/lib/Either'

/**
 * @category deprecated
 * @since 1.0.0
 * @deprecated
 */
export const ThrowReporter: Reporter<void> = {
  report: (validation) => {
    if (isLeft(validation)) {
      throw new Error(PathReporter.report(validation).join('\n'))
    }
  }
}
