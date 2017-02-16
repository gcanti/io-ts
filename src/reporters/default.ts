import { Reporter } from './Reporter'
import { isLeft } from 'fp-ts/lib/Either'
import { Context, getFunctionName } from '../index'

function stringify(value: any): string {
  return typeof value === 'function' ? getFunctionName(value) : JSON.stringify(value)
}

function getContextPath(context: Context): string {
  return context.map(({ key, type }) => `${key}: ${type.name}`).join('/')
}

export const PathReporter: Reporter<Array<string>> = {
  report: validation => validation.fold(
    es => es.map(e => `Invalid value ${stringify(e.value)} supplied to ${getContextPath(e.context)}`),
    () => ['No errors!'],
  )
}

export const ThrowReporter: Reporter<void> = {
  report: validation => {
    if (isLeft(validation)) {
      throw PathReporter.report(validation).join('\n')
    }
  }
}
