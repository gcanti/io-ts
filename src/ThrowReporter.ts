/**
 * @deprecated
 */
import { Reporter } from './Reporter'
import { PathReporter } from './PathReporter'
import { fold } from '.'

/**
 * @since 1.0.0
 * @deprecated
 */
export const ThrowReporter: Reporter<void> = {
  report: validation =>
    fold(
      validation,
      () => {
        throw PathReporter.report(validation).join('\n')
      },
      () => {
        return
      }
    )
}
