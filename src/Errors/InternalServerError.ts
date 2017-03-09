import { ValidationErrorItem } from 'joi'
import { HttpError } from './HttpError';


/**
 * Represents an error raised by an Internal Server Error. Will print out a reference to a CloudWatch error log.
 *
 * Will cause a 500 Internal Server Error to be sent to the client.
 */
export class InternalServerError extends HttpError {

    constructor(logReference:any) {
        super('InternalServerError', 500, [{
            message: 'Error log reference :\n' + JSON.stringify(logReference),
            type: 'Internal Server Error',
            path: ''
        }]);
    }


}
