/**
 * @deprecated
 * @since 1.0.0
 */
import { isLeft } from 'fp-ts/lib/Either'

import { PathReporter } from './PathReporter'
import { Reporter } from './Reporter'

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
