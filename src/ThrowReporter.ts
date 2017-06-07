import { Reporter } from './Reporter'
import { isLeft } from 'fp-ts/lib/Either'
import { PathReporter } from './PathReporter'

export const ThrowReporter: Reporter<void> = {
  report: validation => {
    if (isLeft(validation)) {
      throw PathReporter.report(validation).join('\n')
    }
  }
}
