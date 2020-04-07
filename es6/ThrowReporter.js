import { PathReporter } from './PathReporter';
import { isLeft } from 'fp-ts/es6/Either';
/**
 * @since 1.0.0
 * @deprecated
 */
export var ThrowReporter = {
    report: function (validation) {
        if (isLeft(validation)) {
            throw new Error(PathReporter.report(validation).join('\n'));
        }
    }
};
