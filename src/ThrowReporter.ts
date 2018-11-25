import { Reporter } from './Reporter'
import { PathReporter } from './PathReporter'

/**
 * @since 1.0.0
 */
export const ThrowReporter: Reporter<void> = {
  report: validation => {
    if (validation.isLeft()) {
      throw PathReporter.report(validation).join('\n')
    }
  }
}
