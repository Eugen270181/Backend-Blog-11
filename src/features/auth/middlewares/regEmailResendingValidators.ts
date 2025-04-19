import {inputValidationMiddleware} from "../../../common/middleware/inputValidationMiddleware";
import {body} from "express-validator";
import {usersRepository} from "../../../ioc";

const EmailConfirmationValidator = async (email: string) => {
    const user = await usersRepository.findUserByEmail(email);

    if (!user) throw new Error("Users account with this Email not found!")
    if (user.isConfirmed) throw new Error("Users account with this email already activated!")

    return true
}

export const emailRegResendingValidator = body('email').isString().withMessage('Email must be a string')
    .trim().isEmail().withMessage('Email must be a valid email address').custom(EmailConfirmationValidator)

export const regEmailResendingAuthValidators = [
    emailRegResendingValidator,

    inputValidationMiddleware,
]

