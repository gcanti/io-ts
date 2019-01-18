import { Reporter } from './Reporter'
import { Context, getFunctionName, ValidationError } from './index'

function stringify(v: any): string {
  return typeof v === 'function' ? getFunctionName(v) : JSON.stringify(v)
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
  report: validation => validation.fold(failure, success)
}
