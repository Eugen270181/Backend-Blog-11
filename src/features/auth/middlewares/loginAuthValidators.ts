import {inputValidationMiddleware} from "../../../common/middleware/inputValidationMiddleware";
import {body} from "express-validator";

const loginOrEmailValidator = body('loginOrEmail').isString().withMessage('not string')

export const loginAuthValidators = [
    loginOrEmailValidator,

    inputValidationMiddleware,
]


