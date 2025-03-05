import {inputValidationMiddleware} from "../../../common/middleware/inputValidationMiddleware";
import {body} from "express-validator";

const emailPassRecoveryValidator = body('email').isString().withMessage('Email must be a string')
    .trim().isEmail().withMessage('Email must be a valid email address')

export const passwordRecoveryAuthValidators = [
    emailPassRecoveryValidator,

    inputValidationMiddleware,
]

