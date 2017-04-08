import { Reporter } from './Reporter';
import { ValidationError } from '../index';
export declare function pathReporterFailure(es: Array<ValidationError>): Array<string>;
export declare const PathReporter: Reporter<Array<string>>;
export declare const ThrowReporter: Reporter<void>;
