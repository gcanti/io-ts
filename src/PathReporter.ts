/**
 * @since 1.0.0
 */
import { Reporter } from './Reporter'
import { Context, getFunctionName, ValidationError } from '.'
import { fold } from 'fp-ts/lib/Either'

function stringify(v: any): string {
  if (typeof v === 'function') {
    return getFunctionName(v)
  }
  if (typeof v === 'number' && !isFinite(v)) {
    if (isNaN(v)) {
      return 'NaN'
    }
    return v > 0 ? 'Infinity' : '-Infinity'
  }
  return JSON.stringify(v)
}

function getContextPath(context: Context): string {
  return context.map(({ key, type }) => `${key}: ${type.name}`).join('/')
}

function getMessage(e: ValidationError): string {
  return e.message !== undefined
    ? e.message
    : `Invalid value ${stringify(e.value)} supplied to ${getContextPath(e.context)}`
}

/**
 * @since 1.0.0
 */
export function failure(es: Array<ValidationError>): Array<string> {
  return es.map(getMessage)
}

/**
 * @since 1.0.0
 */
export function success(): Array<string> {
  return ['No errors!']
}

/**
 * @since 1.0.0
 */
export const PathReporter: Reporter<Array<string>> = {
  report: fold(failure, success)
}
