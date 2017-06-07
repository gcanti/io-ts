import { Reporter } from './Reporter'
import { Context, getFunctionName, ValidationError } from './index'

function stringify(value: any): string {
  return typeof value === 'function' ? getFunctionName(value) : JSON.stringify(value)
}

function getContextPath(context: Context): string {
  return context.map(({ key, type }) => `${key}: ${type.name}`).join('/')
}

function getMessage(value: any, context: Context): string {
  return `Invalid value ${stringify(value)} supplied to ${getContextPath(context)}`
}

export function failure(es: Array<ValidationError>): Array<string> {
  return es.map(e => getMessage(e.value, e.context))
}

export function success(): Array<string> {
  return ['No errors!']
}

export const PathReporter: Reporter<Array<string>> = {
  report: validation => validation.fold(failure, success)
}
