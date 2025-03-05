import {Response, Request, NextFunction} from 'express'
import {validationResult,ValidationError} from 'express-validator'
import {OutputErrorsType, errorsMessagesType} from '../types/outputErrors.type'

export const inputValidationMiddleware = (req: Request, res: Response<OutputErrorsType>, next: NextFunction) => {
    const errorFormatter = (error: ValidationError):errorsMessagesType => {
        return {message: error.msg, field: (error.type==='field'?error.path:'unknown')};
    }
    const result = validationResult(req).formatWith(errorFormatter)
    if (!result.isEmpty()) return res
        .status(400)
        .send({errorsMessages:result.array({onlyFirstError: true})})

    return next();
}